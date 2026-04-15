// Minimal DOM stubs for Svelte 5 template rendering in QuickJS

// console — QuickJS may not have it; libraries and user code expect it
if (typeof console === 'undefined') {
    globalThis.console = {
        log(...a) { if (typeof __host !== 'undefined' && __host.op_log) __host.op_log('[LOG] ' + a.map(String).join(' ')); },
        error(...a) { if (typeof __host !== 'undefined' && __host.op_log) __host.op_log('[ERROR] ' + a.map(String).join(' ')); },
        warn(...a) { if (typeof __host !== 'undefined' && __host.op_log) __host.op_log('[WARN] ' + a.map(String).join(' ')); },
        info() {},
        debug() {},
        trace() {},
        dir() {},
        table() {},
        group() {},
        groupEnd() {},
        time() {},
        timeEnd() {},
        assert() {},
    };
}

let __rvst_handler_next_id = 1;
const __rvst_handlers = new Map();
const __rvst_elements = new Map();

// Legacy compatibility shim — some bundles reference Deno.core.ops.op_*;
// redirect those calls to the QuickJS __host object.
if (typeof Deno === 'undefined') {
  globalThis.Deno = { core: { ops: {} } };
}
// Proxy so any Deno.core.ops.op_xxx(...) call forwards to __host.op_xxx(...)
Deno.core.ops = new Proxy(Deno.core.ops, {
  get(_target, prop) {
    if (typeof __host[prop] === 'function') {
      return (...args) => __host[prop](...args);
    }
    return undefined;
  }
});
let __rvst_next_id = 100;

// ── Template pre-allocation cache ──────────────────────────────────────
// Svelte's from_html already caches the parsed template node (parses once, clones many).
// The bottleneck is cloneNode(true): each clone emits N individual op_create_node +
// op_set_text + op_set_attr host calls across the JS→Rust boundary.
// This cache serializes the template structure on first clone and uses a single
// op_clone_template batch call on subsequent clones, reducing N host calls to 1.

const __rvst_template_cache = new Map(); // html_string -> { hash, descriptor_json, node_count }

// When true, op_create_node/op_set_text/op_set_attr/op_set_style are suppressed.
// Used during batch template clone: JS stubs are built but Rust ops are batched.
let __rvst_suppress_ops = false;

function __rvst_hash_string(s) {
    // FNV-1a 32-bit hash — fast, good distribution for template strings
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0; // unsigned
}

// Serialize a stub node tree into a descriptor array for op_clone_template.
function __rvst_serialize_template(node) {
    const desc = { t: node.__rvst_tag };
    if (node._data !== undefined && node._data !== null && node._data !== '') {
        desc.x = String(node._data);
    }
    if (node._attrs) {
        const attrs = [];
        for (const [k, v] of Object.entries(node._attrs)) {
            if (v !== undefined && v !== null && String(v).length > 0) {
                attrs.push([k, String(v)]);
            }
        }
        if (attrs.length > 0) desc.a = attrs;
    }
    if (node.childNodes && node.childNodes.length > 0) {
        desc.c = node.childNodes.map(__rvst_serialize_template);
    }
    return desc;
}

// Count total nodes in a subtree.
function __rvst_count_nodes(node) {
    let count = 1;
    if (node.childNodes) {
        for (const c of node.childNodes) count += __rvst_count_nodes(c);
    }
    return count;
}

// CSS cascade engine — captures Svelte-injected <style> rules and applies
// CSS engine — applies class-based styles (Svelte scoped + Tailwind utility) to nodes.
// Svelte's <style> blocks inject a <style> tag; Tailwind outputs a .css file alongside
// the .js bundle. In both cases the CSS text is passed to __rvst_parse_css().
const __rvst_css_rules = []; // [{ selectors: string[], props: {prop:val} }]
// Seed Tailwind @property vars that have known initial-values but are set via @property
// (not :root), so __rvst_flatten_css never sees them.
// --tw-border-style: initial-value solid (from @property)
// --tw-font-weight: initial-value "initial" (from @property) — empty string so var(--tw-font-weight,X) falls back to X
// --tw-leading: no initial-value defined — leave undefined so var(--tw-leading,fallback) uses fallback
const __rvst_css_vars  = {
    '--tw-border-style': 'solid',
};
// All CSS properties we forward to the Rust node.styles map.
// Layout props (Taffy) + paint props (Vello) — both renderers read from node.styles.
const __CSS_LAYOUT_PROPS = new Set([
    // Layout — Taffy
    'display','flex-direction','flex-wrap','flex-flow','justify-content',
    'align-items','align-content','align-self','flex','flex-grow','flex-shrink',
    'flex-basis','order','width','height','min-width','min-height','max-width',
    'max-height','padding','padding-top','padding-right','padding-bottom',
    'padding-left','margin','margin-top','margin-right','margin-bottom',
    'margin-left','gap','row-gap','column-gap','grid-template-columns',
    'grid-template-rows','grid-column','grid-row','position','top','right',
    'bottom','left','overflow','overflow-x','overflow-y','box-sizing',
    'aspect-ratio',
    // Tailwind logical-property shorthands (expanded to individual sides during parse)
    'padding-inline','padding-block','margin-inline','margin-block',
    // Paint — Vello composite.rs
    'background','background-color','color','opacity',
    'border','border-top','border-right','border-bottom','border-left',
    'border-color','border-width','border-style',
    'border-right-width','border-bottom-width','border-left-width','border-top-width',
    'border-right-style','border-bottom-style','border-left-style','border-top-style',
    'border-right-color','border-bottom-color','border-left-color','border-top-color',
    'border-radius','border-top-left-radius','border-top-right-radius',
    'border-bottom-left-radius','border-bottom-right-radius',
    // Typography — text rendering
    'font-family','font-size','font-weight','font-style',
    'line-height','letter-spacing','text-align','text-decoration',
    'text-transform','white-space',
    // Visual transform
    'transform',
    // Interaction
    'cursor','pointer-events','visibility',
]);

// ── at-rule flattener ──────────────────────────────────────────────────────────
// Strips @layer wrappers (extracting their inner content) and skips @media,
// @supports, @keyframes, @font-face, @property, @import, @charset entirely.
// Tailwind v4 wraps all utility classes inside @layer utilities { ... }.
function __rvst_flatten_css(css) {
    let out = '';
    let i = 0;
    while (i < css.length) {
        if (css[i] !== '@') {
            const next = css.indexOf('@', i);
            if (next === -1) { out += css.slice(i); break; }
            out += css.slice(i, next);
            i = next;
            continue;
        }
        // Read at-rule name
        let j = i + 1;
        while (j < css.length && /[a-zA-Z-]/.test(css[j])) j++;
        const name = css.slice(i + 1, j).toLowerCase();
        // Find ';' or '{', whichever comes first
        let semi = -1, bracePos = -1;
        for (let k = j; k < css.length; k++) {
            if (css[k] === ';' && semi === -1) { semi = k; break; }
            if (css[k] === '{') { bracePos = k; break; }
        }
        if (semi !== -1 && (bracePos === -1 || semi < bracePos)) {
            // Simple at-rule: @import, @charset — skip to semicolon
            i = semi + 1;
            continue;
        }
        if (bracePos === -1) { break; }
        // Block at-rule — find matching closing brace (counting nested depth)
        let depth = 1, k = bracePos + 1;
        while (k < css.length && depth > 0) {
            if (css[k] === '{') depth++;
            else if (css[k] === '}') depth--;
            k++;
        }
        const inner = css.slice(bracePos + 1, k - 1);
        if (name === 'layer') {
            // Recursively flatten nested @layer (Tailwind nests @layer inside @supports)
            out += __rvst_flatten_css(inner);
        }
        // @media, @supports, @keyframes, @font-face, @property — skip entirely
        i = k;
    }
    return out;
}

// ── CSS variable resolution ────────────────────────────────────────────────────
// Tailwind v4 defines all design tokens as CSS custom properties in :root:
//   :root { --color-zinc-900: oklch(...); --spacing: .25rem; }
// Utility classes then reference them: .bg-zinc-900 { background-color: var(--color-zinc-900) }
// We store variables and resolve var() before passing values to Rust.
function __rvst_resolve_var(val, depth) {
    if (!val || depth > 8) return val;
    // Iterative: find each var(...) from left to right, handling nested parens.
    let out = '';
    let i = 0;
    while (i < val.length) {
        const vi = val.indexOf('var(', i);
        if (vi === -1) { out += val.slice(i); break; }
        out += val.slice(i, vi);
        // Find matching closing ')' counting nested parens
        let depth_p = 1, k = vi + 4;
        while (k < val.length && depth_p > 0) {
            if (val[k] === '(') depth_p++;
            else if (val[k] === ')') depth_p--;
            k++;
        }
        const inner = val.slice(vi + 4, k - 1); // content between outer var( and )
        // Split inner on first comma not inside parens to get name + fallback
        let comma = -1, dp = 0;
        for (let j = 0; j < inner.length; j++) {
            if (inner[j] === '(') dp++;
            else if (inner[j] === ')') dp--;
            else if (inner[j] === ',' && dp === 0) { comma = j; break; }
        }
        const vname = (comma === -1 ? inner : inner.slice(0, comma)).trim();
        const fallback = comma === -1 ? undefined : inner.slice(comma + 1).trim();
        const resolved = __rvst_css_vars[vname];
        if (resolved !== undefined) {
            out += __rvst_resolve_var(resolved, depth + 1);
        } else if (fallback !== undefined) {
            out += __rvst_resolve_var(fallback, depth + 1);
        } else {
            out += val.slice(vi, k); // unresolvable — leave as-is
        }
        i = k;
    }
    return out;
}

// ── main CSS parser ────────────────────────────────────────────────────────────
// DEPRECATED: lightningcss handles CSS. This remains for JS-side var() in inline styles only.
function __rvst_parse_css(css_text) {
    // Strip comments then flatten @layer / at-rule wrappers
    css_text = css_text.replace(/\/\*[\s\S]*?\*\//g, '');
    css_text = __rvst_flatten_css(css_text);
    // Parse rules: split on '}' (safe after flattening — no more nested blocks)
    const blocks = css_text.split('}');
    for (const block of blocks) {
        const brace = block.indexOf('{');
        if (brace === -1) continue;
        const sel_part = block.slice(0, brace).trim();
        const decl_part = block.slice(brace + 1).trim();
        if (!sel_part || !decl_part) continue;
        // ── :root / :host — collect CSS variables ──────────────────────────
        const is_root = sel_part.split(',').some(s => {
            const t = s.trim();
            return t === ':root' || t === ':host' || t === '*' || t === ':root,:host';
        });
        if (is_root) {
            for (const decl of decl_part.split(';')) {
                const colon = decl.indexOf(':');
                if (colon === -1) continue;
                const prop = decl.slice(0, colon).trim();
                const val  = decl.slice(colon + 1).trim();
                if (prop.startsWith('--') && val) __rvst_css_vars[prop] = val;
            }
            // Also continue to extract any regular properties from :root if present
        }
        // ── regular rules — collect style props ────────────────────────────
        const props = {};
        for (const decl of decl_part.split(';')) {
            const colon = decl.indexOf(':');
            if (colon === -1) continue;
            const prop = decl.slice(0, colon).trim().toLowerCase();
            if (!prop || prop.startsWith('--')) continue; // skip custom props
            // Resolve var() references in the value
            const raw_val = decl.slice(colon + 1).trim();
            const val = __rvst_resolve_var(raw_val, 0);
            if (!val) continue;
            // Expand logical shorthand props to physical props
            if (prop === 'padding-inline') {
                props['padding-left'] = val; props['padding-right'] = val;
            } else if (prop === 'padding-block') {
                props['padding-top'] = val; props['padding-bottom'] = val;
            } else if (prop === 'margin-inline') {
                props['margin-left'] = val; props['margin-right'] = val;
            } else if (prop === 'margin-block') {
                props['margin-top'] = val; props['margin-bottom'] = val;
            } else if (__CSS_LAYOUT_PROPS.has(prop)) {
                props[prop] = val;
            }
        }
        if (Object.keys(props).length === 0) continue;
        // Comma-separated selectors; strip Svelte scoping hashes (.svelte-XXXX and :where(.svelte-XXXX))
        const selectors = sel_part.split(',')
            .map(s => s.trim()
                .replace(/:where\(\.svelte-[a-z0-9]+\)/gi, '')
                .replace(/\.svelte-[a-z0-9]+/gi, '')
                .trim())
            .filter(s => s && !s.startsWith(':') && !s.startsWith('*') && !s.startsWith('@'));
        if (selectors.length > 0) __rvst_css_rules.push({ selectors, props });
    }
    // Re-apply to all elements already in the tree
    for (const [, el] of __rvst_elements) {
        if (el.__rvst_tag && el.__rvst_tag[0] !== '#' && el.__rvst_in_tree) {
            __rvst_apply_css(el);
        }
    }
}
function __rvst_css_sel_matches(node, sel) {
    if (!sel || sel === '*') return true;
    const tag = node.__rvst_tag ?? '';
    const cls = (node._attrs?.['class'] ?? '').split(/\s+/).filter(Boolean);
    const id_val = node._attrs?.['id'] ?? '';
    // Only handle simple non-descendant selectors; skip combinators (space, ~, +, >)
    if (/[ ~+>]/.test(sel)) return false;
    let p = 0, n = sel.length, tag_req = null, id_req = null;
    const cls_req = [];
    while (p < n) {
        const ch = sel[p];
        if (ch === '.') {
            let e = p + 1;
            while (e < n && /[a-zA-Z0-9_-]/.test(sel[e])) e++;
            cls_req.push(sel.slice(p + 1, e)); p = e;
        } else if (ch === '#') {
            let e = p + 1;
            while (e < n && /[a-zA-Z0-9_-]/.test(sel[e])) e++;
            id_req = sel.slice(p + 1, e); p = e;
        } else if (ch === ':' || ch === '[') {
            // Skip pseudo-classes and attribute selectors
            const close = ch === '[' ? ']' : null;
            let e = p + 1;
            if (close) { e = sel.indexOf(close, p); p = e === -1 ? n : e + 1; }
            else { while (e < n && !/[ .#:{[]/.test(sel[e])) e++; p = e; }
        } else if (/[a-zA-Z*]/.test(ch)) {
            let e = p;
            while (e < n && /[a-zA-Z0-9-]/.test(sel[e])) e++;
            const t = sel.slice(p, e);
            if (t !== '*') tag_req = t.toLowerCase();
            p = e;
        } else { return false; }
    }
    if (tag_req && tag_req !== tag) return false;
    if (id_req && id_req !== id_val) return false;
    for (const c of cls_req) { if (!cls.includes(c)) return false; }
    return true;
}
function __rvst_apply_css(node) { /* handled by Rust lightningcss engine */ }

// Node/Element prototype hierarchy — Svelte 5 uses these at mount time:
//   1. Qr() extracts firstChild/nextSibling getters via Object.getOwnPropertyDescriptor(Node.prototype, ...)
//      to use as fast traversal functions ($t.call(el), Bt.call(el))
//   2. cr() (set_attributes) walks Object.getPrototypeOf(el) until it reaches Element.prototype,
//      collecting setter names to decide property-set vs setAttribute
// Solution: define node/element prototypes with the required getters, and make all
// element stubs inherit from __rvst_element_proto so cr()'s walk terminates there.
const __rvst_node_proto = {
    get firstChild() { return this.childNodes?.[0] ?? null; },
    set firstChild(_v) { /* no-op: getter always reads from childNodes */ },
    get nextSibling() {
        if (this == null || !this.__parent) return null;
        const siblings = this.__parent.childNodes;
        if (!siblings) return null;
        const idx = siblings.indexOf(this);
        return (idx >= 0 && idx + 1 < siblings.length) ? siblings[idx + 1] : null;
    },
    set nextSibling(_v) { /* no-op: getter always computes from parent.childNodes */ },
};
const __rvst_element_proto = Object.create(__rvst_node_proto);

// Pointer capture — route all pointer events to the captured element during drag.
__rvst_element_proto.setPointerCapture = function(pointerId) {
    __host.op_set_pointer_capture(this.__rvst_id + ":" + pointerId);
    this.__pointer_captured = pointerId;
};
__rvst_element_proto.releasePointerCapture = function(pointerId) {
    __host.op_release_pointer_capture(this.__rvst_id + ":" + pointerId);
    delete this.__pointer_captured;
};
__rvst_element_proto.hasPointerCapture = function(pointerId) {
    return this.__pointer_captured === pointerId;
};

globalThis.Node = { prototype: __rvst_node_proto };
globalThis.Element = { prototype: __rvst_element_proto };
globalThis.HTMLElement = { prototype: __rvst_element_proto };
globalThis.SVGElement = { prototype: __rvst_element_proto };
// Text.prototype needs __t (set by Qr's nt(r) && r.__t = void 0)
globalThis.Text = { prototype: __rvst_node_proto };

// Svelte 5's cr() (set_attributes helper) walks the prototype chain via
//   for (i = el, s = Element.prototype; s !== i; ) { getOwnPropertyDescriptors(i); i = getPrototypeOf(i); }
// With __rvst_element_proto in the stub prototype chain the loop exits after one step.
// Defense-in-depth: guard getOwnPropertyDescriptors against null/undefined inputs.
// Note: do NOT patch getPrototypeOf(null) to return null — that causes an infinite loop.
const __rvst_orig_gopd = Object.getOwnPropertyDescriptors;
Object.getOwnPropertyDescriptors = function(obj) {
    if (obj == null) return {};
    return __rvst_orig_gopd(obj);
};
// ── MutationObserver notification helper ───────────────────────────────────
// Walk up __parent chain to find observers with subtree:true that cover this node.
function __rvst_notify_mutation(target, type, opts) {
    // Direct observers on the target
    if (target.__rvst_mutation_observers) {
        for (const obs of target.__rvst_mutation_observers) {
            obs._notify(type, target, opts);
        }
    }
    // Ancestor observers with subtree: true
    let ancestor = target.__parent;
    while (ancestor) {
        if (ancestor.__rvst_mutation_observers) {
            for (const obs of ancestor.__rvst_mutation_observers) {
                obs._notify(type, target, opts);
            }
        }
        ancestor = ancestor.__parent;
    }
}

// Recursively emit op_insert for a node and all its JS children that have
// not yet been inserted into the Rust tree. Template-cloned nodes are created
// via childNodes arrays without going through appendChild/insertBefore, so
// they never get op_insert emitted for them individually. This helper fills
// that gap when Svelte finally inserts the root of the cloned subtree.
function __rvst_insert_subtree(parent_node, node) {
    if (!node || !node.__rvst_id) return;
    if (node.__rvst_in_tree) return; // already inserted, skip
    node.__rvst_in_tree = true;
    const parent_id = typeof parent_node === 'number' ? parent_node : parent_node.__rvst_id ?? 0;
    if (!node.__parent && parent_node && typeof parent_node !== 'number') {
        node.__parent = parent_node;
    }
    __host.op_insert(parent_id, node.__rvst_id, 0);
    // Apply CSS rules now that the node is in the tree.
    // For Tailwind: rules are already loaded (CSS prepended before mount),
    // so this is where class-based styles first reach template-cloned nodes
    // that had no CSS applied during cloneNode (when rules weren't loaded yet).
    if (node.__rvst_tag && node.__rvst_tag[0] !== '#') __rvst_apply_css(node);
    if (node.childNodes) {
        for (const child of node.childNodes) {
            __rvst_insert_subtree(node, child);
        }
    }
}

// querySelector / querySelectorAll — DFS walk with minimal CSS selector support.
// Supports: tag, [attr], [attr=val], :checked (→ [selected]), :not([attr]),
// compound selectors like "option:not([disabled])". Covers all Svelte 5 select/form patterns.
function __rvst_sel_matches(node, raw) {
    if (!node || node.nodeType !== 1) return false;
    let sel = raw.trim();
    if (!sel || sel === '*') return true;
    // :not() pseudo — handle before other parsing
    const notM = sel.match(/^([a-zA-Z0-9-]*)?:not\(([^)]+)\)(.*)/);
    if (notM) {
        const base = notM[1] || null;
        const inner = notM[2].trim();
        const rest = notM[3].trim();
        if (base && node.__rvst_tag !== base.toLowerCase()) return false;
        if (__rvst_sel_matches(node, inner)) return false;
        return rest === '' || __rvst_sel_matches(node, rest);
    }
    // :checked → [selected]
    sel = sel.replace(/:checked/g, '[selected]').replace(/:disabled/g, '[disabled]');
    // Extract optional tag prefix
    const tagM = sel.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    if (tagM) {
        if (node.__rvst_tag !== tagM[1].toLowerCase()) return false;
        sel = sel.slice(tagM[1].length).trim();
    }
    // Consume [attr] / [attr=val] / [attr="val"] parts
    const attrRe = /^\[([^\]=\s]+)(?:[~|^$*]?=["']?([^"'\]]+)["']?)?\]/;
    let m;
    while ((m = sel.match(attrRe))) {
        const key = m[1].trim();
        const val = m[2];
        const attrs = node._attrs ?? {};
        if (val === undefined) {
            if (!(key in attrs)) return false;
        } else {
            if ((attrs[key] ?? '') !== val) return false;
        }
        sel = sel.slice(m[0].length).trim();
    }
    return sel === '';
}
function __rvst_query_all(root, sel, out, single) {
    for (const child of root.childNodes ?? []) {
        if (__rvst_sel_matches(child, sel)) {
            out.push(child);
            if (single) return true;
        }
        if (__rvst_query_all(child, sel, out, single) && single) return true;
    }
    return false;
}

// ── Canvas 2D rendering context stub ──────────────────────────────────────────
// Records draw commands into a buffer. Libraries like Chart.js, D3 canvas mode,
// and Monaco minimap call getContext('2d') and draw via the standard API.
// For now we only provide the JS surface so apps don't crash; actual rendering
// into the Vello scene will come later.
class __RvstCanvas2D {
    constructor(canvas) {
        this._canvas = canvas;
        this._cmds = [];
        this._stateStack = [];
        // Current state
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
        this.font = '10px sans-serif';
        this.textAlign = 'start';
        this.textBaseline = 'alphabetic';
        this.globalAlpha = 1;
        this.lineCap = 'butt';
        this.lineJoin = 'miter';
        this.miterLimit = 10;
        this.lineDashOffset = 0;
        this.shadowBlur = 0;
        this.shadowColor = 'rgba(0, 0, 0, 0)';
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.globalCompositeOperation = 'source-over';
        this.imageSmoothingEnabled = true;
        this._lineDash = [];
    }

    // Drawing
    fillRect(x, y, w, h) { this._cmds.push(['fr', x, y, w, h, this.fillStyle, this.globalAlpha]); }
    strokeRect(x, y, w, h) { this._cmds.push(['sr', x, y, w, h, this.strokeStyle, this.lineWidth, this.globalAlpha]); }
    clearRect(x, y, w, h) { this._cmds.push(['cr', x, y, w, h]); }

    // Text
    fillText(text, x, y) { this._cmds.push(['ft', text, x, y, this.fillStyle, this.font, this.textAlign, this.globalAlpha]); }
    strokeText(text, x, y) { this._cmds.push(['st', text, x, y, this.strokeStyle, this.font, this.lineWidth]); }
    measureText(text) {
        const size = parseFloat(this.font) || 10;
        return {
            width: text.length * size * 0.6,
            actualBoundingBoxAscent: size * 0.8,
            actualBoundingBoxDescent: size * 0.2,
            fontBoundingBoxAscent: size * 0.8,
            fontBoundingBoxDescent: size * 0.2,
            emHeightAscent: size * 0.8,
            emHeightDescent: size * 0.2,
        };
    }

    // Paths
    beginPath() { this._cmds.push(['bp']); }
    closePath() { this._cmds.push(['cp']); }
    moveTo(x, y) { this._cmds.push(['mt', x, y]); }
    lineTo(x, y) { this._cmds.push(['lt', x, y]); }
    arc(x, y, r, sa, ea, ccw) { this._cmds.push(['ar', x, y, r, sa, ea, !!ccw]); }
    arcTo(x1, y1, x2, y2, r) { this._cmds.push(['at', x1, y1, x2, y2, r]); }
    quadraticCurveTo(cpx, cpy, x, y) { this._cmds.push(['qc', cpx, cpy, x, y]); }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this._cmds.push(['bc', cp1x, cp1y, cp2x, cp2y, x, y]); }
    rect(x, y, w, h) { this._cmds.push(['re', x, y, w, h]); }
    ellipse(x, y, rx, ry, rot, sa, ea, ccw) { this._cmds.push(['el', x, y, rx, ry, rot, sa, ea, !!ccw]); }
    fill(ruleOrPath) { this._cmds.push(['fi', this.fillStyle, this.globalAlpha]); }
    stroke(path) { this._cmds.push(['sk', this.strokeStyle, this.lineWidth, this.globalAlpha]); }
    clip(ruleOrPath) { this._cmds.push(['cl']); }
    isPointInPath() { return false; }
    isPointInStroke() { return false; }

    // State
    save() {
        this._stateStack.push({
            fillStyle: this.fillStyle, strokeStyle: this.strokeStyle,
            lineWidth: this.lineWidth, font: this.font, textAlign: this.textAlign,
            textBaseline: this.textBaseline, globalAlpha: this.globalAlpha,
            lineCap: this.lineCap, lineJoin: this.lineJoin, miterLimit: this.miterLimit,
            lineDashOffset: this.lineDashOffset, shadowBlur: this.shadowBlur,
            shadowColor: this.shadowColor, shadowOffsetX: this.shadowOffsetX,
            shadowOffsetY: this.shadowOffsetY, globalCompositeOperation: this.globalCompositeOperation,
            imageSmoothingEnabled: this.imageSmoothingEnabled, _lineDash: [...this._lineDash],
        });
        this._cmds.push(['sv']);
    }
    restore() {
        const s = this._stateStack.pop();
        if (s) {
            this.fillStyle = s.fillStyle; this.strokeStyle = s.strokeStyle;
            this.lineWidth = s.lineWidth; this.font = s.font; this.textAlign = s.textAlign;
            this.textBaseline = s.textBaseline; this.globalAlpha = s.globalAlpha;
            this.lineCap = s.lineCap; this.lineJoin = s.lineJoin; this.miterLimit = s.miterLimit;
            this.lineDashOffset = s.lineDashOffset; this.shadowBlur = s.shadowBlur;
            this.shadowColor = s.shadowColor; this.shadowOffsetX = s.shadowOffsetX;
            this.shadowOffsetY = s.shadowOffsetY; this.globalCompositeOperation = s.globalCompositeOperation;
            this.imageSmoothingEnabled = s.imageSmoothingEnabled; this._lineDash = s._lineDash;
        }
        this._cmds.push(['rs']);
    }

    // Transforms
    translate(x, y) { this._cmds.push(['tr', x, y]); }
    scale(x, y) { this._cmds.push(['sc', x, y]); }
    rotate(a) { this._cmds.push(['ro', a]); }
    transform(a, b, c, d, e, f) { this._cmds.push(['tm', a, b, c, d, e, f]); }
    setTransform(a, b, c, d, e, f) {
        if (typeof a === 'object' && a !== null) {
            // DOMMatrix-like object
            this._cmds.push(['tf', a.a ?? 1, a.b ?? 0, a.c ?? 0, a.d ?? 1, a.e ?? 0, a.f ?? 0]);
        } else {
            this._cmds.push(['tf', a, b, c, d, e, f]);
        }
    }
    getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, is2D: true, isIdentity: true }; }
    resetTransform() { this._cmds.push(['tf', 1, 0, 0, 1, 0, 0]); }

    // Line dash
    setLineDash(segments) { this._lineDash = Array.isArray(segments) ? [...segments] : []; }
    getLineDash() { return [...this._lineDash]; }

    // Images / patterns / gradients (stubs)
    drawImage() { /* not yet implemented */ }
    createLinearGradient(x0, y0, x1, y1) {
        return { addColorStop() {} };
    }
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        return { addColorStop() {} };
    }
    createConicGradient(startAngle, x, y) {
        return { addColorStop() {} };
    }
    createPattern() { return null; }
    getImageData(sx, sy, sw, sh) {
        return { data: new Uint8ClampedArray(sw * sh * 4), width: sw, height: sh };
    }
    putImageData() {}
    createImageData(sw, sh) {
        if (typeof sw === 'object') { sh = sw.height; sw = sw.width; }
        return { data: new Uint8ClampedArray(sw * sh * 4), width: sw, height: sh };
    }

    // Canvas property
    get canvas() { return this._canvas; }
}

function __rvst_make_el(tag) {
    const id = __rvst_next_id++;
    const el = {
        __rvst_id: id,
        __rvst_tag: tag,
        childNodes: [],
        // NOTE: do NOT set firstChild/nextSibling as own properties here —
        // they must come from the prototype getter so Svelte's extracted
        // Node.prototype descriptors and direct property access both work.
        tagName: tag.toUpperCase(),
        disabled: false,
        style: (() => {
            const _styles = {};
            const _toCss = p => p.replace(/([A-Z])/g, c => '-' + c.toLowerCase());
            const proxy = new Proxy(_styles, {
                set(_t, prop, value) {
                    if (prop === 'cssText') {
                        // Parse "flex-direction: row; gap: 8px" into individual ops
                        String(value).split(';').forEach(chunk => {
                            const colon = chunk.indexOf(':');
                            if (colon === -1) return;
                            const k = chunk.slice(0, colon).trim();
                            const v = chunk.slice(colon + 1).trim();
                            if (k) { _styles[k] = v; if (!__rvst_suppress_ops) __host.op_set_style(id, k, v); }
                        });
                    } else {
                        const key = _toCss(prop);
                        _styles[key] = String(value);
                        if (!__rvst_suppress_ops) __host.op_set_style(id, key, String(value));
                    }
                    return true;
                },
                get(_t, prop) {
                    // __raw: internal access for hidden/display sync — callers must
                    // also emit op_set_style when mutating directly (bypasses proxy setter).
                    if (prop === '__raw') return _styles;
                    if (prop === 'setProperty') return (k, v) => {
                        _styles[k] = String(v ?? '');
                        if (!__rvst_suppress_ops) __host.op_set_style(id, String(k), String(v ?? ''));
                    };
                    if (prop === 'removeProperty') return (k) => {
                        delete _styles[k];
                        if (!__rvst_suppress_ops) __host.op_set_style(id, String(k), '');
                    };
                    if (prop === 'cssText') return Object.entries(_styles).map(([k,v])=>k+':'+v).join(';');
                    return _styles[_toCss(String(prop))] ?? '';
                }
            });
            return proxy;
        })(),
        content: null,
        nodeName: tag.toUpperCase(),
        nodeType: tag === '#text' ? 3 : tag === '#comment' ? 8 : tag === '#document-fragment' ? 11 : 1,
        get nodeValue() { return this._data ?? null; },
        get textContent() {
            // Text/comment: return raw data; Element: concatenate all descendant text nodes.
            if (this.__rvst_tag === '#text' || this.__rvst_tag === '#comment') return this._data ?? '';
            function collectText(node) {
                if (!node) return '';
                if (node.__rvst_tag === '#text') return node._data ?? '';
                return (node.childNodes ?? []).map(collectText).join('');
            }
            return collectText(this);
        },
        set textContent(v) {
            const sv = String(v);
            // <style> elements: feed CSS to the RVST CSS engine.
            // Libraries like CodeMirror set style.textContent AFTER appendChild.
            if (this.__rvst_tag === 'style' && sv) {
                __rvst_parse_css(sv);
            }
            if (this.__rvst_tag !== '#text' && this.__rvst_tag !== '#comment') {
                // Element node: remove all children, optionally insert a text child
                for (const child of this.childNodes) {
                    child.__rvst_in_tree = false;
                    __host.op_remove(child.__rvst_id);
                }
                this.childNodes = [];
                this.firstChild = null;
                if (sv !== '') {
                    const t = __rvst_make_el('#text');
                    t._data = sv; t.__parent = this; t.__rvst_in_tree = true;
                    this.childNodes = [t]; this.firstChild = t;
                    __host.op_set_text(t.__rvst_id, sv);
                    __host.op_insert(this.__rvst_id, t.__rvst_id, 0);
                }
            } else {
                this._data = sv;
                __host.op_set_text(this.__rvst_id, sv);
            }
        },
        get value() { return this._attrs?.['value'] ?? ''; },
        set value(v) {
            if (!this._attrs) this._attrs = {};
            this._attrs['value'] = String(v);
            __host.op_set_attr(this.__rvst_id, 'value', String(v));
            // Keep cursor at end when value is set programmatically
            this._selectionStart = String(v).length;
            this._selectionEnd = String(v).length;
        },
        _selectionStart: 0,
        _selectionEnd: 0,
        get selectionStart() { return this._selectionStart ?? 0; },
        set selectionStart(v) { this._selectionStart = Number(v) || 0; },
        get selectionEnd() { return this._selectionEnd ?? 0; },
        set selectionEnd(v) { this._selectionEnd = Number(v) || 0; },
        setSelectionRange(start, end, direction) {
            this._selectionStart = Number(start) || 0;
            this._selectionEnd = Number(end) || 0;
        },
        get checked() { return this._attrs?.['checked'] === 'true'; },
        set checked(v) {
            if (!this._attrs) this._attrs = {};
            this._attrs['checked'] = String(!!v);
            __host.op_set_attr(this.__rvst_id, 'checked', String(!!v));
        },
        getBoundingClientRect() {
            const r = __host.op_get_layout(this.__rvst_id);
            const x = r[0], y = r[1], w = r[2], h = r[3];
            return { x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h,
                     toJSON() { return { x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h }; } };
        },
        focus(opts) {
            const prev = globalThis.document._activeElement;
            if (prev === this) return; // already focused
            __host.op_set_focus(this.__rvst_id);
            globalThis.document._activeElement = this;
            // Dispatch blur/focusout on previous, then focus/focusin on new
            if (prev && prev.dispatchEvent) {
                prev.dispatchEvent(new FocusEvent('blur', { bubbles: false, relatedTarget: this }));
                prev.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: this }));
            }
            this.dispatchEvent(new FocusEvent('focus', { bubbles: false, relatedTarget: prev ?? null }));
            this.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: prev ?? null }));
        },
        blur() {
            if (globalThis.document._activeElement === this) {
                __host.op_set_focus(0);
                globalThis.document._activeElement = null;
                this.dispatchEvent(new FocusEvent('blur', { bubbles: false, relatedTarget: null }));
                this.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
            }
        },
        get lastChild() { return this.childNodes[this.childNodes.length - 1] ?? null; },
        get parentNode() { return this.__parent ?? null; },
        get isConnected() { return !!this.__rvst_in_tree; },
        get ownerDocument() { return globalThis.document; },
        getRootNode() {
            let cur = this;
            while (cur.__parent) cur = cur.__parent;
            // Ensure the root has getSelection (CodeMirror reads getRootNode().getSelection())
            if (!cur.getSelection) cur.getSelection = function() { return __rvst_selection; };
            return cur;
        },
        contains(other) {
            let cur = other;
            while (cur) { if (cur === this) return true; cur = cur.__parent; }
            return false;
        },
        compareDocumentPosition(other) {
            if (this === other) return 0;
            // Walk ancestors to check containment
            let cur = other;
            while (cur) { if (cur === this) return 20; cur = cur.__parent ?? null; } // 16 (contained_by) | 4 (following)
            cur = this;
            while (cur) { if (cur === other) return 10; cur = cur.__parent ?? null; } // 8 (contains) | 2 (preceding)
            return 4; // DOCUMENT_POSITION_FOLLOWING (disconnected nodes)
        },
        dispatchEvent(event) {
            if (!event) return true;
            let prevented = false;
            const origPreventDefault = event.preventDefault;
            event.preventDefault = function() { prevented = true; if (origPreventDefault) origPreventDefault.call(this); };
            event.target = this;
            let stopped = false;
            let stoppedImmediate = false;
            event.stopPropagation = function() { stopped = true; };
            event.stopImmediatePropagation = function() { stopped = true; stoppedImmediate = true; };

            // Build ancestor path: [root, ..., parent, target]
            const path = [];
            let cur = this;
            while (cur) { path.unshift(cur); cur = cur.__parent ?? null; }

            const _callListeners = (node, capturePhase) => {
                event.currentTarget = node;
                const listeners = node.__rvst_listeners?.[event.type];
                if (!listeners) return;
                for (const entry of [...listeners]) {
                    if (stoppedImmediate) break;
                    // During capture phase, only call capture listeners
                    // During bubble phase, only call non-capture listeners
                    // During target phase (called separately), call both
                    const isTarget = node === this;
                    if (!isTarget && capturePhase && !entry.capture) continue;
                    if (!isTarget && !capturePhase && entry.capture) continue;
                    try {
                        if (event.type === 'keydown') console.log('[dispatch-inner] calling listener id=' + entry.id + ' on node=' + (node.__rvst_id || '?'));
                        entry.fn.call(node, event);
                    } catch(e) { console.error('[dispatchEvent] listener error for ' + event.type + ':', e, e.stack || ''); }
                }
            };

            // 1. Capture phase: root → target (excluding target)
            for (let i = 0; i < path.length - 1 && !stopped; i++) {
                _callListeners(path[i], true);
            }

            // 2. Target phase: call both capture and bubble listeners
            if (!stopped) {
                event.currentTarget = this;
                const listeners = this.__rvst_listeners?.[event.type];
                if (listeners) {
                    for (const entry of [...listeners]) {
                        if (stoppedImmediate) break;
                        try {
                            if (event.type === 'keydown') console.log('[dispatch-inner] calling listener id=' + entry.id + ' on node=' + (this.__rvst_id || '?'));
                            entry.fn.call(this, event);
                        } catch(e) { console.error('[dispatchEvent] listener error for ' + event.type + ':', e, e.stack || ''); }
                    }
                }
            }

            // 3. Bubble phase: target parent → root (only if event bubbles)
            if (event.bubbles && !stopped) {
                for (let i = path.length - 2; i >= 0 && !stopped; i--) {
                    _callListeners(path[i], false);
                }
            }

            // Also fire on document and window handlers if bubbling
            if (event.bubbles && !stopped) {
                const docHandlers = _doc_handlers[event.type];
                if (docHandlers) for (const h of [...docHandlers]) { if (stoppedImmediate) break; try { h(event); } catch(e) {} }
                if (!stoppedImmediate) {
                    const winHandlers = _win_handlers[event.type];
                    if (winHandlers) for (const h of [...winHandlers]) { if (stoppedImmediate) break; try { h(event); } catch(e) {} }
                }
            }
            return !prevented;
        },
        querySelectorAll(selector) { const r = []; __rvst_query_all(this, selector, r, false); return r; },
        querySelector(selector) { const r = []; __rvst_query_all(this, selector, r, true); return r[0] ?? null; },
        namespaceURI: (tag === '#text' || tag === '#comment' || tag === '#document-fragment') ? null : 'http://www.w3.org/1999/xhtml',
        setAttributeNS(ns, name, value) {
            const local = name.includes(':') ? name.split(':').pop() : name;
            this.setAttribute(local, value);
        },
        removeAttributeNS(ns, name) {
            const local = name.includes(':') ? name.split(':').pop() : name;
            this.removeAttribute(local);
        },
        getAttributeNS(ns, name) {
            const local = name.includes(':') ? name.split(':').pop() : name;
            return this.getAttribute(local);
        },
        _attrs: {},
        getAttribute(name) { return this._attrs[name] ?? null; },
        setAttribute(name, value) {
            this._attrs[name] = String(value);
            if (name === 'style') {
                const inline = this.__rvst_inline_props ?? new Set();
                String(value).split(';').forEach(chunk => {
                    const colon = chunk.indexOf(':');
                    if (colon > 0) inline.add(chunk.slice(0, colon).trim());
                });
                this.__rvst_inline_props = inline;
                this.style.cssText = String(value);
            } else {
                __host.op_set_attr(this.__rvst_id, String(name), String(value));
                if (name === 'class') __rvst_apply_css(this);
            }
            // MutationObserver notification
            if (this.__rvst_mutation_observers) {
                for (const obs of this.__rvst_mutation_observers) obs._notify('attributes', this, { attributeName: name });
            }
        },
        removeAttribute(name) {
            delete this._attrs[name];
            __host.op_set_attr(this.__rvst_id, String(name), '');
            // When `hidden` attribute is removed the element becomes visible again.
            // In a browser the hidden attribute removes the element from layout; removing
            // it restores the element to its CSS-cascaded display value. In our stub world
            // we also need to clear any inline style.display=none that was set alongside
            // the hidden attribute (e.g. bits-ui Tabs sets both during initial mount of
            // inactive tabs, but only removes hidden when activating — not the inline style).
            if (String(name) === 'hidden') {
                // Only clear display:none if _hiddenSetDisplay flagged that the hidden
                // setter was what set it — avoids clobbering an independently-set display:none.
                if (this._hiddenSetDisplay) {
                    this._hiddenSetDisplay = false;
                    const raw = this.style.__raw;
                    if (raw && raw['display'] === 'none') {
                        delete raw['display'];
                        __host.op_set_style(this.__rvst_id, 'display', '');
                    }
                }
            }
        },
        hasAttribute(name) { return name in this._attrs; },
        classList: (() => {
            const classes = new Set();
            const el_id = id; // capture element id for op emission
            const _flush = (attrs) => {
                const v = [...classes].join(' ');
                attrs['class'] = v;
                __host.op_set_attr(el_id, 'class', v);
                __rvst_apply_css(el);
            };
            return {
                add(...cls) {
                    cls.forEach(c => { if (c) classes.add(c); });
                    _flush(el._attrs);
                },
                remove(...cls) {
                    cls.forEach(c => classes.delete(c));
                    _flush(el._attrs);
                },
                toggle(cls, force) {
                    if (force === undefined ? classes.has(cls) : !force) classes.delete(cls);
                    else classes.add(cls);
                    _flush(el._attrs);
                    return classes.has(cls);
                },
                contains(cls) { return classes.has(cls); },
                replace(old, next) {
                    if (!classes.has(old)) return false;
                    classes.delete(old);
                    classes.add(next);
                    _flush(el._attrs);
                    return true;
                },
                get value() { return [...classes].join(' '); },
                set value(v) { classes.clear(); String(v).split(/\s+/).filter(Boolean).forEach(c => classes.add(c)); _flush(el._attrs); },
                [Symbol.iterator]() { return classes[Symbol.iterator](); },
            };
        })(),
        append(...nodes) {
            for (const node of nodes) {
                if (typeof node === 'string') {
                    const t = __rvst_make_el('#text');
                    t._data = node;
                    __host.op_set_text(t.__rvst_id, node);
                    t.__parent = this;
                    this.childNodes.push(t);
                    this.firstChild = this.childNodes[0] ?? null;
                    __host.op_insert(this.__rvst_id, t.__rvst_id, 0);
                } else if (node && node.__rvst_id) {
                    this.appendChild(node);
                }
            }
        },
        addEventListener(event, handler, opts) {
            if (!handler) return;
            let wrappedHandler = handler;
            if (opts?.once) {
                const self = this;
                wrappedHandler = function(...args) {
                    self.removeEventListener(event, wrappedHandler, opts);
                    return handler.apply(this, args);
                };
                handler.__rvst_once_wrap = wrappedHandler;
            }
            if (opts?.signal?.aborted) return;
            const id = __rvst_handler_next_id++;
            __rvst_handlers.set(id, wrappedHandler);
            __host.op_listen(this.__rvst_id, event, id);
            // Also track per-element so dispatchEvent can invoke listeners
            if (!this.__rvst_listeners) this.__rvst_listeners = {};
            (this.__rvst_listeners[event] ??= []).push({ id, fn: wrappedHandler, capture: !!(opts?.capture) });
            if (opts?.signal) {
                opts.signal.addEventListener('abort', () => {
                    this.removeEventListener(event, wrappedHandler);
                });
            }
        },
        removeEventListener(event, handler, _opts) {
            const target = handler?.__rvst_once_wrap ?? handler;
            for (const [id, fn] of __rvst_handlers) {
                if (fn === target) {
                    __rvst_handlers.delete(id);
                    __host.op_unlisten(this.__rvst_id, event, id);
                    // Remove from per-element tracking
                    if (this.__rvst_listeners?.[event]) {
                        this.__rvst_listeners[event] = this.__rvst_listeners[event].filter(e => e.id !== id);
                    }
                    break;
                }
            }
        },
        appendChild(child) {
            child.__parent = this;
            child.__rvst_in_tree = true;
            this.childNodes.push(child);
            this.firstChild = this.childNodes[0] ?? null;
            __host.op_insert(this.__rvst_id, child.__rvst_id ?? 0, 0);
            // Recursively insert any template-cloned children not yet in tree
            if (child.childNodes) {
                for (const c of child.childNodes) { __rvst_insert_subtree(child, c); }
            }
            return child;
        },
        insertBefore(child, ref) {
            child.__parent = this;
            child.__rvst_in_tree = true;
            // Update JS-side childNodes so nextSibling/firstChild stay correct
            if (ref && ref.__rvst_id) {
                const idx = this.childNodes.indexOf(ref);
                if (idx !== -1) {
                    this.childNodes.splice(idx, 0, child);
                } else {
                    this.childNodes.push(child);
                }
            } else {
                this.childNodes.push(child);
            }
            this.firstChild = this.childNodes[0] ?? null;
            __host.op_insert(this.__rvst_id, child.__rvst_id ?? 0, ref?.__rvst_id ?? 0);
            if (child.childNodes) {
                for (const c of child.childNodes) { __rvst_insert_subtree(child, c); }
            }
            return child;
        },
        before(...nodes) {
            // Svelte 5: anchor.before(button) — insert nodes before this anchor
            const parent = this.__parent;
            if (!parent) return;
            const anchor_id = this.__rvst_id;
            const parent_id = parent.__rvst_id ?? 1;
            const myIdx = parent.childNodes ? parent.childNodes.indexOf(this) : -1;
            let insertAt = myIdx >= 0 ? myIdx : 0;
            for (const node of nodes) {
                if (!node || !node.__rvst_id) continue;
                node.__parent = parent;
                node.__rvst_in_tree = true;
                if (parent.childNodes && myIdx >= 0) {
                    parent.childNodes.splice(insertAt++, 0, node);
                    parent.firstChild = parent.childNodes[0] ?? null;
                }
                __host.op_insert(parent_id, node.__rvst_id, anchor_id);
                if (node.childNodes) {
                    for (const c of node.childNodes) { __rvst_insert_subtree(node, c); }
                }
            }
        },
        remove() {
            if (!this.__rvst_in_tree) return; // template-parse nodes are never in the Rust tree
            this.__rvst_in_tree = false;
            // Update parent's childNodes so nextSibling/firstChild stay correct after removal
            if (this.__parent && this.__parent.childNodes) {
                const siblings = this.__parent.childNodes;
                const idx = siblings.indexOf(this);
                if (idx !== -1) siblings.splice(idx, 1);
                this.__parent.firstChild = siblings[0] ?? null;
            }
            __host.op_remove(this.__rvst_id);
        },
        after(...nodes) {
            const parent = this.__parent;
            if (!parent) return;
            // Find the next sibling to use as anchor (insert before it = insert after this)
            const siblings = parent.childNodes;
            const idx = siblings ? siblings.indexOf(this) : -1;
            const nextSib = siblings ? (siblings[idx + 1] ?? null) : null;
            const anchor_id = nextSib?.__rvst_id ?? 0;
            const parent_id = parent.__rvst_id ?? 0;
            let insertAt = idx >= 0 ? idx + 1 : siblings ? siblings.length : 0;
            for (const node of nodes) {
                if (!node || !node.__rvst_id) continue;
                node.__parent = parent;
                node.__rvst_in_tree = true;
                if (siblings && idx >= 0) {
                    siblings.splice(insertAt++, 0, node);
                    parent.firstChild = siblings[0] ?? null;
                }
                __host.op_insert(parent_id, node.__rvst_id, anchor_id);
                if (node.childNodes) {
                    for (const c of node.childNodes) { __rvst_insert_subtree(node, c); }
                }
            }
        },
        replaceWith(...nodes) {
            // Insert nodes before this, then remove this
            if (this.__parent) {
                this.before(...nodes);
            }
            this.remove();
        },
        prepend(...nodes) {
            // Insert nodes at the beginning of this element's children
            const firstChild = this.childNodes[0] ?? null;
            const anchor_id = firstChild?.__rvst_id ?? 0;
            for (const node of nodes) {
                if (typeof node === 'string') {
                    const t = __rvst_make_el('#text');
                    t._data = node; t.__parent = this; t.__rvst_in_tree = true;
                    __host.op_set_text(t.__rvst_id, node);
                    this.childNodes.unshift(t);
                    __host.op_insert(this.__rvst_id, t.__rvst_id, anchor_id);
                } else if (node && node.__rvst_id) {
                    node.__parent = this; node.__rvst_in_tree = true;
                    this.childNodes.unshift(node);
                    __host.op_insert(this.__rvst_id, node.__rvst_id, anchor_id);
                    if (node.childNodes) {
                        for (const c of node.childNodes) { __rvst_insert_subtree(node, c); }
                    }
                }
            }
            this.firstChild = this.childNodes[0] ?? null;
        },
        replaceChildren(...nodes) {
            // Remove all current children, then append new ones
            for (const child of this.childNodes) {
                child.__rvst_in_tree = false;
                __host.op_remove(child.__rvst_id);
            }
            this.childNodes = [];
            this.firstChild = null;
            this.append(...nodes);
        },
        removeChild(child) {
            if (child && child.remove) child.remove();
            return child;
        },
        get innerText() { return this._data ?? ''; },
        set innerText(v) { this.textContent = v; },
        insertAdjacentElement(where, el) {
            switch (where) {
                case 'beforebegin': this.before(el); break;
                case 'afterend':    this.after(el); break;
                case 'afterbegin':  this.prepend(el); break;
                case 'beforeend':   this.appendChild(el); break;
            }
            return el;
        },
        insertAdjacentText(where, text) {
            const t = __rvst_make_el('#text');
            t._data = text;
            __host.op_set_text(t.__rvst_id, text);
            this.insertAdjacentElement(where, t);
        },
        insertAdjacentHTML(where, html) {
            const frag = __rvst_make_el('#document-fragment');
            __rvst_parse_html(html, frag);
            for (const child of frag.childNodes) {
                this.insertAdjacentElement(where, child);
            }
        },
        get className() { return this._attrs?.['class'] ?? ''; },
        set className(v) {
            if (!this._attrs) this._attrs = {};
            this._attrs['class'] = String(v);
            __host.op_set_attr(this.__rvst_id, 'class', String(v));
            __rvst_apply_css(this);
        },
        cloneNode(deep) {
            // ── Template batch clone path ──────────────────────────────
            // If this node is tagged as a template root (by __rvst_make_template),
            // use the batch clone path on 2nd+ clone to send one op instead of N.
            if (deep && this.__rvst_template_html && !__rvst_suppress_ops) {
                const html = this.__rvst_template_html;
                let cached = __rvst_template_cache.get(html);
                if (cached) {
                    // Subsequent clone: suppress individual ops, batch to Rust
                    const startId = __rvst_next_id;
                    __rvst_suppress_ops = true;
                    const clone = this.cloneNode(true); // re-enter with suppress on
                    __rvst_suppress_ops = false;
                    __host.op_clone_template(cached.hash, startId, cached.descriptor_json);
                    return clone;
                } else {
                    // First clone: normal path, then cache the descriptor
                    const clone = this._cloneNodeInner(true);
                    const descs = (this.__rvst_tag === '#document-fragment')
                        ? this.childNodes.map(__rvst_serialize_template)
                        : [__rvst_serialize_template(this)];
                    const nodeCount = __rvst_count_nodes(this);
                    cached = {
                        hash: __rvst_hash_string(html),
                        descriptor_json: JSON.stringify(descs),
                        node_count: nodeCount,
                    };
                    __rvst_template_cache.set(html, cached);
                    return clone;
                }
            }
            return this._cloneNodeInner(deep);
        },
        _cloneNodeInner(deep) {
            const clone = __rvst_make_el(this.__rvst_tag);
            // Copy attributes and emit op_set_attr for each so the Rust tree sees
            // static template attributes (placeholder, type, value, checked, etc.)
            if (this._attrs) {
                Object.assign(clone._attrs, this._attrs);
                if (!__rvst_suppress_ops) {
                    for (const [k, v] of Object.entries(this._attrs)) {
                        if (k !== 'style' && v !== undefined && v !== null && String(v).length > 0) {
                            __host.op_set_attr(clone.__rvst_id, k, String(v));
                        }
                    }
                }
                // Re-apply style attribute so the clone's style proxy _styles stays in sync
                if (this._attrs['style']) {
                    clone.style.cssText = this._attrs['style'];
                }
                // Apply class-based CSS rules now that _attrs has the class.
                // cloneNode bypasses setAttribute so the normal hook doesn't fire;
                // call explicitly so Tailwind/scoped CSS is applied to cloned templates.
                if (this._attrs['class']) __rvst_apply_css(clone);
            }
            // Copy text/data content
            if (this._data !== undefined && this._data !== null) {
                clone._data = this._data;
                if (!__rvst_suppress_ops && this._data) __host.op_set_text(clone.__rvst_id, String(this._data));
            }
            if (deep && this.childNodes && this.childNodes.length > 0) {
                for (const child of this.childNodes) {
                    const childClone = child.cloneNode(true);
                    childClone.__parent = clone;
                    clone.childNodes.push(childClone);
                }
                // Don't set firstChild as own property — proto getter reads childNodes[0]
            }
            return clone;
        },
        get data() { return this._data ?? ''; },
        set data(v) {
            this._data = String(v);
            __host.op_set_text(this.__rvst_id, String(v));
        },
        // dataset — DOMStringMap for data-* attributes
        get dataset() {
            const _self = this;
            return new Proxy({}, {
                get(_t, key) {
                    if (typeof key !== 'string') return undefined;
                    const attr = 'data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
                    return _self._attrs[attr] ?? undefined;
                },
                set(_t, key, value) {
                    const attr = 'data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
                    _self._attrs[attr] = String(value);
                    __host.op_set_attr(_self.__rvst_id, attr, String(value));
                    return true;
                },
                has(_t, key) {
                    const attr = 'data-' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
                    return attr in _self._attrs;
                },
            });
        },
        // hidden — shorthand for display:none
        get hidden() { return this._attrs['hidden'] === 'true' || this._attrs['hidden'] === ''; },
        set hidden(v) {
            if (v) {
                this._hiddenSetDisplay = true;
                this._attrs['hidden'] = '';
                // Route through style proxy so _styles stays in sync (removeAttribute('hidden')
                // reads _styles to know whether to clear display:none).
                this.style.display = 'none';
            } else {
                delete this._attrs['hidden'];
                // Only clear display if WE set it via the hidden setter — not if something
                // else set display:none independently (_hiddenSetDisplay tracks this).
                if (this._hiddenSetDisplay) {
                    this._hiddenSetDisplay = false;
                    const raw = this.style.__raw;
                    if (raw && raw['display'] === 'none') {
                        this.style.display = '';
                    }
                }
            }
        },
        // offsetWidth/Height — read real layout rects from the Rust tree via layout cache
        get offsetWidth() { return __host.op_get_layout(this.__rvst_id)[2]; },
        get offsetHeight() { return __host.op_get_layout(this.__rvst_id)[3]; },
        get offsetTop() { return __host.op_get_layout(this.__rvst_id)[1]; },
        get offsetLeft() { return __host.op_get_layout(this.__rvst_id)[0]; },
        get clientWidth() { return __host.op_get_layout(this.__rvst_id)[2]; },
        get clientHeight() { return __host.op_get_layout(this.__rvst_id)[3]; },
        // scroll properties
        _scrollTop: 0,
        get scrollTop() { return this._scrollTop; },
        set scrollTop(v) {
            this._scrollTop = v;
            __host.op_set_scroll(this.__rvst_id, v);
        },
        scrollLeft: 0,
        get scrollHeight() {
            const dims = __host.op_get_scroll_dims(this.__rvst_id);
            return dims ? dims[1] : 0;
        },
        get scrollWidth() {
            const dims = __host.op_get_scroll_dims(this.__rvst_id);
            return dims ? dims[0] : 0;
        },
        scrollIntoView(opts) {
            const rect = __host.op_get_layout(this.__rvst_id);
            if (!rect || rect[2] === 0) return; // no layout
            const elY = rect[1], elH = rect[3];

            // Walk up to find nearest scroll container
            let container = this.__parent;
            while (container) {
                const raw = container.style?.__raw;
                if (raw) {
                    const ov = raw['overflow'] ?? '';
                    const ovY = raw['overflow-y'] ?? '';
                    if (ov === 'auto' || ov === 'scroll' || ovY === 'auto' || ovY === 'scroll') break;
                }
                container = container.__parent;
            }
            if (!container) return;

            const cRect = __host.op_get_layout(container.__rvst_id);
            if (!cRect || cRect[3] === 0) return;
            const cY = cRect[1], cH = cRect[3];
            const scrollY = container._scrollTop || 0;

            // Check visibility (element position relative to container viewport)
            const elRelTop = elY - cY + scrollY;
            const elRelBottom = elRelTop + elH;
            const visTop = scrollY;
            const visBottom = scrollY + cH;

            if (elRelTop < visTop) {
                // Element above viewport — scroll up
                container.scrollTop = elRelTop;
            } else if (elRelBottom > visBottom) {
                // Element below viewport — scroll down
                container.scrollTop = elRelBottom - cH;
            }
            // Already visible — do nothing
        },
        // children — element children only (nodeType === 1)
        get children() { return this.childNodes.filter(n => n.nodeType === 1); },
        get childElementCount() { return this.childNodes.filter(n => n.nodeType === 1).length; },
        get firstElementChild() { return this.childNodes.find(n => n.nodeType === 1) ?? null; },
        get lastElementChild() {
            const els = this.childNodes.filter(n => n.nodeType === 1);
            return els[els.length - 1] ?? null;
        },
        // previousSibling — needed for Svelte anchor traversal
        get previousSibling() {
            if (!this.__parent) return null;
            const siblings = this.__parent.childNodes;
            if (!siblings) return null;
            const idx = siblings.indexOf(this);
            return idx > 0 ? siblings[idx - 1] : null;
        },
        get nextElementSibling() {
            if (!this.__parent) return null;
            const siblings = this.__parent.childNodes;
            if (!siblings) return null;
            let idx = siblings.indexOf(this) + 1;
            while (idx < siblings.length) {
                if (siblings[idx].nodeType === 1) return siblings[idx];
                idx++;
            }
            return null;
        },
        get previousElementSibling() {
            if (!this.__parent) return null;
            const siblings = this.__parent.childNodes;
            if (!siblings) return null;
            let idx = siblings.indexOf(this) - 1;
            while (idx >= 0) {
                if (siblings[idx].nodeType === 1) return siblings[idx];
                idx--;
            }
            return null;
        },
        matches(selector) {
            // Supports: tag, #id, .class, [attr], [attr=val] — covers Svelte scoped + common patterns
            if (!selector) return false;
            const sel = selector.trim();
            // Compound selector: split on '.' and '#' for basic multi-part matching
            // Strategy: tokenize into required parts and check all
            const parts = [];
            let rest = sel;
            // Extract tag (leading word chars before any # or .)
            const tagMatch = rest.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
            if (tagMatch) {
                parts.push({ type: 'tag', value: tagMatch[1].toLowerCase() });
                rest = rest.slice(tagMatch[1].length);
            }
            // Extract #id and .class tokens
            const tokens = rest.match(/([#.][^#.\[]+|\[[^\]]+\])/g) ?? [];
            for (const tok of tokens) {
                if (tok.startsWith('#')) parts.push({ type: 'id', value: tok.slice(1) });
                else if (tok.startsWith('.')) parts.push({ type: 'class', value: tok.slice(1) });
                else if (tok.startsWith('[')) {
                    const inner = tok.slice(1, -1);
                    const eq = inner.indexOf('=');
                    if (eq === -1) parts.push({ type: 'attr', key: inner.trim(), value: null });
                    else parts.push({ type: 'attr', key: inner.slice(0, eq).trim(),
                                      value: inner.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '') });
                }
            }
            if (parts.length === 0) return false;
            return parts.every(p => {
                if (p.type === 'tag')   return this.__rvst_tag === p.value;
                if (p.type === 'id')    return (this._attrs['id'] ?? '') === p.value;
                if (p.type === 'class') return (this._attrs['class'] ?? '').split(/\s+/).includes(p.value);
                if (p.type === 'attr') {
                    if (p.value === null) return p.key in this._attrs;
                    return (this._attrs[p.key] ?? '') === p.value;
                }
                return false;
            });
        },
        closest(selector) {
            let cur = this;
            while (cur && cur.__rvst_tag && cur.__rvst_tag !== '#document-fragment') {
                if (cur.matches && cur.matches(selector)) return cur;
                cur = cur.__parent ?? null;
            }
            return null;
        },
        get parentElement() { return this.__parent ?? null; },
        assignedSlot: null,
        getClientRects() {
            const r = __host.op_get_layout(this.__rvst_id);
            if (!r || r[2] === 0) return [];
            const x = r[0], y = r[1], w = r[2], h = r[3];
            return [{ x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h }];
        },
        // Common HTML element properties delegating to _attrs
        get id() { return this._attrs['id'] ?? ''; },
        set id(v) { this.setAttribute('id', String(v)); },
        get localName() { return this.__rvst_tag; },
        get title() { return this._attrs['title'] ?? ''; },
        set title(v) { this.setAttribute('title', String(v)); },
        get name() { return this._attrs['name'] ?? ''; },
        set name(v) { this.setAttribute('name', String(v)); },
        get type() { return this._attrs['type'] ?? ''; },
        set type(v) { this.setAttribute('type', String(v)); },
        get placeholder() { return this._attrs['placeholder'] ?? ''; },
        set placeholder(v) { this.setAttribute('placeholder', String(v)); },
        get required() { return 'required' in this._attrs; },
        set required(v) { if (v) this.setAttribute('required', ''); else this.removeAttribute('required'); },
        get readOnly() { return 'readonly' in this._attrs; },
        set readOnly(v) { if (v) this.setAttribute('readonly', ''); else this.removeAttribute('readonly'); },
        get multiple() { return 'multiple' in this._attrs; },
        set multiple(v) { if (v) this.setAttribute('multiple', ''); else this.removeAttribute('multiple'); },
        get href() { return this._attrs['href'] ?? ''; },
        set href(v) { this.setAttribute('href', String(v)); },
        get src() { return this._attrs['src'] ?? ''; },
        set src(v) { this.setAttribute('src', String(v)); },
        get alt() { return this._attrs['alt'] ?? ''; },
        set alt(v) { this.setAttribute('alt', String(v)); },
        get tabIndex() { return parseInt(this._attrs['tabindex'] ?? '-1', 10); },
        set tabIndex(v) { this.setAttribute('tabindex', String(v)); },
        // select element helpers
        get selectedIndex() { return parseInt(this._attrs['data-sel-idx'] ?? '0', 10); },
        set selectedIndex(v) { this._attrs['data-sel-idx'] = String(v); },
        get options() { return this.childNodes.filter(n => n.__rvst_tag === 'option'); },
        get selected() { return 'selected' in this._attrs; },
        set selected(v) { if (v) this.setAttribute('selected', ''); else this.removeAttribute('selected'); },
        get indeterminate() { return this._attrs['indeterminate'] === 'true'; },
        set indeterminate(v) { this._attrs['indeterminate'] = String(!!v); },
        get defaultValue() { return this._attrs['value'] ?? ''; },
        set defaultValue(v) { this.setAttribute('value', String(v)); },
        get contentEditable() { return this._attrs['contenteditable'] ?? 'inherit'; },
        set contentEditable(v) { this.setAttribute('contenteditable', String(v)); },
        get isContentEditable() { return this._attrs['contenteditable'] === 'true'; },
        get ariaLabel() { return this._attrs['aria-label'] ?? null; },
        set ariaLabel(v) { this.setAttribute('aria-label', v == null ? '' : String(v)); },
        get role() { return this._attrs['role'] ?? ''; },
        set role(v) { this.setAttribute('role', String(v)); },
        // form association — inputs/selects in a <form> element
        get form() {
            let cur = this.__parent;
            while (cur) { if (cur.__rvst_tag === 'form') return cur; cur = cur.__parent; }
            return null;
        },
        // getAnimations() — Svelte's keyed {#each} FLIP animation checks this
        getAnimations() { return []; },
        // animate() — Web Animations API with real rAF timing for Svelte transitions
        animate(keyframes, options) {
            const duration = typeof options === 'number' ? options : (options?.duration || 0);
            const startTime = performance.now();
            const anim = {
                currentTime: 0, playbackRate: 1, playState: 'running',
                startTime: null, effect: null,
                onfinish: null, oncancel: null,
                finished: null, ready: Promise.resolve(),
                play() { this.playState = 'running'; },
                pause() { this.playState = 'paused'; },
                cancel() { this.playState = 'idle'; this.oncancel?.(); },
                finish() { this.playState = 'finished'; this.currentTime = duration; this.onfinish?.(); },
                reverse() { this.playbackRate *= -1; },
                updatePlaybackRate(r) { this.playbackRate = r; },
                commitStyles() {},
                persist() {},
                addEventListener(_e, _h) {},
                removeEventListener(_e, _h) {},
            };

            let _resolve;
            anim.finished = new Promise(r => { _resolve = r; });

            if (duration <= 0) {
                // Instant — fire on microtask like before
                Promise.resolve().then(() => {
                    anim.playState = 'finished';
                    anim.currentTime = 0;
                    anim.onfinish?.();
                    _resolve?.();
                });
            } else {
                // Real timing via rAF so Svelte transitions run over actual duration
                function tick() {
                    if (anim.playState !== 'running') return;
                    const elapsed = performance.now() - startTime;
                    anim.currentTime = Math.min(elapsed, duration);
                    if (elapsed >= duration) {
                        anim.playState = 'finished';
                        anim.onfinish?.();
                        _resolve?.();
                    } else {
                        requestAnimationFrame(tick);
                    }
                }
                requestAnimationFrame(tick);
            }

            return anim;
        },
        get innerHTML() { return ''; },
        set innerHTML(v) {
            // Remove all existing children from Rust tree
            for (const child of this.childNodes) {
                child.__rvst_in_tree = false;
                __host.op_remove(child.__rvst_id);
            }
            this.childNodes = [];
            this.firstChild = null;
            if (v && v.length > 0) {
                __rvst_parse_html(String(v), this);
                // Insert parsed subtree into Rust tree
                for (const child of this.childNodes) {
                    __rvst_insert_subtree(this, child);
                }
            }
        },
    };
    // Make this stub inherit from __rvst_element_proto so that Svelte 5's
    // set_attributes prototype walk (cr function) terminates correctly.
    // The walk stops when Object.getPrototypeOf(el) === Element.prototype.
    Object.setPrototypeOf(el, __rvst_element_proto);
    __rvst_elements.set(id, el);
    if (!__rvst_suppress_ops) __host.op_create_node(id, tag.toLowerCase());
    // Inline-level tags get display:inline by default (matches browser behavior).
    // The layout engine reads this to detect inline context and switch to row wrapping.
    const _lower = tag.toLowerCase();
    if (_lower === 'span' || _lower === 'a' || _lower === 'strong' || _lower === 'em' ||
        _lower === 'b' || _lower === 'i' || _lower === 'u' || _lower === 's' ||
        _lower === 'code' || _lower === 'small' || _lower === 'sub' || _lower === 'sup' ||
        _lower === 'abbr' || _lower === 'mark' || _lower === 'label' || _lower === 'br' ||
        _lower === 'wbr' || _lower === 'img') {
        if (!__rvst_suppress_ops) __host.op_set_style(id, 'display', 'inline');
    }
    // Canvas element — add width/height buffer properties and getContext('2d')
    if (_lower === 'canvas') {
        let _canvasWidth = 300;  // default canvas width per spec
        let _canvasHeight = 150; // default canvas height per spec
        let _ctx = null;
        Object.defineProperty(el, 'width', {
            get() { return _canvasWidth; },
            set(v) {
                _canvasWidth = Number(v) || 0;
                __host.op_set_attr(id, 'width', String(_canvasWidth));
            },
            enumerable: true, configurable: true,
        });
        Object.defineProperty(el, 'height', {
            get() { return _canvasHeight; },
            set(v) {
                _canvasHeight = Number(v) || 0;
                __host.op_set_attr(id, 'height', String(_canvasHeight));
            },
            enumerable: true, configurable: true,
        });
        el.getContext = function(type) {
            if (type !== '2d') return null;
            if (!_ctx) _ctx = new __RvstCanvas2D(el);
            return _ctx;
        };
        el.toDataURL = function() { return 'data:image/png;base64,'; };
        el.toBlob = function(cb) { if (cb) cb(new Blob([])); };
    }
    return el;
}

// Parse a Svelte template HTML string into a tree of stub nodes.
// Svelte's templates are predictable: elements, text, and HTML comments (<!---->).
// We need the full sibling structure so Svelte can traverse via firstChild/nextSibling.
// Decode common HTML entities in text content.
function __rvst_decode_entities(text) {
    if (text.indexOf('&') === -1) return text;
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&times;/g, '\u00D7')
        .replace(/&nbsp;/g, '\u00A0')
        .replace(/&mdash;/g, '\u2014')
        .replace(/&ndash;/g, '\u2013')
        .replace(/&hellip;/g, '\u2026')
        .replace(/&laquo;/g, '\u00AB')
        .replace(/&raquo;/g, '\u00BB')
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function __rvst_parse_html(html, parent) {
    const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
    const stack = [parent];
    let pos = 0;
    const n = html.length;
    while (pos < n) {
        const cur = stack[stack.length - 1];
        if (html.startsWith('<!--', pos)) {
            // HTML comment node (Svelte uses <!----> as anchors after replaceAll)
            const end = html.indexOf('-->', pos);
            const c = __rvst_make_el('#comment');
            c.__parent = cur;
            cur.childNodes.push(c);
            pos = end === -1 ? n : end + 3;
        } else if (html.startsWith('</', pos)) {
            // Closing tag — pop stack
            const end = html.indexOf('>', pos);
            if (stack.length > 1) stack.pop();
            pos = end === -1 ? n : end + 1;
        } else if (html[pos] === '<') {
            // Opening tag — parse tag name and attributes
            const end = html.indexOf('>', pos);
            if (end === -1) { pos = n; continue; }
            let chunk = html.slice(pos + 1, end);
            const selfClose = chunk.endsWith('/');
            if (selfClose) chunk = chunk.slice(0, -1);
            const tagNameM = chunk.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
            const tag = tagNameM ? tagNameM[1].toLowerCase() : '';
            if (tag) {
                const el = __rvst_make_el(tag);
                el.__parent = cur;
                cur.childNodes.push(el);
                // Parse attributes: name="value", name='value', name=value, or bare name
                const attrStr = chunk.slice(tag.length);
                const attrRe = /([a-zA-Z_:][a-zA-Z0-9_.:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]*)))?/g;
                let am;
                while ((am = attrRe.exec(attrStr)) !== null) {
                    const name = am[1];
                    const val = am[2] !== undefined ? am[2] : am[3] !== undefined ? am[3] : am[4] !== undefined ? am[4] : '';
                    if (name === 'style') { el._attrs['style'] = val; el.style.cssText = val; }
                    else { el._attrs[name] = val; }
                }
                if (!VOID_TAGS.has(tag) && !selfClose) stack.push(el);
            }
            pos = end + 1;
        } else {
            // Text node — decode HTML entities
            const end = html.indexOf('<', pos);
            const raw = end === -1 ? html.slice(pos) : html.slice(pos, end);
            if (raw.length > 0) {
                const text = __rvst_decode_entities(raw);
                const t = __rvst_make_el('#text');
                t._data = text;
                __host.op_set_text(t.__rvst_id, text);
                t.__parent = cur;
                cur.childNodes.push(t);
            }
            pos = end === -1 ? n : end;
        }
    }
    // Fix firstChild references for all nodes in the built tree
    function fixFirstChild(node) {
        node.firstChild = node.childNodes[0] ?? null;
        for (const c of node.childNodes) fixFirstChild(c);
    }
    fixFirstChild(parent);
}

// Template element stub — needs .content (a DocumentFragment-like object)
function __rvst_make_template() {
    const el = __rvst_make_el('template');
    // content is a document fragment; give it the same interface
    const content = __rvst_make_el('#document-fragment');
    // Don't set firstChild/nextSibling as own properties — use proto getters
    el.content = content;
    // When Svelte sets innerHTML, fully parse the HTML into a stub tree so that
    // firstChild/nextSibling traversal works correctly for multi-child templates.
    Object.defineProperty(el, 'innerHTML', {
        set(v) {
            content.childNodes = [];
            content.firstChild = null;
            __rvst_parse_html(v, content);
            // Tag the content fragment AND its firstChild with the HTML string.
            // Svelte's from_html caches either the fragment (is_fragment) or its
            // firstChild (!is_fragment) and calls cloneNode(true) for each instance.
            // The prototype cloneNode checks __rvst_template_html for batch cloning.
            content.__rvst_template_html = v;
            if (content.childNodes.length > 0) {
                content.childNodes[0].__rvst_template_html = v;
            }
        },
        get() { return ''; },
    });
    return el;
}

globalThis.document = {
    visibilityState: 'visible',
    createElement(tag) {
        if (tag === 'template') return __rvst_make_template();
        return __rvst_make_el(tag);
    },
    createElementNS(_ns, tag) {
        if (tag === 'template') return __rvst_make_template();
        return __rvst_make_el(tag);
    },
    createTextNode(text) {
        const el = __rvst_make_el('#text');
        __host.op_set_text(el.__rvst_id, String(text));
        return el;
    },
    createComment(text) {
        // NOTE: text content is not stored/rendered — rvst uses comments only as
        // DOM anchors for Svelte's {#if}/{#each} block markers, not for content.
        return __rvst_make_el('#comment');
    },
    createDocumentFragment() { return __rvst_make_el('#document-fragment'); },
    createTreeWalker(root, whatToShow, filter) {
        const showEl = !whatToShow || (whatToShow & 1);
        const showTxt = !!(whatToShow & 4);
        const nodes = [];
        function walk(node) {
            if (!node) return;
            const isEl = node.__rvst_tag && node.__rvst_tag !== '#text' && node.__rvst_tag !== '#comment';
            const isTxt = node.__rvst_tag === '#text';
            if ((showEl && isEl) || (showTxt && isTxt)) {
                if (!filter || (typeof filter === 'function' ? filter(node) : filter.acceptNode(node)) === 1) nodes.push(node);
            }
            if (node.childNodes) for (const c of node.childNodes) walk(c);
        }
        walk(root);
        let idx = -1;
        return {
            currentNode: root,
            nextNode() { idx++; if (idx < nodes.length) { this.currentNode = nodes[idx]; return nodes[idx]; } return null; },
            previousNode() { idx--; if (idx >= 0) { this.currentNode = nodes[idx]; return nodes[idx]; } return null; },
            firstChild() {
                const ch = this.currentNode?.childNodes || [];
                for (const c of ch) if (nodes.includes(c)) { this.currentNode = c; idx = nodes.indexOf(c); return c; }
                return null;
            },
        };
    },
    _activeElement: null,
    get activeElement() { return this._activeElement ?? null; },
    baseURI: 'http://localhost/',
    defaultView: globalThis,
    get ownerDocument() { return globalThis.document; },
    head: {
        __rvst_id: 0,
        childNodes: [],
        appendChild(child) {
            // Capture Svelte-injected <style> elements so their CSS reaches Taffy.
            // Svelte's inject_styles() does: style.textContent = css; head.appendChild(style)
            if (child && child.__rvst_tag === 'style') {
                const css = child.textContent;
                if (css) __rvst_parse_css(css);
            }
            return child;
        },
        append(...nodes) { for (const n of nodes) this.appendChild(n); },
        querySelector(sel) { return null; },
    },
    readyState: 'complete',
    getElementById(id) {
        if (!id) return null;
        const r = [];
        __rvst_query_all(globalThis.document.body, '[id="' + String(id) + '"]', r, true);
        return r[0] ?? null;
    },
    querySelector(sel) {
        // Special cases: "body" and "html" selectors should return the body/html elements directly
        const s = sel.trim().toLowerCase();
        if (s === 'body') return globalThis.document.body;
        if (s === 'html') return globalThis.document.body; // no separate html element
        const r = []; __rvst_query_all(globalThis.document.body, sel, r, true); return r[0] ?? null;
    },
    querySelectorAll(sel) { const r = []; __rvst_query_all(globalThis.document.body, sel, r, false); return r; },
    createRange() {
        return new globalThis.Range();
    },
    addEventListener(event, handler, _opts) {
        (_doc_handlers[event] ??= []).push(handler);
    },
    removeEventListener(event, handler) {
        if (_doc_handlers[event]) {
            _doc_handlers[event] = _doc_handlers[event].filter(h => h !== handler);
        }
    },
    importNode(node, deep) {
        if (!node) return null;
        if (node.cloneNode) return node.cloneNode(!!deep);
        return node;
    },
    // body is a REAL element stub — same prototype chain as all other elements.
    // Required for bits-ui Portal which calls mount(Component, { target: document.body }).
    body: (() => {
        const b = __rvst_make_el('body');
        b.__rvst_id = 1;
        __rvst_elements.set(1, b);
        b.__rvst_in_tree = true; // isConnected getter reads this
        b.contains = () => true;
        return b;
    })(),
};

// Window constructor — needed for `instanceof Window` checks (CodeMirror 6)
globalThis.Window = function Window() {};
Object.setPrototypeOf(globalThis, globalThis.Window.prototype);
globalThis.window = globalThis;
// Window properties expected by libraries
globalThis.pageYOffset = 0;
globalThis.innerHeight = 768;
globalThis.innerWidth = 1024;
globalThis.scrollBy = function() {};
globalThis.scrollTo = function() {};
globalThis.navigator = { userAgent: 'rvst/quickjs', language: 'en-US', languages: ['en-US'],
                         onLine: true, cookieEnabled: false, platform: 'MacIntel',
                         clipboard: {
                           writeText(text) {
                             try { __host.op_clipboard_write(String(text)); } catch(e) {}
                             return Promise.resolve();
                           },
                           readText() {
                             try { return Promise.resolve(__host.op_clipboard_read()); } catch(e) {}
                             return Promise.resolve('');
                           },
                         } };

// customElements — Svelte's set_attributes checks customElements.get()
globalThis.customElements = { get() { return undefined; }, define() {}, whenDefined() { return Promise.resolve(); } };

// document.contentType — Svelte checks for XHTML mode
globalThis.document.contentType = 'text/html';

// ─── URLSearchParams & URL stubs ──────────────────────────────────────────────
// Required by svelte/reactivity SvelteURL / SvelteURLSearchParams.
globalThis.URLSearchParams = class URLSearchParams {
  constructor(init) {
    this._map = new Map();
    const s = typeof init === 'string' ? (init.startsWith('?') ? init.slice(1) : init)
            : (init == null ? '' : String(init));
    if (s) {
      for (const pair of s.split('&')) {
        if (!pair) continue;
        const eq = pair.indexOf('=');
        const k = decodeURIComponent((eq < 0 ? pair : pair.slice(0, eq)).replace(/\+/g, ' '));
        const v = decodeURIComponent((eq < 0 ? '' : pair.slice(eq + 1)).replace(/\+/g, ' '));
        const bucket = this._map.get(k); if (bucket) bucket.push(v); else this._map.set(k, [v]);
      }
    }
  }
  get(k) { return this._map.get(k)?.[0] ?? null; }
  getAll(k) { return this._map.get(k) ?? []; }
  has(k) { return this._map.has(k); }
  set(k, v) { this._map.set(String(k), [String(v)]); }
  append(k, v) { const b = this._map.get(String(k)); if (b) b.push(String(v)); else this._map.set(String(k), [String(v)]); }
  delete(k) { this._map.delete(String(k)); }
  toString() {
    const p = [];
    for (const [k, vs] of this._map) for (const v of vs) p.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    return p.join('&');
  }
  [Symbol.iterator]() { const e = []; for (const [k, vs] of this._map) for (const v of vs) e.push([k, v]); return e[Symbol.iterator](); }
  entries() { return this[Symbol.iterator](); }
  keys() { const r = []; for (const k of this._map.keys()) r.push(k); return r[Symbol.iterator](); }
  values() { const r = []; for (const vs of this._map.values()) for (const v of vs) r.push(v); return r[Symbol.iterator](); }
  forEach(cb) { for (const [k, v] of this) cb(v, k, this); }
};
globalThis.URL = class URL {
  constructor(href, base) {
    if (href && typeof href === 'object') href = href.href ?? String(href);
    if (base) {
      const b = typeof base === 'string' ? base : base.href;
      if (!/^[a-z][a-z0-9+\-.]*:\/\//i.test(String(href))) {
        const bObj = new globalThis.URL(b);
        href = String(href).startsWith('/')
          ? bObj._origin + href
          : bObj._origin + bObj._pathname.replace(/\/[^/]*$/, '/') + href;
      }
    }
    this._parse(String(href));
  }
  _parse(href) {
    const m = href.match(/^(([a-z][a-z0-9+\-.]*):\/\/([^/:?#]*)(?::(\d+))?)?([^?#]*)(\?[^#]*)?(#.*)?$/i) || [];
    this._protocol = m[2] ? m[2].toLowerCase() + ':' : '';
    this._hostname = m[3] ?? '';
    this._port     = m[4] ?? '';
    this._pathname = m[5] || '/';
    this._search   = m[6] ?? '';
    this._hash     = m[7] ?? '';
    this._username = ''; this._password = '';
    this._refreshOrigin();
    this._sp = new globalThis.URLSearchParams(this._search);
  }
  _refreshOrigin() {
    this._origin = this._protocol ? this._protocol + '//' + this._hostname + (this._port ? ':' + this._port : '') : '';
  }
  get protocol() { return this._protocol; }
  set protocol(v) { this._protocol = String(v).endsWith(':') ? String(v) : String(v) + ':'; this._refreshOrigin(); }
  get hostname() { return this._hostname; }
  set hostname(v) { this._hostname = String(v); this._refreshOrigin(); }
  get port() { return this._port; }
  set port(v) { this._port = String(v); this._refreshOrigin(); }
  get username() { return this._username; }
  set username(v) { this._username = String(v); }
  get password() { return this._password; }
  set password(v) { this._password = String(v); }
  get pathname() { return this._pathname; }
  set pathname(v) { this._pathname = String(v); }
  get search() { return this._search; }
  set search(v) { const s = String(v); this._search = s && !s.startsWith('?') ? '?' + s : s; this._sp = new globalThis.URLSearchParams(this._search); }
  get hash() { return this._hash; }
  set hash(v) { this._hash = String(v); }
  get searchParams() { return this._sp; }
  get host() { return this._hostname + (this._port ? ':' + this._port : ''); }
  get origin() { return this._origin; }
  get href() { return this._origin + this._pathname + this._search + this._hash; }
  set href(v) { this._parse(String(v)); }
  toString() { return this.href; }
  toJSON() { return this.href; }
};

// HTMLElement/SVGElement constructor stubs for instanceof checks.
// Prototypes will be unified with __rvst_element_proto below.
globalThis.HTMLElement = function() {};
globalThis.HTMLInputElement = globalThis.HTMLElement;
globalThis.HTMLSelectElement = globalThis.HTMLElement;
globalThis.HTMLTextAreaElement = globalThis.HTMLElement;
globalThis.HTMLFormElement = globalThis.HTMLElement;
globalThis.HTMLAnchorElement = globalThis.HTMLElement;
globalThis.HTMLButtonElement = globalThis.HTMLElement;
globalThis.HTMLMediaElement = globalThis.HTMLElement;
globalThis.HTMLVideoElement = globalThis.HTMLElement;
globalThis.HTMLAudioElement = globalThis.HTMLElement;
globalThis.SVGElement = function() {};

// Window geometry — used by Svelte bind:innerWidth / bind:innerHeight / devicePixelRatio
globalThis.innerWidth = 1280;
globalThis.innerHeight = 800;
globalThis.devicePixelRatio = 1;
globalThis.scrollX = 0;
globalThis.scrollY = 0;
globalThis.pageXOffset = 0;
globalThis.pageYOffset = 0;

// rvst native window API — lets Svelte components control the OS window.
// All methods push Rust ops via __host. No-ops if running outside rvst shell.
globalThis.__rvst = {
    disableDecorations() { __host.op_set_window_decorations(0); },
    enableDecorations()  { __host.op_set_window_decorations(1); },
    startDragging()      { __host.op_begin_window_drag(); },
    minimize()           { __host.op_minimize_window(); },
    maximize()           { __host.op_maximize_window(1); },
    restore()            { __host.op_maximize_window(0); },
    close()              { __host.op_close_window(); },
    fs: {
        readText(path)          { return __host.op_read_text_file(path); },
        writeText(path, content){ return __host.op_write_text_file(path, content); },
    },
};

// Document-level event listeners — document.addEventListener('visibilitychange', ...) etc.
const _doc_handlers = {};

// Global event listeners — window.addEventListener('resize', ...) etc.
const _win_handlers = {};
globalThis.addEventListener = function(event, handler, _opts) {
    (_win_handlers[event] ??= []).push(handler);
};
globalThis.removeEventListener = function(event, handler) {
    if (_win_handlers[event]) {
        _win_handlers[event] = _win_handlers[event].filter(h => h !== handler);
    }
};
globalThis.dispatchEvent = function(event) {
    if (!event) return true;
    const type = event.type || event;
    const handlers = _win_handlers[type];
    if (handlers) {
        for (const fn of handlers) { try { fn(event); } catch(e) {} }
    }
    return true;
};

// Node stub with proper prototype so Svelte's init_operations() can read
// firstChild/nextSibling property descriptors at startup via
//   Object.getOwnPropertyDescriptor(Node.prototype, 'firstChild').get
// Without these, wt/mt stay undefined and Svelte crashes on first DOM read.
globalThis.Node = {
    ELEMENT_NODE: 1,
    TEXT_NODE: 3,
    COMMENT_NODE: 8,
    DOCUMENT_FRAGMENT_NODE: 11,
    prototype: {},
};
Object.defineProperty(globalThis.Node.prototype, 'firstChild', {
    get() { if (this == null) return null; return this.childNodes?.[0] ?? null; },
    configurable: true,
    enumerable: false,
});
Object.defineProperty(globalThis.Node.prototype, 'nextSibling', {
    get() {
        if (this == null) return null;
        if (!this.__parent) return null;
        const siblings = this.__parent.childNodes;
        if (!siblings) return null;
        const idx = siblings.indexOf(this);
        return siblings[idx + 1] ?? null;
    },
    configurable: true,
    enumerable: false,
});

// Element and Text prototype stubs — init_operations() reads these via
// Object.isExtensible(Element.prototype) to decide whether to cache properties.
// IMPORTANT: Element.prototype must be exactly __rvst_element_proto so that
// Svelte 5's cr() (set_attributes) loop terminates: the loop runs
//   for (i = el, s = Element.prototype; s !== i; ) { i = getPrototypeOf(i); }
// and elements are stamped with Object.setPrototypeOf(el, __rvst_element_proto),
// so s must === __rvst_element_proto for the exit condition to fire.
globalThis.EventTarget = function() {};
globalThis.EventTarget.prototype = { addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } };
globalThis.Element = function() {};
globalThis.Element.prototype = __rvst_element_proto;
globalThis.HTMLElement = function() {};
globalThis.HTMLElement.prototype = __rvst_element_proto;
globalThis.SVGElement = function() {};
globalThis.SVGElement.prototype = __rvst_element_proto;
globalThis.Text = function() {};
globalThis.Text.prototype = Object.create(globalThis.Node.prototype);
// Comment constructor — bits-ui uses `new Comment(data)` via Svelte's comment() helper.
// Svelte calls document.createComment() which goes through __rvst_make_el('#comment'),
// but bits-ui/internal also calls `new Comment(...)` directly.
globalThis.Comment = function Comment(data) {
    const node = document.createComment(data ?? '');
    return node;
};
globalThis.Comment.prototype = Object.create(globalThis.Node.prototype);

globalThis.MutationObserver = function(callback) {
    const targets = new Map();
    let pending = [];
    let scheduled = false;
    function flush() {
        scheduled = false;
        if (pending.length === 0) return;
        const records = pending.slice();
        pending = [];
        try { callback(records, self); } catch(e) {}
    }
    function notify(record) {
        pending.push(record);
        if (!scheduled) { scheduled = true; queueMicrotask(flush); }
    }
    const self = {
        observe(target, options) {
            if (!target) return;
            targets.set(target, options || {});
            if (!target.__rvst_mutation_observers) target.__rvst_mutation_observers = [];
            if (!target.__rvst_mutation_observers.includes(self)) target.__rvst_mutation_observers.push(self);
        },
        disconnect() {
            for (const [target] of targets) {
                if (target.__rvst_mutation_observers) {
                    const idx = target.__rvst_mutation_observers.indexOf(self);
                    if (idx >= 0) target.__rvst_mutation_observers.splice(idx, 1);
                }
            }
            targets.clear(); pending = [];
        },
        takeRecords() { const r = pending.slice(); pending = []; return r; },
        _notify(type, target, opts) {
            // Check direct observation
            let options = targets.get(target);
            // Also check subtree observers on ancestors
            if (!options) {
                let anc = target.__parent;
                while (anc) {
                    const o = targets.get(anc);
                    if (o && o.subtree) { options = o; break; }
                    anc = anc.__parent;
                }
            }
            if (!options) return;
            if (type === 'attributes' && !options.attributes) return;
            if (type === 'childList' && !options.childList) return;
            if (type === 'characterData' && !options.characterData) return;
            notify({ type, target, addedNodes: opts?.addedNodes || [], removedNodes: opts?.removedNodes || [], attributeName: opts?.attributeName || null, oldValue: opts?.oldValue || null });
        },
    };
    return self;
};
// ── ResizeObserver (functional) ──────────────────────────────────────
// After .observe(), we poll element sizes via op_get_layout each rAF.
// When a size changes we fire the callback with spec-shaped entries.
globalThis.__rvst_resize_observers = [];

globalThis.__rvst_check_resize_observers = function() {
    if (globalThis.__rvst_resize_observers) {
        for (const check of globalThis.__rvst_resize_observers) {
            try { check(); } catch(e) {}
        }
    }
};

globalThis.ResizeObserver = function(callback) {
    const observed = new Map(); // element -> {w, h}

    const check = () => {
        const entries = [];
        for (const [el, prev] of observed) {
            const rect = __host.op_get_layout(el.__rvst_id);
            const w = rect ? rect[2] : 0;
            const h = rect ? rect[3] : 0;
            if (w !== prev.w || h !== prev.h) {
                prev.w = w;
                prev.h = h;
                entries.push({
                    target: el,
                    contentRect: { x: 0, y: 0, width: w, height: h, top: 0, left: 0, right: w, bottom: h },
                    borderBoxSize: [{ inlineSize: w, blockSize: h }],
                    contentBoxSize: [{ inlineSize: w, blockSize: h }],
                });
            }
        }
        if (entries.length > 0) {
            try { callback(entries, self); } catch(e) {}
        }
    };

    const self = {
        observe(el) {
            if (!el || !el.__rvst_id) return;
            const rect = __host.op_get_layout(el.__rvst_id);
            observed.set(el, { w: rect ? rect[2] : 0, h: rect ? rect[3] : 0 });
            // Register for post-layout checks
            if (!globalThis.__rvst_resize_observers.includes(check)) {
                globalThis.__rvst_resize_observers.push(check);
            }
            // Fire initial callback (browsers do this on first observe)
            requestAnimationFrame(() => check());
        },
        unobserve(el) {
            observed.delete(el);
        },
        disconnect() {
            observed.clear();
            const idx = globalThis.__rvst_resize_observers.indexOf(check);
            if (idx >= 0) globalThis.__rvst_resize_observers.splice(idx, 1);
        },
    };
    return self;
};
let __rvst_raf_id = 0;
let __rvst_raf_time = 0;
const __rvst_raf_pending = new Map();
globalThis.requestAnimationFrame = function(cb) {
    const id = ++__rvst_raf_id;
    __rvst_raf_pending.set(id, cb);
    __host.request_animation_frame(id);
    return id;
};
globalThis.cancelAnimationFrame = function(id) {
    __rvst_raf_pending.delete(id);
    __host.cancel_animation_frame(id);
};
globalThis.queueMicrotask = globalThis.queueMicrotask ?? function(fn) { Promise.resolve().then(fn); };

// ── Async Command Resolution ────────────────────────────────────────────
// Map of resolve_id → {resolve, reject} for pending async commands.
const __rvst_async_resolvers = new Map();

// High-level async command invocation — returns a Promise.
// Usage: const result = await invokeAsync("my_command", {some: "payload"});
globalThis.invokeAsync = function(name, payload) {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
    return new Promise((resolve, reject) => {
        const raw = __host.invoke_command_async(name, payloadStr);
        let parsed;
        try { parsed = JSON.parse(raw); } catch(e) { return reject(new Error("invalid async response: " + raw)); }
        if (parsed.error) return reject(new Error(parsed.error));
        __rvst_async_resolvers.set(parsed.id, { resolve, reject });
    });
};
globalThis.CustomEvent = function(type, opts) {
    return { type, detail: opts?.detail ?? null, bubbles: opts?.bubbles ?? false,
             cancelBubble: false, defaultPrevented: false,
             preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
             composedPath() { return []; } };
};
if (!globalThis.Event) {
    globalThis.Event = function(type, opts) {
        return { type, bubbles: opts?.bubbles ?? false, cancelBubble: false,
                 defaultPrevented: false, eventPhase: 3,
                 preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
                 composedPath() { return []; } };
    };
}
globalThis.Event.BUBBLING_PHASE = 3;
globalThis.Event.CAPTURING_PHASE = 1;
globalThis.Event.AT_TARGET = 2;

globalThis.getComputedStyle = function(el) {
    // Return a Proxy that reads from the element's style, converting camelCase to kebab-case.
    // Supports CSS inheritance: inheritable properties walk up __parent chain.
    // Returns resolved dimensions via op_get_layout for width/height.
    const _toKebab = p => typeof p === 'string' ? p.replace(/([A-Z])/g, '-$1').toLowerCase() : p;

    const INHERITED = new Set([
        'color', 'font-family', 'font-size', 'font-style', 'font-weight',
        'letter-spacing', 'line-height', 'text-align', 'text-indent',
        'text-transform', 'white-space', 'word-spacing', 'visibility',
        'cursor', 'direction', 'list-style', 'list-style-type',
        'quotes', 'orphans', 'widows',
    ]);

    function _resolve(element, key) {
        // Check element's own styles
        const own = element?.style?.[key];
        if (own !== undefined && own !== '') return own;
        // If inheritable, walk up the parent chain
        if (INHERITED.has(key)) {
            let cur = element?.__parent;
            while (cur) {
                const v = cur?.style?.[key];
                if (v !== undefined && v !== '') return v;
                cur = cur.__parent;
            }
        }
        return '';
    }

    function _resolveWithLayout(key) {
        // For dimension properties, try to return resolved layout values
        if (el && el.__rvst_id && (key === 'width' || key === 'height')) {
            try {
                const rect = __host.op_get_layout(el.__rvst_id);
                if (rect) {
                    if (key === 'width' && rect[2] > 0) return rect[2] + 'px';
                    if (key === 'height' && rect[3] > 0) return rect[3] + 'px';
                }
            } catch(e) {}
        }
        return _resolve(el, key);
    }

    const proxy = new Proxy({}, {
        get(_, prop) {
            if (prop === 'getPropertyValue') return function(key) {
                const k = _toKebab(key);
                return _resolveWithLayout(k);
            };
            if (prop === 'length') return 0;
            if (typeof prop !== 'string') return undefined;
            const key = _toKebab(prop);
            return _resolveWithLayout(key);
        }
    });
    return proxy;
};

// Selection/Range API — needed by svelte-sonner, CodeMirror, bits-ui
globalThis.Selection = globalThis.Selection ?? function() {};

const __rvst_selection_state = {
    anchorNode: null, anchorOffset: 0,
    focusNode: null, focusOffset: 0,
};

// Sync caret position to the compositor whenever selection state changes.
// Walks up to find the contentEditable ancestor and sends (x, y, height) screen coords.
function __rvst_sync_caret() {
    const node = __rvst_selection_state.anchorNode;
    if (!node || typeof __host === 'undefined' || !__host.op_set_caret) return;
    // Walk up to find the contentEditable container
    let ce = node;
    while (ce && !(ce._attrs && (ce._attrs['contenteditable'] === 'true' || ce._attrs['contenteditable'] === ''))) {
        ce = ce.__parent || ce.parentNode;
    }
    if (!ce || !ce.__rvst_id) return;
    // Get the text node's layout to compute caret x position
    const textId = node.__rvst_id || (node.__parent && node.__parent.__rvst_id);
    if (!textId || !__host.op_get_layout) return;
    const rect = __host.op_get_layout(textId);
    if (!rect || rect[3] <= 0) return;
    const [rx, ry, rw, rh] = rect;
    const text = node._data || node.textContent || '';
    const offset = __rvst_selection_state.anchorOffset || 0;
    // Estimate x from character offset proportionally
    let cx = rx;
    if (text.length > 0) {
        cx = rx + (offset / text.length) * rw;
    }
    __host.op_set_caret(ce.__rvst_id, cx, ry, rh);
}

globalThis.Selection.prototype = {
    get anchorNode() { return __rvst_selection_state.anchorNode; },
    get anchorOffset() { return __rvst_selection_state.anchorOffset; },
    get focusNode() { return __rvst_selection_state.focusNode; },
    get focusOffset() { return __rvst_selection_state.focusOffset; },
    get rangeCount() { return __rvst_selection_state.anchorNode ? 1 : 0; },
    get isCollapsed() {
        return __rvst_selection_state.anchorNode === __rvst_selection_state.focusNode &&
               __rvst_selection_state.anchorOffset === __rvst_selection_state.focusOffset;
    },
    getRangeAt(i) {
        if (i !== 0 || !__rvst_selection_state.anchorNode) return new globalThis.Range();
        const r = new globalThis.Range();
        r.setStart(__rvst_selection_state.anchorNode, __rvst_selection_state.anchorOffset);
        r.setEnd(__rvst_selection_state.focusNode, __rvst_selection_state.focusOffset);
        return r;
    },
    removeAllRanges() {
        __rvst_selection_state.anchorNode = null;
        __rvst_selection_state.anchorOffset = 0;
        __rvst_selection_state.focusNode = null;
        __rvst_selection_state.focusOffset = 0;
    },
    addRange(range) {
        __rvst_selection_state.anchorNode = range.startContainer;
        __rvst_selection_state.anchorOffset = range.startOffset;
        __rvst_selection_state.focusNode = range.endContainer;
        __rvst_selection_state.focusOffset = range.endOffset;
        __rvst_sync_caret();
    },
    collapse(node, offset) {
        __rvst_selection_state.anchorNode = node;
        __rvst_selection_state.anchorOffset = offset || 0;
        __rvst_selection_state.focusNode = node;
        __rvst_selection_state.focusOffset = offset || 0;
        __rvst_sync_caret();
    },
    extend(node, offset) {
        __rvst_selection_state.focusNode = node;
        __rvst_selection_state.focusOffset = offset || 0;
        __rvst_sync_caret();
    },
    selectAllChildren(node) {
        __rvst_selection_state.anchorNode = node;
        __rvst_selection_state.anchorOffset = 0;
        __rvst_selection_state.focusNode = node;
        __rvst_selection_state.focusOffset = node.childNodes ? node.childNodes.length : 0;
    },
    toString() {
        if (!__rvst_selection_state.anchorNode) return '';
        const text = __rvst_selection_state.anchorNode.nodeValue || __rvst_selection_state.anchorNode.textContent || '';
        return text.slice(__rvst_selection_state.anchorOffset, __rvst_selection_state.focusOffset);
    },
    get type() {
        if (!__rvst_selection_state.anchorNode) return 'None';
        return this.isCollapsed ? 'Caret' : 'Range';
    },
    deleteFromDocument() {},
    containsNode() { return false; },
    setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset) {
        __rvst_selection_state.anchorNode = anchorNode;
        __rvst_selection_state.anchorOffset = anchorOffset;
        __rvst_selection_state.focusNode = focusNode;
        __rvst_selection_state.focusOffset = focusOffset;
        __rvst_sync_caret();
    },
    modify(alter, direction, granularity) {
        const node = __rvst_selection_state.focusNode;
        if (!node) return;
        const text = node._data || node.textContent || '';
        let offset = __rvst_selection_state.focusOffset || 0;
        const forward = direction === 'forward' || direction === 'right';

        switch (granularity) {
            case 'character':
                offset = forward ? Math.min(offset + 1, text.length) : Math.max(offset - 1, 0);
                break;
            case 'word': {
                if (forward) {
                    let i = offset;
                    while (i < text.length && !/\s/.test(text[i])) i++;
                    while (i < text.length && /\s/.test(text[i])) i++;
                    offset = i;
                } else {
                    let i = offset;
                    while (i > 0 && /\s/.test(text[i - 1])) i--;
                    while (i > 0 && !/\s/.test(text[i - 1])) i--;
                    offset = i;
                }
                break;
            }
            case 'line':
            case 'lineboundary':
                offset = forward ? text.length : 0;
                break;
            case 'documentboundary':
                offset = forward ? text.length : 0;
                break;
        }

        __rvst_selection_state.focusNode = node;
        __rvst_selection_state.focusOffset = offset;
        if (alter === 'move') {
            __rvst_selection_state.anchorNode = node;
            __rvst_selection_state.anchorOffset = offset;
        }
        __rvst_sync_caret();
    },
};
globalThis.Range = globalThis.Range ?? function() {};
globalThis.Range.prototype = {
    startContainer: null, startOffset: 0,
    endContainer: null, endOffset: 0,
    collapsed: true,
    commonAncestorContainer: null,
    setStart(node, offset) {
        this.startContainer = node;
        this.startOffset = offset;
        this.commonAncestorContainer = node;
        this.collapsed = (this.startContainer === this.endContainer && this.startOffset === this.endOffset);
    },
    setEnd(node, offset) {
        this.endContainer = node;
        this.endOffset = offset;
        if (!this.commonAncestorContainer) this.commonAncestorContainer = node;
        this.collapsed = (this.startContainer === this.endContainer && this.startOffset === this.endOffset);
    },
    setStartBefore(node) { if (node.__parent) this.setStart(node.__parent, 0); },
    setStartAfter(node) { if (node.__parent) this.setStart(node.__parent, 1); },
    setEndBefore(node) { if (node.__parent) this.setEnd(node.__parent, 0); },
    setEndAfter(node) { if (node.__parent) this.setEnd(node.__parent, 1); },
    selectNode(node) {
        this.setStart(node.__parent || node, 0);
        this.setEnd(node.__parent || node, 1);
    },
    selectNodeContents(node) {
        const len = node.childNodes ? node.childNodes.length : (node._data || '').length;
        this.setStart(node, 0);
        this.setEnd(node, len);
    },
    collapse(toStart) {
        if (toStart) { this.endContainer = this.startContainer; this.endOffset = this.startOffset; }
        else { this.startContainer = this.endContainer; this.startOffset = this.endOffset; }
        this.collapsed = true;
    },
    cloneContents() { return document.createDocumentFragment(); },
    cloneRange() {
        const r = new globalThis.Range();
        r.startContainer = this.startContainer;
        r.startOffset = this.startOffset;
        r.endContainer = this.endContainer;
        r.endOffset = this.endOffset;
        r.collapsed = this.collapsed;
        r.commonAncestorContainer = this.commonAncestorContainer;
        return r;
    },
    getClientRects() {
        const node = this.startContainer;
        if (!node) return [];
        const startOff = this.startOffset || 0;
        const endNode = this.endContainer || node;
        const endOff = (endNode === node) ? (this.endOffset ?? (node._data || node.textContent || '').length) : (node._data || node.textContent || '').length;
        // Determine the rvst_id: text nodes use their own id, elements use theirs
        const targetId = node.__rvst_id || (node.__parent && node.__parent.__rvst_id);
        if (!targetId) return [];
        const rect = __host.op_get_layout(targetId);
        if (!rect || rect[2] === 0) return [];
        const [x, y, w, h] = rect;
        const text = node._data || node.textContent || '';
        const totalLen = text.length || 1;
        const charW = w / totalLen;
        const rx = x + startOff * charW;
        const rw = (endOff - startOff) * charW;
        return [{ x: rx, y: y, width: rw, height: h, top: y, left: rx, right: rx + rw, bottom: y + h }];
    },
    getBoundingClientRect() {
        const rects = this.getClientRects();
        if (rects.length === 0) return { x:0, y:0, width:0, height:0, top:0, left:0, right:0, bottom:0 };
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const r of rects) {
            if (r.x < minX) minX = r.x;
            if (r.y < minY) minY = r.y;
            if (r.x + r.width > maxX) maxX = r.x + r.width;
            if (r.y + r.height > maxY) maxY = r.y + r.height;
        }
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY, top: minY, left: minX, right: maxX, bottom: maxY };
    },
    detach() {},
    deleteContents() {
        const node = this.startContainer;
        if (!node) return;
        if (node === this.endContainer) {
            const text = node._data || node.textContent || '';
            const newText = text.slice(0, this.startOffset) + text.slice(this.endOffset);
            if (node._data !== undefined) node._data = newText;
            node.textContent = newText;
            this.collapse(true);
            const id = node.__rvst_id || (node.__parent && node.__parent.__rvst_id);
            if (id && typeof __host !== 'undefined') __host.op_set_text(id, newText);
        }
    },
    extractContents() {},
    insertNode(newNode) {
        const node = this.startContainer;
        if (!node) return;
        if (node._data !== undefined) {
            // Text node — split at offset
            const text = node._data;
            const before = text.slice(0, this.startOffset);
            const after = text.slice(this.startOffset);
            node._data = before;
            node.textContent = before;
            const parent = node.__parent || node.parentNode;
            if (parent && parent.childNodes) {
                const idx = parent.childNodes.indexOf(node);
                if (idx >= 0) {
                    parent.childNodes.splice(idx + 1, 0, newNode);
                    newNode.__parent = parent;
                    if (after) {
                        const afterNode = document.createTextNode(after);
                        parent.childNodes.splice(idx + 2, 0, afterNode);
                        afterNode.__parent = parent;
                    }
                }
            }
        } else {
            // Element node — insert at offset in childNodes
            const children = node.childNodes || [];
            children.splice(this.startOffset, 0, newNode);
            newNode.__parent = node;
        }
    },
    surroundContents(_n) {},
    toString() {
        const node = this.startContainer;
        if (!node) return '';
        const text = node._data || node.textContent || '';
        const endNode = this.endContainer || node;
        if (endNode === node) return text.slice(this.startOffset || 0, this.endOffset ?? text.length);
        return text.slice(this.startOffset || 0);
    },
};
const __rvst_selection = new globalThis.Selection();
globalThis.getSelection = function() { return __rvst_selection; };
globalThis.document.getSelection = function() { return __rvst_selection; };
globalThis.document.createRange = function() { return new globalThis.Range(); };

// Click-to-selection: update Selection state when a text element is clicked.
// targetEl — the DOM element that was clicked
// clientX  — horizontal cursor position (used to estimate character offset)
function __rvst_update_selection_from_click(targetEl, clientX) {
    if (!targetEl) return;
    // Find the best selection anchor: text node > first child element > the element itself.
    // For contenteditable editors (Lexical), an empty paragraph contains <br> — the correct
    // selection point is the <p> element at offset 0 (before the <br>), not the <br> itself.
    let anchorNode = null;
    let offset = 0;

    function findDeepest(el) {
        if (!el) return null;
        if (el.nodeType === 3) return el; // text node — ideal
        if (el.childNodes && el.childNodes.length > 0) {
            // Recurse into first child
            const found = findDeepest(el.childNodes[0]);
            if (found) return found;
        }
        return null;
    }

    const deepText = findDeepest(targetEl);
    if (deepText && deepText.nodeType === 3) {
        // Found a text node — set offset proportionally based on click position
        anchorNode = deepText;
        const text = deepText._data || '';
        if (typeof clientX === 'number' && text.length > 0) {
            const rvstId = deepText.__rvst_id || (deepText.__parent && deepText.__parent.__rvst_id);
            if (rvstId && typeof __host !== 'undefined' && __host.op_get_layout) {
                const rect = __host.op_get_layout(rvstId);
                if (rect && rect[2] > 0) {
                    const [x, _y, w, _h] = rect;
                    const relX = Math.max(0, Math.min(clientX - x, w));
                    offset = Math.round((relX / w) * text.length);
                    offset = Math.max(0, Math.min(offset, text.length));
                }
            }
        }
    } else if (targetEl.childNodes && targetEl.childNodes.length > 0) {
        // No text node found — use the first child element as anchor at offset 0.
        // For Lexical, this puts the cursor at <p> offset 0 (before <br>).
        anchorNode = targetEl.childNodes[0];
        offset = 0;
    } else {
        anchorNode = targetEl;
        offset = 0;
    }

    __rvst_selection_state.anchorNode = anchorNode;
    __rvst_selection_state.anchorOffset = offset;
    __rvst_selection_state.focusNode = anchorNode;
    __rvst_selection_state.focusOffset = offset;
    __rvst_sync_caret();
}
globalThis.__rvst_update_selection_from_click = __rvst_update_selection_from_click;

// Contenteditable fallback: perform DOM mutation when beforeinput is not prevented.
// Called from Rust shell when a contenteditable element receives keyboard input
// and the beforeinput event was NOT preventDefault()'d.
function __rvst_apply_contenteditable_input(elId, inputType, data) {
    const el = __rvst_elements.get(elId);
    if (!el) return;
    const sel = __rvst_selection;
    const node = sel.focusNode;
    if (!node) return;
    const offset = sel.focusOffset || 0;
    const text = node._data || '';

    switch (inputType) {
        case 'insertText':
            if (data) {
                node._data = text.slice(0, offset) + data + text.slice(offset);
                node.textContent = node._data;
                sel.collapse(node, offset + data.length);
            }
            break;
        case 'insertParagraph':
        case 'insertLineBreak':
            node._data = text.slice(0, offset) + '\n' + text.slice(offset);
            node.textContent = node._data;
            sel.collapse(node, offset + 1);
            break;
        case 'deleteContentBackward':
            if (offset > 0) {
                node._data = text.slice(0, offset - 1) + text.slice(offset);
                node.textContent = node._data;
                sel.collapse(node, offset - 1);
            }
            break;
        case 'deleteContentForward':
            if (offset < text.length) {
                node._data = text.slice(0, offset) + text.slice(offset + 1);
                node.textContent = node._data;
                sel.collapse(node, offset);
            }
            break;
        case 'deleteWordBackward': {
            let i = offset;
            while (i > 0 && /\s/.test(text[i - 1])) i--;
            while (i > 0 && !/\s/.test(text[i - 1])) i--;
            node._data = text.slice(0, i) + text.slice(offset);
            node.textContent = node._data;
            sel.collapse(node, i);
            break;
        }
        case 'deleteWordForward': {
            let i = offset;
            while (i < text.length && !/\s/.test(text[i])) i++;
            while (i < text.length && /\s/.test(text[i])) i++;
            node._data = text.slice(0, offset) + text.slice(i);
            node.textContent = node._data;
            sel.collapse(node, offset);
            break;
        }
        case 'deleteSoftLineBackward':
            node._data = text.slice(offset);
            node.textContent = node._data;
            sel.collapse(node, 0);
            break;
        case 'deleteSoftLineForward':
            node._data = text.slice(0, offset);
            node.textContent = node._data;
            sel.collapse(node, offset);
            break;
    }
    // Push the text change to the Rust tree
    const targetId = node.__rvst_id || (node.__parent && node.__parent.__rvst_id);
    if (targetId) {
        __host.op_set_text(targetId, node._data || '');
    }
}

// Promise is available in QuickJS; expose it on globalThis if not already
globalThis.Promise = globalThis.Promise ?? Promise;
// Pre-init Svelte's internal UID namespace (template.js uses window.__svelte.uid)
if (!globalThis.__svelte) globalThis.__svelte = {};
if (!globalThis.__svelte.uid) globalThis.__svelte.uid = new Map();

// performance.now() — returns synthetic clock aligned with rAF timestamps
if (!globalThis.performance) {
    globalThis.performance = { now() { return __rvst_raf_time; } };
}

// localStorage stub — Svelte writable stores may try to persist via localStorage
if (!globalThis.localStorage) {
    const _store = new Map();
    globalThis.localStorage = {
        getItem(k) { return _store.has(k) ? _store.get(k) : null; },
        setItem(k, v) { _store.set(k, String(v)); },
        removeItem(k) { _store.delete(k); },
        clear() { _store.clear(); },
        get length() { return _store.size; },
        key(i) { return [..._store.keys()][i] ?? null; },
    };
}

// sessionStorage stub (mirrors localStorage)
if (!globalThis.sessionStorage) {
    const _ss = new Map();
    globalThis.sessionStorage = {
        getItem(k) { return _ss.has(k) ? _ss.get(k) : null; },
        setItem(k, v) { _ss.set(k, String(v)); },
        removeItem(k) { _ss.delete(k); },
        clear() { _ss.clear(); },
        get length() { return _ss.size; },
        key(i) { return [..._ss.keys()][i] ?? null; },
    };
}

// window.location stub — SvelteKit router reads this
if (!globalThis.location) {
    globalThis.location = {
        href: 'http://localhost/',
        origin: 'http://localhost',
        protocol: 'http:',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        pathname: '/',
        search: '',
        hash: '',
        toString() { return this.href; },
        assign(url) { __rvst_navigate(url); },
        replace(url) { __rvst_navigate(url); },
        reload() {},
    };
}

// Helper: update location properties from a URL string
function __rvst_update_location(url) {
    if (!url) return;
    const s = String(url);
    const loc = globalThis.location;
    if (s.startsWith('/') || s.startsWith('?') || s.startsWith('#')) {
        // Relative URL — parse path/search/hash
        const u = new globalThis.URL(s, loc.origin);
        loc.pathname = u.pathname;
        loc.search = u.search;
        loc.hash = u.hash;
        loc.href = loc.origin + loc.pathname + loc.search + loc.hash;
    } else if (s.startsWith('http://') || s.startsWith('https://')) {
        const u = new globalThis.URL(s);
        loc.protocol = u.protocol;
        loc.hostname = u.hostname;
        loc.port = u.port;
        loc.host = u.host;
        loc.origin = u.origin;
        loc.pathname = u.pathname;
        loc.search = u.search;
        loc.hash = u.hash;
        loc.href = u.href;
    }
}

// Helper: dispatch popstate event to window listeners
function __rvst_dispatch_popstate(state) {
    const event = { type: 'popstate', state, bubbles: false, cancelable: false,
                    preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} };
    for (const h of (_win_handlers['popstate'] ?? [])) {
        try { h(event); } catch(e) { console.error('popstate handler error', e); }
    }
}

// Helper: navigate (for location.assign / location.replace)
function __rvst_navigate(url) {
    __rvst_update_location(url);
    globalThis.history.replaceState(null, '', url);
}

// history stub with full stack
if (!globalThis.history) {
    const _stack = [{ state: null, url: '/' }];
    let _index = 0;
    globalThis.history = {
        get length() { return _stack.length; },
        get state() { return _stack[_index]?.state ?? null; },
        pushState(state, _title, url) {
            // Truncate forward entries
            _stack.length = _index + 1;
            if (url != null) __rvst_update_location(url);
            _stack.push({ state, url: String(url ?? globalThis.location.pathname) });
            _index = _stack.length - 1;
        },
        replaceState(state, _title, url) {
            if (url != null) __rvst_update_location(url);
            _stack[_index] = { state, url: String(url ?? globalThis.location.pathname) };
        },
        back() { this.go(-1); },
        forward() { this.go(1); },
        go(n) {
            const newIndex = _index + (n || 0);
            if (newIndex < 0 || newIndex >= _stack.length) return;
            _index = newIndex;
            const entry = _stack[_index];
            __rvst_update_location(entry.url);
            // Dispatch popstate asynchronously (matches browser behavior)
            Promise.resolve().then(() => __rvst_dispatch_popstate(entry.state));
        },
    };
}

// screen stub
if (!globalThis.screen) {
    globalThis.screen = { width: 1280, height: 800, availWidth: 1280, availHeight: 800,
                          colorDepth: 24, pixelDepth: 24 };
}

// matchMedia — parse common media queries with real results
if (!globalThis.matchMedia) {
    globalThis.matchMedia = function(query) {
        let matches = false;
        const q = (query || '').trim().toLowerCase();
        if (q.includes('prefers-color-scheme: dark') || q.includes('prefers-color-scheme:dark')) matches = true;
        if (q.includes('prefers-reduced-motion')) matches = false;
        const minW = q.match(/min-width:\s*(\d+)px/);
        if (minW) matches = (globalThis.__rvst_viewport_w || 1024) >= parseInt(minW[1]);
        const maxW = q.match(/max-width:\s*(\d+)px/);
        if (maxW) matches = (globalThis.__rvst_viewport_w || 1024) <= parseInt(maxW[1]);
        const listeners = [];
        return {
            matches, media: query,
            addEventListener(ev, fn) { listeners.push(fn); },
            removeEventListener(ev, fn) { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); },
            addListener(fn) { listeners.push(fn); },
            removeListener(fn) { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); },
            onchange: null,
            dispatchEvent() { return true; },
        };
    };
}

// NodeFilter constants for createTreeWalker
globalThis.NodeFilter = globalThis.NodeFilter ?? {
    FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3,
    SHOW_ALL: 0xFFFFFFFF, SHOW_ELEMENT: 1, SHOW_TEXT: 4,
};

// document.title — used by <svelte:head><title>...</title></svelte:head>
let __rvst_title = '';
Object.defineProperty(globalThis.document, 'title', {
    get() { return __rvst_title; },
    set(v) { __rvst_title = String(v); },
    configurable: true,
});

// requestIdleCallback / cancelIdleCallback
globalThis.requestIdleCallback = globalThis.requestIdleCallback ?? function(cb, _opts) {
    return setTimeout(() => cb({ didTimeout: false, timeRemaining() { return 50; } }), 1);
};
globalThis.cancelIdleCallback = globalThis.cancelIdleCallback ?? function(id) { clearTimeout(id); };

// window.alert / confirm / prompt — no-ops in headless rendering
globalThis.alert = function(_msg) {};
globalThis.confirm = function(_msg) { return false; };
globalThis.prompt = function(_msg, _def) { return null; };
globalThis.open = function() { return null; };
globalThis.close = function() {};
globalThis.print = function() {};

// UI Event subclasses — QuickJS does not include browser UI events
// Base helper: extend a plain Event object with extra properties
function __rvst_ui_event(type, opts, extra) {
    const base = {
        type: String(type),
        bubbles: opts?.bubbles ?? false,
        cancelable: opts?.cancelable ?? false,
        composed: opts?.composed ?? false,
        defaultPrevented: false,
        eventPhase: 3,
        isTrusted: false,
        timeStamp: Date.now(),
        target: null,
        currentTarget: null,
        preventDefault() { this.defaultPrevented = true; },
        stopPropagation() {},
        stopImmediatePropagation() {},
        composedPath() { return []; },
    };
    return Object.assign(base, extra);
}
globalThis.MouseEvent = globalThis.MouseEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        clientX: opts?.clientX ?? 0, clientY: opts?.clientY ?? 0,
        screenX: opts?.screenX ?? 0, screenY: opts?.screenY ?? 0,
        pageX: opts?.pageX ?? 0, pageY: opts?.pageY ?? 0,
        offsetX: opts?.offsetX ?? 0, offsetY: opts?.offsetY ?? 0,
        movementX: opts?.movementX ?? 0, movementY: opts?.movementY ?? 0,
        button: opts?.button ?? 0, buttons: opts?.buttons ?? 0,
        ctrlKey: opts?.ctrlKey ?? false, shiftKey: opts?.shiftKey ?? false,
        altKey: opts?.altKey ?? false, metaKey: opts?.metaKey ?? false,
        relatedTarget: opts?.relatedTarget ?? null,
        getModifierState(_k) { return false; },
    });
};
globalThis.KeyboardEvent = globalThis.KeyboardEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        key: opts?.key ?? '', code: opts?.code ?? '',
        keyCode: opts?.keyCode ?? 0, charCode: opts?.charCode ?? 0, which: opts?.which ?? 0,
        ctrlKey: opts?.ctrlKey ?? false, shiftKey: opts?.shiftKey ?? false,
        altKey: opts?.altKey ?? false, metaKey: opts?.metaKey ?? false,
        repeat: opts?.repeat ?? false, isComposing: opts?.isComposing ?? false,
        location: opts?.location ?? 0,
        getModifierState(_k) { return false; },
    });
};
globalThis.InputEvent = globalThis.InputEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        data: opts?.data ?? null,
        inputType: opts?.inputType ?? '',
        isComposing: opts?.isComposing ?? false,
        dataTransfer: null,
        getTargetRanges() { return []; },
    });
};
globalThis.PointerEvent = globalThis.PointerEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        pointerId: opts?.pointerId ?? 1, pointerType: opts?.pointerType ?? 'mouse',
        width: opts?.width ?? 1, height: opts?.height ?? 1,
        pressure: opts?.pressure ?? 0, tiltX: opts?.tiltX ?? 0, tiltY: opts?.tiltY ?? 0,
        isPrimary: opts?.isPrimary ?? true,
        clientX: opts?.clientX ?? 0, clientY: opts?.clientY ?? 0,
        button: opts?.button ?? 0, buttons: opts?.buttons ?? 0,
        getCoalescedEvents() { return []; }, getPredictedEvents() { return []; },
    });
};
globalThis.FocusEvent = globalThis.FocusEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, { relatedTarget: opts?.relatedTarget ?? null });
};
globalThis.WheelEvent = globalThis.WheelEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        deltaX: opts?.deltaX ?? 0, deltaY: opts?.deltaY ?? 0, deltaZ: opts?.deltaZ ?? 0,
        deltaMode: opts?.deltaMode ?? 0,
        clientX: opts?.clientX ?? 0, clientY: opts?.clientY ?? 0,
    });
};
globalThis.TouchEvent = globalThis.TouchEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        touches: opts?.touches ?? [], changedTouches: [], targetTouches: [],
    });
};
globalThis.DragEvent = globalThis.DragEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        dataTransfer: opts?.dataTransfer ?? null,
        clientX: opts?.clientX ?? 0, clientY: opts?.clientY ?? 0,
    });
};
globalThis.CompositionEvent = globalThis.CompositionEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, { data: opts?.data ?? '' });
};
globalThis.ClipboardEvent = globalThis.ClipboardEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, { clipboardData: opts?.clipboardData ?? null });
};
globalThis.TransitionEvent = globalThis.TransitionEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        propertyName: opts?.propertyName ?? '', elapsedTime: opts?.elapsedTime ?? 0,
        pseudoElement: opts?.pseudoElement ?? '',
    });
};
globalThis.AnimationEvent = globalThis.AnimationEvent ?? function(type, opts) {
    return __rvst_ui_event(type, opts, {
        animationName: opts?.animationName ?? '', elapsedTime: opts?.elapsedTime ?? 0,
        pseudoElement: opts?.pseudoElement ?? '',
    });
};

// __rvst_dispatch_pointer — called from Rust to dispatch pointer events on the
// correct target element. Drag libraries (svelte-dnd-action, @neodrag/svelte)
// require pointer events alongside mouse events.
// General event dispatcher — handles pointer, mouse, keyboard, and other events.
// Dispatches via per-element listeners AND Svelte 5 delegation (Symbol(events) walk).
globalThis.__rvst_dispatch_pointer = function(type, targetNodeId, clientX, clientY, extraOpts) {
    const el = __rvst_elements.get(targetNodeId);
    if (!el) return;
    let evt;
    if (type.startsWith('key')) {
        // Keyboard event — extraOpts has key, code, modifiers
        const o = extraOpts || {};
        console.log('[dispatch] key event type=' + type + ' key=' + (o.key||'?') + ' target=' + targetNodeId + ' listeners=' + JSON.stringify(Object.keys(el.__rvst_listeners || {})));
        evt = new KeyboardEvent(type, {
            key: o.key || '', code: o.code || o.key || '',
            bubbles: true, cancelable: true, composed: true,
            ctrlKey: o.ctrlKey || false, shiftKey: o.shiftKey || false,
            altKey: o.altKey || false, metaKey: o.metaKey || false,
            repeat: o.repeat || false,
        });
    } else if (type.startsWith('mouse')) {
        evt = new MouseEvent(type, {
            bubbles: true, cancelable: true, composed: true,
            clientX, clientY, pageX: clientX, pageY: clientY,
            screenX: clientX, screenY: clientY,
            button: 0, buttons: 1,
        });
    } else {
        evt = new PointerEvent(type, {
            bubbles: true, cancelable: true, composed: true,
            clientX, clientY, pageX: clientX, pageY: clientY,
            screenX: clientX, screenY: clientY,
            pointerId: 1, pointerType: 'mouse', isPrimary: true,
            button: 0, buttons: 1, width: 1, height: 1, pressure: 0.5,
        });
    }
    // Build composedPath from target up through parents
    const path = [];
    let cur = el;
    while (cur) { path.push(cur); cur = cur.parentNode; }
    if (path.length > 0 && path[path.length - 1] !== document.body) path.push(document.body);
    evt.composedPath = function() { return path; };
    evt.target = el;
    evt.currentTarget = el;
    // Dispatch via element's dispatchEvent (bubbles through __rvst_listeners)
    if (el.dispatchEvent) {
        el.dispatchEvent(evt);
    }
    // Also fire Svelte 5 delegated handlers if any are registered for this event type
    const svelteEventsSym = (() => {
        for (const candidate of __rvst_elements.values()) {
            const syms = Object.getOwnPropertySymbols(candidate);
            for (const sym of syms) {
                if (sym.toString() === 'Symbol(events)') return sym;
            }
        }
        return null;
    })();
    if (svelteEventsSym) {
        // Walk composedPath looking for delegated handler
        for (const node of path) {
            const events = node[svelteEventsSym];
            if (events && events[type]) {
                const handler = events[type];
                if (typeof handler === 'function') handler.call(node, evt);
                else if (handler && typeof handler.handleEvent === 'function') handler.handleEvent(evt);
                break;
            }
        }
    }
};

// IntersectionObserver — fire callbacks when elements enter/exit viewport
globalThis.IntersectionObserver = globalThis.IntersectionObserver ?? function(callback, options) {
    const observed = new Map();
    const threshold = options?.threshold ?? 0;
    function check() {
        const entries = [];
        const vpW = globalThis.__rvst_viewport_w || 1024;
        const vpH = globalThis.__rvst_viewport_h || 768;
        for (const [el, prev] of observed) {
            const rect = __host.op_get_layout(el.__rvst_id);
            if (!rect) continue;
            const [x, y, w, h] = rect;
            const intersects = x < vpW && x + w > 0 && y < vpH && y + h > 0;
            const area = w * h || 1;
            const ratio = intersects ? Math.min(1, (Math.min(x+w,vpW)-Math.max(x,0)) * (Math.min(y+h,vpH)-Math.max(y,0)) / area) : 0;
            const isIntersecting = ratio > (Array.isArray(threshold) ? threshold[0] : threshold);
            if (isIntersecting !== prev.isIntersecting) {
                prev.isIntersecting = isIntersecting;
                entries.push({
                    target: el, isIntersecting, intersectionRatio: ratio,
                    boundingClientRect: { x, y, width: w, height: h, top: y, left: x, right: x+w, bottom: y+h },
                    intersectionRect: isIntersecting ? { x: Math.max(x,0), y: Math.max(y,0), width: Math.min(x+w,vpW)-Math.max(x,0), height: Math.min(y+h,vpH)-Math.max(y,0) } : { x:0,y:0,width:0,height:0 },
                    rootBounds: { x:0, y:0, width:vpW, height:vpH, top:0, left:0, right:vpW, bottom:vpH },
                    time: Date.now(),
                });
            }
        }
        if (entries.length > 0) try { callback(entries, self); } catch(e) {}
    }
    const self = {
        observe(el) {
            if (!el || !el.__rvst_id) return;
            observed.set(el, { isIntersecting: false });
            if (!globalThis.__rvst_intersection_observers) globalThis.__rvst_intersection_observers = [];
            if (!globalThis.__rvst_intersection_observers.includes(check)) globalThis.__rvst_intersection_observers.push(check);
            requestAnimationFrame(() => check());
        },
        unobserve(el) { observed.delete(el); },
        disconnect() {
            observed.clear();
            const idx = globalThis.__rvst_intersection_observers?.indexOf(check) ?? -1;
            if (idx >= 0) globalThis.__rvst_intersection_observers.splice(idx, 1);
        },
        takeRecords() { return []; },
    };
    return self;
};

// structuredClone — used by Svelte stores for deep cloning state
globalThis.structuredClone = globalThis.structuredClone ?? function(val) {
    return JSON.parse(JSON.stringify(val));
};

// FormData — stub for form submission handling
globalThis.FormData = globalThis.FormData ?? function(form) {
    const _data = new Map();
    return {
        append(k, v) { _data.set(k, v); },
        set(k, v) { _data.set(k, v); },
        get(k) { return _data.get(k) ?? null; },
        getAll(k) { const v = _data.get(k); return v != null ? [v] : []; },
        has(k) { return _data.has(k); },
        delete(k) { _data.delete(k); },
        entries() { return _data.entries(); },
        keys() { return _data.keys(); },
        values() { return _data.values(); },
        forEach(cb) { _data.forEach(cb); },
    };
};

// CSSStyleSheet stub — CodeMirror and other libraries inject CSS via
// adoptedStyleSheets + CSSStyleSheet.insertRule. Capture the CSS rules
// and feed them to RVST's CSS engine via __rvst_parse_css.
globalThis.CSSStyleSheet = globalThis.CSSStyleSheet ?? function() {
    const rules = [];
    return {
        rules,
        cssRules: rules,
        insertRule(rule, index) {
            rules.splice(index ?? rules.length, 0, { cssText: rule });
            // Feed to RVST's CSS engine
            __rvst_parse_css(rule);
            return index ?? rules.length - 1;
        },
        deleteRule(_index) {},
        replaceSync(css) {
            rules.length = 0;
            if (css) __rvst_parse_css(css);
        },
        replace(css) {
            rules.length = 0;
            if (css) __rvst_parse_css(css);
            return Promise.resolve(this);
        },
    };
};
if (!globalThis.document.adoptedStyleSheets) {
    let _adopted = [];
    Object.defineProperty(globalThis.document, 'adoptedStyleSheets', {
        get() { return _adopted; },
        set(v) { _adopted = Array.isArray(v) ? v : []; },
        configurable: true,
    });
}

// WeakRef — used by some Svelte 5 internals for tracking
globalThis.WeakRef = globalThis.WeakRef ?? function(target) {
    return { deref() { return target; } };
};

// FinalizationRegistry — no-op stub
globalThis.FinalizationRegistry = globalThis.FinalizationRegistry ?? function(_cb) {
    return { register() {}, unregister() {} };
};

// Timer stubs — backed by Rust op_set_interval / op_set_timeout / op_clear_timer.
// The shell polls check_and_drain_timers() in about_to_wait and calls dispatch_timer
// for each fired handler_id. The id returned from setInterval IS the handler_id.
globalThis.setInterval = function(fn, ms) {
    const id = __rvst_handler_next_id++;
    __rvst_handlers.set(id, fn);
    __host.op_set_interval(id, ms ?? 0);
    return id;
};
globalThis.clearInterval = function(id) {
    if (id === null || id === undefined) return;
    __rvst_handlers.delete(id);
    __host.op_clear_timer(id);
};
globalThis.setTimeout = function(fn, ms) {
    const id = __rvst_handler_next_id++;
    __rvst_handlers.set(id, fn);
    __host.op_set_timeout(id, ms ?? 0);
    return id;
};
globalThis.clearTimeout = function(id) {
    if (id === null || id === undefined) return;
    __rvst_handlers.delete(id);
    __host.op_clear_timer(id);
};

// document.documentElement — Svelte 5 uses this to set theme classes on <html>
if (!globalThis.document.documentElement) {
    const _html_el = {
        __rvst_id: 0,
        nodeName: 'HTML',
        nodeType: 1,
        tagName: 'HTML',
        classList: {
            _set: new Set(),
            add(...cls) { for (const c of cls) this._set.add(c); },
            remove(...cls) { for (const c of cls) this._set.delete(c); },
            toggle(c, force) {
                if (force === true) this._set.add(c);
                else if (force === false) this._set.delete(c);
                else if (this._set.has(c)) this._set.delete(c); else this._set.add(c);
                return this._set.has(c);
            },
            contains(c) { return this._set.has(c); },
            replace(a, b) { this._set.delete(a); this._set.add(b); return true; },
        },
        scrollHeight: 0,
        clientHeight: 768,
        clientWidth: 1024,
        style: { setProperty(_k, _v) {}, removeProperty(_k) {}, getPropertyValue(_k) { return ''; } },
        getAttribute(_k) { return null; },
        setAttribute(_k, _v) {},
        removeAttribute(_k) {},
        hasAttribute(_k) { return false; },
        getBoundingClientRect() { return { x:0,y:0,width:1024,height:768,top:0,left:0,right:1024,bottom:768 }; },
        dataset: new Proxy({}, { get() { return undefined; }, set() { return true; } }),
    };
    Object.defineProperty(globalThis.document, 'documentElement', {
        get() { return _html_el; }, configurable: true,
    });
}

// window.CSS — CSS.supports() used by Svelte and UI libraries
if (!globalThis.CSS) {
    globalThis.CSS = {
        supports(_prop, _val) { return false; },
        escape(s) { return s.replace(/[^\w-]/g, c => '\\' + c); },
    };
}

// body.style — Svelte occasionally sets body styles directly
if (!globalThis.document.body.style) {
    Object.defineProperty(globalThis.document.body, 'style', {
        value: {
            _map: new Map(),
            setProperty(k, v) { this._map.set(k, v); },
            removeProperty(k) { this._map.delete(k); },
            getPropertyValue(k) { return this._map.get(k) ?? ''; },
        },
        configurable: true,
        writable: true,
    });
}

// AbortController / AbortSignal — used by Svelte 5 for cleanup of fetch/effects
if (!globalThis.AbortController) {
    globalThis.AbortSignal = function() {
        this.aborted = false;
        this.reason = undefined;
        this._listeners = [];
        this.addEventListener = (_, fn) => this._listeners.push(fn);
        this.removeEventListener = () => {};
        this.throwIfAborted = () => { if (this.aborted) throw new Error('AbortError'); };
    };
    globalThis.AbortController = function() {
        this.signal = new globalThis.AbortSignal();
        this.abort = (reason) => {
            this.signal.aborted = true;
            this.signal.reason = reason;
            this.signal._listeners.forEach(fn => fn());
        };
    };
}

// fetch() — HTTP requests via native Rust op (ureq)
if (!globalThis.fetch || typeof globalThis.fetch !== 'function') {
    globalThis.fetch = function(url, options) {
        const urlStr = typeof url === 'string' ? url : url?.href ?? String(url);
        return Promise.resolve().then(() => {
            const raw = __host.op_fetch(urlStr);
            const data = JSON.parse(raw);
            return {
                ok: data.ok,
                status: data.status,
                statusText: data.ok ? 'OK' : 'Error',
                headers: new Map(),
                url: urlStr,
                text() { return Promise.resolve(data.body); },
                json() { return Promise.resolve(JSON.parse(data.body)); },
                blob() { return Promise.resolve(new Blob([data.body])); },
                arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); },
                clone() { return this; },
            };
        });
    };
    // Headers stub
    if (!globalThis.Headers) {
        globalThis.Headers = function(init) { this._m = new Map(); };
        globalThis.Headers.prototype.get = function(k) { return this._m.get(k.toLowerCase()); };
        globalThis.Headers.prototype.set = function(k,v) { this._m.set(k.toLowerCase(), v); };
    }
    // Response stub
    if (!globalThis.Response) {
        globalThis.Response = function(body, init) { this.body = body; this.status = init?.status ?? 200; };
        globalThis.Response.prototype.text = function() { return Promise.resolve(String(this.body ?? '')); };
        globalThis.Response.prototype.json = function() { return Promise.resolve(JSON.parse(String(this.body ?? '{}'))); };
    }
}

// crypto.randomUUID — used by Svelte for unique IDs
// but may not have randomUUID in older versions
if (!globalThis.crypto) {
    let _uid = 0;
    globalThis.crypto = {
        randomUUID() {
            // Deterministic stub — good enough for non-cryptographic ID uses
            _uid++;
            return `00000000-0000-4000-8000-${String(_uid).padStart(12, '0')}`;
        },
        getRandomValues(arr) {
            for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
            return arr;
        },
    };
} else if (!globalThis.crypto.randomUUID) {
    let _uid = 0;
    globalThis.crypto.randomUUID = function() {
        _uid++;
        return `00000000-0000-4000-8000-${String(_uid).padStart(12, '0')}`;
    };
}

// ─── atob / btoa ─────────────────────────────────────────────────────────────
// Base64 encoding/decoding — used by js-base64, many auth/encoding libraries
if (typeof globalThis.btoa === 'undefined') {
    const _chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    globalThis.btoa = function(str) {
        let out = '';
        for (let i = 0; i < str.length; i += 3) {
            const a = str.charCodeAt(i), b = str.charCodeAt(i+1), c = str.charCodeAt(i+2);
            const n = (a << 16) | ((b || 0) << 8) | (c || 0);
            out += _chars[(n >> 18) & 63] + _chars[(n >> 12) & 63];
            out += i+1 < str.length ? _chars[(n >> 6) & 63] : '=';
            out += i+2 < str.length ? _chars[n & 63] : '=';
        }
        return out;
    };
    globalThis.atob = function(str) {
        str = str.replace(/=+$/, '');
        let out = '';
        for (let i = 0; i < str.length; i += 4) {
            const a = _chars.indexOf(str[i]), b = _chars.indexOf(str[i+1]);
            const c = _chars.indexOf(str[i+2]), d = _chars.indexOf(str[i+3]);
            const n = (a << 18) | (b << 12) | ((c >= 0 ? c : 0) << 6) | (d >= 0 ? d : 0);
            out += String.fromCharCode((n >> 16) & 255);
            if (c >= 0) out += String.fromCharCode((n >> 8) & 255);
            if (d >= 0) out += String.fromCharCode(n & 255);
        }
        return out;
    };
}

// ─── TextEncoder / TextDecoder ───────────────────────────────────────────────
// UTF-8 string↔bytes — used by GraphQL, binary serializers, encoding libraries
if (typeof globalThis.TextEncoder === 'undefined') {
    globalThis.TextEncoder = class TextEncoder {
        get encoding() { return 'utf-8'; }
        encode(str) {
            const buf = [];
            for (let i = 0; i < str.length; i++) {
                let c = str.charCodeAt(i);
                if (c < 0x80) buf.push(c);
                else if (c < 0x800) { buf.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
                else if (c >= 0xd800 && c < 0xdc00 && i+1 < str.length) {
                    const lo = str.charCodeAt(++i);
                    c = 0x10000 + ((c - 0xd800) << 10) + (lo - 0xdc00);
                    buf.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
                } else { buf.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
            }
            return new Uint8Array(buf);
        }
        encodeInto(str, dest) {
            const encoded = this.encode(str);
            dest.set(encoded.subarray(0, dest.length));
            return { read: str.length, written: Math.min(encoded.length, dest.length) };
        }
    };
    globalThis.TextDecoder = class TextDecoder {
        constructor(label = 'utf-8') { this._label = label; }
        get encoding() { return this._label; }
        decode(buf) {
            if (!buf || buf.length === 0) return '';
            const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf.buffer || buf);
            let out = '', i = 0;
            while (i < bytes.length) {
                const b = bytes[i];
                if (b < 0x80) { out += String.fromCharCode(b); i++; }
                else if ((b & 0xe0) === 0xc0) { out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i+1] & 0x3f)); i += 2; }
                else if ((b & 0xf0) === 0xe0) { out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i+1] & 0x3f) << 6) | (bytes[i+2] & 0x3f)); i += 3; }
                else if ((b & 0xf8) === 0xf0) {
                    const cp = ((b & 0x07) << 18) | ((bytes[i+1] & 0x3f) << 12) | ((bytes[i+2] & 0x3f) << 6) | (bytes[i+3] & 0x3f);
                    out += String.fromCodePoint(cp); i += 4;
                } else { out += '\ufffd'; i++; }
            }
            return out;
        }
    };
}

// ─── DOMParser stub ──────────────────────────────────────────────────────────
if (typeof globalThis.DOMParser === 'undefined') {
    globalThis.DOMParser = class DOMParser {
        parseFromString(str, type) {
            // Return a minimal document-like object
            const doc = { documentElement: null, body: null, querySelector() { return null; }, querySelectorAll() { return []; } };
            return doc;
        }
    };
}

// ── Pub/Sub: reactive push from Rust → JS ──────────────────────────
// Channels are strings. Rust pushes events via push_event(); the event loop
// calls __rvst_deliver_events() each tick to fan them out to JS subscribers.
const __rvst_subscriptions = new Map(); // channel -> Set<callback>

globalThis.__rvst_subscribe = function(channel, callback) {
  if (!__rvst_subscriptions.has(channel)) {
    __rvst_subscriptions.set(channel, new Set());
  }
  __rvst_subscriptions.get(channel).add(callback);
  return function unsubscribe() {
    var subs = __rvst_subscriptions.get(channel);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) __rvst_subscriptions.delete(channel);
    }
  };
};

// Called by the event loop to deliver pending push events from Rust.
globalThis.__rvst_deliver_events = function() {
  var raw = __host.drain_push_events();
  if (!raw || raw === '[]') return;
  var events = JSON.parse(raw);
  for (var i = 0; i < events.length; i++) {
    var channel = events[i][0];
    var data = events[i][1];
    var subs = __rvst_subscriptions.get(channel);
    if (subs) {
      subs.forEach(function(cb) {
        try { cb(data); } catch(e) { console.error('subscription error:', e); }
      });
    }
  }
};

// ── Signal Graph Observation API ───────────────────────────────────────────
// Phase 1: track signal creation, effect execution, and DOM op dependencies.
// These hooks are called from the renderer bridge or a future Svelte compiler
// plugin to build the Rust-side signal graph mirror.
//
// Phase 2 (future): for stable-graph components, signal writes will be
// intercepted in Rust to replay DOM ops directly — zero JS re-entry.

globalThis.__rvst_signal_graph = {
    // Track creation of a Svelte $.state() signal.
    // Returns the Rust-assigned signal ID (u64 as number).
    trackSignal(initialJson) {
        return __host.op_track_signal(initialJson);
    },

    // Mark the start of an effect execution.
    // Returns the Rust-assigned effect ID.
    beginEffect() {
        return __host.op_track_effect_start();
    },

    // Record that the currently-executing effect reads a signal.
    trackRead(signalId) {
        __host.op_track_signal_read(signalId);
    },

    // Record that the currently-executing effect produces a DOM op.
    // opType: "set_text" | "set_attr" | "set_style"
    // nodeId: the rvst node ID (u32)
    // signalId: which signal's value is being written
    // key: attribute/style key (empty string for set_text)
    trackDomOp(opType, nodeId, signalId, key) {
        __host.op_track_dom_op(opType, nodeId, signalId, key || '');
    },

    // Mark the end of an effect execution.
    endEffect() {
        __host.op_track_effect_end();
    },

    // After mount: freeze the graph and check stability.
    // Returns true if all effects have consistent dependency sets.
    checkStability() {
        return __host.op_signal_graph_check_stability() === 1;
    },

    // Get observation stats: { signals, effects, stable, ops }
    stats() {
        return JSON.parse(__host.op_signal_graph_stats());
    },

    // Reset the graph for a fresh mount cycle.
    reset() {
        __host.op_signal_graph_reset();
    },
};

// Wrap the raw Rust ops so they accept element objects OR raw u32 ids.
// The Svelte bridge calls ops like op_set_text(elementObject, text),
// but the Rust ops expect (u32_id, string). We normalize here.
(function() {
    const raw = __host;
    function toId(v) {
        if (v === null || v === undefined) return 0;
        if (typeof v === 'number') return v;
        return v.__rvst_id ?? 0;
    }
    const _op_set_text = raw.op_set_text.bind(raw);
    const _op_set_attr = raw.op_set_attr.bind(raw);
    const _op_set_style = raw.op_set_style.bind(raw);
    const _op_insert  = raw.op_insert.bind(raw);
    const _op_remove  = raw.op_remove.bind(raw);
    const _op_listen  = raw.op_listen.bind(raw);
    const _op_unlisten = raw.op_unlisten.bind(raw);
    raw.op_set_text  = (el, v)         => _op_set_text(toId(el), String(v));
    raw.op_set_attr  = (el, k, v)      => _op_set_attr(toId(el), String(k), String(v));
    raw.op_set_style = (id, k, v)      => _op_set_style(id, String(k), String(v));
    raw.op_insert    = (p, c, a)       => _op_insert(toId(p), toId(c), toId(a));
    raw.op_remove    = (el)            => _op_remove(toId(el));
    raw.op_listen    = (el, ev, hid)   => _op_listen(toId(el), String(ev), hid ?? 0);
    raw.op_unlisten  = (el, ev, hid)   => _op_unlisten(toId(el), String(ev), hid ?? 0);
})();

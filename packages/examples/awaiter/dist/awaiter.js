var Jt = Array.isArray, Qt = Array.prototype.indexOf, he = Array.prototype.includes, Xt = Array.from, en = Object.defineProperty, ye = Object.getOwnPropertyDescriptor, tn = Object.prototype, nn = Array.prototype, rn = Object.getPrototypeOf, Je = Object.isExtensible;
const sn = () => {
};
function ln(e) {
  return typeof e?.then == "function";
}
function fn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function dt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const x = 2, ke = 4, Ce = 8, vt = 1 << 24, Q = 16, $ = 32, le = 64, qe = 128, N = 512, y = 1024, k = 2048, q = 4096, j = 8192, L = 16384, ge = 32768, Qe = 1 << 25, Te = 65536, Xe = 1 << 17, un = 1 << 18, we = 1 << 19, on = 1 << 20, fe = 65536, Ye = 1 << 21, Ue = 1 << 22, Z = 1 << 23, Oe = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function an() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function cn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function hn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function dn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function vn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function _n() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const pn = 2, E = Symbol(), gn = "http://www.w3.org/1999/xhtml";
function wn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function _t(e) {
  return e === this.v;
}
let O = null;
function de(e) {
  O = e;
}
function pt(e, t = !1, n) {
  O = {
    p: O,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      g
    ),
    l: null
  };
}
function gt(e) {
  var t = (
    /** @type {ComponentContext} */
    O
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Yn(r);
  }
  return t.i = !0, O = t.p, /** @type {T} */
  {};
}
function wt() {
  return !0;
}
let ee = [];
function mt() {
  var e = ee;
  ee = [], fn(e);
}
function re(e) {
  if (ee.length === 0 && !ce) {
    var t = ee;
    queueMicrotask(() => {
      t === ee && mt();
    });
  }
  ee.push(e);
}
function mn() {
  for (; ee.length > 0; )
    mt();
}
function bt(e) {
  var t = g;
  if (t === null)
    return _.f |= Z, e;
  if ((t.f & ge) === 0 && (t.f & ke) === 0)
    throw e;
  W(e, t);
}
function W(e, t) {
  for (; t !== null; ) {
    if ((t.f & qe) !== 0) {
      if ((t.f & ge) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    }
    t = t.parent;
  }
  throw e;
}
const bn = -7169;
function b(e, t) {
  e.f = e.f & bn | t;
}
function Ve(e) {
  (e.f & N) !== 0 || e.deps === null ? b(e, y) : b(e, q);
}
function yt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & x) === 0 || (t.f & fe) === 0 || (t.f ^= fe, yt(
        /** @type {Derived} */
        t.deps
      ));
}
function Et(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), yt(e.deps), b(e, y);
}
const K = /* @__PURE__ */ new Set();
let w = null, C = null, ze = null, ce = !1, Ie = !1, ae = null, De = null;
var et = 0;
let yn = 1;
class G {
  id = yn++;
  /**
   * The current values of any signals that are updated in this batch.
   * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Value, [any, boolean]>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Value, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #u = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #i = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #n = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #f = /* @__PURE__ */ new Map();
  is_fork = !1;
  #c = !1;
  /** @type {Set<Batch>} */
  #o = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#o)
      for (const i of r.#r.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#f.has(n)) {
            t = !0;
            break;
          }
          n = n.parent;
        }
        if (!t)
          return !0;
      }
    return !1;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(t) {
    this.#f.has(t) || this.#f.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#f.get(t);
    if (n) {
      this.#f.delete(t);
      for (var r of n.d)
        b(r, k), this.schedule(r);
      for (r of n.m)
        b(r, q), this.schedule(r);
    }
  }
  #d() {
    if (et++ > 1e3 && (K.delete(this), xn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), b(l, k), this.schedule(l);
      for (const l of this.#l)
        b(l, q), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ae = [], r = [], i = De = [];
    for (const l of t)
      try {
        this.#a(l, n, r);
      } catch (u) {
        throw St(l), u;
      }
    if (w = null, i.length > 0) {
      var s = G.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (ae = null, De = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, u] of this.#f)
        Tt(l, u);
    } else {
      this.#e.size === 0 && K.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), tt(r), tt(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = o ??= this;
      l.#n.push(...this.#n.filter((u) => !l.#n.includes(u)));
    }
    o !== null && (K.add(o), o.#d()), K.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & ($ | le)) !== 0, l = o && (s & y) !== 0, u = l || (s & j) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= y : (s & ke) !== 0 ? n.push(i) : Re(i) && ((s & Q) !== 0 && this.#l.add(i), pe(i));
        var f = i.first;
        if (f !== null) {
          i = f;
          continue;
        }
      }
      for (; i !== null; ) {
        var a = i.next;
        if (a !== null) {
          i = a;
          break;
        }
        i = i.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #_(t) {
    for (var n = 0; n < t.length; n += 1)
      Et(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & Z) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Ie = !0, w = this, this.#d();
    } finally {
      et = 0, ze = null, ae = null, De = null, Ie = !1, w = null, C = null, J.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), K.delete(this);
  }
  #w() {
    for (const f of K) {
      var t = f.id < this.id, n = [];
      for (const [a, [h, c]] of this.current) {
        if (f.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(a)[0]
          );
          if (t && h !== r)
            f.current.set(a, [h, c]);
          else
            continue;
        }
        n.push(a);
      }
      var i = [...f.current.keys()].filter((a) => !this.current.has(a));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var l of n)
          xt(l, i, s, o);
        if (f.#n.length > 0) {
          f.apply();
          for (var u of f.#n)
            f.#a(u, [], []);
          f.#n = [];
        }
        f.deactivate();
      }
    }
    for (const f of K)
      f.#o.has(this) && (f.#o.delete(this), f.#o.size === 0 && !f.#h() && (f.activate(), f.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#e.get(n) ?? 0;
    if (this.#e.set(n, r + 1), t) {
      let i = this.#r.get(n) ?? 0;
      this.#r.set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let i = this.#e.get(n) ?? 0;
    if (i === 1 ? this.#e.delete(n) : this.#e.set(n, i - 1), t) {
      let s = this.#r.get(n) ?? 0;
      s === 1 ? this.#r.delete(n) : this.#r.set(n, s - 1);
    }
    this.#c || r || (this.#c = !0, re(() => {
      this.#c = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#s.add(r);
    for (const r of n)
      this.#l.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#u.add(t);
  }
  settled() {
    return (this.#i ??= dt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new G();
      Ie || (K.add(w), ce || re(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      C = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (ze = t, t.b?.is_pending && (t.f & (ke | Ce | vt)) !== 0 && (t.f & ge) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ae !== null && n === g && (_ === null || (_.f & x) === 0))
        return;
      if ((r & (le | $)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#n.push(n);
  }
}
function En(e) {
  var t = ce;
  ce = !0;
  try {
    for (var n; ; ) {
      if (mn(), w === null)
        return (
          /** @type {T} */
          n
        );
      w.flush();
    }
  } finally {
    ce = t;
  }
}
function xn() {
  try {
    cn();
  } catch (e) {
    W(e, ze);
  }
}
let H = null;
function tt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | j)) === 0 && Re(r) && (H = /* @__PURE__ */ new Set(), pe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Yt(r), H?.size > 0)) {
        J.clear();
        for (const i of H) {
          if ((i.f & (L | j)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            H.has(o) && (H.delete(o), s.push(o)), o = o.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const u = s[l];
            (u.f & (L | j)) === 0 && pe(u);
          }
        }
        H.clear();
      }
    }
    H = null;
  }
}
function xt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & x) !== 0 ? xt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ue | Q)) !== 0 && (s & k) === 0 && kt(i, t, r) && (b(i, k), $e(
        /** @type {Effect} */
        i
      ));
    }
}
function kt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (he.call(t, i))
        return !0;
      if ((i.f & x) !== 0 && kt(
        /** @type {Derived} */
        i,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function $e(e) {
  w.schedule(e);
}
function Tt(e, t) {
  if (!((e.f & $) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), b(e, y);
    for (var n = e.first; n !== null; )
      Tt(n, t), n = n.next;
  }
}
function St(e) {
  b(e, y);
  for (var t = e.first; t !== null; )
    St(t), t = t.next;
}
function kn(e) {
  let t = 0, n = ve(0), r;
  return () => {
    We() && (I(n), Bn(() => (t === 0 && (r = Zn(() => e(() => Ee(n)))), t += 1, () => {
      re(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ee(n));
      });
    })));
  };
}
var Tn = Te | we;
function Sn(e, t, n, r) {
  new An(e, t, n, r);
}
class An {
  /** @type {Boundary | null} */
  parent;
  is_pending = !1;
  /**
   * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
   * Inherited from parent boundary, or defaults to identity.
   * @type {(error: unknown) => unknown}
   */
  transform_error;
  /** @type {TemplateNode} */
  #t;
  /** @type {TemplateNode | null} */
  #u = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #c = 0;
  #o = 0;
  #h = !1;
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #a = null;
  #_ = kn(() => (this.#a = ve(this.#c), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#r = (s) => {
      var o = (
        /** @type {Effect} */
        g
      );
      o.b = this, o.f |= qe, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Lt(() => {
      this.#m();
    }, Tn);
  }
  #w() {
    try {
      this.#n = B(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = B(() => {
      n(
        this.#t,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#s = B(() => t(this.#t)), re(() => {
      var n = this.#f = document.createDocumentFragment(), r = Me();
      n.append(r), this.#n = this.#g(() => B(() => this.#r(r))), this.#o === 0 && (this.#t.before(n), this.#f = null, xe(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#c = 0, this.#n = B(() => {
        this.#r(this.#t);
      }), this.#o > 0) {
        var t = this.#f = document.createDocumentFragment();
        Bt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = B(() => n(this.#t));
      } else
        this.#p(
          /** @type {Batch} */
          w
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Et(t, this.#v, this.#d);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var n = g, r = _, i = O;
    Y(this.#i), P(this.#i), de(this.#i.ctx);
    try {
      return G.ensure(), t();
    } catch (s) {
      return bt(s), null;
    } finally {
      Y(n), P(r), de(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #b(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#b(t, n);
      return;
    }
    this.#o += t, this.#o === 0 && (this.#p(n), this.#s && xe(this.#s, () => {
      this.#s = null;
    }), this.#f && (this.#t.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#c += t, !(!this.#a || this.#h) && (this.#h = !0, re(() => {
      this.#h = !1, this.#a && ie(this.#a, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), I(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#e.onerror;
    let r = this.#e.failed;
    if (!n && !r)
      throw t;
    this.#n && (A(this.#n), this.#n = null), this.#s && (A(this.#s), this.#s = null), this.#l && (A(this.#l), this.#l = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        wn();
        return;
      }
      i = !0, s && _n(), this.#l !== null && xe(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (u) => {
      try {
        s = !0, n?.(u, o), s = !1;
      } catch (f) {
        W(f, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return B(() => {
            var f = (
              /** @type {Effect} */
              g
            );
            f.b = this, f.f |= qe, r(
              this.#t,
              () => u,
              () => o
            );
          });
        } catch (f) {
          return W(
            f,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    re(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (f) {
        W(f, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        l,
        /** @param {unknown} e */
        (f) => W(f, this.#i && this.#i.parent)
      ) : l(u);
    });
  }
}
function Rn(e, t, n, r) {
  const i = Nn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), l = At(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (o.f & L) === 0 && W(v, o);
    }
    Se();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(i)));
    return;
  }
  var a = Rt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Dn(c))).then((c) => f([...t.map(i), ...c])).catch((c) => W(c, o)).finally(() => a());
  }
  u ? u.then(() => {
    l(), h(), Se();
  }) : h();
}
function At() {
  var e = (
    /** @type {Effect} */
    g
  ), t = _, n = O, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), P(t), de(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  Y(null), P(null), de(null), e && w?.deactivate();
}
function Rt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    w
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function Nn(e) {
  var t = x | k, n = _ !== null && (_.f & x) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return g !== null && (g.f |= we), {
    ctx: O,
    deps: null,
    effects: null,
    equals: _t,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      E
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Dn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && an();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = ve(
    /** @type {V} */
    E
  ), o = !_, l = /* @__PURE__ */ new Map();
  return Hn(() => {
    var u = (
      /** @type {Effect} */
      g
    ), f = dt();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Se);
    } catch (v) {
      f.reject(v), Se();
    }
    var a = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((u.f & ge) !== 0)
        var h = Rt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(a)?.reject(U), l.delete(a);
      else {
        for (const v of l.values())
          v.reject(U);
        l.clear();
      }
      l.set(a, f);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var p = d === U;
        h(p);
      }
      if (!(d === U || (u.f & L) !== 0)) {
        if (a.activate(), d)
          s.f |= Z, ie(s, d);
        else {
          (s.f & Z) !== 0 && (s.f ^= Z), ie(s, v);
          for (const [m, M] of l) {
            if (l.delete(m), m === a) break;
            M.reject(U);
          }
        }
        a.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), qn(() => {
    for (const u of l.values())
      u.reject(U);
  }), new Promise((u) => {
    function f(a) {
      function h() {
        a === i ? u(s) : f(i);
      }
      a.then(h, h);
    }
    f(i);
  });
}
function Pn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      A(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Mn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & x) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ge(e) {
  var t, n = g;
  Y(Mn(e));
  try {
    e.f &= ~fe, Pn(e), t = Gt(e);
  } finally {
    Y(n);
  }
  return t;
}
function Nt(e) {
  var t = e.v, n = Ge(e);
  if (!e.equals(n) && (e.wv = Vt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, y);
    return;
  }
  _e || (C !== null ? (We() || w?.is_fork) && C.set(e, n) : Ve(e));
}
function Cn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = sn, t.ac = null, Ae(t, 0), Ze(t));
}
function Dt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && pe(t);
}
let He = /* @__PURE__ */ new Set();
const J = /* @__PURE__ */ new Map();
let Pt = !1;
function ve(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: _t,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function z(e, t) {
  const n = ve(e);
  return Gn(n), n;
}
function V(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (_.f & Xe) !== 0) && wt() && (_.f & (x | Q | Ue | Xe)) !== 0 && (D === null || !he.call(D, e)) && vn();
  let r = n ? te(t) : t;
  return ie(e, r, De);
}
function ie(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    _e ? J.set(e, t) : J.set(e, r), e.v = t;
    var i = G.ensure();
    if (i.capture(e, r), (e.f & x) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ge(s), C === null && Ve(s);
    }
    e.wv = Vt(), Mt(e, k, n), g !== null && (g.f & y) !== 0 && (g.f & ($ | le)) === 0 && (R === null ? Kn([e]) : R.push(e)), !i.is_fork && He.size > 0 && !Pt && Fn();
  }
  return t;
}
function Fn() {
  Pt = !1;
  for (const e of He)
    (e.f & y) !== 0 && b(e, q), Re(e) && pe(e);
  He.clear();
}
function Ee(e) {
  V(e, e.v + 1);
}
function Mt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], l = o.f, u = (l & k) === 0;
      if (u && b(o, t), (l & x) !== 0) {
        var f = (
          /** @type {Derived} */
          o
        );
        C?.delete(f), (l & fe) === 0 && (l & N && (o.f |= fe), Mt(f, q, n));
      } else if (u) {
        var a = (
          /** @type {Effect} */
          o
        );
        (l & Q) !== 0 && H !== null && H.add(a), n !== null ? n.push(a) : $e(a);
      }
    }
}
function te(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = rn(e);
  if (t !== tn && t !== nn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Jt(e), i = /* @__PURE__ */ z(0), s = se, o = (l) => {
    if (se === s)
      return l();
    var u = _, f = se;
    P(null), st(s);
    var a = l();
    return P(u), st(f), a;
  };
  return r && n.set("length", /* @__PURE__ */ z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && hn();
        var a = n.get(u);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ z(f.value);
          return n.set(u, h), h;
        }) : V(a, f.value, !0), !0;
      },
      deleteProperty(l, u) {
        var f = n.get(u);
        if (f === void 0) {
          if (u in l) {
            const a = o(() => /* @__PURE__ */ z(E));
            n.set(u, a), Ee(i);
          }
        } else
          V(f, E), Ee(i);
        return !0;
      },
      get(l, u, f) {
        if (u === Oe)
          return e;
        var a = n.get(u), h = u in l;
        if (a === void 0 && (!h || ye(l, u)?.writable) && (a = o(() => {
          var v = te(h ? l[u] : E), d = /* @__PURE__ */ z(v);
          return d;
        }), n.set(u, a)), a !== void 0) {
          var c = I(a);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, u, f);
      },
      getOwnPropertyDescriptor(l, u) {
        var f = Reflect.getOwnPropertyDescriptor(l, u);
        if (f && "value" in f) {
          var a = n.get(u);
          a && (f.value = I(a));
        } else if (f === void 0) {
          var h = n.get(u), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return f;
      },
      has(l, u) {
        if (u === Oe)
          return !0;
        var f = n.get(u), a = f !== void 0 && f.v !== E || Reflect.has(l, u);
        if (f !== void 0 || g !== null && (!a || ye(l, u)?.writable)) {
          f === void 0 && (f = o(() => {
            var c = a ? te(l[u]) : E, v = /* @__PURE__ */ z(c);
            return v;
          }), n.set(u, f));
          var h = I(f);
          if (h === E)
            return !1;
        }
        return a;
      },
      set(l, u, f, a) {
        var h = n.get(u), c = u in l;
        if (r && u === "length")
          for (var v = f; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? V(d, E) : v in l && (d = o(() => /* @__PURE__ */ z(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ye(l, u)?.writable) && (h = o(() => /* @__PURE__ */ z(void 0)), V(h, te(f)), n.set(u, h));
        else {
          c = h.v !== E;
          var p = o(() => te(f));
          V(h, p);
        }
        var m = Reflect.getOwnPropertyDescriptor(l, u);
        if (m?.set && m.set.call(a, f), !c) {
          if (r && typeof u == "string") {
            var M = (
              /** @type {Source<number>} */
              n.get("length")
            ), ue = Number(u);
            Number.isInteger(ue) && ue >= M.v && V(M, ue + 1);
          }
          Ee(i);
        }
        return !0;
      },
      ownKeys(l) {
        I(i);
        var u = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [f, a] of n)
          a.v !== E && !(f in l) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        dn();
      }
    }
  );
}
var nt, Ct, Ft, Ot;
function On() {
  if (nt === void 0) {
    nt = window, Ct = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ft = ye(t, "firstChild").get, Ot = ye(t, "nextSibling").get, Je(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Je(n) && (n.__t = void 0);
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
  return (
    /** @type {TemplateNode | null} */
    Ft.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    Ot.call(e)
  );
}
function je(e, t) {
  return /* @__PURE__ */ It(e);
}
function Le(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ke(r);
  return r;
}
function In() {
  return !1;
}
function jn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(gn, e, void 0)
  );
}
function jt(e) {
  var t = _, n = g;
  P(null), Y(null);
  try {
    return e();
  } finally {
    P(t), Y(n);
  }
}
function Ln(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = g;
  n !== null && (n.f & j) !== 0 && (e |= j);
  var r = {
    ctx: O,
    deps: null,
    nodes: null,
    f: e | k | N,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, i = r;
  if ((e & ke) !== 0)
    ae !== null ? ae.push(r) : G.ensure().schedule(r);
  else if (t !== null) {
    try {
      pe(r);
    } catch (o) {
      throw A(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & we) === 0 && (i = i.first, (e & Q) !== 0 && (e & Te) !== 0 && i !== null && (i.f |= Te));
  }
  if (i !== null && (i.parent = n, n !== null && Ln(i, n), _ !== null && (_.f & x) !== 0 && (e & le) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function We() {
  return _ !== null && !F;
}
function qn(e) {
  const t = X(Ce, null);
  return b(t, y), t.teardown = e, t;
}
function Yn(e) {
  return X(ke | on, e);
}
function zn(e) {
  G.ensure();
  const t = X(le | we, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function Hn(e) {
  return X(Ue | we, e);
}
function Bn(e, t = 0) {
  return X(Ce | t, e);
}
function rt(e, t = [], n = [], r = []) {
  Rn(r, t, n, (i) => {
    X(Ce, () => e(...i.map(I)));
  });
}
function Lt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function B(e) {
  return X($ | we, e);
}
function qt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = _e, r = _;
    it(!0), P(null);
    try {
      t.call(null);
    } finally {
      it(n), P(r);
    }
  }
}
function Ze(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && jt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & le) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Un(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & $) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & un) !== 0) && e.nodes !== null && e.nodes.end !== null && (Vn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, Qe), Ze(e, t && !n), Ae(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  qt(e), e.f ^= Qe, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Yt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Vn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function Yt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  zt(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var l of r)
      l.out(o);
  } else
    i();
}
function zt(e, t, n) {
  if ((e.f & j) === 0) {
    e.f ^= j;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & Te) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & $) !== 0 && (e.f & Q) !== 0;
      zt(i, t, o ? n : !1), i = s;
    }
  }
}
function $n(e) {
  Ht(e, !0);
}
function Ht(e, t) {
  if ((e.f & j) !== 0) {
    e.f ^= j, (e.f & y) === 0 && (b(e, k), G.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Te) !== 0 || (n.f & $) !== 0;
      Ht(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || t) && o.in();
  }
}
function Bt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Pe = !1, _e = !1;
function it(e) {
  _e = e;
}
let _ = null, F = !1;
function P(e) {
  _ = e;
}
let g = null;
function Y(e) {
  g = e;
}
let D = null;
function Gn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, S = 0, R = null;
function Kn(e) {
  R = e;
}
let Ut = 1, ne = 0, se = ne;
function st(e) {
  se = e;
}
function Vt() {
  return ++Ut;
}
function Re(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & x && (e.f &= ~fe), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Re(
        /** @type {Derived} */
        s
      ) && Nt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && b(e, y);
  }
  return !1;
}
function $t(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && he.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & x) !== 0 ? $t(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, k) : (s.f & y) !== 0 && b(s, q), $e(
        /** @type {Effect} */
        s
      ));
    }
}
function Gt(e) {
  var t = T, n = S, r = R, i = _, s = D, o = O, l = F, u = se, f = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, _ = (f & ($ | le)) === 0 ? e : null, D = null, de(e.ctx), F = !1, se = ++ne, e.ac !== null && (jt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Ye;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= ge;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || Ae(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (We() && (e.f & N) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (Ae(e, S), c.length = S);
    if (wt() && R !== null && !F && c !== null && (e.f & (x | q | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        $t(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ne++, i.deps !== null)
        for (let p = 0; p < n; p += 1)
          i.deps[p].rv = ne;
      if (t !== null)
        for (const p of t)
          p.rv = ne;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & Z) !== 0 && (e.f ^= Z), h;
  } catch (p) {
    return bt(p);
  } finally {
    e.f ^= Ye, T = t, S = n, R = r, _ = i, D = s, de(o), F = l, se = u;
  }
}
function Wn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Qt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & x) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !he.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~fe), Ve(s), Cn(s), Ae(s, 0);
  }
}
function Ae(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Wn(e, n[r]);
}
function pe(e) {
  var t = e.f;
  if ((t & L) === 0) {
    b(e, y);
    var n = g, r = Pe;
    g = e, Pe = !0;
    try {
      (t & (Q | vt)) !== 0 ? Un(e) : Ze(e), qt(e);
      var i = Gt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ut;
      var s;
    } finally {
      Pe = r, g = n;
    }
  }
}
function I(e) {
  var t = e.f, n = (t & x) !== 0;
  if (_ !== null && !F) {
    var r = g !== null && (g.f & L) !== 0;
    if (!r && (D === null || !he.call(D, e))) {
      var i = _.deps;
      if ((_.f & Ye) !== 0)
        e.rv < ne && (e.rv = ne, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : he.call(s, _) || s.push(_);
      }
    }
  }
  if (_e && J.has(e))
    return J.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (_e) {
      var l = o.v;
      return ((o.f & y) === 0 && o.reactions !== null || Wt(o)) && (l = Ge(o)), J.set(o, l), l;
    }
    var u = (o.f & N) === 0 && !F && _ !== null && (Pe || (_.f & N) !== 0), f = (o.f & ge) === 0;
    Re(o) && (u && (o.f |= N), Nt(o)), u && !f && (Dt(o), Kt(o));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & Z) !== 0)
    throw e.v;
  return e.v;
}
function Kt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & x) !== 0 && (t.f & N) === 0 && (Dt(
        /** @type {Derived} */
        t
      ), Kt(
        /** @type {Derived} */
        t
      ));
}
function Wt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (J.has(t) || (t.f & x) !== 0 && Wt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Zn(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const lt = globalThis.Deno?.core?.ops ?? null;
function Jn(e, ...t) {
  lt?.[e] ? lt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function ft(e, t) {
  Jn("op_set_text", e, t);
}
const Qn = ["touchstart", "touchmove"];
function Xn(e) {
  return Qn.includes(e);
}
const be = Symbol("events"), Zt = /* @__PURE__ */ new Set(), Be = /* @__PURE__ */ new Set();
function ut(e, t, n) {
  (t[be] ??= {})[e] = n;
}
function er(e) {
  for (var t = 0; t < e.length; t++)
    Zt.add(e[t]);
  for (var n of Be)
    n(e);
}
let ot = null;
function at(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  ot = e;
  var o = 0, l = ot === e && e[be];
  if (l) {
    var u = i.indexOf(l);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[be] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    u <= f && (o = u);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    en(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = _, h = g;
    P(null), Y(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var p = s[be]?.[r];
          p != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && p.call(s, e);
        } catch (m) {
          c ? v.push(m) : c = m;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let m of v)
          queueMicrotask(() => {
            throw m;
          });
        throw c;
      }
    } finally {
      e[be] = t, delete e.currentTarget, P(a), Y(h);
    }
  }
}
const tr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function nr(e) {
  return (
    /** @type {string} */
    tr?.createHTML(e) ?? e
  );
}
function rr(e) {
  var t = jn("template");
  return t.innerHTML = nr(e.replaceAll("<!>", "<!---->")), t.content;
}
function ir(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function me(e, t) {
  var n = (t & pn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = rr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ It(r));
    var s = (
      /** @type {TemplateNode} */
      n || Ct ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return ir(s, s), s;
  };
}
function oe(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function sr(e, t) {
  return lr(e, t);
}
const Ne = /* @__PURE__ */ new Map();
function lr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: l }) {
  On();
  var u = void 0, f = zn(() => {
    var a = n ?? t.appendChild(Me());
    Sn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (v) => {
        pt({});
        var d = (
          /** @type {ComponentContext} */
          O
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, gt();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var p = v[d];
        if (!h.has(p)) {
          h.add(p);
          var m = Xn(p);
          for (const Fe of [t, document]) {
            var M = Ne.get(Fe);
            M === void 0 && (M = /* @__PURE__ */ new Map(), Ne.set(Fe, M));
            var ue = M.get(p);
            ue === void 0 ? (Fe.addEventListener(p, at, { passive: m }), M.set(p, 1)) : M.set(p, ue + 1);
          }
        }
      }
    };
    return c(Xt(Zt)), Be.add(c), () => {
      for (var v of h)
        for (const m of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ne.get(m)
          ), p = (
            /** @type {number} */
            d.get(v)
          );
          --p == 0 ? (m.removeEventListener(v, at), d.delete(v), d.size === 0 && Ne.delete(m)) : d.set(v, p);
        }
      Be.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return fr.set(u, f), u;
}
let fr = /* @__PURE__ */ new WeakMap();
class ur {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #u = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #i = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#i = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#u.get(n);
      if (r)
        $n(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, o] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(o);
        l && (A(l.effect), this.#e.delete(o));
      }
      for (const [s, o] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            Bt(o, f), f.append(Me()), this.#e.set(s, { effect: o, fragment: f });
          } else
            A(o);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), xe(o, l, !1)) : l();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (A(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      w
    ), i = In();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), o = Me();
        s.append(o), this.#e.set(t, {
          effect: B(() => n(o)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          B(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, u] of this.#u)
        l === t ? r.unskip_effect(u) : r.skip_effect(u);
      for (const [l, u] of this.#e)
        l === t ? r.unskip_effect(u.effect) : r.skip_effect(u.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
const or = 0, ct = 1, ar = 2;
function ht(e, t, n, r, i) {
  var s = (
    /** @type {V} */
    E
  ), o = ve(s), l = ve(s), u = new ur(e);
  Lt(() => {
    var f = (
      /** @type {Batch} */
      w
    );
    f.deactivate();
    var a = t();
    f.activate();
    var h = !1;
    if (ln(a)) {
      var c = At(), v = !1;
      const d = (p) => {
        if (!h) {
          v = !0, c(!1), G.ensure();
          try {
            p();
          } finally {
            Se(!1), ce || En();
          }
        }
      };
      a.then(
        (p) => {
          d(() => {
            ie(o, p), u.ensure(ct, r && ((m) => r(m, o)));
          });
        },
        (p) => {
          d(() => {
            if (ie(l, p), u.ensure(ar, i && ((m) => i(m, l))), !i)
              throw l.v;
          });
        }
      ), re(() => {
        v || d(() => {
          u.ensure(or, n);
        });
      });
    } else
      ie(o, a), u.ensure(ct, r && ((d) => r(d, o)));
    return () => {
      h = !0;
    };
  });
}
var cr = /* @__PURE__ */ me("<div> </div>"), hr = /* @__PURE__ */ me("<div> </div>"), dr = /* @__PURE__ */ me("<div>Loading...</div>"), vr = /* @__PURE__ */ me("<div>Done</div>"), _r = /* @__PURE__ */ me("<div>Pending</div>"), pr = /* @__PURE__ */ me("<div><!> <!> <button>Reset</button> <button>Show Error</button></div>");
function gr(e, t) {
  pt(t, !0);
  let n = /* @__PURE__ */ z(te(Promise.resolve("hello"))), r = te(
    new Promise(() => {
    })
    // never resolves
  );
  function i() {
    V(n, Promise.resolve("world"), !0);
  }
  function s() {
    V(n, new Promise((h, c) => c(new Error("oops"))), !0);
  }
  var o = pr(), l = je(o);
  ht(
    l,
    () => I(n),
    (h) => {
      var c = dr();
      oe(h, c);
    },
    (h, c) => {
      var v = cr(), d = je(v);
      rt(() => ft(d, `Resolved: ${I(c) ?? ""}`)), oe(h, v);
    },
    (h, c) => {
      var v = hr(), d = je(v);
      rt(() => ft(d, `Caught: ${I(c).message ?? ""}`)), oe(h, v);
    }
  );
  var u = Le(l, 2);
  ht(
    u,
    () => r,
    (h) => {
      var c = _r();
      oe(h, c);
    },
    (h, c) => {
      var v = vr();
      oe(h, v);
    }
  );
  var f = Le(u, 2), a = Le(f, 2);
  ut("click", f, i), ut("click", a, s), oe(e, o), gt();
}
er(["click"]);
function mr(e) {
  return sr(gr, { target: e });
}
export {
  mr as default,
  mr as rvst_mount
};

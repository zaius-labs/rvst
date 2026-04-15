var zt = Array.isArray, Vt = Array.prototype.indexOf, ue = Array.prototype.includes, Ut = Array.from, Bt = Object.defineProperty, de = Object.getOwnPropertyDescriptor, Ht = Object.prototype, $t = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Wt = () => {
};
function Gt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Ne = 8, at = 1 << 24, Z = 16, G = 32, ne = 64, Ie = 128, R = 512, y = 1024, S = 2048, j = 4096, $ = 8192, C = 16384, he = 32768, Ge = 1 << 25, ke = 65536, Ze = 1 << 17, Zt = 1 << 18, _e = 1 << 19, Jt = 1 << 20, re = 65536, je = 1 << 21, Ye = 1 << 22, K = 1 << 23, Pe = Symbol("$state"), z = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Qt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Xt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function en() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function rn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const sn = 2, E = Symbol(), ln = "http://www.w3.org/1999/xhtml";
function fn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let M = null;
function ae(e) {
  M = e;
}
function un(e, t = !1, n) {
  M = {
    p: M,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      p
    ),
    l: null
  };
}
function an(e) {
  var t = (
    /** @type {ComponentContext} */
    M
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mn(r);
  }
  return t.i = !0, M = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let X = [];
function ht() {
  var e = X;
  X = [], Gt(e);
}
function fe(e) {
  if (X.length === 0 && !pe) {
    var t = X;
    queueMicrotask(() => {
      t === X && ht();
    });
  }
  X.push(e);
}
function on() {
  for (; X.length > 0; )
    ht();
}
function _t(e) {
  var t = p;
  if (t === null)
    return d.f |= K, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
      if ((t.f & he) === 0)
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
const cn = -7169;
function m(e, t) {
  e.f = e.f & cn | t;
}
function ze(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, j);
}
function vt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & re) === 0 || (t.f ^= re, vt(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & j) !== 0 && n.add(e), vt(e.deps), m(e, y);
}
const U = /* @__PURE__ */ new Set();
let g = null, P = null, Le = null, pe = !1, Fe = !1, le = null, xe = null;
var Je = 0;
let hn = 1;
class ie {
  id = hn++;
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
  #l = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #_ = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #f = /* @__PURE__ */ new Map();
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
  #e = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #n = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #s = /* @__PURE__ */ new Map();
  is_fork = !1;
  #o = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #v() {
    for (const r of this.#u)
      for (const i of r.#f.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#s.has(n)) {
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
    this.#s.has(t) || this.#s.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#s.get(t);
    if (n) {
      this.#s.delete(t);
      for (var r of n.d)
        m(r, S), this.schedule(r);
      for (r of n.m)
        m(r, j), this.schedule(r);
    }
  }
  #h() {
    if (Je++ > 1e3 && (U.delete(this), vn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, S), this.schedule(f);
      for (const f of this.#n)
        m(f, j), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw mt(f), u;
      }
    if (g = null, i.length > 0) {
      var s = ie.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, xe = null, this.#c() || this.#v()) {
      this.#d(r), this.#d(n);
      for (const [f, u] of this.#s)
        wt(f, u);
    } else {
      this.#r.size === 0 && U.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      g
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    a !== null && (U.add(a), a.#h()), U.has(this) || this.#w();
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
      var s = i.f, a = (s & (G | ne)) !== 0, f = a && (s & y) !== 0, u = f || (s & $) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
        var l = i.first;
        if (l !== null) {
          i = l;
          continue;
        }
      }
      for (; i !== null; ) {
        var o = i.next;
        if (o !== null) {
          i = o;
          break;
        }
        i = i.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      dt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), P?.set(t, t.v));
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, P = null;
  }
  flush() {
    try {
      Fe = !0, g = this, this.#h();
    } finally {
      Je = 0, Le = null, le = null, xe = null, Fe = !1, g = null, P = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), U.delete(this);
  }
  #w() {
    for (const l of U) {
      var t = l.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (l.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(o)[0]
          );
          if (t && h !== r)
            l.current.set(o, [h, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...l.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var f of n)
          pt(f, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#a(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of U)
      l.#u.has(this) && (l.#u.delete(this), l.#u.size === 0 && !l.#c() && (l.activate(), l.#h()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#r.get(n) ?? 0;
    if (this.#r.set(n, r + 1), t) {
      let i = this.#f.get(n) ?? 0;
      this.#f.set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let i = this.#r.get(n) ?? 0;
    if (i === 1 ? this.#r.delete(n) : this.#r.set(n, i - 1), t) {
      let s = this.#f.get(n) ?? 0;
      s === 1 ? this.#f.delete(n) : this.#f.set(n, s - 1);
    }
    this.#o || r || (this.#o = !0, fe(() => {
      this.#o = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#t.add(r);
    for (const r of n)
      this.#n.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#_.add(t);
  }
  settled() {
    return (this.#i ??= ut()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new ie();
      Fe || (U.add(g), pe || fe(() => {
        g === t && t.flush();
      }));
    }
    return g;
  }
  apply() {
    {
      P = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Le = t, t.b?.is_pending && (t.f & (we | Ne | at)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (d === null || (d.f & b) === 0))
        return;
      if ((r & (ne | G)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function _n(e) {
  var t = pe;
  pe = !0;
  try {
    for (var n; ; ) {
      if (on(), g === null)
        return (
          /** @type {T} */
          n
        );
      g.flush();
    }
  } finally {
    pe = t;
  }
}
function vn() {
  try {
    Xt();
  } catch (e) {
    H(e, Le);
  }
}
let Y = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (C | $)) === 0 && ye(r) && (Y = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pt(r), Y?.size > 0)) {
        W.clear();
        for (const i of Y) {
          if ((i.f & (C | $)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (C | $)) === 0 && ce(u);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & S) === 0 && gt(i, t, r) && (m(i, S), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function gt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && gt(
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
function Ve(e) {
  g.schedule(e);
}
function wt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & j) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      wt(n, t), n = n.next;
  }
}
function mt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    mt(t), t = t.next;
}
function dn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    $e() && (V(n), Ot(() => (t === 0 && (r = Yt(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var pn = ke | _e;
function gn(e, t, n, r) {
  new wn(e, t, n, r);
}
class wn {
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
  #l;
  /** @type {TemplateNode | null} */
  #_ = null;
  /** @type {BoundaryProps} */
  #r;
  /** @type {((anchor: Node) => void)} */
  #f;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #t = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {DocumentFragment | null} */
  #s = null;
  #o = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #a = null;
  #d = dn(() => (this.#a = Oe(this.#o), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#l = t, this.#r = n, this.#f = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ln(() => {
      this.#m();
    }, pn);
  }
  #w() {
    try {
      this.#e = Q(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#r.failed;
    n && (this.#n = Q(() => {
      n(
        this.#l,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), fe(() => {
      var n = this.#s = document.createDocumentFragment(), r = Rt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, Te(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        g
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        zn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Q(() => n(this.#l));
      } else
        this.#p(
          /** @type {Batch} */
          g
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    dt(t, this.#v, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#r.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var n = p, r = d, i = M;
    L(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return _t(s), null;
    } finally {
      L(n), O(r), ae(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #y(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, n);
      return;
    }
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && Te(this.#t, () => {
      this.#t = null;
    }), this.#s && (this.#l.before(this.#s), this.#s = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#a && Re(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#d(), V(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && (I(this.#e), this.#e = null), this.#t && (I(this.#t), this.#t = null), this.#n && (I(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        fn();
        return;
      }
      i = !0, s && rn(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        H(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Ie, r(
              this.#l,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return H(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        H(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => H(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function mn(e, t, n, r) {
  const i = bn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = yn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (a.f & C) === 0 && H(v, a);
    }
    Ae();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = yt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ae();
  }) : h();
}
function yn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = d, n = M, r = (
    /** @type {Batch} */
    g
  );
  return function(s = !0) {
    L(e), O(t), ae(n), s && (e.f & C) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  L(null), O(null), ae(null), e && g?.deactivate();
}
function yt() {
  var e = (
    /** @type {Effect} */
    p
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    g
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function bn(e) {
  var t = b | S, n = d !== null && (d.f & b) !== 0 ? (
    /** @type {Derived} */
    d
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: M,
    deps: null,
    effects: null,
    equals: ot,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      E
    ),
    wv: 0,
    parent: n ?? p,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function En(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Qt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !d, f = /* @__PURE__ */ new Map();
  return In(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ut();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (v) {
      l.reject(v), Ae();
    }
    var o = (
      /** @type {Batch} */
      g
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = yt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(z), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(z);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, _ = void 0) => {
      if (h) {
        var w = _ === z;
        h(w);
      }
      if (!(_ === z || (u.f & C) !== 0)) {
        if (o.activate(), _)
          s.f |= K, Re(s, _);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Re(s, v);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(z);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Fn(() => {
    for (const u of f.values())
      u.reject(z);
  }), new Promise((u) => {
    function l(o) {
      function h() {
        o === i ? u(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function xn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      I(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Tn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & C) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ue(e) {
  var t, n = p;
  L(Tn(e));
  try {
    e.f &= ~re, xn(e), t = jt(e);
  } finally {
    L(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Ct(), (!g?.is_fork || e.deps === null) && (e.v = n, g?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (P !== null ? ($e() || g?.is_fork) && P.set(e, n) : ze(e));
}
function Sn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = Wt, t.ac = null, me(t, 0), Ke(t));
}
function Et(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let qe = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let xt = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ot,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  const n = Oe(e);
  return Vn(n), n;
}
function B(e, t, n = !1) {
  d !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (d.f & Ze) !== 0) && ct() && (d.f & (b | Z | Ye | Ze)) !== 0 && (N === null || !ue.call(N, e)) && nn();
  let r = n ? ve(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Ue(s), P === null && ze(s);
    }
    e.wv = Ct(), Tt(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (G | ne)) === 0 && (A === null ? Un([e]) : A.push(e)), !i.is_fork && qe.size > 0 && !xt && kn();
  }
  return t;
}
function kn() {
  xt = !1;
  for (const e of qe)
    (e.f & y) !== 0 && m(e, j), ye(e) && ce(e);
  qe.clear();
}
function ge(e) {
  B(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & S) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        P?.delete(l), (f & re) === 0 && (f & R && (a.f |= re), Tt(l, j, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = Kt(e);
  if (t !== Ht && t !== $t)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zt(e), i = /* @__PURE__ */ q(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var u = d, l = te;
    O(null), rt(s);
    var o = f();
    return O(u), rt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && en();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ q(l.value);
          return n.set(u, h), h;
        }) : B(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ q(E));
            n.set(u, o), ge(i);
          }
        } else
          B(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Pe)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || de(f, u)?.writable) && (o = a(() => {
          var v = ve(h ? f[u] : E), _ = /* @__PURE__ */ q(v);
          return _;
        }), n.set(u, o)), o !== void 0) {
          var c = V(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = V(o));
        } else if (l === void 0) {
          var h = n.get(u), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return l;
      },
      has(f, u) {
        if (u === Pe)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || de(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(f[u]) : E, v = /* @__PURE__ */ q(c);
            return v;
          }), n.set(u, l));
          var h = V(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var _ = n.get(v + "");
            _ !== void 0 ? B(_, E) : v in f && (_ = a(() => /* @__PURE__ */ q(E)), n.set(v + "", _));
          }
        if (h === void 0)
          (!c || de(f, u)?.writable) && (h = a(() => /* @__PURE__ */ q(void 0)), B(h, ve(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var w = a(() => ve(l));
          B(h, w);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(u);
            Number.isInteger(se) && se >= D.v && B(D, se + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        V(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        tn();
      }
    }
  );
}
var Xe, St, kt, At;
function An() {
  if (Xe === void 0) {
    Xe = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kt = de(t, "firstChild").get, At = de(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function et(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function Rn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Nn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(ln, e, void 0)
  );
}
let tt = !1;
function On() {
  tt || (tt = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        if (!e.defaultPrevented)
          for (
            const t of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            t.__on_r?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function He(e) {
  var t = d, n = p;
  O(null), L(null);
  try {
    return e();
  } finally {
    O(t), L(n);
  }
}
function Dn(e, t, n, r = n) {
  e.addEventListener(t, () => He(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), On();
}
function Pn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & $) !== 0 && (e |= $);
  var r = {
    ctx: M,
    deps: null,
    nodes: null,
    f: e | S | R,
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
  if ((e & we) !== 0)
    le !== null ? le.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw I(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Pn(i, n), d !== null && (d.f & b) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      d
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function $e() {
  return d !== null && !F;
}
function Fn(e) {
  const t = J(Ne, null);
  return m(t, y), t.teardown = e, t;
}
function Mn(e) {
  return J(we | Jt, e);
}
function Cn(e) {
  ie.ensure();
  const t = J(ne | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      I(t), r(void 0);
    }) : (I(t), r(void 0));
  });
}
function In(e) {
  return J(Ye | _e, e);
}
function Ot(e, t = 0) {
  return J(Ne | t, e);
}
function jn(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    J(Ne, () => e(...i.map(V)));
  });
}
function Ln(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(G | _e, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = d;
    nt(!0), O(null);
    try {
      t.call(null);
    } finally {
      nt(n), O(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && He(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : I(n, t), n = r;
  }
}
function qn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && I(t), t = n;
  }
}
function I(e, t = !0) {
  var n = !1;
  (t || (e.f & Zt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Yn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ge), Ke(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= Ge, e.f |= C;
  var i = e.parent;
  i !== null && i.first !== null && Pt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Yn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Pt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && I(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ft(e, t, n) {
  if ((e.f & $) === 0) {
    e.f ^= $;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function zn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Se = !1, oe = !1;
function nt(e) {
  oe = e;
}
let d = null, F = !1;
function O(e) {
  d = e;
}
let p = null;
function L(e) {
  p = e;
}
let N = null;
function Vn(e) {
  d !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, k = 0, A = null;
function Un(e) {
  A = e;
}
let Mt = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function Ct() {
  return ++Mt;
}
function ye(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~re), (t & j) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && bt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && m(e, y);
  }
  return !1;
}
function It(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? It(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, j), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function jt(e) {
  var t = T, n = k, r = A, i = d, s = N, a = M, f = F, u = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, d = (l & (G | ne)) === 0 ? e : null, N = null, ae(e.ctx), F = !1, te = ++ee, e.ac !== null && (He(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, v = g?.is_fork;
    if (T !== null) {
      var _;
      if (v || me(e, k), c !== null && k > 0)
        for (c.length = k + T.length, _ = 0; _ < T.length; _++)
          c[k + _] = T[_];
      else
        e.deps = c = T;
      if ($e() && (e.f & R) !== 0)
        for (_ = k; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !v && c !== null && k < c.length && (me(e, k), c.length = k);
    if (ct() && A !== null && !F && c !== null && (e.f & (b | j | S)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      A.length; _++)
        It(
          A[_],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let w = 0; w < n; w += 1)
          i.deps[w].rv = ee;
      if (t !== null)
        for (const w of t)
          w.rv = ee;
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (w) {
    return _t(w);
  } finally {
    e.f ^= je, T = t, k = n, A = r, d = i, N = s, ae(a), F = f, te = u;
  }
}
function Bn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~re), ze(s), Sn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & C) === 0) {
    m(e, y);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Z | at)) !== 0 ? qn(e) : Ke(e), Dt(e);
      var i = jt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mt;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
async function Hn() {
  await Promise.resolve(), _n();
}
function V(e) {
  var t = e.f, n = (t & b) !== 0;
  if (d !== null && !F) {
    var r = p !== null && (p.f & C) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = d.deps;
      if ((d.f & je) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (d.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [d] : ue.call(s, d) || s.push(d);
      }
    }
  }
  if (oe && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || qt(a)) && (f = Ue(a)), W.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !F && d !== null && (Se || (d.f & R) !== 0), l = (a.f & he) === 0;
    ye(a) && (u && (a.f |= R), bt(a)), u && !l && (Et(a), Lt(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Lt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (Et(
        /** @type {Derived} */
        t
      ), Lt(
        /** @type {Derived} */
        t
      ));
}
function qt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & b) !== 0 && qt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Yt(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function $n(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Kn(e, t) {
  $n("op_set_text", e, t);
}
const Wn = ["touchstart", "touchmove"];
function Gn(e) {
  return Wn.includes(e);
}
const be = Symbol("events"), Zn = /* @__PURE__ */ new Set(), st = /* @__PURE__ */ new Set();
let lt = null;
function ft(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  lt = e;
  var a = 0, f = lt === e && e[be];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[be] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Bt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = d, h = p;
    O(null), L(null);
    try {
      for (var c, v = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var w = s[be]?.[r];
          w != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && w.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        s = _;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[be] = t, delete e.currentTarget, O(o), L(h);
    }
  }
}
const Jn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Qn(e) {
  return (
    /** @type {string} */
    Jn?.createHTML(e) ?? e
  );
}
function Xn(e) {
  var t = Nn("template");
  return t.innerHTML = Qn(e.replaceAll("<!>", "<!---->")), t.content;
}
function er(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function tr(e, t) {
  var n = (t & sn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Xn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return er(s, s), s;
  };
}
function nr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function rr(e, t) {
  return ir(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function ir(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  An();
  var u = void 0, l = Cn(() => {
    var o = n ?? t.appendChild(Rt());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        un({});
        var _ = (
          /** @type {ComponentContext} */
          M
        );
        s && (_.c = s), i && (r.$$events = i), u = e(v, r) || {}, an();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var _ = 0; _ < v.length; _++) {
        var w = v[_];
        if (!h.has(w)) {
          h.add(w);
          var x = Gn(w);
          for (const De of [t, document]) {
            var D = Ee.get(De);
            D === void 0 && (D = /* @__PURE__ */ new Map(), Ee.set(De, D));
            var se = D.get(w);
            se === void 0 ? (De.addEventListener(w, ft, { passive: x }), D.set(w, 1)) : D.set(w, se + 1);
          }
        }
      }
    };
    return c(Ut(Zn)), st.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), w = (
            /** @type {number} */
            _.get(v)
          );
          --w == 0 ? (x.removeEventListener(v, ft), _.delete(v), _.size === 0 && Ee.delete(x)) : _.set(v, w);
        }
      st.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return sr.set(u, l), u;
}
let sr = /* @__PURE__ */ new WeakMap();
function lr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Dn(e, "input", async (i) => {
    var s = i ? e.defaultValue : e.value;
    if (s = Me(e) ? Ce(s) : s, n(s), g !== null && r.add(g), await Hn(), s !== (s = t())) {
      var a = e.selectionStart, f = e.selectionEnd, u = e.value.length;
      if (e.value = s ?? "", f !== null) {
        var l = e.value.length;
        a === f && f === u && l > u ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = a, e.selectionEnd = Math.min(f, l));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Yt(t) == null && e.value && (n(Me(e) ? Ce(e.value) : e.value), g !== null && r.add(g)), Ot(() => {
    var i = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        g
      );
      if (r.has(s))
        return;
    }
    Me(e) && i === Ce(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function Me(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Ce(e) {
  return e === "" ? null : +e;
}
var fr = /* @__PURE__ */ tr('<div><textarea placeholder="Write notes..."></textarea> <span> </span></div>');
function ur(e) {
  let t = /* @__PURE__ */ q("");
  var n = fr(), r = et(n), i = Rn(r, 2), s = et(i);
  jn(() => Kn(s, `Length: ${V(t).length ?? ""}`)), lr(r, () => V(t), (a) => B(t, a)), nr(e, n);
}
function or(e) {
  return rr(ur, { target: e });
}
export {
  or as default,
  or as rvst_mount
};

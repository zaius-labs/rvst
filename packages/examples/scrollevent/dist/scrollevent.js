var Et = Array.isArray, on = Array.prototype.indexOf, we = Array.prototype.includes, Ye = Array.from, an = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, cn = Object.prototype, hn = Array.prototype, vn = Object.getPrototypeOf, ft = Object.isExtensible;
const dn = () => {
};
function _n(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function xt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Fe = 4, Ve = 8, Tt = 1 << 24, se = 16, U = 32, he = 64, We = 128, F = 512, x = 1024, k = 2048, $ = 4096, M = 8192, z = 16384, xe = 32768, ut = 1 << 25, Oe = 65536, ot = 1 << 17, pn = 1 << 18, Te = 1 << 19, gn = 1 << 20, J = 1 << 25, ve = 65536, Ge = 1 << 21, et = 1 << 22, re = 1 << 23, Ue = Symbol("$state"), X = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function wn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function mn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function bn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Tn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Sn = 1, kn = 2, An = 16, Rn = 2, S = Symbol(), Cn = "http://www.w3.org/1999/xhtml";
function Mn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function St(e) {
  return e === this.v;
}
function Nn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function kt(e) {
  return !Nn(e, this.v);
}
let H = null;
function me(e) {
  H = e;
}
function Fn(e, t = !1, n) {
  H = {
    p: H,
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
function On(e) {
  var t = (
    /** @type {ComponentContext} */
    H
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      nr(r);
  }
  return t.i = !0, H = t.p, /** @type {T} */
  {};
}
function At() {
  return !0;
}
let _e = [];
function Dn() {
  var e = _e;
  _e = [], _n(e);
}
function ae(e) {
  if (_e.length === 0) {
    var t = _e;
    queueMicrotask(() => {
      t === _e && Dn();
    });
  }
  _e.push(e);
}
function Rt(e) {
  var t = g;
  if (t === null)
    return p.f |= re, e;
  if ((t.f & xe) === 0 && (t.f & Fe) === 0)
    throw e;
  ne(e, t);
}
function ne(e, t) {
  for (; t !== null; ) {
    if ((t.f & We) !== 0) {
      if ((t.f & xe) === 0)
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
const Pn = -7169;
function E(e, t) {
  e.f = e.f & Pn | t;
}
function tt(e) {
  (e.f & F) !== 0 || e.deps === null ? E(e, x) : E(e, $);
}
function Ct(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & ve) === 0 || (t.f ^= ve, Ct(
        /** @type {Derived} */
        t.deps
      ));
}
function Mt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), Ct(e.deps), E(e, x);
}
const ee = /* @__PURE__ */ new Set();
let m = null, L = null, Xe = null, $e = !1, pe = null, ze = null;
var at = 0;
let In = 1;
class le {
  id = In++;
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
  #s = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #v = /* @__PURE__ */ new Set();
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
  #l = /* @__PURE__ */ new Map();
  is_fork = !1;
  #a = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #d() {
    for (const r of this.#u)
      for (const i of r.#f.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#l.has(n)) {
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
    this.#l.has(t) || this.#l.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#l.get(t);
    if (n) {
      this.#l.delete(t);
      for (var r of n.d)
        E(r, k), this.schedule(r);
      for (r of n.m)
        E(r, $), this.schedule(r);
    }
  }
  #h() {
    if (at++ > 1e3 && (ee.delete(this), Ln()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), E(f, k), this.schedule(f);
      for (const f of this.#n)
        E(f, $), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = pe = [], r = [], i = ze = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw Dt(f), u;
      }
    if (m = null, i.length > 0) {
      var l = le.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (pe = null, ze = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#l)
        Ot(f, u);
    } else {
      this.#r.size === 0 && ee.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), ct(r), ct(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    o !== null && (ee.add(o), o.#h()), ee.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & (U | he)) !== 0, f = o && (l & x) !== 0, u = f || (l & M) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= x : (l & Fe) !== 0 ? n.push(i) : Pe(i) && ((l & se) !== 0 && this.#n.add(i), Ee(i));
        var s = i.first;
        if (s !== null) {
          i = s;
          continue;
        }
      }
      for (; i !== null; ) {
        var c = i.next;
        if (c !== null) {
          i = c;
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
      Mt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== S && !this.previous.has(t) && this.previous.set(t, n), (t.f & re) === 0 && (this.current.set(t, [t.v, r]), L?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, L = null;
  }
  flush() {
    try {
      $e = !0, m = this, this.#h();
    } finally {
      at = 0, Xe = null, pe = null, ze = null, $e = !1, m = null, L = null, ie.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), ee.delete(this);
  }
  #w() {
    for (const s of ee) {
      var t = s.id < this.id, n = [];
      for (const [c, [h, v]] of this.current) {
        if (s.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(c)[0]
          );
          if (t && h !== r)
            s.current.set(c, [h, v]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...s.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of n)
          Nt(f, i, l, o);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#o(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of ee)
      s.#u.has(this) && (s.#u.delete(this), s.#u.size === 0 && !s.#c() && (s.activate(), s.#h()));
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
      let l = this.#f.get(n) ?? 0;
      l === 1 ? this.#f.delete(n) : this.#f.set(n, l - 1);
    }
    this.#a || r || (this.#a = !0, ae(() => {
      this.#a = !1, this.flush();
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
    this.#s.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= xt()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new le();
      $e || (ee.add(m), ae(() => {
        m === t && t.flush();
      }));
    }
    return m;
  }
  apply() {
    {
      L = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Xe = t, t.b?.is_pending && (t.f & (Fe | Ve | Tt)) !== 0 && (t.f & xe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (pe !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (he | U)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function Ln() {
  try {
    bn();
  } catch (e) {
    ne(e, Xe);
  }
}
let G = null;
function ct(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | M)) === 0 && Pe(r) && (G = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Wt(r), G?.size > 0)) {
        ie.clear();
        for (const i of G) {
          if ((i.f & (z | M)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (z | M)) === 0 && Ee(u);
          }
        }
        G.clear();
      }
    }
    G = null;
  }
}
function Nt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Nt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (et | se)) !== 0 && (l & k) === 0 && Ft(i, t, r) && (E(i, k), nt(
        /** @type {Effect} */
        i
      ));
    }
}
function Ft(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (we.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ft(
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
function nt(e) {
  m.schedule(e);
}
function Ot(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Ot(n, t), n = n.next;
  }
}
function Dt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Dt(t), t = t.next;
}
function qn(e) {
  let t = 0, n = de(0), r;
  return () => {
    lt() && (C(n), lr(() => (t === 0 && (r = cr(() => e(() => Me(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Me(n));
      });
    })));
  };
}
var zn = Oe | Te;
function jn(e, t, n, r) {
  new Hn(e, t, n, r);
}
class Hn {
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
  #s;
  /** @type {TemplateNode | null} */
  #v = null;
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
  #l = null;
  #a = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #_ = qn(() => (this.#o = de(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var o = (
        /** @type {Effect} */
        g
      );
      o.b = this, o.f |= We, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = $t(() => {
      this.#m();
    }, zn);
  }
  #w() {
    try {
      this.#e = B(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = B(() => {
      n(
        this.#s,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = B(() => t(this.#s)), ae(() => {
      var n = this.#l = document.createDocumentFragment(), r = Ne();
      n.append(r), this.#e = this.#g(() => B(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, ge(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = B(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Jt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = B(() => n(this.#s));
      } else
        this.#p(
          /** @type {Batch} */
          m
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Mt(t, this.#d, this.#h);
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
    var n = g, r = p, i = H;
    K(this.#i), D(this.#i), me(this.#i.ctx);
    try {
      return le.ensure(), t();
    } catch (l) {
      return Rt(l), null;
    } finally {
      K(n), D(r), me(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && ge(this.#t, () => {
      this.#t = null;
    }), this.#l && (this.#s.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, ae(() => {
      this.#c = !1, this.#o && be(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), C(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Mn();
        return;
      }
      i = !0, l && Tn(), this.#n !== null && ge(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (s) {
        ne(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return B(() => {
            var s = (
              /** @type {Effect} */
              g
            );
            s.b = this, s.f |= We, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (s) {
          return ne(
            s,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ae(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (s) {
        ne(s, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (s) => ne(s, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function Yn(e, t, n, r) {
  const i = It;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = Vn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function s(v) {
    f();
    try {
      r(v);
    } catch (d) {
      (o.f & z) === 0 && ne(d, o);
    }
    He();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var c = Pt();
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ Bn(v))).then((v) => s([...t.map(i), ...v])).catch((v) => ne(v, o)).finally(() => c());
  }
  u ? u.then(() => {
    f(), h(), He();
  }) : h();
}
function Vn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = H, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    K(e), D(t), me(n), l && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function He(e = !0) {
  K(null), D(null), me(null), e && m?.deactivate();
}
function Pt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    m
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function It(e) {
  var t = T | k, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Te), {
    ctx: H,
    deps: null,
    effects: null,
    equals: St,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      S
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Bn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && wn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = de(
    /** @type {V} */
    S
  ), o = !p, f = /* @__PURE__ */ new Map();
  return ir(() => {
    var u = (
      /** @type {Effect} */
      g
    ), s = xt();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(He);
    } catch (d) {
      s.reject(d), He();
    }
    var c = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((u.f & xe) !== 0)
        var h = Pt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(X), f.delete(c);
      else {
        for (const d of f.values())
          d.reject(X);
        f.clear();
      }
      f.set(c, s);
    }
    const v = (d, a = void 0) => {
      if (h) {
        var _ = a === X;
        h(_);
      }
      if (!(a === X || (u.f & z) !== 0)) {
        if (c.activate(), a)
          l.f |= re, be(l, a);
        else {
          (l.f & re) !== 0 && (l.f ^= re), be(l, d);
          for (const [y, b] of f) {
            if (f.delete(y), y === c) break;
            b.reject(X);
          }
        }
        c.deactivate();
      }
    };
    s.promise.then(v, (d) => v(null, d || "unknown"));
  }), Ut(() => {
    for (const u of f.values())
      u.reject(X);
  }), new Promise((u) => {
    function s(c) {
      function h() {
        c === i ? u(l) : s(i);
      }
      c.then(h, h);
    }
    s(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Un(e) {
  const t = /* @__PURE__ */ It(e);
  return t.equals = kt, t;
}
function $n(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      j(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Kn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function rt(e) {
  var t, n = g;
  K(Kn(e));
  try {
    e.f &= ~ve, $n(e), t = nn(e);
  } finally {
    K(n);
  }
  return t;
}
function Lt(e) {
  var t = e.v, n = rt(e);
  if (!e.equals(n) && (e.wv = en(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (L !== null ? (lt() || m?.is_fork) && L.set(e, n) : tt(e));
}
function Wn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(X), t.teardown = dn, t.ac = null, De(t, 0), st(t));
}
function qt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let Ze = /* @__PURE__ */ new Set();
const ie = /* @__PURE__ */ new Map();
let zt = !1;
function de(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: St,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
  const n = de(e);
  return ur(n), n;
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t = !1, n = !0) {
  const r = de(e);
  return t || (r.equals = kt), r;
}
function Z(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!q || (p.f & ot) !== 0) && At() && (p.f & (T | se | et | ot)) !== 0 && (O === null || !we.call(O, e)) && xn();
  let r = n ? Ae(t) : t;
  return be(e, r, ze);
}
function be(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ye ? ie.set(e, t) : ie.set(e, r), e.v = t;
    var i = le.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && rt(l), L === null && tt(l);
    }
    e.wv = en(), jt(e, k, n), g !== null && (g.f & x) !== 0 && (g.f & (U | he)) === 0 && (N === null ? or([e]) : N.push(e)), !i.is_fork && Ze.size > 0 && !zt && Xn();
  }
  return t;
}
function Xn() {
  zt = !1;
  for (const e of Ze)
    (e.f & x) !== 0 && E(e, $), Pe(e) && Ee(e);
  Ze.clear();
}
function Me(e) {
  Z(e, e.v + 1);
}
function jt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, u = (f & k) === 0;
      if (u && E(o, t), (f & T) !== 0) {
        var s = (
          /** @type {Derived} */
          o
        );
        L?.delete(s), (f & ve) === 0 && (f & F && (o.f |= ve), jt(s, $, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & se) !== 0 && G !== null && G.add(c), n !== null ? n.push(c) : nt(c);
      }
    }
}
function Ae(e) {
  if (typeof e != "object" || e === null || Ue in e)
    return e;
  const t = vn(e);
  if (t !== cn && t !== hn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Et(e), i = /* @__PURE__ */ V(0), l = ce, o = (f) => {
    if (ce === l)
      return f();
    var u = p, s = ce;
    D(null), pt(l);
    var c = f();
    return D(u), pt(s), c;
  };
  return r && n.set("length", /* @__PURE__ */ V(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && yn();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var h = /* @__PURE__ */ V(s.value);
          return n.set(u, h), h;
        }) : Z(c, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const c = o(() => /* @__PURE__ */ V(S));
            n.set(u, c), Me(i);
          }
        } else
          Z(s, S), Me(i);
        return !0;
      },
      get(f, u, s) {
        if (u === Ue)
          return e;
        var c = n.get(u), h = u in f;
        if (c === void 0 && (!h || Ce(f, u)?.writable) && (c = o(() => {
          var d = Ae(h ? f[u] : S), a = /* @__PURE__ */ V(d);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var v = C(c);
          return v === S ? void 0 : v;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var c = n.get(u);
          c && (s.value = C(c));
        } else if (s === void 0) {
          var h = n.get(u), v = h?.v;
          if (h !== void 0 && v !== S)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return s;
      },
      has(f, u) {
        if (u === Ue)
          return !0;
        var s = n.get(u), c = s !== void 0 && s.v !== S || Reflect.has(f, u);
        if (s !== void 0 || g !== null && (!c || Ce(f, u)?.writable)) {
          s === void 0 && (s = o(() => {
            var v = c ? Ae(f[u]) : S, d = /* @__PURE__ */ V(v);
            return d;
          }), n.set(u, s));
          var h = C(s);
          if (h === S)
            return !1;
        }
        return c;
      },
      set(f, u, s, c) {
        var h = n.get(u), v = u in f;
        if (r && u === "length")
          for (var d = s; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? Z(a, S) : d in f && (a = o(() => /* @__PURE__ */ V(S)), n.set(d + "", a));
          }
        if (h === void 0)
          (!v || Ce(f, u)?.writable) && (h = o(() => /* @__PURE__ */ V(void 0)), Z(h, Ae(s)), n.set(u, h));
        else {
          v = h.v !== S;
          var _ = o(() => Ae(s));
          Z(h, _);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(c, s), !v) {
          if (r && typeof u == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), w = Number(u);
            Number.isInteger(w) && w >= b.v && Z(b, w + 1);
          }
          Me(i);
        }
        return !0;
      },
      ownKeys(f) {
        C(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var v = n.get(h);
          return v === void 0 || v.v !== S;
        });
        for (var [s, c] of n)
          c.v !== S && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        En();
      }
    }
  );
}
var ht, Ht, Yt, Vt;
function Zn() {
  if (ht === void 0) {
    ht = window, Ht = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Yt = Ce(t, "firstChild").get, Vt = Ce(t, "nextSibling").get, ft(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ft(n) && (n.__t = void 0);
  }
}
function Ne(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
  return (
    /** @type {TemplateNode | null} */
    Yt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    Vt.call(e)
  );
}
function Ie(e, t) {
  return /* @__PURE__ */ Bt(e);
}
function vt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Jn(e) {
  e.textContent = "";
}
function Qn() {
  return !1;
}
function er(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Cn, e, void 0)
  );
}
function it(e) {
  var t = p, n = g;
  D(null), K(null);
  try {
    return e();
  } finally {
    D(t), K(n);
  }
}
function tr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function fe(e, t) {
  var n = g;
  n !== null && (n.f & M) !== 0 && (e |= M);
  var r = {
    ctx: H,
    deps: null,
    nodes: null,
    f: e | k | F,
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
  if ((e & Fe) !== 0)
    pe !== null ? pe.push(r) : le.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw j(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & se) !== 0 && (e & Oe) !== 0 && i !== null && (i.f |= Oe));
  }
  if (i !== null && (i.parent = n, n !== null && tr(i, n), p !== null && (p.f & T) !== 0 && (e & he) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function lt() {
  return p !== null && !q;
}
function Ut(e) {
  const t = fe(Ve, null);
  return E(t, x), t.teardown = e, t;
}
function nr(e) {
  return fe(Fe | gn, e);
}
function rr(e) {
  le.ensure();
  const t = fe(he | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function ir(e) {
  return fe(et | Te, e);
}
function lr(e, t = 0) {
  return fe(Ve | t, e);
}
function dt(e, t = [], n = [], r = []) {
  Yn(r, t, n, (i) => {
    fe(Ve, () => e(...i.map(C)));
  });
}
function $t(e, t = 0) {
  var n = fe(se | t, e);
  return n;
}
function B(e) {
  return fe(U | Te, e);
}
function Kt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    _t(!0), D(null);
    try {
      t.call(null);
    } finally {
      _t(n), D(r);
    }
  }
}
function st(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && it(() => {
      i.abort(X);
    });
    var r = n.next;
    (n.f & he) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function sr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (fr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, ut), st(e, t && !n), De(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Kt(e), e.f ^= ut, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Wt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function fr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Wt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ge(e, t, n = !0) {
  var r = [];
  Gt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Gt(e, t, n) {
  if ((e.f & M) === 0) {
    e.f ^= M;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Oe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & se) !== 0;
      Gt(i, t, o ? n : !1), i = l;
    }
  }
}
function Xt(e) {
  Zt(e, !0);
}
function Zt(e, t) {
  if ((e.f & M) !== 0) {
    e.f ^= M, (e.f & x) === 0 && (E(e, k), le.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Oe) !== 0 || (n.f & U) !== 0;
      Zt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Jt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let je = !1, ye = !1;
function _t(e) {
  ye = e;
}
let p = null, q = !1;
function D(e) {
  p = e;
}
let g = null;
function K(e) {
  g = e;
}
let O = null;
function ur(e) {
  p !== null && (O === null ? O = [e] : O.push(e));
}
let A = null, R = 0, N = null;
function or(e) {
  N = e;
}
let Qt = 1, oe = 0, ce = oe;
function pt(e) {
  ce = e;
}
function en() {
  return ++Qt;
}
function Pe(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & T && (e.f &= ~ve), (t & $) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Pe(
        /** @type {Derived} */
        l
      ) && Lt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & F) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    L === null && E(e, x);
  }
  return !1;
}
function tn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && we.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? tn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, k) : (l.f & x) !== 0 && E(l, $), nt(
        /** @type {Effect} */
        l
      ));
    }
}
function nn(e) {
  var t = A, n = R, r = N, i = p, l = O, o = H, f = q, u = ce, s = e.f;
  A = /** @type {null | Value[]} */
  null, R = 0, N = null, p = (s & (U | he)) === 0 ? e : null, O = null, me(e.ctx), q = !1, ce = ++oe, e.ac !== null && (it(() => {
    e.ac.abort(X);
  }), e.ac = null);
  try {
    e.f |= Ge;
    var c = (
      /** @type {Function} */
      e.fn
    ), h = c();
    e.f |= xe;
    var v = e.deps, d = m?.is_fork;
    if (A !== null) {
      var a;
      if (d || De(e, R), v !== null && R > 0)
        for (v.length = R + A.length, a = 0; a < A.length; a++)
          v[R + a] = A[a];
      else
        e.deps = v = A;
      if (lt() && (e.f & F) !== 0)
        for (a = R; a < v.length; a++)
          (v[a].reactions ??= []).push(e);
    } else !d && v !== null && R < v.length && (De(e, R), v.length = R);
    if (At() && N !== null && !q && v !== null && (e.f & (T | $ | k)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      N.length; a++)
        tn(
          N[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (oe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = oe;
      if (t !== null)
        for (const _ of t)
          _.rv = oe;
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & re) !== 0 && (e.f ^= re), h;
  } catch (_) {
    return Rt(_);
  } finally {
    e.f ^= Ge, A = t, R = n, N = r, p = i, O = l, me(o), q = f, ce = u;
  }
}
function ar(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = on.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !we.call(A, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & F) !== 0 && (l.f ^= F, l.f &= ~ve), tt(l), Wn(l), De(l, 0);
  }
}
function De(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ar(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & z) === 0) {
    E(e, x);
    var n = g, r = je;
    g = e, je = !0;
    try {
      (t & (se | Tt)) !== 0 ? sr(e) : st(e), Kt(e);
      var i = nn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Qt;
      var l;
    } finally {
      je = r, g = n;
    }
  }
}
function C(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !q) {
    var r = g !== null && (g.f & z) !== 0;
    if (!r && (O === null || !we.call(O, e))) {
      var i = p.deps;
      if ((p.f & Ge) !== 0)
        e.rv < oe && (e.rv = oe, A === null && i !== null && i[R] === e ? R++ : A === null ? A = [e] : A.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : we.call(l, p) || l.push(p);
      }
    }
  }
  if (ye && ie.has(e))
    return ie.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ye) {
      var f = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || ln(o)) && (f = rt(o)), ie.set(o, f), f;
    }
    var u = (o.f & F) === 0 && !q && p !== null && (je || (p.f & F) !== 0), s = (o.f & xe) === 0;
    Pe(o) && (u && (o.f |= F), Lt(o)), u && !s && (qt(o), rn(o));
  }
  if (L?.has(e))
    return L.get(e);
  if ((e.f & re) !== 0)
    throw e.v;
  return e.v;
}
function rn(e) {
  if (e.f |= F, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & F) === 0 && (qt(
        /** @type {Derived} */
        t
      ), rn(
        /** @type {Derived} */
        t
      ));
}
function ln(e) {
  if (e.v === S) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ie.has(t) || (t.f & T) !== 0 && ln(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function cr(e) {
  var t = q;
  try {
    return q = !0, e();
  } finally {
    q = t;
  }
}
const gt = globalThis.Deno?.core?.ops ?? null;
function hr(e, ...t) {
  gt?.[e] ? gt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ke(e, t) {
  hr("op_set_text", e, t);
}
const vr = ["touchstart", "touchmove"];
function dr(e) {
  return vr.includes(e);
}
const Le = Symbol("events"), _r = /* @__PURE__ */ new Set(), wt = /* @__PURE__ */ new Set();
function pr(e, t, n, r = {}) {
  function i(l) {
    if (r.capture || Je.call(t, l), !l.cancelBubble)
      return it(() => n?.call(this, l));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ae(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function gr(e, t, n, r, i) {
  var l = { capture: r, passive: i }, o = pr(e, t, n, l);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ut(() => {
    t.removeEventListener(e, o, l);
  });
}
let mt = null;
function Je(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  mt = e;
  var o = 0, f = mt === e && e[Le];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Le] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, h = g;
    D(null), K(null);
    try {
      for (var v, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Le]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (y) {
          v ? d.push(y) : v = y;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (v) {
        for (let y of d)
          queueMicrotask(() => {
            throw y;
          });
        throw v;
      }
    } finally {
      e[Le] = t, delete e.currentTarget, D(c), K(h);
    }
  }
}
const wr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function mr(e) {
  return (
    /** @type {string} */
    wr?.createHTML(e) ?? e
  );
}
function br(e) {
  var t = er("template");
  return t.innerHTML = mr(e.replaceAll("<!>", "<!---->")), t.content;
}
function yr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function sn(e, t) {
  var n = (t & Rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = br(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Bt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Ht ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return yr(l, l), l;
  };
}
function bt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Er(e, t) {
  return xr(e, t);
}
const qe = /* @__PURE__ */ new Map();
function xr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  Zn();
  var u = void 0, s = rr(() => {
    var c = n ?? t.appendChild(Ne());
    jn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Fn({});
        var a = (
          /** @type {ComponentContext} */
          H
        );
        l && (a.c = l), i && (r.$$events = i), u = e(d, r) || {}, On();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), v = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!h.has(_)) {
          h.add(_);
          var y = dr(_);
          for (const P of [t, document]) {
            var b = qe.get(P);
            b === void 0 && (b = /* @__PURE__ */ new Map(), qe.set(P, b));
            var w = b.get(_);
            w === void 0 ? (P.addEventListener(_, Je, { passive: y }), b.set(_, 1)) : b.set(_, w + 1);
          }
        }
      }
    };
    return v(Ye(_r)), wt.add(v), () => {
      for (var d of h)
        for (const y of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            qe.get(y)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (y.removeEventListener(d, Je), a.delete(d), a.size === 0 && qe.delete(y)) : a.set(d, _);
        }
      wt.delete(v), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Tr.set(u, s), u;
}
let Tr = /* @__PURE__ */ new WeakMap();
function Sr(e, t) {
  return t;
}
function kr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, f = 0; f < i; f++) {
    let h = t[f];
    ge(
      h,
      () => {
        if (l) {
          if (l.pending.delete(h), l.done.add(h), l.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Qe(e, Ye(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var u = r.length === 0 && n !== null;
    if (u) {
      var s = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        s.parentNode
      );
      Jn(c), c.append(s), e.items.clear();
    }
    Qe(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Qe(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const f of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= J;
      const o = document.createDocumentFragment();
      Jt(l, o);
    } else
      j(t[i], n);
  }
}
var yt;
function Ar(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map();
  {
    var u = (
      /** @type {Element} */
      e
    );
    o = u.appendChild(Ne());
  }
  var s = null, c = /* @__PURE__ */ Un(() => {
    var w = n();
    return Et(w) ? w : w == null ? [] : Ye(w);
  }), h, v = /* @__PURE__ */ new Map(), d = !0;
  function a(w) {
    (b.effect.f & z) === 0 && (b.pending.delete(w), b.fallback = s, Rr(b, h, o, t, r), s !== null && (h.length === 0 ? (s.f & J) === 0 ? Xt(s) : (s.f ^= J, Re(s, null, o)) : ge(s, () => {
      s = null;
    })));
  }
  function _(w) {
    b.pending.delete(w);
  }
  var y = $t(() => {
    h = /** @type {V[]} */
    C(c);
    for (var w = h.length, P = /* @__PURE__ */ new Set(), Y = (
      /** @type {Batch} */
      m
    ), ue = Qn(), Q = 0; Q < w; Q += 1) {
      var Se = h[Q], I = r(Se, Q), W = d ? null : f.get(I);
      W ? (W.v && be(W.v, Se), W.i && be(W.i, Q), ue && Y.unskip_effect(W.e)) : (W = Cr(
        f,
        d ? o : yt ??= Ne(),
        Se,
        I,
        Q,
        i,
        t,
        n
      ), d || (W.e.f |= J), f.set(I, W)), P.add(I);
    }
    if (w === 0 && l && !s && (d ? s = B(() => l(o)) : (s = B(() => l(yt ??= Ne())), s.f |= J)), w > P.size && mn(), !d)
      if (v.set(Y, P), ue) {
        for (const [fn, un] of f)
          P.has(fn) || Y.skip_effect(un.e);
        Y.oncommit(a), Y.ondiscard(_);
      } else
        a(Y);
    C(c);
  }), b = { effect: y, items: f, pending: v, outrogroups: null, fallback: s };
  d = !1;
}
function ke(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Rr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = ke(e.effect.first), u, s = null, c = [], h = [], v, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], d = i(v, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const I of e.outrogroups)
        I.pending.delete(a), I.done.delete(a);
    if ((a.f & M) !== 0 && Xt(a), (a.f & J) !== 0)
      if (a.f ^= J, a === f)
        Re(a, null, n);
      else {
        var y = s ? s.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), te(e, s, a), te(e, a, y), Re(a, y, n), s = a, c = [], h = [], f = ke(s.next);
        continue;
      }
    if (a !== f) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < h.length) {
          var b = h[0], w;
          s = b.prev;
          var P = c[0], Y = c[c.length - 1];
          for (w = 0; w < c.length; w += 1)
            Re(c[w], b, n);
          for (w = 0; w < h.length; w += 1)
            u.delete(h[w]);
          te(e, P.prev, Y.next), te(e, s, P), te(e, Y, b), f = b, s = Y, _ -= 1, c = [], h = [];
        } else
          u.delete(a), Re(a, f, n), te(e, a.prev, a.next), te(e, a, s === null ? e.effect.first : s.next), te(e, s, a), s = a;
        continue;
      }
      for (c = [], h = []; f !== null && f !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(f), h.push(f), f = ke(f.next);
      if (f === null)
        continue;
    }
    (a.f & J) === 0 && c.push(a), s = a, f = ke(a.next);
  }
  if (e.outrogroups !== null) {
    for (const I of e.outrogroups)
      I.pending.size === 0 && (Qe(e, Ye(I.done)), e.outrogroups?.delete(I));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || u !== void 0) {
    var ue = [];
    if (u !== void 0)
      for (a of u)
        (a.f & M) === 0 && ue.push(a);
    for (; f !== null; )
      (f.f & M) === 0 && f !== e.fallback && ue.push(f), f = ke(f.next);
    var Q = ue.length;
    if (Q > 0) {
      var Se = l === 0 ? n : null;
      kr(e, ue, Se);
    }
  }
}
function Cr(e, t, n, r, i, l, o, f) {
  var u = (o & Sn) !== 0 ? (o & An) === 0 ? /* @__PURE__ */ Gn(n, !1, !1) : de(n) : null, s = (o & kn) !== 0 ? de(i) : null;
  return {
    v: u,
    i: s,
    e: B(() => (l(t, u ?? n, s ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Re(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & J) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Be(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function te(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Mr = /* @__PURE__ */ sn('<div style="height: 30px;"> </div>'), Nr = /* @__PURE__ */ sn('<div><div> </div> <div> </div> <div style="height: 150px; overflow: auto;"></div></div>');
function Fr(e) {
  let t = /* @__PURE__ */ V(0), n = /* @__PURE__ */ V(0), r = Array.from({ length: 30 }, (h, v) => `Row ${v + 1}`);
  function i(h) {
    Z(t, C(t) + 1), Z(n, Math.round(h.target.scrollTop), !0);
  }
  var l = Nr(), o = Ie(l), f = Ie(o), u = vt(o, 2), s = Ie(u), c = vt(u, 2);
  Ar(c, 21, () => r, Sr, (h, v) => {
    var d = Mr(), a = Ie(d);
    dt(() => Ke(a, C(v))), bt(h, d);
  }), dt(() => {
    Ke(f, `Scrolled: ${C(t) ?? ""}`), Ke(s, `Offset: ${C(n) ?? ""}`);
  }), gr("scroll", c, i), bt(e, l);
}
function Dr(e) {
  return Er(Fr, { target: e });
}
export {
  Dr as default,
  Dr as rvst_mount
};

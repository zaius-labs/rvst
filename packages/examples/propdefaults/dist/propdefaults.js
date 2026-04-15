var Vt = Array.isArray, Gt = Array.prototype.indexOf, ae = Array.prototype.includes, Kt = Array.from, Wt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, $t = Object.prototype, Zt = Array.prototype, Jt = Object.getPrototypeOf, Ze = Object.isExtensible;
const Qt = () => {
};
function Xt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ot() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, be = 4, De = 8, ct = 1 << 24, Q = 16, G = 32, ne = 64, Ce = 128, D = 512, b = 1024, k = 2048, q = 4096, j = 8192, L = 16384, de = 32768, Je = 1 << 25, ue = 65536, Qe = 1 << 17, en = 1 << 18, ve = 1 << 19, tn = 1 << 20, re = 65536, Pe = 1 << 21, Be = 1 << 22, $ = 1 << 23, Oe = Symbol("$state"), H = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function nn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function rn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ln() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function an() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const un = 2, E = Symbol(), on = "http://www.w3.org/1999/xhtml";
function cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ht(e) {
  return e === this.v;
}
let P = null;
function oe(e) {
  P = e;
}
function hn(e, t = !1, n) {
  P = {
    p: P,
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
function dn(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Pn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function dt() {
  return !0;
}
let se = [];
function vn() {
  var e = se;
  se = [], Xt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && vn();
    });
  }
  se.push(e);
}
function vt(e) {
  var t = p;
  if (t === null)
    return _.f |= $, e;
  if ((t.f & de) === 0 && (t.f & be) === 0)
    throw e;
  W(e, t);
}
function W(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ce) !== 0) {
      if ((t.f & de) === 0)
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
const _n = -7169;
function m(e, t) {
  e.f = e.f & _n | t;
}
function He(e) {
  (e.f & D) !== 0 || e.deps === null ? m(e, b) : m(e, q);
}
function _t(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, _t(
        /** @type {Derived} */
        t.deps
      ));
}
function pt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), _t(e.deps), m(e, b);
}
const K = /* @__PURE__ */ new Set();
let w = null, F = null, Ie = null, Fe = !1, le = null, ke = null;
var Xe = 0;
let pn = 1;
class J {
  id = pn++;
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
  #a = /* @__PURE__ */ new Set();
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
  #u = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#u)
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, q), this.schedule(r);
    }
  }
  #d() {
    if (Xe++ > 1e3 && (K.delete(this), gn()), !this.#h()) {
      for (const f of this.#s)
        this.#l.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#l)
        m(f, q), this.schedule(f);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = ke = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (a) {
        throw bt(f), a;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, ke = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, a] of this.#f)
        mt(f, a);
    } else {
      this.#e.size === 0 && K.delete(this), this.#s.clear(), this.#l.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), et(r), et(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const f = u ??= this;
      f.#n.push(...this.#n.filter((a) => !f.#n.includes(a)));
    }
    u !== null && (K.add(u), u.#d()), K.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, u = (s & (G | ne)) !== 0, f = u && (s & b) !== 0, a = f || (s & j) !== 0 || this.#f.has(i);
      if (!a && i.fn !== null) {
        u ? i.f ^= b : (s & be) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
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
  #_(t) {
    for (var n = 0; n < t.length; n += 1)
      pt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & $) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#d();
    } finally {
      Xe = 0, Ie = null, le = null, ke = null, Fe = !1, w = null, F = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), K.delete(this);
  }
  #w() {
    for (const l of K) {
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
        var s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (var f of n)
          gt(f, i, s, u);
        if (l.#n.length > 0) {
          l.apply();
          for (var a of l.#n)
            l.#o(a, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of K)
      l.#u.has(this) && (l.#u.delete(this), l.#u.size === 0 && !l.#h() && (l.activate(), l.#d()));
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
    this.#c || r || (this.#c = !0, fe(() => {
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
    this.#a.add(t);
  }
  settled() {
    return (this.#i ??= ot()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Fe || (K.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      F = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ie = t, t.b?.is_pending && (t.f & (be | De | ct)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (ne | G)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function gn() {
  try {
    rn();
  } catch (e) {
    W(e, Ie);
  }
}
let z = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | j)) === 0 && Ee(r) && (z = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), z?.size > 0)) {
        Z.clear();
        for (const i of z) {
          if ((i.f & (L | j)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            z.has(u) && (z.delete(u), s.push(u)), u = u.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const a = s[f];
            (a.f & (L | j)) === 0 && he(a);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function gt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? gt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | Q)) !== 0 && (s & k) === 0 && wt(i, t, r) && (m(i, k), Ue(
        /** @type {Effect} */
        i
      ));
    }
}
function wt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && wt(
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
function Ue(e) {
  w.schedule(e);
}
function mt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      mt(n, t), n = n.next;
  }
}
function bt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    bt(t), t = t.next;
}
function wn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Ke() && (V(n), Ln(() => (t === 0 && (r = Gn(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var mn = ue | ve;
function bn(e, t, n, r) {
  new yn(e, t, n, r);
}
class yn {
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
  #a = null;
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
  #u = 0;
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
  #o = null;
  #_ = wn(() => (this.#o = Ne(this.#c), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#r = (s) => {
      var u = (
        /** @type {Effect} */
        p
      );
      u.b = this, u.f |= Ce, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Mt(() => {
      this.#m();
    }, mn);
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
    t && (this.is_pending = !0, this.#s = B(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Re();
      n.append(r), this.#n = this.#g(() => B(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, me(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = B(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        It(this.#n, t);
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
    pt(t, this.#v, this.#d);
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
    var n = p, r = _, i = P;
    Y(this.#i), M(this.#i), oe(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return vt(s), null;
    } finally {
      Y(n), M(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && me(this.#s, () => {
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
    this.#b(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#o && Ae(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), V(
      /** @type {Source<number>} */
      this.#o
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
    const u = () => {
      if (i) {
        cn();
        return;
      }
      i = !0, s && an(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (a) => {
      try {
        s = !0, n?.(a, u), s = !1;
      } catch (l) {
        W(l, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return B(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Ce, r(
              this.#t,
              () => a,
              () => u
            );
          });
        } catch (l) {
          return W(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (l) {
        W(l, this.#i && this.#i.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        f,
        /** @param {unknown} e */
        (l) => W(l, this.#i && this.#i.parent)
      ) : f(a);
    });
  }
}
function En(e, t, n, r) {
  const i = kn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    p
  ), f = xn(), a = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (u.f & L) === 0 && W(v, u);
    }
    Se();
  }
  if (n.length === 0) {
    a.then(() => l(t.map(i)));
    return;
  }
  var o = yt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Tn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => W(c, u)).finally(() => o());
  }
  a ? a.then(() => {
    f(), h(), Se();
  }) : h();
}
function xn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), M(t), oe(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  Y(null), M(null), oe(null), e && w?.deactivate();
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
    w
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function kn(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
    deps: null,
    effects: null,
    equals: ht,
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
function Tn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && nn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), u = !_, f = /* @__PURE__ */ new Map();
  return jn(() => {
    var a = (
      /** @type {Effect} */
      p
    ), l = ot();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (v) {
      l.reject(v), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (u) {
      if ((a.f & de) !== 0)
        var h = yt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(H), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(H);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === H;
        h(g);
      }
      if (!(d === H || (a.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= $, Ae(s, d);
        else {
          (s.f & $) !== 0 && (s.f ^= $), Ae(s, v);
          for (const [x, O] of f) {
            if (f.delete(x), x === o) break;
            O.reject(H);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Cn(() => {
    for (const a of f.values())
      a.reject(H);
  }), new Promise((a) => {
    function l(o) {
      function h() {
        o === i ? a(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function Sn(e) {
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
function An(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = p;
  Y(An(e));
  try {
    e.f &= ~re, Sn(e), t = Yt(e);
  } finally {
    Y(n);
  }
  return t;
}
function Et(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Lt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (F !== null ? (Ke() || w?.is_fork) && F.set(e, n) : He(e));
}
function Rn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(H), t.teardown = Qt, t.ac = null, ye(t, 0), We(t));
}
function xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let je = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let kt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ht,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  const n = Ne(e);
  return Hn(n), n;
}
function U(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (_.f & Qe) !== 0) && dt() && (_.f & (y | Q | Be | Qe)) !== 0 && (N === null || !ae.call(N, e)) && fn();
  let r = n ? _e(t) : t;
  return Ae(e, r, ke);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), F === null && He(s);
    }
    e.wv = Lt(), Tt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (G | ne)) === 0 && (R === null ? Un([e]) : R.push(e)), !i.is_fork && je.size > 0 && !kt && Dn();
  }
  return t;
}
function Dn() {
  kt = !1;
  for (const e of je)
    (e.f & b) !== 0 && m(e, q), Ee(e) && he(e);
  je.clear();
}
function we(e) {
  U(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], f = u.f, a = (f & k) === 0;
      if (a && m(u, t), (f & y) !== 0) {
        var l = (
          /** @type {Derived} */
          u
        );
        F?.delete(l), (f & re) === 0 && (f & D && (u.f |= re), Tt(l, q, n));
      } else if (a) {
        var o = (
          /** @type {Effect} */
          u
        );
        (f & Q) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Jt(e);
  if (t !== $t && t !== Zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vt(e), i = /* @__PURE__ */ I(0), s = te, u = (f) => {
    if (te === s)
      return f();
    var a = _, l = te;
    M(null), rt(s);
    var o = f();
    return M(a), rt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, a, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && sn();
        var o = n.get(a);
        return o === void 0 ? u(() => {
          var h = /* @__PURE__ */ I(l.value);
          return n.set(a, h), h;
        }) : U(o, l.value, !0), !0;
      },
      deleteProperty(f, a) {
        var l = n.get(a);
        if (l === void 0) {
          if (a in f) {
            const o = u(() => /* @__PURE__ */ I(E));
            n.set(a, o), we(i);
          }
        } else
          U(l, E), we(i);
        return !0;
      },
      get(f, a, l) {
        if (a === Oe)
          return e;
        var o = n.get(a), h = a in f;
        if (o === void 0 && (!h || ge(f, a)?.writable) && (o = u(() => {
          var v = _e(h ? f[a] : E), d = /* @__PURE__ */ I(v);
          return d;
        }), n.set(a, o)), o !== void 0) {
          var c = V(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, a, l);
      },
      getOwnPropertyDescriptor(f, a) {
        var l = Reflect.getOwnPropertyDescriptor(f, a);
        if (l && "value" in l) {
          var o = n.get(a);
          o && (l.value = V(o));
        } else if (l === void 0) {
          var h = n.get(a), c = h?.v;
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
      has(f, a) {
        if (a === Oe)
          return !0;
        var l = n.get(a), o = l !== void 0 && l.v !== E || Reflect.has(f, a);
        if (l !== void 0 || p !== null && (!o || ge(f, a)?.writable)) {
          l === void 0 && (l = u(() => {
            var c = o ? _e(f[a]) : E, v = /* @__PURE__ */ I(c);
            return v;
          }), n.set(a, l));
          var h = V(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, a, l, o) {
        var h = n.get(a), c = a in f;
        if (r && a === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? U(d, E) : v in f && (d = u(() => /* @__PURE__ */ I(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(f, a)?.writable) && (h = u(() => /* @__PURE__ */ I(void 0)), U(h, _e(l)), n.set(a, h));
        else {
          c = h.v !== E;
          var g = u(() => _e(l));
          U(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, a);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof a == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(a);
            Number.isInteger(ie) && ie >= O.v && U(O, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        V(i);
        var a = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && a.push(l);
        return a;
      },
      setPrototypeOf() {
        ln();
      }
    }
  );
}
var tt, St, At, Rt;
function Nn() {
  if (tt === void 0) {
    tt = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    At = ge(t, "firstChild").get, Rt = ge(t, "nextSibling").get, Ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ze(n) && (n.__t = void 0);
  }
}
function Re(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Dt(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ge(e) {
  return (
    /** @type {TemplateNode | null} */
    Rt.call(e)
  );
}
function Le(e, t) {
  return /* @__PURE__ */ Dt(e);
}
function qe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ge(r);
  return r;
}
function Mn() {
  return !1;
}
function On(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(on, e, void 0)
  );
}
function Nt(e) {
  var t = _, n = p;
  M(null), Y(null);
  try {
    return e();
  } finally {
    M(t), Y(n);
  }
}
function Fn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & j) !== 0 && (e |= j);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | k | D,
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
  if ((e & be) !== 0)
    le !== null ? le.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (u) {
      throw A(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & ue) !== 0 && i !== null && (i.f |= ue));
  }
  if (i !== null && (i.parent = n, n !== null && Fn(i, n), _ !== null && (_.f & y) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return _ !== null && !C;
}
function Cn(e) {
  const t = X(De, null);
  return m(t, b), t.teardown = e, t;
}
function Pn(e) {
  return X(be | tn, e);
}
function In(e) {
  J.ensure();
  const t = X(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function jn(e) {
  return X(Be | ve, e);
}
function Ln(e, t = 0) {
  return X(De | t, e);
}
function qn(e, t = [], n = [], r = []) {
  En(r, t, n, (i) => {
    X(De, () => e(...i.map(V)));
  });
}
function Mt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function B(e) {
  return X(G | ve, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    nt(!0), M(null);
    try {
      t.call(null);
    } finally {
      nt(n), M(r);
    }
  }
}
function We(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort(H);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Yn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & en) !== 0) && e.nodes !== null && e.nodes.end !== null && (zn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Je), We(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ot(e), e.f ^= Je, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ge(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var f of r)
      f.out(u);
  } else
    i();
}
function Ct(e, t, n) {
  if ((e.f & j) === 0) {
    e.f ^= j;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & ue) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Q) !== 0;
      Ct(i, t, u ? n : !1), i = s;
    }
  }
}
function Bn(e) {
  Pt(e, !0);
}
function Pt(e, t) {
  if ((e.f & j) !== 0) {
    e.f ^= j, (e.f & b) === 0 && (m(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ue) !== 0 || (n.f & G) !== 0;
      Pt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function It(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ge(n);
      t.append(n), n = i;
    }
}
let Te = !1, ce = !1;
function nt(e) {
  ce = e;
}
let _ = null, C = !1;
function M(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let N = null;
function Hn(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, R = null;
function Un(e) {
  R = e;
}
let jt = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function Lt() {
  return ++jt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && Et(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, b);
  }
  return !1;
}
function qt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ae.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? qt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, q), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Yt(e) {
  var t = T, n = S, r = R, i = _, s = N, u = P, f = C, a = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, _ = (l & (G | ne)) === 0 ? e : null, N = null, oe(e.ctx), C = !1, te = ++ee, e.ac !== null && (Nt(() => {
    e.ac.abort(H);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || ye(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ke() && (e.f & D) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (ye(e, S), c.length = S);
    if (dt() && R !== null && !C && c !== null && (e.f & (y | q | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        qt(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = ee;
      if (t !== null)
        for (const g of t)
          g.rv = ee;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & $) !== 0 && (e.f ^= $), h;
  } catch (g) {
    return vt(g);
  } finally {
    e.f ^= Pe, T = t, S = n, R = r, _ = i, N = s, oe(u), C = f, te = a;
  }
}
function Vn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Gt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~re), He(s), Rn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Q | ct)) !== 0 ? Yn(e) : We(e), Ot(e);
      var i = Yt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = jt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function V(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !C) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (N === null || !ae.call(N, e))) {
      var i = _.deps;
      if ((_.f & Pe) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var f = u.v;
      return ((u.f & b) === 0 && u.reactions !== null || Bt(u)) && (f = Ve(u)), Z.set(u, f), f;
    }
    var a = (u.f & D) === 0 && !C && _ !== null && (Te || (_.f & D) !== 0), l = (u.f & de) === 0;
    Ee(u) && (a && (u.f |= D), Et(u)), a && !l && (xt(u), zt(u));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & $) !== 0)
    throw e.v;
  return e.v;
}
function zt(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & D) === 0 && (xt(
        /** @type {Derived} */
        t
      ), zt(
        /** @type {Derived} */
        t
      ));
}
function Bt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & y) !== 0 && Bt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Gn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Kn(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Wn(e, t) {
  Kn("op_set_text", e, t);
}
const $n = ["touchstart", "touchmove"];
function Zn(e) {
  return $n.includes(e);
}
const pe = Symbol("events"), Ht = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function st(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Jn(e) {
  for (var t = 0; t < e.length; t++)
    Ht.add(e[t]);
  for (var n of Ye)
    n(e);
}
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
  var u = 0, f = lt === e && e[pe];
  if (f) {
    var a = i.indexOf(f);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    a <= l && (u = a);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Wt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    M(null), Y(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, M(o), Y(h);
    }
  }
}
const Qn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Xn(e) {
  return (
    /** @type {string} */
    Qn?.createHTML(e) ?? e
  );
}
function er(e) {
  var t = On("template");
  return t.innerHTML = Xn(e.replaceAll("<!>", "<!---->")), t.content;
}
function tr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function $e(e, t) {
  var n = (t & un) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = er(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Dt(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return tr(s, s), s;
  };
}
function ze(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function nr(e, t) {
  return rr(e, t);
}
const xe = /* @__PURE__ */ new Map();
function rr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: f }) {
  Nn();
  var a = void 0, l = In(() => {
    var o = n ?? t.appendChild(Re());
    bn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        hn({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), a = e(v, r) || {}, dn();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Zn(g);
          for (const Me of [t, document]) {
            var O = xe.get(Me);
            O === void 0 && (O = /* @__PURE__ */ new Map(), xe.set(Me, O));
            var ie = O.get(g);
            ie === void 0 ? (Me.addEventListener(g, ft, { passive: x }), O.set(g, 1)) : O.set(g, ie + 1);
          }
        }
      }
    };
    return c(Kt(Ht)), Ye.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, ft), d.delete(v), d.size === 0 && xe.delete(x)) : d.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return ir.set(a, l), a;
}
let ir = /* @__PURE__ */ new WeakMap();
class sr {
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
  #a = /* @__PURE__ */ new Map();
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
      ), r = this.#a.get(n);
      if (r)
        Bn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const f = this.#e.get(u);
        f && (A(f.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#a) {
        if (s === n || this.#r.has(s)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var l = document.createDocumentFragment();
            It(u, l), l.append(Re()), this.#e.set(s, { effect: u, fragment: l });
          } else
            A(u);
          this.#r.delete(s), this.#a.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), me(u, f, !1)) : f();
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
    ), i = Mn();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = Re();
        s.append(u), this.#e.set(t, {
          effect: B(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          B(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [f, a] of this.#a)
        f === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [f, a] of this.#e)
        f === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function Ut(e, t, n = !1) {
  var r = new sr(e), i = n ? ue : 0;
  function s(u, f) {
    r.ensure(u, f);
  }
  Mt(() => {
    var u = !1;
    t((f, a = 0) => {
      u = !0, s(a, f);
    }), u || s(-1, null);
  }, i);
}
function at(e, t, n, r) {
  var i = (
    /** @type {V} */
    r
  ), s = !0, u = () => (s && (s = !1, i = /** @type {V} */
  r), i), f;
  f = /** @type {V} */
  e[t], f === void 0 && r !== void 0 && (f = u());
  var a;
  return a = () => {
    var l = (
      /** @type {V} */
      e[t]
    );
    return l === void 0 ? u() : (s = !0, l);
  }, a;
}
var lr = /* @__PURE__ */ $e("<span>Let's go!</span>"), fr = /* @__PURE__ */ $e("<div><span> </span> <!></div>");
function ut(e, t) {
  const n = at(t, "name", 3, "World"), r = at(t, "eager", 3, !1);
  var i = fr(), s = Le(i), u = Le(s), f = qe(s, 2);
  {
    var a = (l) => {
      var o = lr();
      ze(l, o);
    };
    Ut(f, (l) => {
      r() && l(a);
    });
  }
  qn(() => Wn(u, `Hello, ${n() ?? ""}!`)), ze(e, i);
}
var ar = /* @__PURE__ */ $e("<div><!> <button>Override</button> <button>Set Eager</button></div>");
function ur(e) {
  let t = /* @__PURE__ */ I(!0), n = /* @__PURE__ */ I(!1);
  var r = ar(), i = Le(r);
  {
    var s = (l) => {
      ut(l, {});
    }, u = (l) => {
      ut(l, {
        name: "Alice",
        get eager() {
          return V(n);
        }
      });
    };
    Ut(i, (l) => {
      V(t) ? l(s) : l(u, -1);
    });
  }
  var f = qe(i, 2), a = qe(f, 2);
  st("click", f, () => U(t, !1)), st("click", a, () => U(n, !0)), ze(e, r);
}
Jn(["click"]);
function cr(e) {
  return nr(ur, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

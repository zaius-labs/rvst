var Bt = Array.isArray, Ut = Array.prototype.indexOf, ae = Array.prototype.includes, Vt = Array.from, Ht = Object.defineProperty, we = Object.getOwnPropertyDescriptor, Gt = Object.prototype, Kt = Array.prototype, Wt = Object.getPrototypeOf, Ze = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function at() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, ye = 4, De = 8, ut = 1 << 24, X = 16, G = 32, ne = 64, je = 128, N = 512, b = 1024, k = 2048, q = 4096, j = 8192, L = 16384, de = 32768, Je = 1 << 25, ue = 65536, Qe = 1 << 17, Qt = 1 << 18, ve = 1 << 19, Xt = 1 << 20, re = 65536, Le = 1 << 21, Be = 1 << 22, Z = 1 << 23, Ce = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function $t() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function en() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function sn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const ln = 2, E = Symbol(), fn = "http://www.w3.org/1999/xhtml";
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let I = null;
function oe(e) {
  I = e;
}
function un(e, t = !1, n) {
  I = {
    p: I,
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
function on(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Fn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let se = [];
function cn() {
  var e = se;
  se = [], Jt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && cn();
    });
  }
  se.push(e);
}
function ht(e) {
  var t = g;
  if (t === null)
    return _.f |= Z, e;
  if ((t.f & de) === 0 && (t.f & ye) === 0)
    throw e;
  W(e, t);
}
function W(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0) {
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
const hn = -7169;
function m(e, t) {
  e.f = e.f & hn | t;
}
function Ue(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, b) : m(e, q);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), dt(e.deps), m(e, b);
}
const K = /* @__PURE__ */ new Set();
let w = null, C = null, qe = null, Pe = !1, le = null, Se = null;
var Xe = 0;
let dn = 1;
class Q {
  id = dn++;
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
    if (Xe++ > 1e3 && (K.delete(this), vn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), m(l, k), this.schedule(l);
      for (const l of this.#l)
        m(l, q), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = Se = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (a) {
        throw wt(l), a;
      }
    if (w = null, i.length > 0) {
      var s = Q.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (le = null, Se = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, a] of this.#f)
        gt(l, a);
    } else {
      this.#e.size === 0 && K.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), $e(r), $e(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = u ??= this;
      l.#n.push(...this.#n.filter((a) => !l.#n.includes(a)));
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
      var s = i.f, u = (s & (G | ne)) !== 0, l = u && (s & b) !== 0, a = l || (s & j) !== 0 || this.#f.has(i);
      if (!a && i.fn !== null) {
        u ? i.f ^= b : (s & ye) !== 0 ? n.push(i) : xe(i) && ((s & X) !== 0 && this.#l.add(i), he(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
      vt(t[n], this.#s, this.#l);
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
      Pe = !0, w = this, this.#d();
    } finally {
      Xe = 0, qe = null, le = null, Se = null, Pe = !1, w = null, C = null, J.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), K.delete(this);
  }
  #w() {
    for (const f of K) {
      var t = f.id < this.id, n = [];
      for (const [o, [d, c]] of this.current) {
        if (f.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(o)[0]
          );
          if (t && d !== r)
            f.current.set(o, [d, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...f.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (var l of n)
          _t(l, i, s, u);
        if (f.#n.length > 0) {
          f.apply();
          for (var a of f.#n)
            f.#o(a, [], []);
          f.#n = [];
        }
        f.deactivate();
      }
    }
    for (const f of K)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#h() && (f.activate(), f.#d()));
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
    return (this.#i ??= at()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new Q();
      Pe || (K.add(w), fe(() => {
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
    if (qe = t, t.b?.is_pending && (t.f & (ye | De | ut)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === g && (_ === null || (_.f & y) === 0))
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
function vn() {
  try {
    en();
  } catch (e) {
    W(e, qe);
  }
}
let B = null;
function $e(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | j)) === 0 && xe(r) && (B = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), B?.size > 0)) {
        J.clear();
        for (const i of B) {
          if ((i.f & (L | j)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            B.has(u) && (B.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const a = s[l];
            (a.f & (L | j)) === 0 && he(a);
          }
        }
        B.clear();
      }
    }
    B = null;
  }
}
function _t(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? _t(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | X)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function pt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && pt(
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
  w.schedule(e);
}
function gt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function _n(e) {
  let t = 0, n = Fe(0), r;
  return () => {
    Ke() && (A(n), Pn(() => (t === 0 && (r = Un(() => e(() => me(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, me(n));
      });
    })));
  };
}
var pn = ue | ve;
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
  #_ = _n(() => (this.#o = Fe(this.#c), () => {
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
        g
      );
      u.b = this, u.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Mt(() => {
      this.#m();
    }, pn);
  }
  #w() {
    try {
      this.#n = U(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = U(() => {
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
    t && (this.is_pending = !0, this.#s = U(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Ne();
      n.append(r), this.#n = this.#g(() => U(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, be(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = U(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ct(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = U(() => n(this.#t));
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
    vt(t, this.#v, this.#d);
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
    var n = g, r = _, i = I;
    Y(this.#i), F(this.#i), oe(this.#i.ctx);
    try {
      return Q.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      Y(n), F(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && be(this.#s, () => {
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
      this.#h = !1, this.#o && Me(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), A(
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
    this.#n && (R(this.#n), this.#n = null), this.#s && (R(this.#s), this.#s = null), this.#l && (R(this.#l), this.#l = null);
    var i = !1, s = !1;
    const u = () => {
      if (i) {
        an();
        return;
      }
      i = !0, s && sn(), this.#l !== null && be(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (a) => {
      try {
        s = !0, n?.(a, u), s = !1;
      } catch (f) {
        W(f, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return U(() => {
            var f = (
              /** @type {Effect} */
              g
            );
            f.b = this, f.f |= je, r(
              this.#t,
              () => a,
              () => u
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
    fe(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (f) {
        W(f, this.#i && this.#i.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        l,
        /** @param {unknown} e */
        (f) => W(f, this.#i && this.#i.parent)
      ) : l(a);
    });
  }
}
function mn(e, t, n, r) {
  const i = yn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    g
  ), l = bn(), a = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (u.f & L) === 0 && W(v, u);
    }
    Re();
  }
  if (n.length === 0) {
    a.then(() => f(t.map(i)));
    return;
  }
  var o = mt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => f([...t.map(i), ...c])).catch((c) => W(c, u)).finally(() => o());
  }
  a ? a.then(() => {
    l(), d(), Re();
  }) : d();
}
function bn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = _, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), F(t), oe(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  Y(null), F(null), oe(null), e && w?.deactivate();
}
function mt() {
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
function yn(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return g !== null && (g.f |= ve), {
    ctx: I,
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
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function En(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && $t();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Fe(
    /** @type {V} */
    E
  ), u = !_, l = /* @__PURE__ */ new Map();
  return Cn(() => {
    var a = (
      /** @type {Effect} */
      g
    ), f = at();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Re);
    } catch (v) {
      f.reject(v), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (u) {
      if ((a.f & de) !== 0)
        var d = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(V), l.delete(o);
      else {
        for (const v of l.values())
          v.reject(V);
        l.clear();
      }
      l.set(o, f);
    }
    const c = (v, h = void 0) => {
      if (d) {
        var p = h === V;
        d(p);
      }
      if (!(h === V || (a.f & L) !== 0)) {
        if (o.activate(), h)
          s.f |= Z, Me(s, h);
        else {
          (s.f & Z) !== 0 && (s.f ^= Z), Me(s, v);
          for (const [x, O] of l) {
            if (l.delete(x), x === o) break;
            O.reject(V);
          }
        }
        o.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), Dn(() => {
    for (const a of l.values())
      a.reject(V);
  }), new Promise((a) => {
    function f(o) {
      function d() {
        o === i ? a(s) : f(i);
      }
      o.then(d, d);
    }
    f(i);
  });
}
function xn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      R(
        /** @type {Effect} */
        t[n]
      );
  }
}
function kn(e) {
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
function He(e) {
  var t, n = g;
  Y(kn(e));
  try {
    e.f &= ~re, xn(e), t = Lt(e);
  } finally {
    Y(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (C !== null ? (Ke() || w?.is_fork) && C.set(e, n) : Ue(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Zt, t.ac = null, Ee(t, 0), We(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Ye = /* @__PURE__ */ new Set();
const J = /* @__PURE__ */ new Map();
let Et = !1;
function Fe(e, t) {
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
function z(e, t) {
  const n = Fe(e);
  return Yn(n), n;
}
function H(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (_.f & Qe) !== 0) && ct() && (_.f & (y | X | Be | Qe)) !== 0 && (D === null || !ae.call(D, e)) && rn();
  let r = n ? pe(t) : t;
  return Me(e, r, Se);
}
function Me(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? J.set(e, t) : J.set(e, r), e.v = t;
    var i = Q.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(s), C === null && Ue(s);
    }
    e.wv = It(), xt(e, k, n), g !== null && (g.f & b) !== 0 && (g.f & (G | ne)) === 0 && (M === null ? zn([e]) : M.push(e)), !i.is_fork && Ye.size > 0 && !Et && Sn();
  }
  return t;
}
function Sn() {
  Et = !1;
  for (const e of Ye)
    (e.f & b) !== 0 && m(e, q), xe(e) && he(e);
  Ye.clear();
}
function me(e) {
  H(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, a = (l & k) === 0;
      if (a && m(u, t), (l & y) !== 0) {
        var f = (
          /** @type {Derived} */
          u
        );
        C?.delete(f), (l & re) === 0 && (l & N && (u.f |= re), xt(f, q, n));
      } else if (a) {
        var o = (
          /** @type {Effect} */
          u
        );
        (l & X) !== 0 && B !== null && B.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Wt(e);
  if (t !== Gt && t !== Kt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bt(e), i = /* @__PURE__ */ z(0), s = te, u = (l) => {
    if (te === s)
      return l();
    var a = _, f = te;
    F(null), rt(s);
    var o = l();
    return F(a), rt(f), o;
  };
  return r && n.set("length", /* @__PURE__ */ z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, a, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && tn();
        var o = n.get(a);
        return o === void 0 ? u(() => {
          var d = /* @__PURE__ */ z(f.value);
          return n.set(a, d), d;
        }) : H(o, f.value, !0), !0;
      },
      deleteProperty(l, a) {
        var f = n.get(a);
        if (f === void 0) {
          if (a in l) {
            const o = u(() => /* @__PURE__ */ z(E));
            n.set(a, o), me(i);
          }
        } else
          H(f, E), me(i);
        return !0;
      },
      get(l, a, f) {
        if (a === Ce)
          return e;
        var o = n.get(a), d = a in l;
        if (o === void 0 && (!d || we(l, a)?.writable) && (o = u(() => {
          var v = pe(d ? l[a] : E), h = /* @__PURE__ */ z(v);
          return h;
        }), n.set(a, o)), o !== void 0) {
          var c = A(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, a, f);
      },
      getOwnPropertyDescriptor(l, a) {
        var f = Reflect.getOwnPropertyDescriptor(l, a);
        if (f && "value" in f) {
          var o = n.get(a);
          o && (f.value = A(o));
        } else if (f === void 0) {
          var d = n.get(a), c = d?.v;
          if (d !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return f;
      },
      has(l, a) {
        if (a === Ce)
          return !0;
        var f = n.get(a), o = f !== void 0 && f.v !== E || Reflect.has(l, a);
        if (f !== void 0 || g !== null && (!o || we(l, a)?.writable)) {
          f === void 0 && (f = u(() => {
            var c = o ? pe(l[a]) : E, v = /* @__PURE__ */ z(c);
            return v;
          }), n.set(a, f));
          var d = A(f);
          if (d === E)
            return !1;
        }
        return o;
      },
      set(l, a, f, o) {
        var d = n.get(a), c = a in l;
        if (r && a === "length")
          for (var v = f; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? H(h, E) : v in l && (h = u(() => /* @__PURE__ */ z(E)), n.set(v + "", h));
          }
        if (d === void 0)
          (!c || we(l, a)?.writable) && (d = u(() => /* @__PURE__ */ z(void 0)), H(d, pe(f)), n.set(a, d));
        else {
          c = d.v !== E;
          var p = u(() => pe(f));
          H(d, p);
        }
        var x = Reflect.getOwnPropertyDescriptor(l, a);
        if (x?.set && x.set.call(o, f), !c) {
          if (r && typeof a == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(a);
            Number.isInteger(ie) && ie >= O.v && H(O, ie + 1);
          }
          me(i);
        }
        return !0;
      },
      ownKeys(l) {
        A(i);
        var a = Reflect.ownKeys(l).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== E;
        });
        for (var [f, o] of n)
          o.v !== E && !(f in l) && a.push(f);
        return a;
      },
      setPrototypeOf() {
        nn();
      }
    }
  );
}
var et, kt, Tt, St;
function An() {
  if (et === void 0) {
    et = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = we(t, "firstChild").get, St = we(t, "nextSibling").get, Ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ze(n) && (n.__t = void 0);
  }
}
function Ne(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function At(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ge(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function tt(e, t) {
  return /* @__PURE__ */ At(e);
}
function Ie(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ge(r);
  return r;
}
function Rn() {
  return !1;
}
function Mn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
function Rt(e) {
  var t = _, n = g;
  F(null), Y(null);
  try {
    return e();
  } finally {
    F(t), Y(n);
  }
}
function Nn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function $(e, t) {
  var n = g;
  n !== null && (n.f & j) !== 0 && (e |= j);
  var r = {
    ctx: I,
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
  if ((e & ye) !== 0)
    le !== null ? le.push(r) : Q.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (u) {
      throw R(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & X) !== 0 && (e & ue) !== 0 && i !== null && (i.f |= ue));
  }
  if (i !== null && (i.parent = n, n !== null && Nn(i, n), _ !== null && (_.f & y) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return _ !== null && !P;
}
function Dn(e) {
  const t = $(De, null);
  return m(t, b), t.teardown = e, t;
}
function Fn(e) {
  return $(ye | Xt, e);
}
function On(e) {
  Q.ensure();
  const t = $(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      R(t), r(void 0);
    }) : (R(t), r(void 0));
  });
}
function Cn(e) {
  return $(Be | ve, e);
}
function Pn(e, t = 0) {
  return $(De | t, e);
}
function In(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    $(De, () => e(...i.map(A)));
  });
}
function Mt(e, t = 0) {
  var n = $(X | t, e);
  return n;
}
function U(e) {
  return $(G | ve, e);
}
function Nt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    nt(!0), F(null);
    try {
      t.call(null);
    } finally {
      nt(n), F(r);
    }
  }
}
function We(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(V);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : R(n, t), n = r;
  }
}
function jn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && R(t), t = n;
  }
}
function R(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ln(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Je), We(e, t && !n), Ee(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Nt(e), e.f ^= Je, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ln(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ge(e);
    e.remove(), e = n;
  }
}
function Dt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && R(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var l of r)
      l.out(u);
  } else
    i();
}
function Ft(e, t, n) {
  if ((e.f & j) === 0) {
    e.f ^= j;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & ue) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & X) !== 0;
      Ft(i, t, u ? n : !1), i = s;
    }
  }
}
function qn(e) {
  Ot(e, !0);
}
function Ot(e, t) {
  if ((e.f & j) !== 0) {
    e.f ^= j, (e.f & b) === 0 && (m(e, k), Q.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ue) !== 0 || (n.f & G) !== 0;
      Ot(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function Ct(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ge(n);
      t.append(n), n = i;
    }
}
let Ae = !1, ce = !1;
function nt(e) {
  ce = e;
}
let _ = null, P = !1;
function F(e) {
  _ = e;
}
let g = null;
function Y(e) {
  g = e;
}
let D = null;
function Yn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, S = 0, M = null;
function zn(e) {
  M = e;
}
let Pt = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function It() {
  return ++Pt;
}
function xe(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (xe(
        /** @type {Derived} */
        s
      ) && bt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, b);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ae.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, q), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = M, i = _, s = D, u = I, l = P, a = te, f = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, M = null, _ = (f & (G | ne)) === 0 ? e : null, D = null, oe(e.ctx), P = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), d = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var h;
      if (v || Ee(e, S), c !== null && S > 0)
        for (c.length = S + T.length, h = 0; h < T.length; h++)
          c[S + h] = T[h];
      else
        e.deps = c = T;
      if (Ke() && (e.f & N) !== 0)
        for (h = S; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (Ee(e, S), c.length = S);
    if (ct() && M !== null && !P && c !== null && (e.f & (y | q | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      M.length; h++)
        jt(
          M[h],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let p = 0; p < n; p += 1)
          i.deps[p].rv = ee;
      if (t !== null)
        for (const p of t)
          p.rv = ee;
      M !== null && (r === null ? r = M : r.push(.../** @type {Source[]} */
      M));
    }
    return (e.f & Z) !== 0 && (e.f ^= Z), d;
  } catch (p) {
    return ht(p);
  } finally {
    e.f ^= Le, T = t, S = n, M = r, _ = i, D = s, oe(u), P = l, te = a;
  }
}
function Bn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ut.call(n, e);
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
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), Ue(s), Tn(s), Ee(s, 0);
  }
}
function Ee(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, b);
    var n = g, r = Ae;
    g = e, Ae = !0;
    try {
      (t & (X | ut)) !== 0 ? jn(e) : We(e), Nt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Ae = r, g = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !P) {
    var r = g !== null && (g.f & L) !== 0;
    if (!r && (D === null || !ae.call(D, e))) {
      var i = _.deps;
      if ((_.f & Le) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && J.has(e))
    return J.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = u.v;
      return ((u.f & b) === 0 && u.reactions !== null || Yt(u)) && (l = He(u)), J.set(u, l), l;
    }
    var a = (u.f & N) === 0 && !P && _ !== null && (Ae || (_.f & N) !== 0), f = (u.f & de) === 0;
    xe(u) && (a && (u.f |= N), bt(u)), a && !f && (yt(u), qt(u));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & Z) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (yt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Yt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (J.has(t) || (t.f & y) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Un(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Vn(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Hn(e, t) {
  Vn("op_set_text", e, t);
}
const Gn = ["touchstart", "touchmove"];
function Kn(e) {
  return Gn.includes(e);
}
const ge = Symbol("events"), zt = /* @__PURE__ */ new Set(), ze = /* @__PURE__ */ new Set();
function st(e, t, n) {
  (t[ge] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    zt.add(e[t]);
  for (var n of ze)
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
  var u = 0, l = lt === e && e[ge];
  if (l) {
    var a = i.indexOf(l);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ge] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    a <= f && (u = a);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Ht(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, d = g;
    F(null), Y(null);
    try {
      for (var c, v = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var p = s[ge]?.[r];
          p != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && p.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[ge] = t, delete e.currentTarget, F(o), Y(d);
    }
  }
}
const Zn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Jn(e) {
  return (
    /** @type {string} */
    Zn?.createHTML(e) ?? e
  );
}
function Qn(e) {
  var t = Mn("template");
  return t.innerHTML = Jn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ke(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function _e(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function $n(e, t) {
  return er(e, t);
}
const Te = /* @__PURE__ */ new Map();
function er(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  An();
  var a = void 0, f = On(() => {
    var o = n ?? t.appendChild(Ne());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        un({});
        var h = (
          /** @type {ComponentContext} */
          I
        );
        s && (h.c = s), i && (r.$$events = i), a = e(v, r) || {}, on();
      },
      l
    );
    var d = /* @__PURE__ */ new Set(), c = (v) => {
      for (var h = 0; h < v.length; h++) {
        var p = v[h];
        if (!d.has(p)) {
          d.add(p);
          var x = Kn(p);
          for (const Oe of [t, document]) {
            var O = Te.get(Oe);
            O === void 0 && (O = /* @__PURE__ */ new Map(), Te.set(Oe, O));
            var ie = O.get(p);
            ie === void 0 ? (Oe.addEventListener(p, ft, { passive: x }), O.set(p, 1)) : O.set(p, ie + 1);
          }
        }
      }
    };
    return c(Vt(zt)), ze.add(c), () => {
      for (var v of d)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Te.get(x)
          ), p = (
            /** @type {number} */
            h.get(v)
          );
          --p == 0 ? (x.removeEventListener(v, ft), h.delete(v), h.size === 0 && Te.delete(x)) : h.set(v, p);
        }
      ze.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return tr.set(a, f), a;
}
let tr = /* @__PURE__ */ new WeakMap();
class nr {
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
        qn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(u);
        l && (R(l.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#a) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            Ct(u, f), f.append(Ne()), this.#e.set(s, { effect: u, fragment: f });
          } else
            R(u);
          this.#r.delete(s), this.#a.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), be(u, l, !1)) : l();
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
      n.includes(r) || (R(i.effect), this.#e.delete(r));
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
    ), i = Rn();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = Ne();
        s.append(u), this.#e.set(t, {
          effect: U(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          U(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, a] of this.#a)
        l === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [l, a] of this.#e)
        l === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function rr(e, t, n = !1) {
  var r = new nr(e), i = n ? ue : 0;
  function s(u, l) {
    r.ensure(u, l);
  }
  Mt(() => {
    var u = !1;
    t((l, a = 0) => {
      u = !0, s(a, l);
    }), u || s(-1, null);
  }, i);
}
var ir = /* @__PURE__ */ ke("<span>Excellent</span>"), sr = /* @__PURE__ */ ke("<span>Good</span>"), lr = /* @__PURE__ */ ke("<span>Pass</span>"), fr = /* @__PURE__ */ ke("<span>Fail</span>"), ar = /* @__PURE__ */ ke("<div><!> <div> </div> <button>+10</button> <button>-10</button></div>");
function ur(e) {
  let t = /* @__PURE__ */ z(50);
  function n() {
    H(t, Math.min(100, A(t) + 10), !0);
  }
  function r() {
    H(t, Math.max(0, A(t) - 10), !0);
  }
  var i = ar(), s = tt(i);
  {
    var u = (h) => {
      var p = ir();
      _e(h, p);
    }, l = (h) => {
      var p = sr();
      _e(h, p);
    }, a = (h) => {
      var p = lr();
      _e(h, p);
    }, f = (h) => {
      var p = fr();
      _e(h, p);
    };
    rr(s, (h) => {
      A(t) >= 90 ? h(u) : A(t) >= 70 ? h(l, 1) : A(t) >= 50 ? h(a, 2) : h(f, -1);
    });
  }
  var o = Ie(s, 2), d = tt(o), c = Ie(o, 2), v = Ie(c, 2);
  In(() => Hn(d, `Score: ${A(t) ?? ""}`)), st("click", c, n), st("click", v, r), _e(e, i);
}
Wn(["click"]);
function cr(e) {
  return $n(ur, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

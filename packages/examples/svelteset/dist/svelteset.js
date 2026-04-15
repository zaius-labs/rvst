var Ht = Array.isArray, $t = Array.prototype.indexOf, ae = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Bt = Object.prototype, Gt = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Wt = () => {
};
function Zt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Fe = 8, at = 1 << 24, Q = 16, J = 32, ne = 64, je = 128, O = 512, y = 1024, S = 2048, q = 4096, G = 8192, z = 16384, de = 32768, Ze = 1 << 25, Re = 65536, Je = 1 << 17, Jt = 1 << 18, ve = 1 << 19, Qt = 1 << 20, re = 65536, ze = 1 << 21, He = 1 << 22, K = 1 << 23, Ce = Symbol("$state"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Xt() {
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
function un() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let j = null;
function oe(e) {
  j = e;
}
function ct(e, t = !1, n) {
  j = {
    p: j,
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
function ht(e) {
  var t = (
    /** @type {ComponentContext} */
    j
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Nn(r);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function dt() {
  return !0;
}
let le = [];
function an() {
  var e = le;
  le = [], Zt(e);
}
function ue(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && an();
    });
  }
  le.push(e);
}
function vt(e) {
  var t = p;
  if (t === null)
    return _.f |= K, e;
  if ((t.f & de) === 0 && (t.f & we) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
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
const on = -7169;
function m(e, t) {
  e.f = e.f & on | t;
}
function $e(e) {
  (e.f & O) !== 0 || e.deps === null ? m(e, y) : m(e, q);
}
function _t(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & re) === 0 || (t.f ^= re, _t(
        /** @type {Derived} */
        t.deps
      ));
}
function pt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), _t(e.deps), m(e, y);
}
const V = /* @__PURE__ */ new Set();
let w = null, P = null, Le = null, Pe = !1, fe = null, ke = null;
var Qe = 0;
let cn = 1;
class ie {
  id = cn++;
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
  #n = /* @__PURE__ */ new Set();
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
  #l = /* @__PURE__ */ new Map();
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #r = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #t = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
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
  #a = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#l.size > 0;
  }
  #v() {
    for (const r of this.#a)
      for (const i of r.#l.keys()) {
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
        m(r, S), this.schedule(r);
      for (r of n.m)
        m(r, q), this.schedule(r);
    }
  }
  #d() {
    if (Qe++ > 1e3 && (V.delete(this), hn()), !this.#h()) {
      for (const u of this.#i)
        this.#s.delete(u), m(u, S), this.schedule(u);
      for (const u of this.#s)
        m(u, q), this.schedule(u);
    }
    const t = this.#t;
    this.#t = [], this.apply();
    var n = fe = [], r = [], i = ke = [];
    for (const u of t)
      try {
        this.#o(u, n, r);
      } catch (f) {
        throw yt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = ie.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (fe = null, ke = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [u, f] of this.#f)
        mt(u, f);
    } else {
      this.#e.size === 0 && V.delete(this), this.#i.clear(), this.#s.clear();
      for (const u of this.#n) u(this);
      this.#n.clear(), Xe(r), Xe(n), this.#r?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#t.length > 0) {
      const u = a ??= this;
      u.#t.push(...this.#t.filter((f) => !u.#t.includes(f)));
    }
    a !== null && (V.add(a), a.#d()), V.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (J | ne)) !== 0, u = a && (s & y) !== 0, f = u || (s & G) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : be(i) && ((s & Q) !== 0 && this.#s.add(i), he(i));
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
      pt(t[n], this.#i, this.#s);
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
    w = this;
  }
  deactivate() {
    w = null, P = null;
  }
  flush() {
    try {
      Pe = !0, w = this, this.#d();
    } finally {
      Qe = 0, Le = null, fe = null, ke = null, Pe = !1, w = null, P = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), V.delete(this);
  }
  #w() {
    for (const l of V) {
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
        for (var u of n)
          gt(u, i, s, a);
        if (l.#t.length > 0) {
          l.apply();
          for (var f of l.#t)
            l.#o(f, [], []);
          l.#t = [];
        }
        l.deactivate();
      }
    }
    for (const l of V)
      l.#a.has(this) && (l.#a.delete(this), l.#a.size === 0 && !l.#h() && (l.activate(), l.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#e.get(n) ?? 0;
    if (this.#e.set(n, r + 1), t) {
      let i = this.#l.get(n) ?? 0;
      this.#l.set(n, i + 1);
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
      let s = this.#l.get(n) ?? 0;
      s === 1 ? this.#l.delete(n) : this.#l.set(n, s - 1);
    }
    this.#c || r || (this.#c = !0, ue(() => {
      this.#c = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#i.add(r);
    for (const r of n)
      this.#s.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#n.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#u.add(t);
  }
  settled() {
    return (this.#r ??= ut()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ie();
      Pe || (V.add(w), ue(() => {
        w === t && t.flush();
      }));
    }
    return w;
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
    if (Le = t, t.b?.is_pending && (t.f & (we | Fe | at)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (ne | J)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#t.push(n);
  }
}
function hn() {
  try {
    en();
  } catch (e) {
    B(e, Le);
  }
}
let H = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | G)) === 0 && be(r) && (H = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), H?.size > 0)) {
        W.clear();
        for (const i of H) {
          if ((i.f & (z | G)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            H.has(a) && (H.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (z | G)) === 0 && he(f);
          }
        }
        H.clear();
      }
    }
    H = null;
  }
}
function gt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? gt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (He | Q)) !== 0 && (s & S) === 0 && wt(i, t, r) && (m(i, S), Ue(
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
      if ((i.f & b) !== 0 && wt(
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
  if (!((e.f & J) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      mt(n, t), n = n.next;
  }
}
function yt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    yt(t), t = t.next;
}
function dn(e) {
  let t = 0, n = ye(0), r;
  return () => {
    Ge() && (k(n), Fn(() => (t === 0 && (r = Yn(() => e(() => Z(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Z(n));
      });
    })));
  };
}
var vn = Re | ve;
function _n(e, t, n, r) {
  new pn(e, t, n, r);
}
class pn {
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
  #n;
  /** @type {TemplateNode | null} */
  #u = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #t = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #c = 0;
  #a = 0;
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
  #_ = dn(() => (this.#o = ye(this.#c), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#n = t, this.#e = n, this.#l = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Cn(() => {
      this.#m();
    }, vn);
  }
  #w() {
    try {
      this.#t = ee(() => this.#l(this.#n));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#e.failed;
    n && (this.#s = ee(() => {
      n(
        this.#n,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#i = ee(() => t(this.#n)), ue(() => {
      var n = this.#f = document.createDocumentFragment(), r = Nt();
      n.append(r), this.#t = this.#g(() => ee(() => this.#l(r))), this.#a === 0 && (this.#n.before(n), this.#f = null, Se(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#t = ee(() => {
        this.#l(this.#n);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        jn(this.#t, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#i = ee(() => n(this.#n));
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
    var n = p, r = _, i = j;
    Y(this.#r), F(this.#r), oe(this.#r.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return vt(s), null;
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
  #y(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, n);
      return;
    }
    this.#a += t, this.#a === 0 && (this.#p(n), this.#i && Se(this.#i, () => {
      this.#i = null;
    }), this.#f && (this.#n.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#y(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, ue(() => {
      this.#h = !1, this.#o && Oe(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), k(
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
    this.#t && (L(this.#t), this.#t = null), this.#i && (L(this.#i), this.#i = null), this.#s && (L(this.#s), this.#s = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        un();
        return;
      }
      i = !0, s && sn(), this.#s !== null && Se(this.#s, () => {
        this.#s = null;
      }), this.#g(() => {
        this.#m();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
      } catch (l) {
        B(l, this.#r && this.#r.parent);
      }
      r && (this.#s = this.#g(() => {
        try {
          return ee(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= je, r(
              this.#n,
              () => f,
              () => a
            );
          });
        } catch (l) {
          return B(
            l,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    ue(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (l) {
        B(l, this.#r && this.#r.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => B(l, this.#r && this.#r.parent)
      ) : u(f);
    });
  }
}
function gn(e, t, n, r) {
  const i = mn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = wn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (v) {
      (a.f & z) === 0 && B(v, a);
    }
    Ne();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = bt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ yn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Ne();
  }) : h();
}
function wn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = j, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), F(t), oe(n), s && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function Ne(e = !0) {
  Y(null), F(null), oe(null), e && w?.deactivate();
}
function bt() {
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
function mn(e) {
  var t = b | S, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: j,
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
function yn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Xt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = ye(
    /** @type {V} */
    E
  ), a = !_, u = /* @__PURE__ */ new Map();
  return Dn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = ut();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ne);
    } catch (v) {
      l.reject(v), Ne();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & de) !== 0)
        var h = bt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject($), u.delete(o);
      else {
        for (const v of u.values())
          v.reject($);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === $;
        h(g);
      }
      if (!(d === $ || (f.f & z) !== 0)) {
        if (o.activate(), d)
          s.f |= K, Oe(s, d);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Oe(s, v);
          for (const [x, M] of u) {
            if (u.delete(x), x === o) break;
            M.reject($);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Rn(() => {
    for (const f of u.values())
      f.reject($);
  }), new Promise((f) => {
    function l(o) {
      function h() {
        o === i ? f(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function bn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      L(
        /** @type {Effect} */
        t[n]
      );
  }
}
function En(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = p;
  Y(En(e));
  try {
    e.f &= ~re, bn(e), t = zt(e);
  } finally {
    Y(n);
  }
  return t;
}
function Et(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ce || (P !== null ? (Ge() || w?.is_fork) && P.set(e, n) : $e(e));
}
function xn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Wt, t.ac = null, me(t, 0), Ke(t));
}
function xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let qe = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let Tt = !1;
function ye(e, t) {
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
function C(e, t) {
  const n = ye(e);
  return zn(n), n;
}
function N(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!I || (_.f & Je) !== 0) && dt() && (_.f & (b | Q | He | Je)) !== 0 && (D === null || !ae.call(D, e)) && rn();
  let r = n ? _e(t) : t;
  return Oe(e, r, ke);
}
function Oe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Ve(s), P === null && $e(s);
    }
    e.wv = It(), kt(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (J | ne)) === 0 && (R === null ? Ln([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !Tt && Tn();
  }
  return t;
}
function Tn() {
  Tt = !1;
  for (const e of qe)
    (e.f & y) !== 0 && m(e, q), be(e) && he(e);
  qe.clear();
}
function Z(e) {
  N(e, e.v + 1);
}
function kt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & S) === 0;
      if (f && m(a, t), (u & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        P?.delete(l), (u & re) === 0 && (u & O && (a.f |= re), kt(l, q, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Q) !== 0 && H !== null && H.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Kt(e);
  if (t !== Bt && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ht(e), i = /* @__PURE__ */ C(0), s = U, a = (u) => {
    if (U === s)
      return u();
    var f = _, l = U;
    F(null), nt(s);
    var o = u();
    return F(f), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ C(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && tn();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ C(l.value);
          return n.set(f, h), h;
        }) : N(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ C(E));
            n.set(f, o), Z(i);
          }
        } else
          N(l, E), Z(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Ce)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || ge(u, f)?.writable) && (o = a(() => {
          var v = _e(h ? u[f] : E), d = /* @__PURE__ */ C(v);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = k(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = k(o));
        } else if (l === void 0) {
          var h = n.get(f), c = h?.v;
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
      has(u, f) {
        if (f === Ce)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || ge(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? _e(u[f]) : E, v = /* @__PURE__ */ C(c);
            return v;
          }), n.set(f, l));
          var h = k(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, f, l, o) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? N(d, E) : v in u && (d = a(() => /* @__PURE__ */ C(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(u, f)?.writable) && (h = a(() => /* @__PURE__ */ C(void 0)), N(h, _e(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(l));
          N(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var M = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(f);
            Number.isInteger(se) && se >= M.v && N(M, se + 1);
          }
          Z(i);
        }
        return !0;
      },
      ownKeys(u) {
        k(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        nn();
      }
    }
  );
}
var et, St, At, Rt;
function kn() {
  if (et === void 0) {
    et = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    At = ge(t, "firstChild").get, Rt = ge(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Nt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ot(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    Rt.call(e)
  );
}
function Ee(e, t) {
  return /* @__PURE__ */ Ot(e);
}
function xe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Sn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
function Dt(e) {
  var t = _, n = p;
  F(null), Y(null);
  try {
    return e();
  } finally {
    F(t), Y(n);
  }
}
function An(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & G) !== 0 && (e |= G);
  var r = {
    ctx: j,
    deps: null,
    nodes: null,
    f: e | S | O,
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
    fe !== null ? fe.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & Re) !== 0 && i !== null && (i.f |= Re));
  }
  if (i !== null && (i.parent = n, n !== null && An(i, n), _ !== null && (_.f & b) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ge() {
  return _ !== null && !I;
}
function Rn(e) {
  const t = X(Fe, null);
  return m(t, y), t.teardown = e, t;
}
function Nn(e) {
  return X(we | Qt, e);
}
function On(e) {
  ie.ensure();
  const t = X(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Se(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function Dn(e) {
  return X(He | ve, e);
}
function Fn(e, t = 0) {
  return X(Fe | t, e);
}
function Mn(e, t = [], n = [], r = []) {
  gn(r, t, n, (i) => {
    X(Fe, () => e(...i.map(k)));
  });
}
function Cn(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function ee(e) {
  return X(J | ve, e);
}
function Ft(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    tt(!0), F(null);
    try {
      t.call(null);
    } finally {
      tt(n), F(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Dt(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function Pn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & J) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & Jt) !== 0) && e.nodes !== null && e.nodes.end !== null && (In(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), Ke(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ft(e), e.f ^= Ze, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function In(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Se(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Ct(e, t, n) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Re) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & J) !== 0 && (e.f & Q) !== 0;
      Ct(i, t, a ? n : !1), i = s;
    }
  }
}
function jn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Ae = !1, ce = !1;
function tt(e) {
  ce = e;
}
let _ = null, I = !1;
function F(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let D = null;
function zn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, A = 0, R = null;
function Ln(e) {
  R = e;
}
let Pt = 1, te = 0, U = te;
function nt(e) {
  U = e;
}
function It() {
  return ++Pt;
}
function be(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~re), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
        /** @type {Derived} */
        s
      ) && Et(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && m(e, y);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ae.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, q), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function zt(e) {
  var t = T, n = A, r = R, i = _, s = D, a = j, u = I, f = U, l = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, _ = (l & (J | ne)) === 0 ? e : null, D = null, oe(e.ctx), I = !1, U = ++te, e.ac !== null && (Dt(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= ze;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || me(e, A), c !== null && A > 0)
        for (c.length = A + T.length, d = 0; d < T.length; d++)
          c[A + d] = T[d];
      else
        e.deps = c = T;
      if (Ge() && (e.f & O) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (me(e, A), c.length = A);
    if (dt() && R !== null && !I && c !== null && (e.f & (b | q | S)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        jt(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (te++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = te;
      if (t !== null)
        for (const g of t)
          g.rv = te;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (g) {
    return vt(g);
  } finally {
    e.f ^= ze, T = t, A = n, R = r, _ = i, D = s, oe(a), I = u, U = f;
  }
}
function qn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = $t.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & O) !== 0 && (s.f ^= O, s.f &= ~re), $e(s), xn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & z) === 0) {
    m(e, y);
    var n = p, r = Ae;
    p = e, Ae = !0;
    try {
      (t & (Q | at)) !== 0 ? Pn(e) : Ke(e), Ft(e);
      var i = zt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Ae = r, p = n;
    }
  }
}
function k(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !I) {
    var r = p !== null && (p.f & z) !== 0;
    if (!r && (D === null || !ae.call(D, e))) {
      var i = _.deps;
      if ((_.f & ze) !== 0)
        e.rv < te && (e.rv = te, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var u = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || qt(a)) && (u = Ve(a)), W.set(a, u), u;
    }
    var f = (a.f & O) === 0 && !I && _ !== null && (Ae || (_.f & O) !== 0), l = (a.f & de) === 0;
    be(a) && (f && (a.f |= O), Et(a)), f && !l && (xt(a), Lt(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Lt(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & O) === 0 && (xt(
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
function Yn(e) {
  var t = I;
  try {
    return I = !0, e();
  } finally {
    I = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ie(e, t) {
  Hn("op_set_text", e, t);
}
const $n = ["touchstart", "touchmove"];
function Un(e) {
  return $n.includes(e);
}
const pe = Symbol("events"), Yt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function it(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Vn(e) {
  for (var t = 0; t < e.length; t++)
    Yt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let st = null;
function lt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  st = e;
  var a = 0, u = st === e && e[pe];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (a = f);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    F(null), Y(null);
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
      e[pe] = t, delete e.currentTarget, F(o), Y(h);
    }
  }
}
const Bn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Gn(e) {
  return (
    /** @type {string} */
    Bn?.createHTML(e) ?? e
  );
}
function Kn(e) {
  var t = Sn("template");
  return t.innerHTML = Gn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Wn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Zn(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Kn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ot(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Wn(s, s), s;
  };
}
function Jn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Qn(e, t) {
  return Xn(e, t);
}
const Te = /* @__PURE__ */ new Map();
function Xn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  kn();
  var f = void 0, l = On(() => {
    var o = n ?? t.appendChild(Nt());
    _n(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        ct({});
        var d = (
          /** @type {ComponentContext} */
          j
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, ht();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Un(g);
          for (const Me of [t, document]) {
            var M = Te.get(Me);
            M === void 0 && (M = /* @__PURE__ */ new Map(), Te.set(Me, M));
            var se = M.get(g);
            se === void 0 ? (Me.addEventListener(g, lt, { passive: x }), M.set(g, 1)) : M.set(g, se + 1);
          }
        }
      }
    };
    return c(Ut(Yt)), Ye.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Te.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, lt), d.delete(v), d.size === 0 && Te.delete(x)) : d.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return er.set(f, l), f;
}
let er = /* @__PURE__ */ new WeakMap();
var tr = ["forEach", "isDisjointFrom", "isSubsetOf", "isSupersetOf"], nr = ["difference", "intersection", "symmetricDifference", "union"], ft = !1;
class De extends Set {
  /** @type {Map<T, Source<boolean>>} */
  #n = /* @__PURE__ */ new Map();
  #u = /* @__PURE__ */ C(0);
  #e = /* @__PURE__ */ C(0);
  #l = U || -1;
  /**
   * @param {Iterable<T> | null | undefined} [value]
   */
  constructor(t) {
    if (super(), t) {
      for (var n of t)
        super.add(n);
      this.#e.v = super.size;
    }
    ft || this.#t();
  }
  /**
   * If the source is being created inside the same reaction as the SvelteSet instance,
   * we use `state` so that it will not be a dependency of the reaction. Otherwise we
   * use `source` so it will be.
   *
   * @template T
   * @param {T} value
   * @returns {Source<T>}
   */
  #r(t) {
    return U === this.#l ? /* @__PURE__ */ C(t) : ye(t);
  }
  // We init as part of the first instance so that we can treeshake this class
  #t() {
    ft = !0;
    var t = De.prototype, n = Set.prototype;
    for (const r of tr)
      t[r] = function(...i) {
        return k(this.#u), n[r].apply(this, i);
      };
    for (const r of nr)
      t[r] = function(...i) {
        k(this.#u);
        var s = (
          /** @type {Set<T>} */
          n[r].apply(this, i)
        );
        return new De(s);
      };
  }
  /** @param {T} value */
  has(t) {
    var n = super.has(t), r = this.#n, i = r.get(t);
    if (i === void 0) {
      if (!n)
        return k(this.#u), !1;
      i = this.#r(!0), r.set(t, i);
    }
    return k(i), n;
  }
  /** @param {T} value */
  add(t) {
    return super.has(t) || (super.add(t), N(this.#e, super.size), Z(this.#u)), this;
  }
  /** @param {T} value */
  delete(t) {
    var n = super.delete(t), r = this.#n, i = r.get(t);
    return i !== void 0 && (r.delete(t), N(i, !1)), n && (N(this.#e, super.size), Z(this.#u)), n;
  }
  clear() {
    if (super.size !== 0) {
      super.clear();
      var t = this.#n;
      for (var n of t.values())
        N(n, !1);
      t.clear(), N(this.#e, 0), Z(this.#u);
    }
  }
  keys() {
    return this.values();
  }
  values() {
    return k(this.#u), super.values();
  }
  entries() {
    return k(this.#u), super.entries();
  }
  [Symbol.iterator]() {
    return this.keys();
  }
  get size() {
    return k(this.#e);
  }
}
var rr = /* @__PURE__ */ Zn("<div><div> </div> <div> </div> <div> </div> <button>Add Gamma</button> <button>Remove Alpha</button></div>");
function ir(e, t) {
  ct(t, !0);
  let n = new De(["alpha", "beta"]);
  function r() {
    n.add("gamma");
  }
  function i() {
    n.delete("alpha");
  }
  var s = rr(), a = Ee(s), u = Ee(a), f = xe(a, 2), l = Ee(f), o = xe(f, 2), h = Ee(o), c = xe(o, 2), v = xe(c, 2);
  Mn(
    (d, g) => {
      Ie(u, `Size: ${n.size ?? ""}`), Ie(l, `Has alpha: ${d ?? ""}`), Ie(h, `Has gamma: ${g ?? ""}`);
    },
    [() => n.has("alpha"), () => n.has("gamma")]
  ), it("click", c, r), it("click", v, i), Jn(e, s), ht();
}
Vn(["click"]);
function lr(e) {
  return Qn(ir, { target: e });
}
export {
  lr as default,
  lr as rvst_mount
};

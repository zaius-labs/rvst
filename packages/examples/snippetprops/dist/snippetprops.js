var zt = Array.isArray, Bt = Array.prototype.indexOf, ae = Array.prototype.includes, Ht = Array.from, Vt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Kt = Object.prototype, $t = Array.prototype, Gt = Object.getPrototypeOf, We = Object.isExtensible;
const Wt = () => {
};
function Zt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, ye = 4, Me = 8, at = 1 << 24, Q = 16, H = 32, ne = 64, je = 128, N = 512, b = 1024, k = 2048, L = 4096, I = 8192, j = 16384, de = 32768, Ze = 1 << 25, ue = 65536, Je = 1 << 17, Jt = 1 << 18, ve = 1 << 19, Qt = 1 << 20, re = 65536, Le = 1 << 21, ze = 1 << 22, W = 1 << 23, Pe = Symbol("$state"), B = new class extends Error {
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
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let P = null;
function oe(e) {
  P = e;
}
function un(e, t = !1, n) {
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
function on(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Fn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function ot() {
  return !0;
}
let se = [];
function cn() {
  var e = se;
  se = [], Zt(e);
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
function ct(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & de) === 0 && (t.f & ye) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
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
function Be(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, b) : m(e, L);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), ht(e.deps), m(e, b);
}
const V = /* @__PURE__ */ new Set();
let w = null, O = null, qe = null, Ie = !1, le = null, Te = null;
var Qe = 0;
let dn = 1;
class J {
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
        m(r, L), this.schedule(r);
    }
  }
  #d() {
    if (Qe++ > 1e3 && (V.delete(this), vn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), m(l, k), this.schedule(l);
      for (const l of this.#l)
        m(l, L), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = Te = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (f) {
        throw gt(l), f;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (le = null, Te = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, f] of this.#f)
        pt(l, f);
    } else {
      this.#e.size === 0 && V.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), Xe(r), Xe(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = u ??= this;
      l.#n.push(...this.#n.filter((f) => !l.#n.includes(f)));
    }
    u !== null && (V.add(u), u.#d()), V.has(this) || this.#w();
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
      var s = i.f, u = (s & (H | ne)) !== 0, l = u && (s & b) !== 0, f = l || (s & I) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        u ? i.f ^= b : (s & ye) !== 0 ? n.push(i) : xe(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
        var a = i.first;
        if (a !== null) {
          i = a;
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
      dt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), O?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, O = null;
  }
  flush() {
    try {
      Ie = !0, w = this, this.#d();
    } finally {
      Qe = 0, qe = null, le = null, Te = null, Ie = !1, w = null, O = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), V.delete(this);
  }
  #w() {
    for (const a of V) {
      var t = a.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (a.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            a.current.get(o)[0]
          );
          if (t && h !== r)
            a.current.set(o, [h, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...a.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && a.discard();
      else if (n.length > 0) {
        a.activate();
        var s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (var l of n)
          vt(l, i, s, u);
        if (a.#n.length > 0) {
          a.apply();
          for (var f of a.#n)
            a.#o(f, [], []);
          a.#n = [];
        }
        a.deactivate();
      }
    }
    for (const a of V)
      a.#u.has(this) && (a.#u.delete(this), a.#u.size === 0 && !a.#h() && (a.activate(), a.#d()));
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
    return (this.#i ??= ft()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Ie || (V.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      O = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (qe = t, t.b?.is_pending && (t.f & (ye | Me | at)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (ne | H)) !== 0) {
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
    $(e, qe);
  }
}
let Y = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | I)) === 0 && xe(r) && (Y = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), Y?.size > 0)) {
        Z.clear();
        for (const i of Y) {
          if ((i.f & (j | I)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            Y.has(u) && (Y.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (j | I)) === 0 && he(f);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function vt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? vt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (ze | Q)) !== 0 && (s & k) === 0 && _t(i, t, r) && (m(i, k), He(
        /** @type {Effect} */
        i
      ));
    }
}
function _t(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && _t(
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
function He(e) {
  w.schedule(e);
}
function pt(e, t) {
  if (!((e.f & H) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      pt(n, t), n = n.next;
  }
}
function gt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    gt(t), t = t.next;
}
function _n(e) {
  let t = 0, n = Fe(0), r;
  return () => {
    $e() && (G(n), Pn(() => (t === 0 && (r = Bn(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
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
        p
      );
      u.b = this, u.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Nt(() => {
      this.#m();
    }, pn);
  }
  #w() {
    try {
      this.#n = z(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = z(() => {
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
    t && (this.is_pending = !0, this.#s = z(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = De();
      n.append(r), this.#n = this.#g(() => z(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, be(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = z(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ct(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = z(() => n(this.#t));
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
    dt(t, this.#v, this.#d);
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
    q(this.#i), M(this.#i), oe(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      q(n), M(r), oe(i);
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
      this.#h = !1, this.#o && Ne(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), G(
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
        an();
        return;
      }
      i = !0, s && sn(), this.#l !== null && be(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (f) => {
      try {
        s = !0, n?.(f, u), s = !1;
      } catch (a) {
        $(a, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return z(() => {
            var a = (
              /** @type {Effect} */
              p
            );
            a.b = this, a.f |= je, r(
              this.#t,
              () => f,
              () => u
            );
          });
        } catch (a) {
          return $(
            a,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (a) {
        $(a, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        l,
        /** @param {unknown} e */
        (a) => $(a, this.#i && this.#i.parent)
      ) : l(f);
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
    p
  ), l = bn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function a(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (u.f & j) === 0 && $(v, u);
    }
    Re();
  }
  if (n.length === 0) {
    f.then(() => a(t.map(i)));
    return;
  }
  var o = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => a([...t.map(i), ...c])).catch((c) => $(c, u)).finally(() => o());
  }
  f ? f.then(() => {
    l(), h(), Re();
  }) : h();
}
function bn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    q(e), M(t), oe(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  q(null), M(null), oe(null), e && w?.deactivate();
}
function wt() {
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
function yn(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
    deps: null,
    effects: null,
    equals: ut,
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
  r === null && Xt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Fe(
    /** @type {V} */
    E
  ), u = !_, l = /* @__PURE__ */ new Map();
  return Cn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), a = ft();
    i = a.promise;
    try {
      Promise.resolve(e()).then(a.resolve, a.reject).finally(Re);
    } catch (v) {
      a.reject(v), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (u) {
      if ((f.f & de) !== 0)
        var h = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(B), l.delete(o);
      else {
        for (const v of l.values())
          v.reject(B);
        l.clear();
      }
      l.set(o, a);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === B;
        h(g);
      }
      if (!(d === B || (f.f & j) !== 0)) {
        if (o.activate(), d)
          s.f |= W, Ne(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ne(s, v);
          for (const [x, F] of l) {
            if (l.delete(x), x === o) break;
            F.reject(B);
          }
        }
        o.deactivate();
      }
    };
    a.promise.then(c, (v) => c(null, v || "unknown"));
  }), Mn(() => {
    for (const f of l.values())
      f.reject(B);
  }), new Promise((f) => {
    function a(o) {
      function h() {
        o === i ? f(s) : a(i);
      }
      o.then(h, h);
    }
    a(i);
  });
}
function xn(e) {
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
function kn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = p;
  q(kn(e));
  try {
    e.f &= ~re, xn(e), t = Lt(e);
  } finally {
    q(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (O !== null ? ($e() || w?.is_fork) && O.set(e, n) : Be(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(B), t.teardown = Wt, t.ac = null, Ee(t, 0), Ge(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Ue = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let yt = !1;
function Fe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ut,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function U(e, t) {
  const n = Fe(e);
  return Un(n), n;
}
function K(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (_.f & Je) !== 0) && ot() && (_.f & (y | Q | ze | Je)) !== 0 && (D === null || !ae.call(D, e)) && rn();
  let r = n ? _e(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), O === null && Be(s);
    }
    e.wv = It(), Et(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (H | ne)) === 0 && (R === null ? Yn([e]) : R.push(e)), !i.is_fork && Ue.size > 0 && !yt && Sn();
  }
  return t;
}
function Sn() {
  yt = !1;
  for (const e of Ue)
    (e.f & b) !== 0 && m(e, L), xe(e) && he(e);
  Ue.clear();
}
function we(e) {
  K(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, f = (l & k) === 0;
      if (f && m(u, t), (l & y) !== 0) {
        var a = (
          /** @type {Derived} */
          u
        );
        O?.delete(a), (l & re) === 0 && (l & N && (u.f |= re), Et(a, L, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          u
        );
        (l & Q) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : He(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = Gt(e);
  if (t !== Kt && t !== $t)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zt(e), i = /* @__PURE__ */ U(0), s = te, u = (l) => {
    if (te === s)
      return l();
    var f = _, a = te;
    M(null), nt(s);
    var o = l();
    return M(f), nt(a), o;
  };
  return r && n.set("length", /* @__PURE__ */ U(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, a) {
        (!("value" in a) || a.configurable === !1 || a.enumerable === !1 || a.writable === !1) && tn();
        var o = n.get(f);
        return o === void 0 ? u(() => {
          var h = /* @__PURE__ */ U(a.value);
          return n.set(f, h), h;
        }) : K(o, a.value, !0), !0;
      },
      deleteProperty(l, f) {
        var a = n.get(f);
        if (a === void 0) {
          if (f in l) {
            const o = u(() => /* @__PURE__ */ U(E));
            n.set(f, o), we(i);
          }
        } else
          K(a, E), we(i);
        return !0;
      },
      get(l, f, a) {
        if (f === Pe)
          return e;
        var o = n.get(f), h = f in l;
        if (o === void 0 && (!h || ge(l, f)?.writable) && (o = u(() => {
          var v = _e(h ? l[f] : E), d = /* @__PURE__ */ U(v);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = G(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, f, a);
      },
      getOwnPropertyDescriptor(l, f) {
        var a = Reflect.getOwnPropertyDescriptor(l, f);
        if (a && "value" in a) {
          var o = n.get(f);
          o && (a.value = G(o));
        } else if (a === void 0) {
          var h = n.get(f), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return a;
      },
      has(l, f) {
        if (f === Pe)
          return !0;
        var a = n.get(f), o = a !== void 0 && a.v !== E || Reflect.has(l, f);
        if (a !== void 0 || p !== null && (!o || ge(l, f)?.writable)) {
          a === void 0 && (a = u(() => {
            var c = o ? _e(l[f]) : E, v = /* @__PURE__ */ U(c);
            return v;
          }), n.set(f, a));
          var h = G(a);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(l, f, a, o) {
        var h = n.get(f), c = f in l;
        if (r && f === "length")
          for (var v = a; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? K(d, E) : v in l && (d = u(() => /* @__PURE__ */ U(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(l, f)?.writable) && (h = u(() => /* @__PURE__ */ U(void 0)), K(h, _e(a)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = u(() => _e(a));
          K(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(l, f);
        if (x?.set && x.set.call(o, a), !c) {
          if (r && typeof f == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= F.v && K(F, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(l) {
        G(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [a, o] of n)
          o.v !== E && !(a in l) && f.push(a);
        return f;
      },
      setPrototypeOf() {
        nn();
      }
    }
  );
}
var et, xt, kt, Tt;
function An() {
  if (et === void 0) {
    et = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kt = ge(t, "firstChild").get, Tt = ge(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function De(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function St(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
function me(e, t) {
  return /* @__PURE__ */ St(e);
}
function At(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ke(r);
  return r;
}
function Rn() {
  return !1;
}
function Nn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
function Rt(e) {
  var t = _, n = p;
  M(null), q(null);
  try {
    return e();
  } finally {
    M(t), q(n);
  }
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & I) !== 0 && (e |= I);
  var r = {
    ctx: P,
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
  if (i !== null && (i.parent = n, n !== null && Dn(i, n), _ !== null && (_.f & y) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function $e() {
  return _ !== null && !C;
}
function Mn(e) {
  const t = X(Me, null);
  return m(t, b), t.teardown = e, t;
}
function Fn(e) {
  return X(ye | Qt, e);
}
function On(e) {
  J.ensure();
  const t = X(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function Cn(e) {
  return X(ze | ve, e);
}
function Pn(e, t = 0) {
  return X(Me | t, e);
}
function In(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    X(Me, () => e(...i.map(G)));
  });
}
function Nt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function z(e) {
  return X(H | ve, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    tt(!0), M(null);
    try {
      t.call(null);
    } finally {
      tt(n), M(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(B);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function jn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & H) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & Jt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ln(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), Ge(e, t && !n), Ee(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= Ze, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ln(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var l of r)
      l.out(u);
  } else
    i();
}
function Ft(e, t, n) {
  if ((e.f & I) === 0) {
    e.f ^= I;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & ue) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & H) !== 0 && (e.f & Q) !== 0;
      Ft(i, t, u ? n : !1), i = s;
    }
  }
}
function qn(e) {
  Ot(e, !0);
}
function Ot(e, t) {
  if ((e.f & I) !== 0) {
    e.f ^= I, (e.f & b) === 0 && (m(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ue) !== 0 || (n.f & H) !== 0;
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
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Se = !1, ce = !1;
function tt(e) {
  ce = e;
}
let _ = null, C = !1;
function M(e) {
  _ = e;
}
let p = null;
function q(e) {
  p = e;
}
let D = null;
function Un(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, S = 0, R = null;
function Yn(e) {
  R = e;
}
let Pt = 1, ee = 0, te = ee;
function nt(e) {
  te = e;
}
function It() {
  return ++Pt;
}
function xe(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (xe(
        /** @type {Derived} */
        s
      ) && mt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    O === null && m(e, b);
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
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, L), He(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = R, i = _, s = D, u = P, l = C, f = te, a = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, _ = (a & (H | ne)) === 0 ? e : null, D = null, oe(e.ctx), C = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(B);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || Ee(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if ($e() && (e.f & N) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (Ee(e, S), c.length = S);
    if (ot() && R !== null && !C && c !== null && (e.f & (y | L | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        jt(
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
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return ct(g);
  } finally {
    e.f ^= Le, T = t, S = n, R = r, _ = i, D = s, oe(u), C = l, te = f;
  }
}
function zn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bt.call(n, e);
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
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), Be(s), Tn(s), Ee(s, 0);
  }
}
function Ee(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      zn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, b);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Q | at)) !== 0 ? jn(e) : Ge(e), Dt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function G(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !C) {
    var r = p !== null && (p.f & j) !== 0;
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
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = u.v;
      return ((u.f & b) === 0 && u.reactions !== null || Ut(u)) && (l = Ve(u)), Z.set(u, l), l;
    }
    var f = (u.f & N) === 0 && !C && _ !== null && (Se || (_.f & N) !== 0), a = (u.f & de) === 0;
    xe(u) && (f && (u.f |= N), mt(u)), f && !a && (bt(u), qt(u));
  }
  if (O?.has(e))
    return O.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (bt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Ut(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & y) !== 0 && Ut(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Bn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Vn(e, t) {
  Hn("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function $n(e) {
  return Kn.includes(e);
}
const pe = Symbol("events"), Yt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function Gn(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    Yt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let it = null;
function st(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  it = e;
  var u = 0, l = it === e && e[pe];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var a = i.indexOf(t);
    if (a === -1)
      return;
    f <= a && (u = f);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    M(null), q(null);
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
      e[pe] = t, delete e.currentTarget, M(o), q(h);
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
  var t = Nn("template");
  return t.innerHTML = Jn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Oe(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ St(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function Ae(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function er(e, t) {
  return tr(e, t);
}
const ke = /* @__PURE__ */ new Map();
function tr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  An();
  var f = void 0, a = On(() => {
    var o = n ?? t.appendChild(De());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        un({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, on();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const Ce of [t, document]) {
            var F = ke.get(Ce);
            F === void 0 && (F = /* @__PURE__ */ new Map(), ke.set(Ce, F));
            var ie = F.get(g);
            ie === void 0 ? (Ce.addEventListener(g, st, { passive: x }), F.set(g, 1)) : F.set(g, ie + 1);
          }
        }
      }
    };
    return c(Ht(Yt)), Ye.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            ke.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, st), d.delete(v), d.size === 0 && ke.delete(x)) : d.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return nr.set(f, a), f;
}
let nr = /* @__PURE__ */ new WeakMap();
class rr {
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
        l && (A(l.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#a) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var a = document.createDocumentFragment();
            Ct(u, a), a.append(De()), this.#e.set(s, { effect: u, fragment: a });
          } else
            A(u);
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
    ), i = Rn();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = De();
        s.append(u), this.#e.set(t, {
          effect: z(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          z(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, f] of this.#a)
        l === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [l, f] of this.#e)
        l === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function lt(e, t, ...n) {
  var r = new rr(e);
  Nt(() => {
    const i = t() ?? null;
    r.ensure(i, i && ((s) => i(s, ...n)));
  }, ue);
}
var ir = /* @__PURE__ */ Oe("<div><div><!></div> <div><!></div></div>");
function sr(e, t) {
  var n = ir(), r = me(n), i = me(r);
  lt(i, () => t.header);
  var s = At(r, 2), u = me(s);
  lt(u, () => t.body), Ae(e, n);
}
var lr = /* @__PURE__ */ Oe("<span> </span>"), fr = /* @__PURE__ */ Oe("<span>Body content</span>"), ar = /* @__PURE__ */ Oe("<div><!> <button>Update Title</button></div>");
function ur(e) {
  let t = /* @__PURE__ */ U("Hello Card");
  var n = ar(), r = me(n);
  sr(r, { header: (l) => {
    var f = lr(), a = me(f);
    In(() => Vn(a, `Header: ${G(t) ?? ""}`)), Ae(l, f);
  }, body: (l) => {
    var f = fr();
    Ae(l, f);
  } });
  var i = At(r, 2);
  Gn("click", i, () => K(t, "Updated")), Ae(e, n);
}
Wn(["click"]);
function cr(e) {
  return er(ur, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

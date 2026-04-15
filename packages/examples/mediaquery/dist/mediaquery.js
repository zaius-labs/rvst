var Ht = Array.isArray, Wt = Array.prototype.indexOf, ae = Array.prototype.includes, $t = Array.from, Kt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Gt = Object.prototype, Qt = Array.prototype, Zt = Object.getPrototypeOf, Qe = Object.isExtensible;
const Jt = () => {
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
const y = 2, me = 4, Me = 8, ct = 1 << 24, Q = 16, V = 32, re = 64, Ie = 128, M = 512, b = 1024, k = 2048, L = 4096, I = 8192, j = 16384, de = 32768, Ze = 1 << 25, ue = 65536, Je = 1 << 17, en = 1 << 18, ve = 1 << 19, tn = 1 << 20, ie = 65536, je = 1 << 21, qe = 1 << 22, $ = 1 << 23, Fe = Symbol("$state"), B = new class extends Error {
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
function dt(e, t = !1, n) {
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
function vt(e) {
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
function _t() {
  return !0;
}
let le = [];
function hn() {
  var e = le;
  le = [], Xt(e);
}
function te(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && hn();
    });
  }
  le.push(e);
}
function pt(e) {
  var t = p;
  if (t === null)
    return _.f |= $, e;
  if ((t.f & de) === 0 && (t.f & me) === 0)
    throw e;
  W(e, t);
}
function W(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
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
const dn = -7169;
function m(e, t) {
  e.f = e.f & dn | t;
}
function Be(e) {
  (e.f & M) !== 0 || e.deps === null ? m(e, b) : m(e, L);
}
function gt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ie) === 0 || (t.f ^= ie, gt(
        /** @type {Derived} */
        t.deps
      ));
}
function wt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), gt(e.deps), m(e, b);
}
const U = /* @__PURE__ */ new Set();
let w = null, O = null, Le = null, Oe = !1, fe = null, ke = null;
var Xe = 0;
let vn = 1;
class G {
  id = vn++;
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
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #t = /* @__PURE__ */ new Map();
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
  #f = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #a = /* @__PURE__ */ new Map();
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
          if (this.#a.has(n)) {
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
    this.#a.has(t) || this.#a.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#a.get(t);
    if (n) {
      this.#a.delete(t);
      for (var r of n.d)
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, L), this.schedule(r);
    }
  }
  #d() {
    if (Xe++ > 1e3 && (U.delete(this), _n()), !this.#h()) {
      for (const l of this.#s)
        this.#f.delete(l), m(l, k), this.schedule(l);
      for (const l of this.#f)
        m(l, L), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = fe = [], r = [], i = ke = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (a) {
        throw Et(l), a;
      }
    if (w = null, i.length > 0) {
      var s = G.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (fe = null, ke = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, a] of this.#a)
        yt(l, a);
    } else {
      this.#t.size === 0 && U.delete(this), this.#s.clear(), this.#f.clear();
      for (const l of this.#e) l(this);
      this.#e.clear(), et(r), et(n), this.#i?.resolve();
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
    u !== null && (U.add(u), u.#d()), U.has(this) || this.#w();
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
      var s = i.f, u = (s & (V | re)) !== 0, l = u && (s & b) !== 0, a = l || (s & I) !== 0 || this.#a.has(i);
      if (!a && i.fn !== null) {
        u ? i.f ^= b : (s & me) !== 0 ? n.push(i) : ye(i) && ((s & Q) !== 0 && this.#f.add(i), he(i));
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
      wt(t[n], this.#s, this.#f);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & $) === 0 && (this.current.set(t, [t.v, r]), O?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, O = null;
  }
  flush() {
    try {
      Oe = !0, w = this, this.#d();
    } finally {
      Xe = 0, Le = null, fe = null, ke = null, Oe = !1, w = null, O = null, K.clear();
    }
  }
  discard() {
    for (const t of this.#l) t(this);
    this.#l.clear(), U.delete(this);
  }
  #w() {
    for (const f of U) {
      var t = f.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (f.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(o)[0]
          );
          if (t && h !== r)
            f.current.set(o, [h, c]);
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
          mt(l, i, s, u);
        if (f.#n.length > 0) {
          f.apply();
          for (var a of f.#n)
            f.#o(a, [], []);
          f.#n = [];
        }
        f.deactivate();
      }
    }
    for (const f of U)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#h() && (f.activate(), f.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#t.get(n) ?? 0;
    if (this.#t.set(n, r + 1), t) {
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
    let i = this.#t.get(n) ?? 0;
    if (i === 1 ? this.#t.delete(n) : this.#t.set(n, i - 1), t) {
      let s = this.#r.get(n) ?? 0;
      s === 1 ? this.#r.delete(n) : this.#r.set(n, s - 1);
    }
    this.#c || r || (this.#c = !0, te(() => {
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
      this.#f.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#l.add(t);
  }
  settled() {
    return (this.#i ??= ot()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new G();
      Oe || (U.add(w), te(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (me | Me | ct)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (re | V)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function _n() {
  try {
    rn();
  } catch (e) {
    W(e, Le);
  }
}
let Y = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | I)) === 0 && ye(r) && (Y = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pt(r), Y?.size > 0)) {
        K.clear();
        for (const i of Y) {
          if ((i.f & (j | I)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            Y.has(u) && (Y.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const a = s[l];
            (a.f & (j | I)) === 0 && he(a);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function mt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? mt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (qe | Q)) !== 0 && (s & k) === 0 && bt(i, t, r) && (m(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function bt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && bt(
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
function yt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      yt(n, t), n = n.next;
  }
}
function Et(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    Et(t), t = t.next;
}
function xt(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    $e() && (ee(n), Pn(() => (t === 0 && (r = Vn(() => e(() => ge(n)))), t += 1, () => {
      te(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
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
  #e;
  /** @type {TemplateNode | null} */
  #l = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #f = null;
  /** @type {DocumentFragment | null} */
  #a = null;
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
  #_ = xt(() => (this.#o = Ne(this.#c), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#e = t, this.#t = n, this.#r = (s) => {
      var u = (
        /** @type {Effect} */
        p
      );
      u.b = this, u.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ot(() => {
      this.#m();
    }, pn);
  }
  #w() {
    try {
      this.#n = q(() => this.#r(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed;
    n && (this.#f = q(() => {
      n(
        this.#e,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#s = q(() => t(this.#e)), te(() => {
      var n = this.#a = document.createDocumentFragment(), r = Re();
      n.append(r), this.#n = this.#g(() => q(() => this.#r(r))), this.#u === 0 && (this.#e.before(n), this.#a = null, we(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = q(() => {
        this.#r(this.#e);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        Lt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#s = q(() => n(this.#e));
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
    wt(t, this.#v, this.#d);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#t.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var n = p, r = _, i = P;
    z(this.#i), D(this.#i), oe(this.#i.ctx);
    try {
      return G.ensure(), t();
    } catch (s) {
      return pt(s), null;
    } finally {
      z(n), D(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && we(this.#s, () => {
      this.#s = null;
    }), this.#a && (this.#e.before(this.#a), this.#a = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, te(() => {
      this.#h = !1, this.#o && Ae(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), ee(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#t.onerror;
    let r = this.#t.failed;
    if (!n && !r)
      throw t;
    this.#n && (A(this.#n), this.#n = null), this.#s && (A(this.#s), this.#s = null), this.#f && (A(this.#f), this.#f = null);
    var i = !1, s = !1;
    const u = () => {
      if (i) {
        cn();
        return;
      }
      i = !0, s && an(), this.#f !== null && we(this.#f, () => {
        this.#f = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (a) => {
      try {
        s = !0, n?.(a, u), s = !1;
      } catch (f) {
        W(f, this.#i && this.#i.parent);
      }
      r && (this.#f = this.#g(() => {
        try {
          return q(() => {
            var f = (
              /** @type {Effect} */
              p
            );
            f.b = this, f.f |= Ie, r(
              this.#e,
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
    te(() => {
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
    p
  ), l = bn(), a = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (u.f & j) === 0 && W(v, u);
    }
    Se();
  }
  if (n.length === 0) {
    a.then(() => f(t.map(i)));
    return;
  }
  var o = kt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => f([...t.map(i), ...c])).catch((c) => W(c, u)).finally(() => o());
  }
  a ? a.then(() => {
    l(), h(), Se();
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
    z(e), D(t), oe(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  z(null), D(null), oe(null), e && w?.deactivate();
}
function kt() {
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
function En(e, t, n) {
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
  ), u = !_, l = /* @__PURE__ */ new Map();
  return Cn(() => {
    var a = (
      /** @type {Effect} */
      p
    ), f = ot();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Se);
    } catch (v) {
      f.reject(v), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (u) {
      if ((a.f & de) !== 0)
        var h = kt();
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
      l.set(o, f);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === B;
        h(g);
      }
      if (!(d === B || (a.f & j) !== 0)) {
        if (o.activate(), d)
          s.f |= $, Ae(s, d);
        else {
          (s.f & $) !== 0 && (s.f ^= $), Ae(s, v);
          for (const [x, F] of l) {
            if (l.delete(x), x === o) break;
            F.reject(B);
          }
        }
        o.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), Dn(() => {
    for (const a of l.values())
      a.reject(B);
  }), new Promise((a) => {
    function f(o) {
      function h() {
        o === i ? a(s) : f(i);
      }
      o.then(h, h);
    }
    f(i);
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
function Ue(e) {
  var t, n = p;
  z(kn(e));
  try {
    e.f &= ~ie, xn(e), t = Bt(e);
  } finally {
    z(n);
  }
  return t;
}
function Tt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Yt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (O !== null ? ($e() || w?.is_fork) && O.set(e, n) : Be(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(B), t.teardown = Jt, t.ac = null, be(t, 0), Ke(t));
}
function St(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let ze = /* @__PURE__ */ new Set();
const K = /* @__PURE__ */ new Map();
let At = !1;
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
function H(e, t) {
  const n = Ne(e);
  return Yn(n), n;
}
function J(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (_.f & Je) !== 0) && _t() && (_.f & (y | Q | qe | Je)) !== 0 && (N === null || !ae.call(N, e)) && fn();
  let r = n ? _e(t) : t;
  return Ae(e, r, ke);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? K.set(e, t) : K.set(e, r), e.v = t;
    var i = G.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ue(s), O === null && Be(s);
    }
    e.wv = Yt(), Rt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (V | re)) === 0 && (R === null ? qn([e]) : R.push(e)), !i.is_fork && ze.size > 0 && !At && Sn();
  }
  return t;
}
function Sn() {
  At = !1;
  for (const e of ze)
    (e.f & b) !== 0 && m(e, L), ye(e) && he(e);
  ze.clear();
}
function ge(e) {
  J(e, e.v + 1);
}
function Rt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, a = (l & k) === 0;
      if (a && m(u, t), (l & y) !== 0) {
        var f = (
          /** @type {Derived} */
          u
        );
        O?.delete(f), (l & ie) === 0 && (l & M && (u.f |= ie), Rt(f, L, n));
      } else if (a) {
        var o = (
          /** @type {Effect} */
          u
        );
        (l & Q) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Fe in e)
    return e;
  const t = Zt(e);
  if (t !== Gt && t !== Qt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ht(e), i = /* @__PURE__ */ H(0), s = ne, u = (l) => {
    if (ne === s)
      return l();
    var a = _, f = ne;
    D(null), it(s);
    var o = l();
    return D(a), it(f), o;
  };
  return r && n.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, a, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && sn();
        var o = n.get(a);
        return o === void 0 ? u(() => {
          var h = /* @__PURE__ */ H(f.value);
          return n.set(a, h), h;
        }) : J(o, f.value, !0), !0;
      },
      deleteProperty(l, a) {
        var f = n.get(a);
        if (f === void 0) {
          if (a in l) {
            const o = u(() => /* @__PURE__ */ H(E));
            n.set(a, o), ge(i);
          }
        } else
          J(f, E), ge(i);
        return !0;
      },
      get(l, a, f) {
        if (a === Fe)
          return e;
        var o = n.get(a), h = a in l;
        if (o === void 0 && (!h || pe(l, a)?.writable) && (o = u(() => {
          var v = _e(h ? l[a] : E), d = /* @__PURE__ */ H(v);
          return d;
        }), n.set(a, o)), o !== void 0) {
          var c = ee(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, a, f);
      },
      getOwnPropertyDescriptor(l, a) {
        var f = Reflect.getOwnPropertyDescriptor(l, a);
        if (f && "value" in f) {
          var o = n.get(a);
          o && (f.value = ee(o));
        } else if (f === void 0) {
          var h = n.get(a), c = h?.v;
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
      has(l, a) {
        if (a === Fe)
          return !0;
        var f = n.get(a), o = f !== void 0 && f.v !== E || Reflect.has(l, a);
        if (f !== void 0 || p !== null && (!o || pe(l, a)?.writable)) {
          f === void 0 && (f = u(() => {
            var c = o ? _e(l[a]) : E, v = /* @__PURE__ */ H(c);
            return v;
          }), n.set(a, f));
          var h = ee(f);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(l, a, f, o) {
        var h = n.get(a), c = a in l;
        if (r && a === "length")
          for (var v = f; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? J(d, E) : v in l && (d = u(() => /* @__PURE__ */ H(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || pe(l, a)?.writable) && (h = u(() => /* @__PURE__ */ H(void 0)), J(h, _e(f)), n.set(a, h));
        else {
          c = h.v !== E;
          var g = u(() => _e(f));
          J(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(l, a);
        if (x?.set && x.set.call(o, f), !c) {
          if (r && typeof a == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(a);
            Number.isInteger(se) && se >= F.v && J(F, se + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(l) {
        ee(i);
        var a = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [f, o] of n)
          o.v !== E && !(f in l) && a.push(f);
        return a;
      },
      setPrototypeOf() {
        ln();
      }
    }
  );
}
var tt, Mt, Nt, Dt;
function An() {
  if (tt === void 0) {
    tt = window, Mt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Nt = pe(t, "firstChild").get, Dt = pe(t, "nextSibling").get, Qe(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Qe(n) && (n.__t = void 0);
  }
}
function Re(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ft(e) {
  return (
    /** @type {TemplateNode | null} */
    Nt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    Dt.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ Ft(e);
}
function nt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function Rn() {
  return !1;
}
function Mn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(on, e, void 0)
  );
}
function We(e) {
  var t = _, n = p;
  D(null), z(null);
  try {
    return e();
  } finally {
    D(t), z(n);
  }
}
function Nn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & I) !== 0 && (e |= I);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | k | M,
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
  if ((e & me) !== 0)
    fe !== null ? fe.push(r) : G.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (u) {
      throw A(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & ue) !== 0 && i !== null && (i.f |= ue));
  }
  if (i !== null && (i.parent = n, n !== null && Nn(i, n), _ !== null && (_.f & y) !== 0 && (e & re) === 0)) {
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
function Dn(e) {
  const t = Z(Me, null);
  return m(t, b), t.teardown = e, t;
}
function Fn(e) {
  return Z(me | tn, e);
}
function On(e) {
  G.ensure();
  const t = Z(re | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function Cn(e) {
  return Z(qe | ve, e);
}
function Pn(e, t = 0) {
  return Z(Me | t, e);
}
function In(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    Z(Me, () => e(...i.map(ee)));
  });
}
function Ot(e, t = 0) {
  var n = Z(Q | t, e);
  return n;
}
function q(e) {
  return Z(V | ve, e);
}
function Ct(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    rt(!0), D(null);
    try {
      t.call(null);
    } finally {
      rt(n), D(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && We(() => {
      i.abort(B);
    });
    var r = n.next;
    (n.f & re) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function jn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & en) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ln(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), Ke(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ct(e), e.f ^= Ze, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Pt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ln(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function Pt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
  var r = [];
  It(e, r, !0);
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
function It(e, t, n) {
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
      (i.f & V) !== 0 && (e.f & Q) !== 0;
      It(i, t, u ? n : !1), i = s;
    }
  }
}
function zn(e) {
  jt(e, !0);
}
function jt(e, t) {
  if ((e.f & I) !== 0) {
    e.f ^= I, (e.f & b) === 0 && (m(e, k), G.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ue) !== 0 || (n.f & V) !== 0;
      jt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function Lt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let Te = !1, ce = !1;
function rt(e) {
  ce = e;
}
let _ = null, C = !1;
function D(e) {
  _ = e;
}
let p = null;
function z(e) {
  p = e;
}
let N = null;
function Yn(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, R = null;
function qn(e) {
  R = e;
}
let zt = 1, X = 0, ne = X;
function it(e) {
  ne = e;
}
function Yt() {
  return ++zt;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~ie), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && Tt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & M) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    O === null && m(e, b);
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
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, L), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Bt(e) {
  var t = T, n = S, r = R, i = _, s = N, u = P, l = C, a = ne, f = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, _ = (f & (V | re)) === 0 ? e : null, N = null, oe(e.ctx), C = !1, ne = ++X, e.ac !== null && (We(() => {
    e.ac.abort(B);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || be(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if ($e() && (e.f & M) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (be(e, S), c.length = S);
    if (_t() && R !== null && !C && c !== null && (e.f & (y | L | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        qt(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (X++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = X;
      if (t !== null)
        for (const g of t)
          g.rv = X;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & $) !== 0 && (e.f ^= $), h;
  } catch (g) {
    return pt(g);
  } finally {
    e.f ^= je, T = t, S = n, R = r, _ = i, N = s, oe(u), C = l, ne = a;
  }
}
function Bn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Wt.call(n, e);
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
    (s.f & M) !== 0 && (s.f ^= M, s.f &= ~ie), Be(s), Tn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Q | ct)) !== 0 ? jn(e) : Ke(e), Ct(e);
      var i = Bt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = zt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function ee(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !C) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (N === null || !ae.call(N, e))) {
      var i = _.deps;
      if ((_.f & je) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && K.has(e))
    return K.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = u.v;
      return ((u.f & b) === 0 && u.reactions !== null || Ut(u)) && (l = Ue(u)), K.set(u, l), l;
    }
    var a = (u.f & M) === 0 && !C && _ !== null && (Te || (_.f & M) !== 0), f = (u.f & de) === 0;
    ye(u) && (a && (u.f |= M), Tt(u)), a && !f && (St(u), Vt(u));
  }
  if (O?.has(e))
    return O.get(e);
  if ((e.f & $) !== 0)
    throw e.v;
  return e.v;
}
function Vt(e) {
  if (e.f |= M, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & M) === 0 && (St(
        /** @type {Derived} */
        t
      ), Vt(
        /** @type {Derived} */
        t
      ));
}
function Ut(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (K.has(t) || (t.f & y) !== 0 && Ut(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Vn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const st = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  st?.[e] ? st[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function lt(e, t) {
  Un("op_set_text", e, t);
}
const Hn = ["touchstart", "touchmove"];
function Wn(e) {
  return Hn.includes(e);
}
const Ee = Symbol("events"), $n = /* @__PURE__ */ new Set(), ft = /* @__PURE__ */ new Set();
function Kn(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || Ye.call(t, s), !s.cancelBubble)
      return We(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? te(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function Gn(e, t, n, r = {}) {
  var i = Kn(t, e, n, r);
  return () => {
    e.removeEventListener(t, i, r);
  };
}
let at = null;
function Ye(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  at = e;
  var u = 0, l = at === e && e[Ee];
  if (l) {
    var a = i.indexOf(l);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ee] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    a <= f && (u = a);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Kt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    D(null), z(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[Ee]?.[r];
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
      e[Ee] = t, delete e.currentTarget, D(o), z(h);
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
function Zn(e) {
  return (
    /** @type {string} */
    Qn?.createHTML(e) ?? e
  );
}
function Jn(e) {
  var t = Mn("template");
  return t.innerHTML = Zn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Ge(e, t) {
  var n = (t & un) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Jn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ft(r));
    var s = (
      /** @type {TemplateNode} */
      n || Mt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function Pe(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function er(e, t) {
  return tr(e, t);
}
const xe = /* @__PURE__ */ new Map();
function tr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  An();
  var a = void 0, f = On(() => {
    var o = n ?? t.appendChild(Re());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        dt({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), a = e(v, r) || {}, vt();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Wn(g);
          for (const De of [t, document]) {
            var F = xe.get(De);
            F === void 0 && (F = /* @__PURE__ */ new Map(), xe.set(De, F));
            var se = F.get(g);
            se === void 0 ? (De.addEventListener(g, Ye, { passive: x }), F.set(g, 1)) : F.set(g, se + 1);
          }
        }
      }
    };
    return c($t($n)), ft.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, Ye), d.delete(v), d.size === 0 && xe.delete(x)) : d.set(v, g);
        }
      ft.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return nr.set(a, f), a;
}
let nr = /* @__PURE__ */ new WeakMap();
class rr {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #e = /* @__PURE__ */ new Map();
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
  #l = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #t = /* @__PURE__ */ new Map();
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
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#l.get(n);
      if (r)
        zn(r), this.#r.delete(n);
      else {
        var i = this.#t.get(n);
        i && (this.#l.set(n, i.effect), this.#t.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#e) {
        if (this.#e.delete(s), s === t)
          break;
        const l = this.#t.get(u);
        l && (A(l.effect), this.#t.delete(u));
      }
      for (const [s, u] of this.#l) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#e.values()).includes(s)) {
            var f = document.createDocumentFragment();
            Lt(u, f), f.append(Re()), this.#t.set(s, { effect: u, fragment: f });
          } else
            A(u);
          this.#r.delete(s), this.#l.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), we(u, l, !1)) : l();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [r, i] of this.#t)
      n.includes(r) || (A(i.effect), this.#t.delete(r));
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
    if (n && !this.#l.has(t) && !this.#t.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = Re();
        s.append(u), this.#t.set(t, {
          effect: q(() => n(u)),
          fragment: s
        });
      } else
        this.#l.set(
          t,
          q(() => n(this.anchor))
        );
    if (this.#e.set(r, t), i) {
      for (const [l, a] of this.#l)
        l === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [l, a] of this.#t)
        l === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function ir(e, t, n = !1) {
  var r = new rr(e), i = n ? ue : 0;
  function s(u, l) {
    r.ensure(u, l);
  }
  Ot(() => {
    var u = !1;
    t((l, a = 0) => {
      u = !0, s(a, l);
    }), u || s(-1, null);
  }, i);
}
class sr {
  #e;
  #l;
  /**
   *
   * @param {() => T} fn
   * @param {(update: () => void) => void} onsubscribe
   */
  constructor(t, n) {
    this.#e = t, this.#l = xt(n);
  }
  get current() {
    return this.#l(), this.#e();
  }
}
const lr = /\(.+\)/, fr = /* @__PURE__ */ new Set(["all", "print", "screen", "and", "or", "not", "only"]);
class ut extends sr {
  /**
   * @param {string} query A media query string
   * @param {boolean} [fallback] Fallback value for the server
   */
  constructor(t, n) {
    let r = lr.test(t) || // we need to use `some` here because technically this `window.matchMedia('random,screen')` still returns true
    t.split(/[\s,]+/).some((s) => fr.has(s.trim())) ? t : `(${t})`;
    const i = window.matchMedia(r);
    super(
      () => i.matches,
      (s) => Gn(i, "change", s)
    );
  }
}
var ar = /* @__PURE__ */ Ge("<div>Mobile layout</div>"), ur = /* @__PURE__ */ Ge("<div>Desktop layout</div>"), or = /* @__PURE__ */ Ge("<div><div> </div> <div> </div> <!></div>");
function cr(e, t) {
  dt(t, !0);
  const n = new ut("(max-width: 600px)"), r = new ut("(min-width: 601px)");
  var i = or(), s = Ce(i), u = Ce(s), l = nt(s, 2), a = Ce(l), f = nt(l, 2);
  {
    var o = (c) => {
      var v = ar();
      Pe(c, v);
    }, h = (c) => {
      var v = ur();
      Pe(c, v);
    };
    ir(f, (c) => {
      n.current ? c(o) : c(h, -1);
    });
  }
  In(() => {
    lt(u, `Narrow: ${n.current ?? ""}`), lt(a, `Wide: ${r.current ?? ""}`);
  }), Pe(e, i), vt();
}
function dr(e) {
  return er(cr, { target: e });
}
export {
  dr as default,
  dr as rvst_mount
};

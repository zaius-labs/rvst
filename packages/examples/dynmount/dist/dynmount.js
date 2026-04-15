var Wt = Array.isArray, Zt = Array.prototype.indexOf, ae = Array.prototype.includes, Jt = Array.from, Qt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Xt = Object.prototype, en = Array.prototype, tn = Object.getPrototypeOf, Ze = Object.isExtensible;
const nn = () => {
};
function rn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, ye = 4, Ne = 8, ot = 1 << 24, Q = 16, Y = 32, ne = 64, je = 128, N = 512, b = 1024, k = 2048, z = 4096, L = 8192, q = 16384, se = 32768, Je = 1 << 25, ce = 65536, Qe = 1 << 17, sn = 1 << 18, ve = 1 << 19, ln = 1 << 20, re = 65536, Le = 1 << 21, Be = 1 << 22, W = 1 << 23, Oe = Symbol("$state"), H = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function at(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function fn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function un(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function on() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function an(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
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
const pn = 2, x = Symbol(), gn = "http://www.w3.org/1999/xhtml";
function wn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ct(e) {
  return e === this.v;
}
let S = null;
function he(e) {
  S = e;
}
function ht(e, t = !1, n) {
  S = {
    p: S,
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
function dt(e) {
  var t = (
    /** @type {ComponentContext} */
    S
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ct(r);
  }
  return t.i = !0, S = t.p, /** @type {T} */
  {};
}
function vt() {
  return !0;
}
let fe = [];
function mn() {
  var e = fe;
  fe = [], rn(e);
}
function oe(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && mn();
    });
  }
  fe.push(e);
}
function _t(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & se) === 0 && (t.f & ye) === 0)
    throw e;
  G(e, t);
}
function G(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0) {
      if ((t.f & se) === 0)
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
const yn = -7169;
function y(e, t) {
  e.f = e.f & yn | t;
}
function Ue(e) {
  (e.f & N) !== 0 || e.deps === null ? y(e, b) : y(e, z);
}
function pt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & re) === 0 || (t.f ^= re, pt(
        /** @type {Derived} */
        t.deps
      ));
}
function gt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & z) !== 0 && n.add(e), pt(e.deps), y(e, b);
}
const $ = /* @__PURE__ */ new Set();
let w = null, I = null, qe = null, Pe = !1, ue = null, Se = null;
var Xe = 0;
let bn = 1;
class J {
  id = bn++;
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
        y(r, k), this.schedule(r);
      for (r of n.m)
        y(r, z), this.schedule(r);
    }
  }
  #d() {
    if (Xe++ > 1e3 && ($.delete(this), En()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), y(l, k), this.schedule(l);
      for (const l of this.#l)
        y(l, z), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ue = [], r = [], i = Se = [];
    for (const l of t)
      try {
        this.#a(l, n, r);
      } catch (f) {
        throw bt(l), f;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (ue = null, Se = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, f] of this.#f)
        yt(l, f);
    } else {
      this.#e.size === 0 && $.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), et(r), et(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = o ??= this;
      l.#n.push(...this.#n.filter((f) => !l.#n.includes(f)));
    }
    o !== null && ($.add(o), o.#d()), $.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & (Y | ne)) !== 0, l = o && (s & b) !== 0, f = l || (s & L) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= b : (s & ye) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#l.add(i), de(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
      gt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), I?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, I = null;
  }
  flush() {
    try {
      Pe = !0, w = this, this.#d();
    } finally {
      Xe = 0, qe = null, ue = null, Se = null, Pe = !1, w = null, I = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), $.delete(this);
  }
  #w() {
    for (const u of $) {
      var t = u.id < this.id, n = [];
      for (const [a, [h, c]] of this.current) {
        if (u.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(a)[0]
          );
          if (t && h !== r)
            u.current.set(a, [h, c]);
          else
            continue;
        }
        n.push(a);
      }
      var i = [...u.current.keys()].filter((a) => !this.current.has(a));
      if (i.length === 0)
        t && u.discard();
      else if (n.length > 0) {
        u.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var l of n)
          wt(l, i, s, o);
        if (u.#n.length > 0) {
          u.apply();
          for (var f of u.#n)
            u.#a(f, [], []);
          u.#n = [];
        }
        u.deactivate();
      }
    }
    for (const u of $)
      u.#o.has(this) && (u.#o.delete(this), u.#o.size === 0 && !u.#h() && (u.activate(), u.#d()));
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
    this.#c || r || (this.#c = !0, oe(() => {
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
    return (this.#i ??= ut()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Pe || ($.add(w), oe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      I = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (qe = t, t.b?.is_pending && (t.f & (ye | Ne | ot)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & E) === 0))
        return;
      if ((r & (ne | Y)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function En() {
  try {
    cn();
  } catch (e) {
    G(e, qe);
  }
}
let U = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (q | L)) === 0 && Ee(r) && (U = /* @__PURE__ */ new Set(), de(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pt(r), U?.size > 0)) {
        Z.clear();
        for (const i of U) {
          if ((i.f & (q | L)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            U.has(o) && (U.delete(o), s.push(o)), o = o.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (q | L)) === 0 && de(f);
          }
        }
        U.clear();
      }
    }
    U = null;
  }
}
function wt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & E) !== 0 ? wt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | Q)) !== 0 && (s & k) === 0 && mt(i, t, r) && (y(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function mt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & E) !== 0 && mt(
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
  if (!((e.f & Y) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & z) !== 0 && t.m.push(e), y(e, b);
    for (var n = e.first; n !== null; )
      yt(n, t), n = n.next;
  }
}
function bt(e) {
  y(e, b);
  for (var t = e.first; t !== null; )
    bt(t), t = t.next;
}
function xn(e) {
  let t = 0, n = Ce(0), r;
  return () => {
    $e() && (D(n), Vn(() => (t === 0 && (r = We(() => e(() => we(n)))), t += 1, () => {
      oe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var kn = ce | ve;
function Tn(e, t, n, r) {
  new Sn(e, t, n, r);
}
class Sn {
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
  #_ = xn(() => (this.#a = Ce(this.#c), () => {
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
        p
      );
      o.b = this, o.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ft(() => {
      this.#m();
    }, kn);
  }
  #w() {
    try {
      this.#n = V(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#e.failed;
    n && (this.#l = V(() => {
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
    t && (this.is_pending = !0, this.#s = V(() => t(this.#t)), oe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Re();
      n.append(r), this.#n = this.#g(() => V(() => this.#r(r))), this.#o === 0 && (this.#t.before(n), this.#f = null, me(
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
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#c = 0, this.#n = V(() => {
        this.#r(this.#t);
      }), this.#o > 0) {
        var t = this.#f = document.createDocumentFragment();
        Lt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = V(() => n(this.#t));
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
    gt(t, this.#v, this.#d);
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
    var n = p, r = _, i = S;
    B(this.#i), F(this.#i), he(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return _t(s), null;
    } finally {
      B(n), F(r), he(i);
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
    this.#o += t, this.#o === 0 && (this.#p(n), this.#s && me(this.#s, () => {
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
    this.#y(t, n), this.#c += t, !(!this.#a || this.#h) && (this.#h = !0, oe(() => {
      this.#h = !1, this.#a && Me(this.#a, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), D(
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
    this.#n && (M(this.#n), this.#n = null), this.#s && (M(this.#s), this.#s = null), this.#l && (M(this.#l), this.#l = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        wn();
        return;
      }
      i = !0, s && _n(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (f) => {
      try {
        s = !0, n?.(f, o), s = !1;
      } catch (u) {
        G(u, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return V(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= je, r(
              this.#t,
              () => f,
              () => o
            );
          });
        } catch (u) {
          return G(
            u,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    oe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (u) {
        G(u, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        l,
        /** @param {unknown} e */
        (u) => G(u, this.#i && this.#i.parent)
      ) : l(f);
    });
  }
}
function An(e, t, n, r) {
  const i = Mn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    p
  ), l = Dn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (o.f & q) === 0 && G(v, o);
    }
    De();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var a = Et();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Rn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => G(c, o)).finally(() => a());
  }
  f ? f.then(() => {
    l(), h(), De();
  }) : h();
}
function Dn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = S, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    B(e), F(t), he(n), s && (e.f & q) === 0 && (r?.activate(), r?.apply());
  };
}
function De(e = !0) {
  B(null), F(null), he(null), e && w?.deactivate();
}
function Et() {
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
function Mn(e) {
  var t = E | k, n = _ !== null && (_.f & E) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: S,
    deps: null,
    effects: null,
    equals: ct,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      x
    ),
    wv: 0,
    parent: n ?? p,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Rn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && fn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ce(
    /** @type {V} */
    x
  ), o = !_, l = /* @__PURE__ */ new Map();
  return Un(() => {
    var f = (
      /** @type {Effect} */
      p
    ), u = ut();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(De);
    } catch (v) {
      u.reject(v), De();
    }
    var a = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((f.f & se) !== 0)
        var h = Et();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(a)?.reject(H), l.delete(a);
      else {
        for (const v of l.values())
          v.reject(H);
        l.clear();
      }
      l.set(a, u);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === H;
        h(g);
      }
      if (!(d === H || (f.f & q) !== 0)) {
        if (a.activate(), d)
          s.f |= W, Me(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Me(s, v);
          for (const [m, O] of l) {
            if (l.delete(m), m === a) break;
            O.reject(H);
          }
        }
        a.deactivate();
      }
    };
    u.promise.then(c, (v) => c(null, v || "unknown"));
  }), Yn(() => {
    for (const f of l.values())
      f.reject(H);
  }), new Promise((f) => {
    function u(a) {
      function h() {
        a === i ? f(s) : u(i);
      }
      a.then(h, h);
    }
    u(i);
  });
}
function Nn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      M(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Cn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
      return (t.f & q) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function He(e) {
  var t, n = p;
  B(Cn(e));
  try {
    e.f &= ~re, Nn(e), t = Bt(e);
  } finally {
    B(n);
  }
  return t;
}
function xt(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = Yt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    y(e, b);
    return;
  }
  ie || (I !== null ? ($e() || w?.is_fork) && I.set(e, n) : Ue(e));
}
function Fn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(H), t.teardown = nn, t.ac = null, be(t, 0), Ge(t));
}
function kt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && de(t);
}
let Ye = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let Tt = !1;
function Ce(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ct,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Ce(e);
  return Wn(n), n;
}
function K(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!j || (_.f & Qe) !== 0) && vt() && (_.f & (E | Q | Be | Qe)) !== 0 && (C === null || !ae.call(C, e)) && vn();
  let r = n ? _e(t) : t;
  return Me(e, r, Se);
}
function Me(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ie ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(s), I === null && Ue(s);
    }
    e.wv = Yt(), St(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (Y | ne)) === 0 && (R === null ? Zn([e]) : R.push(e)), !i.is_fork && Ye.size > 0 && !Tt && On();
  }
  return t;
}
function On() {
  Tt = !1;
  for (const e of Ye)
    (e.f & b) !== 0 && y(e, z), Ee(e) && de(e);
  Ye.clear();
}
function tt(e, t = 1) {
  var n = D(e), r = t === 1 ? n++ : n--;
  return K(e, n), r;
}
function we(e) {
  K(e, e.v + 1);
}
function St(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], l = o.f, f = (l & k) === 0;
      if (f && y(o, t), (l & E) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        I?.delete(u), (l & re) === 0 && (l & N && (o.f |= re), St(u, z, n));
      } else if (f) {
        var a = (
          /** @type {Effect} */
          o
        );
        (l & Q) !== 0 && U !== null && U.add(a), n !== null ? n.push(a) : Ve(a);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = tn(e);
  if (t !== Xt && t !== en)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Wt(e), i = /* @__PURE__ */ P(0), s = te, o = (l) => {
    if (te === s)
      return l();
    var f = _, u = te;
    F(null), it(s);
    var a = l();
    return F(f), it(u), a;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && hn();
        var a = n.get(f);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ P(u.value);
          return n.set(f, h), h;
        }) : K(a, u.value, !0), !0;
      },
      deleteProperty(l, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in l) {
            const a = o(() => /* @__PURE__ */ P(x));
            n.set(f, a), we(i);
          }
        } else
          K(u, x), we(i);
        return !0;
      },
      get(l, f, u) {
        if (f === Oe)
          return e;
        var a = n.get(f), h = f in l;
        if (a === void 0 && (!h || ge(l, f)?.writable) && (a = o(() => {
          var v = _e(h ? l[f] : x), d = /* @__PURE__ */ P(v);
          return d;
        }), n.set(f, a)), a !== void 0) {
          var c = D(a);
          return c === x ? void 0 : c;
        }
        return Reflect.get(l, f, u);
      },
      getOwnPropertyDescriptor(l, f) {
        var u = Reflect.getOwnPropertyDescriptor(l, f);
        if (u && "value" in u) {
          var a = n.get(f);
          a && (u.value = D(a));
        } else if (u === void 0) {
          var h = n.get(f), c = h?.v;
          if (h !== void 0 && c !== x)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return u;
      },
      has(l, f) {
        if (f === Oe)
          return !0;
        var u = n.get(f), a = u !== void 0 && u.v !== x || Reflect.has(l, f);
        if (u !== void 0 || p !== null && (!a || ge(l, f)?.writable)) {
          u === void 0 && (u = o(() => {
            var c = a ? _e(l[f]) : x, v = /* @__PURE__ */ P(c);
            return v;
          }), n.set(f, u));
          var h = D(u);
          if (h === x)
            return !1;
        }
        return a;
      },
      set(l, f, u, a) {
        var h = n.get(f), c = f in l;
        if (r && f === "length")
          for (var v = u; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? K(d, x) : v in l && (d = o(() => /* @__PURE__ */ P(x)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(l, f)?.writable) && (h = o(() => /* @__PURE__ */ P(void 0)), K(h, _e(u)), n.set(f, h));
        else {
          c = h.v !== x;
          var g = o(() => _e(u));
          K(h, g);
        }
        var m = Reflect.getOwnPropertyDescriptor(l, f);
        if (m?.set && m.set.call(a, u), !c) {
          if (r && typeof f == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(f);
            Number.isInteger(le) && le >= O.v && K(O, le + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(l) {
        D(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== x;
        });
        for (var [u, a] of n)
          a.v !== x && !(u in l) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        dn();
      }
    }
  );
}
var nt, At, Dt, Mt;
function Pn() {
  if (nt === void 0) {
    nt = window, At = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Dt = ge(t, "firstChild").get, Mt = ge(t, "nextSibling").get, Ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ze(n) && (n.__t = void 0);
  }
}
function Re(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  return (
    /** @type {TemplateNode | null} */
    Dt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    Mt.call(e)
  );
}
function xe(e, t) {
  return /* @__PURE__ */ Rt(e);
}
function ke(e, t = 1, n = !1) {
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
function Nt(e) {
  var t = _, n = p;
  F(null), B(null);
  try {
    return e();
  } finally {
    F(t), B(n);
  }
}
function Ln(e) {
  p === null && (_ === null && an(), on()), ie && un();
}
function qn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & L) !== 0 && (e |= L);
  var r = {
    ctx: S,
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
    ue !== null ? ue.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      de(r);
    } catch (o) {
      throw M(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & ce) !== 0 && i !== null && (i.f |= ce));
  }
  if (i !== null && (i.parent = n, n !== null && qn(i, n), _ !== null && (_.f & E) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function $e() {
  return _ !== null && !j;
}
function Yn(e) {
  const t = X(Ne, null);
  return y(t, b), t.teardown = e, t;
}
function zn(e) {
  Ln();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !_ && (t & Y) !== 0 && (t & se) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      S
    );
    (r.e ??= []).push(e);
  } else
    return Ct(e);
}
function Ct(e) {
  return X(ye | ln, e);
}
function Bn(e) {
  J.ensure();
  const t = X(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      M(t), r(void 0);
    }) : (M(t), r(void 0));
  });
}
function Un(e) {
  return X(Be | ve, e);
}
function Vn(e, t = 0) {
  return X(Ne | t, e);
}
function Hn(e, t = [], n = [], r = []) {
  An(r, t, n, (i) => {
    X(Ne, () => e(...i.map(D)));
  });
}
function Ft(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function V(e) {
  return X(Y | ve, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = _;
    rt(!0), F(null);
    try {
      t.call(null);
    } finally {
      rt(n), F(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort(H);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : M(n, t), n = r;
  }
}
function Kn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Y) === 0 && M(t), t = n;
  }
}
function M(e, t = !0) {
  var n = !1;
  (t || (e.f & sn) !== 0) && e.nodes !== null && e.nodes.end !== null && ($n(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Je), Ge(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ot(e), e.f ^= Je, e.f |= q;
  var i = e.parent;
  i !== null && i.first !== null && Pt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function $n(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function Pt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  It(e, r, !0);
  var i = () => {
    n && M(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var l of r)
      l.out(o);
  } else
    i();
}
function It(e, t, n) {
  if ((e.f & L) === 0) {
    e.f ^= L;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & ce) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Y) !== 0 && (e.f & Q) !== 0;
      It(i, t, o ? n : !1), i = s;
    }
  }
}
function Gn(e) {
  jt(e, !0);
}
function jt(e, t) {
  if ((e.f & L) !== 0) {
    e.f ^= L, (e.f & b) === 0 && (y(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ce) !== 0 || (n.f & Y) !== 0;
      jt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || t) && o.in();
  }
}
function Lt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Ae = !1, ie = !1;
function rt(e) {
  ie = e;
}
let _ = null, j = !1;
function F(e) {
  _ = e;
}
let p = null;
function B(e) {
  p = e;
}
let C = null;
function Wn(e) {
  _ !== null && (C === null ? C = [e] : C.push(e));
}
let T = null, A = 0, R = null;
function Zn(e) {
  R = e;
}
let qt = 1, ee = 0, te = ee;
function it(e) {
  te = e;
}
function Yt() {
  return ++qt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & E && (e.f &= ~re), (t & z) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && xt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    I === null && y(e, b);
  }
  return !1;
}
function zt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(C !== null && ae.call(C, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? zt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, k) : (s.f & b) !== 0 && y(s, z), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Bt(e) {
  var t = T, n = A, r = R, i = _, s = C, o = S, l = j, f = te, u = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, _ = (u & (Y | ne)) === 0 ? e : null, C = null, he(e.ctx), j = !1, te = ++ee, e.ac !== null && (Nt(() => {
    e.ac.abort(H);
  }), e.ac = null);
  try {
    e.f |= Le;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || be(e, A), c !== null && A > 0)
        for (c.length = A + T.length, d = 0; d < T.length; d++)
          c[A + d] = T[d];
      else
        e.deps = c = T;
      if ($e() && (e.f & N) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (be(e, A), c.length = A);
    if (vt() && R !== null && !j && c !== null && (e.f & (E | z | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        zt(
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
    return _t(g);
  } finally {
    e.f ^= Le, T = t, A = n, R = r, _ = i, C = s, he(o), j = l, te = f;
  }
}
function Jn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Zt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), Ue(s), Fn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Jn(e, n[r]);
}
function de(e) {
  var t = e.f;
  if ((t & q) === 0) {
    y(e, b);
    var n = p, r = Ae;
    p = e, Ae = !0;
    try {
      (t & (Q | ot)) !== 0 ? Kn(e) : Ge(e), Ot(e);
      var i = Bt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = qt;
      var s;
    } finally {
      Ae = r, p = n;
    }
  }
}
function D(e) {
  var t = e.f, n = (t & E) !== 0;
  if (_ !== null && !j) {
    var r = p !== null && (p.f & q) !== 0;
    if (!r && (C === null || !ae.call(C, e))) {
      var i = _.deps;
      if ((_.f & Le) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ie && Z.has(e))
    return Z.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var l = o.v;
      return ((o.f & b) === 0 && o.reactions !== null || Vt(o)) && (l = He(o)), Z.set(o, l), l;
    }
    var f = (o.f & N) === 0 && !j && _ !== null && (Ae || (_.f & N) !== 0), u = (o.f & se) === 0;
    Ee(o) && (f && (o.f |= N), xt(o)), f && !u && (kt(o), Ut(o));
  }
  if (I?.has(e))
    return I.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function Ut(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & N) === 0 && (kt(
        /** @type {Derived} */
        t
      ), Ut(
        /** @type {Derived} */
        t
      ));
}
function Vt(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & E) !== 0 && Vt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function We(e) {
  var t = j;
  try {
    return j = !0, e();
  } finally {
    j = t;
  }
}
const st = globalThis.Deno?.core?.ops ?? null;
function Qn(e, ...t) {
  st?.[e] ? st[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ie(e, t) {
  Qn("op_set_text", e, t);
}
const Xn = ["touchstart", "touchmove"];
function er(e) {
  return Xn.includes(e);
}
const pe = Symbol("events"), Ht = /* @__PURE__ */ new Set(), ze = /* @__PURE__ */ new Set();
function tr(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function nr(e) {
  for (var t = 0; t < e.length; t++)
    Ht.add(e[t]);
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
  var o = 0, l = lt === e && e[pe];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    f <= u && (o = f);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    Qt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = _, h = p;
    F(null), B(null);
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
      e[pe] = t, delete e.currentTarget, F(a), B(h);
    }
  }
}
const rr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function ir(e) {
  return (
    /** @type {string} */
    rr?.createHTML(e) ?? e
  );
}
function sr(e) {
  var t = jn("template");
  return t.innerHTML = ir(e.replaceAll("<!>", "<!---->")), t.content;
}
function lr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Kt(e, t) {
  var n = (t & pn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = sr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(r));
    var s = (
      /** @type {TemplateNode} */
      n || At ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return lr(s, s), s;
  };
}
function $t(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function fr(e, t) {
  return ur(e, t);
}
const Te = /* @__PURE__ */ new Map();
function ur(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: l }) {
  Pn();
  var f = void 0, u = Bn(() => {
    var a = n ?? t.appendChild(Re());
    Tn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (v) => {
        ht({});
        var d = (
          /** @type {ComponentContext} */
          S
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, dt();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var m = er(g);
          for (const Fe of [t, document]) {
            var O = Te.get(Fe);
            O === void 0 && (O = /* @__PURE__ */ new Map(), Te.set(Fe, O));
            var le = O.get(g);
            le === void 0 ? (Fe.addEventListener(g, ft, { passive: m }), O.set(g, 1)) : O.set(g, le + 1);
          }
        }
      }
    };
    return c(Jt(Ht)), ze.add(c), () => {
      for (var v of h)
        for (const m of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Te.get(m)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (m.removeEventListener(v, ft), d.delete(v), d.size === 0 && Te.delete(m)) : d.set(v, g);
        }
      ze.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return or.set(f, u), f;
}
let or = /* @__PURE__ */ new WeakMap();
class ar {
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
        Gn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, o] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(o);
        l && (M(l.effect), this.#e.delete(o));
      }
      for (const [s, o] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var u = document.createDocumentFragment();
            Lt(o, u), u.append(Re()), this.#e.set(s, { effect: o, fragment: u });
          } else
            M(o);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), me(o, l, !1)) : l();
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
      n.includes(r) || (M(i.effect), this.#e.delete(r));
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
        var s = document.createDocumentFragment(), o = Re();
        s.append(o), this.#e.set(t, {
          effect: V(() => n(o)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          V(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, f] of this.#u)
        l === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [l, f] of this.#e)
        l === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function cr(e, t, n = !1) {
  var r = new ar(e), i = n ? ce : 0;
  function s(o, l) {
    r.ensure(o, l);
  }
  Ft(() => {
    var o = !1;
    t((l, f = 0) => {
      o = !0, s(f, l);
    }), o || s(-1, null);
  }, i);
}
function Gt(e) {
  S === null && at(), zn(() => {
    const t = We(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function hr(e) {
  S === null && at(), Gt(() => () => We(e));
}
var dr = /* @__PURE__ */ Kt("<div>Child Active</div>");
function vr(e, t) {
  ht(t, !0), Gt(() => {
    t.onMounted?.();
  }), hr(() => {
    t.onDestroyed?.();
  });
  var n = dr();
  $t(e, n), dt();
}
var _r = /* @__PURE__ */ Kt("<div><button>Toggle</button> <div> </div> <div> </div> <div> </div> <!></div>");
function pr(e) {
  let t = /* @__PURE__ */ P(!1), n = /* @__PURE__ */ P(0), r = /* @__PURE__ */ P(0);
  function i() {
    tt(n);
  }
  function s() {
    tt(r);
  }
  var o = _r(), l = xe(o), f = ke(l, 2), u = xe(f), a = ke(f, 2), h = xe(a), c = ke(a, 2), v = xe(c), d = ke(c, 2);
  {
    var g = (m) => {
      vr(m, { onMounted: i, onDestroyed: s });
    };
    cr(d, (m) => {
      D(t) && m(g);
    });
  }
  Hn(() => {
    Ie(u, `Show: ${D(t) ?? ""}`), Ie(h, `Mounts: ${D(n) ?? ""}`), Ie(v, `Destroys: ${D(r) ?? ""}`);
  }), tr("click", l, () => K(t, !D(t))), $t(e, o);
}
nr(["click"]);
function wr(e) {
  return fr(pr, { target: e });
}
export {
  wr as default,
  wr as rvst_mount
};

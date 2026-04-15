var Wt = Array.isArray, Zt = Array.prototype.indexOf, oe = Array.prototype.includes, Jt = Array.from, Qt = Object.defineProperty, be = Object.getOwnPropertyDescriptor, Xt = Object.prototype, en = Array.prototype, tn = Object.getPrototypeOf, Ze = Object.isExtensible;
const nn = () => {
};
function rn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ot() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, Ee = 4, De = 8, ct = 1 << 24, ee = 16, G = 32, ie = 64, Le = 128, D = 512, y = 1024, T = 2048, q = 4096, B = 8192, z = 16384, _e = 32768, Je = 1 << 25, ce = 65536, Qe = 1 << 17, sn = 1 << 18, pe = 1 << 19, ln = 1 << 20, se = 65536, Be = 1 << 21, Ue = 1 << 22, J = 1 << 23, Ie = Symbol("$state"), K = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function fn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function un() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function an() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function on() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function cn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function hn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const dn = 2, x = Symbol(), vn = "http://www.w3.org/1999/xhtml";
function _n() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ht(e) {
  return e === this.v;
}
let L = null;
function he(e) {
  L = e;
}
function pn(e, t = !1, n) {
  L = {
    p: L,
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
function gn(e) {
  var t = (
    /** @type {ComponentContext} */
    L
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Bn(r);
  }
  return t.i = !0, L = t.p, /** @type {T} */
  {};
}
function dt() {
  return !0;
}
let fe = [];
function wn() {
  var e = fe;
  fe = [], rn(e);
}
function ae(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && wn();
    });
  }
  fe.push(e);
}
function vt(e) {
  var t = p;
  if (t === null)
    return _.f |= J, e;
  if ((t.f & _e) === 0 && (t.f & Ee) === 0)
    throw e;
  Z(e, t);
}
function Z(e, t) {
  for (; t !== null; ) {
    if ((t.f & Le) !== 0) {
      if ((t.f & _e) === 0)
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
  (e.f & D) !== 0 || e.deps === null ? b(e, y) : b(e, q);
}
function _t(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & se) === 0 || (t.f ^= se, _t(
        /** @type {Derived} */
        t.deps
      ));
}
function pt(e, t, n) {
  (e.f & T) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), _t(e.deps), b(e, y);
}
const W = /* @__PURE__ */ new Set();
let w = null, I = null, ze = null, je = !1, ue = null, Re = null;
var Xe = 0;
let mn = 1;
class X {
  id = mn++;
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
  #a = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#a)
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
        b(r, T), this.schedule(r);
      for (r of n.m)
        b(r, q), this.schedule(r);
    }
  }
  #d() {
    if (Xe++ > 1e3 && (W.delete(this), yn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), b(l, T), this.schedule(l);
      for (const l of this.#l)
        b(l, q), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ue = [], r = [], i = Re = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (u) {
        throw mt(l), u;
      }
    if (w = null, i.length > 0) {
      var s = X.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (ue = null, Re = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, u] of this.#f)
        bt(l, u);
    } else {
      this.#e.size === 0 && W.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), et(r), et(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = a ??= this;
      l.#n.push(...this.#n.filter((u) => !l.#n.includes(u)));
    }
    a !== null && (W.add(a), a.#d()), W.has(this) || this.#w();
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
      var s = i.f, a = (s & (G | ie)) !== 0, l = a && (s & y) !== 0, u = l || (s & B) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & Ee) !== 0 ? n.push(i) : ke(i) && ((s & ee) !== 0 && this.#l.add(i), ve(i));
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
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & J) === 0 && (this.current.set(t, [t.v, r]), I?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, I = null;
  }
  flush() {
    try {
      je = !0, w = this, this.#d();
    } finally {
      Xe = 0, ze = null, ue = null, Re = null, je = !1, w = null, I = null, Q.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), W.delete(this);
  }
  #w() {
    for (const f of W) {
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
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var l of n)
          gt(l, i, s, a);
        if (f.#n.length > 0) {
          f.apply();
          for (var u of f.#n)
            f.#o(u, [], []);
          f.#n = [];
        }
        f.deactivate();
      }
    }
    for (const f of W)
      f.#a.has(this) && (f.#a.delete(this), f.#a.size === 0 && !f.#h() && (f.activate(), f.#d()));
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
    this.#c || r || (this.#c = !0, ae(() => {
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
    return (this.#i ??= ot()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new X();
      je || (W.add(w), ae(() => {
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
    if (ze = t, t.b?.is_pending && (t.f & (Ee | De | ct)) !== 0 && (t.f & _e) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & E) === 0))
        return;
      if ((r & (ie | G)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#n.push(n);
  }
}
function yn() {
  try {
    un();
  } catch (e) {
    Z(e, ze);
  }
}
let $ = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | B)) === 0 && ke(r) && ($ = /* @__PURE__ */ new Set(), ve(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), $?.size > 0)) {
        Q.clear();
        for (const i of $) {
          if ((i.f & (z | B)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), s.push(a)), a = a.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const u = s[l];
            (u.f & (z | B)) === 0 && ve(u);
          }
        }
        $.clear();
      }
    }
    $ = null;
  }
}
function gt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & E) !== 0 ? gt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ue | ee)) !== 0 && (s & T) === 0 && wt(i, t, r) && (b(i, T), $e(
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
      if (oe.call(t, i))
        return !0;
      if ((i.f & E) !== 0 && wt(
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
function bt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & T) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), b(e, y);
    for (var n = e.first; n !== null; )
      bt(n, t), n = n.next;
  }
}
function mt(e) {
  b(e, y);
  for (var t = e.first; t !== null; )
    mt(t), t = t.next;
}
function En(e) {
  let t = 0, n = Me(0), r;
  return () => {
    Ge() && (N(n), Yn(() => (t === 0 && (r = Zn(() => e(() => me(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, me(n));
      });
    })));
  };
}
var xn = ce | pe;
function kn(e, t, n, r) {
  new Tn(e, t, n, r);
}
class Tn {
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
  #_ = En(() => (this.#o = Me(this.#c), () => {
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
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Le, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ft(() => {
      this.#b();
    }, xn);
  }
  #w() {
    try {
      this.#n = H(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = H(() => {
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
    t && (this.is_pending = !0, this.#s = H(() => t(this.#t)), ae(() => {
      var n = this.#f = document.createDocumentFragment(), r = Oe();
      n.append(r), this.#n = this.#g(() => H(() => this.#r(r))), this.#a === 0 && (this.#t.before(n), this.#f = null, ye(
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
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#n = H(() => {
        this.#r(this.#t);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        It(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = H(() => n(this.#t));
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
    var n = p, r = _, i = L;
    Y(this.#i), P(this.#i), he(this.#i.ctx);
    try {
      return X.ensure(), t();
    } catch (s) {
      return vt(s), null;
    } finally {
      Y(n), P(r), he(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #m(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#m(t, n);
      return;
    }
    this.#a += t, this.#a === 0 && (this.#p(n), this.#s && ye(this.#s, () => {
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
    this.#m(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, ae(() => {
      this.#h = !1, this.#o && Fe(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), N(
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
    this.#n && (F(this.#n), this.#n = null), this.#s && (F(this.#s), this.#s = null), this.#l && (F(this.#l), this.#l = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        _n();
        return;
      }
      i = !0, s && hn(), this.#l !== null && ye(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#b();
      });
    }, l = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (f) {
        Z(f, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return H(() => {
            var f = (
              /** @type {Effect} */
              p
            );
            f.b = this, f.f |= Le, r(
              this.#t,
              () => u,
              () => a
            );
          });
        } catch (f) {
          return Z(
            f,
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
      } catch (f) {
        Z(f, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        l,
        /** @param {unknown} e */
        (f) => Z(f, this.#i && this.#i.parent)
      ) : l(u);
    });
  }
}
function Sn(e, t, n, r) {
  const i = Rn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), l = An(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (a.f & z) === 0 && Z(v, a);
    }
    Ce();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(i)));
    return;
  }
  var o = yt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Nn(c))).then((c) => f([...t.map(i), ...c])).catch((c) => Z(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    l(), h(), Ce();
  }) : h();
}
function An() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = L, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), P(t), he(n), s && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function Ce(e = !0) {
  Y(null), P(null), he(null), e && w?.deactivate();
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
function Rn(e) {
  var t = E | T, n = _ !== null && (_.f & E) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= pe), {
    ctx: L,
    deps: null,
    effects: null,
    equals: ht,
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
function Nn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && fn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Me(
    /** @type {V} */
    x
  ), a = !_, l = /* @__PURE__ */ new Map();
  return qn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), f = ot();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Ce);
    } catch (v) {
      f.reject(v), Ce();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & _e) !== 0)
        var h = yt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(K), l.delete(o);
      else {
        for (const v of l.values())
          v.reject(K);
        l.clear();
      }
      l.set(o, f);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === K;
        h(g);
      }
      if (!(d === K || (u.f & z) !== 0)) {
        if (o.activate(), d)
          s.f |= J, Fe(s, d);
        else {
          (s.f & J) !== 0 && (s.f ^= J), Fe(s, v);
          for (const [m, S] of l) {
            if (l.delete(m), m === o) break;
            S.reject(K);
          }
        }
        o.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), Ln(() => {
    for (const u of l.values())
      u.reject(K);
  }), new Promise((u) => {
    function f(o) {
      function h() {
        o === i ? u(s) : f(i);
      }
      o.then(h, h);
    }
    f(i);
  });
}
function Cn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      F(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Fn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function He(e) {
  var t, n = p;
  Y(Fn(e));
  try {
    e.f &= ~se, Cn(e), t = zt(e);
  } finally {
    Y(n);
  }
  return t;
}
function Et(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = Lt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, y);
    return;
  }
  de || (I !== null ? (Ge() || w?.is_fork) && I.set(e, n) : Ve(e));
}
function On(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(K), t.teardown = nn, t.ac = null, xe(t, 0), We(t));
}
function xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ve(t);
}
let qe = /* @__PURE__ */ new Set();
const Q = /* @__PURE__ */ new Map();
let kt = !1;
function Me(e, t) {
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
function k(e, t) {
  const n = Me(e);
  return Kn(n), n;
}
function R(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!j || (_.f & Qe) !== 0) && dt() && (_.f & (E | ee | Ue | Qe)) !== 0 && (M === null || !oe.call(M, e)) && cn();
  let r = n ? ge(t) : t;
  return Fe(e, r, Re);
}
function Fe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    de ? Q.set(e, t) : Q.set(e, r), e.v = t;
    var i = X.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & T) !== 0 && He(s), I === null && Ve(s);
    }
    e.wv = Lt(), Tt(e, T, n), p !== null && (p.f & y) !== 0 && (p.f & (G | ie)) === 0 && (O === null ? Gn([e]) : O.push(e)), !i.is_fork && qe.size > 0 && !kt && Dn();
  }
  return t;
}
function Dn() {
  kt = !1;
  for (const e of qe)
    (e.f & y) !== 0 && b(e, q), ke(e) && ve(e);
  qe.clear();
}
function me(e) {
  R(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], l = a.f, u = (l & T) === 0;
      if (u && b(a, t), (l & E) !== 0) {
        var f = (
          /** @type {Derived} */
          a
        );
        I?.delete(f), (l & se) === 0 && (l & D && (a.f |= se), Tt(f, q, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (l & ee) !== 0 && $ !== null && $.add(o), n !== null ? n.push(o) : $e(o);
      }
    }
}
function ge(e) {
  if (typeof e != "object" || e === null || Ie in e)
    return e;
  const t = tn(e);
  if (t !== Xt && t !== en)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Wt(e), i = /* @__PURE__ */ k(0), s = re, a = (l) => {
    if (re === s)
      return l();
    var u = _, f = re;
    P(null), rt(s);
    var o = l();
    return P(u), rt(f), o;
  };
  return r && n.set("length", /* @__PURE__ */ k(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && an();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ k(f.value);
          return n.set(u, h), h;
        }) : R(o, f.value, !0), !0;
      },
      deleteProperty(l, u) {
        var f = n.get(u);
        if (f === void 0) {
          if (u in l) {
            const o = a(() => /* @__PURE__ */ k(x));
            n.set(u, o), me(i);
          }
        } else
          R(f, x), me(i);
        return !0;
      },
      get(l, u, f) {
        if (u === Ie)
          return e;
        var o = n.get(u), h = u in l;
        if (o === void 0 && (!h || be(l, u)?.writable) && (o = a(() => {
          var v = ge(h ? l[u] : x), d = /* @__PURE__ */ k(v);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = N(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(l, u, f);
      },
      getOwnPropertyDescriptor(l, u) {
        var f = Reflect.getOwnPropertyDescriptor(l, u);
        if (f && "value" in f) {
          var o = n.get(u);
          o && (f.value = N(o));
        } else if (f === void 0) {
          var h = n.get(u), c = h?.v;
          if (h !== void 0 && c !== x)
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
        if (u === Ie)
          return !0;
        var f = n.get(u), o = f !== void 0 && f.v !== x || Reflect.has(l, u);
        if (f !== void 0 || p !== null && (!o || be(l, u)?.writable)) {
          f === void 0 && (f = a(() => {
            var c = o ? ge(l[u]) : x, v = /* @__PURE__ */ k(c);
            return v;
          }), n.set(u, f));
          var h = N(f);
          if (h === x)
            return !1;
        }
        return o;
      },
      set(l, u, f, o) {
        var h = n.get(u), c = u in l;
        if (r && u === "length")
          for (var v = f; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? R(d, x) : v in l && (d = a(() => /* @__PURE__ */ k(x)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || be(l, u)?.writable) && (h = a(() => /* @__PURE__ */ k(void 0)), R(h, ge(f)), n.set(u, h));
        else {
          c = h.v !== x;
          var g = a(() => ge(f));
          R(h, g);
        }
        var m = Reflect.getOwnPropertyDescriptor(l, u);
        if (m?.set && m.set.call(o, f), !c) {
          if (r && typeof u == "string") {
            var S = (
              /** @type {Source<number>} */
              n.get("length")
            ), U = Number(u);
            Number.isInteger(U) && U >= S.v && R(S, U + 1);
          }
          me(i);
        }
        return !0;
      },
      ownKeys(l) {
        N(i);
        var u = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== x;
        });
        for (var [f, o] of n)
          o.v !== x && !(f in l) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        on();
      }
    }
  );
}
var tt, St, At, Rt;
function Mn() {
  if (tt === void 0) {
    tt = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    At = be(t, "firstChild").get, Rt = be(t, "nextSibling").get, Ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ze(n) && (n.__t = void 0);
  }
}
function Oe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    Rt.call(e)
  );
}
function Te(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function V(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ke(r);
  return r;
}
function Pn() {
  return !1;
}
function In(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(vn, e, void 0)
  );
}
function Ct(e) {
  var t = _, n = p;
  P(null), Y(null);
  try {
    return e();
  } finally {
    P(t), Y(n);
  }
}
function jn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function te(e, t) {
  var n = p;
  n !== null && (n.f & B) !== 0 && (e |= B);
  var r = {
    ctx: L,
    deps: null,
    nodes: null,
    f: e | T | D,
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
  if ((e & Ee) !== 0)
    ue !== null ? ue.push(r) : X.ensure().schedule(r);
  else if (t !== null) {
    try {
      ve(r);
    } catch (a) {
      throw F(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & pe) === 0 && (i = i.first, (e & ee) !== 0 && (e & ce) !== 0 && i !== null && (i.f |= ce));
  }
  if (i !== null && (i.parent = n, n !== null && jn(i, n), _ !== null && (_.f & E) !== 0 && (e & ie) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ge() {
  return _ !== null && !j;
}
function Ln(e) {
  const t = te(De, null);
  return b(t, y), t.teardown = e, t;
}
function Bn(e) {
  return te(Ee | ln, e);
}
function zn(e) {
  X.ensure();
  const t = te(ie | pe, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ye(t, () => {
      F(t), r(void 0);
    }) : (F(t), r(void 0));
  });
}
function qn(e) {
  return te(Ue | pe, e);
}
function Yn(e, t = 0) {
  return te(De | t, e);
}
function Un(e, t = [], n = [], r = []) {
  Sn(r, t, n, (i) => {
    te(De, () => e(...i.map(N)));
  });
}
function Ft(e, t = 0) {
  var n = te(ee | t, e);
  return n;
}
function H(e) {
  return te(G | pe, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = de, r = _;
    nt(!0), P(null);
    try {
      t.call(null);
    } finally {
      nt(n), P(r);
    }
  }
}
function We(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ct(() => {
      i.abort(K);
    });
    var r = n.next;
    (n.f & ie) !== 0 ? n.parent = null : F(n, t), n = r;
  }
}
function Vn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && F(t), t = n;
  }
}
function F(e, t = !0) {
  var n = !1;
  (t || (e.f & sn) !== 0) && e.nodes !== null && e.nodes.end !== null && ($n(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, Je), We(e, t && !n), xe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ot(e), e.f ^= Je, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function $n(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function Dt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ye(e, t, n = !0) {
  var r = [];
  Mt(e, r, !0);
  var i = () => {
    n && F(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var l of r)
      l.out(a);
  } else
    i();
}
function Mt(e, t, n) {
  if ((e.f & B) === 0) {
    e.f ^= B;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ce) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & ee) !== 0;
      Mt(i, t, a ? n : !1), i = s;
    }
  }
}
function Hn(e) {
  Pt(e, !0);
}
function Pt(e, t) {
  if ((e.f & B) !== 0) {
    e.f ^= B, (e.f & y) === 0 && (b(e, T), X.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ce) !== 0 || (n.f & G) !== 0;
      Pt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function It(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Ne = !1, de = !1;
function nt(e) {
  de = e;
}
let _ = null, j = !1;
function P(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let M = null;
function Kn(e) {
  _ !== null && (M === null ? M = [e] : M.push(e));
}
let A = null, C = 0, O = null;
function Gn(e) {
  O = e;
}
let jt = 1, ne = 0, re = ne;
function rt(e) {
  re = e;
}
function Lt() {
  return ++jt;
}
function ke(e) {
  var t = e.f;
  if ((t & T) !== 0)
    return !0;
  if (t & E && (e.f &= ~se), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ke(
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
    I === null && b(e, y);
  }
  return !1;
}
function Bt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && oe.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? Bt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, T) : (s.f & y) !== 0 && b(s, q), $e(
        /** @type {Effect} */
        s
      ));
    }
}
function zt(e) {
  var t = A, n = C, r = O, i = _, s = M, a = L, l = j, u = re, f = e.f;
  A = /** @type {null | Value[]} */
  null, C = 0, O = null, _ = (f & (G | ie)) === 0 ? e : null, M = null, he(e.ctx), j = !1, re = ++ne, e.ac !== null && (Ct(() => {
    e.ac.abort(K);
  }), e.ac = null);
  try {
    e.f |= Be;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= _e;
    var c = e.deps, v = w?.is_fork;
    if (A !== null) {
      var d;
      if (v || xe(e, C), c !== null && C > 0)
        for (c.length = C + A.length, d = 0; d < A.length; d++)
          c[C + d] = A[d];
      else
        e.deps = c = A;
      if (Ge() && (e.f & D) !== 0)
        for (d = C; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && C < c.length && (xe(e, C), c.length = C);
    if (dt() && O !== null && !j && c !== null && (e.f & (E | q | T)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      O.length; d++)
        Bt(
          O[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ne++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = ne;
      if (t !== null)
        for (const g of t)
          g.rv = ne;
      O !== null && (r === null ? r = O : r.push(.../** @type {Source[]} */
      O));
    }
    return (e.f & J) !== 0 && (e.f ^= J), h;
  } catch (g) {
    return vt(g);
  } finally {
    e.f ^= Be, A = t, C = n, O = r, _ = i, M = s, he(a), j = l, re = u;
  }
}
function Wn(e, t) {
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
  (A === null || !oe.call(A, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~se), Ve(s), On(s), xe(s, 0);
  }
}
function xe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Wn(e, n[r]);
}
function ve(e) {
  var t = e.f;
  if ((t & z) === 0) {
    b(e, y);
    var n = p, r = Ne;
    p = e, Ne = !0;
    try {
      (t & (ee | ct)) !== 0 ? Vn(e) : We(e), Ot(e);
      var i = zt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = jt;
      var s;
    } finally {
      Ne = r, p = n;
    }
  }
}
function N(e) {
  var t = e.f, n = (t & E) !== 0;
  if (_ !== null && !j) {
    var r = p !== null && (p.f & z) !== 0;
    if (!r && (M === null || !oe.call(M, e))) {
      var i = _.deps;
      if ((_.f & Be) !== 0)
        e.rv < ne && (e.rv = ne, A === null && i !== null && i[C] === e ? C++ : A === null ? A = [e] : A.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : oe.call(s, _) || s.push(_);
      }
    }
  }
  if (de && Q.has(e))
    return Q.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (de) {
      var l = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Yt(a)) && (l = He(a)), Q.set(a, l), l;
    }
    var u = (a.f & D) === 0 && !j && _ !== null && (Ne || (_.f & D) !== 0), f = (a.f & _e) === 0;
    ke(a) && (u && (a.f |= D), Et(a)), u && !f && (xt(a), qt(a));
  }
  if (I?.has(e))
    return I.get(e);
  if ((e.f & J) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & D) === 0 && (xt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Yt(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Q.has(t) || (t.f & E) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Zn(e) {
  var t = j;
  try {
    return j = !0, e();
  } finally {
    j = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Jn(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function st(e, t) {
  Jn("op_set_text", e, t);
}
const Qn = ["touchstart", "touchmove"];
function Xn(e) {
  return Qn.includes(e);
}
const we = Symbol("events"), Ut = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function lt(e, t, n) {
  (t[we] ??= {})[e] = n;
}
function er(e) {
  for (var t = 0; t < e.length; t++)
    Ut.add(e[t]);
  for (var n of Ye)
    n(e);
}
let ft = null;
function ut(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  ft = e;
  var a = 0, l = ft === e && e[we];
  if (l) {
    var u = i.indexOf(l);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[we] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    u <= f && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Qt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    P(null), Y(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[we]?.[r];
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
      e[we] = t, delete e.currentTarget, P(o), Y(h);
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
  var t = In("template");
  return t.innerHTML = nr(e.replaceAll("<!>", "<!---->")), t.content;
}
function ir(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Vt(e, t) {
  var n = (t & dn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = rr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return ir(s, s), s;
  };
}
function at(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function sr(e, t) {
  return lr(e, t);
}
const Se = /* @__PURE__ */ new Map();
function lr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: l }) {
  Mn();
  var u = void 0, f = zn(() => {
    var o = n ?? t.appendChild(Oe());
    kn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        pn({});
        var d = (
          /** @type {ComponentContext} */
          L
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, gn();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var m = Xn(g);
          for (const le of [t, document]) {
            var S = Se.get(le);
            S === void 0 && (S = /* @__PURE__ */ new Map(), Se.set(le, S));
            var U = S.get(g);
            U === void 0 ? (le.addEventListener(g, ut, { passive: m }), S.set(g, 1)) : S.set(g, U + 1);
          }
        }
      }
    };
    return c(Jt(Ut)), Ye.add(c), () => {
      for (var v of h)
        for (const m of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Se.get(m)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (m.removeEventListener(v, ut), d.delete(v), d.size === 0 && Se.delete(m)) : d.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
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
        Hn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, a] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(a);
        l && (F(l.effect), this.#e.delete(a));
      }
      for (const [s, a] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            It(a, f), f.append(Oe()), this.#e.set(s, { effect: a, fragment: f });
          } else
            F(a);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), ye(a, l, !1)) : l();
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
      n.includes(r) || (F(i.effect), this.#e.delete(r));
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
    ), i = Pn();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = Oe();
        s.append(a), this.#e.set(t, {
          effect: H(() => n(a)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          H(() => n(this.anchor))
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
function ar(e, t, n = !1) {
  var r = new ur(e), i = n ? ce : 0;
  function s(a, l) {
    r.ensure(a, l);
  }
  Ft(() => {
    var a = !1;
    t((l, u = 0) => {
      a = !0, s(u, l);
    }), a || s(-1, null);
  }, i);
}
function or(e, t) {
  return e == null ? null : String(e);
}
function Ae(e, t, n, r) {
  var i = e.__style;
  if (i !== t) {
    var s = or(t);
    s == null ? e.removeAttribute("style") : e.style.cssText = s, e.__style = t;
  }
  return r;
}
var cr = /* @__PURE__ */ Vt('<div style="position: absolute; top: 0; left: 0; width: 200px; height: 50px; background: red;">Overlay</div>'), hr = /* @__PURE__ */ Vt('<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px; width: 400px; height: 300px; position: relative;"><div>BugBench</div> <button>Activate Bugs</button> <div style="position: relative;"><button>Action</button> <!></div> <div>Important Warning</div> <div><div>Critical Info Line 1</div> <div>Critical Info Line 2</div></div> <button>Submit Form</button> <button>Save</button> <div> </div> <div> </div></div>');
function dr(e) {
  let t = /* @__PURE__ */ k(
    !1
    // Bug 1: overlay occludes button
  ), n = /* @__PURE__ */ k(
    !1
    // Bug 2: important text has display:none
  ), r = /* @__PURE__ */ k(
    !1
    // Bug 3: content clipped by tiny container
  ), i = /* @__PURE__ */ k(
    !1
    // Bug 4: focus on wrong element after action
  ), s = /* @__PURE__ */ k(
    !1
    // Bug 5: pointer-events:none on interactive element
  ), a = /* @__PURE__ */ k(
    !1
    // Bug 6: button has zero width
  ), l = /* @__PURE__ */ k(!1);
  function u() {
    R(t, !0), R(n, !0), R(r, !0), R(i, !0), R(s, !0), R(a, !0);
  }
  var f = hr(), o = V(Te(f), 2), h = V(o, 2), c = Te(h), v = V(c, 2);
  {
    var d = (Pe) => {
      var Gt = cr();
      at(Pe, Gt);
    };
    ar(v, (Pe) => {
      N(t) && Pe(d);
    });
  }
  var g = V(h, 2), m = V(g, 2), S = V(m, 2), U = V(S, 2), le = V(U, 2), $t = Te(le), Ht = V(le, 2), Kt = Te(Ht);
  Un(() => {
    Ae(g, N(n) ? "display: none;" : ""), Ae(m, N(r) ? "height: 1px; overflow: hidden;" : "height: auto;"), Ae(S, N(s) ? "pointer-events: none;" : ""), Ae(U, N(a) ? "width: 0px; overflow: hidden;" : ""), st($t, `Clicked: ${N(l) ?? ""}`), st(Kt, `Bugs: ${N(t) ? "active" : "inactive"}`);
  }), lt("click", o, u), lt("click", c, () => R(l, !0)), at(e, f);
}
er(["click"]);
function _r(e) {
  return sr(dr, { target: e });
}
export {
  _r as default,
  _r as rvst_mount
};

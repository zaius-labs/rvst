var ot = Array.isArray, Gt = Array.prototype.indexOf, ae = Array.prototype.includes, Wt = Array.from, Jt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, ct = Object.prototype, Zt = Array.prototype, ht = Object.getPrototypeOf, Je = Object.isExtensible;
const Qt = () => {
};
function Xt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function dt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, be = 4, De = 8, _t = 1 << 24, J = 16, B = 32, re = 64, Le = 128, M = 512, b = 1024, k = 2048, L = 4096, I = 8192, j = 16384, _e = 32768, Ze = 1 << 25, oe = 65536, Qe = 1 << 17, en = 1 << 18, ve = 1 << 19, tn = 1 << 20, ie = 65536, qe = 1 << 21, Be = 1 << 22, K = 1 << 23, Pe = Symbol("$state"), $ = new class extends Error {
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
function un() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const an = 2, x = Symbol(), on = "http://www.w3.org/1999/xhtml";
function cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function vt(e) {
  return e === this.v;
}
const hn = [];
function dn(e, t = !1, n = !1) {
  return Te(e, /* @__PURE__ */ new Map(), "", hn, null, n);
}
function Te(e, t, n, r, i = null, s = !1) {
  if (typeof e == "object" && e !== null) {
    var a = t.get(e);
    if (a !== void 0) return a;
    if (e instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(e)
    );
    if (e instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(e)
    );
    if (ot(e)) {
      var l = (
        /** @type {Snapshot<any>} */
        Array(e.length)
      );
      t.set(e, l), i !== null && t.set(i, l);
      for (var f = 0; f < e.length; f += 1) {
        var u = e[f];
        f in e && (l[f] = Te(u, t, n, r, null, s));
      }
      return l;
    }
    if (ht(e) === ct) {
      l = {}, t.set(e, l), i !== null && t.set(i, l);
      for (var o of Object.keys(e))
        l[o] = Te(
          // @ts-expect-error
          e[o],
          t,
          n,
          r,
          null,
          s
        );
      return l;
    }
    if (e instanceof Date)
      return (
        /** @type {Snapshot<T>} */
        structuredClone(e)
      );
    if (typeof /** @type {T & { toJSON?: any } } */
    e.toJSON == "function" && !s)
      return Te(
        /** @type {T & { toJSON(): any } } */
        e.toJSON(),
        t,
        n,
        r,
        // Associate the instance with the toJSON clone
        e
      );
  }
  if (e instanceof EventTarget)
    return (
      /** @type {Snapshot<T>} */
      e
    );
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(e)
    );
  } catch {
    return (
      /** @type {Snapshot<T>} */
      e
    );
  }
}
let P = null;
function ce(e) {
  P = e;
}
function _n(e, t = !1, n) {
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
function vn(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      jn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function pt() {
  return !0;
}
let le = [];
function pn() {
  var e = le;
  le = [], Xt(e);
}
function ue(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && pn();
    });
  }
  le.push(e);
}
function gt(e) {
  var t = p;
  if (t === null)
    return v.f |= K, e;
  if ((t.f & _e) === 0 && (t.f & be) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
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
const gn = -7169;
function m(e, t) {
  e.f = e.f & gn | t;
}
function Ue(e) {
  (e.f & M) !== 0 || e.deps === null ? m(e, b) : m(e, L);
}
function wt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & ie) === 0 || (t.f ^= ie, wt(
        /** @type {Derived} */
        t.deps
      ));
}
function mt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), wt(e.deps), m(e, b);
}
const U = /* @__PURE__ */ new Set();
let w = null, C = null, Ye = null, Ie = !1, fe = null, Ae = null;
var Xe = 0;
let wn = 1;
class W {
  id = wn++;
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
  #_() {
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, L), this.schedule(r);
    }
  }
  #d() {
    if (Xe++ > 1e3 && (U.delete(this), mn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), m(l, k), this.schedule(l);
      for (const l of this.#l)
        m(l, L), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = fe = [], r = [], i = Ae = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (f) {
        throw xt(l), f;
      }
    if (w = null, i.length > 0) {
      var s = W.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (fe = null, Ae = null, this.#h() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [l, f] of this.#f)
        Et(l, f);
    } else {
      this.#e.size === 0 && U.delete(this), this.#s.clear(), this.#l.clear();
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
      l.#n.push(...this.#n.filter((f) => !l.#n.includes(f)));
    }
    a !== null && (U.add(a), a.#d()), U.has(this) || this.#w();
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
      var s = i.f, a = (s & (B | re)) !== 0, l = a && (s & b) !== 0, f = l || (s & I) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= b : (s & be) !== 0 ? n.push(i) : Ee(i) && ((s & J) !== 0 && this.#l.add(i), de(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      mt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
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
      Xe = 0, Ye = null, fe = null, Ae = null, Ie = !1, w = null, C = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), U.delete(this);
  }
  #w() {
    for (const u of U) {
      var t = u.id < this.id, n = [];
      for (const [o, [d, c]] of this.current) {
        if (u.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(o)[0]
          );
          if (t && d !== r)
            u.current.set(o, [d, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...u.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && u.discard();
      else if (n.length > 0) {
        u.activate();
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var l of n)
          bt(l, i, s, a);
        if (u.#n.length > 0) {
          u.apply();
          for (var f of u.#n)
            u.#o(f, [], []);
          u.#n = [];
        }
        u.deactivate();
      }
    }
    for (const u of U)
      u.#a.has(this) && (u.#a.delete(this), u.#a.size === 0 && !u.#h() && (u.activate(), u.#d()));
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
      const t = w = new W();
      Ie || (U.add(w), ue(() => {
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
    if (Ye = t, t.b?.is_pending && (t.f & (be | De | _t)) !== 0 && (t.f & _e) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (v === null || (v.f & E) === 0))
        return;
      if ((r & (re | B)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function mn() {
  try {
    rn();
  } catch (e) {
    H(e, Ye);
  }
}
let Y = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | I)) === 0 && Ee(r) && (Y = /* @__PURE__ */ new Set(), de(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && It(r), Y?.size > 0)) {
        G.clear();
        for (const i of Y) {
          if ((i.f & (j | I)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (j | I)) === 0 && de(f);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function bt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & E) !== 0 ? bt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | J)) !== 0 && (s & k) === 0 && yt(i, t, r) && (m(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function yt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & E) !== 0 && yt(
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
function Et(e, t) {
  if (!((e.f & B) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      Et(n, t), n = n.next;
  }
}
function xt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    xt(t), t = t.next;
}
function bn(e) {
  let t = 0, n = Ce(0), r;
  return () => {
    Ge() && (te(n), Yn(() => (t === 0 && (r = Kn(() => e(() => we(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var yn = oe | ve;
function En(e, t, n, r) {
  new xn(e, t, n, r);
}
class xn {
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
  #_ = /* @__PURE__ */ new Set();
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
  #v = bn(() => (this.#o = Ce(this.#c), () => {
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
      this.#m();
    }, yn);
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
    t && (this.is_pending = !0, this.#s = z(() => t(this.#t)), ue(() => {
      var n = this.#f = document.createDocumentFragment(), r = Oe();
      n.append(r), this.#n = this.#g(() => z(() => this.#r(r))), this.#a === 0 && (this.#t.before(n), this.#f = null, me(
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
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#n = z(() => {
        this.#r(this.#t);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        qt(this.#n, t);
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    mt(t, this.#_, this.#d);
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
    var n = p, r = v, i = P;
    q(this.#i), D(this.#i), ce(this.#i.ctx);
    try {
      return W.ensure(), t();
    } catch (s) {
      return gt(s), null;
    } finally {
      q(n), D(r), ce(i);
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
    this.#a += t, this.#a === 0 && (this.#p(n), this.#s && me(this.#s, () => {
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
    this.#b(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, ue(() => {
      this.#h = !1, this.#o && Me(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#v(), te(
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
    this.#n && (N(this.#n), this.#n = null), this.#s && (N(this.#s), this.#s = null), this.#l && (N(this.#l), this.#l = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        cn();
        return;
      }
      i = !0, s && un(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
      } catch (u) {
        H(u, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return z(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= Le, r(
              this.#t,
              () => f,
              () => a
            );
          });
        } catch (u) {
          return H(
            u,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ue(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (u) {
        H(u, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        l,
        /** @param {unknown} e */
        (u) => H(u, this.#i && this.#i.parent)
      ) : l(f);
    });
  }
}
function kn(e, t, n, r) {
  const i = Tn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), l = Sn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    l();
    try {
      r(c);
    } catch (_) {
      (a.f & j) === 0 && H(_, a);
    }
    Re();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var o = kt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ An(c))).then((c) => u([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    l(), d(), Re();
  }) : d();
}
function Sn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    q(e), D(t), ce(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  q(null), D(null), ce(null), e && w?.deactivate();
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
function Tn(e) {
  var t = E | k, n = v !== null && (v.f & E) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
    deps: null,
    effects: null,
    equals: vt,
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
function An(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && nn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ce(
    /** @type {V} */
    x
  ), a = !v, l = /* @__PURE__ */ new Map();
  return qn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), u = dt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Re);
    } catch (_) {
      u.reject(_), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & _e) !== 0)
        var d = kt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject($), l.delete(o);
      else {
        for (const _ of l.values())
          _.reject($);
        l.clear();
      }
      l.set(o, u);
    }
    const c = (_, h = void 0) => {
      if (d) {
        var g = h === $;
        d(g);
      }
      if (!(h === $ || (f.f & j) !== 0)) {
        if (o.activate(), h)
          s.f |= K, Me(s, h);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Me(s, _);
          for (const [y, T] of l) {
            if (l.delete(y), y === o) break;
            T.reject($);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (_) => c(null, _ || "unknown"));
  }), In(() => {
    for (const f of l.values())
      f.reject($);
  }), new Promise((f) => {
    function u(o) {
      function d() {
        o === i ? f(s) : u(i);
      }
      o.then(d, d);
    }
    u(i);
  });
}
function Nn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      N(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Rn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function He(e) {
  var t, n = p;
  q(Rn(e));
  try {
    e.f &= ~ie, Nn(e), t = Bt(e);
  } finally {
    q(n);
  }
  return t;
}
function St(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = zt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  he || (C !== null ? (Ge() || w?.is_fork) && C.set(e, n) : Ue(e));
}
function Mn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Qt, t.ac = null, ye(t, 0), We(t));
}
function Tt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && de(t);
}
let ze = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let At = !1;
function Ce(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: vt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
  const n = Ce(e);
  return Un(n), n;
}
function Q(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (v.f & Qe) !== 0) && pt() && (v.f & (E | J | Be | Qe)) !== 0 && (O === null || !ae.call(O, e)) && fn();
  let r = n ? X(t) : t;
  return Me(e, r, Ae);
}
function Me(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    he ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = W.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(s), C === null && Ue(s);
    }
    e.wv = zt(), Nt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (B | re)) === 0 && (R === null ? Vn([e]) : R.push(e)), !i.is_fork && ze.size > 0 && !At && On();
  }
  return t;
}
function On() {
  At = !1;
  for (const e of ze)
    (e.f & b) !== 0 && m(e, L), Ee(e) && de(e);
  ze.clear();
}
function we(e) {
  Q(e, e.v + 1);
}
function Nt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], l = a.f, f = (l & k) === 0;
      if (f && m(a, t), (l & E) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        C?.delete(u), (l & ie) === 0 && (l & M && (a.f |= ie), Nt(u, L, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (l & J) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function X(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = ht(e);
  if (t !== ct && t !== Zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = ot(e), i = /* @__PURE__ */ V(0), s = ne, a = (l) => {
    if (ne === s)
      return l();
    var f = v, u = ne;
    D(null), it(s);
    var o = l();
    return D(f), it(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ V(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && sn();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var d = /* @__PURE__ */ V(u.value);
          return n.set(f, d), d;
        }) : Q(o, u.value, !0), !0;
      },
      deleteProperty(l, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in l) {
            const o = a(() => /* @__PURE__ */ V(x));
            n.set(f, o), we(i);
          }
        } else
          Q(u, x), we(i);
        return !0;
      },
      get(l, f, u) {
        if (f === Pe)
          return e;
        var o = n.get(f), d = f in l;
        if (o === void 0 && (!d || ge(l, f)?.writable) && (o = a(() => {
          var _ = X(d ? l[f] : x), h = /* @__PURE__ */ V(_);
          return h;
        }), n.set(f, o)), o !== void 0) {
          var c = te(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(l, f, u);
      },
      getOwnPropertyDescriptor(l, f) {
        var u = Reflect.getOwnPropertyDescriptor(l, f);
        if (u && "value" in u) {
          var o = n.get(f);
          o && (u.value = te(o));
        } else if (u === void 0) {
          var d = n.get(f), c = d?.v;
          if (d !== void 0 && c !== x)
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
        if (f === Pe)
          return !0;
        var u = n.get(f), o = u !== void 0 && u.v !== x || Reflect.has(l, f);
        if (u !== void 0 || p !== null && (!o || ge(l, f)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? X(l[f]) : x, _ = /* @__PURE__ */ V(c);
            return _;
          }), n.set(f, u));
          var d = te(u);
          if (d === x)
            return !1;
        }
        return o;
      },
      set(l, f, u, o) {
        var d = n.get(f), c = f in l;
        if (r && f === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var h = n.get(_ + "");
            h !== void 0 ? Q(h, x) : _ in l && (h = a(() => /* @__PURE__ */ V(x)), n.set(_ + "", h));
          }
        if (d === void 0)
          (!c || ge(l, f)?.writable) && (d = a(() => /* @__PURE__ */ V(void 0)), Q(d, X(u)), n.set(f, d));
        else {
          c = d.v !== x;
          var g = a(() => X(u));
          Q(d, g);
        }
        var y = Reflect.getOwnPropertyDescriptor(l, f);
        if (y?.set && y.set.call(o, u), !c) {
          if (r && typeof f == "string") {
            var T = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(f);
            Number.isInteger(se) && se >= T.v && Q(T, se + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(l) {
        te(i);
        var f = Reflect.ownKeys(l).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== x;
        });
        for (var [u, o] of n)
          o.v !== x && !(u in l) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        ln();
      }
    }
  );
}
var tt, Rt, Mt, Ot;
function Dn() {
  if (tt === void 0) {
    tt = window, Rt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Mt = ge(t, "firstChild").get, Ot = ge(t, "nextSibling").get, Je(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Je(n) && (n.__t = void 0);
  }
}
function Oe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Dt(e) {
  return (
    /** @type {TemplateNode | null} */
    Mt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    Ot.call(e)
  );
}
function xe(e, t) {
  return /* @__PURE__ */ Dt(e);
}
function ke(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ke(r);
  return r;
}
function Cn() {
  return !1;
}
function Fn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(on, e, void 0)
  );
}
function Ct(e) {
  var t = v, n = p;
  D(null), q(null);
  try {
    return e();
  } finally {
    D(t), q(n);
  }
}
function Pn(e, t) {
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
  if ((e & be) !== 0)
    fe !== null ? fe.push(r) : W.ensure().schedule(r);
  else if (t !== null) {
    try {
      de(r);
    } catch (a) {
      throw N(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & J) !== 0 && (e & oe) !== 0 && i !== null && (i.f |= oe));
  }
  if (i !== null && (i.parent = n, n !== null && Pn(i, n), v !== null && (v.f & E) !== 0 && (e & re) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ge() {
  return v !== null && !F;
}
function In(e) {
  const t = Z(De, null);
  return m(t, b), t.teardown = e, t;
}
function jn(e) {
  return Z(be | tn, e);
}
function Ln(e) {
  W.ensure();
  const t = Z(re | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      N(t), r(void 0);
    }) : (N(t), r(void 0));
  });
}
function qn(e) {
  return Z(Be | ve, e);
}
function Yn(e, t = 0) {
  return Z(De | t, e);
}
function nt(e, t = [], n = [], r = []) {
  kn(r, t, n, (i) => {
    Z(De, () => e(...i.map(te)));
  });
}
function Ft(e, t = 0) {
  var n = Z(J | t, e);
  return n;
}
function z(e) {
  return Z(B | ve, e);
}
function Pt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = he, r = v;
    rt(!0), D(null);
    try {
      t.call(null);
    } finally {
      rt(n), D(r);
    }
  }
}
function We(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ct(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & re) !== 0 ? n.parent = null : N(n, t), n = r;
  }
}
function zn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && N(t), t = n;
  }
}
function N(e, t = !0) {
  var n = !1;
  (t || (e.f & en) !== 0) && e.nodes !== null && e.nodes.end !== null && ($n(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), We(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Pt(e), e.f ^= Ze, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && It(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function $n(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function It(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  jt(e, r, !0);
  var i = () => {
    n && N(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var l of r)
      l.out(a);
  } else
    i();
}
function jt(e, t, n) {
  if ((e.f & I) === 0) {
    e.f ^= I;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & oe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & J) !== 0;
      jt(i, t, a ? n : !1), i = s;
    }
  }
}
function Bn(e) {
  Lt(e, !0);
}
function Lt(e, t) {
  if ((e.f & I) !== 0) {
    e.f ^= I, (e.f & b) === 0 && (m(e, k), W.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & oe) !== 0 || (n.f & B) !== 0;
      Lt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function qt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Ne = !1, he = !1;
function rt(e) {
  he = e;
}
let v = null, F = !1;
function D(e) {
  v = e;
}
let p = null;
function q(e) {
  p = e;
}
let O = null;
function Un(e) {
  v !== null && (O === null ? O = [e] : O.push(e));
}
let S = null, A = 0, R = null;
function Vn(e) {
  R = e;
}
let Yt = 1, ee = 0, ne = ee;
function it(e) {
  ne = e;
}
function zt() {
  return ++Yt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & E && (e.f &= ~ie), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && St(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & M) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, b);
  }
  return !1;
}
function $t(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ae.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? $t(
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
  var t = S, n = A, r = R, i = v, s = O, a = P, l = F, f = ne, u = e.f;
  S = /** @type {null | Value[]} */
  null, A = 0, R = null, v = (u & (B | re)) === 0 ? e : null, O = null, ce(e.ctx), F = !1, ne = ++ee, e.ac !== null && (Ct(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= qe;
    var o = (
      /** @type {Function} */
      e.fn
    ), d = o();
    e.f |= _e;
    var c = e.deps, _ = w?.is_fork;
    if (S !== null) {
      var h;
      if (_ || ye(e, A), c !== null && A > 0)
        for (c.length = A + S.length, h = 0; h < S.length; h++)
          c[A + h] = S[h];
      else
        e.deps = c = S;
      if (Ge() && (e.f & M) !== 0)
        for (h = A; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !_ && c !== null && A < c.length && (ye(e, A), c.length = A);
    if (pt() && R !== null && !F && c !== null && (e.f & (E | L | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      R.length; h++)
        $t(
          R[h],
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
    return (e.f & K) !== 0 && (e.f ^= K), d;
  } catch (g) {
    return gt(g);
  } finally {
    e.f ^= qe, S = t, A = n, R = r, v = i, O = s, ce(a), F = l, ne = f;
  }
}
function Hn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Gt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !ae.call(S, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & M) !== 0 && (s.f ^= M, s.f &= ~ie), Ue(s), Mn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hn(e, n[r]);
}
function de(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, b);
    var n = p, r = Ne;
    p = e, Ne = !0;
    try {
      (t & (J | _t)) !== 0 ? zn(e) : We(e), Pt(e);
      var i = Bt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Yt;
      var s;
    } finally {
      Ne = r, p = n;
    }
  }
}
function te(e) {
  var t = e.f, n = (t & E) !== 0;
  if (v !== null && !F) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (O === null || !ae.call(O, e))) {
      var i = v.deps;
      if ((v.f & qe) !== 0)
        e.rv < ee && (e.rv = ee, S === null && i !== null && i[A] === e ? A++ : S === null ? S = [e] : S.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ae.call(s, v) || s.push(v);
      }
    }
  }
  if (he && G.has(e))
    return G.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (he) {
      var l = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Vt(a)) && (l = He(a)), G.set(a, l), l;
    }
    var f = (a.f & M) === 0 && !F && v !== null && (Ne || (v.f & M) !== 0), u = (a.f & _e) === 0;
    Ee(a) && (f && (a.f |= M), St(a)), f && !u && (Tt(a), Ut(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Ut(e) {
  if (e.f |= M, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & M) === 0 && (Tt(
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
    if (G.has(t) || (t.f & E) !== 0 && Vt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Kn(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const st = globalThis.Deno?.core?.ops ?? null;
function Gn(e, ...t) {
  st?.[e] ? st[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function je(e, t) {
  Gn("op_set_text", e, t);
}
const Wn = ["touchstart", "touchmove"];
function Jn(e) {
  return Wn.includes(e);
}
const pe = Symbol("events"), Ht = /* @__PURE__ */ new Set(), $e = /* @__PURE__ */ new Set();
function lt(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Zn(e) {
  for (var t = 0; t < e.length; t++)
    Ht.add(e[t]);
  for (var n of $e)
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
  var a = 0, l = ft === e && e[pe];
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
    f <= u && (a = f);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Jt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, d = p;
    D(null), q(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (y) {
          c ? _.push(y) : c = y;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let y of _)
          queueMicrotask(() => {
            throw y;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, D(o), q(d);
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
  var t = Fn("template");
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
function Kt(e, t) {
  var n = (t & an) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = er(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Dt(r));
    var s = (
      /** @type {TemplateNode} */
      n || Rt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return tr(s, s), s;
  };
}
function at(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function nr(e, t) {
  return rr(e, t);
}
const Se = /* @__PURE__ */ new Map();
function rr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: l }) {
  Dn();
  var f = void 0, u = Ln(() => {
    var o = n ?? t.appendChild(Oe());
    En(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        _n({});
        var h = (
          /** @type {ComponentContext} */
          P
        );
        s && (h.c = s), i && (r.$$events = i), f = e(_, r) || {}, vn();
      },
      l
    );
    var d = /* @__PURE__ */ new Set(), c = (_) => {
      for (var h = 0; h < _.length; h++) {
        var g = _[h];
        if (!d.has(g)) {
          d.add(g);
          var y = Jn(g);
          for (const Fe of [t, document]) {
            var T = Se.get(Fe);
            T === void 0 && (T = /* @__PURE__ */ new Map(), Se.set(Fe, T));
            var se = T.get(g);
            se === void 0 ? (Fe.addEventListener(g, ut, { passive: y }), T.set(g, 1)) : T.set(g, se + 1);
          }
        }
      }
    };
    return c(Wt(Ht)), $e.add(c), () => {
      for (var _ of d)
        for (const y of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Se.get(y)
          ), g = (
            /** @type {number} */
            h.get(_)
          );
          --g == 0 ? (y.removeEventListener(_, ut), h.delete(_), h.size === 0 && Se.delete(y)) : h.set(_, g);
        }
      $e.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return ir.set(f, u), f;
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
        Bn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, a] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(a);
        l && (N(l.effect), this.#e.delete(a));
      }
      for (const [s, a] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var u = document.createDocumentFragment();
            qt(a, u), u.append(Oe()), this.#e.set(s, { effect: a, fragment: u });
          } else
            N(a);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), me(a, l, !1)) : l();
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
      n.includes(r) || (N(i.effect), this.#e.delete(r));
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
    ), i = Cn();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = Oe();
        s.append(a), this.#e.set(t, {
          effect: z(() => n(a)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          z(() => n(this.anchor))
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
function lr(e, t, n = !1) {
  var r = new sr(e), i = n ? oe : 0;
  function s(a, l) {
    r.ensure(a, l);
  }
  Ft(() => {
    var a = !1;
    t((l, f = 0) => {
      a = !0, s(f, l);
    }), a || s(-1, null);
  }, i);
}
var fr = /* @__PURE__ */ Kt("<div> </div>"), ur = /* @__PURE__ */ Kt("<div><div> </div> <div> </div> <!> <button>Add Item</button> <button>Take Snapshot</button></div>");
function ar(e) {
  let t = X(["a", "b", "c"]), n = X([]);
  function r() {
    n.push(dn(t));
  }
  function i() {
    t.push(String.fromCharCode(97 + t.length));
  }
  var s = ur(), a = xe(s), l = xe(a), f = ke(a, 2), u = xe(f), o = ke(f, 2);
  {
    var d = (h) => {
      var g = fr(), y = xe(g);
      nt((T) => je(y, `Last snapshot: ${T ?? ""}`), [() => n[n.length - 1].join(", ")]), at(h, g);
    };
    lr(o, (h) => {
      n.length > 0 && h(d);
    });
  }
  var c = ke(o, 2), _ = ke(c, 2);
  nt(
    (h) => {
      je(l, `Items: ${h ?? ""}`), je(u, `Snapshots taken: ${n.length ?? ""}`);
    },
    [() => t.join(", ")]
  ), lt("click", c, i), lt("click", _, r), at(e, s);
}
Zn(["click"]);
function cr(e) {
  return nr(ar, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

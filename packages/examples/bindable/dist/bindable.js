var Wt = Array.isArray, Zt = Array.prototype.indexOf, ce = Array.prototype.includes, Jt = Array.from, Qt = Object.defineProperty, ae = Object.getOwnPropertyDescriptor, Xt = Object.prototype, en = Array.prototype, tn = Object.getPrototypeOf, Ze = Object.isExtensible;
const nn = () => {
};
function rn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ct() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, we = 4, Oe = 8, vt = 1 << 24, J = 16, Z = 32, re = 64, je = 128, P = 512, b = 1024, k = 2048, j = 4096, G = 8192, C = 16384, _e = 32768, Je = 1 << 25, Re = 65536, Qe = 1 << 17, ln = 1 << 18, de = 1 << 19, sn = 1 << 20, ie = 65536, Ye = 1 << 21, Ve = 1 << 22, K = 1 << 23, Se = Symbol("$state"), fn = Symbol("legacy props"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function un() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function an() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function on(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function cn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function vn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function hn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function _n() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const dn = 2, x = Symbol(), pn = "http://www.w3.org/1999/xhtml";
function gn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ht(e) {
  return e === this.v;
}
let I = null;
function ve(e) {
  I = e;
}
function _t(e, t = !1, n) {
  I = {
    p: I,
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
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      zn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function pt() {
  return !0;
}
let ee = [];
function gt() {
  var e = ee;
  ee = [], rn(e);
}
function oe(e) {
  if (ee.length === 0 && !pe) {
    var t = ee;
    queueMicrotask(() => {
      t === ee && gt();
    });
  }
  ee.push(e);
}
function wn() {
  for (; ee.length > 0; )
    gt();
}
function wt(e) {
  var t = p;
  if (t === null)
    return d.f |= K, e;
  if ((t.f & _e) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0) {
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
const yn = -7169;
function m(e, t) {
  e.f = e.f & yn | t;
}
function $e(e) {
  (e.f & P) !== 0 || e.deps === null ? m(e, b) : m(e, j);
}
function yt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & ie) === 0 || (t.f ^= ie, yt(
        /** @type {Derived} */
        t.deps
      ));
}
function mt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & j) !== 0 && n.add(e), yt(e.deps), m(e, b);
}
let be = !1;
function mn(e) {
  var t = be;
  try {
    return be = !1, [e(), be];
  } finally {
    be = t;
  }
}
const U = /* @__PURE__ */ new Set();
let g = null, F = null, qe = null, pe = !1, Me = !1, fe = null, Te = null;
var Xe = 0;
let bn = 1;
class le {
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
  #s = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #h = /* @__PURE__ */ new Set();
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
  #o = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #_() {
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, j), this.schedule(r);
    }
  }
  #v() {
    if (Xe++ > 1e3 && (U.delete(this), xn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, j), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = Te = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw St(f), u;
      }
    if (g = null, i.length > 0) {
      var l = le.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (fe = null, Te = null, this.#c() || this.#_()) {
      this.#d(r), this.#d(n);
      for (const [f, u] of this.#l)
        xt(f, u);
    } else {
      this.#r.size === 0 && U.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), et(r), et(n), this.#i?.resolve();
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
    a !== null && (U.add(a), a.#v()), U.has(this) || this.#w();
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
      var l = i.f, a = (l & (Z | re)) !== 0, f = a && (l & b) !== 0, u = f || (l & G) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= b : (l & we) !== 0 ? n.push(i) : me(i) && ((l & J) !== 0 && this.#n.add(i), he(i));
        var s = i.first;
        if (s !== null) {
          i = s;
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
      mt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, F = null;
  }
  flush() {
    try {
      Me = !0, g = this, this.#v();
    } finally {
      Xe = 0, qe = null, fe = null, Te = null, Me = !1, g = null, F = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#h) t(this);
    this.#h.clear(), U.delete(this);
  }
  #w() {
    for (const s of U) {
      var t = s.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (s.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(o)[0]
          );
          if (t && h !== r)
            s.current.set(o, [h, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...s.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var l = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var f of n)
          bt(f, i, l, a);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#a(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of U)
      s.#u.has(this) && (s.#u.delete(this), s.#u.size === 0 && !s.#c() && (s.activate(), s.#v()));
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
    this.#o || r || (this.#o = !0, oe(() => {
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
    this.#s.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#h.add(t);
  }
  settled() {
    return (this.#i ??= ct()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new le();
      Me || (U.add(g), pe || oe(() => {
        g === t && t.flush();
      }));
    }
    return g;
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
    if (qe = t, t.b?.is_pending && (t.f & (we | Oe | vt)) !== 0 && (t.f & _e) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (d === null || (d.f & E) === 0))
        return;
      if ((r & (re | Z)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#e.push(n);
  }
}
function En(e) {
  var t = pe;
  pe = !0;
  try {
    for (var n; ; ) {
      if (wn(), g === null)
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
function xn() {
  try {
    an();
  } catch (e) {
    H(e, qe);
  }
}
let V = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (C | G)) === 0 && me(r) && (V = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && jt(r), V?.size > 0)) {
        W.clear();
        for (const i of V) {
          if ((i.f & (C | G)) !== 0) continue;
          const l = [i];
          let a = i.parent;
          for (; a !== null; )
            V.has(a) && (V.delete(a), l.push(a)), a = a.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (C | G)) === 0 && he(u);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function bt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & E) !== 0 ? bt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Ve | J)) !== 0 && (l & k) === 0 && Et(i, t, r) && (m(i, k), Be(
        /** @type {Effect} */
        i
      ));
    }
}
function Et(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ce.call(t, i))
        return !0;
      if ((i.f & E) !== 0 && Et(
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
function Be(e) {
  g.schedule(e);
}
function xt(e, t) {
  if (!((e.f & Z) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & j) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      xt(n, t), n = n.next;
  }
}
function St(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    St(t), t = t.next;
}
function Sn(e) {
  let t = 0, n = De(0), r;
  return () => {
    Ke() && (R(n), It(() => (t === 0 && (r = Ht(() => e(() => ge(n)))), t += 1, () => {
      oe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var Tn = Re | de;
function kn(e, t, n, r) {
  new An(e, t, n, r);
}
class An {
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
  #h = null;
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
  #o = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #a = null;
  #d = Sn(() => (this.#a = De(this.#o), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= je, r(l);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Un(() => {
      this.#y();
    }, Tn);
  }
  #w() {
    try {
      this.#e = X(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#r.failed;
    n && (this.#n = X(() => {
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
    t && (this.is_pending = !0, this.#t = X(() => t(this.#s)), oe(() => {
      var n = this.#l = document.createDocumentFragment(), r = Mt();
      n.append(r), this.#e = this.#g(() => X(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, ke(
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
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = X(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Kn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = X(() => n(this.#s));
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    mt(t, this.#_, this.#v);
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
    var n = p, r = d, i = I;
    Y(this.#i), D(this.#i), ve(this.#i.ctx);
    try {
      return le.ensure(), t();
    } catch (l) {
      return wt(l), null;
    } finally {
      Y(n), D(r), ve(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && ke(this.#t, () => {
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
    this.#m(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, oe(() => {
      this.#c = !1, this.#a && Pe(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#d(), R(
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
    this.#e && (L(this.#e), this.#e = null), this.#t && (L(this.#t), this.#t = null), this.#n && (L(this.#n), this.#n = null);
    var i = !1, l = !1;
    const a = () => {
      if (i) {
        gn();
        return;
      }
      i = !0, l && _n(), this.#n !== null && ke(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, a), l = !1;
      } catch (s) {
        H(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return X(() => {
            var s = (
              /** @type {Effect} */
              p
            );
            s.b = this, s.f |= je, r(
              this.#s,
              () => u,
              () => a
            );
          });
        } catch (s) {
          return H(
            s,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    oe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (s) {
        H(s, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (s) => H(s, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function Rn(e, t, n, r) {
  const i = kt;
  var l = e.filter((c) => !c.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = Nn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((c) => c.promise)) : null;
  function s(c) {
    f();
    try {
      r(c);
    } catch (_) {
      (a.f & C) === 0 && H(_, a);
    }
    Ne();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var o = Tt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Pn(c))).then((c) => s([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ne();
  }) : h();
}
function Nn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = d, n = I, r = (
    /** @type {Batch} */
    g
  );
  return function(l = !0) {
    Y(e), D(t), ve(n), l && (e.f & C) === 0 && (r?.activate(), r?.apply());
  };
}
function Ne(e = !0) {
  Y(null), D(null), ve(null), e && g?.deactivate();
}
function Tt() {
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
function kt(e) {
  var t = E | k, n = d !== null && (d.f & E) !== 0 ? (
    /** @type {Derived} */
    d
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: I,
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
function Pn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && un();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = De(
    /** @type {V} */
    x
  ), a = !d, f = /* @__PURE__ */ new Map();
  return $n(() => {
    var u = (
      /** @type {Effect} */
      p
    ), s = ct();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(Ne);
    } catch (_) {
      s.reject(_), Ne();
    }
    var o = (
      /** @type {Batch} */
      g
    );
    if (a) {
      if ((u.f & _e) !== 0)
        var h = Tt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject($), f.delete(o);
      else {
        for (const _ of f.values())
          _.reject($);
        f.clear();
      }
      f.set(o, s);
    }
    const c = (_, v = void 0) => {
      if (h) {
        var w = v === $;
        h(w);
      }
      if (!(v === $ || (u.f & C) !== 0)) {
        if (o.activate(), v)
          l.f |= K, Pe(l, v);
        else {
          (l.f & K) !== 0 && (l.f ^= K), Pe(l, _);
          for (const [y, S] of f) {
            if (f.delete(y), y === o) break;
            S.reject($);
          }
        }
        o.deactivate();
      }
    };
    s.promise.then(c, (_) => c(null, _ || "unknown"));
  }), qn(() => {
    for (const u of f.values())
      u.reject($);
  }), new Promise((u) => {
    function s(o) {
      function h() {
        o === i ? u(l) : s(i);
      }
      o.then(h, h);
    }
    s(i);
  });
}
function On(e) {
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
function Dn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
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
  Y(Dn(e));
  try {
    e.f &= ~ie, On(e), t = $t(e);
  } finally {
    Y(n);
  }
  return t;
}
function At(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = zt(), (!g?.is_fork || e.deps === null) && (e.v = n, g?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  se || (F !== null ? (Ke() || g?.is_fork) && F.set(e, n) : $e(e));
}
function Fn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = nn, t.ac = null, ye(t, 0), We(t));
}
function Rt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let ze = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let Nt = !1;
function De(e, t) {
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
function z(e, t) {
  const n = De(e);
  return Wn(n), n;
}
function B(e, t, n = !1) {
  d !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (d.f & Qe) !== 0) && pt() && (d.f & (E | J | Ve | Qe)) !== 0 && (O === null || !ce.call(O, e)) && hn();
  let r = n ? ue(t) : t;
  return Pe(e, r, Te);
}
function Pe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    se ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = le.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ue(l), F === null && $e(l);
    }
    e.wv = zt(), Pt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (Z | re)) === 0 && (N === null ? Zn([e]) : N.push(e)), !i.is_fork && ze.size > 0 && !Nt && Mn();
  }
  return t;
}
function Mn() {
  Nt = !1;
  for (const e of ze)
    (e.f & b) !== 0 && m(e, j), me(e) && he(e);
  ze.clear();
}
function ge(e) {
  B(e, e.v + 1);
}
function Pt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var a = r[l], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & E) !== 0) {
        var s = (
          /** @type {Derived} */
          a
        );
        F?.delete(s), (f & ie) === 0 && (f & P && (a.f |= ie), Pt(s, j, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & J) !== 0 && V !== null && V.add(o), n !== null ? n.push(o) : Be(o);
      }
    }
}
function ue(e) {
  if (typeof e != "object" || e === null || Se in e)
    return e;
  const t = tn(e);
  if (t !== Xt && t !== en)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Wt(e), i = /* @__PURE__ */ z(0), l = ne, a = (f) => {
    if (ne === l)
      return f();
    var u = d, s = ne;
    D(null), lt(l);
    var o = f();
    return D(u), lt(s), o;
  };
  return r && n.set("length", /* @__PURE__ */ z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && cn();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ z(s.value);
          return n.set(u, h), h;
        }) : B(o, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ z(x));
            n.set(u, o), ge(i);
          }
        } else
          B(s, x), ge(i);
        return !0;
      },
      get(f, u, s) {
        if (u === Se)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || ae(f, u)?.writable) && (o = a(() => {
          var _ = ue(h ? f[u] : x), v = /* @__PURE__ */ z(_);
          return v;
        }), n.set(u, o)), o !== void 0) {
          var c = R(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var o = n.get(u);
          o && (s.value = R(o));
        } else if (s === void 0) {
          var h = n.get(u), c = h?.v;
          if (h !== void 0 && c !== x)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return s;
      },
      has(f, u) {
        if (u === Se)
          return !0;
        var s = n.get(u), o = s !== void 0 && s.v !== x || Reflect.has(f, u);
        if (s !== void 0 || p !== null && (!o || ae(f, u)?.writable)) {
          s === void 0 && (s = a(() => {
            var c = o ? ue(f[u]) : x, _ = /* @__PURE__ */ z(c);
            return _;
          }), n.set(u, s));
          var h = R(s);
          if (h === x)
            return !1;
        }
        return o;
      },
      set(f, u, s, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var _ = s; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var v = n.get(_ + "");
            v !== void 0 ? B(v, x) : _ in f && (v = a(() => /* @__PURE__ */ z(x)), n.set(_ + "", v));
          }
        if (h === void 0)
          (!c || ae(f, u)?.writable) && (h = a(() => /* @__PURE__ */ z(void 0)), B(h, ue(s)), n.set(u, h));
        else {
          c = h.v !== x;
          var w = a(() => ue(s));
          B(h, w);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(o, s), !c) {
          if (r && typeof u == "string") {
            var S = (
              /** @type {Source<number>} */
              n.get("length")
            ), q = Number(u);
            Number.isInteger(q) && q >= S.v && B(S, q + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        R(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== x;
        });
        for (var [s, o] of n)
          o.v !== x && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        vn();
      }
    }
  );
}
var tt, Ot, Dt, Ft;
function Cn() {
  if (tt === void 0) {
    tt = window, Ot = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Dt = ae(t, "firstChild").get, Ft = ae(t, "nextSibling").get, Ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ze(n) && (n.__t = void 0);
  }
}
function Mt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ct(e) {
  return (
    /** @type {TemplateNode | null} */
    Dt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    Ft.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ Ct(e);
}
function nt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function In(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(pn, e, void 0)
  );
}
let rt = !1;
function Ln() {
  rt || (rt = !0, document.addEventListener(
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
function Ge(e) {
  var t = d, n = p;
  D(null), Y(null);
  try {
    return e();
  } finally {
    D(t), Y(n);
  }
}
function jn(e, t, n, r = n) {
  e.addEventListener(t, () => Ge(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), Ln();
}
function Yn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Q(e, t) {
  var n = p;
  n !== null && (n.f & G) !== 0 && (e |= G);
  var r = {
    ctx: I,
    deps: null,
    nodes: null,
    f: e | k | P,
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
    fe !== null ? fe.push(r) : le.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & J) !== 0 && (e & Re) !== 0 && i !== null && (i.f |= Re));
  }
  if (i !== null && (i.parent = n, n !== null && Yn(i, n), d !== null && (d.f & E) !== 0 && (e & re) === 0)) {
    var l = (
      /** @type {Derived} */
      d
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return d !== null && !M;
}
function qn(e) {
  const t = Q(Oe, null);
  return m(t, b), t.teardown = e, t;
}
function zn(e) {
  return Q(we | sn, e);
}
function Vn(e) {
  le.ensure();
  const t = Q(re | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ke(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function $n(e) {
  return Q(Ve | de, e);
}
function It(e, t = 0) {
  return Q(Oe | t, e);
}
function Bn(e, t = [], n = [], r = []) {
  Rn(r, t, n, (i) => {
    Q(Oe, () => e(...i.map(R)));
  });
}
function Un(e, t = 0) {
  var n = Q(J | t, e);
  return n;
}
function X(e) {
  return Q(Z | de, e);
}
function Lt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = se, r = d;
    it(!0), D(null);
    try {
      t.call(null);
    } finally {
      it(n), D(r);
    }
  }
}
function We(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ge(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & re) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function Hn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Z) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & ln) !== 0) && e.nodes !== null && e.nodes.end !== null && (Gn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Je), We(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Lt(e), e.f ^= Je, e.f |= C;
  var i = e.parent;
  i !== null && i.first !== null && jt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Gn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function jt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ke(e, t, n = !0) {
  var r = [];
  Yt(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var a = () => --l || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Yt(e, t, n) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, a = (i.f & Re) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Z) !== 0 && (e.f & J) !== 0;
      Yt(i, t, a ? n : !1), i = l;
    }
  }
}
function Kn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let Ae = !1, se = !1;
function it(e) {
  se = e;
}
let d = null, M = !1;
function D(e) {
  d = e;
}
let p = null;
function Y(e) {
  p = e;
}
let O = null;
function Wn(e) {
  d !== null && (O === null ? O = [e] : O.push(e));
}
let T = null, A = 0, N = null;
function Zn(e) {
  N = e;
}
let qt = 1, te = 0, ne = te;
function lt(e) {
  ne = e;
}
function zt() {
  return ++qt;
}
function me(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & E && (e.f &= ~ie), (t & j) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (me(
        /** @type {Derived} */
        l
      ) && At(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & P) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, b);
  }
  return !1;
}
function Vt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ce.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & E) !== 0 ? Vt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? m(l, k) : (l.f & b) !== 0 && m(l, j), Be(
        /** @type {Effect} */
        l
      ));
    }
}
function $t(e) {
  var t = T, n = A, r = N, i = d, l = O, a = I, f = M, u = ne, s = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, N = null, d = (s & (Z | re)) === 0 ? e : null, O = null, ve(e.ctx), M = !1, ne = ++te, e.ac !== null && (Ge(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= Ye;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= _e;
    var c = e.deps, _ = g?.is_fork;
    if (T !== null) {
      var v;
      if (_ || ye(e, A), c !== null && A > 0)
        for (c.length = A + T.length, v = 0; v < T.length; v++)
          c[A + v] = T[v];
      else
        e.deps = c = T;
      if (Ke() && (e.f & P) !== 0)
        for (v = A; v < c.length; v++)
          (c[v].reactions ??= []).push(e);
    } else !_ && c !== null && A < c.length && (ye(e, A), c.length = A);
    if (pt() && N !== null && !M && c !== null && (e.f & (E | j | k)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      N.length; v++)
        Vt(
          N[v],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (te++, i.deps !== null)
        for (let w = 0; w < n; w += 1)
          i.deps[w].rv = te;
      if (t !== null)
        for (const w of t)
          w.rv = te;
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (w) {
    return wt(w);
  } finally {
    e.f ^= Ye, T = t, A = n, N = r, d = i, O = l, ve(a), M = f, ne = u;
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
  (T === null || !ce.call(T, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & P) !== 0 && (l.f ^= P, l.f &= ~ie), $e(l), Fn(l), ye(l, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Jn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & C) === 0) {
    m(e, b);
    var n = p, r = Ae;
    p = e, Ae = !0;
    try {
      (t & (J | vt)) !== 0 ? Hn(e) : We(e), Lt(e);
      var i = $t(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = qt;
      var l;
    } finally {
      Ae = r, p = n;
    }
  }
}
async function Qn() {
  await Promise.resolve(), En();
}
function R(e) {
  var t = e.f, n = (t & E) !== 0;
  if (d !== null && !M) {
    var r = p !== null && (p.f & C) !== 0;
    if (!r && (O === null || !ce.call(O, e))) {
      var i = d.deps;
      if ((d.f & Ye) !== 0)
        e.rv < te && (e.rv = te, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (d.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [d] : ce.call(l, d) || l.push(d);
      }
    }
  }
  if (se && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (se) {
      var f = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Ut(a)) && (f = Ue(a)), W.set(a, f), f;
    }
    var u = (a.f & P) === 0 && !M && d !== null && (Ae || (d.f & P) !== 0), s = (a.f & _e) === 0;
    me(a) && (u && (a.f |= P), At(a)), u && !s && (Rt(a), Bt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Bt(e) {
  if (e.f |= P, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & P) === 0 && (Rt(
        /** @type {Derived} */
        t
      ), Bt(
        /** @type {Derived} */
        t
      ));
}
function Ut(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & E) !== 0 && Ut(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ht(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const st = globalThis.Deno?.core?.ops ?? null;
function Xn(e, ...t) {
  st?.[e] ? st[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function ft(e, t) {
  Xn("op_set_text", e, t);
}
const er = ["touchstart", "touchmove"];
function tr(e) {
  return er.includes(e);
}
const Ee = Symbol("events"), nr = /* @__PURE__ */ new Set(), ut = /* @__PURE__ */ new Set();
let at = null;
function ot(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  at = e;
  var a = 0, f = at === e && e[Ee];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ee] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (a = u);
  }
  if (l = /** @type {Element} */
  i[a] || e.target, l !== t) {
    Qt(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var o = d, h = p;
    D(null), Y(null);
    try {
      for (var c, _ = []; l !== null; ) {
        var v = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var w = l[Ee]?.[r];
          w != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && w.call(l, e);
        } catch (y) {
          c ? _.push(y) : c = y;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        l = v;
      }
      if (c) {
        for (let y of _)
          queueMicrotask(() => {
            throw y;
          });
        throw c;
      }
    } finally {
      e[Ee] = t, delete e.currentTarget, D(o), Y(h);
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
function lr(e) {
  var t = In("template");
  return t.innerHTML = ir(e.replaceAll("<!>", "<!---->")), t.content;
}
function sr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Gt(e, t) {
  var n = (t & dn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = lr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ct(r));
    var l = (
      /** @type {TemplateNode} */
      n || Ot ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return sr(l, l), l;
  };
}
function Kt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function fr(e, t) {
  return ur(e, t);
}
const xe = /* @__PURE__ */ new Map();
function ur(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: a = !0, transformError: f }) {
  Cn();
  var u = void 0, s = Vn(() => {
    var o = n ?? t.appendChild(Mt());
    kn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        _t({});
        var v = (
          /** @type {ComponentContext} */
          I
        );
        l && (v.c = l), i && (r.$$events = i), u = e(_, r) || {}, dt();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var v = 0; v < _.length; v++) {
        var w = _[v];
        if (!h.has(w)) {
          h.add(w);
          var y = tr(w);
          for (const Fe of [t, document]) {
            var S = xe.get(Fe);
            S === void 0 && (S = /* @__PURE__ */ new Map(), xe.set(Fe, S));
            var q = S.get(w);
            q === void 0 ? (Fe.addEventListener(w, ot, { passive: y }), S.set(w, 1)) : S.set(w, q + 1);
          }
        }
      }
    };
    return c(Jt(nr)), ut.add(c), () => {
      for (var _ of h)
        for (const y of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            xe.get(y)
          ), w = (
            /** @type {number} */
            v.get(_)
          );
          --w == 0 ? (y.removeEventListener(_, ot), v.delete(_), v.size === 0 && xe.delete(y)) : v.set(_, w);
        }
      ut.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return ar.set(u, s), u;
}
let ar = /* @__PURE__ */ new WeakMap();
function or(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  jn(e, "input", async (i) => {
    var l = i ? e.defaultValue : e.value;
    if (l = Ie(e) ? Le(l) : l, n(l), g !== null && r.add(g), await Qn(), l !== (l = t())) {
      var a = e.selectionStart, f = e.selectionEnd, u = e.value.length;
      if (e.value = l ?? "", f !== null) {
        var s = e.value.length;
        a === f && f === u && s > u ? (e.selectionStart = s, e.selectionEnd = s) : (e.selectionStart = a, e.selectionEnd = Math.min(f, s));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Ht(t) == null && e.value && (n(Ie(e) ? Le(e.value) : e.value), g !== null && r.add(g)), It(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        g
      );
      if (r.has(l))
        return;
    }
    Ie(e) && i === Le(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function Ie(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Le(e) {
  return e === "" ? null : +e;
}
function cr(e, t, n, r) {
  var i = (
    /** @type {V} */
    r
  ), l = !0, a = () => (l && (l = !1, i = /** @type {V} */
  r), i);
  let f;
  {
    var u = Se in e || fn in e;
    f = ae(e, t)?.set ?? (u && t in e ? (y) => e[t] = y : void 0);
  }
  var s, o = !1;
  [s, o] = mn(() => (
    /** @type {V} */
    e[t]
  )), s === void 0 && r !== void 0 && (s = a(), f && (on(), f(s)));
  var h;
  if (h = () => {
    var y = (
      /** @type {V} */
      e[t]
    );
    return y === void 0 ? a() : (l = !0, y);
  }, f) {
    var c = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(y, S) {
        return arguments.length > 0 ? ((!S || c || o) && f(S ? h() : y), y) : h();
      })
    );
  }
  var _ = !1, v = /* @__PURE__ */ kt(() => (_ = !1, h()));
  R(v);
  var w = (
    /** @type {Effect} */
    p
  );
  return (
    /** @type {() => V} */
    (function(y, S) {
      if (arguments.length > 0) {
        const q = S ? R(v) : ue(y);
        return B(v, q), _ = !0, i !== void 0 && (i = q), y;
      }
      return se && _ || (w.f & C) !== 0 ? v.v : R(v);
    })
  );
}
var vr = /* @__PURE__ */ Gt('<input placeholder="Enter pin"/>');
function hr(e, t) {
  _t(t, !0);
  let n = cr(t, "value", 15, "");
  var r = vr();
  or(r, n), Kt(e, r), dt();
}
var _r = /* @__PURE__ */ Gt("<div><!> <div> </div> <div> </div></div>");
function dr(e) {
  let t = /* @__PURE__ */ z("");
  var n = _r(), r = Ce(n);
  hr(r, {
    get value() {
      return R(t);
    },
    set value(u) {
      B(t, u, !0);
    }
  });
  var i = nt(r, 2), l = Ce(i), a = nt(i, 2), f = Ce(a);
  Bn(() => {
    ft(l, `Pin: ${R(t) ?? ""}`), ft(f, `Length: ${R(t).length ?? ""}`);
  }), Kt(e, n);
}
function gr(e) {
  return fr(dr, { target: e });
}
export {
  gr as default,
  gr as rvst_mount
};

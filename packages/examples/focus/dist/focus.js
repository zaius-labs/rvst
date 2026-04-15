var Wt = Array.isArray, Kt = Array.prototype.indexOf, ue = Array.prototype.includes, Gt = Array.from, Zt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Jt = Object.prototype, Qt = Array.prototype, Xt = Object.getPrototypeOf, Xe = Object.isExtensible;
const en = () => {
};
function tn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ht() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, ye = 4, Me = 8, vt = 1 << 24, Z = 16, G = 32, re = 64, Ye = 128, F = 512, y = 1024, k = 2048, Y = 4096, U = 8192, j = 16384, he = 32768, et = 1 << 25, Ne = 65536, tt = 1 << 17, nn = 1 << 18, ve = 1 << 19, rn = 1 << 20, ie = 65536, ze = 1 << 21, Ue = 1 << 22, W = 1 << 23, Ce = Symbol("$state"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function ln() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function sn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function un() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function an() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function on() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const cn = 2, E = Symbol(), hn = "http://www.w3.org/1999/xhtml";
function vn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function _t(e) {
  return e === this.v;
}
let I = null;
function ae(e) {
  I = e;
}
function _n(e, t = !1, n) {
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
function dn(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      jn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function dt() {
  return !0;
}
let X = [];
function pt() {
  var e = X;
  X = [], tn(e);
}
function te(e) {
  if (X.length === 0 && !we) {
    var t = X;
    queueMicrotask(() => {
      t === X && pt();
    });
  }
  X.push(e);
}
function pn() {
  for (; X.length > 0; )
    pt();
}
function gt(e) {
  var t = p;
  if (t === null)
    return d.f |= W, e;
  if ((t.f & he) === 0 && (t.f & ye) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ye) !== 0) {
      if ((t.f & he) === 0)
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
function We(e) {
  (e.f & F) !== 0 || e.deps === null ? m(e, y) : m(e, Y);
}
function wt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ie) === 0 || (t.f ^= ie, wt(
        /** @type {Derived} */
        t.deps
      ));
}
function mt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), wt(e.deps), m(e, y);
}
const B = /* @__PURE__ */ new Set();
let g = null, C = null, Ve = null, we = !1, Le = !1, fe = null, ke = null;
var nt = 0;
let wn = 1;
class le {
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
        m(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (nt++ > 1e3 && (B.delete(this), yn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, Y), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = ke = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw xt(f), u;
      }
    if (g = null, i.length > 0) {
      var l = le.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (fe = null, ke = null, this.#c() || this.#_()) {
      this.#d(r), this.#d(n);
      for (const [f, u] of this.#l)
        Et(f, u);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), rt(r), rt(n), this.#i?.resolve();
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
    a !== null && (B.add(a), a.#h()), B.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var l = i.f, a = (l & (G | re)) !== 0, f = a && (l & y) !== 0, u = f || (l & U) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (l & ye) !== 0 ? n.push(i) : Ee(i) && ((l & Z) !== 0 && this.#n.add(i), ce(i));
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, C = null;
  }
  flush() {
    try {
      Le = !0, g = this, this.#h();
    } finally {
      nt = 0, Ve = null, fe = null, ke = null, Le = !1, g = null, C = null, K.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), B.delete(this);
  }
  #w() {
    for (const s of B) {
      var t = s.id < this.id, n = [];
      for (const [o, [v, c]] of this.current) {
        if (s.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(o)[0]
          );
          if (t && v !== r)
            s.current.set(o, [v, c]);
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
          yt(f, i, l, a);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#a(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of B)
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
    this.#o || r || (this.#o = !0, te(() => {
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
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= ht()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new le();
      Le || (B.add(g), we || te(() => {
        g === t && t.flush();
      }));
    }
    return g;
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
    if (Ve = t, t.b?.is_pending && (t.f & (ye | Me | vt)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (d === null || (d.f & b) === 0))
        return;
      if ((r & (re | G)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function mn(e) {
  var t = we;
  we = !0;
  try {
    for (var n; ; ) {
      if (pn(), g === null)
        return (
          /** @type {T} */
          n
        );
      g.flush();
    }
  } finally {
    we = t;
  }
}
function yn() {
  try {
    sn();
  } catch (e) {
    H(e, Ve);
  }
}
let V = null;
function rt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | U)) === 0 && Ee(r) && (V = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && It(r), V?.size > 0)) {
        K.clear();
        for (const i of V) {
          if ((i.f & (j | U)) !== 0) continue;
          const l = [i];
          let a = i.parent;
          for (; a !== null; )
            V.has(a) && (V.delete(a), l.push(a)), a = a.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (j | U)) === 0 && ce(u);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function yt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & b) !== 0 ? yt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Ue | Z)) !== 0 && (l & k) === 0 && bt(i, t, r) && (m(i, k), Ke(
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
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && bt(
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
function Ke(e) {
  g.schedule(e);
}
function Et(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      Et(n, t), n = n.next;
  }
}
function xt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    xt(t), t = t.next;
}
function bn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    Je() && (R(n), Ct(() => (t === 0 && (r = Ht(() => e(() => me(n)))), t += 1, () => {
      te(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, me(n));
      });
    })));
  };
}
var En = Ne | ve;
function xn(e, t, n, r) {
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
  #o = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #a = null;
  #d = bn(() => (this.#a = Oe(this.#o), () => {
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
      a.b = this, a.f |= Ye, r(l);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Vn(() => {
      this.#m();
    }, En);
  }
  #w() {
    try {
      this.#e = Q(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#r.failed;
    n && (this.#n = Q(() => {
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#s)), te(() => {
      var n = this.#l = document.createDocumentFragment(), r = Ot();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, Se(
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
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Hn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Q(() => n(this.#s));
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    mt(t, this.#_, this.#h);
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
    z(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return le.ensure(), t();
    } catch (l) {
      return gt(l), null;
    } finally {
      z(n), O(r), ae(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && Se(this.#t, () => {
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, te(() => {
      this.#c = !1, this.#a && Fe(this.#a, this.#o);
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
    this.#e && (q(this.#e), this.#e = null), this.#t && (q(this.#t), this.#t = null), this.#n && (q(this.#n), this.#n = null);
    var i = !1, l = !1;
    const a = () => {
      if (i) {
        vn();
        return;
      }
      i = !0, l && on(), this.#n !== null && Se(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, a), l = !1;
      } catch (s) {
        H(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var s = (
              /** @type {Effect} */
              p
            );
            s.b = this, s.f |= Ye, r(
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
    te(() => {
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
function kn(e, t, n, r) {
  const i = An;
  var l = e.filter((c) => !c.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = Sn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((c) => c.promise)) : null;
  function s(c) {
    f();
    try {
      r(c);
    } catch (_) {
      (a.f & j) === 0 && H(_, a);
    }
    Re();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var o = Tt();
  function v() {
    Promise.all(n.map((c) => /* @__PURE__ */ Nn(c))).then((c) => s([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), v(), Re();
  }) : v();
}
function Sn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = d, n = I, r = (
    /** @type {Batch} */
    g
  );
  return function(l = !0) {
    z(e), O(t), ae(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  z(null), O(null), ae(null), e && g?.deactivate();
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
function An(e) {
  var t = b | k, n = d !== null && (d.f & b) !== 0 ? (
    /** @type {Derived} */
    d
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: I,
    deps: null,
    effects: null,
    equals: _t,
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
function Nn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && ln();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Oe(
    /** @type {V} */
    E
  ), a = !d, f = /* @__PURE__ */ new Map();
  return Yn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), s = ht();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(Re);
    } catch (_) {
      s.reject(_), Re();
    }
    var o = (
      /** @type {Batch} */
      g
    );
    if (a) {
      if ((u.f & he) !== 0)
        var v = Tt();
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
    const c = (_, h = void 0) => {
      if (v) {
        var w = h === $;
        v(w);
      }
      if (!(h === $ || (u.f & j) !== 0)) {
        if (o.activate(), h)
          l.f |= W, Fe(l, h);
        else {
          (l.f & W) !== 0 && (l.f ^= W), Fe(l, _);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject($);
          }
        }
        o.deactivate();
      }
    };
    s.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Pt(() => {
    for (const u of f.values())
      u.reject($);
  }), new Promise((u) => {
    function s(o) {
      function v() {
        o === i ? u(l) : s(i);
      }
      o.then(v, v);
    }
    s(i);
  });
}
function Rn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      q(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Fn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ge(e) {
  var t, n = p;
  z(Fn(e));
  try {
    e.f &= ~ie, Rn(e), t = Vt(e);
  } finally {
    z(n);
  }
  return t;
}
function kt(e) {
  var t = e.v, n = Ge(e);
  if (!e.equals(n) && (e.wv = Yt(), (!g?.is_fork || e.deps === null) && (e.v = n, g?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (C !== null ? (Je() || g?.is_fork) && C.set(e, n) : We(e));
}
function Mn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = en, t.ac = null, be(t, 0), Qe(t));
}
function St(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let $e = /* @__PURE__ */ new Set();
const K = /* @__PURE__ */ new Map();
let At = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: _t,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Oe(e);
  return Un(n), n;
}
function N(e, t, n = !1) {
  d !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (d.f & tt) !== 0) && dt() && (d.f & (b | Z | Ue | tt)) !== 0 && (M === null || !ue.call(M, e)) && an();
  let r = n ? de(t) : t;
  return Fe(e, r, ke);
}
function Fe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? K.set(e, t) : K.set(e, r), e.v = t;
    var i = le.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ge(l), C === null && We(l);
    }
    e.wv = Yt(), Nt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (G | re)) === 0 && (A === null ? Wn([e]) : A.push(e)), !i.is_fork && $e.size > 0 && !At && On();
  }
  return t;
}
function On() {
  At = !1;
  for (const e of $e)
    (e.f & y) !== 0 && m(e, Y), Ee(e) && ce(e);
  $e.clear();
}
function me(e) {
  N(e, e.v + 1);
}
function Nt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var a = r[l], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var s = (
          /** @type {Derived} */
          a
        );
        C?.delete(s), (f & ie) === 0 && (f & F && (a.f |= ie), Nt(s, Y, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && V !== null && V.add(o), n !== null ? n.push(o) : Ke(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Xt(e);
  if (t !== Jt && t !== Qt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Wt(e), i = /* @__PURE__ */ P(0), l = ne, a = (f) => {
    if (ne === l)
      return f();
    var u = d, s = ne;
    O(null), ft(l);
    var o = f();
    return O(u), ft(s), o;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && fn();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var v = /* @__PURE__ */ P(s.value);
          return n.set(u, v), v;
        }) : N(o, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ P(E));
            n.set(u, o), me(i);
          }
        } else
          N(s, E), me(i);
        return !0;
      },
      get(f, u, s) {
        if (u === Ce)
          return e;
        var o = n.get(u), v = u in f;
        if (o === void 0 && (!v || ge(f, u)?.writable) && (o = a(() => {
          var _ = de(v ? f[u] : E), h = /* @__PURE__ */ P(_);
          return h;
        }), n.set(u, o)), o !== void 0) {
          var c = R(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var o = n.get(u);
          o && (s.value = R(o));
        } else if (s === void 0) {
          var v = n.get(u), c = v?.v;
          if (v !== void 0 && c !== E)
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
        if (u === Ce)
          return !0;
        var s = n.get(u), o = s !== void 0 && s.v !== E || Reflect.has(f, u);
        if (s !== void 0 || p !== null && (!o || ge(f, u)?.writable)) {
          s === void 0 && (s = a(() => {
            var c = o ? de(f[u]) : E, _ = /* @__PURE__ */ P(c);
            return _;
          }), n.set(u, s));
          var v = R(s);
          if (v === E)
            return !1;
        }
        return o;
      },
      set(f, u, s, o) {
        var v = n.get(u), c = u in f;
        if (r && u === "length")
          for (var _ = s; _ < /** @type {Source<number>} */
          v.v; _ += 1) {
            var h = n.get(_ + "");
            h !== void 0 ? N(h, E) : _ in f && (h = a(() => /* @__PURE__ */ P(E)), n.set(_ + "", h));
          }
        if (v === void 0)
          (!c || ge(f, u)?.writable) && (v = a(() => /* @__PURE__ */ P(void 0)), N(v, de(s)), n.set(u, v));
        else {
          c = v.v !== E;
          var w = a(() => de(s));
          N(v, w);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, s), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(u);
            Number.isInteger(se) && se >= D.v && N(D, se + 1);
          }
          me(i);
        }
        return !0;
      },
      ownKeys(f) {
        R(i);
        var u = Reflect.ownKeys(f).filter((v) => {
          var c = n.get(v);
          return c === void 0 || c.v !== E;
        });
        for (var [s, o] of n)
          o.v !== E && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        un();
      }
    }
  );
}
var it, Rt, Ft, Mt;
function Dn() {
  if (it === void 0) {
    it = window, Rt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ft = ge(t, "firstChild").get, Mt = ge(t, "nextSibling").get, Xe(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Xe(n) && (n.__t = void 0);
  }
}
function Ot(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Dt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ft.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ze(e) {
  return (
    /** @type {TemplateNode | null} */
    Mt.call(e)
  );
}
function xe(e, t) {
  return /* @__PURE__ */ Dt(e);
}
function _e(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ze(r);
  return r;
}
function Pn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(hn, e, void 0)
  );
}
let lt = !1;
function Cn() {
  lt || (lt = !0, document.addEventListener(
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
function De(e) {
  var t = d, n = p;
  O(null), z(null);
  try {
    return e();
  } finally {
    O(t), z(n);
  }
}
function Ln(e, t, n, r = n) {
  e.addEventListener(t, () => De(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), Cn();
}
function In(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & U) !== 0 && (e |= U);
  var r = {
    ctx: I,
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
  if ((e & ye) !== 0)
    fe !== null ? fe.push(r) : le.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Z) !== 0 && (e & Ne) !== 0 && i !== null && (i.f |= Ne));
  }
  if (i !== null && (i.parent = n, n !== null && In(i, n), d !== null && (d.f & b) !== 0 && (e & re) === 0)) {
    var l = (
      /** @type {Derived} */
      d
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function Je() {
  return d !== null && !L;
}
function Pt(e) {
  const t = J(Me, null);
  return m(t, y), t.teardown = e, t;
}
function jn(e) {
  return J(ye | rn, e);
}
function qn(e) {
  le.ensure();
  const t = J(re | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Se(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function Yn(e) {
  return J(Ue | ve, e);
}
function Ct(e, t = 0) {
  return J(Me | t, e);
}
function zn(e, t = [], n = [], r = []) {
  kn(r, t, n, (i) => {
    J(Me, () => e(...i.map(R)));
  });
}
function Vn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(G | ve, e);
}
function Lt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = d;
    st(!0), O(null);
    try {
      t.call(null);
    } finally {
      st(n), O(r);
    }
  }
}
function Qe(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && De(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & re) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function $n(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & nn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Bn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, et), Qe(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Lt(e), e.f ^= et, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && It(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Bn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ze(e);
    e.remove(), e = n;
  }
}
function It(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Se(e, t, n = !0) {
  var r = [];
  jt(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var a = () => --l || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function jt(e, t, n) {
  if ((e.f & U) === 0) {
    e.f ^= U;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, a = (i.f & Ne) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      jt(i, t, a ? n : !1), i = l;
    }
  }
}
function Hn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ze(n);
      t.append(n), n = i;
    }
}
let Ae = !1, oe = !1;
function st(e) {
  oe = e;
}
let d = null, L = !1;
function O(e) {
  d = e;
}
let p = null;
function z(e) {
  p = e;
}
let M = null;
function Un(e) {
  d !== null && (M === null ? M = [e] : M.push(e));
}
let T = null, S = 0, A = null;
function Wn(e) {
  A = e;
}
let qt = 1, ee = 0, ne = ee;
function ft(e) {
  ne = e;
}
function Yt() {
  return ++qt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~ie), (t & Y) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Ee(
        /** @type {Derived} */
        l
      ) && kt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & F) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, y);
  }
  return !1;
}
function zt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && ue.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & b) !== 0 ? zt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? m(l, k) : (l.f & y) !== 0 && m(l, Y), Ke(
        /** @type {Effect} */
        l
      ));
    }
}
function Vt(e) {
  var t = T, n = S, r = A, i = d, l = M, a = I, f = L, u = ne, s = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, d = (s & (G | re)) === 0 ? e : null, M = null, ae(e.ctx), L = !1, ne = ++ee, e.ac !== null && (De(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= ze;
    var o = (
      /** @type {Function} */
      e.fn
    ), v = o();
    e.f |= he;
    var c = e.deps, _ = g?.is_fork;
    if (T !== null) {
      var h;
      if (_ || be(e, S), c !== null && S > 0)
        for (c.length = S + T.length, h = 0; h < T.length; h++)
          c[S + h] = T[h];
      else
        e.deps = c = T;
      if (Je() && (e.f & F) !== 0)
        for (h = S; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (be(e, S), c.length = S);
    if (dt() && A !== null && !L && c !== null && (e.f & (b | Y | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      A.length; h++)
        zt(
          A[h],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let w = 0; w < n; w += 1)
          i.deps[w].rv = ee;
      if (t !== null)
        for (const w of t)
          w.rv = ee;
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & W) !== 0 && (e.f ^= W), v;
  } catch (w) {
    return gt(w);
  } finally {
    e.f ^= ze, T = t, S = n, A = r, d = i, M = l, ae(a), L = f, ne = u;
  }
}
function Kn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Kt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & F) !== 0 && (l.f ^= F, l.f &= ~ie), We(l), Mn(l), be(l, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Kn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, y);
    var n = p, r = Ae;
    p = e, Ae = !0;
    try {
      (t & (Z | vt)) !== 0 ? $n(e) : Qe(e), Lt(e);
      var i = Vt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = qt;
      var l;
    } finally {
      Ae = r, p = n;
    }
  }
}
async function Gn() {
  await Promise.resolve(), mn();
}
function R(e) {
  var t = e.f, n = (t & b) !== 0;
  if (d !== null && !L) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (M === null || !ue.call(M, e))) {
      var i = d.deps;
      if ((d.f & ze) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (d.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [d] : ue.call(l, d) || l.push(d);
      }
    }
  }
  if (oe && K.has(e))
    return K.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Bt(a)) && (f = Ge(a)), K.set(a, f), f;
    }
    var u = (a.f & F) === 0 && !L && d !== null && (Ae || (d.f & F) !== 0), s = (a.f & he) === 0;
    Ee(a) && (u && (a.f |= F), kt(a)), u && !s && (St(a), $t(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function $t(e) {
  if (e.f |= F, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & F) === 0 && (St(
        /** @type {Derived} */
        t
      ), $t(
        /** @type {Derived} */
        t
      ));
}
function Bt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (K.has(t) || (t.f & b) !== 0 && Bt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ht(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const ut = globalThis.Deno?.core?.ops ?? null;
function Zn(e, ...t) {
  ut?.[e] ? ut[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ie(e, t) {
  Zn("op_set_text", e, t);
}
const Jn = ["touchstart", "touchmove"];
function Qn(e) {
  return Jn.includes(e);
}
const pe = Symbol("events"), Ut = /* @__PURE__ */ new Set(), Be = /* @__PURE__ */ new Set();
function Xn(e, t, n, r = {}) {
  function i(l) {
    if (r.capture || He.call(t, l), !l.cancelBubble)
      return De(() => n?.call(this, l));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? te(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function at(e, t, n, r, i) {
  var l = { capture: r, passive: i }, a = Xn(e, t, n, l);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Pt(() => {
    t.removeEventListener(e, a, l);
  });
}
function er(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function tr(e) {
  for (var t = 0; t < e.length; t++)
    Ut.add(e[t]);
  for (var n of Be)
    n(e);
}
let ot = null;
function He(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  ot = e;
  var a = 0, f = ot === e && e[pe];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (a = u);
  }
  if (l = /** @type {Element} */
  i[a] || e.target, l !== t) {
    Zt(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var o = d, v = p;
    O(null), z(null);
    try {
      for (var c, _ = []; l !== null; ) {
        var h = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var w = l[pe]?.[r];
          w != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && w.call(l, e);
        } catch (x) {
          c ? _.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        l = h;
      }
      if (c) {
        for (let x of _)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, O(o), z(v);
    }
  }
}
const nr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function rr(e) {
  return (
    /** @type {string} */
    nr?.createHTML(e) ?? e
  );
}
function ir(e) {
  var t = Pn("template");
  return t.innerHTML = rr(e.replaceAll("<!>", "<!---->")), t.content;
}
function lr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
  var n = (t & cn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = ir(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Dt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Rt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return lr(l, l), l;
  };
}
function fr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function ur(e, t) {
  return ar(e, t);
}
const Te = /* @__PURE__ */ new Map();
function ar(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: a = !0, transformError: f }) {
  Dn();
  var u = void 0, s = qn(() => {
    var o = n ?? t.appendChild(Ot());
    xn(
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
          I
        );
        l && (h.c = l), i && (r.$$events = i), u = e(_, r) || {}, dn();
      },
      f
    );
    var v = /* @__PURE__ */ new Set(), c = (_) => {
      for (var h = 0; h < _.length; h++) {
        var w = _[h];
        if (!v.has(w)) {
          v.add(w);
          var x = Qn(w);
          for (const Pe of [t, document]) {
            var D = Te.get(Pe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), Te.set(Pe, D));
            var se = D.get(w);
            se === void 0 ? (Pe.addEventListener(w, He, { passive: x }), D.set(w, 1)) : D.set(w, se + 1);
          }
        }
      }
    };
    return c(Gt(Ut)), Be.add(c), () => {
      for (var _ of v)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Te.get(x)
          ), w = (
            /** @type {number} */
            h.get(_)
          );
          --w == 0 ? (x.removeEventListener(_, He), h.delete(_), h.size === 0 && Te.delete(x)) : h.set(_, w);
        }
      Be.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return or.set(u, s), u;
}
let or = /* @__PURE__ */ new WeakMap();
function ct(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Ln(e, "input", async (i) => {
    var l = i ? e.defaultValue : e.value;
    if (l = je(e) ? qe(l) : l, n(l), g !== null && r.add(g), await Gn(), l !== (l = t())) {
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
  Ht(t) == null && e.value && (n(je(e) ? qe(e.value) : e.value), g !== null && r.add(g)), Ct(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        g
      );
      if (r.has(l))
        return;
    }
    je(e) && i === qe(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function je(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function qe(e) {
  return e === "" ? null : +e;
}
var cr = /* @__PURE__ */ sr('<div><input placeholder="Name"/> <input placeholder="Email"/> <button>Submit</button> <div> </div> <div> </div> <div> </div></div>');
function hr(e) {
  let t = /* @__PURE__ */ P(""), n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P("none");
  var i = cr(), l = xe(i), a = _e(l, 2), f = _e(a, 2), u = _e(f, 2), s = xe(u), o = _e(u, 2), v = xe(o), c = _e(o, 2), _ = xe(c);
  zn(() => {
    Ie(s, `Focused: ${R(r) ?? ""}`), Ie(v, `Name: ${R(t) ?? ""}`), Ie(_, `Email: ${R(n) ?? ""}`);
  }), at("focus", l, () => N(r, "name")), ct(l, () => R(t), (h) => N(t, h)), at("focus", a, () => N(r, "email")), ct(a, () => R(n), (h) => N(n, h)), er("click", f, () => N(r, "submit")), fr(e, i);
}
tr(["click"]);
function _r(e) {
  return ur(hr, { target: e });
}
export {
  _r as default,
  _r as rvst_mount
};

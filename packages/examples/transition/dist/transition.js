var rn = Array.isArray, sn = Array.prototype.indexOf, de = Array.prototype.includes, ln = Array.from, an = Object.defineProperty, ye = Object.getOwnPropertyDescriptor, fn = Object.prototype, on = Array.prototype, un = Object.getPrototypeOf, at = Object.isExtensible;
function cn(e) {
  return typeof e == "function";
}
const ue = () => {
};
function hn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Et() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const x = 2, ve = 4, De = 8, xt = 1 << 24, K = 16, G = 32, se = 64, Ue = 128, N = 512, E = 1024, T = 2048, q = 4096, L = 8192, z = 16384, fe = 32768, ft = 1 << 25, le = 65536, ot = 1 << 17, dn = 1 << 18, we = 1 << 19, vn = 1 << 20, ae = 65536, Ye = 1 << 21, Ke = 1 << 22, X = 1 << 23, je = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function _n() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function pn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function gn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function wn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function mn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function bn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const yn = 4, En = 2, k = Symbol(), xn = "http://www.w3.org/1999/xhtml";
function kn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function kt(e) {
  return e === this.v;
}
let I = null;
function _e(e) {
  I = e;
}
function Tn(e, t = !1, n) {
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
function Sn(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Gn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function Tt() {
  return !0;
}
let ce = [];
function An() {
  var e = ce;
  ce = [], hn(e);
}
function re(e) {
  if (ce.length === 0) {
    var t = ce;
    queueMicrotask(() => {
      t === ce && An();
    });
  }
  ce.push(e);
}
function St(e) {
  var t = g;
  if (t === null)
    return p.f |= X, e;
  if ((t.f & fe) === 0 && (t.f & ve) === 0)
    throw e;
  Q(e, t);
}
function Q(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ue) !== 0) {
      if ((t.f & fe) === 0)
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
const Fn = -7169;
function y(e, t) {
  e.f = e.f & Fn | t;
}
function Ze(e) {
  (e.f & N) !== 0 || e.deps === null ? y(e, E) : y(e, q);
}
function At(e) {
  if (e !== null)
    for (const t of e)
      (t.f & x) === 0 || (t.f & ae) === 0 || (t.f ^= ae, At(
        /** @type {Derived} */
        t.deps
      ));
}
function Ft(e, t, n) {
  (e.f & T) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), At(e.deps), y(e, E);
}
const J = /* @__PURE__ */ new Set();
let b = null, D = null, Be = null, Le = !1, he = null, Fe = null;
var ut = 0;
let Rn = 1;
class te {
  id = Rn++;
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
  #f = /* @__PURE__ */ new Set();
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
  #a = /* @__PURE__ */ new Map();
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
        y(r, T), this.schedule(r);
      for (r of n.m)
        y(r, q), this.schedule(r);
    }
  }
  #d() {
    if (ut++ > 1e3 && (J.delete(this), Nn()), !this.#h()) {
      for (const a of this.#s)
        this.#l.delete(a), y(a, T), this.schedule(a);
      for (const a of this.#l)
        y(a, q), this.schedule(a);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = he = [], r = [], i = Fe = [];
    for (const a of t)
      try {
        this.#u(a, n, r);
      } catch (f) {
        throw Ot(a), f;
      }
    if (b = null, i.length > 0) {
      var s = te.ensure();
      for (const a of i)
        s.schedule(a);
    }
    if (he = null, Fe = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [a, f] of this.#a)
        Mt(a, f);
    } else {
      this.#e.size === 0 && J.delete(this), this.#s.clear(), this.#l.clear();
      for (const a of this.#t) a(this);
      this.#t.clear(), ct(r), ct(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#n.length > 0) {
      const a = o ??= this;
      a.#n.push(...this.#n.filter((f) => !a.#n.includes(f)));
    }
    o !== null && (J.add(o), o.#d()), J.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #u(t, n, r) {
    t.f ^= E;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & (G | se)) !== 0, a = o && (s & E) !== 0, f = a || (s & L) !== 0 || this.#a.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= E : (s & ve) !== 0 ? n.push(i) : Te(i) && ((s & K) !== 0 && this.#l.add(i), ge(i));
        var l = i.first;
        if (l !== null) {
          i = l;
          continue;
        }
      }
      for (; i !== null; ) {
        var u = i.next;
        if (u !== null) {
          i = u;
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
      Ft(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & X) === 0 && (this.current.set(t, [t.v, r]), D?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, D = null;
  }
  flush() {
    try {
      Le = !0, b = this, this.#d();
    } finally {
      ut = 0, Be = null, he = null, Fe = null, Le = !1, b = null, D = null, ee.clear();
    }
  }
  discard() {
    for (const t of this.#f) t(this);
    this.#f.clear(), J.delete(this);
  }
  #w() {
    for (const l of J) {
      var t = l.id < this.id, n = [];
      for (const [u, [d, c]] of this.current) {
        if (l.current.has(u)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(u)[0]
          );
          if (t && d !== r)
            l.current.set(u, [d, c]);
          else
            continue;
        }
        n.push(u);
      }
      var i = [...l.current.keys()].filter((u) => !this.current.has(u));
      if (i.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var a of n)
          Rt(a, i, s, o);
        if (l.#n.length > 0) {
          l.apply();
          for (var f of l.#n)
            l.#u(f, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of J)
      l.#o.has(this) && (l.#o.delete(this), l.#o.size === 0 && !l.#h() && (l.activate(), l.#d()));
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
    this.#c || r || (this.#c = !0, re(() => {
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
    this.#f.add(t);
  }
  settled() {
    return (this.#i ??= Et()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new te();
      Le || (J.add(b), re(() => {
        b === t && t.flush();
      }));
    }
    return b;
  }
  apply() {
    {
      D = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Be = t, t.b?.is_pending && (t.f & (ve | De | xt)) !== 0 && (t.f & fe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (he !== null && n === g && (p === null || (p.f & x) === 0))
        return;
      if ((r & (se | G)) !== 0) {
        if ((r & E) === 0)
          return;
        n.f ^= E;
      }
    }
    this.#n.push(n);
  }
}
function Nn() {
  try {
    pn();
  } catch (e) {
    Q(e, Be);
  }
}
let Y = null;
function ct(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | L)) === 0 && Te(r) && (Y = /* @__PURE__ */ new Set(), ge(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Bt(r), Y?.size > 0)) {
        ee.clear();
        for (const i of Y) {
          if ((i.f & (z | L)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            Y.has(o) && (Y.delete(o), s.push(o)), o = o.parent;
          for (let a = s.length - 1; a >= 0; a--) {
            const f = s[a];
            (f.f & (z | L)) === 0 && ge(f);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function Rt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & x) !== 0 ? Rt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ke | K)) !== 0 && (s & T) === 0 && Nt(i, t, r) && (y(i, T), Je(
        /** @type {Effect} */
        i
      ));
    }
}
function Nt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (de.call(t, i))
        return !0;
      if ((i.f & x) !== 0 && Nt(
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
function Je(e) {
  b.schedule(e);
}
function Mt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & E) !== 0)) {
    (e.f & T) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), y(e, E);
    for (var n = e.first; n !== null; )
      Mt(n, t), n = n.next;
  }
}
function Ot(e) {
  y(e, E);
  for (var t = e.first; t !== null; )
    Ot(t), t = t.next;
}
function Mn(e) {
  let t = 0, n = $e(0), r;
  return () => {
    et() && (P(n), Qn(() => (t === 0 && (r = en(() => e(() => Ee(n)))), t += 1, () => {
      re(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ee(n));
      });
    })));
  };
}
var On = le | we;
function Cn(e, t, n, r) {
  new Dn(e, t, n, r);
}
class Dn {
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
  #f = null;
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
  #a = null;
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
  #u = null;
  #_ = Mn(() => (this.#u = $e(this.#c), () => {
    this.#u = null;
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
        g
      );
      o.b = this, o.f |= Ue, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ut(() => {
      this.#m();
    }, On);
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
    t && (this.is_pending = !0, this.#s = B(() => t(this.#t)), re(() => {
      var n = this.#a = document.createDocumentFragment(), r = Oe();
      n.append(r), this.#n = this.#g(() => B(() => this.#r(r))), this.#o === 0 && (this.#t.before(n), this.#a = null, xe(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.#p(
        /** @type {Batch} */
        b
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#c = 0, this.#n = B(() => {
        this.#r(this.#t);
      }), this.#o > 0) {
        var t = this.#a = document.createDocumentFragment();
        Wt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = B(() => n(this.#t));
      } else
        this.#p(
          /** @type {Batch} */
          b
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
    Ft(t, this.#v, this.#d);
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
    var n = g, r = p, i = I;
    U(this.#i), O(this.#i), _e(this.#i.ctx);
    try {
      return te.ensure(), t();
    } catch (s) {
      return St(s), null;
    } finally {
      U(n), O(r), _e(i);
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
    this.#o += t, this.#o === 0 && (this.#p(n), this.#s && xe(this.#s, () => {
      this.#s = null;
    }), this.#a && (this.#t.before(this.#a), this.#a = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#c += t, !(!this.#u || this.#h) && (this.#h = !0, re(() => {
      this.#h = !1, this.#u && Me(this.#u, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), P(
      /** @type {Source<number>} */
      this.#u
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
    const o = () => {
      if (i) {
        kn();
        return;
      }
      i = !0, s && bn(), this.#l !== null && xe(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, a = (f) => {
      try {
        s = !0, n?.(f, o), s = !1;
      } catch (l) {
        Q(l, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return B(() => {
            var l = (
              /** @type {Effect} */
              g
            );
            l.b = this, l.f |= Ue, r(
              this.#t,
              () => f,
              () => o
            );
          });
        } catch (l) {
          return Q(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    re(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (l) {
        Q(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        a,
        /** @param {unknown} e */
        (l) => Q(l, this.#i && this.#i.parent)
      ) : a(f);
    });
  }
}
function $n(e, t, n, r) {
  const i = In;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), a = Pn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    a();
    try {
      r(c);
    } catch (_) {
      (o.f & z) === 0 && Q(_, o);
    }
    Ne();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var u = Ct();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ jn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => Q(c, o)).finally(() => u());
  }
  f ? f.then(() => {
    a(), d(), Ne();
  }) : d();
}
function Pn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = I, r = (
    /** @type {Batch} */
    b
  );
  return function(s = !0) {
    U(e), O(t), _e(n), s && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function Ne(e = !0) {
  U(null), O(null), _e(null), e && b?.deactivate();
}
function Ct() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    b
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function In(e) {
  var t = x | T, n = p !== null && (p.f & x) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= we), {
    ctx: I,
    deps: null,
    effects: null,
    equals: kt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      k
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function jn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && _n();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = $e(
    /** @type {V} */
    k
  ), o = !p, a = /* @__PURE__ */ new Map();
  return Jn(() => {
    var f = (
      /** @type {Effect} */
      g
    ), l = Et();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ne);
    } catch (_) {
      l.reject(_), Ne();
    }
    var u = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((f.f & fe) !== 0)
        var d = Ct();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        a.get(u)?.reject(V), a.delete(u);
      else {
        for (const _ of a.values())
          _.reject(V);
        a.clear();
      }
      a.set(u, l);
    }
    const c = (_, h = void 0) => {
      if (d) {
        var v = h === V;
        d(v);
      }
      if (!(h === V || (f.f & z) !== 0)) {
        if (u.activate(), h)
          s.f |= X, Me(s, h);
        else {
          (s.f & X) !== 0 && (s.f ^= X), Me(s, _);
          for (const [m, w] of a) {
            if (a.delete(m), m === u) break;
            w.reject(V);
          }
        }
        u.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Wn(() => {
    for (const f of a.values())
      f.reject(V);
  }), new Promise((f) => {
    function l(u) {
      function d() {
        u === i ? f(s) : l(i);
      }
      u.then(d, d);
    }
    l(i);
  });
}
function Ln(e) {
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
function zn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & x) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Qe(e) {
  var t, n = g;
  U(zn(e));
  try {
    e.f &= ~ae, Ln(e), t = Jt(e);
  } finally {
    U(n);
  }
  return t;
}
function Dt(e) {
  var t = e.v, n = Qe(e);
  if (!e.equals(n) && (e.wv = Kt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    y(e, E);
    return;
  }
  pe || (D !== null ? (et() || b?.is_fork) && D.set(e, n) : Ze(e));
}
function qn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = ue, t.ac = null, ke(t, 0), tt(t));
}
function $t(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ge(t);
}
let Ve = /* @__PURE__ */ new Set();
const ee = /* @__PURE__ */ new Map();
let Pt = !1;
function $e(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: kt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function j(e, t) {
  const n = $e(e);
  return rr(n), n;
}
function H(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!$ || (p.f & ot) !== 0) && Tt() && (p.f & (x | K | Ke | ot)) !== 0 && (M === null || !de.call(M, e)) && mn();
  let r = n ? me(t) : t;
  return Me(e, r, Fe);
}
function Me(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    pe ? ee.set(e, t) : ee.set(e, r), e.v = t;
    var i = te.ensure();
    if (i.capture(e, r), (e.f & x) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & T) !== 0 && Qe(s), D === null && Ze(s);
    }
    e.wv = Kt(), It(e, T, n), g !== null && (g.f & E) !== 0 && (g.f & (G | se)) === 0 && (R === null ? ir([e]) : R.push(e)), !i.is_fork && Ve.size > 0 && !Pt && Un();
  }
  return t;
}
function Un() {
  Pt = !1;
  for (const e of Ve)
    (e.f & E) !== 0 && y(e, q), Te(e) && ge(e);
  Ve.clear();
}
function Ee(e) {
  H(e, e.v + 1);
}
function It(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], a = o.f, f = (a & T) === 0;
      if (f && y(o, t), (a & x) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        D?.delete(l), (a & ae) === 0 && (a & N && (o.f |= ae), It(l, q, n));
      } else if (f) {
        var u = (
          /** @type {Effect} */
          o
        );
        (a & K) !== 0 && Y !== null && Y.add(u), n !== null ? n.push(u) : Je(u);
      }
    }
}
function me(e) {
  if (typeof e != "object" || e === null || je in e)
    return e;
  const t = un(e);
  if (t !== fn && t !== on)
    return e;
  var n = /* @__PURE__ */ new Map(), r = rn(e), i = /* @__PURE__ */ j(0), s = ie, o = (a) => {
    if (ie === s)
      return a();
    var f = p, l = ie;
    O(null), _t(s);
    var u = a();
    return O(f), _t(l), u;
  };
  return r && n.set("length", /* @__PURE__ */ j(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && gn();
        var u = n.get(f);
        return u === void 0 ? o(() => {
          var d = /* @__PURE__ */ j(l.value);
          return n.set(f, d), d;
        }) : H(u, l.value, !0), !0;
      },
      deleteProperty(a, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in a) {
            const u = o(() => /* @__PURE__ */ j(k));
            n.set(f, u), Ee(i);
          }
        } else
          H(l, k), Ee(i);
        return !0;
      },
      get(a, f, l) {
        if (f === je)
          return e;
        var u = n.get(f), d = f in a;
        if (u === void 0 && (!d || ye(a, f)?.writable) && (u = o(() => {
          var _ = me(d ? a[f] : k), h = /* @__PURE__ */ j(_);
          return h;
        }), n.set(f, u)), u !== void 0) {
          var c = P(u);
          return c === k ? void 0 : c;
        }
        return Reflect.get(a, f, l);
      },
      getOwnPropertyDescriptor(a, f) {
        var l = Reflect.getOwnPropertyDescriptor(a, f);
        if (l && "value" in l) {
          var u = n.get(f);
          u && (l.value = P(u));
        } else if (l === void 0) {
          var d = n.get(f), c = d?.v;
          if (d !== void 0 && c !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return l;
      },
      has(a, f) {
        if (f === je)
          return !0;
        var l = n.get(f), u = l !== void 0 && l.v !== k || Reflect.has(a, f);
        if (l !== void 0 || g !== null && (!u || ye(a, f)?.writable)) {
          l === void 0 && (l = o(() => {
            var c = u ? me(a[f]) : k, _ = /* @__PURE__ */ j(c);
            return _;
          }), n.set(f, l));
          var d = P(l);
          if (d === k)
            return !1;
        }
        return u;
      },
      set(a, f, l, u) {
        var d = n.get(f), c = f in a;
        if (r && f === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var h = n.get(_ + "");
            h !== void 0 ? H(h, k) : _ in a && (h = o(() => /* @__PURE__ */ j(k)), n.set(_ + "", h));
          }
        if (d === void 0)
          (!c || ye(a, f)?.writable) && (d = o(() => /* @__PURE__ */ j(void 0)), H(d, me(l)), n.set(f, d));
        else {
          c = d.v !== k;
          var v = o(() => me(l));
          H(d, v);
        }
        var m = Reflect.getOwnPropertyDescriptor(a, f);
        if (m?.set && m.set.call(u, l), !c) {
          if (r && typeof f == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), C = Number(f);
            Number.isInteger(C) && C >= w.v && H(w, C + 1);
          }
          Ee(i);
        }
        return !0;
      },
      ownKeys(a) {
        P(i);
        var f = Reflect.ownKeys(a).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== k;
        });
        for (var [l, u] of n)
          u.v !== k && !(l in a) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        wn();
      }
    }
  );
}
var ht, jt, Lt, zt;
function Yn() {
  if (ht === void 0) {
    ht = window, jt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Lt = ye(t, "firstChild").get, zt = ye(t, "nextSibling").get, at(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), at(n) && (n.__t = void 0);
  }
}
function Oe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  return (
    /** @type {TemplateNode | null} */
    Lt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Xe(e) {
  return (
    /** @type {TemplateNode | null} */
    zt.call(e)
  );
}
function ze(e, t) {
  return /* @__PURE__ */ qt(e);
}
function dt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Xe(r);
  return r;
}
function Bn() {
  return !1;
}
function Vn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(xn, e, void 0)
  );
}
function Pe(e) {
  var t = p, n = g;
  O(null), U(null);
  try {
    return e();
  } finally {
    O(t), U(n);
  }
}
function Hn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = g;
  n !== null && (n.f & L) !== 0 && (e |= L);
  var r = {
    ctx: I,
    deps: null,
    nodes: null,
    f: e | T | N,
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
  if ((e & ve) !== 0)
    he !== null ? he.push(r) : te.ensure().schedule(r);
  else if (t !== null) {
    try {
      ge(r);
    } catch (o) {
      throw F(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & we) === 0 && (i = i.first, (e & K) !== 0 && (e & le) !== 0 && i !== null && (i.f |= le));
  }
  if (i !== null && (i.parent = n, n !== null && Hn(i, n), p !== null && (p.f & x) !== 0 && (e & se) === 0)) {
    var s = (
      /** @type {Derived} */
      p
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function et() {
  return p !== null && !$;
}
function Wn(e) {
  const t = Z(De, null);
  return y(t, E), t.teardown = e, t;
}
function Gn(e) {
  return Z(ve | vn, e);
}
function Kn(e) {
  te.ensure();
  const t = Z(se | we, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      F(t), r(void 0);
    }) : (F(t), r(void 0));
  });
}
function Zn(e) {
  return Z(ve, e);
}
function Jn(e) {
  return Z(Ke | we, e);
}
function Qn(e, t = 0) {
  return Z(De | t, e);
}
function Xn(e, t = [], n = [], r = []) {
  $n(r, t, n, (i) => {
    Z(De, () => e(...i.map(P)));
  });
}
function Ut(e, t = 0) {
  var n = Z(K | t, e);
  return n;
}
function B(e) {
  return Z(G | we, e);
}
function Yt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = pe, r = p;
    vt(!0), O(null);
    try {
      t.call(null);
    } finally {
      vt(n), O(r);
    }
  }
}
function tt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Pe(() => {
      i.abort(V);
    });
    var r = n.next;
    (n.f & se) !== 0 ? n.parent = null : F(n, t), n = r;
  }
}
function er(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && F(t), t = n;
  }
}
function F(e, t = !0) {
  var n = !1;
  (t || (e.f & dn) !== 0) && e.nodes !== null && e.nodes.end !== null && (tr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, ft), tt(e, t && !n), ke(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Yt(e), e.f ^= ft, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Bt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function tr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Xe(e);
    e.remove(), e = n;
  }
}
function Bt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Vt(e, r, !0);
  var i = () => {
    n && F(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var a of r)
      a.out(o);
  } else
    i();
}
function Vt(e, t, n) {
  if ((e.f & L) === 0) {
    e.f ^= L;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & le) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & K) !== 0;
      Vt(i, t, o ? n : !1), i = s;
    }
  }
}
function nr(e) {
  Ht(e, !0);
}
function Ht(e, t) {
  if ((e.f & L) !== 0) {
    e.f ^= L, (e.f & E) === 0 && (y(e, T), te.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & le) !== 0 || (n.f & G) !== 0;
      Ht(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || t) && o.in();
  }
}
function Wt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Xe(n);
      t.append(n), n = i;
    }
}
let Re = !1, pe = !1;
function vt(e) {
  pe = e;
}
let p = null, $ = !1;
function O(e) {
  p = e;
}
let g = null;
function U(e) {
  g = e;
}
let M = null;
function rr(e) {
  p !== null && (M === null ? M = [e] : M.push(e));
}
let S = null, A = 0, R = null;
function ir(e) {
  R = e;
}
let Gt = 1, ne = 0, ie = ne;
function _t(e) {
  ie = e;
}
function Kt() {
  return ++Gt;
}
function Te(e) {
  var t = e.f;
  if ((t & T) !== 0)
    return !0;
  if (t & x && (e.f &= ~ae), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Te(
        /** @type {Derived} */
        s
      ) && Dt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    D === null && y(e, E);
  }
  return !1;
}
function Zt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && de.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & x) !== 0 ? Zt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, T) : (s.f & E) !== 0 && y(s, q), Je(
        /** @type {Effect} */
        s
      ));
    }
}
function Jt(e) {
  var t = S, n = A, r = R, i = p, s = M, o = I, a = $, f = ie, l = e.f;
  S = /** @type {null | Value[]} */
  null, A = 0, R = null, p = (l & (G | se)) === 0 ? e : null, M = null, _e(e.ctx), $ = !1, ie = ++ne, e.ac !== null && (Pe(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Ye;
    var u = (
      /** @type {Function} */
      e.fn
    ), d = u();
    e.f |= fe;
    var c = e.deps, _ = b?.is_fork;
    if (S !== null) {
      var h;
      if (_ || ke(e, A), c !== null && A > 0)
        for (c.length = A + S.length, h = 0; h < S.length; h++)
          c[A + h] = S[h];
      else
        e.deps = c = S;
      if (et() && (e.f & N) !== 0)
        for (h = A; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !_ && c !== null && A < c.length && (ke(e, A), c.length = A);
    if (Tt() && R !== null && !$ && c !== null && (e.f & (x | q | T)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      R.length; h++)
        Zt(
          R[h],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ne++, i.deps !== null)
        for (let v = 0; v < n; v += 1)
          i.deps[v].rv = ne;
      if (t !== null)
        for (const v of t)
          v.rv = ne;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & X) !== 0 && (e.f ^= X), d;
  } catch (v) {
    return St(v);
  } finally {
    e.f ^= Ye, S = t, A = n, R = r, p = i, M = s, _e(o), $ = a, ie = f;
  }
}
function sr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = sn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & x) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !de.call(S, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ae), Ze(s), qn(s), ke(s, 0);
  }
}
function ke(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      sr(e, n[r]);
}
function ge(e) {
  var t = e.f;
  if ((t & z) === 0) {
    y(e, E);
    var n = g, r = Re;
    g = e, Re = !0;
    try {
      (t & (K | xt)) !== 0 ? er(e) : tt(e), Yt(e);
      var i = Jt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Gt;
      var s;
    } finally {
      Re = r, g = n;
    }
  }
}
function P(e) {
  var t = e.f, n = (t & x) !== 0;
  if (p !== null && !$) {
    var r = g !== null && (g.f & z) !== 0;
    if (!r && (M === null || !de.call(M, e))) {
      var i = p.deps;
      if ((p.f & Ye) !== 0)
        e.rv < ne && (e.rv = ne, S === null && i !== null && i[A] === e ? A++ : S === null ? S = [e] : S.push(e));
      else {
        (p.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [p] : de.call(s, p) || s.push(p);
      }
    }
  }
  if (pe && ee.has(e))
    return ee.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (pe) {
      var a = o.v;
      return ((o.f & E) === 0 && o.reactions !== null || Xt(o)) && (a = Qe(o)), ee.set(o, a), a;
    }
    var f = (o.f & N) === 0 && !$ && p !== null && (Re || (p.f & N) !== 0), l = (o.f & fe) === 0;
    Te(o) && (f && (o.f |= N), Dt(o)), f && !l && ($t(o), Qt(o));
  }
  if (D?.has(e))
    return D.get(e);
  if ((e.f & X) !== 0)
    throw e.v;
  return e.v;
}
function Qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & x) !== 0 && (t.f & N) === 0 && ($t(
        /** @type {Derived} */
        t
      ), Qt(
        /** @type {Derived} */
        t
      ));
}
function Xt(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ee.has(t) || (t.f & x) !== 0 && Xt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function en(e) {
  var t = $;
  try {
    return $ = !0, e();
  } finally {
    $ = t;
  }
}
const pt = globalThis.Deno?.core?.ops ?? null;
function lr(e, ...t) {
  pt?.[e] ? pt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function ar(e, t) {
  lr("op_set_text", e, t);
}
const fr = ["touchstart", "touchmove"];
function or(e) {
  return fr.includes(e);
}
const be = Symbol("events"), tn = /* @__PURE__ */ new Set(), He = /* @__PURE__ */ new Set();
function gt(e, t, n) {
  (t[be] ??= {})[e] = n;
}
function ur(e) {
  for (var t = 0; t < e.length; t++)
    tn.add(e[t]);
  for (var n of He)
    n(e);
}
let wt = null;
function mt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  wt = e;
  var o = 0, a = wt === e && e[be];
  if (a) {
    var f = i.indexOf(a);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[be] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (o = f);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var u = p, d = g;
    O(null), U(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var v = s[be]?.[r];
          v != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && v.call(s, e);
        } catch (m) {
          c ? _.push(m) : c = m;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let m of _)
          queueMicrotask(() => {
            throw m;
          });
        throw c;
      }
    } finally {
      e[be] = t, delete e.currentTarget, O(u), U(d);
    }
  }
}
const cr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function hr(e) {
  return (
    /** @type {string} */
    cr?.createHTML(e) ?? e
  );
}
function dr(e) {
  var t = Vn("template");
  return t.innerHTML = hr(e.replaceAll("<!>", "<!---->")), t.content;
}
function vr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function nt(e, t) {
  var n = (t & En) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = dr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ qt(r));
    var s = (
      /** @type {TemplateNode} */
      n || jt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return vr(s, s), s;
  };
}
function qe(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
let We = !0;
function _r(e, t) {
  return pr(e, t);
}
const Ae = /* @__PURE__ */ new Map();
function pr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: a }) {
  Yn();
  var f = void 0, l = Kn(() => {
    var u = n ?? t.appendChild(Oe());
    Cn(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (_) => {
        Tn({});
        var h = (
          /** @type {ComponentContext} */
          I
        );
        s && (h.c = s), i && (r.$$events = i), We = o, f = e(_, r) || {}, We = !0, Sn();
      },
      a
    );
    var d = /* @__PURE__ */ new Set(), c = (_) => {
      for (var h = 0; h < _.length; h++) {
        var v = _[h];
        if (!d.has(v)) {
          d.add(v);
          var m = or(v);
          for (const oe of [t, document]) {
            var w = Ae.get(oe);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Ae.set(oe, w));
            var C = w.get(v);
            C === void 0 ? (oe.addEventListener(v, mt, { passive: m }), w.set(v, 1)) : w.set(v, C + 1);
          }
        }
      }
    };
    return c(ln(tn)), He.add(c), () => {
      for (var _ of d)
        for (const m of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Ae.get(m)
          ), v = (
            /** @type {number} */
            h.get(_)
          );
          --v == 0 ? (m.removeEventListener(_, mt), h.delete(_), h.size === 0 && Ae.delete(m)) : h.set(_, v);
        }
      He.delete(c), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return gr.set(f, l), f;
}
let gr = /* @__PURE__ */ new WeakMap();
class wr {
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
  #f = /* @__PURE__ */ new Map();
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
      ), r = this.#f.get(n);
      if (r)
        nr(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#f.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, o] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const a = this.#e.get(o);
        a && (F(a.effect), this.#e.delete(o));
      }
      for (const [s, o] of this.#f) {
        if (s === n || this.#r.has(s)) continue;
        const a = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var l = document.createDocumentFragment();
            Wt(o, l), l.append(Oe()), this.#e.set(s, { effect: o, fragment: l });
          } else
            F(o);
          this.#r.delete(s), this.#f.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), xe(o, a, !1)) : a();
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
      b
    ), i = Bn();
    if (n && !this.#f.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), o = Oe();
        s.append(o), this.#e.set(t, {
          effect: B(() => n(o)),
          fragment: s
        });
      } else
        this.#f.set(
          t,
          B(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [a, f] of this.#f)
        a === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [a, f] of this.#e)
        a === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function mr(e, t, n = !1) {
  var r = new wr(e), i = n ? le : 0;
  function s(o, a) {
    r.ensure(o, a);
  }
  Ut(() => {
    var o = !1;
    t((a, f = 0) => {
      o = !0, s(f, a);
    }), o || s(-1, null);
  }, i);
}
const br = () => performance.now(), W = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (e) => requestAnimationFrame(e)
  ),
  now: () => br(),
  tasks: /* @__PURE__ */ new Set()
};
function nn() {
  const e = W.now();
  W.tasks.forEach((t) => {
    t.c(e) || (W.tasks.delete(t), t.f());
  }), W.tasks.size !== 0 && W.tick(nn);
}
function yr(e) {
  let t;
  return W.tasks.size === 0 && W.tick(nn), {
    promise: new Promise((n) => {
      W.tasks.add(t = { c: e, f: n });
    }),
    abort() {
      W.tasks.delete(t);
    }
  };
}
function Ce(e, t) {
  Pe(() => {
    e.dispatchEvent(new CustomEvent(t));
  });
}
function Er(e) {
  if (e === "float") return "cssFloat";
  if (e === "offset") return "cssOffset";
  if (e.startsWith("--")) return e;
  const t = e.split("-");
  return t.length === 1 ? t[0] : t[0] + t.slice(1).map(
    /** @param {any} word */
    (n) => n[0].toUpperCase() + n.slice(1)
  ).join("");
}
function bt(e) {
  const t = {}, n = e.split(";");
  for (const r of n) {
    const [i, s] = r.split(":");
    if (!i || s === void 0) break;
    const o = Er(i.trim());
    t[o] = s.trim();
  }
  return t;
}
const xr = (e) => e;
function yt(e, t, n, r) {
  var i = (e & yn) !== 0, s = "both", o, a = t.inert, f = t.style.overflow, l, u;
  function d() {
    return Pe(() => o ??= n()(t, r?.() ?? /** @type {P} */
    {}, {
      direction: s
    }));
  }
  var c = {
    is_global: i,
    in() {
      t.inert = a, l = Ge(t, d(), u, 1, () => {
        Ce(t, "introend"), l?.abort(), l = o = void 0, t.style.overflow = f;
      });
    },
    out(m) {
      t.inert = !0, u = Ge(t, d(), l, 0, () => {
        Ce(t, "outroend"), m?.();
      });
    },
    stop: () => {
      l?.abort(), u?.abort();
    }
  }, _ = (
    /** @type {Effect & { nodes: EffectNodes }} */
    g
  );
  if ((_.nodes.t ??= []).push(c), We) {
    var h = i;
    if (!h) {
      for (var v = (
        /** @type {Effect | null} */
        _.parent
      ); v && (v.f & le) !== 0; )
        for (; (v = v.parent) && (v.f & K) === 0; )
          ;
      h = !v || (v.f & fe) !== 0;
    }
    h && Zn(() => {
      en(() => c.in());
    });
  }
}
function Ge(e, t, n, r, i) {
  var s = r === 1;
  if (cn(t)) {
    var o, a = !1;
    return re(() => {
      if (!a) {
        var m = t({ direction: s ? "in" : "out" });
        o = Ge(e, m, n, r, i);
      }
    }), {
      abort: () => {
        a = !0, o?.abort();
      },
      deactivate: () => o.deactivate(),
      reset: () => o.reset(),
      t: () => o.t()
    };
  }
  if (n?.deactivate(), !t?.duration && !t?.delay)
    return Ce(e, s ? "introstart" : "outrostart"), i(), {
      abort: ue,
      deactivate: ue,
      reset: ue,
      t: () => r
    };
  const { delay: f = 0, css: l, tick: u, easing: d = xr } = t;
  var c = [];
  if (s && n === void 0 && (u && u(0, 1), l)) {
    var _ = bt(l(0, 1));
    c.push(_, _);
  }
  var h = () => 1 - r, v = e.animate(c, { duration: f, fill: "forwards" });
  return v.onfinish = () => {
    v.cancel(), Ce(e, s ? "introstart" : "outrostart");
    var m = n?.t() ?? 1 - r;
    n?.abort();
    var w = r - m, C = (
      /** @type {number} */
      t.duration * Math.abs(w)
    ), oe = [];
    if (C > 0) {
      var rt = !1;
      if (l)
        for (var it = Math.ceil(C / 16.666666666666668), Ie = 0; Ie <= it; Ie += 1) {
          var st = m + w * d(Ie / it), lt = bt(l(st, 1 - st));
          oe.push(lt), rt ||= lt.overflow === "hidden";
        }
      rt && (e.style.overflow = "hidden"), h = () => {
        var Se = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          v.currentTime
        );
        return m + w * d(Se / C);
      }, u && yr(() => {
        if (v.playState !== "running") return !1;
        var Se = h();
        return u(Se, 1 - Se), !0;
      });
    }
    v = e.animate(oe, { duration: C, fill: "forwards" }), v.onfinish = () => {
      h = () => r, u?.(r, 1 - r), i();
    };
  }, {
    abort: () => {
      v && (v.cancel(), v.effect = null, v.onfinish = ue);
    },
    deactivate: () => {
      i = ue;
    },
    reset: () => {
      r === 0 && u?.(1, 0);
    },
    t: () => h()
  };
}
const kr = (e) => e;
function Tr(e) {
  const t = e - 1;
  return t * t * t + 1;
}
function Sr(e, { delay: t = 0, duration: n = 400, easing: r = kr } = {}) {
  const i = +getComputedStyle(e).opacity;
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (s) => `opacity: ${s * i}`
  };
}
function Ar(e, { delay: t = 0, duration: n = 400, easing: r = Tr, axis: i = "y" } = {}) {
  const s = getComputedStyle(e), o = +s.opacity, a = i === "y" ? "height" : "width", f = parseFloat(s[a]), l = i === "y" ? ["top", "bottom"] : ["left", "right"], u = l.map(
    (w) => (
      /** @type {'Left' | 'Right' | 'Top' | 'Bottom'} */
      `${w[0].toUpperCase()}${w.slice(1)}`
    )
  ), d = parseFloat(s[`padding${u[0]}`]), c = parseFloat(s[`padding${u[1]}`]), _ = parseFloat(s[`margin${u[0]}`]), h = parseFloat(s[`margin${u[1]}`]), v = parseFloat(
    s[`border${u[0]}Width`]
  ), m = parseFloat(
    s[`border${u[1]}Width`]
  );
  return {
    delay: t,
    duration: n,
    easing: r,
    css: (w) => `overflow: hidden;opacity: ${Math.min(w * 20, 1) * o};${a}: ${w * f}px;padding-${l[0]}: ${w * d}px;padding-${l[1]}: ${w * c}px;margin-${l[0]}: ${w * _}px;margin-${l[1]}: ${w * h}px;border-${l[0]}-width: ${w * v}px;border-${l[1]}-width: ${w * m}px;min-${a}: 0`
  };
}
var Fr = /* @__PURE__ */ nt("<div><span> </span></div>"), Rr = /* @__PURE__ */ nt("<div><span>Hidden</span></div>"), Nr = /* @__PURE__ */ nt("<div><button>Toggle</button> <button>Inc</button> <!></div>");
function Mr(e) {
  let t = /* @__PURE__ */ j(!0), n = /* @__PURE__ */ j(0);
  var r = Nr(), i = ze(r), s = dt(i, 2), o = dt(s, 2);
  {
    var a = (l) => {
      var u = Fr(), d = ze(u), c = ze(d);
      Xn(() => ar(c, `Visible: ${P(n) ?? ""}`)), yt(3, u, () => Sr), qe(l, u);
    }, f = (l) => {
      var u = Rr();
      yt(3, u, () => Ar), qe(l, u);
    };
    mr(o, (l) => {
      P(t) ? l(a) : l(f, -1);
    });
  }
  gt("click", i, () => {
    H(t, !P(t));
  }), gt("click", s, () => {
    H(n, P(n) + 1);
  }), qe(e, r);
}
ur(["click"]);
function Cr(e) {
  return _r(Mr, { target: e });
}
export {
  Cr as default,
  Cr as rvst_mount
};

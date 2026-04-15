var kt = Array.isArray, vn = Array.prototype.indexOf, we = Array.prototype.includes, Ve = Array.from, hn = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, dn = Object.prototype, _n = Array.prototype, pn = Object.getPrototypeOf, ft = Object.isExtensible;
const gn = () => {
};
function wn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Tt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const k = 2, Fe = 4, Ye = 8, St = 1 << 24, le = 16, U = 32, oe = 64, We = 128, D = 512, x = 1024, R = 2048, $ = 4096, M = 8192, j = 16384, xe = 32768, ut = 1 << 25, Me = 65536, ot = 1 << 17, mn = 1 << 18, ke = 1 << 19, bn = 1 << 20, X = 1 << 25, ae = 65536, Xe = 1 << 21, et = 1 << 22, te = 1 << 23, Ce = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function yn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function En(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function xn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function kn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Tn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Sn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function An() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Rn = 1, Cn = 2, Nn = 16, Fn = 2, T = Symbol(), Mn = "http://www.w3.org/1999/xhtml";
function On() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function At(e) {
  return e === this.v;
}
function Dn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Rt(e) {
  return !Dn(e, this.v);
}
let V = null;
function me(e) {
  V = e;
}
function Pn(e, t = !1, n) {
  V = {
    p: V,
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
function In(e) {
  var t = (
    /** @type {ComponentContext} */
    V
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      ur(r);
  }
  return t.i = !0, V = t.p, /** @type {T} */
  {};
}
function Ct() {
  return !0;
}
let de = [];
function Ln() {
  var e = de;
  de = [], wn(e);
}
function ne(e) {
  if (de.length === 0) {
    var t = de;
    queueMicrotask(() => {
      t === de && Ln();
    });
  }
  de.push(e);
}
function Nt(e) {
  var t = g;
  if (t === null)
    return p.f |= te, e;
  if ((t.f & xe) === 0 && (t.f & Fe) === 0)
    throw e;
  ee(e, t);
}
function ee(e, t) {
  for (; t !== null; ) {
    if ((t.f & We) !== 0) {
      if ((t.f & xe) === 0)
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
const qn = -7169;
function E(e, t) {
  e.f = e.f & qn | t;
}
function tt(e) {
  (e.f & D) !== 0 || e.deps === null ? E(e, x) : E(e, $);
}
function Ft(e) {
  if (e !== null)
    for (const t of e)
      (t.f & k) === 0 || (t.f & ae) === 0 || (t.f ^= ae, Ft(
        /** @type {Derived} */
        t.deps
      ));
}
function Mt(e, t, n) {
  (e.f & R) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), Ft(e.deps), E(e, x);
}
const Z = /* @__PURE__ */ new Set();
let b = null, q = null, Ze = null, $e = !1, _e = null, qe = null;
var at = 0;
let zn = 1;
class ie {
  id = zn++;
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
  #a = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #d() {
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
        E(r, R), this.schedule(r);
      for (r of n.m)
        E(r, $), this.schedule(r);
    }
  }
  #v() {
    if (at++ > 1e3 && (Z.delete(this), jn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), E(f, R), this.schedule(f);
      for (const f of this.#n)
        E(f, $), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = _e = [], r = [], i = qe = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (s) {
        throw It(f), s;
      }
    if (b = null, i.length > 0) {
      var l = ie.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (_e = null, qe = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [f, s] of this.#l)
        Pt(f, s);
    } else {
      this.#r.size === 0 && Z.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), ct(r), ct(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((s) => !f.#e.includes(s)));
    }
    o !== null && (Z.add(o), o.#v()), Z.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & (U | oe)) !== 0, f = o && (l & x) !== 0, s = f || (l & M) !== 0 || this.#l.has(i);
      if (!s && i.fn !== null) {
        o ? i.f ^= x : (l & Fe) !== 0 ? n.push(i) : De(i) && ((l & le) !== 0 && this.#n.add(i), Ee(i));
        var u = i.first;
        if (u !== null) {
          i = u;
          continue;
        }
      }
      for (; i !== null; ) {
        var c = i.next;
        if (c !== null) {
          i = c;
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
      Mt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== T && !this.previous.has(t) && this.previous.set(t, n), (t.f & te) === 0 && (this.current.set(t, [t.v, r]), q?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, q = null;
  }
  flush() {
    try {
      $e = !0, b = this, this.#v();
    } finally {
      at = 0, Ze = null, _e = null, qe = null, $e = !1, b = null, q = null, re.clear();
    }
  }
  discard() {
    for (const t of this.#h) t(this);
    this.#h.clear(), Z.delete(this);
  }
  #w() {
    for (const u of Z) {
      var t = u.id < this.id, n = [];
      for (const [c, [h, v]] of this.current) {
        if (u.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(c)[0]
          );
          if (t && h !== r)
            u.current.set(c, [h, v]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...u.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && u.discard();
      else if (n.length > 0) {
        u.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of n)
          Ot(f, i, l, o);
        if (u.#e.length > 0) {
          u.apply();
          for (var s of u.#e)
            u.#o(s, [], []);
          u.#e = [];
        }
        u.deactivate();
      }
    }
    for (const u of Z)
      u.#u.has(this) && (u.#u.delete(this), u.#u.size === 0 && !u.#c() && (u.activate(), u.#v()));
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
    this.#a || r || (this.#a = !0, ne(() => {
      this.#a = !1, this.flush();
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
    return (this.#i ??= Tt()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new ie();
      $e || (Z.add(b), ne(() => {
        b === t && t.flush();
      }));
    }
    return b;
  }
  apply() {
    {
      q = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ze = t, t.b?.is_pending && (t.f & (Fe | Ye | St)) !== 0 && (t.f & xe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === g && (p === null || (p.f & k) === 0))
        return;
      if ((r & (oe | U)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function jn() {
  try {
    xn();
  } catch (e) {
    ee(e, Ze);
  }
}
let K = null;
function ct(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | M)) === 0 && De(r) && (K = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Zt(r), K?.size > 0)) {
        re.clear();
        for (const i of K) {
          if ((i.f & (j | M)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            K.has(o) && (K.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const s = l[f];
            (s.f & (j | M)) === 0 && Ee(s);
          }
        }
        K.clear();
      }
    }
    K = null;
  }
}
function Ot(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & k) !== 0 ? Ot(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (et | le)) !== 0 && (l & R) === 0 && Dt(i, t, r) && (E(i, R), nt(
        /** @type {Effect} */
        i
      ));
    }
}
function Dt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (we.call(t, i))
        return !0;
      if ((i.f & k) !== 0 && Dt(
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
function nt(e) {
  b.schedule(e);
}
function Pt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & R) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Pt(n, t), n = n.next;
  }
}
function It(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    It(t), t = t.next;
}
function Hn(e) {
  let t = 0, n = ce(0), r;
  return () => {
    lt() && (A(n), Kt(() => (t === 0 && (r = pr(() => e(() => Ne(n)))), t += 1, () => {
      ne(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ne(n));
      });
    })));
  };
}
var Vn = Me | ke;
function Yn(e, t, n, r) {
  new Un(e, t, n, r);
}
class Un {
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
  #a = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #_ = Hn(() => (this.#o = ce(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var o = (
        /** @type {Effect} */
        g
      );
      o.b = this, o.f |= We, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Wt(() => {
      this.#m();
    }, Vn);
  }
  #w() {
    try {
      this.#e = Y(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = Y(() => {
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
    t && (this.is_pending = !0, this.#t = Y(() => t(this.#s)), ne(() => {
      var n = this.#l = document.createDocumentFragment(), r = He();
      n.append(r), this.#e = this.#g(() => Y(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, ge(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        b
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = Y(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        tn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Y(() => n(this.#s));
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Mt(t, this.#d, this.#v);
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
    var n = g, r = p, i = V;
    B(this.#i), I(this.#i), me(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (l) {
      return Nt(l), null;
    } finally {
      B(n), I(r), me(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && ge(this.#t, () => {
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
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, ne(() => {
      this.#c = !1, this.#o && be(this.#o, this.#a);
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
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && (H(this.#e), this.#e = null), this.#t && (H(this.#t), this.#t = null), this.#n && (H(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        On();
        return;
      }
      i = !0, l && An(), this.#n !== null && ge(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (s) => {
      try {
        l = !0, n?.(s, o), l = !1;
      } catch (u) {
        ee(u, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Y(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= We, r(
              this.#s,
              () => s,
              () => o
            );
          });
        } catch (u) {
          return ee(
            u,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ne(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (u) {
        ee(u, this.#i && this.#i.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        f,
        /** @param {unknown} e */
        (u) => ee(u, this.#i && this.#i.parent)
      ) : f(s);
    });
  }
}
function $n(e, t, n, r) {
  const i = qt;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = Bn(), s = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function u(v) {
    f();
    try {
      r(v);
    } catch (d) {
      (o.f & j) === 0 && ee(d, o);
    }
    je();
  }
  if (n.length === 0) {
    s.then(() => u(t.map(i)));
    return;
  }
  var c = Lt();
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ Gn(v))).then((v) => u([...t.map(i), ...v])).catch((v) => ee(v, o)).finally(() => c());
  }
  s ? s.then(() => {
    f(), h(), je();
  }) : h();
}
function Bn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = V, r = (
    /** @type {Batch} */
    b
  );
  return function(l = !0) {
    B(e), I(t), me(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function je(e = !0) {
  B(null), I(null), me(null), e && b?.deactivate();
}
function Lt() {
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
function qt(e) {
  var t = k | R, n = p !== null && (p.f & k) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= ke), {
    ctx: V,
    deps: null,
    effects: null,
    equals: At,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      T
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && yn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = ce(
    /** @type {V} */
    T
  ), o = !p, f = /* @__PURE__ */ new Map();
  return ar(() => {
    var s = (
      /** @type {Effect} */
      g
    ), u = Tt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(je);
    } catch (d) {
      u.reject(d), je();
    }
    var c = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((s.f & xe) !== 0)
        var h = Lt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(W), f.delete(c);
      else {
        for (const d of f.values())
          d.reject(W);
        f.clear();
      }
      f.set(c, u);
    }
    const v = (d, a = void 0) => {
      if (h) {
        var _ = a === W;
        h(_);
      }
      if (!(a === W || (s.f & j) !== 0)) {
        if (c.activate(), a)
          l.f |= te, be(l, a);
        else {
          (l.f & te) !== 0 && (l.f ^= te), be(l, d);
          for (const [m, w] of f) {
            if (f.delete(m), m === c) break;
            w.reject(W);
          }
        }
        c.deactivate();
      }
    };
    u.promise.then(v, (d) => v(null, d || "unknown"));
  }), Gt(() => {
    for (const s of f.values())
      s.reject(W);
  }), new Promise((s) => {
    function u(c) {
      function h() {
        c === i ? s(l) : u(i);
      }
      c.then(h, h);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Kn(e) {
  const t = /* @__PURE__ */ qt(e);
  return t.equals = Rt, t;
}
function Wn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      H(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Xn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & k) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function rt(e) {
  var t, n = g;
  B(Xn(e));
  try {
    e.f &= ~ae, Wn(e), t = sn(e);
  } finally {
    B(n);
  }
  return t;
}
function zt(e) {
  var t = e.v, n = rt(e);
  if (!e.equals(n) && (e.wv = rn(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (q !== null ? (lt() || b?.is_fork) && q.set(e, n) : tt(e));
}
function Zn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = gn, t.ac = null, Oe(t, 0), st(t));
}
function jt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let Je = /* @__PURE__ */ new Set();
const re = /* @__PURE__ */ new Map();
let Ht = !1;
function ce(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: At,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const n = ce(e);
  return hr(n), n;
}
// @__NO_SIDE_EFFECTS__
function Jn(e, t = !1, n = !0) {
  const r = ce(e);
  return t || (r.equals = Rt), r;
}
function Q(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!z || (p.f & ot) !== 0) && Ct() && (p.f & (k | le | et | ot)) !== 0 && (P === null || !we.call(P, e)) && Sn();
  let r = n ? pe(t) : t;
  return be(e, r, qe);
}
function be(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ye ? re.set(e, t) : re.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & k) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & R) !== 0 && rt(l), q === null && tt(l);
    }
    e.wv = rn(), Vt(e, R, n), g !== null && (g.f & x) !== 0 && (g.f & (U | oe)) === 0 && (O === null ? dr([e]) : O.push(e)), !i.is_fork && Je.size > 0 && !Ht && Qn();
  }
  return t;
}
function Qn() {
  Ht = !1;
  for (const e of Je)
    (e.f & x) !== 0 && E(e, $), De(e) && Ee(e);
  Je.clear();
}
function Ne(e) {
  Q(e, e.v + 1);
}
function Vt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, s = (f & R) === 0;
      if (s && E(o, t), (f & k) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        q?.delete(u), (f & ae) === 0 && (f & D && (o.f |= ae), Vt(u, $, n));
      } else if (s) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & le) !== 0 && K !== null && K.add(c), n !== null ? n.push(c) : nt(c);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = pn(e);
  if (t !== dn && t !== _n)
    return e;
  var n = /* @__PURE__ */ new Map(), r = kt(e), i = /* @__PURE__ */ G(0), l = ue, o = (f) => {
    if (ue === l)
      return f();
    var s = p, u = ue;
    I(null), gt(l);
    var c = f();
    return I(s), gt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && kn();
        var c = n.get(s);
        return c === void 0 ? o(() => {
          var h = /* @__PURE__ */ G(u.value);
          return n.set(s, h), h;
        }) : Q(c, u.value, !0), !0;
      },
      deleteProperty(f, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in f) {
            const c = o(() => /* @__PURE__ */ G(T));
            n.set(s, c), Ne(i);
          }
        } else
          Q(u, T), Ne(i);
        return !0;
      },
      get(f, s, u) {
        if (s === Ce)
          return e;
        var c = n.get(s), h = s in f;
        if (c === void 0 && (!h || Re(f, s)?.writable) && (c = o(() => {
          var d = pe(h ? f[s] : T), a = /* @__PURE__ */ G(d);
          return a;
        }), n.set(s, c)), c !== void 0) {
          var v = A(c);
          return v === T ? void 0 : v;
        }
        return Reflect.get(f, s, u);
      },
      getOwnPropertyDescriptor(f, s) {
        var u = Reflect.getOwnPropertyDescriptor(f, s);
        if (u && "value" in u) {
          var c = n.get(s);
          c && (u.value = A(c));
        } else if (u === void 0) {
          var h = n.get(s), v = h?.v;
          if (h !== void 0 && v !== T)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return u;
      },
      has(f, s) {
        if (s === Ce)
          return !0;
        var u = n.get(s), c = u !== void 0 && u.v !== T || Reflect.has(f, s);
        if (u !== void 0 || g !== null && (!c || Re(f, s)?.writable)) {
          u === void 0 && (u = o(() => {
            var v = c ? pe(f[s]) : T, d = /* @__PURE__ */ G(v);
            return d;
          }), n.set(s, u));
          var h = A(u);
          if (h === T)
            return !1;
        }
        return c;
      },
      set(f, s, u, c) {
        var h = n.get(s), v = s in f;
        if (r && s === "length")
          for (var d = u; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? Q(a, T) : d in f && (a = o(() => /* @__PURE__ */ G(T)), n.set(d + "", a));
          }
        if (h === void 0)
          (!v || Re(f, s)?.writable) && (h = o(() => /* @__PURE__ */ G(void 0)), Q(h, pe(u)), n.set(s, h));
        else {
          v = h.v !== T;
          var _ = o(() => pe(u));
          Q(h, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(f, s);
        if (m?.set && m.set.call(c, u), !v) {
          if (r && typeof s == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(s);
            Number.isInteger(y) && y >= w.v && Q(w, y + 1);
          }
          Ne(i);
        }
        return !0;
      },
      ownKeys(f) {
        A(i);
        var s = Reflect.ownKeys(f).filter((h) => {
          var v = n.get(h);
          return v === void 0 || v.v !== T;
        });
        for (var [u, c] of n)
          c.v !== T && !(u in f) && s.push(u);
        return s;
      },
      setPrototypeOf() {
        Tn();
      }
    }
  );
}
function vt(e) {
  try {
    if (e !== null && typeof e == "object" && Ce in e)
      return e[Ce];
  } catch {
  }
  return e;
}
function er(e, t) {
  return Object.is(vt(e), vt(t));
}
var ht, Yt, Ut, $t;
function tr() {
  if (ht === void 0) {
    ht = window, Yt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ut = Re(t, "firstChild").get, $t = Re(t, "nextSibling").get, ft(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ft(n) && (n.__t = void 0);
  }
}
function He(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ut.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    $t.call(e)
  );
}
function Pe(e, t) {
  return /* @__PURE__ */ Bt(e);
}
function Be(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
  return r;
}
function nr(e) {
  e.textContent = "";
}
function rr() {
  return !1;
}
function ir(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Mn, e, void 0)
  );
}
let dt = !1;
function lr() {
  dt || (dt = !0, document.addEventListener(
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
function it(e) {
  var t = p, n = g;
  I(null), B(null);
  try {
    return e();
  } finally {
    I(t), B(n);
  }
}
function sr(e, t, n, r = n) {
  e.addEventListener(t, () => it(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), lr();
}
function fr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function se(e, t) {
  var n = g;
  n !== null && (n.f & M) !== 0 && (e |= M);
  var r = {
    ctx: V,
    deps: null,
    nodes: null,
    f: e | R | D,
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
  if ((e & Fe) !== 0)
    _e !== null ? _e.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw H(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ke) === 0 && (i = i.first, (e & le) !== 0 && (e & Me) !== 0 && i !== null && (i.f |= Me));
  }
  if (i !== null && (i.parent = n, n !== null && fr(i, n), p !== null && (p.f & k) !== 0 && (e & oe) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function lt() {
  return p !== null && !z;
}
function Gt(e) {
  const t = se(Ye, null);
  return E(t, x), t.teardown = e, t;
}
function ur(e) {
  return se(Fe | bn, e);
}
function or(e) {
  ie.ensure();
  const t = se(oe | ke, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      H(t), r(void 0);
    }) : (H(t), r(void 0));
  });
}
function ar(e) {
  return se(et | ke, e);
}
function Kt(e, t = 0) {
  return se(Ye | t, e);
}
function _t(e, t = [], n = [], r = []) {
  $n(r, t, n, (i) => {
    se(Ye, () => e(...i.map(A)));
  });
}
function Wt(e, t = 0) {
  var n = se(le | t, e);
  return n;
}
function Y(e) {
  return se(U | ke, e);
}
function Xt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    pt(!0), I(null);
    try {
      t.call(null);
    } finally {
      pt(n), I(r);
    }
  }
}
function st(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && it(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & oe) !== 0 ? n.parent = null : H(n, t), n = r;
  }
}
function cr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && H(t), t = n;
  }
}
function H(e, t = !0) {
  var n = !1;
  (t || (e.f & mn) !== 0) && e.nodes !== null && e.nodes.end !== null && (vr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, ut), st(e, t && !n), Oe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Xt(e), e.f ^= ut, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Zt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function vr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function Zt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ge(e, t, n = !0) {
  var r = [];
  Jt(e, r, !0);
  var i = () => {
    n && H(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Jt(e, t, n) {
  if ((e.f & M) === 0) {
    e.f ^= M;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Me) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & le) !== 0;
      Jt(i, t, o ? n : !1), i = l;
    }
  }
}
function Qt(e) {
  en(e, !0);
}
function en(e, t) {
  if ((e.f & M) !== 0) {
    e.f ^= M, (e.f & x) === 0 && (E(e, R), ie.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Me) !== 0 || (n.f & U) !== 0;
      en(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function tn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let ze = !1, ye = !1;
function pt(e) {
  ye = e;
}
let p = null, z = !1;
function I(e) {
  p = e;
}
let g = null;
function B(e) {
  g = e;
}
let P = null;
function hr(e) {
  p !== null && (P === null ? P = [e] : P.push(e));
}
let C = null, F = 0, O = null;
function dr(e) {
  O = e;
}
let nn = 1, fe = 0, ue = fe;
function gt(e) {
  ue = e;
}
function rn() {
  return ++nn;
}
function De(e) {
  var t = e.f;
  if ((t & R) !== 0)
    return !0;
  if (t & k && (e.f &= ~ae), (t & $) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (De(
        /** @type {Derived} */
        l
      ) && zt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    q === null && E(e, x);
  }
  return !1;
}
function ln(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(P !== null && we.call(P, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & k) !== 0 ? ln(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, R) : (l.f & x) !== 0 && E(l, $), nt(
        /** @type {Effect} */
        l
      ));
    }
}
function sn(e) {
  var t = C, n = F, r = O, i = p, l = P, o = V, f = z, s = ue, u = e.f;
  C = /** @type {null | Value[]} */
  null, F = 0, O = null, p = (u & (U | oe)) === 0 ? e : null, P = null, me(e.ctx), z = !1, ue = ++fe, e.ac !== null && (it(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Xe;
    var c = (
      /** @type {Function} */
      e.fn
    ), h = c();
    e.f |= xe;
    var v = e.deps, d = b?.is_fork;
    if (C !== null) {
      var a;
      if (d || Oe(e, F), v !== null && F > 0)
        for (v.length = F + C.length, a = 0; a < C.length; a++)
          v[F + a] = C[a];
      else
        e.deps = v = C;
      if (lt() && (e.f & D) !== 0)
        for (a = F; a < v.length; a++)
          (v[a].reactions ??= []).push(e);
    } else !d && v !== null && F < v.length && (Oe(e, F), v.length = F);
    if (Ct() && O !== null && !z && v !== null && (e.f & (k | $ | R)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      O.length; a++)
        ln(
          O[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (fe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = fe;
      if (t !== null)
        for (const _ of t)
          _.rv = fe;
      O !== null && (r === null ? r = O : r.push(.../** @type {Source[]} */
      O));
    }
    return (e.f & te) !== 0 && (e.f ^= te), h;
  } catch (_) {
    return Nt(_);
  } finally {
    e.f ^= Xe, C = t, F = n, O = r, p = i, P = l, me(o), z = f, ue = s;
  }
}
function _r(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = vn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & k) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (C === null || !we.call(C, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & D) !== 0 && (l.f ^= D, l.f &= ~ae), tt(l), Zn(l), Oe(l, 0);
  }
}
function Oe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      _r(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & j) === 0) {
    E(e, x);
    var n = g, r = ze;
    g = e, ze = !0;
    try {
      (t & (le | St)) !== 0 ? cr(e) : st(e), Xt(e);
      var i = sn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = nn;
      var l;
    } finally {
      ze = r, g = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & k) !== 0;
  if (p !== null && !z) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (P === null || !we.call(P, e))) {
      var i = p.deps;
      if ((p.f & Xe) !== 0)
        e.rv < fe && (e.rv = fe, C === null && i !== null && i[F] === e ? F++ : C === null ? C = [e] : C.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : we.call(l, p) || l.push(p);
      }
    }
  }
  if (ye && re.has(e))
    return re.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ye) {
      var f = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || un(o)) && (f = rt(o)), re.set(o, f), f;
    }
    var s = (o.f & D) === 0 && !z && p !== null && (ze || (p.f & D) !== 0), u = (o.f & xe) === 0;
    De(o) && (s && (o.f |= D), zt(o)), s && !u && (jt(o), fn(o));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & te) !== 0)
    throw e.v;
  return e.v;
}
function fn(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & k) !== 0 && (t.f & D) === 0 && (jt(
        /** @type {Derived} */
        t
      ), fn(
        /** @type {Derived} */
        t
      ));
}
function un(e) {
  if (e.v === T) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (re.has(t) || (t.f & k) !== 0 && un(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function pr(e) {
  var t = z;
  try {
    return z = !0, e();
  } finally {
    z = t;
  }
}
const wt = globalThis.Deno?.core?.ops ?? null;
function gr(e, ...t) {
  wt?.[e] ? wt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ge(e, t) {
  gr("op_set_text", e, t);
}
const wr = ["touchstart", "touchmove"];
function mr(e) {
  return wr.includes(e);
}
const Ie = Symbol("events"), br = /* @__PURE__ */ new Set(), mt = /* @__PURE__ */ new Set();
let bt = null;
function yt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  bt = e;
  var o = 0, f = bt === e && e[Ie];
  if (f) {
    var s = i.indexOf(f);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ie] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    s <= u && (o = s);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    hn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, h = g;
    I(null), B(null);
    try {
      for (var v, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Ie]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (m) {
          v ? d.push(m) : v = m;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (v) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw v;
      }
    } finally {
      e[Ie] = t, delete e.currentTarget, I(c), B(h);
    }
  }
}
const yr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Er(e) {
  return (
    /** @type {string} */
    yr?.createHTML(e) ?? e
  );
}
function xr(e) {
  var t = ir("template");
  return t.innerHTML = Er(e.replaceAll("<!>", "<!---->")), t.content;
}
function kr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function on(e, t) {
  var n = (t & Fn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = xr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Bt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Yt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return kr(l, l), l;
  };
}
function Et(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Tr(e, t) {
  return Sr(e, t);
}
const Le = /* @__PURE__ */ new Map();
function Sr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  tr();
  var s = void 0, u = or(() => {
    var c = n ?? t.appendChild(He());
    Yn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Pn({});
        var a = (
          /** @type {ComponentContext} */
          V
        );
        l && (a.c = l), i && (r.$$events = i), s = e(d, r) || {}, In();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), v = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!h.has(_)) {
          h.add(_);
          var m = mr(_);
          for (const N of [t, document]) {
            var w = Le.get(N);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Le.set(N, w));
            var y = w.get(_);
            y === void 0 ? (N.addEventListener(_, yt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return v(Ve(br)), mt.add(v), () => {
      for (var d of h)
        for (const m of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            Le.get(m)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, yt), a.delete(d), a.size === 0 && Le.delete(m)) : a.set(d, _);
        }
      mt.delete(v), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Ar.set(s, u), s;
}
let Ar = /* @__PURE__ */ new WeakMap();
function Rr(e, t) {
  return t;
}
function Cr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, f = 0; f < i; f++) {
    let h = t[f];
    ge(
      h,
      () => {
        if (l) {
          if (l.pending.delete(h), l.done.add(h), l.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Qe(e, Ve(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var s = r.length === 0 && n !== null;
    if (s) {
      var u = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        u.parentNode
      );
      nr(c), c.append(u), e.items.clear();
    }
    Qe(e, t, !s);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Qe(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const f of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= X;
      const o = document.createDocumentFragment();
      tn(l, o);
    } else
      H(t[i], n);
  }
}
var xt;
function Nr(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map(), s = null, u = /* @__PURE__ */ Kn(() => {
    var w = n();
    return kt(w) ? w : w == null ? [] : Ve(w);
  }), c, h = /* @__PURE__ */ new Map(), v = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = s, Fr(m, c, o, t, r), s !== null && (c.length === 0 ? (s.f & X) === 0 ? Qt(s) : (s.f ^= X, Ae(s, null, o)) : ge(s, () => {
      s = null;
    })));
  }
  function a(w) {
    m.pending.delete(w);
  }
  var _ = Wt(() => {
    c = /** @type {V[]} */
    A(u);
    for (var w = c.length, y = /* @__PURE__ */ new Set(), N = (
      /** @type {Batch} */
      b
    ), ve = rr(), L = 0; L < w; L += 1) {
      var Te = c[L], he = r(Te, L), S = v ? null : f.get(he);
      S ? (S.v && be(S.v, Te), S.i && be(S.i, L), ve && N.unskip_effect(S.e)) : (S = Mr(
        f,
        v ? o : xt ??= He(),
        Te,
        he,
        L,
        i,
        t,
        n
      ), v || (S.e.f |= X), f.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !s && (v ? s = Y(() => l(o)) : (s = Y(() => l(xt ??= He())), s.f |= X)), w > y.size && En(), !v)
      if (h.set(N, y), ve) {
        for (const [an, cn] of f)
          y.has(an) || N.skip_effect(cn.e);
        N.oncommit(d), N.ondiscard(a);
      } else
        d(N);
    A(u);
  }), m = { effect: _, items: f, pending: h, outrogroups: null, fallback: s };
  v = !1;
}
function Se(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Fr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = Se(e.effect.first), s, u = null, c = [], h = [], v, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], d = i(v, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & M) !== 0 && Qt(a), (a.f & X) !== 0)
      if (a.f ^= X, a === f)
        Ae(a, null, n);
      else {
        var m = u ? u.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, u, a), J(e, a, m), Ae(a, m, n), u = a, c = [], h = [], f = Se(u.next);
        continue;
      }
    if (a !== f) {
      if (s !== void 0 && s.has(a)) {
        if (c.length < h.length) {
          var w = h[0], y;
          u = w.prev;
          var N = c[0], ve = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Ae(c[y], w, n);
          for (y = 0; y < h.length; y += 1)
            s.delete(h[y]);
          J(e, N.prev, ve.next), J(e, u, N), J(e, ve, w), f = w, u = ve, _ -= 1, c = [], h = [];
        } else
          s.delete(a), Ae(a, f, n), J(e, a.prev, a.next), J(e, a, u === null ? e.effect.first : u.next), J(e, u, a), u = a;
        continue;
      }
      for (c = [], h = []; f !== null && f !== a; )
        (s ??= /* @__PURE__ */ new Set()).add(f), h.push(f), f = Se(f.next);
      if (f === null)
        continue;
    }
    (a.f & X) === 0 && c.push(a), u = a, f = Se(a.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Qe(e, Ve(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || s !== void 0) {
    var L = [];
    if (s !== void 0)
      for (a of s)
        (a.f & M) === 0 && L.push(a);
    for (; f !== null; )
      (f.f & M) === 0 && f !== e.fallback && L.push(f), f = Se(f.next);
    var Te = L.length;
    if (Te > 0) {
      var he = null;
      Cr(e, L, he);
    }
  }
}
function Mr(e, t, n, r, i, l, o, f) {
  var s = (o & Rn) !== 0 ? (o & Nn) === 0 ? /* @__PURE__ */ Jn(n, !1, !1) : ce(n) : null, u = (o & Cn) !== 0 ? ce(i) : null;
  return {
    v: s,
    i: u,
    e: Y(() => (l(t, s ?? n, u ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Ae(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & X) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ue(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function J(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Ke = /* @__PURE__ */ new Set();
function Or(e, t, n, r, i = r) {
  var l = n.getAttribute("type") === "checkbox", o = e;
  if (t !== null)
    for (var f of t)
      o = o[f] ??= [];
  o.push(n), sr(
    n,
    "change",
    () => {
      var s = n.__value;
      l && (s = Dr(o, s, n.checked)), i(s);
    },
    // TODO better default value handling
    () => i(l ? [] : null)
  ), Kt(() => {
    var s = r();
    l ? (s = s || [], n.checked = s.includes(n.__value)) : n.checked = er(n.__value, s);
  }), Gt(() => {
    var s = o.indexOf(n);
    s !== -1 && o.splice(s, 1);
  }), Ke.has(o) || (Ke.add(o), ne(() => {
    o.sort((s, u) => s.compareDocumentPosition(u) === 4 ? -1 : 1), Ke.delete(o);
  })), ne(() => {
  });
}
function Dr(e, t, n) {
  for (var r = /* @__PURE__ */ new Set(), i = 0; i < e.length; i += 1)
    e[i].checked && r.add(e[i].__value);
  return n || r.delete(t), Array.from(r);
}
var Pr = /* @__PURE__ */ on('<label><input type="checkbox"/> </label>'), Ir = /* @__PURE__ */ on("<div><!> <div> </div> <div> </div></div>");
function Lr(e) {
  const t = [];
  let n = /* @__PURE__ */ G(pe([]));
  const r = ["apple", "banana", "cherry"];
  var i = Ir(), l = Pe(i);
  Nr(l, 17, () => r, Rr, (c, h) => {
    var v = Pr(), d = Pe(v), a, _ = Be(d);
    _t(() => {
      a !== (a = A(h)) && (d.value = (d.__value = A(h)) ?? ""), Ge(_, ` ${A(h) ?? ""}`);
    }), Or(
      t,
      [],
      d,
      () => (A(h), A(n)),
      (m) => Q(n, m)
    ), Et(c, v);
  });
  var o = Be(l, 2), f = Pe(o), s = Be(o, 2), u = Pe(s);
  _t(
    (c) => {
      Ge(f, `Selected: ${c ?? ""}`), Ge(u, `Count: ${A(n).length ?? ""}`);
    },
    [() => A(n).join(", ")]
  ), Et(e, i);
}
function zr(e) {
  return Tr(Lr, { target: e });
}
export {
  zr as default,
  zr as rvst_mount
};

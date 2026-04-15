var yt = Array.isArray, un = Array.prototype.indexOf, we = Array.prototype.includes, je = Array.from, on = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, an = Object.prototype, cn = Array.prototype, hn = Object.getPrototypeOf, it = Object.isExtensible;
const vn = () => {
};
function dn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Et() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Ce = 4, He = 8, xt = 1 << 24, re = 16, $ = 32, ue = 64, Be = 128, O = 512, x = 1024, A = 2048, U = 4096, F = 8192, j = 16384, xe = 32768, lt = 1 << 25, Me = 65536, st = 1 << 17, _n = 1 << 18, Te = 1 << 19, pn = 1 << 20, W = 1 << 25, oe = 65536, Ke = 1 << 21, Ze = 1 << 22, ee = 1 << 23, Ye = Symbol("$state"), G = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function gn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function wn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function mn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function bn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function xn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Tn = 1, kn = 2, Sn = 16, An = 2, k = Symbol(), Rn = "http://www.w3.org/1999/xhtml";
function Nn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Tt(e) {
  return e === this.v;
}
function Cn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function kt(e) {
  return !Cn(e, this.v);
}
let V = null;
function me(e) {
  V = e;
}
function Mn(e, t = !1, n) {
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
function Fn(e) {
  var t = (
    /** @type {ComponentContext} */
    V
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      rr(r);
  }
  return t.i = !0, V = t.p, /** @type {T} */
  {};
}
function St() {
  return !0;
}
let ve = [];
function Dn() {
  var e = ve;
  ve = [], dn(e);
}
function pe(e) {
  if (ve.length === 0) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && Dn();
    });
  }
  ve.push(e);
}
function At(e) {
  var t = g;
  if (t === null)
    return p.f |= ee, e;
  if ((t.f & xe) === 0 && (t.f & Ce) === 0)
    throw e;
  Q(e, t);
}
function Q(e, t) {
  for (; t !== null; ) {
    if ((t.f & Be) !== 0) {
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
const On = -7169;
function E(e, t) {
  e.f = e.f & On | t;
}
function Je(e) {
  (e.f & O) !== 0 || e.deps === null ? E(e, x) : E(e, U);
}
function Rt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & oe) === 0 || (t.f ^= oe, Rt(
        /** @type {Derived} */
        t.deps
      ));
}
function Nt(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), Rt(e.deps), E(e, x);
}
const X = /* @__PURE__ */ new Set();
let b = null, z = null, Ge = null, $e = !1, de = null, Pe = null;
var ft = 0;
let In = 1;
class ne {
  id = In++;
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
        E(r, A), this.schedule(r);
      for (r of n.m)
        E(r, U), this.schedule(r);
    }
  }
  #h() {
    if (ft++ > 1e3 && (X.delete(this), Pn()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), E(s, A), this.schedule(s);
      for (const s of this.#n)
        E(s, U), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = de = [], r = [], i = Pe = [];
    for (const s of t)
      try {
        this.#o(s, n, r);
      } catch (f) {
        throw Dt(s), f;
      }
    if (b = null, i.length > 0) {
      var l = ne.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (de = null, Pe = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [s, f] of this.#l)
        Ft(s, f);
    } else {
      this.#r.size === 0 && X.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), ut(r), ut(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#e.length > 0) {
      const s = o ??= this;
      s.#e.push(...this.#e.filter((f) => !s.#e.includes(f)));
    }
    o !== null && (X.add(o), o.#h()), X.has(this) || this.#w();
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
      var l = i.f, o = (l & ($ | ue)) !== 0, s = o && (l & x) !== 0, f = s || (l & F) !== 0 || this.#l.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= x : (l & Ce) !== 0 ? n.push(i) : De(i) && ((l & re) !== 0 && this.#n.add(i), Ee(i));
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
      Nt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ee) === 0 && (this.current.set(t, [t.v, r]), z?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, z = null;
  }
  flush() {
    try {
      $e = !0, b = this, this.#h();
    } finally {
      ft = 0, Ge = null, de = null, Pe = null, $e = !1, b = null, z = null, te.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), X.delete(this);
  }
  #w() {
    for (const u of X) {
      var t = u.id < this.id, n = [];
      for (const [a, [v, h]] of this.current) {
        if (u.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(a)[0]
          );
          if (t && v !== r)
            u.current.set(a, [v, h]);
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
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var s of n)
          Ct(s, i, l, o);
        if (u.#e.length > 0) {
          u.apply();
          for (var f of u.#e)
            u.#o(f, [], []);
          u.#e = [];
        }
        u.deactivate();
      }
    }
    for (const u of X)
      u.#u.has(this) && (u.#u.delete(this), u.#u.size === 0 && !u.#c() && (u.activate(), u.#h()));
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
    this.#a || r || (this.#a = !0, pe(() => {
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
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= Et()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new ne();
      $e || (X.add(b), pe(() => {
        b === t && t.flush();
      }));
    }
    return b;
  }
  apply() {
    {
      z = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ge = t, t.b?.is_pending && (t.f & (Ce | He | xt)) !== 0 && (t.f & xe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (de !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ue | $)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function Pn() {
  try {
    mn();
  } catch (e) {
    Q(e, Ge);
  }
}
let K = null;
function ut(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | F)) === 0 && De(r) && (K = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Bt(r), K?.size > 0)) {
        te.clear();
        for (const i of K) {
          if ((i.f & (j | F)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            K.has(o) && (K.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const f = l[s];
            (f.f & (j | F)) === 0 && Ee(f);
          }
        }
        K.clear();
      }
    }
    K = null;
  }
}
function Ct(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Ct(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Ze | re)) !== 0 && (l & A) === 0 && Mt(i, t, r) && (E(i, A), Qe(
        /** @type {Effect} */
        i
      ));
    }
}
function Mt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (we.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Mt(
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
function Qe(e) {
  b.schedule(e);
}
function Ft(e, t) {
  if (!((e.f & $) !== 0 && (e.f & x) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Ft(n, t), n = n.next;
  }
}
function Dt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Dt(t), t = t.next;
}
function qn(e) {
  let t = 0, n = ae(0), r;
  return () => {
    nt() && (N(n), sr(() => (t === 0 && (r = cr(() => e(() => Ne(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ne(n));
      });
    })));
  };
}
var zn = Me | Te;
function Ln(e, t, n, r) {
  new jn(e, t, n, r);
}
class jn {
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
  #a = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #_ = qn(() => (this.#o = ae(this.#a), () => {
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
      o.b = this, o.f |= Be, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = $t(() => {
      this.#m();
    }, zn);
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
    t && (this.is_pending = !0, this.#t = Y(() => t(this.#s)), pe(() => {
      var n = this.#l = document.createDocumentFragment(), r = Le();
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
        Xt(this.#e, t);
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Nt(t, this.#d, this.#h);
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
    B(this.#i), P(this.#i), me(this.#i.ctx);
    try {
      return ne.ensure(), t();
    } catch (l) {
      return At(l), null;
    } finally {
      B(n), P(r), me(i);
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
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, pe(() => {
      this.#c = !1, this.#o && be(this.#o, this.#a);
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
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && (H(this.#e), this.#e = null), this.#t && (H(this.#t), this.#t = null), this.#n && (H(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Nn();
        return;
      }
      i = !0, l && xn(), this.#n !== null && ge(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, s = (f) => {
      try {
        l = !0, n?.(f, o), l = !1;
      } catch (u) {
        Q(u, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Y(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= Be, r(
              this.#s,
              () => f,
              () => o
            );
          });
        } catch (u) {
          return Q(
            u,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    pe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (u) {
        Q(u, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        s,
        /** @param {unknown} e */
        (u) => Q(u, this.#i && this.#i.parent)
      ) : s(f);
    });
  }
}
function Hn(e, t, n, r) {
  const i = et;
  var l = e.filter((h) => !h.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), s = Vn(), f = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((h) => h.promise)) : null;
  function u(h) {
    s();
    try {
      r(h);
    } catch (d) {
      (o.f & j) === 0 && Q(d, o);
    }
    ze();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var a = Ot();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Yn(h))).then((h) => u([...t.map(i), ...h])).catch((h) => Q(h, o)).finally(() => a());
  }
  f ? f.then(() => {
    s(), v(), ze();
  }) : v();
}
function Vn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = V, r = (
    /** @type {Batch} */
    b
  );
  return function(l = !0) {
    B(e), P(t), me(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function ze(e = !0) {
  B(null), P(null), me(null), e && b?.deactivate();
}
function Ot() {
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
function et(e) {
  var t = T | A, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Te), {
    ctx: V,
    deps: null,
    effects: null,
    equals: Tt,
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
function Yn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && gn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = ae(
    /** @type {V} */
    k
  ), o = !p, s = /* @__PURE__ */ new Map();
  return lr(() => {
    var f = (
      /** @type {Effect} */
      g
    ), u = Et();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(ze);
    } catch (d) {
      u.reject(d), ze();
    }
    var a = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((f.f & xe) !== 0)
        var v = Ot();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(a)?.reject(G), s.delete(a);
      else {
        for (const d of s.values())
          d.reject(G);
        s.clear();
      }
      s.set(a, u);
    }
    const h = (d, c = void 0) => {
      if (v) {
        var _ = c === G;
        v(_);
      }
      if (!(c === G || (f.f & j) !== 0)) {
        if (a.activate(), c)
          l.f |= ee, be(l, c);
        else {
          (l.f & ee) !== 0 && (l.f ^= ee), be(l, d);
          for (const [m, w] of s) {
            if (s.delete(m), m === a) break;
            w.reject(G);
          }
        }
        a.deactivate();
      }
    };
    u.promise.then(h, (d) => h(null, d || "unknown"));
  }), nr(() => {
    for (const f of s.values())
      f.reject(G);
  }), new Promise((f) => {
    function u(a) {
      function v() {
        a === i ? f(l) : u(i);
      }
      a.then(v, v);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function ot(e) {
  const t = /* @__PURE__ */ et(e);
  return Zt(t), t;
}
// @__NO_SIDE_EFFECTS__
function $n(e) {
  const t = /* @__PURE__ */ et(e);
  return t.equals = kt, t;
}
function Un(e) {
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
function Bn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function tt(e) {
  var t, n = g;
  B(Bn(e));
  try {
    e.f &= ~oe, Un(e), t = tn(e);
  } finally {
    B(n);
  }
  return t;
}
function It(e) {
  var t = e.v, n = tt(e);
  if (!e.equals(n) && (e.wv = Qt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (z !== null ? (nt() || b?.is_fork) && z.set(e, n) : Je(e));
}
function Kn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(G), t.teardown = vn, t.ac = null, Fe(t, 0), rt(t));
}
function Pt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let We = /* @__PURE__ */ new Set();
const te = /* @__PURE__ */ new Map();
let qt = !1;
function ae(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Tt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Z(e, t) {
  const n = ae(e);
  return Zt(n), n;
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = kt), r;
}
function le(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (p.f & st) !== 0) && St() && (p.f & (T | re | Ze | st)) !== 0 && (I === null || !we.call(I, e)) && En();
  let r = n ? _e(t) : t;
  return be(e, r, Pe);
}
function be(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ye ? te.set(e, t) : te.set(e, r), e.v = t;
    var i = ne.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & A) !== 0 && tt(l), z === null && Je(l);
    }
    e.wv = Qt(), zt(e, A, n), g !== null && (g.f & x) !== 0 && (g.f & ($ | ue)) === 0 && (D === null ? or([e]) : D.push(e)), !i.is_fork && We.size > 0 && !qt && Wn();
  }
  return t;
}
function Wn() {
  qt = !1;
  for (const e of We)
    (e.f & x) !== 0 && E(e, U), De(e) && Ee(e);
  We.clear();
}
function Ne(e) {
  le(e, e.v + 1);
}
function zt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], s = o.f, f = (s & A) === 0;
      if (f && E(o, t), (s & T) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        z?.delete(u), (s & oe) === 0 && (s & O && (o.f |= oe), zt(u, U, n));
      } else if (f) {
        var a = (
          /** @type {Effect} */
          o
        );
        (s & re) !== 0 && K !== null && K.add(a), n !== null ? n.push(a) : Qe(a);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const t = hn(e);
  if (t !== an && t !== cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = yt(e), i = /* @__PURE__ */ Z(0), l = fe, o = (s) => {
    if (fe === l)
      return s();
    var f = p, u = fe;
    P(null), vt(l);
    var a = s();
    return P(f), vt(u), a;
  };
  return r && n.set("length", /* @__PURE__ */ Z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && bn();
        var a = n.get(f);
        return a === void 0 ? o(() => {
          var v = /* @__PURE__ */ Z(u.value);
          return n.set(f, v), v;
        }) : le(a, u.value, !0), !0;
      },
      deleteProperty(s, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in s) {
            const a = o(() => /* @__PURE__ */ Z(k));
            n.set(f, a), Ne(i);
          }
        } else
          le(u, k), Ne(i);
        return !0;
      },
      get(s, f, u) {
        if (f === Ye)
          return e;
        var a = n.get(f), v = f in s;
        if (a === void 0 && (!v || Re(s, f)?.writable) && (a = o(() => {
          var d = _e(v ? s[f] : k), c = /* @__PURE__ */ Z(d);
          return c;
        }), n.set(f, a)), a !== void 0) {
          var h = N(a);
          return h === k ? void 0 : h;
        }
        return Reflect.get(s, f, u);
      },
      getOwnPropertyDescriptor(s, f) {
        var u = Reflect.getOwnPropertyDescriptor(s, f);
        if (u && "value" in u) {
          var a = n.get(f);
          a && (u.value = N(a));
        } else if (u === void 0) {
          var v = n.get(f), h = v?.v;
          if (v !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return u;
      },
      has(s, f) {
        if (f === Ye)
          return !0;
        var u = n.get(f), a = u !== void 0 && u.v !== k || Reflect.has(s, f);
        if (u !== void 0 || g !== null && (!a || Re(s, f)?.writable)) {
          u === void 0 && (u = o(() => {
            var h = a ? _e(s[f]) : k, d = /* @__PURE__ */ Z(h);
            return d;
          }), n.set(f, u));
          var v = N(u);
          if (v === k)
            return !1;
        }
        return a;
      },
      set(s, f, u, a) {
        var v = n.get(f), h = f in s;
        if (r && f === "length")
          for (var d = u; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var c = n.get(d + "");
            c !== void 0 ? le(c, k) : d in s && (c = o(() => /* @__PURE__ */ Z(k)), n.set(d + "", c));
          }
        if (v === void 0)
          (!h || Re(s, f)?.writable) && (v = o(() => /* @__PURE__ */ Z(void 0)), le(v, _e(u)), n.set(f, v));
        else {
          h = v.v !== k;
          var _ = o(() => _e(u));
          le(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(s, f);
        if (m?.set && m.set.call(a, u), !h) {
          if (r && typeof f == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(f);
            Number.isInteger(y) && y >= w.v && le(w, y + 1);
          }
          Ne(i);
        }
        return !0;
      },
      ownKeys(s) {
        N(i);
        var f = Reflect.ownKeys(s).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [u, a] of n)
          a.v !== k && !(u in s) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        yn();
      }
    }
  );
}
var at, Lt, jt, Ht;
function Xn() {
  if (at === void 0) {
    at = window, Lt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    jt = Re(t, "firstChild").get, Ht = Re(t, "nextSibling").get, it(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), it(n) && (n.__t = void 0);
  }
}
function Le(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
  return (
    /** @type {TemplateNode | null} */
    jt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    Ht.call(e)
  );
}
function Ue(e, t) {
  return /* @__PURE__ */ Vt(e);
}
function Zn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Jn(e) {
  e.textContent = "";
}
function Qn() {
  return !1;
}
function er(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Rn, e, void 0)
  );
}
function Yt(e) {
  var t = p, n = g;
  P(null), B(null);
  try {
    return e();
  } finally {
    P(t), B(n);
  }
}
function tr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = g;
  n !== null && (n.f & F) !== 0 && (e |= F);
  var r = {
    ctx: V,
    deps: null,
    nodes: null,
    f: e | A | O,
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
  if ((e & Ce) !== 0)
    de !== null ? de.push(r) : ne.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw H(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & re) !== 0 && (e & Me) !== 0 && i !== null && (i.f |= Me));
  }
  if (i !== null && (i.parent = n, n !== null && tr(i, n), p !== null && (p.f & T) !== 0 && (e & ue) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function nt() {
  return p !== null && !L;
}
function nr(e) {
  const t = ie(He, null);
  return E(t, x), t.teardown = e, t;
}
function rr(e) {
  return ie(Ce | pn, e);
}
function ir(e) {
  ne.ensure();
  const t = ie(ue | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      H(t), r(void 0);
    }) : (H(t), r(void 0));
  });
}
function lr(e) {
  return ie(Ze | Te, e);
}
function sr(e, t = 0) {
  return ie(He | t, e);
}
function ct(e, t = [], n = [], r = []) {
  Hn(r, t, n, (i) => {
    ie(He, () => e(...i.map(N)));
  });
}
function $t(e, t = 0) {
  var n = ie(re | t, e);
  return n;
}
function Y(e) {
  return ie($ | Te, e);
}
function Ut(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    ht(!0), P(null);
    try {
      t.call(null);
    } finally {
      ht(n), P(r);
    }
  }
}
function rt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Yt(() => {
      i.abort(G);
    });
    var r = n.next;
    (n.f & ue) !== 0 ? n.parent = null : H(n, t), n = r;
  }
}
function fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & $) === 0 && H(t), t = n;
  }
}
function H(e, t = !0) {
  var n = !1;
  (t || (e.f & _n) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, lt), rt(e, t && !n), Fe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Ut(e), e.f ^= lt, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Bt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Bt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ge(e, t, n = !0) {
  var r = [];
  Kt(e, r, !0);
  var i = () => {
    n && H(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var s of r)
      s.out(o);
  } else
    i();
}
function Kt(e, t, n) {
  if ((e.f & F) === 0) {
    e.f ^= F;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Me) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & $) !== 0 && (e.f & re) !== 0;
      Kt(i, t, o ? n : !1), i = l;
    }
  }
}
function Gt(e) {
  Wt(e, !0);
}
function Wt(e, t) {
  if ((e.f & F) !== 0) {
    e.f ^= F, (e.f & x) === 0 && (E(e, A), ne.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Me) !== 0 || (n.f & $) !== 0;
      Wt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Xt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let qe = !1, ye = !1;
function ht(e) {
  ye = e;
}
let p = null, L = !1;
function P(e) {
  p = e;
}
let g = null;
function B(e) {
  g = e;
}
let I = null;
function Zt(e) {
  p !== null && (I === null ? I = [e] : I.push(e));
}
let R = null, M = 0, D = null;
function or(e) {
  D = e;
}
let Jt = 1, se = 0, fe = se;
function vt(e) {
  fe = e;
}
function Qt() {
  return ++Jt;
}
function De(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & T && (e.f &= ~oe), (t & U) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (De(
        /** @type {Derived} */
        l
      ) && It(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    z === null && E(e, x);
  }
  return !1;
}
function en(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(I !== null && we.call(I, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? en(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, A) : (l.f & x) !== 0 && E(l, U), Qe(
        /** @type {Effect} */
        l
      ));
    }
}
function tn(e) {
  var t = R, n = M, r = D, i = p, l = I, o = V, s = L, f = fe, u = e.f;
  R = /** @type {null | Value[]} */
  null, M = 0, D = null, p = (u & ($ | ue)) === 0 ? e : null, I = null, me(e.ctx), L = !1, fe = ++se, e.ac !== null && (Yt(() => {
    e.ac.abort(G);
  }), e.ac = null);
  try {
    e.f |= Ke;
    var a = (
      /** @type {Function} */
      e.fn
    ), v = a();
    e.f |= xe;
    var h = e.deps, d = b?.is_fork;
    if (R !== null) {
      var c;
      if (d || Fe(e, M), h !== null && M > 0)
        for (h.length = M + R.length, c = 0; c < R.length; c++)
          h[M + c] = R[c];
      else
        e.deps = h = R;
      if (nt() && (e.f & O) !== 0)
        for (c = M; c < h.length; c++)
          (h[c].reactions ??= []).push(e);
    } else !d && h !== null && M < h.length && (Fe(e, M), h.length = M);
    if (St() && D !== null && !L && h !== null && (e.f & (T | U | A)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      D.length; c++)
        en(
          D[c],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (se++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = se;
      if (t !== null)
        for (const _ of t)
          _.rv = se;
      D !== null && (r === null ? r = D : r.push(.../** @type {Source[]} */
      D));
    }
    return (e.f & ee) !== 0 && (e.f ^= ee), v;
  } catch (_) {
    return At(_);
  } finally {
    e.f ^= Ke, R = t, M = n, D = r, p = i, I = l, me(o), L = s, fe = f;
  }
}
function ar(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = un.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (R === null || !we.call(R, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & O) !== 0 && (l.f ^= O, l.f &= ~oe), Je(l), Kn(l), Fe(l, 0);
  }
}
function Fe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ar(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & j) === 0) {
    E(e, x);
    var n = g, r = qe;
    g = e, qe = !0;
    try {
      (t & (re | xt)) !== 0 ? fr(e) : rt(e), Ut(e);
      var i = tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var l;
    } finally {
      qe = r, g = n;
    }
  }
}
function N(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !L) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (I === null || !we.call(I, e))) {
      var i = p.deps;
      if ((p.f & Ke) !== 0)
        e.rv < se && (e.rv = se, R === null && i !== null && i[M] === e ? M++ : R === null ? R = [e] : R.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : we.call(l, p) || l.push(p);
      }
    }
  }
  if (ye && te.has(e))
    return te.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ye) {
      var s = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || rn(o)) && (s = tt(o)), te.set(o, s), s;
    }
    var f = (o.f & O) === 0 && !L && p !== null && (qe || (p.f & O) !== 0), u = (o.f & xe) === 0;
    De(o) && (f && (o.f |= O), It(o)), f && !u && (Pt(o), nn(o));
  }
  if (z?.has(e))
    return z.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function nn(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & O) === 0 && (Pt(
        /** @type {Derived} */
        t
      ), nn(
        /** @type {Derived} */
        t
      ));
}
function rn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (te.has(t) || (t.f & T) !== 0 && rn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function cr(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const dt = globalThis.Deno?.core?.ops ?? null;
function hr(e, ...t) {
  dt?.[e] ? dt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function _t(e, t) {
  hr("op_set_text", e, t);
}
const vr = ["touchstart", "touchmove"];
function dr(e) {
  return vr.includes(e);
}
const Oe = Symbol("events"), _r = /* @__PURE__ */ new Set(), pt = /* @__PURE__ */ new Set();
let gt = null;
function wt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  gt = e;
  var o = 0, s = gt === e && e[Oe];
  if (s) {
    var f = i.indexOf(s);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Oe] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    f <= u && (o = f);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    on(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var a = p, v = g;
    P(null), B(null);
    try {
      for (var h, d = []; l !== null; ) {
        var c = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Oe]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (m) {
          h ? d.push(m) : h = m;
        }
        if (e.cancelBubble || c === t || c === null)
          break;
        l = c;
      }
      if (h) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Oe] = t, delete e.currentTarget, P(a), B(v);
    }
  }
}
const pr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function gr(e) {
  return (
    /** @type {string} */
    pr?.createHTML(e) ?? e
  );
}
function wr(e) {
  var t = er("template");
  return t.innerHTML = gr(e.replaceAll("<!>", "<!---->")), t.content;
}
function mr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ln(e, t) {
  var n = (t & An) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = wr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Vt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Lt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return mr(l, l), l;
  };
}
function mt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function br(e, t) {
  return yr(e, t);
}
const Ie = /* @__PURE__ */ new Map();
function yr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: s }) {
  Xn();
  var f = void 0, u = ir(() => {
    var a = n ?? t.appendChild(Le());
    Ln(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (d) => {
        Mn({});
        var c = (
          /** @type {ComponentContext} */
          V
        );
        l && (c.c = l), i && (r.$$events = i), f = e(d, r) || {}, Fn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var c = 0; c < d.length; c++) {
        var _ = d[c];
        if (!v.has(_)) {
          v.add(_);
          var m = dr(_);
          for (const C of [t, document]) {
            var w = Ie.get(C);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Ie.set(C, w));
            var y = w.get(_);
            y === void 0 ? (C.addEventListener(_, wt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return h(je(_r)), pt.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var c = (
            /** @type {Map<string, number>} */
            Ie.get(m)
          ), _ = (
            /** @type {number} */
            c.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, wt), c.delete(d), c.size === 0 && Ie.delete(m)) : c.set(d, _);
        }
      pt.delete(h), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return Er.set(f, u), f;
}
let Er = /* @__PURE__ */ new WeakMap();
function xr(e, t) {
  return t;
}
function Tr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, s = 0; s < i; s++) {
    let v = t[s];
    ge(
      v,
      () => {
        if (l) {
          if (l.pending.delete(v), l.done.add(v), l.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Xe(e, je(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var f = r.length === 0 && n !== null;
    if (f) {
      var u = (
        /** @type {Element} */
        n
      ), a = (
        /** @type {Element} */
        u.parentNode
      );
      Jn(a), a.append(u), e.items.clear();
    }
    Xe(e, t, !f);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Xe(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const s of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(s).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= W;
      const o = document.createDocumentFragment();
      Xt(l, o);
    } else
      H(t[i], n);
  }
}
var bt;
function kr(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), f = null, u = /* @__PURE__ */ $n(() => {
    var w = n();
    return yt(w) ? w : w == null ? [] : je(w);
  }), a, v = /* @__PURE__ */ new Map(), h = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = f, Sr(m, a, o, t, r), f !== null && (a.length === 0 ? (f.f & W) === 0 ? Gt(f) : (f.f ^= W, Ae(f, null, o)) : ge(f, () => {
      f = null;
    })));
  }
  function c(w) {
    m.pending.delete(w);
  }
  var _ = $t(() => {
    a = /** @type {V[]} */
    N(u);
    for (var w = a.length, y = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      b
    ), ce = Qn(), q = 0; q < w; q += 1) {
      var ke = a[q], he = r(ke, q), S = h ? null : s.get(he);
      S ? (S.v && be(S.v, ke), S.i && be(S.i, q), ce && C.unskip_effect(S.e)) : (S = Ar(
        s,
        h ? o : bt ??= Le(),
        ke,
        he,
        q,
        i,
        t,
        n
      ), h || (S.e.f |= W), s.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !f && (h ? f = Y(() => l(o)) : (f = Y(() => l(bt ??= Le())), f.f |= W)), w > y.size && wn(), !h)
      if (v.set(C, y), ce) {
        for (const [sn, fn] of s)
          y.has(sn) || C.skip_effect(fn.e);
        C.oncommit(d), C.ondiscard(c);
      } else
        d(C);
    N(u);
  }), m = { effect: _, items: s, pending: v, outrogroups: null, fallback: f };
  h = !1;
}
function Se(e) {
  for (; e !== null && (e.f & $) === 0; )
    e = e.next;
  return e;
}
function Sr(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Se(e.effect.first), f, u = null, a = [], v = [], h, d, c, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), c = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(c), S.done.delete(c);
    if ((c.f & F) !== 0 && Gt(c), (c.f & W) !== 0)
      if (c.f ^= W, c === s)
        Ae(c, null, n);
      else {
        var m = u ? u.next : s;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), J(e, u, c), J(e, c, m), Ae(c, m, n), u = c, a = [], v = [], s = Se(u.next);
        continue;
      }
    if (c !== s) {
      if (f !== void 0 && f.has(c)) {
        if (a.length < v.length) {
          var w = v[0], y;
          u = w.prev;
          var C = a[0], ce = a[a.length - 1];
          for (y = 0; y < a.length; y += 1)
            Ae(a[y], w, n);
          for (y = 0; y < v.length; y += 1)
            f.delete(v[y]);
          J(e, C.prev, ce.next), J(e, u, C), J(e, ce, w), s = w, u = ce, _ -= 1, a = [], v = [];
        } else
          f.delete(c), Ae(c, s, n), J(e, c.prev, c.next), J(e, c, u === null ? e.effect.first : u.next), J(e, u, c), u = c;
        continue;
      }
      for (a = [], v = []; s !== null && s !== c; )
        (f ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Se(s.next);
      if (s === null)
        continue;
    }
    (c.f & W) === 0 && a.push(c), u = c, s = Se(c.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Xe(e, je(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || f !== void 0) {
    var q = [];
    if (f !== void 0)
      for (c of f)
        (c.f & F) === 0 && q.push(c);
    for (; s !== null; )
      (s.f & F) === 0 && s !== e.fallback && q.push(s), s = Se(s.next);
    var ke = q.length;
    if (ke > 0) {
      var he = null;
      Tr(e, q, he);
    }
  }
}
function Ar(e, t, n, r, i, l, o, s) {
  var f = (o & Tn) !== 0 ? (o & Sn) === 0 ? /* @__PURE__ */ Gn(n, !1, !1) : ae(n) : null, u = (o & kn) !== 0 ? ae(i) : null;
  return {
    v: f,
    i: u,
    e: Y(() => (l(t, f ?? n, u ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function Ae(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & W) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ve(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function J(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Rr = /* @__PURE__ */ ln("<div> </div>"), Nr = /* @__PURE__ */ ln("<div><!> <div> </div></div>");
function Cr(e) {
  let t = _e([1, 4, 9, 16, 25]);
  var n = Nr(), r = Ue(n);
  kr(r, 17, () => t, xr, (o, s) => {
    const f = /* @__PURE__ */ ot(() => Math.sqrt(N(s))), u = /* @__PURE__ */ ot(() => Number.isInteger(N(f)) ? "perfect" : "imperfect");
    var a = Rr(), v = Ue(a);
    ct(() => _t(v, `${N(s) ?? ""}: sqrt=${N(f) ?? ""} (${N(u) ?? ""})`)), mt(o, a);
  });
  var i = Zn(r, 2), l = Ue(i);
  ct(() => _t(l, `Count: ${t.length ?? ""}`)), mt(e, n);
}
function Fr(e) {
  return br(Cr, { target: e });
}
export {
  Fr as default,
  Fr as rvst_mount
};

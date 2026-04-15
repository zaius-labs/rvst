var bt = Array.isArray, un = Array.prototype.indexOf, we = Array.prototype.includes, je = Array.from, on = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, an = Object.prototype, cn = Array.prototype, hn = Object.getPrototypeOf, it = Object.isExtensible;
const vn = () => {
};
function dn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function yt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, De = 4, He = 8, Et = 1 << 24, re = 16, B = 32, ue = 64, $e = 128, M = 512, x = 1024, A = 2048, U = 4096, D = 8192, j = 16384, xe = 32768, lt = 1 << 25, Fe = 65536, st = 1 << 17, _n = 1 << 18, Te = 1 << 19, pn = 1 << 20, W = 1 << 25, oe = 65536, Ke = 1 << 21, Je = 1 << 22, ee = 1 << 23, Ye = Symbol("$state"), G = new class extends Error {
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
function xt(e) {
  return e === this.v;
}
function Cn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Tt(e) {
  return !Cn(e, this.v);
}
let V = null;
function me(e) {
  V = e;
}
function Dn(e, t = !1, n) {
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
      nr(r);
  }
  return t.i = !0, V = t.p, /** @type {T} */
  {};
}
function kt() {
  return !0;
}
let ve = [];
function Mn() {
  var e = ve;
  ve = [], dn(e);
}
function pe(e) {
  if (ve.length === 0) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && Mn();
    });
  }
  ve.push(e);
}
function St(e) {
  var t = g;
  if (t === null)
    return p.f |= ee, e;
  if ((t.f & xe) === 0 && (t.f & De) === 0)
    throw e;
  Q(e, t);
}
function Q(e, t) {
  for (; t !== null; ) {
    if ((t.f & $e) !== 0) {
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
function Qe(e) {
  (e.f & M) !== 0 || e.deps === null ? E(e, x) : E(e, U);
}
function At(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & oe) === 0 || (t.f ^= oe, At(
        /** @type {Derived} */
        t.deps
      ));
}
function Rt(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), At(e.deps), E(e, x);
}
const X = /* @__PURE__ */ new Set();
let b = null, q = null, Ge = null, Be = !1, de = null, Ie = null;
var ft = 0;
let Pn = 1;
class ne {
  id = Pn++;
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
    if (ft++ > 1e3 && (X.delete(this), In()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), E(s, A), this.schedule(s);
      for (const s of this.#n)
        E(s, U), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = de = [], r = [], i = Ie = [];
    for (const s of t)
      try {
        this.#o(s, n, r);
      } catch (u) {
        throw Ft(s), u;
      }
    if (b = null, i.length > 0) {
      var l = ne.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (de = null, Ie = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [s, u] of this.#l)
        Dt(s, u);
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
      s.#e.push(...this.#e.filter((u) => !s.#e.includes(u)));
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
      var l = i.f, o = (l & (B | ue)) !== 0, s = o && (l & x) !== 0, u = s || (l & D) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= x : (l & De) !== 0 ? n.push(i) : Oe(i) && ((l & re) !== 0 && this.#n.add(i), Ee(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
      Rt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ee) === 0 && (this.current.set(t, [t.v, r]), q?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, q = null;
  }
  flush() {
    try {
      Be = !0, b = this, this.#h();
    } finally {
      ft = 0, Ge = null, de = null, Ie = null, Be = !1, b = null, q = null, te.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), X.delete(this);
  }
  #w() {
    for (const f of X) {
      var t = f.id < this.id, n = [];
      for (const [c, [v, h]] of this.current) {
        if (f.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(c)[0]
          );
          if (t && v !== r)
            f.current.set(c, [v, h]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...f.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var s of n)
          Nt(s, i, l, o);
        if (f.#e.length > 0) {
          f.apply();
          for (var u of f.#e)
            f.#o(u, [], []);
          f.#e = [];
        }
        f.deactivate();
      }
    }
    for (const f of X)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#c() && (f.activate(), f.#h()));
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
    return (this.#i ??= yt()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new ne();
      Be || (X.add(b), pe(() => {
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
    if (Ge = t, t.b?.is_pending && (t.f & (De | He | Et)) !== 0 && (t.f & xe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (de !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ue | B)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function In() {
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
      if ((r.f & (j | D)) === 0 && Oe(r) && (K = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && $t(r), K?.size > 0)) {
        te.clear();
        for (const i of K) {
          if ((i.f & (j | D)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            K.has(o) && (K.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const u = l[s];
            (u.f & (j | D)) === 0 && Ee(u);
          }
        }
        K.clear();
      }
    }
    K = null;
  }
}
function Nt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Nt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Je | re)) !== 0 && (l & A) === 0 && Ct(i, t, r) && (E(i, A), et(
        /** @type {Effect} */
        i
      ));
    }
}
function Ct(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (we.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ct(
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
function et(e) {
  b.schedule(e);
}
function Dt(e, t) {
  if (!((e.f & B) !== 0 && (e.f & x) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Dt(n, t), n = n.next;
  }
}
function Ft(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Ft(t), t = t.next;
}
function qn(e) {
  let t = 0, n = ae(0), r;
  return () => {
    nt() && (L(n), lr(() => (t === 0 && (r = cr(() => e(() => Ce(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ce(n));
      });
    })));
  };
}
var zn = Fe | Te;
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
      o.b = this, o.f |= $e, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Bt(() => {
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
    Rt(t, this.#d, this.#h);
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
    $(this.#i), P(this.#i), me(this.#i.ctx);
    try {
      return ne.ensure(), t();
    } catch (l) {
      return St(l), null;
    } finally {
      $(n), P(r), me(i);
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
    return this.#_(), L(
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
    }, s = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (f) {
        Q(f, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Y(() => {
            var f = (
              /** @type {Effect} */
              g
            );
            f.b = this, f.f |= $e, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (f) {
          return Q(
            f,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    pe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (f) {
        Q(f, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        s,
        /** @param {unknown} e */
        (f) => Q(f, this.#i && this.#i.parent)
      ) : s(u);
    });
  }
}
function Hn(e, t, n, r) {
  const i = Ot;
  var l = e.filter((h) => !h.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), s = Vn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((h) => h.promise)) : null;
  function f(h) {
    s();
    try {
      r(h);
    } catch (d) {
      (o.f & j) === 0 && Q(d, o);
    }
    ze();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(i)));
    return;
  }
  var c = Mt();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Yn(h))).then((h) => f([...t.map(i), ...h])).catch((h) => Q(h, o)).finally(() => c());
  }
  u ? u.then(() => {
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
    $(e), P(t), me(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function ze(e = !0) {
  $(null), P(null), me(null), e && b?.deactivate();
}
function Mt() {
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
function Ot(e) {
  var t = T | A, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Te), {
    ctx: V,
    deps: null,
    effects: null,
    equals: xt,
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
  return ir(() => {
    var u = (
      /** @type {Effect} */
      g
    ), f = yt();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(ze);
    } catch (d) {
      f.reject(d), ze();
    }
    var c = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((u.f & xe) !== 0)
        var v = Mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(c)?.reject(G), s.delete(c);
      else {
        for (const d of s.values())
          d.reject(G);
        s.clear();
      }
      s.set(c, f);
    }
    const h = (d, a = void 0) => {
      if (v) {
        var _ = a === G;
        v(_);
      }
      if (!(a === G || (u.f & j) !== 0)) {
        if (c.activate(), a)
          l.f |= ee, be(l, a);
        else {
          (l.f & ee) !== 0 && (l.f ^= ee), be(l, d);
          for (const [m, w] of s) {
            if (s.delete(m), m === c) break;
            w.reject(G);
          }
        }
        c.deactivate();
      }
    };
    f.promise.then(h, (d) => h(null, d || "unknown"));
  }), tr(() => {
    for (const u of s.values())
      u.reject(G);
  }), new Promise((u) => {
    function f(c) {
      function v() {
        c === i ? u(l) : f(i);
      }
      c.then(v, v);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Bn(e) {
  const t = /* @__PURE__ */ Ot(e);
  return t.equals = Tt, t;
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
function $n(e) {
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
  $($n(e));
  try {
    e.f &= ~oe, Un(e), t = en(e);
  } finally {
    $(n);
  }
  return t;
}
function Pt(e) {
  var t = e.v, n = tt(e);
  if (!e.equals(n) && (e.wv = Jt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (q !== null ? (nt() || b?.is_fork) && q.set(e, n) : Qe(e));
}
function Kn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(G), t.teardown = vn, t.ac = null, Me(t, 0), rt(t));
}
function It(e) {
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
    equals: xt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Z(e, t) {
  const n = ae(e);
  return ur(n), n;
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = Tt), r;
}
function le(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!z || (p.f & st) !== 0) && kt() && (p.f & (T | re | Je | st)) !== 0 && (O === null || !we.call(O, e)) && En();
  let r = n ? _e(t) : t;
  return be(e, r, Ie);
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
      (e.f & A) !== 0 && tt(l), q === null && Qe(l);
    }
    e.wv = Jt(), zt(e, A, n), g !== null && (g.f & x) !== 0 && (g.f & (B | ue)) === 0 && (F === null ? or([e]) : F.push(e)), !i.is_fork && We.size > 0 && !qt && Wn();
  }
  return t;
}
function Wn() {
  qt = !1;
  for (const e of We)
    (e.f & x) !== 0 && E(e, U), Oe(e) && Ee(e);
  We.clear();
}
function Ce(e) {
  le(e, e.v + 1);
}
function zt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], s = o.f, u = (s & A) === 0;
      if (u && E(o, t), (s & T) !== 0) {
        var f = (
          /** @type {Derived} */
          o
        );
        q?.delete(f), (s & oe) === 0 && (s & M && (o.f |= oe), zt(f, U, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (s & re) !== 0 && K !== null && K.add(c), n !== null ? n.push(c) : et(c);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const t = hn(e);
  if (t !== an && t !== cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = bt(e), i = /* @__PURE__ */ Z(0), l = fe, o = (s) => {
    if (fe === l)
      return s();
    var u = p, f = fe;
    P(null), vt(l);
    var c = s();
    return P(u), vt(f), c;
  };
  return r && n.set("length", /* @__PURE__ */ Z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && bn();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ Z(f.value);
          return n.set(u, v), v;
        }) : le(c, f.value, !0), !0;
      },
      deleteProperty(s, u) {
        var f = n.get(u);
        if (f === void 0) {
          if (u in s) {
            const c = o(() => /* @__PURE__ */ Z(k));
            n.set(u, c), Ce(i);
          }
        } else
          le(f, k), Ce(i);
        return !0;
      },
      get(s, u, f) {
        if (u === Ye)
          return e;
        var c = n.get(u), v = u in s;
        if (c === void 0 && (!v || Ne(s, u)?.writable) && (c = o(() => {
          var d = _e(v ? s[u] : k), a = /* @__PURE__ */ Z(d);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var h = L(c);
          return h === k ? void 0 : h;
        }
        return Reflect.get(s, u, f);
      },
      getOwnPropertyDescriptor(s, u) {
        var f = Reflect.getOwnPropertyDescriptor(s, u);
        if (f && "value" in f) {
          var c = n.get(u);
          c && (f.value = L(c));
        } else if (f === void 0) {
          var v = n.get(u), h = v?.v;
          if (v !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return f;
      },
      has(s, u) {
        if (u === Ye)
          return !0;
        var f = n.get(u), c = f !== void 0 && f.v !== k || Reflect.has(s, u);
        if (f !== void 0 || g !== null && (!c || Ne(s, u)?.writable)) {
          f === void 0 && (f = o(() => {
            var h = c ? _e(s[u]) : k, d = /* @__PURE__ */ Z(h);
            return d;
          }), n.set(u, f));
          var v = L(f);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(s, u, f, c) {
        var v = n.get(u), h = u in s;
        if (r && u === "length")
          for (var d = f; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? le(a, k) : d in s && (a = o(() => /* @__PURE__ */ Z(k)), n.set(d + "", a));
          }
        if (v === void 0)
          (!h || Ne(s, u)?.writable) && (v = o(() => /* @__PURE__ */ Z(void 0)), le(v, _e(f)), n.set(u, v));
        else {
          h = v.v !== k;
          var _ = o(() => _e(f));
          le(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(s, u);
        if (m?.set && m.set.call(c, f), !h) {
          if (r && typeof u == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(u);
            Number.isInteger(y) && y >= w.v && le(w, y + 1);
          }
          Ce(i);
        }
        return !0;
      },
      ownKeys(s) {
        L(i);
        var u = Reflect.ownKeys(s).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [f, c] of n)
          c.v !== k && !(f in s) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        yn();
      }
    }
  );
}
var ot, Lt, jt, Ht;
function Xn() {
  if (ot === void 0) {
    ot = window, Lt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    jt = Ne(t, "firstChild").get, Ht = Ne(t, "nextSibling").get, it(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), it(n) && (n.__t = void 0);
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
function at(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Zn(e) {
  e.textContent = "";
}
function Jn() {
  return !1;
}
function Qn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Rn, e, void 0)
  );
}
function Yt(e) {
  var t = p, n = g;
  P(null), $(null);
  try {
    return e();
  } finally {
    P(t), $(n);
  }
}
function er(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = g;
  n !== null && (n.f & D) !== 0 && (e |= D);
  var r = {
    ctx: V,
    deps: null,
    nodes: null,
    f: e | A | M,
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
  if ((e & De) !== 0)
    de !== null ? de.push(r) : ne.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw H(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & re) !== 0 && (e & Fe) !== 0 && i !== null && (i.f |= Fe));
  }
  if (i !== null && (i.parent = n, n !== null && er(i, n), p !== null && (p.f & T) !== 0 && (e & ue) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function nt() {
  return p !== null && !z;
}
function tr(e) {
  const t = ie(He, null);
  return E(t, x), t.teardown = e, t;
}
function nr(e) {
  return ie(De | pn, e);
}
function rr(e) {
  ne.ensure();
  const t = ie(ue | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      H(t), r(void 0);
    }) : (H(t), r(void 0));
  });
}
function ir(e) {
  return ie(Je | Te, e);
}
function lr(e, t = 0) {
  return ie(He | t, e);
}
function ct(e, t = [], n = [], r = []) {
  Hn(r, t, n, (i) => {
    ie(He, () => e(...i.map(L)));
  });
}
function Bt(e, t = 0) {
  var n = ie(re | t, e);
  return n;
}
function Y(e) {
  return ie(B | Te, e);
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
function sr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && H(t), t = n;
  }
}
function H(e, t = !0) {
  var n = !1;
  (t || (e.f & _n) !== 0) && e.nodes !== null && e.nodes.end !== null && (fr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, lt), rt(e, t && !n), Me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Ut(e), e.f ^= lt, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && $t(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function fr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function $t(e) {
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
  if ((e.f & D) === 0) {
    e.f ^= D;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Fe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & re) !== 0;
      Kt(i, t, o ? n : !1), i = l;
    }
  }
}
function Gt(e) {
  Wt(e, !0);
}
function Wt(e, t) {
  if ((e.f & D) !== 0) {
    e.f ^= D, (e.f & x) === 0 && (E(e, A), ne.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Fe) !== 0 || (n.f & B) !== 0;
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
let p = null, z = !1;
function P(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let O = null;
function ur(e) {
  p !== null && (O === null ? O = [e] : O.push(e));
}
let R = null, C = 0, F = null;
function or(e) {
  F = e;
}
let Zt = 1, se = 0, fe = se;
function vt(e) {
  fe = e;
}
function Jt() {
  return ++Zt;
}
function Oe(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & T && (e.f &= ~oe), (t & U) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Oe(
        /** @type {Derived} */
        l
      ) && Pt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & M) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    q === null && E(e, x);
  }
  return !1;
}
function Qt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && we.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? Qt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, A) : (l.f & x) !== 0 && E(l, U), et(
        /** @type {Effect} */
        l
      ));
    }
}
function en(e) {
  var t = R, n = C, r = F, i = p, l = O, o = V, s = z, u = fe, f = e.f;
  R = /** @type {null | Value[]} */
  null, C = 0, F = null, p = (f & (B | ue)) === 0 ? e : null, O = null, me(e.ctx), z = !1, fe = ++se, e.ac !== null && (Yt(() => {
    e.ac.abort(G);
  }), e.ac = null);
  try {
    e.f |= Ke;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= xe;
    var h = e.deps, d = b?.is_fork;
    if (R !== null) {
      var a;
      if (d || Me(e, C), h !== null && C > 0)
        for (h.length = C + R.length, a = 0; a < R.length; a++)
          h[C + a] = R[a];
      else
        e.deps = h = R;
      if (nt() && (e.f & M) !== 0)
        for (a = C; a < h.length; a++)
          (h[a].reactions ??= []).push(e);
    } else !d && h !== null && C < h.length && (Me(e, C), h.length = C);
    if (kt() && F !== null && !z && h !== null && (e.f & (T | U | A)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      F.length; a++)
        Qt(
          F[a],
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
      F !== null && (r === null ? r = F : r.push(.../** @type {Source[]} */
      F));
    }
    return (e.f & ee) !== 0 && (e.f ^= ee), v;
  } catch (_) {
    return St(_);
  } finally {
    e.f ^= Ke, R = t, C = n, F = r, p = i, O = l, me(o), z = s, fe = u;
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
    (l.f & M) !== 0 && (l.f ^= M, l.f &= ~oe), Qe(l), Kn(l), Me(l, 0);
  }
}
function Me(e, t) {
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
      (t & (re | Et)) !== 0 ? sr(e) : rt(e), Ut(e);
      var i = en(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Zt;
      var l;
    } finally {
      qe = r, g = n;
    }
  }
}
function L(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !z) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (O === null || !we.call(O, e))) {
      var i = p.deps;
      if ((p.f & Ke) !== 0)
        e.rv < se && (e.rv = se, R === null && i !== null && i[C] === e ? C++ : R === null ? R = [e] : R.push(e));
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
      return ((o.f & x) === 0 && o.reactions !== null || nn(o)) && (s = tt(o)), te.set(o, s), s;
    }
    var u = (o.f & M) === 0 && !z && p !== null && (qe || (p.f & M) !== 0), f = (o.f & xe) === 0;
    Oe(o) && (u && (o.f |= M), Pt(o)), u && !f && (It(o), tn(o));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function tn(e) {
  if (e.f |= M, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & M) === 0 && (It(
        /** @type {Derived} */
        t
      ), tn(
        /** @type {Derived} */
        t
      ));
}
function nn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (te.has(t) || (t.f & T) !== 0 && nn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function cr(e) {
  var t = z;
  try {
    return z = !0, e();
  } finally {
    z = t;
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
const Ae = Symbol("events"), rn = /* @__PURE__ */ new Set(), Xe = /* @__PURE__ */ new Set();
function _r(e, t, n) {
  (t[Ae] ??= {})[e] = n;
}
function pr(e) {
  for (var t = 0; t < e.length; t++)
    rn.add(e[t]);
  for (var n of Xe)
    n(e);
}
let pt = null;
function gt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  pt = e;
  var o = 0, s = pt === e && e[Ae];
  if (s) {
    var u = i.indexOf(s);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ae] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    u <= f && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    on(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, v = g;
    P(null), $(null);
    try {
      for (var h, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Ae]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (m) {
          h ? d.push(m) : h = m;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (h) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Ae] = t, delete e.currentTarget, P(c), $(v);
    }
  }
}
const gr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function wr(e) {
  return (
    /** @type {string} */
    gr?.createHTML(e) ?? e
  );
}
function mr(e) {
  var t = Qn("template");
  return t.innerHTML = wr(e.replaceAll("<!>", "<!---->")), t.content;
}
function br(e, t) {
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
    r === void 0 && (r = mr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Vt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Lt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return br(l, l), l;
  };
}
function wt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function yr(e, t) {
  return Er(e, t);
}
const Pe = /* @__PURE__ */ new Map();
function Er(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: s }) {
  Xn();
  var u = void 0, f = rr(() => {
    var c = n ?? t.appendChild(Le());
    Ln(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Dn({});
        var a = (
          /** @type {ComponentContext} */
          V
        );
        l && (a.c = l), i && (r.$$events = i), u = e(d, r) || {}, Fn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!v.has(_)) {
          v.add(_);
          var m = dr(_);
          for (const N of [t, document]) {
            var w = Pe.get(N);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Pe.set(N, w));
            var y = w.get(_);
            y === void 0 ? (N.addEventListener(_, gt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return h(je(rn)), Xe.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            Pe.get(m)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, gt), a.delete(d), a.size === 0 && Pe.delete(m)) : a.set(d, _);
        }
      Xe.delete(h), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return xr.set(u, f), u;
}
let xr = /* @__PURE__ */ new WeakMap();
function Tr(e, t) {
  return t;
}
function kr(e, t, n) {
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
            Ze(e, je(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var u = r.length === 0 && n !== null;
    if (u) {
      var f = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        f.parentNode
      );
      Zn(c), c.append(f), e.items.clear();
    }
    Ze(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Ze(e, t, n = !0) {
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
var mt;
function Sr(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), u = null, f = /* @__PURE__ */ Bn(() => {
    var w = n();
    return bt(w) ? w : w == null ? [] : je(w);
  }), c, v = /* @__PURE__ */ new Map(), h = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = u, Ar(m, c, o, t, r), u !== null && (c.length === 0 ? (u.f & W) === 0 ? Gt(u) : (u.f ^= W, Re(u, null, o)) : ge(u, () => {
      u = null;
    })));
  }
  function a(w) {
    m.pending.delete(w);
  }
  var _ = Bt(() => {
    c = /** @type {V[]} */
    L(f);
    for (var w = c.length, y = /* @__PURE__ */ new Set(), N = (
      /** @type {Batch} */
      b
    ), ce = Jn(), I = 0; I < w; I += 1) {
      var ke = c[I], he = r(ke, I), S = h ? null : s.get(he);
      S ? (S.v && be(S.v, ke), S.i && be(S.i, I), ce && N.unskip_effect(S.e)) : (S = Rr(
        s,
        h ? o : mt ??= Le(),
        ke,
        he,
        I,
        i,
        t,
        n
      ), h || (S.e.f |= W), s.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !u && (h ? u = Y(() => l(o)) : (u = Y(() => l(mt ??= Le())), u.f |= W)), w > y.size && wn(), !h)
      if (v.set(N, y), ce) {
        for (const [sn, fn] of s)
          y.has(sn) || N.skip_effect(fn.e);
        N.oncommit(d), N.ondiscard(a);
      } else
        d(N);
    L(f);
  }), m = { effect: _, items: s, pending: v, outrogroups: null, fallback: u };
  h = !1;
}
function Se(e) {
  for (; e !== null && (e.f & B) === 0; )
    e = e.next;
  return e;
}
function Ar(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Se(e.effect.first), u, f = null, c = [], v = [], h, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & D) !== 0 && Gt(a), (a.f & W) !== 0)
      if (a.f ^= W, a === s)
        Re(a, null, n);
      else {
        var m = f ? f.next : s;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, f, a), J(e, a, m), Re(a, m, n), f = a, c = [], v = [], s = Se(f.next);
        continue;
      }
    if (a !== s) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < v.length) {
          var w = v[0], y;
          f = w.prev;
          var N = c[0], ce = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Re(c[y], w, n);
          for (y = 0; y < v.length; y += 1)
            u.delete(v[y]);
          J(e, N.prev, ce.next), J(e, f, N), J(e, ce, w), s = w, f = ce, _ -= 1, c = [], v = [];
        } else
          u.delete(a), Re(a, s, n), J(e, a.prev, a.next), J(e, a, f === null ? e.effect.first : f.next), J(e, f, a), f = a;
        continue;
      }
      for (c = [], v = []; s !== null && s !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Se(s.next);
      if (s === null)
        continue;
    }
    (a.f & W) === 0 && c.push(a), f = a, s = Se(a.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Ze(e, je(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || u !== void 0) {
    var I = [];
    if (u !== void 0)
      for (a of u)
        (a.f & D) === 0 && I.push(a);
    for (; s !== null; )
      (s.f & D) === 0 && s !== e.fallback && I.push(s), s = Se(s.next);
    var ke = I.length;
    if (ke > 0) {
      var he = null;
      kr(e, I, he);
    }
  }
}
function Rr(e, t, n, r, i, l, o, s) {
  var u = (o & Tn) !== 0 ? (o & Sn) === 0 ? /* @__PURE__ */ Gn(n, !1, !1) : ae(n) : null, f = (o & kn) !== 0 ? ae(i) : null;
  return {
    v: u,
    i: f,
    e: Y(() => (l(t, u ?? n, f ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function Re(e, t, n) {
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
var Nr = /* @__PURE__ */ ln("<div> </div>"), Cr = /* @__PURE__ */ ln("<div><!> <div> </div> <button>Add</button></div>");
function Dr(e) {
  let t = _e([
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Carol", age: 35 }
  ]);
  function n() {
    t.push({ name: "Dave", age: 28 });
  }
  var r = Cr(), i = Ue(r);
  Sr(i, 17, () => t, Tr, (u, f) => {
    let c = () => L(f).name, v = () => L(f).age;
    var h = Nr(), d = Ue(h);
    ct(() => _t(d, `${c() ?? ""}: ${v() ?? ""}`)), wt(u, h);
  });
  var l = at(i, 2), o = Ue(l), s = at(l, 2);
  ct(() => _t(o, `Total: ${t.length ?? ""}`)), _r("click", s, n), wt(e, r);
}
pr(["click"]);
function Mr(e) {
  return yr(Dr, { target: e });
}
export {
  Mr as default,
  Mr as rvst_mount
};

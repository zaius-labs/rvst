var Et = Array.isArray, on = Array.prototype.indexOf, we = Array.prototype.includes, je = Array.from, an = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, cn = Object.prototype, hn = Array.prototype, vn = Object.getPrototypeOf, ft = Object.isExtensible;
const dn = () => {
};
function _n(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function xt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Fe = 4, He = 8, Tt = 1 << 24, ie = 16, U = 32, ue = 64, Ge = 128, O = 512, x = 1024, A = 2048, B = 4096, M = 8192, j = 16384, xe = 32768, ut = 1 << 25, Me = 65536, ot = 1 << 17, pn = 1 << 18, Te = 1 << 19, gn = 1 << 20, Z = 1 << 25, oe = 65536, We = 1 << 21, et = 1 << 22, te = 1 << 23, Ye = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function wn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function mn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function bn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Tn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const kn = 1, Sn = 2, An = 16, Rn = 2, k = Symbol(), Nn = "http://www.w3.org/1999/xhtml";
function Cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function kt(e) {
  return e === this.v;
}
function Fn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function St(e) {
  return !Fn(e, this.v);
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
function Dn(e) {
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
function At() {
  return !0;
}
let ve = [];
function On() {
  var e = ve;
  ve = [], _n(e);
}
function pe(e) {
  if (ve.length === 0) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && On();
    });
  }
  ve.push(e);
}
function Rt(e) {
  var t = g;
  if (t === null)
    return p.f |= te, e;
  if ((t.f & xe) === 0 && (t.f & Fe) === 0)
    throw e;
  ee(e, t);
}
function ee(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ge) !== 0) {
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
const In = -7169;
function E(e, t) {
  e.f = e.f & In | t;
}
function tt(e) {
  (e.f & O) !== 0 || e.deps === null ? E(e, x) : E(e, B);
}
function Nt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & oe) === 0 || (t.f ^= oe, Nt(
        /** @type {Derived} */
        t.deps
      ));
}
function Ct(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), Nt(e.deps), E(e, x);
}
const J = /* @__PURE__ */ new Set();
let b = null, z = null, Xe = null, Ue = !1, de = null, Pe = null;
var at = 0;
let Pn = 1;
class re {
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
        E(r, B), this.schedule(r);
    }
  }
  #h() {
    if (at++ > 1e3 && (J.delete(this), qn()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), E(s, A), this.schedule(s);
      for (const s of this.#n)
        E(s, B), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = de = [], r = [], i = Pe = [];
    for (const s of t)
      try {
        this.#o(s, n, r);
      } catch (f) {
        throw Ot(s), f;
      }
    if (b = null, i.length > 0) {
      var l = re.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (de = null, Pe = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [s, f] of this.#l)
        Dt(s, f);
    } else {
      this.#r.size === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), ct(r), ct(n), this.#i?.resolve();
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
    o !== null && (J.add(o), o.#h()), J.has(this) || this.#w();
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
      var l = i.f, o = (l & (U | ue)) !== 0, s = o && (l & x) !== 0, f = s || (l & M) !== 0 || this.#l.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= x : (l & Fe) !== 0 ? n.push(i) : Oe(i) && ((l & ie) !== 0 && this.#n.add(i), Ee(i));
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
      Ct(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & te) === 0 && (this.current.set(t, [t.v, r]), z?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, z = null;
  }
  flush() {
    try {
      Ue = !0, b = this, this.#h();
    } finally {
      at = 0, Xe = null, de = null, Pe = null, Ue = !1, b = null, z = null, ne.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), J.delete(this);
  }
  #w() {
    for (const u of J) {
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
          Ft(s, i, l, o);
        if (u.#e.length > 0) {
          u.apply();
          for (var f of u.#e)
            u.#o(f, [], []);
          u.#e = [];
        }
        u.deactivate();
      }
    }
    for (const u of J)
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
    return (this.#i ??= xt()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new re();
      Ue || (J.add(b), pe(() => {
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
    if (Xe = t, t.b?.is_pending && (t.f & (Fe | He | Tt)) !== 0 && (t.f & xe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (de !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ue | U)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function qn() {
  try {
    bn();
  } catch (e) {
    ee(e, Xe);
  }
}
let G = null;
function ct(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | M)) === 0 && Oe(r) && (G = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Gt(r), G?.size > 0)) {
        ne.clear();
        for (const i of G) {
          if ((i.f & (j | M)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const f = l[s];
            (f.f & (j | M)) === 0 && Ee(f);
          }
        }
        G.clear();
      }
    }
    G = null;
  }
}
function Ft(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Ft(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (et | ie)) !== 0 && (l & A) === 0 && Mt(i, t, r) && (E(i, A), nt(
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
function nt(e) {
  b.schedule(e);
}
function Dt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Dt(n, t), n = n.next;
  }
}
function Ot(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Ot(t), t = t.next;
}
function zn(e) {
  let t = 0, n = ae(0), r;
  return () => {
    it() && (N(n), sr(() => (t === 0 && (r = hr(() => e(() => Ce(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ce(n));
      });
    })));
  };
}
var Ln = Me | Te;
function jn(e, t, n, r) {
  new Hn(e, t, n, r);
}
class Hn {
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
  #_ = zn(() => (this.#o = ae(this.#a), () => {
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
      o.b = this, o.f |= Ge, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = $t(() => {
      this.#m();
    }, Ln);
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
        Jt(this.#e, t);
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
    Ct(t, this.#d, this.#h);
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
      return re.ensure(), t();
    } catch (l) {
      return Rt(l), null;
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
        Cn();
        return;
      }
      i = !0, l && Tn(), this.#n !== null && ge(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, s = (f) => {
      try {
        l = !0, n?.(f, o), l = !1;
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
            u.b = this, u.f |= Ge, r(
              this.#s,
              () => f,
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
    pe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (u) {
        ee(u, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        s,
        /** @param {unknown} e */
        (u) => ee(u, this.#i && this.#i.parent)
      ) : s(f);
    });
  }
}
function Vn(e, t, n, r) {
  const i = Pt;
  var l = e.filter((h) => !h.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), s = Yn(), f = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((h) => h.promise)) : null;
  function u(h) {
    s();
    try {
      r(h);
    } catch (d) {
      (o.f & j) === 0 && ee(d, o);
    }
    ze();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var a = It();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Un(h))).then((h) => u([...t.map(i), ...h])).catch((h) => ee(h, o)).finally(() => a());
  }
  f ? f.then(() => {
    s(), v(), ze();
  }) : v();
}
function Yn() {
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
function It() {
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
function Pt(e) {
  var t = T | A, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Te), {
    ctx: V,
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
function Un(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && wn();
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
    ), u = xt();
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
        var v = It();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(a)?.reject(W), s.delete(a);
      else {
        for (const d of s.values())
          d.reject(W);
        s.clear();
      }
      s.set(a, u);
    }
    const h = (d, c = void 0) => {
      if (v) {
        var _ = c === W;
        v(_);
      }
      if (!(c === W || (f.f & j) !== 0)) {
        if (a.activate(), c)
          l.f |= te, be(l, c);
        else {
          (l.f & te) !== 0 && (l.f ^= te), be(l, d);
          for (const [m, w] of s) {
            if (s.delete(m), m === a) break;
            w.reject(W);
          }
        }
        a.deactivate();
      }
    };
    u.promise.then(h, (d) => h(null, d || "unknown"));
  }), nr(() => {
    for (const f of s.values())
      f.reject(W);
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
function Bn(e) {
  const t = /* @__PURE__ */ Pt(e);
  return t.equals = St, t;
}
function $n(e) {
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
function Kn(e) {
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
function rt(e) {
  var t, n = g;
  $(Kn(e));
  try {
    e.f &= ~oe, $n(e), t = nn(e);
  } finally {
    $(n);
  }
  return t;
}
function qt(e) {
  var t = e.v, n = rt(e);
  if (!e.equals(n) && (e.wv = en(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (z !== null ? (it() || b?.is_fork) && z.set(e, n) : tt(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = dn, t.ac = null, De(t, 0), lt(t));
}
function zt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let Ze = /* @__PURE__ */ new Set();
const ne = /* @__PURE__ */ new Map();
let Lt = !1;
function ae(e, t) {
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
function K(e, t) {
  const n = ae(e);
  return or(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = St), r;
}
function X(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (p.f & ot) !== 0) && At() && (p.f & (T | ie | et | ot)) !== 0 && (I === null || !we.call(I, e)) && xn();
  let r = n ? _e(t) : t;
  return be(e, r, Pe);
}
function be(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ye ? ne.set(e, t) : ne.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & A) !== 0 && rt(l), z === null && tt(l);
    }
    e.wv = en(), jt(e, A, n), g !== null && (g.f & x) !== 0 && (g.f & (U | ue)) === 0 && (D === null ? ar([e]) : D.push(e)), !i.is_fork && Ze.size > 0 && !Lt && Xn();
  }
  return t;
}
function Xn() {
  Lt = !1;
  for (const e of Ze)
    (e.f & x) !== 0 && E(e, B), Oe(e) && Ee(e);
  Ze.clear();
}
function Ce(e) {
  X(e, e.v + 1);
}
function jt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], s = o.f, f = (s & A) === 0;
      if (f && E(o, t), (s & T) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        z?.delete(u), (s & oe) === 0 && (s & O && (o.f |= oe), jt(u, B, n));
      } else if (f) {
        var a = (
          /** @type {Effect} */
          o
        );
        (s & ie) !== 0 && G !== null && G.add(a), n !== null ? n.push(a) : nt(a);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const t = vn(e);
  if (t !== cn && t !== hn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Et(e), i = /* @__PURE__ */ K(0), l = fe, o = (s) => {
    if (fe === l)
      return s();
    var f = p, u = fe;
    P(null), _t(l);
    var a = s();
    return P(f), _t(u), a;
  };
  return r && n.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && yn();
        var a = n.get(f);
        return a === void 0 ? o(() => {
          var v = /* @__PURE__ */ K(u.value);
          return n.set(f, v), v;
        }) : X(a, u.value, !0), !0;
      },
      deleteProperty(s, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in s) {
            const a = o(() => /* @__PURE__ */ K(k));
            n.set(f, a), Ce(i);
          }
        } else
          X(u, k), Ce(i);
        return !0;
      },
      get(s, f, u) {
        if (f === Ye)
          return e;
        var a = n.get(f), v = f in s;
        if (a === void 0 && (!v || Ne(s, f)?.writable) && (a = o(() => {
          var d = _e(v ? s[f] : k), c = /* @__PURE__ */ K(d);
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
        if (u !== void 0 || g !== null && (!a || Ne(s, f)?.writable)) {
          u === void 0 && (u = o(() => {
            var h = a ? _e(s[f]) : k, d = /* @__PURE__ */ K(h);
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
            c !== void 0 ? X(c, k) : d in s && (c = o(() => /* @__PURE__ */ K(k)), n.set(d + "", c));
          }
        if (v === void 0)
          (!h || Ne(s, f)?.writable) && (v = o(() => /* @__PURE__ */ K(void 0)), X(v, _e(u)), n.set(f, v));
        else {
          h = v.v !== k;
          var _ = o(() => _e(u));
          X(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(s, f);
        if (m?.set && m.set.call(a, u), !h) {
          if (r && typeof f == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(f);
            Number.isInteger(y) && y >= w.v && X(w, y + 1);
          }
          Ce(i);
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
        En();
      }
    }
  );
}
var ht, Ht, Vt, Yt;
function Zn() {
  if (ht === void 0) {
    ht = window, Ht = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Vt = Ne(t, "firstChild").get, Yt = Ne(t, "nextSibling").get, ft(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ft(n) && (n.__t = void 0);
  }
}
function Le(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ut(e) {
  return (
    /** @type {TemplateNode | null} */
    Vt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    Yt.call(e)
  );
}
function Be(e, t) {
  return /* @__PURE__ */ Ut(e);
}
function $e(e, t = 1, n = !1) {
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
    document.createElementNS(Nn, e, void 0)
  );
}
function Bt(e) {
  var t = p, n = g;
  P(null), $(null);
  try {
    return e();
  } finally {
    P(t), $(n);
  }
}
function tr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function le(e, t) {
  var n = g;
  n !== null && (n.f & M) !== 0 && (e |= M);
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
  if ((e & Fe) !== 0)
    de !== null ? de.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw H(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & ie) !== 0 && (e & Me) !== 0 && i !== null && (i.f |= Me));
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
function it() {
  return p !== null && !L;
}
function nr(e) {
  const t = le(He, null);
  return E(t, x), t.teardown = e, t;
}
function rr(e) {
  return le(Fe | gn, e);
}
function ir(e) {
  re.ensure();
  const t = le(ue | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      H(t), r(void 0);
    }) : (H(t), r(void 0));
  });
}
function lr(e) {
  return le(et | Te, e);
}
function sr(e, t = 0) {
  return le(He | t, e);
}
function vt(e, t = [], n = [], r = []) {
  Vn(r, t, n, (i) => {
    le(He, () => e(...i.map(N)));
  });
}
function $t(e, t = 0) {
  var n = le(ie | t, e);
  return n;
}
function Y(e) {
  return le(U | Te, e);
}
function Kt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    dt(!0), P(null);
    try {
      t.call(null);
    } finally {
      dt(n), P(r);
    }
  }
}
function lt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Bt(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & ue) !== 0 ? n.parent = null : H(n, t), n = r;
  }
}
function fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && H(t), t = n;
  }
}
function H(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, ut), lt(e, t && !n), De(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Kt(e), e.f ^= ut, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Gt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Gt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ge(e, t, n = !0) {
  var r = [];
  Wt(e, r, !0);
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
function Wt(e, t, n) {
  if ((e.f & M) === 0) {
    e.f ^= M;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Me) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & ie) !== 0;
      Wt(i, t, o ? n : !1), i = l;
    }
  }
}
function Xt(e) {
  Zt(e, !0);
}
function Zt(e, t) {
  if ((e.f & M) !== 0) {
    e.f ^= M, (e.f & x) === 0 && (E(e, A), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Me) !== 0 || (n.f & U) !== 0;
      Zt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Jt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let qe = !1, ye = !1;
function dt(e) {
  ye = e;
}
let p = null, L = !1;
function P(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let I = null;
function or(e) {
  p !== null && (I === null ? I = [e] : I.push(e));
}
let R = null, F = 0, D = null;
function ar(e) {
  D = e;
}
let Qt = 1, se = 0, fe = se;
function _t(e) {
  fe = e;
}
function en() {
  return ++Qt;
}
function Oe(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & T && (e.f &= ~oe), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Oe(
        /** @type {Derived} */
        l
      ) && qt(
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
function tn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(I !== null && we.call(I, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? tn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, A) : (l.f & x) !== 0 && E(l, B), nt(
        /** @type {Effect} */
        l
      ));
    }
}
function nn(e) {
  var t = R, n = F, r = D, i = p, l = I, o = V, s = L, f = fe, u = e.f;
  R = /** @type {null | Value[]} */
  null, F = 0, D = null, p = (u & (U | ue)) === 0 ? e : null, I = null, me(e.ctx), L = !1, fe = ++se, e.ac !== null && (Bt(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= We;
    var a = (
      /** @type {Function} */
      e.fn
    ), v = a();
    e.f |= xe;
    var h = e.deps, d = b?.is_fork;
    if (R !== null) {
      var c;
      if (d || De(e, F), h !== null && F > 0)
        for (h.length = F + R.length, c = 0; c < R.length; c++)
          h[F + c] = R[c];
      else
        e.deps = h = R;
      if (it() && (e.f & O) !== 0)
        for (c = F; c < h.length; c++)
          (h[c].reactions ??= []).push(e);
    } else !d && h !== null && F < h.length && (De(e, F), h.length = F);
    if (At() && D !== null && !L && h !== null && (e.f & (T | B | A)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      D.length; c++)
        tn(
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
    return (e.f & te) !== 0 && (e.f ^= te), v;
  } catch (_) {
    return Rt(_);
  } finally {
    e.f ^= We, R = t, F = n, D = r, p = i, I = l, me(o), L = s, fe = f;
  }
}
function cr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = on.call(n, e);
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
    (l.f & O) !== 0 && (l.f ^= O, l.f &= ~oe), tt(l), Gn(l), De(l, 0);
  }
}
function De(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      cr(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & j) === 0) {
    E(e, x);
    var n = g, r = qe;
    g = e, qe = !0;
    try {
      (t & (ie | Tt)) !== 0 ? fr(e) : lt(e), Kt(e);
      var i = nn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Qt;
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
      if ((p.f & We) !== 0)
        e.rv < se && (e.rv = se, R === null && i !== null && i[F] === e ? F++ : R === null ? R = [e] : R.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : we.call(l, p) || l.push(p);
      }
    }
  }
  if (ye && ne.has(e))
    return ne.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ye) {
      var s = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || ln(o)) && (s = rt(o)), ne.set(o, s), s;
    }
    var f = (o.f & O) === 0 && !L && p !== null && (qe || (p.f & O) !== 0), u = (o.f & xe) === 0;
    Oe(o) && (f && (o.f |= O), qt(o)), f && !u && (zt(o), rn(o));
  }
  if (z?.has(e))
    return z.get(e);
  if ((e.f & te) !== 0)
    throw e.v;
  return e.v;
}
function rn(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & O) === 0 && (zt(
        /** @type {Derived} */
        t
      ), rn(
        /** @type {Derived} */
        t
      ));
}
function ln(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ne.has(t) || (t.f & T) !== 0 && ln(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function hr(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const pt = globalThis.Deno?.core?.ops ?? null;
function vr(e, ...t) {
  pt?.[e] ? pt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function gt(e, t) {
  vr("op_set_text", e, t);
}
const dr = ["touchstart", "touchmove"];
function _r(e) {
  return dr.includes(e);
}
const Ae = Symbol("events"), sn = /* @__PURE__ */ new Set(), Je = /* @__PURE__ */ new Set();
function wt(e, t, n) {
  (t[Ae] ??= {})[e] = n;
}
function pr(e) {
  for (var t = 0; t < e.length; t++)
    sn.add(e[t]);
  for (var n of Je)
    n(e);
}
let mt = null;
function bt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  mt = e;
  var o = 0, s = mt === e && e[Ae];
  if (s) {
    var f = i.indexOf(s);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ae] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    f <= u && (o = f);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var a = p, v = g;
    P(null), $(null);
    try {
      for (var h, d = []; l !== null; ) {
        var c = l.assignedSlot || l.parentNode || /** @type {any} */
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
      e[Ae] = t, delete e.currentTarget, P(a), $(v);
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
  var t = er("template");
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
function st(e, t) {
  var n = (t & Rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = mr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ut(r));
    var l = (
      /** @type {TemplateNode} */
      n || Ht ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return br(l, l), l;
  };
}
function Ke(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function yr(e, t) {
  return Er(e, t);
}
const Ie = /* @__PURE__ */ new Map();
function Er(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: s }) {
  Zn();
  var f = void 0, u = ir(() => {
    var a = n ?? t.appendChild(Le());
    jn(
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
        l && (c.c = l), i && (r.$$events = i), f = e(d, r) || {}, Dn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var c = 0; c < d.length; c++) {
        var _ = d[c];
        if (!v.has(_)) {
          v.add(_);
          var m = _r(_);
          for (const C of [t, document]) {
            var w = Ie.get(C);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Ie.set(C, w));
            var y = w.get(_);
            y === void 0 ? (C.addEventListener(_, bt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return h(je(sn)), Je.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var c = (
            /** @type {Map<string, number>} */
            Ie.get(m)
          ), _ = (
            /** @type {number} */
            c.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, bt), c.delete(d), c.size === 0 && Ie.delete(m)) : c.set(d, _);
        }
      Je.delete(h), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return xr.set(f, u), f;
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
            Qe(e, je(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
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
    Qe(e, t, !f);
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
      for (const s of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(s).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= Z;
      const o = document.createDocumentFragment();
      Jt(l, o);
    } else
      H(t[i], n);
  }
}
var yt;
function Sr(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), f = null, u = /* @__PURE__ */ Bn(() => {
    var w = n();
    return Et(w) ? w : w == null ? [] : je(w);
  }), a, v = /* @__PURE__ */ new Map(), h = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = f, Ar(m, a, o, t, r), f !== null && (a.length === 0 ? (f.f & Z) === 0 ? Xt(f) : (f.f ^= Z, Re(f, null, o)) : ge(f, () => {
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
      S ? (S.v && be(S.v, ke), S.i && be(S.i, q), ce && C.unskip_effect(S.e)) : (S = Rr(
        s,
        h ? o : yt ??= Le(),
        ke,
        he,
        q,
        i,
        t,
        n
      ), h || (S.e.f |= Z), s.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !f && (h ? f = Y(() => l(o)) : (f = Y(() => l(yt ??= Le())), f.f |= Z)), w > y.size && mn(), !h)
      if (v.set(C, y), ce) {
        for (const [fn, un] of s)
          y.has(fn) || C.skip_effect(un.e);
        C.oncommit(d), C.ondiscard(c);
      } else
        d(C);
    N(u);
  }), m = { effect: _, items: s, pending: v, outrogroups: null, fallback: f };
  h = !1;
}
function Se(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Ar(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Se(e.effect.first), f, u = null, a = [], v = [], h, d, c, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), c = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(c), S.done.delete(c);
    if ((c.f & M) !== 0 && Xt(c), (c.f & Z) !== 0)
      if (c.f ^= Z, c === s)
        Re(c, null, n);
      else {
        var m = u ? u.next : s;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Q(e, u, c), Q(e, c, m), Re(c, m, n), u = c, a = [], v = [], s = Se(u.next);
        continue;
      }
    if (c !== s) {
      if (f !== void 0 && f.has(c)) {
        if (a.length < v.length) {
          var w = v[0], y;
          u = w.prev;
          var C = a[0], ce = a[a.length - 1];
          for (y = 0; y < a.length; y += 1)
            Re(a[y], w, n);
          for (y = 0; y < v.length; y += 1)
            f.delete(v[y]);
          Q(e, C.prev, ce.next), Q(e, u, C), Q(e, ce, w), s = w, u = ce, _ -= 1, a = [], v = [];
        } else
          f.delete(c), Re(c, s, n), Q(e, c.prev, c.next), Q(e, c, u === null ? e.effect.first : u.next), Q(e, u, c), u = c;
        continue;
      }
      for (a = [], v = []; s !== null && s !== c; )
        (f ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Se(s.next);
      if (s === null)
        continue;
    }
    (c.f & Z) === 0 && a.push(c), u = c, s = Se(c.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Qe(e, je(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || f !== void 0) {
    var q = [];
    if (f !== void 0)
      for (c of f)
        (c.f & M) === 0 && q.push(c);
    for (; s !== null; )
      (s.f & M) === 0 && s !== e.fallback && q.push(s), s = Se(s.next);
    var ke = q.length;
    if (ke > 0) {
      var he = null;
      kr(e, q, he);
    }
  }
}
function Rr(e, t, n, r, i, l, o, s) {
  var f = (o & kn) !== 0 ? (o & An) === 0 ? /* @__PURE__ */ Wn(n, !1, !1) : ae(n) : null, u = (o & Sn) !== 0 ? ae(i) : null;
  return {
    v: f,
    i: u,
    e: Y(() => (l(t, f ?? n, u ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function Re(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & Z) === 0 ? (
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
function Q(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Nr = /* @__PURE__ */ st('<div class="item"> </div>'), Cr = /* @__PURE__ */ st('<div class="empty">No items yet</div>'), Fr = /* @__PURE__ */ st("<div><!> <div> </div> <button>Add</button> <button>Clear</button></div>");
function Mr(e) {
  let t = /* @__PURE__ */ K(_e([]));
  function n() {
    X(t, [...N(t), `Item ${N(t).length + 1}`], !0);
  }
  function r() {
    X(t, [], !0);
  }
  var i = Fr(), l = Be(i);
  Sr(
    l,
    17,
    () => N(t),
    Tr,
    (a, v) => {
      var h = Nr(), d = Be(h);
      vt(() => gt(d, N(v))), Ke(a, h);
    },
    (a) => {
      var v = Cr();
      Ke(a, v);
    }
  );
  var o = $e(l, 2), s = Be(o), f = $e(o, 2), u = $e(f, 2);
  vt(() => gt(s, `Count: ${N(t).length ?? ""}`)), wt("click", f, n), wt("click", u, r), Ke(e, i);
}
pr(["click"]);
function Or(e) {
  return yr(Mr, { target: e });
}
export {
  Or as default,
  Or as rvst_mount
};

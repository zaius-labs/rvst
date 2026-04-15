var yt = Array.isArray, on = Array.prototype.indexOf, we = Array.prototype.includes, je = Array.from, an = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, cn = Object.prototype, hn = Array.prototype, vn = Object.getPrototypeOf, lt = Object.isExtensible;
const dn = () => {
};
function _n(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Et() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Ce = 4, He = 8, xt = 1 << 24, re = 16, U = 32, ue = 64, Ke = 128, D = 512, x = 1024, A = 2048, $ = 4096, C = 8192, z = 16384, xe = 32768, st = 1 << 25, Me = 65536, ft = 1 << 17, pn = 1 << 18, Te = 1 << 19, gn = 1 << 20, W = 1 << 25, oe = 65536, Ge = 1 << 21, Qe = 1 << 22, ee = 1 << 23, Ye = Symbol("$state"), G = new class extends Error {
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
function Fn() {
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
let H = null;
function me(e) {
  H = e;
}
function Mn(e, t = !1, n) {
  H = {
    p: H,
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
    H
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      rr(r);
  }
  return t.i = !0, H = t.p, /** @type {T} */
  {};
}
function St() {
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
    if ((t.f & Ke) !== 0) {
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
function et(e) {
  (e.f & D) !== 0 || e.deps === null ? E(e, x) : E(e, $);
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
  (e.f & A) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), Rt(e.deps), E(e, x);
}
const X = /* @__PURE__ */ new Set();
let b = null, L = null, We = null, Ue = !1, de = null, Pe = null;
var ut = 0;
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
        E(r, $), this.schedule(r);
    }
  }
  #h() {
    if (ut++ > 1e3 && (X.delete(this), Ln()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), E(s, A), this.schedule(s);
      for (const s of this.#n)
        E(s, $), this.schedule(s);
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
        Mt(s, f);
    } else {
      this.#r.size === 0 && X.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), ot(r), ot(n), this.#i?.resolve();
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
      var l = i.f, o = (l & (U | ue)) !== 0, s = o && (l & x) !== 0, f = s || (l & C) !== 0 || this.#l.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= x : (l & Ce) !== 0 ? n.push(i) : Oe(i) && ((l & re) !== 0 && this.#n.add(i), Ee(i));
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
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ee) === 0 && (this.current.set(t, [t.v, r]), L?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, L = null;
  }
  flush() {
    try {
      Ue = !0, b = this, this.#h();
    } finally {
      ut = 0, We = null, de = null, Pe = null, Ue = !1, b = null, L = null, te.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), X.delete(this);
  }
  #w() {
    for (const u of X) {
      var t = u.id < this.id, n = [];
      for (const [c, [v, h]] of this.current) {
        if (u.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(c)[0]
          );
          if (t && v !== r)
            u.current.set(c, [v, h]);
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
      Ue || (X.add(b), pe(() => {
        b === t && t.flush();
      }));
    }
    return b;
  }
  apply() {
    {
      L = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (We = t, t.b?.is_pending && (t.f & (Ce | He | xt)) !== 0 && (t.f & xe) === 0) {
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
function Ln() {
  try {
    bn();
  } catch (e) {
    Q(e, We);
  }
}
let K = null;
function ot(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | C)) === 0 && Oe(r) && (K = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Kt(r), K?.size > 0)) {
        te.clear();
        for (const i of K) {
          if ((i.f & (z | C)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            K.has(o) && (K.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const f = l[s];
            (f.f & (z | C)) === 0 && Ee(f);
          }
        }
        K.clear();
      }
    }
    K = null;
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
      ) : (l & (Qe | re)) !== 0 && (l & A) === 0 && Ct(i, t, r) && (E(i, A), tt(
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
function tt(e) {
  b.schedule(e);
}
function Mt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Mt(n, t), n = n.next;
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
    rt() && (Y(n), sr(() => (t === 0 && (r = hr(() => e(() => Fe(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Fe(n));
      });
    })));
  };
}
var zn = Me | Te;
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
      o.b = this, o.f |= Ke, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = $t(() => {
      this.#m();
    }, zn);
  }
  #w() {
    try {
      this.#e = V(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = V(() => {
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
    t && (this.is_pending = !0, this.#t = V(() => t(this.#s)), pe(() => {
      var n = this.#l = document.createDocumentFragment(), r = ze();
      n.append(r), this.#e = this.#g(() => V(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, ge(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = V(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Zt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = V(() => n(this.#s));
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
    var n = g, r = p, i = H;
    B(this.#i), I(this.#i), me(this.#i.ctx);
    try {
      return ne.ensure(), t();
    } catch (l) {
      return At(l), null;
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
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, pe(() => {
      this.#c = !1, this.#o && be(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), Y(
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
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Fn();
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
        Q(u, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return V(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= Ke, r(
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
function Vn(e, t, n, r) {
  const i = It;
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
      (o.f & z) === 0 && Q(d, o);
    }
    qe();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var c = Ot();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Un(h))).then((h) => u([...t.map(i), ...h])).catch((h) => Q(h, o)).finally(() => c());
  }
  f ? f.then(() => {
    s(), v(), qe();
  }) : v();
}
function Yn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = H, r = (
    /** @type {Batch} */
    b
  );
  return function(l = !0) {
    B(e), I(t), me(n), l && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function qe(e = !0) {
  B(null), I(null), me(null), e && b?.deactivate();
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
function It(e) {
  var t = T | A, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Te), {
    ctx: H,
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
    ), u = Et();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(qe);
    } catch (d) {
      u.reject(d), qe();
    }
    var c = (
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
        s.get(c)?.reject(G), s.delete(c);
      else {
        for (const d of s.values())
          d.reject(G);
        s.clear();
      }
      s.set(c, u);
    }
    const h = (d, a = void 0) => {
      if (v) {
        var _ = a === G;
        v(_);
      }
      if (!(a === G || (f.f & z) !== 0)) {
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
    u.promise.then(h, (d) => h(null, d || "unknown"));
  }), nr(() => {
    for (const f of s.values())
      f.reject(G);
  }), new Promise((f) => {
    function u(c) {
      function v() {
        c === i ? f(l) : u(i);
      }
      c.then(v, v);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function $n(e) {
  const t = /* @__PURE__ */ It(e);
  return t.equals = kt, t;
}
function Bn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      j(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Kn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function nt(e) {
  var t, n = g;
  B(Kn(e));
  try {
    e.f &= ~oe, Bn(e), t = tn(e);
  } finally {
    B(n);
  }
  return t;
}
function Pt(e) {
  var t = e.v, n = nt(e);
  if (!e.equals(n) && (e.wv = Qt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (L !== null ? (rt() || b?.is_fork) && L.set(e, n) : et(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(G), t.teardown = dn, t.ac = null, De(t, 0), it(t));
}
function Lt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let Xe = /* @__PURE__ */ new Set();
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
  return or(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = kt), r;
}
function le(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!q || (p.f & ft) !== 0) && St() && (p.f & (T | re | Qe | ft)) !== 0 && (O === null || !we.call(O, e)) && xn();
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
      (e.f & A) !== 0 && nt(l), L === null && et(l);
    }
    e.wv = Qt(), zt(e, A, n), g !== null && (g.f & x) !== 0 && (g.f & (U | ue)) === 0 && (M === null ? ar([e]) : M.push(e)), !i.is_fork && Xe.size > 0 && !qt && Xn();
  }
  return t;
}
function Xn() {
  qt = !1;
  for (const e of Xe)
    (e.f & x) !== 0 && E(e, $), Oe(e) && Ee(e);
  Xe.clear();
}
function Fe(e) {
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
        L?.delete(u), (s & oe) === 0 && (s & D && (o.f |= oe), zt(u, $, n));
      } else if (f) {
        var c = (
          /** @type {Effect} */
          o
        );
        (s & re) !== 0 && K !== null && K.add(c), n !== null ? n.push(c) : tt(c);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const t = vn(e);
  if (t !== cn && t !== hn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = yt(e), i = /* @__PURE__ */ Z(0), l = fe, o = (s) => {
    if (fe === l)
      return s();
    var f = p, u = fe;
    I(null), vt(l);
    var c = s();
    return I(f), vt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ Z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && yn();
        var c = n.get(f);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ Z(u.value);
          return n.set(f, v), v;
        }) : le(c, u.value, !0), !0;
      },
      deleteProperty(s, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in s) {
            const c = o(() => /* @__PURE__ */ Z(k));
            n.set(f, c), Fe(i);
          }
        } else
          le(u, k), Fe(i);
        return !0;
      },
      get(s, f, u) {
        if (f === Ye)
          return e;
        var c = n.get(f), v = f in s;
        if (c === void 0 && (!v || Ne(s, f)?.writable) && (c = o(() => {
          var d = _e(v ? s[f] : k), a = /* @__PURE__ */ Z(d);
          return a;
        }), n.set(f, c)), c !== void 0) {
          var h = Y(c);
          return h === k ? void 0 : h;
        }
        return Reflect.get(s, f, u);
      },
      getOwnPropertyDescriptor(s, f) {
        var u = Reflect.getOwnPropertyDescriptor(s, f);
        if (u && "value" in u) {
          var c = n.get(f);
          c && (u.value = Y(c));
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
        var u = n.get(f), c = u !== void 0 && u.v !== k || Reflect.has(s, f);
        if (u !== void 0 || g !== null && (!c || Ne(s, f)?.writable)) {
          u === void 0 && (u = o(() => {
            var h = c ? _e(s[f]) : k, d = /* @__PURE__ */ Z(h);
            return d;
          }), n.set(f, u));
          var v = Y(u);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(s, f, u, c) {
        var v = n.get(f), h = f in s;
        if (r && f === "length")
          for (var d = u; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? le(a, k) : d in s && (a = o(() => /* @__PURE__ */ Z(k)), n.set(d + "", a));
          }
        if (v === void 0)
          (!h || Ne(s, f)?.writable) && (v = o(() => /* @__PURE__ */ Z(void 0)), le(v, _e(u)), n.set(f, v));
        else {
          h = v.v !== k;
          var _ = o(() => _e(u));
          le(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(s, f);
        if (m?.set && m.set.call(c, u), !h) {
          if (r && typeof f == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(f);
            Number.isInteger(y) && y >= w.v && le(w, y + 1);
          }
          Fe(i);
        }
        return !0;
      },
      ownKeys(s) {
        Y(i);
        var f = Reflect.ownKeys(s).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [u, c] of n)
          c.v !== k && !(u in s) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        En();
      }
    }
  );
}
var at, jt, Ht, Vt;
function Zn() {
  if (at === void 0) {
    at = window, jt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ht = Ne(t, "firstChild").get, Vt = Ne(t, "nextSibling").get, lt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), lt(n) && (n.__t = void 0);
  }
}
function ze(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ht.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    Vt.call(e)
  );
}
function $e(e, t) {
  return /* @__PURE__ */ Yt(e);
}
function Be(e, t = 1, n = !1) {
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
function Ut(e) {
  var t = p, n = g;
  I(null), B(null);
  try {
    return e();
  } finally {
    I(t), B(n);
  }
}
function tr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = g;
  n !== null && (n.f & C) !== 0 && (e |= C);
  var r = {
    ctx: H,
    deps: null,
    nodes: null,
    f: e | A | D,
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
      throw j(r), o;
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
function rt() {
  return p !== null && !q;
}
function nr(e) {
  const t = ie(He, null);
  return E(t, x), t.teardown = e, t;
}
function rr(e) {
  return ie(Ce | gn, e);
}
function ir(e) {
  ne.ensure();
  const t = ie(ue | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function lr(e) {
  return ie(Qe | Te, e);
}
function sr(e, t = 0) {
  return ie(He | t, e);
}
function ct(e, t = [], n = [], r = []) {
  Vn(r, t, n, (i) => {
    ie(He, () => e(...i.map(Y)));
  });
}
function $t(e, t = 0) {
  var n = ie(re | t, e);
  return n;
}
function V(e) {
  return ie(U | Te, e);
}
function Bt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    ht(!0), I(null);
    try {
      t.call(null);
    } finally {
      ht(n), I(r);
    }
  }
}
function it(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ut(() => {
      i.abort(G);
    });
    var r = n.next;
    (n.f & ue) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, st), it(e, t && !n), De(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Bt(e), e.f ^= st, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Kt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Kt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ge(e, t, n = !0) {
  var r = [];
  Gt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var s of r)
      s.out(o);
  } else
    i();
}
function Gt(e, t, n) {
  if ((e.f & C) === 0) {
    e.f ^= C;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Me) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & re) !== 0;
      Gt(i, t, o ? n : !1), i = l;
    }
  }
}
function Wt(e) {
  Xt(e, !0);
}
function Xt(e, t) {
  if ((e.f & C) !== 0) {
    e.f ^= C, (e.f & x) === 0 && (E(e, A), ne.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Me) !== 0 || (n.f & U) !== 0;
      Xt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Zt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let Le = !1, ye = !1;
function ht(e) {
  ye = e;
}
let p = null, q = !1;
function I(e) {
  p = e;
}
let g = null;
function B(e) {
  g = e;
}
let O = null;
function or(e) {
  p !== null && (O === null ? O = [e] : O.push(e));
}
let R = null, F = 0, M = null;
function ar(e) {
  M = e;
}
let Jt = 1, se = 0, fe = se;
function vt(e) {
  fe = e;
}
function Qt() {
  return ++Jt;
}
function Oe(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & T && (e.f &= ~oe), (t & $) !== 0) {
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
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    L === null && E(e, x);
  }
  return !1;
}
function en(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && we.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? en(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, A) : (l.f & x) !== 0 && E(l, $), tt(
        /** @type {Effect} */
        l
      ));
    }
}
function tn(e) {
  var t = R, n = F, r = M, i = p, l = O, o = H, s = q, f = fe, u = e.f;
  R = /** @type {null | Value[]} */
  null, F = 0, M = null, p = (u & (U | ue)) === 0 ? e : null, O = null, me(e.ctx), q = !1, fe = ++se, e.ac !== null && (Ut(() => {
    e.ac.abort(G);
  }), e.ac = null);
  try {
    e.f |= Ge;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= xe;
    var h = e.deps, d = b?.is_fork;
    if (R !== null) {
      var a;
      if (d || De(e, F), h !== null && F > 0)
        for (h.length = F + R.length, a = 0; a < R.length; a++)
          h[F + a] = R[a];
      else
        e.deps = h = R;
      if (rt() && (e.f & D) !== 0)
        for (a = F; a < h.length; a++)
          (h[a].reactions ??= []).push(e);
    } else !d && h !== null && F < h.length && (De(e, F), h.length = F);
    if (St() && M !== null && !q && h !== null && (e.f & (T | $ | A)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      M.length; a++)
        en(
          M[a],
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
      M !== null && (r === null ? r = M : r.push(.../** @type {Source[]} */
      M));
    }
    return (e.f & ee) !== 0 && (e.f ^= ee), v;
  } catch (_) {
    return At(_);
  } finally {
    e.f ^= Ge, R = t, F = n, M = r, p = i, O = l, me(o), q = s, fe = f;
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
    (l.f & D) !== 0 && (l.f ^= D, l.f &= ~oe), et(l), Gn(l), De(l, 0);
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
  if ((t & z) === 0) {
    E(e, x);
    var n = g, r = Le;
    g = e, Le = !0;
    try {
      (t & (re | xt)) !== 0 ? fr(e) : it(e), Bt(e);
      var i = tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var l;
    } finally {
      Le = r, g = n;
    }
  }
}
function Y(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !q) {
    var r = g !== null && (g.f & z) !== 0;
    if (!r && (O === null || !we.call(O, e))) {
      var i = p.deps;
      if ((p.f & Ge) !== 0)
        e.rv < se && (e.rv = se, R === null && i !== null && i[F] === e ? F++ : R === null ? R = [e] : R.push(e));
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
      return ((o.f & x) === 0 && o.reactions !== null || rn(o)) && (s = nt(o)), te.set(o, s), s;
    }
    var f = (o.f & D) === 0 && !q && p !== null && (Le || (p.f & D) !== 0), u = (o.f & xe) === 0;
    Oe(o) && (f && (o.f |= D), Pt(o)), f && !u && (Lt(o), nn(o));
  }
  if (L?.has(e))
    return L.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function nn(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & D) === 0 && (Lt(
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
function hr(e) {
  var t = q;
  try {
    return q = !0, e();
  } finally {
    q = t;
  }
}
const dt = globalThis.Deno?.core?.ops ?? null;
function vr(e, ...t) {
  dt?.[e] ? dt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function _t(e, t) {
  vr("op_set_text", e, t);
}
const dr = ["touchstart", "touchmove"];
function _r(e) {
  return dr.includes(e);
}
const Ae = Symbol("events"), ln = /* @__PURE__ */ new Set(), Ze = /* @__PURE__ */ new Set();
function pt(e, t, n) {
  (t[Ae] ??= {})[e] = n;
}
function pr(e) {
  for (var t = 0; t < e.length; t++)
    ln.add(e[t]);
  for (var n of Ze)
    n(e);
}
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
  var o = 0, s = gt === e && e[Ae];
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
    var c = p, v = g;
    I(null), B(null);
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
      e[Ae] = t, delete e.currentTarget, I(c), B(v);
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
function sn(e, t) {
  var n = (t & Rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = mr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Yt(r));
    var l = (
      /** @type {TemplateNode} */
      n || jt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return br(l, l), l;
  };
}
function mt(e, t) {
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
    var c = n ?? t.appendChild(ze());
    jn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Mn({});
        var a = (
          /** @type {ComponentContext} */
          H
        );
        l && (a.c = l), i && (r.$$events = i), f = e(d, r) || {}, Dn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!v.has(_)) {
          v.add(_);
          var m = _r(_);
          for (const N of [t, document]) {
            var w = Ie.get(N);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Ie.set(N, w));
            var y = w.get(_);
            y === void 0 ? (N.addEventListener(_, wt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return h(je(ln)), Ze.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            Ie.get(m)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, wt), a.delete(d), a.size === 0 && Ie.delete(m)) : a.set(d, _);
        }
      Ze.delete(h), c !== n && c.parentNode?.removeChild(c);
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
            Je(e, je(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
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
      ), c = (
        /** @type {Element} */
        u.parentNode
      );
      Jn(c), c.append(u), e.items.clear();
    }
    Je(e, t, !f);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Je(e, t, n = !0) {
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
      Zt(l, o);
    } else
      j(t[i], n);
  }
}
var bt;
function Sr(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), f = null, u = /* @__PURE__ */ $n(() => {
    var w = n();
    return yt(w) ? w : w == null ? [] : je(w);
  }), c, v = /* @__PURE__ */ new Map(), h = !0;
  function d(w) {
    (m.effect.f & z) === 0 && (m.pending.delete(w), m.fallback = f, Ar(m, c, o, t, r), f !== null && (c.length === 0 ? (f.f & W) === 0 ? Wt(f) : (f.f ^= W, Re(f, null, o)) : ge(f, () => {
      f = null;
    })));
  }
  function a(w) {
    m.pending.delete(w);
  }
  var _ = $t(() => {
    c = /** @type {V[]} */
    Y(u);
    for (var w = c.length, y = /* @__PURE__ */ new Set(), N = (
      /** @type {Batch} */
      b
    ), ce = Qn(), P = 0; P < w; P += 1) {
      var ke = c[P], he = r(ke, P), S = h ? null : s.get(he);
      S ? (S.v && be(S.v, ke), S.i && be(S.i, P), ce && N.unskip_effect(S.e)) : (S = Rr(
        s,
        h ? o : bt ??= ze(),
        ke,
        he,
        P,
        i,
        t,
        n
      ), h || (S.e.f |= W), s.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !f && (h ? f = V(() => l(o)) : (f = V(() => l(bt ??= ze())), f.f |= W)), w > y.size && mn(), !h)
      if (v.set(N, y), ce) {
        for (const [fn, un] of s)
          y.has(fn) || N.skip_effect(un.e);
        N.oncommit(d), N.ondiscard(a);
      } else
        d(N);
    Y(u);
  }), m = { effect: _, items: s, pending: v, outrogroups: null, fallback: f };
  h = !1;
}
function Se(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Ar(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Se(e.effect.first), f, u = null, c = [], v = [], h, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & C) !== 0 && Wt(a), (a.f & W) !== 0)
      if (a.f ^= W, a === s)
        Re(a, null, n);
      else {
        var m = u ? u.next : s;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, u, a), J(e, a, m), Re(a, m, n), u = a, c = [], v = [], s = Se(u.next);
        continue;
      }
    if (a !== s) {
      if (f !== void 0 && f.has(a)) {
        if (c.length < v.length) {
          var w = v[0], y;
          u = w.prev;
          var N = c[0], ce = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Re(c[y], w, n);
          for (y = 0; y < v.length; y += 1)
            f.delete(v[y]);
          J(e, N.prev, ce.next), J(e, u, N), J(e, ce, w), s = w, u = ce, _ -= 1, c = [], v = [];
        } else
          f.delete(a), Re(a, s, n), J(e, a.prev, a.next), J(e, a, u === null ? e.effect.first : u.next), J(e, u, a), u = a;
        continue;
      }
      for (c = [], v = []; s !== null && s !== a; )
        (f ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Se(s.next);
      if (s === null)
        continue;
    }
    (a.f & W) === 0 && c.push(a), u = a, s = Se(a.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Je(e, je(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || f !== void 0) {
    var P = [];
    if (f !== void 0)
      for (a of f)
        (a.f & C) === 0 && P.push(a);
    for (; s !== null; )
      (s.f & C) === 0 && s !== e.fallback && P.push(s), s = Se(s.next);
    var ke = P.length;
    if (ke > 0) {
      var he = null;
      kr(e, P, he);
    }
  }
}
function Rr(e, t, n, r, i, l, o, s) {
  var f = (o & kn) !== 0 ? (o & An) === 0 ? /* @__PURE__ */ Wn(n, !1, !1) : ae(n) : null, u = (o & Sn) !== 0 ? ae(i) : null;
  return {
    v: f,
    i: u,
    e: V(() => (l(t, f ?? n, u ?? i, s), () => {
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
var Nr = /* @__PURE__ */ sn("<div> </div>"), Fr = /* @__PURE__ */ sn("<div><!> <div> </div> <button>Add Fig</button> <button>Remove Last</button></div>");
function Cr(e) {
  let t = _e(["apple", "banana", "cherry"]);
  function n() {
    t.push("fig");
  }
  function r() {
    t.pop();
  }
  var i = Fr(), l = $e(i);
  Sr(l, 17, () => t, Tr, (c, v, h) => {
    var d = Nr(), a = $e(d);
    ct(() => _t(a, `${h}: ${Y(v) ?? ""}`)), mt(c, d);
  });
  var o = Be(l, 2), s = $e(o), f = Be(o, 2), u = Be(f, 2);
  ct(() => _t(s, `Total: ${t.length ?? ""}`)), pt("click", f, n), pt("click", u, r), mt(e, i);
}
pr(["click"]);
function Dr(e) {
  return yr(Cr, { target: e });
}
export {
  Dr as default,
  Dr as rvst_mount
};

var yt = Array.isArray, on = Array.prototype.indexOf, we = Array.prototype.includes, He = Array.from, an = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, cn = Object.prototype, vn = Array.prototype, hn = Object.getPrototypeOf, lt = Object.isExtensible;
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
const T = 2, Fe = 4, Ve = 8, xt = 1 << 24, re = 16, B = 32, ue = 64, Ke = 128, O = 512, x = 1024, R = 2048, U = 4096, D = 8192, j = 16384, xe = 32768, st = 1 << 25, De = 65536, ft = 1 << 17, pn = 1 << 18, Te = 1 << 19, gn = 1 << 20, Z = 1 << 25, oe = 65536, Ge = 1 << 21, Qe = 1 << 22, ee = 1 << 23, Be = Symbol("$state"), W = new class extends Error {
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
function Tt(e) {
  return e === this.v;
}
function Fn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function kt(e) {
  return !Fn(e, this.v);
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
function Mn(e) {
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
let he = [];
function On() {
  var e = he;
  he = [], _n(e);
}
function pe(e) {
  if (he.length === 0) {
    var t = he;
    queueMicrotask(() => {
      t === he && On();
    });
  }
  he.push(e);
}
function At(e) {
  var t = g;
  if (t === null)
    return p.f |= ee, e;
  if ((t.f & xe) === 0 && (t.f & Fe) === 0)
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
const Pn = -7169;
function E(e, t) {
  e.f = e.f & Pn | t;
}
function et(e) {
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
  (e.f & R) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), Rt(e.deps), E(e, x);
}
const le = /* @__PURE__ */ new Set();
let b = null, L = null, We = null, Ue = !1, de = null, qe = null;
var ut = 0;
let In = 1;
class ne {
  // for debugging. TODO remove once async is stable
  id = In++;
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #d = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #s = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #f = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #r = null;
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
  #u = !1;
  #o() {
    return this.is_fork || this.#f > 0;
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
        E(r, U), this.schedule(r);
    }
  }
  #c() {
    if (ut++ > 1e3 && (le.delete(this), qn()), !this.#o()) {
      for (const f of this.#t)
        this.#n.delete(f), E(f, R), this.schedule(f);
      for (const f of this.#n)
        E(f, U), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = de = [], r = [], i = qe = [];
    for (const f of t)
      try {
        this.#v(f, n, r);
      } catch (s) {
        throw Mt(f), s;
      }
    if (b = null, i.length > 0) {
      var l = ne.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (de = null, qe = null, this.#o()) {
      this.#h(r), this.#h(n);
      for (const [f, s] of this.#l)
        Dt(f, s);
    } else {
      this.#s === 0 && le.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), ot(r), ot(n), this.#r?.resolve();
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
    o !== null && (le.add(o), o.#c()), le.has(this) || this.#a();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #v(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & (B | ue)) !== 0, f = o && (l & x) !== 0, s = f || (l & D) !== 0 || this.#l.has(i);
      if (!s && i.fn !== null) {
        o ? i.f ^= x : (l & Fe) !== 0 ? n.push(i) : Oe(i) && ((l & re) !== 0 && this.#n.add(i), Ee(i));
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
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Nt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ee) === 0 && (this.current.set(t, t.v), L?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, L = null;
  }
  flush() {
    try {
      Ue = !0, b = this, this.#c();
    } finally {
      ut = 0, We = null, de = null, qe = null, Ue = !1, b = null, L = null, te.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), le.delete(this);
  }
  #a() {
    for (const s of le) {
      var t = s.id < this.id, n = [];
      for (const [u, c] of this.current) {
        if (s.current.has(u))
          if (t && c !== s.current.get(u))
            s.current.set(u, c);
          else
            continue;
        n.push(u);
      }
      var r = [...s.current.keys()].filter((u) => !this.current.has(u));
      if (r.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
        for (var o of n)
          Ct(o, r, i, l);
        if (s.#e.length > 0) {
          s.apply();
          for (var f of s.#e)
            s.#v(f, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#s += 1, t && (this.#f += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#s -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, pe(() => {
      this.#u = !1, this.flush();
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
    this.#i.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#d.add(t);
  }
  settled() {
    return (this.#r ??= Et()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new ne();
      Ue || (le.add(b), pe(() => {
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
    if (We = t, t.b?.is_pending && (t.f & (Fe | Ve | xt)) !== 0 && (t.f & xe) === 0) {
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
function qn() {
  try {
    bn();
  } catch (e) {
    Q(e, We);
  }
}
let G = null;
function ot(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | D)) === 0 && Oe(r) && (G = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Kt(r), G?.size > 0)) {
        te.clear();
        for (const i of G) {
          if ((i.f & (j | D)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const s = l[f];
            (s.f & (j | D)) === 0 && Ee(s);
          }
        }
        G.clear();
      }
    }
    G = null;
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
      ) : (l & (Qe | re)) !== 0 && (l & R) === 0 && Ft(i, t, r) && (E(i, R), tt(
        /** @type {Effect} */
        i
      ));
    }
}
function Ft(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (we.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ft(
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
function Dt(e, t) {
  if (!((e.f & B) !== 0 && (e.f & x) !== 0)) {
    (e.f & R) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Dt(n, t), n = n.next;
  }
}
function Mt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Mt(t), t = t.next;
}
function Ln(e) {
  let t = 0, n = ae(0), r;
  return () => {
    rt() && (A(n), sr(() => (t === 0 && (r = vr(() => e(() => Ce(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ce(n));
      });
    })));
  };
}
var zn = De | Te;
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
  #i;
  /** @type {TemplateNode | null} */
  #d = null;
  /** @type {BoundaryProps} */
  #s;
  /** @type {((anchor: Node) => void)} */
  #f;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #t = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {DocumentFragment | null} */
  #l = null;
  #u = 0;
  #o = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
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
  #m = Ln(() => (this.#a = ae(this.#u), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#s = n, this.#f = (l) => {
      var o = (
        /** @type {Effect} */
        g
      );
      o.b = this, o.f |= Ke, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#r = Ut(() => {
      this.#g();
    }, zn);
  }
  #b() {
    try {
      this.#e = Y(() => this.#f(this.#i));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#s.failed;
    n && (this.#n = Y(() => {
      n(
        this.#i,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#s.pending;
    t && (this.is_pending = !0, this.#t = Y(() => t(this.#i)), pe(() => {
      var n = this.#l = document.createDocumentFragment(), r = je();
      n.append(r), this.#e = this.#p(() => Y(() => this.#f(r))), this.#o === 0 && (this.#i.before(n), this.#l = null, ge(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#_(
        /** @type {Batch} */
        b
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#u = 0, this.#e = Y(() => {
        this.#f(this.#i);
      }), this.#o > 0) {
        var t = this.#l = document.createDocumentFragment();
        Zt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#s.pending
        );
        this.#t = Y(() => n(this.#i));
      } else
        this.#_(
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
  #_(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Nt(t, this.#v, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#s.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var n = g, r = p, i = V;
    $(this.#r), I(this.#r), me(this.#r.ctx);
    try {
      return ne.ensure(), t();
    } catch (l) {
      return At(l), null;
    } finally {
      $(n), I(r), me(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #w(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#w(t, n);
      return;
    }
    this.#o += t, this.#o === 0 && (this.#_(n), this.#t && ge(this.#t, () => {
      this.#t = null;
    }), this.#l && (this.#i.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#w(t, n), this.#u += t, !(!this.#a || this.#c) && (this.#c = !0, pe(() => {
      this.#c = !1, this.#a && be(this.#a, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), A(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#s.onerror;
    let r = this.#s.failed;
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
      }), this.#p(() => {
        this.#g();
      });
    }, f = (s) => {
      try {
        l = !0, n?.(s, o), l = !1;
      } catch (u) {
        Q(u, this.#r && this.#r.parent);
      }
      r && (this.#n = this.#p(() => {
        try {
          return Y(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= Ke, r(
              this.#i,
              () => s,
              () => o
            );
          });
        } catch (u) {
          return Q(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    pe(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (u) {
        Q(u, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        f,
        /** @param {unknown} e */
        (u) => Q(u, this.#r && this.#r.parent)
      ) : f(s);
    });
  }
}
function Vn(e, t, n, r) {
  const i = Pt;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = Yn(), s = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function u(v) {
    f();
    try {
      r(v);
    } catch (d) {
      (o.f & j) === 0 && Q(d, o);
    }
    ze();
  }
  if (n.length === 0) {
    s.then(() => u(t.map(i)));
    return;
  }
  var c = Ot();
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ Bn(v))).then((v) => u([...t.map(i), ...v])).catch((v) => Q(v, o)).finally(() => c());
  }
  s ? s.then(() => {
    f(), h(), ze();
  }) : h();
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
    $(e), I(t), me(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function ze(e = !0) {
  $(null), I(null), me(null), e && b?.deactivate();
}
function Ot() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    g.b
  ), t = (
    /** @type {Batch} */
    b
  ), n = e.is_rendered();
  return e.update_pending_count(1, t), t.increment(n), (r = !1) => {
    e.update_pending_count(-1, t), t.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function Pt(e) {
  var t = T | R, n = p !== null && (p.f & T) !== 0 ? (
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
function Bn(e, t, n) {
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
  ), o = !p, f = /* @__PURE__ */ new Map();
  return lr(() => {
    var s = (
      /** @type {Effect} */
      g
    ), u = Et();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(ze);
    } catch (d) {
      u.reject(d), ze();
    }
    var c = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((s.f & xe) !== 0)
        var h = Ot();
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
          l.f |= ee, be(l, a);
        else {
          (l.f & ee) !== 0 && (l.f ^= ee), be(l, d);
          for (const [m, w] of f) {
            if (f.delete(m), m === c) break;
            w.reject(W);
          }
        }
        c.deactivate();
      }
    };
    u.promise.then(v, (d) => v(null, d || "unknown"));
  }), nr(() => {
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
function Un(e) {
  const t = /* @__PURE__ */ Pt(e);
  return t.equals = kt, t;
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
function nt(e) {
  var t, n = g;
  $(Kn(e));
  try {
    e.f &= ~oe, $n(e), t = tn(e);
  } finally {
    $(n);
  }
  return t;
}
function It(e) {
  var t = e.v, n = nt(e);
  if (!e.equals(n) && (e.wv = Qt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (L !== null ? (rt() || b?.is_fork) && L.set(e, n) : et(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = dn, t.ac = null, Me(t, 0), it(t));
}
function qt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let Xe = /* @__PURE__ */ new Set();
const te = /* @__PURE__ */ new Map();
let Lt = !1;
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
function K(e, t) {
  const n = ae(e);
  return or(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = kt), r;
}
function X(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!z || (p.f & ft) !== 0) && St() && (p.f & (T | re | Qe | ft)) !== 0 && (P === null || !we.call(P, e)) && xn();
  let r = n ? _e(t) : t;
  return be(e, r, qe);
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
      (e.f & R) !== 0 && nt(l), L === null && et(l);
    }
    e.wv = Qt(), zt(e, R, n), g !== null && (g.f & x) !== 0 && (g.f & (B | ue)) === 0 && (M === null ? ar([e]) : M.push(e)), !i.is_fork && Xe.size > 0 && !Lt && Xn();
  }
  return t;
}
function Xn() {
  Lt = !1;
  for (const e of Xe)
    (e.f & x) !== 0 && E(e, U), Oe(e) && Ee(e);
  Xe.clear();
}
function Ce(e) {
  X(e, e.v + 1);
}
function zt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, s = (f & R) === 0;
      if (s && E(o, t), (f & T) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        L?.delete(u), (f & oe) === 0 && (f & O && (o.f |= oe), zt(u, U, n));
      } else if (s) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & re) !== 0 && G !== null && G.add(c), n !== null ? n.push(c) : tt(c);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Be in e)
    return e;
  const t = hn(e);
  if (t !== cn && t !== vn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = yt(e), i = /* @__PURE__ */ K(0), l = fe, o = (f) => {
    if (fe === l)
      return f();
    var s = p, u = fe;
    I(null), ht(l);
    var c = f();
    return I(s), ht(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && yn();
        var c = n.get(s);
        return c === void 0 ? o(() => {
          var h = /* @__PURE__ */ K(u.value);
          return n.set(s, h), h;
        }) : X(c, u.value, !0), !0;
      },
      deleteProperty(f, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in f) {
            const c = o(() => /* @__PURE__ */ K(k));
            n.set(s, c), Ce(i);
          }
        } else
          X(u, k), Ce(i);
        return !0;
      },
      get(f, s, u) {
        if (s === Be)
          return e;
        var c = n.get(s), h = s in f;
        if (c === void 0 && (!h || Ne(f, s)?.writable) && (c = o(() => {
          var d = _e(h ? f[s] : k), a = /* @__PURE__ */ K(d);
          return a;
        }), n.set(s, c)), c !== void 0) {
          var v = A(c);
          return v === k ? void 0 : v;
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
          if (h !== void 0 && v !== k)
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
        if (s === Be)
          return !0;
        var u = n.get(s), c = u !== void 0 && u.v !== k || Reflect.has(f, s);
        if (u !== void 0 || g !== null && (!c || Ne(f, s)?.writable)) {
          u === void 0 && (u = o(() => {
            var v = c ? _e(f[s]) : k, d = /* @__PURE__ */ K(v);
            return d;
          }), n.set(s, u));
          var h = A(u);
          if (h === k)
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
            a !== void 0 ? X(a, k) : d in f && (a = o(() => /* @__PURE__ */ K(k)), n.set(d + "", a));
          }
        if (h === void 0)
          (!v || Ne(f, s)?.writable) && (h = o(() => /* @__PURE__ */ K(void 0)), X(h, _e(u)), n.set(s, h));
        else {
          v = h.v !== k;
          var _ = o(() => _e(u));
          X(h, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(f, s);
        if (m?.set && m.set.call(c, u), !v) {
          if (r && typeof s == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(s);
            Number.isInteger(y) && y >= w.v && X(w, y + 1);
          }
          Ce(i);
        }
        return !0;
      },
      ownKeys(f) {
        A(i);
        var s = Reflect.ownKeys(f).filter((h) => {
          var v = n.get(h);
          return v === void 0 || v.v !== k;
        });
        for (var [u, c] of n)
          c.v !== k && !(u in f) && s.push(u);
        return s;
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
function je(e = "") {
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
function Ye(e) {
  return (
    /** @type {TemplateNode | null} */
    Vt.call(e)
  );
}
function Pe(e, t) {
  return /* @__PURE__ */ Yt(e);
}
function $e(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ye(r);
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
  I(null), $(null);
  try {
    return e();
  } finally {
    I(t), $(n);
  }
}
function tr(e, t) {
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
    f: e | R | O,
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
    de !== null ? de.push(r) : ne.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw H(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & re) !== 0 && (e & De) !== 0 && i !== null && (i.f |= De));
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
  return p !== null && !z;
}
function nr(e) {
  const t = ie(Ve, null);
  return E(t, x), t.teardown = e, t;
}
function rr(e) {
  return ie(Fe | gn, e);
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
  return ie(Qe | Te, e);
}
function sr(e, t = 0) {
  return ie(Ve | t, e);
}
function ct(e, t = [], n = [], r = []) {
  Vn(r, t, n, (i) => {
    ie(Ve, () => e(...i.map(A)));
  });
}
function Ut(e, t = 0) {
  var n = ie(re | t, e);
  return n;
}
function Y(e) {
  return ie(B | Te, e);
}
function $t(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    vt(!0), I(null);
    try {
      t.call(null);
    } finally {
      vt(n), I(r);
    }
  }
}
function it(e, t = !1) {
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
    (t.f & B) === 0 && H(t), t = n;
  }
}
function H(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, st), it(e, t && !n), Me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  $t(e), e.f ^= st, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Kt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ye(e);
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
    n && H(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Gt(e, t, n) {
  if ((e.f & D) === 0) {
    e.f ^= D;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & De) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & re) !== 0;
      Gt(i, t, o ? n : !1), i = l;
    }
  }
}
function Wt(e) {
  Xt(e, !0);
}
function Xt(e, t) {
  if ((e.f & D) !== 0) {
    e.f ^= D, (e.f & x) === 0 && (E(e, R), ne.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & De) !== 0 || (n.f & B) !== 0;
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
      var i = n === r ? null : /* @__PURE__ */ Ye(n);
      t.append(n), n = i;
    }
}
let Le = !1, ye = !1;
function vt(e) {
  ye = e;
}
let p = null, z = !1;
function I(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let P = null;
function or(e) {
  p !== null && (P === null ? P = [e] : P.push(e));
}
let N = null, F = 0, M = null;
function ar(e) {
  M = e;
}
let Jt = 1, se = 0, fe = se;
function ht(e) {
  fe = e;
}
function Qt() {
  return ++Jt;
}
function Oe(e) {
  var t = e.f;
  if ((t & R) !== 0)
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
      ) && It(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    L === null && E(e, x);
  }
  return !1;
}
function en(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(P !== null && we.call(P, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? en(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, R) : (l.f & x) !== 0 && E(l, U), tt(
        /** @type {Effect} */
        l
      ));
    }
}
function tn(e) {
  var t = N, n = F, r = M, i = p, l = P, o = V, f = z, s = fe, u = e.f;
  N = /** @type {null | Value[]} */
  null, F = 0, M = null, p = (u & (B | ue)) === 0 ? e : null, P = null, me(e.ctx), z = !1, fe = ++se, e.ac !== null && (Bt(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Ge;
    var c = (
      /** @type {Function} */
      e.fn
    ), h = c();
    e.f |= xe;
    var v = e.deps, d = b?.is_fork;
    if (N !== null) {
      var a;
      if (d || Me(e, F), v !== null && F > 0)
        for (v.length = F + N.length, a = 0; a < N.length; a++)
          v[F + a] = N[a];
      else
        e.deps = v = N;
      if (rt() && (e.f & O) !== 0)
        for (a = F; a < v.length; a++)
          (v[a].reactions ??= []).push(e);
    } else !d && v !== null && F < v.length && (Me(e, F), v.length = F);
    if (St() && M !== null && !z && v !== null && (e.f & (T | U | R)) === 0)
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
    return (e.f & ee) !== 0 && (e.f ^= ee), h;
  } catch (_) {
    return At(_);
  } finally {
    e.f ^= Ge, N = t, F = n, M = r, p = i, P = l, me(o), z = f, fe = s;
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
  (N === null || !we.call(N, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & O) !== 0 && (l.f ^= O, l.f &= ~oe), et(l), Gn(l), Me(l, 0);
  }
}
function Me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      cr(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & j) === 0) {
    E(e, x);
    var n = g, r = Le;
    g = e, Le = !0;
    try {
      (t & (re | xt)) !== 0 ? fr(e) : it(e), $t(e);
      var i = tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var l;
    } finally {
      Le = r, g = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !z) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (P === null || !we.call(P, e))) {
      var i = p.deps;
      if ((p.f & Ge) !== 0)
        e.rv < se && (e.rv = se, N === null && i !== null && i[F] === e ? F++ : N === null ? N = [e] : N.push(e));
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
      var f = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || rn(o)) && (f = nt(o)), te.set(o, f), f;
    }
    var s = (o.f & O) === 0 && !z && p !== null && (Le || (p.f & O) !== 0), u = (o.f & xe) === 0;
    Oe(o) && (s && (o.f |= O), It(o)), s && !u && (qt(o), nn(o));
  }
  if (L?.has(e))
    return L.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function nn(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & O) === 0 && (qt(
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
function vr(e) {
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
  var o = 0, f = gt === e && e[Ae];
  if (f) {
    var s = i.indexOf(f);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ae] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    s <= u && (o = s);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, h = g;
    I(null), $(null);
    try {
      for (var v, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Ae]?.[r];
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
      e[Ae] = t, delete e.currentTarget, I(c), $(h);
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
function Er(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  Zn();
  var s = void 0, u = ir(() => {
    var c = n ?? t.appendChild(je());
    jn(
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
        l && (a.c = l), i && (r.$$events = i), s = e(d, r) || {}, Mn();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), v = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!h.has(_)) {
          h.add(_);
          var m = _r(_);
          for (const C of [t, document]) {
            var w = Ie.get(C);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Ie.set(C, w));
            var y = w.get(_);
            y === void 0 ? (C.addEventListener(_, wt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return v(He(ln)), Ze.add(v), () => {
      for (var d of h)
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
      Ze.delete(v), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return xr.set(s, u), s;
}
let xr = /* @__PURE__ */ new WeakMap();
function Tr(e, t, n) {
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
            Je(e, He(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
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
      Jn(c), c.append(u), e.items.clear();
    }
    Je(e, t, !s);
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
      for (const f of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= Z;
      const o = document.createDocumentFragment();
      Zt(l, o);
    } else
      H(t[i], n);
  }
}
var bt;
function kr(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map(), s = null, u = /* @__PURE__ */ Un(() => {
    var w = n();
    return yt(w) ? w : w == null ? [] : He(w);
  }), c, h = /* @__PURE__ */ new Map(), v = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = s, Sr(m, c, o, t, r), s !== null && (c.length === 0 ? (s.f & Z) === 0 ? Wt(s) : (s.f ^= Z, Re(s, null, o)) : ge(s, () => {
      s = null;
    })));
  }
  function a(w) {
    m.pending.delete(w);
  }
  var _ = Ut(() => {
    c = /** @type {V[]} */
    A(u);
    for (var w = c.length, y = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      b
    ), ce = Qn(), q = 0; q < w; q += 1) {
      var ke = c[q], ve = r(ke, q), S = v ? null : f.get(ve);
      S ? (S.v && be(S.v, ke), S.i && be(S.i, q), ce && C.unskip_effect(S.e)) : (S = Ar(
        f,
        v ? o : bt ??= je(),
        ke,
        ve,
        q,
        i,
        t,
        n
      ), v || (S.e.f |= Z), f.set(ve, S)), y.add(ve);
    }
    if (w === 0 && l && !s && (v ? s = Y(() => l(o)) : (s = Y(() => l(bt ??= je())), s.f |= Z)), w > y.size && mn(), !v)
      if (h.set(C, y), ce) {
        for (const [fn, un] of f)
          y.has(fn) || C.skip_effect(un.e);
        C.oncommit(d), C.ondiscard(a);
      } else
        d(C);
    A(u);
  }), m = { effect: _, items: f, pending: h, outrogroups: null, fallback: s };
  v = !1;
}
function Se(e) {
  for (; e !== null && (e.f & B) === 0; )
    e = e.next;
  return e;
}
function Sr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = Se(e.effect.first), s, u = null, c = [], h = [], v, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], d = i(v, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & D) !== 0 && Wt(a), (a.f & Z) !== 0)
      if (a.f ^= Z, a === f)
        Re(a, null, n);
      else {
        var m = u ? u.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, u, a), J(e, a, m), Re(a, m, n), u = a, c = [], h = [], f = Se(u.next);
        continue;
      }
    if (a !== f) {
      if (s !== void 0 && s.has(a)) {
        if (c.length < h.length) {
          var w = h[0], y;
          u = w.prev;
          var C = c[0], ce = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Re(c[y], w, n);
          for (y = 0; y < h.length; y += 1)
            s.delete(h[y]);
          J(e, C.prev, ce.next), J(e, u, C), J(e, ce, w), f = w, u = ce, _ -= 1, c = [], h = [];
        } else
          s.delete(a), Re(a, f, n), J(e, a.prev, a.next), J(e, a, u === null ? e.effect.first : u.next), J(e, u, a), u = a;
        continue;
      }
      for (c = [], h = []; f !== null && f !== a; )
        (s ??= /* @__PURE__ */ new Set()).add(f), h.push(f), f = Se(f.next);
      if (f === null)
        continue;
    }
    (a.f & Z) === 0 && c.push(a), u = a, f = Se(a.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Je(e, He(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || s !== void 0) {
    var q = [];
    if (s !== void 0)
      for (a of s)
        (a.f & D) === 0 && q.push(a);
    for (; f !== null; )
      (f.f & D) === 0 && f !== e.fallback && q.push(f), f = Se(f.next);
    var ke = q.length;
    if (ke > 0) {
      var ve = null;
      Tr(e, q, ve);
    }
  }
}
function Ar(e, t, n, r, i, l, o, f) {
  var s = (o & kn) !== 0 ? (o & An) === 0 ? /* @__PURE__ */ Wn(n, !1, !1) : ae(n) : null, u = (o & Sn) !== 0 ? ae(i) : null;
  return {
    v: s,
    i: u,
    e: Y(() => (l(t, s ?? n, u ?? i, f), () => {
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
        /* @__PURE__ */ Ye(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function J(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Rr = /* @__PURE__ */ sn('<div class="item"><span> </span> <button>x</button></div>'), Nr = /* @__PURE__ */ sn("<div><!> <div> </div> <button>Prepend</button></div>");
function Cr(e) {
  let t = /* @__PURE__ */ K(_e([
    { id: 1, text: "Alpha" },
    { id: 2, text: "Beta" },
    { id: 3, text: "Gamma" }
  ]));
  function n(u) {
    X(t, A(t).filter((c) => c.id !== u), !0);
  }
  function r() {
    const u = A(t).length + 1;
    X(t, [{ id: u + 100, text: `New ${u}` }, ...A(t)], !0);
  }
  var i = Nr(), l = Pe(i);
  kr(l, 17, () => A(t), (u) => u.id, (u, c) => {
    var h = Rr(), v = Pe(h), d = Pe(v), a = $e(v, 2);
    ct(() => _t(d, A(c).text)), pt("click", a, () => n(A(c).id)), mt(u, h);
  });
  var o = $e(l, 2), f = Pe(o), s = $e(o, 2);
  ct(() => _t(f, `Count: ${A(t).length ?? ""}`)), pt("click", s, r), mt(e, i);
}
pr(["click"]);
function Dr(e) {
  return yr(Cr, { target: e });
}
export {
  Dr as default,
  Dr as rvst_mount
};

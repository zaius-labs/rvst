var Bt = Array.isArray, Dn = Array.prototype.indexOf, Se = Array.prototype.includes, Je = Array.from, jn = Object.defineProperty, Ie = Object.getOwnPropertyDescriptor, On = Object.prototype, Fn = Array.prototype, Pn = Object.getPrototypeOf, Tt = Object.isExtensible;
const In = () => {
};
function Ln(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const C = 2, Ae = 4, Xe = 8, Yt = 1 << 24, he = 16, Z = 32, ye = 64, ft = 128, B = 512, T = 1024, D = 2048, Q = 4096, L = 8192, G = 16384, Me = 32768, Ct = 1 << 25, Te = 65536, Nt = 1 << 17, Hn = 1 << 18, De = 1 << 19, Vn = 1 << 20, J = 1 << 25, Ee = 65536, ot = 1 << 21, pt = 1 << 22, ce = 1 << 23, rt = Symbol("$state"), le = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Bn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Un(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Yn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Kn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Wn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Gn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function $n() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Jn = 1, Xn = 2, Kt = 4, Zn = 8, Qn = 16, er = 2, N = Symbol(), tr = "http://www.w3.org/1999/xhtml";
function nr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Wt(e) {
  return e === this.v;
}
function rr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Gt(e) {
  return !rr(e, this.v);
}
let $ = null;
function Ce(e) {
  $ = e;
}
function Ze(e, t = !1, n) {
  $ = {
    p: $,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      E
    ),
    l: null
  };
}
function Qe(e) {
  var t = (
    /** @type {ComponentContext} */
    $
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Tr(r);
  }
  return t.i = !0, $ = t.p, /** @type {T} */
  {};
}
function $t() {
  return !0;
}
let _e = [];
function Jt() {
  var e = _e;
  _e = [], Ln(e);
}
function me(e) {
  if (_e.length === 0 && !Le) {
    var t = _e;
    queueMicrotask(() => {
      t === _e && Jt();
    });
  }
  _e.push(e);
}
function ir() {
  for (; _e.length > 0; )
    Jt();
}
function Xt(e) {
  var t = E;
  if (t === null)
    return w.f |= ce, e;
  if ((t.f & Me) === 0 && (t.f & Ae) === 0)
    throw e;
  ue(e, t);
}
function ue(e, t) {
  for (; t !== null; ) {
    if ((t.f & ft) !== 0) {
      if ((t.f & Me) === 0)
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
const lr = -7169;
function S(e, t) {
  e.f = e.f & lr | t;
}
function _t(e) {
  (e.f & B) !== 0 || e.deps === null ? S(e, T) : S(e, Q);
}
function Zt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & C) === 0 || (t.f & Ee) === 0 || (t.f ^= Ee, Zt(
        /** @type {Derived} */
        t.deps
      ));
}
function Qt(e, t, n) {
  (e.f & D) !== 0 ? t.add(e) : (e.f & Q) !== 0 && n.add(e), Zt(e.deps), S(e, T);
}
const pe = /* @__PURE__ */ new Set();
let x = null, K = null, ut = null, Le = !1, it = !1, ke = null, Ke = null;
var qt = 0;
let sr = 1;
class de {
  // for debugging. TODO remove once async is stable
  id = sr++;
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
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #f = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #t = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #s = 0;
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
  #n = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
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
  #o = !1;
  #u() {
    return this.is_fork || this.#s > 0;
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
        S(r, D), this.schedule(r);
      for (r of n.m)
        S(r, Q), this.schedule(r);
    }
  }
  #v() {
    if (qt++ > 1e3 && (pe.delete(this), fr()), !this.#u()) {
      for (const a of this.#i)
        this.#l.delete(a), S(a, D), this.schedule(a);
      for (const a of this.#l)
        S(a, Q), this.schedule(a);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ke = [], r = [], i = Ke = [];
    for (const a of t)
      try {
        this.#d(a, n, r);
      } catch (s) {
        throw rn(a), s;
      }
    if (x = null, i.length > 0) {
      var l = de.ensure();
      for (const a of i)
        l.schedule(a);
    }
    if (ke = null, Ke = null, this.#u()) {
      this.#h(r), this.#h(n);
      for (const [a, s] of this.#a)
        nn(a, s);
    } else {
      this.#t === 0 && pe.delete(this), this.#i.clear(), this.#l.clear();
      for (const a of this.#e) a(this);
      this.#e.clear(), Rt(r), Rt(n), this.#r?.resolve();
    }
    var f = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      x
    );
    if (this.#n.length > 0) {
      const a = f ??= this;
      a.#n.push(...this.#n.filter((s) => !a.#n.includes(s)));
    }
    f !== null && (pe.add(f), f.#v()), pe.has(this) || this.#c();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #d(t, n, r) {
    t.f ^= T;
    for (var i = t.first; i !== null; ) {
      var l = i.f, f = (l & (Z | ye)) !== 0, a = f && (l & T) !== 0, s = a || (l & L) !== 0 || this.#a.has(i);
      if (!s && i.fn !== null) {
        f ? i.f ^= T : (l & Ae) !== 0 ? n.push(i) : Ue(i) && ((l & he) !== 0 && this.#l.add(i), Re(i));
        var o = i.first;
        if (o !== null) {
          i = o;
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
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Qt(t[n], this.#i, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== N && !this.previous.has(t) && this.previous.set(t, n), (t.f & ce) === 0 && (this.current.set(t, t.v), K?.set(t, t.v));
  }
  activate() {
    x = this;
  }
  deactivate() {
    x = null, K = null;
  }
  flush() {
    try {
      it = !0, x = this, this.#v();
    } finally {
      qt = 0, ut = null, ke = null, Ke = null, it = !1, x = null, K = null, ve.clear();
    }
  }
  discard() {
    for (const t of this.#f) t(this);
    this.#f.clear(), pe.delete(this);
  }
  #c() {
    for (const s of pe) {
      var t = s.id < this.id, n = [];
      for (const [o, u] of this.current) {
        if (s.current.has(o))
          if (t && u !== s.current.get(o))
            s.current.set(o, u);
          else
            continue;
        n.push(o);
      }
      var r = [...s.current.keys()].filter((o) => !this.current.has(o));
      if (r.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
        for (var f of n)
          en(f, r, i, l);
        if (s.#n.length > 0) {
          s.apply();
          for (var a of s.#n)
            s.#d(a, [], []);
          s.#n = [];
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
    this.#t += 1, t && (this.#s += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#t -= 1, t && (this.#s -= 1), !(this.#o || n) && (this.#o = !0, me(() => {
      this.#o = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#i.add(r);
    for (const r of n)
      this.#l.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#f.add(t);
  }
  settled() {
    return (this.#r ??= Ut()).promise;
  }
  static ensure() {
    if (x === null) {
      const t = x = new de();
      it || (pe.add(x), Le || me(() => {
        x === t && t.flush();
      }));
    }
    return x;
  }
  apply() {
    {
      K = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (ut = t, t.b?.is_pending && (t.f & (Ae | Xe | Yt)) !== 0 && (t.f & Me) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ke !== null && n === E && (w === null || (w.f & C) === 0))
        return;
      if ((r & (ye | Z)) !== 0) {
        if ((r & T) === 0)
          return;
        n.f ^= T;
      }
    }
    this.#n.push(n);
  }
}
function ar(e) {
  var t = Le;
  Le = !0;
  try {
    for (var n; ; ) {
      if (ir(), x === null)
        return (
          /** @type {T} */
          n
        );
      x.flush();
    }
  } finally {
    Le = t;
  }
}
function fr() {
  try {
    Yn();
  } catch (e) {
    ue(e, ut);
  }
}
let ie = null;
function Rt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (G | L)) === 0 && Ue(r) && (ie = /* @__PURE__ */ new Set(), Re(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && mn(r), ie?.size > 0)) {
        ve.clear();
        for (const i of ie) {
          if ((i.f & (G | L)) !== 0) continue;
          const l = [i];
          let f = i.parent;
          for (; f !== null; )
            ie.has(f) && (ie.delete(f), l.push(f)), f = f.parent;
          for (let a = l.length - 1; a >= 0; a--) {
            const s = l[a];
            (s.f & (G | L)) === 0 && Re(s);
          }
        }
        ie.clear();
      }
    }
    ie = null;
  }
}
function en(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & C) !== 0 ? en(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (pt | he)) !== 0 && (l & D) === 0 && tn(i, t, r) && (S(i, D), gt(
        /** @type {Effect} */
        i
      ));
    }
}
function tn(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Se.call(t, i))
        return !0;
      if ((i.f & C) !== 0 && tn(
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
function gt(e) {
  x.schedule(e);
}
function nn(e, t) {
  if (!((e.f & Z) !== 0 && (e.f & T) !== 0)) {
    (e.f & D) !== 0 ? t.d.push(e) : (e.f & Q) !== 0 && t.m.push(e), S(e, T);
    for (var n = e.first; n !== null; )
      nn(n, t), n = n.next;
  }
}
function rn(e) {
  S(e, T);
  for (var t = e.first; t !== null; )
    rn(t), t = t.next;
}
function or(e) {
  let t = 0, n = ze(0), r;
  return () => {
    xt() && (g(n), _n(() => (t === 0 && (r = Tn(() => e(() => He(n)))), t += 1, () => {
      me(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, He(n));
      });
    })));
  };
}
var ur = Te | De;
function cr(e, t, n, r) {
  new vr(e, t, n, r);
}
class vr {
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
  #e;
  /** @type {TemplateNode | null} */
  #f = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #s;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #a = null;
  #o = 0;
  #u = 0;
  #v = !1;
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
  #c = null;
  #w = or(() => (this.#c = ze(this.#o), () => {
    this.#c = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#e = t, this.#t = n, this.#s = (l) => {
      var f = (
        /** @type {Effect} */
        E
      );
      f.b = this, f.f |= ft, r(l);
    }, this.parent = /** @type {Effect} */
    E.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#r = yt(() => {
      this.#g();
    }, ur);
  }
  #b() {
    try {
      this.#n = V(() => this.#s(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #x(t) {
    const n = this.#t.failed;
    n && (this.#l = V(() => {
      n(
        this.#e,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #y() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#i = V(() => t(this.#e)), me(() => {
      var n = this.#a = document.createDocumentFragment(), r = we();
      n.append(r), this.#n = this.#_(() => V(() => this.#s(r))), this.#u === 0 && (this.#e.before(n), this.#a = null, be(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#p(
        /** @type {Batch} */
        x
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#n = V(() => {
        this.#s(this.#e);
      }), this.#u > 0) {
        var t = this.#a = document.createDocumentFragment();
        kt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#i = V(() => n(this.#e));
      } else
        this.#p(
          /** @type {Batch} */
          x
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
    Qt(t, this.#d, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#t.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #_(t) {
    var n = E, r = w, i = $;
    ee(this.#r), Y(this.#r), Ce(this.#r.ctx);
    try {
      return de.ensure(), t();
    } catch (l) {
      return Xt(l), null;
    } finally {
      ee(n), Y(r), Ce(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#i && be(this.#i, () => {
      this.#i = null;
    }), this.#a && (this.#e.before(this.#a), this.#a = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#m(t, n), this.#o += t, !(!this.#c || this.#v) && (this.#v = !0, me(() => {
      this.#v = !1, this.#c && Ne(this.#c, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#w(), g(
      /** @type {Source<number>} */
      this.#c
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#t.onerror;
    let r = this.#t.failed;
    if (!n && !r)
      throw t;
    this.#n && (O(this.#n), this.#n = null), this.#i && (O(this.#i), this.#i = null), this.#l && (O(this.#l), this.#l = null);
    var i = !1, l = !1;
    const f = () => {
      if (i) {
        nr();
        return;
      }
      i = !0, l && $n(), this.#l !== null && be(this.#l, () => {
        this.#l = null;
      }), this.#_(() => {
        this.#g();
      });
    }, a = (s) => {
      try {
        l = !0, n?.(s, f), l = !1;
      } catch (o) {
        ue(o, this.#r && this.#r.parent);
      }
      r && (this.#l = this.#_(() => {
        try {
          return V(() => {
            var o = (
              /** @type {Effect} */
              E
            );
            o.b = this, o.f |= ft, r(
              this.#e,
              () => s,
              () => f
            );
          });
        } catch (o) {
          return ue(
            o,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    me(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (o) {
        ue(o, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        a,
        /** @param {unknown} e */
        (o) => ue(o, this.#r && this.#r.parent)
      ) : a(s);
    });
  }
}
function dr(e, t, n, r) {
  const i = mt;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var f = (
    /** @type {Effect} */
    E
  ), a = hr(), s = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function o(v) {
    a();
    try {
      r(v);
    } catch (p) {
      (f.f & G) === 0 && ue(p, f);
    }
    $e();
  }
  if (n.length === 0) {
    s.then(() => o(t.map(i)));
    return;
  }
  var u = ln();
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ pr(v))).then((v) => o([...t.map(i), ...v])).catch((v) => ue(v, f)).finally(() => u());
  }
  s ? s.then(() => {
    a(), h(), $e();
  }) : h();
}
function hr() {
  var e = (
    /** @type {Effect} */
    E
  ), t = w, n = $, r = (
    /** @type {Batch} */
    x
  );
  return function(l = !0) {
    ee(e), Y(t), Ce(n), l && (e.f & G) === 0 && (r?.activate(), r?.apply());
  };
}
function $e(e = !0) {
  ee(null), Y(null), Ce(null), e && x?.deactivate();
}
function ln() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    E.b
  ), t = (
    /** @type {Batch} */
    x
  ), n = e.is_rendered();
  return e.update_pending_count(1, t), t.increment(n), (r = !1) => {
    e.update_pending_count(-1, t), t.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function mt(e) {
  var t = C | D, n = w !== null && (w.f & C) !== 0 ? (
    /** @type {Derived} */
    w
  ) : null;
  return E !== null && (E.f |= De), {
    ctx: $,
    deps: null,
    effects: null,
    equals: Wt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      N
    ),
    wv: 0,
    parent: n ?? E,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function pr(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    E
  );
  r === null && Bn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = ze(
    /** @type {V} */
    N
  ), f = !w, a = /* @__PURE__ */ new Map();
  return qr(() => {
    var s = (
      /** @type {Effect} */
      E
    ), o = Ut();
    i = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, o.reject).finally($e);
    } catch (p) {
      o.reject(p), $e();
    }
    var u = (
      /** @type {Batch} */
      x
    );
    if (f) {
      if ((s.f & Me) !== 0)
        var h = ln();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        a.get(u)?.reject(le), a.delete(u);
      else {
        for (const p of a.values())
          p.reject(le);
        a.clear();
      }
      a.set(u, o);
    }
    const v = (p, d = void 0) => {
      if (h) {
        var m = d === le;
        h(m);
      }
      if (!(d === le || (s.f & G) !== 0)) {
        if (u.activate(), d)
          l.f |= ce, Ne(l, d);
        else {
          (l.f & ce) !== 0 && (l.f ^= ce), Ne(l, p);
          for (const [c, _] of a) {
            if (a.delete(c), c === u) break;
            _.reject(le);
          }
        }
        u.deactivate();
      }
    };
    o.promise.then(v, (p) => v(null, p || "unknown"));
  }), Ar(() => {
    for (const s of a.values())
      s.reject(le);
  }), new Promise((s) => {
    function o(u) {
      function h() {
        u === i ? s(l) : o(i);
      }
      u.then(h, h);
    }
    o(i);
  });
}
// @__NO_SIDE_EFFECTS__
function ct(e) {
  const t = /* @__PURE__ */ mt(e);
  return xn(t), t;
}
// @__NO_SIDE_EFFECTS__
function _r(e) {
  const t = /* @__PURE__ */ mt(e);
  return t.equals = Gt, t;
}
function gr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      O(
        /** @type {Effect} */
        t[n]
      );
  }
}
function mr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & C) === 0)
      return (t.f & G) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function wt(e) {
  var t, n = E;
  ee(mr(e));
  try {
    e.f &= ~Ee, gr(e), t = kn(e);
  } finally {
    ee(n);
  }
  return t;
}
function sn(e) {
  var t = e.v, n = wt(e);
  if (!e.equals(n) && (e.wv = En(), (!x?.is_fork || e.deps === null) && (e.v = n, x?.capture(e, t), e.deps === null))) {
    S(e, T);
    return;
  }
  qe || (K !== null ? (xt() || x?.is_fork) && K.set(e, n) : _t(e));
}
function wr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(le), t.teardown = In, t.ac = null, Be(t, 0), Et(t));
}
function an(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Re(t);
}
let vt = /* @__PURE__ */ new Set();
const ve = /* @__PURE__ */ new Map();
let fn = !1;
function ze(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Wt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = ze(e);
  return xn(n), n;
}
// @__NO_SIDE_EFFECTS__
function br(e, t = !1, n = !0) {
  const r = ze(e);
  return t || (r.equals = Gt), r;
}
function I(e, t, n = !1) {
  w !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!W || (w.f & Nt) !== 0) && $t() && (w.f & (C | he | pt | Nt)) !== 0 && (U === null || !Se.call(U, e)) && Gn();
  let r = n ? Oe(t) : t;
  return Ne(e, r, Ke);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    qe ? ve.set(e, t) : ve.set(e, r), e.v = t;
    var i = de.ensure();
    if (i.capture(e, r), (e.f & C) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & D) !== 0 && wt(l), K === null && _t(l);
    }
    e.wv = En(), on(e, D, n), E !== null && (E.f & T) !== 0 && (E.f & (Z | ye)) === 0 && (H === null ? Dr([e]) : H.push(e)), !i.is_fork && vt.size > 0 && !fn && xr();
  }
  return t;
}
function xr() {
  fn = !1;
  for (const e of vt)
    (e.f & T) !== 0 && S(e, Q), Ue(e) && Re(e);
  vt.clear();
}
function He(e) {
  I(e, e.v + 1);
}
function on(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var f = r[l], a = f.f, s = (a & D) === 0;
      if (s && S(f, t), (a & C) !== 0) {
        var o = (
          /** @type {Derived} */
          f
        );
        K?.delete(o), (a & Ee) === 0 && (a & B && (f.f |= Ee), on(o, Q, n));
      } else if (s) {
        var u = (
          /** @type {Effect} */
          f
        );
        (a & he) !== 0 && ie !== null && ie.add(u), n !== null ? n.push(u) : gt(u);
      }
    }
}
function Oe(e) {
  if (typeof e != "object" || e === null || rt in e)
    return e;
  const t = Pn(e);
  if (t !== On && t !== Fn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bt(e), i = /* @__PURE__ */ P(0), l = xe, f = (a) => {
    if (xe === l)
      return a();
    var s = w, o = xe;
    Y(null), Ot(l);
    var u = a();
    return Y(s), Ot(o), u;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, s, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && Kn();
        var u = n.get(s);
        return u === void 0 ? f(() => {
          var h = /* @__PURE__ */ P(o.value);
          return n.set(s, h), h;
        }) : I(u, o.value, !0), !0;
      },
      deleteProperty(a, s) {
        var o = n.get(s);
        if (o === void 0) {
          if (s in a) {
            const u = f(() => /* @__PURE__ */ P(N));
            n.set(s, u), He(i);
          }
        } else
          I(o, N), He(i);
        return !0;
      },
      get(a, s, o) {
        if (s === rt)
          return e;
        var u = n.get(s), h = s in a;
        if (u === void 0 && (!h || Ie(a, s)?.writable) && (u = f(() => {
          var p = Oe(h ? a[s] : N), d = /* @__PURE__ */ P(p);
          return d;
        }), n.set(s, u)), u !== void 0) {
          var v = g(u);
          return v === N ? void 0 : v;
        }
        return Reflect.get(a, s, o);
      },
      getOwnPropertyDescriptor(a, s) {
        var o = Reflect.getOwnPropertyDescriptor(a, s);
        if (o && "value" in o) {
          var u = n.get(s);
          u && (o.value = g(u));
        } else if (o === void 0) {
          var h = n.get(s), v = h?.v;
          if (h !== void 0 && v !== N)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return o;
      },
      has(a, s) {
        if (s === rt)
          return !0;
        var o = n.get(s), u = o !== void 0 && o.v !== N || Reflect.has(a, s);
        if (o !== void 0 || E !== null && (!u || Ie(a, s)?.writable)) {
          o === void 0 && (o = f(() => {
            var v = u ? Oe(a[s]) : N, p = /* @__PURE__ */ P(v);
            return p;
          }), n.set(s, o));
          var h = g(o);
          if (h === N)
            return !1;
        }
        return u;
      },
      set(a, s, o, u) {
        var h = n.get(s), v = s in a;
        if (r && s === "length")
          for (var p = o; p < /** @type {Source<number>} */
          h.v; p += 1) {
            var d = n.get(p + "");
            d !== void 0 ? I(d, N) : p in a && (d = f(() => /* @__PURE__ */ P(N)), n.set(p + "", d));
          }
        if (h === void 0)
          (!v || Ie(a, s)?.writable) && (h = f(() => /* @__PURE__ */ P(void 0)), I(h, Oe(o)), n.set(s, h));
        else {
          v = h.v !== N;
          var m = f(() => Oe(o));
          I(h, m);
        }
        var c = Reflect.getOwnPropertyDescriptor(a, s);
        if (c?.set && c.set.call(u, o), !v) {
          if (r && typeof s == "string") {
            var _ = (
              /** @type {Source<number>} */
              n.get("length")
            ), b = Number(s);
            Number.isInteger(b) && b >= _.v && I(_, b + 1);
          }
          He(i);
        }
        return !0;
      },
      ownKeys(a) {
        g(i);
        var s = Reflect.ownKeys(a).filter((h) => {
          var v = n.get(h);
          return v === void 0 || v.v !== N;
        });
        for (var [o, u] of n)
          u.v !== N && !(o in a) && s.push(o);
        return s;
      },
      setPrototypeOf() {
        Wn();
      }
    }
  );
}
var Mt, un, cn, vn;
function yr() {
  if (Mt === void 0) {
    Mt = window, un = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    cn = Ie(t, "firstChild").get, vn = Ie(t, "nextSibling").get, Tt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Tt(n) && (n.__t = void 0);
  }
}
function we(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
  return (
    /** @type {TemplateNode | null} */
    cn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function et(e) {
  return (
    /** @type {TemplateNode | null} */
    vn.call(e)
  );
}
function z(e, t) {
  return /* @__PURE__ */ dn(e);
}
function R(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ et(r);
  return r;
}
function Er(e) {
  e.textContent = "";
}
function hn() {
  return !1;
}
function pn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(tr, e, void 0)
  );
}
let Dt = !1;
function zr() {
  Dt || (Dt = !0, document.addEventListener(
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
function bt(e) {
  var t = w, n = E;
  Y(null), ee(null);
  try {
    return e();
  } finally {
    Y(t), ee(n);
  }
}
function kr(e, t, n, r = n) {
  e.addEventListener(t, () => bt(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), zr();
}
function Sr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ae(e, t) {
  var n = E;
  n !== null && (n.f & L) !== 0 && (e |= L);
  var r = {
    ctx: $,
    deps: null,
    nodes: null,
    f: e | D | B,
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
  if ((e & Ae) !== 0)
    ke !== null ? ke.push(r) : de.ensure().schedule(r);
  else if (t !== null) {
    try {
      Re(r);
    } catch (f) {
      throw O(r), f;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & De) === 0 && (i = i.first, (e & he) !== 0 && (e & Te) !== 0 && i !== null && (i.f |= Te));
  }
  if (i !== null && (i.parent = n, n !== null && Sr(i, n), w !== null && (w.f & C) !== 0 && (e & ye) === 0)) {
    var l = (
      /** @type {Derived} */
      w
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function xt() {
  return w !== null && !W;
}
function Ar(e) {
  const t = ae(Xe, null);
  return S(t, T), t.teardown = e, t;
}
function Tr(e) {
  return ae(Ae | Vn, e);
}
function Cr(e) {
  de.ensure();
  const t = ae(ye | De, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      O(t), r(void 0);
    }) : (O(t), r(void 0));
  });
}
function Nr(e) {
  return ae(Ae, e);
}
function qr(e) {
  return ae(pt | De, e);
}
function _n(e, t = 0) {
  return ae(Xe | t, e);
}
function Ve(e, t = [], n = [], r = []) {
  dr(r, t, n, (i) => {
    ae(Xe, () => e(...i.map(g)));
  });
}
function yt(e, t = 0) {
  var n = ae(he | t, e);
  return n;
}
function V(e) {
  return ae(Z | De, e);
}
function gn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = qe, r = w;
    jt(!0), Y(null);
    try {
      t.call(null);
    } finally {
      jt(n), Y(r);
    }
  }
}
function Et(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && bt(() => {
      i.abort(le);
    });
    var r = n.next;
    (n.f & ye) !== 0 ? n.parent = null : O(n, t), n = r;
  }
}
function Rr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Z) === 0 && O(t), t = n;
  }
}
function O(e, t = !0) {
  var n = !1;
  (t || (e.f & Hn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), S(e, Ct), Et(e, t && !n), Be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  gn(e), e.f ^= Ct, e.f |= G;
  var i = e.parent;
  i !== null && i.first !== null && mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Mr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ et(e);
    e.remove(), e = n;
  }
}
function mn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  wn(e, r, !0);
  var i = () => {
    n && O(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var f = () => --l || i();
    for (var a of r)
      a.out(f);
  } else
    i();
}
function wn(e, t, n) {
  if ((e.f & L) === 0) {
    e.f ^= L;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var i = e.first; i !== null; ) {
      var l = i.next, f = (i.f & Te) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Z) !== 0 && (e.f & he) !== 0;
      wn(i, t, f ? n : !1), i = l;
    }
  }
}
function zt(e) {
  bn(e, !0);
}
function bn(e, t) {
  if ((e.f & L) !== 0) {
    e.f ^= L, (e.f & T) === 0 && (S(e, D), de.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Te) !== 0 || (n.f & Z) !== 0;
      bn(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const f of l)
        (f.is_global || t) && f.in();
  }
}
function kt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ et(n);
      t.append(n), n = i;
    }
}
let We = !1, qe = !1;
function jt(e) {
  qe = e;
}
let w = null, W = !1;
function Y(e) {
  w = e;
}
let E = null;
function ee(e) {
  E = e;
}
let U = null;
function xn(e) {
  w !== null && (U === null ? U = [e] : U.push(e));
}
let j = null, F = 0, H = null;
function Dr(e) {
  H = e;
}
let yn = 1, ge = 0, xe = ge;
function Ot(e) {
  xe = e;
}
function En() {
  return ++yn;
}
function Ue(e) {
  var t = e.f;
  if ((t & D) !== 0)
    return !0;
  if (t & C && (e.f &= ~Ee), (t & Q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Ue(
        /** @type {Derived} */
        l
      ) && sn(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & B) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    K === null && S(e, T);
  }
  return !1;
}
function zn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(U !== null && Se.call(U, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & C) !== 0 ? zn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? S(l, D) : (l.f & T) !== 0 && S(l, Q), gt(
        /** @type {Effect} */
        l
      ));
    }
}
function kn(e) {
  var t = j, n = F, r = H, i = w, l = U, f = $, a = W, s = xe, o = e.f;
  j = /** @type {null | Value[]} */
  null, F = 0, H = null, w = (o & (Z | ye)) === 0 ? e : null, U = null, Ce(e.ctx), W = !1, xe = ++ge, e.ac !== null && (bt(() => {
    e.ac.abort(le);
  }), e.ac = null);
  try {
    e.f |= ot;
    var u = (
      /** @type {Function} */
      e.fn
    ), h = u();
    e.f |= Me;
    var v = e.deps, p = x?.is_fork;
    if (j !== null) {
      var d;
      if (p || Be(e, F), v !== null && F > 0)
        for (v.length = F + j.length, d = 0; d < j.length; d++)
          v[F + d] = j[d];
      else
        e.deps = v = j;
      if (xt() && (e.f & B) !== 0)
        for (d = F; d < v.length; d++)
          (v[d].reactions ??= []).push(e);
    } else !p && v !== null && F < v.length && (Be(e, F), v.length = F);
    if ($t() && H !== null && !W && v !== null && (e.f & (C | Q | D)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      H.length; d++)
        zn(
          H[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ge++, i.deps !== null)
        for (let m = 0; m < n; m += 1)
          i.deps[m].rv = ge;
      if (t !== null)
        for (const m of t)
          m.rv = ge;
      H !== null && (r === null ? r = H : r.push(.../** @type {Source[]} */
      H));
    }
    return (e.f & ce) !== 0 && (e.f ^= ce), h;
  } catch (m) {
    return Xt(m);
  } finally {
    e.f ^= ot, j = t, F = n, H = r, w = i, U = l, Ce(f), W = a, xe = s;
  }
}
function jr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Dn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & C) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (j === null || !Se.call(j, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & B) !== 0 && (l.f ^= B, l.f &= ~Ee), _t(l), wr(l), Be(l, 0);
  }
}
function Be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      jr(e, n[r]);
}
function Re(e) {
  var t = e.f;
  if ((t & G) === 0) {
    S(e, T);
    var n = E, r = We;
    E = e, We = !0;
    try {
      (t & (he | Yt)) !== 0 ? Rr(e) : Et(e), gn(e);
      var i = kn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = yn;
      var l;
    } finally {
      We = r, E = n;
    }
  }
}
async function Or() {
  await Promise.resolve(), ar();
}
function g(e) {
  var t = e.f, n = (t & C) !== 0;
  if (w !== null && !W) {
    var r = E !== null && (E.f & G) !== 0;
    if (!r && (U === null || !Se.call(U, e))) {
      var i = w.deps;
      if ((w.f & ot) !== 0)
        e.rv < ge && (e.rv = ge, j === null && i !== null && i[F] === e ? F++ : j === null ? j = [e] : j.push(e));
      else {
        (w.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [w] : Se.call(l, w) || l.push(w);
      }
    }
  }
  if (qe && ve.has(e))
    return ve.get(e);
  if (n) {
    var f = (
      /** @type {Derived} */
      e
    );
    if (qe) {
      var a = f.v;
      return ((f.f & T) === 0 && f.reactions !== null || An(f)) && (a = wt(f)), ve.set(f, a), a;
    }
    var s = (f.f & B) === 0 && !W && w !== null && (We || (w.f & B) !== 0), o = (f.f & Me) === 0;
    Ue(f) && (s && (f.f |= B), sn(f)), s && !o && (an(f), Sn(f));
  }
  if (K?.has(e))
    return K.get(e);
  if ((e.f & ce) !== 0)
    throw e.v;
  return e.v;
}
function Sn(e) {
  if (e.f |= B, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & C) !== 0 && (t.f & B) === 0 && (an(
        /** @type {Derived} */
        t
      ), Sn(
        /** @type {Derived} */
        t
      ));
}
function An(e) {
  if (e.v === N) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ve.has(t) || (t.f & C) !== 0 && An(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Tn(e) {
  var t = W;
  try {
    return W = !0, e();
  } finally {
    W = t;
  }
}
const Ft = globalThis.Deno?.core?.ops ?? null;
function Fr(e, ...t) {
  Ft?.[e] ? Ft[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function se(e, t) {
  Fr("op_set_text", e, t);
}
const Pr = ["touchstart", "touchmove"];
function Ir(e) {
  return Pr.includes(e);
}
const Fe = Symbol("events"), Cn = /* @__PURE__ */ new Set(), dt = /* @__PURE__ */ new Set();
function Ge(e, t, n) {
  (t[Fe] ??= {})[e] = n;
}
function Nn(e) {
  for (var t = 0; t < e.length; t++)
    Cn.add(e[t]);
  for (var n of dt)
    n(e);
}
let Pt = null;
function It(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Pt = e;
  var f = 0, a = Pt === e && e[Fe];
  if (a) {
    var s = i.indexOf(a);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Fe] = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    s <= o && (f = s);
  }
  if (l = /** @type {Element} */
  i[f] || e.target, l !== t) {
    jn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var u = w, h = E;
    Y(null), ee(null);
    try {
      for (var v, p = []; l !== null; ) {
        var d = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var m = l[Fe]?.[r];
          m != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && m.call(l, e);
        } catch (c) {
          v ? p.push(c) : v = c;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        l = d;
      }
      if (v) {
        for (let c of p)
          queueMicrotask(() => {
            throw c;
          });
        throw v;
      }
    } finally {
      e[Fe] = t, delete e.currentTarget, Y(u), ee(h);
    }
  }
}
const Lr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Hr(e) {
  return (
    /** @type {string} */
    Lr?.createHTML(e) ?? e
  );
}
function Vr(e) {
  var t = pn("template");
  return t.innerHTML = Hr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Br(e, t) {
  var n = (
    /** @type {Effect} */
    E
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function te(e, t) {
  var n = (t & er) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Vr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ dn(r));
    var l = (
      /** @type {TemplateNode} */
      n || un ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Br(l, l), l;
  };
}
function X(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Ur(e, t) {
  return Yr(e, t);
}
const Ye = /* @__PURE__ */ new Map();
function Yr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: f = !0, transformError: a }) {
  yr();
  var s = void 0, o = Cr(() => {
    var u = n ?? t.appendChild(we());
    cr(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (p) => {
        Ze({});
        var d = (
          /** @type {ComponentContext} */
          $
        );
        l && (d.c = l), i && (r.$$events = i), s = e(p, r) || {}, Qe();
      },
      a
    );
    var h = /* @__PURE__ */ new Set(), v = (p) => {
      for (var d = 0; d < p.length; d++) {
        var m = p[d];
        if (!h.has(m)) {
          h.add(m);
          var c = Ir(m);
          for (const y of [t, document]) {
            var _ = Ye.get(y);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), Ye.set(y, _));
            var b = _.get(m);
            b === void 0 ? (y.addEventListener(m, It, { passive: c }), _.set(m, 1)) : _.set(m, b + 1);
          }
        }
      }
    };
    return v(Je(Cn)), dt.add(v), () => {
      for (var p of h)
        for (const c of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ye.get(c)
          ), m = (
            /** @type {number} */
            d.get(p)
          );
          --m == 0 ? (c.removeEventListener(p, It), d.delete(p), d.size === 0 && Ye.delete(c)) : d.set(p, m);
        }
      dt.delete(v), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return Kr.set(s, o), s;
}
let Kr = /* @__PURE__ */ new WeakMap();
class Wr {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #e = /* @__PURE__ */ new Map();
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
  #t = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #r = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#r = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#f.get(n);
      if (r)
        zt(r), this.#s.delete(n);
      else {
        var i = this.#t.get(n);
        i && (this.#f.set(n, i.effect), this.#t.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [l, f] of this.#e) {
        if (this.#e.delete(l), l === t)
          break;
        const a = this.#t.get(f);
        a && (O(a.effect), this.#t.delete(f));
      }
      for (const [l, f] of this.#f) {
        if (l === n || this.#s.has(l)) continue;
        const a = () => {
          if (Array.from(this.#e.values()).includes(l)) {
            var o = document.createDocumentFragment();
            kt(f, o), o.append(we()), this.#t.set(l, { effect: f, fragment: o });
          } else
            O(f);
          this.#s.delete(l), this.#f.delete(l);
        };
        this.#r || !r ? (this.#s.add(l), be(f, a, !1)) : a();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [r, i] of this.#t)
      n.includes(r) || (O(i.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      x
    ), i = hn();
    if (n && !this.#f.has(t) && !this.#t.has(t))
      if (i) {
        var l = document.createDocumentFragment(), f = we();
        l.append(f), this.#t.set(t, {
          effect: V(() => n(f)),
          fragment: l
        });
      } else
        this.#f.set(
          t,
          V(() => n(this.anchor))
        );
    if (this.#e.set(r, t), i) {
      for (const [a, s] of this.#f)
        a === t ? r.unskip_effect(s) : r.skip_effect(s);
      for (const [a, s] of this.#t)
        a === t ? r.unskip_effect(s.effect) : r.skip_effect(s.effect);
      r.oncommit(this.#n), r.ondiscard(this.#i);
    } else
      this.#n(r);
  }
}
function Gr(e, t, n = !1) {
  var r = new Wr(e), i = n ? Te : 0;
  function l(f, a) {
    r.ensure(f, a);
  }
  yt(() => {
    var f = !1;
    t((a, s = 0) => {
      f = !0, l(s, a);
    }), f || l(-1, null);
  }, i);
}
function St(e, t) {
  return t;
}
function $r(e, t, n) {
  for (var r = [], i = t.length, l, f = t.length, a = 0; a < i; a++) {
    let h = t[a];
    be(
      h,
      () => {
        if (l) {
          if (l.pending.delete(h), l.done.add(h), l.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            ht(e, Je(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
          }
        } else
          f -= 1;
      },
      !1
    );
  }
  if (f === 0) {
    var s = r.length === 0 && n !== null;
    if (s) {
      var o = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        o.parentNode
      );
      Er(u), u.append(o), e.items.clear();
    }
    ht(e, t, !s);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function ht(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const f of e.pending.values())
      for (const a of f)
        r.add(
          /** @type {EachItem} */
          e.items.get(a).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= J;
      const f = document.createDocumentFragment();
      kt(l, f);
    } else
      O(t[i], n);
  }
}
var Lt;
function At(e, t, n, r, i, l = null) {
  var f = e, a = /* @__PURE__ */ new Map(), s = (t & Kt) !== 0;
  if (s) {
    var o = (
      /** @type {Element} */
      e
    );
    f = o.appendChild(we());
  }
  var u = null, h = /* @__PURE__ */ _r(() => {
    var y = n();
    return Bt(y) ? y : y == null ? [] : Je(y);
  }), v, p = /* @__PURE__ */ new Map(), d = !0;
  function m(y) {
    (b.effect.f & G) === 0 && (b.pending.delete(y), b.fallback = u, Jr(b, v, f, t, r), u !== null && (v.length === 0 ? (u.f & J) === 0 ? zt(u) : (u.f ^= J, Pe(u, null, f)) : be(u, () => {
      u = null;
    })));
  }
  function c(y) {
    b.pending.delete(y);
  }
  var _ = yt(() => {
    v = /** @type {V[]} */
    g(h);
    for (var y = v.length, k = /* @__PURE__ */ new Set(), M = (
      /** @type {Batch} */
      x
    ), fe = hn(), q = 0; q < y; q += 1) {
      var ne = v[q], re = r(ne, q), A = d ? null : a.get(re);
      A ? (A.v && Ne(A.v, ne), A.i && Ne(A.i, q), fe && M.unskip_effect(A.e)) : (A = Xr(
        a,
        d ? f : Lt ??= we(),
        ne,
        re,
        q,
        i,
        t,
        n
      ), d || (A.e.f |= J), a.set(re, A)), k.add(re);
    }
    if (y === 0 && l && !u && (d ? u = V(() => l(f)) : (u = V(() => l(Lt ??= we())), u.f |= J)), y > k.size && Un(), !d)
      if (p.set(M, k), fe) {
        for (const [nt, Mn] of a)
          k.has(nt) || M.skip_effect(Mn.e);
        M.oncommit(m), M.ondiscard(c);
      } else
        m(M);
    g(h);
  }), b = { effect: _, items: a, pending: p, outrogroups: null, fallback: u };
  d = !1;
}
function je(e) {
  for (; e !== null && (e.f & Z) === 0; )
    e = e.next;
  return e;
}
function Jr(e, t, n, r, i) {
  var l = (r & Zn) !== 0, f = t.length, a = e.items, s = je(e.effect.first), o, u = null, h, v = [], p = [], d, m, c, _;
  if (l)
    for (_ = 0; _ < f; _ += 1)
      d = t[_], m = i(d, _), c = /** @type {EachItem} */
      a.get(m).e, (c.f & J) === 0 && (c.nodes?.a?.measure(), (h ??= /* @__PURE__ */ new Set()).add(c));
  for (_ = 0; _ < f; _ += 1) {
    if (d = t[_], m = i(d, _), c = /** @type {EachItem} */
    a.get(m).e, e.outrogroups !== null)
      for (const A of e.outrogroups)
        A.pending.delete(c), A.done.delete(c);
    if ((c.f & L) !== 0 && (zt(c), l && (c.nodes?.a?.unfix(), (h ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & J) !== 0)
      if (c.f ^= J, c === s)
        Pe(c, null, n);
      else {
        var b = u ? u.next : s;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), oe(e, u, c), oe(e, c, b), Pe(c, b, n), u = c, v = [], p = [], s = je(u.next);
        continue;
      }
    if (c !== s) {
      if (o !== void 0 && o.has(c)) {
        if (v.length < p.length) {
          var y = p[0], k;
          u = y.prev;
          var M = v[0], fe = v[v.length - 1];
          for (k = 0; k < v.length; k += 1)
            Pe(v[k], y, n);
          for (k = 0; k < p.length; k += 1)
            o.delete(p[k]);
          oe(e, M.prev, fe.next), oe(e, u, M), oe(e, fe, y), s = y, u = fe, _ -= 1, v = [], p = [];
        } else
          o.delete(c), Pe(c, s, n), oe(e, c.prev, c.next), oe(e, c, u === null ? e.effect.first : u.next), oe(e, u, c), u = c;
        continue;
      }
      for (v = [], p = []; s !== null && s !== c; )
        (o ??= /* @__PURE__ */ new Set()).add(s), p.push(s), s = je(s.next);
      if (s === null)
        continue;
    }
    (c.f & J) === 0 && v.push(c), u = c, s = je(c.next);
  }
  if (e.outrogroups !== null) {
    for (const A of e.outrogroups)
      A.pending.size === 0 && (ht(e, Je(A.done)), e.outrogroups?.delete(A));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || o !== void 0) {
    var q = [];
    if (o !== void 0)
      for (c of o)
        (c.f & L) === 0 && q.push(c);
    for (; s !== null; )
      (s.f & L) === 0 && s !== e.fallback && q.push(s), s = je(s.next);
    var ne = q.length;
    if (ne > 0) {
      var re = (r & Kt) !== 0 && f === 0 ? n : null;
      if (l) {
        for (_ = 0; _ < ne; _ += 1)
          q[_].nodes?.a?.measure();
        for (_ = 0; _ < ne; _ += 1)
          q[_].nodes?.a?.fix();
      }
      $r(e, q, re);
    }
  }
  l && me(() => {
    if (h !== void 0)
      for (c of h)
        c.nodes?.a?.apply();
  });
}
function Xr(e, t, n, r, i, l, f, a) {
  var s = (f & Jn) !== 0 ? (f & Qn) === 0 ? /* @__PURE__ */ br(n, !1, !1) : ze(n) : null, o = (f & Xn) !== 0 ? ze(i) : null;
  return {
    v: s,
    i: o,
    e: V(() => (l(t, s ?? n, o ?? i, a), () => {
      e.delete(r);
    }))
  };
}
function Pe(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & J) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ et(r)
      );
      if (l.before(r), r === i)
        return;
      r = f;
    }
}
function oe(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function tt(e, t) {
  Nr(() => {
    var n = e.getRootNode(), r = (
      /** @type {ShadowRoot} */
      n.host ? (
        /** @type {ShadowRoot} */
        n
      ) : (
        /** @type {Document} */
        n.head ?? /** @type {Document} */
        n.ownerDocument.head
      )
    );
    if (!r.querySelector("#" + t.hash)) {
      const i = pn("style");
      i.id = t.hash, i.textContent = t.code, r.appendChild(i);
    }
  });
}
const Ht = [...` 	
\r\f \v\uFEFF`];
function Zr(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var l = i.length, f = 0; (f = r.indexOf(i, f)) >= 0; ) {
          var a = f + l;
          (f === 0 || Ht.includes(r[f - 1])) && (a === r.length || Ht.includes(r[a])) ? r = (f === 0 ? "" : r.substring(0, f)) + r.substring(a + 1) : f = a;
        }
  }
  return r === "" ? null : r;
}
function Vt(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var i of Object.keys(e)) {
    var l = e[i];
    l != null && l !== "" && (r += " " + i + ": " + l + n);
  }
  return r;
}
function Qr(e, t) {
  if (t) {
    var n = "", r, i;
    return Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, r && (n += Vt(r)), i && (n += Vt(i, !0)), n = n.trim(), n === "" ? null : n;
  }
  return String(e);
}
function qn(e, t, n, r, i, l) {
  var f = e.__className;
  if (f !== n || f === void 0) {
    var a = Zr(n, r, l);
    a == null ? e.removeAttribute("class") : e.className = a, e.__className = n;
  } else if (l && i !== l)
    for (var s in l) {
      var o = !!l[s];
      (i == null || o !== !!i[s]) && e.classList.toggle(s, o);
    }
  return l;
}
function lt(e, t = {}, n, r) {
  for (var i in n) {
    var l = n[i];
    t[i] !== l && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, l, r));
  }
}
function ei(e, t, n, r) {
  var i = e.__style;
  if (i !== t) {
    var l = Qr(t, r);
    l == null ? e.removeAttribute("style") : e.style.cssText = l, e.__style = t;
  } else r && (Array.isArray(r) ? (lt(e, n?.[0], r[0]), lt(e, n?.[1], r[1], "important")) : lt(e, n, r));
  return r;
}
function Rn(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  kr(e, "input", async (i) => {
    var l = i ? e.defaultValue : e.value;
    if (l = st(e) ? at(l) : l, n(l), x !== null && r.add(x), await Or(), l !== (l = t())) {
      var f = e.selectionStart, a = e.selectionEnd, s = e.value.length;
      if (e.value = l ?? "", a !== null) {
        var o = e.value.length;
        f === a && a === s && o > s ? (e.selectionStart = o, e.selectionEnd = o) : (e.selectionStart = f, e.selectionEnd = Math.min(a, o));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Tn(t) == null && e.value && (n(st(e) ? at(e.value) : e.value), x !== null && r.add(x)), _n(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        x
      );
      if (r.has(l))
        return;
    }
    st(e) && i === at(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function st(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function at(e) {
  return e === "" ? null : +e;
}
const ti = [
  { name: "Alice", score: 92, status: "active" },
  { name: "Bob", score: 74, status: "inactive" },
  { name: "Carol", score: 88, status: "active" },
  { name: "Dave", score: 61, status: "inactive" },
  { name: "Eve", score: 95, status: "active" }
], ni = [
  { label: "Jan", value: 30 },
  { label: "Feb", value: 55 },
  { label: "Mar", value: 40 },
  { label: "Apr", value: 70 },
  { label: "May", value: 85 }
];
var ri = /* @__PURE__ */ te('<div class="row svelte-1ljfgzz"><span class="cell svelte-1ljfgzz"> </span> <span class="cell svelte-1ljfgzz"> </span> <span> </span></div>'), ii = /* @__PURE__ */ te('<div class="table-wrap svelte-1ljfgzz"><div class="filter-row svelte-1ljfgzz"><input class="filter-input svelte-1ljfgzz" placeholder="Filter by name"/> <span class="count svelte-1ljfgzz"> </span></div> <div class="rows svelte-1ljfgzz"><div class="row header-row svelte-1ljfgzz"><button class="cell header-cell svelte-1ljfgzz">Name</button> <button class="cell header-cell svelte-1ljfgzz">Score</button> <button class="cell header-cell svelte-1ljfgzz">Status</button></div> <!></div></div>');
const li = {
  hash: "svelte-1ljfgzz",
  code: ".table-wrap.svelte-1ljfgzz {display:flex;flex-direction:column;gap:12px;}.filter-row.svelte-1ljfgzz {display:flex;align-items:center;gap:12px;}.filter-input.svelte-1ljfgzz {padding:7px 12px;border-radius:5px;font-size:13px;background:#2a2a3a;color:#eee;flex:1;}.count.svelte-1ljfgzz {font-size:12px;color:#888;flex-shrink:0;}.rows.svelte-1ljfgzz {display:flex;flex-direction:column;gap:2px;}.row.svelte-1ljfgzz {display:flex;gap:0;}.header-row.svelte-1ljfgzz {background:#1a1a2e;border-radius:5px 5px 0 0;}.cell.svelte-1ljfgzz {flex:1;padding:9px 14px;font-size:13px;}.header-cell.svelte-1ljfgzz {font-weight:600;color:#aaa;font-size:12px;text-align:left;background:transparent;}.status.svelte-1ljfgzz {color:#888;}.status.active.svelte-1ljfgzz {color:#5af05a;}"
};
function si(e, t) {
  Ze(t, !0), tt(e, li);
  let n = /* @__PURE__ */ P("name"), r = /* @__PURE__ */ P(1), i = /* @__PURE__ */ P("");
  const l = /* @__PURE__ */ ct(() => t.rows.filter((b) => b.name.toLowerCase().includes(g(i).toLowerCase())).slice().sort((b, y) => {
    const k = b[g(n)], M = y[g(n)];
    return typeof k == "string" ? k.localeCompare(M) * g(r) : (k - M) * g(r);
  }));
  function f(b) {
    g(n) === b ? I(r, -g(r)) : (I(n, b, !0), I(r, 1));
  }
  var a = ii(), s = z(a), o = z(s), u = R(o, 2), h = z(u), v = R(s, 2), p = z(v), d = z(p), m = R(d, 2), c = R(m, 2), _ = R(p, 2);
  At(_, 17, () => g(l), St, (b, y) => {
    var k = ri(), M = z(k), fe = z(M), q = R(M, 2), ne = z(q), re = R(q, 2);
    let A;
    var nt = z(re);
    Ve(() => {
      se(fe, g(y).name), se(ne, g(y).score), A = qn(re, 1, "cell status svelte-1ljfgzz", null, A, { active: g(y).status === "active" }), se(nt, g(y).status);
    }), X(b, k);
  }), Ve(() => se(h, `Showing ${g(l).length ?? ""} / ${t.rows.length ?? ""}`)), Rn(o, () => g(i), (b) => I(i, b)), Ge("click", d, () => f("name")), Ge("click", m, () => f("score")), Ge("click", c, () => f("status")), X(e, a), Qe();
}
Nn(["click"]);
var ai = /* @__PURE__ */ te('<div class="bar-row svelte-1iixga4"><span class="label svelte-1iixga4"> </span> <div class="bar-track svelte-1iixga4"><div class="bar-fill svelte-1iixga4"><span class="bar-val svelte-1iixga4"> </span></div></div></div>'), fi = /* @__PURE__ */ te('<div class="chart svelte-1iixga4"></div>');
const oi = {
  hash: "svelte-1iixga4",
  code: ".chart.svelte-1iixga4 {display:flex;flex-direction:column;gap:10px;padding:16px 0;}.bar-row.svelte-1iixga4 {display:flex;align-items:center;gap:12px;}.label.svelte-1iixga4 {width:52px;font-size:12px;color:#aaa;text-align:right;flex-shrink:0;}.bar-track.svelte-1iixga4 {flex:1;height:22px;background:#2a2a3a;border-radius:4px;overflow:hidden;}.bar-fill.svelte-1iixga4 {height:100%;background:#3a3af0;border-radius:4px;min-width:4px;display:flex;align-items:center;}.bar-val.svelte-1iixga4 {padding:0 6px;font-size:11px;color:#fff;}"
};
function ui(e, t) {
  Ze(t, !0), tt(e, oi);
  const n = /* @__PURE__ */ ct(() => Math.max(...t.data.map((i) => i.value)));
  var r = fi();
  At(r, 21, () => t.data, St, (i, l) => {
    const f = /* @__PURE__ */ ct(() => Math.round(g(l).value / g(n) * 100));
    var a = ai(), s = z(a), o = z(s), u = R(s, 2), h = z(u);
    let v;
    var p = z(h), d = z(p);
    Ve(() => {
      se(o, g(l).label), v = ei(h, "", v, { width: `${g(f) ?? ""}%` }), se(d, g(l).value);
    }), X(i, a);
  }), X(e, r), Qe();
}
var ci = /* @__PURE__ */ te("<button> </button>"), vi = /* @__PURE__ */ te('<nav class="sidebar svelte-1hv280f"><div class="nav-title svelte-1hv280f">Dashboard</div> <!></nav>');
const di = {
  hash: "svelte-1hv280f",
  code: ".sidebar.svelte-1hv280f {display:flex;flex-direction:column;width:160px;min-width:160px;padding:16px 12px;gap:6px;background:#1a1a2e;}.nav-title.svelte-1hv280f {font-size:13px;font-weight:700;padding:0 8px 12px;color:#aaa;text-transform:uppercase;letter-spacing:0.08em;}.nav-btn.svelte-1hv280f {padding:9px 12px;border-radius:6px;font-size:14px;text-align:left;background:transparent;color:#ccc;}.nav-btn.active.svelte-1hv280f {background:#3a3af0;color:#fff;}"
};
function hi(e, t) {
  Ze(t, !0), tt(e, di);
  const n = ["home", "reports", "settings"];
  var r = vi(), i = R(z(r), 2);
  At(i, 17, () => n, St, (l, f) => {
    var a = ci();
    let s;
    var o = z(a);
    Ve(
      (u) => {
        s = qn(a, 1, "nav-btn svelte-1hv280f", null, s, { active: t.view === g(f) }), se(o, u);
      },
      [
        () => g(f).charAt(0).toUpperCase() + g(f).slice(1)
      ]
    ), Ge("click", a, () => t.onNavigate(g(f))), X(l, a);
  }), X(e, r), Qe();
}
Nn(["click"]);
var pi = /* @__PURE__ */ te('<section class="section svelte-1n46o8q"><h2 class="section-title svelte-1n46o8q">Overview</h2> <!></section>'), _i = /* @__PURE__ */ te('<section class="section svelte-1n46o8q"><h2 class="section-title svelte-1n46o8q">Reports</h2> <!></section>'), gi = /* @__PURE__ */ te('<section class="section svelte-1n46o8q"><h2 class="section-title svelte-1n46o8q">Settings</h2> <div class="field-row svelte-1n46o8q"><label class="field-label svelte-1n46o8q">Username</label> <input class="field-input svelte-1n46o8q"/></div></section>'), mi = /* @__PURE__ */ te('<div class="layout svelte-1n46o8q"><!> <main class="main svelte-1n46o8q"><header class="header svelte-1n46o8q"><h1 class="heading svelte-1n46o8q"> </h1> <span class="view-badge svelte-1n46o8q"> </span></header> <div class="content svelte-1n46o8q"><!></div></main></div>');
const wi = {
  hash: "svelte-1n46o8q",
  code: ".layout.svelte-1n46o8q {display:flex;height:100%;font-family:sans-serif;background:#13131f;color:#eee;}.main.svelte-1n46o8q {flex:1;display:flex;flex-direction:column;overflow:hidden;}.header.svelte-1n46o8q {display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #2a2a3a;background:#16162a;}.heading.svelte-1n46o8q {margin:0;font-size:18px;font-weight:600;}.view-badge.svelte-1n46o8q {font-size:12px;color:#888;text-transform:uppercase;}.content.svelte-1n46o8q {flex:1;padding:24px;overflow-y:auto;}.section.svelte-1n46o8q {display:flex;flex-direction:column;gap:16px;}.section-title.svelte-1n46o8q {margin:0;font-size:16px;font-weight:600;color:#ccc;}.field-row.svelte-1n46o8q {display:flex;align-items:center;gap:12px;}.field-label.svelte-1n46o8q {font-size:13px;color:#aaa;width:80px;}.field-input.svelte-1n46o8q {padding:8px 12px;border-radius:5px;background:#2a2a3a;color:#eee;font-size:14px;width:200px;}"
};
function bi(e) {
  tt(e, wi);
  let t = /* @__PURE__ */ P("home"), n = /* @__PURE__ */ P("Admin");
  var r = mi(), i = z(r);
  hi(i, {
    get view() {
      return g(t);
    },
    onNavigate: (c) => I(t, c, !0)
  });
  var l = R(i, 2), f = z(l), a = z(f), s = z(a), o = R(a, 2), u = z(o), h = R(f, 2), v = z(h);
  {
    var p = (c) => {
      var _ = pi(), b = R(z(_), 2);
      ui(b, {
        get data() {
          return ni;
        }
      }), X(c, _);
    }, d = (c) => {
      var _ = _i(), b = R(z(_), 2);
      si(b, {
        get rows() {
          return ti;
        }
      }), X(c, _);
    }, m = (c) => {
      var _ = gi(), b = R(z(_), 2), y = R(z(b), 2);
      Rn(y, () => g(n), (k) => I(n, k)), X(c, _);
    };
    Gr(v, (c) => {
      g(t) === "home" ? c(p) : g(t) === "reports" ? c(d, 1) : g(t) === "settings" && c(m, 2);
    });
  }
  Ve(() => {
    se(s, `Welcome, ${g(n) ?? ""}`), se(u, g(t));
  }), X(e, r);
}
function yi(e) {
  return Ur(bi, { target: e });
}
export {
  yi as default,
  yi as rvst_mount
};

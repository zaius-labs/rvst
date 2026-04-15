var sn = Array.isArray, Zn = Array.prototype.indexOf, We = Array.prototype.includes, yt = Array.from, Jn = Object.defineProperty, lt = Object.getOwnPropertyDescriptor, Xn = Object.prototype, Qn = Array.prototype, er = Object.getPrototypeOf, Ut = Object.isExtensible;
const tr = () => {
};
function nr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ln() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const D = 2, ot = 4, kt = 8, an = 1 << 24, je = 16, ce = 32, Le = 64, Mt = 128, ie = 512, R = 1024, G = 2048, pe = 4096, te = 8192, ve = 16384, Ue = 32768, Vt = 1 << 25, Ze = 65536, Kt = 1 << 17, rr = 1 << 18, et = 1 << 19, sr = 1 << 20, _e = 1 << 25, Be = 65536, Nt = 1 << 21, Ot = 1 << 22, Ne = 1 << 23, St = Symbol("$state"), ke = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function ir() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function lr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ar(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function or() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function fr(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ur() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function vr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function cr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function dr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function hr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const _r = 1, pr = 2, on = 4, gr = 8, br = 16, mr = 1, wr = 2, I = Symbol(), yr = "http://www.w3.org/1999/xhtml";
function kr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function fn(e) {
  return e === this.v;
}
function qr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function un(e) {
  return !qr(e, this.v);
}
let qt = !1;
function Er() {
  qt = !0;
}
let $ = null;
function Je(e) {
  $ = e;
}
function vn(e, t = !1, n) {
  $ = {
    p: $,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      q
    ),
    l: qt && !t ? { s: null, u: null, $: [] } : null
  };
}
function cn(e) {
  var t = (
    /** @type {ComponentContext} */
    $
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Rn(r);
  }
  return t.i = !0, $ = t.p, /** @type {T} */
  {};
}
function ut() {
  return !qt || $ !== null && $.l === null;
}
let Ve = [];
function xr() {
  var e = Ve;
  Ve = [], nr(e);
}
function Pe(e) {
  if (Ve.length === 0) {
    var t = Ve;
    queueMicrotask(() => {
      t === Ve && xr();
    });
  }
  Ve.push(e);
}
function dn(e) {
  var t = q;
  if (t === null)
    return k.f |= Ne, e;
  if ((t.f & Ue) === 0 && (t.f & ot) === 0)
    throw e;
  Me(e, t);
}
function Me(e, t) {
  for (; t !== null; ) {
    if ((t.f & Mt) !== 0) {
      if ((t.f & Ue) === 0)
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
const Tr = -7169;
function M(e, t) {
  e.f = e.f & Tr | t;
}
function Pt(e) {
  (e.f & ie) !== 0 || e.deps === null ? M(e, R) : M(e, pe);
}
function hn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & D) === 0 || (t.f & Be) === 0 || (t.f ^= Be, hn(
        /** @type {Derived} */
        t.deps
      ));
}
function _n(e, t, n) {
  (e.f & G) !== 0 ? t.add(e) : (e.f & pe) !== 0 && n.add(e), hn(e.deps), M(e, R);
}
const Ae = /* @__PURE__ */ new Set();
let T = null, fe = null, Rt = null, At = !1, Ke = null, gt = null;
var Gt = 0;
let Sr = 1;
class Fe {
  id = Sr++;
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
  #o = /* @__PURE__ */ new Set();
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
  #s = null;
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
  #v = !1;
  /** @type {Set<Batch>} */
  #f = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#r.size > 0;
  }
  #h() {
    for (const r of this.#f)
      for (const s of r.#r.keys()) {
        for (var t = !1, n = s; n.parent !== null; ) {
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
        M(r, G), this.schedule(r);
      for (r of n.m)
        M(r, pe), this.schedule(r);
    }
  }
  #d() {
    if (Gt++ > 1e3 && (Ae.delete(this), Ar()), !this.#c()) {
      for (const a of this.#i)
        this.#l.delete(a), M(a, G), this.schedule(a);
      for (const a of this.#l)
        M(a, pe), this.schedule(a);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = Ke = [], r = [], s = gt = [];
    for (const a of t)
      try {
        this.#u(a, n, r);
      } catch (l) {
        throw mn(a), l;
      }
    if (T = null, s.length > 0) {
      var i = Fe.ensure();
      for (const a of s)
        i.schedule(a);
    }
    if (Ke = null, gt = null, this.#c() || this.#h()) {
      this.#_(r), this.#_(n);
      for (const [a, l] of this.#a)
        bn(a, l);
    } else {
      this.#e.size === 0 && Ae.delete(this), this.#i.clear(), this.#l.clear();
      for (const a of this.#t) a(this);
      this.#t.clear(), Wt(r), Wt(n), this.#s?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      T
    );
    if (this.#n.length > 0) {
      const a = o ??= this;
      a.#n.push(...this.#n.filter((l) => !a.#n.includes(l)));
    }
    o !== null && (Ae.add(o), o.#d()), Ae.has(this) || this.#b();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #u(t, n, r) {
    t.f ^= R;
    for (var s = t.first; s !== null; ) {
      var i = s.f, o = (i & (ce | Le)) !== 0, a = o && (i & R) !== 0, l = a || (i & te) !== 0 || this.#a.has(s);
      if (!l && s.fn !== null) {
        o ? s.f ^= R : (i & ot) !== 0 ? n.push(s) : ct(s) && ((i & je) !== 0 && this.#l.add(s), Qe(s));
        var f = s.first;
        if (f !== null) {
          s = f;
          continue;
        }
      }
      for (; s !== null; ) {
        var u = s.next;
        if (u !== null) {
          s = u;
          break;
        }
        s = s.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #_(t) {
    for (var n = 0; n < t.length; n += 1)
      _n(t[n], this.#i, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== I && !this.previous.has(t) && this.previous.set(t, n), (t.f & Ne) === 0 && (this.current.set(t, [t.v, r]), fe?.set(t, t.v));
  }
  activate() {
    T = this;
  }
  deactivate() {
    T = null, fe = null;
  }
  flush() {
    try {
      At = !0, T = this, this.#d();
    } finally {
      Gt = 0, Rt = null, Ke = null, gt = null, At = !1, T = null, fe = null, Re.clear();
    }
  }
  discard() {
    for (const t of this.#o) t(this);
    this.#o.clear(), Ae.delete(this);
  }
  #b() {
    for (const f of Ae) {
      var t = f.id < this.id, n = [];
      for (const [u, [d, v]] of this.current) {
        if (f.current.has(u)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(u)[0]
          );
          if (t && d !== r)
            f.current.set(u, [d, v]);
          else
            continue;
        }
        n.push(u);
      }
      var s = [...f.current.keys()].filter((u) => !this.current.has(u));
      if (s.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var a of n)
          pn(a, s, i, o);
        if (f.#n.length > 0) {
          f.apply();
          for (var l of f.#n)
            f.#u(l, [], []);
          f.#n = [];
        }
        f.deactivate();
      }
    }
    for (const f of Ae)
      f.#f.has(this) && (f.#f.delete(this), f.#f.size === 0 && !f.#c() && (f.activate(), f.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#e.get(n) ?? 0;
    if (this.#e.set(n, r + 1), t) {
      let s = this.#r.get(n) ?? 0;
      this.#r.set(n, s + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let s = this.#e.get(n) ?? 0;
    if (s === 1 ? this.#e.delete(n) : this.#e.set(n, s - 1), t) {
      let i = this.#r.get(n) ?? 0;
      i === 1 ? this.#r.delete(n) : this.#r.set(n, i - 1);
    }
    this.#v || r || (this.#v = !0, Pe(() => {
      this.#v = !1, this.flush();
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
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#o.add(t);
  }
  settled() {
    return (this.#s ??= ln()).promise;
  }
  static ensure() {
    if (T === null) {
      const t = T = new Fe();
      At || (Ae.add(T), Pe(() => {
        T === t && t.flush();
      }));
    }
    return T;
  }
  apply() {
    {
      fe = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Rt = t, t.b?.is_pending && (t.f & (ot | kt | an)) !== 0 && (t.f & Ue) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Ke !== null && n === q && (k === null || (k.f & D) === 0))
        return;
      if ((r & (Le | ce)) !== 0) {
        if ((r & R) === 0)
          return;
        n.f ^= R;
      }
    }
    this.#n.push(n);
  }
}
function Ar() {
  try {
    ur();
  } catch (e) {
    Me(e, Rt);
  }
}
let ye = null;
function Wt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (ve | te)) === 0 && ct(r) && (ye = /* @__PURE__ */ new Set(), Qe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && jn(r), ye?.size > 0)) {
        Re.clear();
        for (const s of ye) {
          if ((s.f & (ve | te)) !== 0) continue;
          const i = [s];
          let o = s.parent;
          for (; o !== null; )
            ye.has(o) && (ye.delete(o), i.push(o)), o = o.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (ve | te)) === 0 && Qe(l);
          }
        }
        ye.clear();
      }
    }
    ye = null;
  }
}
function pn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & D) !== 0 ? pn(
        /** @type {Derived} */
        s,
        t,
        n,
        r
      ) : (i & (Ot | je)) !== 0 && (i & G) === 0 && gn(s, t, r) && (M(s, G), It(
        /** @type {Effect} */
        s
      ));
    }
}
function gn(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (We.call(t, s))
        return !0;
      if ((s.f & D) !== 0 && gn(
        /** @type {Derived} */
        s,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          s,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function It(e) {
  T.schedule(e);
}
function bn(e, t) {
  if (!((e.f & ce) !== 0 && (e.f & R) !== 0)) {
    (e.f & G) !== 0 ? t.d.push(e) : (e.f & pe) !== 0 && t.m.push(e), M(e, R);
    for (var n = e.first; n !== null; )
      bn(n, t), n = n.next;
  }
}
function mn(e) {
  M(e, R);
  for (var t = e.first; t !== null; )
    mn(t), t = t.next;
}
function Cr(e) {
  let t = 0, n = He(0), r;
  return () => {
    zt() && (h(n), Zr(() => (t === 0 && (r = ns(() => e(() => at(n)))), t += 1, () => {
      Pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, at(n));
      });
    })));
  };
}
var Mr = Ze | et;
function Nr(e, t, n, r) {
  new Rr(e, t, n, r);
}
class Rr {
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
  #o = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #s;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #a = null;
  #v = 0;
  #f = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
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
  #_ = Cr(() => (this.#u = He(this.#v), () => {
    this.#u = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, s) {
    this.#t = t, this.#e = n, this.#r = (i) => {
      var o = (
        /** @type {Effect} */
        q
      );
      o.b = this, o.f |= Mt, r(i);
    }, this.parent = /** @type {Effect} */
    q.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#s = Lt(() => {
      this.#m();
    }, Mr);
  }
  #b() {
    try {
      this.#n = se(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = se(() => {
      n(
        this.#t,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #k() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#i = se(() => t(this.#t)), Pe(() => {
      var n = this.#a = document.createDocumentFragment(), r = Ie();
      n.append(r), this.#n = this.#g(() => se(() => this.#r(r))), this.#f === 0 && (this.#t.before(n), this.#a = null, $e(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#p(
        /** @type {Batch} */
        T
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#f = 0, this.#v = 0, this.#n = se(() => {
        this.#r(this.#t);
      }), this.#f > 0) {
        var t = this.#a = document.createDocumentFragment();
        Yt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#i = se(() => n(this.#t));
      } else
        this.#p(
          /** @type {Batch} */
          T
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    _n(t, this.#h, this.#d);
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
    var n = q, r = k, s = $;
    ge(this.#s), ae(this.#s), Je(this.#s.ctx);
    try {
      return Fe.ensure(), t();
    } catch (i) {
      return dn(i), null;
    } finally {
      ge(n), ae(r), Je(s);
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
    this.#f += t, this.#f === 0 && (this.#p(n), this.#i && $e(this.#i, () => {
      this.#i = null;
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
    this.#w(t, n), this.#v += t, !(!this.#u || this.#c) && (this.#c = !0, Pe(() => {
      this.#c = !1, this.#u && Xe(this.#u, this.#v);
    }));
  }
  get_effect_pending() {
    return this.#_(), h(
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
    this.#n && (J(this.#n), this.#n = null), this.#i && (J(this.#i), this.#i = null), this.#l && (J(this.#l), this.#l = null);
    var s = !1, i = !1;
    const o = () => {
      if (s) {
        kr();
        return;
      }
      s = !0, i && hr(), this.#l !== null && $e(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, a = (l) => {
      try {
        i = !0, n?.(l, o), i = !1;
      } catch (f) {
        Me(f, this.#s && this.#s.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return se(() => {
            var f = (
              /** @type {Effect} */
              q
            );
            f.b = this, f.f |= Mt, r(
              this.#t,
              () => l,
              () => o
            );
          });
        } catch (f) {
          return Me(
            f,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    Pe(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (f) {
        Me(f, this.#s && this.#s.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        a,
        /** @param {unknown} e */
        (f) => Me(f, this.#s && this.#s.parent)
      ) : a(l);
    });
  }
}
function Fr(e, t, n, r) {
  const s = ut() ? yn : kn;
  var i = e.filter((v) => !v.settled);
  if (n.length === 0 && i.length === 0) {
    r(t.map(s));
    return;
  }
  var o = (
    /** @type {Effect} */
    q
  ), a = jr(), l = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((v) => v.promise)) : null;
  function f(v) {
    a();
    try {
      r(v);
    } catch (p) {
      (o.f & ve) === 0 && Me(p, o);
    }
    mt();
  }
  if (n.length === 0) {
    l.then(() => f(t.map(s)));
    return;
  }
  var u = wn();
  function d() {
    Promise.all(n.map((v) => /* @__PURE__ */ Dr(v))).then((v) => f([...t.map(s), ...v])).catch((v) => Me(v, o)).finally(() => u());
  }
  l ? l.then(() => {
    a(), d(), mt();
  }) : d();
}
function jr() {
  var e = (
    /** @type {Effect} */
    q
  ), t = k, n = $, r = (
    /** @type {Batch} */
    T
  );
  return function(i = !0) {
    ge(e), ae(t), Je(n), i && (e.f & ve) === 0 && (r?.activate(), r?.apply());
  };
}
function mt(e = !0) {
  ge(null), ae(null), Je(null), e && T?.deactivate();
}
function wn() {
  var e = (
    /** @type {Effect} */
    q
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    T
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (s = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, s);
  };
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
  var t = D | G, n = k !== null && (k.f & D) !== 0 ? (
    /** @type {Derived} */
    k
  ) : null;
  return q !== null && (q.f |= et), {
    ctx: $,
    deps: null,
    effects: null,
    equals: fn,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      I
    ),
    wv: 0,
    parent: n ?? q,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    q
  );
  r === null && ir();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = He(
    /** @type {V} */
    I
  ), o = !k, a = /* @__PURE__ */ new Map();
  return Wr(() => {
    var l = (
      /** @type {Effect} */
      q
    ), f = ln();
    s = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(mt);
    } catch (p) {
      f.reject(p), mt();
    }
    var u = (
      /** @type {Batch} */
      T
    );
    if (o) {
      if ((l.f & Ue) !== 0)
        var d = wn();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        a.get(u)?.reject(ke), a.delete(u);
      else {
        for (const p of a.values())
          p.reject(ke);
        a.clear();
      }
      a.set(u, f);
    }
    const v = (p, _ = void 0) => {
      if (d) {
        var m = _ === ke;
        d(m);
      }
      if (!(_ === ke || (l.f & ve) !== 0)) {
        if (u.activate(), _)
          i.f |= Ne, Xe(i, _);
        else {
          (i.f & Ne) !== 0 && (i.f ^= Ne), Xe(i, p);
          for (const [c, w] of a) {
            if (a.delete(c), c === u) break;
            w.reject(ke);
          }
        }
        u.deactivate();
      }
    };
    f.promise.then(v, (p) => v(null, p || "unknown"));
  }), Vr(() => {
    for (const l of a.values())
      l.reject(ke);
  }), new Promise((l) => {
    function f(u) {
      function d() {
        u === s ? l(i) : f(s);
      }
      u.then(d, d);
    }
    f(s);
  });
}
// @__NO_SIDE_EFFECTS__
function kn(e) {
  const t = /* @__PURE__ */ yn(e);
  return t.equals = un, t;
}
function Or(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      J(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Pr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & D) === 0)
      return (t.f & ve) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function $t(e) {
  var t, n = q;
  ge(Pr(e));
  try {
    e.f &= ~Be, Or(e), t = zn(e);
  } finally {
    ge(n);
  }
  return t;
}
function qn(e) {
  var t = e.v, n = $t(e);
  if (!e.equals(n) && (e.wv = In(), (!T?.is_fork || e.deps === null) && (e.v = n, T?.capture(e, t, !0), e.deps === null))) {
    M(e, R);
    return;
  }
  Ye || (fe !== null ? (zt() || T?.is_fork) && fe.set(e, n) : Pt(e));
}
function Ir(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(ke), t.teardown = tr, t.ac = null, ft(t, 0), Bt(t));
}
function En(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Qe(t);
}
let Ft = /* @__PURE__ */ new Set();
const Re = /* @__PURE__ */ new Map();
let xn = !1;
function He(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: fn,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const n = He(e);
  return Qr(n), n;
}
// @__NO_SIDE_EFFECTS__
function $r(e, t = !1, n = !0) {
  const r = He(e);
  return t || (r.equals = un), qt && n && $ !== null && $.l !== null && ($.l.s ??= []).push(r), r;
}
function C(e, t, n = !1) {
  k !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ue || (k.f & Kt) !== 0) && ut() && (k.f & (D | je | Ot | Kt)) !== 0 && (le === null || !We.call(le, e)) && dr();
  let r = n ? Ge(t) : t;
  return Xe(e, r, gt);
}
function Xe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ye ? Re.set(e, t) : Re.set(e, r), e.v = t;
    var s = Fe.ensure();
    if (s.capture(e, r), (e.f & D) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & G) !== 0 && $t(i), fe === null && Pt(i);
    }
    e.wv = In(), Tn(e, G, n), ut() && q !== null && (q.f & R) !== 0 && (q.f & (ce | Le)) === 0 && (re === null ? es([e]) : re.push(e)), !s.is_fork && Ft.size > 0 && !xn && zr();
  }
  return t;
}
function zr() {
  xn = !1;
  for (const e of Ft)
    (e.f & R) !== 0 && M(e, pe), ct(e) && Qe(e);
  Ft.clear();
}
function at(e) {
  C(e, e.v + 1);
}
function Tn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var s = ut(), i = r.length, o = 0; o < i; o++) {
      var a = r[o], l = a.f;
      if (!(!s && a === q)) {
        var f = (l & G) === 0;
        if (f && M(a, t), (l & D) !== 0) {
          var u = (
            /** @type {Derived} */
            a
          );
          fe?.delete(u), (l & Be) === 0 && (l & ie && (a.f |= Be), Tn(u, pe, n));
        } else if (f) {
          var d = (
            /** @type {Effect} */
            a
          );
          (l & je) !== 0 && ye !== null && ye.add(d), n !== null ? n.push(d) : It(d);
        }
      }
    }
}
function Ge(e) {
  if (typeof e != "object" || e === null || St in e)
    return e;
  const t = er(e);
  if (t !== Xn && t !== Qn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = sn(e), s = /* @__PURE__ */ W(0), i = ze, o = (a) => {
    if (ze === i)
      return a();
    var l = k, f = ze;
    ae(null), Xt(i);
    var u = a();
    return ae(l), Xt(f), u;
  };
  return r && n.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && vr();
        var u = n.get(l);
        return u === void 0 ? o(() => {
          var d = /* @__PURE__ */ W(f.value);
          return n.set(l, d), d;
        }) : C(u, f.value, !0), !0;
      },
      deleteProperty(a, l) {
        var f = n.get(l);
        if (f === void 0) {
          if (l in a) {
            const u = o(() => /* @__PURE__ */ W(I));
            n.set(l, u), at(s);
          }
        } else
          C(f, I), at(s);
        return !0;
      },
      get(a, l, f) {
        if (l === St)
          return e;
        var u = n.get(l), d = l in a;
        if (u === void 0 && (!d || lt(a, l)?.writable) && (u = o(() => {
          var p = Ge(d ? a[l] : I), _ = /* @__PURE__ */ W(p);
          return _;
        }), n.set(l, u)), u !== void 0) {
          var v = h(u);
          return v === I ? void 0 : v;
        }
        return Reflect.get(a, l, f);
      },
      getOwnPropertyDescriptor(a, l) {
        var f = Reflect.getOwnPropertyDescriptor(a, l);
        if (f && "value" in f) {
          var u = n.get(l);
          u && (f.value = h(u));
        } else if (f === void 0) {
          var d = n.get(l), v = d?.v;
          if (d !== void 0 && v !== I)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return f;
      },
      has(a, l) {
        if (l === St)
          return !0;
        var f = n.get(l), u = f !== void 0 && f.v !== I || Reflect.has(a, l);
        if (f !== void 0 || q !== null && (!u || lt(a, l)?.writable)) {
          f === void 0 && (f = o(() => {
            var v = u ? Ge(a[l]) : I, p = /* @__PURE__ */ W(v);
            return p;
          }), n.set(l, f));
          var d = h(f);
          if (d === I)
            return !1;
        }
        return u;
      },
      set(a, l, f, u) {
        var d = n.get(l), v = l in a;
        if (r && l === "length")
          for (var p = f; p < /** @type {Source<number>} */
          d.v; p += 1) {
            var _ = n.get(p + "");
            _ !== void 0 ? C(_, I) : p in a && (_ = o(() => /* @__PURE__ */ W(I)), n.set(p + "", _));
          }
        if (d === void 0)
          (!v || lt(a, l)?.writable) && (d = o(() => /* @__PURE__ */ W(void 0)), C(d, Ge(f)), n.set(l, d));
        else {
          v = d.v !== I;
          var m = o(() => Ge(f));
          C(d, m);
        }
        var c = Reflect.getOwnPropertyDescriptor(a, l);
        if (c?.set && c.set.call(u, f), !v) {
          if (r && typeof l == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), O = Number(l);
            Number.isInteger(O) && O >= w.v && C(w, O + 1);
          }
          at(s);
        }
        return !0;
      },
      ownKeys(a) {
        h(s);
        var l = Reflect.ownKeys(a).filter((d) => {
          var v = n.get(d);
          return v === void 0 || v.v !== I;
        });
        for (var [f, u] of n)
          u.v !== I && !(f in a) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        cr();
      }
    }
  );
}
var Zt, Sn, An, Cn;
function Lr() {
  if (Zt === void 0) {
    Zt = window, Sn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    An = lt(t, "firstChild").get, Cn = lt(t, "nextSibling").get, Ut(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ut(n) && (n.__t = void 0);
  }
}
function Ie(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function wt(e) {
  return (
    /** @type {TemplateNode | null} */
    An.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function vt(e) {
  return (
    /** @type {TemplateNode | null} */
    Cn.call(e)
  );
}
function g(e, t) {
  return /* @__PURE__ */ wt(e);
}
function _t(e, t = !1) {
  {
    var n = /* @__PURE__ */ wt(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ vt(n) : n;
  }
}
function b(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ vt(r);
  return r;
}
function Br(e) {
  e.textContent = "";
}
function Mn() {
  return !1;
}
function Hr(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(yr, e, void 0)
  );
}
function Nn(e) {
  var t = k, n = q;
  ae(null), ge(null);
  try {
    return e();
  } finally {
    ae(t), ge(n);
  }
}
function Yr(e) {
  q === null && (k === null && fr(), or()), Ye && ar();
}
function Ur(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function De(e, t) {
  var n = q;
  n !== null && (n.f & te) !== 0 && (e |= te);
  var r = {
    ctx: $,
    deps: null,
    nodes: null,
    f: e | G | ie,
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
  }, s = r;
  if ((e & ot) !== 0)
    Ke !== null ? Ke.push(r) : Fe.ensure().schedule(r);
  else if (t !== null) {
    try {
      Qe(r);
    } catch (o) {
      throw J(r), o;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & et) === 0 && (s = s.first, (e & je) !== 0 && (e & Ze) !== 0 && s !== null && (s.f |= Ze));
  }
  if (s !== null && (s.parent = n, n !== null && Ur(s, n), k !== null && (k.f & D) !== 0 && (e & Le) === 0)) {
    var i = (
      /** @type {Derived} */
      k
    );
    (i.effects ??= []).push(s);
  }
  return r;
}
function zt() {
  return k !== null && !ue;
}
function Vr(e) {
  const t = De(kt, null);
  return M(t, R), t.teardown = e, t;
}
function Kr(e) {
  Yr();
  var t = (
    /** @type {Effect} */
    q.f
  ), n = !k && (t & ce) !== 0 && (t & Ue) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      $
    );
    (r.e ??= []).push(e);
  } else
    return Rn(e);
}
function Rn(e) {
  return De(ot | sr, e);
}
function Gr(e) {
  Fe.ensure();
  const t = De(Le | et, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? $e(t, () => {
      J(t), r(void 0);
    }) : (J(t), r(void 0));
  });
}
function Wr(e) {
  return De(Ot | et, e);
}
function Zr(e, t = 0) {
  return De(kt | t, e);
}
function he(e, t = [], n = [], r = []) {
  Fr(r, t, n, (s) => {
    De(kt, () => e(...s.map(h)));
  });
}
function Lt(e, t = 0) {
  var n = De(je | t, e);
  return n;
}
function se(e) {
  return De(ce | et, e);
}
function Fn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ye, r = k;
    Jt(!0), ae(null);
    try {
      t.call(null);
    } finally {
      Jt(n), ae(r);
    }
  }
}
function Bt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && Nn(() => {
      s.abort(ke);
    });
    var r = n.next;
    (n.f & Le) !== 0 ? n.parent = null : J(n, t), n = r;
  }
}
function Jr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & ce) === 0 && J(t), t = n;
  }
}
function J(e, t = !0) {
  var n = !1;
  (t || (e.f & rr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Xr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), M(e, Vt), Bt(e, t && !n), ft(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const i of r)
      i.stop();
  Fn(e), e.f ^= Vt, e.f |= ve;
  var s = e.parent;
  s !== null && s.first !== null && jn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Xr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ vt(e);
    e.remove(), e = n;
  }
}
function jn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function $e(e, t, n = !0) {
  var r = [];
  Dn(e, r, !0);
  var s = () => {
    n && J(e), t && t();
  }, i = r.length;
  if (i > 0) {
    var o = () => --i || s();
    for (var a of r)
      a.out(o);
  } else
    s();
}
function Dn(e, t, n) {
  if ((e.f & te) === 0) {
    e.f ^= te;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, o = (s.f & Ze) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & ce) !== 0 && (e.f & je) !== 0;
      Dn(s, t, o ? n : !1), s = i;
    }
  }
}
function Ht(e) {
  On(e, !0);
}
function On(e, t) {
  if ((e.f & te) !== 0) {
    e.f ^= te, (e.f & R) === 0 && (M(e, G), Fe.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & Ze) !== 0 || (n.f & ce) !== 0;
      On(n, s ? t : !1), n = r;
    }
    var i = e.nodes && e.nodes.t;
    if (i !== null)
      for (const o of i)
        (o.is_global || t) && o.in();
  }
}
function Yt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var s = n === r ? null : /* @__PURE__ */ vt(n);
      t.append(n), n = s;
    }
}
let bt = !1, Ye = !1;
function Jt(e) {
  Ye = e;
}
let k = null, ue = !1;
function ae(e) {
  k = e;
}
let q = null;
function ge(e) {
  q = e;
}
let le = null;
function Qr(e) {
  k !== null && (le === null ? le = [e] : le.push(e));
}
let Z = null, ee = 0, re = null;
function es(e) {
  re = e;
}
let Pn = 1, Oe = 0, ze = Oe;
function Xt(e) {
  ze = e;
}
function In() {
  return ++Pn;
}
function ct(e) {
  var t = e.f;
  if ((t & G) !== 0)
    return !0;
  if (t & D && (e.f &= ~Be), (t & pe) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, s = 0; s < r; s++) {
      var i = n[s];
      if (ct(
        /** @type {Derived} */
        i
      ) && qn(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & ie) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    fe === null && M(e, R);
  }
  return !1;
}
function $n(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(le !== null && We.call(le, e)))
    for (var s = 0; s < r.length; s++) {
      var i = r[s];
      (i.f & D) !== 0 ? $n(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? M(i, G) : (i.f & R) !== 0 && M(i, pe), It(
        /** @type {Effect} */
        i
      ));
    }
}
function zn(e) {
  var t = Z, n = ee, r = re, s = k, i = le, o = $, a = ue, l = ze, f = e.f;
  Z = /** @type {null | Value[]} */
  null, ee = 0, re = null, k = (f & (ce | Le)) === 0 ? e : null, le = null, Je(e.ctx), ue = !1, ze = ++Oe, e.ac !== null && (Nn(() => {
    e.ac.abort(ke);
  }), e.ac = null);
  try {
    e.f |= Nt;
    var u = (
      /** @type {Function} */
      e.fn
    ), d = u();
    e.f |= Ue;
    var v = e.deps, p = T?.is_fork;
    if (Z !== null) {
      var _;
      if (p || ft(e, ee), v !== null && ee > 0)
        for (v.length = ee + Z.length, _ = 0; _ < Z.length; _++)
          v[ee + _] = Z[_];
      else
        e.deps = v = Z;
      if (zt() && (e.f & ie) !== 0)
        for (_ = ee; _ < v.length; _++)
          (v[_].reactions ??= []).push(e);
    } else !p && v !== null && ee < v.length && (ft(e, ee), v.length = ee);
    if (ut() && re !== null && !ue && v !== null && (e.f & (D | pe | G)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      re.length; _++)
        $n(
          re[_],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (Oe++, s.deps !== null)
        for (let m = 0; m < n; m += 1)
          s.deps[m].rv = Oe;
      if (t !== null)
        for (const m of t)
          m.rv = Oe;
      re !== null && (r === null ? r = re : r.push(.../** @type {Source[]} */
      re));
    }
    return (e.f & Ne) !== 0 && (e.f ^= Ne), d;
  } catch (m) {
    return dn(m);
  } finally {
    e.f ^= Nt, Z = t, ee = n, re = r, k = s, le = i, Je(o), ue = a, ze = l;
  }
}
function ts(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Zn.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  if (n === null && (t.f & D) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (Z === null || !We.call(Z, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & ie) !== 0 && (i.f ^= ie, i.f &= ~Be), Pt(i), Ir(i), ft(i, 0);
  }
}
function ft(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ts(e, n[r]);
}
function Qe(e) {
  var t = e.f;
  if ((t & ve) === 0) {
    M(e, R);
    var n = q, r = bt;
    q = e, bt = !0;
    try {
      (t & (je | an)) !== 0 ? Jr(e) : Bt(e), Fn(e);
      var s = zn(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Pn;
      var i;
    } finally {
      bt = r, q = n;
    }
  }
}
function h(e) {
  var t = e.f, n = (t & D) !== 0;
  if (k !== null && !ue) {
    var r = q !== null && (q.f & ve) !== 0;
    if (!r && (le === null || !We.call(le, e))) {
      var s = k.deps;
      if ((k.f & Nt) !== 0)
        e.rv < Oe && (e.rv = Oe, Z === null && s !== null && s[ee] === e ? ee++ : Z === null ? Z = [e] : Z.push(e));
      else {
        (k.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [k] : We.call(i, k) || i.push(k);
      }
    }
  }
  if (Ye && Re.has(e))
    return Re.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Ye) {
      var a = o.v;
      return ((o.f & R) === 0 && o.reactions !== null || Bn(o)) && (a = $t(o)), Re.set(o, a), a;
    }
    var l = (o.f & ie) === 0 && !ue && k !== null && (bt || (k.f & ie) !== 0), f = (o.f & Ue) === 0;
    ct(o) && (l && (o.f |= ie), qn(o)), l && !f && (En(o), Ln(o));
  }
  if (fe?.has(e))
    return fe.get(e);
  if ((e.f & Ne) !== 0)
    throw e.v;
  return e.v;
}
function Ln(e) {
  if (e.f |= ie, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & D) !== 0 && (t.f & ie) === 0 && (En(
        /** @type {Derived} */
        t
      ), Ln(
        /** @type {Derived} */
        t
      ));
}
function Bn(e) {
  if (e.v === I) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Re.has(t) || (t.f & D) !== 0 && Bn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function ns(e) {
  var t = ue;
  try {
    return ue = !0, e();
  } finally {
    ue = t;
  }
}
const Qt = globalThis.Deno?.core?.ops ?? null;
function rs(e, ...t) {
  Qt?.[e] ? Qt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function H(e, t) {
  rs("op_set_text", e, t);
}
const ss = ["touchstart", "touchmove"];
function is(e) {
  return ss.includes(e);
}
const st = Symbol("events"), Hn = /* @__PURE__ */ new Set(), jt = /* @__PURE__ */ new Set();
function A(e, t, n) {
  (t[st] ??= {})[e] = n;
}
function Yn(e) {
  for (var t = 0; t < e.length; t++)
    Hn.add(e[t]);
  for (var n of jt)
    n(e);
}
let en = null;
function tn(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  en = e;
  var o = 0, a = en === e && e[st];
  if (a) {
    var l = s.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[st] = t;
      return;
    }
    var f = s.indexOf(t);
    if (f === -1)
      return;
    l <= f && (o = l);
  }
  if (i = /** @type {Element} */
  s[o] || e.target, i !== t) {
    Jn(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var u = k, d = q;
    ae(null), ge(null);
    try {
      for (var v, p = []; i !== null; ) {
        var _ = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var m = i[st]?.[r];
          m != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && m.call(i, e);
        } catch (c) {
          v ? p.push(c) : v = c;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        i = _;
      }
      if (v) {
        for (let c of p)
          queueMicrotask(() => {
            throw c;
          });
        throw v;
      }
    } finally {
      e[st] = t, delete e.currentTarget, ae(u), ge(d);
    }
  }
}
const ls = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function as(e) {
  return (
    /** @type {string} */
    ls?.createHTML(e) ?? e
  );
}
function os(e) {
  var t = Hr("template");
  return t.innerHTML = as(e.replaceAll("<!>", "<!---->")), t.content;
}
function nn(e, t) {
  var n = (
    /** @type {Effect} */
    q
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ne(e, t) {
  var n = (t & mr) !== 0, r = (t & wr) !== 0, s, i = !e.startsWith("<!>");
  return () => {
    s === void 0 && (s = os(i ? e : "<!>" + e), n || (s = /** @type {TemplateNode} */
    /* @__PURE__ */ wt(s)));
    var o = (
      /** @type {TemplateNode} */
      r || Sn ? document.importNode(s, !0) : s.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ wt(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      nn(a, l);
    } else
      nn(o, o);
    return o;
  };
}
function Q(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function fs(e, t) {
  return us(e, t);
}
const pt = /* @__PURE__ */ new Map();
function us(e, { target: t, anchor: n, props: r = {}, events: s, context: i, intro: o = !0, transformError: a }) {
  Lr();
  var l = void 0, f = Gr(() => {
    var u = n ?? t.appendChild(Ie());
    Nr(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (p) => {
        vn({});
        var _ = (
          /** @type {ComponentContext} */
          $
        );
        i && (_.c = i), s && (r.$$events = s), l = e(p, r) || {}, cn();
      },
      a
    );
    var d = /* @__PURE__ */ new Set(), v = (p) => {
      for (var _ = 0; _ < p.length; _++) {
        var m = p[_];
        if (!d.has(m)) {
          d.add(m);
          var c = is(m);
          for (const S of [t, document]) {
            var w = pt.get(S);
            w === void 0 && (w = /* @__PURE__ */ new Map(), pt.set(S, w));
            var O = w.get(m);
            O === void 0 ? (S.addEventListener(m, tn, { passive: c }), w.set(m, 1)) : w.set(m, O + 1);
          }
        }
      }
    };
    return v(yt(Hn)), jt.add(v), () => {
      for (var p of d)
        for (const c of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            pt.get(c)
          ), m = (
            /** @type {number} */
            _.get(p)
          );
          --m == 0 ? (c.removeEventListener(p, tn), _.delete(p), _.size === 0 && pt.delete(c)) : _.set(p, m);
        }
      jt.delete(v), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return vs.set(l, f), l;
}
let vs = /* @__PURE__ */ new WeakMap();
class cs {
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
  #o = /* @__PURE__ */ new Map();
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
  #s = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#s = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#o.get(n);
      if (r)
        Ht(r), this.#r.delete(n);
      else {
        var s = this.#e.get(n);
        s && (this.#o.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [i, o] of this.#t) {
        if (this.#t.delete(i), i === t)
          break;
        const a = this.#e.get(o);
        a && (J(a.effect), this.#e.delete(o));
      }
      for (const [i, o] of this.#o) {
        if (i === n || this.#r.has(i)) continue;
        const a = () => {
          if (Array.from(this.#t.values()).includes(i)) {
            var f = document.createDocumentFragment();
            Yt(o, f), f.append(Ie()), this.#e.set(i, { effect: o, fragment: f });
          } else
            J(o);
          this.#r.delete(i), this.#o.delete(i);
        };
        this.#s || !r ? (this.#r.add(i), $e(o, a, !1)) : a();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, s] of this.#e)
      n.includes(r) || (J(s.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      T
    ), s = Mn();
    if (n && !this.#o.has(t) && !this.#e.has(t))
      if (s) {
        var i = document.createDocumentFragment(), o = Ie();
        i.append(o), this.#e.set(t, {
          effect: se(() => n(o)),
          fragment: i
        });
      } else
        this.#o.set(
          t,
          se(() => n(this.anchor))
        );
    if (this.#t.set(r, t), s) {
      for (const [a, l] of this.#o)
        a === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [a, l] of this.#e)
        a === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(this.#n), r.ondiscard(this.#i);
    } else
      this.#n(r);
  }
}
function Ct(e, t, n = !1) {
  var r = new cs(e), s = n ? Ze : 0;
  function i(o, a) {
    r.ensure(o, a);
  }
  Lt(() => {
    var o = !1;
    t((a, l = 0) => {
      o = !0, i(l, a);
    }), o || i(-1, null);
  }, s);
}
function tt(e, t) {
  return t;
}
function ds(e, t, n) {
  for (var r = [], s = t.length, i, o = t.length, a = 0; a < s; a++) {
    let d = t[a];
    $e(
      d,
      () => {
        if (i) {
          if (i.pending.delete(d), i.done.add(d), i.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Dt(e, yt(i.done)), v.delete(i), v.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var f = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        f.parentNode
      );
      Br(u), u.append(f), e.items.clear();
    }
    Dt(e, t, !l);
  } else
    i = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(i);
}
function Dt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const a of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(a).e
        );
  }
  for (var s = 0; s < t.length; s++) {
    var i = t[s];
    if (r?.has(i)) {
      i.f |= _e;
      const o = document.createDocumentFragment();
      Yt(i, o);
    } else
      J(t[s], n);
  }
}
var rn;
function nt(e, t, n, r, s, i = null) {
  var o = e, a = /* @__PURE__ */ new Map(), l = (t & on) !== 0;
  if (l) {
    var f = (
      /** @type {Element} */
      e
    );
    o = f.appendChild(Ie());
  }
  var u = null, d = /* @__PURE__ */ kn(() => {
    var S = n();
    return sn(S) ? S : S == null ? [] : yt(S);
  }), v, p = /* @__PURE__ */ new Map(), _ = !0;
  function m(S) {
    (O.effect.f & ve) === 0 && (O.pending.delete(S), O.fallback = u, hs(O, v, o, t, r), u !== null && (v.length === 0 ? (u.f & _e) === 0 ? Ht(u) : (u.f ^= _e, it(u, null, o)) : $e(u, () => {
      u = null;
    })));
  }
  function c(S) {
    O.pending.delete(S);
  }
  var w = Lt(() => {
    v = /** @type {V[]} */
    h(d);
    for (var S = v.length, Y = /* @__PURE__ */ new Set(), oe = (
      /** @type {Batch} */
      T
    ), qe = Mn(), z = 0; z < S; z += 1) {
      var de = v[z], Ee = r(de, z), F = _ ? null : a.get(Ee);
      F ? (F.v && Xe(F.v, de), F.i && Xe(F.i, z), qe && oe.unskip_effect(F.e)) : (F = _s(
        a,
        _ ? o : rn ??= Ie(),
        de,
        Ee,
        z,
        s,
        t,
        n
      ), _ || (F.e.f |= _e), a.set(Ee, F)), Y.add(Ee);
    }
    if (S === 0 && i && !u && (_ ? u = se(() => i(o)) : (u = se(() => i(rn ??= Ie())), u.f |= _e)), S > Y.size && lr(), !_)
      if (p.set(oe, Y), qe) {
        for (const [Et, xt] of a)
          Y.has(Et) || oe.skip_effect(xt.e);
        oe.oncommit(m), oe.ondiscard(c);
      } else
        m(oe);
    h(d);
  }), O = { effect: w, items: a, pending: p, outrogroups: null, fallback: u };
  _ = !1;
}
function rt(e) {
  for (; e !== null && (e.f & ce) === 0; )
    e = e.next;
  return e;
}
function hs(e, t, n, r, s) {
  var i = (r & gr) !== 0, o = t.length, a = e.items, l = rt(e.effect.first), f, u = null, d, v = [], p = [], _, m, c, w;
  if (i)
    for (w = 0; w < o; w += 1)
      _ = t[w], m = s(_, w), c = /** @type {EachItem} */
      a.get(m).e, (c.f & _e) === 0 && (c.nodes?.a?.measure(), (d ??= /* @__PURE__ */ new Set()).add(c));
  for (w = 0; w < o; w += 1) {
    if (_ = t[w], m = s(_, w), c = /** @type {EachItem} */
    a.get(m).e, e.outrogroups !== null)
      for (const F of e.outrogroups)
        F.pending.delete(c), F.done.delete(c);
    if ((c.f & te) !== 0 && (Ht(c), i && (c.nodes?.a?.unfix(), (d ??= /* @__PURE__ */ new Set()).delete(c))), (c.f & _e) !== 0)
      if (c.f ^= _e, c === l)
        it(c, null, n);
      else {
        var O = u ? u.next : l;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), Ce(e, u, c), Ce(e, c, O), it(c, O, n), u = c, v = [], p = [], l = rt(u.next);
        continue;
      }
    if (c !== l) {
      if (f !== void 0 && f.has(c)) {
        if (v.length < p.length) {
          var S = p[0], Y;
          u = S.prev;
          var oe = v[0], qe = v[v.length - 1];
          for (Y = 0; Y < v.length; Y += 1)
            it(v[Y], S, n);
          for (Y = 0; Y < p.length; Y += 1)
            f.delete(p[Y]);
          Ce(e, oe.prev, qe.next), Ce(e, u, oe), Ce(e, qe, S), l = S, u = qe, w -= 1, v = [], p = [];
        } else
          f.delete(c), it(c, l, n), Ce(e, c.prev, c.next), Ce(e, c, u === null ? e.effect.first : u.next), Ce(e, u, c), u = c;
        continue;
      }
      for (v = [], p = []; l !== null && l !== c; )
        (f ??= /* @__PURE__ */ new Set()).add(l), p.push(l), l = rt(l.next);
      if (l === null)
        continue;
    }
    (c.f & _e) === 0 && v.push(c), u = c, l = rt(c.next);
  }
  if (e.outrogroups !== null) {
    for (const F of e.outrogroups)
      F.pending.size === 0 && (Dt(e, yt(F.done)), e.outrogroups?.delete(F));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var z = [];
    if (f !== void 0)
      for (c of f)
        (c.f & te) === 0 && z.push(c);
    for (; l !== null; )
      (l.f & te) === 0 && l !== e.fallback && z.push(l), l = rt(l.next);
    var de = z.length;
    if (de > 0) {
      var Ee = (r & on) !== 0 && o === 0 ? n : null;
      if (i) {
        for (w = 0; w < de; w += 1)
          z[w].nodes?.a?.measure();
        for (w = 0; w < de; w += 1)
          z[w].nodes?.a?.fix();
      }
      ds(e, z, Ee);
    }
  }
  i && Pe(() => {
    if (d !== void 0)
      for (c of d)
        c.nodes?.a?.apply();
  });
}
function _s(e, t, n, r, s, i, o, a) {
  var l = (o & _r) !== 0 ? (o & br) === 0 ? /* @__PURE__ */ $r(n, !1, !1) : He(n) : null, f = (o & pr) !== 0 ? He(s) : null;
  return {
    v: l,
    i: f,
    e: se(() => (i(t, l ?? n, f ?? s, a), () => {
      e.delete(r);
    }))
  };
}
function it(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, s = e.nodes.end, i = t && (t.f & _e) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ vt(r)
      );
      if (i.before(r), r === s)
        return;
      r = o;
    }
}
function Ce(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function ps(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r = r ? r + " " + t : t, r === "" ? null : r;
}
function gs(e, t) {
  return e == null ? null : String(e);
}
function N(e, t, n, r, s, i) {
  var o = e.__className;
  if (o !== n || o === void 0) {
    var a = ps(n, r);
    a == null ? e.removeAttribute("class") : e.className = a, e.__className = n;
  }
  return i;
}
function bs(e, t, n, r) {
  var s = e.__style;
  if (s !== t) {
    var i = gs(t);
    i == null ? e.removeAttribute("style") : e.style.cssText = i, e.__style = t;
  }
  return r;
}
Er();
var ms = /* @__PURE__ */ ne('<div class="lights svelte-1bmtjdr"><button class="dot red svelte-1bmtjdr" aria-label="Close"></button> <button class="dot yellow svelte-1bmtjdr" aria-label="Minimize"></button> <button class="dot green svelte-1bmtjdr" aria-label="Maximize"></button></div>');
function ws(e) {
  const t = () => globalThis.__rvst?.close(), n = () => globalThis.__rvst?.minimize(), r = () => globalThis.__rvst?.maximize();
  var s = ms(), i = g(s), o = b(i, 2), a = b(o, 2);
  A("click", i, t), A("click", o, n), A("click", a, r), Q(e, s);
}
Yn(["click"]);
var ys = /* @__PURE__ */ ne('<div class="win-controls svelte-1n46o8q"><button class="win-btn svelte-1n46o8q">&#x2015;</button> <button class="win-btn svelte-1n46o8q">&#x25A1;</button> <button class="win-btn win-close svelte-1n46o8q">&#x2715;</button></div>'), ks = /* @__PURE__ */ ne('<button class="new-btn svelte-1n46o8q">+ New</button>'), qs = /* @__PURE__ */ ne('<button><span class="nav-icon svelte-1n46o8q"> </span> </button>'), Es = /* @__PURE__ */ ne("<button><span></span> </button>"), xs = /* @__PURE__ */ ne('<div class="activity-row svelte-1n46o8q"><span class="activity-dot svelte-1n46o8q"></span> <span class="activity-what svelte-1n46o8q"> </span> <span class="activity-when svelte-1n46o8q"> </span></div>'), Ts = /* @__PURE__ */ ne(`<div class="page-header svelte-1n46o8q"><div class="page-title svelte-1n46o8q">Good morning</div> <div class="page-sub svelte-1n46o8q">Here's what's happening across your workspace.</div></div> <div class="stat-row svelte-1n46o8q"><div class="stat-card svelte-1n46o8q"><div class="stat-num svelte-1n46o8q">4</div> <div class="stat-label svelte-1n46o8q">Active projects</div></div> <div class="stat-card svelte-1n46o8q"><div class="stat-num svelte-1n46o8q" style="color:#f38ba8"> </div> <div class="stat-label svelte-1n46o8q">Open tasks</div></div> <div class="stat-card svelte-1n46o8q"><div class="stat-num svelte-1n46o8q" style="color:#a6e3a1"> </div> <div class="stat-label svelte-1n46o8q">Completed</div></div> <div class="stat-card svelte-1n46o8q"><div class="stat-num svelte-1n46o8q" style="color:#89b4fa">120K</div> <div class="stat-label svelte-1n46o8q">Training examples</div></div></div> <div class="section-title svelte-1n46o8q">Recent activity</div> <div class="activity-list svelte-1n46o8q"></div>`, 1), Ss = /* @__PURE__ */ ne('<div class="proj-row svelte-1n46o8q"><div class="proj-row-left svelte-1n46o8q"><span></span> <span class="proj-name svelte-1n46o8q"> </span> <span> </span></div> <div class="proj-row-right svelte-1n46o8q"><span class="proj-tasks svelte-1n46o8q"> </span> <div class="prog-track svelte-1n46o8q"><div></div></div> <span class="proj-pct svelte-1n46o8q"> </span></div></div>'), As = /* @__PURE__ */ ne('<div class="page-header svelte-1n46o8q"><div class="page-title svelte-1n46o8q">Projects</div> <div class="page-sub svelte-1n46o8q"> </div></div> <div class="proj-list svelte-1n46o8q"></div>', 1), Cs = /* @__PURE__ */ ne('<div><button><span class="check-icon svelte-1n46o8q"> </span></button> <span class="task-label svelte-1n46o8q"> </span> <span> </span> <span class="task-proj svelte-1n46o8q"> </span></div>'), Ms = /* @__PURE__ */ ne('<div class="page-header svelte-1n46o8q"><div class="page-title svelte-1n46o8q">Tasks</div> <div class="task-filters svelte-1n46o8q"><button>All</button> <button>Open</button> <button>Done</button></div></div> <div class="task-list svelte-1n46o8q"></div>', 1), Ns = /* @__PURE__ */ ne('<div class="page-header svelte-1n46o8q"><div class="page-title svelte-1n46o8q">Settings</div></div> <div class="settings-group svelte-1n46o8q"><div class="settings-group-title svelte-1n46o8q">Appearance</div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">Theme</span> <div class="theme-toggle svelte-1n46o8q"><button>Dark</button> <button>Light</button></div></div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">Compact UI</span> <button><span class="toggle-knob svelte-1n46o8q"></span></button></div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">Titlebar Style</span> <div class="theme-toggle svelte-1n46o8q"><button>Mac</button> <button>Windows</button></div></div></div> <div class="settings-group svelte-1n46o8q"><div class="settings-group-title svelte-1n46o8q">Profile</div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">Name</span> <div class="settings-value-box svelte-1n46o8q">Alex Rivera</div></div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">Email</span> <div class="settings-value-box svelte-1n46o8q">alex@zaius.dev</div></div></div> <div class="settings-group svelte-1n46o8q"><div class="settings-group-title svelte-1n46o8q">Notifications</div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">PR Comments</span> <button class="toggle-pill on svelte-1n46o8q"><span class="toggle-knob svelte-1n46o8q"></span></button></div> <div class="settings-row svelte-1n46o8q"><span class="settings-label svelte-1n46o8q">Mentions</span> <button><span class="toggle-knob svelte-1n46o8q"></span></button></div></div>', 1), Rs = /* @__PURE__ */ ne('<div><div class="titlebar svelte-1n46o8q" role="banner"><!> <span class="win-title svelte-1n46o8q">Orbit</span> <!></div> <div class="body svelte-1n46o8q"><div class="sidebar svelte-1n46o8q"><div class="sidebar-section-label svelte-1n46o8q">WORKSPACE</div> <!> <div class="sidebar-section-label svelte-1n46o8q" style="margin-top:24px">PROJECTS</div> <!></div> <div class="main svelte-1n46o8q"><!></div></div></div>');
function Fs(e, t) {
  vn(t, !0);
  let n = /* @__PURE__ */ W("overview");
  const r = [
    { name: "rvst", status: "active", pct: 68, tasks: 6 },
    { name: "Orbit", status: "active", pct: 72, tasks: 8 },
    { name: "Canopy", status: "active", pct: 100, tasks: 12 },
    { name: "Bitnana", status: "paused", pct: 45, tasks: 5 },
    { name: "Zaius", status: "active", pct: 31, tasks: 14 }
  ];
  let s = Ge([
    {
      done: !1,
      label: "Wire titlebar drag dispatch",
      pri: "high",
      proj: "rvst"
    },
    {
      done: !1,
      label: "Design CTM signal fusion",
      pri: "high",
      proj: "Canopy"
    },
    {
      done: !0,
      label: "Ship calc() CSS parser",
      pri: "medium",
      proj: "rvst"
    },
    {
      done: !1,
      label: "Add letter-spacing rendering",
      pri: "medium",
      proj: "rvst"
    },
    {
      done: !1,
      label: "Document ACP protocol",
      pri: "low",
      proj: "Canopy"
    },
    {
      done: !0,
      label: "Publish Bitnana alpha",
      pri: "high",
      proj: "Bitnana"
    },
    {
      done: !1,
      label: "Train BitCodec v17 corpus",
      pri: "high",
      proj: "Canopy"
    },
    {
      done: !1,
      label: "Finalize mod registry schema",
      pri: "medium",
      proj: "Zaius"
    }
  ]);
  const i = [
    { what: "Shipped calc() support in layout.rs", when: "2m ago" },
    {
      what: "Added letter-spacing to composite.rs",
      when: "18m ago"
    },
    { what: "Merged custom titlebar — 10 commits", when: "1h ago" },
    { what: "Closed 4 beads tasks in rvst roadmap", when: "3h ago" },
    {
      what: "BitCodec v17 corpus assembled (120K ex.)",
      when: "Yesterday"
    }
  ];
  let o = /* @__PURE__ */ W("all"), a = /* @__PURE__ */ W(!0), l = /* @__PURE__ */ W(!1), f = /* @__PURE__ */ W("dark"), u = /* @__PURE__ */ W("mac");
  function d(y) {
    const E = s.findIndex((x) => x.label === y);
    E >= 0 && (s[E].done = !s[E].done);
  }
  function v() {
    return h(o) === "open" ? s.filter((y) => !y.done) : h(o) === "done" ? s.filter((y) => y.done) : s;
  }
  const p = [
    { id: "overview", label: "Overview", icon: "" },
    { id: "projects", label: "Projects", icon: "" },
    { id: "tasks", label: "Tasks", icon: "" },
    { id: "settings", label: "Settings", icon: "" }
  ];
  Kr(() => {
    globalThis.__rvst?.disableDecorations();
  });
  const _ = (y) => {
    !y.target.closest("button") && !y.target.closest(".nav-item") && globalThis.__rvst?.startDragging();
  };
  var m = Rs(), c = g(m), w = g(c);
  {
    var O = (y) => {
      ws(y);
    };
    Ct(w, (y) => {
      h(u) === "mac" && y(O);
    });
  }
  var S = b(w, 4);
  {
    var Y = (y) => {
      var E = ys(), x = g(E), j = b(x, 2), U = b(j, 2);
      A("click", x, () => globalThis.__rvst?.minimize()), A("click", j, () => globalThis.__rvst?.maximize()), A("click", U, () => globalThis.__rvst?.close()), Q(y, E);
    }, oe = (y) => {
      var E = ks();
      A("click", E, () => {
        C(n, "tasks"), C(o, "open");
      }), Q(y, E);
    };
    Ct(S, (y) => {
      h(u) === "windows" ? y(Y) : y(oe, -1);
    });
  }
  var qe = b(c, 2), z = g(qe), de = b(g(z), 2);
  nt(de, 17, () => p, tt, (y, E) => {
    var x = qs(), j = g(x), U = g(j), X = b(j);
    he(() => {
      N(x, 1, `nav-item ${h(n) === h(E).id ? "active" : ""}`, "svelte-1n46o8q"), H(U, h(E).icon), H(X, ` ${h(E).label ?? ""}`);
    }), A("click", x, () => C(n, h(E).id, !0)), Q(y, x);
  });
  var Ee = b(de, 4);
  nt(Ee, 17, () => r, tt, (y, E) => {
    var x = Es(), j = g(x), U = b(j);
    he(() => {
      N(x, 1, `nav-item proj-item ${h(n) === "projects" ? "subtle" : ""}`, "svelte-1n46o8q"), N(j, 1, `proj-dot ${h(E).status ?? ""}`, "svelte-1n46o8q"), H(U, ` ${h(E).name ?? ""}`);
    }), A("click", x, () => C(n, "projects")), Q(y, x);
  });
  var F = b(z, 2), Et = g(F);
  {
    var xt = (y) => {
      var E = Ts(), x = b(_t(E), 2), j = b(g(x), 2), U = g(j), X = g(U), V = b(j, 2), P = g(V), be = g(P), K = b(x, 4);
      nt(K, 21, () => i, tt, (L, B) => {
        var me = xs(), we = b(g(me), 2), xe = g(we), Te = b(we, 2), Se = g(Te);
        he(() => {
          H(xe, h(B).what), H(Se, h(B).when);
        }), Q(L, me);
      }), he(
        (L, B) => {
          H(X, L), H(be, B);
        },
        [
          () => s.filter((L) => !L.done).length,
          () => s.filter((L) => L.done).length
        ]
      ), Q(y, E);
    }, Un = (y) => {
      var E = As(), x = _t(E), j = b(g(x), 2), U = g(j), X = b(x, 2);
      nt(X, 21, () => r, tt, (V, P) => {
        var be = Ss(), K = g(be), L = g(K), B = b(L, 2), me = g(B), we = b(B, 2), xe = g(we), Te = b(K, 2), Se = g(Te), Tt = g(Se), dt = b(Se, 2), ht = g(dt), Gn = b(dt, 2), Wn = g(Gn);
        he(() => {
          N(L, 1, `proj-dot-lg ${h(P).status ?? ""}`, "svelte-1n46o8q"), H(me, h(P).name), N(we, 1, `badge ${h(P).status ?? ""}`, "svelte-1n46o8q"), H(xe, h(P).status), H(Tt, `${h(P).tasks ?? ""} tasks`), N(ht, 1, `prog-fill ${h(P).status ?? ""}`, "svelte-1n46o8q"), bs(ht, `width:${h(P).pct ?? ""}%`), H(Wn, `${h(P).pct ?? ""}%`);
        }), Q(V, be);
      }), he((V, P) => H(U, `${V ?? ""} active · ${P ?? ""} paused`), [
        () => r.filter((V) => V.status === "active").length,
        () => r.filter((V) => V.status === "paused").length
      ]), Q(y, E);
    }, Vn = (y) => {
      var E = Ms(), x = _t(E), j = b(g(x), 2), U = g(j), X = b(U, 2), V = b(X, 2), P = b(x, 2);
      nt(P, 21, v, tt, (be, K) => {
        var L = Cs(), B = g(L), me = g(B), we = g(me), xe = b(B, 2), Te = g(xe), Se = b(xe, 2), Tt = g(Se), dt = b(Se, 2), ht = g(dt);
        he(() => {
          N(L, 1, `task-row ${h(K).done ? "done" : ""}`, "svelte-1n46o8q"), N(B, 1, `check-btn ${h(K).done ? "checked" : ""}`, "svelte-1n46o8q"), H(we, h(K).done ? "" : ""), H(Te, h(K).label), N(Se, 1, `pri-badge ${h(K).pri ?? ""}`, "svelte-1n46o8q"), H(Tt, h(K).pri), H(ht, h(K).proj);
        }), A("click", B, () => d(h(K).label)), Q(be, L);
      }), he(() => {
        N(U, 1, `filter-btn ${h(o) === "all" ? "active" : ""}`, "svelte-1n46o8q"), N(X, 1, `filter-btn ${h(o) === "open" ? "active" : ""}`, "svelte-1n46o8q"), N(V, 1, `filter-btn ${h(o) === "done" ? "active" : ""}`, "svelte-1n46o8q");
      }), A("click", U, () => C(o, "all")), A("click", X, () => C(o, "open")), A("click", V, () => C(o, "done")), Q(y, E);
    }, Kn = (y) => {
      var E = Ns(), x = b(_t(E), 2), j = b(g(x), 2), U = b(g(j), 2), X = g(U), V = b(X, 2), P = b(j, 2), be = b(g(P), 2), K = b(P, 2), L = b(g(K), 2), B = g(L), me = b(B, 2), we = b(x, 4), xe = b(g(we), 4), Te = b(g(xe), 2);
      he(() => {
        N(X, 1, `theme-btn ${h(f) === "dark" ? "active" : ""}`, "svelte-1n46o8q"), N(V, 1, `theme-btn ${h(f) === "light" ? "active" : ""}`, "svelte-1n46o8q"), N(be, 1, `toggle-pill ${h(l) ? "on" : ""}`, "svelte-1n46o8q"), N(B, 1, `theme-btn ${h(u) === "mac" ? "active" : ""}`, "svelte-1n46o8q"), N(me, 1, `theme-btn ${h(u) === "windows" ? "active" : ""}`, "svelte-1n46o8q"), N(Te, 1, `toggle-pill ${h(a) ? "on" : ""}`, "svelte-1n46o8q");
      }), A("click", X, () => C(f, "dark")), A("click", V, () => C(f, "light")), A("click", be, () => C(l, !h(l))), A("click", B, () => C(u, "mac")), A("click", me, () => C(u, "windows")), A("click", Te, () => C(a, !h(a))), Q(y, E);
    };
    Ct(Et, (y) => {
      h(n) === "overview" ? y(xt) : h(n) === "projects" ? y(Un, 1) : h(n) === "tasks" ? y(Vn, 2) : h(n) === "settings" && y(Kn, 3);
    });
  }
  he(() => N(m, 1, `shell ${h(f) ?? ""} ${h(l) ? "compact" : ""}`, "svelte-1n46o8q")), A("mousedown", c, _), Q(e, m), cn();
}
Yn(["mousedown", "click"]);
function Ds(e) {
  return fs(Fs, { target: e });
}
export {
  Ds as default,
  Ds as rvst_mount
};

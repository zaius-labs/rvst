var bt = Array.isArray, on = Array.prototype.indexOf, me = Array.prototype.includes, He = Array.from, an = Object.defineProperty, Fe = Object.getOwnPropertyDescriptor, cn = Object.prototype, dn = Array.prototype, vn = Object.getPrototypeOf, st = Object.isExtensible;
const hn = () => {
};
function _n(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function yt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const k = 2, be = 4, Ve = 8, xt = 1 << 24, fe = 16, B = 32, ce = 64, Ge = 128, M = 512, E = 1024, S = 2048, U = 4096, N = 8192, L = 16384, Te = 32768, ft = 1 << 25, qe = 65536, ut = 1 << 17, pn = 1 << 18, Se = 1 << 19, gn = 1 << 20, J = 1 << 25, de = 65536, We = 1 << 21, et = 1 << 22, ie = 1 << 23, Be = Symbol("$state"), X = new class extends Error {
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
function xn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function kn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Tn = 1, Sn = 2, An = 16, Rn = 2, T = Symbol(), Cn = "http://www.w3.org/1999/xhtml";
function Nn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Et(e) {
  return e === this.v;
}
function Fn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function kt(e) {
  return !Fn(e, this.v);
}
let H = null;
function ye(e) {
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
      nr(r);
  }
  return t.i = !0, H = t.p, /** @type {T} */
  {};
}
function Tt() {
  return !0;
}
let he = [];
function qn() {
  var e = he;
  he = [], _n(e);
}
function ge(e) {
  if (he.length === 0) {
    var t = he;
    queueMicrotask(() => {
      t === he && qn();
    });
  }
  he.push(e);
}
function St(e) {
  var t = g;
  if (t === null)
    return p.f |= ie, e;
  if ((t.f & Te) === 0 && (t.f & be) === 0)
    throw e;
  re(e, t);
}
function re(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ge) !== 0) {
      if ((t.f & Te) === 0)
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
function x(e, t) {
  e.f = e.f & On | t;
}
function tt(e) {
  (e.f & M) !== 0 || e.deps === null ? x(e, E) : x(e, U);
}
function At(e) {
  if (e !== null)
    for (const t of e)
      (t.f & k) === 0 || (t.f & de) === 0 || (t.f ^= de, At(
        /** @type {Derived} */
        t.deps
      ));
}
function Rt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), At(e.deps), x(e, E);
}
const te = /* @__PURE__ */ new Set();
let m = null, I = null, Xe = null, Ue = !1, _e = null, ze = null;
var ot = 0;
let Pn = 1;
class se {
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
  #h() {
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
        x(r, S), this.schedule(r);
      for (r of n.m)
        x(r, U), this.schedule(r);
    }
  }
  #d() {
    if (ot++ > 1e3 && (te.delete(this), In()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), x(f, S), this.schedule(f);
      for (const f of this.#n)
        x(f, U), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = _e = [], r = [], i = ze = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw Mt(f), u;
      }
    if (m = null, i.length > 0) {
      var l = se.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (_e = null, ze = null, this.#c() || this.#h()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#l)
        Ft(f, u);
    } else {
      this.#r.size === 0 && te.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), at(r), at(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    o !== null && (te.add(o), o.#d()), te.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= E;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & (B | ce)) !== 0, f = o && (l & E) !== 0, u = f || (l & N) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= E : (l & be) !== 0 ? n.push(i) : Pe(i) && ((l & fe) !== 0 && this.#n.add(i), ke(i));
        var s = i.first;
        if (s !== null) {
          i = s;
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
    n !== T && !this.previous.has(t) && this.previous.set(t, n), (t.f & ie) === 0 && (this.current.set(t, [t.v, r]), I?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, I = null;
  }
  flush() {
    try {
      Ue = !0, m = this, this.#d();
    } finally {
      ot = 0, Xe = null, _e = null, ze = null, Ue = !1, m = null, I = null, le.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), te.delete(this);
  }
  #w() {
    for (const s of te) {
      var t = s.id < this.id, n = [];
      for (const [c, [d, v]] of this.current) {
        if (s.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(c)[0]
          );
          if (t && d !== r)
            s.current.set(c, [d, v]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...s.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of n)
          Ct(f, i, l, o);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#o(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of te)
      s.#u.has(this) && (s.#u.delete(this), s.#u.size === 0 && !s.#c() && (s.activate(), s.#d()));
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
    this.#a || r || (this.#a = !0, ge(() => {
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
    if (m === null) {
      const t = m = new se();
      Ue || (te.add(m), ge(() => {
        m === t && t.flush();
      }));
    }
    return m;
  }
  apply() {
    {
      I = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Xe = t, t.b?.is_pending && (t.f & (be | Ve | xt)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === g && (p === null || (p.f & k) === 0))
        return;
      if ((r & (ce | B)) !== 0) {
        if ((r & E) === 0)
          return;
        n.f ^= E;
      }
    }
    this.#e.push(n);
  }
}
function In() {
  try {
    bn();
  } catch (e) {
    re(e, Xe);
  }
}
let W = null;
function at(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | N)) === 0 && Pe(r) && (W = /* @__PURE__ */ new Set(), ke(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Kt(r), W?.size > 0)) {
        le.clear();
        for (const i of W) {
          if ((i.f & (L | N)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            W.has(o) && (W.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (L | N)) === 0 && ke(u);
          }
        }
        W.clear();
      }
    }
    W = null;
  }
}
function Ct(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & k) !== 0 ? Ct(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (et | fe)) !== 0 && (l & S) === 0 && Nt(i, t, r) && (x(i, S), nt(
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
      if (me.call(t, i))
        return !0;
      if ((i.f & k) !== 0 && Nt(
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
  m.schedule(e);
}
function Ft(e, t) {
  if (!((e.f & B) !== 0 && (e.f & E) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), x(e, E);
    for (var n = e.first; n !== null; )
      Ft(n, t), n = n.next;
  }
}
function Mt(e) {
  x(e, E);
  for (var t = e.first; t !== null; )
    Mt(t), t = t.next;
}
function zn(e) {
  let t = 0, n = ve(0), r;
  return () => {
    it() && (R(n), sr(() => (t === 0 && (r = vr(() => e(() => Me(n)))), t += 1, () => {
      ge(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Me(n));
      });
    })));
  };
}
var Ln = qe | Se;
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
  #o = null;
  #_ = zn(() => (this.#o = ve(this.#a), () => {
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
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Ut(() => {
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
  #x() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = Y(() => t(this.#s)), ge(() => {
      var n = this.#l = document.createDocumentFragment(), r = De();
      n.append(r), this.#e = this.#g(() => Y(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, we(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = Y(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Zt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Y(() => n(this.#s));
      } else
        this.#p(
          /** @type {Batch} */
          m
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
    Rt(t, this.#h, this.#d);
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
    $(this.#i), q(this.#i), ye(this.#i.ctx);
    try {
      return se.ensure(), t();
    } catch (l) {
      return St(l), null;
    } finally {
      $(n), q(r), ye(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && we(this.#t, () => {
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
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, ge(() => {
      this.#c = !1, this.#o && xe(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), R(
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
        Nn();
        return;
      }
      i = !0, l && kn(), this.#n !== null && we(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (s) {
        re(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Y(() => {
            var s = (
              /** @type {Effect} */
              g
            );
            s.b = this, s.f |= Ge, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (s) {
          return re(
            s,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ge(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (s) {
        re(s, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (s) => re(s, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function Vn(e, t, n, r) {
  const i = qt;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = Yn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function s(v) {
    f();
    try {
      r(v);
    } catch (h) {
      (o.f & L) === 0 && re(h, o);
    }
    je();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var c = Dt();
  function d() {
    Promise.all(n.map((v) => /* @__PURE__ */ Bn(v))).then((v) => s([...t.map(i), ...v])).catch((v) => re(v, o)).finally(() => c());
  }
  u ? u.then(() => {
    f(), d(), je();
  }) : d();
}
function Yn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = H, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    $(e), q(t), ye(n), l && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function je(e = !0) {
  $(null), q(null), ye(null), e && m?.deactivate();
}
function Dt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    m
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  var t = k | S, n = p !== null && (p.f & k) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Se), {
    ctx: H,
    deps: null,
    effects: null,
    equals: Et,
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
  ), l = ve(
    /** @type {V} */
    T
  ), o = !p, f = /* @__PURE__ */ new Map();
  return lr(() => {
    var u = (
      /** @type {Effect} */
      g
    ), s = yt();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(je);
    } catch (h) {
      s.reject(h), je();
    }
    var c = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((u.f & Te) !== 0)
        var d = Dt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(X), f.delete(c);
      else {
        for (const h of f.values())
          h.reject(X);
        f.clear();
      }
      f.set(c, s);
    }
    const v = (h, a = void 0) => {
      if (d) {
        var _ = a === X;
        d(_);
      }
      if (!(a === X || (u.f & L) !== 0)) {
        if (c.activate(), a)
          l.f |= ie, xe(l, a);
        else {
          (l.f & ie) !== 0 && (l.f ^= ie), xe(l, h);
          for (const [y, b] of f) {
            if (f.delete(y), y === c) break;
            b.reject(X);
          }
        }
        c.deactivate();
      }
    };
    s.promise.then(v, (h) => v(null, h || "unknown"));
  }), tr(() => {
    for (const u of f.values())
      u.reject(X);
  }), new Promise((u) => {
    function s(c) {
      function d() {
        c === i ? u(l) : s(i);
      }
      c.then(d, d);
    }
    s(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Un(e) {
  const t = /* @__PURE__ */ qt(e);
  return t.equals = kt, t;
}
function $n(e) {
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
    if ((t.f & k) === 0)
      return (t.f & L) === 0 ? (
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
    e.f &= ~de, $n(e), t = tn(e);
  } finally {
    $(n);
  }
  return t;
}
function Ot(e) {
  var t = e.v, n = rt(e);
  if (!e.equals(n) && (e.wv = Qt(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t, !0), e.deps === null))) {
    x(e, E);
    return;
  }
  Ee || (I !== null ? (it() || m?.is_fork) && I.set(e, n) : tt(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(X), t.teardown = hn, t.ac = null, Oe(t, 0), lt(t));
}
function Pt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ke(t);
}
let Ze = /* @__PURE__ */ new Set();
const le = /* @__PURE__ */ new Map();
let It = !1;
function ve(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Et,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const n = ve(e);
  return ar(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t = !1, n = !0) {
  const r = ve(e);
  return t || (r.equals = kt), r;
}
function Z(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!z || (p.f & ut) !== 0) && Tt() && (p.f & (k | fe | et | ut)) !== 0 && (D === null || !me.call(D, e)) && En();
  let r = n ? pe(t) : t;
  return xe(e, r, ze);
}
function xe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ee ? le.set(e, t) : le.set(e, r), e.v = t;
    var i = se.ensure();
    if (i.capture(e, r), (e.f & k) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && rt(l), I === null && tt(l);
    }
    e.wv = Qt(), zt(e, S, n), g !== null && (g.f & E) !== 0 && (g.f & (B | ce)) === 0 && (F === null ? cr([e]) : F.push(e)), !i.is_fork && Ze.size > 0 && !It && Xn();
  }
  return t;
}
function Xn() {
  It = !1;
  for (const e of Ze)
    (e.f & E) !== 0 && x(e, U), Pe(e) && ke(e);
  Ze.clear();
}
function Me(e) {
  Z(e, e.v + 1);
}
function zt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, u = (f & S) === 0;
      if (u && x(o, t), (f & k) !== 0) {
        var s = (
          /** @type {Derived} */
          o
        );
        I?.delete(s), (f & de) === 0 && (f & M && (o.f |= de), zt(s, U, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & fe) !== 0 && W !== null && W.add(c), n !== null ? n.push(c) : nt(c);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Be in e)
    return e;
  const t = vn(e);
  if (t !== cn && t !== dn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = bt(e), i = /* @__PURE__ */ G(0), l = ae, o = (f) => {
    if (ae === l)
      return f();
    var u = p, s = ae;
    q(null), vt(l);
    var c = f();
    return q(u), vt(s), c;
  };
  return r && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && yn();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var d = /* @__PURE__ */ G(s.value);
          return n.set(u, d), d;
        }) : Z(c, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const c = o(() => /* @__PURE__ */ G(T));
            n.set(u, c), Me(i);
          }
        } else
          Z(s, T), Me(i);
        return !0;
      },
      get(f, u, s) {
        if (u === Be)
          return e;
        var c = n.get(u), d = u in f;
        if (c === void 0 && (!d || Fe(f, u)?.writable) && (c = o(() => {
          var h = pe(d ? f[u] : T), a = /* @__PURE__ */ G(h);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var v = R(c);
          return v === T ? void 0 : v;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var c = n.get(u);
          c && (s.value = R(c));
        } else if (s === void 0) {
          var d = n.get(u), v = d?.v;
          if (d !== void 0 && v !== T)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return s;
      },
      has(f, u) {
        if (u === Be)
          return !0;
        var s = n.get(u), c = s !== void 0 && s.v !== T || Reflect.has(f, u);
        if (s !== void 0 || g !== null && (!c || Fe(f, u)?.writable)) {
          s === void 0 && (s = o(() => {
            var v = c ? pe(f[u]) : T, h = /* @__PURE__ */ G(v);
            return h;
          }), n.set(u, s));
          var d = R(s);
          if (d === T)
            return !1;
        }
        return c;
      },
      set(f, u, s, c) {
        var d = n.get(u), v = u in f;
        if (r && u === "length")
          for (var h = s; h < /** @type {Source<number>} */
          d.v; h += 1) {
            var a = n.get(h + "");
            a !== void 0 ? Z(a, T) : h in f && (a = o(() => /* @__PURE__ */ G(T)), n.set(h + "", a));
          }
        if (d === void 0)
          (!v || Fe(f, u)?.writable) && (d = o(() => /* @__PURE__ */ G(void 0)), Z(d, pe(s)), n.set(u, d));
        else {
          v = d.v !== T;
          var _ = o(() => pe(s));
          Z(d, _);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(c, s), !v) {
          if (r && typeof u == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), w = Number(u);
            Number.isInteger(w) && w >= b.v && Z(b, w + 1);
          }
          Me(i);
        }
        return !0;
      },
      ownKeys(f) {
        R(i);
        var u = Reflect.ownKeys(f).filter((d) => {
          var v = n.get(d);
          return v === void 0 || v.v !== T;
        });
        for (var [s, c] of n)
          c.v !== T && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        xn();
      }
    }
  );
}
var ct, Lt, jt, Ht;
function Zn() {
  if (ct === void 0) {
    ct = window, Lt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    jt = Fe(t, "firstChild").get, Ht = Fe(t, "nextSibling").get, st(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), st(n) && (n.__t = void 0);
  }
}
function De(e = "") {
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
function Ye(e) {
  return (
    /** @type {TemplateNode | null} */
    Ht.call(e)
  );
}
function $e(e, t) {
  return /* @__PURE__ */ Vt(e);
}
function Ke(e, t = 1, n = !1) {
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
function Yt(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Cn, e, void 0)
  );
}
function Bt(e) {
  var t = p, n = g;
  q(null), $(null);
  try {
    return e();
  } finally {
    q(t), $(n);
  }
}
function er(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Q(e, t) {
  var n = g;
  n !== null && (n.f & N) !== 0 && (e |= N);
  var r = {
    ctx: H,
    deps: null,
    nodes: null,
    f: e | S | M,
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
  if ((e & be) !== 0)
    _e !== null ? _e.push(r) : se.ensure().schedule(r);
  else if (t !== null) {
    try {
      ke(r);
    } catch (o) {
      throw j(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Se) === 0 && (i = i.first, (e & fe) !== 0 && (e & qe) !== 0 && i !== null && (i.f |= qe));
  }
  if (i !== null && (i.parent = n, n !== null && er(i, n), p !== null && (p.f & k) !== 0 && (e & ce) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function it() {
  return p !== null && !z;
}
function tr(e) {
  const t = Q(Ve, null);
  return x(t, E), t.teardown = e, t;
}
function nr(e) {
  return Q(be | gn, e);
}
function rr(e) {
  se.ensure();
  const t = Q(ce | Se, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function ir(e) {
  return Q(be, e);
}
function lr(e) {
  return Q(et | Se, e);
}
function sr(e, t = 0) {
  return Q(Ve | t, e);
}
function fr(e, t = [], n = [], r = []) {
  Vn(r, t, n, (i) => {
    Q(Ve, () => e(...i.map(R)));
  });
}
function Ut(e, t = 0) {
  var n = Q(fe | t, e);
  return n;
}
function Y(e) {
  return Q(B | Se, e);
}
function $t(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ee, r = p;
    dt(!0), q(null);
    try {
      t.call(null);
    } finally {
      dt(n), q(r);
    }
  }
}
function lt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Bt(() => {
      i.abort(X);
    });
    var r = n.next;
    (n.f & ce) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function ur(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (or(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), x(e, ft), lt(e, t && !n), Oe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  $t(e), e.f ^= ft, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Kt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function or(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ye(e);
    e.remove(), e = n;
  }
}
function Kt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
  var r = [];
  Gt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Gt(e, t, n) {
  if ((e.f & N) === 0) {
    e.f ^= N;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & qe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & fe) !== 0;
      Gt(i, t, o ? n : !1), i = l;
    }
  }
}
function Wt(e) {
  Xt(e, !0);
}
function Xt(e, t) {
  if ((e.f & N) !== 0) {
    e.f ^= N, (e.f & E) === 0 && (x(e, S), se.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & qe) !== 0 || (n.f & B) !== 0;
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
let Le = !1, Ee = !1;
function dt(e) {
  Ee = e;
}
let p = null, z = !1;
function q(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let D = null;
function ar(e) {
  p !== null && (D === null ? D = [e] : D.push(e));
}
let A = null, C = 0, F = null;
function cr(e) {
  F = e;
}
let Jt = 1, oe = 0, ae = oe;
function vt(e) {
  ae = e;
}
function Qt() {
  return ++Jt;
}
function Pe(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & k && (e.f &= ~de), (t & U) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Pe(
        /** @type {Derived} */
        l
      ) && Ot(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & M) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    I === null && x(e, E);
  }
  return !1;
}
function en(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && me.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & k) !== 0 ? en(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? x(l, S) : (l.f & E) !== 0 && x(l, U), nt(
        /** @type {Effect} */
        l
      ));
    }
}
function tn(e) {
  var t = A, n = C, r = F, i = p, l = D, o = H, f = z, u = ae, s = e.f;
  A = /** @type {null | Value[]} */
  null, C = 0, F = null, p = (s & (B | ce)) === 0 ? e : null, D = null, ye(e.ctx), z = !1, ae = ++oe, e.ac !== null && (Bt(() => {
    e.ac.abort(X);
  }), e.ac = null);
  try {
    e.f |= We;
    var c = (
      /** @type {Function} */
      e.fn
    ), d = c();
    e.f |= Te;
    var v = e.deps, h = m?.is_fork;
    if (A !== null) {
      var a;
      if (h || Oe(e, C), v !== null && C > 0)
        for (v.length = C + A.length, a = 0; a < A.length; a++)
          v[C + a] = A[a];
      else
        e.deps = v = A;
      if (it() && (e.f & M) !== 0)
        for (a = C; a < v.length; a++)
          (v[a].reactions ??= []).push(e);
    } else !h && v !== null && C < v.length && (Oe(e, C), v.length = C);
    if (Tt() && F !== null && !z && v !== null && (e.f & (k | U | S)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      F.length; a++)
        en(
          F[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (oe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = oe;
      if (t !== null)
        for (const _ of t)
          _.rv = oe;
      F !== null && (r === null ? r = F : r.push(.../** @type {Source[]} */
      F));
    }
    return (e.f & ie) !== 0 && (e.f ^= ie), d;
  } catch (_) {
    return St(_);
  } finally {
    e.f ^= We, A = t, C = n, F = r, p = i, D = l, ye(o), z = f, ae = u;
  }
}
function dr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = on.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & k) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !me.call(A, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & M) !== 0 && (l.f ^= M, l.f &= ~de), tt(l), Gn(l), Oe(l, 0);
  }
}
function Oe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      dr(e, n[r]);
}
function ke(e) {
  var t = e.f;
  if ((t & L) === 0) {
    x(e, E);
    var n = g, r = Le;
    g = e, Le = !0;
    try {
      (t & (fe | xt)) !== 0 ? ur(e) : lt(e), $t(e);
      var i = tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var l;
    } finally {
      Le = r, g = n;
    }
  }
}
function R(e) {
  var t = e.f, n = (t & k) !== 0;
  if (p !== null && !z) {
    var r = g !== null && (g.f & L) !== 0;
    if (!r && (D === null || !me.call(D, e))) {
      var i = p.deps;
      if ((p.f & We) !== 0)
        e.rv < oe && (e.rv = oe, A === null && i !== null && i[C] === e ? C++ : A === null ? A = [e] : A.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : me.call(l, p) || l.push(p);
      }
    }
  }
  if (Ee && le.has(e))
    return le.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Ee) {
      var f = o.v;
      return ((o.f & E) === 0 && o.reactions !== null || rn(o)) && (f = rt(o)), le.set(o, f), f;
    }
    var u = (o.f & M) === 0 && !z && p !== null && (Le || (p.f & M) !== 0), s = (o.f & Te) === 0;
    Pe(o) && (u && (o.f |= M), Ot(o)), u && !s && (Pt(o), nn(o));
  }
  if (I?.has(e))
    return I.get(e);
  if ((e.f & ie) !== 0)
    throw e.v;
  return e.v;
}
function nn(e) {
  if (e.f |= M, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & k) !== 0 && (t.f & M) === 0 && (Pt(
        /** @type {Derived} */
        t
      ), nn(
        /** @type {Derived} */
        t
      ));
}
function rn(e) {
  if (e.v === T) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (le.has(t) || (t.f & k) !== 0 && rn(
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
const ht = globalThis.Deno?.core?.ops ?? null;
function hr(e, ...t) {
  ht?.[e] ? ht[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function _r(e, t) {
  hr("op_set_text", e, t);
}
const pr = ["touchstart", "touchmove"];
function gr(e) {
  return pr.includes(e);
}
const Ce = Symbol("events"), ln = /* @__PURE__ */ new Set(), Je = /* @__PURE__ */ new Set();
function _t(e, t, n) {
  (t[Ce] ??= {})[e] = n;
}
function wr(e) {
  for (var t = 0; t < e.length; t++)
    ln.add(e[t]);
  for (var n of Je)
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
  var o = 0, f = pt === e && e[Ce];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ce] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, d = g;
    q(null), $(null);
    try {
      for (var v, h = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Ce]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (y) {
          v ? h.push(y) : v = y;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (v) {
        for (let y of h)
          queueMicrotask(() => {
            throw y;
          });
        throw v;
      }
    } finally {
      e[Ce] = t, delete e.currentTarget, q(c), $(d);
    }
  }
}
const mr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function br(e) {
  return (
    /** @type {string} */
    mr?.createHTML(e) ?? e
  );
}
function yr(e) {
  var t = Yt("template");
  return t.innerHTML = br(e.replaceAll("<!>", "<!---->")), t.content;
}
function xr(e, t) {
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
    r === void 0 && (r = yr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Vt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Lt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return xr(l, l), l;
  };
}
function wt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Er(e, t) {
  return kr(e, t);
}
const Ie = /* @__PURE__ */ new Map();
function kr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  Zn();
  var u = void 0, s = rr(() => {
    var c = n ?? t.appendChild(De());
    jn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (h) => {
        Mn({});
        var a = (
          /** @type {ComponentContext} */
          H
        );
        l && (a.c = l), i && (r.$$events = i), u = e(h, r) || {}, Dn();
      },
      f
    );
    var d = /* @__PURE__ */ new Set(), v = (h) => {
      for (var a = 0; a < h.length; a++) {
        var _ = h[a];
        if (!d.has(_)) {
          d.add(_);
          var y = gr(_);
          for (const O of [t, document]) {
            var b = Ie.get(O);
            b === void 0 && (b = /* @__PURE__ */ new Map(), Ie.set(O, b));
            var w = b.get(_);
            w === void 0 ? (O.addEventListener(_, gt, { passive: y }), b.set(_, 1)) : b.set(_, w + 1);
          }
        }
      }
    };
    return v(He(ln)), Je.add(v), () => {
      for (var h of d)
        for (const y of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            Ie.get(y)
          ), _ = (
            /** @type {number} */
            a.get(h)
          );
          --_ == 0 ? (y.removeEventListener(h, gt), a.delete(h), a.size === 0 && Ie.delete(y)) : a.set(h, _);
        }
      Je.delete(v), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Tr.set(u, s), u;
}
let Tr = /* @__PURE__ */ new WeakMap();
function Sr(e, t) {
  return t;
}
function Ar(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, f = 0; f < i; f++) {
    let d = t[f];
    we(
      d,
      () => {
        if (l) {
          if (l.pending.delete(d), l.done.add(d), l.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Qe(e, He(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
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
      var s = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        s.parentNode
      );
      Jn(c), c.append(s), e.items.clear();
    }
    Qe(e, t, !u);
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
      l.f |= J;
      const o = document.createDocumentFragment();
      Zt(l, o);
    } else
      j(t[i], n);
  }
}
var mt;
function Rr(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map();
  {
    var u = (
      /** @type {Element} */
      e
    );
    o = u.appendChild(De());
  }
  var s = null, c = /* @__PURE__ */ Un(() => {
    var w = n();
    return bt(w) ? w : w == null ? [] : He(w);
  }), d, v = /* @__PURE__ */ new Map(), h = !0;
  function a(w) {
    (b.effect.f & L) === 0 && (b.pending.delete(w), b.fallback = s, Cr(b, d, o, t, r), s !== null && (d.length === 0 ? (s.f & J) === 0 ? Wt(s) : (s.f ^= J, Ne(s, null, o)) : we(s, () => {
      s = null;
    })));
  }
  function _(w) {
    b.pending.delete(w);
  }
  var y = Ut(() => {
    d = /** @type {V[]} */
    R(c);
    for (var w = d.length, O = /* @__PURE__ */ new Set(), V = (
      /** @type {Batch} */
      m
    ), ue = Qn(), ee = 0; ee < w; ee += 1) {
      var Ae = d[ee], P = r(Ae, ee), K = h ? null : f.get(P);
      K ? (K.v && xe(K.v, Ae), K.i && xe(K.i, ee), ue && V.unskip_effect(K.e)) : (K = Nr(
        f,
        h ? o : mt ??= De(),
        Ae,
        P,
        ee,
        i,
        t,
        n
      ), h || (K.e.f |= J), f.set(P, K)), O.add(P);
    }
    if (w === 0 && l && !s && (h ? s = Y(() => l(o)) : (s = Y(() => l(mt ??= De())), s.f |= J)), w > O.size && mn(), !h)
      if (v.set(V, O), ue) {
        for (const [fn, un] of f)
          O.has(fn) || V.skip_effect(un.e);
        V.oncommit(a), V.ondiscard(_);
      } else
        a(V);
    R(c);
  }), b = { effect: y, items: f, pending: v, outrogroups: null, fallback: s };
  h = !1;
}
function Re(e) {
  for (; e !== null && (e.f & B) === 0; )
    e = e.next;
  return e;
}
function Cr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = Re(e.effect.first), u, s = null, c = [], d = [], v, h, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], h = i(v, _), a = /** @type {EachItem} */
    o.get(h).e, e.outrogroups !== null)
      for (const P of e.outrogroups)
        P.pending.delete(a), P.done.delete(a);
    if ((a.f & N) !== 0 && Wt(a), (a.f & J) !== 0)
      if (a.f ^= J, a === f)
        Ne(a, null, n);
      else {
        var y = s ? s.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), ne(e, s, a), ne(e, a, y), Ne(a, y, n), s = a, c = [], d = [], f = Re(s.next);
        continue;
      }
    if (a !== f) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < d.length) {
          var b = d[0], w;
          s = b.prev;
          var O = c[0], V = c[c.length - 1];
          for (w = 0; w < c.length; w += 1)
            Ne(c[w], b, n);
          for (w = 0; w < d.length; w += 1)
            u.delete(d[w]);
          ne(e, O.prev, V.next), ne(e, s, O), ne(e, V, b), f = b, s = V, _ -= 1, c = [], d = [];
        } else
          u.delete(a), Ne(a, f, n), ne(e, a.prev, a.next), ne(e, a, s === null ? e.effect.first : s.next), ne(e, s, a), s = a;
        continue;
      }
      for (c = [], d = []; f !== null && f !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(f), d.push(f), f = Re(f.next);
      if (f === null)
        continue;
    }
    (a.f & J) === 0 && c.push(a), s = a, f = Re(a.next);
  }
  if (e.outrogroups !== null) {
    for (const P of e.outrogroups)
      P.pending.size === 0 && (Qe(e, He(P.done)), e.outrogroups?.delete(P));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || u !== void 0) {
    var ue = [];
    if (u !== void 0)
      for (a of u)
        (a.f & N) === 0 && ue.push(a);
    for (; f !== null; )
      (f.f & N) === 0 && f !== e.fallback && ue.push(f), f = Re(f.next);
    var ee = ue.length;
    if (ee > 0) {
      var Ae = l === 0 ? n : null;
      Ar(e, ue, Ae);
    }
  }
}
function Nr(e, t, n, r, i, l, o, f) {
  var u = (o & Tn) !== 0 ? (o & An) === 0 ? /* @__PURE__ */ Wn(n, !1, !1) : ve(n) : null, s = (o & Sn) !== 0 ? ve(i) : null;
  return {
    v: u,
    i: s,
    e: Y(() => (l(t, u ?? n, s ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Ne(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & J) === 0 ? (
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
function ne(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Fr(e, t) {
  ir(() => {
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
      const i = Yt("style");
      i.id = t.hash, i.textContent = t.code, r.appendChild(i);
    }
  });
}
var Mr = /* @__PURE__ */ sn('<div class="item svelte-181qcx3"><span class="text svelte-181qcx3"> </span> <button class="remove-btn svelte-181qcx3">Remove</button></div>'), Dr = /* @__PURE__ */ sn('<div class="app svelte-181qcx3"><h2 class="title svelte-181qcx3">Todo List</h2> <div class="list svelte-181qcx3"></div> <button class="add-btn svelte-181qcx3">+ Add</button></div>');
const qr = {
  hash: "svelte-181qcx3",
  code: ".app.svelte-181qcx3 {display:flex;flex-direction:column;padding:24px;gap:16px;font-family:sans-serif;max-width:480px;}.title.svelte-181qcx3 {margin:0;font-size:22px;font-weight:600;}.list.svelte-181qcx3 {display:flex;flex-direction:column;gap:8px;}.item.svelte-181qcx3 {display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:6px;background:#2a2a3a;}.text.svelte-181qcx3 {flex:1;font-size:15px;}.remove-btn.svelte-181qcx3 {padding:4px 10px;border-radius:4px;font-size:13px;background:#6b2d2d;color:#fff;}.add-btn.svelte-181qcx3 {padding:10px 20px;border-radius:6px;font-size:14px;background:#2d5a6b;color:#fff;align-self:flex-start;}"
};
function Or(e) {
  Fr(e, qr);
  let t = /* @__PURE__ */ G(pe(["Buy milk", "Ship rvst", "Fix bugs"]));
  function n() {
    Z(t, [...R(t), `Todo ${R(t).length + 1}`], !0);
  }
  function r(f) {
    Z(t, R(t).filter((u, s) => s !== f), !0);
  }
  var i = Dr(), l = Ke($e(i), 2);
  Rr(l, 21, () => R(t), Sr, (f, u, s) => {
    var c = Mr(), d = $e(c), v = $e(d), h = Ke(d, 2);
    fr(() => _r(v, R(u))), _t("click", h, () => r(s)), wt(f, c);
  });
  var o = Ke(l, 2);
  _t("click", o, n), wt(e, i);
}
wr(["click"]);
function Ir(e) {
  return Er(Or, { target: e });
}
export {
  Ir as default,
  Ir as rvst_mount
};

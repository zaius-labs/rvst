var wt = Array.isArray, un = Array.prototype.indexOf, me = Array.prototype.includes, je = Array.from, on = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, an = Object.prototype, cn = Array.prototype, dn = Object.getPrototypeOf, lt = Object.isExtensible;
const vn = () => {
};
function hn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function xt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, De = 4, He = 8, yt = 1 << 24, ie = 16, Y = 32, ue = 64, Ge = 128, M = 512, E = 1024, A = 2048, U = 4096, N = 8192, B = 16384, Ee = 32768, st = 1 << 25, Fe = 65536, ft = 1 << 17, pn = 1 << 18, Te = 1 << 19, _n = 1 << 20, X = 1 << 25, oe = 65536, Ke = 1 << 21, Qe = 1 << 22, te = 1 << 23, Ye = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function gn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function mn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function bn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function wn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function En() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Tn = 1, kn = 2, Sn = 16, An = 2, k = Symbol(), zn = "http://www.w3.org/1999/xhtml";
function Cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Et(e) {
  return e === this.v;
}
function Rn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Tt(e) {
  return !Rn(e, this.v);
}
let H = null;
function be(e) {
  H = e;
}
function Nn(e, t = !1, n) {
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
function kt() {
  return !0;
}
let he = [];
function Fn() {
  var e = he;
  he = [], hn(e);
}
function _e(e) {
  if (he.length === 0) {
    var t = he;
    queueMicrotask(() => {
      t === he && Fn();
    });
  }
  he.push(e);
}
function St(e) {
  var t = g;
  if (t === null)
    return _.f |= te, e;
  if ((t.f & Ee) === 0 && (t.f & De) === 0)
    throw e;
  ee(e, t);
}
function ee(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ge) !== 0) {
      if ((t.f & Ee) === 0)
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
const Mn = -7169;
function y(e, t) {
  e.f = e.f & Mn | t;
}
function et(e) {
  (e.f & M) !== 0 || e.deps === null ? y(e, E) : y(e, U);
}
function At(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & oe) === 0 || (t.f ^= oe, At(
        /** @type {Derived} */
        t.deps
      ));
}
function zt(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), At(e.deps), y(e, E);
}
const Z = /* @__PURE__ */ new Set();
let w = null, q = null, We = null, Ue = !1, pe = null, Pe = null;
var ut = 0;
let On = 1;
class re {
  id = On++;
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
        y(r, A), this.schedule(r);
      for (r of n.m)
        y(r, U), this.schedule(r);
    }
  }
  #d() {
    if (ut++ > 1e3 && (Z.delete(this), In()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), y(s, A), this.schedule(s);
      for (const s of this.#n)
        y(s, U), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = pe = [], r = [], i = Pe = [];
    for (const s of t)
      try {
        this.#o(s, n, r);
      } catch (f) {
        throw Dt(s), f;
      }
    if (w = null, i.length > 0) {
      var l = re.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (pe = null, Pe = null, this.#c() || this.#h()) {
      this.#p(r), this.#p(n);
      for (const [s, f] of this.#l)
        Nt(s, f);
    } else {
      this.#r.size === 0 && Z.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), ot(r), ot(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const s = o ??= this;
      s.#e.push(...this.#e.filter((f) => !s.#e.includes(f)));
    }
    o !== null && (Z.add(o), o.#d()), Z.has(this) || this.#m();
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
      var l = i.f, o = (l & (Y | ue)) !== 0, s = o && (l & E) !== 0, f = s || (l & N) !== 0 || this.#l.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= E : (l & De) !== 0 ? n.push(i) : Oe(i) && ((l & ie) !== 0 && this.#n.add(i), ye(i));
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
  #p(t) {
    for (var n = 0; n < t.length; n += 1)
      zt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & te) === 0 && (this.current.set(t, [t.v, r]), q?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, q = null;
  }
  flush() {
    try {
      Ue = !0, w = this, this.#d();
    } finally {
      ut = 0, We = null, pe = null, Pe = null, Ue = !1, w = null, q = null, ne.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), Z.delete(this);
  }
  #m() {
    for (const u of Z) {
      var t = u.id < this.id, n = [];
      for (const [c, [v, d]] of this.current) {
        if (u.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(c)[0]
          );
          if (t && v !== r)
            u.current.set(c, [v, d]);
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
    for (const u of Z)
      u.#u.has(this) && (u.#u.delete(this), u.#u.size === 0 && !u.#c() && (u.activate(), u.#d()));
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
    this.#a || r || (this.#a = !0, _e(() => {
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
    if (w === null) {
      const t = w = new re();
      Ue || (Z.add(w), _e(() => {
        w === t && t.flush();
      }));
    }
    return w;
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
    if (We = t, t.b?.is_pending && (t.f & (De | He | yt)) !== 0 && (t.f & Ee) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (pe !== null && n === g && (_ === null || (_.f & T) === 0))
        return;
      if ((r & (ue | Y)) !== 0) {
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
    ee(e, We);
  }
}
let K = null;
function ot(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (B | N)) === 0 && Oe(r) && (K = /* @__PURE__ */ new Set(), ye(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && $t(r), K?.size > 0)) {
        ne.clear();
        for (const i of K) {
          if ((i.f & (B | N)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            K.has(o) && (K.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const f = l[s];
            (f.f & (B | N)) === 0 && ye(f);
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
      ) : (l & (Qe | ie)) !== 0 && (l & A) === 0 && Rt(i, t, r) && (y(i, A), tt(
        /** @type {Effect} */
        i
      ));
    }
}
function Rt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (me.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Rt(
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
  w.schedule(e);
}
function Nt(e, t) {
  if (!((e.f & Y) !== 0 && (e.f & E) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), y(e, E);
    for (var n = e.first; n !== null; )
      Nt(n, t), n = n.next;
  }
}
function Dt(e) {
  y(e, E);
  for (var t = e.first; t !== null; )
    Dt(t), t = t.next;
}
function Pn(e) {
  let t = 0, n = ae(0), r;
  return () => {
    rt() && (F(n), sr(() => (t === 0 && (r = dr(() => e(() => Ne(n)))), t += 1, () => {
      _e(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ne(n));
      });
    })));
  };
}
var qn = Fe | Te;
function Ln(e, t, n, r) {
  new Bn(e, t, n, r);
}
class Bn {
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
  #p = Pn(() => (this.#o = ae(this.#a), () => {
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
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Yt(() => {
      this.#b();
    }, qn);
  }
  #m() {
    try {
      this.#e = V(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #x(t) {
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
  #y() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = V(() => t(this.#s)), _e(() => {
      var n = this.#l = document.createDocumentFragment(), r = Be();
      n.append(r), this.#e = this.#g(() => V(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, ge(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#_(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = V(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Xt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = V(() => n(this.#s));
      } else
        this.#_(
          /** @type {Batch} */
          w
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #_(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    zt(t, this.#h, this.#d);
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
    var n = g, r = _, i = H;
    $(this.#i), I(this.#i), be(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (l) {
      return St(l), null;
    } finally {
      $(n), I(r), be(i);
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
    this.#u += t, this.#u === 0 && (this.#_(n), this.#t && ge(this.#t, () => {
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
    this.#w(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, _e(() => {
      this.#c = !1, this.#o && we(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#p(), F(
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
        Cn();
        return;
      }
      i = !0, l && En(), this.#n !== null && ge(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#b();
      });
    }, s = (f) => {
      try {
        l = !0, n?.(f, o), l = !1;
      } catch (u) {
        ee(u, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return V(() => {
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
    _e(() => {
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
function jn(e, t, n, r) {
  const i = Mt;
  var l = e.filter((d) => !d.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), s = Hn(), f = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((d) => d.promise)) : null;
  function u(d) {
    s();
    try {
      r(d);
    } catch (h) {
      (o.f & B) === 0 && ee(h, o);
    }
    Le();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var c = Ft();
  function v() {
    Promise.all(n.map((d) => /* @__PURE__ */ Vn(d))).then((d) => u([...t.map(i), ...d])).catch((d) => ee(d, o)).finally(() => c());
  }
  f ? f.then(() => {
    s(), v(), Le();
  }) : v();
}
function Hn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = _, n = H, r = (
    /** @type {Batch} */
    w
  );
  return function(l = !0) {
    $(e), I(t), be(n), l && (e.f & B) === 0 && (r?.activate(), r?.apply());
  };
}
function Le(e = !0) {
  $(null), I(null), be(null), e && w?.deactivate();
}
function Ft() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    w
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function Mt(e) {
  var t = T | A, n = _ !== null && (_.f & T) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return g !== null && (g.f |= Te), {
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
      k
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Vn(e, t, n) {
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
  ), o = !_, s = /* @__PURE__ */ new Map();
  return lr(() => {
    var f = (
      /** @type {Effect} */
      g
    ), u = xt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Le);
    } catch (h) {
      u.reject(h), Le();
    }
    var c = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((f.f & Ee) !== 0)
        var v = Ft();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(c)?.reject(W), s.delete(c);
      else {
        for (const h of s.values())
          h.reject(W);
        s.clear();
      }
      s.set(c, u);
    }
    const d = (h, a = void 0) => {
      if (v) {
        var p = a === W;
        v(p);
      }
      if (!(a === W || (f.f & B) !== 0)) {
        if (c.activate(), a)
          l.f |= te, we(l, a);
        else {
          (l.f & te) !== 0 && (l.f ^= te), we(l, h);
          for (const [b, m] of s) {
            if (s.delete(b), b === c) break;
            m.reject(W);
          }
        }
        c.deactivate();
      }
    };
    u.promise.then(d, (h) => d(null, h || "unknown"));
  }), nr(() => {
    for (const f of s.values())
      f.reject(W);
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
function Yn(e) {
  const t = /* @__PURE__ */ Mt(e);
  return t.equals = Tt, t;
}
function Un(e) {
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
function $n(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & B) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function nt(e) {
  var t, n = g;
  $($n(e));
  try {
    e.f &= ~oe, Un(e), t = en(e);
  } finally {
    $(n);
  }
  return t;
}
function Ot(e) {
  var t = e.v, n = nt(e);
  if (!e.equals(n) && (e.wv = Jt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    y(e, E);
    return;
  }
  xe || (q !== null ? (rt() || w?.is_fork) && q.set(e, n) : et(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = vn, t.ac = null, Me(t, 0), it(t));
}
function It(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ye(t);
}
let Xe = /* @__PURE__ */ new Set();
const ne = /* @__PURE__ */ new Map();
let Pt = !1;
function ae(e, t) {
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
  const n = ae(e);
  return or(n), n;
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = Tt), r;
}
function Q(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (_.f & ft) !== 0) && kt() && (_.f & (T | ie | Qe | ft)) !== 0 && (O === null || !me.call(O, e)) && yn();
  let r = n ? Ae(t) : t;
  return we(e, r, Pe);
}
function we(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    xe ? ne.set(e, t) : ne.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & A) !== 0 && nt(l), q === null && et(l);
    }
    e.wv = Jt(), qt(e, A, n), g !== null && (g.f & E) !== 0 && (g.f & (Y | ue)) === 0 && (D === null ? ar([e]) : D.push(e)), !i.is_fork && Xe.size > 0 && !Pt && Wn();
  }
  return t;
}
function Wn() {
  Pt = !1;
  for (const e of Xe)
    (e.f & E) !== 0 && y(e, U), Oe(e) && ye(e);
  Xe.clear();
}
function Xn(e, t = 1) {
  var n = F(e), r = t === 1 ? n++ : n--;
  return Q(e, n), r;
}
function Ne(e) {
  Q(e, e.v + 1);
}
function qt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], s = o.f, f = (s & A) === 0;
      if (f && y(o, t), (s & T) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        q?.delete(u), (s & oe) === 0 && (s & M && (o.f |= oe), qt(u, U, n));
      } else if (f) {
        var c = (
          /** @type {Effect} */
          o
        );
        (s & ie) !== 0 && K !== null && K.add(c), n !== null ? n.push(c) : tt(c);
      }
    }
}
function Ae(e) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const t = dn(e);
  if (t !== an && t !== cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = wt(e), i = /* @__PURE__ */ G(0), l = fe, o = (s) => {
    if (fe === l)
      return s();
    var f = _, u = fe;
    I(null), vt(l);
    var c = s();
    return I(f), vt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && wn();
        var c = n.get(f);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ G(u.value);
          return n.set(f, v), v;
        }) : Q(c, u.value, !0), !0;
      },
      deleteProperty(s, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in s) {
            const c = o(() => /* @__PURE__ */ G(k));
            n.set(f, c), Ne(i);
          }
        } else
          Q(u, k), Ne(i);
        return !0;
      },
      get(s, f, u) {
        if (f === Ye)
          return e;
        var c = n.get(f), v = f in s;
        if (c === void 0 && (!v || Re(s, f)?.writable) && (c = o(() => {
          var h = Ae(v ? s[f] : k), a = /* @__PURE__ */ G(h);
          return a;
        }), n.set(f, c)), c !== void 0) {
          var d = F(c);
          return d === k ? void 0 : d;
        }
        return Reflect.get(s, f, u);
      },
      getOwnPropertyDescriptor(s, f) {
        var u = Reflect.getOwnPropertyDescriptor(s, f);
        if (u && "value" in u) {
          var c = n.get(f);
          c && (u.value = F(c));
        } else if (u === void 0) {
          var v = n.get(f), d = v?.v;
          if (v !== void 0 && d !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return u;
      },
      has(s, f) {
        if (f === Ye)
          return !0;
        var u = n.get(f), c = u !== void 0 && u.v !== k || Reflect.has(s, f);
        if (u !== void 0 || g !== null && (!c || Re(s, f)?.writable)) {
          u === void 0 && (u = o(() => {
            var d = c ? Ae(s[f]) : k, h = /* @__PURE__ */ G(d);
            return h;
          }), n.set(f, u));
          var v = F(u);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(s, f, u, c) {
        var v = n.get(f), d = f in s;
        if (r && f === "length")
          for (var h = u; h < /** @type {Source<number>} */
          v.v; h += 1) {
            var a = n.get(h + "");
            a !== void 0 ? Q(a, k) : h in s && (a = o(() => /* @__PURE__ */ G(k)), n.set(h + "", a));
          }
        if (v === void 0)
          (!d || Re(s, f)?.writable) && (v = o(() => /* @__PURE__ */ G(void 0)), Q(v, Ae(u)), n.set(f, v));
        else {
          d = v.v !== k;
          var p = o(() => Ae(u));
          Q(v, p);
        }
        var b = Reflect.getOwnPropertyDescriptor(s, f);
        if (b?.set && b.set.call(c, u), !d) {
          if (r && typeof f == "string") {
            var m = (
              /** @type {Source<number>} */
              n.get("length")
            ), x = Number(f);
            Number.isInteger(x) && x >= m.v && Q(m, x + 1);
          }
          Ne(i);
        }
        return !0;
      },
      ownKeys(s) {
        F(i);
        var f = Reflect.ownKeys(s).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== k;
        });
        for (var [u, c] of n)
          c.v !== k && !(u in s) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        xn();
      }
    }
  );
}
var at, Lt, Bt, jt;
function Zn() {
  if (at === void 0) {
    at = window, Lt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Bt = Re(t, "firstChild").get, jt = Re(t, "nextSibling").get, lt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), lt(n) && (n.__t = void 0);
  }
}
function Be(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
  return (
    /** @type {TemplateNode | null} */
    Bt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    jt.call(e)
  );
}
function ve(e, t) {
  return /* @__PURE__ */ Ht(e);
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
    document.createElementNS(zn, e, void 0)
  );
}
function Vt(e) {
  var t = _, n = g;
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
function le(e, t) {
  var n = g;
  n !== null && (n.f & N) !== 0 && (e |= N);
  var r = {
    ctx: H,
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
    pe !== null ? pe.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ye(r);
    } catch (o) {
      throw j(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & ie) !== 0 && (e & Fe) !== 0 && i !== null && (i.f |= Fe));
  }
  if (i !== null && (i.parent = n, n !== null && tr(i, n), _ !== null && (_.f & T) !== 0 && (e & ue) === 0)) {
    var l = (
      /** @type {Derived} */
      _
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function rt() {
  return _ !== null && !L;
}
function nr(e) {
  const t = le(He, null);
  return y(t, E), t.teardown = e, t;
}
function rr(e) {
  return le(De | _n, e);
}
function ir(e) {
  re.ensure();
  const t = le(ue | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function lr(e) {
  return le(Qe | Te, e);
}
function sr(e, t = 0) {
  return le(He | t, e);
}
function ct(e, t = [], n = [], r = []) {
  jn(r, t, n, (i) => {
    le(He, () => e(...i.map(F)));
  });
}
function Yt(e, t = 0) {
  var n = le(ie | t, e);
  return n;
}
function V(e) {
  return le(Y | Te, e);
}
function Ut(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = xe, r = _;
    dt(!0), I(null);
    try {
      t.call(null);
    } finally {
      dt(n), I(r);
    }
  }
}
function it(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Vt(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & ue) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Y) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, st), it(e, t && !n), Me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Ut(e), e.f ^= st, e.f |= B;
  var i = e.parent;
  i !== null && i.first !== null && $t(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ur(e, t) {
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
  if ((e.f & N) === 0) {
    e.f ^= N;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Fe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Y) !== 0 && (e.f & ie) !== 0;
      Gt(i, t, o ? n : !1), i = l;
    }
  }
}
function Kt(e) {
  Wt(e, !0);
}
function Wt(e, t) {
  if ((e.f & N) !== 0) {
    e.f ^= N, (e.f & E) === 0 && (y(e, A), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Fe) !== 0 || (n.f & Y) !== 0;
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
let qe = !1, xe = !1;
function dt(e) {
  xe = e;
}
let _ = null, L = !1;
function I(e) {
  _ = e;
}
let g = null;
function $(e) {
  g = e;
}
let O = null;
function or(e) {
  _ !== null && (O === null ? O = [e] : O.push(e));
}
let z = null, R = 0, D = null;
function ar(e) {
  D = e;
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
      ) && Ot(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & M) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    q === null && y(e, E);
  }
  return !1;
}
function Qt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && me.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? Qt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? y(l, A) : (l.f & E) !== 0 && y(l, U), tt(
        /** @type {Effect} */
        l
      ));
    }
}
function en(e) {
  var t = z, n = R, r = D, i = _, l = O, o = H, s = L, f = fe, u = e.f;
  z = /** @type {null | Value[]} */
  null, R = 0, D = null, _ = (u & (Y | ue)) === 0 ? e : null, O = null, be(e.ctx), L = !1, fe = ++se, e.ac !== null && (Vt(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Ke;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= Ee;
    var d = e.deps, h = w?.is_fork;
    if (z !== null) {
      var a;
      if (h || Me(e, R), d !== null && R > 0)
        for (d.length = R + z.length, a = 0; a < z.length; a++)
          d[R + a] = z[a];
      else
        e.deps = d = z;
      if (rt() && (e.f & M) !== 0)
        for (a = R; a < d.length; a++)
          (d[a].reactions ??= []).push(e);
    } else !h && d !== null && R < d.length && (Me(e, R), d.length = R);
    if (kt() && D !== null && !L && d !== null && (e.f & (T | U | A)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      D.length; a++)
        Qt(
          D[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (se++, i.deps !== null)
        for (let p = 0; p < n; p += 1)
          i.deps[p].rv = se;
      if (t !== null)
        for (const p of t)
          p.rv = se;
      D !== null && (r === null ? r = D : r.push(.../** @type {Source[]} */
      D));
    }
    return (e.f & te) !== 0 && (e.f ^= te), v;
  } catch (p) {
    return St(p);
  } finally {
    e.f ^= Ke, z = t, R = n, D = r, _ = i, O = l, be(o), L = s, fe = f;
  }
}
function cr(e, t) {
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
  (z === null || !me.call(z, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & M) !== 0 && (l.f ^= M, l.f &= ~oe), et(l), Gn(l), Me(l, 0);
  }
}
function Me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      cr(e, n[r]);
}
function ye(e) {
  var t = e.f;
  if ((t & B) === 0) {
    y(e, E);
    var n = g, r = qe;
    g = e, qe = !0;
    try {
      (t & (ie | yt)) !== 0 ? fr(e) : it(e), Ut(e);
      var i = en(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Zt;
      var l;
    } finally {
      qe = r, g = n;
    }
  }
}
function F(e) {
  var t = e.f, n = (t & T) !== 0;
  if (_ !== null && !L) {
    var r = g !== null && (g.f & B) !== 0;
    if (!r && (O === null || !me.call(O, e))) {
      var i = _.deps;
      if ((_.f & Ke) !== 0)
        e.rv < se && (e.rv = se, z === null && i !== null && i[R] === e ? R++ : z === null ? z = [e] : z.push(e));
      else {
        (_.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [_] : me.call(l, _) || l.push(_);
      }
    }
  }
  if (xe && ne.has(e))
    return ne.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (xe) {
      var s = o.v;
      return ((o.f & E) === 0 && o.reactions !== null || nn(o)) && (s = nt(o)), ne.set(o, s), s;
    }
    var f = (o.f & M) === 0 && !L && _ !== null && (qe || (_.f & M) !== 0), u = (o.f & Ee) === 0;
    Oe(o) && (f && (o.f |= M), Ot(o)), f && !u && (It(o), tn(o));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & te) !== 0)
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
    if (ne.has(t) || (t.f & T) !== 0 && nn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function dr(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const ht = globalThis.Deno?.core?.ops ?? null;
function vr(e, ...t) {
  ht?.[e] ? ht[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function pt(e, t) {
  vr("op_set_text", e, t);
}
const hr = ["touchstart", "touchmove"];
function pr(e) {
  return hr.includes(e);
}
const ze = Symbol("events"), rn = /* @__PURE__ */ new Set(), Ze = /* @__PURE__ */ new Set();
function _r(e, t, n) {
  (t[ze] ??= {})[e] = n;
}
function gr(e) {
  for (var t = 0; t < e.length; t++)
    rn.add(e[t]);
  for (var n of Ze)
    n(e);
}
let _t = null;
function gt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  _t = e;
  var o = 0, s = _t === e && e[ze];
  if (s) {
    var f = i.indexOf(s);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ze] = t;
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
    var c = _, v = g;
    I(null), $(null);
    try {
      for (var d, h = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var p = l[ze]?.[r];
          p != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && p.call(l, e);
        } catch (b) {
          d ? h.push(b) : d = b;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (d) {
        for (let b of h)
          queueMicrotask(() => {
            throw b;
          });
        throw d;
      }
    } finally {
      e[ze] = t, delete e.currentTarget, I(c), $(v);
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
function wr(e) {
  var t = er("template");
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
function ln(e, t) {
  var n = (t & An) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = wr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ht(r));
    var l = (
      /** @type {TemplateNode} */
      n || Lt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return xr(l, l), l;
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
    var c = n ?? t.appendChild(Be());
    Ln(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (h) => {
        Nn({});
        var a = (
          /** @type {ComponentContext} */
          H
        );
        l && (a.c = l), i && (r.$$events = i), f = e(h, r) || {}, Dn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), d = (h) => {
      for (var a = 0; a < h.length; a++) {
        var p = h[a];
        if (!v.has(p)) {
          v.add(p);
          var b = pr(p);
          for (const C of [t, document]) {
            var m = Ie.get(C);
            m === void 0 && (m = /* @__PURE__ */ new Map(), Ie.set(C, m));
            var x = m.get(p);
            x === void 0 ? (C.addEventListener(p, gt, { passive: b }), m.set(p, 1)) : m.set(p, x + 1);
          }
        }
      }
    };
    return d(je(rn)), Ze.add(d), () => {
      for (var h of v)
        for (const b of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            Ie.get(b)
          ), p = (
            /** @type {number} */
            a.get(h)
          );
          --p == 0 ? (b.removeEventListener(h, gt), a.delete(h), a.size === 0 && Ie.delete(b)) : a.set(h, p);
        }
      Ze.delete(d), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Tr.set(f, u), f;
}
let Tr = /* @__PURE__ */ new WeakMap();
function kr(e, t) {
  return t;
}
function Sr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, s = 0; s < i; s++) {
    let v = t[s];
    ge(
      v,
      () => {
        if (l) {
          if (l.pending.delete(v), l.done.add(v), l.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Je(e, je(l.done)), d.delete(l), d.size === 0 && (e.outrogroups = null);
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
      l.f |= X;
      const o = document.createDocumentFragment();
      Xt(l, o);
    } else
      j(t[i], n);
  }
}
var bt;
function Ar(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), f = null, u = /* @__PURE__ */ Yn(() => {
    var m = n();
    return wt(m) ? m : m == null ? [] : je(m);
  }), c, v = /* @__PURE__ */ new Map(), d = !0;
  function h(m) {
    (b.effect.f & B) === 0 && (b.pending.delete(m), b.fallback = f, zr(b, c, o, t, r), f !== null && (c.length === 0 ? (f.f & X) === 0 ? Kt(f) : (f.f ^= X, Ce(f, null, o)) : ge(f, () => {
      f = null;
    })));
  }
  function a(m) {
    b.pending.delete(m);
  }
  var p = Yt(() => {
    c = /** @type {V[]} */
    F(u);
    for (var m = c.length, x = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      w
    ), ce = Qn(), P = 0; P < m; P += 1) {
      var ke = c[P], de = r(ke, P), S = d ? null : s.get(de);
      S ? (S.v && we(S.v, ke), S.i && we(S.i, P), ce && C.unskip_effect(S.e)) : (S = Cr(
        s,
        d ? o : bt ??= Be(),
        ke,
        de,
        P,
        i,
        t,
        n
      ), d || (S.e.f |= X), s.set(de, S)), x.add(de);
    }
    if (m === 0 && l && !f && (d ? f = V(() => l(o)) : (f = V(() => l(bt ??= Be())), f.f |= X)), m > x.size && mn(), !d)
      if (v.set(C, x), ce) {
        for (const [sn, fn] of s)
          x.has(sn) || C.skip_effect(fn.e);
        C.oncommit(h), C.ondiscard(a);
      } else
        h(C);
    F(u);
  }), b = { effect: p, items: s, pending: v, outrogroups: null, fallback: f };
  d = !1;
}
function Se(e) {
  for (; e !== null && (e.f & Y) === 0; )
    e = e.next;
  return e;
}
function zr(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Se(e.effect.first), f, u = null, c = [], v = [], d, h, a, p;
  for (p = 0; p < l; p += 1) {
    if (d = t[p], h = i(d, p), a = /** @type {EachItem} */
    o.get(h).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & N) !== 0 && Kt(a), (a.f & X) !== 0)
      if (a.f ^= X, a === s)
        Ce(a, null, n);
      else {
        var b = u ? u.next : s;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, u, a), J(e, a, b), Ce(a, b, n), u = a, c = [], v = [], s = Se(u.next);
        continue;
      }
    if (a !== s) {
      if (f !== void 0 && f.has(a)) {
        if (c.length < v.length) {
          var m = v[0], x;
          u = m.prev;
          var C = c[0], ce = c[c.length - 1];
          for (x = 0; x < c.length; x += 1)
            Ce(c[x], m, n);
          for (x = 0; x < v.length; x += 1)
            f.delete(v[x]);
          J(e, C.prev, ce.next), J(e, u, C), J(e, ce, m), s = m, u = ce, p -= 1, c = [], v = [];
        } else
          f.delete(a), Ce(a, s, n), J(e, a.prev, a.next), J(e, a, u === null ? e.effect.first : u.next), J(e, u, a), u = a;
        continue;
      }
      for (c = [], v = []; s !== null && s !== a; )
        (f ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Se(s.next);
      if (s === null)
        continue;
    }
    (a.f & X) === 0 && c.push(a), u = a, s = Se(a.next);
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
        (a.f & N) === 0 && P.push(a);
    for (; s !== null; )
      (s.f & N) === 0 && s !== e.fallback && P.push(s), s = Se(s.next);
    var ke = P.length;
    if (ke > 0) {
      var de = null;
      Sr(e, P, de);
    }
  }
}
function Cr(e, t, n, r, i, l, o, s) {
  var f = (o & Tn) !== 0 ? (o & Sn) === 0 ? /* @__PURE__ */ Kn(n, !1, !1) : ae(n) : null, u = (o & kn) !== 0 ? ae(i) : null;
  return {
    v: f,
    i: u,
    e: V(() => (l(t, f ?? n, u ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function Ce(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & X) === 0 ? (
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
var Rr = /* @__PURE__ */ ln('<button class="flex flex-row items-center px-2 py-1 rounded-md text-zinc-400 text-sm text-left"> </button>'), Nr = /* @__PURE__ */ ln('<div class="flex flex-col w-full h-full bg-zinc-950 text-zinc-100 font-sans text-sm"><div class="flex flex-row items-center gap-4 px-6 py-3 bg-zinc-900 border-b border-zinc-800"><span class="text-base font-semibold text-white">shadcn test</span> <span class="flex-1"></span> <button class="px-3 py-1 rounded-md bg-white text-zinc-900 font-medium text-sm"> </button></div> <div class="flex flex-row flex-1"><div class="flex flex-col w-48 bg-zinc-900 border-r border-zinc-800 px-3 py-4 gap-1"><span class="text-xs font-semibold text-zinc-500 uppercase px-2 mb-1">Components</span> <!></div> <div class="flex flex-col flex-1 px-8 py-6 gap-6"><div class="flex flex-col gap-3"><span class="text-xs font-semibold text-zinc-500 uppercase">Buttons</span> <div class="flex flex-row gap-2"><button class="px-4 py-2 rounded-md bg-white text-zinc-900 font-medium text-sm">Default</button> <button class="px-4 py-2 rounded-md border border-zinc-700 text-zinc-100 font-medium text-sm">Outline</button> <button class="px-4 py-2 rounded-md text-zinc-400 font-medium text-sm">Ghost</button> <button class="px-4 py-2 rounded-md bg-red-600 text-white font-medium text-sm">Destructive</button></div></div> <div class="flex flex-col gap-3"><span class="text-xs font-semibold text-zinc-500 uppercase">Badges</span> <div class="flex flex-row gap-2"><span class="px-2 py-0 rounded-full bg-zinc-100 text-zinc-900 text-xs font-semibold">Default</span> <span class="px-2 py-0 rounded-full border border-zinc-700 text-zinc-100 text-xs font-semibold">Outline</span> <span class="px-2 py-0 rounded-full bg-red-600 text-white text-xs font-semibold">Destructive</span></div></div> <div class="flex flex-col gap-3"><span class="text-xs font-semibold text-zinc-500 uppercase">Card</span> <div class="flex flex-col gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-80"><span class="text-base font-semibold text-white">Card title</span> <span class="text-sm text-zinc-400">Card description text goes here.</span> <div class="flex flex-row gap-2"><button class="flex-1 px-3 py-2 rounded-md bg-white text-zinc-900 font-medium text-sm">Action</button> <button class="flex-1 px-3 py-2 rounded-md border border-zinc-700 text-zinc-100 font-medium text-sm">Cancel</button></div></div></div></div></div></div>');
function Dr(e) {
  let t = /* @__PURE__ */ G(0);
  const n = ["Button", "Badge", "Card", "Input", "Slider"];
  var r = Nr(), i = ve(r), l = $e(ve(i), 4), o = ve(l), s = $e(i, 2), f = ve(s), u = $e(ve(f), 2);
  Ar(u, 17, () => n, kr, (c, v) => {
    var d = Rr(), h = ve(d);
    ct(() => pt(h, F(v))), mt(c, d);
  }), ct(() => pt(o, `Clicked ${F(t) ?? ""}`)), _r("click", l, () => Xn(t)), mt(e, r);
}
gr(["click"]);
function Mr(e) {
  return yr(Dr, { target: e });
}
export {
  Mr as default,
  Mr as rvst_mount
};

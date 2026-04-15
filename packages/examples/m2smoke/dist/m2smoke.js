var Ct = Array.isArray, yn = Array.prototype.indexOf, Ee = Array.prototype.includes, $e = Array.from, bn = Object.defineProperty, Fe = Object.getOwnPropertyDescriptor, En = Object.prototype, xn = Array.prototype, kn = Object.getPrototypeOf, ht = Object.isExtensible;
const Tn = () => {
};
function Sn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Nt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const S = 2, Ie = 4, Be = 8, Mt = 1 << 24, fe = 16, W = 32, _e = 64, et = 128, L = 512, T = 1024, C = 2048, X = 4096, O = 8192, U = 16384, Ae = 32768, _t = 1 << 25, Le = 65536, pt = 1 << 17, An = 1 << 18, Re = 1 << 19, Rn = 1 << 20, ee = 1 << 25, pe = 65536, tt = 1 << 21, st = 1 << 22, ie = 1 << 23, We = Symbol("$state"), Q = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Cn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Nn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Mn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Fn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Dn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function On() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Pn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const In = 1, Ln = 2, qn = 16, zn = 2, R = Symbol(), jn = "http://www.w3.org/1999/xhtml";
function Vn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Ft(e) {
  return e === this.v;
}
function Hn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Dt(e) {
  return !Hn(e, this.v);
}
let B = null;
function xe(e) {
  B = e;
}
function Ot(e, t = !1, n) {
  B = {
    p: B,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      m
    ),
    l: null
  };
}
function Pt(e) {
  var t = (
    /** @type {ComponentContext} */
    B
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      gr(r);
  }
  return t.i = !0, B = t.p, /** @type {T} */
  {};
}
function It() {
  return !0;
}
let ve = [];
function Lt() {
  var e = ve;
  ve = [], Sn(e);
}
function ye(e) {
  if (ve.length === 0 && !De) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && Lt();
    });
  }
  ve.push(e);
}
function Yn() {
  for (; ve.length > 0; )
    Lt();
}
function qt(e) {
  var t = m;
  if (t === null)
    return g.f |= ie, e;
  if ((t.f & Ae) === 0 && (t.f & Ie) === 0)
    throw e;
  re(e, t);
}
function re(e, t) {
  for (; t !== null; ) {
    if ((t.f & et) !== 0) {
      if ((t.f & Ae) === 0)
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
const Un = -7169;
function x(e, t) {
  e.f = e.f & Un | t;
}
function ft(e) {
  (e.f & L) !== 0 || e.deps === null ? x(e, T) : x(e, X);
}
function zt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & S) === 0 || (t.f & pe) === 0 || (t.f ^= pe, zt(
        /** @type {Derived} */
        t.deps
      ));
}
function jt(e, t, n) {
  (e.f & C) !== 0 ? t.add(e) : (e.f & X) !== 0 && n.add(e), zt(e.deps), x(e, T);
}
const te = /* @__PURE__ */ new Set();
let w = null, H = null, nt = null, De = !1, Xe = !1, we = null, He = null;
var gt = 0;
let $n = 1;
class se {
  id = $n++;
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
  #d = /* @__PURE__ */ new Set();
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
  #o = !1;
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
        x(r, C), this.schedule(r);
      for (r of n.m)
        x(r, X), this.schedule(r);
    }
  }
  #v() {
    if (gt++ > 1e3 && (te.delete(this), Kn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), x(f, C), this.schedule(f);
      for (const f of this.#n)
        x(f, X), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = we = [], r = [], i = He = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw Ut(f), u;
      }
    if (w = null, i.length > 0) {
      var l = se.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (we = null, He = null, this.#c() || this.#h()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#l)
        Yt(f, u);
    } else {
      this.#r.size === 0 && te.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), wt(r), wt(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    a !== null && (te.add(a), a.#v()), te.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= T;
    for (var i = t.first; i !== null; ) {
      var l = i.f, a = (l & (W | _e)) !== 0, f = a && (l & T) !== 0, u = f || (l & O) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= T : (l & Ie) !== 0 ? n.push(i) : ze(i) && ((l & fe) !== 0 && this.#n.add(i), Se(i));
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
      jt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== R && !this.previous.has(t) && this.previous.set(t, n), (t.f & ie) === 0 && (this.current.set(t, [t.v, r]), H?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, H = null;
  }
  flush() {
    try {
      Xe = !0, w = this, this.#v();
    } finally {
      gt = 0, nt = null, we = null, He = null, Xe = !1, w = null, H = null, le.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), te.delete(this);
  }
  #w() {
    for (const s of te) {
      var t = s.id < this.id, n = [];
      for (const [c, [v, d]] of this.current) {
        if (s.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(c)[0]
          );
          if (t && v !== r)
            s.current.set(c, [v, d]);
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
        var l = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var f of n)
          Vt(f, i, l, a);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#a(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of te)
      s.#u.has(this) && (s.#u.delete(this), s.#u.size === 0 && !s.#c() && (s.activate(), s.#v()));
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
    this.#o || r || (this.#o = !0, ye(() => {
      this.#o = !1, this.flush();
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
    this.#d.add(t);
  }
  settled() {
    return (this.#i ??= Nt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new se();
      Xe || (te.add(w), De || ye(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      H = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (nt = t, t.b?.is_pending && (t.f & (Ie | Be | Mt)) !== 0 && (t.f & Ae) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (we !== null && n === m && (g === null || (g.f & S) === 0))
        return;
      if ((r & (_e | W)) !== 0) {
        if ((r & T) === 0)
          return;
        n.f ^= T;
      }
    }
    this.#e.push(n);
  }
}
function Bn(e) {
  var t = De;
  De = !0;
  try {
    for (var n; ; ) {
      if (Yn(), w === null)
        return (
          /** @type {T} */
          n
        );
      w.flush();
    }
  } finally {
    De = t;
  }
}
function Kn() {
  try {
    Mn();
  } catch (e) {
    re(e, nt);
  }
}
let J = null;
function wt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (U | O)) === 0 && ze(r) && (J = /* @__PURE__ */ new Set(), Se(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && rn(r), J?.size > 0)) {
        le.clear();
        for (const i of J) {
          if ((i.f & (U | O)) !== 0) continue;
          const l = [i];
          let a = i.parent;
          for (; a !== null; )
            J.has(a) && (J.delete(a), l.push(a)), a = a.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (U | O)) === 0 && Se(u);
          }
        }
        J.clear();
      }
    }
    J = null;
  }
}
function Vt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & S) !== 0 ? Vt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (st | fe)) !== 0 && (l & C) === 0 && Ht(i, t, r) && (x(i, C), ut(
        /** @type {Effect} */
        i
      ));
    }
}
function Ht(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Ee.call(t, i))
        return !0;
      if ((i.f & S) !== 0 && Ht(
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
function ut(e) {
  w.schedule(e);
}
function Yt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & T) !== 0)) {
    (e.f & C) !== 0 ? t.d.push(e) : (e.f & X) !== 0 && t.m.push(e), x(e, T);
    for (var n = e.first; n !== null; )
      Yt(n, t), n = n.next;
  }
}
function Ut(e) {
  x(e, T);
  for (var t = e.first; t !== null; )
    Ut(t), t = t.next;
}
function Gn(e) {
  let t = 0, n = ge(0), r;
  return () => {
    vt() && (E(n), en(() => (t === 0 && (r = pn(() => e(() => Oe(n)))), t += 1, () => {
      ye(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Oe(n));
      });
    })));
  };
}
var Wn = Le | Re;
function Xn(e, t, n, r) {
  new Zn(e, t, n, r);
}
class Zn {
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
  #d = null;
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
  #o = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #a = null;
  #_ = Gn(() => (this.#a = ge(this.#o), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var a = (
        /** @type {Effect} */
        m
      );
      a.b = this, a.f |= et, r(l);
    }, this.parent = /** @type {Effect} */
    m.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = tn(() => {
      this.#m();
    }, Wn);
  }
  #w() {
    try {
      this.#e = G(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#r.failed;
    n && (this.#n = G(() => {
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
    t && (this.is_pending = !0, this.#t = G(() => t(this.#s)), ye(() => {
      var n = this.#l = document.createDocumentFragment(), r = Pe();
      n.append(r), this.#e = this.#g(() => G(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, be(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = G(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        un(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = G(() => n(this.#s));
      } else
        this.#p(
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
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    jt(t, this.#h, this.#v);
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
    var n = m, r = g, i = B;
    Z(this.#i), z(this.#i), xe(this.#i.ctx);
    try {
      return se.ensure(), t();
    } catch (l) {
      return qt(l), null;
    } finally {
      Z(n), z(r), xe(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #y(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, n);
      return;
    }
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && be(this.#t, () => {
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ye(() => {
      this.#c = !1, this.#a && ke(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), E(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && ($(this.#e), this.#e = null), this.#t && ($(this.#t), this.#t = null), this.#n && ($(this.#n), this.#n = null);
    var i = !1, l = !1;
    const a = () => {
      if (i) {
        Vn();
        return;
      }
      i = !0, l && Pn(), this.#n !== null && be(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, a), l = !1;
      } catch (s) {
        re(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return G(() => {
            var s = (
              /** @type {Effect} */
              m
            );
            s.b = this, s.f |= et, r(
              this.#s,
              () => u,
              () => a
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
    ye(() => {
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
function Jn(e, t, n, r) {
  const i = at;
  var l = e.filter((d) => !d.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    m
  ), f = Qn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((d) => d.promise)) : null;
  function s(d) {
    f();
    try {
      r(d);
    } catch (h) {
      (a.f & U) === 0 && re(h, a);
    }
    Ue();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var c = $t();
  function v() {
    Promise.all(n.map((d) => /* @__PURE__ */ er(d))).then((d) => s([...t.map(i), ...d])).catch((d) => re(d, a)).finally(() => c());
  }
  u ? u.then(() => {
    f(), v(), Ue();
  }) : v();
}
function Qn() {
  var e = (
    /** @type {Effect} */
    m
  ), t = g, n = B, r = (
    /** @type {Batch} */
    w
  );
  return function(l = !0) {
    Z(e), z(t), xe(n), l && (e.f & U) === 0 && (r?.activate(), r?.apply());
  };
}
function Ue(e = !0) {
  Z(null), z(null), xe(null), e && w?.deactivate();
}
function $t() {
  var e = (
    /** @type {Effect} */
    m
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
function at(e) {
  var t = S | C, n = g !== null && (g.f & S) !== 0 ? (
    /** @type {Derived} */
    g
  ) : null;
  return m !== null && (m.f |= Re), {
    ctx: B,
    deps: null,
    effects: null,
    equals: Ft,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      R
    ),
    wv: 0,
    parent: n ?? m,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function er(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    m
  );
  r === null && Cn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = ge(
    /** @type {V} */
    R
  ), a = !g, f = /* @__PURE__ */ new Map();
  return mr(() => {
    var u = (
      /** @type {Effect} */
      m
    ), s = Nt();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(Ue);
    } catch (h) {
      s.reject(h), Ue();
    }
    var c = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & Ae) !== 0)
        var v = $t();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(Q), f.delete(c);
      else {
        for (const h of f.values())
          h.reject(Q);
        f.clear();
      }
      f.set(c, s);
    }
    const d = (h, o = void 0) => {
      if (v) {
        var p = o === Q;
        v(p);
      }
      if (!(o === Q || (u.f & U) !== 0)) {
        if (c.activate(), o)
          l.f |= ie, ke(l, o);
        else {
          (l.f & ie) !== 0 && (l.f ^= ie), ke(l, h);
          for (const [b, y] of f) {
            if (f.delete(b), b === c) break;
            y.reject(Q);
          }
        }
        c.deactivate();
      }
    };
    s.promise.then(d, (h) => d(null, h || "unknown"));
  }), pr(() => {
    for (const u of f.values())
      u.reject(Q);
  }), new Promise((u) => {
    function s(c) {
      function v() {
        c === i ? u(l) : s(i);
      }
      c.then(v, v);
    }
    s(i);
  });
}
// @__NO_SIDE_EFFECTS__
function tr(e) {
  const t = /* @__PURE__ */ at(e);
  return an(t), t;
}
// @__NO_SIDE_EFFECTS__
function nr(e) {
  const t = /* @__PURE__ */ at(e);
  return t.equals = Dt, t;
}
function rr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      $(
        /** @type {Effect} */
        t[n]
      );
  }
}
function ir(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & S) === 0)
      return (t.f & U) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function ot(e) {
  var t, n = m;
  Z(ir(e));
  try {
    e.f &= ~pe, rr(e), t = dn(e);
  } finally {
    Z(n);
  }
  return t;
}
function Bt(e) {
  var t = e.v, n = ot(e);
  if (!e.equals(n) && (e.wv = cn(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    x(e, T);
    return;
  }
  Te || (H !== null ? (vt() || w?.is_fork) && H.set(e, n) : ft(e));
}
function lr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Q), t.teardown = Tn, t.ac = null, qe(t, 0), dt(t));
}
function Kt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Se(t);
}
let rt = /* @__PURE__ */ new Set();
const le = /* @__PURE__ */ new Map();
let Gt = !1;
function ge(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ft,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
  const n = ge(e);
  return an(n), n;
}
// @__NO_SIDE_EFFECTS__
function sr(e, t = !1, n = !0) {
  const r = ge(e);
  return t || (r.equals = Dt), r;
}
function D(e, t, n = !1) {
  g !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Y || (g.f & pt) !== 0) && It() && (g.f & (S | fe | st | pt)) !== 0 && (q === null || !Ee.call(q, e)) && On();
  let r = n ? me(t) : t;
  return ke(e, r, He);
}
function ke(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Te ? le.set(e, t) : le.set(e, r), e.v = t;
    var i = se.ensure();
    if (i.capture(e, r), (e.f & S) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & C) !== 0 && ot(l), H === null && ft(l);
    }
    e.wv = cn(), Wt(e, C, n), m !== null && (m.f & T) !== 0 && (m.f & (W | _e)) === 0 && (I === null ? Er([e]) : I.push(e)), !i.is_fork && rt.size > 0 && !Gt && fr();
  }
  return t;
}
function fr() {
  Gt = !1;
  for (const e of rt)
    (e.f & T) !== 0 && x(e, X), ze(e) && Se(e);
  rt.clear();
}
function ur(e, t = 1) {
  var n = E(e), r = t === 1 ? n++ : n--;
  return D(e, n), r;
}
function Oe(e) {
  D(e, e.v + 1);
}
function Wt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var a = r[l], f = a.f, u = (f & C) === 0;
      if (u && x(a, t), (f & S) !== 0) {
        var s = (
          /** @type {Derived} */
          a
        );
        H?.delete(s), (f & pe) === 0 && (f & L && (a.f |= pe), Wt(s, X, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          a
        );
        (f & fe) !== 0 && J !== null && J.add(c), n !== null ? n.push(c) : ut(c);
      }
    }
}
function me(e) {
  if (typeof e != "object" || e === null || We in e)
    return e;
  const t = kn(e);
  if (t !== En && t !== xn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ct(e), i = /* @__PURE__ */ V(0), l = he, a = (f) => {
    if (he === l)
      return f();
    var u = g, s = he;
    z(null), xt(l);
    var c = f();
    return z(u), xt(s), c;
  };
  return r && n.set("length", /* @__PURE__ */ V(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && Fn();
        var c = n.get(u);
        return c === void 0 ? a(() => {
          var v = /* @__PURE__ */ V(s.value);
          return n.set(u, v), v;
        }) : D(c, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const c = a(() => /* @__PURE__ */ V(R));
            n.set(u, c), Oe(i);
          }
        } else
          D(s, R), Oe(i);
        return !0;
      },
      get(f, u, s) {
        if (u === We)
          return e;
        var c = n.get(u), v = u in f;
        if (c === void 0 && (!v || Fe(f, u)?.writable) && (c = a(() => {
          var h = me(v ? f[u] : R), o = /* @__PURE__ */ V(h);
          return o;
        }), n.set(u, c)), c !== void 0) {
          var d = E(c);
          return d === R ? void 0 : d;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var c = n.get(u);
          c && (s.value = E(c));
        } else if (s === void 0) {
          var v = n.get(u), d = v?.v;
          if (v !== void 0 && d !== R)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return s;
      },
      has(f, u) {
        if (u === We)
          return !0;
        var s = n.get(u), c = s !== void 0 && s.v !== R || Reflect.has(f, u);
        if (s !== void 0 || m !== null && (!c || Fe(f, u)?.writable)) {
          s === void 0 && (s = a(() => {
            var d = c ? me(f[u]) : R, h = /* @__PURE__ */ V(d);
            return h;
          }), n.set(u, s));
          var v = E(s);
          if (v === R)
            return !1;
        }
        return c;
      },
      set(f, u, s, c) {
        var v = n.get(u), d = u in f;
        if (r && u === "length")
          for (var h = s; h < /** @type {Source<number>} */
          v.v; h += 1) {
            var o = n.get(h + "");
            o !== void 0 ? D(o, R) : h in f && (o = a(() => /* @__PURE__ */ V(R)), n.set(h + "", o));
          }
        if (v === void 0)
          (!d || Fe(f, u)?.writable) && (v = a(() => /* @__PURE__ */ V(void 0)), D(v, me(s)), n.set(u, v));
        else {
          d = v.v !== R;
          var p = a(() => me(s));
          D(v, p);
        }
        var b = Reflect.getOwnPropertyDescriptor(f, u);
        if (b?.set && b.set.call(c, s), !d) {
          if (r && typeof u == "string") {
            var y = (
              /** @type {Source<number>} */
              n.get("length")
            ), _ = Number(u);
            Number.isInteger(_) && _ >= y.v && D(y, _ + 1);
          }
          Oe(i);
        }
        return !0;
      },
      ownKeys(f) {
        E(i);
        var u = Reflect.ownKeys(f).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== R;
        });
        for (var [s, c] of n)
          c.v !== R && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        Dn();
      }
    }
  );
}
var mt, Xt, Zt, Jt;
function ar() {
  if (mt === void 0) {
    mt = window, Xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Zt = Fe(t, "firstChild").get, Jt = Fe(t, "nextSibling").get, ht(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ht(n) && (n.__t = void 0);
  }
}
function Pe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Qt(e) {
  return (
    /** @type {TemplateNode | null} */
    Zt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    Jt.call(e)
  );
}
function oe(e, t) {
  return /* @__PURE__ */ Qt(e);
}
function ce(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ke(r);
  return r;
}
function or(e) {
  e.textContent = "";
}
function cr() {
  return !1;
}
function vr(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(jn, e, void 0)
  );
}
let yt = !1;
function dr() {
  yt || (yt = !0, document.addEventListener(
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
function ct(e) {
  var t = g, n = m;
  z(null), Z(null);
  try {
    return e();
  } finally {
    z(t), Z(n);
  }
}
function hr(e, t, n, r = n) {
  e.addEventListener(t, () => ct(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), dr();
}
function _r(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ue(e, t) {
  var n = m;
  n !== null && (n.f & O) !== 0 && (e |= O);
  var r = {
    ctx: B,
    deps: null,
    nodes: null,
    f: e | C | L,
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
  if ((e & Ie) !== 0)
    we !== null ? we.push(r) : se.ensure().schedule(r);
  else if (t !== null) {
    try {
      Se(r);
    } catch (a) {
      throw $(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Re) === 0 && (i = i.first, (e & fe) !== 0 && (e & Le) !== 0 && i !== null && (i.f |= Le));
  }
  if (i !== null && (i.parent = n, n !== null && _r(i, n), g !== null && (g.f & S) !== 0 && (e & _e) === 0)) {
    var l = (
      /** @type {Derived} */
      g
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function vt() {
  return g !== null && !Y;
}
function pr(e) {
  const t = ue(Be, null);
  return x(t, T), t.teardown = e, t;
}
function gr(e) {
  return ue(Ie | Rn, e);
}
function wr(e) {
  se.ensure();
  const t = ue(_e | Re, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      $(t), r(void 0);
    }) : ($(t), r(void 0));
  });
}
function mr(e) {
  return ue(st | Re, e);
}
function en(e, t = 0) {
  return ue(Be | t, e);
}
function bt(e, t = [], n = [], r = []) {
  Jn(r, t, n, (i) => {
    ue(Be, () => e(...i.map(E)));
  });
}
function tn(e, t = 0) {
  var n = ue(fe | t, e);
  return n;
}
function G(e) {
  return ue(W | Re, e);
}
function nn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Te, r = g;
    Et(!0), z(null);
    try {
      t.call(null);
    } finally {
      Et(n), z(r);
    }
  }
}
function dt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && ct(() => {
      i.abort(Q);
    });
    var r = n.next;
    (n.f & _e) !== 0 ? n.parent = null : $(n, t), n = r;
  }
}
function yr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && $(t), t = n;
  }
}
function $(e, t = !0) {
  var n = !1;
  (t || (e.f & An) !== 0) && e.nodes !== null && e.nodes.end !== null && (br(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), x(e, _t), dt(e, t && !n), qe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  nn(e), e.f ^= _t, e.f |= U;
  var i = e.parent;
  i !== null && i.first !== null && rn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function br(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function rn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  ln(e, r, !0);
  var i = () => {
    n && $(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var a = () => --l || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function ln(e, t, n) {
  if ((e.f & O) === 0) {
    e.f ^= O;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, a = (i.f & Le) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & fe) !== 0;
      ln(i, t, a ? n : !1), i = l;
    }
  }
}
function sn(e) {
  fn(e, !0);
}
function fn(e, t) {
  if ((e.f & O) !== 0) {
    e.f ^= O, (e.f & T) === 0 && (x(e, C), se.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Le) !== 0 || (n.f & W) !== 0;
      fn(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const a of l)
        (a.is_global || t) && a.in();
  }
}
function un(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Ye = !1, Te = !1;
function Et(e) {
  Te = e;
}
let g = null, Y = !1;
function z(e) {
  g = e;
}
let m = null;
function Z(e) {
  m = e;
}
let q = null;
function an(e) {
  g !== null && (q === null ? q = [e] : q.push(e));
}
let M = null, F = 0, I = null;
function Er(e) {
  I = e;
}
let on = 1, de = 0, he = de;
function xt(e) {
  he = e;
}
function cn() {
  return ++on;
}
function ze(e) {
  var t = e.f;
  if ((t & C) !== 0)
    return !0;
  if (t & S && (e.f &= ~pe), (t & X) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (ze(
        /** @type {Derived} */
        l
      ) && Bt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & L) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    H === null && x(e, T);
  }
  return !1;
}
function vn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(q !== null && Ee.call(q, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & S) !== 0 ? vn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? x(l, C) : (l.f & T) !== 0 && x(l, X), ut(
        /** @type {Effect} */
        l
      ));
    }
}
function dn(e) {
  var t = M, n = F, r = I, i = g, l = q, a = B, f = Y, u = he, s = e.f;
  M = /** @type {null | Value[]} */
  null, F = 0, I = null, g = (s & (W | _e)) === 0 ? e : null, q = null, xe(e.ctx), Y = !1, he = ++de, e.ac !== null && (ct(() => {
    e.ac.abort(Q);
  }), e.ac = null);
  try {
    e.f |= tt;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= Ae;
    var d = e.deps, h = w?.is_fork;
    if (M !== null) {
      var o;
      if (h || qe(e, F), d !== null && F > 0)
        for (d.length = F + M.length, o = 0; o < M.length; o++)
          d[F + o] = M[o];
      else
        e.deps = d = M;
      if (vt() && (e.f & L) !== 0)
        for (o = F; o < d.length; o++)
          (d[o].reactions ??= []).push(e);
    } else !h && d !== null && F < d.length && (qe(e, F), d.length = F);
    if (It() && I !== null && !Y && d !== null && (e.f & (S | X | C)) === 0)
      for (o = 0; o < /** @type {Source[]} */
      I.length; o++)
        vn(
          I[o],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (de++, i.deps !== null)
        for (let p = 0; p < n; p += 1)
          i.deps[p].rv = de;
      if (t !== null)
        for (const p of t)
          p.rv = de;
      I !== null && (r === null ? r = I : r.push(.../** @type {Source[]} */
      I));
    }
    return (e.f & ie) !== 0 && (e.f ^= ie), v;
  } catch (p) {
    return qt(p);
  } finally {
    e.f ^= tt, M = t, F = n, I = r, g = i, q = l, xe(a), Y = f, he = u;
  }
}
function xr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = yn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & S) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (M === null || !Ee.call(M, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & L) !== 0 && (l.f ^= L, l.f &= ~pe), ft(l), lr(l), qe(l, 0);
  }
}
function qe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      xr(e, n[r]);
}
function Se(e) {
  var t = e.f;
  if ((t & U) === 0) {
    x(e, T);
    var n = m, r = Ye;
    m = e, Ye = !0;
    try {
      (t & (fe | Mt)) !== 0 ? yr(e) : dt(e), nn(e);
      var i = dn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = on;
      var l;
    } finally {
      Ye = r, m = n;
    }
  }
}
async function kr() {
  await Promise.resolve(), Bn();
}
function E(e) {
  var t = e.f, n = (t & S) !== 0;
  if (g !== null && !Y) {
    var r = m !== null && (m.f & U) !== 0;
    if (!r && (q === null || !Ee.call(q, e))) {
      var i = g.deps;
      if ((g.f & tt) !== 0)
        e.rv < de && (e.rv = de, M === null && i !== null && i[F] === e ? F++ : M === null ? M = [e] : M.push(e));
      else {
        (g.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [g] : Ee.call(l, g) || l.push(g);
      }
    }
  }
  if (Te && le.has(e))
    return le.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (Te) {
      var f = a.v;
      return ((a.f & T) === 0 && a.reactions !== null || _n(a)) && (f = ot(a)), le.set(a, f), f;
    }
    var u = (a.f & L) === 0 && !Y && g !== null && (Ye || (g.f & L) !== 0), s = (a.f & Ae) === 0;
    ze(a) && (u && (a.f |= L), Bt(a)), u && !s && (Kt(a), hn(a));
  }
  if (H?.has(e))
    return H.get(e);
  if ((e.f & ie) !== 0)
    throw e.v;
  return e.v;
}
function hn(e) {
  if (e.f |= L, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & S) !== 0 && (t.f & L) === 0 && (Kt(
        /** @type {Derived} */
        t
      ), hn(
        /** @type {Derived} */
        t
      ));
}
function _n(e) {
  if (e.v === R) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (le.has(t) || (t.f & S) !== 0 && _n(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function pn(e) {
  var t = Y;
  try {
    return Y = !0, e();
  } finally {
    Y = t;
  }
}
const kt = globalThis.Deno?.core?.ops ?? null;
function Tr(e, ...t) {
  kt?.[e] ? kt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function je(e, t) {
  Tr("op_set_text", e, t);
}
const Sr = ["touchstart", "touchmove"];
function Ar(e) {
  return Sr.includes(e);
}
const Ne = Symbol("events"), gn = /* @__PURE__ */ new Set(), it = /* @__PURE__ */ new Set();
function Ze(e, t, n) {
  (t[Ne] ??= {})[e] = n;
}
function Rr(e) {
  for (var t = 0; t < e.length; t++)
    gn.add(e[t]);
  for (var n of it)
    n(e);
}
let Tt = null;
function St(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Tt = e;
  var a = 0, f = Tt === e && e[Ne];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ne] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (a = u);
  }
  if (l = /** @type {Element} */
  i[a] || e.target, l !== t) {
    bn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = g, v = m;
    z(null), Z(null);
    try {
      for (var d, h = []; l !== null; ) {
        var o = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var p = l[Ne]?.[r];
          p != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && p.call(l, e);
        } catch (b) {
          d ? h.push(b) : d = b;
        }
        if (e.cancelBubble || o === t || o === null)
          break;
        l = o;
      }
      if (d) {
        for (let b of h)
          queueMicrotask(() => {
            throw b;
          });
        throw d;
      }
    } finally {
      e[Ne] = t, delete e.currentTarget, z(c), Z(v);
    }
  }
}
const Cr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Nr(e) {
  return (
    /** @type {string} */
    Cr?.createHTML(e) ?? e
  );
}
function Mr(e) {
  var t = vr("template");
  return t.innerHTML = Nr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Fr(e, t) {
  var n = (
    /** @type {Effect} */
    m
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function wn(e, t) {
  var n = (t & zn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Mr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Qt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Fr(l, l), l;
  };
}
function At(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Dr(e, t) {
  return Or(e, t);
}
const Ve = /* @__PURE__ */ new Map();
function Or(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: a = !0, transformError: f }) {
  ar();
  var u = void 0, s = wr(() => {
    var c = n ?? t.appendChild(Pe());
    Xn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (h) => {
        Ot({});
        var o = (
          /** @type {ComponentContext} */
          B
        );
        l && (o.c = l), i && (r.$$events = i), u = e(h, r) || {}, Pt();
      },
      f
    );
    var v = /* @__PURE__ */ new Set(), d = (h) => {
      for (var o = 0; o < h.length; o++) {
        var p = h[o];
        if (!v.has(p)) {
          v.add(p);
          var b = Ar(p);
          for (const k of [t, document]) {
            var y = Ve.get(k);
            y === void 0 && (y = /* @__PURE__ */ new Map(), Ve.set(k, y));
            var _ = y.get(p);
            _ === void 0 ? (k.addEventListener(p, St, { passive: b }), y.set(p, 1)) : y.set(p, _ + 1);
          }
        }
      }
    };
    return d($e(gn)), it.add(d), () => {
      for (var h of v)
        for (const b of [t, document]) {
          var o = (
            /** @type {Map<string, number>} */
            Ve.get(b)
          ), p = (
            /** @type {number} */
            o.get(h)
          );
          --p == 0 ? (b.removeEventListener(h, St), o.delete(h), o.size === 0 && Ve.delete(b)) : o.set(h, p);
        }
      it.delete(d), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Pr.set(u, s), u;
}
let Pr = /* @__PURE__ */ new WeakMap();
function Ir(e, t) {
  return t;
}
function Lr(e, t, n) {
  for (var r = [], i = t.length, l, a = t.length, f = 0; f < i; f++) {
    let v = t[f];
    be(
      v,
      () => {
        if (l) {
          if (l.pending.delete(v), l.done.add(v), l.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            lt(e, $e(l.done)), d.delete(l), d.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var u = r.length === 0 && n !== null;
    if (u) {
      var s = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        s.parentNode
      );
      or(c), c.append(s), e.items.clear();
    }
    lt(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function lt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const a of e.pending.values())
      for (const f of a)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= ee;
      const a = document.createDocumentFragment();
      un(l, a);
    } else
      $(t[i], n);
  }
}
var Rt;
function qr(e, t, n, r, i, l = null) {
  var a = e, f = /* @__PURE__ */ new Map();
  {
    var u = (
      /** @type {Element} */
      e
    );
    a = u.appendChild(Pe());
  }
  var s = null, c = /* @__PURE__ */ nr(() => {
    var _ = n();
    return Ct(_) ? _ : _ == null ? [] : $e(_);
  }), v, d = /* @__PURE__ */ new Map(), h = !0;
  function o(_) {
    (y.effect.f & U) === 0 && (y.pending.delete(_), y.fallback = s, zr(y, v, a, t, r), s !== null && (v.length === 0 ? (s.f & ee) === 0 ? sn(s) : (s.f ^= ee, Me(s, null, a)) : be(s, () => {
      s = null;
    })));
  }
  function p(_) {
    y.pending.delete(_);
  }
  var b = tn(() => {
    v = /** @type {V[]} */
    E(c);
    for (var _ = v.length, k = /* @__PURE__ */ new Set(), A = (
      /** @type {Batch} */
      w
    ), K = cr(), P = 0; P < _; P += 1) {
      var ae = v[P], N = r(ae, P), j = h ? null : f.get(N);
      j ? (j.v && ke(j.v, ae), j.i && ke(j.i, P), K && A.unskip_effect(j.e)) : (j = jr(
        f,
        h ? a : Rt ??= Pe(),
        ae,
        N,
        P,
        i,
        t,
        n
      ), h || (j.e.f |= ee), f.set(N, j)), k.add(N);
    }
    if (_ === 0 && l && !s && (h ? s = G(() => l(a)) : (s = G(() => l(Rt ??= Pe())), s.f |= ee)), _ > k.size && Nn(), !h)
      if (d.set(A, k), K) {
        for (const [Ge, mn] of f)
          k.has(Ge) || A.skip_effect(mn.e);
        A.oncommit(o), A.ondiscard(p);
      } else
        o(A);
    E(c);
  }), y = { effect: b, items: f, pending: d, outrogroups: null, fallback: s };
  h = !1;
}
function Ce(e) {
  for (; e !== null && (e.f & W) === 0; )
    e = e.next;
  return e;
}
function zr(e, t, n, r, i) {
  var l = t.length, a = e.items, f = Ce(e.effect.first), u, s = null, c = [], v = [], d, h, o, p;
  for (p = 0; p < l; p += 1) {
    if (d = t[p], h = i(d, p), o = /** @type {EachItem} */
    a.get(h).e, e.outrogroups !== null)
      for (const N of e.outrogroups)
        N.pending.delete(o), N.done.delete(o);
    if ((o.f & O) !== 0 && sn(o), (o.f & ee) !== 0)
      if (o.f ^= ee, o === f)
        Me(o, null, n);
      else {
        var b = s ? s.next : f;
        o === e.effect.last && (e.effect.last = o.prev), o.prev && (o.prev.next = o.next), o.next && (o.next.prev = o.prev), ne(e, s, o), ne(e, o, b), Me(o, b, n), s = o, c = [], v = [], f = Ce(s.next);
        continue;
      }
    if (o !== f) {
      if (u !== void 0 && u.has(o)) {
        if (c.length < v.length) {
          var y = v[0], _;
          s = y.prev;
          var k = c[0], A = c[c.length - 1];
          for (_ = 0; _ < c.length; _ += 1)
            Me(c[_], y, n);
          for (_ = 0; _ < v.length; _ += 1)
            u.delete(v[_]);
          ne(e, k.prev, A.next), ne(e, s, k), ne(e, A, y), f = y, s = A, p -= 1, c = [], v = [];
        } else
          u.delete(o), Me(o, f, n), ne(e, o.prev, o.next), ne(e, o, s === null ? e.effect.first : s.next), ne(e, s, o), s = o;
        continue;
      }
      for (c = [], v = []; f !== null && f !== o; )
        (u ??= /* @__PURE__ */ new Set()).add(f), v.push(f), f = Ce(f.next);
      if (f === null)
        continue;
    }
    (o.f & ee) === 0 && c.push(o), s = o, f = Ce(o.next);
  }
  if (e.outrogroups !== null) {
    for (const N of e.outrogroups)
      N.pending.size === 0 && (lt(e, $e(N.done)), e.outrogroups?.delete(N));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || u !== void 0) {
    var K = [];
    if (u !== void 0)
      for (o of u)
        (o.f & O) === 0 && K.push(o);
    for (; f !== null; )
      (f.f & O) === 0 && f !== e.fallback && K.push(f), f = Ce(f.next);
    var P = K.length;
    if (P > 0) {
      var ae = l === 0 ? n : null;
      Lr(e, K, ae);
    }
  }
}
function jr(e, t, n, r, i, l, a, f) {
  var u = (a & In) !== 0 ? (a & qn) === 0 ? /* @__PURE__ */ sr(n, !1, !1) : ge(n) : null, s = (a & Ln) !== 0 ? ge(i) : null;
  return {
    v: u,
    i: s,
    e: G(() => (l(t, u ?? n, s ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Me(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & ee) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ke(r)
      );
      if (l.before(r), r === i)
        return;
      r = a;
    }
}
function ne(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Vr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  hr(e, "input", async (i) => {
    var l = i ? e.defaultValue : e.value;
    if (l = Je(e) ? Qe(l) : l, n(l), w !== null && r.add(w), await kr(), l !== (l = t())) {
      var a = e.selectionStart, f = e.selectionEnd, u = e.value.length;
      if (e.value = l ?? "", f !== null) {
        var s = e.value.length;
        a === f && f === u && s > u ? (e.selectionStart = s, e.selectionEnd = s) : (e.selectionStart = a, e.selectionEnd = Math.min(f, s));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  pn(t) == null && e.value && (n(Je(e) ? Qe(e.value) : e.value), w !== null && r.add(w)), en(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        w
      );
      if (r.has(l))
        return;
    }
    Je(e) && i === Qe(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function Je(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Qe(e) {
  return e === "" ? null : +e;
}
var Hr = /* @__PURE__ */ wn('<div style="display: flex; gap: 8px; padding: 4px 0;"><button> </button> <span> </span> <button>x</button></div>'), Yr = /* @__PURE__ */ wn('<div style="display: flex; flex-direction: column; padding: 16px; gap: 12px; max-width: 400px;"><div>M2 Smoke Test</div> <div style="display: flex; gap: 8px;"><input placeholder="New todo"/> <button>Add</button></div> <div> </div> <div style="height: 200px; overflow: auto;"></div> <div> </div></div>');
function Ur(e, t) {
  Ot(t, !0);
  let n = /* @__PURE__ */ V(me([])), r = /* @__PURE__ */ V(""), i = /* @__PURE__ */ V(0);
  function l() {
    E(r).trim() && (D(
      n,
      [
        ...E(n),
        { text: E(r).trim(), done: !1 }
      ],
      !0
    ), ur(i), D(r, ""));
  }
  function a(_) {
    D(n, E(n).filter((k, A) => A !== _), !0);
  }
  function f(_) {
    D(n, E(n).map((k, A) => A === _ ? { ...k, done: !k.done } : k), !0);
  }
  let u = /* @__PURE__ */ tr(() => E(n).filter((_) => !_.done).length);
  var s = Yr(), c = ce(oe(s), 2), v = oe(c), d = ce(v, 2), h = ce(c, 2), o = oe(h), p = ce(h, 2);
  qr(p, 21, () => E(n), Ir, (_, k, A) => {
    var K = Hr(), P = oe(K), ae = oe(P), N = ce(P, 2), j = oe(N), Ge = ce(N, 2);
    bt(() => {
      je(ae, E(k).done ? "[x]" : "[ ]"), je(j, E(k).text);
    }), Ze("click", P, () => f(A)), Ze("click", Ge, () => a(A)), At(_, K);
  });
  var b = ce(p, 2), y = oe(b);
  bt(() => {
    je(o, `Active: ${E(u) ?? ""} | Total added: ${E(i) ?? ""}`), je(y, `Chars: ${E(r).length ?? ""}`);
  }), Vr(v, () => E(r), (_) => D(r, _)), Ze("click", d, l), At(e, s), Pt();
}
Rr(["click"]);
function Br(e) {
  return Dr(Ur, { target: e });
}
export {
  Br as default,
  Br as rvst_mount
};

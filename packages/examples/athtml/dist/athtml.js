var jt = Array.isArray, Ht = Array.prototype.indexOf, ae = Array.prototype.includes, qt = Array.from, Yt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, zt = Object.prototype, Vt = Array.prototype, Bt = Object.getPrototypeOf, $e = Object.isExtensible;
const Ut = () => {
};
function Gt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function st() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, me = 4, Me = 8, lt = 1 << 24, Z = 16, W = 32, te = 64, Pe = 128, R = 512, b = 1024, S = 2048, L = 4096, G = 8192, P = 16384, de = 32768, We = 1 << 25, ke = 65536, Ze = 1 << 17, Kt = 1 << 18, ve = 1 << 19, $t = 1 << 20, ne = 65536, Ie = 1 << 21, Ye = 1 << 22, K = 1 << 23, De = Symbol("$state"), Y = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Wt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Jt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Qt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Xt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function en() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const tn = 2, E = Symbol(), nn = "http://www.w3.org/1999/xhtml", rn = "http://www.w3.org/2000/svg", sn = "http://www.w3.org/1998/Math/MathML";
function ln() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ft(e) {
  return e === this.v;
}
let F = null;
function oe(e) {
  F = e;
}
function fn(e, t = !1, n) {
  F = {
    p: F,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      p
    ),
    l: null
  };
}
function un(e) {
  var t = (
    /** @type {ComponentContext} */
    F
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mn(r);
  }
  return t.i = !0, F = t.p, /** @type {T} */
  {};
}
function ut() {
  return !0;
}
let se = [];
function an() {
  var e = se;
  se = [], Gt(e);
}
function ue(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && an();
    });
  }
  se.push(e);
}
function at(e) {
  var t = p;
  if (t === null)
    return _.f |= K, e;
  if ((t.f & de) === 0 && (t.f & me) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
      if ((t.f & de) === 0)
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
const on = -7169;
function m(e, t) {
  e.f = e.f & on | t;
}
function ze(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, b) : m(e, L);
}
function ot(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ot(
        /** @type {Derived} */
        t.deps
      ));
}
function ct(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), ot(e.deps), m(e, b);
}
const V = /* @__PURE__ */ new Set();
let w = null, D = null, Le = null, Oe = !1, le = null, xe = null;
var Je = 0;
let cn = 1;
class re {
  id = cn++;
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
  #l = /* @__PURE__ */ new Set();
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
  #s = /* @__PURE__ */ new Map();
  is_fork = !1;
  #o = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #v() {
    for (const r of this.#u)
      for (const i of r.#f.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#s.has(n)) {
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
    this.#s.has(t) || this.#s.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#s.get(t);
    if (n) {
      this.#s.delete(t);
      for (var r of n.d)
        m(r, S), this.schedule(r);
      for (r of n.m)
        m(r, L), this.schedule(r);
    }
  }
  #h() {
    if (Je++ > 1e3 && (V.delete(this), hn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, S), this.schedule(f);
      for (const f of this.#n)
        m(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw _t(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, xe = null, this.#c() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#s)
        vt(f, u);
    } else {
      this.#r.size === 0 && V.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
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
    a !== null && (V.add(a), a.#h()), V.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (W | te)) !== 0, f = a && (s & b) !== 0, u = f || (s & G) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= b : (s & me) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), he(i));
        var l = i.first;
        if (l !== null) {
          i = l;
          continue;
        }
      }
      for (; i !== null; ) {
        var o = i.next;
        if (o !== null) {
          i = o;
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
      ct(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), D?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, D = null;
  }
  flush() {
    try {
      Oe = !0, w = this, this.#h();
    } finally {
      Je = 0, Le = null, le = null, xe = null, Oe = !1, w = null, D = null, $.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), V.delete(this);
  }
  #w() {
    for (const l of V) {
      var t = l.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (l.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(o)[0]
          );
          if (t && h !== r)
            l.current.set(o, [h, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...l.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var f of n)
          ht(f, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#a(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of V)
      l.#u.has(this) && (l.#u.delete(this), l.#u.size === 0 && !l.#c() && (l.activate(), l.#h()));
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
      let s = this.#f.get(n) ?? 0;
      s === 1 ? this.#f.delete(n) : this.#f.set(n, s - 1);
    }
    this.#o || r || (this.#o = !0, ue(() => {
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
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#d.add(t);
  }
  settled() {
    return (this.#i ??= st()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Oe || (V.add(w), ue(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      D = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Le = t, t.b?.is_pending && (t.f & (me | Me | lt)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (te | W)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#e.push(n);
  }
}
function hn() {
  try {
    Zt();
  } catch (e) {
    B(e, Le);
  }
}
let q = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (P | G)) === 0 && ye(r) && (q = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), q?.size > 0)) {
        $.clear();
        for (const i of q) {
          if ((i.f & (P | G)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            q.has(a) && (q.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (P | G)) === 0 && he(u);
          }
        }
        q.clear();
      }
    }
    q = null;
  }
}
function ht(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? ht(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & S) === 0 && dt(i, t, r) && (m(i, S), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function dt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && dt(
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
function Ve(e) {
  w.schedule(e);
}
function vt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & b) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      vt(n, t), n = n.next;
  }
}
function _t(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    _t(t), t = t.next;
}
function dn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Ge() && (U(n), Dn(() => (t === 0 && (r = qn(() => e(() => we(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var vn = ke | ve;
function _n(e, t, n, r) {
  new pn(e, t, n, r);
}
class pn {
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
  #l;
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
  #s = null;
  #o = 0;
  #u = 0;
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
  #_ = dn(() => (this.#a = Ne(this.#o), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#l = t, this.#r = n, this.#f = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Pe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Fn(() => {
      this.#m();
    }, vn);
  }
  #w() {
    try {
      this.#e = Q(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = Q(() => {
      n(
        this.#l,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), ue(() => {
      var n = this.#s = document.createDocumentFragment(), r = Tt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, Te(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        In(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Q(() => n(this.#l));
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
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ct(t, this.#v, this.#h);
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
    var n = p, r = _, i = F;
    j(this.#i), N(this.#i), oe(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return at(s), null;
    } finally {
      j(n), N(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && Te(this.#t, () => {
      this.#t = null;
    }), this.#s && (this.#l.before(this.#s), this.#s = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ue(() => {
      this.#c = !1, this.#a && Re(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), U(
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
    this.#e && (I(this.#e), this.#e = null), this.#t && (I(this.#t), this.#t = null), this.#n && (I(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        ln();
        return;
      }
      i = !0, s && en(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        B(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Pe, r(
              this.#l,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return B(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ue(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        B(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => B(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function gn(e, t, n, r) {
  const i = mn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = wn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (a.f & P) === 0 && B(v, a);
    }
    Ae();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = pt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ bn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ae();
  }) : h();
}
function wn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = F, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    j(e), N(t), oe(n), s && (e.f & P) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  j(null), N(null), oe(null), e && w?.deactivate();
}
function pt() {
  var e = (
    /** @type {Effect} */
    p
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
function mn(e) {
  var t = y | S, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: F,
    deps: null,
    effects: null,
    equals: ft,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      E
    ),
    wv: 0,
    parent: n ?? p,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function bn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Wt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return Cn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = st();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (v) {
      l.reject(v), Ae();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & de) !== 0)
        var h = pt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(Y), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(Y);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === Y;
        h(g);
      }
      if (!(d === Y || (u.f & P) !== 0)) {
        if (o.activate(), d)
          s.f |= K, Re(s, d);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Re(s, v);
          for (const [x, C] of f) {
            if (f.delete(x), x === o) break;
            C.reject(Y);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Rn(() => {
    for (const u of f.values())
      u.reject(Y);
  }), new Promise((u) => {
    function l(o) {
      function h() {
        o === i ? u(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function yn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      I(
        /** @type {Effect} */
        t[n]
      );
  }
}
function En(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & P) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Be(e) {
  var t, n = p;
  j(En(e));
  try {
    e.f &= ~ne, yn(e), t = Ft(e);
  } finally {
    j(n);
  }
  return t;
}
function gt(e) {
  var t = e.v, n = Be(e);
  if (!e.equals(n) && (e.wv = Dt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (D !== null ? (Ge() || w?.is_fork) && D.set(e, n) : ze(e));
}
function xn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Y), t.teardown = Ut, t.ac = null, be(t, 0), Ke(t));
}
function wt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let je = /* @__PURE__ */ new Set();
const $ = /* @__PURE__ */ new Map();
let mt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ft,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const n = Ne(e);
  return Ln(n), n;
}
function z(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!O || (_.f & Ze) !== 0) && ut() && (_.f & (y | Z | Ye | Ze)) !== 0 && (M === null || !ae.call(M, e)) && Xt();
  let r = n ? _e(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? $.set(e, t) : $.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Be(s), D === null && ze(s);
    }
    e.wv = Dt(), bt(e, S, n), p !== null && (p.f & b) !== 0 && (p.f & (W | te)) === 0 && (A === null ? jn([e]) : A.push(e)), !i.is_fork && je.size > 0 && !mt && Tn();
  }
  return t;
}
function Tn() {
  mt = !1;
  for (const e of je)
    (e.f & b) !== 0 && m(e, L), ye(e) && he(e);
  je.clear();
}
function we(e) {
  z(e, e.v + 1);
}
function bt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & S) === 0;
      if (u && m(a, t), (f & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        D?.delete(l), (f & ne) === 0 && (f & R && (a.f |= ne), bt(l, L, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && q !== null && q.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Bt(e);
  if (t !== zt && t !== Vt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = jt(e), i = /* @__PURE__ */ H(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var u = _, l = ee;
    N(null), tt(s);
    var o = f();
    return N(u), tt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Jt();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ H(l.value);
          return n.set(u, h), h;
        }) : z(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ H(E));
            n.set(u, o), we(i);
          }
        } else
          z(l, E), we(i);
        return !0;
      },
      get(f, u, l) {
        if (u === De)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || ge(f, u)?.writable) && (o = a(() => {
          var v = _e(h ? f[u] : E), d = /* @__PURE__ */ H(v);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = U(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = U(o));
        } else if (l === void 0) {
          var h = n.get(u), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return l;
      },
      has(f, u) {
        if (u === De)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || ge(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? _e(f[u]) : E, v = /* @__PURE__ */ H(c);
            return v;
          }), n.set(u, l));
          var h = U(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? z(d, E) : v in f && (d = a(() => /* @__PURE__ */ H(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(f, u)?.writable) && (h = a(() => /* @__PURE__ */ H(void 0)), z(h, _e(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(l));
          z(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= C.v && z(C, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        U(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        Qt();
      }
    }
  );
}
var Xe, yt, Et, xt;
function Sn() {
  if (Xe === void 0) {
    Xe = window, yt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Et = ge(t, "firstChild").get, xt = ge(t, "nextSibling").get, $e(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), $e(n) && (n.__t = void 0);
  }
}
function Tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function fe(e) {
  return (
    /** @type {TemplateNode | null} */
    Et.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
function kn(e, t) {
  return /* @__PURE__ */ fe(e);
}
function Fe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
  return r;
}
function St(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(t ?? nn, e, void 0)
  );
}
function kt(e) {
  var t = _, n = p;
  N(null), j(null);
  try {
    return e();
  } finally {
    N(t), j(n);
  }
}
function An(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & G) !== 0 && (e |= G);
  var r = {
    ctx: F,
    deps: null,
    nodes: null,
    f: e | S | R,
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
  if ((e & me) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw I(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && An(i, n), _ !== null && (_.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ge() {
  return _ !== null && !O;
}
function Rn(e) {
  const t = J(Me, null);
  return m(t, b), t.teardown = e, t;
}
function Mn(e) {
  return J(me | $t, e);
}
function Nn(e) {
  re.ensure();
  const t = J(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      I(t), r(void 0);
    }) : (I(t), r(void 0));
  });
}
function Cn(e) {
  return J(Ye | ve, e);
}
function Dn(e, t = 0) {
  return J(Me | t, e);
}
function On(e, t = [], n = [], r = []) {
  gn(r, t, n, (i) => {
    J(Me, () => e(...i.map(U)));
  });
}
function Fn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | ve, e);
}
function At(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    et(!0), N(null);
    try {
      t.call(null);
    } finally {
      et(n), N(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && kt(() => {
      i.abort(Y);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : I(n, t), n = r;
  }
}
function Pn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && I(t), t = n;
  }
}
function I(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Rt(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, We), Ke(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  At(e), e.f ^= We, e.f |= P;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Rt(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Nt(e, r, !0);
  var i = () => {
    n && I(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Nt(e, t, n) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      Nt(i, t, a ? n : !1), i = s;
    }
  }
}
function In(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let Se = !1, ce = !1;
function et(e) {
  ce = e;
}
let _ = null, O = !1;
function N(e) {
  _ = e;
}
let p = null;
function j(e) {
  p = e;
}
let M = null;
function Ln(e) {
  _ !== null && (M === null ? M = [e] : M.push(e));
}
let T = null, k = 0, A = null;
function jn(e) {
  A = e;
}
let Ct = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function Dt() {
  return ++Ct;
}
function ye(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & y && (e.f &= ~ne), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && gt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    D === null && m(e, b);
  }
  return !1;
}
function Ot(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && ae.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Ot(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & b) !== 0 && m(s, L), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Ft(e) {
  var t = T, n = k, r = A, i = _, s = M, a = F, f = O, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, _ = (l & (W | te)) === 0 ? e : null, M = null, oe(e.ctx), O = !1, ee = ++X, e.ac !== null && (kt(() => {
    e.ac.abort(Y);
  }), e.ac = null);
  try {
    e.f |= Ie;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || be(e, k), c !== null && k > 0)
        for (c.length = k + T.length, d = 0; d < T.length; d++)
          c[k + d] = T[d];
      else
        e.deps = c = T;
      if (Ge() && (e.f & R) !== 0)
        for (d = k; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && k < c.length && (be(e, k), c.length = k);
    if (ut() && A !== null && !O && c !== null && (e.f & (y | L | S)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Ot(
          A[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (X++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = X;
      if (t !== null)
        for (const g of t)
          g.rv = X;
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (g) {
    return at(g);
  } finally {
    e.f ^= Ie, T = t, k = n, A = r, _ = i, M = s, oe(a), O = f, ee = u;
  }
}
function Hn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ht.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), ze(s), xn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & P) === 0) {
    m(e, b);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Z | lt)) !== 0 ? Pn(e) : Ke(e), At(e);
      var i = Ft(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ct;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function U(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !O) {
    var r = p !== null && (p.f & P) !== 0;
    if (!r && (M === null || !ae.call(M, e))) {
      var i = _.deps;
      if ((_.f & Ie) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && $.has(e))
    return $.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var f = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || It(a)) && (f = Be(a)), $.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !O && _ !== null && (Se || (_.f & R) !== 0), l = (a.f & de) === 0;
    ye(a) && (u && (a.f |= R), gt(a)), u && !l && (wt(a), Pt(a));
  }
  if (D?.has(e))
    return D.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Pt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & R) === 0 && (wt(
        /** @type {Derived} */
        t
      ), Pt(
        /** @type {Derived} */
        t
      ));
}
function It(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if ($.has(t) || (t.f & y) !== 0 && It(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qn(e) {
  var t = O;
  try {
    return O = !0, e();
  } finally {
    O = t;
  }
}
globalThis.Deno?.core?.ops;
const Yn = ["touchstart", "touchmove"];
function zn(e) {
  return Yn.includes(e);
}
const pe = Symbol("events"), Lt = /* @__PURE__ */ new Set(), He = /* @__PURE__ */ new Set();
function nt(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Vn(e) {
  for (var t = 0; t < e.length; t++)
    Lt.add(e[t]);
  for (var n of He)
    n(e);
}
let rt = null;
function it(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  rt = e;
  var a = 0, f = rt === e && e[pe];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Yt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    N(null), j(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, N(o), j(h);
    }
  }
}
const Bn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Un(e) {
  return (
    /** @type {string} */
    Bn?.createHTML(e) ?? e
  );
}
function Gn(e) {
  var t = St("template");
  return t.innerHTML = Un(e.replaceAll("<!>", "<!---->")), t.content;
}
function qe(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t) {
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Gn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ fe(r));
    var s = (
      /** @type {TemplateNode} */
      n || yt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return qe(s, s), s;
  };
}
function $n(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Wn(e, t) {
  return Zn(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function Zn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  Sn();
  var u = void 0, l = Nn(() => {
    var o = n ?? t.appendChild(Tt());
    _n(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        fn({});
        var d = (
          /** @type {ComponentContext} */
          F
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, un();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = zn(g);
          for (const Ce of [t, document]) {
            var C = Ee.get(Ce);
            C === void 0 && (C = /* @__PURE__ */ new Map(), Ee.set(Ce, C));
            var ie = C.get(g);
            ie === void 0 ? (Ce.addEventListener(g, it, { passive: x }), C.set(g, 1)) : C.set(g, ie + 1);
          }
        }
      }
    };
    return c(qt(Lt)), He.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, it), d.delete(v), d.size === 0 && Ee.delete(x)) : d.set(v, g);
        }
      He.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Jn.set(u, l), u;
}
let Jn = /* @__PURE__ */ new WeakMap();
function Qn(e, t, n = !1, r = !1, i = !1, s = !1) {
  var a = e, f = "";
  if (n)
    var u = (
      /** @type {Element} */
      e
    );
  On(() => {
    var l = (
      /** @type {Effect} */
      p
    );
    if (f !== (f = t() ?? "")) {
      if (n) {
        l.nodes = null, u.innerHTML = /** @type {string} */
        f, f !== "" && qe(
          /** @type {TemplateNode} */
          /* @__PURE__ */ fe(u),
          /** @type {TemplateNode} */
          u.lastChild
        );
        return;
      }
      if (l.nodes !== null && (Rt(
        l.nodes.start,
        /** @type {TemplateNode} */
        l.nodes.end
      ), l.nodes = null), f !== "") {
        var o = r ? rn : i ? sn : void 0, h = (
          /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
          St(r ? "svg" : i ? "math" : "template", o)
        );
        h.innerHTML = /** @type {any} */
        f;
        var c = r || i ? h : (
          /** @type {HTMLTemplateElement} */
          h.content
        );
        if (qe(
          /** @type {TemplateNode} */
          /* @__PURE__ */ fe(c),
          /** @type {TemplateNode} */
          c.lastChild
        ), r || i)
          for (; /* @__PURE__ */ fe(c); )
            a.before(
              /** @type {TemplateNode} */
              /* @__PURE__ */ fe(c)
            );
        else
          a.before(c);
      }
    }
  });
}
var Xn = /* @__PURE__ */ Kn("<div><div></div> <div></div> <button>Set Rich</button> <button>Set Simple</button></div>");
function er(e) {
  let t = /* @__PURE__ */ H("<strong>Hello</strong> <em>world</em>");
  function n() {
    z(t, "<strong>Bold</strong> and <em>italic</em>");
  }
  function r() {
    z(t, "<span>simple</span>");
  }
  var i = Xn(), s = kn(i);
  Qn(s, () => U(t), !0);
  var a = Fe(s, 2);
  a.textContent = "plain text";
  var f = Fe(a, 2), u = Fe(f, 2);
  nt("click", f, n), nt("click", u, r), $n(e, i);
}
Vn(["click"]);
function nr(e) {
  return Wn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

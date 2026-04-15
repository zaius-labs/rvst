var Mt = Array.isArray, Pt = Array.prototype.indexOf, ue = Array.prototype.includes, It = Array.from, jt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Lt = Object.prototype, qt = Array.prototype, Yt = Object.getPrototypeOf, He = Object.isExtensible;
const zt = () => {
};
function Ut(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function nt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, we = 4, Ne = 8, rt = 1 << 24, Z = 16, W = 32, te = 64, Ce = 128, N = 512, b = 1024, S = 2048, L = 4096, K = 8192, I = 16384, he = 32768, Ke = 1 << 25, Se = 65536, Ge = 1 << 17, Vt = 1 << 18, ve = 1 << 19, Bt = 1 << 20, ne = 65536, Me = 1 << 21, Le = 1 << 22, G = 1 << 23, De = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Ht() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Kt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Gt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function $t() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Wt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Zt() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Jt = 2, E = Symbol(), Qt = "http://www.w3.org/1999/xhtml";
function Xt() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function it(e) {
  return e === this.v;
}
let M = null;
function ae(e) {
  M = e;
}
function en(e, t = !1, n) {
  M = {
    p: M,
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
function tn(e) {
  var t = (
    /** @type {ComponentContext} */
    M
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Sn(r);
  }
  return t.i = !0, M = t.p, /** @type {T} */
  {};
}
function st() {
  return !0;
}
let se = [];
function nn() {
  var e = se;
  se = [], Ut(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && nn();
    });
  }
  se.push(e);
}
function lt(e) {
  var t = p;
  if (t === null)
    return _.f |= G, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ce) !== 0) {
      if ((t.f & he) === 0)
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
const rn = -7169;
function m(e, t) {
  e.f = e.f & rn | t;
}
function qe(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, b) : m(e, L);
}
function ft(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ft(
        /** @type {Derived} */
        t.deps
      ));
}
function ut(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), ft(e.deps), m(e, b);
}
const V = /* @__PURE__ */ new Set();
let w = null, F = null, Pe = null, Fe = !1, le = null, Ee = null;
var $e = 0;
let sn = 1;
class re {
  id = sn++;
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
  #s = /* @__PURE__ */ new Map();
  is_fork = !1;
  #o = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #d() {
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
    if ($e++ > 1e3 && (V.delete(this), ln()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, S), this.schedule(f);
      for (const f of this.#n)
        m(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw ht(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, Ee = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#s)
        ct(f, u);
    } else {
      this.#r.size === 0 && V.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), We(r), We(n), this.#i?.resolve();
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
      var s = i.f, a = (s & (W | te)) !== 0, f = a && (s & b) !== 0, u = f || (s & K) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= b : (s & we) !== 0 ? n.push(i) : be(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
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
      ut(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & G) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#h();
    } finally {
      $e = 0, Pe = null, le = null, Ee = null, Fe = !1, w = null, F = null, $.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), V.delete(this);
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
          at(f, i, s, a);
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
    this.#o || r || (this.#o = !0, fe(() => {
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
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= nt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Fe || (V.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      F = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Pe = t, t.b?.is_pending && (t.f & (we | Ne | rt)) !== 0 && (t.f & he) === 0) {
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
function ln() {
  try {
    Kt();
  } catch (e) {
    H(e, Pe);
  }
}
let z = null;
function We(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | K)) === 0 && be(r) && (z = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && St(r), z?.size > 0)) {
        $.clear();
        for (const i of z) {
          if ((i.f & (I | K)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            z.has(a) && (z.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (I | K)) === 0 && ce(u);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function at(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? at(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Le | Z)) !== 0 && (s & S) === 0 && ot(i, t, r) && (m(i, S), Ye(
        /** @type {Effect} */
        i
      ));
    }
}
function ot(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && ot(
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
function Ye(e) {
  w.schedule(e);
}
function ct(e, t) {
  if (!((e.f & W) !== 0 && (e.f & b) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      ct(n, t), n = n.next;
  }
}
function ht(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    ht(t), t = t.next;
}
function fn(e) {
  let t = 0, n = Re(0), r;
  return () => {
    Ve() && (P(n), Nn(() => (t === 0 && (r = jn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var un = Se | ve;
function an(e, t, n, r) {
  new on(e, t, n, r);
}
class on {
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
  #s = null;
  #o = 0;
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
  #a = null;
  #_ = fn(() => (this.#a = Re(this.#o), () => {
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
      a.b = this, a.f |= Ce, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = On(() => {
      this.#m();
    }, un);
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), fe(() => {
      var n = this.#s = document.createDocumentFragment(), r = yt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, xe(
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
        Cn(this.#e, t);
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ut(t, this.#d, this.#h);
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
    var n = p, r = _, i = M;
    q(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return lt(s), null;
    } finally {
      q(n), O(r), ae(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && xe(this.#t, () => {
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#a && Ae(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), P(
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
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        Xt();
        return;
      }
      i = !0, s && Zt(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        H(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Ce, r(
              this.#l,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return H(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        H(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => H(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function cn(e, t, n, r) {
  const i = vn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = hn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (d) {
      (a.f & I) === 0 && H(d, a);
    }
    ke();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = vt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ dn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), ke();
  }) : h();
}
function hn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = M, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    q(e), O(t), ae(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function ke(e = !0) {
  q(null), O(null), ae(null), e && w?.deactivate();
}
function vt() {
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
function vn(e) {
  var t = y | S, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: M,
    deps: null,
    effects: null,
    equals: it,
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
function dn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Ht();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Re(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return An(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = nt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(ke);
    } catch (d) {
      l.reject(d), ke();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = vt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(U), f.delete(o);
      else {
        for (const d of f.values())
          d.reject(U);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (d, v = void 0) => {
      if (h) {
        var g = v === U;
        h(g);
      }
      if (!(v === U || (u.f & I) !== 0)) {
        if (o.activate(), v)
          s.f |= G, Ae(s, v);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Ae(s, d);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(U);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), Tn(() => {
    for (const u of f.values())
      u.reject(U);
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
function _n(e) {
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
function pn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function ze(e) {
  var t, n = p;
  q(pn(e));
  try {
    e.f &= ~ne, _n(e), t = Ot(e);
  } finally {
    q(n);
  }
  return t;
}
function dt(e) {
  var t = e.v, n = ze(e);
  if (!e.equals(n) && (e.wv = Nt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  oe || (F !== null ? (Ve() || w?.is_fork) && F.set(e, n) : qe(e));
}
function gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = zt, t.ac = null, me(t, 0), Be(t));
}
function _t(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Ie = /* @__PURE__ */ new Set();
const $ = /* @__PURE__ */ new Map();
let pt = !1;
function Re(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: it,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const n = Re(e);
  return Mn(n), n;
}
function B(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (_.f & Ge) !== 0) && st() && (_.f & (y | Z | Le | Ge)) !== 0 && (R === null || !ue.call(R, e)) && Wt();
  let r = n ? de(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? $.set(e, t) : $.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && ze(s), F === null && qe(s);
    }
    e.wv = Nt(), gt(e, S, n), p !== null && (p.f & b) !== 0 && (p.f & (W | te)) === 0 && (A === null ? Pn([e]) : A.push(e)), !i.is_fork && Ie.size > 0 && !pt && wn();
  }
  return t;
}
function wn() {
  pt = !1;
  for (const e of Ie)
    (e.f & b) !== 0 && m(e, L), be(e) && ce(e);
  Ie.clear();
}
function ge(e) {
  B(e, e.v + 1);
}
function gt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & S) === 0;
      if (u && m(a, t), (f & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        F?.delete(l), (f & ne) === 0 && (f & N && (a.f |= ne), gt(l, L, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : Ye(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Yt(e);
  if (t !== Lt && t !== qt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Mt(e), i = /* @__PURE__ */ Y(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var u = _, l = ee;
    O(null), Qe(s);
    var o = f();
    return O(u), Qe(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Gt();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ Y(l.value);
          return n.set(u, h), h;
        }) : B(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ Y(E));
            n.set(u, o), ge(i);
          }
        } else
          B(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === De)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || pe(f, u)?.writable) && (o = a(() => {
          var d = de(h ? f[u] : E), v = /* @__PURE__ */ Y(d);
          return v;
        }), n.set(u, o)), o !== void 0) {
          var c = P(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = P(o));
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
        if (l !== void 0 || p !== null && (!o || pe(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? de(f[u]) : E, d = /* @__PURE__ */ Y(c);
            return d;
          }), n.set(u, l));
          var h = P(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var d = l; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var v = n.get(d + "");
            v !== void 0 ? B(v, E) : d in f && (v = a(() => /* @__PURE__ */ Y(E)), n.set(d + "", v));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = a(() => /* @__PURE__ */ Y(void 0)), B(h, de(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => de(l));
          B(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= D.v && B(D, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        P(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        $t();
      }
    }
  );
}
var Ze, wt, mt, bt;
function mn() {
  if (Ze === void 0) {
    Ze = window, wt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    mt = pe(t, "firstChild").get, bt = pe(t, "nextSibling").get, He(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), He(n) && (n.__t = void 0);
  }
}
function yt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Et(e) {
  return (
    /** @type {TemplateNode | null} */
    mt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    bt.call(e)
  );
}
function bn(e, t) {
  return /* @__PURE__ */ Et(e);
}
function yn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
  return r;
}
function En(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Qt, e, void 0)
  );
}
function xt(e) {
  var t = _, n = p;
  O(null), q(null);
  try {
    return e();
  } finally {
    O(t), q(n);
  }
}
function xn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & K) !== 0 && (e |= K);
  var r = {
    ctx: M,
    deps: null,
    nodes: null,
    f: e | S | N,
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
  if ((e & we) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Z) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && xn(i, n), _ !== null && (_.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ve() {
  return _ !== null && !C;
}
function Tn(e) {
  const t = J(Ne, null);
  return m(t, b), t.teardown = e, t;
}
function Sn(e) {
  return J(we | Bt, e);
}
function kn(e) {
  re.ensure();
  const t = J(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function An(e) {
  return J(Le | ve, e);
}
function Nn(e, t = 0) {
  return J(Ne | t, e);
}
function Rn(e, t = [], n = [], r = []) {
  cn(r, t, n, (i) => {
    J(Ne, () => e(...i.map(P)));
  });
}
function On(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | ve, e);
}
function Tt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = _;
    Je(!0), O(null);
    try {
      t.call(null);
    } finally {
      Je(n), O(r);
    }
  }
}
function Be(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && xt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Dn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Vt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Fn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ke), Be(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Tt(e), e.f ^= Ke, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && St(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function St(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  kt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function kt(e, t, n) {
  if ((e.f & K) === 0) {
    e.f ^= K;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Se) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      kt(i, t, a ? n : !1), i = s;
    }
  }
}
function Cn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function Je(e) {
  oe = e;
}
let _ = null, C = !1;
function O(e) {
  _ = e;
}
let p = null;
function q(e) {
  p = e;
}
let R = null;
function Mn(e) {
  _ !== null && (R === null ? R = [e] : R.push(e));
}
let T = null, k = 0, A = null;
function Pn(e) {
  A = e;
}
let At = 1, X = 0, ee = X;
function Qe(e) {
  ee = e;
}
function Nt() {
  return ++At;
}
function be(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & y && (e.f &= ~ne), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
        /** @type {Derived} */
        s
      ) && dt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, b);
  }
  return !1;
}
function Rt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(R !== null && ue.call(R, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Rt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & b) !== 0 && m(s, L), Ye(
        /** @type {Effect} */
        s
      ));
    }
}
function Ot(e) {
  var t = T, n = k, r = A, i = _, s = R, a = M, f = C, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, _ = (l & (W | te)) === 0 ? e : null, R = null, ae(e.ctx), C = !1, ee = ++X, e.ac !== null && (xt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Me;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var v;
      if (d || me(e, k), c !== null && k > 0)
        for (c.length = k + T.length, v = 0; v < T.length; v++)
          c[k + v] = T[v];
      else
        e.deps = c = T;
      if (Ve() && (e.f & N) !== 0)
        for (v = k; v < c.length; v++)
          (c[v].reactions ??= []).push(e);
    } else !d && c !== null && k < c.length && (me(e, k), c.length = k);
    if (st() && A !== null && !C && c !== null && (e.f & (y | L | S)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      A.length; v++)
        Rt(
          A[v],
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
    return (e.f & G) !== 0 && (e.f ^= G), h;
  } catch (g) {
    return lt(g);
  } finally {
    e.f ^= Me, T = t, k = n, A = r, _ = i, R = s, ae(a), C = f, ee = u;
  }
}
function In(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Pt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), qe(s), gn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      In(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & I) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | rt)) !== 0 ? Dn(e) : Be(e), Tt(e);
      var i = Ot(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = At;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function P(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !C) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (R === null || !ue.call(R, e))) {
      var i = _.deps;
      if ((_.f & Me) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (oe && $.has(e))
    return $.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Ft(a)) && (f = ze(a)), $.set(a, f), f;
    }
    var u = (a.f & N) === 0 && !C && _ !== null && (Te || (_.f & N) !== 0), l = (a.f & he) === 0;
    be(a) && (u && (a.f |= N), dt(a)), u && !l && (_t(a), Dt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function Dt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (_t(
        /** @type {Derived} */
        t
      ), Dt(
        /** @type {Derived} */
        t
      ));
}
function Ft(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if ($.has(t) || (t.f & y) !== 0 && Ft(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function jn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
globalThis.Deno?.core?.ops;
const Ln = ["touchstart", "touchmove"];
function qn(e) {
  return Ln.includes(e);
}
const _e = Symbol("events"), Ct = /* @__PURE__ */ new Set(), je = /* @__PURE__ */ new Set();
function Yn(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function zn(e) {
  for (var t = 0; t < e.length; t++)
    Ct.add(e[t]);
  for (var n of je)
    n(e);
}
let Xe = null;
function et(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Xe = e;
  var a = 0, f = Xe === e && e[_e];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[_e] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    jt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    O(null), q(null);
    try {
      for (var c, d = []; s !== null; ) {
        var v = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[_e]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? d.push(x) : c = x;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        s = v;
      }
      if (c) {
        for (let x of d)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[_e] = t, delete e.currentTarget, O(o), q(h);
    }
  }
}
const Un = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Vn(e) {
  return (
    /** @type {string} */
    Un?.createHTML(e) ?? e
  );
}
function Bn(e) {
  var t = En("template");
  return t.innerHTML = Vn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Hn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t) {
  var n = (t & Jt) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Bn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Et(r));
    var s = (
      /** @type {TemplateNode} */
      n || wt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Hn(s, s), s;
  };
}
function Gn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function $n(e, t) {
  return Wn(e, t);
}
const ye = /* @__PURE__ */ new Map();
function Wn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  mn();
  var u = void 0, l = kn(() => {
    var o = n ?? t.appendChild(yt());
    an(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        en({});
        var v = (
          /** @type {ComponentContext} */
          M
        );
        s && (v.c = s), i && (r.$$events = i), u = e(d, r) || {}, tn();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var v = 0; v < d.length; v++) {
        var g = d[v];
        if (!h.has(g)) {
          h.add(g);
          var x = qn(g);
          for (const Oe of [t, document]) {
            var D = ye.get(Oe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), ye.set(Oe, D));
            var ie = D.get(g);
            ie === void 0 ? (Oe.addEventListener(g, et, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(It(Ct)), je.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            ye.get(x)
          ), g = (
            /** @type {number} */
            v.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, et), v.delete(d), v.size === 0 && ye.delete(x)) : v.set(d, g);
        }
      je.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Zn.set(u, l), u;
}
let Zn = /* @__PURE__ */ new WeakMap();
const tt = [...` 	
\r\f \v\uFEFF`];
function Jn(e, t, n) {
  var r = "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var s = i.length, a = 0; (a = r.indexOf(i, a)) >= 0; ) {
          var f = a + s;
          (a === 0 || tt.includes(r[a - 1])) && (f === r.length || tt.includes(r[f])) ? r = (a === 0 ? "" : r.substring(0, a)) + r.substring(f + 1) : a = f;
        }
  }
  return r === "" ? null : r;
}
function Qn(e, t, n, r, i, s) {
  var a = e.__className;
  if (a !== n || a === void 0) {
    var f = Jn(n, r, s);
    f == null ? e.removeAttribute("class") : e.className = f, e.__className = n;
  } else if (s && i !== s)
    for (var u in s) {
      var l = !!s[u];
      (i == null || l !== !!i[u]) && e.classList.toggle(u, l);
    }
  return s;
}
var Xn = /* @__PURE__ */ Kn("<div><button>Toggle</button> <span>Status</span></div>");
function er(e) {
  let t = /* @__PURE__ */ Y(!1);
  var n = Xn(), r = bn(n), i = yn(r, 2);
  let s;
  Rn(() => s = Qn(i, 1, "", null, s, { active: P(t), inactive: !P(t) })), Yn("click", r, () => {
    B(t, !P(t));
  }), Gn(e, n);
}
zn(["click"]);
function nr(e) {
  return $n(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

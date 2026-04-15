var Ut = Array.isArray, Vt = Array.prototype.indexOf, ue = Array.prototype.includes, Bt = Array.from, Ht = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Kt = Object.prototype, Gt = Array.prototype, Wt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Re = 8, ft = 1 << 24, Z = 16, W = 32, te = 64, Fe = 128, N = 512, y = 1024, S = 2048, L = 4096, H = 8192, I = 16384, he = 32768, We = 1 << 25, ke = 65536, Ze = 1 << 17, Qt = 1 << 18, _e = 1 << 19, Xt = 1 << 20, ne = 65536, Me = 1 << 21, qe = 1 << 22, K = 1 << 23, Oe = Symbol("$state"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function en(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function tn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function nn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ln() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function fn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const un = 2, E = Symbol(), on = "http://www.w3.org/1999/xhtml";
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let k = null;
function oe(e) {
  k = e;
}
function cn(e) {
  return (
    /** @type {T} */
    at().get(e)
  );
}
function hn(e, t) {
  return at().set(e, t), t;
}
function Ye(e, t = !1, n) {
  k = {
    p: k,
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
function ze(e) {
  var t = (
    /** @type {ComponentContext} */
    k
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mn(r);
  }
  return t.i = !0, k = t.p, /** @type {T} */
  {};
}
function ot() {
  return !0;
}
function at(e) {
  return k === null && en(), k.c ??= new Map(_n(k) || void 0);
}
function _n(e) {
  let t = e.p;
  for (; t !== null; ) {
    const n = t.c;
    if (n !== null)
      return n;
    t = t.p;
  }
  return null;
}
let se = [];
function dn() {
  var e = se;
  se = [], Jt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && dn();
    });
  }
  se.push(e);
}
function ct(e) {
  var t = p;
  if (t === null)
    return v.f |= K, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
  for (; t !== null; ) {
    if ((t.f & Fe) !== 0) {
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
const vn = -7169;
function m(e, t) {
  e.f = e.f & vn | t;
}
function $e(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, L);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function _t(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), ht(e.deps), m(e, y);
}
const U = /* @__PURE__ */ new Set();
let w = null, F = null, Pe = null, De = !1, le = null, Ee = null;
var Je = 0;
let pn = 1;
class re {
  id = pn++;
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
  #_ = /* @__PURE__ */ new Set();
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
    if (Je++ > 1e3 && (U.delete(this), gn()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), m(u, S), this.schedule(u);
      for (const u of this.#n)
        m(u, L), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Ee = [];
    for (const u of t)
      try {
        this.#o(u, n, r);
      } catch (f) {
        throw gt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (le = null, Ee = null, this.#c() || this.#d()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        pt(u, f);
    } else {
      this.#r.size === 0 && U.delete(this), this.#t.clear(), this.#n.clear();
      for (const u of this.#l) u(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const u = o ??= this;
      u.#e.push(...this.#e.filter((f) => !u.#e.includes(f)));
    }
    o !== null && (U.add(o), o.#h()), U.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & (W | te)) !== 0, u = o && (s & y) !== 0, f = u || (s & H) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
        o ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
        var l = i.first;
        if (l !== null) {
          i = l;
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      _t(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      De = !0, w = this, this.#h();
    } finally {
      Je = 0, Pe = null, le = null, Ee = null, De = !1, w = null, F = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), U.delete(this);
  }
  #w() {
    for (const l of U) {
      var t = l.id < this.id, n = [];
      for (const [a, [h, c]] of this.current) {
        if (l.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(a)[0]
          );
          if (t && h !== r)
            l.current.set(a, [h, c]);
          else
            continue;
        }
        n.push(a);
      }
      var i = [...l.current.keys()].filter((a) => !this.current.has(a));
      if (i.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var u of n)
          dt(u, i, s, o);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#o(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of U)
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
    this.#a || r || (this.#a = !0, fe(() => {
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
    this.#l.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#_.add(t);
  }
  settled() {
    return (this.#i ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      De || (U.add(w), fe(() => {
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
    if (Pe = t, t.b?.is_pending && (t.f & (we | Re | ft)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & b) === 0))
        return;
      if ((r & (te | W)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function gn() {
  try {
    nn();
  } catch (e) {
    B(e, Pe);
  }
}
let z = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | H)) === 0 && ye(r) && (z = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ot(r), z?.size > 0)) {
        G.clear();
        for (const i of z) {
          if ((i.f & (I | H)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            z.has(o) && (z.delete(o), s.push(o)), o = o.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (I | H)) === 0 && ce(f);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function dt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? dt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (qe | Z)) !== 0 && (s & S) === 0 && vt(i, t, r) && (m(i, S), Ue(
        /** @type {Effect} */
        i
      ));
    }
}
function vt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && vt(
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
function Ue(e) {
  w.schedule(e);
}
function pt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      pt(n, t), n = n.next;
  }
}
function gt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    gt(t), t = t.next;
}
function wn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    He() && (P(n), jn(() => (t === 0 && (r = Bn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var mn = ke | _e;
function yn(e, t, n, r) {
  new bn(e, t, n, r);
}
class bn {
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
  #_ = null;
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
  #v = wn(() => (this.#o = Ne(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#l = t, this.#r = n, this.#f = (s) => {
      var o = (
        /** @type {Effect} */
        p
      );
      o.b = this, o.f |= Fe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ln(() => {
      this.#m();
    }, mn);
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
  #b(t) {
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
      var n = this.#s = document.createDocumentFragment(), r = St();
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        zn(this.#e, t);
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
    _t(t, this.#d, this.#h);
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
    var n = p, r = v, i = k;
    q(this.#i), O(this.#i), oe(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      q(n), O(r), oe(i);
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
    this.#y(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#o && Ae(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#v(), P(
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
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        an();
        return;
      }
      i = !0, s && fn(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, o), s = !1;
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
            l.b = this, l.f |= Fe, r(
              this.#l,
              () => f,
              () => o
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
    fe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (l) {
        B(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => B(l, this.#i && this.#i.parent)
      ) : u(f);
    });
  }
}
function En(e, t, n, r) {
  const i = Tn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    p
  ), u = xn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (d) {
      (o.f & I) === 0 && B(d, o);
    }
    Se();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var a = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ kn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, o)).finally(() => a());
  }
  f ? f.then(() => {
    u(), h(), Se();
  }) : h();
}
function xn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = k, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    q(e), O(t), oe(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  q(null), O(null), oe(null), e && w?.deactivate();
}
function wt() {
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
function Tn(e) {
  var t = b | S, n = v !== null && (v.f & b) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: k,
    deps: null,
    effects: null,
    equals: ut,
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
function kn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && tn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), o = !v, u = /* @__PURE__ */ new Map();
  return In(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (d) {
      l.reject(d), Se();
    }
    var a = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((f.f & he) !== 0)
        var h = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(a)?.reject($), u.delete(a);
      else {
        for (const d of u.values())
          d.reject($);
        u.clear();
      }
      u.set(a, l);
    }
    const c = (d, _ = void 0) => {
      if (h) {
        var g = _ === $;
        h(g);
      }
      if (!(_ === $ || (f.f & I) !== 0)) {
        if (a.activate(), _)
          s.f |= K, Ae(s, _);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ae(s, d);
          for (const [x, D] of u) {
            if (u.delete(x), x === a) break;
            D.reject($);
          }
        }
        a.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), Fn(() => {
    for (const f of u.values())
      f.reject($);
  }), new Promise((f) => {
    function l(a) {
      function h() {
        a === i ? f(s) : l(i);
      }
      a.then(h, h);
    }
    l(i);
  });
}
function Sn(e) {
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
function An(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = p;
  q(An(e));
  try {
    e.f &= ~ne, Sn(e), t = It(e);
  } finally {
    q(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Mt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ae || (F !== null ? (He() || w?.is_fork) && F.set(e, n) : $e(e));
}
function Rn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Zt, t.ac = null, me(t, 0), Ke(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Ie = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let bt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ut,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const n = Ne(e);
  return $n(n), n;
}
function V(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (v.f & Ze) !== 0) && ot() && (v.f & (b | Z | qe | Ze)) !== 0 && (C === null || !ue.call(C, e)) && ln();
  let r = n ? de(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ae ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Ve(s), F === null && $e(s);
    }
    e.wv = Mt(), Et(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (W | te)) === 0 && (R === null ? Un([e]) : R.push(e)), !i.is_fork && Ie.size > 0 && !bt && Nn();
  }
  return t;
}
function Nn() {
  bt = !1;
  for (const e of Ie)
    (e.f & y) !== 0 && m(e, L), ye(e) && ce(e);
  Ie.clear();
}
function ge(e) {
  V(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], u = o.f, f = (u & S) === 0;
      if (f && m(o, t), (u & b) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        F?.delete(l), (u & ne) === 0 && (u & N && (o.f |= ne), Et(l, L, n));
      } else if (f) {
        var a = (
          /** @type {Effect} */
          o
        );
        (u & Z) !== 0 && z !== null && z.add(a), n !== null ? n.push(a) : Ue(a);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Wt(e);
  if (t !== Kt && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ut(e), i = /* @__PURE__ */ Y(0), s = ee, o = (u) => {
    if (ee === s)
      return u();
    var f = v, l = ee;
    O(null), nt(s);
    var a = u();
    return O(f), nt(l), a;
  };
  return r && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && rn();
        var a = n.get(f);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ Y(l.value);
          return n.set(f, h), h;
        }) : V(a, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const a = o(() => /* @__PURE__ */ Y(E));
            n.set(f, a), ge(i);
          }
        } else
          V(l, E), ge(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Oe)
          return e;
        var a = n.get(f), h = f in u;
        if (a === void 0 && (!h || pe(u, f)?.writable) && (a = o(() => {
          var d = de(h ? u[f] : E), _ = /* @__PURE__ */ Y(d);
          return _;
        }), n.set(f, a)), a !== void 0) {
          var c = P(a);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var a = n.get(f);
          a && (l.value = P(a));
        } else if (l === void 0) {
          var h = n.get(f), c = h?.v;
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
      has(u, f) {
        if (f === Oe)
          return !0;
        var l = n.get(f), a = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!a || pe(u, f)?.writable)) {
          l === void 0 && (l = o(() => {
            var c = a ? de(u[f]) : E, d = /* @__PURE__ */ Y(c);
            return d;
          }), n.set(f, l));
          var h = P(l);
          if (h === E)
            return !1;
        }
        return a;
      },
      set(u, f, l, a) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var d = l; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var _ = n.get(d + "");
            _ !== void 0 ? V(_, E) : d in u && (_ = o(() => /* @__PURE__ */ Y(E)), n.set(d + "", _));
          }
        if (h === void 0)
          (!c || pe(u, f)?.writable) && (h = o(() => /* @__PURE__ */ Y(void 0)), V(h, de(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = o(() => de(l));
          V(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(a, l), !c) {
          if (r && typeof f == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= D.v && V(D, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(u) {
        P(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, a] of n)
          a.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        sn();
      }
    }
  );
}
var Xe, xt, Tt, kt;
function Cn() {
  if (Xe === void 0) {
    Xe = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = pe(t, "firstChild").get, kt = pe(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function St(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function At(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
function je(e, t) {
  return /* @__PURE__ */ At(e);
}
function et(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function On(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(on, e, void 0)
  );
}
function Rt(e) {
  var t = v, n = p;
  O(null), q(null);
  try {
    return e();
  } finally {
    O(t), q(n);
  }
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & H) !== 0 && (e |= H);
  var r = {
    ctx: k,
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
    } catch (o) {
      throw j(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Dn(i, n), v !== null && (v.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function He() {
  return v !== null && !M;
}
function Fn(e) {
  const t = J(Re, null);
  return m(t, y), t.teardown = e, t;
}
function Mn(e) {
  return J(we | Xt, e);
}
function Pn(e) {
  re.ensure();
  const t = J(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function In(e) {
  return J(qe | _e, e);
}
function jn(e, t = 0) {
  return J(Re | t, e);
}
function Nt(e, t = [], n = [], r = []) {
  En(r, t, n, (i) => {
    J(Re, () => e(...i.map(P)));
  });
}
function Ln(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | _e, e);
}
function Ct(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ae, r = v;
    tt(!0), O(null);
    try {
      t.call(null);
    } finally {
      tt(n), O(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function qn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Yn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, We), Ke(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ct(e), e.f ^= We, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Ot(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Yn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Ot(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Dt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var u of r)
      u.out(o);
  } else
    i();
}
function Dt(e, t, n) {
  if ((e.f & H) === 0) {
    e.f ^= H;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      Dt(i, t, o ? n : !1), i = s;
    }
  }
}
function zn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Te = !1, ae = !1;
function tt(e) {
  ae = e;
}
let v = null, M = !1;
function O(e) {
  v = e;
}
let p = null;
function q(e) {
  p = e;
}
let C = null;
function $n(e) {
  v !== null && (C === null ? C = [e] : C.push(e));
}
let T = null, A = 0, R = null;
function Un(e) {
  R = e;
}
let Ft = 1, X = 0, ee = X;
function nt(e) {
  ee = e;
}
function Mt() {
  return ++Ft;
}
function ye(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && mt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, y);
  }
  return !1;
}
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(C !== null && ue.call(C, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Pt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, L), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function It(e) {
  var t = T, n = A, r = R, i = v, s = C, o = k, u = M, f = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, v = (l & (W | te)) === 0 ? e : null, C = null, oe(e.ctx), M = !1, ee = ++X, e.ac !== null && (Rt(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= Me;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var _;
      if (d || me(e, A), c !== null && A > 0)
        for (c.length = A + T.length, _ = 0; _ < T.length; _++)
          c[A + _] = T[_];
      else
        e.deps = c = T;
      if (He() && (e.f & N) !== 0)
        for (_ = A; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !d && c !== null && A < c.length && (me(e, A), c.length = A);
    if (ot() && R !== null && !M && c !== null && (e.f & (b | L | S)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      R.length; _++)
        Pt(
          R[_],
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
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (g) {
    return ct(g);
  } finally {
    e.f ^= Me, T = t, A = n, R = r, v = i, C = s, oe(o), M = u, ee = f;
  }
}
function Vn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), $e(s), Rn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & I) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | ft)) !== 0 ? qn(e) : Ke(e), Ct(e);
      var i = It(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ft;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function P(e) {
  var t = e.f, n = (t & b) !== 0;
  if (v !== null && !M) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (C === null || !ue.call(C, e))) {
      var i = v.deps;
      if ((v.f & Me) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
      }
    }
  }
  if (ae && G.has(e))
    return G.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ae) {
      var u = o.v;
      return ((o.f & y) === 0 && o.reactions !== null || Lt(o)) && (u = Ve(o)), G.set(o, u), u;
    }
    var f = (o.f & N) === 0 && !M && v !== null && (Te || (v.f & N) !== 0), l = (o.f & he) === 0;
    ye(o) && (f && (o.f |= N), mt(o)), f && !l && (yt(o), jt(o));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function jt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & N) === 0 && (yt(
        /** @type {Derived} */
        t
      ), jt(
        /** @type {Derived} */
        t
      ));
}
function Lt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & b) !== 0 && Lt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Bn(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function qt(e, t) {
  Hn("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function Gn(e) {
  return Kn.includes(e);
}
const ve = Symbol("events"), Yt = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Wn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Zn(e) {
  for (var t = 0; t < e.length; t++)
    Yt.add(e[t]);
  for (var n of Le)
    n(e);
}
let it = null;
function st(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  it = e;
  var o = 0, u = it === e && e[ve];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (o = f);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    Ht(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = v, h = p;
    O(null), q(null);
    try {
      for (var c, d = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? d.push(x) : c = x;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        s = _;
      }
      if (c) {
        for (let x of d)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[ve] = t, delete e.currentTarget, O(a), q(h);
    }
  }
}
const Jn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Qn(e) {
  return (
    /** @type {string} */
    Jn?.createHTML(e) ?? e
  );
}
function Xn(e) {
  var t = On("template");
  return t.innerHTML = Qn(e.replaceAll("<!>", "<!---->")), t.content;
}
function er(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function zt(e, t) {
  var n = (t & un) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Xn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return er(s, s), s;
  };
}
function $t(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function tr(e, t) {
  return nr(e, t);
}
const be = /* @__PURE__ */ new Map();
function nr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: u }) {
  Cn();
  var f = void 0, l = Pn(() => {
    var a = n ?? t.appendChild(St());
    yn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (d) => {
        Ye({});
        var _ = (
          /** @type {ComponentContext} */
          k
        );
        s && (_.c = s), i && (r.$$events = i), f = e(d, r) || {}, ze();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var g = d[_];
        if (!h.has(g)) {
          h.add(g);
          var x = Gn(g);
          for (const Ce of [t, document]) {
            var D = be.get(Ce);
            D === void 0 && (D = /* @__PURE__ */ new Map(), be.set(Ce, D));
            var ie = D.get(g);
            ie === void 0 ? (Ce.addEventListener(g, st, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(Bt(Yt)), Le.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            _.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, st), _.delete(d), _.size === 0 && be.delete(x)) : _.set(d, g);
        }
      Le.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return rr.set(f, l), f;
}
let rr = /* @__PURE__ */ new WeakMap();
var ir = /* @__PURE__ */ zt("<div> </div>");
function sr(e, t) {
  Ye(t, !0);
  const n = cn("theme");
  var r = ir(), i = je(r);
  Nt(() => qt(i, `Child sees: ${n.value ?? ""}`)), $t(e, r), ze();
}
var lr = /* @__PURE__ */ zt("<div><!> <button>Toggle Theme</button> <div> </div></div>");
function fr(e, t) {
  Ye(t, !0);
  let n = /* @__PURE__ */ Y("light");
  hn("theme", {
    get value() {
      return P(n);
    }
  });
  function r() {
    V(n, P(n) === "light" ? "dark" : "light", !0);
  }
  var i = lr(), s = je(i);
  sr(s, {});
  var o = et(s, 2), u = et(o, 2), f = je(u);
  Nt(() => qt(f, `Root: ${P(n) ?? ""}`)), Wn("click", o, r), $t(e, i), ze();
}
Zn(["click"]);
function or(e) {
  return tr(fr, { target: e });
}
export {
  or as default,
  or as rvst_mount
};

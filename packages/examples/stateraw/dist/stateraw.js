var jt = Array.isArray, qt = Array.prototype.indexOf, ue = Array.prototype.includes, Yt = Array.from, zt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Ut = Object.prototype, Vt = Array.prototype, $t = Object.getPrototypeOf, Ke = Object.isExtensible;
const Bt = () => {
};
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, we = 4, Re = 8, ft = 1 << 24, Z = 16, W = 32, te = 64, Pe = 128, N = 512, b = 1024, k = 2048, q = 4096, H = 8192, L = 16384, he = 32768, Ge = 1 << 25, ke = 65536, We = 1 << 17, Kt = 1 << 18, _e = 1 << 19, Gt = 1 << 20, ne = 65536, Ie = 1 << 21, Ye = 1 << 22, K = 1 << 23, De = Symbol("$state"), U = new class extends Error {
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
const tn = 2, E = Symbol(), nn = "http://www.w3.org/1999/xhtml";
function rn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let P = null;
function ae(e) {
  P = e;
}
function sn(e, t = !1, n) {
  P = {
    p: P,
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
function ln(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Rn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function at() {
  return !0;
}
let se = [];
function fn() {
  var e = se;
  se = [], Ht(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && fn();
    });
  }
  se.push(e);
}
function ot(e) {
  var t = p;
  if (t === null)
    return v.f |= K, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
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
const un = -7169;
function m(e, t) {
  e.f = e.f & un | t;
}
function ze(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, b) : m(e, q);
}
function ct(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ct(
        /** @type {Derived} */
        t.deps
      ));
}
function ht(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), ct(e.deps), m(e, b);
}
const $ = /* @__PURE__ */ new Set();
let w = null, C = null, Le = null, Fe = !1, le = null, Ee = null;
var Ze = 0;
let an = 1;
class re {
  id = an++;
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, q), this.schedule(r);
    }
  }
  #h() {
    if (Ze++ > 1e3 && ($.delete(this), on()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), m(u, k), this.schedule(u);
      for (const u of this.#n)
        m(u, q), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Ee = [];
    for (const u of t)
      try {
        this.#a(u, n, r);
      } catch (f) {
        throw pt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (le = null, Ee = null, this.#c() || this.#d()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        vt(u, f);
    } else {
      this.#r.size === 0 && $.delete(this), this.#t.clear(), this.#n.clear();
      for (const u of this.#l) u(this);
      this.#l.clear(), Je(r), Je(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const u = a ??= this;
      u.#e.push(...this.#e.filter((f) => !u.#e.includes(f)));
    }
    a !== null && ($.add(a), a.#h()), $.has(this) || this.#w();
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
      var s = i.f, a = (s & (W | te)) !== 0, u = a && (s & b) !== 0, f = u || (s & H) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      ht(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#h();
    } finally {
      Ze = 0, Le = null, le = null, Ee = null, Fe = !1, w = null, C = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), $.delete(this);
  }
  #w() {
    for (const l of $) {
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
        for (var u of n)
          _t(u, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#a(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of $)
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
    this.#_.add(t);
  }
  settled() {
    return (this.#i ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Fe || ($.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      C = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Le = t, t.b?.is_pending && (t.f & (we | Re | ft)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & y) === 0))
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
function on() {
  try {
    Zt();
  } catch (e) {
    B(e, Le);
  }
}
let z = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | H)) === 0 && be(r) && (z = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), z?.size > 0)) {
        G.clear();
        for (const i of z) {
          if ((i.f & (L | H)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            z.has(a) && (z.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (L | H)) === 0 && ce(f);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function _t(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? _t(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & k) === 0 && dt(i, t, r) && (m(i, k), Ue(
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
      if (ue.call(t, i))
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
function Ue(e) {
  w.schedule(e);
}
function vt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      vt(n, t), n = n.next;
  }
}
function pt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    pt(t), t = t.next;
}
function cn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Be() && (R(n), Dn(() => (t === 0 && (r = Yn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var hn = ke | _e;
function _n(e, t, n, r) {
  new dn(e, t, n, r);
}
class dn {
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
  #v = cn(() => (this.#a = Ne(this.#o), () => {
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Cn(() => {
      this.#m();
    }, hn);
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
      var n = this.#s = document.createDocumentFragment(), r = kt();
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ht(t, this.#d, this.#h);
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
    var n = p, r = v, i = P;
    Y(this.#i), D(this.#i), ae(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ot(s), null;
    } finally {
      Y(n), D(r), ae(i);
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
    return this.#v(), R(
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
        rn();
        return;
      }
      i = !0, s && en(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
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
              () => f,
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
function vn(e, t, n, r) {
  const i = gn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = pn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (d) {
      (a.f & L) === 0 && B(d, a);
    }
    Se();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = gt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ wn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Se();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), D(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  Y(null), D(null), ae(null), e && w?.deactivate();
}
function gt() {
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
function gn(e) {
  var t = y | k, n = v !== null && (v.f & y) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: P,
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
function wn(e, t, n) {
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
  ), a = !v, u = /* @__PURE__ */ new Map();
  return On(() => {
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
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & he) !== 0)
        var h = gt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(U), u.delete(o);
      else {
        for (const d of u.values())
          d.reject(U);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (d, _ = void 0) => {
      if (h) {
        var g = _ === U;
        h(g);
      }
      if (!(_ === U || (f.f & L) !== 0)) {
        if (o.activate(), _)
          s.f |= K, Ae(s, _);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ae(s, d);
          for (const [x, F] of u) {
            if (u.delete(x), x === o) break;
            F.reject(U);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), An(() => {
    for (const f of u.values())
      f.reject(U);
  }), new Promise((f) => {
    function l(o) {
      function h() {
        o === i ? f(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function mn(e) {
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
function bn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = p;
  Y(bn(e));
  try {
    e.f &= ~ne, mn(e), t = Mt(e);
  } finally {
    Y(n);
  }
  return t;
}
function wt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  oe || (C !== null ? (Be() || w?.is_fork) && C.set(e, n) : ze(e));
}
function yn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Bt, t.ac = null, me(t, 0), He(t));
}
function mt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let je = /* @__PURE__ */ new Set();
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
function I(e, t) {
  const n = Ne(e);
  return Ln(n), n;
}
function V(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (v.f & We) !== 0) && at() && (v.f & (y | Z | Ye | We)) !== 0 && (O === null || !ue.call(O, e)) && Xt();
  let r = n ? de(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), C === null && ze(s);
    }
    e.wv = Ft(), yt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (W | te)) === 0 && (A === null ? jn([e]) : A.push(e)), !i.is_fork && je.size > 0 && !bt && En();
  }
  return t;
}
function En() {
  bt = !1;
  for (const e of je)
    (e.f & b) !== 0 && m(e, q), be(e) && ce(e);
  je.clear();
}
function xn(e, t = 1) {
  var n = R(e), r = t === 1 ? n++ : n--;
  return V(e, n), r;
}
function ge(e) {
  V(e, e.v + 1);
}
function yt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && m(a, t), (u & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        C?.delete(l), (u & ne) === 0 && (u & N && (a.f |= ne), yt(l, q, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Z) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = $t(e);
  if (t !== Ut && t !== Vt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = jt(e), i = /* @__PURE__ */ I(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var f = v, l = ee;
    D(null), et(s);
    var o = u();
    return D(f), et(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Jt();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ I(l.value);
          return n.set(f, h), h;
        }) : V(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ I(E));
            n.set(f, o), ge(i);
          }
        } else
          V(l, E), ge(i);
        return !0;
      },
      get(u, f, l) {
        if (f === De)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || pe(u, f)?.writable) && (o = a(() => {
          var d = de(h ? u[f] : E), _ = /* @__PURE__ */ I(d);
          return _;
        }), n.set(f, o)), o !== void 0) {
          var c = R(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = R(o));
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
        if (f === De)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || pe(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? de(u[f]) : E, d = /* @__PURE__ */ I(c);
            return d;
          }), n.set(f, l));
          var h = R(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, f, l, o) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var d = l; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var _ = n.get(d + "");
            _ !== void 0 ? V(_, E) : d in u && (_ = a(() => /* @__PURE__ */ I(E)), n.set(d + "", _));
          }
        if (h === void 0)
          (!c || pe(u, f)?.writable) && (h = a(() => /* @__PURE__ */ I(void 0)), V(h, de(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => de(l));
          V(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= F.v && V(F, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(u) {
        R(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        Qt();
      }
    }
  );
}
var Qe, Et, xt, Tt;
function Tn() {
  if (Qe === void 0) {
    Qe = window, Et = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    xt = pe(t, "firstChild").get, Tt = pe(t, "nextSibling").get, Ke(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ke(n) && (n.__t = void 0);
  }
}
function kt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function St(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $e(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ St(e);
}
function Me(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r);
  return r;
}
function kn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(nn, e, void 0)
  );
}
function At(e) {
  var t = v, n = p;
  D(null), Y(null);
  try {
    return e();
  } finally {
    D(t), Y(n);
  }
}
function Sn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & H) !== 0 && (e |= H);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | k | N,
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
    (i.f & _e) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Sn(i, n), v !== null && (v.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Be() {
  return v !== null && !M;
}
function An(e) {
  const t = J(Re, null);
  return m(t, b), t.teardown = e, t;
}
function Rn(e) {
  return J(we | Gt, e);
}
function Nn(e) {
  re.ensure();
  const t = J(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function On(e) {
  return J(Ye | _e, e);
}
function Dn(e, t = 0) {
  return J(Re | t, e);
}
function Fn(e, t = [], n = [], r = []) {
  vn(r, t, n, (i) => {
    J(Re, () => e(...i.map(R)));
  });
}
function Cn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | _e, e);
}
function Rt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    Xe(!0), D(null);
    try {
      t.call(null);
    } finally {
      Xe(n), D(r);
    }
  }
}
function He(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && At(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Mn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Pn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ge), He(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Rt(e), e.f ^= Ge, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Pn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $e(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Ot(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Ot(e, t, n) {
  if ((e.f & H) === 0) {
    e.f ^= H;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      Ot(i, t, a ? n : !1), i = s;
    }
  }
}
function In(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ $e(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function Xe(e) {
  oe = e;
}
let v = null, M = !1;
function D(e) {
  v = e;
}
let p = null;
function Y(e) {
  p = e;
}
let O = null;
function Ln(e) {
  v !== null && (O === null ? O = [e] : O.push(e));
}
let T = null, S = 0, A = null;
function jn(e) {
  A = e;
}
let Dt = 1, X = 0, ee = X;
function et(e) {
  ee = e;
}
function Ft() {
  return ++Dt;
}
function be(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~ne), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
        /** @type {Derived} */
        s
      ) && wt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, b);
  }
  return !1;
}
function Ct(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ue.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Ct(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, q), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Mt(e) {
  var t = T, n = S, r = A, i = v, s = O, a = P, u = M, f = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, v = (l & (W | te)) === 0 ? e : null, O = null, ae(e.ctx), M = !1, ee = ++X, e.ac !== null && (At(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Ie;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var _;
      if (d || me(e, S), c !== null && S > 0)
        for (c.length = S + T.length, _ = 0; _ < T.length; _++)
          c[S + _] = T[_];
      else
        e.deps = c = T;
      if (Be() && (e.f & N) !== 0)
        for (_ = S; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !d && c !== null && S < c.length && (me(e, S), c.length = S);
    if (at() && A !== null && !M && c !== null && (e.f & (y | q | k)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      A.length; _++)
        Ct(
          A[_],
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
    return ot(g);
  } finally {
    e.f ^= Ie, T = t, S = n, A = r, v = i, O = s, ae(a), M = u, ee = f;
  }
}
function qn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = qt.call(n, e);
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
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), ze(s), yn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | ft)) !== 0 ? Mn(e) : He(e), Rt(e);
      var i = Mt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Dt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function R(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !M) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (O === null || !ue.call(O, e))) {
      var i = v.deps;
      if ((v.f & Ie) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
      }
    }
  }
  if (oe && G.has(e))
    return G.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var u = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || It(a)) && (u = Ve(a)), G.set(a, u), u;
    }
    var f = (a.f & N) === 0 && !M && v !== null && (Te || (v.f & N) !== 0), l = (a.f & he) === 0;
    be(a) && (f && (a.f |= N), wt(a)), f && !l && (mt(a), Pt(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Pt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (mt(
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
    if (G.has(t) || (t.f & y) !== 0 && It(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Yn(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const tt = globalThis.Deno?.core?.ops ?? null;
function zn(e, ...t) {
  tt?.[e] ? tt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nt(e, t) {
  zn("op_set_text", e, t);
}
const Un = ["touchstart", "touchmove"];
function Vn(e) {
  return Un.includes(e);
}
const ve = Symbol("events"), Lt = /* @__PURE__ */ new Set(), qe = /* @__PURE__ */ new Set();
function rt(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function $n(e) {
  for (var t = 0; t < e.length; t++)
    Lt.add(e[t]);
  for (var n of qe)
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
  var a = 0, u = it === e && e[ve];
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
    f <= l && (a = f);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    zt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    D(null), Y(null);
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
      e[ve] = t, delete e.currentTarget, D(o), Y(h);
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
function Hn(e) {
  return (
    /** @type {string} */
    Bn?.createHTML(e) ?? e
  );
}
function Kn(e) {
  var t = kn("template");
  return t.innerHTML = Hn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Gn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t) {
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Kn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ St(r));
    var s = (
      /** @type {TemplateNode} */
      n || Et ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Gn(s, s), s;
  };
}
function Zn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Jn(e, t) {
  return Qn(e, t);
}
const ye = /* @__PURE__ */ new Map();
function Qn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  Tn();
  var f = void 0, l = Nn(() => {
    var o = n ?? t.appendChild(kt());
    _n(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        sn({});
        var _ = (
          /** @type {ComponentContext} */
          P
        );
        s && (_.c = s), i && (r.$$events = i), f = e(d, r) || {}, ln();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var g = d[_];
        if (!h.has(g)) {
          h.add(g);
          var x = Vn(g);
          for (const Oe of [t, document]) {
            var F = ye.get(Oe);
            F === void 0 && (F = /* @__PURE__ */ new Map(), ye.set(Oe, F));
            var ie = F.get(g);
            ie === void 0 ? (Oe.addEventListener(g, st, { passive: x }), F.set(g, 1)) : F.set(g, ie + 1);
          }
        }
      }
    };
    return c(Yt(Lt)), qe.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            ye.get(x)
          ), g = (
            /** @type {number} */
            _.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, st), _.delete(d), _.size === 0 && ye.delete(x)) : _.set(d, g);
        }
      qe.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Xn.set(f, l), f;
}
let Xn = /* @__PURE__ */ new WeakMap();
var er = /* @__PURE__ */ Wn("<div><div> </div> <div> </div> <button>Increment</button> <button>Reset Log</button></div>");
function tr(e) {
  let t = /* @__PURE__ */ I(0), n = /* @__PURE__ */ I([]);
  function r() {
    xn(t), R(n).push(R(t));
  }
  function i() {
    V(n, []);
  }
  var s = er(), a = Ce(s), u = Ce(a), f = Me(a, 2), l = Ce(f), o = Me(f, 2), h = Me(o, 2);
  Fn(() => {
    nt(u, `Count: ${R(t) ?? ""}`), nt(l, `LogLen: ${R(n).length ?? ""}`);
  }), rt("click", o, r), rt("click", h, i), Zn(e, s);
}
$n(["click"]);
function rr(e) {
  return Jn(tr, { target: e });
}
export {
  rr as default,
  rr as rvst_mount
};

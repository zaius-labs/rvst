var Lt = Array.isArray, qt = Array.prototype.indexOf, ae = Array.prototype.includes, Yt = Array.from, zt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, $t = Object.prototype, Bt = Array.prototype, Ut = Object.getPrototypeOf, We = Object.isExtensible;
const Vt = () => {
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
const y = 2, me = 4, De = 8, ft = 1 << 24, G = 16, K = 32, te = 64, je = 128, R = 512, b = 1024, k = 2048, j = 4096, U = 8192, P = 16384, de = 32768, Ze = 1 << 25, Ae = 65536, Je = 1 << 17, Kt = 1 << 18, _e = 1 << 19, Gt = 1 << 20, ne = 65536, Le = 1 << 21, $e = 1 << 22, V = 1 << 23, Me = Symbol("$state"), Y = new class extends Error {
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
let C = null;
function oe(e) {
  C = e;
}
function sn(e, t = !1, n) {
  C = {
    p: C,
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
    C
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      An(r);
  }
  return t.i = !0, C = t.p, /** @type {T} */
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
function ue(e) {
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
    return v.f |= V, e;
  if ((t.f & de) === 0 && (t.f & me) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0) {
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
const un = -7169;
function m(e, t) {
  e.f = e.f & un | t;
}
function Be(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, b) : m(e, j);
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
  (e.f & k) !== 0 ? t.add(e) : (e.f & j) !== 0 && n.add(e), ct(e.deps), m(e, b);
}
const z = /* @__PURE__ */ new Set();
let w = null, F = null, qe = null, Ce = !1, le = null, Te = null;
var Qe = 0;
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
  #_() {
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
        m(r, j), this.schedule(r);
    }
  }
  #h() {
    if (Qe++ > 1e3 && (z.delete(this), on()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), m(u, k), this.schedule(u);
      for (const u of this.#n)
        m(u, j), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Te = [];
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
    if (le = null, Te = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        vt(u, f);
    } else {
      this.#r.size === 0 && z.delete(this), this.#t.clear(), this.#n.clear();
      for (const u of this.#l) u(this);
      this.#l.clear(), Xe(r), Xe(n), this.#i?.resolve();
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
    a !== null && (z.add(a), a.#h()), z.has(this) || this.#w();
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
      var s = i.f, a = (s & (K | te)) !== 0, u = a && (s & b) !== 0, f = u || (s & U) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= b : (s & me) !== 0 ? n.push(i) : ye(i) && ((s & G) !== 0 && this.#n.add(i), he(i));
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & V) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#h();
    } finally {
      Qe = 0, qe = null, le = null, Te = null, Ce = !1, w = null, F = null, H.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), z.delete(this);
  }
  #w() {
    for (const l of z) {
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
          dt(u, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#a(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of z)
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
    return (this.#i ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Ce || (z.add(w), ue(() => {
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
    if (qe = t, t.b?.is_pending && (t.f & (me | De | ft)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & y) === 0))
        return;
      if ((r & (te | K)) !== 0) {
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
    B(e, qe);
  }
}
let q = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (P | U)) === 0 && ye(r) && (q = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), q?.size > 0)) {
        H.clear();
        for (const i of q) {
          if ((i.f & (P | U)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            q.has(a) && (q.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (P | U)) === 0 && he(f);
          }
        }
        q.clear();
      }
    }
    q = null;
  }
}
function dt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? dt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & ($e | G)) !== 0 && (s & k) === 0 && _t(i, t, r) && (m(i, k), Ue(
        /** @type {Effect} */
        i
      ));
    }
}
function _t(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && _t(
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
  if (!((e.f & K) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & j) !== 0 && t.m.push(e), m(e, b);
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
  let t = 0, n = Oe(0), r;
  return () => {
    Ke() && (X(n), Dn(() => (t === 0 && (r = qn(() => e(() => we(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var hn = Ae | _e;
function dn(e, t, n, r) {
  new _n(e, t, n, r);
}
class _n {
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
  #_ = /* @__PURE__ */ new Set();
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
  #v = cn(() => (this.#a = Oe(this.#o), () => {
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
      a.b = this, a.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Fn(() => {
      this.#m();
    }, hn);
  }
  #w() {
    try {
      this.#e = Z(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = Z(() => {
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
    t && (this.is_pending = !0, this.#t = Z(() => t(this.#l)), ue(() => {
      var n = this.#s = document.createDocumentFragment(), r = kt();
      n.append(r), this.#e = this.#g(() => Z(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, ke(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Z(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Pn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Z(() => n(this.#l));
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ht(t, this.#_, this.#h);
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
    var n = p, r = v, i = C;
    L(this.#i), D(this.#i), oe(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ot(s), null;
    } finally {
      L(n), D(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && ke(this.#t, () => {
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
      this.#c = !1, this.#a && Ne(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#v(), X(
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
        rn();
        return;
      }
      i = !0, s && en(), this.#n !== null && ke(this.#n, () => {
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
          return Z(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= je, r(
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
    ue(() => {
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
    } catch (_) {
      (a.f & P) === 0 && B(_, a);
    }
    Re();
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
    u(), h(), Re();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = C, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    L(e), D(t), oe(n), s && (e.f & P) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  L(null), D(null), oe(null), e && w?.deactivate();
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
    ctx: C,
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
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !v, u = /* @__PURE__ */ new Map();
  return Nn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Re);
    } catch (_) {
      l.reject(_), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & de) !== 0)
        var h = gt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(Y), u.delete(o);
      else {
        for (const _ of u.values())
          _.reject(Y);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var g = d === Y;
        h(g);
      }
      if (!(d === Y || (f.f & P) !== 0)) {
        if (o.activate(), d)
          s.f |= V, Ne(s, d);
        else {
          (s.f & V) !== 0 && (s.f ^= V), Ne(s, _);
          for (const [x, O] of u) {
            if (u.delete(x), x === o) break;
            O.reject(Y);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Sn(() => {
    for (const f of u.values())
      f.reject(Y);
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
      I(
        /** @type {Effect} */
        t[n]
      );
  }
}
function bn(e) {
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
function Ve(e) {
  var t, n = p;
  L(bn(e));
  try {
    e.f &= ~ne, mn(e), t = Ct(e);
  } finally {
    L(n);
  }
  return t;
}
function wt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (F !== null ? (Ke() || w?.is_fork) && F.set(e, n) : Be(e));
}
function yn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Y), t.teardown = Vt, t.ac = null, be(t, 0), Ge(t));
}
function mt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Ye = /* @__PURE__ */ new Set();
const H = /* @__PURE__ */ new Map();
let bt = !1;
function Oe(e, t) {
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
function $(e, t) {
  const n = Oe(e);
  return In(n), n;
}
function J(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (v.f & Je) !== 0) && at() && (v.f & (y | G | $e | Je)) !== 0 && (N === null || !ae.call(N, e)) && Xt();
  let r = n ? fe(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? H.set(e, t) : H.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), F === null && Be(s);
    }
    e.wv = Ft(), yt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (K | te)) === 0 && (A === null ? jn([e]) : A.push(e)), !i.is_fork && Ye.size > 0 && !bt && En();
  }
  return t;
}
function En() {
  bt = !1;
  for (const e of Ye)
    (e.f & b) !== 0 && m(e, j), ye(e) && he(e);
  Ye.clear();
}
function we(e) {
  J(e, e.v + 1);
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
        F?.delete(l), (u & ne) === 0 && (u & R && (a.f |= ne), yt(l, j, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & G) !== 0 && q !== null && q.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function fe(e) {
  if (typeof e != "object" || e === null || Me in e)
    return e;
  const t = Ut(e);
  if (t !== $t && t !== Bt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Lt(e), i = /* @__PURE__ */ $(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var f = v, l = ee;
    D(null), nt(s);
    var o = u();
    return D(f), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ $(
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
          var h = /* @__PURE__ */ $(l.value);
          return n.set(f, h), h;
        }) : J(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ $(E));
            n.set(f, o), we(i);
          }
        } else
          J(l, E), we(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Me)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || ge(u, f)?.writable) && (o = a(() => {
          var _ = fe(h ? u[f] : E), d = /* @__PURE__ */ $(_);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = X(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = X(o));
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
        if (f === Me)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || ge(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? fe(u[f]) : E, _ = /* @__PURE__ */ $(c);
            return _;
          }), n.set(f, l));
          var h = X(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, f, l, o) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var d = n.get(_ + "");
            d !== void 0 ? J(d, E) : _ in u && (d = a(() => /* @__PURE__ */ $(E)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || ge(u, f)?.writable) && (h = a(() => /* @__PURE__ */ $(void 0)), J(h, fe(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => fe(l));
          J(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= O.v && J(O, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(u) {
        X(i);
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
var et, Et, xt, Tt;
function xn() {
  if (et === void 0) {
    et = window, Et = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    xt = ge(t, "firstChild").get, Tt = ge(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
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
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
function Ee(e, t) {
  return /* @__PURE__ */ St(e);
}
function ve(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function Tn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(nn, e, void 0)
  );
}
function At(e) {
  var t = v, n = p;
  D(null), L(null);
  try {
    return e();
  } finally {
    D(t), L(n);
  }
}
function kn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function W(e, t) {
  var n = p;
  n !== null && (n.f & U) !== 0 && (e |= U);
  var r = {
    ctx: C,
    deps: null,
    nodes: null,
    f: e | k | R,
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
    (i.f & _e) === 0 && (i = i.first, (e & G) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && kn(i, n), v !== null && (v.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return v !== null && !M;
}
function Sn(e) {
  const t = W(De, null);
  return m(t, b), t.teardown = e, t;
}
function An(e) {
  return W(me | Gt, e);
}
function Rn(e) {
  re.ensure();
  const t = W(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ke(t, () => {
      I(t), r(void 0);
    }) : (I(t), r(void 0));
  });
}
function Nn(e) {
  return W($e | _e, e);
}
function Dn(e, t = 0) {
  return W(De | t, e);
}
function On(e, t = [], n = [], r = []) {
  vn(r, t, n, (i) => {
    W(De, () => e(...i.map(X)));
  });
}
function Fn(e, t = 0) {
  var n = W(G | t, e);
  return n;
}
function Z(e) {
  return W(K | _e, e);
}
function Rt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = v;
    tt(!0), D(null);
    try {
      t.call(null);
    } finally {
      tt(n), D(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && At(() => {
      i.abort(Y);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : I(n, t), n = r;
  }
}
function Mn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & K) === 0 && I(t), t = n;
  }
}
function I(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Cn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), Ge(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Rt(e), e.f ^= Ze, e.f |= P;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Cn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ke(e, t, n = !0) {
  var r = [];
  Dt(e, r, !0);
  var i = () => {
    n && I(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Dt(e, t, n) {
  if ((e.f & U) === 0) {
    e.f ^= U;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & K) !== 0 && (e.f & G) !== 0;
      Dt(i, t, a ? n : !1), i = s;
    }
  }
}
function Pn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let Se = !1, ce = !1;
function tt(e) {
  ce = e;
}
let v = null, M = !1;
function D(e) {
  v = e;
}
let p = null;
function L(e) {
  p = e;
}
let N = null;
function In(e) {
  v !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function jn(e) {
  A = e;
}
let Ot = 1, Q = 0, ee = Q;
function nt(e) {
  ee = e;
}
function Ft() {
  return ++Ot;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~ne), (t & j) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && wt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, b);
  }
  return !1;
}
function Mt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ae.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Mt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, j), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Ct(e) {
  var t = T, n = S, r = A, i = v, s = N, a = C, u = M, f = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, v = (l & (K | te)) === 0 ? e : null, N = null, oe(e.ctx), M = !1, ee = ++Q, e.ac !== null && (At(() => {
    e.ac.abort(Y);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var d;
      if (_ || be(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ke() && (e.f & R) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (be(e, S), c.length = S);
    if (at() && A !== null && !M && c !== null && (e.f & (y | j | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Mt(
          A[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (Q++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = Q;
      if (t !== null)
        for (const g of t)
          g.rv = Q;
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & V) !== 0 && (e.f ^= V), h;
  } catch (g) {
    return ot(g);
  } finally {
    e.f ^= Le, T = t, S = n, A = r, v = i, N = s, oe(a), M = u, ee = f;
  }
}
function Ln(e, t) {
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
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), Be(s), yn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ln(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & P) === 0) {
    m(e, b);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (G | ft)) !== 0 ? Mn(e) : Ge(e), Rt(e);
      var i = Ct(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ot;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function X(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !M) {
    var r = p !== null && (p.f & P) !== 0;
    if (!r && (N === null || !ae.call(N, e))) {
      var i = v.deps;
      if ((v.f & Le) !== 0)
        e.rv < Q && (e.rv = Q, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ae.call(s, v) || s.push(v);
      }
    }
  }
  if (ce && H.has(e))
    return H.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var u = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || It(a)) && (u = Ve(a)), H.set(a, u), u;
    }
    var f = (a.f & R) === 0 && !M && v !== null && (Se || (v.f & R) !== 0), l = (a.f & de) === 0;
    ye(a) && (f && (a.f |= R), wt(a)), f && !l && (mt(a), Pt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & V) !== 0)
    throw e.v;
  return e.v;
}
function Pt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & R) === 0 && (mt(
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
    if (H.has(t) || (t.f & y) !== 0 && It(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qn(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Yn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Pe(e, t) {
  Yn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function $n(e) {
  return zn.includes(e);
}
const pe = Symbol("events"), jt = /* @__PURE__ */ new Set(), ze = /* @__PURE__ */ new Set();
function Ie(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Bn(e) {
  for (var t = 0; t < e.length; t++)
    jt.add(e[t]);
  for (var n of ze)
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
  var a = 0, u = it === e && e[pe];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
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
    D(null), L(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? _.push(x) : c = x;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let x of _)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, D(o), L(h);
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
function Hn(e) {
  var t = Tn("template");
  return t.innerHTML = Vn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Kn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Hn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ St(r));
    var s = (
      /** @type {TemplateNode} */
      n || Et ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Kn(s, s), s;
  };
}
function Wn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Zn(e, t) {
  return Jn(e, t);
}
const xe = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  xn();
  var f = void 0, l = Rn(() => {
    var o = n ?? t.appendChild(kt());
    dn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        sn({});
        var d = (
          /** @type {ComponentContext} */
          C
        );
        s && (d.c = s), i && (r.$$events = i), f = e(_, r) || {}, ln();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var g = _[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const Fe of [t, document]) {
            var O = xe.get(Fe);
            O === void 0 && (O = /* @__PURE__ */ new Map(), xe.set(Fe, O));
            var ie = O.get(g);
            ie === void 0 ? (Fe.addEventListener(g, st, { passive: x }), O.set(g, 1)) : O.set(g, ie + 1);
          }
        }
      }
    };
    return c(Yt(jt)), ze.add(c), () => {
      for (var _ of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            d.get(_)
          );
          --g == 0 ? (x.removeEventListener(_, st), d.delete(_), d.size === 0 && xe.delete(x)) : d.set(_, g);
        }
      ze.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(f, l), f;
}
let Qn = /* @__PURE__ */ new WeakMap();
var Xn = /* @__PURE__ */ Gn("<div><div> </div> <div> </div> <div> </div> <button>Increment</button> <button>Rename</button> <button>Add Tag</button></div>");
function er(e) {
  let t = fe({ name: "Alice", score: 0, tags: [] });
  function n() {
    t.score++;
  }
  function r() {
    t.name = "Bob";
  }
  function i() {
    t.tags.push("new");
  }
  var s = Xn(), a = Ee(s), u = Ee(a), f = ve(a, 2), l = Ee(f), o = ve(f, 2), h = Ee(o), c = ve(o, 2), _ = ve(c, 2), d = ve(_, 2);
  On(() => {
    Pe(u, `Name: ${t.name ?? ""}`), Pe(l, `Score: ${t.score ?? ""}`), Pe(h, `Tags: ${t.tags.length ?? ""}`);
  }), Ie("click", c, n), Ie("click", _, r), Ie("click", d, i), Wn(e, s);
}
Bn(["click"]);
function nr(e) {
  return Zn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

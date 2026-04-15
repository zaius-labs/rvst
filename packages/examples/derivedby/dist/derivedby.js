var Yt = Array.isArray, zt = Array.prototype.indexOf, ae = Array.prototype.includes, Bt = Array.from, Ut = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Vt = Object.prototype, $t = Array.prototype, Ht = Object.getPrototypeOf, Ke = Object.isExtensible;
const Kt = () => {
};
function Gt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, we = 4, Re = 8, ft = 1 << 24, W = 16, G = 32, te = 64, Pe = 128, R = 512, b = 1024, k = 2048, j = 4096, $ = 8192, P = 16384, de = 32768, Ge = 1 << 25, ke = 65536, We = 1 << 17, Wt = 1 << 18, ve = 1 << 19, Zt = 1 << 20, ne = 65536, Ie = 1 << 21, Ye = 1 << 22, H = 1 << 23, Oe = Symbol("$state"), Y = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Jt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Qt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Xt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function en() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function nn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const rn = 2, E = Symbol(), sn = "http://www.w3.org/1999/xhtml";
function ln() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let C = null;
function oe(e) {
  C = e;
}
function fn(e, t = !1, n) {
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
function un(e) {
  var t = (
    /** @type {ComponentContext} */
    C
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Nn(r);
  }
  return t.i = !0, C = t.p, /** @type {T} */
  {};
}
function at() {
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
function ot(e) {
  var t = p;
  if (t === null)
    return _.f |= H, e;
  if ((t.f & de) === 0 && (t.f & we) === 0)
    throw e;
  V(e, t);
}
function V(e, t) {
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
const B = /* @__PURE__ */ new Set();
let w = null, F = null, je = null, Fe = !1, le = null, Ee = null;
var Ze = 0;
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, j), this.schedule(r);
    }
  }
  #h() {
    if (Ze++ > 1e3 && (B.delete(this), hn()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), m(u, k), this.schedule(u);
      for (const u of this.#n)
        m(u, j), this.schedule(u);
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
    if (le = null, Ee = null, this.#c() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [u, f] of this.#s)
        _t(u, f);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
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
    a !== null && (B.add(a), a.#h()), B.has(this) || this.#w();
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
      var s = i.f, a = (s & (G | te)) !== 0, u = a && (s & b) !== 0, f = u || (s & $) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= b : (s & we) !== 0 ? n.push(i) : be(i) && ((s & W) !== 0 && this.#n.add(i), he(i));
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & H) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
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
      Ze = 0, je = null, le = null, Ee = null, Fe = !1, w = null, F = null, K.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), B.delete(this);
  }
  #w() {
    for (const l of B) {
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
    for (const l of B)
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
      Fe || (B.add(w), ue(() => {
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
    if (je = t, t.b?.is_pending && (t.f & (we | Re | ft)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (te | G)) !== 0) {
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
    Qt();
  } catch (e) {
    V(e, je);
  }
}
let q = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (P | $)) === 0 && be(r) && (q = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), q?.size > 0)) {
        K.clear();
        for (const i of q) {
          if ((i.f & (P | $)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            q.has(a) && (q.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (P | $)) === 0 && he(f);
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
      ) : (s & (Ye | W)) !== 0 && (s & k) === 0 && vt(i, t, r) && (m(i, k), Be(
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
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && vt(
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
function Be(e) {
  w.schedule(e);
}
function _t(e, t) {
  if (!((e.f & G) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & j) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      _t(n, t), n = n.next;
  }
}
function pt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    pt(t), t = t.next;
}
function dn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    $e() && (z(n), Fn(() => (t === 0 && (r = Yn(() => e(() => ge(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Cn(() => {
      this.#m();
    }, vn);
  }
  #w() {
    try {
      this.#e = J(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = J(() => {
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
    t && (this.is_pending = !0, this.#t = J(() => t(this.#l)), ue(() => {
      var n = this.#s = document.createDocumentFragment(), r = St();
      n.append(r), this.#e = this.#g(() => J(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, xe(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = J(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        jn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = J(() => n(this.#l));
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
    ht(t, this.#v, this.#h);
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
    var n = p, r = _, i = C;
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ue(() => {
      this.#c = !1, this.#a && Ae(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), z(
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
      i = !0, s && nn(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
      } catch (l) {
        V(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return J(() => {
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
          return V(
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
        V(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => V(l, this.#i && this.#i.parent)
      ) : u(f);
    });
  }
}
function gn(e, t, n, r) {
  const i = wt;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = wn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (v) {
      (a.f & P) === 0 && V(v, a);
    }
    Se();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = gt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ mn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => V(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Se();
  }) : h();
}
function wn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = C, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    L(e), D(t), oe(n), s && (e.f & P) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
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
function wt(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
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
function mn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Jt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !_, u = /* @__PURE__ */ new Map();
  return On(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (v) {
      l.reject(v), Se();
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
        for (const v of u.values())
          v.reject(Y);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === Y;
        h(g);
      }
      if (!(d === Y || (f.f & P) !== 0)) {
        if (o.activate(), d)
          s.f |= H, Ae(s, d);
        else {
          (s.f & H) !== 0 && (s.f ^= H), Ae(s, v);
          for (const [x, O] of u) {
            if (u.delete(x), x === o) break;
            O.reject(Y);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Rn(() => {
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
// @__NO_SIDE_EFFECTS__
function bn(e) {
  const t = /* @__PURE__ */ wt(e);
  return Ft(t), t;
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
function Ue(e) {
  var t, n = p;
  L(En(e));
  try {
    e.f &= ~ne, yn(e), t = It(e);
  } finally {
    L(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Ct(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (F !== null ? ($e() || w?.is_fork) && F.set(e, n) : ze(e));
}
function xn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Y), t.teardown = Kt, t.ac = null, me(t, 0), He(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Le = /* @__PURE__ */ new Set();
const K = /* @__PURE__ */ new Map();
let yt = !1;
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
function U(e, t) {
  const n = Ne(e);
  return Ft(n), n;
}
function Q(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (_.f & We) !== 0) && at() && (_.f & (y | W | Ye | We)) !== 0 && (N === null || !ae.call(N, e)) && tn();
  let r = n ? fe(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? K.set(e, t) : K.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ue(s), F === null && ze(s);
    }
    e.wv = Ct(), Et(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (G | te)) === 0 && (A === null ? Ln([e]) : A.push(e)), !i.is_fork && Le.size > 0 && !yt && Tn();
  }
  return t;
}
function Tn() {
  yt = !1;
  for (const e of Le)
    (e.f & b) !== 0 && m(e, j), be(e) && he(e);
  Le.clear();
}
function ge(e) {
  Q(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && m(a, t), (u & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        F?.delete(l), (u & ne) === 0 && (u & R && (a.f |= ne), Et(l, j, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & W) !== 0 && q !== null && q.add(o), n !== null ? n.push(o) : Be(o);
      }
    }
}
function fe(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Ht(e);
  if (t !== Vt && t !== $t)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yt(e), i = /* @__PURE__ */ U(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var f = _, l = ee;
    D(null), et(s);
    var o = u();
    return D(f), et(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ U(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Xt();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ U(l.value);
          return n.set(f, h), h;
        }) : Q(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ U(E));
            n.set(f, o), ge(i);
          }
        } else
          Q(l, E), ge(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Oe)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || pe(u, f)?.writable) && (o = a(() => {
          var v = fe(h ? u[f] : E), d = /* @__PURE__ */ U(v);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = z(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = z(o));
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
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || pe(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? fe(u[f]) : E, v = /* @__PURE__ */ U(c);
            return v;
          }), n.set(f, l));
          var h = z(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, f, l, o) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? Q(d, E) : v in u && (d = a(() => /* @__PURE__ */ U(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || pe(u, f)?.writable) && (h = a(() => /* @__PURE__ */ U(void 0)), Q(h, fe(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => fe(l));
          Q(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= O.v && Q(O, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(u) {
        z(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        en();
      }
    }
  );
}
var Qe, xt, Tt, kt;
function kn() {
  if (Qe === void 0) {
    Qe = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = pe(t, "firstChild").get, kt = pe(t, "nextSibling").get, Ke(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ke(n) && (n.__t = void 0);
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
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
function Me(e, t) {
  return /* @__PURE__ */ At(e);
}
function Ce(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Sn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(sn, e, void 0)
  );
}
function Rt(e) {
  var t = _, n = p;
  D(null), L(null);
  try {
    return e();
  } finally {
    D(t), L(n);
  }
}
function An(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & $) !== 0 && (e |= $);
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
  if ((e & we) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw I(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & W) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
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
function $e() {
  return _ !== null && !M;
}
function Rn(e) {
  const t = Z(Re, null);
  return m(t, b), t.teardown = e, t;
}
function Nn(e) {
  return Z(we | Zt, e);
}
function Dn(e) {
  re.ensure();
  const t = Z(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      I(t), r(void 0);
    }) : (I(t), r(void 0));
  });
}
function On(e) {
  return Z(Ye | ve, e);
}
function Fn(e, t = 0) {
  return Z(Re | t, e);
}
function Mn(e, t = [], n = [], r = []) {
  gn(r, t, n, (i) => {
    Z(Re, () => e(...i.map(z)));
  });
}
function Cn(e, t = 0) {
  var n = Z(W | t, e);
  return n;
}
function J(e) {
  return Z(G | ve, e);
}
function Nt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
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
    i !== null && Rt(() => {
      i.abort(Y);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : I(n, t), n = r;
  }
}
function Pn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && I(t), t = n;
  }
}
function I(e, t = !0) {
  var n = !1;
  (t || (e.f & Wt) !== 0) && e.nodes !== null && e.nodes.end !== null && (In(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ge), He(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Nt(e), e.f ^= Ge, e.f |= P;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function In(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Dt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Ot(e, r, !0);
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
function Ot(e, t, n) {
  if ((e.f & $) === 0) {
    e.f ^= $;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & W) !== 0;
      Ot(i, t, a ? n : !1), i = s;
    }
  }
}
function jn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let Te = !1, ce = !1;
function Xe(e) {
  ce = e;
}
let _ = null, M = !1;
function D(e) {
  _ = e;
}
let p = null;
function L(e) {
  p = e;
}
let N = null;
function Ft(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function Ln(e) {
  A = e;
}
let Mt = 1, X = 0, ee = X;
function et(e) {
  ee = e;
}
function Ct() {
  return ++Mt;
}
function be(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~ne), (t & j) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
        /** @type {Derived} */
        s
      ) && mt(
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
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ae.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Pt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, j), Be(
        /** @type {Effect} */
        s
      ));
    }
}
function It(e) {
  var t = T, n = S, r = A, i = _, s = N, a = C, u = M, f = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, _ = (l & (G | te)) === 0 ? e : null, N = null, oe(e.ctx), M = !1, ee = ++X, e.ac !== null && (Rt(() => {
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
      if (v || me(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if ($e() && (e.f & R) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (me(e, S), c.length = S);
    if (at() && A !== null && !M && c !== null && (e.f & (y | j | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Pt(
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
    return (e.f & H) !== 0 && (e.f ^= H), h;
  } catch (g) {
    return ot(g);
  } finally {
    e.f ^= Ie, T = t, S = n, A = r, _ = i, N = s, oe(a), M = u, ee = f;
  }
}
function qn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = zt.call(n, e);
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
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), ze(s), xn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & P) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (W | ft)) !== 0 ? Pn(e) : He(e), Nt(e);
      var i = It(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function z(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !M) {
    var r = p !== null && (p.f & P) !== 0;
    if (!r && (N === null || !ae.call(N, e))) {
      var i = _.deps;
      if ((_.f & Ie) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && K.has(e))
    return K.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var u = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Lt(a)) && (u = Ue(a)), K.set(a, u), u;
    }
    var f = (a.f & R) === 0 && !M && _ !== null && (Te || (_.f & R) !== 0), l = (a.f & de) === 0;
    be(a) && (f && (a.f |= R), mt(a)), f && !l && (bt(a), jt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & H) !== 0)
    throw e.v;
  return e.v;
}
function jt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & R) === 0 && (bt(
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
    if (K.has(t) || (t.f & y) !== 0 && Lt(
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
const Bn = ["touchstart", "touchmove"];
function Un(e) {
  return Bn.includes(e);
}
const _e = Symbol("events"), qt = /* @__PURE__ */ new Set(), qe = /* @__PURE__ */ new Set();
function rt(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function Vn(e) {
  for (var t = 0; t < e.length; t++)
    qt.add(e[t]);
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
  var a = 0, u = it === e && e[_e];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[_e] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (a = f);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Ut(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    D(null), L(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[_e]?.[r];
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
      e[_e] = t, delete e.currentTarget, D(o), L(h);
    }
  }
}
const $n = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Hn(e) {
  return (
    /** @type {string} */
    $n?.createHTML(e) ?? e
  );
}
function Kn(e) {
  var t = Sn("template");
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
  var n = (t & rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Kn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
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
  kn();
  var f = void 0, l = Dn(() => {
    var o = n ?? t.appendChild(St());
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
          C
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, un();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Un(g);
          for (const De of [t, document]) {
            var O = ye.get(De);
            O === void 0 && (O = /* @__PURE__ */ new Map(), ye.set(De, O));
            var ie = O.get(g);
            ie === void 0 ? (De.addEventListener(g, st, { passive: x }), O.set(g, 1)) : O.set(g, ie + 1);
          }
        }
      }
    };
    return c(Bt(qt)), qe.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            ye.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, st), d.delete(v), d.size === 0 && ye.delete(x)) : d.set(v, g);
        }
      qe.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Xn.set(f, l), f;
}
let Xn = /* @__PURE__ */ new WeakMap();
var er = /* @__PURE__ */ Wn("<div><div> </div> <div> </div> <button>Add</button> <button>Remove</button></div>");
function tr(e) {
  let t = fe([1, 2, 3, 4, 5]);
  const n = /* @__PURE__ */ bn(() => {
    const c = t.reduce((d, g) => d + g, 0), v = t.length > 0 ? c / t.length : 0;
    return { sum: c, avg: v };
  });
  function r() {
    t.push(t.length + 1);
  }
  function i() {
    t.length > 0 && t.pop();
  }
  var s = er(), a = Me(s), u = Me(a), f = Ce(a, 2), l = Me(f), o = Ce(f, 2), h = Ce(o, 2);
  Mn(() => {
    nt(u, `Sum: ${z(n).sum ?? ""}`), nt(l, `Avg: ${z(n).avg ?? ""}`);
  }), rt("click", o, r), rt("click", h, i), Zn(e, s);
}
Vn(["click"]);
function rr(e) {
  return Jn(tr, { target: e });
}
export {
  rr as default,
  rr as rvst_mount
};

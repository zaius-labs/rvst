var Ut = Array.isArray, Vt = Array.prototype.indexOf, ue = Array.prototype.includes, Ht = Array.from, Kt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Gt = Object.prototype, Wt = Array.prototype, Zt = Object.getPrototypeOf, Ze = Object.isExtensible;
const Jt = () => {
};
function Qt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, ye = 4, Me = 8, at = 1 << 24, Q = 16, V = 32, ne = 64, je = 128, N = 512, b = 1024, k = 2048, $ = 4096, I = 8192, j = 16384, de = 32768, Je = 1 << 25, ae = 65536, Qe = 1 << 17, Xt = 1 << 18, ve = 1 << 19, en = 1 << 20, re = 65536, $e = 1 << 21, ze = 1 << 22, W = 1 << 23, Pe = Symbol("$state"), z = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
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
const un = 2, E = Symbol(), an = "http://www.w3.org/1999/xhtml";
function on() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let P = null;
function oe(e) {
  P = e;
}
function cn(e, t = !1, n) {
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
function hn(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Pn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let se = [];
function dn() {
  var e = se;
  se = [], Qt(e);
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
function ht(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & de) === 0 && (t.f & ye) === 0)
    throw e;
  G(e, t);
}
function G(e, t) {
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
const vn = -7169;
function m(e, t) {
  e.f = e.f & vn | t;
}
function Ue(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, b) : m(e, $);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), dt(e.deps), m(e, b);
}
const H = /* @__PURE__ */ new Set();
let w = null, F = null, Le = null, Ie = !1, le = null, Te = null;
var Xe = 0;
let _n = 1;
class J {
  id = _n++;
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
  #u = /* @__PURE__ */ new Set();
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
  #i = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #n = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
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
  #f = /* @__PURE__ */ new Map();
  is_fork = !1;
  #c = !1;
  /** @type {Set<Batch>} */
  #a = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#a)
      for (const i of r.#r.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#f.has(n)) {
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
    this.#f.has(t) || this.#f.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#f.get(t);
    if (n) {
      this.#f.delete(t);
      for (var r of n.d)
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, $), this.schedule(r);
    }
  }
  #d() {
    if (Xe++ > 1e3 && (H.delete(this), pn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), m(l, k), this.schedule(l);
      for (const l of this.#l)
        m(l, $), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = Te = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (f) {
        throw wt(l), f;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (le = null, Te = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, f] of this.#f)
        gt(l, f);
    } else {
      this.#e.size === 0 && H.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), et(r), et(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = a ??= this;
      l.#n.push(...this.#n.filter((f) => !l.#n.includes(f)));
    }
    a !== null && (H.add(a), a.#d()), H.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (V | ne)) !== 0, l = a && (s & b) !== 0, f = l || (s & I) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= b : (s & ye) !== 0 ? n.push(i) : xe(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
      vt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Ie = !0, w = this, this.#d();
    } finally {
      Xe = 0, Le = null, le = null, Te = null, Ie = !1, w = null, F = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), H.delete(this);
  }
  #w() {
    for (const u of H) {
      var t = u.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (u.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(o)[0]
          );
          if (t && h !== r)
            u.current.set(o, [h, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...u.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && u.discard();
      else if (n.length > 0) {
        u.activate();
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var l of n)
          _t(l, i, s, a);
        if (u.#n.length > 0) {
          u.apply();
          for (var f of u.#n)
            u.#o(f, [], []);
          u.#n = [];
        }
        u.deactivate();
      }
    }
    for (const u of H)
      u.#a.has(this) && (u.#a.delete(this), u.#a.size === 0 && !u.#h() && (u.activate(), u.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#e.get(n) ?? 0;
    if (this.#e.set(n, r + 1), t) {
      let i = this.#r.get(n) ?? 0;
      this.#r.set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let i = this.#e.get(n) ?? 0;
    if (i === 1 ? this.#e.delete(n) : this.#e.set(n, i - 1), t) {
      let s = this.#r.get(n) ?? 0;
      s === 1 ? this.#r.delete(n) : this.#r.set(n, s - 1);
    }
    this.#c || r || (this.#c = !0, fe(() => {
      this.#c = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#s.add(r);
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
    this.#u.add(t);
  }
  settled() {
    return (this.#i ??= ut()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Ie || (H.add(w), fe(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (ye | Me | at)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (ne | V)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function pn() {
  try {
    nn();
  } catch (e) {
    G(e, Le);
  }
}
let B = null;
function et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | I)) === 0 && xe(r) && (B = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ct(r), B?.size > 0)) {
        Z.clear();
        for (const i of B) {
          if ((i.f & (j | I)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            B.has(a) && (B.delete(a), s.push(a)), a = a.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (j | I)) === 0 && he(f);
          }
        }
        B.clear();
      }
    }
    B = null;
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
      ) : (s & (ze | Q)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function pt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && pt(
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
function gt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function gn(e) {
  let t = 0, n = Ce(0), r;
  return () => {
    Ge() && (U(n), $n(() => (t === 0 && (r = Vn(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var wn = ae | ve;
function mn(e, t, n, r) {
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
  #t;
  /** @type {TemplateNode | null} */
  #u = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #c = 0;
  #a = 0;
  #h = !1;
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
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
  #_ = gn(() => (this.#o = Ce(this.#c), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#r = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Dt(() => {
      this.#m();
    }, wn);
  }
  #w() {
    try {
      this.#n = Y(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = Y(() => {
      n(
        this.#t,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#s = Y(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = De();
      n.append(r), this.#n = this.#g(() => Y(() => this.#r(r))), this.#a === 0 && (this.#t.before(n), this.#f = null, be(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#n = Y(() => {
        this.#r(this.#t);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        Pt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = Y(() => n(this.#t));
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
    this.is_pending = !1, t.transfer_effects(this.#v, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vt(t, this.#v, this.#d);
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
    var n = p, r = _, i = P;
    L(this.#i), M(this.#i), oe(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      L(n), M(r), oe(i);
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
    this.#a += t, this.#a === 0 && (this.#p(n), this.#s && be(this.#s, () => {
      this.#s = null;
    }), this.#f && (this.#t.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#o && Ne(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), U(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#e.onerror;
    let r = this.#e.failed;
    if (!n && !r)
      throw t;
    this.#n && (A(this.#n), this.#n = null), this.#s && (A(this.#s), this.#s = null), this.#l && (A(this.#l), this.#l = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        on();
        return;
      }
      i = !0, s && fn(), this.#l !== null && be(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
      } catch (u) {
        G(u, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return Y(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= je, r(
              this.#t,
              () => f,
              () => a
            );
          });
        } catch (u) {
          return G(
            u,
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
      } catch (u) {
        G(u, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        l,
        /** @param {unknown} e */
        (u) => G(u, this.#i && this.#i.parent)
      ) : l(f);
    });
  }
}
function yn(e, t, n, r) {
  const i = xn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), l = En(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (a.f & j) === 0 && G(v, a);
    }
    Re();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var o = mt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ kn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => G(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    l(), h(), Re();
  }) : h();
}
function En() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    L(e), M(t), oe(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  L(null), M(null), oe(null), e && w?.deactivate();
}
function mt() {
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
function xn(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
    deps: null,
    effects: null,
    equals: ot,
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
  ), s = Ce(
    /** @type {V} */
    E
  ), a = !_, l = /* @__PURE__ */ new Map();
  return jn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), u = ut();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Re);
    } catch (v) {
      u.reject(v), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & de) !== 0)
        var h = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(z), l.delete(o);
      else {
        for (const v of l.values())
          v.reject(z);
        l.clear();
      }
      l.set(o, u);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === z;
        h(g);
      }
      if (!(d === z || (f.f & j) !== 0)) {
        if (o.activate(), d)
          s.f |= W, Ne(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ne(s, v);
          for (const [x, C] of l) {
            if (l.delete(x), x === o) break;
            C.reject(z);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (v) => c(null, v || "unknown"));
  }), On(() => {
    for (const f of l.values())
      f.reject(z);
  }), new Promise((f) => {
    function u(o) {
      function h() {
        o === i ? f(s) : u(i);
      }
      o.then(h, h);
    }
    u(i);
  });
}
function Tn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      A(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Sn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function He(e) {
  var t, n = p;
  L(Sn(e));
  try {
    e.f &= ~re, Tn(e), t = Lt(e);
  } finally {
    L(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = jt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (F !== null ? (Ge() || w?.is_fork) && F.set(e, n) : Ue(e));
}
function An(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = Jt, t.ac = null, Ee(t, 0), We(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let qe = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let Et = !1;
function Ce(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ot,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  const n = Ce(e);
  return Yn(n), n;
}
function K(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!O || (_.f & Qe) !== 0) && ct() && (_.f & (y | Q | ze | Qe)) !== 0 && (D === null || !ue.call(D, e)) && ln();
  let r = n ? _e(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(s), F === null && Ue(s);
    }
    e.wv = jt(), xt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (V | ne)) === 0 && (R === null ? zn([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !Et && Rn();
  }
  return t;
}
function Rn() {
  Et = !1;
  for (const e of qe)
    (e.f & b) !== 0 && m(e, $), xe(e) && he(e);
  qe.clear();
}
function Nn(e, t = 1) {
  var n = U(e), r = t === 1 ? n++ : n--;
  return K(e, n), r;
}
function we(e) {
  K(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], l = a.f, f = (l & k) === 0;
      if (f && m(a, t), (l & y) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        F?.delete(u), (l & re) === 0 && (l & N && (a.f |= re), xt(u, $, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (l & Q) !== 0 && B !== null && B.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = Zt(e);
  if (t !== Gt && t !== Wt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ut(e), i = /* @__PURE__ */ q(0), s = te, a = (l) => {
    if (te === s)
      return l();
    var f = _, u = te;
    M(null), rt(s);
    var o = l();
    return M(f), rt(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && rn();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ q(u.value);
          return n.set(f, h), h;
        }) : K(o, u.value, !0), !0;
      },
      deleteProperty(l, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in l) {
            const o = a(() => /* @__PURE__ */ q(E));
            n.set(f, o), we(i);
          }
        } else
          K(u, E), we(i);
        return !0;
      },
      get(l, f, u) {
        if (f === Pe)
          return e;
        var o = n.get(f), h = f in l;
        if (o === void 0 && (!h || ge(l, f)?.writable) && (o = a(() => {
          var v = _e(h ? l[f] : E), d = /* @__PURE__ */ q(v);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = U(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, f, u);
      },
      getOwnPropertyDescriptor(l, f) {
        var u = Reflect.getOwnPropertyDescriptor(l, f);
        if (u && "value" in u) {
          var o = n.get(f);
          o && (u.value = U(o));
        } else if (u === void 0) {
          var h = n.get(f), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return u;
      },
      has(l, f) {
        if (f === Pe)
          return !0;
        var u = n.get(f), o = u !== void 0 && u.v !== E || Reflect.has(l, f);
        if (u !== void 0 || p !== null && (!o || ge(l, f)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? _e(l[f]) : E, v = /* @__PURE__ */ q(c);
            return v;
          }), n.set(f, u));
          var h = U(u);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(l, f, u, o) {
        var h = n.get(f), c = f in l;
        if (r && f === "length")
          for (var v = u; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? K(d, E) : v in l && (d = a(() => /* @__PURE__ */ q(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(l, f)?.writable) && (h = a(() => /* @__PURE__ */ q(void 0)), K(h, _e(u)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(u));
          K(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(l, f);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof f == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= C.v && K(C, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(l) {
        U(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in l) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        sn();
      }
    }
  );
}
var tt, kt, Tt, St;
function Dn() {
  if (tt === void 0) {
    tt = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = ge(t, "firstChild").get, St = ge(t, "nextSibling").get, Ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ze(n) && (n.__t = void 0);
  }
}
function De(e = "") {
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
function Ke(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function me(e, t) {
  return /* @__PURE__ */ At(e);
}
function Be(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ke(r);
  return r;
}
function Mn() {
  return !1;
}
function Cn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(an, e, void 0)
  );
}
function Rt(e) {
  var t = _, n = p;
  M(null), L(null);
  try {
    return e();
  } finally {
    M(t), L(n);
  }
}
function Fn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & I) !== 0 && (e |= I);
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
  if ((e & ye) !== 0)
    le !== null ? le.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw A(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & ae) !== 0 && i !== null && (i.f |= ae));
  }
  if (i !== null && (i.parent = n, n !== null && Fn(i, n), _ !== null && (_.f & y) !== 0 && (e & ne) === 0)) {
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
function On(e) {
  const t = X(Me, null);
  return m(t, b), t.teardown = e, t;
}
function Pn(e) {
  return X(ye | en, e);
}
function In(e) {
  J.ensure();
  const t = X(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function jn(e) {
  return X(ze | ve, e);
}
function $n(e, t = 0) {
  return X(Me | t, e);
}
function Nt(e, t = [], n = [], r = []) {
  yn(r, t, n, (i) => {
    X(Me, () => e(...i.map(U)));
  });
}
function Dt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function Y(e) {
  return X(V | ve, e);
}
function Mt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    nt(!0), M(null);
    try {
      t.call(null);
    } finally {
      nt(n), M(r);
    }
  }
}
function We(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Ln(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & Xt) !== 0) && e.nodes !== null && e.nodes.end !== null && (qn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Je), We(e, t && !n), Ee(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Mt(e), e.f ^= Je, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Ct(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function qn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ke(e);
    e.remove(), e = n;
  }
}
function Ct(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var l of r)
      l.out(a);
  } else
    i();
}
function Ft(e, t, n) {
  if ((e.f & I) === 0) {
    e.f ^= I;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & Q) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function Bn(e) {
  Ot(e, !0);
}
function Ot(e, t) {
  if ((e.f & I) !== 0) {
    e.f ^= I, (e.f & b) === 0 && (m(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ae) !== 0 || (n.f & V) !== 0;
      Ot(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function Pt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ke(n);
      t.append(n), n = i;
    }
}
let Se = !1, ce = !1;
function nt(e) {
  ce = e;
}
let _ = null, O = !1;
function M(e) {
  _ = e;
}
let p = null;
function L(e) {
  p = e;
}
let D = null;
function Yn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, S = 0, R = null;
function zn(e) {
  R = e;
}
let It = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function jt() {
  return ++It;
}
function xe(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & $) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (xe(
        /** @type {Derived} */
        s
      ) && bt(
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
function $t(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ue.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? $t(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, $), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = R, i = _, s = D, a = P, l = O, f = te, u = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, _ = (u & (V | ne)) === 0 ? e : null, D = null, oe(e.ctx), O = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= $e;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || Ee(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ge() && (e.f & N) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (Ee(e, S), c.length = S);
    if (ct() && R !== null && !O && c !== null && (e.f & (y | $ | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        $t(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = ee;
      if (t !== null)
        for (const g of t)
          g.rv = ee;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= $e, T = t, S = n, R = r, _ = i, D = s, oe(a), O = l, te = f;
  }
}
function Un(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vt.call(n, e);
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
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), Ue(s), An(s), Ee(s, 0);
  }
}
function Ee(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Un(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, b);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Q | at)) !== 0 ? Ln(e) : We(e), Mt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = It;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function U(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !O) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (D === null || !ue.call(D, e))) {
      var i = _.deps;
      if ((_.f & $e) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Bt(a)) && (l = He(a)), Z.set(a, l), l;
    }
    var f = (a.f & N) === 0 && !O && _ !== null && (Se || (_.f & N) !== 0), u = (a.f & de) === 0;
    xe(a) && (f && (a.f |= N), bt(a)), f && !u && (yt(a), qt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (yt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Bt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & y) !== 0 && Bt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Vn(e) {
  var t = O;
  try {
    return O = !0, e();
  } finally {
    O = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Yt(e, t) {
  Hn("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function Gn(e) {
  return Kn.includes(e);
}
const pe = Symbol("events"), zt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function Wn(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Zn(e) {
  for (var t = 0; t < e.length; t++)
    zt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let st = null;
function lt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  st = e;
  var a = 0, l = st === e && e[pe];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    f <= u && (a = f);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Kt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    M(null), L(null);
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
      e[pe] = t, delete e.currentTarget, M(o), L(h);
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
  var t = Cn("template");
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
function Fe(e, t) {
  var n = (t & un) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Xn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return er(s, s), s;
  };
}
function Ae(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function tr(e, t) {
  return nr(e, t);
}
const ke = /* @__PURE__ */ new Map();
function nr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: l }) {
  Dn();
  var f = void 0, u = In(() => {
    var o = n ?? t.appendChild(De());
    mn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        cn({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, hn();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Gn(g);
          for (const Oe of [t, document]) {
            var C = ke.get(Oe);
            C === void 0 && (C = /* @__PURE__ */ new Map(), ke.set(Oe, C));
            var ie = C.get(g);
            ie === void 0 ? (Oe.addEventListener(g, lt, { passive: x }), C.set(g, 1)) : C.set(g, ie + 1);
          }
        }
      }
    };
    return c(Ht(zt)), Ye.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            ke.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, lt), d.delete(v), d.size === 0 && ke.delete(x)) : d.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return rr.set(f, u), f;
}
let rr = /* @__PURE__ */ new WeakMap();
class ir {
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
  #u = /* @__PURE__ */ new Map();
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
  #i = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#i = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#u.get(n);
      if (r)
        Bn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, a] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(a);
        l && (A(l.effect), this.#e.delete(a));
      }
      for (const [s, a] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var u = document.createDocumentFragment();
            Pt(a, u), u.append(De()), this.#e.set(s, { effect: a, fragment: u });
          } else
            A(a);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), be(a, l, !1)) : l();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (A(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      w
    ), i = Mn();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = De();
        s.append(a), this.#e.set(t, {
          effect: Y(() => n(a)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          Y(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, f] of this.#u)
        l === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [l, f] of this.#e)
        l === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function sr(e, t, ...n) {
  var r = new ir(e);
  Dt(() => {
    const i = t() ?? null;
    r.ensure(i, i && ((s) => i(s, ...n)));
  }, ae);
}
function lr(e, t, n, r) {
  var i = (
    /** @type {V} */
    r
  ), s = !0, a = () => (s && (s = !1, i = /** @type {V} */
  r), i), l;
  l = /** @type {V} */
  e[t], l === void 0 && r !== void 0 && (l = a());
  var f;
  return f = () => {
    var u = (
      /** @type {V} */
      e[t]
    );
    return u === void 0 ? a() : (s = !0, u);
  }, f;
}
var fr = /* @__PURE__ */ Fe("<div><div> </div> <div><!></div></div>");
function ft(e, t) {
  const n = lr(t, "title", 3, "Box");
  var r = fr(), i = me(r), s = me(i), a = Be(i, 2), l = me(a);
  sr(l, () => t.children), Nt(() => Yt(s, `Title: ${n() ?? ""}`)), Ae(e, r);
}
var ur = /* @__PURE__ */ Fe("<span> </span>"), ar = /* @__PURE__ */ Fe("<span>No title box</span>"), or = /* @__PURE__ */ Fe("<div><!> <!> <button>Increment</button></div>");
function cr(e) {
  let t = /* @__PURE__ */ q(0);
  var n = or(), r = me(n);
  ft(r, {
    title: "Counter",
    children: (a, l) => {
      var f = ur(), u = me(f);
      Nt(() => Yt(u, `Count: ${U(t) ?? ""}`)), Ae(a, f);
    },
    $$slots: { default: !0 }
  });
  var i = Be(r, 2);
  ft(i, {
    children: (a, l) => {
      var f = ar();
      Ae(a, f);
    },
    $$slots: { default: !0 }
  });
  var s = Be(i, 2);
  Wn("click", s, () => Nn(t)), Ae(e, n);
}
Zn(["click"]);
function dr(e) {
  return tr(cr, { target: e });
}
export {
  dr as default,
  dr as rvst_mount
};

var Bt = Array.isArray, Ht = Array.prototype.indexOf, ue = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, we = Object.getOwnPropertyDescriptor, Kt = Object.prototype, Gt = Array.prototype, Wt = Object.getPrototypeOf, Qe = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function at() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, ye = 4, Fe = 8, ut = 1 << 24, X = 16, K = 32, ne = 64, qe = 128, N = 512, y = 1024, k = 2048, q = 4096, j = 8192, L = 16384, ve = 32768, Xe = 1 << 25, oe = 65536, $e = 1 << 17, Qt = 1 << 18, _e = 1 << 19, Xt = 1 << 20, re = 65536, Ye = 1 << 21, Ue = 1 << 22, Z = 1 << 23, Pe = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function $t() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function en() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function sn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const ln = 2, x = Symbol(), fn = "http://www.w3.org/1999/xhtml";
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let I = null;
function ce(e) {
  I = e;
}
function un(e, t = !1, n) {
  I = {
    p: I,
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
function on(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Fn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let se = [];
function cn() {
  var e = se;
  se = [], Jt(e);
}
function ae(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && cn();
    });
  }
  se.push(e);
}
function ht(e) {
  var t = g;
  if (t === null)
    return p.f |= Z, e;
  if ((t.f & ve) === 0 && (t.f & ye) === 0)
    throw e;
  W(e, t);
}
function W(e, t) {
  for (; t !== null; ) {
    if ((t.f & qe) !== 0) {
      if ((t.f & ve) === 0)
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
const hn = -7169;
function m(e, t) {
  e.f = e.f & hn | t;
}
function Ve(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, q);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & re) === 0 || (t.f ^= re, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), dt(e.deps), m(e, y);
}
const G = /* @__PURE__ */ new Set();
let b = null, O = null, ze = null, Ie = !1, le = null, Ae = null;
var et = 0;
let dn = 1;
class Q {
  id = dn++;
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
  #a = /* @__PURE__ */ new Set();
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
  #u = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#u)
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
        m(r, q), this.schedule(r);
    }
  }
  #d() {
    if (et++ > 1e3 && (G.delete(this), vn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), m(l, k), this.schedule(l);
      for (const l of this.#l)
        m(l, q), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = Ae = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (f) {
        throw wt(l), f;
      }
    if (b = null, i.length > 0) {
      var s = Q.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (le = null, Ae = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, f] of this.#f)
        gt(l, f);
    } else {
      this.#e.size === 0 && G.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), tt(r), tt(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#n.length > 0) {
      const l = u ??= this;
      l.#n.push(...this.#n.filter((f) => !l.#n.includes(f)));
    }
    u !== null && (G.add(u), u.#d()), G.has(this) || this.#w();
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
      var s = i.f, u = (s & (K | ne)) !== 0, l = u && (s & y) !== 0, f = l || (s & j) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        u ? i.f ^= y : (s & ye) !== 0 ? n.push(i) : xe(i) && ((s & X) !== 0 && this.#l.add(i), de(i));
        var a = i.first;
        if (a !== null) {
          i = a;
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
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & Z) === 0 && (this.current.set(t, [t.v, r]), O?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, O = null;
  }
  flush() {
    try {
      Ie = !0, b = this, this.#d();
    } finally {
      et = 0, ze = null, le = null, Ae = null, Ie = !1, b = null, O = null, J.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), G.delete(this);
  }
  #w() {
    for (const a of G) {
      var t = a.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (a.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            a.current.get(o)[0]
          );
          if (t && h !== r)
            a.current.set(o, [h, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...a.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && a.discard();
      else if (n.length > 0) {
        a.activate();
        var s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (var l of n)
          _t(l, i, s, u);
        if (a.#n.length > 0) {
          a.apply();
          for (var f of a.#n)
            a.#o(f, [], []);
          a.#n = [];
        }
        a.deactivate();
      }
    }
    for (const a of G)
      a.#u.has(this) && (a.#u.delete(this), a.#u.size === 0 && !a.#h() && (a.activate(), a.#d()));
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
    this.#c || r || (this.#c = !0, ae(() => {
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
    this.#a.add(t);
  }
  settled() {
    return (this.#i ??= at()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new Q();
      Ie || (G.add(b), ae(() => {
        b === t && t.flush();
      }));
    }
    return b;
  }
  apply() {
    {
      O = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (ze = t, t.b?.is_pending && (t.f & (ye | Fe | ut)) !== 0 && (t.f & ve) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === g && (p === null || (p.f & E) === 0))
        return;
      if ((r & (ne | K)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#n.push(n);
  }
}
function vn() {
  try {
    en();
  } catch (e) {
    W(e, ze);
  }
}
let B = null;
function tt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | j)) === 0 && xe(r) && (B = /* @__PURE__ */ new Set(), de(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), B?.size > 0)) {
        J.clear();
        for (const i of B) {
          if ((i.f & (L | j)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            B.has(u) && (B.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (L | j)) === 0 && de(f);
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
      (s & E) !== 0 ? _t(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ue | X)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), Ke(
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
      if ((i.f & E) !== 0 && pt(
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
function Ke(e) {
  b.schedule(e);
}
function gt(e, t) {
  if (!((e.f & K) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function _n(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    Ze() && (P(n), Pn(() => (t === 0 && (r = Hn(() => e(() => be(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, be(n));
      });
    })));
  };
}
var pn = oe | _e;
function gn(e, t, n, r) {
  new wn(e, t, n, r);
}
class wn {
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
  #a = null;
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
  #u = 0;
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
  #_ = _n(() => (this.#o = Oe(this.#c), () => {
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
      var u = (
        /** @type {Effect} */
        g
      );
      u.b = this, u.f |= qe, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Nt(() => {
      this.#b();
    }, pn);
  }
  #w() {
    try {
      this.#n = H(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = H(() => {
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
    t && (this.is_pending = !0, this.#s = H(() => t(this.#t)), ae(() => {
      var n = this.#f = document.createDocumentFragment(), r = Me();
      n.append(r), this.#n = this.#g(() => H(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, me(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.#p(
        /** @type {Batch} */
        b
      ));
    }));
  }
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = H(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ct(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = H(() => n(this.#t));
      } else
        this.#p(
          /** @type {Batch} */
          b
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
    var n = g, r = p, i = I;
    Y(this.#i), M(this.#i), ce(this.#i.ctx);
    try {
      return Q.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      Y(n), M(r), ce(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #m(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#m(t, n);
      return;
    }
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && me(this.#s, () => {
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
    this.#m(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, ae(() => {
      this.#h = !1, this.#o && De(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), P(
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
    const u = () => {
      if (i) {
        an();
        return;
      }
      i = !0, s && sn(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#b();
      });
    }, l = (f) => {
      try {
        s = !0, n?.(f, u), s = !1;
      } catch (a) {
        W(a, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return H(() => {
            var a = (
              /** @type {Effect} */
              g
            );
            a.b = this, a.f |= qe, r(
              this.#t,
              () => f,
              () => u
            );
          });
        } catch (a) {
          return W(
            a,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ae(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (a) {
        W(a, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        l,
        /** @param {unknown} e */
        (a) => W(a, this.#i && this.#i.parent)
      ) : l(f);
    });
  }
}
function bn(e, t, n, r) {
  const i = yn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    g
  ), l = mn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function a(c) {
    l();
    try {
      r(c);
    } catch (_) {
      (u.f & L) === 0 && W(_, u);
    }
    Ne();
  }
  if (n.length === 0) {
    f.then(() => a(t.map(i)));
    return;
  }
  var o = bt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => a([...t.map(i), ...c])).catch((c) => W(c, u)).finally(() => o());
  }
  f ? f.then(() => {
    l(), h(), Ne();
  }) : h();
}
function mn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = I, r = (
    /** @type {Batch} */
    b
  );
  return function(s = !0) {
    Y(e), M(t), ce(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Ne(e = !0) {
  Y(null), M(null), ce(null), e && b?.deactivate();
}
function bt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    b
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function yn(e) {
  var t = E | k, n = p !== null && (p.f & E) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= _e), {
    ctx: I,
    deps: null,
    effects: null,
    equals: ot,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      x
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function En(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && $t();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    x
  ), u = !p, l = /* @__PURE__ */ new Map();
  return Cn(() => {
    var f = (
      /** @type {Effect} */
      g
    ), a = at();
    i = a.promise;
    try {
      Promise.resolve(e()).then(a.resolve, a.reject).finally(Ne);
    } catch (_) {
      a.reject(_), Ne();
    }
    var o = (
      /** @type {Batch} */
      b
    );
    if (u) {
      if ((f.f & ve) !== 0)
        var h = bt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(U), l.delete(o);
      else {
        for (const _ of l.values())
          _.reject(U);
        l.clear();
      }
      l.set(o, a);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var v = d === U;
        h(v);
      }
      if (!(d === U || (f.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= Z, De(s, d);
        else {
          (s.f & Z) !== 0 && (s.f ^= Z), De(s, _);
          for (const [w, F] of l) {
            if (l.delete(w), w === o) break;
            F.reject(U);
          }
        }
        o.deactivate();
      }
    };
    a.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Mn(() => {
    for (const f of l.values())
      f.reject(U);
  }), new Promise((f) => {
    function a(o) {
      function h() {
        o === i ? f(s) : a(i);
      }
      o.then(h, h);
    }
    a(i);
  });
}
function xn(e) {
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
function kn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ge(e) {
  var t, n = g;
  Y(kn(e));
  try {
    e.f &= ~re, xn(e), t = Lt(e);
  } finally {
    Y(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ge(e);
  if (!e.equals(n) && (e.wv = It(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  he || (O !== null ? (Ze() || b?.is_fork) && O.set(e, n) : Ve(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Zt, t.ac = null, Ee(t, 0), Je(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && de(t);
}
let Be = /* @__PURE__ */ new Set();
const J = /* @__PURE__ */ new Map();
let Et = !1;
function Oe(e, t) {
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
function z(e, t) {
  const n = Oe(e);
  return Yn(n), n;
}
function V(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (p.f & $e) !== 0) && ct() && (p.f & (E | X | Ue | $e)) !== 0 && (D === null || !ue.call(D, e)) && rn();
  let r = n ? fe(t) : t;
  return De(e, r, Ae);
}
function De(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    he ? J.set(e, t) : J.set(e, r), e.v = t;
    var i = Q.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ge(s), O === null && Ve(s);
    }
    e.wv = It(), xt(e, k, n), g !== null && (g.f & y) !== 0 && (g.f & (K | ne)) === 0 && (R === null ? zn([e]) : R.push(e)), !i.is_fork && Be.size > 0 && !Et && Sn();
  }
  return t;
}
function Sn() {
  Et = !1;
  for (const e of Be)
    (e.f & y) !== 0 && m(e, q), xe(e) && de(e);
  Be.clear();
}
function be(e) {
  V(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, f = (l & k) === 0;
      if (f && m(u, t), (l & E) !== 0) {
        var a = (
          /** @type {Derived} */
          u
        );
        O?.delete(a), (l & re) === 0 && (l & N && (u.f |= re), xt(a, q, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          u
        );
        (l & X) !== 0 && B !== null && B.add(o), n !== null ? n.push(o) : Ke(o);
      }
    }
}
function fe(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = Wt(e);
  if (t !== Kt && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bt(e), i = /* @__PURE__ */ z(0), s = te, u = (l) => {
    if (te === s)
      return l();
    var f = p, a = te;
    M(null), it(s);
    var o = l();
    return M(f), it(a), o;
  };
  return r && n.set("length", /* @__PURE__ */ z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, a) {
        (!("value" in a) || a.configurable === !1 || a.enumerable === !1 || a.writable === !1) && tn();
        var o = n.get(f);
        return o === void 0 ? u(() => {
          var h = /* @__PURE__ */ z(a.value);
          return n.set(f, h), h;
        }) : V(o, a.value, !0), !0;
      },
      deleteProperty(l, f) {
        var a = n.get(f);
        if (a === void 0) {
          if (f in l) {
            const o = u(() => /* @__PURE__ */ z(x));
            n.set(f, o), be(i);
          }
        } else
          V(a, x), be(i);
        return !0;
      },
      get(l, f, a) {
        if (f === Pe)
          return e;
        var o = n.get(f), h = f in l;
        if (o === void 0 && (!h || we(l, f)?.writable) && (o = u(() => {
          var _ = fe(h ? l[f] : x), d = /* @__PURE__ */ z(_);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = P(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(l, f, a);
      },
      getOwnPropertyDescriptor(l, f) {
        var a = Reflect.getOwnPropertyDescriptor(l, f);
        if (a && "value" in a) {
          var o = n.get(f);
          o && (a.value = P(o));
        } else if (a === void 0) {
          var h = n.get(f), c = h?.v;
          if (h !== void 0 && c !== x)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return a;
      },
      has(l, f) {
        if (f === Pe)
          return !0;
        var a = n.get(f), o = a !== void 0 && a.v !== x || Reflect.has(l, f);
        if (a !== void 0 || g !== null && (!o || we(l, f)?.writable)) {
          a === void 0 && (a = u(() => {
            var c = o ? fe(l[f]) : x, _ = /* @__PURE__ */ z(c);
            return _;
          }), n.set(f, a));
          var h = P(a);
          if (h === x)
            return !1;
        }
        return o;
      },
      set(l, f, a, o) {
        var h = n.get(f), c = f in l;
        if (r && f === "length")
          for (var _ = a; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var d = n.get(_ + "");
            d !== void 0 ? V(d, x) : _ in l && (d = u(() => /* @__PURE__ */ z(x)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || we(l, f)?.writable) && (h = u(() => /* @__PURE__ */ z(void 0)), V(h, fe(a)), n.set(f, h));
        else {
          c = h.v !== x;
          var v = u(() => fe(a));
          V(h, v);
        }
        var w = Reflect.getOwnPropertyDescriptor(l, f);
        if (w?.set && w.set.call(o, a), !c) {
          if (r && typeof f == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= F.v && V(F, ie + 1);
          }
          be(i);
        }
        return !0;
      },
      ownKeys(l) {
        P(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== x;
        });
        for (var [a, o] of n)
          o.v !== x && !(a in l) && f.push(a);
        return f;
      },
      setPrototypeOf() {
        nn();
      }
    }
  );
}
var nt, kt, Tt, St;
function An() {
  if (nt === void 0) {
    nt = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = we(t, "firstChild").get, St = we(t, "nextSibling").get, Qe(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Qe(n) && (n.__t = void 0);
  }
}
function Me(e = "") {
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
function We(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function je(e, t) {
  return /* @__PURE__ */ At(e);
}
function Te(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ We(r);
  return r;
}
function Rn() {
  return !1;
}
function Nn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
function Rt(e) {
  var t = p, n = g;
  M(null), Y(null);
  try {
    return e();
  } finally {
    M(t), Y(n);
  }
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function $(e, t) {
  var n = g;
  n !== null && (n.f & j) !== 0 && (e |= j);
  var r = {
    ctx: I,
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
    le !== null ? le.push(r) : Q.ensure().schedule(r);
  else if (t !== null) {
    try {
      de(r);
    } catch (u) {
      throw A(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & X) !== 0 && (e & oe) !== 0 && i !== null && (i.f |= oe));
  }
  if (i !== null && (i.parent = n, n !== null && Dn(i, n), p !== null && (p.f & E) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      p
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ze() {
  return p !== null && !C;
}
function Mn(e) {
  const t = $(Fe, null);
  return m(t, y), t.teardown = e, t;
}
function Fn(e) {
  return $(ye | Xt, e);
}
function On(e) {
  Q.ensure();
  const t = $(ne | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function Cn(e) {
  return $(Ue | _e, e);
}
function Pn(e, t = 0) {
  return $(Fe | t, e);
}
function In(e, t = [], n = [], r = []) {
  bn(r, t, n, (i) => {
    $(Fe, () => e(...i.map(P)));
  });
}
function Nt(e, t = 0) {
  var n = $(X | t, e);
  return n;
}
function H(e) {
  return $(K | _e, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = he, r = p;
    rt(!0), M(null);
    try {
      t.call(null);
    } finally {
      rt(n), M(r);
    }
  }
}
function Je(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function jn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & K) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ln(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Xe), Je(e, t && !n), Ee(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= Xe, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ln(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ We(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var l of r)
      l.out(u);
  } else
    i();
}
function Ft(e, t, n) {
  if ((e.f & j) === 0) {
    e.f ^= j;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & oe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & K) !== 0 && (e.f & X) !== 0;
      Ft(i, t, u ? n : !1), i = s;
    }
  }
}
function qn(e) {
  Ot(e, !0);
}
function Ot(e, t) {
  if ((e.f & j) !== 0) {
    e.f ^= j, (e.f & y) === 0 && (m(e, k), Q.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & oe) !== 0 || (n.f & K) !== 0;
      Ot(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function Ct(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ We(n);
      t.append(n), n = i;
    }
}
let Re = !1, he = !1;
function rt(e) {
  he = e;
}
let p = null, C = !1;
function M(e) {
  p = e;
}
let g = null;
function Y(e) {
  g = e;
}
let D = null;
function Yn(e) {
  p !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, S = 0, R = null;
function zn(e) {
  R = e;
}
let Pt = 1, ee = 0, te = ee;
function it(e) {
  te = e;
}
function It() {
  return ++Pt;
}
function xe(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & E && (e.f &= ~re), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (xe(
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
    O === null && m(e, y);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ue.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, q), Ke(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = R, i = p, s = D, u = I, l = C, f = te, a = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, p = (a & (K | ne)) === 0 ? e : null, D = null, ce(e.ctx), C = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Ye;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= ve;
    var c = e.deps, _ = b?.is_fork;
    if (T !== null) {
      var d;
      if (_ || Ee(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ze() && (e.f & N) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (Ee(e, S), c.length = S);
    if (ct() && R !== null && !C && c !== null && (e.f & (E | q | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        jt(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let v = 0; v < n; v += 1)
          i.deps[v].rv = ee;
      if (t !== null)
        for (const v of t)
          v.rv = ee;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & Z) !== 0 && (e.f ^= Z), h;
  } catch (v) {
    return ht(v);
  } finally {
    e.f ^= Ye, T = t, S = n, R = r, p = i, D = s, ce(u), C = l, te = f;
  }
}
function Bn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ht.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), Ve(s), Tn(s), Ee(s, 0);
  }
}
function Ee(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bn(e, n[r]);
}
function de(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = g, r = Re;
    g = e, Re = !0;
    try {
      (t & (X | ut)) !== 0 ? jn(e) : Je(e), Dt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Re = r, g = n;
    }
  }
}
function P(e) {
  var t = e.f, n = (t & E) !== 0;
  if (p !== null && !C) {
    var r = g !== null && (g.f & L) !== 0;
    if (!r && (D === null || !ue.call(D, e))) {
      var i = p.deps;
      if ((p.f & Ye) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (p.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [p] : ue.call(s, p) || s.push(p);
      }
    }
  }
  if (he && J.has(e))
    return J.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (he) {
      var l = u.v;
      return ((u.f & y) === 0 && u.reactions !== null || Yt(u)) && (l = Ge(u)), J.set(u, l), l;
    }
    var f = (u.f & N) === 0 && !C && p !== null && (Re || (p.f & N) !== 0), a = (u.f & ve) === 0;
    xe(u) && (f && (u.f |= N), mt(u)), f && !a && (yt(u), qt(u));
  }
  if (O?.has(e))
    return O.get(e);
  if ((e.f & Z) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & N) === 0 && (yt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Yt(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (J.has(t) || (t.f & E) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Hn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const st = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  st?.[e] ? st[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Vn(e, t) {
  Un("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function Gn(e) {
  return Kn.includes(e);
}
const ge = Symbol("events"), zt = /* @__PURE__ */ new Set(), He = /* @__PURE__ */ new Set();
function Le(e, t, n) {
  (t[ge] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    zt.add(e[t]);
  for (var n of He)
    n(e);
}
let lt = null;
function ft(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  lt = e;
  var u = 0, l = lt === e && e[ge];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ge] = t;
      return;
    }
    var a = i.indexOf(t);
    if (a === -1)
      return;
    f <= a && (u = f);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = p, h = g;
    M(null), Y(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var v = s[ge]?.[r];
          v != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && v.call(s, e);
        } catch (w) {
          c ? _.push(w) : c = w;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let w of _)
          queueMicrotask(() => {
            throw w;
          });
        throw c;
      }
    } finally {
      e[ge] = t, delete e.currentTarget, M(o), Y(h);
    }
  }
}
const Zn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Jn(e) {
  return (
    /** @type {string} */
    Zn?.createHTML(e) ?? e
  );
}
function Qn(e) {
  var t = Nn("template");
  return t.innerHTML = Jn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ke(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function pe(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function $n(e, t) {
  return er(e, t);
}
const Se = /* @__PURE__ */ new Map();
function er(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  An();
  var f = void 0, a = On(() => {
    var o = n ?? t.appendChild(Me());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        un({});
        var d = (
          /** @type {ComponentContext} */
          I
        );
        s && (d.c = s), i && (r.$$events = i), f = e(_, r) || {}, on();
      },
      l
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var v = _[d];
        if (!h.has(v)) {
          h.add(v);
          var w = Gn(v);
          for (const Ce of [t, document]) {
            var F = Se.get(Ce);
            F === void 0 && (F = /* @__PURE__ */ new Map(), Se.set(Ce, F));
            var ie = F.get(v);
            ie === void 0 ? (Ce.addEventListener(v, ft, { passive: w }), F.set(v, 1)) : F.set(v, ie + 1);
          }
        }
      }
    };
    return c(Ut(zt)), He.add(c), () => {
      for (var _ of h)
        for (const w of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Se.get(w)
          ), v = (
            /** @type {number} */
            d.get(_)
          );
          --v == 0 ? (w.removeEventListener(_, ft), d.delete(_), d.size === 0 && Se.delete(w)) : d.set(_, v);
        }
      He.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return tr.set(f, a), f;
}
let tr = /* @__PURE__ */ new WeakMap();
class nr {
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
  #a = /* @__PURE__ */ new Map();
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
      ), r = this.#a.get(n);
      if (r)
        qn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(u);
        l && (A(l.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#a) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var a = document.createDocumentFragment();
            Ct(u, a), a.append(Me()), this.#e.set(s, { effect: u, fragment: a });
          } else
            A(u);
          this.#r.delete(s), this.#a.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), me(u, l, !1)) : l();
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
      b
    ), i = Rn();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = Me();
        s.append(u), this.#e.set(t, {
          effect: H(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          H(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, f] of this.#a)
        l === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [l, f] of this.#e)
        l === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function rr(e, t, n = !1) {
  var r = new nr(e), i = n ? oe : 0;
  function s(u, l) {
    r.ensure(u, l);
  }
  Nt(() => {
    var u = !1;
    t((l, f = 0) => {
      u = !0, s(f, l);
    }), u || s(-1, null);
  }, i);
}
var ir = /* @__PURE__ */ ke("<div>Welcome to the home page!</div>"), sr = /* @__PURE__ */ ke("<div>This is the about page.</div>"), lr = /* @__PURE__ */ ke("<div>Settings go here.</div>"), fr = /* @__PURE__ */ ke("<div>404: Page not found</div>"), ar = /* @__PURE__ */ ke('<div><div style="display: flex; gap: 8px;"><button>Home</button> <button>About</button> <button>Settings</button></div> <div> </div> <!></div>');
function ur(e) {
  let t = /* @__PURE__ */ z(fe(globalThis.location?.pathname ?? "/"));
  function n(v) {
    history.pushState(null, "", v), V(t, v, !0);
  }
  typeof globalThis.addEventListener == "function" && globalThis.addEventListener("popstate", () => {
    V(t, globalThis.location.pathname, !0);
  });
  var r = ar(), i = je(r), s = je(i), u = Te(s, 2), l = Te(u, 2), f = Te(i, 2), a = je(f), o = Te(f, 2);
  {
    var h = (v) => {
      var w = ir();
      pe(v, w);
    }, c = (v) => {
      var w = sr();
      pe(v, w);
    }, _ = (v) => {
      var w = lr();
      pe(v, w);
    }, d = (v) => {
      var w = fr();
      pe(v, w);
    };
    rr(o, (v) => {
      P(t) === "/" ? v(h) : P(t) === "/about" ? v(c, 1) : P(t) === "/settings" ? v(_, 2) : v(d, -1);
    });
  }
  In(() => Vn(a, `Path: ${P(t) ?? ""}`)), Le("click", s, () => n("/")), Le("click", u, () => n("/about")), Le("click", l, () => n("/settings")), pe(e, r);
}
Wn(["click"]);
function cr(e) {
  return $n(ur, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

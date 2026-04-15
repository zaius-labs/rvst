var $t = Array.isArray, Ht = Array.prototype.indexOf, ae = Array.prototype.includes, Kt = Array.from, Gt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Wt = Object.prototype, Zt = Array.prototype, Jt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Qt = () => {
};
function Xt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ot() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, me = 4, Me = 8, ct = 1 << 24, Q = 16, H = 32, ne = 64, Ie = 128, D = 512, m = 1024, k = 2048, B = 4096, L = 8192, q = 16384, de = 32768, We = 1 << 25, ue = 65536, Ze = 1 << 17, en = 1 << 18, _e = 1 << 19, tn = 1 << 20, re = 65536, je = 1 << 21, Be = 1 << 22, W = 1 << 23, Ce = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function nn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function rn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ln() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function an() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const un = 2, E = Symbol(), on = "http://www.w3.org/1999/xhtml";
function cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ht(e) {
  return e === this.v;
}
let I = null;
function oe(e) {
  I = e;
}
function hn(e, t = !1, n) {
  I = {
    p: I,
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
function dn(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      jn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function dt() {
  return !0;
}
let se = [];
function _n() {
  var e = se;
  se = [], Xt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && _n();
    });
  }
  se.push(e);
}
function _t(e) {
  var t = p;
  if (t === null)
    return v.f |= W, e;
  if ((t.f & de) === 0 && (t.f & me) === 0)
    throw e;
  G(e, t);
}
function G(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
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
function b(e, t) {
  e.f = e.f & vn | t;
}
function Ye(e) {
  (e.f & D) !== 0 || e.deps === null ? b(e, m) : b(e, B);
}
function vt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, vt(
        /** @type {Derived} */
        t.deps
      ));
}
function pt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), vt(e.deps), b(e, m);
}
const K = /* @__PURE__ */ new Set();
let w = null, C = null, Le = null, Pe = !1, le = null, Se = null;
var Je = 0;
let pn = 1;
class J {
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
  #_() {
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
        b(r, k), this.schedule(r);
      for (r of n.m)
        b(r, B), this.schedule(r);
    }
  }
  #d() {
    if (Je++ > 1e3 && (K.delete(this), gn()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), b(l, k), this.schedule(l);
      for (const l of this.#l)
        b(l, B), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = Se = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (f) {
        throw mt(l), f;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (le = null, Se = null, this.#h() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [l, f] of this.#f)
        bt(l, f);
    } else {
      this.#e.size === 0 && K.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), Qe(r), Qe(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = u ??= this;
      l.#n.push(...this.#n.filter((f) => !l.#n.includes(f)));
    }
    u !== null && (K.add(u), u.#d()), K.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= m;
    for (var i = t.first; i !== null; ) {
      var s = i.f, u = (s & (H | ne)) !== 0, l = u && (s & m) !== 0, f = l || (s & L) !== 0 || this.#f.has(i);
      if (!f && i.fn !== null) {
        u ? i.f ^= m : (s & me) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      pt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Pe = !0, w = this, this.#d();
    } finally {
      Je = 0, Le = null, le = null, Se = null, Pe = !1, w = null, C = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), K.delete(this);
  }
  #w() {
    for (const a of K) {
      var t = a.id < this.id, n = [];
      for (const [o, [d, c]] of this.current) {
        if (a.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            a.current.get(o)[0]
          );
          if (t && d !== r)
            a.current.set(o, [d, c]);
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
          gt(l, i, s, u);
        if (a.#n.length > 0) {
          a.apply();
          for (var f of a.#n)
            a.#o(f, [], []);
          a.#n = [];
        }
        a.deactivate();
      }
    }
    for (const a of K)
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
    this.#a.add(t);
  }
  settled() {
    return (this.#i ??= ot()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Pe || (K.add(w), fe(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (me | Me | ct)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & y) === 0))
        return;
      if ((r & (ne | H)) !== 0) {
        if ((r & m) === 0)
          return;
        n.f ^= m;
      }
    }
    this.#n.push(n);
  }
}
function gn() {
  try {
    rn();
  } catch (e) {
    G(e, Le);
  }
}
let z = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (q | L)) === 0 && Ee(r) && (z = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ot(r), z?.size > 0)) {
        Z.clear();
        for (const i of z) {
          if ((i.f & (q | L)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            z.has(u) && (z.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (q | L)) === 0 && he(f);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function gt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? gt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | Q)) !== 0 && (s & k) === 0 && wt(i, t, r) && (b(i, k), ze(
        /** @type {Effect} */
        i
      ));
    }
}
function wt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && wt(
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
function ze(e) {
  w.schedule(e);
}
function bt(e, t) {
  if (!((e.f & H) !== 0 && (e.f & m) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), b(e, m);
    for (var n = e.first; n !== null; )
      bt(n, t), n = n.next;
  }
}
function mt(e) {
  b(e, m);
  for (var t = e.first; t !== null; )
    mt(t), t = t.next;
}
function wn(e) {
  let t = 0, n = Fe(0), r;
  return () => {
    He() && (N(n), Dt(() => (t === 0 && (r = Ut(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var bn = ue | _e;
function mn(e, t, n, r) {
  new yn(e, t, n, r);
}
class yn {
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
  #_ = /* @__PURE__ */ new Set();
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
  #v = wn(() => (this.#o = Fe(this.#c), () => {
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
        p
      );
      u.b = this, u.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Mt(() => {
      this.#b();
    }, bn);
  }
  #w() {
    try {
      this.#n = U(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = U(() => {
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
    t && (this.is_pending = !0, this.#s = U(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = De();
      n.append(r), this.#n = this.#g(() => U(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, be(
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
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = U(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        It(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = U(() => n(this.#t));
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    pt(t, this.#_, this.#d);
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
    var n = p, r = v, i = I;
    Y(this.#i), F(this.#i), oe(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return _t(s), null;
    } finally {
      Y(n), F(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && be(this.#s, () => {
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
    this.#m(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#o && Ne(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#v(), N(
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
        cn();
        return;
      }
      i = !0, s && an(), this.#l !== null && be(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#b();
      });
    }, l = (f) => {
      try {
        s = !0, n?.(f, u), s = !1;
      } catch (a) {
        G(a, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return U(() => {
            var a = (
              /** @type {Effect} */
              p
            );
            a.b = this, a.f |= Ie, r(
              this.#t,
              () => f,
              () => u
            );
          });
        } catch (a) {
          return G(
            a,
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
      } catch (a) {
        G(a, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        l,
        /** @param {unknown} e */
        (a) => G(a, this.#i && this.#i.parent)
      ) : l(f);
    });
  }
}
function En(e, t, n, r) {
  const i = kn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    p
  ), l = xn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function a(c) {
    l();
    try {
      r(c);
    } catch (_) {
      (u.f & q) === 0 && G(_, u);
    }
    Re();
  }
  if (n.length === 0) {
    f.then(() => a(t.map(i)));
    return;
  }
  var o = yt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ Tn(c))).then((c) => a([...t.map(i), ...c])).catch((c) => G(c, u)).finally(() => o());
  }
  f ? f.then(() => {
    l(), d(), Re();
  }) : d();
}
function xn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), F(t), oe(n), s && (e.f & q) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  Y(null), F(null), oe(null), e && w?.deactivate();
}
function yt() {
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
function kn(e) {
  var t = y | k, n = v !== null && (v.f & y) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: I,
    deps: null,
    effects: null,
    equals: ht,
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
function Tn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && nn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Fe(
    /** @type {V} */
    E
  ), u = !v, l = /* @__PURE__ */ new Map();
  return qn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), a = ot();
    i = a.promise;
    try {
      Promise.resolve(e()).then(a.resolve, a.reject).finally(Re);
    } catch (_) {
      a.reject(_), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (u) {
      if ((f.f & de) !== 0)
        var d = yt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(V), l.delete(o);
      else {
        for (const _ of l.values())
          _.reject(V);
        l.clear();
      }
      l.set(o, a);
    }
    const c = (_, h = void 0) => {
      if (d) {
        var g = h === V;
        d(g);
      }
      if (!(h === V || (f.f & q) !== 0)) {
        if (o.activate(), h)
          s.f |= W, Ne(s, h);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ne(s, _);
          for (const [x, O] of l) {
            if (l.delete(x), x === o) break;
            O.reject(V);
          }
        }
        o.deactivate();
      }
    };
    a.promise.then(c, (_) => c(null, _ || "unknown"));
  }), In(() => {
    for (const f of l.values())
      f.reject(V);
  }), new Promise((f) => {
    function a(o) {
      function d() {
        o === i ? f(s) : a(i);
      }
      o.then(d, d);
    }
    a(i);
  });
}
function Sn(e) {
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
function An(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & q) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ue(e) {
  var t, n = p;
  Y(An(e));
  try {
    e.f &= ~re, Sn(e), t = Bt(e);
  } finally {
    Y(n);
  }
  return t;
}
function Et(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Lt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, m);
    return;
  }
  ce || (C !== null ? (He() || w?.is_fork) && C.set(e, n) : Ye(e));
}
function Rn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Qt, t.ac = null, ye(t, 0), Ke(t));
}
function xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let qe = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let kt = !1;
function Fe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ht,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function j(e, t) {
  const n = Fe(e);
  return Vn(n), n;
}
function $(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (v.f & Ze) !== 0) && dt() && (v.f & (y | Q | Be | Ze)) !== 0 && (M === null || !ae.call(M, e)) && fn();
  let r = n ? pe(t) : t;
  return Ne(e, r, Se);
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
      (e.f & k) !== 0 && Ue(s), C === null && Ye(s);
    }
    e.wv = Lt(), Tt(e, k, n), p !== null && (p.f & m) !== 0 && (p.f & (H | ne)) === 0 && (R === null ? $n([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !kt && Nn();
  }
  return t;
}
function Nn() {
  kt = !1;
  for (const e of qe)
    (e.f & m) !== 0 && b(e, B), Ee(e) && he(e);
  qe.clear();
}
function we(e) {
  $(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, f = (l & k) === 0;
      if (f && b(u, t), (l & y) !== 0) {
        var a = (
          /** @type {Derived} */
          u
        );
        C?.delete(a), (l & re) === 0 && (l & D && (u.f |= re), Tt(a, B, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          u
        );
        (l & Q) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : ze(o);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Jt(e);
  if (t !== Wt && t !== Zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = $t(e), i = /* @__PURE__ */ j(0), s = te, u = (l) => {
    if (te === s)
      return l();
    var f = v, a = te;
    F(null), nt(s);
    var o = l();
    return F(f), nt(a), o;
  };
  return r && n.set("length", /* @__PURE__ */ j(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, f, a) {
        (!("value" in a) || a.configurable === !1 || a.enumerable === !1 || a.writable === !1) && sn();
        var o = n.get(f);
        return o === void 0 ? u(() => {
          var d = /* @__PURE__ */ j(a.value);
          return n.set(f, d), d;
        }) : $(o, a.value, !0), !0;
      },
      deleteProperty(l, f) {
        var a = n.get(f);
        if (a === void 0) {
          if (f in l) {
            const o = u(() => /* @__PURE__ */ j(E));
            n.set(f, o), we(i);
          }
        } else
          $(a, E), we(i);
        return !0;
      },
      get(l, f, a) {
        if (f === Ce)
          return e;
        var o = n.get(f), d = f in l;
        if (o === void 0 && (!d || ge(l, f)?.writable) && (o = u(() => {
          var _ = pe(d ? l[f] : E), h = /* @__PURE__ */ j(_);
          return h;
        }), n.set(f, o)), o !== void 0) {
          var c = N(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, f, a);
      },
      getOwnPropertyDescriptor(l, f) {
        var a = Reflect.getOwnPropertyDescriptor(l, f);
        if (a && "value" in a) {
          var o = n.get(f);
          o && (a.value = N(o));
        } else if (a === void 0) {
          var d = n.get(f), c = d?.v;
          if (d !== void 0 && c !== E)
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
        if (f === Ce)
          return !0;
        var a = n.get(f), o = a !== void 0 && a.v !== E || Reflect.has(l, f);
        if (a !== void 0 || p !== null && (!o || ge(l, f)?.writable)) {
          a === void 0 && (a = u(() => {
            var c = o ? pe(l[f]) : E, _ = /* @__PURE__ */ j(c);
            return _;
          }), n.set(f, a));
          var d = N(a);
          if (d === E)
            return !1;
        }
        return o;
      },
      set(l, f, a, o) {
        var d = n.get(f), c = f in l;
        if (r && f === "length")
          for (var _ = a; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var h = n.get(_ + "");
            h !== void 0 ? $(h, E) : _ in l && (h = u(() => /* @__PURE__ */ j(E)), n.set(_ + "", h));
          }
        if (d === void 0)
          (!c || ge(l, f)?.writable) && (d = u(() => /* @__PURE__ */ j(void 0)), $(d, pe(a)), n.set(f, d));
        else {
          c = d.v !== E;
          var g = u(() => pe(a));
          $(d, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(l, f);
        if (x?.set && x.set.call(o, a), !c) {
          if (r && typeof f == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= O.v && $(O, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(l) {
        N(i);
        var f = Reflect.ownKeys(l).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== E;
        });
        for (var [a, o] of n)
          o.v !== E && !(a in l) && f.push(a);
        return f;
      },
      setPrototypeOf() {
        ln();
      }
    }
  );
}
var Xe, St, At, Rt;
function Dn() {
  if (Xe === void 0) {
    Xe = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    At = ge(t, "firstChild").get, Rt = ge(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function De(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    Rt.call(e)
  );
}
function ve(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function xe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Mn() {
  return !1;
}
function Fn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(on, e, void 0)
  );
}
let et = !1;
function On() {
  et || (et = !0, document.addEventListener(
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
function $e(e) {
  var t = v, n = p;
  F(null), Y(null);
  try {
    return e();
  } finally {
    F(t), Y(n);
  }
}
function Cn(e, t, n, r = n) {
  e.addEventListener(t, () => $e(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), On();
}
function Pn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & L) !== 0 && (e |= L);
  var r = {
    ctx: I,
    deps: null,
    nodes: null,
    f: e | k | D,
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
    le !== null ? le.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (u) {
      throw A(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Q) !== 0 && (e & ue) !== 0 && i !== null && (i.f |= ue));
  }
  if (i !== null && (i.parent = n, n !== null && Pn(i, n), v !== null && (v.f & y) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function He() {
  return v !== null && !P;
}
function In(e) {
  const t = X(Me, null);
  return b(t, m), t.teardown = e, t;
}
function jn(e) {
  return X(me | tn, e);
}
function Ln(e) {
  J.ensure();
  const t = X(ne | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function qn(e) {
  return X(Be | _e, e);
}
function Dt(e, t = 0) {
  return X(Me | t, e);
}
function Bn(e, t = [], n = [], r = []) {
  En(r, t, n, (i) => {
    X(Me, () => e(...i.map(N)));
  });
}
function Mt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function U(e) {
  return X(H | _e, e);
}
function Ft(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = v;
    tt(!0), F(null);
    try {
      t.call(null);
    } finally {
      tt(n), F(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && $e(() => {
      i.abort(V);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Yn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & H) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & en) !== 0) && e.nodes !== null && e.nodes.end !== null && (zn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, We), Ke(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ft(e), e.f ^= We, e.f |= q;
  var i = e.parent;
  i !== null && i.first !== null && Ot(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Ot(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0);
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
function Ct(e, t, n) {
  if ((e.f & L) === 0) {
    e.f ^= L;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & ue) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & H) !== 0 && (e.f & Q) !== 0;
      Ct(i, t, u ? n : !1), i = s;
    }
  }
}
function Un(e) {
  Pt(e, !0);
}
function Pt(e, t) {
  if ((e.f & L) !== 0) {
    e.f ^= L, (e.f & m) === 0 && (b(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ue) !== 0 || (n.f & H) !== 0;
      Pt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function It(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let Ae = !1, ce = !1;
function tt(e) {
  ce = e;
}
let v = null, P = !1;
function F(e) {
  v = e;
}
let p = null;
function Y(e) {
  p = e;
}
let M = null;
function Vn(e) {
  v !== null && (M === null ? M = [e] : M.push(e));
}
let T = null, S = 0, R = null;
function $n(e) {
  R = e;
}
let jt = 1, ee = 0, te = ee;
function nt(e) {
  te = e;
}
function Lt() {
  return ++jt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && Et(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && b(e, m);
  }
  return !1;
}
function qt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && ae.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? qt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, k) : (s.f & m) !== 0 && b(s, B), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function Bt(e) {
  var t = T, n = S, r = R, i = v, s = M, u = I, l = P, f = te, a = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, v = (a & (H | ne)) === 0 ? e : null, M = null, oe(e.ctx), P = !1, te = ++ee, e.ac !== null && ($e(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), d = o();
    e.f |= de;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var h;
      if (_ || ye(e, S), c !== null && S > 0)
        for (c.length = S + T.length, h = 0; h < T.length; h++)
          c[S + h] = T[h];
      else
        e.deps = c = T;
      if (He() && (e.f & D) !== 0)
        for (h = S; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (ye(e, S), c.length = S);
    if (dt() && R !== null && !P && c !== null && (e.f & (y | B | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      R.length; h++)
        qt(
          R[h],
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
    return (e.f & W) !== 0 && (e.f ^= W), d;
  } catch (g) {
    return _t(g);
  } finally {
    e.f ^= je, T = t, S = n, R = r, v = i, M = s, oe(u), P = l, te = f;
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
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~re), Ye(s), Rn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & q) === 0) {
    b(e, m);
    var n = p, r = Ae;
    p = e, Ae = !0;
    try {
      (t & (Q | ct)) !== 0 ? Yn(e) : Ke(e), Ft(e);
      var i = Bt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = jt;
      var s;
    } finally {
      Ae = r, p = n;
    }
  }
}
function N(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !P) {
    var r = p !== null && (p.f & q) !== 0;
    if (!r && (M === null || !ae.call(M, e))) {
      var i = v.deps;
      if ((v.f & je) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ae.call(s, v) || s.push(v);
      }
    }
  }
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = u.v;
      return ((u.f & m) === 0 && u.reactions !== null || zt(u)) && (l = Ue(u)), Z.set(u, l), l;
    }
    var f = (u.f & D) === 0 && !P && v !== null && (Ae || (v.f & D) !== 0), a = (u.f & de) === 0;
    Ee(u) && (f && (u.f |= D), Et(u)), f && !a && (xt(u), Yt(u));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function Yt(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & D) === 0 && (xt(
        /** @type {Derived} */
        t
      ), Yt(
        /** @type {Derived} */
        t
      ));
}
function zt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & y) !== 0 && zt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ut(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Kn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function it(e, t) {
  Kn("op_set_text", e, t);
}
const Gn = ["touchstart", "touchmove"];
function Wn(e) {
  return Gn.includes(e);
}
const ke = Symbol("events"), Zn = /* @__PURE__ */ new Set(), st = /* @__PURE__ */ new Set();
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
  var u = 0, l = lt === e && e[ke];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ke] = t;
      return;
    }
    var a = i.indexOf(t);
    if (a === -1)
      return;
    f <= a && (u = f);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Gt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, d = p;
    F(null), Y(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ke]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? _.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let x of _)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[ke] = t, delete e.currentTarget, F(o), Y(d);
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
  var t = Fn("template");
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
function Vt(e, t) {
  var n = (t & un) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Xn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return er(s, s), s;
  };
}
function at(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function tr(e, t) {
  return nr(e, t);
}
const Te = /* @__PURE__ */ new Map();
function nr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  Dn();
  var f = void 0, a = Ln(() => {
    var o = n ?? t.appendChild(De());
    mn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        hn({});
        var h = (
          /** @type {ComponentContext} */
          I
        );
        s && (h.c = s), i && (r.$$events = i), f = e(_, r) || {}, dn();
      },
      l
    );
    var d = /* @__PURE__ */ new Set(), c = (_) => {
      for (var h = 0; h < _.length; h++) {
        var g = _[h];
        if (!d.has(g)) {
          d.add(g);
          var x = Wn(g);
          for (const Oe of [t, document]) {
            var O = Te.get(Oe);
            O === void 0 && (O = /* @__PURE__ */ new Map(), Te.set(Oe, O));
            var ie = O.get(g);
            ie === void 0 ? (Oe.addEventListener(g, ft, { passive: x }), O.set(g, 1)) : O.set(g, ie + 1);
          }
        }
      }
    };
    return c(Kt(Zn)), st.add(c), () => {
      for (var _ of d)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Te.get(x)
          ), g = (
            /** @type {number} */
            h.get(_)
          );
          --g == 0 ? (x.removeEventListener(_, ft), h.delete(_), h.size === 0 && Te.delete(x)) : h.set(_, g);
        }
      st.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return rr.set(f, a), f;
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
        Un(r), this.#r.delete(n);
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
            It(u, a), a.append(De()), this.#e.set(s, { effect: u, fragment: a });
          } else
            A(u);
          this.#r.delete(s), this.#a.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), be(u, l, !1)) : l();
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
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = De();
        s.append(u), this.#e.set(t, {
          effect: U(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          U(() => n(this.anchor))
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
function sr(e, t, n = !1) {
  var r = new ir(e), i = n ? ue : 0;
  function s(u, l) {
    r.ensure(u, l);
  }
  Mt(() => {
    var u = !1;
    t((l, f = 0) => {
      u = !0, s(f, l);
    }), u || s(-1, null);
  }, i);
}
function ut(e, t, n = t) {
  Cn(e, "change", (r) => {
    var i = r ? e.defaultChecked : e.checked;
    n(i);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  Ut(t) == null && n(e.checked), Dt(() => {
    var r = t();
    e.checked = !!r;
  });
}
var lr = /* @__PURE__ */ Vt("<div>Terms accepted!</div>"), fr = /* @__PURE__ */ Vt('<div><label><input type="checkbox"/> Accept terms</label> <label><input type="checkbox"/> Subscribe</label> <div> </div> <div> </div> <!></div>');
function ar(e) {
  let t = /* @__PURE__ */ j(!1), n = /* @__PURE__ */ j(!0);
  var r = fr(), i = ve(r), s = ve(i), u = xe(i, 2), l = ve(u), f = xe(u, 2), a = ve(f), o = xe(f, 2), d = ve(o), c = xe(o, 2);
  {
    var _ = (h) => {
      var g = lr();
      at(h, g);
    };
    sr(c, (h) => {
      N(t) && h(_);
    });
  }
  Bn(() => {
    it(a, `Accepted: ${N(t) ?? ""}`), it(d, `Subscribed: ${N(n) ?? ""}`);
  }), ut(s, () => N(t), (h) => $(t, h)), ut(l, () => N(n), (h) => $(n, h)), at(e, r);
}
function or(e) {
  return tr(ar, { target: e });
}
export {
  or as default,
  or as rvst_mount
};

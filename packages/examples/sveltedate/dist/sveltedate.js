var Vt = Array.isArray, $t = Array.prototype.indexOf, ue = Array.prototype.includes, Bt = Array.from, Ht = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Wt = Object.prototype, Kt = Array.prototype, Gt = Object.getPrototypeOf, We = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Ne = 8, ut = 1 << 24, Z = 16, G = 32, te = 64, Pe = 128, R = 512, y = 1024, k = 2048, L = 4096, H = 8192, I = 16384, he = 32768, Ke = 1 << 25, ke = 65536, Ge = 1 << 17, Qt = 1 << 18, de = 1 << 19, Xt = 1 << 20, ne = 65536, Ce = 1 << 21, Ye = 1 << 22, W = 1 << 23, Oe = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function en() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function tn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ln() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const fn = 2, E = Symbol(), un = "http://www.w3.org/1999/xhtml";
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function at(e) {
  return e === this.v;
}
let P = null;
function ae(e) {
  P = e;
}
function ot(e, t = !1, n) {
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
function ct(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function ht() {
  return !0;
}
let se = [];
function on() {
  var e = se;
  se = [], Jt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && on();
    });
  }
  se.push(e);
}
function dt(e) {
  var t = p;
  if (t === null)
    return v.f |= W, e;
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
const cn = -7169;
function m(e, t) {
  e.f = e.f & cn | t;
}
function qe(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, L);
}
function vt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, vt(
        /** @type {Derived} */
        t.deps
      ));
}
function _t(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), vt(e.deps), m(e, y);
}
const V = /* @__PURE__ */ new Set();
let w = null, D = null, Ie = null, De = !1, le = null, Ee = null;
var Ze = 0;
let hn = 1;
class re {
  id = hn++;
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
  #c = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #n = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #s = /* @__PURE__ */ new Map();
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #l = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #e = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #f = /* @__PURE__ */ new Map();
  is_fork = !1;
  #o = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#s.size > 0;
  }
  #v() {
    for (const r of this.#u)
      for (const i of r.#s.keys()) {
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
        m(r, L), this.schedule(r);
    }
  }
  #d() {
    if (Ze++ > 1e3 && (V.delete(this), dn()), !this.#h()) {
      for (const f of this.#r)
        this.#i.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#i)
        m(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw mt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, Ee = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#f)
        wt(f, u);
    } else {
      this.#n.size === 0 && V.delete(this), this.#r.clear(), this.#i.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), Je(r), Je(n), this.#l?.resolve();
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
    a !== null && (V.add(a), a.#d()), V.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (G | te)) !== 0, f = a && (s & y) !== 0, u = f || (s & H) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#i.add(i), ce(i));
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
      _t(t[n], this.#r, this.#i);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), D?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, D = null;
  }
  flush() {
    try {
      De = !0, w = this, this.#d();
    } finally {
      Ze = 0, Ie = null, le = null, Ee = null, De = !1, w = null, D = null, K.clear();
    }
  }
  discard() {
    for (const t of this.#c) t(this);
    this.#c.clear(), V.delete(this);
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
          pt(f, i, s, a);
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
      l.#u.has(this) && (l.#u.delete(this), l.#u.size === 0 && !l.#h() && (l.activate(), l.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#n.get(n) ?? 0;
    if (this.#n.set(n, r + 1), t) {
      let i = this.#s.get(n) ?? 0;
      this.#s.set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let i = this.#n.get(n) ?? 0;
    if (i === 1 ? this.#n.delete(n) : this.#n.set(n, i - 1), t) {
      let s = this.#s.get(n) ?? 0;
      s === 1 ? this.#s.delete(n) : this.#s.set(n, s - 1);
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
      this.#r.add(r);
    for (const r of n)
      this.#i.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#c.add(t);
  }
  settled() {
    return (this.#l ??= ft()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      De || (V.add(w), fe(() => {
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
    if (Ie = t, t.b?.is_pending && (t.f & (we | Ne | ut)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & b) === 0))
        return;
      if ((r & (te | G)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function dn() {
  try {
    tn();
  } catch (e) {
    B(e, Ie);
  }
}
let z = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | H)) === 0 && ye(r) && (z = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), z?.size > 0)) {
        K.clear();
        for (const i of z) {
          if ((i.f & (I | H)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            z.has(a) && (z.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (I | H)) === 0 && ce(u);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & k) === 0 && gt(i, t, r) && (m(i, k), ze(
        /** @type {Effect} */
        i
      ));
    }
}
function gt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && gt(
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
function wt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      wt(n, t), n = n.next;
  }
}
function mt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    mt(t), t = t.next;
}
function vn(e) {
  let t = 0, n = Re(0), r;
  return () => {
    $e() && (C(n), Fn(() => (t === 0 && (r = zn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var _n = ke | de;
function pn(e, t, n, r) {
  new gn(e, t, n, r);
}
class gn {
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
  #c = null;
  /** @type {BoundaryProps} */
  #n;
  /** @type {((anchor: Node) => void)} */
  #s;
  /** @type {Effect} */
  #l;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #r = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #o = 0;
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
  #a = null;
  #_ = vn(() => (this.#a = Re(this.#o), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#n = n, this.#s = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Pe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#l = Cn(() => {
      this.#m();
    }, _n);
  }
  #w() {
    try {
      this.#e = Q(() => this.#s(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#n.failed;
    n && (this.#i = Q(() => {
      n(
        this.#t,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#n.pending;
    t && (this.is_pending = !0, this.#r = Q(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Rt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#s(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, xe(
        /** @type {Effect} */
        this.#r,
        () => {
          this.#r = null;
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
        this.#s(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ln(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#n.pending
        );
        this.#r = Q(() => n(this.#t));
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
    _t(t, this.#v, this.#d);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var n = p, r = v, i = P;
    Y(this.#l), S(this.#l), ae(this.#l.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return dt(s), null;
    } finally {
      Y(n), S(r), ae(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#r && xe(this.#r, () => {
      this.#r = null;
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#a && Ae(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), C(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#n.onerror;
    let r = this.#n.failed;
    if (!n && !r)
      throw t;
    this.#e && (j(this.#e), this.#e = null), this.#r && (j(this.#r), this.#r = null), this.#i && (j(this.#i), this.#i = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        an();
        return;
      }
      i = !0, s && ln(), this.#i !== null && xe(this.#i, () => {
        this.#i = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        B(l, this.#l && this.#l.parent);
      }
      r && (this.#i = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Pe, r(
              this.#t,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return B(
            l,
            /** @type {Effect} */
            this.#l.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        B(l, this.#l && this.#l.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => B(l, this.#l && this.#l.parent)
      ) : f(u);
    });
  }
}
function wn(e, t, n, r) {
  const i = bt;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = mn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (_) {
      (a.f & I) === 0 && B(_, a);
    }
    Se();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = yt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ yn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Se();
  }) : h();
}
function mn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), S(t), ae(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  Y(null), S(null), ae(null), e && w?.deactivate();
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
function bt(e) {
  var t = b | k, n = v !== null && (v.f & b) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: P,
    deps: null,
    effects: null,
    equals: at,
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
function yn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && en();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Re(
    /** @type {V} */
    E
  ), a = !v, f = /* @__PURE__ */ new Map();
  return Dn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ft();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (_) {
      l.reject(_), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = yt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(U), f.delete(o);
      else {
        for (const _ of f.values())
          _.reject(U);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var g = d === U;
        h(g);
      }
      if (!(d === U || (u.f & I) !== 0)) {
        if (o.activate(), d)
          s.f |= W, Ae(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ae(s, _);
          for (const [x, O] of f) {
            if (f.delete(x), x === o) break;
            O.reject(U);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Rn(() => {
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
// @__NO_SIDE_EFFECTS__
function bn(e) {
  const t = /* @__PURE__ */ bt(e);
  return Ct(t), t;
}
function En(e) {
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
function xn(e) {
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
function Ue(e) {
  var t, n = p;
  Y(xn(e));
  try {
    e.f &= ~ne, En(e), t = Yt(e);
  } finally {
    Y(n);
  }
  return t;
}
function Et(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = jt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (D !== null ? ($e() || w?.is_fork) && D.set(e, n) : qe(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Zt, t.ac = null, me(t, 0), Be(t));
}
function xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let je = /* @__PURE__ */ new Set();
const K = /* @__PURE__ */ new Map();
let Tt = !1;
function Re(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: at,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  const n = Re(e);
  return Ct(n), n;
}
function $(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (v.f & Ge) !== 0) && ht() && (v.f & (b | Z | Ye | Ge)) !== 0 && (M === null || !ue.call(M, e)) && sn();
  let r = n ? ve(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? K.set(e, t) : K.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ue(s), D === null && qe(s);
    }
    e.wv = jt(), kt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (G | te)) === 0 && (N === null ? Yn([e]) : N.push(e)), !i.is_fork && je.size > 0 && !Tt && kn();
  }
  return t;
}
function kn() {
  Tt = !1;
  for (const e of je)
    (e.f & y) !== 0 && m(e, L), ye(e) && ce(e);
  je.clear();
}
function ge(e) {
  $(e, e.v + 1);
}
function kt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        D?.delete(l), (f & ne) === 0 && (f & R && (a.f |= ne), kt(l, L, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : ze(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Gt(e);
  if (t !== Wt && t !== Kt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vt(e), i = /* @__PURE__ */ q(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var u = v, l = ee;
    S(null), tt(s);
    var o = f();
    return S(u), tt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && nn();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ q(l.value);
          return n.set(u, h), h;
        }) : $(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ q(E));
            n.set(u, o), ge(i);
          }
        } else
          $(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Oe)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || pe(f, u)?.writable) && (o = a(() => {
          var _ = ve(h ? f[u] : E), d = /* @__PURE__ */ q(_);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = C(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = C(o));
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
        if (u === Oe)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || pe(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(f[u]) : E, _ = /* @__PURE__ */ q(c);
            return _;
          }), n.set(u, l));
          var h = C(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var d = n.get(_ + "");
            d !== void 0 ? $(d, E) : _ in f && (d = a(() => /* @__PURE__ */ q(E)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = a(() => /* @__PURE__ */ q(void 0)), $(h, ve(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => ve(l));
          $(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= O.v && $(O, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        C(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        rn();
      }
    }
  );
}
var Qe, St, At, Nt;
function Sn() {
  if (Qe === void 0) {
    Qe = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    At = pe(t, "firstChild").get, Nt = pe(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Mt(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    Nt.call(e)
  );
}
function Fe(e, t) {
  return /* @__PURE__ */ Mt(e);
}
function Xe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function An(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(un, e, void 0)
  );
}
function Ot(e) {
  var t = v, n = p;
  S(null), Y(null);
  try {
    return e();
  } finally {
    S(t), Y(n);
  }
}
function Nn(e, t) {
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
      ce(r);
    } catch (a) {
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Nn(i, n), v !== null && (v.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function $e() {
  return v !== null && !F;
}
function Rn(e) {
  const t = J(Ne, null);
  return m(t, y), t.teardown = e, t;
}
function Mn(e) {
  return J(we | Xt, e);
}
function On(e) {
  re.ensure();
  const t = J(te | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function Dn(e) {
  return J(Ye | de, e);
}
function Fn(e, t = 0) {
  return J(Ne | t, e);
}
function Pn(e, t = [], n = [], r = []) {
  wn(r, t, n, (i) => {
    J(Ne, () => e(...i.map(C)));
  });
}
function Cn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(G | de, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    et(!0), S(null);
    try {
      t.call(null);
    } finally {
      et(n), S(r);
    }
  }
}
function Be(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ot(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function In(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && (jn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ke), Be(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= Ke, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Pt(e, r, !0);
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
function Pt(e, t, n) {
  if ((e.f & H) === 0) {
    e.f ^= H;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      Pt(i, t, a ? n : !1), i = s;
    }
  }
}
function Ln(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function et(e) {
  oe = e;
}
let v = null, F = !1;
function S(e) {
  v = e;
}
let p = null;
function Y(e) {
  p = e;
}
let M = null;
function Ct(e) {
  v !== null && (M === null ? M = [e] : M.push(e));
}
let T = null, A = 0, N = null;
function Yn(e) {
  N = e;
}
let It = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function jt() {
  return ++It;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
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
      ) && Et(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    D === null && m(e, y);
  }
  return !1;
}
function Lt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && ue.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Lt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, L), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function Yt(e) {
  var t = T, n = A, r = N, i = v, s = M, a = P, f = F, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, N = null, v = (l & (G | te)) === 0 ? e : null, M = null, ae(e.ctx), F = !1, ee = ++X, e.ac !== null && (Ot(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Ce;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var d;
      if (_ || me(e, A), c !== null && A > 0)
        for (c.length = A + T.length, d = 0; d < T.length; d++)
          c[A + d] = T[d];
      else
        e.deps = c = T;
      if ($e() && (e.f & R) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && A < c.length && (me(e, A), c.length = A);
    if (ht() && N !== null && !F && c !== null && (e.f & (b | L | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      N.length; d++)
        Lt(
          N[d],
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
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return dt(g);
  } finally {
    e.f ^= Ce, T = t, A = n, N = r, v = i, M = s, ae(a), F = f, ee = u;
  }
}
function qn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = $t.call(n, e);
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
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), qe(s), Tn(s), me(s, 0);
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
  if ((t & I) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | ut)) !== 0 ? In(e) : Be(e), Dt(e);
      var i = Yt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = It;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function C(e) {
  var t = e.f, n = (t & b) !== 0;
  if (v !== null && !F) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (M === null || !ue.call(M, e))) {
      var i = v.deps;
      if ((v.f & Ce) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
      }
    }
  }
  if (oe && K.has(e))
    return K.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || zt(a)) && (f = Ue(a)), K.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !F && v !== null && (Te || (v.f & R) !== 0), l = (a.f & he) === 0;
    ye(a) && (u && (a.f |= R), Et(a)), u && !l && (xt(a), qt(a));
  }
  if (D?.has(e))
    return D.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (xt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function zt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (K.has(t) || (t.f & b) !== 0 && zt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function zn(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function rt(e, t) {
  Un("op_set_text", e, t);
}
const Vn = ["touchstart", "touchmove"];
function $n(e) {
  return Vn.includes(e);
}
const _e = Symbol("events"), Ut = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Bn(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function Hn(e) {
  for (var t = 0; t < e.length; t++)
    Ut.add(e[t]);
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
  var a = 0, f = it === e && e[_e];
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
    Ht(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    S(null), Y(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[_e]?.[r];
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
      e[_e] = t, delete e.currentTarget, S(o), Y(h);
    }
  }
}
const Wn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Kn(e) {
  return (
    /** @type {string} */
    Wn?.createHTML(e) ?? e
  );
}
function Gn(e) {
  var t = An("template");
  return t.innerHTML = Kn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Zn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Jn(e, t) {
  var n = (t & fn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Gn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Mt(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Zn(s, s), s;
  };
}
function Qn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Xn(e, t) {
  return er(e, t);
}
const be = /* @__PURE__ */ new Map();
function er(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  Sn();
  var u = void 0, l = On(() => {
    var o = n ?? t.appendChild(Rt());
    pn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        ot({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), u = e(_, r) || {}, ct();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var g = _[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const Me of [t, document]) {
            var O = be.get(Me);
            O === void 0 && (O = /* @__PURE__ */ new Map(), be.set(Me, O));
            var ie = O.get(g);
            ie === void 0 ? (Me.addEventListener(g, st, { passive: x }), O.set(g, 1)) : O.set(g, ie + 1);
          }
        }
      }
    };
    return c(Bt(Ut)), Le.add(c), () => {
      for (var _ of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            d.get(_)
          );
          --g == 0 ? (x.removeEventListener(_, st), d.delete(_), d.size === 0 && be.delete(x)) : d.set(_, g);
        }
      Le.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return tr.set(u, l), u;
}
let tr = /* @__PURE__ */ new WeakMap();
var lt = !1;
class He extends Date {
  #t = /* @__PURE__ */ q(super.getTime());
  /** @type {Map<keyof Date, Source<unknown>>} */
  #c = /* @__PURE__ */ new Map();
  #n = v;
  /** @param {any[]} params */
  constructor(...t) {
    super(...t), lt || this.#s();
  }
  #s() {
    lt = !0;
    var t = He.prototype, n = Date.prototype, r = (
      /** @type {Array<keyof Date & string>} */
      Object.getOwnPropertyNames(n)
    );
    for (const i of r)
      (i.startsWith("get") || i.startsWith("to") || i === "valueOf") && (t[i] = function(...s) {
        if (s.length > 0)
          return C(this.#t), n[i].apply(this, s);
        var a = this.#c.get(i);
        if (a === void 0) {
          const f = v;
          S(this.#n), a = /* @__PURE__ */ bn(() => (C(this.#t), n[i].apply(this, s))), this.#c.set(i, a), S(f);
        }
        return C(a);
      }), i.startsWith("set") && (t[i] = function(...s) {
        var a = n[i].apply(this, s);
        return $(this.#t, n.getTime.call(this)), a;
      });
  }
}
var nr = /* @__PURE__ */ Jn("<div><div> </div> <div> </div> <button>Next Month</button></div>");
function rr(e, t) {
  ot(t, !0);
  const n = new He(2026, 0, 1);
  function r() {
    n.setMonth(n.getMonth() + 1);
  }
  var i = nr(), s = Fe(i), a = Fe(s), f = Xe(s, 2), u = Fe(f), l = Xe(f, 2);
  Pn(
    (o, h) => {
      rt(a, `Year: ${o ?? ""}`), rt(u, `Month: ${h ?? ""}`);
    },
    [() => n.getFullYear(), () => n.getMonth()]
  ), Bn("click", l, r), Qn(e, i), ct();
}
Hn(["click"]);
function sr(e) {
  return Xn(rr, { target: e });
}
export {
  sr as default,
  sr as rvst_mount
};

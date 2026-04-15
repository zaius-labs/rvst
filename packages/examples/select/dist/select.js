var ut = Array.isArray, zt = Array.prototype.indexOf, ue = Array.prototype.includes, Bt = Array.from, Ut = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Vt = Object.prototype, Ht = Array.prototype, $t = Object.getPrototypeOf, Ke = Object.isExtensible;
const Gt = () => {
};
function Kt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function at() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, ae = 4, Oe = 8, ot = 1 << 24, J = 16, Z = 32, te = 64, Ie = 128, R = 512, b = 1024, T = 2048, j = 4096, G = 8192, C = 16384, he = 32768, We = 1 << 25, Ae = 65536, Ze = 1 << 17, Wt = 1 << 18, ve = 1 << 19, Zt = 1 << 20, ne = 65536, je = 1 << 21, Ye = 1 << 22, K = 1 << 23, ge = Symbol("$state"), z = new class extends Error {
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
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function fn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ct(e) {
  return e === this.v;
}
let P = null;
function oe(e) {
  P = e;
}
function un(e, t = !1, n) {
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
function an(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Fn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function _t() {
  return !0;
}
let se = [];
function on() {
  var e = se;
  se = [], Kt(e);
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
function ht(e) {
  var t = p;
  if (t === null)
    return d.f |= K, e;
  if ((t.f & he) === 0 && (t.f & ae) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
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
function ze(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, b) : m(e, j);
}
function vt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ne) === 0 || (t.f ^= ne, vt(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & T) !== 0 ? t.add(e) : (e.f & j) !== 0 && n.add(e), vt(e.deps), m(e, b);
}
const V = /* @__PURE__ */ new Set();
let w = null, F = null, Le = null, Me = !1, le = null, Se = null;
var Je = 0;
let _n = 1;
class re {
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
  #l = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #h = /* @__PURE__ */ new Set();
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
        m(r, T), this.schedule(r);
      for (r of n.m)
        m(r, j), this.schedule(r);
    }
  }
  #_() {
    if (Je++ > 1e3 && (V.delete(this), hn()), !this.#c()) {
      for (const l of this.#t)
        this.#n.delete(l), m(l, T), this.schedule(l);
      for (const l of this.#n)
        m(l, j), this.schedule(l);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Se = [];
    for (const l of t)
      try {
        this.#a(l, n, r);
      } catch (u) {
        throw mt(l), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (le = null, Se = null, this.#c() || this.#v()) {
      this.#d(r), this.#d(n);
      for (const [l, u] of this.#s)
        wt(l, u);
    } else {
      this.#r.size === 0 && V.delete(this), this.#t.clear(), this.#n.clear();
      for (const l of this.#l) l(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const l = a ??= this;
      l.#e.push(...this.#e.filter((u) => !l.#e.includes(u)));
    }
    a !== null && (V.add(a), a.#_()), V.has(this) || this.#w();
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
      var s = i.f, a = (s & (Z | te)) !== 0, l = a && (s & b) !== 0, u = l || (s & G) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= b : (s & ae) !== 0 ? n.push(i) : ye(i) && ((s & J) !== 0 && this.#n.add(i), _e(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      dt(t[n], this.#t, this.#n);
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
      Me = !0, w = this, this.#_();
    } finally {
      Je = 0, Le = null, le = null, Se = null, Me = !1, w = null, F = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#h) t(this);
    this.#h.clear(), V.delete(this);
  }
  #w() {
    for (const f of V) {
      var t = f.id < this.id, n = [];
      for (const [o, [_, c]] of this.current) {
        if (f.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(o)[0]
          );
          if (t && _ !== r)
            f.current.set(o, [_, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...f.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var l of n)
          pt(l, i, s, a);
        if (f.#e.length > 0) {
          f.apply();
          for (var u of f.#e)
            f.#a(u, [], []);
          f.#e = [];
        }
        f.deactivate();
      }
    }
    for (const f of V)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#c() && (f.activate(), f.#_()));
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
    this.#h.add(t);
  }
  settled() {
    return (this.#i ??= at()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Me || (V.add(w), fe(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (ae | Oe | ot)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (d === null || (d.f & y) === 0))
        return;
      if ((r & (te | Z)) !== 0) {
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
    $(e, Le);
  }
}
let Y = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (C | G)) === 0 && ye(r) && (Y = /* @__PURE__ */ new Set(), _e(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), Y?.size > 0)) {
        W.clear();
        for (const i of Y) {
          if ((i.f & (C | G)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const u = s[l];
            (u.f & (C | G)) === 0 && _e(u);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | J)) !== 0 && (s & T) === 0 && gt(i, t, r) && (m(i, T), Be(
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
      if ((i.f & y) !== 0 && gt(
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
function wt(e, t) {
  if (!((e.f & Z) !== 0 && (e.f & b) !== 0)) {
    (e.f & T) !== 0 ? t.d.push(e) : (e.f & j) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      wt(n, t), n = n.next;
  }
}
function mt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    mt(t), t = t.next;
}
function vn(e) {
  let t = 0, n = De(0), r;
  return () => {
    $e() && (B(n), In(() => (t === 0 && (r = Hn(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var dn = Ae | ve;
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
  #l;
  /** @type {TemplateNode | null} */
  #h = null;
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
  #_ = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #a = null;
  #d = vn(() => (this.#a = De(this.#o), () => {
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
      a.b = this, a.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ln(() => {
      this.#m();
    }, dn);
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
      var n = this.#s = document.createDocumentFragment(), r = Rt();
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
    this.is_pending = !1, t.transfer_effects(this.#v, this.#_);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    dt(t, this.#v, this.#_);
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
    var n = p, r = d, i = P;
    L(this.#i), O(this.#i), oe(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      L(n), O(r), oe(i);
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#a && Ne(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#d(), B(
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
        fn();
        return;
      }
      i = !0, s && nn(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (f) {
        $(f, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var f = (
              /** @type {Effect} */
              p
            );
            f.b = this, f.f |= Ie, r(
              this.#l,
              () => u,
              () => a
            );
          });
        } catch (f) {
          return $(
            f,
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
      } catch (f) {
        $(f, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        l,
        /** @param {unknown} e */
        (f) => $(f, this.#i && this.#i.parent)
      ) : l(u);
    });
  }
}
function wn(e, t, n, r) {
  const i = bn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), l = mn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (a.f & C) === 0 && $(v, a);
    }
    Re();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(i)));
    return;
  }
  var o = bt();
  function _() {
    Promise.all(n.map((c) => /* @__PURE__ */ yn(c))).then((c) => f([...t.map(i), ...c])).catch((c) => $(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    l(), _(), Re();
  }) : _();
}
function mn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = d, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    L(e), O(t), oe(n), s && (e.f & C) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  L(null), O(null), oe(null), e && w?.deactivate();
}
function bt() {
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
function bn(e) {
  var t = y | T, n = d !== null && (d.f & y) !== 0 ? (
    /** @type {Derived} */
    d
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
    deps: null,
    effects: null,
    equals: ct,
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
  r === null && Jt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = De(
    /** @type {V} */
    E
  ), a = !d, l = /* @__PURE__ */ new Map();
  return Cn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), f = at();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Re);
    } catch (v) {
      f.reject(v), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & he) !== 0)
        var _ = bt();
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
      l.set(o, f);
    }
    const c = (v, h = void 0) => {
      if (_) {
        var g = h === z;
        _(g);
      }
      if (!(h === z || (u.f & C) !== 0)) {
        if (o.activate(), h)
          s.f |= K, Ne(s, h);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ne(s, v);
          for (const [x, D] of l) {
            if (l.delete(x), x === o) break;
            D.reject(z);
          }
        }
        o.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), Ot(() => {
    for (const u of l.values())
      u.reject(z);
  }), new Promise((u) => {
    function f(o) {
      function _() {
        o === i ? u(s) : f(i);
      }
      o.then(_, _);
    }
    f(i);
  });
}
function En(e) {
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
function xn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & C) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ue(e) {
  var t, n = p;
  L(xn(e));
  try {
    e.f &= ~ne, En(e), t = jt(e);
  } finally {
    L(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Ct(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (F !== null ? ($e() || w?.is_fork) && F.set(e, n) : ze(e));
}
function Sn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = Gt, t.ac = null, be(t, 0), Ge(t));
}
function Et(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && _e(t);
}
let qe = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let xt = !1;
function De(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ct,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  const n = De(e);
  return Bn(n), n;
}
function H(e, t, n = !1) {
  d !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (d.f & Ze) !== 0) && _t() && (d.f & (y | J | Ye | Ze)) !== 0 && (N === null || !ue.call(N, e)) && tn();
  let r = n ? de(t) : t;
  return Ne(e, r, Se);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & T) !== 0 && Ue(s), F === null && ze(s);
    }
    e.wv = Ct(), St(e, T, n), p !== null && (p.f & b) !== 0 && (p.f & (Z | te)) === 0 && (A === null ? Un([e]) : A.push(e)), !i.is_fork && qe.size > 0 && !xt && Tn();
  }
  return t;
}
function Tn() {
  xt = !1;
  for (const e of qe)
    (e.f & b) !== 0 && m(e, j), ye(e) && _e(e);
  qe.clear();
}
function we(e) {
  H(e, e.v + 1);
}
function St(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], l = a.f, u = (l & T) === 0;
      if (u && m(a, t), (l & y) !== 0) {
        var f = (
          /** @type {Derived} */
          a
        );
        F?.delete(f), (l & ne) === 0 && (l & R && (a.f |= ne), St(f, j, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (l & J) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Be(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || ge in e)
    return e;
  const t = $t(e);
  if (t !== Vt && t !== Ht)
    return e;
  var n = /* @__PURE__ */ new Map(), r = ut(e), i = /* @__PURE__ */ q(0), s = ee, a = (l) => {
    if (ee === s)
      return l();
    var u = d, f = ee;
    O(null), rt(s);
    var o = l();
    return O(u), rt(f), o;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && Xt();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var _ = /* @__PURE__ */ q(f.value);
          return n.set(u, _), _;
        }) : H(o, f.value, !0), !0;
      },
      deleteProperty(l, u) {
        var f = n.get(u);
        if (f === void 0) {
          if (u in l) {
            const o = a(() => /* @__PURE__ */ q(E));
            n.set(u, o), we(i);
          }
        } else
          H(f, E), we(i);
        return !0;
      },
      get(l, u, f) {
        if (u === ge)
          return e;
        var o = n.get(u), _ = u in l;
        if (o === void 0 && (!_ || pe(l, u)?.writable) && (o = a(() => {
          var v = de(_ ? l[u] : E), h = /* @__PURE__ */ q(v);
          return h;
        }), n.set(u, o)), o !== void 0) {
          var c = B(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, u, f);
      },
      getOwnPropertyDescriptor(l, u) {
        var f = Reflect.getOwnPropertyDescriptor(l, u);
        if (f && "value" in f) {
          var o = n.get(u);
          o && (f.value = B(o));
        } else if (f === void 0) {
          var _ = n.get(u), c = _?.v;
          if (_ !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return f;
      },
      has(l, u) {
        if (u === ge)
          return !0;
        var f = n.get(u), o = f !== void 0 && f.v !== E || Reflect.has(l, u);
        if (f !== void 0 || p !== null && (!o || pe(l, u)?.writable)) {
          f === void 0 && (f = a(() => {
            var c = o ? de(l[u]) : E, v = /* @__PURE__ */ q(c);
            return v;
          }), n.set(u, f));
          var _ = B(f);
          if (_ === E)
            return !1;
        }
        return o;
      },
      set(l, u, f, o) {
        var _ = n.get(u), c = u in l;
        if (r && u === "length")
          for (var v = f; v < /** @type {Source<number>} */
          _.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? H(h, E) : v in l && (h = a(() => /* @__PURE__ */ q(E)), n.set(v + "", h));
          }
        if (_ === void 0)
          (!c || pe(l, u)?.writable) && (_ = a(() => /* @__PURE__ */ q(void 0)), H(_, de(f)), n.set(u, _));
        else {
          c = _.v !== E;
          var g = a(() => de(f));
          H(_, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(l, u);
        if (x?.set && x.set.call(o, f), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= D.v && H(D, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(l) {
        B(i);
        var u = Reflect.ownKeys(l).filter((_) => {
          var c = n.get(_);
          return c === void 0 || c.v !== E;
        });
        for (var [f, o] of n)
          o.v !== E && !(f in l) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        en();
      }
    }
  );
}
function Xe(e) {
  try {
    if (e !== null && typeof e == "object" && ge in e)
      return e[ge];
  } catch {
  }
  return e;
}
function kn(e, t) {
  return Object.is(Xe(e), Xe(t));
}
var et, Tt, kt, At;
function An() {
  if (et === void 0) {
    et = window, Tt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kt = pe(t, "firstChild").get, At = pe(t, "nextSibling").get, Ke(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ke(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function Pe(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function Ce(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Rn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(sn, e, void 0)
  );
}
let tt = !1;
function Nn() {
  tt || (tt = !0, document.addEventListener(
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
function He(e) {
  var t = d, n = p;
  O(null), L(null);
  try {
    return e();
  } finally {
    O(t), L(n);
  }
}
function On(e, t, n, r = n) {
  e.addEventListener(t, () => He(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), Nn();
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function U(e, t) {
  var n = p;
  n !== null && (n.f & G) !== 0 && (e |= G);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | T | R,
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
  if ((e & ae) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      _e(r);
    } catch (a) {
      throw I(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & J) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && Dn(i, n), d !== null && (d.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      d
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function $e() {
  return d !== null && !M;
}
function Ot(e) {
  const t = U(Oe, null);
  return m(t, b), t.teardown = e, t;
}
function Fn(e) {
  return U(ae | Zt, e);
}
function Mn(e) {
  re.ensure();
  const t = U(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      I(t), r(void 0);
    }) : (I(t), r(void 0));
  });
}
function Pn(e) {
  return U(ae, e);
}
function Cn(e) {
  return U(Ye | ve, e);
}
function In(e, t = 0) {
  return U(Oe | t, e);
}
function jn(e, t = [], n = [], r = []) {
  wn(r, t, n, (i) => {
    U(Oe, () => e(...i.map(B)));
  });
}
function Ln(e, t = 0) {
  var n = U(J | t, e);
  return n;
}
function Q(e) {
  return U(Z | ve, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = d;
    nt(!0), O(null);
    try {
      t.call(null);
    } finally {
      nt(n), O(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && He(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : I(n, t), n = r;
  }
}
function qn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Z) === 0 && I(t), t = n;
  }
}
function I(e, t = !0) {
  var n = !1;
  (t || (e.f & Wt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Yn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, We), Ge(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= We, e.f |= C;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Yn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Mt(e, r, !0);
  var i = () => {
    n && I(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var l of r)
      l.out(a);
  } else
    i();
}
function Mt(e, t, n) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Z) !== 0 && (e.f & J) !== 0;
      Mt(i, t, a ? n : !1), i = s;
    }
  }
}
function zn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let ke = !1, ce = !1;
function nt(e) {
  ce = e;
}
let d = null, M = !1;
function O(e) {
  d = e;
}
let p = null;
function L(e) {
  p = e;
}
let N = null;
function Bn(e) {
  d !== null && (N === null ? N = [e] : N.push(e));
}
let S = null, k = 0, A = null;
function Un(e) {
  A = e;
}
let Pt = 1, X = 0, ee = X;
function rt(e) {
  ee = e;
}
function Ct() {
  return ++Pt;
}
function ye(e) {
  var t = e.f;
  if ((t & T) !== 0)
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
      ) && yt(
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
function It(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? It(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, T) : (s.f & b) !== 0 && m(s, j), Be(
        /** @type {Effect} */
        s
      ));
    }
}
function jt(e) {
  var t = S, n = k, r = A, i = d, s = N, a = P, l = M, u = ee, f = e.f;
  S = /** @type {null | Value[]} */
  null, k = 0, A = null, d = (f & (Z | te)) === 0 ? e : null, N = null, oe(e.ctx), M = !1, ee = ++X, e.ac !== null && (He(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), _ = o();
    e.f |= he;
    var c = e.deps, v = w?.is_fork;
    if (S !== null) {
      var h;
      if (v || be(e, k), c !== null && k > 0)
        for (c.length = k + S.length, h = 0; h < S.length; h++)
          c[k + h] = S[h];
      else
        e.deps = c = S;
      if ($e() && (e.f & R) !== 0)
        for (h = k; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !v && c !== null && k < c.length && (be(e, k), c.length = k);
    if (_t() && A !== null && !M && c !== null && (e.f & (y | j | T)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      A.length; h++)
        It(
          A[h],
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
    return (e.f & K) !== 0 && (e.f ^= K), _;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= je, S = t, k = n, A = r, d = i, N = s, oe(a), M = l, ee = u;
  }
}
function Vn(e, t) {
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
  (S === null || !ue.call(S, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), ze(s), Sn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vn(e, n[r]);
}
function _e(e) {
  var t = e.f;
  if ((t & C) === 0) {
    m(e, b);
    var n = p, r = ke;
    p = e, ke = !0;
    try {
      (t & (J | ot)) !== 0 ? qn(e) : Ge(e), Dt(e);
      var i = jt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      ke = r, p = n;
    }
  }
}
function B(e) {
  var t = e.f, n = (t & y) !== 0;
  if (d !== null && !M) {
    var r = p !== null && (p.f & C) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = d.deps;
      if ((d.f & je) !== 0)
        e.rv < X && (e.rv = X, S === null && i !== null && i[k] === e ? k++ : S === null ? S = [e] : S.push(e));
      else {
        (d.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [d] : ue.call(s, d) || s.push(d);
      }
    }
  }
  if (ce && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var l = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || qt(a)) && (l = Ue(a)), W.set(a, l), l;
    }
    var u = (a.f & R) === 0 && !M && d !== null && (ke || (d.f & R) !== 0), f = (a.f & he) === 0;
    ye(a) && (u && (a.f |= R), yt(a)), u && !f && (Et(a), Lt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Lt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & R) === 0 && (Et(
        /** @type {Derived} */
        t
      ), Lt(
        /** @type {Derived} */
        t
      ));
}
function qt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & y) !== 0 && qt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Hn(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function $n(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Gn(e, t) {
  $n("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function Wn(e) {
  return Kn.includes(e);
}
const Ee = Symbol("events"), Zn = /* @__PURE__ */ new Set(), st = /* @__PURE__ */ new Set();
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
  var a = 0, l = lt === e && e[Ee];
  if (l) {
    var u = i.indexOf(l);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ee] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    u <= f && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Ut(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = d, _ = p;
    O(null), L(null);
    try {
      for (var c, v = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[Ee]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[Ee] = t, delete e.currentTarget, O(o), L(_);
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
  var t = Rn("template");
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
function tr(e, t) {
  var n = (t & rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Xn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || Tt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return er(s, s), s;
  };
}
function nr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function rr(e, t) {
  return ir(e, t);
}
const xe = /* @__PURE__ */ new Map();
function ir(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: l }) {
  An();
  var u = void 0, f = Mn(() => {
    var o = n ?? t.appendChild(Rt());
    pn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        un({});
        var h = (
          /** @type {ComponentContext} */
          P
        );
        s && (h.c = s), i && (r.$$events = i), u = e(v, r) || {}, an();
      },
      l
    );
    var _ = /* @__PURE__ */ new Set(), c = (v) => {
      for (var h = 0; h < v.length; h++) {
        var g = v[h];
        if (!_.has(g)) {
          _.add(g);
          var x = Wn(g);
          for (const Fe of [t, document]) {
            var D = xe.get(Fe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), xe.set(Fe, D));
            var ie = D.get(g);
            ie === void 0 ? (Fe.addEventListener(g, ft, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(Bt(Zn)), st.add(c), () => {
      for (var v of _)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            h.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, ft), h.delete(v), h.size === 0 && xe.delete(x)) : h.set(v, g);
        }
      st.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return sr.set(u, f), u;
}
let sr = /* @__PURE__ */ new WeakMap();
function Yt(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ut(t))
      return ln();
    for (var r of e.options)
      r.selected = t.includes(me(r));
    return;
  }
  for (r of e.options) {
    var i = me(r);
    if (kn(i, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function lr(e) {
  var t = new MutationObserver(() => {
    Yt(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Ot(() => {
    t.disconnect();
  });
}
function fr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), i = !0;
  On(e, "change", (s) => {
    var a = s ? "[selected]" : ":checked", l;
    if (e.multiple)
      l = [].map.call(e.querySelectorAll(a), me);
    else {
      var u = e.querySelector(a) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      l = u && me(u);
    }
    n(l), e.__value = l, w !== null && r.add(w);
  }), Pn(() => {
    var s = t();
    if (e === document.activeElement) {
      var a = (
        /** @type {Batch} */
        w
      );
      if (r.has(a))
        return;
    }
    if (Yt(e, s, i), i && s === void 0) {
      var l = e.querySelector(":checked");
      l !== null && (s = me(l), n(s));
    }
    e.__value = s, i = !1;
  }), lr(e);
}
function me(e) {
  return "__value" in e ? e.__value : e.value;
}
var ur = /* @__PURE__ */ tr("<div><select><option>Red</option><option>Green</option><option>Blue</option></select> <span> </span></div>");
function ar(e) {
  let t = /* @__PURE__ */ q("red");
  var n = ur(), r = Pe(n), i = Pe(r);
  i.value = i.__value = "red";
  var s = Ce(i);
  s.value = s.__value = "green";
  var a = Ce(s);
  a.value = a.__value = "blue";
  var l = Ce(r, 2), u = Pe(l);
  jn(() => Gn(u, `Selected: ${B(t) ?? ""}`)), fr(r, () => B(t), (f) => H(t, f)), nr(e, n);
}
function cr(e) {
  return rr(ar, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

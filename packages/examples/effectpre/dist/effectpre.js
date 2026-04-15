var Yt = Array.isArray, $t = Array.prototype.indexOf, ae = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Bt = Object.prototype, Ht = Array.prototype, Kt = Object.getPrototypeOf, He = Object.isExtensible;
const Gt = () => {
};
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function st() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, ye = 8, lt = 1 << 24, J = 16, Z = 32, te = 64, Me = 128, R = 512, y = 1024, k = 2048, q = 4096, K = 8192, j = 16384, he = 32768, Ke = 1 << 25, Se = 65536, Ge = 1 << 17, Zt = 1 << 18, _e = 1 << 19, ft = 1 << 20, ne = 65536, Pe = 1 << 21, qe = 1 << 22, G = 1 << 23, De = Symbol("$state"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Jt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Qt(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Xt() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function en(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
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
function ut(e) {
  return e === this.v;
}
let P = null;
function oe(e) {
  P = e;
}
function at(e, t = !1, n) {
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
function ot(e) {
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
function ct() {
  return !0;
}
let le = [];
function on() {
  var e = le;
  le = [], Wt(e);
}
function ue(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && on();
    });
  }
  le.push(e);
}
function ht(e) {
  var t = p;
  if (t === null)
    return v.f |= G, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Me) !== 0) {
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
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, q);
}
function _t(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, _t(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), _t(e.deps), m(e, y);
}
const B = /* @__PURE__ */ new Set();
let w = null, F = null, Ie = null, Fe = !1, fe = null, xe = null;
var We = 0;
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
    if (We++ > 1e3 && (B.delete(this), _n()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, q), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw wt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (fe = null, xe = null, this.#c() || this.#d()) {
      this.#v(r), this.#v(n);
      for (const [f, u] of this.#s)
        gt(f, u);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Ze(r), Ze(n), this.#i?.resolve();
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
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (Z | te)) !== 0, f = a && (s & y) !== 0, u = f || (s & K) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : be(i) && ((s & J) !== 0 && this.#n.add(i), ce(i));
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
      We = 0, Ie = null, fe = null, xe = null, Fe = !1, w = null, F = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), B.delete(this);
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
        for (var f of n)
          vt(f, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#a(u, [], []);
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
    this.#_.add(t);
  }
  settled() {
    return (this.#i ??= st()).promise;
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
    if (Ie = t, t.b?.is_pending && (t.f & (we | ye | lt)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (v === null || (v.f & b) === 0))
        return;
      if ((r & (te | Z)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function _n() {
  try {
    tn();
  } catch (e) {
    H(e, Ie);
  }
}
let Y = null;
function Ze(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | K)) === 0 && be(r) && (Y = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), Y?.size > 0)) {
        W.clear();
        for (const i of Y) {
          if ((i.f & (j | K)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (j | K)) === 0 && ce(u);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function vt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? vt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (qe | J)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), Ye(
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
      if (ae.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && pt(
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
function gt(e, t) {
  if (!((e.f & Z) !== 0 && (e.f & y) !== 0)) {
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
function dn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Ve() && (M(n), In(() => (t === 0 && (r = qt(() => e(() => ge(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var vn = Se | _e;
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
  #v = dn(() => (this.#a = Ne(this.#o), () => {
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
      a.b = this, a.f |= Me, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ln(() => {
      this.#m();
    }, vn);
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), ue(() => {
      var n = this.#s = document.createDocumentFragment(), r = At();
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
        Yn(this.#e, t);
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
    dt(t, this.#d, this.#h);
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
    z(this.#i), O(this.#i), oe(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      z(n), O(r), oe(i);
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ue(() => {
      this.#c = !1, this.#a && Re(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#v(), M(
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
    this.#e && (L(this.#e), this.#e = null), this.#t && (L(this.#t), this.#t = null), this.#n && (L(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        an();
        return;
      }
      i = !0, s && ln(), this.#n !== null && Te(this.#n, () => {
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
            l.b = this, l.f |= Me, r(
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
    ue(() => {
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
function wn(e, t, n, r) {
  const i = yn;
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
    } catch (d) {
      (a.f & j) === 0 && H(d, a);
    }
    Ae();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = mt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ bn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ae();
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
    z(e), O(t), oe(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  z(null), O(null), oe(null), e && w?.deactivate();
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
function yn(e) {
  var t = b | k, n = v !== null && (v.f & b) !== 0 ? (
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
function bn(e, t, n) {
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
  ), a = !v, f = /* @__PURE__ */ new Map();
  return Pn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = st();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (d) {
      l.reject(d), Ae();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject($), f.delete(o);
      else {
        for (const d of f.values())
          d.reject($);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (d, _ = void 0) => {
      if (h) {
        var g = _ === $;
        h(g);
      }
      if (!(_ === $ || (u.f & j) !== 0)) {
        if (o.activate(), _)
          s.f |= G, Re(s, _);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Re(s, d);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject($);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), Dn(() => {
    for (const u of f.values())
      u.reject($);
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
function En(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      L(
        /** @type {Effect} */
        t[n]
      );
  }
}
function xn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function $e(e) {
  var t, n = p;
  z(xn(e));
  try {
    e.f &= ~ne, En(e), t = It(e);
  } finally {
    z(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = $e(e);
  if (!e.equals(n) && (e.wv = Mt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ie || (F !== null ? (Ve() || w?.is_fork) && F.set(e, n) : ze(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Gt, t.ac = null, me(t, 0), Be(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let je = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let Et = !1;
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
  return $n(n), n;
}
function U(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (v.f & Ge) !== 0) && ct() && (v.f & (b | J | qe | Ge)) !== 0 && (N === null || !ae.call(N, e)) && sn();
  let r = n ? de(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ie ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && $e(s), F === null && ze(s);
    }
    e.wv = Mt(), xt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (Z | te)) === 0 && (A === null ? Un([e]) : A.push(e)), !i.is_fork && je.size > 0 && !Et && kn();
  }
  return t;
}
function kn() {
  Et = !1;
  for (const e of je)
    (e.f & y) !== 0 && m(e, q), be(e) && ce(e);
  je.clear();
}
function Sn(e, t = 1) {
  var n = M(e), r = t === 1 ? n++ : n--;
  return U(e, n), r;
}
function ge(e) {
  U(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        F?.delete(l), (f & ne) === 0 && (f & R && (a.f |= ne), xt(l, q, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & J) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ye(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Kt(e);
  if (t !== Bt && t !== Ht)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yt(e), i = /* @__PURE__ */ I(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var u = v, l = ee;
    O(null), et(s);
    var o = f();
    return O(u), et(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
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
          var h = /* @__PURE__ */ I(l.value);
          return n.set(u, h), h;
        }) : U(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ I(E));
            n.set(u, o), ge(i);
          }
        } else
          U(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === De)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || pe(f, u)?.writable) && (o = a(() => {
          var d = de(h ? f[u] : E), _ = /* @__PURE__ */ I(d);
          return _;
        }), n.set(u, o)), o !== void 0) {
          var c = M(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = M(o));
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
            var c = o ? de(f[u]) : E, d = /* @__PURE__ */ I(c);
            return d;
          }), n.set(u, l));
          var h = M(l);
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
            var _ = n.get(d + "");
            _ !== void 0 ? U(_, E) : d in f && (_ = a(() => /* @__PURE__ */ I(E)), n.set(d + "", _));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = a(() => /* @__PURE__ */ I(void 0)), U(h, de(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => de(l));
          U(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(u);
            Number.isInteger(se) && se >= D.v && U(D, se + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        M(i);
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
var Je, Tt, kt, St;
function An() {
  if (Je === void 0) {
    Je = window, Tt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kt = pe(t, "firstChild").get, St = pe(t, "nextSibling").get, He(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), He(n) && (n.__t = void 0);
  }
}
function At(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ Rt(e);
}
function Qe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
  return r;
}
function Rn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(un, e, void 0)
  );
}
function Nt(e) {
  var t = v, n = p;
  O(null), z(null);
  try {
    return e();
  } finally {
    O(t), z(n);
  }
}
function Nn(e) {
  p === null && (v === null && en(), Xt()), ie && Qt();
}
function On(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function V(e, t) {
  var n = p;
  n !== null && (n.f & K) !== 0 && (e |= K);
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
    fe !== null ? fe.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & J) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && On(i, n), v !== null && (v.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ve() {
  return v !== null && !C;
}
function Dn(e) {
  const t = V(ye, null);
  return m(t, y), t.teardown = e, t;
}
function Fn(e) {
  return V(we | ft, e);
}
function Cn(e) {
  return Nn(), V(ye | ft, e);
}
function Mn(e) {
  re.ensure();
  const t = V(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function Pn(e) {
  return V(qe | _e, e);
}
function In(e, t = 0) {
  return V(ye | t, e);
}
function jn(e, t = [], n = [], r = []) {
  wn(r, t, n, (i) => {
    V(ye, () => e(...i.map(M)));
  });
}
function Ln(e, t = 0) {
  var n = V(J | t, e);
  return n;
}
function Q(e) {
  return V(Z | _e, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = v;
    Xe(!0), O(null);
    try {
      t.call(null);
    } finally {
      Xe(n), O(r);
    }
  }
}
function Be(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function qn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Z) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & Zt) !== 0) && e.nodes !== null && e.nodes.end !== null && (zn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ke), Be(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ot(e), e.f ^= Ke, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function Dt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ft(e, t, n) {
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
      (i.f & Z) !== 0 && (e.f & J) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function Yn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let ke = !1, ie = !1;
function Xe(e) {
  ie = e;
}
let v = null, C = !1;
function O(e) {
  v = e;
}
let p = null;
function z(e) {
  p = e;
}
let N = null;
function $n(e) {
  v !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function Un(e) {
  A = e;
}
let Ct = 1, X = 0, ee = X;
function et(e) {
  ee = e;
}
function Mt() {
  return ++Ct;
}
function be(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
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
    F === null && m(e, y);
  }
  return !1;
}
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ae.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Pt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, q), Ye(
        /** @type {Effect} */
        s
      ));
    }
}
function It(e) {
  var t = T, n = S, r = A, i = v, s = N, a = P, f = C, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, v = (l & (Z | te)) === 0 ? e : null, N = null, oe(e.ctx), C = !1, ee = ++X, e.ac !== null && (Nt(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= Pe;
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
      if (Ve() && (e.f & R) !== 0)
        for (_ = S; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !d && c !== null && S < c.length && (me(e, S), c.length = S);
    if (ct() && A !== null && !C && c !== null && (e.f & (b | q | k)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      A.length; _++)
        Pt(
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
    return (e.f & G) !== 0 && (e.f ^= G), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= Pe, T = t, S = n, A = r, v = i, N = s, oe(a), C = f, ee = u;
  }
}
function Vn(e, t) {
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
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), ze(s), Tn(s), me(s, 0);
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
  if ((t & j) === 0) {
    m(e, y);
    var n = p, r = ke;
    p = e, ke = !0;
    try {
      (t & (J | lt)) !== 0 ? qn(e) : Be(e), Ot(e);
      var i = It(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ct;
      var s;
    } finally {
      ke = r, p = n;
    }
  }
}
function M(e) {
  var t = e.f, n = (t & b) !== 0;
  if (v !== null && !C) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (N === null || !ae.call(N, e))) {
      var i = v.deps;
      if ((v.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ae.call(s, v) || s.push(v);
      }
    }
  }
  if (ie && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Lt(a)) && (f = $e(a)), W.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !C && v !== null && (ke || (v.f & R) !== 0), l = (a.f & he) === 0;
    be(a) && (u && (a.f |= R), yt(a)), u && !l && (bt(a), jt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function jt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (bt(
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
    if (W.has(t) || (t.f & b) !== 0 && Lt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qt(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const tt = globalThis.Deno?.core?.ops ?? null;
function Bn(e, ...t) {
  tt?.[e] ? tt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nt(e, t) {
  Bn("op_set_text", e, t);
}
const Hn = ["touchstart", "touchmove"];
function Kn(e) {
  return Hn.includes(e);
}
const ve = Symbol("events"), zt = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Gn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    zt.add(e[t]);
  for (var n of Le)
    n(e);
}
let rt = null;
function it(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  rt = e;
  var a = 0, f = rt === e && e[ve];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    O(null), z(null);
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
      e[ve] = t, delete e.currentTarget, O(o), z(h);
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
  var t = Rn("template");
  return t.innerHTML = Jn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function er(e, t) {
  var n = (t & fn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(r));
    var s = (
      /** @type {TemplateNode} */
      n || Tt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function tr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function nr(e, t) {
  return rr(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function rr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  An();
  var u = void 0, l = Mn(() => {
    var o = n ?? t.appendChild(At());
    pn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        at({});
        var _ = (
          /** @type {ComponentContext} */
          P
        );
        s && (_.c = s), i && (r.$$events = i), u = e(d, r) || {}, ot();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var g = d[_];
        if (!h.has(g)) {
          h.add(g);
          var x = Kn(g);
          for (const Oe of [t, document]) {
            var D = Ee.get(Oe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), Ee.set(Oe, D));
            var se = D.get(g);
            se === void 0 ? (Oe.addEventListener(g, it, { passive: x }), D.set(g, 1)) : D.set(g, se + 1);
          }
        }
      }
    };
    return c(Ut(zt)), Le.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            _.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, it), _.delete(d), _.size === 0 && Ee.delete(x)) : _.set(d, g);
        }
      Le.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return ir.set(u, l), u;
}
let ir = /* @__PURE__ */ new WeakMap();
var sr = /* @__PURE__ */ er("<div><div> </div> <div> </div> <button>Increment</button></div>");
function lr(e, t) {
  at(t, !0);
  let n = /* @__PURE__ */ I(0), r = /* @__PURE__ */ I("initial");
  Cn(() => {
    const o = M(n);
    qt(() => {
      U(r, o === 0 ? "zero" : `pre-${o}`, !0);
    });
  });
  var i = sr(), s = Ce(i), a = Ce(s), f = Qe(s, 2), u = Ce(f), l = Qe(f, 2);
  jn(() => {
    nt(a, `Count: ${M(n) ?? ""}`), nt(u, `Status: ${M(r) ?? ""}`);
  }), Gn("click", l, () => Sn(n)), tr(e, i), ot();
}
Wn(["click"]);
function ur(e) {
  return nr(lr, { target: e });
}
export {
  ur as default,
  ur as rvst_mount
};

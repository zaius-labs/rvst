var Yt = Array.isArray, zt = Array.prototype.indexOf, ce = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Bt = Object.prototype, Ht = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Gt = () => {
};
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Ne = 8, ft = 1 << 24, Z = 16, V = 32, te = 64, Ie = 128, N = 512, y = 1024, S = 2048, $ = 4096, K = 8192, j = 16384, se = 32768, Ze = 1 << 25, Se = 65536, Je = 1 << 17, Zt = 1 << 18, ve = 1 << 19, Jt = 1 << 20, ne = 65536, je = 1 << 21, ze = 1 << 22, G = 1 << 23, Fe = Symbol("$state"), z = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Qt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Xt(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function en() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function tn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
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
function ut(e) {
  return e === this.v;
}
let D = null;
function he(e) {
  D = e;
}
function at(e, t = !1, n) {
  D = {
    p: D,
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
    D
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ot(r);
  }
  return t.i = !0, D = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let fe = [];
function cn() {
  var e = fe;
  fe = [], Wt(e);
}
function oe(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && cn();
    });
  }
  fe.push(e);
}
function ht(e) {
  var t = p;
  if (t === null)
    return _.f |= G, e;
  if ((t.f & se) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
      if ((t.f & se) === 0)
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
function Ue(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, $);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), dt(e.deps), m(e, y);
}
const B = /* @__PURE__ */ new Set();
let w = null, M = null, Le = null, Ce = !1, ue = null, xe = null;
var Qe = 0;
let dn = 1;
class re {
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
        m(r, S), this.schedule(r);
      for (r of n.m)
        m(r, $), this.schedule(r);
    }
  }
  #h() {
    if (Qe++ > 1e3 && (B.delete(this), vn()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), m(u, S), this.schedule(u);
      for (const u of this.#n)
        m(u, $), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ue = [], r = [], i = xe = [];
    for (const u of t)
      try {
        this.#a(u, n, r);
      } catch (f) {
        throw wt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (ue = null, xe = null, this.#c() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [u, f] of this.#s)
        gt(u, f);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
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
      var s = i.f, a = (s & (V | te)) !== 0, u = a && (s & y) !== 0, f = u || (s & K) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), de(i));
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
      vt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & G) === 0 && (this.current.set(t, [t.v, r]), M?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, M = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#h();
    } finally {
      Qe = 0, Le = null, ue = null, xe = null, Ce = !1, w = null, M = null, W.clear();
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
    this.#o || r || (this.#o = !0, oe(() => {
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
      Ce || (B.add(w), oe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      M = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Le = t, t.b?.is_pending && (t.f & (we | Ne | ft)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | V)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function vn() {
  try {
    nn();
  } catch (e) {
    H(e, Le);
  }
}
let Y = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | K)) === 0 && ye(r) && (Y = /* @__PURE__ */ new Set(), de(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), Y?.size > 0)) {
        W.clear();
        for (const i of Y) {
          if ((i.f & (j | K)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (j | K)) === 0 && de(f);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function _t(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? _t(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (ze | Z)) !== 0 && (s & S) === 0 && pt(i, t, r) && (m(i, S), Ve(
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
      if (ce.call(t, i))
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
function Ve(e) {
  w.schedule(e);
}
function gt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), m(e, y);
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
    Ke() && (T(n), In(() => (t === 0 && (r = qe(() => e(() => ge(n)))), t += 1, () => {
      oe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var pn = Se | ve;
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
  #_ = _n(() => (this.#a = Oe(this.#o), () => {
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
    }, pn);
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), oe(() => {
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
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vt(t, this.#v, this.#h);
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
    var n = p, r = _, i = D;
    q(this.#i), F(this.#i), he(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      q(n), F(r), he(i);
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, oe(() => {
      this.#c = !1, this.#a && Re(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), T(
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
        on();
        return;
      }
      i = !0, s && fn(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
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
            l.b = this, l.f |= Ie, r(
              this.#l,
              () => f,
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
    oe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (l) {
        H(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => H(l, this.#i && this.#i.parent)
      ) : u(f);
    });
  }
}
function mn(e, t, n, r) {
  const i = bn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = yn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (v) {
      (a.f & j) === 0 && H(v, a);
    }
    Ae();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = mt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Ae();
  }) : h();
}
function yn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = D, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    q(e), F(t), he(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  q(null), F(null), he(null), e && w?.deactivate();
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
function bn(e) {
  var t = b | S, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: D,
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
function En(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Qt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !_, u = /* @__PURE__ */ new Map();
  return Pn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (v) {
      l.reject(v), Ae();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & se) !== 0)
        var h = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(z), u.delete(o);
      else {
        for (const v of u.values())
          v.reject(z);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === z;
        h(g);
      }
      if (!(d === z || (f.f & j) !== 0)) {
        if (o.activate(), d)
          s.f |= G, Re(s, d);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Re(s, v);
          for (const [x, C] of u) {
            if (u.delete(x), x === o) break;
            C.reject(z);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Fn(() => {
    for (const f of u.values())
      f.reject(z);
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
function xn(e) {
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
function Tn(e) {
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
function Be(e) {
  var t, n = p;
  q(Tn(e));
  try {
    e.f &= ~ne, xn(e), t = jt(e);
  } finally {
    q(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = Be(e);
  if (!e.equals(n) && (e.wv = Pt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ie || (M !== null ? (Ke() || w?.is_fork) && M.set(e, n) : Ue(e));
}
function kn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = Gt, t.ac = null, me(t, 0), Ge(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && de(t);
}
let $e = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let Et = !1;
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
function I(e, t) {
  const n = Oe(e);
  return zn(n), n;
}
function U(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (_.f & Je) !== 0) && ct() && (_.f & (b | Z | ze | Je)) !== 0 && (O === null || !ce.call(O, e)) && ln();
  let r = n ? ae(t) : t;
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
      (e.f & S) !== 0 && Be(s), M === null && Ue(s);
    }
    e.wv = Pt(), xt(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (V | te)) === 0 && (R === null ? Un([e]) : R.push(e)), !i.is_fork && $e.size > 0 && !Et && Sn();
  }
  return t;
}
function Sn() {
  Et = !1;
  for (const e of $e)
    (e.f & y) !== 0 && m(e, $), ye(e) && de(e);
  $e.clear();
}
function An(e, t = 1) {
  var n = T(e), r = t === 1 ? n++ : n--;
  return U(e, n), r;
}
function ge(e) {
  U(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & S) === 0;
      if (f && m(a, t), (u & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        M?.delete(l), (u & ne) === 0 && (u & N && (a.f |= ne), xt(l, $, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Z) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function ae(e) {
  if (typeof e != "object" || e === null || Fe in e)
    return e;
  const t = Kt(e);
  if (t !== Bt && t !== Ht)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yt(e), i = /* @__PURE__ */ I(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var f = _, l = ee;
    F(null), nt(s);
    var o = u();
    return F(f), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && rn();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ I(l.value);
          return n.set(f, h), h;
        }) : U(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ I(E));
            n.set(f, o), ge(i);
          }
        } else
          U(l, E), ge(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Fe)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || pe(u, f)?.writable) && (o = a(() => {
          var v = ae(h ? u[f] : E), d = /* @__PURE__ */ I(v);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = T(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = T(o));
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
        if (f === Fe)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || pe(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ae(u[f]) : E, v = /* @__PURE__ */ I(c);
            return v;
          }), n.set(f, l));
          var h = T(l);
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
            d !== void 0 ? U(d, E) : v in u && (d = a(() => /* @__PURE__ */ I(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || pe(u, f)?.writable) && (h = a(() => /* @__PURE__ */ I(void 0)), U(h, ae(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => ae(l));
          U(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(f);
            Number.isInteger(le) && le >= C.v && U(C, le + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(u) {
        T(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        sn();
      }
    }
  );
}
var et, Tt, kt, St;
function Rn() {
  if (et === void 0) {
    et = window, Tt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kt = pe(t, "firstChild").get, St = pe(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
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
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function be(e, t) {
  return /* @__PURE__ */ Rt(e);
}
function Me(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function Nn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(an, e, void 0)
  );
}
function Nt(e) {
  var t = _, n = p;
  F(null), q(null);
  try {
    return e();
  } finally {
    F(t), q(n);
  }
}
function On(e) {
  p === null && (_ === null && tn(), en()), ie && Xt();
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & K) !== 0 && (e |= K);
  var r = {
    ctx: D,
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
    ue !== null ? ue.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      de(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Z) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && Dn(i, n), _ !== null && (_.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return _ !== null && !P;
}
function Fn(e) {
  const t = J(Ne, null);
  return m(t, y), t.teardown = e, t;
}
function Cn(e) {
  On();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !_ && (t & V) !== 0 && (t & se) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      D
    );
    (r.e ??= []).push(e);
  } else
    return Ot(e);
}
function Ot(e) {
  return J(we | Jt, e);
}
function Mn(e) {
  re.ensure();
  const t = J(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function Pn(e) {
  return J(ze | ve, e);
}
function In(e, t = 0) {
  return J(Ne | t, e);
}
function jn(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    J(Ne, () => e(...i.map(T)));
  });
}
function Ln(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(V | ve, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = _;
    tt(!0), F(null);
    try {
      t.call(null);
    } finally {
      tt(n), F(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function $n(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & Zt) !== 0) && e.nodes !== null && e.nodes.end !== null && (qn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), Ge(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= Ze, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function qn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Ct(e, t, n) {
  if ((e.f & K) === 0) {
    e.f ^= K;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Se) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & Z) !== 0;
      Ct(i, t, a ? n : !1), i = s;
    }
  }
}
function Yn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let ke = !1, ie = !1;
function tt(e) {
  ie = e;
}
let _ = null, P = !1;
function F(e) {
  _ = e;
}
let p = null;
function q(e) {
  p = e;
}
let O = null;
function zn(e) {
  _ !== null && (O === null ? O = [e] : O.push(e));
}
let k = null, A = 0, R = null;
function Un(e) {
  R = e;
}
let Mt = 1, X = 0, ee = X;
function nt(e) {
  ee = e;
}
function Pt() {
  return ++Mt;
}
function ye(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & $) !== 0) {
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
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    M === null && m(e, y);
  }
  return !1;
}
function It(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ce.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? It(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, $), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function jt(e) {
  var t = k, n = A, r = R, i = _, s = O, a = D, u = P, f = ee, l = e.f;
  k = /** @type {null | Value[]} */
  null, A = 0, R = null, _ = (l & (V | te)) === 0 ? e : null, O = null, he(e.ctx), P = !1, ee = ++X, e.ac !== null && (Nt(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (k !== null) {
      var d;
      if (v || me(e, A), c !== null && A > 0)
        for (c.length = A + k.length, d = 0; d < k.length; d++)
          c[A + d] = k[d];
      else
        e.deps = c = k;
      if (Ke() && (e.f & N) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (me(e, A), c.length = A);
    if (ct() && R !== null && !P && c !== null && (e.f & (b | $ | S)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        It(
          R[d],
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
    return (e.f & G) !== 0 && (e.f ^= G), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= je, k = t, A = n, R = r, _ = i, O = s, he(a), P = u, ee = f;
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
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (k === null || !ce.call(k, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), Ue(s), kn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vn(e, n[r]);
}
function de(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, y);
    var n = p, r = ke;
    p = e, ke = !0;
    try {
      (t & (Z | ft)) !== 0 ? $n(e) : Ge(e), Dt(e);
      var i = jt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mt;
      var s;
    } finally {
      ke = r, p = n;
    }
  }
}
function T(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !P) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (O === null || !ce.call(O, e))) {
      var i = _.deps;
      if ((_.f & je) !== 0)
        e.rv < X && (e.rv = X, k === null && i !== null && i[A] === e ? A++ : k === null ? k = [e] : k.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ce.call(s, _) || s.push(_);
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
      var u = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || $t(a)) && (u = Be(a)), W.set(a, u), u;
    }
    var f = (a.f & N) === 0 && !P && _ !== null && (ke || (_.f & N) !== 0), l = (a.f & se) === 0;
    ye(a) && (f && (a.f |= N), yt(a)), f && !l && (bt(a), Lt(a));
  }
  if (M?.has(e))
    return M.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function Lt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & N) === 0 && (bt(
        /** @type {Derived} */
        t
      ), Lt(
        /** @type {Derived} */
        t
      ));
}
function $t(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & b) !== 0 && $t(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qe(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Bn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Pe(e, t) {
  Bn("op_set_text", e, t);
}
const Hn = ["touchstart", "touchmove"];
function Kn(e) {
  return Hn.includes(e);
}
const _e = Symbol("events"), qt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function Gn(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    qt.add(e[t]);
  for (var n of Ye)
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
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    F(null), q(null);
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
      e[_e] = t, delete e.currentTarget, F(o), q(h);
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
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function er(e, t) {
  var n = (t & un) !== 0, r, i = !e.startsWith("<!>");
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
function rr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  Rn();
  var f = void 0, l = Mn(() => {
    var o = n ?? t.appendChild(At());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        at({});
        var d = (
          /** @type {ComponentContext} */
          D
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, ot();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Kn(g);
          for (const De of [t, document]) {
            var C = Ee.get(De);
            C === void 0 && (C = /* @__PURE__ */ new Map(), Ee.set(De, C));
            var le = C.get(g);
            le === void 0 ? (De.addEventListener(g, st, { passive: x }), C.set(g, 1)) : C.set(g, le + 1);
          }
        }
      }
    };
    return c(Ut(qt)), Ye.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, st), d.delete(v), d.size === 0 && Ee.delete(x)) : d.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return ir.set(f, l), f;
}
let ir = /* @__PURE__ */ new WeakMap();
var sr = /* @__PURE__ */ er("<div><div> </div> <div> </div> <div> </div> <button>Increment</button></div>");
function lr(e, t) {
  at(t, !0);
  let n = /* @__PURE__ */ I(0), r = /* @__PURE__ */ I(ae([]));
  Cn(() => {
    const v = T(n), d = qe(() => T(r).length);
    U(
      r,
      [
        ...qe(() => T(r)),
        `snap-${v}-prev${d}`
      ],
      !0
    );
  });
  function i() {
    An(n);
  }
  var s = sr(), a = be(s), u = be(a), f = Me(a, 2), l = be(f), o = Me(f, 2), h = be(o), c = Me(o, 2);
  jn(() => {
    Pe(u, `Count: ${T(n) ?? ""}`), Pe(l, `Snapshots: ${T(r).length ?? ""}`), Pe(h, `Last: ${T(r)[T(r).length - 1] ?? "none" ?? ""}`);
  }), Gn("click", c, i), tr(e, s), ot();
}
Wn(["click"]);
function ur(e) {
  return nr(lr, { target: e });
}
export {
  ur as default,
  ur as rvst_mount
};

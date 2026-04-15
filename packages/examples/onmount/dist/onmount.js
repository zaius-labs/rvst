var zt = Array.isArray, Ut = Array.prototype.indexOf, ae = Array.prototype.includes, Vt = Array.from, $t = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Bt = Object.prototype, Ht = Array.prototype, Kt = Object.getPrototypeOf, He = Object.isExtensible;
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
const b = 2, we = 4, Re = 8, lt = 1 << 24, Z = 16, $ = 32, te = 64, Fe = 128, N = 512, y = 1024, k = 2048, Y = 4096, K = 8192, L = 16384, se = 32768, Ke = 1 << 25, ke = 65536, Ge = 1 << 17, Zt = 1 << 18, de = 1 << 19, Jt = 1 << 20, ne = 65536, Pe = 1 << 21, qe = 1 << 22, G = 1 << 23, De = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Qt(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Xt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function en(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function tn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function nn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
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
function un() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const on = 2, E = Symbol(), an = "http://www.w3.org/1999/xhtml";
function cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ft(e) {
  return e === this.v;
}
let A = null;
function ce(e) {
  A = e;
}
function ut(e, t = !1, n) {
  A = {
    p: A,
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
    A
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Nt(r);
  }
  return t.i = !0, A = t.p, /** @type {T} */
  {};
}
function at() {
  return !0;
}
let fe = [];
function hn() {
  var e = fe;
  fe = [], Wt(e);
}
function oe(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && hn();
    });
  }
  fe.push(e);
}
function ct(e) {
  var t = p;
  if (t === null)
    return _.f |= G, e;
  if ((t.f & se) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Fe) !== 0) {
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
const dn = -7169;
function m(e, t) {
  e.f = e.f & dn | t;
}
function Ye(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, Y);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), ht(e.deps), m(e, y);
}
const B = /* @__PURE__ */ new Set();
let w = null, C = null, Ie = null, Me = !1, ue = null, Ee = null;
var We = 0;
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
  #a = !1;
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
        m(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (We++ > 1e3 && (B.delete(this), vn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, Y), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ue = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw gt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (ue = null, Ee = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [f, u] of this.#s)
        pt(f, u);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Ze(r), Ze(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    o !== null && (B.add(o), o.#h()), B.has(this) || this.#w();
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
      var s = i.f, o = (s & ($ | te)) !== 0, f = o && (s & y) !== 0, u = f || (s & K) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), he(i));
        var l = i.first;
        if (l !== null) {
          i = l;
          continue;
        }
      }
      for (; i !== null; ) {
        var a = i.next;
        if (a !== null) {
          i = a;
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & G) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Me = !0, w = this, this.#h();
    } finally {
      We = 0, Ie = null, ue = null, Ee = null, Me = !1, w = null, C = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), B.delete(this);
  }
  #w() {
    for (const l of B) {
      var t = l.id < this.id, n = [];
      for (const [a, [h, c]] of this.current) {
        if (l.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(a)[0]
          );
          if (t && h !== r)
            l.current.set(a, [h, c]);
          else
            continue;
        }
        n.push(a);
      }
      var i = [...l.current.keys()].filter((a) => !this.current.has(a));
      if (i.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of n)
          _t(f, i, s, o);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#o(u, [], []);
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
    this.#a || r || (this.#a = !0, oe(() => {
      this.#a = !1, this.flush();
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
    return (this.#i ??= st()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Me || (B.add(w), oe(() => {
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
    if (Ie = t, t.b?.is_pending && (t.f & (we | Re | lt)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | $)) !== 0) {
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
    rn();
  } catch (e) {
    H(e, Ie);
  }
}
let U = null;
function Ze(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | K)) === 0 && ye(r) && (U = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), U?.size > 0)) {
        W.clear();
        for (const i of U) {
          if ((i.f & (L | K)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            U.has(o) && (U.delete(o), s.push(o)), o = o.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (L | K)) === 0 && he(u);
          }
        }
        U.clear();
      }
    }
    U = null;
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
      ) : (s & (qe | Z)) !== 0 && (s & k) === 0 && vt(i, t, r) && (m(i, k), ze(
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
      if ((i.f & b) !== 0 && vt(
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
function pt(e, t) {
  if (!((e.f & $) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      pt(n, t), n = n.next;
  }
}
function gt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    gt(t), t = t.next;
}
function pn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    $e() && (j(n), jn(() => (t === 0 && (r = qt(() => e(() => ge(n)))), t += 1, () => {
      oe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var gn = ke | de;
function wn(e, t, n, r) {
  new mn(e, t, n, r);
}
class mn {
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
  #a = 0;
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
  #o = null;
  #v = pn(() => (this.#o = Ne(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#l = t, this.#r = n, this.#f = (s) => {
      var o = (
        /** @type {Effect} */
        p
      );
      o.b = this, o.f |= Fe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = qn(() => {
      this.#m();
    }, gn);
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
      var n = this.#s = document.createDocumentFragment(), r = St();
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Un(this.#e, t);
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    dt(t, this.#_, this.#h);
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
    var n = p, r = _, i = A;
    z(this.#i), D(this.#i), ce(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      z(n), D(r), ce(i);
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
    this.#y(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, oe(() => {
      this.#c = !1, this.#o && Ae(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#v(), j(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && (q(this.#e), this.#e = null), this.#t && (q(this.#t), this.#t = null), this.#n && (q(this.#n), this.#n = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        cn();
        return;
      }
      i = !0, s && un(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, o), s = !1;
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
            l.b = this, l.f |= Fe, r(
              this.#l,
              () => u,
              () => o
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
function yn(e, t, n, r) {
  const i = En;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    p
  ), f = bn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (o.f & L) === 0 && H(v, o);
    }
    Se();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var a = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ xn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, o)).finally(() => a());
  }
  u ? u.then(() => {
    f(), h(), Se();
  }) : h();
}
function bn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = A, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), D(t), ce(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  z(null), D(null), ce(null), e && w?.deactivate();
}
function wt() {
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
function En(e) {
  var t = b | k, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: A,
    deps: null,
    effects: null,
    equals: ft,
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
function xn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Xt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), o = !_, f = /* @__PURE__ */ new Map();
  return In(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = st();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (v) {
      l.reject(v), Se();
    }
    var a = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((u.f & se) !== 0)
        var h = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(a)?.reject(V), f.delete(a);
      else {
        for (const v of f.values())
          v.reject(V);
        f.clear();
      }
      f.set(a, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === V;
        h(g);
      }
      if (!(d === V || (u.f & L) !== 0)) {
        if (a.activate(), d)
          s.f |= G, Ae(s, d);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Ae(s, v);
          for (const [x, M] of f) {
            if (f.delete(x), x === a) break;
            M.reject(V);
          }
        }
        a.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Cn(() => {
    for (const u of f.values())
      u.reject(V);
  }), new Promise((u) => {
    function l(a) {
      function h() {
        a === i ? u(s) : l(i);
      }
      a.then(h, h);
    }
    l(i);
  });
}
function Tn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      q(
        /** @type {Effect} */
        t[n]
      );
  }
}
function kn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ue(e) {
  var t, n = p;
  z(kn(e));
  try {
    e.f &= ~ne, Tn(e), t = It(e);
  } finally {
    z(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ie || (C !== null ? ($e() || w?.is_fork) && C.set(e, n) : Ye(e));
}
function Sn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Gt, t.ac = null, me(t, 0), Be(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let je = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let bt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ft,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Ne(e);
  return Vn(n), n;
}
function I(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (_.f & Ge) !== 0) && at() && (_.f & (b | Z | qe | Ge)) !== 0 && (O === null || !ae.call(O, e)) && fn();
  let r = n ? _e(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ie ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ue(s), C === null && Ye(s);
    }
    e.wv = Ft(), Et(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & ($ | te)) === 0 && (R === null ? $n([e]) : R.push(e)), !i.is_fork && je.size > 0 && !bt && An();
  }
  return t;
}
function An() {
  bt = !1;
  for (const e of je)
    (e.f & y) !== 0 && m(e, Y), ye(e) && he(e);
  je.clear();
}
function Rn(e, t = 1) {
  var n = j(e), r = t === 1 ? n++ : n--;
  return I(e, n), r;
}
function ge(e) {
  I(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], f = o.f, u = (f & k) === 0;
      if (u && m(o, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        C?.delete(l), (f & ne) === 0 && (f & N && (o.f |= ne), Et(l, Y, n));
      } else if (u) {
        var a = (
          /** @type {Effect} */
          o
        );
        (f & Z) !== 0 && U !== null && U.add(a), n !== null ? n.push(a) : ze(a);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Kt(e);
  if (t !== Bt && t !== Ht)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zt(e), i = /* @__PURE__ */ P(0), s = ee, o = (f) => {
    if (ee === s)
      return f();
    var u = _, l = ee;
    D(null), et(s);
    var a = f();
    return D(u), et(l), a;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && sn();
        var a = n.get(u);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ P(l.value);
          return n.set(u, h), h;
        }) : I(a, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const a = o(() => /* @__PURE__ */ P(E));
            n.set(u, a), ge(i);
          }
        } else
          I(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === De)
          return e;
        var a = n.get(u), h = u in f;
        if (a === void 0 && (!h || pe(f, u)?.writable) && (a = o(() => {
          var v = _e(h ? f[u] : E), d = /* @__PURE__ */ P(v);
          return d;
        }), n.set(u, a)), a !== void 0) {
          var c = j(a);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var a = n.get(u);
          a && (l.value = j(a));
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
        var l = n.get(u), a = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!a || pe(f, u)?.writable)) {
          l === void 0 && (l = o(() => {
            var c = a ? _e(f[u]) : E, v = /* @__PURE__ */ P(c);
            return v;
          }), n.set(u, l));
          var h = j(l);
          if (h === E)
            return !1;
        }
        return a;
      },
      set(f, u, l, a) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? I(d, E) : v in f && (d = o(() => /* @__PURE__ */ P(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = o(() => /* @__PURE__ */ P(void 0)), I(h, _e(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = o(() => _e(l));
          I(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(a, l), !c) {
          if (r && typeof u == "string") {
            var M = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(u);
            Number.isInteger(le) && le >= M.v && I(M, le + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        j(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, a] of n)
          a.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        ln();
      }
    }
  );
}
var Je, xt, Tt, kt;
function Nn() {
  if (Je === void 0) {
    Je = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = pe(t, "firstChild").get, kt = pe(t, "nextSibling").get, He(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), He(n) && (n.__t = void 0);
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
function Ce(e, t) {
  return /* @__PURE__ */ At(e);
}
function Qe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function On(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(an, e, void 0)
  );
}
function Rt(e) {
  var t = _, n = p;
  D(null), z(null);
  try {
    return e();
  } finally {
    D(t), z(n);
  }
}
function Dn(e) {
  p === null && (_ === null && nn(), tn()), ie && en();
}
function Mn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & K) !== 0 && (e |= K);
  var r = {
    ctx: A,
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
    ue !== null ? ue.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (o) {
      throw q(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Mn(i, n), _ !== null && (_.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function $e() {
  return _ !== null && !F;
}
function Cn(e) {
  const t = J(Re, null);
  return m(t, y), t.teardown = e, t;
}
function Fn(e) {
  Dn();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !_ && (t & $) !== 0 && (t & se) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      A
    );
    (r.e ??= []).push(e);
  } else
    return Nt(e);
}
function Nt(e) {
  return J(we | Jt, e);
}
function Pn(e) {
  re.ensure();
  const t = J(te | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function In(e) {
  return J(qe | de, e);
}
function jn(e, t = 0) {
  return J(Re | t, e);
}
function Ln(e, t = [], n = [], r = []) {
  yn(r, t, n, (i) => {
    J(Re, () => e(...i.map(j)));
  });
}
function qn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J($ | de, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = _;
    Xe(!0), D(null);
    try {
      t.call(null);
    } finally {
      Xe(n), D(r);
    }
  }
}
function Be(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(V);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function Yn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & $) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
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
  Ot(e), e.f ^= Ke, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zn(e, t) {
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
  Mt(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Mt(e, t, n) {
  if ((e.f & K) === 0) {
    e.f ^= K;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & $) !== 0 && (e.f & Z) !== 0;
      Mt(i, t, o ? n : !1), i = s;
    }
  }
}
function Un(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let Te = !1, ie = !1;
function Xe(e) {
  ie = e;
}
let _ = null, F = !1;
function D(e) {
  _ = e;
}
let p = null;
function z(e) {
  p = e;
}
let O = null;
function Vn(e) {
  _ !== null && (O === null ? O = [e] : O.push(e));
}
let T = null, S = 0, R = null;
function $n(e) {
  R = e;
}
let Ct = 1, X = 0, ee = X;
function et(e) {
  ee = e;
}
function Ft() {
  return ++Ct;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & Y) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
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
    C === null && m(e, y);
  }
  return !1;
}
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ae.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Pt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, Y), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function It(e) {
  var t = T, n = S, r = R, i = _, s = O, o = A, f = F, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, _ = (l & ($ | te)) === 0 ? e : null, O = null, ce(e.ctx), F = !1, ee = ++X, e.ac !== null && (Rt(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || me(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if ($e() && (e.f & N) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (me(e, S), c.length = S);
    if (at() && R !== null && !F && c !== null && (e.f & (b | Y | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        Pt(
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
    return ct(g);
  } finally {
    e.f ^= Pe, T = t, S = n, R = r, _ = i, O = s, ce(o), F = f, ee = u;
  }
}
function Bn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ut.call(n, e);
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
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), Ye(s), Sn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Bn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | lt)) !== 0 ? Yn(e) : Be(e), Ot(e);
      var i = It(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ct;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function j(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !F) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (O === null || !ae.call(O, e))) {
      var i = _.deps;
      if ((_.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ie && W.has(e))
    return W.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var f = o.v;
      return ((o.f & y) === 0 && o.reactions !== null || Lt(o)) && (f = Ue(o)), W.set(o, f), f;
    }
    var u = (o.f & N) === 0 && !F && _ !== null && (Te || (_.f & N) !== 0), l = (o.f & se) === 0;
    ye(o) && (u && (o.f |= N), mt(o)), u && !l && (yt(o), jt(o));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function jt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & N) === 0 && (yt(
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
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const tt = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  tt?.[e] ? tt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nt(e, t) {
  Hn("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function Gn(e) {
  return Kn.includes(e);
}
const ve = Symbol("events"), Yt = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Wn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Zn(e) {
  for (var t = 0; t < e.length; t++)
    Yt.add(e[t]);
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
  var o = 0, f = rt === e && e[ve];
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
    u <= l && (o = u);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    $t(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = _, h = p;
    D(null), z(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
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
      e[ve] = t, delete e.currentTarget, D(a), z(h);
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
  var t = On("template");
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
  var n = (t & on) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Xn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
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
const be = /* @__PURE__ */ new Map();
function ir(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: f }) {
  Nn();
  var u = void 0, l = Pn(() => {
    var a = n ?? t.appendChild(St());
    wn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (v) => {
        ut({});
        var d = (
          /** @type {ComponentContext} */
          A
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, ot();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Gn(g);
          for (const Oe of [t, document]) {
            var M = be.get(Oe);
            M === void 0 && (M = /* @__PURE__ */ new Map(), be.set(Oe, M));
            var le = M.get(g);
            le === void 0 ? (Oe.addEventListener(g, it, { passive: x }), M.set(g, 1)) : M.set(g, le + 1);
          }
        }
      }
    };
    return c(Vt(Yt)), Le.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, it), d.delete(v), d.size === 0 && be.delete(x)) : d.set(v, g);
        }
      Le.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return sr.set(u, l), u;
}
let sr = /* @__PURE__ */ new WeakMap();
function lr(e) {
  A === null && Qt(), Fn(() => {
    const t = qt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
var fr = /* @__PURE__ */ tr("<div><div> </div> <button>Click</button> <div> </div></div>");
function ur(e, t) {
  ut(t, !0);
  let n = /* @__PURE__ */ P("waiting"), r = /* @__PURE__ */ P(0);
  lr(() => (I(n, "mounted"), () => {
    I(n, "destroyed");
  }));
  var i = fr(), s = Ce(i), o = Ce(s), f = Qe(s, 2), u = Qe(f, 2), l = Ce(u);
  Ln(() => {
    nt(o, `Status: ${j(n) ?? ""}`), nt(l, `Clicks: ${j(r) ?? ""}`);
  }), Wn("click", f, () => Rn(r)), nr(e, i), ot();
}
Zn(["click"]);
function ar(e) {
  return rr(ur, { target: e });
}
export {
  ar as default,
  ar as rvst_mount
};

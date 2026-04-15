var Pt = Array.isArray, An = Array.prototype.indexOf, ke = Array.prototype.includes, Ke = Array.from, Nn = Object.defineProperty, Pe = Object.getOwnPropertyDescriptor, Rn = Object.prototype, Cn = Array.prototype, Fn = Object.getPrototypeOf, yt = Object.isExtensible;
const Mn = () => {
};
function On(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function It() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const R = 2, Le = 4, Ge = 8, zt = 1 << 24, ae = 16, G = 32, pe = 64, rt = 128, q = 512, A = 1024, M = 2048, J = 4096, z = 8192, $ = 16384, Re = 32768, mt = 1 << 25, qe = 65536, bt = 1 << 17, Dn = 1 << 18, Ce = 1 << 19, Pn = 1 << 20, ne = 1 << 25, ge = 65536, it = 1 << 21, ot = 1 << 22, fe = 1 << 23, Qe = Symbol("$state"), te = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function In() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function zn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Ln() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function qn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function jn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Yn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Vn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Hn = 1, $n = 2, Bn = 16, Un = 2, C = Symbol(), Wn = "http://www.w3.org/1999/xhtml";
function Kn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Lt(e) {
  return e === this.v;
}
function Gn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function qt(e) {
  return !Gn(e, this.v);
}
let U = null;
function Te(e) {
  U = e;
}
function Jn(e, t = !1, n) {
  U = {
    p: U,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      b
    ),
    l: null
  };
}
function Xn(e) {
  var t = (
    /** @type {ComponentContext} */
    U
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Sr(r);
  }
  return t.i = !0, U = t.p, /** @type {T} */
  {};
}
function jt() {
  return !0;
}
let ve = [];
function Yt() {
  var e = ve;
  ve = [], On(e);
}
function xe(e) {
  if (ve.length === 0 && !Ie) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && Yt();
    });
  }
  ve.push(e);
}
function Zn() {
  for (; ve.length > 0; )
    Yt();
}
function Vt(e) {
  var t = b;
  if (t === null)
    return g.f |= fe, e;
  if ((t.f & Re) === 0 && (t.f & Le) === 0)
    throw e;
  se(e, t);
}
function se(e, t) {
  for (; t !== null; ) {
    if ((t.f & rt) !== 0) {
      if ((t.f & Re) === 0)
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
const Qn = -7169;
function T(e, t) {
  e.f = e.f & Qn | t;
}
function at(e) {
  (e.f & q) !== 0 || e.deps === null ? T(e, A) : T(e, J);
}
function Ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & R) === 0 || (t.f & ge) === 0 || (t.f ^= ge, Ht(
        /** @type {Derived} */
        t.deps
      ));
}
function $t(e, t, n) {
  (e.f & M) !== 0 ? t.add(e) : (e.f & J) !== 0 && n.add(e), Ht(e.deps), T(e, A);
}
const ie = /* @__PURE__ */ new Set();
let m = null, V = null, lt = null, Ie = !1, et = !1, me = null, $e = null;
var xt = 0;
let er = 1;
class oe {
  id = er++;
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
  #s = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #v = /* @__PURE__ */ new Set();
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
  #l = /* @__PURE__ */ new Map();
  is_fork = !1;
  #a = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #h() {
    for (const r of this.#u)
      for (const i of r.#f.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#l.has(n)) {
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
    this.#l.has(t) || this.#l.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#l.get(t);
    if (n) {
      this.#l.delete(t);
      for (var r of n.d)
        T(r, M), this.schedule(r);
      for (r of n.m)
        T(r, J), this.schedule(r);
    }
  }
  #d() {
    if (xt++ > 1e3 && (ie.delete(this), nr()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), T(s, M), this.schedule(s);
      for (const s of this.#n)
        T(s, J), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = me = [], r = [], i = $e = [];
    for (const s of t)
      try {
        this.#o(s, n, r);
      } catch (u) {
        throw Kt(s), u;
      }
    if (m = null, i.length > 0) {
      var l = oe.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (me = null, $e = null, this.#c() || this.#h()) {
      this.#_(r), this.#_(n);
      for (const [s, u] of this.#l)
        Wt(s, u);
    } else {
      this.#r.size === 0 && ie.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), Et(r), Et(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#e.length > 0) {
      const s = o ??= this;
      s.#e.push(...this.#e.filter((u) => !s.#e.includes(u)));
    }
    o !== null && (ie.add(o), o.#d()), ie.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= A;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & (G | pe)) !== 0, s = o && (l & A) !== 0, u = s || (l & z) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= A : (l & Le) !== 0 ? n.push(i) : Ye(i) && ((l & ae) !== 0 && this.#n.add(i), Ne(i));
        var f = i.first;
        if (f !== null) {
          i = f;
          continue;
        }
      }
      for (; i !== null; ) {
        var c = i.next;
        if (c !== null) {
          i = c;
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
      $t(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== C && !this.previous.has(t) && this.previous.set(t, n), (t.f & fe) === 0 && (this.current.set(t, [t.v, r]), V?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, V = null;
  }
  flush() {
    try {
      et = !0, m = this, this.#d();
    } finally {
      xt = 0, lt = null, me = null, $e = null, et = !1, m = null, V = null, ue.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), ie.delete(this);
  }
  #w() {
    for (const f of ie) {
      var t = f.id < this.id, n = [];
      for (const [c, [v, d]] of this.current) {
        if (f.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(c)[0]
          );
          if (t && v !== r)
            f.current.set(c, [v, d]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...f.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var s of n)
          Bt(s, i, l, o);
        if (f.#e.length > 0) {
          f.apply();
          for (var u of f.#e)
            f.#o(u, [], []);
          f.#e = [];
        }
        f.deactivate();
      }
    }
    for (const f of ie)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#c() && (f.activate(), f.#d()));
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
      let l = this.#f.get(n) ?? 0;
      l === 1 ? this.#f.delete(n) : this.#f.set(n, l - 1);
    }
    this.#a || r || (this.#a = !0, xe(() => {
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
    this.#s.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= It()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new oe();
      et || (ie.add(m), Ie || xe(() => {
        m === t && t.flush();
      }));
    }
    return m;
  }
  apply() {
    {
      V = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (lt = t, t.b?.is_pending && (t.f & (Le | Ge | zt)) !== 0 && (t.f & Re) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (me !== null && n === b && (g === null || (g.f & R) === 0))
        return;
      if ((r & (pe | G)) !== 0) {
        if ((r & A) === 0)
          return;
        n.f ^= A;
      }
    }
    this.#e.push(n);
  }
}
function tr(e) {
  var t = Ie;
  Ie = !0;
  try {
    for (var n; ; ) {
      if (Zn(), m === null)
        return (
          /** @type {T} */
          n
        );
      m.flush();
    }
  } finally {
    Ie = t;
  }
}
function nr() {
  try {
    Ln();
  } catch (e) {
    se(e, lt);
  }
}
let ee = null;
function Et(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & ($ | z)) === 0 && Ye(r) && (ee = /* @__PURE__ */ new Set(), Ne(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && un(r), ee?.size > 0)) {
        ue.clear();
        for (const i of ee) {
          if ((i.f & ($ | z)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            ee.has(o) && (ee.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const u = l[s];
            (u.f & ($ | z)) === 0 && Ne(u);
          }
        }
        ee.clear();
      }
    }
    ee = null;
  }
}
function Bt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & R) !== 0 ? Bt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (ot | ae)) !== 0 && (l & M) === 0 && Ut(i, t, r) && (T(i, M), ct(
        /** @type {Effect} */
        i
      ));
    }
}
function Ut(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ke.call(t, i))
        return !0;
      if ((i.f & R) !== 0 && Ut(
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
function ct(e) {
  m.schedule(e);
}
function Wt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & A) !== 0)) {
    (e.f & M) !== 0 ? t.d.push(e) : (e.f & J) !== 0 && t.m.push(e), T(e, A);
    for (var n = e.first; n !== null; )
      Wt(n, t), n = n.next;
  }
}
function Kt(e) {
  T(e, A);
  for (var t = e.first; t !== null; )
    Kt(t), t = t.next;
}
function rr(e) {
  let t = 0, n = we(0), r;
  return () => {
    _t() && (p(n), ln(() => (t === 0 && (r = mn(() => e(() => ze(n)))), t += 1, () => {
      xe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ze(n));
      });
    })));
  };
}
var ir = qe | Ce;
function lr(e, t, n, r) {
  new sr(e, t, n, r);
}
class sr {
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
  #s;
  /** @type {TemplateNode | null} */
  #v = null;
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
  #l = null;
  #a = 0;
  #u = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
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
  #_ = rr(() => (this.#o = we(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var o = (
        /** @type {Effect} */
        b
      );
      o.b = this, o.f |= rt, r(l);
    }, this.parent = /** @type {Effect} */
    b.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = sn(() => {
      this.#y();
    }, ir);
  }
  #w() {
    try {
      this.#e = K(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#r.failed;
    n && (this.#n = K(() => {
      n(
        this.#s,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #x() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = K(() => t(this.#s)), xe(() => {
      var n = this.#l = document.createDocumentFragment(), r = We();
      n.append(r), this.#e = this.#g(() => K(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, Ee(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = K(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        dn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = K(() => n(this.#s));
      } else
        this.#p(
          /** @type {Batch} */
          m
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    $t(t, this.#h, this.#d);
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
    var n = b, r = g, i = U;
    X(this.#i), Y(this.#i), Te(this.#i.ctx);
    try {
      return oe.ensure(), t();
    } catch (l) {
      return Vt(l), null;
    } finally {
      X(n), Y(r), Te(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && Ee(this.#t, () => {
      this.#t = null;
    }), this.#l && (this.#s.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#m(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, xe(() => {
      this.#c = !1, this.#o && Se(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), p(
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
    this.#e && (B(this.#e), this.#e = null), this.#t && (B(this.#t), this.#t = null), this.#n && (B(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Kn();
        return;
      }
      i = !0, l && Vn(), this.#n !== null && Ee(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
      });
    }, s = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (f) {
        se(f, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return K(() => {
            var f = (
              /** @type {Effect} */
              b
            );
            f.b = this, f.f |= rt, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (f) {
          return se(
            f,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    xe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (f) {
        se(f, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        s,
        /** @param {unknown} e */
        (f) => se(f, this.#i && this.#i.parent)
      ) : s(u);
    });
  }
}
function fr(e, t, n, r) {
  const i = dt;
  var l = e.filter((d) => !d.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    b
  ), s = ur(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((d) => d.promise)) : null;
  function f(d) {
    s();
    try {
      r(d);
    } catch (h) {
      (o.f & $) === 0 && se(h, o);
    }
    Ue();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(i)));
    return;
  }
  var c = Gt();
  function v() {
    Promise.all(n.map((d) => /* @__PURE__ */ or(d))).then((d) => f([...t.map(i), ...d])).catch((d) => se(d, o)).finally(() => c());
  }
  u ? u.then(() => {
    s(), v(), Ue();
  }) : v();
}
function ur() {
  var e = (
    /** @type {Effect} */
    b
  ), t = g, n = U, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    X(e), Y(t), Te(n), l && (e.f & $) === 0 && (r?.activate(), r?.apply());
  };
}
function Ue(e = !0) {
  X(null), Y(null), Te(null), e && m?.deactivate();
}
function Gt() {
  var e = (
    /** @type {Effect} */
    b
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    m
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function dt(e) {
  var t = R | M, n = g !== null && (g.f & R) !== 0 ? (
    /** @type {Derived} */
    g
  ) : null;
  return b !== null && (b.f |= Ce), {
    ctx: U,
    deps: null,
    effects: null,
    equals: Lt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      C
    ),
    wv: 0,
    parent: n ?? b,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function or(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    b
  );
  r === null && In();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = we(
    /** @type {V} */
    C
  ), o = !g, s = /* @__PURE__ */ new Map();
  return Nr(() => {
    var u = (
      /** @type {Effect} */
      b
    ), f = It();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Ue);
    } catch (h) {
      f.reject(h), Ue();
    }
    var c = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((u.f & Re) !== 0)
        var v = Gt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(c)?.reject(te), s.delete(c);
      else {
        for (const h of s.values())
          h.reject(te);
        s.clear();
      }
      s.set(c, f);
    }
    const d = (h, a = void 0) => {
      if (v) {
        var _ = a === te;
        v(_);
      }
      if (!(a === te || (u.f & $) !== 0)) {
        if (c.activate(), a)
          l.f |= fe, Se(l, a);
        else {
          (l.f & fe) !== 0 && (l.f ^= fe), Se(l, h);
          for (const [x, w] of s) {
            if (s.delete(x), x === c) break;
            w.reject(te);
          }
        }
        c.deactivate();
      }
    };
    f.promise.then(d, (h) => d(null, h || "unknown"));
  }), Tr(() => {
    for (const u of s.values())
      u.reject(te);
  }), new Promise((u) => {
    function f(c) {
      function v() {
        c === i ? u(l) : f(i);
      }
      c.then(v, v);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function ar(e) {
  const t = /* @__PURE__ */ dt(e);
  return vn(t), t;
}
// @__NO_SIDE_EFFECTS__
function cr(e) {
  const t = /* @__PURE__ */ dt(e);
  return t.equals = qt, t;
}
function dr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      B(
        /** @type {Effect} */
        t[n]
      );
  }
}
function vr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & R) === 0)
      return (t.f & $) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function vt(e) {
  var t, n = b;
  X(vr(e));
  try {
    e.f &= ~ge, dr(e), t = gn(e);
  } finally {
    X(n);
  }
  return t;
}
function Jt(e) {
  var t = e.v, n = vt(e);
  if (!e.equals(n) && (e.wv = _n(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t, !0), e.deps === null))) {
    T(e, A);
    return;
  }
  Ae || (V !== null ? (_t() || m?.is_fork) && V.set(e, n) : at(e));
}
function hr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(te), t.teardown = Mn, t.ac = null, je(t, 0), pt(t));
}
function Xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ne(t);
}
let st = /* @__PURE__ */ new Set();
const ue = /* @__PURE__ */ new Map();
let Zt = !1;
function we(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Lt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function O(e, t) {
  const n = we(e);
  return vn(n), n;
}
// @__NO_SIDE_EFFECTS__
function _r(e, t = !1, n = !0) {
  const r = we(e);
  return t || (r.equals = qt), r;
}
function y(e, t, n = !1) {
  g !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!H || (g.f & bt) !== 0) && jt() && (g.f & (R | ae | ot | bt)) !== 0 && (j === null || !ke.call(j, e)) && Yn();
  let r = n ? be(t) : t;
  return Se(e, r, $e);
}
function Se(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ae ? ue.set(e, t) : ue.set(e, r), e.v = t;
    var i = oe.ensure();
    if (i.capture(e, r), (e.f & R) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & M) !== 0 && vt(l), V === null && at(l);
    }
    e.wv = _n(), Qt(e, M, n), b !== null && (b.f & A) !== 0 && (b.f & (G | pe)) === 0 && (L === null ? Fr([e]) : L.push(e)), !i.is_fork && st.size > 0 && !Zt && pr();
  }
  return t;
}
function pr() {
  Zt = !1;
  for (const e of st)
    (e.f & A) !== 0 && T(e, J), Ye(e) && Ne(e);
  st.clear();
}
function gr(e, t = 1) {
  var n = p(e), r = t === 1 ? n++ : n--;
  return y(e, n), r;
}
function ze(e) {
  y(e, e.v + 1);
}
function Qt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], s = o.f, u = (s & M) === 0;
      if (u && T(o, t), (s & R) !== 0) {
        var f = (
          /** @type {Derived} */
          o
        );
        V?.delete(f), (s & ge) === 0 && (s & q && (o.f |= ge), Qt(f, J, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (s & ae) !== 0 && ee !== null && ee.add(c), n !== null ? n.push(c) : ct(c);
      }
    }
}
function be(e) {
  if (typeof e != "object" || e === null || Qe in e)
    return e;
  const t = Fn(e);
  if (t !== Rn && t !== Cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Pt(e), i = /* @__PURE__ */ O(0), l = _e, o = (s) => {
    if (_e === l)
      return s();
    var u = g, f = _e;
    Y(null), Nt(l);
    var c = s();
    return Y(u), Nt(f), c;
  };
  return r && n.set("length", /* @__PURE__ */ O(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && qn();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ O(f.value);
          return n.set(u, v), v;
        }) : y(c, f.value, !0), !0;
      },
      deleteProperty(s, u) {
        var f = n.get(u);
        if (f === void 0) {
          if (u in s) {
            const c = o(() => /* @__PURE__ */ O(C));
            n.set(u, c), ze(i);
          }
        } else
          y(f, C), ze(i);
        return !0;
      },
      get(s, u, f) {
        if (u === Qe)
          return e;
        var c = n.get(u), v = u in s;
        if (c === void 0 && (!v || Pe(s, u)?.writable) && (c = o(() => {
          var h = be(v ? s[u] : C), a = /* @__PURE__ */ O(h);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var d = p(c);
          return d === C ? void 0 : d;
        }
        return Reflect.get(s, u, f);
      },
      getOwnPropertyDescriptor(s, u) {
        var f = Reflect.getOwnPropertyDescriptor(s, u);
        if (f && "value" in f) {
          var c = n.get(u);
          c && (f.value = p(c));
        } else if (f === void 0) {
          var v = n.get(u), d = v?.v;
          if (v !== void 0 && d !== C)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return f;
      },
      has(s, u) {
        if (u === Qe)
          return !0;
        var f = n.get(u), c = f !== void 0 && f.v !== C || Reflect.has(s, u);
        if (f !== void 0 || b !== null && (!c || Pe(s, u)?.writable)) {
          f === void 0 && (f = o(() => {
            var d = c ? be(s[u]) : C, h = /* @__PURE__ */ O(d);
            return h;
          }), n.set(u, f));
          var v = p(f);
          if (v === C)
            return !1;
        }
        return c;
      },
      set(s, u, f, c) {
        var v = n.get(u), d = u in s;
        if (r && u === "length")
          for (var h = f; h < /** @type {Source<number>} */
          v.v; h += 1) {
            var a = n.get(h + "");
            a !== void 0 ? y(a, C) : h in s && (a = o(() => /* @__PURE__ */ O(C)), n.set(h + "", a));
          }
        if (v === void 0)
          (!d || Pe(s, u)?.writable) && (v = o(() => /* @__PURE__ */ O(void 0)), y(v, be(f)), n.set(u, v));
        else {
          d = v.v !== C;
          var _ = o(() => be(f));
          y(v, _);
        }
        var x = Reflect.getOwnPropertyDescriptor(s, u);
        if (x?.set && x.set.call(c, f), !d) {
          if (r && typeof u == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), E = Number(u);
            Number.isInteger(E) && E >= w.v && y(w, E + 1);
          }
          ze(i);
        }
        return !0;
      },
      ownKeys(s) {
        p(i);
        var u = Reflect.ownKeys(s).filter((v) => {
          var d = n.get(v);
          return d === void 0 || d.v !== C;
        });
        for (var [f, c] of n)
          c.v !== C && !(f in s) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        jn();
      }
    }
  );
}
var kt, en, tn, nn;
function wr() {
  if (kt === void 0) {
    kt = window, en = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    tn = Pe(t, "firstChild").get, nn = Pe(t, "nextSibling").get, yt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), yt(n) && (n.__t = void 0);
  }
}
function We(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function rn(e) {
  return (
    /** @type {TemplateNode | null} */
    tn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Je(e) {
  return (
    /** @type {TemplateNode | null} */
    nn.call(e)
  );
}
function Q(e, t) {
  return /* @__PURE__ */ rn(e);
}
function W(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Je(r);
  return r;
}
function yr(e) {
  e.textContent = "";
}
function mr() {
  return !1;
}
function br(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Wn, e, void 0)
  );
}
let Tt = !1;
function xr() {
  Tt || (Tt = !0, document.addEventListener(
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
function ht(e) {
  var t = g, n = b;
  Y(null), X(null);
  try {
    return e();
  } finally {
    Y(t), X(n);
  }
}
function Er(e, t, n, r = n) {
  e.addEventListener(t, () => ht(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), xr();
}
function kr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ce(e, t) {
  var n = b;
  n !== null && (n.f & z) !== 0 && (e |= z);
  var r = {
    ctx: U,
    deps: null,
    nodes: null,
    f: e | M | q,
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
  if ((e & Le) !== 0)
    me !== null ? me.push(r) : oe.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ne(r);
    } catch (o) {
      throw B(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Ce) === 0 && (i = i.first, (e & ae) !== 0 && (e & qe) !== 0 && i !== null && (i.f |= qe));
  }
  if (i !== null && (i.parent = n, n !== null && kr(i, n), g !== null && (g.f & R) !== 0 && (e & pe) === 0)) {
    var l = (
      /** @type {Derived} */
      g
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function _t() {
  return g !== null && !H;
}
function Tr(e) {
  const t = ce(Ge, null);
  return T(t, A), t.teardown = e, t;
}
function Sr(e) {
  return ce(Le | Pn, e);
}
function Ar(e) {
  oe.ensure();
  const t = ce(pe | Ce, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Ee(t, () => {
      B(t), r(void 0);
    }) : (B(t), r(void 0));
  });
}
function Nr(e) {
  return ce(ot | Ce, e);
}
function ln(e, t = 0) {
  return ce(Ge | t, e);
}
function St(e, t = [], n = [], r = []) {
  fr(r, t, n, (i) => {
    ce(Ge, () => e(...i.map(p)));
  });
}
function sn(e, t = 0) {
  var n = ce(ae | t, e);
  return n;
}
function K(e) {
  return ce(G | Ce, e);
}
function fn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ae, r = g;
    At(!0), Y(null);
    try {
      t.call(null);
    } finally {
      At(n), Y(r);
    }
  }
}
function pt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && ht(() => {
      i.abort(te);
    });
    var r = n.next;
    (n.f & pe) !== 0 ? n.parent = null : B(n, t), n = r;
  }
}
function Rr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && B(t), t = n;
  }
}
function B(e, t = !0) {
  var n = !1;
  (t || (e.f & Dn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Cr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), T(e, mt), pt(e, t && !n), je(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  fn(e), e.f ^= mt, e.f |= $;
  var i = e.parent;
  i !== null && i.first !== null && un(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Cr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Je(e);
    e.remove(), e = n;
  }
}
function un(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ee(e, t, n = !0) {
  var r = [];
  on(e, r, !0);
  var i = () => {
    n && B(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var s of r)
      s.out(o);
  } else
    i();
}
function on(e, t, n) {
  if ((e.f & z) === 0) {
    e.f ^= z;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & qe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & ae) !== 0;
      on(i, t, o ? n : !1), i = l;
    }
  }
}
function an(e) {
  cn(e, !0);
}
function cn(e, t) {
  if ((e.f & z) !== 0) {
    e.f ^= z, (e.f & A) === 0 && (T(e, M), oe.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & qe) !== 0 || (n.f & G) !== 0;
      cn(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function dn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Je(n);
      t.append(n), n = i;
    }
}
let Be = !1, Ae = !1;
function At(e) {
  Ae = e;
}
let g = null, H = !1;
function Y(e) {
  g = e;
}
let b = null;
function X(e) {
  b = e;
}
let j = null;
function vn(e) {
  g !== null && (j === null ? j = [e] : j.push(e));
}
let D = null, I = 0, L = null;
function Fr(e) {
  L = e;
}
let hn = 1, he = 0, _e = he;
function Nt(e) {
  _e = e;
}
function _n() {
  return ++hn;
}
function Ye(e) {
  var t = e.f;
  if ((t & M) !== 0)
    return !0;
  if (t & R && (e.f &= ~ge), (t & J) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Ye(
        /** @type {Derived} */
        l
      ) && Jt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & q) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    V === null && T(e, A);
  }
  return !1;
}
function pn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(j !== null && ke.call(j, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & R) !== 0 ? pn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? T(l, M) : (l.f & A) !== 0 && T(l, J), ct(
        /** @type {Effect} */
        l
      ));
    }
}
function gn(e) {
  var t = D, n = I, r = L, i = g, l = j, o = U, s = H, u = _e, f = e.f;
  D = /** @type {null | Value[]} */
  null, I = 0, L = null, g = (f & (G | pe)) === 0 ? e : null, j = null, Te(e.ctx), H = !1, _e = ++he, e.ac !== null && (ht(() => {
    e.ac.abort(te);
  }), e.ac = null);
  try {
    e.f |= it;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= Re;
    var d = e.deps, h = m?.is_fork;
    if (D !== null) {
      var a;
      if (h || je(e, I), d !== null && I > 0)
        for (d.length = I + D.length, a = 0; a < D.length; a++)
          d[I + a] = D[a];
      else
        e.deps = d = D;
      if (_t() && (e.f & q) !== 0)
        for (a = I; a < d.length; a++)
          (d[a].reactions ??= []).push(e);
    } else !h && d !== null && I < d.length && (je(e, I), d.length = I);
    if (jt() && L !== null && !H && d !== null && (e.f & (R | J | M)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      L.length; a++)
        pn(
          L[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (he++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = he;
      if (t !== null)
        for (const _ of t)
          _.rv = he;
      L !== null && (r === null ? r = L : r.push(.../** @type {Source[]} */
      L));
    }
    return (e.f & fe) !== 0 && (e.f ^= fe), v;
  } catch (_) {
    return Vt(_);
  } finally {
    e.f ^= it, D = t, I = n, L = r, g = i, j = l, Te(o), H = s, _e = u;
  }
}
function Mr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = An.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & R) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (D === null || !ke.call(D, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & q) !== 0 && (l.f ^= q, l.f &= ~ge), at(l), hr(l), je(l, 0);
  }
}
function je(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Mr(e, n[r]);
}
function Ne(e) {
  var t = e.f;
  if ((t & $) === 0) {
    T(e, A);
    var n = b, r = Be;
    b = e, Be = !0;
    try {
      (t & (ae | zt)) !== 0 ? Rr(e) : pt(e), fn(e);
      var i = gn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = hn;
      var l;
    } finally {
      Be = r, b = n;
    }
  }
}
async function Or() {
  await Promise.resolve(), tr();
}
function p(e) {
  var t = e.f, n = (t & R) !== 0;
  if (g !== null && !H) {
    var r = b !== null && (b.f & $) !== 0;
    if (!r && (j === null || !ke.call(j, e))) {
      var i = g.deps;
      if ((g.f & it) !== 0)
        e.rv < he && (e.rv = he, D === null && i !== null && i[I] === e ? I++ : D === null ? D = [e] : D.push(e));
      else {
        (g.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [g] : ke.call(l, g) || l.push(g);
      }
    }
  }
  if (Ae && ue.has(e))
    return ue.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Ae) {
      var s = o.v;
      return ((o.f & A) === 0 && o.reactions !== null || yn(o)) && (s = vt(o)), ue.set(o, s), s;
    }
    var u = (o.f & q) === 0 && !H && g !== null && (Be || (g.f & q) !== 0), f = (o.f & Re) === 0;
    Ye(o) && (u && (o.f |= q), Jt(o)), u && !f && (Xt(o), wn(o));
  }
  if (V?.has(e))
    return V.get(e);
  if ((e.f & fe) !== 0)
    throw e.v;
  return e.v;
}
function wn(e) {
  if (e.f |= q, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & R) !== 0 && (t.f & q) === 0 && (Xt(
        /** @type {Derived} */
        t
      ), wn(
        /** @type {Derived} */
        t
      ));
}
function yn(e) {
  if (e.v === C) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ue.has(t) || (t.f & R) !== 0 && yn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function mn(e) {
  var t = H;
  try {
    return H = !0, e();
  } finally {
    H = t;
  }
}
const Rt = globalThis.Deno?.core?.ops ?? null;
function Dr(e, ...t) {
  Rt?.[e] ? Rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ve(e, t) {
  Dr("op_set_text", e, t);
}
const Pr = ["touchstart", "touchmove"];
function Ir(e) {
  return Pr.includes(e);
}
const Oe = Symbol("events"), bn = /* @__PURE__ */ new Set(), ft = /* @__PURE__ */ new Set();
function Fe(e, t, n) {
  (t[Oe] ??= {})[e] = n;
}
function zr(e) {
  for (var t = 0; t < e.length; t++)
    bn.add(e[t]);
  for (var n of ft)
    n(e);
}
let Ct = null;
function Ft(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Ct = e;
  var o = 0, s = Ct === e && e[Oe];
  if (s) {
    var u = i.indexOf(s);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Oe] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    u <= f && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    Nn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = g, v = b;
    Y(null), X(null);
    try {
      for (var d, h = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Oe]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (x) {
          d ? h.push(x) : d = x;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (d) {
        for (let x of h)
          queueMicrotask(() => {
            throw x;
          });
        throw d;
      }
    } finally {
      e[Oe] = t, delete e.currentTarget, Y(c), X(v);
    }
  }
}
const Lr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function qr(e) {
  return (
    /** @type {string} */
    Lr?.createHTML(e) ?? e
  );
}
function jr(e) {
  var t = br("template");
  return t.innerHTML = qr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Yr(e, t) {
  var n = (
    /** @type {Effect} */
    b
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function xn(e, t) {
  var n = (t & Un) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = jr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ rn(r));
    var l = (
      /** @type {TemplateNode} */
      n || en ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Yr(l, l), l;
  };
}
function Mt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Vr(e, t) {
  return Hr(e, t);
}
const He = /* @__PURE__ */ new Map();
function Hr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: s }) {
  wr();
  var u = void 0, f = Ar(() => {
    var c = n ?? t.appendChild(We());
    lr(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (h) => {
        Jn({});
        var a = (
          /** @type {ComponentContext} */
          U
        );
        l && (a.c = l), i && (r.$$events = i), u = e(h, r) || {}, Xn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), d = (h) => {
      for (var a = 0; a < h.length; a++) {
        var _ = h[a];
        if (!v.has(_)) {
          v.add(_);
          var x = Ir(_);
          for (const F of [t, document]) {
            var w = He.get(F);
            w === void 0 && (w = /* @__PURE__ */ new Map(), He.set(F, w));
            var E = w.get(_);
            E === void 0 ? (F.addEventListener(_, Ft, { passive: x }), w.set(_, 1)) : w.set(_, E + 1);
          }
        }
      }
    };
    return d(Ke(bn)), ft.add(d), () => {
      for (var h of v)
        for (const x of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            He.get(x)
          ), _ = (
            /** @type {number} */
            a.get(h)
          );
          --_ == 0 ? (x.removeEventListener(h, Ft), a.delete(h), a.size === 0 && He.delete(x)) : a.set(h, _);
        }
      ft.delete(d), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return $r.set(u, f), u;
}
let $r = /* @__PURE__ */ new WeakMap();
function Br(e, t) {
  return t;
}
function Ur(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, s = 0; s < i; s++) {
    let v = t[s];
    Ee(
      v,
      () => {
        if (l) {
          if (l.pending.delete(v), l.done.add(v), l.pending.size === 0) {
            var d = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            ut(e, Ke(l.done)), d.delete(l), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var u = r.length === 0 && n !== null;
    if (u) {
      var f = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        f.parentNode
      );
      yr(c), c.append(f), e.items.clear();
    }
    ut(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function ut(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const s of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(s).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= ne;
      const o = document.createDocumentFragment();
      dn(l, o);
    } else
      B(t[i], n);
  }
}
var Ot;
function Wr(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), u = null, f = /* @__PURE__ */ cr(() => {
    var w = n();
    return Pt(w) ? w : w == null ? [] : Ke(w);
  }), c, v = /* @__PURE__ */ new Map(), d = !0;
  function h(w) {
    (x.effect.f & $) === 0 && (x.pending.delete(w), x.fallback = u, Kr(x, c, o, t, r), u !== null && (c.length === 0 ? (u.f & ne) === 0 ? an(u) : (u.f ^= ne, De(u, null, o)) : Ee(u, () => {
      u = null;
    })));
  }
  function a(w) {
    x.pending.delete(w);
  }
  var _ = sn(() => {
    c = /** @type {V[]} */
    p(f);
    for (var w = c.length, E = /* @__PURE__ */ new Set(), F = (
      /** @type {Batch} */
      m
    ), re = mr(), P = 0; P < w; P += 1) {
      var de = c[P], Z = r(de, P), S = d ? null : s.get(Z);
      S ? (S.v && Se(S.v, de), S.i && Se(S.i, P), re && F.unskip_effect(S.e)) : (S = Gr(
        s,
        d ? o : Ot ??= We(),
        de,
        Z,
        P,
        i,
        t,
        n
      ), d || (S.e.f |= ne), s.set(Z, S)), E.add(Z);
    }
    if (w === 0 && l && !u && (d ? u = K(() => l(o)) : (u = K(() => l(Ot ??= We())), u.f |= ne)), w > E.size && zn(), !d)
      if (v.set(F, E), re) {
        for (const [Xe, Ze] of s)
          E.has(Xe) || F.skip_effect(Ze.e);
        F.oncommit(h), F.ondiscard(a);
      } else
        h(F);
    p(f);
  }), x = { effect: _, items: s, pending: v, outrogroups: null, fallback: u };
  d = !1;
}
function Me(e) {
  for (; e !== null && (e.f & G) === 0; )
    e = e.next;
  return e;
}
function Kr(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Me(e.effect.first), u, f = null, c = [], v = [], d, h, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (d = t[_], h = i(d, _), a = /** @type {EachItem} */
    o.get(h).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & z) !== 0 && an(a), (a.f & ne) !== 0)
      if (a.f ^= ne, a === s)
        De(a, null, n);
      else {
        var x = f ? f.next : s;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), le(e, f, a), le(e, a, x), De(a, x, n), f = a, c = [], v = [], s = Me(f.next);
        continue;
      }
    if (a !== s) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < v.length) {
          var w = v[0], E;
          f = w.prev;
          var F = c[0], re = c[c.length - 1];
          for (E = 0; E < c.length; E += 1)
            De(c[E], w, n);
          for (E = 0; E < v.length; E += 1)
            u.delete(v[E]);
          le(e, F.prev, re.next), le(e, f, F), le(e, re, w), s = w, f = re, _ -= 1, c = [], v = [];
        } else
          u.delete(a), De(a, s, n), le(e, a.prev, a.next), le(e, a, f === null ? e.effect.first : f.next), le(e, f, a), f = a;
        continue;
      }
      for (c = [], v = []; s !== null && s !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Me(s.next);
      if (s === null)
        continue;
    }
    (a.f & ne) === 0 && c.push(a), f = a, s = Me(a.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (ut(e, Ke(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || u !== void 0) {
    var P = [];
    if (u !== void 0)
      for (a of u)
        (a.f & z) === 0 && P.push(a);
    for (; s !== null; )
      (s.f & z) === 0 && s !== e.fallback && P.push(s), s = Me(s.next);
    var de = P.length;
    if (de > 0) {
      var Z = null;
      Ur(e, P, Z);
    }
  }
}
function Gr(e, t, n, r, i, l, o, s) {
  var u = (o & Hn) !== 0 ? (o & Bn) === 0 ? /* @__PURE__ */ _r(n, !1, !1) : we(n) : null, f = (o & $n) !== 0 ? we(i) : null;
  return {
    v: u,
    i: f,
    e: K(() => (l(t, u ?? n, f ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function De(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & ne) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Je(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function le(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Jr(e, t) {
  return e == null ? null : String(e);
}
function Xr(e, t, n, r) {
  var i = e.__style;
  if (i !== t) {
    var l = Jr(t);
    l == null ? e.removeAttribute("style") : e.style.cssText = l, e.__style = t;
  }
  return r;
}
function Dt(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Er(e, "input", async (i) => {
    var l = i ? e.defaultValue : e.value;
    if (l = tt(e) ? nt(l) : l, n(l), m !== null && r.add(m), await Or(), l !== (l = t())) {
      var o = e.selectionStart, s = e.selectionEnd, u = e.value.length;
      if (e.value = l ?? "", s !== null) {
        var f = e.value.length;
        o === s && s === u && f > u ? (e.selectionStart = f, e.selectionEnd = f) : (e.selectionStart = o, e.selectionEnd = Math.min(s, f));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  mn(t) == null && e.value && (n(tt(e) ? nt(e.value) : e.value), m !== null && r.add(m)), ln(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        m
      );
      if (r.has(l))
        return;
    }
    tt(e) && i === nt(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function tt(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function nt(e) {
  return e === "" ? null : +e;
}
var Zr = /* @__PURE__ */ xn("<button> </button>"), Qr = /* @__PURE__ */ xn('<div style="display: flex; flex-direction: column; width: 100%; height: 100%; font-family: sans-serif; font-size: 14px;"><div style="display: flex; gap: 8px; padding: 8px; background: #1a1a2e; color: #e0e0e0;"><span style="font-weight: bold;">Notepad</span> <span style="flex: 1;"></span> <button>New</button> <button>Delete</button> <button>Save</button> <button>Load</button> <span> </span></div> <div style="display: flex; flex: 1;"><div style="display: flex; flex-direction: column; width: 160px; background: #16213e; padding: 8px; gap: 4px; overflow: auto;"><div> </div> <!></div> <div style="display: flex; flex-direction: column; flex: 1; padding: 16px; gap: 8px;"><input placeholder="Title" style="font-size: 18px; padding: 4px;"/> <textarea placeholder="Write your note..." style="flex: 1; padding: 8px; font-size: 14px; resize: none;"></textarea> <div> </div></div></div></div>');
function ei(e) {
  let t = /* @__PURE__ */ O(be([{ id: 1, title: "Welcome", body: "Your first note." }])), n = /* @__PURE__ */ O(2), r = /* @__PURE__ */ O(1), i = /* @__PURE__ */ O("Welcome"), l = /* @__PURE__ */ O("Your first note."), o = /* @__PURE__ */ O(""), s = /* @__PURE__ */ ar(() => p(t).length);
  function u(k) {
    f(), y(r, k, !0);
    const N = p(t).find((ye) => ye.id === k);
    N && (y(i, N.title, !0), y(l, N.body, !0));
  }
  function f() {
    y(
      t,
      p(t).map((k) => k.id === p(r) ? { ...k, title: p(i), body: p(l) } : k),
      !0
    );
  }
  function c() {
    f();
    const k = gr(n), N = { id: k, title: `Note ${k}`, body: "" };
    y(t, [...p(t), N], !0), y(r, k, !0), y(i, N.title, !0), y(l, N.body, !0);
  }
  function v() {
    p(t).length <= 1 || (y(t, p(t).filter((k) => k.id !== p(r)), !0), y(r, p(t)[0].id, !0), y(i, p(t)[0].title, !0), y(l, p(t)[0].body, !0));
  }
  function d() {
    f();
    const k = JSON.stringify(p(t), null, 2), N = __rvst.fs.writeText("/tmp/rvst_notepad.json", k);
    y(o, N ? "saved" : "error", !0);
  }
  function h() {
    const k = __rvst.fs.readText("/tmp/rvst_notepad.json");
    if (k)
      try {
        const N = JSON.parse(k);
        Array.isArray(N) && N.length > 0 && (y(t, N, !0), y(r, p(t)[0].id, !0), y(i, p(t)[0].title, !0), y(l, p(t)[0].body, !0), y(o, "loaded"));
      } catch {
        y(o, "parse-error");
      }
    else
      y(o, "no-file");
  }
  var a = Qr(), _ = Q(a), x = W(Q(_), 4), w = W(x, 2), E = W(w, 2), F = W(E, 2), re = W(F, 2), P = Q(re), de = W(_, 2), Z = Q(de), S = Q(Z), Xe = Q(S), Ze = W(S, 2);
  Wr(Ze, 17, () => p(t), Br, (k, N) => {
    var ye = Zr(), Sn = Q(ye);
    St(() => {
      Xr(ye, p(N).id === p(r) ? "background: #0f3460; color: white; padding: 4px 8px; text-align: left;" : "padding: 4px 8px; text-align: left; color: #a0a0a0;"), Ve(Sn, p(N).title);
    }), Fe("click", ye, () => u(p(N).id)), Mt(k, ye);
  });
  var En = W(Z, 2), gt = Q(En), wt = W(gt, 2), kn = W(wt, 2), Tn = Q(kn);
  St(() => {
    Ve(P, `Status: ${(p(o) || "ready") ?? ""}`), Ve(Xe, `Notes: ${p(s) ?? ""}`), Ve(Tn, `Chars: ${p(l).length ?? ""}`);
  }), Fe("click", x, c), Fe("click", w, v), Fe("click", E, d), Fe("click", F, h), Dt(gt, () => p(i), (k) => y(i, k)), Dt(wt, () => p(l), (k) => y(l, k)), Mt(e, a);
}
zr(["click"]);
function ni(e) {
  return Vr(ei, { target: e });
}
export {
  ni as default,
  ni as rvst_mount
};

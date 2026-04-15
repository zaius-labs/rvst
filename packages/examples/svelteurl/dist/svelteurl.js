var Yt = Array.isArray, $t = Array.prototype.indexOf, fe = Array.prototype.includes, Vt = Array.from, Bt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Ht = Object.prototype, Gt = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Wt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function at() {
  var e, t, r = new Promise((n, s) => {
    e = n, t = s;
  });
  return { promise: r, resolve: e, reject: t };
}
const x = 2, me = 4, Re = 8, ft = 1 << 24, Z = 16, J = 32, re = 64, Me = 128, O = 512, E = 1024, R = 2048, z = 4096, G = 8192, U = 16384, pe = 32768, Je = 1 << 25, ke = 65536, Ze = 1 << 17, Zt = 1 << 18, de = 1 << 19, Qt = 1 << 20, ne = 65536, Le = 1 << 21, Ye = 1 << 22, K = 1 << 23, Oe = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Xt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function er() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function tr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function rr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function nr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function sr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const ir = 2, S = Symbol(), lr = "http://www.w3.org/1999/xhtml";
function ur() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let j = null;
function oe(e) {
  j = e;
}
function ht(e, t = !1, r) {
  j = {
    p: j,
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
function ct(e) {
  var t = (
    /** @type {ComponentContext} */
    j
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      Rr(n);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function pt() {
  return !0;
}
let le = [];
function ar() {
  var e = le;
  le = [], Jt(e);
}
function ae(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && ar();
    });
  }
  le.push(e);
}
function dt(e) {
  var t = g;
  if (t === null)
    return v.f |= K, e;
  if ((t.f & pe) === 0 && (t.f & me) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Me) !== 0) {
      if ((t.f & pe) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    }
    t = t.parent;
  }
  throw e;
}
const fr = -7169;
function b(e, t) {
  e.f = e.f & fr | t;
}
function $e(e) {
  (e.f & O) !== 0 || e.deps === null ? b(e, E) : b(e, z);
}
function _t(e) {
  if (e !== null)
    for (const t of e)
      (t.f & x) === 0 || (t.f & ne) === 0 || (t.f ^= ne, _t(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, r) {
  (e.f & R) !== 0 ? t.add(e) : (e.f & z) !== 0 && r.add(e), _t(e.deps), b(e, E);
}
const B = /* @__PURE__ */ new Set();
let y = null, M = null, je = null, De = !1, ue = null, Ee = null;
var Qe = 0;
let or = 1;
class se {
  id = or++;
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
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #a = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #t = /* @__PURE__ */ new Map();
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
  #s = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #n = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
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
  #u = /* @__PURE__ */ new Map();
  is_fork = !1;
  #h = !1;
  /** @type {Set<Batch>} */
  #f = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#r.size > 0;
  }
  #d() {
    for (const n of this.#f)
      for (const s of n.#r.keys()) {
        for (var t = !1, r = s; r.parent !== null; ) {
          if (this.#u.has(r)) {
            t = !0;
            break;
          }
          r = r.parent;
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
    this.#u.has(t) || this.#u.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var r = this.#u.get(t);
    if (r) {
      this.#u.delete(t);
      for (var n of r.d)
        b(n, R), this.schedule(n);
      for (n of r.m)
        b(n, z), this.schedule(n);
    }
  }
  #p() {
    if (Qe++ > 1e3 && (B.delete(this), hr()), !this.#c()) {
      for (const a of this.#i)
        this.#l.delete(a), b(a, R), this.schedule(a);
      for (const a of this.#l)
        b(a, z), this.schedule(a);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var r = ue = [], n = [], s = Ee = [];
    for (const a of t)
      try {
        this.#o(a, r, n);
      } catch (u) {
        throw yt(a), u;
      }
    if (y = null, s.length > 0) {
      var i = se.ensure();
      for (const a of s)
        i.schedule(a);
    }
    if (ue = null, Ee = null, this.#c() || this.#d()) {
      this.#_(n), this.#_(r);
      for (const [a, u] of this.#u)
        wt(a, u);
    } else {
      this.#t.size === 0 && B.delete(this), this.#i.clear(), this.#l.clear();
      for (const a of this.#e) a(this);
      this.#e.clear(), Xe(n), Xe(r), this.#s?.resolve();
    }
    var f = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      y
    );
    if (this.#n.length > 0) {
      const a = f ??= this;
      a.#n.push(...this.#n.filter((u) => !a.#n.includes(u)));
    }
    f !== null && (B.add(f), f.#p()), B.has(this) || this.#m();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, r, n) {
    t.f ^= E;
    for (var s = t.first; s !== null; ) {
      var i = s.f, f = (i & (J | re)) !== 0, a = f && (i & E) !== 0, u = a || (i & G) !== 0 || this.#u.has(s);
      if (!u && s.fn !== null) {
        f ? s.f ^= E : (i & me) !== 0 ? r.push(s) : ye(s) && ((i & Z) !== 0 && this.#l.add(s), ce(s));
        var l = s.first;
        if (l !== null) {
          s = l;
          continue;
        }
      }
      for (; s !== null; ) {
        var o = s.next;
        if (o !== null) {
          s = o;
          break;
        }
        s = s.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #_(t) {
    for (var r = 0; r < t.length; r += 1)
      vt(t[r], this.#i, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, r, n = !1) {
    r !== S && !this.previous.has(t) && this.previous.set(t, r), (t.f & K) === 0 && (this.current.set(t, [t.v, n]), M?.set(t, t.v));
  }
  activate() {
    y = this;
  }
  deactivate() {
    y = null, M = null;
  }
  flush() {
    try {
      De = !0, y = this, this.#p();
    } finally {
      Qe = 0, je = null, ue = null, Ee = null, De = !1, y = null, M = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), B.delete(this);
  }
  #m() {
    for (const l of B) {
      var t = l.id < this.id, r = [];
      for (const [o, [c, h]] of this.current) {
        if (l.current.has(o)) {
          var n = (
            /** @type {[any, boolean]} */
            l.current.get(o)[0]
          );
          if (t && c !== n)
            l.current.set(o, [c, h]);
          else
            continue;
        }
        r.push(o);
      }
      var s = [...l.current.keys()].filter((o) => !this.current.has(o));
      if (s.length === 0)
        t && l.discard();
      else if (r.length > 0) {
        l.activate();
        var i = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (var a of r)
          gt(a, s, i, f);
        if (l.#n.length > 0) {
          l.apply();
          for (var u of l.#n)
            l.#o(u, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of B)
      l.#f.has(this) && (l.#f.delete(this), l.#f.size === 0 && !l.#c() && (l.activate(), l.#p()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, r) {
    let n = this.#t.get(r) ?? 0;
    if (this.#t.set(r, n + 1), t) {
      let s = this.#r.get(r) ?? 0;
      this.#r.set(r, s + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, r, n) {
    let s = this.#t.get(r) ?? 0;
    if (s === 1 ? this.#t.delete(r) : this.#t.set(r, s - 1), t) {
      let i = this.#r.get(r) ?? 0;
      i === 1 ? this.#r.delete(r) : this.#r.set(r, i - 1);
    }
    this.#h || n || (this.#h = !0, ae(() => {
      this.#h = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, r) {
    for (const n of t)
      this.#i.add(n);
    for (const n of r)
      this.#l.add(n);
    t.clear(), r.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#a.add(t);
  }
  settled() {
    return (this.#s ??= at()).promise;
  }
  static ensure() {
    if (y === null) {
      const t = y = new se();
      De || (B.add(y), ae(() => {
        y === t && t.flush();
      }));
    }
    return y;
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
    if (je = t, t.b?.is_pending && (t.f & (me | Re | ft)) !== 0 && (t.f & pe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var r = t; r.parent !== null; ) {
      r = r.parent;
      var n = r.f;
      if (ue !== null && r === g && (v === null || (v.f & x) === 0))
        return;
      if ((n & (re | J)) !== 0) {
        if ((n & E) === 0)
          return;
        r.f ^= E;
      }
    }
    this.#n.push(r);
  }
}
function hr() {
  try {
    er();
  } catch (e) {
    H(e, je);
  }
}
let $ = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (U | G)) === 0 && ye(n) && ($ = /* @__PURE__ */ new Set(), ce(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && Ft(n), $?.size > 0)) {
        W.clear();
        for (const s of $) {
          if ((s.f & (U | G)) !== 0) continue;
          const i = [s];
          let f = s.parent;
          for (; f !== null; )
            $.has(f) && ($.delete(f), i.push(f)), f = f.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const u = i[a];
            (u.f & (U | G)) === 0 && ce(u);
          }
        }
        $.clear();
      }
    }
    $ = null;
  }
}
function gt(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const s of e.reactions) {
      const i = s.f;
      (i & x) !== 0 ? gt(
        /** @type {Derived} */
        s,
        t,
        r,
        n
      ) : (i & (Ye | Z)) !== 0 && (i & R) === 0 && mt(s, t, n) && (b(s, R), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function mt(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const s of e.deps) {
      if (fe.call(t, s))
        return !0;
      if ((s.f & x) !== 0 && mt(
        /** @type {Derived} */
        s,
        t,
        r
      ))
        return r.set(
          /** @type {Derived} */
          s,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function Ve(e) {
  y.schedule(e);
}
function wt(e, t) {
  if (!((e.f & J) !== 0 && (e.f & E) !== 0)) {
    (e.f & R) !== 0 ? t.d.push(e) : (e.f & z) !== 0 && t.m.push(e), b(e, E);
    for (var r = e.first; r !== null; )
      wt(r, t), r = r.next;
  }
}
function yt(e) {
  b(e, E);
  for (var t = e.first; t !== null; )
    yt(t), t = t.next;
}
function cr(e) {
  let t = 0, r = Pe(0), n;
  return () => {
    Ge() && (d(r), Or(() => (t === 0 && (n = qr(() => e(() => I(r)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, I(r));
      });
    })));
  };
}
var pr = ke | de;
function dr(e, t, r, n) {
  new _r(e, t, r, n);
}
class _r {
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
  #e;
  /** @type {TemplateNode | null} */
  #a = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #s;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #u = null;
  #h = 0;
  #f = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #p = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #_ = cr(() => (this.#o = Pe(this.#h), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, r, n, s) {
    this.#e = t, this.#t = r, this.#r = (i) => {
      var f = (
        /** @type {Effect} */
        g
      );
      f.b = this, f.f |= Me, n(i);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = s ?? this.parent?.transform_error ?? ((i) => i), this.#s = Fr(() => {
      this.#w();
    }, pr);
  }
  #m() {
    try {
      this.#n = X(() => this.#r(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const r = this.#t.failed;
    r && (this.#l = X(() => {
      r(
        this.#e,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#i = X(() => t(this.#e)), ae(() => {
      var r = this.#u = document.createDocumentFragment(), n = Pt();
      r.append(n), this.#n = this.#g(() => X(() => this.#r(n))), this.#f === 0 && (this.#e.before(r), this.#u = null, xe(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#v(
        /** @type {Batch} */
        y
      ));
    }));
  }
  #w() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#f = 0, this.#h = 0, this.#n = X(() => {
        this.#r(this.#e);
      }), this.#f > 0) {
        var t = this.#u = document.createDocumentFragment();
        Lr(this.#n, t);
        const r = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#i = X(() => r(this.#e));
      } else
        this.#v(
          /** @type {Batch} */
          y
        );
    } catch (r) {
      this.error(r);
    }
  }
  /**
   * @param {Batch} batch
   */
  #v(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#p);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vt(t, this.#d, this.#p);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#t.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var r = g, n = v, s = j;
    Y(this.#s), F(this.#s), oe(this.#s.ctx);
    try {
      return se.ensure(), t();
    } catch (i) {
      return dt(i), null;
    } finally {
      Y(r), F(n), oe(s);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #y(t, r) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, r);
      return;
    }
    this.#f += t, this.#f === 0 && (this.#v(r), this.#i && xe(this.#i, () => {
      this.#i = null;
    }), this.#u && (this.#e.before(this.#u), this.#u = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, r) {
    this.#y(t, r), this.#h += t, !(!this.#o || this.#c) && (this.#c = !0, ae(() => {
      this.#c = !1, this.#o && Ae(this.#o, this.#h);
    }));
  }
  get_effect_pending() {
    return this.#_(), d(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var r = this.#t.onerror;
    let n = this.#t.failed;
    if (!r && !n)
      throw t;
    this.#n && (q(this.#n), this.#n = null), this.#i && (q(this.#i), this.#i = null), this.#l && (q(this.#l), this.#l = null);
    var s = !1, i = !1;
    const f = () => {
      if (s) {
        ur();
        return;
      }
      s = !0, i && sr(), this.#l !== null && xe(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#w();
      });
    }, a = (u) => {
      try {
        i = !0, r?.(u, f), i = !1;
      } catch (l) {
        H(l, this.#s && this.#s.parent);
      }
      n && (this.#l = this.#g(() => {
        try {
          return X(() => {
            var l = (
              /** @type {Effect} */
              g
            );
            l.b = this, l.f |= Me, n(
              this.#e,
              () => u,
              () => f
            );
          });
        } catch (l) {
          return H(
            l,
            /** @type {Effect} */
            this.#s.parent
          ), null;
        }
      }));
    };
    ae(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        H(l, this.#s && this.#s.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        a,
        /** @param {unknown} e */
        (l) => H(l, this.#s && this.#s.parent)
      ) : a(u);
    });
  }
}
function vr(e, t, r, n) {
  const s = mr;
  var i = e.filter((h) => !h.settled);
  if (r.length === 0 && i.length === 0) {
    n(t.map(s));
    return;
  }
  var f = (
    /** @type {Effect} */
    g
  ), a = gr(), u = i.length === 1 ? i[0].promise : i.length > 1 ? Promise.all(i.map((h) => h.promise)) : null;
  function l(h) {
    a();
    try {
      n(h);
    } catch (_) {
      (f.f & U) === 0 && H(_, f);
    }
    Te();
  }
  if (r.length === 0) {
    u.then(() => l(t.map(s)));
    return;
  }
  var o = bt();
  function c() {
    Promise.all(r.map((h) => /* @__PURE__ */ wr(h))).then((h) => l([...t.map(s), ...h])).catch((h) => H(h, f)).finally(() => o());
  }
  u ? u.then(() => {
    a(), c(), Te();
  }) : c();
}
function gr() {
  var e = (
    /** @type {Effect} */
    g
  ), t = v, r = j, n = (
    /** @type {Batch} */
    y
  );
  return function(i = !0) {
    Y(e), F(t), oe(r), i && (e.f & U) === 0 && (n?.activate(), n?.apply());
  };
}
function Te(e = !0) {
  Y(null), F(null), oe(null), e && y?.deactivate();
}
function bt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), r = (
    /** @type {Batch} */
    y
  ), n = t.is_rendered();
  return t.update_pending_count(1, r), r.increment(n, e), (s = !1) => {
    t.update_pending_count(-1, r), r.decrement(n, e, s);
  };
}
// @__NO_SIDE_EFFECTS__
function mr(e) {
  var t = x | R, r = v !== null && (v.f & x) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return g !== null && (g.f |= de), {
    ctx: j,
    deps: null,
    effects: null,
    equals: ot,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      S
    ),
    wv: 0,
    parent: r ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function wr(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    g
  );
  n === null && Xt();
  var s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = Pe(
    /** @type {V} */
    S
  ), f = !v, a = /* @__PURE__ */ new Map();
  return Nr(() => {
    var u = (
      /** @type {Effect} */
      g
    ), l = at();
    s = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Te);
    } catch (_) {
      l.reject(_), Te();
    }
    var o = (
      /** @type {Batch} */
      y
    );
    if (f) {
      if ((u.f & pe) !== 0)
        var c = bt();
      if (
        /** @type {Boundary} */
        n.b.is_rendered()
      )
        a.get(o)?.reject(V), a.delete(o);
      else {
        for (const _ of a.values())
          _.reject(V);
        a.clear();
      }
      a.set(o, l);
    }
    const h = (_, p = void 0) => {
      if (c) {
        var m = p === V;
        c(m);
      }
      if (!(p === V || (u.f & U) !== 0)) {
        if (o.activate(), p)
          i.f |= K, Ae(i, p);
        else {
          (i.f & K) !== 0 && (i.f ^= K), Ae(i, _);
          for (const [T, C] of a) {
            if (a.delete(T), T === o) break;
            C.reject(V);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(h, (_) => h(null, _ || "unknown"));
  }), Ar(() => {
    for (const u of a.values())
      u.reject(V);
  }), new Promise((u) => {
    function l(o) {
      function c() {
        o === s ? u(i) : l(s);
      }
      o.then(c, c);
    }
    l(s);
  });
}
function yr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      q(
        /** @type {Effect} */
        t[r]
      );
  }
}
function br(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & x) === 0)
      return (t.f & U) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Be(e) {
  var t, r = g;
  Y(br(e));
  try {
    e.f &= ~ne, yr(e), t = It(e);
  } finally {
    Y(r);
  }
  return t;
}
function Et(e) {
  var t = e.v, r = Be(e);
  if (!e.equals(r) && (e.wv = Lt(), (!y?.is_fork || e.deps === null) && (e.v = r, y?.capture(e, t, !0), e.deps === null))) {
    b(e, E);
    return;
  }
  he || (M !== null ? (Ge() || y?.is_fork) && M.set(e, r) : $e(e));
}
function Er(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Wt, t.ac = null, we(t, 0), Ke(t));
}
function xt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Ie = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let St = !1;
function Pe(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ot,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function k(e, t) {
  const r = Pe(e);
  return jr(r), r;
}
function w(e, t, r = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (v.f & Ze) !== 0) && pt() && (v.f & (x | Z | Ye | Ze)) !== 0 && (D === null || !fe.call(D, e)) && nr();
  let n = r ? _e(t) : t;
  return Ae(e, n, Ee);
}
function Ae(e, t, r = null) {
  if (!e.equals(t)) {
    var n = e.v;
    he ? W.set(e, t) : W.set(e, n), e.v = t;
    var s = se.ensure();
    if (s.capture(e, n), (e.f & x) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & R) !== 0 && Be(i), M === null && $e(i);
    }
    e.wv = Lt(), kt(e, R, r), g !== null && (g.f & E) !== 0 && (g.f & (J | re)) === 0 && (N === null ? Ir([e]) : N.push(e)), !s.is_fork && Ie.size > 0 && !St && xr();
  }
  return t;
}
function xr() {
  St = !1;
  for (const e of Ie)
    (e.f & E) !== 0 && b(e, z), ye(e) && ce(e);
  Ie.clear();
}
function I(e) {
  w(e, e.v + 1);
}
function kt(e, t, r) {
  var n = e.reactions;
  if (n !== null)
    for (var s = n.length, i = 0; i < s; i++) {
      var f = n[i], a = f.f, u = (a & R) === 0;
      if (u && b(f, t), (a & x) !== 0) {
        var l = (
          /** @type {Derived} */
          f
        );
        M?.delete(l), (a & ne) === 0 && (a & O && (f.f |= ne), kt(l, z, r));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          f
        );
        (a & Z) !== 0 && $ !== null && $.add(o), r !== null ? r.push(o) : Ve(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Kt(e);
  if (t !== Ht && t !== Gt)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Yt(e), s = /* @__PURE__ */ k(0), i = te, f = (a) => {
    if (te === i)
      return a();
    var u = v, l = te;
    F(null), rt(i);
    var o = a();
    return F(u), rt(l), o;
  };
  return n && r.set("length", /* @__PURE__ */ k(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && tr();
        var o = r.get(u);
        return o === void 0 ? f(() => {
          var c = /* @__PURE__ */ k(l.value);
          return r.set(u, c), c;
        }) : w(o, l.value, !0), !0;
      },
      deleteProperty(a, u) {
        var l = r.get(u);
        if (l === void 0) {
          if (u in a) {
            const o = f(() => /* @__PURE__ */ k(S));
            r.set(u, o), I(s);
          }
        } else
          w(l, S), I(s);
        return !0;
      },
      get(a, u, l) {
        if (u === Oe)
          return e;
        var o = r.get(u), c = u in a;
        if (o === void 0 && (!c || ge(a, u)?.writable) && (o = f(() => {
          var _ = _e(c ? a[u] : S), p = /* @__PURE__ */ k(_);
          return p;
        }), r.set(u, o)), o !== void 0) {
          var h = d(o);
          return h === S ? void 0 : h;
        }
        return Reflect.get(a, u, l);
      },
      getOwnPropertyDescriptor(a, u) {
        var l = Reflect.getOwnPropertyDescriptor(a, u);
        if (l && "value" in l) {
          var o = r.get(u);
          o && (l.value = d(o));
        } else if (l === void 0) {
          var c = r.get(u), h = c?.v;
          if (c !== void 0 && h !== S)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return l;
      },
      has(a, u) {
        if (u === Oe)
          return !0;
        var l = r.get(u), o = l !== void 0 && l.v !== S || Reflect.has(a, u);
        if (l !== void 0 || g !== null && (!o || ge(a, u)?.writable)) {
          l === void 0 && (l = f(() => {
            var h = o ? _e(a[u]) : S, _ = /* @__PURE__ */ k(h);
            return _;
          }), r.set(u, l));
          var c = d(l);
          if (c === S)
            return !1;
        }
        return o;
      },
      set(a, u, l, o) {
        var c = r.get(u), h = u in a;
        if (n && u === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          c.v; _ += 1) {
            var p = r.get(_ + "");
            p !== void 0 ? w(p, S) : _ in a && (p = f(() => /* @__PURE__ */ k(S)), r.set(_ + "", p));
          }
        if (c === void 0)
          (!h || ge(a, u)?.writable) && (c = f(() => /* @__PURE__ */ k(void 0)), w(c, _e(l)), r.set(u, c));
        else {
          h = c.v !== S;
          var m = f(() => _e(l));
          w(c, m);
        }
        var T = Reflect.getOwnPropertyDescriptor(a, u);
        if (T?.set && T.set.call(o, l), !h) {
          if (n && typeof u == "string") {
            var C = (
              /** @type {Source<number>} */
              r.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= C.v && w(C, ie + 1);
          }
          I(s);
        }
        return !0;
      },
      ownKeys(a) {
        d(s);
        var u = Reflect.ownKeys(a).filter((c) => {
          var h = r.get(c);
          return h === void 0 || h.v !== S;
        });
        for (var [l, o] of r)
          o.v !== S && !(l in a) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        rr();
      }
    }
  );
}
var et, Tt, At, Rt;
function Sr() {
  if (et === void 0) {
    et = window, Tt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    At = ge(t, "firstChild").get, Rt = ge(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(r) && (r.__t = void 0);
  }
}
function Pt(e = "") {
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
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    Rt.call(e)
  );
}
function Fe(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function Ce(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ He(n);
  return n;
}
function kr(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(lr, e, void 0)
  );
}
function Ot(e) {
  var t = v, r = g;
  F(null), Y(null);
  try {
    return e();
  } finally {
    F(t), Y(r);
  }
}
function Tr(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function Q(e, t) {
  var r = g;
  r !== null && (r.f & G) !== 0 && (e |= G);
  var n = {
    ctx: j,
    deps: null,
    nodes: null,
    f: e | R | O,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, s = n;
  if ((e & me) !== 0)
    ue !== null ? ue.push(n) : se.ensure().schedule(n);
  else if (t !== null) {
    try {
      ce(n);
    } catch (f) {
      throw q(n), f;
    }
    s.deps === null && s.teardown === null && s.nodes === null && s.first === s.last && // either `null`, or a singular child
    (s.f & de) === 0 && (s = s.first, (e & Z) !== 0 && (e & ke) !== 0 && s !== null && (s.f |= ke));
  }
  if (s !== null && (s.parent = r, r !== null && Tr(s, r), v !== null && (v.f & x) !== 0 && (e & re) === 0)) {
    var i = (
      /** @type {Derived} */
      v
    );
    (i.effects ??= []).push(s);
  }
  return n;
}
function Ge() {
  return v !== null && !L;
}
function Ar(e) {
  const t = Q(Re, null);
  return b(t, E), t.teardown = e, t;
}
function Rr(e) {
  return Q(me | Qt, e);
}
function Pr(e) {
  se.ensure();
  const t = Q(re | de, e);
  return (r = {}) => new Promise((n) => {
    r.outro ? xe(t, () => {
      q(t), n(void 0);
    }) : (q(t), n(void 0));
  });
}
function Nr(e) {
  return Q(Ye | de, e);
}
function Or(e, t = 0) {
  return Q(Re | t, e);
}
function Dr(e, t = [], r = [], n = []) {
  vr(n, t, r, (s) => {
    Q(Re, () => e(...s.map(d)));
  });
}
function Fr(e, t = 0) {
  var r = Q(Z | t, e);
  return r;
}
function X(e) {
  return Q(J | de, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = he, n = v;
    tt(!0), F(null);
    try {
      t.call(null);
    } finally {
      tt(r), F(n);
    }
  }
}
function Ke(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const s = r.ac;
    s !== null && Ot(() => {
      s.abort(V);
    });
    var n = r.next;
    (r.f & re) !== 0 ? r.parent = null : q(r, t), r = n;
  }
}
function Cr(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & J) === 0 && q(t), t = r;
  }
}
function q(e, t = !0) {
  var r = !1;
  (t || (e.f & Zt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), b(e, Je), Ke(e, t && !r), we(e, 0);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const i of n)
      i.stop();
  Dt(e), e.f ^= Je, e.f |= U;
  var s = e.parent;
  s !== null && s.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Mr(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = r;
  }
}
function Ft(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function xe(e, t, r = !0) {
  var n = [];
  Ct(e, n, !0);
  var s = () => {
    r && q(e), t && t();
  }, i = n.length;
  if (i > 0) {
    var f = () => --i || s();
    for (var a of n)
      a.out(f);
  } else
    s();
}
function Ct(e, t, r) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && t.push(a);
    for (var s = e.first; s !== null; ) {
      var i = s.next, f = (s.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (s.f & J) !== 0 && (e.f & Z) !== 0;
      Ct(s, t, f ? r : !1), s = i;
    }
  }
}
function Lr(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var s = r === n ? null : /* @__PURE__ */ He(r);
      t.append(r), r = s;
    }
}
let Se = !1, he = !1;
function tt(e) {
  he = e;
}
let v = null, L = !1;
function F(e) {
  v = e;
}
let g = null;
function Y(e) {
  g = e;
}
let D = null;
function jr(e) {
  v !== null && (D === null ? D = [e] : D.push(e));
}
let A = null, P = 0, N = null;
function Ir(e) {
  N = e;
}
let Mt = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function Lt() {
  return ++Mt;
}
function ye(e) {
  var t = e.f;
  if ((t & R) !== 0)
    return !0;
  if (t & x && (e.f &= ~ne), (t & z) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, s = 0; s < n; s++) {
      var i = r[s];
      if (ye(
        /** @type {Derived} */
        i
      ) && Et(
        /** @type {Derived} */
        i
      ), i.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    M === null && b(e, E);
  }
  return !1;
}
function jt(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(D !== null && fe.call(D, e)))
    for (var s = 0; s < n.length; s++) {
      var i = n[s];
      (i.f & x) !== 0 ? jt(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (r ? b(i, R) : (i.f & E) !== 0 && b(i, z), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function It(e) {
  var t = A, r = P, n = N, s = v, i = D, f = j, a = L, u = te, l = e.f;
  A = /** @type {null | Value[]} */
  null, P = 0, N = null, v = (l & (J | re)) === 0 ? e : null, D = null, oe(e.ctx), L = !1, te = ++ee, e.ac !== null && (Ot(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), c = o();
    e.f |= pe;
    var h = e.deps, _ = y?.is_fork;
    if (A !== null) {
      var p;
      if (_ || we(e, P), h !== null && P > 0)
        for (h.length = P + A.length, p = 0; p < A.length; p++)
          h[P + p] = A[p];
      else
        e.deps = h = A;
      if (Ge() && (e.f & O) !== 0)
        for (p = P; p < h.length; p++)
          (h[p].reactions ??= []).push(e);
    } else !_ && h !== null && P < h.length && (we(e, P), h.length = P);
    if (pt() && N !== null && !L && h !== null && (e.f & (x | z | R)) === 0)
      for (p = 0; p < /** @type {Source[]} */
      N.length; p++)
        jt(
          N[p],
          /** @type {Effect} */
          e
        );
    if (s !== null && s !== e) {
      if (ee++, s.deps !== null)
        for (let m = 0; m < r; m += 1)
          s.deps[m].rv = ee;
      if (t !== null)
        for (const m of t)
          m.rv = ee;
      N !== null && (n === null ? n = N : n.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & K) !== 0 && (e.f ^= K), c;
  } catch (m) {
    return dt(m);
  } finally {
    e.f ^= Le, A = t, P = r, N = n, v = s, D = i, oe(f), L = a, te = u;
  }
}
function Ur(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = $t.call(r, e);
    if (n !== -1) {
      var s = r.length - 1;
      s === 0 ? r = t.reactions = null : (r[n] = r[s], r.pop());
    }
  }
  if (r === null && (t.f & x) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !fe.call(A, t))) {
    var i = (
      /** @type {Derived} */
      t
    );
    (i.f & O) !== 0 && (i.f ^= O, i.f &= ~ne), $e(i), Er(i), we(i, 0);
  }
}
function we(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      Ur(e, r[n]);
}
function ce(e) {
  var t = e.f;
  if ((t & U) === 0) {
    b(e, E);
    var r = g, n = Se;
    g = e, Se = !0;
    try {
      (t & (Z | ft)) !== 0 ? Cr(e) : Ke(e), Dt(e);
      var s = It(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Mt;
      var i;
    } finally {
      Se = n, g = r;
    }
  }
}
function d(e) {
  var t = e.f, r = (t & x) !== 0;
  if (v !== null && !L) {
    var n = g !== null && (g.f & U) !== 0;
    if (!n && (D === null || !fe.call(D, e))) {
      var s = v.deps;
      if ((v.f & Le) !== 0)
        e.rv < ee && (e.rv = ee, A === null && s !== null && s[P] === e ? P++ : A === null ? A = [e] : A.push(e));
      else {
        (v.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [v] : fe.call(i, v) || i.push(v);
      }
    }
  }
  if (he && W.has(e))
    return W.get(e);
  if (r) {
    var f = (
      /** @type {Derived} */
      e
    );
    if (he) {
      var a = f.v;
      return ((f.f & E) === 0 && f.reactions !== null || qt(f)) && (a = Be(f)), W.set(f, a), a;
    }
    var u = (f.f & O) === 0 && !L && v !== null && (Se || (v.f & O) !== 0), l = (f.f & pe) === 0;
    ye(f) && (u && (f.f |= O), Et(f)), u && !l && (xt(f), Ut(f));
  }
  if (M?.has(e))
    return M.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Ut(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & x) !== 0 && (t.f & O) === 0 && (xt(
        /** @type {Derived} */
        t
      ), Ut(
        /** @type {Derived} */
        t
      ));
}
function qt(e) {
  if (e.v === S) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & x) !== 0 && qt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qr(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function zr(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function st(e, t) {
  zr("op_set_text", e, t);
}
const Yr = ["touchstart", "touchmove"];
function $r(e) {
  return Yr.includes(e);
}
const ve = Symbol("events"), zt = /* @__PURE__ */ new Set(), Ue = /* @__PURE__ */ new Set();
function it(e, t, r) {
  (t[ve] ??= {})[e] = r;
}
function Vr(e) {
  for (var t = 0; t < e.length; t++)
    zt.add(e[t]);
  for (var r of Ue)
    r(e);
}
let lt = null;
function ut(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, s = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  lt = e;
  var f = 0, a = lt === e && e[ve];
  if (a) {
    var u = s.indexOf(a);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var l = s.indexOf(t);
    if (l === -1)
      return;
    u <= l && (f = u);
  }
  if (i = /** @type {Element} */
  s[f] || e.target, i !== t) {
    Bt(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || r;
      }
    });
    var o = v, c = g;
    F(null), Y(null);
    try {
      for (var h, _ = []; i !== null; ) {
        var p = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var m = i[ve]?.[n];
          m != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && m.call(i, e);
        } catch (T) {
          h ? _.push(T) : h = T;
        }
        if (e.cancelBubble || p === t || p === null)
          break;
        i = p;
      }
      if (h) {
        for (let T of _)
          queueMicrotask(() => {
            throw T;
          });
        throw h;
      }
    } finally {
      e[ve] = t, delete e.currentTarget, F(o), Y(c);
    }
  }
}
const Br = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Hr(e) {
  return (
    /** @type {string} */
    Br?.createHTML(e) ?? e
  );
}
function Gr(e) {
  var t = kr("template");
  return t.innerHTML = Hr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Kr(e, t) {
  var r = (
    /** @type {Effect} */
    g
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Wr(e, t) {
  var r = (t & ir) !== 0, n, s = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Gr(s ? e : "<!>" + e), n = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(n));
    var i = (
      /** @type {TemplateNode} */
      r || Tt ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    return Kr(i, i), i;
  };
}
function Jr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Zr(e, t) {
  return Qr(e, t);
}
const be = /* @__PURE__ */ new Map();
function Qr(e, { target: t, anchor: r, props: n = {}, events: s, context: i, intro: f = !0, transformError: a }) {
  Sr();
  var u = void 0, l = Pr(() => {
    var o = r ?? t.appendChild(Pt());
    dr(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        ht({});
        var p = (
          /** @type {ComponentContext} */
          j
        );
        i && (p.c = i), s && (n.$$events = s), u = e(_, n) || {}, ct();
      },
      a
    );
    var c = /* @__PURE__ */ new Set(), h = (_) => {
      for (var p = 0; p < _.length; p++) {
        var m = _[p];
        if (!c.has(m)) {
          c.add(m);
          var T = $r(m);
          for (const Ne of [t, document]) {
            var C = be.get(Ne);
            C === void 0 && (C = /* @__PURE__ */ new Map(), be.set(Ne, C));
            var ie = C.get(m);
            ie === void 0 ? (Ne.addEventListener(m, ut, { passive: T }), C.set(m, 1)) : C.set(m, ie + 1);
          }
        }
      }
    };
    return h(Vt(zt)), Ue.add(h), () => {
      for (var _ of c)
        for (const T of [t, document]) {
          var p = (
            /** @type {Map<string, number>} */
            be.get(T)
          ), m = (
            /** @type {number} */
            p.get(_)
          );
          --m == 0 ? (T.removeEventListener(_, ut), p.delete(_), p.size === 0 && be.delete(T)) : p.set(_, m);
        }
      Ue.delete(h), o !== r && o.parentNode?.removeChild(o);
    };
  });
  return Xr.set(u, l), u;
}
let Xr = /* @__PURE__ */ new WeakMap();
const qe = Symbol();
class en extends URLSearchParams {
  #e = /* @__PURE__ */ k(0);
  #a = tn();
  #t = !1;
  #r() {
    if (!this.#a || this.#t) return;
    this.#t = !0;
    const t = this.toString();
    this.#a.search = t && `?${t}`, this.#t = !1;
  }
  /**
   * @param {URLSearchParams} params
   * @internal
   */
  [qe](t) {
    if (!this.#t) {
      this.#t = !0;
      for (const r of [...super.keys()])
        super.delete(r);
      for (const [r, n] of t)
        super.append(r, n);
      I(this.#e), this.#t = !1;
    }
  }
  /**
   * @param {string} name
   * @param {string} value
   * @returns {void}
   */
  append(t, r) {
    super.append(t, r), this.#r(), I(this.#e);
  }
  /**
   * @param {string} name
   * @param {string=} value
   * @returns {void}
   */
  delete(t, r) {
    var n = super.has(t, r);
    super.delete(t, r), n && (this.#r(), I(this.#e));
  }
  /**
   * @param {string} name
   * @returns {string|null}
   */
  get(t) {
    return d(this.#e), super.get(t);
  }
  /**
   * @param {string} name
   * @returns {string[]}
   */
  getAll(t) {
    return d(this.#e), super.getAll(t);
  }
  /**
   * @param {string} name
   * @param {string=} value
   * @returns {boolean}
   */
  has(t, r) {
    return d(this.#e), super.has(t, r);
  }
  keys() {
    return d(this.#e), super.keys();
  }
  /**
   * @param {string} name
   * @param {string} value
   * @returns {void}
   */
  set(t, r) {
    var n = super.getAll(t).join("");
    super.set(t, r), n !== super.getAll(t).join("") && (this.#r(), I(this.#e));
  }
  sort() {
    super.sort(), this.#r(), I(this.#e);
  }
  toString() {
    return d(this.#e), super.toString();
  }
  values() {
    return d(this.#e), super.values();
  }
  entries() {
    return d(this.#e), super.entries();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get size() {
    return d(this.#e), super.size;
  }
}
let ze = null;
function tn() {
  return ze;
}
class rn extends URL {
  #e = /* @__PURE__ */ k(super.protocol);
  #a = /* @__PURE__ */ k(super.username);
  #t = /* @__PURE__ */ k(super.password);
  #r = /* @__PURE__ */ k(super.hostname);
  #s = /* @__PURE__ */ k(super.port);
  #n = /* @__PURE__ */ k(super.pathname);
  #i = /* @__PURE__ */ k(super.hash);
  #l = /* @__PURE__ */ k(super.search);
  #u;
  /**
   * @param {string | URL} url
   * @param {string | URL} [base]
   */
  constructor(t, r) {
    t = new URL(t, r), super(t), ze = this, this.#u = new en(t.searchParams), ze = null;
  }
  get hash() {
    return d(this.#i);
  }
  set hash(t) {
    super.hash = t, w(this.#i, super.hash);
  }
  get host() {
    return d(this.#r), d(this.#s), super.host;
  }
  set host(t) {
    super.host = t, w(this.#r, super.hostname), w(this.#s, super.port);
  }
  get hostname() {
    return d(this.#r);
  }
  set hostname(t) {
    super.hostname = t, w(this.#r, super.hostname);
  }
  get href() {
    return d(this.#e), d(this.#a), d(this.#t), d(this.#r), d(this.#s), d(this.#n), d(this.#i), d(this.#l), super.href;
  }
  set href(t) {
    super.href = t, w(this.#e, super.protocol), w(this.#a, super.username), w(this.#t, super.password), w(this.#r, super.hostname), w(this.#s, super.port), w(this.#n, super.pathname), w(this.#i, super.hash), w(this.#l, super.search), this.#u[qe](super.searchParams);
  }
  get password() {
    return d(this.#t);
  }
  set password(t) {
    super.password = t, w(this.#t, super.password);
  }
  get pathname() {
    return d(this.#n);
  }
  set pathname(t) {
    super.pathname = t, w(this.#n, super.pathname);
  }
  get port() {
    return d(this.#s);
  }
  set port(t) {
    super.port = t, w(this.#s, super.port);
  }
  get protocol() {
    return d(this.#e);
  }
  set protocol(t) {
    super.protocol = t, w(this.#e, super.protocol);
  }
  get search() {
    return d(this.#l);
  }
  set search(t) {
    super.search = t, w(this.#l, super.search), this.#u[qe](super.searchParams);
  }
  get username() {
    return d(this.#a);
  }
  set username(t) {
    super.username = t, w(this.#a, super.username);
  }
  get origin() {
    return d(this.#e), d(this.#r), d(this.#s), super.origin;
  }
  get searchParams() {
    return this.#u;
  }
  toString() {
    return this.href;
  }
  toJSON() {
    return this.href;
  }
}
var nn = /* @__PURE__ */ Wr("<div><div> </div> <div> </div> <button>Go About</button> <button>Add Search</button></div>");
function sn(e, t) {
  ht(t, !0);
  const r = new rn("https://example.com/home");
  function n() {
    r.pathname = "/about";
  }
  function s() {
    r.searchParams.set("q", "hello");
  }
  var i = nn(), f = Fe(i), a = Fe(f), u = Ce(f, 2), l = Fe(u), o = Ce(u, 2), c = Ce(o, 2);
  Dr(() => {
    st(a, `Path: ${r.pathname ?? ""}`), st(l, `Search: ${r.search ?? ""}`);
  }), it("click", o, n), it("click", c, s), Jr(e, i), ct();
}
Vr(["click"]);
function un(e) {
  return Zr(sn, { target: e });
}
export {
  un as default,
  un as rvst_mount
};

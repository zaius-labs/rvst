var qt = Array.isArray, Bt = Array.prototype.indexOf, ae = Array.prototype.includes, Yt = Array.from, $t = Object.defineProperty, we = Object.getOwnPropertyDescriptor, Ht = Object.prototype, Ut = Array.prototype, Vt = Object.getPrototypeOf, We = Object.isExtensible;
const Kt = () => {
};
function Gt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, be = 4, Oe = 8, ft = 1 << 24, Q = 16, J = 32, ne = 64, Ie = 128, O = 512, y = 1024, A = 2048, B = 4096, G = 8192, L = 16384, ve = 32768, Ze = 1 << 25, Re = 65536, Je = 1 << 17, Wt = 1 << 18, de = 1 << 19, Zt = 1 << 20, re = 65536, je = 1 << 21, Ye = 1 << 22, W = 1 << 23, Ce = Symbol("$state"), H = new class extends Error {
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
const rn = 2, x = Symbol(), sn = "http://www.w3.org/1999/xhtml";
function ln() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let I = null;
function oe(e) {
  I = e;
}
function at(e, t = !1, n) {
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
function ot(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      kn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let le = [];
function fn() {
  var e = le;
  le = [], Gt(e);
}
function ue(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && fn();
    });
  }
  le.push(e);
}
function ht(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & ve) === 0 && (t.f & be) === 0)
    throw e;
  K(e, t);
}
function K(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
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
const un = -7169;
function b(e, t) {
  e.f = e.f & un | t;
}
function $e(e) {
  (e.f & O) !== 0 || e.deps === null ? b(e, y) : b(e, B);
}
function vt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & re) === 0 || (t.f ^= re, vt(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), vt(e.deps), b(e, y);
}
const V = /* @__PURE__ */ new Set();
let w = null, P = null, Le = null, Fe = !1, fe = null, Se = null;
var Qe = 0;
let an = 1;
class ie {
  id = an++;
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
  #n = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #l = /* @__PURE__ */ new Map();
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #r = null;
  /**
   * The root effects that need to be flushed
   * @type {Effect[]}
   */
  #e = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
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
    return this.is_fork || this.#l.size > 0;
  }
  #d() {
    for (const r of this.#a)
      for (const i of r.#l.keys()) {
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
        b(r, A), this.schedule(r);
      for (r of n.m)
        b(r, B), this.schedule(r);
    }
  }
  #v() {
    if (Qe++ > 1e3 && (V.delete(this), on()), !this.#h()) {
      for (const f of this.#i)
        this.#s.delete(f), b(f, A), this.schedule(f);
      for (const f of this.#s)
        b(f, B), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = Se = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw wt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = ie.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (fe = null, Se = null, this.#h() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#f)
        gt(f, u);
    } else {
      this.#n.size === 0 && V.delete(this), this.#i.clear(), this.#s.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), Xe(r), Xe(n), this.#r?.resolve();
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
    a !== null && (V.add(a), a.#v()), V.has(this) || this.#w();
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
      var s = i.f, a = (s & (J | ne)) !== 0, f = a && (s & y) !== 0, u = f || (s & G) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & be) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#s.add(i), he(i));
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
      dt(t[n], this.#i, this.#s);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), P?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, P = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#v();
    } finally {
      Qe = 0, Le = null, fe = null, Se = null, Fe = !1, w = null, P = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), V.delete(this);
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
          _t(f, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#o(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of V)
      l.#a.has(this) && (l.#a.delete(this), l.#a.size === 0 && !l.#h() && (l.activate(), l.#v()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#n.get(n) ?? 0;
    if (this.#n.set(n, r + 1), t) {
      let i = this.#l.get(n) ?? 0;
      this.#l.set(n, i + 1);
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
      let s = this.#l.get(n) ?? 0;
      s === 1 ? this.#l.delete(n) : this.#l.set(n, s - 1);
    }
    this.#c || r || (this.#c = !0, ue(() => {
      this.#c = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#i.add(r);
    for (const r of n)
      this.#s.add(r);
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
    return (this.#r ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ie();
      Fe || (V.add(w), ue(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      P = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Le = t, t.b?.is_pending && (t.f & (be | Oe | ft)) !== 0 && (t.f & ve) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (_ === null || (_.f & E) === 0))
        return;
      if ((r & (ne | J)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function on() {
  try {
    Qt();
  } catch (e) {
    K(e, Le);
  }
}
let $ = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | G)) === 0 && Ee(r) && ($ = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ot(r), $?.size > 0)) {
        Z.clear();
        for (const i of $) {
          if ((i.f & (L | G)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (L | G)) === 0 && he(u);
          }
        }
        $.clear();
      }
    }
    $ = null;
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
      ) : (s & (Ye | Q)) !== 0 && (s & A) === 0 && pt(i, t, r) && (b(i, A), He(
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
function He(e) {
  w.schedule(e);
}
function gt(e, t) {
  if (!((e.f & J) !== 0 && (e.f & y) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), b(e, y);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  b(e, y);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function cn(e) {
  let t = 0, n = ye(0), r;
  return () => {
    Ke() && (T(n), Mn(() => (t === 0 && (r = Ln(() => e(() => j(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, j(n));
      });
    })));
  };
}
var hn = Re | de;
function vn(e, t, n, r) {
  new dn(e, t, n, r);
}
class dn {
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
  #n;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #c = 0;
  #a = 0;
  #h = !1;
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #_ = cn(() => (this.#o = ye(this.#c), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#n = n, this.#l = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Dn(() => {
      this.#b();
    }, hn);
  }
  #w() {
    try {
      this.#e = ee(() => this.#l(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#n.failed;
    n && (this.#s = ee(() => {
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
    t && (this.is_pending = !0, this.#i = ee(() => t(this.#t)), ue(() => {
      var n = this.#f = document.createDocumentFragment(), r = kt();
      n.append(r), this.#e = this.#g(() => ee(() => this.#l(r))), this.#a === 0 && (this.#t.before(n), this.#f = null, Ae(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#e = ee(() => {
        this.#l(this.#t);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        Pn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#n.pending
        );
        this.#i = ee(() => n(this.#t));
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    dt(t, this.#d, this.#v);
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
    var n = p, r = _, i = I;
    Y(this.#r), C(this.#r), oe(this.#r.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      Y(n), C(r), oe(i);
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
    this.#a += t, this.#a === 0 && (this.#p(n), this.#i && Ae(this.#i, () => {
      this.#i = null;
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
    this.#m(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, ue(() => {
      this.#h = !1, this.#o && Me(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), T(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#n.onerror;
    let r = this.#n.failed;
    if (!n && !r)
      throw t;
    this.#e && (q(this.#e), this.#e = null), this.#i && (q(this.#i), this.#i = null), this.#s && (q(this.#s), this.#s = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        ln();
        return;
      }
      i = !0, s && nn(), this.#s !== null && Ae(this.#s, () => {
        this.#s = null;
      }), this.#g(() => {
        this.#b();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        K(l, this.#r && this.#r.parent);
      }
      r && (this.#s = this.#g(() => {
        try {
          return ee(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Ie, r(
              this.#t,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return K(
            l,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    ue(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        K(l, this.#r && this.#r.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => K(l, this.#r && this.#r.parent)
      ) : f(u);
    });
  }
}
function _n(e, t, n, r) {
  const i = gn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = pn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (d) {
      (a.f & L) === 0 && K(d, a);
    }
    Ne();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = bt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ wn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => K(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ne();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), C(t), oe(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Ne(e = !0) {
  Y(null), C(null), oe(null), e && w?.deactivate();
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
function gn(e) {
  var t = E | A, n = _ !== null && (_.f & E) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: I,
    deps: null,
    effects: null,
    equals: ut,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      x
    ),
    wv: 0,
    parent: n ?? p,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function wn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Jt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = ye(
    /** @type {V} */
    x
  ), a = !_, f = /* @__PURE__ */ new Map();
  return Nn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ne);
    } catch (d) {
      l.reject(d), Ne();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & ve) !== 0)
        var h = bt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(H), f.delete(o);
      else {
        for (const d of f.values())
          d.reject(H);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (d, v = void 0) => {
      if (h) {
        var g = v === H;
        h(g);
      }
      if (!(v === H || (u.f & L) !== 0)) {
        if (o.activate(), v)
          s.f |= W, Me(s, v);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Me(s, d);
          for (const [m, k] of f) {
            if (f.delete(m), m === o) break;
            k.reject(H);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), An(() => {
    for (const u of f.values())
      u.reject(H);
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
function bn(e) {
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
function mn(e) {
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
function Ue(e) {
  var t, n = p;
  Y(mn(e));
  try {
    e.f &= ~re, bn(e), t = zt(e);
  } finally {
    Y(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, y);
    return;
  }
  ce || (P !== null ? (Ke() || w?.is_fork) && P.set(e, n) : $e(e));
}
function yn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(H), t.teardown = Kt, t.ac = null, me(t, 0), Ge(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let qe = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let Et = !1;
function ye(e, t) {
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
function F(e, t) {
  const n = ye(e);
  return zn(n), n;
}
function M(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!z || (_.f & Je) !== 0) && ct() && (_.f & (E | Q | Ye | Je)) !== 0 && (D === null || !ae.call(D, e)) && tn();
  let r = n ? pe(t) : t;
  return Me(e, r, Se);
}
function Me(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & A) !== 0 && Ue(s), P === null && $e(s);
    }
    e.wv = Ft(), xt(e, A, n), p !== null && (p.f & y) !== 0 && (p.f & (J | ne)) === 0 && (N === null ? In([e]) : N.push(e)), !i.is_fork && qe.size > 0 && !Et && En();
  }
  return t;
}
function En() {
  Et = !1;
  for (const e of qe)
    (e.f & y) !== 0 && b(e, B), Ee(e) && he(e);
  qe.clear();
}
function j(e) {
  M(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & A) === 0;
      if (u && b(a, t), (f & E) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        P?.delete(l), (f & re) === 0 && (f & O && (a.f |= re), xt(l, B, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Q) !== 0 && $ !== null && $.add(o), n !== null ? n.push(o) : He(o);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Vt(e);
  if (t !== Ht && t !== Ut)
    return e;
  var n = /* @__PURE__ */ new Map(), r = qt(e), i = /* @__PURE__ */ F(0), s = U, a = (f) => {
    if (U === s)
      return f();
    var u = _, l = U;
    C(null), nt(s);
    var o = f();
    return C(u), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ F(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Xt();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ F(l.value);
          return n.set(u, h), h;
        }) : M(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ F(x));
            n.set(u, o), j(i);
          }
        } else
          M(l, x), j(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Ce)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || we(f, u)?.writable) && (o = a(() => {
          var d = pe(h ? f[u] : x), v = /* @__PURE__ */ F(d);
          return v;
        }), n.set(u, o)), o !== void 0) {
          var c = T(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = T(o));
        } else if (l === void 0) {
          var h = n.get(u), c = h?.v;
          if (h !== void 0 && c !== x)
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
        if (u === Ce)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== x || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || we(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? pe(f[u]) : x, d = /* @__PURE__ */ F(c);
            return d;
          }), n.set(u, l));
          var h = T(l);
          if (h === x)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var d = l; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var v = n.get(d + "");
            v !== void 0 ? M(v, x) : d in f && (v = a(() => /* @__PURE__ */ F(x)), n.set(d + "", v));
          }
        if (h === void 0)
          (!c || we(f, u)?.writable) && (h = a(() => /* @__PURE__ */ F(void 0)), M(h, pe(l)), n.set(u, h));
        else {
          c = h.v !== x;
          var g = a(() => pe(l));
          M(h, g);
        }
        var m = Reflect.getOwnPropertyDescriptor(f, u);
        if (m?.set && m.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var k = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(u);
            Number.isInteger(se) && se >= k.v && M(k, se + 1);
          }
          j(i);
        }
        return !0;
      },
      ownKeys(f) {
        T(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== x;
        });
        for (var [l, o] of n)
          o.v !== x && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        en();
      }
    }
  );
}
var et, Tt, St, At;
function xn() {
  if (et === void 0) {
    et = window, Tt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    St = we(t, "firstChild").get, At = we(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function kt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function xe(e, t) {
  return /* @__PURE__ */ Rt(e);
}
function _e(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Tn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(sn, e, void 0)
  );
}
function Nt(e) {
  var t = _, n = p;
  C(null), Y(null);
  try {
    return e();
  } finally {
    C(t), Y(n);
  }
}
function Sn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & G) !== 0 && (e |= G);
  var r = {
    ctx: I,
    deps: null,
    nodes: null,
    f: e | A | O,
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
  if ((e & be) !== 0)
    fe !== null ? fe.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Q) !== 0 && (e & Re) !== 0 && i !== null && (i.f |= Re));
  }
  if (i !== null && (i.parent = n, n !== null && Sn(i, n), _ !== null && (_.f & E) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return _ !== null && !z;
}
function An(e) {
  const t = X(Oe, null);
  return b(t, y), t.teardown = e, t;
}
function kn(e) {
  return X(be | Zt, e);
}
function Rn(e) {
  ie.ensure();
  const t = X(ne | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Ae(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function Nn(e) {
  return X(Ye | de, e);
}
function Mn(e, t = 0) {
  return X(Oe | t, e);
}
function On(e, t = [], n = [], r = []) {
  _n(r, t, n, (i) => {
    X(Oe, () => e(...i.map(T)));
  });
}
function Dn(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function ee(e) {
  return X(J | de, e);
}
function Mt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    tt(!0), C(null);
    try {
      t.call(null);
    } finally {
      tt(n), C(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort(H);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function Cn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & J) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Wt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Fn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, Ze), Ge(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Mt(e), e.f ^= Ze, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Ot(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Ot(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ae(e, t, n = !0) {
  var r = [];
  Dt(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Dt(e, t, n) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Re) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & J) !== 0 && (e.f & Q) !== 0;
      Dt(i, t, a ? n : !1), i = s;
    }
  }
}
function Pn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let ke = !1, ce = !1;
function tt(e) {
  ce = e;
}
let _ = null, z = !1;
function C(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let D = null;
function zn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let S = null, R = 0, N = null;
function In(e) {
  N = e;
}
let Ct = 1, te = 0, U = te;
function nt(e) {
  U = e;
}
function Ft() {
  return ++Ct;
}
function Ee(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & E && (e.f &= ~re), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && mt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && b(e, y);
  }
  return !1;
}
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ae.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? Pt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, A) : (s.f & y) !== 0 && b(s, B), He(
        /** @type {Effect} */
        s
      ));
    }
}
function zt(e) {
  var t = S, n = R, r = N, i = _, s = D, a = I, f = z, u = U, l = e.f;
  S = /** @type {null | Value[]} */
  null, R = 0, N = null, _ = (l & (J | ne)) === 0 ? e : null, D = null, oe(e.ctx), z = !1, U = ++te, e.ac !== null && (Nt(() => {
    e.ac.abort(H);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= ve;
    var c = e.deps, d = w?.is_fork;
    if (S !== null) {
      var v;
      if (d || me(e, R), c !== null && R > 0)
        for (c.length = R + S.length, v = 0; v < S.length; v++)
          c[R + v] = S[v];
      else
        e.deps = c = S;
      if (Ke() && (e.f & O) !== 0)
        for (v = R; v < c.length; v++)
          (c[v].reactions ??= []).push(e);
    } else !d && c !== null && R < c.length && (me(e, R), c.length = R);
    if (ct() && N !== null && !z && c !== null && (e.f & (E | B | A)) === 0)
      for (v = 0; v < /** @type {Source[]} */
      N.length; v++)
        Pt(
          N[v],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (te++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = te;
      if (t !== null)
        for (const g of t)
          g.rv = te;
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= je, S = t, R = n, N = r, _ = i, D = s, oe(a), z = f, U = u;
  }
}
function jn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !ae.call(S, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & O) !== 0 && (s.f ^= O, s.f &= ~re), $e(s), yn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      jn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    b(e, y);
    var n = p, r = ke;
    p = e, ke = !0;
    try {
      (t & (Q | ft)) !== 0 ? Cn(e) : Ge(e), Mt(e);
      var i = zt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ct;
      var s;
    } finally {
      ke = r, p = n;
    }
  }
}
function T(e) {
  var t = e.f, n = (t & E) !== 0;
  if (_ !== null && !z) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (D === null || !ae.call(D, e))) {
      var i = _.deps;
      if ((_.f & je) !== 0)
        e.rv < te && (e.rv = te, S === null && i !== null && i[R] === e ? R++ : S === null ? S = [e] : S.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
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
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || jt(a)) && (f = Ue(a)), Z.set(a, f), f;
    }
    var u = (a.f & O) === 0 && !z && _ !== null && (ke || (_.f & O) !== 0), l = (a.f & ve) === 0;
    Ee(a) && (u && (a.f |= O), mt(a)), u && !l && (yt(a), It(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function It(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & O) === 0 && (yt(
        /** @type {Derived} */
        t
      ), It(
        /** @type {Derived} */
        t
      ));
}
function jt(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & E) !== 0 && jt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ln(e) {
  var t = z;
  try {
    return z = !0, e();
  } finally {
    z = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function qn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Pe(e, t) {
  qn("op_set_text", e, t);
}
const Bn = ["touchstart", "touchmove"];
function Yn(e) {
  return Bn.includes(e);
}
const ge = Symbol("events"), Lt = /* @__PURE__ */ new Set(), Be = /* @__PURE__ */ new Set();
function ze(e, t, n) {
  (t[ge] ??= {})[e] = n;
}
function $n(e) {
  for (var t = 0; t < e.length; t++)
    Lt.add(e[t]);
  for (var n of Be)
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
  var a = 0, f = it === e && e[ge];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ge] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    $t(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    C(null), Y(null);
    try {
      for (var c, d = []; s !== null; ) {
        var v = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ge]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (m) {
          c ? d.push(m) : c = m;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        s = v;
      }
      if (c) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw c;
      }
    } finally {
      e[ge] = t, delete e.currentTarget, C(o), Y(h);
    }
  }
}
const Hn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Un(e) {
  return (
    /** @type {string} */
    Hn?.createHTML(e) ?? e
  );
}
function Vn(e) {
  var t = Tn("template");
  return t.innerHTML = Un(e.replaceAll("<!>", "<!---->")), t.content;
}
function Kn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  var n = (t & rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Vn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Rt(r));
    var s = (
      /** @type {TemplateNode} */
      n || Tt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Kn(s, s), s;
  };
}
function Wn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Zn(e, t) {
  return Jn(e, t);
}
const Te = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  xn();
  var u = void 0, l = Rn(() => {
    var o = n ?? t.appendChild(kt());
    vn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        at({});
        var v = (
          /** @type {ComponentContext} */
          I
        );
        s && (v.c = s), i && (r.$$events = i), u = e(d, r) || {}, ot();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var v = 0; v < d.length; v++) {
        var g = d[v];
        if (!h.has(g)) {
          h.add(g);
          var m = Yn(g);
          for (const De of [t, document]) {
            var k = Te.get(De);
            k === void 0 && (k = /* @__PURE__ */ new Map(), Te.set(De, k));
            var se = k.get(g);
            se === void 0 ? (De.addEventListener(g, st, { passive: m }), k.set(g, 1)) : k.set(g, se + 1);
          }
        }
      }
    };
    return c(Yt(Lt)), Be.add(c), () => {
      for (var d of h)
        for (const m of [t, document]) {
          var v = (
            /** @type {Map<string, number>} */
            Te.get(m)
          ), g = (
            /** @type {number} */
            v.get(d)
          );
          --g == 0 ? (m.removeEventListener(d, st), v.delete(d), v.size === 0 && Te.delete(m)) : v.set(d, g);
        }
      Be.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(u, l), u;
}
let Qn = /* @__PURE__ */ new WeakMap();
class Xn extends Map {
  /** @type {Map<K, Source<number>>} */
  #t = /* @__PURE__ */ new Map();
  #u = /* @__PURE__ */ F(0);
  #n = /* @__PURE__ */ F(0);
  #l = U || -1;
  /**
   * @param {Iterable<readonly [K, V]> | null | undefined} [value]
   */
  constructor(t) {
    if (super(), t) {
      for (var [n, r] of t)
        super.set(n, r);
      this.#n.v = super.size;
    }
  }
  /**
   * If the source is being created inside the same reaction as the SvelteMap instance,
   * we use `state` so that it will not be a dependency of the reaction. Otherwise we
   * use `source` so it will be.
   *
   * @template T
   * @param {T} value
   * @returns {Source<T>}
   */
  #r(t) {
    return U === this.#l ? /* @__PURE__ */ F(t) : ye(t);
  }
  /** @param {K} key */
  has(t) {
    var n = this.#t, r = n.get(t);
    if (r === void 0)
      if (super.has(t))
        r = this.#r(0), n.set(t, r);
      else
        return T(this.#u), !1;
    return T(r), !0;
  }
  /**
   * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
   * @param {any} [this_arg]
   */
  forEach(t, n) {
    this.#e(), super.forEach(t, n);
  }
  /** @param {K} key */
  get(t) {
    var n = this.#t, r = n.get(t);
    if (r === void 0)
      if (super.has(t))
        r = this.#r(0), n.set(t, r);
      else {
        T(this.#u);
        return;
      }
    return T(r), super.get(t);
  }
  /**
   * @param {K} key
   * @param {V} value
   * */
  set(t, n) {
    var r = this.#t, i = r.get(t), s = super.get(t), a = super.set(t, n), f = this.#u;
    if (i === void 0)
      i = this.#r(0), r.set(t, i), M(this.#n, super.size), j(f);
    else if (s !== n) {
      j(i);
      var u = f.reactions === null ? null : new Set(f.reactions), l = u === null || !i.reactions?.every(
        (o) => (
          /** @type {NonNullable<typeof v_reactions>} */
          u.has(o)
        )
      );
      l && j(f);
    }
    return a;
  }
  /** @param {K} key */
  delete(t) {
    var n = this.#t, r = n.get(t), i = super.delete(t);
    return r !== void 0 && (n.delete(t), M(r, -1)), i && (M(this.#n, super.size), j(this.#u)), i;
  }
  clear() {
    if (super.size !== 0) {
      super.clear();
      var t = this.#t;
      M(this.#n, 0);
      for (var n of t.values())
        M(n, -1);
      j(this.#u), t.clear();
    }
  }
  #e() {
    T(this.#u);
    var t = this.#t;
    if (this.#n.v !== t.size) {
      for (var n of super.keys())
        if (!t.has(n)) {
          var r = this.#r(0);
          t.set(n, r);
        }
    }
    for ([, r] of this.#t)
      T(r);
  }
  keys() {
    return T(this.#u), super.keys();
  }
  values() {
    return this.#e(), super.values();
  }
  entries() {
    return this.#e(), super.entries();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get size() {
    return T(this.#n), super.size;
  }
}
var er = /* @__PURE__ */ Gn("<div><div> </div> <div> </div> <div> </div> <button>Bump Alice</button> <button>Add Charlie</button> <button>Remove Bob</button></div>");
function tr(e, t) {
  at(t, !0);
  let n = new Xn([["alice", 10], ["bob", 20]]);
  function r() {
    n.set("alice", n.get("alice") + 1);
  }
  function i() {
    n.set("charlie", 0);
  }
  function s() {
    n.delete("bob");
  }
  var a = er(), f = xe(a), u = xe(f), l = _e(f, 2), o = xe(l), h = _e(l, 2), c = xe(h), d = _e(h, 2), v = _e(d, 2), g = _e(v, 2);
  On(
    (m, k) => {
      Pe(u, `Size: ${n.size ?? ""}`), Pe(o, `Alice: ${m ?? ""}`), Pe(c, `Has bob: ${k ?? ""}`);
    },
    [() => n.get("alice"), () => n.has("bob")]
  ), ze("click", d, r), ze("click", v, i), ze("click", g, s), Wn(e, a), ot();
}
$n(["click"]);
function rr(e) {
  return Zn(tr, { target: e });
}
export {
  rr as default,
  rr as rvst_mount
};

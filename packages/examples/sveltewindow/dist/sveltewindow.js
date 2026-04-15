var jt = Array.isArray, zt = Array.prototype.indexOf, ue = Array.prototype.includes, qt = Array.from, Yt = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, Kt = Object.prototype, Wt = Array.prototype, $t = Object.getPrototypeOf, Ge = Object.isExtensible;
const Bt = () => {
};
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const m = 2, ge = 4, Oe = 8, ut = 1 << 24, Z = 16, G = 32, ne = 64, Ie = 128, R = 512, b = 1024, k = 2048, q = 4096, H = 8192, j = 16384, he = 32768, Ze = 1 << 25, Se = 65536, Je = 1 << 17, Ut = 1 << 18, de = 1 << 19, Vt = 1 << 20, re = 65536, Le = 1 << 21, Ye = 1 << 22, U = 1 << 23, Fe = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Gt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Jt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Qt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Xt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function en() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const tn = 2, E = Symbol(), nn = "http://www.w3.org/1999/xhtml";
function rn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function at(e) {
  return e === this.v;
}
let P = null;
function ae(e) {
  P = e;
}
function sn(e, t = !1, n) {
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
function ln(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Sn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function ot() {
  return !0;
}
let le = [];
function fn() {
  var e = le;
  le = [], Ht(e);
}
function ee(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && fn();
    });
  }
  le.push(e);
}
function ct(e) {
  var t = p;
  if (t === null)
    return _.f |= U, e;
  if ((t.f & he) === 0 && (t.f & ge) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
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
const un = -7169;
function y(e, t) {
  e.f = e.f & un | t;
}
function Ke(e) {
  (e.f & R) !== 0 || e.deps === null ? y(e, b) : y(e, q);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & m) === 0 || (t.f & re) === 0 || (t.f ^= re, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), ht(e.deps), y(e, b);
}
const $ = /* @__PURE__ */ new Set();
let w = null, F = null, je = null, Ce = !1, fe = null, xe = null;
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
        y(r, k), this.schedule(r);
      for (r of n.m)
        y(r, q), this.schedule(r);
    }
  }
  #h() {
    if (Qe++ > 1e3 && ($.delete(this), on()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), y(f, k), this.schedule(f);
      for (const f of this.#n)
        y(f, q), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw gt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = ie.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (fe = null, xe = null, this.#c() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#s)
        pt(f, u);
    } else {
      this.#r.size === 0 && $.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Xe(r), Xe(n), this.#i?.resolve();
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
    a !== null && ($.add(a), a.#h()), $.has(this) || this.#w();
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
      var s = i.f, a = (s & (G | ne)) !== 0, f = a && (s & b) !== 0, u = f || (s & H) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= b : (s & ge) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & U) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#h();
    } finally {
      Qe = 0, je = null, fe = null, xe = null, Ce = !1, w = null, F = null, V.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), $.delete(this);
  }
  #w() {
    for (const l of $) {
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
    for (const l of $)
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
    this.#o || r || (this.#o = !0, ee(() => {
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
    return (this.#i ??= ft()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ie();
      Ce || ($.add(w), ee(() => {
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
    if (je = t, t.b?.is_pending && (t.f & (ge | Oe | ut)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (_ === null || (_.f & m) === 0))
        return;
      if ((r & (ne | G)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#e.push(n);
  }
}
function on() {
  try {
    Zt();
  } catch (e) {
    B(e, je);
  }
}
let K = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | H)) === 0 && ye(r) && (K = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ot(r), K?.size > 0)) {
        V.clear();
        for (const i of K) {
          if ((i.f & (j | H)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            K.has(a) && (K.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (j | H)) === 0 && ce(u);
          }
        }
        K.clear();
      }
    }
    K = null;
  }
}
function vt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & m) !== 0 ? vt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & k) === 0 && _t(i, t, r) && (y(i, k), We(
        /** @type {Effect} */
        i
      ));
    }
}
function _t(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & m) !== 0 && _t(
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
function We(e) {
  w.schedule(e);
}
function pt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), y(e, b);
    for (var n = e.first; n !== null; )
      pt(n, t), n = n.next;
  }
}
function gt(e) {
  y(e, b);
  for (var t = e.first; t !== null; )
    gt(t), t = t.next;
}
function cn(e) {
  let t = 0, n = De(0), r;
  return () => {
    Ue() && (L(n), Nn(() => (t === 0 && (r = jn(() => e(() => pe(n)))), t += 1, () => {
      ee(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, pe(n));
      });
    })));
  };
}
var hn = Se | de;
function dn(e, t, n, r) {
  new vn(e, t, n, r);
}
class vn {
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
  #_ = cn(() => (this.#a = De(this.#o), () => {
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Dn(() => {
      this.#y();
    }, hn);
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
  #m(t) {
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), ee(() => {
      var n = this.#s = document.createDocumentFragment(), r = St();
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
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Cn(this.#e, t);
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
    dt(t, this.#v, this.#h);
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
    var n = p, r = _, i = P;
    Y(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      Y(n), O(r), ae(i);
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ee(() => {
      this.#c = !1, this.#a && Re(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), L(
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
    this.#e && (z(this.#e), this.#e = null), this.#t && (z(this.#t), this.#t = null), this.#n && (z(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        rn();
        return;
      }
      i = !0, s && en(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        B(l, this.#i && this.#i.parent);
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
              () => u,
              () => a
            );
          });
        } catch (l) {
          return B(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ee(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        B(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => B(l, this.#i && this.#i.parent)
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
    } catch (v) {
      (a.f & j) === 0 && B(v, a);
    }
    Ae();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ wn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ae();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), O(t), ae(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  Y(null), O(null), ae(null), e && w?.deactivate();
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
function gn(e) {
  var t = m | k, n = _ !== null && (_.f & m) !== 0 ? (
    /** @type {Derived} */
    _
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
function wn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Gt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = De(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return Rn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ft();
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
      if ((u.f & he) !== 0)
        var h = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(W), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(W);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === W;
        h(g);
      }
      if (!(d === W || (u.f & j) !== 0)) {
        if (o.activate(), d)
          s.f |= U, Re(s, d);
        else {
          (s.f & U) !== 0 && (s.f ^= U), Re(s, v);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(W);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Rt(() => {
    for (const u of f.values())
      u.reject(W);
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
function yn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      z(
        /** @type {Effect} */
        t[n]
      );
  }
}
function bn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & m) === 0)
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
  Y(bn(e));
  try {
    e.f &= ~re, yn(e), t = Pt(e);
  } finally {
    Y(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = $e(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    y(e, b);
    return;
  }
  oe || (F !== null ? (Ue() || w?.is_fork) && F.set(e, n) : Ke(e));
}
function mn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = Bt, t.ac = null, we(t, 0), Ve(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let ze = /* @__PURE__ */ new Set();
const V = /* @__PURE__ */ new Map();
let mt = !1;
function De(e, t) {
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
function M(e, t) {
  const n = De(e);
  return Pn(n), n;
}
function I(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (_.f & Je) !== 0) && ot() && (_.f & (m | Z | Ye | Je)) !== 0 && (N === null || !ue.call(N, e)) && Xt();
  let r = n ? ve(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? V.set(e, t) : V.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & m) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && $e(s), F === null && Ke(s);
    }
    e.wv = Ft(), Et(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (G | ne)) === 0 && (A === null ? In([e]) : A.push(e)), !i.is_fork && ze.size > 0 && !mt && En();
  }
  return t;
}
function En() {
  mt = !1;
  for (const e of ze)
    (e.f & b) !== 0 && y(e, q), ye(e) && ce(e);
  ze.clear();
}
function pe(e) {
  I(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && y(a, t), (f & m) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        F?.delete(l), (f & re) === 0 && (f & R && (a.f |= re), Et(l, q, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && K !== null && K.add(o), n !== null ? n.push(o) : We(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Fe in e)
    return e;
  const t = $t(e);
  if (t !== Kt && t !== Wt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = jt(e), i = /* @__PURE__ */ M(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var u = _, l = te;
    O(null), nt(s);
    var o = f();
    return O(u), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Jt();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ M(l.value);
          return n.set(u, h), h;
        }) : I(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ M(E));
            n.set(u, o), pe(i);
          }
        } else
          I(l, E), pe(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Fe)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || _e(f, u)?.writable) && (o = a(() => {
          var v = ve(h ? f[u] : E), d = /* @__PURE__ */ M(v);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = L(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = L(o));
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
        if (u === Fe)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || _e(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(f[u]) : E, v = /* @__PURE__ */ M(c);
            return v;
          }), n.set(u, l));
          var h = L(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? I(d, E) : v in f && (d = a(() => /* @__PURE__ */ M(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || _e(f, u)?.writable) && (h = a(() => /* @__PURE__ */ M(void 0)), I(h, ve(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => ve(l));
          I(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(u);
            Number.isInteger(se) && se >= D.v && I(D, se + 1);
          }
          pe(i);
        }
        return !0;
      },
      ownKeys(f) {
        L(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        Qt();
      }
    }
  );
}
var Ne, xt, Tt, kt;
function xn() {
  if (Ne === void 0) {
    Ne = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = _e(t, "firstChild").get, kt = _e(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
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
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
function be(e, t) {
  return /* @__PURE__ */ At(e);
}
function et(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Tn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(nn, e, void 0)
  );
}
function He(e) {
  var t = _, n = p;
  O(null), Y(null);
  try {
    return e();
  } finally {
    O(t), Y(n);
  }
}
function kn(e, t) {
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
  if ((e & ge) !== 0)
    fe !== null ? fe.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw z(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Z) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && kn(i, n), _ !== null && (_.f & m) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ue() {
  return _ !== null && !C;
}
function Rt(e) {
  const t = J(Oe, null);
  return y(t, b), t.teardown = e, t;
}
function Sn(e) {
  return J(ge | Vt, e);
}
function An(e) {
  ie.ensure();
  const t = J(ne | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      z(t), r(void 0);
    }) : (z(t), r(void 0));
  });
}
function Rn(e) {
  return J(Ye | de, e);
}
function Nn(e, t = 0) {
  return J(Oe | t, e);
}
function On(e, t = [], n = [], r = []) {
  _n(r, t, n, (i) => {
    J(Oe, () => e(...i.map(L)));
  });
}
function Dn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(G | de, e);
}
function Nt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = _;
    tt(!0), O(null);
    try {
      t.call(null);
    } finally {
      tt(n), O(r);
    }
  }
}
function Ve(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && He(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : z(n, t), n = r;
  }
}
function Mn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && z(t), t = n;
  }
}
function z(e, t = !0) {
  var n = !1;
  (t || (e.f & Ut) !== 0) && e.nodes !== null && e.nodes.end !== null && (Fn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Ze), Ve(e, t && !n), we(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Nt(e), e.f ^= Ze, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Ot(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Ot(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Dt(e, r, !0);
  var i = () => {
    n && z(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Dt(e, t, n) {
  if ((e.f & H) === 0) {
    e.f ^= H;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Se) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      Dt(i, t, a ? n : !1), i = s;
    }
  }
}
function Cn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let ke = !1, oe = !1;
function tt(e) {
  oe = e;
}
let _ = null, C = !1;
function O(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let N = null;
function Pn(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function In(e) {
  A = e;
}
let Mt = 1, X = 0, te = X;
function nt(e) {
  te = e;
}
function Ft() {
  return ++Mt;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & m && (e.f &= ~re), (t & q) !== 0) {
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
    F === null && y(e, b);
  }
  return !1;
}
function Ct(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & m) !== 0 ? Ct(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, k) : (s.f & b) !== 0 && y(s, q), We(
        /** @type {Effect} */
        s
      ));
    }
}
function Pt(e) {
  var t = T, n = S, r = A, i = _, s = N, a = P, f = C, u = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, _ = (l & (G | ne)) === 0 ? e : null, N = null, ae(e.ctx), C = !1, te = ++X, e.ac !== null && (He(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || we(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ue() && (e.f & R) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (we(e, S), c.length = S);
    if (ot() && A !== null && !C && c !== null && (e.f & (m | q | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Ct(
          A[d],
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
    return (e.f & U) !== 0 && (e.f ^= U), h;
  } catch (g) {
    return ct(g);
  } finally {
    e.f ^= Le, T = t, S = n, A = r, _ = i, N = s, ae(a), C = f, te = u;
  }
}
function Ln(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = zt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & m) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~re), Ke(s), mn(s), we(s, 0);
  }
}
function we(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ln(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & j) === 0) {
    y(e, b);
    var n = p, r = ke;
    p = e, ke = !0;
    try {
      (t & (Z | ut)) !== 0 ? Mn(e) : Ve(e), Nt(e);
      var i = Pt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mt;
      var s;
    } finally {
      ke = r, p = n;
    }
  }
}
function L(e) {
  var t = e.f, n = (t & m) !== 0;
  if (_ !== null && !C) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = _.deps;
      if ((_.f & Le) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (oe && V.has(e))
    return V.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Lt(a)) && (f = $e(a)), V.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !C && _ !== null && (ke || (_.f & R) !== 0), l = (a.f & he) === 0;
    ye(a) && (u && (a.f |= R), yt(a)), u && !l && (bt(a), It(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & U) !== 0)
    throw e.v;
  return e.v;
}
function It(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & m) !== 0 && (t.f & R) === 0 && (bt(
        /** @type {Derived} */
        t
      ), It(
        /** @type {Derived} */
        t
      ));
}
function Lt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (V.has(t) || (t.f & m) !== 0 && Lt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function jn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function zn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Pe(e, t) {
  zn("op_set_text", e, t);
}
const qn = ["touchstart", "touchmove"];
function Yn(e) {
  return qn.includes(e);
}
const me = Symbol("events"), Kn = /* @__PURE__ */ new Set(), it = /* @__PURE__ */ new Set();
function Wn(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || qe.call(t, s), !s.cancelBubble)
      return He(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ee(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function st(e, t, n, r, i) {
  var s = { capture: r, passive: i }, a = Wn(e, t, n, s);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Rt(() => {
    t.removeEventListener(e, a, s);
  });
}
let lt = null;
function qe(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  lt = e;
  var a = 0, f = lt === e && e[me];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[me] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Yt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    O(null), Y(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[me]?.[r];
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
      e[me] = t, delete e.currentTarget, O(o), Y(h);
    }
  }
}
const $n = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Bn(e) {
  return (
    /** @type {string} */
    $n?.createHTML(e) ?? e
  );
}
function Hn(e) {
  var t = Tn("template");
  return t.innerHTML = Bn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Un(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Vn(e, t) {
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Hn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Un(s, s), s;
  };
}
function Gn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Zn(e, t) {
  return Jn(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  xn();
  var u = void 0, l = An(() => {
    var o = n ?? t.appendChild(St());
    dn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        sn({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, ln();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Yn(g);
          for (const Me of [t, document]) {
            var D = Ee.get(Me);
            D === void 0 && (D = /* @__PURE__ */ new Map(), Ee.set(Me, D));
            var se = D.get(g);
            se === void 0 ? (Me.addEventListener(g, qe, { passive: x }), D.set(g, 1)) : D.set(g, se + 1);
          }
        }
      }
    };
    return c(qt(Kn)), it.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, qe), d.delete(v), d.size === 0 && Ee.delete(x)) : d.set(v, g);
        }
      it.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(u, l), u;
}
let Qn = /* @__PURE__ */ new WeakMap();
var Xn = /* @__PURE__ */ Vn("<div><div> </div> <div> </div> <div> </div></div>");
function er(e) {
  let t = /* @__PURE__ */ M("none"), n = /* @__PURE__ */ M(!1), r = /* @__PURE__ */ M(0);
  function i(v) {
    I(t, v.key, !0), I(n, v.ctrlKey ?? !1, !0);
  }
  function s(v) {
    I(r, window.innerWidth, !0);
  }
  var a = Xn();
  st("keydown", Ne, i), st("resize", Ne, s);
  var f = be(a), u = be(f), l = et(f, 2), o = be(l), h = et(l, 2), c = be(h);
  On(() => {
    Pe(u, `Last key: ${L(t) ?? ""}`), Pe(o, `Ctrl: ${L(n) ?? ""}`), Pe(c, `Width: ${L(r) ?? ""}`);
  }), Gn(e, a);
}
function nr(e) {
  return Zn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

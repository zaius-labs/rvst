var jt = Array.isArray, qt = Array.prototype.indexOf, ue = Array.prototype.includes, Vt = Array.from, Yt = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, zt = Object.prototype, $t = Array.prototype, Bt = Object.getPrototypeOf, We = Object.isExtensible;
const Ht = () => {
};
function Ut(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const m = 2, ge = 4, Re = 8, ut = 1 << 24, Z = 16, G = 32, ne = 64, Fe = 128, R = 512, b = 1024, k = 2048, q = 4096, U = 8192, L = 16384, he = 32768, Ge = 1 << 25, ke = 65536, Ze = 1 << 17, Kt = 1 << 18, de = 1 << 19, Wt = 1 << 20, re = 65536, Pe = 1 << 21, Ve = 1 << 22, K = 1 << 23, Oe = Symbol("$state"), z = new class extends Error {
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
let F = null;
function ae(e) {
  F = e;
}
function sn(e, t = !1, n) {
  F = {
    p: F,
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
    F
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Rn(r);
  }
  return t.i = !0, F = t.p, /** @type {T} */
  {};
}
function ot() {
  return !0;
}
let le = [];
function fn() {
  var e = le;
  le = [], Ut(e);
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
    return _.f |= K, e;
  if ((t.f & he) === 0 && (t.f & ge) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Fe) !== 0) {
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
function Ye(e) {
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
const B = /* @__PURE__ */ new Set();
let w = null, C = null, Ie = null, Ce = !1, fe = null, Ee = null;
var Je = 0;
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
    if (Je++ > 1e3 && (B.delete(this), on()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), y(u, k), this.schedule(u);
      for (const u of this.#n)
        y(u, q), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = Ee = [];
    for (const u of t)
      try {
        this.#a(u, n, r);
      } catch (f) {
        throw gt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = ie.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (fe = null, Ee = null, this.#c() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [u, f] of this.#s)
        pt(u, f);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
      for (const u of this.#l) u(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
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
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (G | ne)) !== 0, u = a && (s & b) !== 0, f = u || (s & U) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#h();
    } finally {
      Je = 0, Ie = null, fe = null, Ee = null, Ce = !1, w = null, C = null, W.clear();
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
          vt(u, i, s, a);
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
      Ce || (B.add(w), ee(() => {
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
    if (Ie = t, t.b?.is_pending && (t.f & (ge | Re | ut)) !== 0 && (t.f & he) === 0) {
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
    H(e, Ie);
  }
}
let Y = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | U)) === 0 && ye(r) && (Y = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), Y?.size > 0)) {
        W.clear();
        for (const i of Y) {
          if ((i.f & (L | U)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (L | U)) === 0 && ce(f);
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
      (s & m) !== 0 ? vt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ve | Z)) !== 0 && (s & k) === 0 && _t(i, t, r) && (y(i, k), ze(
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
function ze(e) {
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
  let t = 0, n = Ne(0), r;
  return () => {
    Ue() && (I(n), On(() => (t === 0 && (r = Vn(() => e(() => pe(n)))), t += 1, () => {
      ee(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, pe(n));
      });
    })));
  };
}
var hn = ke | de;
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
  #_ = cn(() => (this.#a = Ne(this.#o), () => {
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
      a.b = this, a.f |= Fe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Mn(() => {
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
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        In(this.#e, t);
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
    var n = p, r = _, i = F;
    V(this.#i), D(this.#i), ae(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      V(n), D(r), ae(i);
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ee(() => {
      this.#c = !1, this.#a && Ae(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), I(
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
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        rn();
        return;
      }
      i = !0, s && en(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
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
            l.b = this, l.f |= Fe, r(
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
    ee(() => {
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
  ), u = pn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (v) {
      (a.f & L) === 0 && H(v, a);
    }
    Se();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ wn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Se();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = F, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    V(e), D(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  V(null), D(null), ae(null), e && w?.deactivate();
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
    ctx: F,
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
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !_, u = /* @__PURE__ */ new Map();
  return Dn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = ft();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (v) {
      l.reject(v), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & he) !== 0)
        var h = wt();
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
      if (!(d === z || (f.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= K, Ae(s, d);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ae(s, v);
          for (const [x, O] of u) {
            if (u.delete(x), x === o) break;
            O.reject(z);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Rt(() => {
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
function yn(e) {
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
function bn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & m) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function $e(e) {
  var t, n = p;
  V(bn(e));
  try {
    e.f &= ~re, yn(e), t = Pt(e);
  } finally {
    V(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = $e(e);
  if (!e.equals(n) && (e.wv = Mt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    y(e, b);
    return;
  }
  oe || (C !== null ? (Ue() || w?.is_fork) && C.set(e, n) : Ye(e));
}
function mn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = Ht, t.ac = null, we(t, 0), Ke(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Le = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let mt = !1;
function Ne(e, t) {
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
function P(e, t) {
  const n = Ne(e);
  return Ln(n), n;
}
function $(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (_.f & Ze) !== 0) && ot() && (_.f & (m | Z | Ve | Ze)) !== 0 && (N === null || !ue.call(N, e)) && Xt();
  let r = n ? ve(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & m) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && $e(s), C === null && Ye(s);
    }
    e.wv = Mt(), Et(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (G | ne)) === 0 && (A === null ? jn([e]) : A.push(e)), !i.is_fork && Le.size > 0 && !mt && En();
  }
  return t;
}
function En() {
  mt = !1;
  for (const e of Le)
    (e.f & b) !== 0 && y(e, q), ye(e) && ce(e);
  Le.clear();
}
function xn(e, t = 1) {
  var n = I(e), r = t === 1 ? n++ : n--;
  return $(e, n), r;
}
function pe(e) {
  $(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && y(a, t), (u & m) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        C?.delete(l), (u & re) === 0 && (u & R && (a.f |= re), Et(l, q, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Z) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : ze(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Bt(e);
  if (t !== zt && t !== $t)
    return e;
  var n = /* @__PURE__ */ new Map(), r = jt(e), i = /* @__PURE__ */ P(0), s = te, a = (u) => {
    if (te === s)
      return u();
    var f = _, l = te;
    D(null), tt(s);
    var o = u();
    return D(f), tt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Jt();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ P(l.value);
          return n.set(f, h), h;
        }) : $(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ P(E));
            n.set(f, o), pe(i);
          }
        } else
          $(l, E), pe(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Oe)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || _e(u, f)?.writable) && (o = a(() => {
          var v = ve(h ? u[f] : E), d = /* @__PURE__ */ P(v);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = I(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = I(o));
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
        if (f === Oe)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || _e(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(u[f]) : E, v = /* @__PURE__ */ P(c);
            return v;
          }), n.set(f, l));
          var h = I(l);
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
            d !== void 0 ? $(d, E) : v in u && (d = a(() => /* @__PURE__ */ P(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || _e(u, f)?.writable) && (h = a(() => /* @__PURE__ */ P(void 0)), $(h, ve(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => ve(l));
          $(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(f);
            Number.isInteger(se) && se >= O.v && $(O, se + 1);
          }
          pe(i);
        }
        return !0;
      },
      ownKeys(u) {
        I(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        Qt();
      }
    }
  );
}
var Xe, je, xt, Tt, kt;
function Tn() {
  if (Xe === void 0) {
    Xe = window, je = document, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = _e(t, "firstChild").get, kt = _e(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
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
function Me(e, t) {
  return /* @__PURE__ */ At(e);
}
function kn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Sn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(nn, e, void 0)
  );
}
function He(e) {
  var t = _, n = p;
  D(null), V(null);
  try {
    return e();
  } finally {
    D(t), V(n);
  }
}
function An(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & U) !== 0 && (e |= U);
  var r = {
    ctx: F,
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
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && An(i, n), _ !== null && (_.f & m) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ue() {
  return _ !== null && !M;
}
function Rt(e) {
  const t = J(Re, null);
  return y(t, b), t.teardown = e, t;
}
function Rn(e) {
  return J(ge | Wt, e);
}
function Nn(e) {
  ie.ensure();
  const t = J(ne | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function Dn(e) {
  return J(Ve | de, e);
}
function On(e, t = 0) {
  return J(Re | t, e);
}
function Cn(e, t = [], n = [], r = []) {
  _n(r, t, n, (i) => {
    J(Re, () => e(...i.map(I)));
  });
}
function Mn(e, t = 0) {
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
    et(!0), D(null);
    try {
      t.call(null);
    } finally {
      et(n), D(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && He(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Fn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Pn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Ge), Ke(e, t && !n), we(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Nt(e), e.f ^= Ge, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Pn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Dt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Ot(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Ot(e, t, n) {
  if ((e.f & U) === 0) {
    e.f ^= U;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      Ot(i, t, a ? n : !1), i = s;
    }
  }
}
function In(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function et(e) {
  oe = e;
}
let _ = null, M = !1;
function D(e) {
  _ = e;
}
let p = null;
function V(e) {
  p = e;
}
let N = null;
function Ln(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function jn(e) {
  A = e;
}
let Ct = 1, X = 0, te = X;
function tt(e) {
  te = e;
}
function Mt() {
  return ++Ct;
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
    C === null && y(e, b);
  }
  return !1;
}
function Ft(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & m) !== 0 ? Ft(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, k) : (s.f & b) !== 0 && y(s, q), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function Pt(e) {
  var t = T, n = S, r = A, i = _, s = N, a = F, u = M, f = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, _ = (l & (G | ne)) === 0 ? e : null, N = null, ae(e.ctx), M = !1, te = ++X, e.ac !== null && (He(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= Pe;
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
    if (ot() && A !== null && !M && c !== null && (e.f & (m | q | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Ft(
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
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (g) {
    return ct(g);
  } finally {
    e.f ^= Pe, T = t, S = n, A = r, _ = i, N = s, ae(a), M = u, te = f;
  }
}
function qn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = qt.call(n, e);
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
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~re), Ye(s), mn(s), we(s, 0);
  }
}
function we(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & L) === 0) {
    y(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | ut)) !== 0 ? Fn(e) : Ke(e), Nt(e);
      var i = Pt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ct;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function I(e) {
  var t = e.f, n = (t & m) !== 0;
  if (_ !== null && !M) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = _.deps;
      if ((_.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (oe && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var u = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Lt(a)) && (u = $e(a)), W.set(a, u), u;
    }
    var f = (a.f & R) === 0 && !M && _ !== null && (Te || (_.f & R) !== 0), l = (a.f & he) === 0;
    ye(a) && (f && (a.f |= R), yt(a)), f && !l && (bt(a), It(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & K) !== 0)
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
    if (W.has(t) || (t.f & m) !== 0 && Lt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Vn(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function Yn(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function rt(e, t) {
  Yn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function $n(e) {
  return zn.includes(e);
}
const be = Symbol("events"), Bn = /* @__PURE__ */ new Set(), it = /* @__PURE__ */ new Set();
function Hn(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || qe.call(t, s), !s.cancelBubble)
      return He(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ee(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function st(e, t, n, r, i) {
  var s = { capture: r, passive: i }, a = Hn(e, t, n, s);
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
  var a = 0, u = lt === e && e[be];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[be] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (a = f);
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
    D(null), V(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[be]?.[r];
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
      e[be] = t, delete e.currentTarget, D(o), V(h);
    }
  }
}
const Un = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Kn(e) {
  return (
    /** @type {string} */
    Un?.createHTML(e) ?? e
  );
}
function Wn(e) {
  var t = Sn("template");
  return t.innerHTML = Kn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Gn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Zn(e, t) {
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Wn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Gn(s, s), s;
  };
}
function Jn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Qn(e, t) {
  return Xn(e, t);
}
const me = /* @__PURE__ */ new Map();
function Xn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  Tn();
  var f = void 0, l = Nn(() => {
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
          F
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || {}, ln();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const De of [t, document]) {
            var O = me.get(De);
            O === void 0 && (O = /* @__PURE__ */ new Map(), me.set(De, O));
            var se = O.get(g);
            se === void 0 ? (De.addEventListener(g, qe, { passive: x }), O.set(g, 1)) : O.set(g, se + 1);
          }
        }
      }
    };
    return c(Vt(Bn)), it.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            me.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, qe), d.delete(v), d.size === 0 && me.delete(x)) : d.set(v, g);
        }
      it.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return er.set(f, l), f;
}
let er = /* @__PURE__ */ new WeakMap();
var tr = /* @__PURE__ */ Zn("<div><div> </div> <div> </div></div>");
function nr(e) {
  let t = /* @__PURE__ */ P("visible"), n = /* @__PURE__ */ P(0);
  function r() {
    $(t, document.visibilityState ?? "visible", !0);
  }
  function i() {
    xn(n);
  }
  var s = tr();
  st("visibilitychange", je, r), st("click", je, i);
  var a = Me(s), u = Me(a), f = kn(a, 2), l = Me(f);
  Cn(() => {
    rt(u, `Visibility: ${I(t) ?? ""}`), rt(l, `Doc clicks: ${I(n) ?? ""}`);
  }), Jn(e, s);
}
function ir(e) {
  return Qn(nr, { target: e });
}
export {
  ir as default,
  ir as rvst_mount
};

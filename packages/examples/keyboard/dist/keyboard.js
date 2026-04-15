var It = Array.isArray, Lt = Array.prototype.indexOf, ue = Array.prototype.includes, jt = Array.from, qt = Object.defineProperty, ve = Object.getOwnPropertyDescriptor, Yt = Object.prototype, zt = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Bt = () => {
};
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function st() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const m = 2, ge = 4, Re = 8, lt = 1 << 24, Z = 16, G = 32, ne = 64, Ce = 128, R = 512, b = 1024, k = 2048, q = 4096, V = 8192, L = 16384, he = 32768, Ge = 1 << 25, ke = 65536, Ze = 1 << 17, Ut = 1 << 18, de = 1 << 19, Vt = 1 << 20, re = 65536, Pe = 1 << 21, Ye = 1 << 22, $ = 1 << 23, De = Symbol("$state"), K = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function $t() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Wt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Gt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Zt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Jt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Qt() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Xt = 2, E = Symbol(), en = "http://www.w3.org/1999/xhtml";
function tn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ft(e) {
  return e === this.v;
}
let C = null;
function ae(e) {
  C = e;
}
function nn(e, t = !1, n) {
  C = {
    p: C,
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
function rn(e) {
  var t = (
    /** @type {ComponentContext} */
    C
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Sn(r);
  }
  return t.i = !0, C = t.p, /** @type {T} */
  {};
}
function ut() {
  return !0;
}
let le = [];
function sn() {
  var e = le;
  le = [], Ht(e);
}
function ee(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && sn();
    });
  }
  le.push(e);
}
function at(e) {
  var t = p;
  if (t === null)
    return v.f |= $, e;
  if ((t.f & he) === 0 && (t.f & ge) === 0)
    throw e;
  U(e, t);
}
function U(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ce) !== 0) {
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
const ln = -7169;
function y(e, t) {
  e.f = e.f & ln | t;
}
function ze(e) {
  (e.f & R) !== 0 || e.deps === null ? y(e, b) : y(e, q);
}
function ot(e) {
  if (e !== null)
    for (const t of e)
      (t.f & m) === 0 || (t.f & re) === 0 || (t.f ^= re, ot(
        /** @type {Derived} */
        t.deps
      ));
}
function ct(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), ot(e.deps), y(e, b);
}
const H = /* @__PURE__ */ new Set();
let w = null, M = null, Ie = null, Me = !1, fe = null, Ee = null;
var Je = 0;
let fn = 1;
class ie {
  id = fn++;
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
        y(r, k), this.schedule(r);
      for (r of n.m)
        y(r, q), this.schedule(r);
    }
  }
  #h() {
    if (Je++ > 1e3 && (H.delete(this), un()), !this.#c()) {
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
        throw vt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = ie.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (fe = null, Ee = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        _t(u, f);
    } else {
      this.#r.size === 0 && H.delete(this), this.#t.clear(), this.#n.clear();
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
    a !== null && (H.add(a), a.#h()), H.has(this) || this.#w();
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
      var s = i.f, a = (s & (G | ne)) !== 0, u = a && (s & b) !== 0, f = u || (s & V) !== 0 || this.#s.has(i);
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      ct(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & $) === 0 && (this.current.set(t, [t.v, r]), M?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, M = null;
  }
  flush() {
    try {
      Me = !0, w = this, this.#h();
    } finally {
      Je = 0, Ie = null, fe = null, Ee = null, Me = !1, w = null, M = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), H.delete(this);
  }
  #w() {
    for (const l of H) {
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
          ht(u, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#a(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of H)
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
    return (this.#i ??= st()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ie();
      Me || (H.add(w), ee(() => {
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
    if (Ie = t, t.b?.is_pending && (t.f & (ge | Re | lt)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (v === null || (v.f & m) === 0))
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
function un() {
  try {
    Wt();
  } catch (e) {
    U(e, Ie);
  }
}
let z = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | V)) === 0 && ye(r) && (z = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Rt(r), z?.size > 0)) {
        W.clear();
        for (const i of z) {
          if ((i.f & (L | V)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            z.has(a) && (z.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (L | V)) === 0 && ce(f);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function ht(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & m) !== 0 ? ht(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & k) === 0 && dt(i, t, r) && (y(i, k), Ke(
        /** @type {Effect} */
        i
      ));
    }
}
function dt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & m) !== 0 && dt(
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
function Ke(e) {
  w.schedule(e);
}
function _t(e, t) {
  if (!((e.f & G) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), y(e, b);
    for (var n = e.first; n !== null; )
      _t(n, t), n = n.next;
  }
}
function vt(e) {
  y(e, b);
  for (var t = e.first; t !== null; )
    vt(t), t = t.next;
}
function an(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Ve() && (I(n), Nn(() => (t === 0 && (r = jn(() => e(() => pe(n)))), t += 1, () => {
      ee(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, pe(n));
      });
    })));
  };
}
var on = ke | de;
function cn(e, t, n, r) {
  new hn(e, t, n, r);
}
class hn {
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
  #a = null;
  #v = an(() => (this.#a = Ne(this.#o), () => {
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
      a.b = this, a.f |= Ce, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Dn(() => {
      this.#y();
    }, on);
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
      var n = this.#s = document.createDocumentFragment(), r = Tt();
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ct(t, this.#_, this.#h);
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
    var n = p, r = v, i = C;
    Y(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return at(s), null;
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
    return this.#v(), I(
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
        tn();
        return;
      }
      i = !0, s && Qt(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
      } catch (l) {
        U(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Ce, r(
              this.#l,
              () => f,
              () => a
            );
          });
        } catch (l) {
          return U(
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
        U(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => U(l, this.#i && this.#i.parent)
      ) : u(f);
    });
  }
}
function dn(e, t, n, r) {
  const i = vn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = _n(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (_) {
      (a.f & L) === 0 && U(_, a);
    }
    Se();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = pt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ pn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => U(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Se();
  }) : h();
}
function _n() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = C, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), O(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  Y(null), O(null), ae(null), e && w?.deactivate();
}
function pt() {
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
function vn(e) {
  var t = m | k, n = v !== null && (v.f & m) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: C,
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
function pn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && $t();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !v, u = /* @__PURE__ */ new Map();
  return Rn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = st();
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
      if ((f.f & he) !== 0)
        var h = pt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(K), u.delete(o);
      else {
        for (const _ of u.values())
          _.reject(K);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var g = d === K;
        h(g);
      }
      if (!(d === K || (f.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= $, Ae(s, d);
        else {
          (s.f & $) !== 0 && (s.f ^= $), Ae(s, _);
          for (const [x, D] of u) {
            if (u.delete(x), x === o) break;
            D.reject(K);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), St(() => {
    for (const f of u.values())
      f.reject(K);
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
function gn(e) {
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
function wn(e) {
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
function Be(e) {
  var t, n = p;
  Y(wn(e));
  try {
    e.f &= ~re, gn(e), t = Ft(e);
  } finally {
    Y(n);
  }
  return t;
}
function gt(e) {
  var t = e.v, n = Be(e);
  if (!e.equals(n) && (e.wv = Dt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    y(e, b);
    return;
  }
  oe || (M !== null ? (Ve() || w?.is_fork) && M.set(e, n) : ze(e));
}
function yn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(K), t.teardown = Bt, t.ac = null, we(t, 0), $e(t));
}
function wt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Le = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let yt = !1;
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
  return Pn(n), n;
}
function B(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (v.f & Ze) !== 0) && ut() && (v.f & (m | Z | Ye | Ze)) !== 0 && (N === null || !ue.call(N, e)) && Jt();
  let r = n ? _e(t) : t;
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
      (e.f & k) !== 0 && Be(s), M === null && ze(s);
    }
    e.wv = Dt(), bt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (G | ne)) === 0 && (A === null ? In([e]) : A.push(e)), !i.is_fork && Le.size > 0 && !yt && bn();
  }
  return t;
}
function bn() {
  yt = !1;
  for (const e of Le)
    (e.f & b) !== 0 && y(e, q), ye(e) && ce(e);
  Le.clear();
}
function mn(e, t = 1) {
  var n = I(e), r = t === 1 ? n++ : n--;
  return B(e, n), r;
}
function pe(e) {
  B(e, e.v + 1);
}
function bt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && y(a, t), (u & m) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        M?.delete(l), (u & re) === 0 && (u & R && (a.f |= re), bt(l, q, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Z) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : Ke(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Kt(e);
  if (t !== Yt && t !== zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = It(e), i = /* @__PURE__ */ P(0), s = te, a = (u) => {
    if (te === s)
      return u();
    var f = v, l = te;
    O(null), et(s);
    var o = u();
    return O(f), et(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Gt();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ P(l.value);
          return n.set(f, h), h;
        }) : B(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ P(E));
            n.set(f, o), pe(i);
          }
        } else
          B(l, E), pe(i);
        return !0;
      },
      get(u, f, l) {
        if (f === De)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || ve(u, f)?.writable) && (o = a(() => {
          var _ = _e(h ? u[f] : E), d = /* @__PURE__ */ P(_);
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
        if (f === De)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || ve(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? _e(u[f]) : E, _ = /* @__PURE__ */ P(c);
            return _;
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
          for (var _ = l; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var d = n.get(_ + "");
            d !== void 0 ? B(d, E) : _ in u && (d = a(() => /* @__PURE__ */ P(E)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || ve(u, f)?.writable) && (h = a(() => /* @__PURE__ */ P(void 0)), B(h, _e(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(l));
          B(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(f);
            Number.isInteger(se) && se >= D.v && B(D, se + 1);
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
        Zt();
      }
    }
  );
}
var je, mt, Et, xt;
function En() {
  if (je === void 0) {
    je = window, mt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Et = ve(t, "firstChild").get, xt = ve(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function kt(e) {
  return (
    /** @type {TemplateNode | null} */
    Et.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
function Fe(e, t) {
  return /* @__PURE__ */ kt(e);
}
function xn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function Tn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(en, e, void 0)
  );
}
function Ue(e) {
  var t = v, n = p;
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
  n !== null && (n.f & V) !== 0 && (e |= V);
  var r = {
    ctx: C,
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
  if (i !== null && (i.parent = n, n !== null && kn(i, n), v !== null && (v.f & m) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ve() {
  return v !== null && !F;
}
function St(e) {
  const t = J(Re, null);
  return y(t, b), t.teardown = e, t;
}
function Sn(e) {
  return J(ge | Vt, e);
}
function An(e) {
  ie.ensure();
  const t = J(ne | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function Rn(e) {
  return J(Ye | de, e);
}
function Nn(e, t = 0) {
  return J(Re | t, e);
}
function On(e, t = [], n = [], r = []) {
  dn(r, t, n, (i) => {
    J(Re, () => e(...i.map(I)));
  });
}
function Dn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(G | de, e);
}
function At(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    Xe(!0), O(null);
    try {
      t.call(null);
    } finally {
      Xe(n), O(r);
    }
  }
}
function $e(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ue(() => {
      i.abort(K);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Mn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Ut) !== 0) && e.nodes !== null && e.nodes.end !== null && (Fn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Ge), $e(e, t && !n), we(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  At(e), e.f ^= Ge, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Rt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function Rt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Nt(e, r, !0);
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
function Nt(e, t, n) {
  if ((e.f & V) === 0) {
    e.f ^= V;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      Nt(i, t, a ? n : !1), i = s;
    }
  }
}
function Cn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function Xe(e) {
  oe = e;
}
let v = null, F = !1;
function O(e) {
  v = e;
}
let p = null;
function Y(e) {
  p = e;
}
let N = null;
function Pn(e) {
  v !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function In(e) {
  A = e;
}
let Ot = 1, X = 0, te = X;
function et(e) {
  te = e;
}
function Dt() {
  return ++Ot;
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
      ) && gt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    M === null && y(e, b);
  }
  return !1;
}
function Mt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & m) !== 0 ? Mt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, k) : (s.f & b) !== 0 && y(s, q), Ke(
        /** @type {Effect} */
        s
      ));
    }
}
function Ft(e) {
  var t = T, n = S, r = A, i = v, s = N, a = C, u = F, f = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, v = (l & (G | ne)) === 0 ? e : null, N = null, ae(e.ctx), F = !1, te = ++X, e.ac !== null && (Ue(() => {
    e.ac.abort(K);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var d;
      if (_ || we(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ve() && (e.f & R) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (we(e, S), c.length = S);
    if (ut() && A !== null && !F && c !== null && (e.f & (m | q | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Mt(
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
    return (e.f & $) !== 0 && (e.f ^= $), h;
  } catch (g) {
    return at(g);
  } finally {
    e.f ^= Pe, T = t, S = n, A = r, v = i, N = s, ae(a), F = u, te = f;
  }
}
function Ln(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Lt.call(n, e);
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
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~re), ze(s), yn(s), we(s, 0);
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
  if ((t & L) === 0) {
    y(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | lt)) !== 0 ? Mn(e) : $e(e), At(e);
      var i = Ft(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ot;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function I(e) {
  var t = e.f, n = (t & m) !== 0;
  if (v !== null && !F) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = v.deps;
      if ((v.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
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
      return ((a.f & b) === 0 && a.reactions !== null || Pt(a)) && (u = Be(a)), W.set(a, u), u;
    }
    var f = (a.f & R) === 0 && !F && v !== null && (Te || (v.f & R) !== 0), l = (a.f & he) === 0;
    ye(a) && (f && (a.f |= R), gt(a)), f && !l && (wt(a), Ct(a));
  }
  if (M?.has(e))
    return M.get(e);
  if ((e.f & $) !== 0)
    throw e.v;
  return e.v;
}
function Ct(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & m) !== 0 && (t.f & R) === 0 && (wt(
        /** @type {Derived} */
        t
      ), Ct(
        /** @type {Derived} */
        t
      ));
}
function Pt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & m) !== 0 && Pt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function jn(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const tt = globalThis.Deno?.core?.ops ?? null;
function qn(e, ...t) {
  tt?.[e] ? tt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nt(e, t) {
  qn("op_set_text", e, t);
}
const Yn = ["touchstart", "touchmove"];
function zn(e) {
  return Yn.includes(e);
}
const be = Symbol("events"), Kn = /* @__PURE__ */ new Set(), rt = /* @__PURE__ */ new Set();
function Bn(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || qe.call(t, s), !s.cancelBubble)
      return Ue(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ee(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function Hn(e, t, n, r, i) {
  var s = { capture: r, passive: i }, a = Bn(e, t, n, s);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && St(() => {
    t.removeEventListener(e, a, s);
  });
}
let it = null;
function qe(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  it = e;
  var a = 0, u = it === e && e[be];
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
    qt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    O(null), Y(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[be]?.[r];
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
      e[be] = t, delete e.currentTarget, O(o), Y(h);
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
function Vn(e) {
  return (
    /** @type {string} */
    Un?.createHTML(e) ?? e
  );
}
function $n(e) {
  var t = Tn("template");
  return t.innerHTML = Vn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Wn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  var n = (t & Xt) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = $n(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ kt(r));
    var s = (
      /** @type {TemplateNode} */
      n || mt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Wn(s, s), s;
  };
}
function Zn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Jn(e, t) {
  return Qn(e, t);
}
const me = /* @__PURE__ */ new Map();
function Qn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  En();
  var f = void 0, l = An(() => {
    var o = n ?? t.appendChild(Tt());
    cn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        nn({});
        var d = (
          /** @type {ComponentContext} */
          C
        );
        s && (d.c = s), i && (r.$$events = i), f = e(_, r) || {}, rn();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var g = _[d];
        if (!h.has(g)) {
          h.add(g);
          var x = zn(g);
          for (const Oe of [t, document]) {
            var D = me.get(Oe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), me.set(Oe, D));
            var se = D.get(g);
            se === void 0 ? (Oe.addEventListener(g, qe, { passive: x }), D.set(g, 1)) : D.set(g, se + 1);
          }
        }
      }
    };
    return c(jt(Kn)), rt.add(c), () => {
      for (var _ of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            me.get(x)
          ), g = (
            /** @type {number} */
            d.get(_)
          );
          --g == 0 ? (x.removeEventListener(_, qe), d.delete(_), d.size === 0 && me.delete(x)) : d.set(_, g);
        }
      rt.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Xn.set(f, l), f;
}
let Xn = /* @__PURE__ */ new WeakMap();
var er = /* @__PURE__ */ Gn("<div><div> </div> <div> </div></div>");
function tr(e) {
  let t = /* @__PURE__ */ P("none"), n = /* @__PURE__ */ P(0);
  var r = er();
  Hn("keydown", je, (f) => {
    B(t, f.key, !0), mn(n);
  });
  var i = Fe(r), s = Fe(i), a = xn(i, 2), u = Fe(a);
  On(() => {
    nt(s, `Last key: ${I(t) ?? ""}`), nt(u, `Key count: ${I(n) ?? ""}`);
  }), Zn(e, r);
}
function rr(e) {
  return Jn(tr, { target: e });
}
export {
  rr as default,
  rr as rvst_mount
};

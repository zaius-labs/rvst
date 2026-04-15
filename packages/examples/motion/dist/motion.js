var zt = Array.isArray, $t = Array.prototype.indexOf, ae = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Bt = Object.prototype, Ht = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Gt = () => {
};
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, me = 4, Me = 8, ut = 1 << 24, J = 16, Z = 32, ne = 64, Ie = 128, F = 512, y = 1024, k = 2048, Y = 4096, K = 8192, L = 16384, de = 32768, Ze = 1 << 25, Re = 65536, Je = 1 << 17, Zt = 1 << 18, _e = 1 << 19, Jt = 1 << 20, re = 65536, je = 1 << 21, ze = 1 << 22, G = 1 << 23, De = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Qt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Xt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function en() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function rn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const sn = 2, x = Symbol(), ln = "http://www.w3.org/1999/xhtml";
function fn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function at(e) {
  return e === this.v;
}
let j = null;
function oe(e) {
  j = e;
}
function un(e, t = !1, n) {
  j = {
    p: j,
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
    j
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Fn(r);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function ot() {
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
function ct(e) {
  var t = p;
  if (t === null)
    return v.f |= G, e;
  if ((t.f & de) === 0 && (t.f & me) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
      if ((t.f & de) === 0)
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
function $e(e) {
  (e.f & F) !== 0 || e.deps === null ? m(e, y) : m(e, Y);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & re) === 0 || (t.f ^= re, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), ht(e.deps), m(e, y);
}
const B = /* @__PURE__ */ new Set();
let w = null, P = null, Le = null, Ce = !1, fe = null, ke = null;
var Qe = 0;
let hn = 1;
class ie {
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (Qe++ > 1e3 && (B.delete(this), dn()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), m(u, k), this.schedule(u);
      for (const u of this.#n)
        m(u, Y), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = ke = [];
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
    if (fe = null, ke = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        pt(u, f);
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
      var s = i.f, a = (s & (Z | ne)) !== 0, u = a && (s & y) !== 0, f = u || (s & K) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= y : (s & me) !== 0 ? n.push(i) : ye(i) && ((s & J) !== 0 && this.#n.add(i), he(i));
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
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & G) === 0 && (this.current.set(t, [t.v, r]), P?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, P = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#h();
    } finally {
      Qe = 0, Le = null, fe = null, ke = null, Ce = !1, w = null, P = null, W.clear();
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
    this.#d.add(t);
  }
  settled() {
    return (this.#i ??= ft()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ie();
      Ce || (B.add(w), ue(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (me | Me | ut)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (v === null || (v.f & E) === 0))
        return;
      if ((r & (ne | Z)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function dn() {
  try {
    Xt();
  } catch (e) {
    H(e, Le);
  }
}
let $ = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | K)) === 0 && ye(r) && ($ = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), $?.size > 0)) {
        W.clear();
        for (const i of $) {
          if ((i.f & (L | K)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (L | K)) === 0 && he(f);
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
      ) : (s & (ze | J)) !== 0 && (s & k) === 0 && vt(i, t, r) && (m(i, k), Ue(
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
      if ((i.f & E) !== 0 && vt(
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
function Ue(e) {
  w.schedule(e);
}
function pt(e, t) {
  if (!((e.f & Z) !== 0 && (e.f & y) !== 0)) {
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
function _n(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    He() && (N(n), Dn(() => (t === 0 && (r = $n(() => e(() => we(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var vn = Re | _e;
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
  #v = _n(() => (this.#a = Oe(this.#o), () => {
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Pn(() => {
      this.#m();
    }, vn);
  }
  #w() {
    try {
      this.#e = X(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = X(() => {
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
    t && (this.is_pending = !0, this.#t = X(() => t(this.#l)), ue(() => {
      var n = this.#s = document.createDocumentFragment(), r = St();
      n.append(r), this.#e = this.#g(() => X(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, Se(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = X(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Ln(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = X(() => n(this.#l));
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
    var n = p, r = v, i = j;
    z(this.#i), O(this.#i), oe(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return ct(s), null;
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
  #b(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#b(t, n);
      return;
    }
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && Se(this.#t, () => {
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ue(() => {
      this.#c = !1, this.#a && Fe(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#v(), N(
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
    this.#e && (q(this.#e), this.#e = null), this.#t && (q(this.#t), this.#t = null), this.#n && (q(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        fn();
        return;
      }
      i = !0, s && rn(), this.#n !== null && Se(this.#n, () => {
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
          return X(() => {
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
    ue(() => {
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
  ), u = mn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (_) {
      (a.f & L) === 0 && H(_, a);
    }
    Ne();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ yn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Ne();
  }) : h();
}
function mn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = j, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), O(t), oe(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Ne(e = !0) {
  z(null), O(null), oe(null), e && w?.deactivate();
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
function bn(e) {
  var t = E | k, n = v !== null && (v.f & E) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: j,
    deps: null,
    effects: null,
    equals: at,
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
function yn(e, t, n) {
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
    x
  ), a = !v, u = /* @__PURE__ */ new Map();
  return On(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = ft();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ne);
    } catch (_) {
      l.reject(_), Ne();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & de) !== 0)
        var h = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(U), u.delete(o);
      else {
        for (const _ of u.values())
          _.reject(U);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var g = d === U;
        h(g);
      }
      if (!(d === U || (f.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= G, Fe(s, d);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Fe(s, _);
          for (const [b, S] of u) {
            if (u.delete(b), b === o) break;
            S.reject(U);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Nn(() => {
    for (const f of u.values())
      f.reject(U);
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
function En(e) {
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
function xn(e) {
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
function Ve(e) {
  var t, n = p;
  z(xn(e));
  try {
    e.f &= ~re, En(e), t = Pt(e);
  } finally {
    z(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Dt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ce || (P !== null ? (He() || w?.is_fork) && P.set(e, n) : $e(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Gt, t.ac = null, be(t, 0), Ke(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let qe = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let yt = !1;
function Oe(e, t) {
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
function D(e, t) {
  const n = Oe(e);
  return qn(n), n;
}
function C(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!I || (v.f & Je) !== 0) && ot() && (v.f & (E | J | ze | Je)) !== 0 && (M === null || !ae.call(M, e)) && nn();
  let r = n ? ve(t) : t;
  return Fe(e, r, ke);
}
function Fe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), P === null && $e(s);
    }
    e.wv = Dt(), Et(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (Z | ne)) === 0 && (R === null ? Yn([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !yt && kn();
  }
  return t;
}
function kn() {
  yt = !1;
  for (const e of qe)
    (e.f & y) !== 0 && m(e, Y), ye(e) && he(e);
  qe.clear();
}
function we(e) {
  C(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && m(a, t), (u & E) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        P?.delete(l), (u & re) === 0 && (u & F && (a.f |= re), Et(l, Y, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & J) !== 0 && $ !== null && $.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Kt(e);
  if (t !== Bt && t !== Ht)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zt(e), i = /* @__PURE__ */ D(0), s = te, a = (u) => {
    if (te === s)
      return u();
    var f = v, l = te;
    O(null), nt(s);
    var o = u();
    return O(f), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ D(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && en();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ D(l.value);
          return n.set(f, h), h;
        }) : C(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ D(x));
            n.set(f, o), we(i);
          }
        } else
          C(l, x), we(i);
        return !0;
      },
      get(u, f, l) {
        if (f === De)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || ge(u, f)?.writable) && (o = a(() => {
          var _ = ve(h ? u[f] : x), d = /* @__PURE__ */ D(_);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = N(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = N(o));
        } else if (l === void 0) {
          var h = n.get(f), c = h?.v;
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
      has(u, f) {
        if (f === De)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== x || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || ge(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(u[f]) : x, _ = /* @__PURE__ */ D(c);
            return _;
          }), n.set(f, l));
          var h = N(l);
          if (h === x)
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
            d !== void 0 ? C(d, x) : _ in u && (d = a(() => /* @__PURE__ */ D(x)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || ge(u, f)?.writable) && (h = a(() => /* @__PURE__ */ D(void 0)), C(h, ve(l)), n.set(f, h));
        else {
          c = h.v !== x;
          var g = a(() => ve(l));
          C(h, g);
        }
        var b = Reflect.getOwnPropertyDescriptor(u, f);
        if (b?.set && b.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var S = (
              /** @type {Source<number>} */
              n.get("length")
            ), V = Number(f);
            Number.isInteger(V) && V >= S.v && C(S, V + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(u) {
        N(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== x;
        });
        for (var [l, o] of n)
          o.v !== x && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        tn();
      }
    }
  );
}
var et, xt, Tt, kt;
function Sn() {
  if (et === void 0) {
    et = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = ge(t, "firstChild").get, kt = ge(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
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
function Ee(e, t) {
  return /* @__PURE__ */ At(e);
}
function xe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function An(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(ln, e, void 0)
  );
}
function Rt(e) {
  var t = v, n = p;
  O(null), z(null);
  try {
    return e();
  } finally {
    O(t), z(n);
  }
}
function Rn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Q(e, t) {
  var n = p;
  n !== null && (n.f & K) !== 0 && (e |= K);
  var r = {
    ctx: j,
    deps: null,
    nodes: null,
    f: e | k | F,
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
  if ((e & me) !== 0)
    fe !== null ? fe.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & J) !== 0 && (e & Re) !== 0 && i !== null && (i.f |= Re));
  }
  if (i !== null && (i.parent = n, n !== null && Rn(i, n), v !== null && (v.f & E) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function He() {
  return v !== null && !I;
}
function Nn(e) {
  const t = Q(Me, null);
  return m(t, y), t.teardown = e, t;
}
function Fn(e) {
  return Q(me | Jt, e);
}
function Mn(e) {
  ie.ensure();
  const t = Q(ne | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Se(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function On(e) {
  return Q(ze | _e, e);
}
function Dn(e, t = 0) {
  return Q(Me | t, e);
}
function Cn(e, t = [], n = [], r = []) {
  wn(r, t, n, (i) => {
    Q(Me, () => e(...i.map(N)));
  });
}
function Pn(e, t = 0) {
  var n = Q(J | t, e);
  return n;
}
function X(e) {
  return Q(Z | _e, e);
}
function Nt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = v;
    tt(!0), O(null);
    try {
      t.call(null);
    } finally {
      tt(n), O(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function In(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Z) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Zt) !== 0) && e.nodes !== null && e.nodes.end !== null && (jn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ze), Ke(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Nt(e), e.f ^= Ze, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Se(e, t, n = !0) {
  var r = [];
  Mt(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Mt(e, t, n) {
  if ((e.f & K) === 0) {
    e.f ^= K;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Re) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Z) !== 0 && (e.f & J) !== 0;
      Mt(i, t, a ? n : !1), i = s;
    }
  }
}
function Ln(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Ae = !1, ce = !1;
function tt(e) {
  ce = e;
}
let v = null, I = !1;
function O(e) {
  v = e;
}
let p = null;
function z(e) {
  p = e;
}
let M = null;
function qn(e) {
  v !== null && (M === null ? M = [e] : M.push(e));
}
let T = null, A = 0, R = null;
function Yn(e) {
  R = e;
}
let Ot = 1, ee = 0, te = ee;
function nt(e) {
  te = e;
}
function Dt() {
  return ++Ot;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & E && (e.f &= ~re), (t & Y) !== 0) {
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
    (t & F) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && m(e, y);
  }
  return !1;
}
function Ct(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && ae.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? Ct(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, Y), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Pt(e) {
  var t = T, n = A, r = R, i = v, s = M, a = j, u = I, f = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, v = (l & (Z | ne)) === 0 ? e : null, M = null, oe(e.ctx), I = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var d;
      if (_ || be(e, A), c !== null && A > 0)
        for (c.length = A + T.length, d = 0; d < T.length; d++)
          c[A + d] = T[d];
      else
        e.deps = c = T;
      if (He() && (e.f & F) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && A < c.length && (be(e, A), c.length = A);
    if (ot() && R !== null && !I && c !== null && (e.f & (E | Y | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        Ct(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let g = 0; g < n; g += 1)
          i.deps[g].rv = ee;
      if (t !== null)
        for (const g of t)
          g.rv = ee;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & G) !== 0 && (e.f ^= G), h;
  } catch (g) {
    return ct(g);
  } finally {
    e.f ^= je, T = t, A = n, R = r, v = i, M = s, oe(a), I = u, te = f;
  }
}
function zn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = $t.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & F) !== 0 && (s.f ^= F, s.f &= ~re), $e(s), Tn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      zn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = p, r = Ae;
    p = e, Ae = !0;
    try {
      (t & (J | ut)) !== 0 ? In(e) : Ke(e), Nt(e);
      var i = Pt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ot;
      var s;
    } finally {
      Ae = r, p = n;
    }
  }
}
function N(e) {
  var t = e.f, n = (t & E) !== 0;
  if (v !== null && !I) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (M === null || !ae.call(M, e))) {
      var i = v.deps;
      if ((v.f & je) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ae.call(s, v) || s.push(v);
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
      var u = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || jt(a)) && (u = Ve(a)), W.set(a, u), u;
    }
    var f = (a.f & F) === 0 && !I && v !== null && (Ae || (v.f & F) !== 0), l = (a.f & de) === 0;
    ye(a) && (f && (a.f |= F), mt(a)), f && !l && (bt(a), It(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function It(e) {
  if (e.f |= F, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & F) === 0 && (bt(
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
    if (W.has(t) || (t.f & E) !== 0 && jt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function $n(e) {
  var t = I;
  try {
    return I = !0, e();
  } finally {
    I = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Pe(e, t) {
  Un("op_set_text", e, t);
}
const Vn = ["touchstart", "touchmove"];
function Bn(e) {
  return Vn.includes(e);
}
const pe = Symbol("events"), Lt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function it(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Hn(e) {
  for (var t = 0; t < e.length; t++)
    Lt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let st = null;
function lt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  st = e;
  var a = 0, u = st === e && e[pe];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
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
    var o = v, h = p;
    O(null), z(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (b) {
          c ? _.push(b) : c = b;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let b of _)
          queueMicrotask(() => {
            throw b;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, O(o), z(h);
    }
  }
}
const Kn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Gn(e) {
  return (
    /** @type {string} */
    Kn?.createHTML(e) ?? e
  );
}
function Wn(e) {
  var t = An("template");
  return t.innerHTML = Gn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Zn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Jn(e, t) {
  var n = (t & sn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Wn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Zn(s, s), s;
  };
}
function Qn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Xn(e, t) {
  return er(e, t);
}
const Te = /* @__PURE__ */ new Map();
function er(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  Sn();
  var f = void 0, l = Mn(() => {
    var o = n ?? t.appendChild(St());
    pn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        un({});
        var d = (
          /** @type {ComponentContext} */
          j
        );
        s && (d.c = s), i && (r.$$events = i), f = e(_, r) || {}, an();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var g = _[d];
        if (!h.has(g)) {
          h.add(g);
          var b = Bn(g);
          for (const se of [t, document]) {
            var S = Te.get(se);
            S === void 0 && (S = /* @__PURE__ */ new Map(), Te.set(se, S));
            var V = S.get(g);
            V === void 0 ? (se.addEventListener(g, lt, { passive: b }), S.set(g, 1)) : S.set(g, V + 1);
          }
        }
      }
    };
    return c(Ut(Lt)), Ye.add(c), () => {
      for (var _ of h)
        for (const b of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Te.get(b)
          ), g = (
            /** @type {number} */
            d.get(_)
          );
          --g == 0 ? (b.removeEventListener(_, lt), d.delete(_), d.size === 0 && Te.delete(b)) : d.set(_, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return tr.set(f, l), f;
}
let tr = /* @__PURE__ */ new WeakMap();
var nr = /* @__PURE__ */ Jn("<div><button>To 100</button> <button>Reset</button> <div> </div> <div> </div> <div> </div></div>");
function rr(e) {
  let t = /* @__PURE__ */ D(0), n = /* @__PURE__ */ D(!1), r = /* @__PURE__ */ D(0);
  function i(d) {
    const g = N(t), b = d - g, S = performance.now(), V = 200;
    C(n, !0);
    function se(qt) {
      const Yt = qt - S, Ge = Math.min(Yt / V, 1);
      C(t, Math.round((g + b * Ge) * 100), !0), C(r, N(r) + 1), Ge < 1 ? requestAnimationFrame(se) : C(n, !1);
    }
    requestAnimationFrame(se);
  }
  var s = nr(), a = Ee(s), u = xe(a, 2), f = xe(u, 2), l = Ee(f), o = xe(f, 2), h = Ee(o), c = xe(o, 2), _ = Ee(c);
  Cn(() => {
    Pe(l, `Progress: ${N(t) ?? ""}`), Pe(h, `Frames: ${N(r) ?? ""}`), Pe(_, `Animating: ${N(n) ?? ""}`);
  }), it("click", a, () => i(1)), it("click", u, () => i(0)), Qn(e, s);
}
Hn(["click"]);
function sr(e) {
  return Xn(rr, { target: e });
}
export {
  sr as default,
  sr as rvst_mount
};

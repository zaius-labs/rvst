var Tt = Array.isArray, cn = Array.prototype.indexOf, me = Array.prototype.includes, Ye = Array.from, vn = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, hn = Object.prototype, dn = Array.prototype, _n = Object.getPrototypeOf, at = Object.isExtensible;
const Me = () => {
};
function pn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function kt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, De = 4, $e = 8, St = 1 << 24, le = 16, $ = 32, ce = 64, We = 128, F = 512, x = 1024, S = 2048, U = 4096, R = 8192, z = 16384, Te = 32768, ct = 1 << 25, Oe = 65536, vt = 1 << 17, gn = 1 << 18, ke = 1 << 19, wn = 1 << 20, X = 1 << 25, ve = 65536, Xe = 1 << 21, et = 1 << 22, ne = 1 << 23, Be = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function mn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function bn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function yn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function En() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Tn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function kn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Sn = 1, An = 2, Nn = 16, Rn = 2, k = Symbol(), Cn = "http://www.w3.org/1999/xhtml";
function Fn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function At(e) {
  return e === this.v;
}
function Mn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Nt(e) {
  return !Mn(e, this.v);
}
let j = null;
function be(e) {
  j = e;
}
function Dn(e, t = !1, n) {
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
function On(e) {
  var t = (
    /** @type {ComponentContext} */
    j
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      ir(r);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function Rt() {
  return !0;
}
let de = [];
function In() {
  var e = de;
  de = [], pn(e);
}
function ge(e) {
  if (de.length === 0) {
    var t = de;
    queueMicrotask(() => {
      t === de && In();
    });
  }
  de.push(e);
}
function Ct(e) {
  var t = g;
  if (t === null)
    return p.f |= ne, e;
  if ((t.f & Te) === 0 && (t.f & De) === 0)
    throw e;
  te(e, t);
}
function te(e, t) {
  for (; t !== null; ) {
    if ((t.f & We) !== 0) {
      if ((t.f & Te) === 0)
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
const Pn = -7169;
function E(e, t) {
  e.f = e.f & Pn | t;
}
function tt(e) {
  (e.f & F) !== 0 || e.deps === null ? E(e, x) : E(e, U);
}
function Ft(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & ve) === 0 || (t.f ^= ve, Ft(
        /** @type {Derived} */
        t.deps
      ));
}
function Mt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), Ft(e.deps), E(e, x);
}
const J = /* @__PURE__ */ new Set();
let m = null, P = null, Ze = null, Ke = !1, _e = null, Le = null;
var ht = 0;
let qn = 1;
class ie {
  id = qn++;
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
  #h = /* @__PURE__ */ new Set();
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
  #d() {
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
        E(r, S), this.schedule(r);
      for (r of n.m)
        E(r, U), this.schedule(r);
    }
  }
  #v() {
    if (ht++ > 1e3 && (J.delete(this), zn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), E(f, S), this.schedule(f);
      for (const f of this.#n)
        E(f, U), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = _e = [], r = [], i = Le = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw Pt(f), u;
      }
    if (m = null, i.length > 0) {
      var l = ie.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (_e = null, Le = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#l)
        It(f, u);
    } else {
      this.#r.size === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), dt(r), dt(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    o !== null && (J.add(o), o.#v()), J.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & ($ | ce)) !== 0, f = o && (l & x) !== 0, u = f || (l & R) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= x : (l & De) !== 0 ? n.push(i) : Pe(i) && ((l & le) !== 0 && this.#n.add(i), xe(i));
        var s = i.first;
        if (s !== null) {
          i = s;
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
      Mt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ne) === 0 && (this.current.set(t, [t.v, r]), P?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, P = null;
  }
  flush() {
    try {
      Ke = !0, m = this, this.#v();
    } finally {
      ht = 0, Ze = null, _e = null, Le = null, Ke = !1, m = null, P = null, re.clear();
    }
  }
  discard() {
    for (const t of this.#h) t(this);
    this.#h.clear(), J.delete(this);
  }
  #w() {
    for (const s of J) {
      var t = s.id < this.id, n = [];
      for (const [c, [h, v]] of this.current) {
        if (s.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(c)[0]
          );
          if (t && h !== r)
            s.current.set(c, [h, v]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...s.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of n)
          Dt(f, i, l, o);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#o(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of J)
      s.#u.has(this) && (s.#u.delete(this), s.#u.size === 0 && !s.#c() && (s.activate(), s.#v()));
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
    this.#a || r || (this.#a = !0, ge(() => {
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
    this.#h.add(t);
  }
  settled() {
    return (this.#i ??= kt()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new ie();
      Ke || (J.add(m), ge(() => {
        m === t && t.flush();
      }));
    }
    return m;
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
    if (Ze = t, t.b?.is_pending && (t.f & (De | $e | St)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ce | $)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function zn() {
  try {
    yn();
  } catch (e) {
    te(e, Ze);
  }
}
let G = null;
function dt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | R)) === 0 && Pe(r) && (G = /* @__PURE__ */ new Set(), xe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Xt(r), G?.size > 0)) {
        re.clear();
        for (const i of G) {
          if ((i.f & (z | R)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (z | R)) === 0 && xe(u);
          }
        }
        G.clear();
      }
    }
    G = null;
  }
}
function Dt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Dt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (et | le)) !== 0 && (l & S) === 0 && Ot(i, t, r) && (E(i, S), nt(
        /** @type {Effect} */
        i
      ));
    }
}
function Ot(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (me.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ot(
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
function nt(e) {
  m.schedule(e);
}
function It(e, t) {
  if (!((e.f & $) !== 0 && (e.f & x) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      It(n, t), n = n.next;
  }
}
function Pt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Pt(t), t = t.next;
}
function Ln(e) {
  let t = 0, n = he(0), r;
  return () => {
    it() && (Y(n), fr(() => (t === 0 && (r = hr(() => e(() => Ce(n)))), t += 1, () => {
      ge(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ce(n));
      });
    })));
  };
}
var jn = Oe | ke;
function Hn(e, t, n, r) {
  new Vn(e, t, n, r);
}
class Vn {
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
  #h = null;
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
  #_ = Ln(() => (this.#o = he(this.#a), () => {
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
        g
      );
      o.b = this, o.f |= We, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Gt(() => {
      this.#m();
    }, jn);
  }
  #w() {
    try {
      this.#e = V(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = V(() => {
      n(
        this.#s,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = V(() => t(this.#s)), ge(() => {
      var n = this.#l = document.createDocumentFragment(), r = Fe();
      n.append(r), this.#e = this.#g(() => V(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, we(
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
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = V(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        en(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = V(() => n(this.#s));
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Mt(t, this.#d, this.#v);
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
    var n = g, r = p, i = j;
    B(this.#i), D(this.#i), be(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (l) {
      return Ct(l), null;
    } finally {
      B(n), D(r), be(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && we(this.#t, () => {
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
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, ge(() => {
      this.#c = !1, this.#o && ye(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), Y(
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
    this.#e && (L(this.#e), this.#e = null), this.#t && (L(this.#t), this.#t = null), this.#n && (L(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Fn();
        return;
      }
      i = !0, l && kn(), this.#n !== null && we(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (s) {
        te(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return V(() => {
            var s = (
              /** @type {Effect} */
              g
            );
            s.b = this, s.f |= We, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (s) {
          return te(
            s,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ge(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (s) {
        te(s, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (s) => te(s, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function Yn(e, t, n, r) {
  const i = zt;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = $n(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function s(v) {
    f();
    try {
      r(v);
    } catch (d) {
      (o.f & z) === 0 && te(d, o);
    }
    He();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var c = qt();
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ Un(v))).then((v) => s([...t.map(i), ...v])).catch((v) => te(v, o)).finally(() => c());
  }
  u ? u.then(() => {
    f(), h(), He();
  }) : h();
}
function $n() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = j, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    B(e), D(t), be(n), l && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function He(e = !0) {
  B(null), D(null), be(null), e && m?.deactivate();
}
function qt() {
  var e = (
    /** @type {Effect} */
    g
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
function zt(e) {
  var t = T | S, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= ke), {
    ctx: j,
    deps: null,
    effects: null,
    equals: At,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      k
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Un(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && mn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = he(
    /** @type {V} */
    k
  ), o = !p, f = /* @__PURE__ */ new Map();
  return sr(() => {
    var u = (
      /** @type {Effect} */
      g
    ), s = kt();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(He);
    } catch (d) {
      s.reject(d), He();
    }
    var c = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((u.f & Te) !== 0)
        var h = qt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(W), f.delete(c);
      else {
        for (const d of f.values())
          d.reject(W);
        f.clear();
      }
      f.set(c, s);
    }
    const v = (d, a = void 0) => {
      if (h) {
        var _ = a === W;
        h(_);
      }
      if (!(a === W || (u.f & z) !== 0)) {
        if (c.activate(), a)
          l.f |= ne, ye(l, a);
        else {
          (l.f & ne) !== 0 && (l.f ^= ne), ye(l, d);
          for (const [y, b] of f) {
            if (f.delete(y), y === c) break;
            b.reject(W);
          }
        }
        c.deactivate();
      }
    };
    s.promise.then(v, (d) => v(null, d || "unknown"));
  }), rr(() => {
    for (const u of f.values())
      u.reject(W);
  }), new Promise((u) => {
    function s(c) {
      function h() {
        c === i ? u(l) : s(i);
      }
      c.then(h, h);
    }
    s(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Bn(e) {
  const t = /* @__PURE__ */ zt(e);
  return t.equals = Nt, t;
}
function Kn(e) {
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
function Gn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function rt(e) {
  var t, n = g;
  B(Gn(e));
  try {
    e.f &= ~ve, Kn(e), t = ln(e);
  } finally {
    B(n);
  }
  return t;
}
function Lt(e) {
  var t = e.v, n = rt(e);
  if (!e.equals(n) && (e.wv = nn(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  Ee || (P !== null ? (it() || m?.is_fork) && P.set(e, n) : tt(e));
}
function Wn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = Me, t.ac = null, Ie(t, 0), st(t));
}
function jt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && xe(t);
}
let Je = /* @__PURE__ */ new Set();
const re = /* @__PURE__ */ new Map();
let Ht = !1;
function he(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: At,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Q(e, t) {
  const n = he(e);
  return ar(n), n;
}
// @__NO_SIDE_EFFECTS__
function Xn(e, t = !1, n = !0) {
  const r = he(e);
  return t || (r.equals = Nt), r;
}
function ue(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!q || (p.f & vt) !== 0) && Rt() && (p.f & (T | le | et | vt)) !== 0 && (M === null || !me.call(M, e)) && Tn();
  let r = n ? pe(t) : t;
  return ye(e, r, Le);
}
function ye(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ee ? re.set(e, t) : re.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && rt(l), P === null && tt(l);
    }
    e.wv = nn(), Vt(e, S, n), g !== null && (g.f & x) !== 0 && (g.f & ($ | ce)) === 0 && (C === null ? cr([e]) : C.push(e)), !i.is_fork && Je.size > 0 && !Ht && Zn();
  }
  return t;
}
function Zn() {
  Ht = !1;
  for (const e of Je)
    (e.f & x) !== 0 && E(e, U), Pe(e) && xe(e);
  Je.clear();
}
function Ce(e) {
  ue(e, e.v + 1);
}
function Vt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, u = (f & S) === 0;
      if (u && E(o, t), (f & T) !== 0) {
        var s = (
          /** @type {Derived} */
          o
        );
        P?.delete(s), (f & ve) === 0 && (f & F && (o.f |= ve), Vt(s, U, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & le) !== 0 && G !== null && G.add(c), n !== null ? n.push(c) : nt(c);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Be in e)
    return e;
  const t = _n(e);
  if (t !== hn && t !== dn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Tt(e), i = /* @__PURE__ */ Q(0), l = ae, o = (f) => {
    if (ae === l)
      return f();
    var u = p, s = ae;
    D(null), gt(l);
    var c = f();
    return D(u), gt(s), c;
  };
  return r && n.set("length", /* @__PURE__ */ Q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && En();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var h = /* @__PURE__ */ Q(s.value);
          return n.set(u, h), h;
        }) : ue(c, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const c = o(() => /* @__PURE__ */ Q(k));
            n.set(u, c), Ce(i);
          }
        } else
          ue(s, k), Ce(i);
        return !0;
      },
      get(f, u, s) {
        if (u === Be)
          return e;
        var c = n.get(u), h = u in f;
        if (c === void 0 && (!h || Re(f, u)?.writable) && (c = o(() => {
          var d = pe(h ? f[u] : k), a = /* @__PURE__ */ Q(d);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var v = Y(c);
          return v === k ? void 0 : v;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var c = n.get(u);
          c && (s.value = Y(c));
        } else if (s === void 0) {
          var h = n.get(u), v = h?.v;
          if (h !== void 0 && v !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return s;
      },
      has(f, u) {
        if (u === Be)
          return !0;
        var s = n.get(u), c = s !== void 0 && s.v !== k || Reflect.has(f, u);
        if (s !== void 0 || g !== null && (!c || Re(f, u)?.writable)) {
          s === void 0 && (s = o(() => {
            var v = c ? pe(f[u]) : k, d = /* @__PURE__ */ Q(v);
            return d;
          }), n.set(u, s));
          var h = Y(s);
          if (h === k)
            return !1;
        }
        return c;
      },
      set(f, u, s, c) {
        var h = n.get(u), v = u in f;
        if (r && u === "length")
          for (var d = s; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? ue(a, k) : d in f && (a = o(() => /* @__PURE__ */ Q(k)), n.set(d + "", a));
          }
        if (h === void 0)
          (!v || Re(f, u)?.writable) && (h = o(() => /* @__PURE__ */ Q(void 0)), ue(h, pe(s)), n.set(u, h));
        else {
          v = h.v !== k;
          var _ = o(() => pe(s));
          ue(h, _);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(c, s), !v) {
          if (r && typeof u == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), w = Number(u);
            Number.isInteger(w) && w >= b.v && ue(b, w + 1);
          }
          Ce(i);
        }
        return !0;
      },
      ownKeys(f) {
        Y(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var v = n.get(h);
          return v === void 0 || v.v !== k;
        });
        for (var [s, c] of n)
          c.v !== k && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        xn();
      }
    }
  );
}
var _t, Yt, $t, Ut;
function Jn() {
  if (_t === void 0) {
    _t = window, Yt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    $t = Re(t, "firstChild").get, Ut = Re(t, "nextSibling").get, at(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), at(n) && (n.__t = void 0);
  }
}
function Fe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
  return (
    /** @type {TemplateNode | null} */
    $t.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    Ut.call(e)
  );
}
function Ve(e, t) {
  return /* @__PURE__ */ Bt(e);
}
function Ge(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
  return r;
}
function Qn(e) {
  e.textContent = "";
}
function er() {
  return !1;
}
function tr(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Cn, e, void 0)
  );
}
function Kt(e) {
  var t = p, n = g;
  D(null), B(null);
  try {
    return e();
  } finally {
    D(t), B(n);
  }
}
function nr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function se(e, t) {
  var n = g;
  n !== null && (n.f & R) !== 0 && (e |= R);
  var r = {
    ctx: j,
    deps: null,
    nodes: null,
    f: e | S | F,
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
  if ((e & De) !== 0)
    _e !== null ? _e.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      xe(r);
    } catch (o) {
      throw L(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ke) === 0 && (i = i.first, (e & le) !== 0 && (e & Oe) !== 0 && i !== null && (i.f |= Oe));
  }
  if (i !== null && (i.parent = n, n !== null && nr(i, n), p !== null && (p.f & T) !== 0 && (e & ce) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function it() {
  return p !== null && !q;
}
function rr(e) {
  const t = se($e, null);
  return E(t, x), t.teardown = e, t;
}
function ir(e) {
  return se(De | wn, e);
}
function lr(e) {
  ie.ensure();
  const t = se(ce | ke, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function sr(e) {
  return se(et | ke, e);
}
function fr(e, t = 0) {
  return se($e | t, e);
}
function lt(e, t = [], n = [], r = []) {
  Yn(r, t, n, (i) => {
    se($e, () => e(...i.map(Y)));
  });
}
function Gt(e, t = 0) {
  var n = se(le | t, e);
  return n;
}
function V(e) {
  return se($ | ke, e);
}
function Wt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ee, r = p;
    pt(!0), D(null);
    try {
      t.call(null);
    } finally {
      pt(n), D(r);
    }
  }
}
function st(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Kt(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & ce) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function ur(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & $) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & gn) !== 0) && e.nodes !== null && e.nodes.end !== null && (or(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, ct), st(e, t && !n), Ie(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Wt(e), e.f ^= ct, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Xt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function or(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function Xt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
  var r = [];
  Zt(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Zt(e, t, n) {
  if ((e.f & R) === 0) {
    e.f ^= R;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Oe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & $) !== 0 && (e.f & le) !== 0;
      Zt(i, t, o ? n : !1), i = l;
    }
  }
}
function Jt(e) {
  Qt(e, !0);
}
function Qt(e, t) {
  if ((e.f & R) !== 0) {
    e.f ^= R, (e.f & x) === 0 && (E(e, S), ie.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Oe) !== 0 || (n.f & $) !== 0;
      Qt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function en(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let je = !1, Ee = !1;
function pt(e) {
  Ee = e;
}
let p = null, q = !1;
function D(e) {
  p = e;
}
let g = null;
function B(e) {
  g = e;
}
let M = null;
function ar(e) {
  p !== null && (M === null ? M = [e] : M.push(e));
}
let A = null, N = 0, C = null;
function cr(e) {
  C = e;
}
let tn = 1, oe = 0, ae = oe;
function gt(e) {
  ae = e;
}
function nn() {
  return ++tn;
}
function Pe(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & T && (e.f &= ~ve), (t & U) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Pe(
        /** @type {Derived} */
        l
      ) && Lt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & F) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && E(e, x);
  }
  return !1;
}
function rn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && me.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? rn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, S) : (l.f & x) !== 0 && E(l, U), nt(
        /** @type {Effect} */
        l
      ));
    }
}
function ln(e) {
  var t = A, n = N, r = C, i = p, l = M, o = j, f = q, u = ae, s = e.f;
  A = /** @type {null | Value[]} */
  null, N = 0, C = null, p = (s & ($ | ce)) === 0 ? e : null, M = null, be(e.ctx), q = !1, ae = ++oe, e.ac !== null && (Kt(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Xe;
    var c = (
      /** @type {Function} */
      e.fn
    ), h = c();
    e.f |= Te;
    var v = e.deps, d = m?.is_fork;
    if (A !== null) {
      var a;
      if (d || Ie(e, N), v !== null && N > 0)
        for (v.length = N + A.length, a = 0; a < A.length; a++)
          v[N + a] = A[a];
      else
        e.deps = v = A;
      if (it() && (e.f & F) !== 0)
        for (a = N; a < v.length; a++)
          (v[a].reactions ??= []).push(e);
    } else !d && v !== null && N < v.length && (Ie(e, N), v.length = N);
    if (Rt() && C !== null && !q && v !== null && (e.f & (T | U | S)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      C.length; a++)
        rn(
          C[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (oe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = oe;
      if (t !== null)
        for (const _ of t)
          _.rv = oe;
      C !== null && (r === null ? r = C : r.push(.../** @type {Source[]} */
      C));
    }
    return (e.f & ne) !== 0 && (e.f ^= ne), h;
  } catch (_) {
    return Ct(_);
  } finally {
    e.f ^= Xe, A = t, N = n, C = r, p = i, M = l, be(o), q = f, ae = u;
  }
}
function vr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = cn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !me.call(A, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & F) !== 0 && (l.f ^= F, l.f &= ~ve), tt(l), Wn(l), Ie(l, 0);
  }
}
function Ie(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      vr(e, n[r]);
}
function xe(e) {
  var t = e.f;
  if ((t & z) === 0) {
    E(e, x);
    var n = g, r = je;
    g = e, je = !0;
    try {
      (t & (le | St)) !== 0 ? ur(e) : st(e), Wt(e);
      var i = ln(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = tn;
      var l;
    } finally {
      je = r, g = n;
    }
  }
}
function Y(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !q) {
    var r = g !== null && (g.f & z) !== 0;
    if (!r && (M === null || !me.call(M, e))) {
      var i = p.deps;
      if ((p.f & Xe) !== 0)
        e.rv < oe && (e.rv = oe, A === null && i !== null && i[N] === e ? N++ : A === null ? A = [e] : A.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : me.call(l, p) || l.push(p);
      }
    }
  }
  if (Ee && re.has(e))
    return re.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Ee) {
      var f = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || fn(o)) && (f = rt(o)), re.set(o, f), f;
    }
    var u = (o.f & F) === 0 && !q && p !== null && (je || (p.f & F) !== 0), s = (o.f & Te) === 0;
    Pe(o) && (u && (o.f |= F), Lt(o)), u && !s && (jt(o), sn(o));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & ne) !== 0)
    throw e.v;
  return e.v;
}
function sn(e) {
  if (e.f |= F, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & F) === 0 && (jt(
        /** @type {Derived} */
        t
      ), sn(
        /** @type {Derived} */
        t
      ));
}
function fn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (re.has(t) || (t.f & T) !== 0 && fn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function hr(e) {
  var t = q;
  try {
    return q = !0, e();
  } finally {
    q = t;
  }
}
const wt = globalThis.Deno?.core?.ops ?? null;
function dr(e, ...t) {
  wt?.[e] ? wt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function ft(e, t) {
  dr("op_set_text", e, t);
}
const _r = ["touchstart", "touchmove"];
function pr(e) {
  return _r.includes(e);
}
const qe = Symbol("events"), gr = /* @__PURE__ */ new Set(), mt = /* @__PURE__ */ new Set();
let bt = null;
function yt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  bt = e;
  var o = 0, f = bt === e && e[qe];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[qe] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    vn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, h = g;
    D(null), B(null);
    try {
      for (var v, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[qe]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (y) {
          v ? d.push(y) : v = y;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (v) {
        for (let y of d)
          queueMicrotask(() => {
            throw y;
          });
        throw v;
      }
    } finally {
      e[qe] = t, delete e.currentTarget, D(c), B(h);
    }
  }
}
const wr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function mr(e) {
  return (
    /** @type {string} */
    wr?.createHTML(e) ?? e
  );
}
function br(e) {
  var t = tr("template");
  return t.innerHTML = mr(e.replaceAll("<!>", "<!---->")), t.content;
}
function yr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ut(e, t) {
  var n = (t & Rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = br(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Bt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Yt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return yr(l, l), l;
  };
}
function ot(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Er(e, t) {
  return xr(e, t);
}
const ze = /* @__PURE__ */ new Map();
function xr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  Jn();
  var u = void 0, s = lr(() => {
    var c = n ?? t.appendChild(Fe());
    Hn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Dn({});
        var a = (
          /** @type {ComponentContext} */
          j
        );
        l && (a.c = l), i && (r.$$events = i), u = e(d, r) || {}, On();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), v = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!h.has(_)) {
          h.add(_);
          var y = pr(_);
          for (const O of [t, document]) {
            var b = ze.get(O);
            b === void 0 && (b = /* @__PURE__ */ new Map(), ze.set(O, b));
            var w = b.get(_);
            w === void 0 ? (O.addEventListener(_, yt, { passive: y }), b.set(_, 1)) : b.set(_, w + 1);
          }
        }
      }
    };
    return v(Ye(gr)), mt.add(v), () => {
      for (var d of h)
        for (const y of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            ze.get(y)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (y.removeEventListener(d, yt), a.delete(d), a.size === 0 && ze.delete(y)) : a.set(d, _);
        }
      mt.delete(v), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Tr.set(u, s), u;
}
let Tr = /* @__PURE__ */ new WeakMap();
function kr(e, t) {
  return t;
}
function Sr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, f = 0; f < i; f++) {
    let h = t[f];
    we(
      h,
      () => {
        if (l) {
          if (l.pending.delete(h), l.done.add(h), l.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Qe(e, Ye(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
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
      var s = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        s.parentNode
      );
      Qn(c), c.append(s), e.items.clear();
    }
    Qe(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Qe(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const f of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= X;
      const o = document.createDocumentFragment();
      en(l, o);
    } else
      L(t[i], n);
  }
}
var Et;
function Ar(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map();
  {
    var u = (
      /** @type {Element} */
      e
    );
    o = u.appendChild(Fe());
  }
  var s = null, c = /* @__PURE__ */ Bn(() => {
    var w = n();
    return Tt(w) ? w : w == null ? [] : Ye(w);
  }), h, v = /* @__PURE__ */ new Map(), d = !0;
  function a(w) {
    (b.effect.f & z) === 0 && (b.pending.delete(w), b.fallback = s, Nr(b, h, o, t, r), s !== null && (h.length === 0 ? (s.f & X) === 0 ? Jt(s) : (s.f ^= X, Ne(s, null, o)) : we(s, () => {
      s = null;
    })));
  }
  function _(w) {
    b.pending.delete(w);
  }
  var y = Gt(() => {
    h = /** @type {V[]} */
    Y(c);
    for (var w = h.length, O = /* @__PURE__ */ new Set(), H = (
      /** @type {Batch} */
      m
    ), fe = er(), Z = 0; Z < w; Z += 1) {
      var Se = h[Z], I = r(Se, Z), K = d ? null : f.get(I);
      K ? (K.v && ye(K.v, Se), K.i && ye(K.i, Z), fe && H.unskip_effect(K.e)) : (K = Rr(
        f,
        d ? o : Et ??= Fe(),
        Se,
        I,
        Z,
        i,
        t,
        n
      ), d || (K.e.f |= X), f.set(I, K)), O.add(I);
    }
    if (w === 0 && l && !s && (d ? s = V(() => l(o)) : (s = V(() => l(Et ??= Fe())), s.f |= X)), w > O.size && bn(), !d)
      if (v.set(H, O), fe) {
        for (const [on, an] of f)
          O.has(on) || H.skip_effect(an.e);
        H.oncommit(a), H.ondiscard(_);
      } else
        a(H);
    Y(c);
  }), b = { effect: y, items: f, pending: v, outrogroups: null, fallback: s };
  d = !1;
}
function Ae(e) {
  for (; e !== null && (e.f & $) === 0; )
    e = e.next;
  return e;
}
function Nr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = Ae(e.effect.first), u, s = null, c = [], h = [], v, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], d = i(v, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const I of e.outrogroups)
        I.pending.delete(a), I.done.delete(a);
    if ((a.f & R) !== 0 && Jt(a), (a.f & X) !== 0)
      if (a.f ^= X, a === f)
        Ne(a, null, n);
      else {
        var y = s ? s.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), ee(e, s, a), ee(e, a, y), Ne(a, y, n), s = a, c = [], h = [], f = Ae(s.next);
        continue;
      }
    if (a !== f) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < h.length) {
          var b = h[0], w;
          s = b.prev;
          var O = c[0], H = c[c.length - 1];
          for (w = 0; w < c.length; w += 1)
            Ne(c[w], b, n);
          for (w = 0; w < h.length; w += 1)
            u.delete(h[w]);
          ee(e, O.prev, H.next), ee(e, s, O), ee(e, H, b), f = b, s = H, _ -= 1, c = [], h = [];
        } else
          u.delete(a), Ne(a, f, n), ee(e, a.prev, a.next), ee(e, a, s === null ? e.effect.first : s.next), ee(e, s, a), s = a;
        continue;
      }
      for (c = [], h = []; f !== null && f !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(f), h.push(f), f = Ae(f.next);
      if (f === null)
        continue;
    }
    (a.f & X) === 0 && c.push(a), s = a, f = Ae(a.next);
  }
  if (e.outrogroups !== null) {
    for (const I of e.outrogroups)
      I.pending.size === 0 && (Qe(e, Ye(I.done)), e.outrogroups?.delete(I));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || u !== void 0) {
    var fe = [];
    if (u !== void 0)
      for (a of u)
        (a.f & R) === 0 && fe.push(a);
    for (; f !== null; )
      (f.f & R) === 0 && f !== e.fallback && fe.push(f), f = Ae(f.next);
    var Z = fe.length;
    if (Z > 0) {
      var Se = l === 0 ? n : null;
      Sr(e, fe, Se);
    }
  }
}
function Rr(e, t, n, r, i, l, o, f) {
  var u = (o & Sn) !== 0 ? (o & Nn) === 0 ? /* @__PURE__ */ Xn(n, !1, !1) : he(n) : null, s = (o & An) !== 0 ? he(i) : null;
  return {
    v: u,
    i: s,
    e: V(() => (l(t, u ?? n, s ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Ne(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & X) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ue(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function ee(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function un(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = un(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Cr() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = un(e)) && (r && (r += " "), r += t);
  return r;
}
function Fr(e) {
  return typeof e == "object" ? Cr(e) : e ?? "";
}
function Mr(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r === "" ? null : r;
}
function Dr(e, t, n, r, i, l) {
  var o = e.__className;
  if (o !== n || o === void 0) {
    var f = Mr(n);
    f == null ? e.removeAttribute("class") : e.className = f, e.__className = n;
  }
  return l;
}
const xt = (e, t = Me, n = Me) => {
  var r = Ir(), i = Ve(r);
  lt(() => {
    Dr(r, 1, Fr(n())), ft(i, t());
  }), ot(e, r);
}, Or = (e, t = Me, n = Me) => {
  var r = Pr(), i = Ve(r);
  lt(() => ft(i, `${n() + 1}. ${t() ?? ""}`)), ot(e, r);
};
var Ir = /* @__PURE__ */ ut("<div> </div>"), Pr = /* @__PURE__ */ ut("<div> </div>"), qr = /* @__PURE__ */ ut("<div><!> <!> <div></div> <div> </div></div>");
function zr(e) {
  let t = pe(["apple", "banana", "cherry"]);
  var n = qr(), r = Ve(n);
  xt(r, () => "New", () => "green");
  var i = Ge(r, 2);
  xt(i, () => "Sale", () => "red");
  var l = Ge(i, 2);
  Ar(l, 21, () => t, kr, (u, s, c) => {
    Or(u, () => Y(s), () => c);
  });
  var o = Ge(l, 2), f = Ve(o);
  lt(() => ft(f, `Total: ${t.length ?? ""}`)), ot(e, n);
}
function jr(e) {
  return Er(zr, { target: e });
}
export {
  jr as default,
  jr as rvst_mount
};

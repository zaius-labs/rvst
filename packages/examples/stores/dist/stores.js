var Ht = Array.isArray, Kt = Array.prototype.indexOf, he = Array.prototype.includes, Gt = Array.from, Wt = Object.defineProperty, be = Object.getOwnPropertyDescriptor, Zt = Object.prototype, Jt = Array.prototype, Qt = Object.getPrototypeOf, We = Object.isExtensible;
const ee = () => {
};
function ut(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ot() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, ye = 4, De = 8, at = 1 << 24, Z = 16, U = 32, ne = 64, je = 128, N = 512, m = 1024, k = 2048, L = 4096, K = 8192, I = 16384, le = 32768, Ze = 1 << 25, Ae = 65536, Je = 1 << 17, Xt = 1 << 18, ve = 1 << 19, en = 1 << 20, re = 65536, Le = 1 << 21, $e = 1 << 22, G = 1 << 23, Ce = Symbol("$state"), Y = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function tn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function nn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function rn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function sn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ln() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function un() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function on() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function an() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const cn = 2, x = Symbol(), hn = "http://www.w3.org/1999/xhtml";
function dn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ct(e) {
  return e === this.v;
}
function _n(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
let O = null;
function de(e) {
  O = e;
}
function ht(e, t = !1, n) {
  O = {
    p: O,
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
function dt(e) {
  var t = (
    /** @type {ComponentContext} */
    O
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mt(r);
  }
  return t.i = !0, O = t.p, /** @type {T} */
  {};
}
function _t() {
  return !0;
}
let oe = [];
function vn() {
  var e = oe;
  oe = [], ut(e);
}
function ce(e) {
  if (oe.length === 0) {
    var t = oe;
    queueMicrotask(() => {
      t === oe && vn();
    });
  }
  oe.push(e);
}
function vt(e) {
  var t = g;
  if (t === null)
    return v.f |= G, e;
  if ((t.f & le) === 0 && (t.f & ye) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0) {
      if ((t.f & le) === 0)
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
const pn = -7169;
function y(e, t) {
  e.f = e.f & pn | t;
}
function Be(e) {
  (e.f & N) !== 0 || e.deps === null ? y(e, m) : y(e, L);
}
function pt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & re) === 0 || (t.f ^= re, pt(
        /** @type {Derived} */
        t.deps
      ));
}
function gt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), pt(e.deps), y(e, m);
}
function gn(e, t, n) {
  if (e == null)
    return t(void 0), n && n(void 0), ee;
  const r = Ut(
    () => e.subscribe(
      t,
      // @ts-expect-error
      n
    )
  );
  return r.unsubscribe ? () => r.unsubscribe() : r;
}
const ue = [];
function bn(e, t) {
  return {
    subscribe: bt(e, t).subscribe
  };
}
function bt(e, t = ee) {
  let n = null;
  const r = /* @__PURE__ */ new Set();
  function i(f) {
    if (_n(e, f) && (e = f, n)) {
      const u = !ue.length;
      for (const l of r)
        l[1](), ue.push(l, e);
      if (u) {
        for (let l = 0; l < ue.length; l += 2)
          ue[l][0](ue[l + 1]);
        ue.length = 0;
      }
    }
  }
  function s(f) {
    i(f(
      /** @type {T} */
      e
    ));
  }
  function o(f, u = ee) {
    const l = [f, u];
    return r.add(l), r.size === 1 && (n = t(i, s) || ee), f(
      /** @type {T} */
      e
    ), () => {
      r.delete(l), r.size === 0 && n && (n(), n = null);
    };
  }
  return { set: i, update: s, subscribe: o };
}
function wn(e, t, n) {
  const r = !Array.isArray(e), i = r ? [e] : e;
  if (!i.every(Boolean))
    throw new Error("derived() expects stores as input, got a falsy value");
  const s = t.length < 2;
  return bn(n, (o, f) => {
    let u = !1;
    const l = [];
    let a = 0, d = ee;
    const c = () => {
      if (a)
        return;
      d();
      const h = t(r ? l[0] : l, o, f);
      s ? o(h) : d = typeof h == "function" ? h : ee;
    }, _ = i.map(
      (h, p) => gn(
        h,
        (w) => {
          l[p] = w, a &= ~(1 << p), u && c();
        },
        () => {
          a |= 1 << p;
        }
      )
    );
    return u = !0, c(), function() {
      ut(_), d(), u = !1;
    };
  });
}
const V = /* @__PURE__ */ new Set();
let b = null, C = null, qe = null, Me = !1, ae = null, Te = null;
var Qe = 0;
let yn = 1;
class ie {
  id = yn++;
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
        y(r, k), this.schedule(r);
      for (r of n.m)
        y(r, L), this.schedule(r);
    }
  }
  #h() {
    if (Qe++ > 1e3 && (V.delete(this), mn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), y(f, k), this.schedule(f);
      for (const f of this.#n)
        y(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ae = [], r = [], i = Te = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw Et(f), u;
      }
    if (b = null, i.length > 0) {
      var s = ie.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (ae = null, Te = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [f, u] of this.#s)
        mt(f, u);
    } else {
      this.#r.size === 0 && V.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Xe(r), Xe(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    o !== null && (V.add(o), o.#h()), V.has(this) || this.#b();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= m;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & (U | ne)) !== 0, f = o && (s & m) !== 0, u = f || (s & K) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= m : (s & ye) !== 0 ? n.push(i) : Ee(i) && ((s & Z) !== 0 && this.#n.add(i), _e(i));
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
      gt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & G) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, C = null;
  }
  flush() {
    try {
      Me = !0, b = this, this.#h();
    } finally {
      Qe = 0, qe = null, ae = null, Te = null, Me = !1, b = null, C = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), V.delete(this);
  }
  #b() {
    for (const l of V) {
      var t = l.id < this.id, n = [];
      for (const [a, [d, c]] of this.current) {
        if (l.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(a)[0]
          );
          if (t && d !== r)
            l.current.set(a, [d, c]);
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
          wt(f, i, s, o);
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
    this.#a || r || (this.#a = !0, ce(() => {
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
    return (this.#i ??= ot()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new ie();
      Me || (V.add(b), ce(() => {
        b === t && t.flush();
      }));
    }
    return b;
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
    if (qe = t, t.b?.is_pending && (t.f & (ye | De | at)) !== 0 && (t.f & le) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ae !== null && n === g && (v === null || (v.f & E) === 0))
        return;
      if ((r & (ne | U)) !== 0) {
        if ((r & m) === 0)
          return;
        n.f ^= m;
      }
    }
    this.#e.push(n);
  }
}
function mn() {
  try {
    ln();
  } catch (e) {
    H(e, qe);
  }
}
let z = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | K)) === 0 && Ee(r) && (z = /* @__PURE__ */ new Set(), _e(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && It(r), z?.size > 0)) {
        W.clear();
        for (const i of z) {
          if ((i.f & (I | K)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            z.has(o) && (z.delete(o), s.push(o)), o = o.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (I | K)) === 0 && _e(u);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function wt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & E) !== 0 ? wt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & ($e | Z)) !== 0 && (s & k) === 0 && yt(i, t, r) && (y(i, k), Ue(
        /** @type {Effect} */
        i
      ));
    }
}
function yt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (he.call(t, i))
        return !0;
      if ((i.f & E) !== 0 && yt(
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
  b.schedule(e);
}
function mt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & m) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), y(e, m);
    for (var n = e.first; n !== null; )
      mt(n, t), n = n.next;
  }
}
function Et(e) {
  y(e, m);
  for (var t = e.first; t !== null; )
    Et(t), t = t.next;
}
function En(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    Ke() && (B(n), $n(() => (t === 0 && (r = Ut(() => e(() => we(n)))), t += 1, () => {
      ce(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var xn = Ae | ve;
function Tn(e, t, n, r) {
  new Sn(e, t, n, r);
}
class Sn {
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
  #v = En(() => (this.#o = Oe(this.#a), () => {
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
        g
      );
      o.b = this, o.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Un(() => {
      this.#w();
    }, xn);
  }
  #b() {
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), ce(() => {
      var n = this.#s = document.createDocumentFragment(), r = Ot();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, Se(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        b
      ));
    }));
  }
  #w() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Kn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Q(() => n(this.#l));
      } else
        this.#p(
          /** @type {Batch} */
          b
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
    gt(t, this.#_, this.#h);
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
    var n = g, r = v, i = O;
    q(this.#i), F(this.#i), de(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return vt(s), null;
    } finally {
      q(n), F(r), de(i);
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
    this.#y(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, ce(() => {
      this.#c = !1, this.#o && Ne(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#v(), B(
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
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        dn();
        return;
      }
      i = !0, s && an(), this.#n !== null && Se(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#w();
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
              g
            );
            l.b = this, l.f |= je, r(
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
    ce(() => {
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
function kn(e, t, n, r) {
  const i = Rn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = An(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (_) {
      (o.f & I) === 0 && H(_, o);
    }
    Re();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var a = xt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ Nn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, o)).finally(() => a());
  }
  u ? u.then(() => {
    f(), d(), Re();
  }) : d();
}
function An() {
  var e = (
    /** @type {Effect} */
    g
  ), t = v, n = O, r = (
    /** @type {Batch} */
    b
  );
  return function(s = !0) {
    q(e), F(t), de(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  q(null), F(null), de(null), e && b?.deactivate();
}
function xt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    b
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function Rn(e) {
  var t = E | k, n = v !== null && (v.f & E) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return g !== null && (g.f |= ve), {
    ctx: O,
    deps: null,
    effects: null,
    equals: ct,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      x
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Nn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && tn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    x
  ), o = !v, f = /* @__PURE__ */ new Map();
  return Yn(() => {
    var u = (
      /** @type {Effect} */
      g
    ), l = ot();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Re);
    } catch (_) {
      l.reject(_), Re();
    }
    var a = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((u.f & le) !== 0)
        var d = xt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(a)?.reject(Y), f.delete(a);
      else {
        for (const _ of f.values())
          _.reject(Y);
        f.clear();
      }
      f.set(a, l);
    }
    const c = (_, h = void 0) => {
      if (d) {
        var p = h === Y;
        d(p);
      }
      if (!(h === Y || (u.f & I) !== 0)) {
        if (a.activate(), h)
          s.f |= G, Ne(s, h);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Ne(s, _);
          for (const [w, T] of f) {
            if (f.delete(w), w === a) break;
            T.reject(Y);
          }
        }
        a.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Ln(() => {
    for (const u of f.values())
      u.reject(Y);
  }), new Promise((u) => {
    function l(a) {
      function d() {
        a === i ? u(s) : l(i);
      }
      a.then(d, d);
    }
    l(i);
  });
}
function Dn(e) {
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
function On(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = g;
  q(On(e));
  try {
    e.f &= ~re, Dn(e), t = Yt(e);
  } finally {
    q(n);
  }
  return t;
}
function Tt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = qt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    y(e, m);
    return;
  }
  se || (C !== null ? (Ke() || b?.is_fork) && C.set(e, n) : Be(e));
}
function Fn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Y), t.teardown = ee, t.ac = null, me(t, 0), Ge(t));
}
function St(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && _e(t);
}
let ze = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let kt = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ct,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Oe(e);
  return Gn(n), n;
}
function $(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (v.f & Je) !== 0) && _t() && (v.f & (E | Z | $e | Je)) !== 0 && (D === null || !he.call(D, e)) && on();
  let r = n ? pe(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    se ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), C === null && Be(s);
    }
    e.wv = qt(), At(e, k, n), g !== null && (g.f & m) !== 0 && (g.f & (U | ne)) === 0 && (R === null ? Wn([e]) : R.push(e)), !i.is_fork && ze.size > 0 && !kt && Cn();
  }
  return t;
}
function Cn() {
  kt = !1;
  for (const e of ze)
    (e.f & m) !== 0 && y(e, L), Ee(e) && _e(e);
  ze.clear();
}
function we(e) {
  $(e, e.v + 1);
}
function At(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], f = o.f, u = (f & k) === 0;
      if (u && y(o, t), (f & E) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        C?.delete(l), (f & re) === 0 && (f & N && (o.f |= re), At(l, L, n));
      } else if (u) {
        var a = (
          /** @type {Effect} */
          o
        );
        (f & Z) !== 0 && z !== null && z.add(a), n !== null ? n.push(a) : Ue(a);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Qt(e);
  if (t !== Zt && t !== Jt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ht(e), i = /* @__PURE__ */ P(0), s = te, o = (f) => {
    if (te === s)
      return f();
    var u = v, l = te;
    F(null), nt(s);
    var a = f();
    return F(u), nt(l), a;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && fn();
        var a = n.get(u);
        return a === void 0 ? o(() => {
          var d = /* @__PURE__ */ P(l.value);
          return n.set(u, d), d;
        }) : $(a, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const a = o(() => /* @__PURE__ */ P(x));
            n.set(u, a), we(i);
          }
        } else
          $(l, x), we(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Ce)
          return e;
        var a = n.get(u), d = u in f;
        if (a === void 0 && (!d || be(f, u)?.writable) && (a = o(() => {
          var _ = pe(d ? f[u] : x), h = /* @__PURE__ */ P(_);
          return h;
        }), n.set(u, a)), a !== void 0) {
          var c = B(a);
          return c === x ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var a = n.get(u);
          a && (l.value = B(a));
        } else if (l === void 0) {
          var d = n.get(u), c = d?.v;
          if (d !== void 0 && c !== x)
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
        var l = n.get(u), a = l !== void 0 && l.v !== x || Reflect.has(f, u);
        if (l !== void 0 || g !== null && (!a || be(f, u)?.writable)) {
          l === void 0 && (l = o(() => {
            var c = a ? pe(f[u]) : x, _ = /* @__PURE__ */ P(c);
            return _;
          }), n.set(u, l));
          var d = B(l);
          if (d === x)
            return !1;
        }
        return a;
      },
      set(f, u, l, a) {
        var d = n.get(u), c = u in f;
        if (r && u === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var h = n.get(_ + "");
            h !== void 0 ? $(h, x) : _ in f && (h = o(() => /* @__PURE__ */ P(x)), n.set(_ + "", h));
          }
        if (d === void 0)
          (!c || be(f, u)?.writable) && (d = o(() => /* @__PURE__ */ P(void 0)), $(d, pe(l)), n.set(u, d));
        else {
          c = d.v !== x;
          var p = o(() => pe(l));
          $(d, p);
        }
        var w = Reflect.getOwnPropertyDescriptor(f, u);
        if (w?.set && w.set.call(a, l), !c) {
          if (r && typeof u == "string") {
            var T = (
              /** @type {Source<number>} */
              n.get("length")
            ), fe = Number(u);
            Number.isInteger(fe) && fe >= T.v && $(T, fe + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        B(i);
        var u = Reflect.ownKeys(f).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== x;
        });
        for (var [l, a] of n)
          a.v !== x && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        un();
      }
    }
  );
}
var et, Rt, Nt, Dt;
function Mn() {
  if (et === void 0) {
    et = window, Rt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Nt = be(t, "firstChild").get, Dt = be(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Ot(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ft(e) {
  return (
    /** @type {TemplateNode | null} */
    Nt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    Dt.call(e)
  );
}
function Pe(e, t) {
  return /* @__PURE__ */ Ft(e);
}
function Ie(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function Pn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(hn, e, void 0)
  );
}
function Ct(e) {
  var t = v, n = g;
  F(null), q(null);
  try {
    return e();
  } finally {
    F(t), q(n);
  }
}
function In(e) {
  g === null && (v === null && sn(), rn()), se && nn();
}
function jn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = g;
  n !== null && (n.f & K) !== 0 && (e |= K);
  var r = {
    ctx: O,
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
  if ((e & ye) !== 0)
    ae !== null ? ae.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      _e(r);
    } catch (o) {
      throw j(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Z) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && jn(i, n), v !== null && (v.f & E) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return v !== null && !M;
}
function Ln(e) {
  const t = J(De, null);
  return y(t, m), t.teardown = e, t;
}
function qn(e) {
  In();
  var t = (
    /** @type {Effect} */
    g.f
  ), n = !v && (t & U) !== 0 && (t & le) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      O
    );
    (r.e ??= []).push(e);
  } else
    return Mt(e);
}
function Mt(e) {
  return J(ye | en, e);
}
function zn(e) {
  ie.ensure();
  const t = J(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Se(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function Yn(e) {
  return J($e | ve, e);
}
function $n(e, t = 0) {
  return J(De | t, e);
}
function Bn(e, t = [], n = [], r = []) {
  kn(r, t, n, (i) => {
    J(De, () => e(...i.map(B)));
  });
}
function Un(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(U | ve, e);
}
function Pt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = se, r = v;
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
    i !== null && Ct(() => {
      i.abort(Y);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Vn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Xt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Hn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Ze), Ge(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Pt(e), e.f ^= Ze, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && It(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Hn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function It(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Se(e, t, n = !0) {
  var r = [];
  jt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function jt(e, t, n) {
  if ((e.f & K) === 0) {
    e.f ^= K;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & Z) !== 0;
      jt(i, t, o ? n : !1), i = s;
    }
  }
}
function Kn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let ke = !1, se = !1;
function tt(e) {
  se = e;
}
let v = null, M = !1;
function F(e) {
  v = e;
}
let g = null;
function q(e) {
  g = e;
}
let D = null;
function Gn(e) {
  v !== null && (D === null ? D = [e] : D.push(e));
}
let S = null, A = 0, R = null;
function Wn(e) {
  R = e;
}
let Lt = 1, X = 0, te = X;
function nt(e) {
  te = e;
}
function qt() {
  return ++Lt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & E && (e.f &= ~re), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && Tt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && y(e, m);
  }
  return !1;
}
function zt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && he.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? zt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, k) : (s.f & m) !== 0 && y(s, L), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Yt(e) {
  var t = S, n = A, r = R, i = v, s = D, o = O, f = M, u = te, l = e.f;
  S = /** @type {null | Value[]} */
  null, A = 0, R = null, v = (l & (U | ne)) === 0 ? e : null, D = null, de(e.ctx), M = !1, te = ++X, e.ac !== null && (Ct(() => {
    e.ac.abort(Y);
  }), e.ac = null);
  try {
    e.f |= Le;
    var a = (
      /** @type {Function} */
      e.fn
    ), d = a();
    e.f |= le;
    var c = e.deps, _ = b?.is_fork;
    if (S !== null) {
      var h;
      if (_ || me(e, A), c !== null && A > 0)
        for (c.length = A + S.length, h = 0; h < S.length; h++)
          c[A + h] = S[h];
      else
        e.deps = c = S;
      if (Ke() && (e.f & N) !== 0)
        for (h = A; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !_ && c !== null && A < c.length && (me(e, A), c.length = A);
    if (_t() && R !== null && !M && c !== null && (e.f & (E | L | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      R.length; h++)
        zt(
          R[h],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (X++, i.deps !== null)
        for (let p = 0; p < n; p += 1)
          i.deps[p].rv = X;
      if (t !== null)
        for (const p of t)
          p.rv = X;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & G) !== 0 && (e.f ^= G), d;
  } catch (p) {
    return vt(p);
  } finally {
    e.f ^= Le, S = t, A = n, R = r, v = i, D = s, de(o), M = f, te = u;
  }
}
function Zn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Kt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !he.call(S, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), Be(s), Fn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Zn(e, n[r]);
}
function _e(e) {
  var t = e.f;
  if ((t & I) === 0) {
    y(e, m);
    var n = g, r = ke;
    g = e, ke = !0;
    try {
      (t & (Z | at)) !== 0 ? Vn(e) : Ge(e), Pt(e);
      var i = Yt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Lt;
      var s;
    } finally {
      ke = r, g = n;
    }
  }
}
function B(e) {
  var t = e.f, n = (t & E) !== 0;
  if (v !== null && !M) {
    var r = g !== null && (g.f & I) !== 0;
    if (!r && (D === null || !he.call(D, e))) {
      var i = v.deps;
      if ((v.f & Le) !== 0)
        e.rv < X && (e.rv = X, S === null && i !== null && i[A] === e ? A++ : S === null ? S = [e] : S.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : he.call(s, v) || s.push(v);
      }
    }
  }
  if (se && W.has(e))
    return W.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (se) {
      var f = o.v;
      return ((o.f & m) === 0 && o.reactions !== null || Bt(o)) && (f = Ve(o)), W.set(o, f), f;
    }
    var u = (o.f & N) === 0 && !M && v !== null && (ke || (v.f & N) !== 0), l = (o.f & le) === 0;
    Ee(o) && (u && (o.f |= N), Tt(o)), u && !l && (St(o), $t(o));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function $t(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & N) === 0 && (St(
        /** @type {Derived} */
        t
      ), $t(
        /** @type {Derived} */
        t
      ));
}
function Bt(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & E) !== 0 && Bt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ut(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Jn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function it(e, t) {
  Jn("op_set_text", e, t);
}
const Qn = ["touchstart", "touchmove"];
function Xn(e) {
  return Qn.includes(e);
}
const ge = Symbol("events"), Vt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function st(e, t, n) {
  (t[ge] ??= {})[e] = n;
}
function er(e) {
  for (var t = 0; t < e.length; t++)
    Vt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let lt = null;
function ft(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  lt = e;
  var o = 0, f = lt === e && e[ge];
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
    u <= l && (o = u);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    Wt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = v, d = g;
    F(null), q(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var p = s[ge]?.[r];
          p != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && p.call(s, e);
        } catch (w) {
          c ? _.push(w) : c = w;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let w of _)
          queueMicrotask(() => {
            throw w;
          });
        throw c;
      }
    } finally {
      e[ge] = t, delete e.currentTarget, F(a), q(d);
    }
  }
}
const tr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function nr(e) {
  return (
    /** @type {string} */
    tr?.createHTML(e) ?? e
  );
}
function rr(e) {
  var t = Pn("template");
  return t.innerHTML = nr(e.replaceAll("<!>", "<!---->")), t.content;
}
function ir(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function sr(e, t) {
  var n = (t & cn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = rr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ft(r));
    var s = (
      /** @type {TemplateNode} */
      n || Rt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return ir(s, s), s;
  };
}
function lr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function fr(e, t) {
  return ur(e, t);
}
const xe = /* @__PURE__ */ new Map();
function ur(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: f }) {
  Mn();
  var u = void 0, l = zn(() => {
    var a = n ?? t.appendChild(Ot());
    Tn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (_) => {
        ht({});
        var h = (
          /** @type {ComponentContext} */
          O
        );
        s && (h.c = s), i && (r.$$events = i), u = e(_, r) || {}, dt();
      },
      f
    );
    var d = /* @__PURE__ */ new Set(), c = (_) => {
      for (var h = 0; h < _.length; h++) {
        var p = _[h];
        if (!d.has(p)) {
          d.add(p);
          var w = Xn(p);
          for (const Fe of [t, document]) {
            var T = xe.get(Fe);
            T === void 0 && (T = /* @__PURE__ */ new Map(), xe.set(Fe, T));
            var fe = T.get(p);
            fe === void 0 ? (Fe.addEventListener(p, ft, { passive: w }), T.set(p, 1)) : T.set(p, fe + 1);
          }
        }
      }
    };
    return c(Gt(Vt)), Ye.add(c), () => {
      for (var _ of d)
        for (const w of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            xe.get(w)
          ), p = (
            /** @type {number} */
            h.get(_)
          );
          --p == 0 ? (w.removeEventListener(_, ft), h.delete(_), h.size === 0 && xe.delete(w)) : h.set(_, p);
        }
      Ye.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return or.set(u, l), u;
}
let or = /* @__PURE__ */ new WeakMap();
var ar = /* @__PURE__ */ sr("<div><div> </div> <div> </div> <button>Increment</button> <button>Reset</button></div>");
function cr(e, t) {
  ht(t, !0);
  const n = bt(0), r = wn(n, (p) => p * 2);
  let i = /* @__PURE__ */ P(0), s = /* @__PURE__ */ P(0);
  qn(() => {
    const p = n.subscribe((T) => {
      $(i, T, !0);
    }), w = r.subscribe((T) => {
      $(s, T, !0);
    });
    return () => {
      p(), w();
    };
  });
  function o() {
    n.update((p) => p + 1);
  }
  function f() {
    n.set(0);
  }
  var u = ar(), l = Pe(u), a = Pe(l), d = Ie(l, 2), c = Pe(d), _ = Ie(d, 2), h = Ie(_, 2);
  Bn(() => {
    it(a, `Count: ${B(i) ?? ""}`), it(c, `Doubled: ${B(s) ?? ""}`);
  }), st("click", _, o), st("click", h, f), lr(e, u), dt();
}
er(["click"]);
function dr(e) {
  return fr(cr, { target: e });
}
export {
  dr as default,
  dr as rvst_mount
};

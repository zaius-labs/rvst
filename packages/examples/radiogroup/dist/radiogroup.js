var Bt = Array.isArray, Ut = Array.prototype.indexOf, ue = Array.prototype.includes, Vt = Array.from, Ht = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, $t = Object.prototype, zt = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Gt = () => {
};
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function at() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, be = 4, Ne = 8, ot = 1 << 24, Z = 16, W = 32, ne = 64, Ie = 128, R = 512, m = 1024, k = 2048, q = 4096, $ = 8192, I = 16384, _e = 32768, Ze = 1 << 25, Ae = 65536, Je = 1 << 17, Zt = 1 << 18, he = 1 << 19, Jt = 1 << 20, re = 65536, Le = 1 << 21, Be = 1 << 22, z = 1 << 23, ge = Symbol("$state"), V = new class extends Error {
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
const ln = 2, E = Symbol(), sn = "http://www.w3.org/1999/xhtml";
function fn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ct(e) {
  return e === this.v;
}
let M = null;
function ae(e) {
  M = e;
}
function un(e, t = !1, n) {
  M = {
    p: M,
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
    M
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Pn(r);
  }
  return t.i = !0, M = t.p, /** @type {T} */
  {};
}
function _t() {
  return !0;
}
let se = [];
function on() {
  var e = se;
  se = [], Wt(e);
}
function K(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && on();
    });
  }
  se.push(e);
}
function ht(e) {
  var t = p;
  if (t === null)
    return v.f |= z, e;
  if ((t.f & _e) === 0 && (t.f & be) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
      if ((t.f & _e) === 0)
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
function b(e, t) {
  e.f = e.f & cn | t;
}
function Ue(e) {
  (e.f & R) !== 0 || e.deps === null ? b(e, m) : b(e, q);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), dt(e.deps), b(e, m);
}
const Q = /* @__PURE__ */ new Set();
let w = null, P = null, qe = null, Fe = !1, fe = null, Te = null;
var Qe = 0;
let _n = 1;
class ie {
  // for debugging. TODO remove once async is stable
  id = _n++;
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #d = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #s = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #f = 0;
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
  #u = !1;
  #a() {
    return this.is_fork || this.#f > 0;
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
        b(r, k), this.schedule(r);
      for (r of n.m)
        b(r, q), this.schedule(r);
    }
  }
  #c() {
    if (Qe++ > 1e3 && (Q.delete(this), hn()), !this.#a()) {
      for (const f of this.#t)
        this.#n.delete(f), b(f, k), this.schedule(f);
      for (const f of this.#n)
        b(f, q), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = fe = [], r = [], i = Te = [];
    for (const f of t)
      try {
        this.#_(f, n, r);
      } catch (l) {
        throw bt(f), l;
      }
    if (w = null, i.length > 0) {
      var s = ie.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (fe = null, Te = null, this.#a()) {
      this.#h(r), this.#h(n);
      for (const [f, l] of this.#l)
        wt(f, l);
    } else {
      this.#s === 0 && Q.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), Xe(r), Xe(n), this.#r?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((l) => !f.#e.includes(l)));
    }
    a !== null && (Q.add(a), a.#c()), Q.has(this) || this.#o();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #_(t, n, r) {
    t.f ^= m;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (W | ne)) !== 0, f = a && (s & m) !== 0, l = f || (s & $) !== 0 || this.#l.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= m : (s & be) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      vt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & z) === 0 && (this.current.set(t, t.v), P?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, P = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#c();
    } finally {
      Qe = 0, qe = null, fe = null, Te = null, Fe = !1, w = null, P = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), Q.delete(this);
  }
  #o() {
    for (const l of Q) {
      var t = l.id < this.id, n = [];
      for (const [u, o] of this.current) {
        if (l.current.has(u))
          if (t && o !== l.current.get(u))
            l.current.set(u, o);
          else
            continue;
        n.push(u);
      }
      var r = [...l.current.keys()].filter((u) => !this.current.has(u));
      if (r.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
        for (var a of n)
          pt(a, r, i, s);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#_(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#s += 1, t && (this.#f += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#s -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, K(() => {
      this.#u = !1, this.flush();
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
    this.#i.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#d.add(t);
  }
  settled() {
    return (this.#r ??= at()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ie();
      Fe || (Q.add(w), K(() => {
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
    if (qe = t, t.b?.is_pending && (t.f & (be | Ne | ot)) !== 0 && (t.f & _e) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === p && (v === null || (v.f & y) === 0))
        return;
      if ((r & (ne | W)) !== 0) {
        if ((r & m) === 0)
          return;
        n.f ^= m;
      }
    }
    this.#e.push(n);
  }
}
function hn() {
  try {
    Xt();
  } catch (e) {
    H(e, qe);
  }
}
let U = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | $)) === 0 && ye(r) && (U = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), U?.size > 0)) {
        G.clear();
        for (const i of U) {
          if ((i.f & (I | $)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            U.has(a) && (U.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (I | $)) === 0 && ce(l);
          }
        }
        U.clear();
      }
    }
    U = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | Z)) !== 0 && (s & k) === 0 && gt(i, t, r) && (b(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function gt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && gt(
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
function Ve(e) {
  w.schedule(e);
}
function wt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & m) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), b(e, m);
    for (var n = e.first; n !== null; )
      wt(n, t), n = n.next;
  }
}
function bt(e) {
  b(e, m);
  for (var t = e.first; t !== null; )
    bt(t), t = t.next;
}
function dn(e) {
  let t = 0, n = De(0), r;
  return () => {
    Ke() && (C(n), Dt(() => (t === 0 && (r = Vn(() => e(() => we(n)))), t += 1, () => {
      K(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var vn = Ae | he;
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
  #i;
  /** @type {TemplateNode | null} */
  #d = null;
  /** @type {BoundaryProps} */
  #s;
  /** @type {((anchor: Node) => void)} */
  #f;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #t = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {DocumentFragment | null} */
  #l = null;
  #u = 0;
  #a = 0;
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
  #b = dn(() => (this.#o = De(this.#u), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#s = n, this.#f = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = jn(() => {
      this.#g();
    }, vn);
  }
  #m() {
    try {
      this.#e = X(() => this.#f(this.#i));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#s.failed;
    n && (this.#n = X(() => {
      n(
        this.#i,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#s.pending;
    t && (this.is_pending = !0, this.#t = X(() => t(this.#i)), K(() => {
      var n = this.#l = document.createDocumentFragment(), r = Rt();
      n.append(r), this.#e = this.#p(() => X(() => this.#f(r))), this.#a === 0 && (this.#i.before(n), this.#l = null, ke(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#v(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#u = 0, this.#e = X(() => {
        this.#f(this.#i);
      }), this.#a > 0) {
        var t = this.#l = document.createDocumentFragment();
        qn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#s.pending
        );
        this.#t = X(() => n(this.#i));
      } else
        this.#v(
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
  #v(t) {
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vt(t, this.#_, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#s.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var n = p, r = v, i = M;
    Y(this.#r), N(this.#r), ae(this.#r.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      Y(n), N(r), ae(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #w(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#w(t, n);
      return;
    }
    this.#a += t, this.#a === 0 && (this.#v(n), this.#t && ke(this.#t, () => {
      this.#t = null;
    }), this.#l && (this.#i.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#w(t, n), this.#u += t, !(!this.#o || this.#c) && (this.#c = !0, K(() => {
      this.#c = !1, this.#o && Oe(this.#o, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#b(), C(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#s.onerror;
    let r = this.#s.failed;
    if (!n && !r)
      throw t;
    this.#e && (L(this.#e), this.#e = null), this.#t && (L(this.#t), this.#t = null), this.#n && (L(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        fn();
        return;
      }
      i = !0, s && rn(), this.#n !== null && ke(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, a), s = !1;
      } catch (u) {
        H(u, this.#r && this.#r.parent);
      }
      r && (this.#n = this.#p(() => {
        try {
          return X(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= Ie, r(
              this.#i,
              () => l,
              () => a
            );
          });
        } catch (u) {
          return H(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    K(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (u) {
        H(u, this.#r && this.#r.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        f,
        /** @param {unknown} e */
        (u) => H(u, this.#r && this.#r.parent)
      ) : f(l);
    });
  }
}
function wn(e, t, n, r) {
  const i = mn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = bn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (d) {
      (a.f & I) === 0 && H(d, a);
    }
    Re();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var o = mt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ yn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    f(), h(), Re();
  }) : h();
}
function bn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = M, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), N(t), ae(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  Y(null), N(null), ae(null), e && w?.deactivate();
}
function mt() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    p.b
  ), t = (
    /** @type {Batch} */
    w
  ), n = e.is_rendered();
  return e.update_pending_count(1, t), t.increment(n), (r = !1) => {
    e.update_pending_count(-1, t), t.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
  var t = y | k, n = v !== null && (v.f & y) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= he), {
    ctx: M,
    deps: null,
    effects: null,
    equals: ct,
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
  ), s = De(
    /** @type {V} */
    E
  ), a = !v, f = /* @__PURE__ */ new Map();
  return Cn(() => {
    var l = (
      /** @type {Effect} */
      p
    ), u = at();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Re);
    } catch (d) {
      u.reject(d), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((l.f & _e) !== 0)
        var h = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(V), f.delete(o);
      else {
        for (const d of f.values())
          d.reject(V);
        f.clear();
      }
      f.set(o, u);
    }
    const c = (d, _ = void 0) => {
      if (h) {
        var g = _ === V;
        h(g);
      }
      if (!(_ === V || (l.f & I) !== 0)) {
        if (o.activate(), _)
          s.f |= z, Oe(s, _);
        else {
          (s.f & z) !== 0 && (s.f ^= z), Oe(s, d);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(V);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (d) => c(null, d || "unknown"));
  }), Nt(() => {
    for (const l of f.values())
      l.reject(V);
  }), new Promise((l) => {
    function u(o) {
      function h() {
        o === i ? l(s) : u(i);
      }
      o.then(h, h);
    }
    u(i);
  });
}
function En(e) {
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
function xn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function He(e) {
  var t, n = p;
  Y(xn(e));
  try {
    e.f &= ~re, En(e), t = Lt(e);
  } finally {
    Y(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = jt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    b(e, m);
    return;
  }
  oe || (P !== null ? (Ke() || w?.is_fork) && P.set(e, n) : Ue(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Gt, t.ac = null, me(t, 0), Ge(t));
}
function Et(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Ye = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let xt = !1;
function De(e, t) {
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
function B(e, t) {
  const n = De(e);
  return Yn(n), n;
}
function j(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (v.f & Je) !== 0) && _t() && (v.f & (y | Z | Be | Je)) !== 0 && (O === null || !ue.call(O, e)) && nn();
  let r = n ? ve(t) : t;
  return Oe(e, r, Te);
}
function Oe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(s), P === null && Ue(s);
    }
    e.wv = jt(), Tt(e, k, n), p !== null && (p.f & m) !== 0 && (p.f & (W | ne)) === 0 && (A === null ? Bn([e]) : A.push(e)), !i.is_fork && Ye.size > 0 && !xt && kn();
  }
  return t;
}
function kn() {
  xt = !1;
  for (const e of Ye)
    (e.f & m) !== 0 && b(e, q), ye(e) && ce(e);
  Ye.clear();
}
function we(e) {
  j(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & k) === 0;
      if (l && b(a, t), (f & y) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        P?.delete(u), (f & re) === 0 && (f & R && (a.f |= re), Tt(u, q, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && U !== null && U.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || ge in e)
    return e;
  const t = Kt(e);
  if (t !== $t && t !== zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bt(e), i = /* @__PURE__ */ B(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var l = v, u = te;
    N(null), it(s);
    var o = f();
    return N(l), it(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ B(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && en();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ B(u.value);
          return n.set(l, h), h;
        }) : j(o, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const o = a(() => /* @__PURE__ */ B(E));
            n.set(l, o), we(i);
          }
        } else
          j(u, E), we(i);
        return !0;
      },
      get(f, l, u) {
        if (l === ge)
          return e;
        var o = n.get(l), h = l in f;
        if (o === void 0 && (!h || pe(f, l)?.writable) && (o = a(() => {
          var d = ve(h ? f[l] : E), _ = /* @__PURE__ */ B(d);
          return _;
        }), n.set(l, o)), o !== void 0) {
          var c = C(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var o = n.get(l);
          o && (u.value = C(o));
        } else if (u === void 0) {
          var h = n.get(l), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return u;
      },
      has(f, l) {
        if (l === ge)
          return !0;
        var u = n.get(l), o = u !== void 0 && u.v !== E || Reflect.has(f, l);
        if (u !== void 0 || p !== null && (!o || pe(f, l)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? ve(f[l]) : E, d = /* @__PURE__ */ B(c);
            return d;
          }), n.set(l, u));
          var h = C(u);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, l, u, o) {
        var h = n.get(l), c = l in f;
        if (r && l === "length")
          for (var d = u; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var _ = n.get(d + "");
            _ !== void 0 ? j(_, E) : d in f && (_ = a(() => /* @__PURE__ */ B(E)), n.set(d + "", _));
          }
        if (h === void 0)
          (!c || pe(f, l)?.writable) && (h = a(() => /* @__PURE__ */ B(void 0)), j(h, ve(u)), n.set(l, h));
        else {
          c = h.v !== E;
          var g = a(() => ve(u));
          j(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, l);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof l == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(l);
            Number.isInteger(le) && le >= D.v && j(D, le + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        C(i);
        var l = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        tn();
      }
    }
  );
}
function et(e) {
  try {
    if (e !== null && typeof e == "object" && ge in e)
      return e[ge];
  } catch {
  }
  return e;
}
function Sn(e, t) {
  return Object.is(et(e), et(t));
}
var tt, kt, St, At;
function An() {
  if (tt === void 0) {
    tt = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    St = pe(t, "firstChild").get, At = pe(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ot(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $e(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function de(e, t) {
  return /* @__PURE__ */ Ot(e);
}
function Ce(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r);
  return r;
}
function Rn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(sn, e, void 0)
  );
}
let nt = !1;
function On() {
  nt || (nt = !0, document.addEventListener(
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
function ze(e) {
  var t = v, n = p;
  N(null), Y(null);
  try {
    return e();
  } finally {
    N(t), Y(n);
  }
}
function Nn(e, t, n, r = n) {
  e.addEventListener(t, () => ze(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), On();
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & $) !== 0 && (e |= $);
  var r = {
    ctx: M,
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
  if ((e & be) !== 0)
    fe !== null ? fe.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & he) === 0 && (i = i.first, (e & Z) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && Dn(i, n), v !== null && (v.f & y) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return v !== null && !F;
}
function Nt(e) {
  const t = J(Ne, null);
  return b(t, m), t.teardown = e, t;
}
function Pn(e) {
  return J(be | Jt, e);
}
function Fn(e) {
  ie.ensure();
  const t = J(ne | he, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ke(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function Cn(e) {
  return J(Be | he, e);
}
function Dt(e, t = 0) {
  return J(Ne | t, e);
}
function Mn(e, t = [], n = [], r = []) {
  wn(r, t, n, (i) => {
    J(Ne, () => e(...i.map(C)));
  });
}
function jn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function X(e) {
  return J(W | he, e);
}
function Pt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    rt(!0), N(null);
    try {
      t.call(null);
    } finally {
      rt(n), N(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && ze(() => {
      i.abort(V);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function In(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & Zt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ln(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, Ze), Ge(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Pt(e), e.f ^= Ze, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Ln(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $e(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ke(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ct(e, t, n) {
  if ((e.f & $) === 0) {
    e.f ^= $;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      Ct(i, t, a ? n : !1), i = s;
    }
  }
}
function qn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ $e(n);
      t.append(n), n = i;
    }
}
let Se = !1, oe = !1;
function rt(e) {
  oe = e;
}
let v = null, F = !1;
function N(e) {
  v = e;
}
let p = null;
function Y(e) {
  p = e;
}
let O = null;
function Yn(e) {
  v !== null && (O === null ? O = [e] : O.push(e));
}
let T = null, S = 0, A = null;
function Bn(e) {
  A = e;
}
let Mt = 1, ee = 0, te = ee;
function it(e) {
  te = e;
}
function jt() {
  return ++Mt;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & q) !== 0) {
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
    P === null && b(e, m);
  }
  return !1;
}
function It(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ue.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? It(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, k) : (s.f & m) !== 0 && b(s, q), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = A, i = v, s = O, a = M, f = F, l = te, u = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, v = (u & (W | ne)) === 0 ? e : null, O = null, ae(e.ctx), F = !1, te = ++ee, e.ac !== null && (ze(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= _e;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var _;
      if (d || me(e, S), c !== null && S > 0)
        for (c.length = S + T.length, _ = 0; _ < T.length; _++)
          c[S + _] = T[_];
      else
        e.deps = c = T;
      if (Ke() && (e.f & R) !== 0)
        for (_ = S; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !d && c !== null && S < c.length && (me(e, S), c.length = S);
    if (_t() && A !== null && !F && c !== null && (e.f & (y | q | k)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      A.length; _++)
        It(
          A[_],
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
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & z) !== 0 && (e.f ^= z), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= Le, T = t, S = n, A = r, v = i, O = s, ae(a), F = f, te = l;
  }
}
function Un(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ut.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~re), Ue(s), Tn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Un(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & I) === 0) {
    b(e, m);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Z | ot)) !== 0 ? In(e) : Ge(e), Pt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mt;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function C(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !F) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (O === null || !ue.call(O, e))) {
      var i = v.deps;
      if ((v.f & Le) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
      }
    }
  }
  if (oe && G.has(e))
    return G.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & m) === 0 && a.reactions !== null || Yt(a)) && (f = He(a)), G.set(a, f), f;
    }
    var l = (a.f & R) === 0 && !F && v !== null && (Se || (v.f & R) !== 0), u = (a.f & _e) === 0;
    ye(a) && (l && (a.f |= R), yt(a)), l && !u && (Et(a), qt(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & z) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & R) === 0 && (Et(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Yt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & y) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Vn(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const lt = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  lt?.[e] ? lt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function $n(e, t) {
  Hn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function Kn(e) {
  return zn.includes(e);
}
const Ee = Symbol("events"), Gn = /* @__PURE__ */ new Set(), st = /* @__PURE__ */ new Set();
let ft = null;
function ut(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  ft = e;
  var a = 0, f = ft === e && e[Ee];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ee] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Ht(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    N(null), Y(null);
    try {
      for (var c, d = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[Ee]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? d.push(x) : c = x;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        s = _;
      }
      if (c) {
        for (let x of d)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[Ee] = t, delete e.currentTarget, N(o), Y(h);
    }
  }
}
const Wn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Zn(e) {
  return (
    /** @type {string} */
    Wn?.createHTML(e) ?? e
  );
}
function Jn(e) {
  var t = Rn("template");
  return t.innerHTML = Zn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Qn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Xn(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Jn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ot(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Qn(s, s), s;
  };
}
function er(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function tr(e, t) {
  return nr(e, t);
}
const xe = /* @__PURE__ */ new Map();
function nr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  An();
  var l = void 0, u = Fn(() => {
    var o = n ?? t.appendChild(Rt());
    pn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        un({});
        var _ = (
          /** @type {ComponentContext} */
          M
        );
        s && (_.c = s), i && (r.$$events = i), l = e(d, r) || {}, an();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var g = d[_];
        if (!h.has(g)) {
          h.add(g);
          var x = Kn(g);
          for (const Pe of [t, document]) {
            var D = xe.get(Pe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), xe.set(Pe, D));
            var le = D.get(g);
            le === void 0 ? (Pe.addEventListener(g, ut, { passive: x }), D.set(g, 1)) : D.set(g, le + 1);
          }
        }
      }
    };
    return c(Vt(Gn)), st.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            _.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, ut), _.delete(d), _.size === 0 && xe.delete(x)) : _.set(d, g);
        }
      st.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return rr.set(l, u), l;
}
let rr = /* @__PURE__ */ new WeakMap();
const Me = /* @__PURE__ */ new Set();
function je(e, t, n, r, i = r) {
  var s = n.getAttribute("type") === "checkbox", a = e;
  if (t !== null)
    for (var f of t)
      a = a[f] ??= [];
  a.push(n), Nn(
    n,
    "change",
    () => {
      var l = n.__value;
      s && (l = ir(a, l, n.checked)), i(l);
    },
    // TODO better default value handling
    () => i(s ? [] : null)
  ), Dt(() => {
    var l = r();
    s ? (l = l || [], n.checked = l.includes(n.__value)) : n.checked = Sn(n.__value, l);
  }), Nt(() => {
    var l = a.indexOf(n);
    l !== -1 && a.splice(l, 1);
  }), Me.has(a) || (Me.add(a), K(() => {
    a.sort((l, u) => l.compareDocumentPosition(u) === 4 ? -1 : 1), Me.delete(a);
  })), K(() => {
  });
}
function ir(e, t, n) {
  for (var r = /* @__PURE__ */ new Set(), i = 0; i < e.length; i += 1)
    e[i].checked && r.add(e[i].__value);
  return n || r.delete(t), Array.from(r);
}
var lr = /* @__PURE__ */ Xn('<div><label><input type="radio"/> Option A</label> <label><input type="radio"/> Option B</label> <label><input type="radio"/> Option C</label> <div> </div></div>');
function sr(e) {
  const t = [];
  let n = /* @__PURE__ */ B("a");
  var r = lr(), i = de(r), s = de(i);
  s.value = s.__value = "a";
  var a = Ce(i, 2), f = de(a);
  f.value = f.__value = "b";
  var l = Ce(a, 2), u = de(l);
  u.value = u.__value = "c";
  var o = Ce(l, 2), h = de(o);
  Mn(() => $n(h, `Picked: ${C(n) ?? ""}`)), je(t, [], s, () => C(n), (c) => j(n, c)), je(t, [], f, () => C(n), (c) => j(n, c)), je(t, [], u, () => C(n), (c) => j(n, c)), er(e, r);
}
function ur(e) {
  return tr(sr, { target: e });
}
export {
  ur as default,
  ur as rvst_mount
};

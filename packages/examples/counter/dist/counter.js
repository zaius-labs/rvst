var Pt = Array.isArray, Mt = Array.prototype.indexOf, ue = Array.prototype.includes, It = Array.from, jt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Lt = Object.prototype, qt = Array.prototype, Yt = Object.getPrototypeOf, He = Object.isExtensible;
const Ut = () => {
};
function Vt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function tt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Re = 8, nt = 1 << 24, W = 16, G = 32, te = 64, Fe = 128, R = 512, y = 1024, S = 2048, j = 4096, $ = 8192, M = 16384, he = 32768, $e = 1 << 25, Se = 65536, ze = 1 << 17, Bt = 1 << 18, _e = 1 << 19, Ht = 1 << 20, ne = 65536, Pe = 1 << 21, Le = 1 << 22, z = 1 << 23, De = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function $t() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function zt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Kt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Gt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Wt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Zt() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Jt = 2, E = Symbol(), Qt = "http://www.w3.org/1999/xhtml";
function Xt() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function rt(e) {
  return e === this.v;
}
let P = null;
function ae(e) {
  P = e;
}
function en(e, t = !1, n) {
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
function tn(e) {
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
function it() {
  return !0;
}
let se = [];
function nn() {
  var e = se;
  se = [], Vt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && nn();
    });
  }
  se.push(e);
}
function st(e) {
  var t = p;
  if (t === null)
    return v.f |= z, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
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
const rn = -7169;
function m(e, t) {
  e.f = e.f & rn | t;
}
function qe(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, j);
}
function lt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, lt(
        /** @type {Derived} */
        t.deps
      ));
}
function ft(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & j) !== 0 && n.add(e), lt(e.deps), m(e, y);
}
const J = /* @__PURE__ */ new Set();
let w = null, C = null, Me = null, Ce = !1, le = null, Ee = null;
var Ke = 0;
let sn = 1;
class re {
  // for debugging. TODO remove once async is stable
  id = sn++;
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
  #l = 0;
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
  #s = /* @__PURE__ */ new Map();
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
        m(r, S), this.schedule(r);
      for (r of n.m)
        m(r, j), this.schedule(r);
    }
  }
  #c() {
    if (Ke++ > 1e3 && (J.delete(this), ln()), !this.#a()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, S), this.schedule(f);
      for (const f of this.#n)
        m(f, j), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#h(f, n, r);
      } catch (l) {
        throw ct(f), l;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, Ee = null, this.#a()) {
      this.#_(r), this.#_(n);
      for (const [f, l] of this.#s)
        ot(f, l);
    } else {
      this.#l === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), Ge(r), Ge(n), this.#r?.resolve();
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
    a !== null && (J.add(a), a.#c()), J.has(this) || this.#o();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #h(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (G | te)) !== 0, f = a && (s & y) !== 0, l = f || (s & $) !== 0 || this.#s.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & W) !== 0 && this.#n.add(i), ce(i));
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
  #_(t) {
    for (var n = 0; n < t.length; n += 1)
      ft(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & z) === 0 && (this.current.set(t, t.v), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#c();
    } finally {
      Ke = 0, Me = null, le = null, Ee = null, Ce = !1, w = null, C = null, K.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), J.delete(this);
  }
  #o() {
    for (const l of J) {
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
          ut(a, r, i, s);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#h(f, [], []);
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
    this.#l += 1, t && (this.#f += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#l -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, fe(() => {
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
    return (this.#r ??= tt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Ce || (J.add(w), fe(() => {
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
    if (Me = t, t.b?.is_pending && (t.f & (we | Re | nt)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & b) === 0))
        return;
      if ((r & (te | G)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function ln() {
  try {
    zt();
  } catch (e) {
    H(e, Me);
  }
}
let Y = null;
function Ge(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (M | $)) === 0 && ye(r) && (Y = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && St(r), Y?.size > 0)) {
        K.clear();
        for (const i of Y) {
          if ((i.f & (M | $)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (M | $)) === 0 && ce(l);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function ut(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? ut(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Le | W)) !== 0 && (s & S) === 0 && at(i, t, r) && (m(i, S), Ye(
        /** @type {Effect} */
        i
      ));
    }
}
function at(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && at(
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
function Ye(e) {
  w.schedule(e);
}
function ot(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & j) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      ot(n, t), n = n.next;
  }
}
function ct(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    ct(t), t = t.next;
}
function fn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Ve() && (V(n), Rn(() => (t === 0 && (r = jn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var un = Se | _e;
function an(e, t, n, r) {
  new on(e, t, n, r);
}
class on {
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
  #l;
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
  #s = null;
  #u = 0;
  #a = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #m = fn(() => (this.#o = Ne(this.#u), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#l = n, this.#f = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Fe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = On(() => {
      this.#g();
    }, un);
  }
  #y() {
    try {
      this.#e = Q(() => this.#f(this.#i));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#l.failed;
    n && (this.#n = Q(() => {
      n(
        this.#i,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#l.pending;
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#i)), fe(() => {
      var n = this.#s = document.createDocumentFragment(), r = yt();
      n.append(r), this.#e = this.#p(() => Q(() => this.#f(r))), this.#a === 0 && (this.#i.before(n), this.#s = null, xe(
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
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#u = 0, this.#e = Q(() => {
        this.#f(this.#i);
      }), this.#a > 0) {
        var t = this.#s = document.createDocumentFragment();
        Fn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#l.pending
        );
        this.#t = Q(() => n(this.#i));
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
    this.is_pending = !1, t.transfer_effects(this.#h, this.#_);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ft(t, this.#h, this.#_);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#l.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var n = p, r = v, i = P;
    L(this.#r), O(this.#r), ae(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return st(s), null;
    } finally {
      L(n), O(r), ae(i);
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
    this.#a += t, this.#a === 0 && (this.#v(n), this.#t && xe(this.#t, () => {
      this.#t = null;
    }), this.#s && (this.#i.before(this.#s), this.#s = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#w(t, n), this.#u += t, !(!this.#o || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#o && Ae(this.#o, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), V(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#l.onerror;
    let r = this.#l.failed;
    if (!n && !r)
      throw t;
    this.#e && (I(this.#e), this.#e = null), this.#t && (I(this.#t), this.#t = null), this.#n && (I(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        Xt();
        return;
      }
      i = !0, s && Zt(), this.#n !== null && xe(this.#n, () => {
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
          return Q(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= Fe, r(
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
    fe(() => {
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
function cn(e, t, n, r) {
  const i = _n;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = hn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (d) {
      (a.f & M) === 0 && H(d, a);
    }
    ke();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var o = ht();
  function _() {
    Promise.all(n.map((c) => /* @__PURE__ */ dn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    f(), _(), ke();
  }) : _();
}
function hn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    L(e), O(t), ae(n), s && (e.f & M) === 0 && (r?.activate(), r?.apply());
  };
}
function ke(e = !0) {
  L(null), O(null), ae(null), e && w?.deactivate();
}
function ht() {
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
function _n(e) {
  var t = b | S, n = v !== null && (v.f & b) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: P,
    deps: null,
    effects: null,
    equals: rt,
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
function dn(e, t, n) {
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
  ), a = !v, f = /* @__PURE__ */ new Map();
  return An(() => {
    var l = (
      /** @type {Effect} */
      p
    ), u = tt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(ke);
    } catch (d) {
      u.reject(d), ke();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((l.f & he) !== 0)
        var _ = ht();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(U), f.delete(o);
      else {
        for (const d of f.values())
          d.reject(U);
        f.clear();
      }
      f.set(o, u);
    }
    const c = (d, h = void 0) => {
      if (_) {
        var g = h === U;
        _(g);
      }
      if (!(h === U || (l.f & M) !== 0)) {
        if (o.activate(), h)
          s.f |= z, Ae(s, h);
        else {
          (s.f & z) !== 0 && (s.f ^= z), Ae(s, d);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(U);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (d) => c(null, d || "unknown"));
  }), Tn(() => {
    for (const l of f.values())
      l.reject(U);
  }), new Promise((l) => {
    function u(o) {
      function _() {
        o === i ? l(s) : u(i);
      }
      o.then(_, _);
    }
    u(i);
  });
}
function vn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      I(
        /** @type {Effect} */
        t[n]
      );
  }
}
function pn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & M) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ue(e) {
  var t, n = p;
  L(pn(e));
  try {
    e.f &= ~ne, vn(e), t = Ot(e);
  } finally {
    L(n);
  }
  return t;
}
function _t(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Rt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (C !== null ? (Ve() || w?.is_fork) && C.set(e, n) : qe(e));
}
function gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Ut, t.ac = null, me(t, 0), Be(t));
}
function dt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Ie = /* @__PURE__ */ new Set();
const K = /* @__PURE__ */ new Map();
let vt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: rt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function q(e, t) {
  const n = Ne(e);
  return Pn(n), n;
}
function B(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (v.f & ze) !== 0) && it() && (v.f & (b | W | Le | ze)) !== 0 && (N === null || !ue.call(N, e)) && Wt();
  let r = n ? de(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? K.set(e, t) : K.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Ue(s), C === null && qe(s);
    }
    e.wv = Rt(), pt(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (G | te)) === 0 && (A === null ? Mn([e]) : A.push(e)), !i.is_fork && Ie.size > 0 && !vt && wn();
  }
  return t;
}
function wn() {
  vt = !1;
  for (const e of Ie)
    (e.f & y) !== 0 && m(e, j), ye(e) && ce(e);
  Ie.clear();
}
function mn(e, t = 1) {
  var n = V(e), r = t === 1 ? n++ : n--;
  return B(e, n), r;
}
function ge(e) {
  B(e, e.v + 1);
}
function pt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & S) === 0;
      if (l && m(a, t), (f & b) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        C?.delete(u), (f & ne) === 0 && (f & R && (a.f |= ne), pt(u, j, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & W) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ye(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Yt(e);
  if (t !== Lt && t !== qt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Pt(e), i = /* @__PURE__ */ q(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var l = v, u = ee;
    O(null), Je(s);
    var o = f();
    return O(l), Je(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Kt();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var _ = /* @__PURE__ */ q(u.value);
          return n.set(l, _), _;
        }) : B(o, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const o = a(() => /* @__PURE__ */ q(E));
            n.set(l, o), ge(i);
          }
        } else
          B(u, E), ge(i);
        return !0;
      },
      get(f, l, u) {
        if (l === De)
          return e;
        var o = n.get(l), _ = l in f;
        if (o === void 0 && (!_ || pe(f, l)?.writable) && (o = a(() => {
          var d = de(_ ? f[l] : E), h = /* @__PURE__ */ q(d);
          return h;
        }), n.set(l, o)), o !== void 0) {
          var c = V(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var o = n.get(l);
          o && (u.value = V(o));
        } else if (u === void 0) {
          var _ = n.get(l), c = _?.v;
          if (_ !== void 0 && c !== E)
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
        if (l === De)
          return !0;
        var u = n.get(l), o = u !== void 0 && u.v !== E || Reflect.has(f, l);
        if (u !== void 0 || p !== null && (!o || pe(f, l)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? de(f[l]) : E, d = /* @__PURE__ */ q(c);
            return d;
          }), n.set(l, u));
          var _ = V(u);
          if (_ === E)
            return !1;
        }
        return o;
      },
      set(f, l, u, o) {
        var _ = n.get(l), c = l in f;
        if (r && l === "length")
          for (var d = u; d < /** @type {Source<number>} */
          _.v; d += 1) {
            var h = n.get(d + "");
            h !== void 0 ? B(h, E) : d in f && (h = a(() => /* @__PURE__ */ q(E)), n.set(d + "", h));
          }
        if (_ === void 0)
          (!c || pe(f, l)?.writable) && (_ = a(() => /* @__PURE__ */ q(void 0)), B(_, de(u)), n.set(l, _));
        else {
          c = _.v !== E;
          var g = a(() => de(u));
          B(_, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, l);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof l == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(l);
            Number.isInteger(ie) && ie >= D.v && B(D, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        V(i);
        var l = Reflect.ownKeys(f).filter((_) => {
          var c = n.get(_);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        Gt();
      }
    }
  );
}
var We, gt, wt, mt;
function yn() {
  if (We === void 0) {
    We = window, gt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    wt = pe(t, "firstChild").get, mt = pe(t, "nextSibling").get, He(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), He(n) && (n.__t = void 0);
  }
}
function yt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function bt(e) {
  return (
    /** @type {TemplateNode | null} */
    wt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Et(e) {
  return (
    /** @type {TemplateNode | null} */
    mt.call(e)
  );
}
function bn(e, t) {
  return /* @__PURE__ */ bt(e);
}
function En(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Qt, e, void 0)
  );
}
function xt(e) {
  var t = v, n = p;
  O(null), L(null);
  try {
    return e();
  } finally {
    O(t), L(n);
  }
}
function xn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & $) !== 0 && (e |= $);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | S | R,
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
  if ((e & we) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw I(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & W) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && xn(i, n), v !== null && (v.f & b) !== 0 && (e & te) === 0)) {
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
function Tn(e) {
  const t = Z(Re, null);
  return m(t, y), t.teardown = e, t;
}
function Sn(e) {
  return Z(we | Ht, e);
}
function kn(e) {
  re.ensure();
  const t = Z(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      I(t), r(void 0);
    }) : (I(t), r(void 0));
  });
}
function An(e) {
  return Z(Le | _e, e);
}
function Rn(e, t = 0) {
  return Z(Re | t, e);
}
function Nn(e, t = [], n = [], r = []) {
  cn(r, t, n, (i) => {
    Z(Re, () => e(...i.map(V)));
  });
}
function On(e, t = 0) {
  var n = Z(W | t, e);
  return n;
}
function Q(e) {
  return Z(G | _e, e);
}
function Tt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    Ze(!0), O(null);
    try {
      t.call(null);
    } finally {
      Ze(n), O(r);
    }
  }
}
function Be(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && xt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : I(n, t), n = r;
  }
}
function Dn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && I(t), t = n;
  }
}
function I(e, t = !0) {
  var n = !1;
  (t || (e.f & Bt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Cn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, $e), Be(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Tt(e), e.f ^= $e, e.f |= M;
  var i = e.parent;
  i !== null && i.first !== null && St(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Cn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Et(e);
    e.remove(), e = n;
  }
}
function St(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  kt(e, r, !0);
  var i = () => {
    n && I(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function kt(e, t, n) {
  if ((e.f & $) === 0) {
    e.f ^= $;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Se) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & W) !== 0;
      kt(i, t, a ? n : !1), i = s;
    }
  }
}
function Fn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Et(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function Ze(e) {
  oe = e;
}
let v = null, F = !1;
function O(e) {
  v = e;
}
let p = null;
function L(e) {
  p = e;
}
let N = null;
function Pn(e) {
  v !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, k = 0, A = null;
function Mn(e) {
  A = e;
}
let At = 1, X = 0, ee = X;
function Je(e) {
  ee = e;
}
function Rt() {
  return ++At;
}
function ye(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & j) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && _t(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, y);
  }
  return !1;
}
function Nt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Nt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, j), Ye(
        /** @type {Effect} */
        s
      ));
    }
}
function Ot(e) {
  var t = T, n = k, r = A, i = v, s = N, a = P, f = F, l = ee, u = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, v = (u & (G | te)) === 0 ? e : null, N = null, ae(e.ctx), F = !1, ee = ++X, e.ac !== null && (xt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var o = (
      /** @type {Function} */
      e.fn
    ), _ = o();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var h;
      if (d || me(e, k), c !== null && k > 0)
        for (c.length = k + T.length, h = 0; h < T.length; h++)
          c[k + h] = T[h];
      else
        e.deps = c = T;
      if (Ve() && (e.f & R) !== 0)
        for (h = k; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !d && c !== null && k < c.length && (me(e, k), c.length = k);
    if (it() && A !== null && !F && c !== null && (e.f & (b | j | S)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      A.length; h++)
        Nt(
          A[h],
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
    return (e.f & z) !== 0 && (e.f ^= z), _;
  } catch (g) {
    return st(g);
  } finally {
    e.f ^= Pe, T = t, k = n, A = r, v = i, N = s, ae(a), F = f, ee = l;
  }
}
function In(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Mt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), qe(s), gn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      In(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & M) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (W | nt)) !== 0 ? Dn(e) : Be(e), Tt(e);
      var i = Ot(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = At;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function V(e) {
  var t = e.f, n = (t & b) !== 0;
  if (v !== null && !F) {
    var r = p !== null && (p.f & M) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = v.deps;
      if ((v.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
      }
    }
  }
  if (oe && K.has(e))
    return K.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Ct(a)) && (f = Ue(a)), K.set(a, f), f;
    }
    var l = (a.f & R) === 0 && !F && v !== null && (Te || (v.f & R) !== 0), u = (a.f & he) === 0;
    ye(a) && (l && (a.f |= R), _t(a)), l && !u && (dt(a), Dt(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & z) !== 0)
    throw e.v;
  return e.v;
}
function Dt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (dt(
        /** @type {Derived} */
        t
      ), Dt(
        /** @type {Derived} */
        t
      ));
}
function Ct(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (K.has(t) || (t.f & b) !== 0 && Ct(
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
const Qe = globalThis.Deno?.core?.ops ?? null;
function Ln(e, ...t) {
  Qe?.[e] ? Qe[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function qn(e, t) {
  Ln("op_set_text", e, t);
}
const Yn = ["touchstart", "touchmove"];
function Un(e) {
  return Yn.includes(e);
}
const ve = Symbol("events"), Ft = /* @__PURE__ */ new Set(), je = /* @__PURE__ */ new Set();
function Vn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Bn(e) {
  for (var t = 0; t < e.length; t++)
    Ft.add(e[t]);
  for (var n of je)
    n(e);
}
let Xe = null;
function et(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Xe = e;
  var a = 0, f = Xe === e && e[ve];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    jt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, _ = p;
    O(null), L(null);
    try {
      for (var c, d = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? d.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let x of d)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[ve] = t, delete e.currentTarget, O(o), L(_);
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
function $n(e) {
  return (
    /** @type {string} */
    Hn?.createHTML(e) ?? e
  );
}
function zn(e) {
  var t = En("template");
  return t.innerHTML = $n(e.replaceAll("<!>", "<!---->")), t.content;
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
  var n = (t & Jt) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = zn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ bt(r));
    var s = (
      /** @type {TemplateNode} */
      n || gt ? document.importNode(r, !0) : r.cloneNode(!0)
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
const be = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  yn();
  var l = void 0, u = kn(() => {
    var o = n ?? t.appendChild(yt());
    an(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        en({});
        var h = (
          /** @type {ComponentContext} */
          P
        );
        s && (h.c = s), i && (r.$$events = i), l = e(d, r) || {}, tn();
      },
      f
    );
    var _ = /* @__PURE__ */ new Set(), c = (d) => {
      for (var h = 0; h < d.length; h++) {
        var g = d[h];
        if (!_.has(g)) {
          _.add(g);
          var x = Un(g);
          for (const Oe of [t, document]) {
            var D = be.get(Oe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), be.set(Oe, D));
            var ie = D.get(g);
            ie === void 0 ? (Oe.addEventListener(g, et, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(It(Ft)), je.add(c), () => {
      for (var d of _)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            h.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, et), h.delete(d), h.size === 0 && be.delete(x)) : h.set(d, g);
        }
      je.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(l, u), l;
}
let Qn = /* @__PURE__ */ new WeakMap();
var Xn = /* @__PURE__ */ Gn("<button> </button>");
function er(e) {
  let t = /* @__PURE__ */ q(0);
  function n() {
    mn(t);
  }
  var r = Xn(), i = bn(r);
  Nn(() => qn(i, `Count: ${V(t) ?? ""}`)), Vn("click", r, n), Wn(e, r);
}
Bn(["click"]);
function nr(e) {
  return Zn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

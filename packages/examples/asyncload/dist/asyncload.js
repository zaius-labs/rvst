var St = Array.isArray, an = Array.prototype.indexOf, ge = Array.prototype.includes, Ke = Array.from, on = Object.defineProperty, Fe = Object.getOwnPropertyDescriptor, cn = Object.prototype, hn = Array.prototype, vn = Object.getPrototypeOf, ht = Object.isExtensible;
const dn = () => {
};
function _n(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function At() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Oe = 4, $e = 8, Rt = 1 << 24, ie = 16, G = 32, oe = 64, Je = 128, L = 512, x = 1024, C = 2048, K = 4096, D = 8192, Y = 16384, Te = 32768, vt = 1 << 25, we = 65536, dt = 1 << 17, pn = 1 << 18, ke = 1 << 19, gn = 1 << 20, Z = 1 << 25, ce = 65536, Qe = 1 << 21, rt = 1 << 22, te = 1 << 23, We = Symbol("$state"), X = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function wn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function mn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function yn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function bn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Tn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const kn = 1, Sn = 2, An = 16, Rn = 1, Cn = 2, k = Symbol(), Mn = "http://www.w3.org/1999/xhtml";
function Nn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Ct(e) {
  return e === this.v;
}
function Fn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Mt(e) {
  return !Fn(e, this.v);
}
let U = null;
function me(e) {
  U = e;
}
function Dn(e, t = !1, n) {
  U = {
    p: U,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      w
    ),
    l: null
  };
}
function On(e) {
  var t = (
    /** @type {ComponentContext} */
    U
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      ir(r);
  }
  return t.i = !0, U = t.p, /** @type {T} */
  {};
}
function Nt() {
  return !0;
}
let de = [];
function Pn() {
  var e = de;
  de = [], _n(e);
}
function pe(e) {
  if (de.length === 0) {
    var t = de;
    queueMicrotask(() => {
      t === de && Pn();
    });
  }
  de.push(e);
}
function Ft(e) {
  var t = w;
  if (t === null)
    return p.f |= te, e;
  if ((t.f & Te) === 0 && (t.f & Oe) === 0)
    throw e;
  ee(e, t);
}
function ee(e, t) {
  for (; t !== null; ) {
    if ((t.f & Je) !== 0) {
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
const In = -7169;
function E(e, t) {
  e.f = e.f & In | t;
}
function it(e) {
  (e.f & L) !== 0 || e.deps === null ? E(e, x) : E(e, K);
}
function Dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & ce) === 0 || (t.f ^= ce, Dt(
        /** @type {Derived} */
        t.deps
      ));
}
function Ot(e, t, n) {
  (e.f & C) !== 0 ? t.add(e) : (e.f & K) !== 0 && n.add(e), Dt(e.deps), E(e, x);
}
const le = /* @__PURE__ */ new Set();
let y = null, H = null, et = null, Xe = !1, _e = null, Ve = null;
var _t = 0;
let Ln = 1;
class re {
  // for debugging. TODO remove once async is stable
  id = Ln++;
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
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #u = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #t = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #l = 0;
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
  #a = !1;
  #o() {
    return this.is_fork || this.#l > 0;
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
        E(r, C), this.schedule(r);
      for (r of n.m)
        E(r, K), this.schedule(r);
    }
  }
  #h() {
    if (_t++ > 1e3 && (le.delete(this), qn()), !this.#o()) {
      for (const f of this.#i)
        this.#s.delete(f), E(f, C), this.schedule(f);
      for (const f of this.#s)
        E(f, K), this.schedule(f);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = _e = [], r = [], i = Ve = [];
    for (const f of t)
      try {
        this.#v(f, n, r);
      } catch (l) {
        throw qt(f), l;
      }
    if (y = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (_e = null, Ve = null, this.#o()) {
      this.#d(r), this.#d(n);
      for (const [f, l] of this.#f)
        Lt(f, l);
    } else {
      this.#t === 0 && le.delete(this), this.#i.clear(), this.#s.clear();
      for (const f of this.#e) f(this);
      this.#e.clear(), pt(r), pt(n), this.#r?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      y
    );
    if (this.#n.length > 0) {
      const f = u ??= this;
      f.#n.push(...this.#n.filter((l) => !f.#n.includes(l)));
    }
    u !== null && (le.add(u), u.#h()), le.has(this) || this.#c();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #v(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var s = i.f, u = (s & (G | oe)) !== 0, f = u && (s & x) !== 0, l = f || (s & D) !== 0 || this.#f.has(i);
      if (!l && i.fn !== null) {
        u ? i.f ^= x : (s & Oe) !== 0 ? n.push(i) : Le(i) && ((s & ie) !== 0 && this.#s.add(i), xe(i));
        var a = i.first;
        if (a !== null) {
          i = a;
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
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      Ot(t[n], this.#i, this.#s);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & te) === 0 && (this.current.set(t, t.v), H?.set(t, t.v));
  }
  activate() {
    y = this;
  }
  deactivate() {
    y = null, H = null;
  }
  flush() {
    try {
      Xe = !0, y = this, this.#h();
    } finally {
      _t = 0, et = null, _e = null, Ve = null, Xe = !1, y = null, H = null, ne.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), le.delete(this);
  }
  #c() {
    for (const l of le) {
      var t = l.id < this.id, n = [];
      for (const [a, c] of this.current) {
        if (l.current.has(a))
          if (t && c !== l.current.get(a))
            l.current.set(a, c);
          else
            continue;
        n.push(a);
      }
      var r = [...l.current.keys()].filter((a) => !this.current.has(a));
      if (r.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
        for (var u of n)
          Pt(u, r, i, s);
        if (l.#n.length > 0) {
          l.apply();
          for (var f of l.#n)
            l.#v(f, [], []);
          l.#n = [];
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
    this.#t += 1, t && (this.#l += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#t -= 1, t && (this.#l -= 1), !(this.#a || n) && (this.#a = !0, pe(() => {
      this.#a = !1, this.flush();
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
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#u.add(t);
  }
  settled() {
    return (this.#r ??= At()).promise;
  }
  static ensure() {
    if (y === null) {
      const t = y = new re();
      Xe || (le.add(y), pe(() => {
        y === t && t.flush();
      }));
    }
    return y;
  }
  apply() {
    {
      H = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (et = t, t.b?.is_pending && (t.f & (Oe | $e | Rt)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === w && (p === null || (p.f & T) === 0))
        return;
      if ((r & (oe | G)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#n.push(n);
  }
}
function qn() {
  try {
    yn();
  } catch (e) {
    ee(e, et);
  }
}
let W = null;
function pt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Y | D)) === 0 && Le(r) && (W = /* @__PURE__ */ new Set(), xe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Zt(r), W?.size > 0)) {
        ne.clear();
        for (const i of W) {
          if ((i.f & (Y | D)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            W.has(u) && (W.delete(u), s.push(u)), u = u.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (Y | D)) === 0 && xe(l);
          }
        }
        W.clear();
      }
    }
    W = null;
  }
}
function Pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & T) !== 0 ? Pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (rt | ie)) !== 0 && (s & C) === 0 && It(i, t, r) && (E(i, C), st(
        /** @type {Effect} */
        i
      ));
    }
}
function It(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ge.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && It(
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
function st(e) {
  y.schedule(e);
}
function Lt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & x) !== 0)) {
    (e.f & C) !== 0 ? t.d.push(e) : (e.f & K) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Lt(n, t), n = n.next;
  }
}
function qt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    qt(t), t = t.next;
}
function zn(e) {
  let t = 0, n = he(0), r;
  return () => {
    ft() && (S(n), fr(() => (t === 0 && (r = vr(() => e(() => De(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, De(n));
      });
    })));
  };
}
var jn = we | ke;
function Bn(e, t, n, r) {
  new Hn(e, t, n, r);
}
class Hn {
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
  #u = null;
  /** @type {BoundaryProps} */
  #t;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #a = 0;
  #o = 0;
  #h = !1;
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #c = null;
  #m = zn(() => (this.#c = he(this.#a), () => {
    this.#c = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#e = t, this.#t = n, this.#l = (s) => {
      var u = (
        /** @type {Effect} */
        w
      );
      u.b = this, u.f |= Je, r(s);
    }, this.parent = /** @type {Effect} */
    w.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = ut(() => {
      this.#g();
    }, jn);
  }
  #y() {
    try {
      this.#n = P(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#t.failed;
    n && (this.#s = P(() => {
      n(
        this.#e,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#t.pending;
    t && (this.is_pending = !0, this.#i = P(() => t(this.#e)), pe(() => {
      var n = this.#f = document.createDocumentFragment(), r = be();
      n.append(r), this.#n = this.#p(() => P(() => this.#l(r))), this.#o === 0 && (this.#e.before(n), this.#f = null, ue(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#_(
        /** @type {Batch} */
        y
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#a = 0, this.#n = P(() => {
        this.#l(this.#e);
      }), this.#o > 0) {
        var t = this.#f = document.createDocumentFragment();
        ct(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#i = P(() => n(this.#e));
      } else
        this.#_(
          /** @type {Batch} */
          y
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #_(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    Ot(t, this.#v, this.#d);
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
  #p(t) {
    var n = w, r = p, i = U;
    $(this.#r), z(this.#r), me(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return Ft(s), null;
    } finally {
      $(n), z(r), me(i);
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
    this.#o += t, this.#o === 0 && (this.#_(n), this.#i && ue(this.#i, () => {
      this.#i = null;
    }), this.#f && (this.#e.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#w(t, n), this.#a += t, !(!this.#c || this.#h) && (this.#h = !0, pe(() => {
      this.#h = !1, this.#c && ye(this.#c, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#m(), S(
      /** @type {Source<number>} */
      this.#c
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#t.onerror;
    let r = this.#t.failed;
    if (!n && !r)
      throw t;
    this.#n && (N(this.#n), this.#n = null), this.#i && (N(this.#i), this.#i = null), this.#s && (N(this.#s), this.#s = null);
    var i = !1, s = !1;
    const u = () => {
      if (i) {
        Nn();
        return;
      }
      i = !0, s && Tn(), this.#s !== null && ue(this.#s, () => {
        this.#s = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, u), s = !1;
      } catch (a) {
        ee(a, this.#r && this.#r.parent);
      }
      r && (this.#s = this.#p(() => {
        try {
          return P(() => {
            var a = (
              /** @type {Effect} */
              w
            );
            a.b = this, a.f |= Je, r(
              this.#e,
              () => l,
              () => u
            );
          });
        } catch (a) {
          return ee(
            a,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    pe(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (a) {
        ee(a, this.#r && this.#r.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        f,
        /** @param {unknown} e */
        (a) => ee(a, this.#r && this.#r.parent)
      ) : f(l);
    });
  }
}
function Vn(e, t, n, r) {
  const i = jt;
  var s = e.filter((h) => !h.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    w
  ), f = Yn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((h) => h.promise)) : null;
  function a(h) {
    f();
    try {
      r(h);
    } catch (d) {
      (u.f & Y) === 0 && ee(d, u);
    }
    Ue();
  }
  if (n.length === 0) {
    l.then(() => a(t.map(i)));
    return;
  }
  var c = zt();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Un(h))).then((h) => a([...t.map(i), ...h])).catch((h) => ee(h, u)).finally(() => c());
  }
  l ? l.then(() => {
    f(), v(), Ue();
  }) : v();
}
function Yn() {
  var e = (
    /** @type {Effect} */
    w
  ), t = p, n = U, r = (
    /** @type {Batch} */
    y
  );
  return function(s = !0) {
    $(e), z(t), me(n), s && (e.f & Y) === 0 && (r?.activate(), r?.apply());
  };
}
function Ue(e = !0) {
  $(null), z(null), me(null), e && y?.deactivate();
}
function zt() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    w.b
  ), t = (
    /** @type {Batch} */
    y
  ), n = e.is_rendered();
  return e.update_pending_count(1, t), t.increment(n), (r = !1) => {
    e.update_pending_count(-1, t), t.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function jt(e) {
  var t = T | C, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return w !== null && (w.f |= ke), {
    ctx: U,
    deps: null,
    effects: null,
    equals: Ct,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      k
    ),
    wv: 0,
    parent: n ?? w,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Un(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    w
  );
  r === null && wn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = he(
    /** @type {V} */
    k
  ), u = !p, f = /* @__PURE__ */ new Map();
  return lr(() => {
    var l = (
      /** @type {Effect} */
      w
    ), a = At();
    i = a.promise;
    try {
      Promise.resolve(e()).then(a.resolve, a.reject).finally(Ue);
    } catch (d) {
      a.reject(d), Ue();
    }
    var c = (
      /** @type {Batch} */
      y
    );
    if (u) {
      if ((l.f & Te) !== 0)
        var v = zt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(X), f.delete(c);
      else {
        for (const d of f.values())
          d.reject(X);
        f.clear();
      }
      f.set(c, a);
    }
    const h = (d, o = void 0) => {
      if (v) {
        var _ = o === X;
        v(_);
      }
      if (!(o === X || (l.f & Y) !== 0)) {
        if (c.activate(), o)
          s.f |= te, ye(s, o);
        else {
          (s.f & te) !== 0 && (s.f ^= te), ye(s, d);
          for (const [m, g] of f) {
            if (f.delete(m), m === c) break;
            g.reject(X);
          }
        }
        c.deactivate();
      }
    };
    a.promise.then(h, (d) => h(null, d || "unknown"));
  }), rr(() => {
    for (const l of f.values())
      l.reject(X);
  }), new Promise((l) => {
    function a(c) {
      function v() {
        c === i ? l(s) : a(i);
      }
      c.then(v, v);
    }
    a(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Gn(e) {
  const t = /* @__PURE__ */ jt(e);
  return t.equals = Mt, t;
}
function Kn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      N(
        /** @type {Effect} */
        t[n]
      );
  }
}
function $n(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & Y) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function lt(e) {
  var t, n = w;
  $($n(e));
  try {
    e.f &= ~ce, Kn(e), t = rn(e);
  } finally {
    $(n);
  }
  return t;
}
function Bt(e) {
  var t = e.v, n = lt(e);
  if (!e.equals(n) && (e.wv = tn(), (!y?.is_fork || e.deps === null) && (e.v = n, y?.capture(e, t), e.deps === null))) {
    E(e, x);
    return;
  }
  Ee || (H !== null ? (ft() || y?.is_fork) && H.set(e, n) : it(e));
}
function Wn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(X), t.teardown = dn, t.ac = null, Pe(t, 0), at(t));
}
function Ht(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && xe(t);
}
let tt = /* @__PURE__ */ new Set();
const ne = /* @__PURE__ */ new Map();
let Vt = !1;
function he(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ct,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function B(e, t) {
  const n = he(e);
  return or(n), n;
}
// @__NO_SIDE_EFFECTS__
function Xn(e, t = !1, n = !0) {
  const r = he(e);
  return t || (r.equals = Mt), r;
}
function I(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!V || (p.f & dt) !== 0) && Nt() && (p.f & (T | ie | rt | dt)) !== 0 && (q === null || !ge.call(q, e)) && xn();
  let r = n ? Me(t) : t;
  return ye(e, r, Ve);
}
function ye(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ee ? ne.set(e, t) : ne.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & C) !== 0 && lt(s), H === null && it(s);
    }
    e.wv = tn(), Yt(e, C, n), w !== null && (w.f & x) !== 0 && (w.f & (G | oe)) === 0 && (O === null ? cr([e]) : O.push(e)), !i.is_fork && tt.size > 0 && !Vt && Zn();
  }
  return t;
}
function Zn() {
  Vt = !1;
  for (const e of tt)
    (e.f & x) !== 0 && E(e, K), Le(e) && xe(e);
  tt.clear();
}
function De(e) {
  I(e, e.v + 1);
}
function Yt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], f = u.f, l = (f & C) === 0;
      if (l && E(u, t), (f & T) !== 0) {
        var a = (
          /** @type {Derived} */
          u
        );
        H?.delete(a), (f & ce) === 0 && (f & L && (u.f |= ce), Yt(a, K, n));
      } else if (l) {
        var c = (
          /** @type {Effect} */
          u
        );
        (f & ie) !== 0 && W !== null && W.add(c), n !== null ? n.push(c) : st(c);
      }
    }
}
function Me(e) {
  if (typeof e != "object" || e === null || We in e)
    return e;
  const t = vn(e);
  if (t !== cn && t !== hn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = St(e), i = /* @__PURE__ */ B(0), s = ae, u = (f) => {
    if (ae === s)
      return f();
    var l = p, a = ae;
    z(null), mt(s);
    var c = f();
    return z(l), mt(a), c;
  };
  return r && n.set("length", /* @__PURE__ */ B(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, a) {
        (!("value" in a) || a.configurable === !1 || a.enumerable === !1 || a.writable === !1) && bn();
        var c = n.get(l);
        return c === void 0 ? u(() => {
          var v = /* @__PURE__ */ B(a.value);
          return n.set(l, v), v;
        }) : I(c, a.value, !0), !0;
      },
      deleteProperty(f, l) {
        var a = n.get(l);
        if (a === void 0) {
          if (l in f) {
            const c = u(() => /* @__PURE__ */ B(k));
            n.set(l, c), De(i);
          }
        } else
          I(a, k), De(i);
        return !0;
      },
      get(f, l, a) {
        if (l === We)
          return e;
        var c = n.get(l), v = l in f;
        if (c === void 0 && (!v || Fe(f, l)?.writable) && (c = u(() => {
          var d = Me(v ? f[l] : k), o = /* @__PURE__ */ B(d);
          return o;
        }), n.set(l, c)), c !== void 0) {
          var h = S(c);
          return h === k ? void 0 : h;
        }
        return Reflect.get(f, l, a);
      },
      getOwnPropertyDescriptor(f, l) {
        var a = Reflect.getOwnPropertyDescriptor(f, l);
        if (a && "value" in a) {
          var c = n.get(l);
          c && (a.value = S(c));
        } else if (a === void 0) {
          var v = n.get(l), h = v?.v;
          if (v !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return a;
      },
      has(f, l) {
        if (l === We)
          return !0;
        var a = n.get(l), c = a !== void 0 && a.v !== k || Reflect.has(f, l);
        if (a !== void 0 || w !== null && (!c || Fe(f, l)?.writable)) {
          a === void 0 && (a = u(() => {
            var h = c ? Me(f[l]) : k, d = /* @__PURE__ */ B(h);
            return d;
          }), n.set(l, a));
          var v = S(a);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(f, l, a, c) {
        var v = n.get(l), h = l in f;
        if (r && l === "length")
          for (var d = a; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var o = n.get(d + "");
            o !== void 0 ? I(o, k) : d in f && (o = u(() => /* @__PURE__ */ B(k)), n.set(d + "", o));
          }
        if (v === void 0)
          (!h || Fe(f, l)?.writable) && (v = u(() => /* @__PURE__ */ B(void 0)), I(v, Me(a)), n.set(l, v));
        else {
          h = v.v !== k;
          var _ = u(() => Me(a));
          I(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(f, l);
        if (m?.set && m.set.call(c, a), !h) {
          if (r && typeof l == "string") {
            var g = (
              /** @type {Source<number>} */
              n.get("length")
            ), b = Number(l);
            Number.isInteger(b) && b >= g.v && I(g, b + 1);
          }
          De(i);
        }
        return !0;
      },
      ownKeys(f) {
        S(i);
        var l = Reflect.ownKeys(f).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [a, c] of n)
          c.v !== k && !(a in f) && l.push(a);
        return l;
      },
      setPrototypeOf() {
        En();
      }
    }
  );
}
var gt, Ut, Gt, Kt;
function Jn() {
  if (gt === void 0) {
    gt = window, Ut = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Gt = Fe(t, "firstChild").get, Kt = Fe(t, "nextSibling").get, ht(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ht(n) && (n.__t = void 0);
  }
}
function be(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ge(e) {
  return (
    /** @type {TemplateNode | null} */
    Gt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ie(e) {
  return (
    /** @type {TemplateNode | null} */
    Kt.call(e)
  );
}
function Ae(e, t) {
  return /* @__PURE__ */ Ge(e);
}
function Qn(e, t = !1) {
  {
    var n = /* @__PURE__ */ Ge(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Ie(n) : n;
  }
}
function Ze(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ie(r);
  return r;
}
function er(e) {
  e.textContent = "";
}
function $t() {
  return !1;
}
function tr(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Mn, e, void 0)
  );
}
function Wt(e) {
  var t = p, n = w;
  z(null), $(null);
  try {
    return e();
  } finally {
    z(t), $(n);
  }
}
function nr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function se(e, t) {
  var n = w;
  n !== null && (n.f & D) !== 0 && (e |= D);
  var r = {
    ctx: U,
    deps: null,
    nodes: null,
    f: e | C | L,
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
  if ((e & Oe) !== 0)
    _e !== null ? _e.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      xe(r);
    } catch (u) {
      throw N(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ke) === 0 && (i = i.first, (e & ie) !== 0 && (e & we) !== 0 && i !== null && (i.f |= we));
  }
  if (i !== null && (i.parent = n, n !== null && nr(i, n), p !== null && (p.f & T) !== 0 && (e & oe) === 0)) {
    var s = (
      /** @type {Derived} */
      p
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function ft() {
  return p !== null && !V;
}
function rr(e) {
  const t = se($e, null);
  return E(t, x), t.teardown = e, t;
}
function ir(e) {
  return se(Oe | gn, e);
}
function sr(e) {
  re.ensure();
  const t = se(oe | ke, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ue(t, () => {
      N(t), r(void 0);
    }) : (N(t), r(void 0));
  });
}
function lr(e) {
  return se(rt | ke, e);
}
function fr(e, t = 0) {
  return se($e | t, e);
}
function ze(e, t = [], n = [], r = []) {
  Vn(r, t, n, (i) => {
    se($e, () => e(...i.map(S)));
  });
}
function ut(e, t = 0) {
  var n = se(ie | t, e);
  return n;
}
function P(e) {
  return se(G | ke, e);
}
function Xt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ee, r = p;
    wt(!0), z(null);
    try {
      t.call(null);
    } finally {
      wt(n), z(r);
    }
  }
}
function at(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Wt(() => {
      i.abort(X);
    });
    var r = n.next;
    (n.f & oe) !== 0 ? n.parent = null : N(n, t), n = r;
  }
}
function ur(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && N(t), t = n;
  }
}
function N(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ar(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, vt), at(e, t && !n), Pe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Xt(e), e.f ^= vt, e.f |= Y;
  var i = e.parent;
  i !== null && i.first !== null && Zt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function ar(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ie(e);
    e.remove(), e = n;
  }
}
function Zt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ue(e, t, n = !0) {
  var r = [];
  Jt(e, r, !0);
  var i = () => {
    n && N(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var f of r)
      f.out(u);
  } else
    i();
}
function Jt(e, t, n) {
  if ((e.f & D) === 0) {
    e.f ^= D;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & we) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & ie) !== 0;
      Jt(i, t, u ? n : !1), i = s;
    }
  }
}
function ot(e) {
  Qt(e, !0);
}
function Qt(e, t) {
  if ((e.f & D) !== 0) {
    e.f ^= D, (e.f & x) === 0 && (E(e, C), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & we) !== 0 || (n.f & G) !== 0;
      Qt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function ct(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ie(n);
      t.append(n), n = i;
    }
}
let Ye = !1, Ee = !1;
function wt(e) {
  Ee = e;
}
let p = null, V = !1;
function z(e) {
  p = e;
}
let w = null;
function $(e) {
  w = e;
}
let q = null;
function or(e) {
  p !== null && (q === null ? q = [e] : q.push(e));
}
let M = null, F = 0, O = null;
function cr(e) {
  O = e;
}
let en = 1, fe = 0, ae = fe;
function mt(e) {
  ae = e;
}
function tn() {
  return ++en;
}
function Le(e) {
  var t = e.f;
  if ((t & C) !== 0)
    return !0;
  if (t & T && (e.f &= ~ce), (t & K) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Le(
        /** @type {Derived} */
        s
      ) && Bt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & L) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    H === null && E(e, x);
  }
  return !1;
}
function nn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(q !== null && ge.call(q, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & T) !== 0 ? nn(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? E(s, C) : (s.f & x) !== 0 && E(s, K), st(
        /** @type {Effect} */
        s
      ));
    }
}
function rn(e) {
  var t = M, n = F, r = O, i = p, s = q, u = U, f = V, l = ae, a = e.f;
  M = /** @type {null | Value[]} */
  null, F = 0, O = null, p = (a & (G | oe)) === 0 ? e : null, q = null, me(e.ctx), V = !1, ae = ++fe, e.ac !== null && (Wt(() => {
    e.ac.abort(X);
  }), e.ac = null);
  try {
    e.f |= Qe;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= Te;
    var h = e.deps, d = y?.is_fork;
    if (M !== null) {
      var o;
      if (d || Pe(e, F), h !== null && F > 0)
        for (h.length = F + M.length, o = 0; o < M.length; o++)
          h[F + o] = M[o];
      else
        e.deps = h = M;
      if (ft() && (e.f & L) !== 0)
        for (o = F; o < h.length; o++)
          (h[o].reactions ??= []).push(e);
    } else !d && h !== null && F < h.length && (Pe(e, F), h.length = F);
    if (Nt() && O !== null && !V && h !== null && (e.f & (T | K | C)) === 0)
      for (o = 0; o < /** @type {Source[]} */
      O.length; o++)
        nn(
          O[o],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (fe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = fe;
      if (t !== null)
        for (const _ of t)
          _.rv = fe;
      O !== null && (r === null ? r = O : r.push(.../** @type {Source[]} */
      O));
    }
    return (e.f & te) !== 0 && (e.f ^= te), v;
  } catch (_) {
    return Ft(_);
  } finally {
    e.f ^= Qe, M = t, F = n, O = r, p = i, q = s, me(u), V = f, ae = l;
  }
}
function hr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = an.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (M === null || !ge.call(M, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & L) !== 0 && (s.f ^= L, s.f &= ~ce), it(s), Wn(s), Pe(s, 0);
  }
}
function Pe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      hr(e, n[r]);
}
function xe(e) {
  var t = e.f;
  if ((t & Y) === 0) {
    E(e, x);
    var n = w, r = Ye;
    w = e, Ye = !0;
    try {
      (t & (ie | Rt)) !== 0 ? ur(e) : at(e), Xt(e);
      var i = rn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = en;
      var s;
    } finally {
      Ye = r, w = n;
    }
  }
}
function S(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !V) {
    var r = w !== null && (w.f & Y) !== 0;
    if (!r && (q === null || !ge.call(q, e))) {
      var i = p.deps;
      if ((p.f & Qe) !== 0)
        e.rv < fe && (e.rv = fe, M === null && i !== null && i[F] === e ? F++ : M === null ? M = [e] : M.push(e));
      else {
        (p.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [p] : ge.call(s, p) || s.push(p);
      }
    }
  }
  if (Ee && ne.has(e))
    return ne.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (Ee) {
      var f = u.v;
      return ((u.f & x) === 0 && u.reactions !== null || ln(u)) && (f = lt(u)), ne.set(u, f), f;
    }
    var l = (u.f & L) === 0 && !V && p !== null && (Ye || (p.f & L) !== 0), a = (u.f & Te) === 0;
    Le(u) && (l && (u.f |= L), Bt(u)), l && !a && (Ht(u), sn(u));
  }
  if (H?.has(e))
    return H.get(e);
  if ((e.f & te) !== 0)
    throw e.v;
  return e.v;
}
function sn(e) {
  if (e.f |= L, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & L) === 0 && (Ht(
        /** @type {Derived} */
        t
      ), sn(
        /** @type {Derived} */
        t
      ));
}
function ln(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ne.has(t) || (t.f & T) !== 0 && ln(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function vr(e) {
  var t = V;
  try {
    return V = !0, e();
  } finally {
    V = t;
  }
}
const yt = globalThis.Deno?.core?.ops ?? null;
function dr(e, ...t) {
  yt?.[e] ? yt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function je(e, t) {
  dr("op_set_text", e, t);
}
const _r = ["touchstart", "touchmove"];
function pr(e) {
  return _r.includes(e);
}
const Be = Symbol("events"), gr = /* @__PURE__ */ new Set(), bt = /* @__PURE__ */ new Set();
let Et = null;
function xt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Et = e;
  var u = 0, f = Et === e && e[Be];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Be] = t;
      return;
    }
    var a = i.indexOf(t);
    if (a === -1)
      return;
    l <= a && (u = l);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    on(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var c = p, v = w;
    z(null), $(null);
    try {
      for (var h, d = []; s !== null; ) {
        var o = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var _ = s[Be]?.[r];
          _ != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && _.call(s, e);
        } catch (m) {
          h ? d.push(m) : h = m;
        }
        if (e.cancelBubble || o === t || o === null)
          break;
        s = o;
      }
      if (h) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Be] = t, delete e.currentTarget, z(c), $(v);
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
function yr(e) {
  var t = tr("template");
  return t.innerHTML = mr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Tt(e, t) {
  var n = (
    /** @type {Effect} */
    w
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function qe(e, t) {
  var n = (t & Rn) !== 0, r = (t & Cn) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = yr(s ? e : "<!>" + e), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Ge(i)));
    var u = (
      /** @type {TemplateNode} */
      r || Ut ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ge(u)
      ), l = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      Tt(f, l);
    } else
      Tt(u, u);
    return u;
  };
}
function Re(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function br(e, t) {
  return Er(e, t);
}
const He = /* @__PURE__ */ new Map();
function Er(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: f }) {
  Jn();
  var l = void 0, a = sr(() => {
    var c = n ?? t.appendChild(be());
    Bn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Dn({});
        var o = (
          /** @type {ComponentContext} */
          U
        );
        s && (o.c = s), i && (r.$$events = i), l = e(d, r) || {}, On();
      },
      f
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var o = 0; o < d.length; o++) {
        var _ = d[o];
        if (!v.has(_)) {
          v.add(_);
          var m = pr(_);
          for (const A of [t, document]) {
            var g = He.get(A);
            g === void 0 && (g = /* @__PURE__ */ new Map(), He.set(A, g));
            var b = g.get(_);
            b === void 0 ? (A.addEventListener(_, xt, { passive: m }), g.set(_, 1)) : g.set(_, b + 1);
          }
        }
      }
    };
    return h(Ke(gr)), bt.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var o = (
            /** @type {Map<string, number>} */
            He.get(m)
          ), _ = (
            /** @type {number} */
            o.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, xt), o.delete(d), o.size === 0 && He.delete(m)) : o.set(d, _);
        }
      bt.delete(h), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return xr.set(l, a), l;
}
let xr = /* @__PURE__ */ new WeakMap();
class Tr {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #e = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #u = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #t = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #r = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#r = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#u.get(n);
      if (r)
        ot(r), this.#l.delete(n);
      else {
        var i = this.#t.get(n);
        i && (this.#u.set(n, i.effect), this.#t.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#e) {
        if (this.#e.delete(s), s === t)
          break;
        const f = this.#t.get(u);
        f && (N(f.effect), this.#t.delete(u));
      }
      for (const [s, u] of this.#u) {
        if (s === n || this.#l.has(s)) continue;
        const f = () => {
          if (Array.from(this.#e.values()).includes(s)) {
            var a = document.createDocumentFragment();
            ct(u, a), a.append(be()), this.#t.set(s, { effect: u, fragment: a });
          } else
            N(u);
          this.#l.delete(s), this.#u.delete(s);
        };
        this.#r || !r ? (this.#l.add(s), ue(u, f, !1)) : f();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #i = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [r, i] of this.#t)
      n.includes(r) || (N(i.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      y
    ), i = $t();
    if (n && !this.#u.has(t) && !this.#t.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = be();
        s.append(u), this.#t.set(t, {
          effect: P(() => n(u)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          P(() => n(this.anchor))
        );
    if (this.#e.set(r, t), i) {
      for (const [f, l] of this.#u)
        f === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [f, l] of this.#t)
        f === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(this.#n), r.ondiscard(this.#i);
    } else
      this.#n(r);
  }
}
function kr(e, t, n = !1) {
  var r = new Tr(e), i = n ? we : 0;
  function s(u, f) {
    r.ensure(u, f);
  }
  ut(() => {
    var u = !1;
    t((f, l = 0) => {
      u = !0, s(l, f);
    }), u || s(-1, null);
  }, i);
}
function Sr(e, t) {
  return t;
}
function Ar(e, t, n) {
  for (var r = [], i = t.length, s, u = t.length, f = 0; f < i; f++) {
    let v = t[f];
    ue(
      v,
      () => {
        if (s) {
          if (s.pending.delete(v), s.done.add(v), s.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            nt(e, Ke(s.done)), h.delete(s), h.size === 0 && (e.outrogroups = null);
          }
        } else
          u -= 1;
      },
      !1
    );
  }
  if (u === 0) {
    var l = r.length === 0 && n !== null;
    if (l) {
      var a = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        a.parentNode
      );
      er(c), c.append(a), e.items.clear();
    }
    nt(e, t, !l);
  } else
    s = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(s);
}
function nt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const u of e.pending.values())
      for (const f of u)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= Z;
      const u = document.createDocumentFragment();
      ct(s, u);
    } else
      N(t[i], n);
  }
}
var kt;
function Rr(e, t, n, r, i, s = null) {
  var u = e, f = /* @__PURE__ */ new Map(), l = null, a = /* @__PURE__ */ Gn(() => {
    var g = n();
    return St(g) ? g : g == null ? [] : Ke(g);
  }), c, v = /* @__PURE__ */ new Map(), h = !0;
  function d(g) {
    (m.effect.f & Y) === 0 && (m.pending.delete(g), m.fallback = l, Cr(m, c, u, t, r), l !== null && (c.length === 0 ? (l.f & Z) === 0 ? ot(l) : (l.f ^= Z, Ne(l, null, u)) : ue(l, () => {
      l = null;
    })));
  }
  function o(g) {
    m.pending.delete(g);
  }
  var _ = ut(() => {
    c = /** @type {V[]} */
    S(a);
    for (var g = c.length, b = /* @__PURE__ */ new Set(), A = (
      /** @type {Batch} */
      y
    ), J = $t(), j = 0; j < g; j += 1) {
      var Se = c[j], ve = r(Se, j), R = h ? null : f.get(ve);
      R ? (R.v && ye(R.v, Se), R.i && ye(R.i, j), J && A.unskip_effect(R.e)) : (R = Mr(
        f,
        h ? u : kt ??= be(),
        Se,
        ve,
        j,
        i,
        t,
        n
      ), h || (R.e.f |= Z), f.set(ve, R)), b.add(ve);
    }
    if (g === 0 && s && !l && (h ? l = P(() => s(u)) : (l = P(() => s(kt ??= be())), l.f |= Z)), g > b.size && mn(), !h)
      if (v.set(A, b), J) {
        for (const [fn, un] of f)
          b.has(fn) || A.skip_effect(un.e);
        A.oncommit(d), A.ondiscard(o);
      } else
        d(A);
    S(a);
  }), m = { effect: _, items: f, pending: v, outrogroups: null, fallback: l };
  h = !1;
}
function Ce(e) {
  for (; e !== null && (e.f & G) === 0; )
    e = e.next;
  return e;
}
function Cr(e, t, n, r, i) {
  var s = t.length, u = e.items, f = Ce(e.effect.first), l, a = null, c = [], v = [], h, d, o, _;
  for (_ = 0; _ < s; _ += 1) {
    if (h = t[_], d = i(h, _), o = /** @type {EachItem} */
    u.get(d).e, e.outrogroups !== null)
      for (const R of e.outrogroups)
        R.pending.delete(o), R.done.delete(o);
    if ((o.f & D) !== 0 && ot(o), (o.f & Z) !== 0)
      if (o.f ^= Z, o === f)
        Ne(o, null, n);
      else {
        var m = a ? a.next : f;
        o === e.effect.last && (e.effect.last = o.prev), o.prev && (o.prev.next = o.next), o.next && (o.next.prev = o.prev), Q(e, a, o), Q(e, o, m), Ne(o, m, n), a = o, c = [], v = [], f = Ce(a.next);
        continue;
      }
    if (o !== f) {
      if (l !== void 0 && l.has(o)) {
        if (c.length < v.length) {
          var g = v[0], b;
          a = g.prev;
          var A = c[0], J = c[c.length - 1];
          for (b = 0; b < c.length; b += 1)
            Ne(c[b], g, n);
          for (b = 0; b < v.length; b += 1)
            l.delete(v[b]);
          Q(e, A.prev, J.next), Q(e, a, A), Q(e, J, g), f = g, a = J, _ -= 1, c = [], v = [];
        } else
          l.delete(o), Ne(o, f, n), Q(e, o.prev, o.next), Q(e, o, a === null ? e.effect.first : a.next), Q(e, a, o), a = o;
        continue;
      }
      for (c = [], v = []; f !== null && f !== o; )
        (l ??= /* @__PURE__ */ new Set()).add(f), v.push(f), f = Ce(f.next);
      if (f === null)
        continue;
    }
    (o.f & Z) === 0 && c.push(o), a = o, f = Ce(o.next);
  }
  if (e.outrogroups !== null) {
    for (const R of e.outrogroups)
      R.pending.size === 0 && (nt(e, Ke(R.done)), e.outrogroups?.delete(R));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || l !== void 0) {
    var j = [];
    if (l !== void 0)
      for (o of l)
        (o.f & D) === 0 && j.push(o);
    for (; f !== null; )
      (f.f & D) === 0 && f !== e.fallback && j.push(f), f = Ce(f.next);
    var Se = j.length;
    if (Se > 0) {
      var ve = null;
      Ar(e, j, ve);
    }
  }
}
function Mr(e, t, n, r, i, s, u, f) {
  var l = (u & kn) !== 0 ? (u & An) === 0 ? /* @__PURE__ */ Xn(n, !1, !1) : he(n) : null, a = (u & Sn) !== 0 ? he(i) : null;
  return {
    v: l,
    i: a,
    e: P(() => (s(t, l ?? n, a ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Ne(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & Z) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var u = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ie(r)
      );
      if (s.before(r), r === i)
        return;
      r = u;
    }
}
function Q(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Nr = /* @__PURE__ */ qe("<div>Loading...</div>"), Fr = /* @__PURE__ */ qe("<div> </div>"), Dr = /* @__PURE__ */ qe("<div> </div>"), Or = /* @__PURE__ */ qe("<div> </div> <!>", 1), Pr = /* @__PURE__ */ qe('<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px;"><div>Async Load Demo</div> <!> <div> </div></div>');
function Ir(e) {
  let t = /* @__PURE__ */ B(null), n = /* @__PURE__ */ B(!0), r = /* @__PURE__ */ B(null);
  async function i() {
    I(n, !0), I(r, null);
    try {
      const h = await Promise.resolve({ items: ["Alpha", "Beta", "Gamma"], count: 3 });
      I(t, h, !0);
    } catch (h) {
      I(r, String(h), !0);
    } finally {
      I(n, !1);
    }
  }
  i();
  var s = Pr(), u = Ze(Ae(s), 2);
  {
    var f = (h) => {
      var d = Nr();
      Re(h, d);
    }, l = (h) => {
      var d = Fr(), o = Ae(d);
      ze(() => je(o, `Error: ${S(r) ?? ""}`)), Re(h, d);
    }, a = (h) => {
      var d = Or(), o = Qn(d), _ = Ae(o), m = Ze(o, 2);
      Rr(m, 17, () => S(t).items, Sr, (g, b) => {
        var A = Dr(), J = Ae(A);
        ze(() => je(J, `- ${S(b) ?? ""}`)), Re(g, A);
      }), ze(() => je(_, `Loaded: ${S(t).count ?? ""} items`)), Re(h, d);
    };
    kr(u, (h) => {
      S(n) ? h(f) : S(r) ? h(l, 1) : S(t) && h(a, 2);
    });
  }
  var c = Ze(u, 2), v = Ae(c);
  ze(() => je(v, `Status: ${S(n) ? "loading" : "ready"}`)), Re(e, s);
}
function qr(e) {
  return br(Ir, { target: e });
}
export {
  qr as default,
  qr as rvst_mount
};

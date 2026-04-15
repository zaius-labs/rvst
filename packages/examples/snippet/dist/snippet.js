var wt = Array.isArray, an = Array.prototype.indexOf, me = Array.prototype.includes, He = Array.from, cn = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, vn = Object.prototype, hn = Array.prototype, dn = Object.getPrototypeOf, lt = Object.isExtensible;
const mt = () => {
};
function _n(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function yt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Me = 4, Ve = 8, bt = 1 << 24, le = 16, U = 32, ce = 64, $e = 128, D = 512, x = 1024, k = 2048, B = 4096, N = 8192, z = 16384, Te = 32768, ft = 1 << 25, Oe = 65536, st = 1 << 17, pn = 1 << 18, Se = 1 << 19, gn = 1 << 20, Z = 1 << 25, ve = 65536, Ke = 1 << 21, Qe = 1 << 22, ne = 1 << 23, Ue = Symbol("$state"), X = new class extends Error {
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
const Sn = 1, kn = 2, An = 16, Rn = 2, S = Symbol(), Cn = "http://www.w3.org/1999/xhtml";
function Nn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Et(e) {
  return e === this.v;
}
function Fn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function xt(e) {
  return !Fn(e, this.v);
}
let H = null;
function ye(e) {
  H = e;
}
function Dn(e, t = !1, n) {
  H = {
    p: H,
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
function Mn(e) {
  var t = (
    /** @type {ComponentContext} */
    H
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      rr(r);
  }
  return t.i = !0, H = t.p, /** @type {T} */
  {};
}
function Tt() {
  return !0;
}
let de = [];
function On() {
  var e = de;
  de = [], _n(e);
}
function ge(e) {
  if (de.length === 0) {
    var t = de;
    queueMicrotask(() => {
      t === de && On();
    });
  }
  de.push(e);
}
function St(e) {
  var t = g;
  if (t === null)
    return p.f |= ne, e;
  if ((t.f & Te) === 0 && (t.f & Me) === 0)
    throw e;
  te(e, t);
}
function te(e, t) {
  for (; t !== null; ) {
    if ((t.f & $e) !== 0) {
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
function et(e) {
  (e.f & D) !== 0 || e.deps === null ? E(e, x) : E(e, B);
}
function kt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & ve) === 0 || (t.f ^= ve, kt(
        /** @type {Derived} */
        t.deps
      ));
}
function At(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), kt(e.deps), E(e, x);
}
const ue = /* @__PURE__ */ new Set();
let m = null, q = null, Ge = null, Be = !1, _e = null, Le = null;
var ut = 0;
let In = 1;
class ie {
  // for debugging. TODO remove once async is stable
  id = In++;
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
  #f = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #s = 0;
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
  #o() {
    return this.is_fork || this.#s > 0;
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
        E(r, k), this.schedule(r);
      for (r of n.m)
        E(r, B), this.schedule(r);
    }
  }
  #c() {
    if (ut++ > 1e3 && (ue.delete(this), qn()), !this.#o()) {
      for (const f of this.#t)
        this.#n.delete(f), E(f, k), this.schedule(f);
      for (const f of this.#n)
        E(f, B), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = _e = [], r = [], i = Le = [];
    for (const f of t)
      try {
        this.#v(f, n, r);
      } catch (s) {
        throw Ft(f), s;
      }
    if (m = null, i.length > 0) {
      var l = ie.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (_e = null, Le = null, this.#o()) {
      this.#h(r), this.#h(n);
      for (const [f, s] of this.#l)
        Nt(f, s);
    } else {
      this.#f === 0 && ue.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), ot(r), ot(n), this.#r?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((s) => !f.#e.includes(s)));
    }
    o !== null && (ue.add(o), o.#c()), ue.has(this) || this.#a();
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
      var l = i.f, o = (l & (U | ce)) !== 0, f = o && (l & x) !== 0, s = f || (l & N) !== 0 || this.#l.has(i);
      if (!s && i.fn !== null) {
        o ? i.f ^= x : (l & Me) !== 0 ? n.push(i) : Ie(i) && ((l & le) !== 0 && this.#n.add(i), xe(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      At(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== S && !this.previous.has(t) && this.previous.set(t, n), (t.f & ne) === 0 && (this.current.set(t, t.v), q?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, q = null;
  }
  flush() {
    try {
      Be = !0, m = this, this.#c();
    } finally {
      ut = 0, Ge = null, _e = null, Le = null, Be = !1, m = null, q = null, re.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), ue.delete(this);
  }
  #a() {
    for (const s of ue) {
      var t = s.id < this.id, n = [];
      for (const [u, c] of this.current) {
        if (s.current.has(u))
          if (t && c !== s.current.get(u))
            s.current.set(u, c);
          else
            continue;
        n.push(u);
      }
      var r = [...s.current.keys()].filter((u) => !this.current.has(u));
      if (r.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
        for (var o of n)
          Rt(o, r, i, l);
        if (s.#e.length > 0) {
          s.apply();
          for (var f of s.#e)
            s.#v(f, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#f += 1, t && (this.#s += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#f -= 1, t && (this.#s -= 1), !(this.#u || n) && (this.#u = !0, ge(() => {
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
    return (this.#r ??= yt()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new ie();
      Be || (ue.add(m), ge(() => {
        m === t && t.flush();
      }));
    }
    return m;
  }
  apply() {
    {
      q = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ge = t, t.b?.is_pending && (t.f & (Me | Ve | bt)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ce | U)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function qn() {
  try {
    yn();
  } catch (e) {
    te(e, Ge);
  }
}
let W = null;
function ot(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | N)) === 0 && Ie(r) && (W = /* @__PURE__ */ new Set(), xe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && $t(r), W?.size > 0)) {
        re.clear();
        for (const i of W) {
          if ((i.f & (z | N)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            W.has(o) && (W.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const s = l[f];
            (s.f & (z | N)) === 0 && xe(s);
          }
        }
        W.clear();
      }
    }
    W = null;
  }
}
function Rt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Rt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Qe | le)) !== 0 && (l & k) === 0 && Ct(i, t, r) && (E(i, k), tt(
        /** @type {Effect} */
        i
      ));
    }
}
function Ct(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (me.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ct(
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
function tt(e) {
  m.schedule(e);
}
function Nt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Nt(n, t), n = n.next;
  }
}
function Ft(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Ft(t), t = t.next;
}
function Ln(e) {
  let t = 0, n = he(0), r;
  return () => {
    rt() && (C(n), fr(() => (t === 0 && (r = vr(() => e(() => Fe(n)))), t += 1, () => {
      ge(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Fe(n));
      });
    })));
  };
}
var zn = Oe | Se;
function jn(e, t, n, r) {
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
  #i;
  /** @type {TemplateNode | null} */
  #d = null;
  /** @type {BoundaryProps} */
  #f;
  /** @type {((anchor: Node) => void)} */
  #s;
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
  #o = 0;
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
  #m = Ln(() => (this.#a = he(this.#u), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#f = n, this.#s = (l) => {
      var o = (
        /** @type {Effect} */
        g
      );
      o.b = this, o.f |= $e, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#r = Ut(() => {
      this.#g();
    }, zn);
  }
  #y() {
    try {
      this.#e = Y(() => this.#s(this.#i));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#f.failed;
    n && (this.#n = Y(() => {
      n(
        this.#i,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#f.pending;
    t && (this.is_pending = !0, this.#t = Y(() => t(this.#i)), ge(() => {
      var n = this.#l = document.createDocumentFragment(), r = De();
      n.append(r), this.#e = this.#p(() => Y(() => this.#s(r))), this.#o === 0 && (this.#i.before(n), this.#l = null, we(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#_(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#u = 0, this.#e = Y(() => {
        this.#s(this.#i);
      }), this.#o > 0) {
        var t = this.#l = document.createDocumentFragment();
        Xt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#f.pending
        );
        this.#t = Y(() => n(this.#i));
      } else
        this.#_(
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
  #_(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    At(t, this.#v, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#f.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var n = g, r = p, i = H;
    $(this.#r), O(this.#r), ye(this.#r.ctx);
    try {
      return ie.ensure(), t();
    } catch (l) {
      return St(l), null;
    } finally {
      $(n), O(r), ye(i);
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
    this.#o += t, this.#o === 0 && (this.#_(n), this.#t && we(this.#t, () => {
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
    this.#w(t, n), this.#u += t, !(!this.#a || this.#c) && (this.#c = !0, ge(() => {
      this.#c = !1, this.#a && be(this.#a, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), C(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#f.onerror;
    let r = this.#f.failed;
    if (!n && !r)
      throw t;
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Nn();
        return;
      }
      i = !0, l && Tn(), this.#n !== null && we(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (s) => {
      try {
        l = !0, n?.(s, o), l = !1;
      } catch (u) {
        te(u, this.#r && this.#r.parent);
      }
      r && (this.#n = this.#p(() => {
        try {
          return Y(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= $e, r(
              this.#i,
              () => s,
              () => o
            );
          });
        } catch (u) {
          return te(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    ge(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (u) {
        te(u, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        f,
        /** @param {unknown} e */
        (u) => te(u, this.#r && this.#r.parent)
      ) : f(s);
    });
  }
}
function Vn(e, t, n, r) {
  const i = Mt;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = Yn(), s = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function u(v) {
    f();
    try {
      r(v);
    } catch (d) {
      (o.f & z) === 0 && te(d, o);
    }
    je();
  }
  if (n.length === 0) {
    s.then(() => u(t.map(i)));
    return;
  }
  var c = Dt();
  function h() {
    Promise.all(n.map((v) => /* @__PURE__ */ Un(v))).then((v) => u([...t.map(i), ...v])).catch((v) => te(v, o)).finally(() => c());
  }
  s ? s.then(() => {
    f(), h(), je();
  }) : h();
}
function Yn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = H, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    $(e), O(t), ye(n), l && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function je(e = !0) {
  $(null), O(null), ye(null), e && m?.deactivate();
}
function Dt() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    g.b
  ), t = (
    /** @type {Batch} */
    m
  ), n = e.is_rendered();
  return e.update_pending_count(1, t), t.increment(n), (r = !1) => {
    e.update_pending_count(-1, t), t.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function Mt(e) {
  var t = T | k, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Se), {
    ctx: H,
    deps: null,
    effects: null,
    equals: Et,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      S
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
  r === null && wn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = he(
    /** @type {V} */
    S
  ), o = !p, f = /* @__PURE__ */ new Map();
  return lr(() => {
    var s = (
      /** @type {Effect} */
      g
    ), u = yt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(je);
    } catch (d) {
      u.reject(d), je();
    }
    var c = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((s.f & Te) !== 0)
        var h = Dt();
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
      f.set(c, u);
    }
    const v = (d, a = void 0) => {
      if (h) {
        var _ = a === X;
        h(_);
      }
      if (!(a === X || (s.f & z) !== 0)) {
        if (c.activate(), a)
          l.f |= ne, be(l, a);
        else {
          (l.f & ne) !== 0 && (l.f ^= ne), be(l, d);
          for (const [b, y] of f) {
            if (f.delete(b), b === c) break;
            y.reject(X);
          }
        }
        c.deactivate();
      }
    };
    u.promise.then(v, (d) => v(null, d || "unknown"));
  }), nr(() => {
    for (const s of f.values())
      s.reject(X);
  }), new Promise((s) => {
    function u(c) {
      function h() {
        c === i ? s(l) : u(i);
      }
      c.then(h, h);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Bn(e) {
  const t = /* @__PURE__ */ Mt(e);
  return t.equals = xt, t;
}
function $n(e) {
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
function Kn(e) {
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
function nt(e) {
  var t, n = g;
  $(Kn(e));
  try {
    e.f &= ~ve, $n(e), t = en(e);
  } finally {
    $(n);
  }
  return t;
}
function Ot(e) {
  var t = e.v, n = nt(e);
  if (!e.equals(n) && (e.wv = Jt(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t), e.deps === null))) {
    E(e, x);
    return;
  }
  Ee || (q !== null ? (rt() || m?.is_fork) && q.set(e, n) : et(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(X), t.teardown = mt, t.ac = null, Pe(t, 0), it(t));
}
function Pt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && xe(t);
}
let We = /* @__PURE__ */ new Set();
const re = /* @__PURE__ */ new Map();
let It = !1;
function he(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Et,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const n = he(e);
  return or(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t = !1, n = !0) {
  const r = he(e);
  return t || (r.equals = xt), r;
}
function ee(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (p.f & st) !== 0) && Tt() && (p.f & (T | le | Qe | st)) !== 0 && (M === null || !me.call(M, e)) && xn();
  let r = n ? pe(t) : t;
  return be(e, r, Le);
}
function be(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ee ? re.set(e, t) : re.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && nt(l), q === null && et(l);
    }
    e.wv = Jt(), qt(e, k, n), g !== null && (g.f & x) !== 0 && (g.f & (U | ce)) === 0 && (F === null ? ar([e]) : F.push(e)), !i.is_fork && We.size > 0 && !It && Xn();
  }
  return t;
}
function Xn() {
  It = !1;
  for (const e of We)
    (e.f & x) !== 0 && E(e, B), Ie(e) && xe(e);
  We.clear();
}
function Fe(e) {
  ee(e, e.v + 1);
}
function qt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, s = (f & k) === 0;
      if (s && E(o, t), (f & T) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        q?.delete(u), (f & ve) === 0 && (f & D && (o.f |= ve), qt(u, B, n));
      } else if (s) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & le) !== 0 && W !== null && W.add(c), n !== null ? n.push(c) : tt(c);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ue in e)
    return e;
  const t = dn(e);
  if (t !== vn && t !== hn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = wt(e), i = /* @__PURE__ */ G(0), l = ae, o = (f) => {
    if (ae === l)
      return f();
    var s = p, u = ae;
    O(null), ht(l);
    var c = f();
    return O(s), ht(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && bn();
        var c = n.get(s);
        return c === void 0 ? o(() => {
          var h = /* @__PURE__ */ G(u.value);
          return n.set(s, h), h;
        }) : ee(c, u.value, !0), !0;
      },
      deleteProperty(f, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in f) {
            const c = o(() => /* @__PURE__ */ G(S));
            n.set(s, c), Fe(i);
          }
        } else
          ee(u, S), Fe(i);
        return !0;
      },
      get(f, s, u) {
        if (s === Ue)
          return e;
        var c = n.get(s), h = s in f;
        if (c === void 0 && (!h || Ne(f, s)?.writable) && (c = o(() => {
          var d = pe(h ? f[s] : S), a = /* @__PURE__ */ G(d);
          return a;
        }), n.set(s, c)), c !== void 0) {
          var v = C(c);
          return v === S ? void 0 : v;
        }
        return Reflect.get(f, s, u);
      },
      getOwnPropertyDescriptor(f, s) {
        var u = Reflect.getOwnPropertyDescriptor(f, s);
        if (u && "value" in u) {
          var c = n.get(s);
          c && (u.value = C(c));
        } else if (u === void 0) {
          var h = n.get(s), v = h?.v;
          if (h !== void 0 && v !== S)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return u;
      },
      has(f, s) {
        if (s === Ue)
          return !0;
        var u = n.get(s), c = u !== void 0 && u.v !== S || Reflect.has(f, s);
        if (u !== void 0 || g !== null && (!c || Ne(f, s)?.writable)) {
          u === void 0 && (u = o(() => {
            var v = c ? pe(f[s]) : S, d = /* @__PURE__ */ G(v);
            return d;
          }), n.set(s, u));
          var h = C(u);
          if (h === S)
            return !1;
        }
        return c;
      },
      set(f, s, u, c) {
        var h = n.get(s), v = s in f;
        if (r && s === "length")
          for (var d = u; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? ee(a, S) : d in f && (a = o(() => /* @__PURE__ */ G(S)), n.set(d + "", a));
          }
        if (h === void 0)
          (!v || Ne(f, s)?.writable) && (h = o(() => /* @__PURE__ */ G(void 0)), ee(h, pe(u)), n.set(s, h));
        else {
          v = h.v !== S;
          var _ = o(() => pe(u));
          ee(h, _);
        }
        var b = Reflect.getOwnPropertyDescriptor(f, s);
        if (b?.set && b.set.call(c, u), !v) {
          if (r && typeof s == "string") {
            var y = (
              /** @type {Source<number>} */
              n.get("length")
            ), w = Number(s);
            Number.isInteger(w) && w >= y.v && ee(y, w + 1);
          }
          Fe(i);
        }
        return !0;
      },
      ownKeys(f) {
        C(i);
        var s = Reflect.ownKeys(f).filter((h) => {
          var v = n.get(h);
          return v === void 0 || v.v !== S;
        });
        for (var [u, c] of n)
          c.v !== S && !(u in f) && s.push(u);
        return s;
      },
      setPrototypeOf() {
        En();
      }
    }
  );
}
var at, Lt, zt, jt;
function Zn() {
  if (at === void 0) {
    at = window, Lt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    zt = Ne(t, "firstChild").get, jt = Ne(t, "nextSibling").get, lt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), lt(n) && (n.__t = void 0);
  }
}
function De(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
  return (
    /** @type {TemplateNode | null} */
    zt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ye(e) {
  return (
    /** @type {TemplateNode | null} */
    jt.call(e)
  );
}
function Xe(e, t) {
  return /* @__PURE__ */ Ht(e);
}
function ct(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ye(r);
  return r;
}
function Jn(e) {
  e.textContent = "";
}
function Qn() {
  return !1;
}
function er(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Cn, e, void 0)
  );
}
function Vt(e) {
  var t = p, n = g;
  O(null), $(null);
  try {
    return e();
  } finally {
    O(t), $(n);
  }
}
function tr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function fe(e, t) {
  var n = g;
  n !== null && (n.f & N) !== 0 && (e |= N);
  var r = {
    ctx: H,
    deps: null,
    nodes: null,
    f: e | k | D,
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
  if ((e & Me) !== 0)
    _e !== null ? _e.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      xe(r);
    } catch (o) {
      throw j(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Se) === 0 && (i = i.first, (e & le) !== 0 && (e & Oe) !== 0 && i !== null && (i.f |= Oe));
  }
  if (i !== null && (i.parent = n, n !== null && tr(i, n), p !== null && (p.f & T) !== 0 && (e & ce) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function rt() {
  return p !== null && !L;
}
function nr(e) {
  const t = fe(Ve, null);
  return E(t, x), t.teardown = e, t;
}
function rr(e) {
  return fe(Me | gn, e);
}
function ir(e) {
  ie.ensure();
  const t = fe(ce | Se, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function lr(e) {
  return fe(Qe | Se, e);
}
function fr(e, t = 0) {
  return fe(Ve | t, e);
}
function Yt(e, t = [], n = [], r = []) {
  Vn(r, t, n, (i) => {
    fe(Ve, () => e(...i.map(C)));
  });
}
function Ut(e, t = 0) {
  var n = fe(le | t, e);
  return n;
}
function Y(e) {
  return fe(U | Se, e);
}
function Bt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ee, r = p;
    vt(!0), O(null);
    try {
      t.call(null);
    } finally {
      vt(n), O(r);
    }
  }
}
function it(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Vt(() => {
      i.abort(X);
    });
    var r = n.next;
    (n.f & ce) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function sr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & pn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, ft), it(e, t && !n), Pe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Bt(e), e.f ^= ft, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && $t(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ye(e);
    e.remove(), e = n;
  }
}
function $t(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
  var r = [];
  Kt(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Kt(e, t, n) {
  if ((e.f & N) === 0) {
    e.f ^= N;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Oe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & le) !== 0;
      Kt(i, t, o ? n : !1), i = l;
    }
  }
}
function Gt(e) {
  Wt(e, !0);
}
function Wt(e, t) {
  if ((e.f & N) !== 0) {
    e.f ^= N, (e.f & x) === 0 && (E(e, k), ie.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Oe) !== 0 || (n.f & U) !== 0;
      Wt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Xt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ye(n);
      t.append(n), n = i;
    }
}
let ze = !1, Ee = !1;
function vt(e) {
  Ee = e;
}
let p = null, L = !1;
function O(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let M = null;
function or(e) {
  p !== null && (M === null ? M = [e] : M.push(e));
}
let A = null, R = 0, F = null;
function ar(e) {
  F = e;
}
let Zt = 1, oe = 0, ae = oe;
function ht(e) {
  ae = e;
}
function Jt() {
  return ++Zt;
}
function Ie(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & T && (e.f &= ~ve), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Ie(
        /** @type {Derived} */
        l
      ) && Ot(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    q === null && E(e, x);
  }
  return !1;
}
function Qt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && me.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? Qt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, k) : (l.f & x) !== 0 && E(l, B), tt(
        /** @type {Effect} */
        l
      ));
    }
}
function en(e) {
  var t = A, n = R, r = F, i = p, l = M, o = H, f = L, s = ae, u = e.f;
  A = /** @type {null | Value[]} */
  null, R = 0, F = null, p = (u & (U | ce)) === 0 ? e : null, M = null, ye(e.ctx), L = !1, ae = ++oe, e.ac !== null && (Vt(() => {
    e.ac.abort(X);
  }), e.ac = null);
  try {
    e.f |= Ke;
    var c = (
      /** @type {Function} */
      e.fn
    ), h = c();
    e.f |= Te;
    var v = e.deps, d = m?.is_fork;
    if (A !== null) {
      var a;
      if (d || Pe(e, R), v !== null && R > 0)
        for (v.length = R + A.length, a = 0; a < A.length; a++)
          v[R + a] = A[a];
      else
        e.deps = v = A;
      if (rt() && (e.f & D) !== 0)
        for (a = R; a < v.length; a++)
          (v[a].reactions ??= []).push(e);
    } else !d && v !== null && R < v.length && (Pe(e, R), v.length = R);
    if (Tt() && F !== null && !L && v !== null && (e.f & (T | B | k)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      F.length; a++)
        Qt(
          F[a],
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
      F !== null && (r === null ? r = F : r.push(.../** @type {Source[]} */
      F));
    }
    return (e.f & ne) !== 0 && (e.f ^= ne), h;
  } catch (_) {
    return St(_);
  } finally {
    e.f ^= Ke, A = t, R = n, F = r, p = i, M = l, ye(o), L = f, ae = s;
  }
}
function cr(e, t) {
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
  (A === null || !me.call(A, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & D) !== 0 && (l.f ^= D, l.f &= ~ve), et(l), Gn(l), Pe(l, 0);
  }
}
function Pe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      cr(e, n[r]);
}
function xe(e) {
  var t = e.f;
  if ((t & z) === 0) {
    E(e, x);
    var n = g, r = ze;
    g = e, ze = !0;
    try {
      (t & (le | bt)) !== 0 ? sr(e) : it(e), Bt(e);
      var i = en(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Zt;
      var l;
    } finally {
      ze = r, g = n;
    }
  }
}
function C(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !L) {
    var r = g !== null && (g.f & z) !== 0;
    if (!r && (M === null || !me.call(M, e))) {
      var i = p.deps;
      if ((p.f & Ke) !== 0)
        e.rv < oe && (e.rv = oe, A === null && i !== null && i[R] === e ? R++ : A === null ? A = [e] : A.push(e));
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
      return ((o.f & x) === 0 && o.reactions !== null || nn(o)) && (f = nt(o)), re.set(o, f), f;
    }
    var s = (o.f & D) === 0 && !L && p !== null && (ze || (p.f & D) !== 0), u = (o.f & Te) === 0;
    Ie(o) && (s && (o.f |= D), Ot(o)), s && !u && (Pt(o), tn(o));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & ne) !== 0)
    throw e.v;
  return e.v;
}
function tn(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & D) === 0 && (Pt(
        /** @type {Derived} */
        t
      ), tn(
        /** @type {Derived} */
        t
      ));
}
function nn(e) {
  if (e.v === S) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (re.has(t) || (t.f & T) !== 0 && nn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function vr(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const dt = globalThis.Deno?.core?.ops ?? null;
function hr(e, ...t) {
  dt?.[e] ? dt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function rn(e, t) {
  hr("op_set_text", e, t);
}
const dr = ["touchstart", "touchmove"];
function _r(e) {
  return dr.includes(e);
}
const Re = Symbol("events"), ln = /* @__PURE__ */ new Set(), Ze = /* @__PURE__ */ new Set();
function pr(e, t, n) {
  (t[Re] ??= {})[e] = n;
}
function gr(e) {
  for (var t = 0; t < e.length; t++)
    ln.add(e[t]);
  for (var n of Ze)
    n(e);
}
let _t = null;
function pt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  _t = e;
  var o = 0, f = _t === e && e[Re];
  if (f) {
    var s = i.indexOf(f);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Re] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    s <= u && (o = s);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    cn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, h = g;
    O(null), $(null);
    try {
      for (var v, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Re]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (b) {
          v ? d.push(b) : v = b;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (v) {
        for (let b of d)
          queueMicrotask(() => {
            throw b;
          });
        throw v;
      }
    } finally {
      e[Re] = t, delete e.currentTarget, O(c), $(h);
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
  var t = er("template");
  return t.innerHTML = mr(e.replaceAll("<!>", "<!---->")), t.content;
}
function br(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function fn(e, t) {
  var n = (t & Rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = yr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ht(r));
    var l = (
      /** @type {TemplateNode} */
      n || Lt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return br(l, l), l;
  };
}
function sn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Er(e, t) {
  return xr(e, t);
}
const qe = /* @__PURE__ */ new Map();
function xr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  Zn();
  var s = void 0, u = ir(() => {
    var c = n ?? t.appendChild(De());
    jn(
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
          H
        );
        l && (a.c = l), i && (r.$$events = i), s = e(d, r) || {}, Mn();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), v = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!h.has(_)) {
          h.add(_);
          var b = _r(_);
          for (const P of [t, document]) {
            var y = qe.get(P);
            y === void 0 && (y = /* @__PURE__ */ new Map(), qe.set(P, y));
            var w = y.get(_);
            w === void 0 ? (P.addEventListener(_, pt, { passive: b }), y.set(_, 1)) : y.set(_, w + 1);
          }
        }
      }
    };
    return v(He(ln)), Ze.add(v), () => {
      for (var d of h)
        for (const b of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            qe.get(b)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (b.removeEventListener(d, pt), a.delete(d), a.size === 0 && qe.delete(b)) : a.set(d, _);
        }
      Ze.delete(v), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Tr.set(s, u), s;
}
let Tr = /* @__PURE__ */ new WeakMap();
function Sr(e, t) {
  return t;
}
function kr(e, t, n) {
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
            Je(e, He(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var s = r.length === 0 && n !== null;
    if (s) {
      var u = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        u.parentNode
      );
      Jn(c), c.append(u), e.items.clear();
    }
    Je(e, t, !s);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Je(e, t, n = !0) {
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
      l.f |= Z;
      const o = document.createDocumentFragment();
      Xt(l, o);
    } else
      j(t[i], n);
  }
}
var gt;
function Ar(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map();
  {
    var s = (
      /** @type {Element} */
      e
    );
    o = s.appendChild(De());
  }
  var u = null, c = /* @__PURE__ */ Bn(() => {
    var w = n();
    return wt(w) ? w : w == null ? [] : He(w);
  }), h, v = /* @__PURE__ */ new Map(), d = !0;
  function a(w) {
    (y.effect.f & z) === 0 && (y.pending.delete(w), y.fallback = u, Rr(y, h, o, t, r), u !== null && (h.length === 0 ? (u.f & Z) === 0 ? Gt(u) : (u.f ^= Z, Ce(u, null, o)) : we(u, () => {
      u = null;
    })));
  }
  function _(w) {
    y.pending.delete(w);
  }
  var b = Ut(() => {
    h = /** @type {V[]} */
    C(c);
    for (var w = h.length, P = /* @__PURE__ */ new Set(), V = (
      /** @type {Batch} */
      m
    ), se = Qn(), J = 0; J < w; J += 1) {
      var ke = h[J], I = r(ke, J), K = d ? null : f.get(I);
      K ? (K.v && be(K.v, ke), K.i && be(K.i, J), se && V.unskip_effect(K.e)) : (K = Cr(
        f,
        d ? o : gt ??= De(),
        ke,
        I,
        J,
        i,
        t,
        n
      ), d || (K.e.f |= Z), f.set(I, K)), P.add(I);
    }
    if (w === 0 && l && !u && (d ? u = Y(() => l(o)) : (u = Y(() => l(gt ??= De())), u.f |= Z)), w > P.size && mn(), !d)
      if (v.set(V, P), se) {
        for (const [un, on] of f)
          P.has(un) || V.skip_effect(on.e);
        V.oncommit(a), V.ondiscard(_);
      } else
        a(V);
    C(c);
  }), y = { effect: b, items: f, pending: v, outrogroups: null, fallback: u };
  d = !1;
}
function Ae(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Rr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = Ae(e.effect.first), s, u = null, c = [], h = [], v, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], d = i(v, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const I of e.outrogroups)
        I.pending.delete(a), I.done.delete(a);
    if ((a.f & N) !== 0 && Gt(a), (a.f & Z) !== 0)
      if (a.f ^= Z, a === f)
        Ce(a, null, n);
      else {
        var b = u ? u.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), Q(e, u, a), Q(e, a, b), Ce(a, b, n), u = a, c = [], h = [], f = Ae(u.next);
        continue;
      }
    if (a !== f) {
      if (s !== void 0 && s.has(a)) {
        if (c.length < h.length) {
          var y = h[0], w;
          u = y.prev;
          var P = c[0], V = c[c.length - 1];
          for (w = 0; w < c.length; w += 1)
            Ce(c[w], y, n);
          for (w = 0; w < h.length; w += 1)
            s.delete(h[w]);
          Q(e, P.prev, V.next), Q(e, u, P), Q(e, V, y), f = y, u = V, _ -= 1, c = [], h = [];
        } else
          s.delete(a), Ce(a, f, n), Q(e, a.prev, a.next), Q(e, a, u === null ? e.effect.first : u.next), Q(e, u, a), u = a;
        continue;
      }
      for (c = [], h = []; f !== null && f !== a; )
        (s ??= /* @__PURE__ */ new Set()).add(f), h.push(f), f = Ae(f.next);
      if (f === null)
        continue;
    }
    (a.f & Z) === 0 && c.push(a), u = a, f = Ae(a.next);
  }
  if (e.outrogroups !== null) {
    for (const I of e.outrogroups)
      I.pending.size === 0 && (Je(e, He(I.done)), e.outrogroups?.delete(I));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || s !== void 0) {
    var se = [];
    if (s !== void 0)
      for (a of s)
        (a.f & N) === 0 && se.push(a);
    for (; f !== null; )
      (f.f & N) === 0 && f !== e.fallback && se.push(f), f = Ae(f.next);
    var J = se.length;
    if (J > 0) {
      var ke = l === 0 ? n : null;
      kr(e, se, ke);
    }
  }
}
function Cr(e, t, n, r, i, l, o, f) {
  var s = (o & Sn) !== 0 ? (o & An) === 0 ? /* @__PURE__ */ Wn(n, !1, !1) : he(n) : null, u = (o & kn) !== 0 ? he(i) : null;
  return {
    v: s,
    i: u,
    e: Y(() => (l(t, s ?? n, u ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Ce(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & Z) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function Q(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Nr = (e, t = mt) => {
  var n = Fr(), r = Xe(n);
  Yt(() => rn(r, t())), sn(e, n);
};
var Fr = /* @__PURE__ */ fn("<li> </li>"), Dr = /* @__PURE__ */ fn("<div><ul></ul> <div> </div> <button>Add</button></div>");
function Mr(e) {
  let t = /* @__PURE__ */ G(pe(["apple", "banana", "cherry"]));
  var n = Dr(), r = Xe(n);
  Ar(r, 21, () => C(t), Sr, (f, s) => {
    Nr(f, () => C(s));
  });
  var i = ct(r, 2), l = Xe(i), o = ct(i, 2);
  Yt(() => rn(l, `Count: ${C(t).length ?? ""}`)), pr("click", o, () => ee(t, [...C(t), "date"], !0)), sn(e, n);
}
gr(["click"]);
function Pr(e) {
  return Er(Mr, { target: e });
}
export {
  Pr as default,
  Pr as rvst_mount
};

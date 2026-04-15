var Zt = Array.isArray, Jt = Array.prototype.indexOf, ve = Array.prototype.includes, Qt = Array.from, Xt = Object.defineProperty, ye = Object.getOwnPropertyDescriptor, $t = Object.prototype, en = Array.prototype, tn = Object.getPrototypeOf, $e = Object.isExtensible;
const nn = () => {
};
function rn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ht() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const E = 2, Te = 4, Oe = 8, dt = 1 << 24, Q = 16, B = 32, ne = 64, Be = 128, F = 512, y = 1024, T = 2048, H = 4096, q = 8192, Y = 16384, le = 32768, et = 1 << 25, re = 65536, tt = 1 << 17, sn = 1 << 18, ge = 1 << 19, ln = 1 << 20, ie = 65536, He = 1 << 21, ze = 1 << 22, W = 1 << 23, je = Symbol("$state"), z = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function fn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function an() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function un(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function on() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function cn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function hn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function dn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function vn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function _n() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function pn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const gn = 1, wn = 2, x = Symbol(), mn = "http://www.w3.org/1999/xhtml";
function bn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function vt(e) {
  return e === this.v;
}
let R = null;
function _e(e) {
  R = e;
}
function _t(e, t = !1, n) {
  R = {
    p: R,
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
function pt(e) {
  var t = (
    /** @type {ComponentContext} */
    R
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ot(r);
  }
  return t.i = !0, R = t.p, /** @type {T} */
  {};
}
function gt() {
  return !0;
}
let oe = [];
function yn() {
  var e = oe;
  oe = [], rn(e);
}
function he(e) {
  if (oe.length === 0) {
    var t = oe;
    queueMicrotask(() => {
      t === oe && yn();
    });
  }
  oe.push(e);
}
function wt(e) {
  var t = g;
  if (t === null)
    return p.f |= W, e;
  if ((t.f & le) === 0 && (t.f & Te) === 0)
    throw e;
  K(e, t);
}
function K(e, t) {
  for (; t !== null; ) {
    if ((t.f & Be) !== 0) {
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
const En = -7169;
function b(e, t) {
  e.f = e.f & En | t;
}
function Ke(e) {
  (e.f & F) !== 0 || e.deps === null ? b(e, y) : b(e, H);
}
function mt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & E) === 0 || (t.f & ie) === 0 || (t.f ^= ie, mt(
        /** @type {Derived} */
        t.deps
      ));
}
function bt(e, t, n) {
  (e.f & T) !== 0 ? t.add(e) : (e.f & H) !== 0 && n.add(e), mt(e.deps), b(e, y);
}
const $ = /* @__PURE__ */ new Set();
let m = null, P = null, Ue = null, qe = !1, ce = null, Re = null;
var nt = 0;
let xn = 1;
class J {
  // for debugging. TODO remove once async is stable
  id = xn++;
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
  #a = /* @__PURE__ */ new Set();
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
  #u = !1;
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
        b(r, T), this.schedule(r);
      for (r of n.m)
        b(r, H), this.schedule(r);
    }
  }
  #h() {
    if (nt++ > 1e3 && ($.delete(this), Tn()), !this.#o()) {
      for (const f of this.#i)
        this.#s.delete(f), b(f, T), this.schedule(f);
      for (const f of this.#s)
        b(f, H), this.schedule(f);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ce = [], r = [], i = Re = [];
    for (const f of t)
      try {
        this.#d(f, n, r);
      } catch (l) {
        throw Tt(f), l;
      }
    if (m = null, i.length > 0) {
      var s = J.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (ce = null, Re = null, this.#o()) {
      this.#v(r), this.#v(n);
      for (const [f, l] of this.#f)
        xt(f, l);
    } else {
      this.#t === 0 && $.delete(this), this.#i.clear(), this.#s.clear();
      for (const f of this.#e) f(this);
      this.#e.clear(), rt(r), rt(n), this.#r?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#n.length > 0) {
      const f = a ??= this;
      f.#n.push(...this.#n.filter((l) => !f.#n.includes(l)));
    }
    a !== null && ($.add(a), a.#h()), $.has(this) || this.#c();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #d(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (B | ne)) !== 0, f = a && (s & y) !== 0, l = f || (s & q) !== 0 || this.#f.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= y : (s & Te) !== 0 ? n.push(i) : Se(i) && ((s & Q) !== 0 && this.#s.add(i), pe(i));
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      bt(t[n], this.#i, this.#s);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== x && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, t.v), P?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, P = null;
  }
  flush() {
    try {
      qe = !0, m = this, this.#h();
    } finally {
      nt = 0, Ue = null, ce = null, Re = null, qe = !1, m = null, P = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), $.delete(this);
  }
  #c() {
    for (const l of $) {
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
          yt(a, r, i, s);
        if (l.#n.length > 0) {
          l.apply();
          for (var f of l.#n)
            l.#d(f, [], []);
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
    this.#t -= 1, t && (this.#l -= 1), !(this.#u || n) && (this.#u = !0, he(() => {
      this.#u = !1, this.flush();
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
    this.#a.add(t);
  }
  settled() {
    return (this.#r ??= ht()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new J();
      qe || ($.add(m), he(() => {
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
    if (Ue = t, t.b?.is_pending && (t.f & (Te | Oe | dt)) !== 0 && (t.f & le) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ce !== null && n === g && (p === null || (p.f & E) === 0))
        return;
      if ((r & (ne | B)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#n.push(n);
  }
}
function Tn() {
  try {
    hn();
  } catch (e) {
    K(e, Ue);
  }
}
let V = null;
function rt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Y | q)) === 0 && Se(r) && (V = /* @__PURE__ */ new Set(), pe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Lt(r), V?.size > 0)) {
        Z.clear();
        for (const i of V) {
          if ((i.f & (Y | q)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            V.has(a) && (V.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (Y | q)) === 0 && pe(l);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function yt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & E) !== 0 ? yt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (ze | Q)) !== 0 && (s & T) === 0 && Et(i, t, r) && (b(i, T), We(
        /** @type {Effect} */
        i
      ));
    }
}
function Et(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ve.call(t, i))
        return !0;
      if ((i.f & E) !== 0 && Et(
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
  m.schedule(e);
}
function xt(e, t) {
  if (!((e.f & B) !== 0 && (e.f & y) !== 0)) {
    (e.f & T) !== 0 ? t.d.push(e) : (e.f & H) !== 0 && t.m.push(e), b(e, y);
    for (var n = e.first; n !== null; )
      xt(n, t), n = n.next;
  }
}
function Tt(e) {
  b(e, y);
  for (var t = e.first; t !== null; )
    Tt(t), t = t.next;
}
function kn(e) {
  let t = 0, n = Pe(0), r;
  return () => {
    Je() && (M(n), Kn(() => (t === 0 && (r = zt(() => e(() => Ee(n)))), t += 1, () => {
      he(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ee(n));
      });
    })));
  };
}
var Sn = re | ge;
function An(e, t, n, r) {
  new Rn(e, t, n, r);
}
class Rn {
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
  #a = null;
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
  #u = 0;
  #o = 0;
  #h = !1;
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
  #c = null;
  #m = kn(() => (this.#c = Pe(this.#u), () => {
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
      var a = (
        /** @type {Effect} */
        g
      );
      a.b = this, a.f |= Be, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Qe(() => {
      this.#g();
    }, Sn);
  }
  #b() {
    try {
      this.#n = G(() => this.#l(this.#e));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#t.failed;
    n && (this.#s = G(() => {
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
    t && (this.is_pending = !0, this.#i = G(() => t(this.#e)), he(() => {
      var n = this.#f = document.createDocumentFragment(), r = De();
      n.append(r), this.#n = this.#p(() => G(() => this.#l(r))), this.#o === 0 && (this.#e.before(n), this.#f = null, xe(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#_(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#u = 0, this.#n = G(() => {
        this.#l(this.#e);
      }), this.#o > 0) {
        var t = this.#f = document.createDocumentFragment();
        qt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#t.pending
        );
        this.#i = G(() => n(this.#e));
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    bt(t, this.#d, this.#v);
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
    var n = g, r = p, i = R;
    U(this.#r), C(this.#r), _e(this.#r.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return wt(s), null;
    } finally {
      U(n), C(r), _e(i);
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
    this.#o += t, this.#o === 0 && (this.#_(n), this.#i && xe(this.#i, () => {
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
    this.#w(t, n), this.#u += t, !(!this.#c || this.#h) && (this.#h = !0, he(() => {
      this.#h = !1, this.#c && Fe(this.#c, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), M(
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
    this.#n && (A(this.#n), this.#n = null), this.#i && (A(this.#i), this.#i = null), this.#s && (A(this.#s), this.#s = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        bn();
        return;
      }
      i = !0, s && pn(), this.#s !== null && xe(this.#s, () => {
        this.#s = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, a), s = !1;
      } catch (u) {
        K(u, this.#r && this.#r.parent);
      }
      r && (this.#s = this.#p(() => {
        try {
          return G(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= Be, r(
              this.#e,
              () => l,
              () => a
            );
          });
        } catch (u) {
          return K(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    he(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (u) {
        K(u, this.#r && this.#r.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        f,
        /** @param {unknown} e */
        (u) => K(u, this.#r && this.#r.parent)
      ) : f(l);
    });
  }
}
function Nn(e, t, n, r) {
  const i = Fn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    g
  ), f = Mn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (_) {
      (a.f & Y) === 0 && K(_, a);
    }
    Me();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var o = kt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ Dn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => K(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    f(), d(), Me();
  }) : d();
}
function Mn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = R, r = (
    /** @type {Batch} */
    m
  );
  return function(s = !0) {
    U(e), C(t), _e(n), s && (e.f & Y) === 0 && (r?.activate(), r?.apply());
  };
}
function Me(e = !0) {
  U(null), C(null), _e(null), e && m?.deactivate();
}
function kt() {
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
function Fn(e) {
  var t = E | T, n = p !== null && (p.f & E) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= ge), {
    ctx: R,
    deps: null,
    effects: null,
    equals: vt,
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
function Dn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && an();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Pe(
    /** @type {V} */
    x
  ), a = !p, f = /* @__PURE__ */ new Map();
  return zn(() => {
    var l = (
      /** @type {Effect} */
      g
    ), u = ht();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Me);
    } catch (_) {
      u.reject(_), Me();
    }
    var o = (
      /** @type {Batch} */
      m
    );
    if (a) {
      if ((l.f & le) !== 0)
        var d = kt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(z), f.delete(o);
      else {
        for (const _ of f.values())
          _.reject(z);
        f.clear();
      }
      f.set(o, u);
    }
    const c = (_, h = void 0) => {
      if (d) {
        var v = h === z;
        d(v);
      }
      if (!(h === z || (l.f & Y) !== 0)) {
        if (o.activate(), h)
          s.f |= W, Fe(s, h);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Fe(s, _);
          for (const [w, O] of f) {
            if (f.delete(w), w === o) break;
            O.reject(z);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Un(() => {
    for (const l of f.values())
      l.reject(z);
  }), new Promise((l) => {
    function u(o) {
      function d() {
        o === i ? l(s) : u(i);
      }
      o.then(d, d);
    }
    u(i);
  });
}
function Cn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      A(
        /** @type {Effect} */
        t[n]
      );
  }
}
function On(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & E) === 0)
      return (t.f & Y) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ze(e) {
  var t, n = g;
  U(On(e));
  try {
    e.f &= ~ie, Cn(e), t = Ut(e);
  } finally {
    U(n);
  }
  return t;
}
function St(e) {
  var t = e.v, n = Ze(e);
  if (!e.equals(n) && (e.wv = Bt(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t), e.deps === null))) {
    b(e, y);
    return;
  }
  se || (P !== null ? (Je() || m?.is_fork) && P.set(e, n) : Ke(e));
}
function Pn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = nn, t.ac = null, ke(t, 0), Xe(t));
}
function At(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && pe(t);
}
let Ve = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let Rt = !1;
function Pe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: vt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  const n = Pe(e);
  return Xn(n), n;
}
function j(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (p.f & tt) !== 0) && gt() && (p.f & (E | Q | ze | tt)) !== 0 && (D === null || !ve.call(D, e)) && _n();
  let r = n ? me(t) : t;
  return Fe(e, r, Re);
}
function Fe(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    se ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & E) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & T) !== 0 && Ze(s), P === null && Ke(s);
    }
    e.wv = Bt(), Nt(e, T, n), g !== null && (g.f & y) !== 0 && (g.f & (B | ne)) === 0 && (N === null ? $n([e]) : N.push(e)), !i.is_fork && Ve.size > 0 && !Rt && Ln();
  }
  return t;
}
function Ln() {
  Rt = !1;
  for (const e of Ve)
    (e.f & y) !== 0 && b(e, H), Se(e) && pe(e);
  Ve.clear();
}
function Ee(e) {
  j(e, e.v + 1);
}
function Nt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & T) === 0;
      if (l && b(a, t), (f & E) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        P?.delete(u), (f & ie) === 0 && (f & F && (a.f |= ie), Nt(u, H, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Q) !== 0 && V !== null && V.add(o), n !== null ? n.push(o) : We(o);
      }
    }
}
function me(e) {
  if (typeof e != "object" || e === null || je in e)
    return e;
  const t = tn(e);
  if (t !== $t && t !== en)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Zt(e), i = /* @__PURE__ */ I(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var l = p, u = te;
    C(null), lt(s);
    var o = f();
    return C(l), lt(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && dn();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var d = /* @__PURE__ */ I(u.value);
          return n.set(l, d), d;
        }) : j(o, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const o = a(() => /* @__PURE__ */ I(x));
            n.set(l, o), Ee(i);
          }
        } else
          j(u, x), Ee(i);
        return !0;
      },
      get(f, l, u) {
        if (l === je)
          return e;
        var o = n.get(l), d = l in f;
        if (o === void 0 && (!d || ye(f, l)?.writable) && (o = a(() => {
          var _ = me(d ? f[l] : x), h = /* @__PURE__ */ I(_);
          return h;
        }), n.set(l, o)), o !== void 0) {
          var c = M(o);
          return c === x ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var o = n.get(l);
          o && (u.value = M(o));
        } else if (u === void 0) {
          var d = n.get(l), c = d?.v;
          if (d !== void 0 && c !== x)
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
        if (l === je)
          return !0;
        var u = n.get(l), o = u !== void 0 && u.v !== x || Reflect.has(f, l);
        if (u !== void 0 || g !== null && (!o || ye(f, l)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? me(f[l]) : x, _ = /* @__PURE__ */ I(c);
            return _;
          }), n.set(l, u));
          var d = M(u);
          if (d === x)
            return !1;
        }
        return o;
      },
      set(f, l, u, o) {
        var d = n.get(l), c = l in f;
        if (r && l === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var h = n.get(_ + "");
            h !== void 0 ? j(h, x) : _ in f && (h = a(() => /* @__PURE__ */ I(x)), n.set(_ + "", h));
          }
        if (d === void 0)
          (!c || ye(f, l)?.writable) && (d = a(() => /* @__PURE__ */ I(void 0)), j(d, me(u)), n.set(l, d));
        else {
          c = d.v !== x;
          var v = a(() => me(u));
          j(d, v);
        }
        var w = Reflect.getOwnPropertyDescriptor(f, l);
        if (w?.set && w.set.call(o, u), !c) {
          if (r && typeof l == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), fe = Number(l);
            Number.isInteger(fe) && fe >= O.v && j(O, fe + 1);
          }
          Ee(i);
        }
        return !0;
      },
      ownKeys(f) {
        M(i);
        var l = Reflect.ownKeys(f).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== x;
        });
        for (var [u, o] of n)
          o.v !== x && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        vn();
      }
    }
  );
}
var it, Mt, Ft, Dt;
function In() {
  if (it === void 0) {
    it = window, Mt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ft = ye(t, "firstChild").get, Dt = ye(t, "nextSibling").get, $e(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), $e(n) && (n.__t = void 0);
  }
}
function De(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ce(e) {
  return (
    /** @type {TemplateNode | null} */
    Ft.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Le(e) {
  return (
    /** @type {TemplateNode | null} */
    Dt.call(e)
  );
}
function ae(e, t) {
  return /* @__PURE__ */ Ce(e);
}
function jn(e, t = !1) {
  {
    var n = /* @__PURE__ */ Ce(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Le(n) : n;
  }
}
function de(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Le(r);
  return r;
}
function qn() {
  return !1;
}
function Yn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(mn, e, void 0)
  );
}
function Ct(e) {
  var t = p, n = g;
  C(null), U(null);
  try {
    return e();
  } finally {
    C(t), U(n);
  }
}
function Bn(e) {
  g === null && (p === null && cn(), on()), se && un();
}
function Hn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = g;
  n !== null && (n.f & q) !== 0 && (e |= q);
  var r = {
    ctx: R,
    deps: null,
    nodes: null,
    f: e | T | F,
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
  if ((e & Te) !== 0)
    ce !== null ? ce.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      pe(r);
    } catch (a) {
      throw A(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ge) === 0 && (i = i.first, (e & Q) !== 0 && (e & re) !== 0 && i !== null && (i.f |= re));
  }
  if (i !== null && (i.parent = n, n !== null && Hn(i, n), p !== null && (p.f & E) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      p
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Je() {
  return p !== null && !L;
}
function Un(e) {
  const t = X(Oe, null);
  return b(t, y), t.teardown = e, t;
}
function Vn(e) {
  Bn();
  var t = (
    /** @type {Effect} */
    g.f
  ), n = !p && (t & B) !== 0 && (t & le) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      R
    );
    (r.e ??= []).push(e);
  } else
    return Ot(e);
}
function Ot(e) {
  return X(Te | ln, e);
}
function Gn(e) {
  J.ensure();
  const t = X(ne | ge, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function zn(e) {
  return X(ze | ge, e);
}
function Kn(e, t = 0) {
  return X(Oe | t, e);
}
function Wn(e, t = [], n = [], r = []) {
  Nn(r, t, n, (i) => {
    X(Oe, () => e(...i.map(M)));
  });
}
function Qe(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function G(e) {
  return X(B | ge, e);
}
function Pt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = se, r = p;
    st(!0), C(null);
    try {
      t.call(null);
    } finally {
      st(n), C(r);
    }
  }
}
function Xe(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ct(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Zn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & sn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Jn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, et), Xe(e, t && !n), ke(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Pt(e), e.f ^= et, e.f |= Y;
  var i = e.parent;
  i !== null && i.first !== null && Lt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Jn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Le(e);
    e.remove(), e = n;
  }
}
function Lt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  It(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function It(e, t, n) {
  if ((e.f & q) === 0) {
    e.f ^= q;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & re) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & Q) !== 0;
      It(i, t, a ? n : !1), i = s;
    }
  }
}
function Qn(e) {
  jt(e, !0);
}
function jt(e, t) {
  if ((e.f & q) !== 0) {
    e.f ^= q, (e.f & y) === 0 && (b(e, T), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & re) !== 0 || (n.f & B) !== 0;
      jt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function qt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Le(n);
      t.append(n), n = i;
    }
}
let Ne = !1, se = !1;
function st(e) {
  se = e;
}
let p = null, L = !1;
function C(e) {
  p = e;
}
let g = null;
function U(e) {
  g = e;
}
let D = null;
function Xn(e) {
  p !== null && (D === null ? D = [e] : D.push(e));
}
let k = null, S = 0, N = null;
function $n(e) {
  N = e;
}
let Yt = 1, ee = 0, te = ee;
function lt(e) {
  te = e;
}
function Bt() {
  return ++Yt;
}
function Se(e) {
  var t = e.f;
  if ((t & T) !== 0)
    return !0;
  if (t & E && (e.f &= ~ie), (t & H) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Se(
        /** @type {Derived} */
        s
      ) && St(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & F) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && b(e, y);
  }
  return !1;
}
function Ht(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ve.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & E) !== 0 ? Ht(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, T) : (s.f & y) !== 0 && b(s, H), We(
        /** @type {Effect} */
        s
      ));
    }
}
function Ut(e) {
  var t = k, n = S, r = N, i = p, s = D, a = R, f = L, l = te, u = e.f;
  k = /** @type {null | Value[]} */
  null, S = 0, N = null, p = (u & (B | ne)) === 0 ? e : null, D = null, _e(e.ctx), L = !1, te = ++ee, e.ac !== null && (Ct(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= He;
    var o = (
      /** @type {Function} */
      e.fn
    ), d = o();
    e.f |= le;
    var c = e.deps, _ = m?.is_fork;
    if (k !== null) {
      var h;
      if (_ || ke(e, S), c !== null && S > 0)
        for (c.length = S + k.length, h = 0; h < k.length; h++)
          c[S + h] = k[h];
      else
        e.deps = c = k;
      if (Je() && (e.f & F) !== 0)
        for (h = S; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (ke(e, S), c.length = S);
    if (gt() && N !== null && !L && c !== null && (e.f & (E | H | T)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      N.length; h++)
        Ht(
          N[h],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let v = 0; v < n; v += 1)
          i.deps[v].rv = ee;
      if (t !== null)
        for (const v of t)
          v.rv = ee;
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & W) !== 0 && (e.f ^= W), d;
  } catch (v) {
    return wt(v);
  } finally {
    e.f ^= He, k = t, S = n, N = r, p = i, D = s, _e(a), L = f, te = l;
  }
}
function er(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Jt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & E) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (k === null || !ve.call(k, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & F) !== 0 && (s.f ^= F, s.f &= ~ie), Ke(s), Pn(s), ke(s, 0);
  }
}
function ke(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      er(e, n[r]);
}
function pe(e) {
  var t = e.f;
  if ((t & Y) === 0) {
    b(e, y);
    var n = g, r = Ne;
    g = e, Ne = !0;
    try {
      (t & (Q | dt)) !== 0 ? Zn(e) : Xe(e), Pt(e);
      var i = Ut(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Yt;
      var s;
    } finally {
      Ne = r, g = n;
    }
  }
}
function M(e) {
  var t = e.f, n = (t & E) !== 0;
  if (p !== null && !L) {
    var r = g !== null && (g.f & Y) !== 0;
    if (!r && (D === null || !ve.call(D, e))) {
      var i = p.deps;
      if ((p.f & He) !== 0)
        e.rv < ee && (e.rv = ee, k === null && i !== null && i[S] === e ? S++ : k === null ? k = [e] : k.push(e));
      else {
        (p.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [p] : ve.call(s, p) || s.push(p);
      }
    }
  }
  if (se && Z.has(e))
    return Z.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (se) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Gt(a)) && (f = Ze(a)), Z.set(a, f), f;
    }
    var l = (a.f & F) === 0 && !L && p !== null && (Ne || (p.f & F) !== 0), u = (a.f & le) === 0;
    Se(a) && (l && (a.f |= F), St(a)), l && !u && (At(a), Vt(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function Vt(e) {
  if (e.f |= F, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & E) !== 0 && (t.f & F) === 0 && (At(
        /** @type {Derived} */
        t
      ), Vt(
        /** @type {Derived} */
        t
      ));
}
function Gt(e) {
  if (e.v === x) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & E) !== 0 && Gt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function zt(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const ft = globalThis.Deno?.core?.ops ?? null;
function tr(e, ...t) {
  ft?.[e] ? ft[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function at(e, t) {
  tr("op_set_text", e, t);
}
const nr = ["touchstart", "touchmove"];
function rr(e) {
  return nr.includes(e);
}
const be = Symbol("events"), Kt = /* @__PURE__ */ new Set(), Ge = /* @__PURE__ */ new Set();
function Ye(e, t, n) {
  (t[be] ??= {})[e] = n;
}
function ir(e) {
  for (var t = 0; t < e.length; t++)
    Kt.add(e[t]);
  for (var n of Ge)
    n(e);
}
let ut = null;
function ot(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  ut = e;
  var a = 0, f = ut === e && e[be];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[be] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Xt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = p, d = g;
    C(null), U(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var v = s[be]?.[r];
          v != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && v.call(s, e);
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
      e[be] = t, delete e.currentTarget, C(o), U(d);
    }
  }
}
const sr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function lr(e) {
  return (
    /** @type {string} */
    sr?.createHTML(e) ?? e
  );
}
function fr(e) {
  var t = Yn("template");
  return t.innerHTML = lr(e.replaceAll("<!>", "<!---->")), t.content;
}
function ct(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function we(e, t) {
  var n = (t & gn) !== 0, r = (t & wn) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = fr(s ? e : "<!>" + e), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Ce(i)));
    var a = (
      /** @type {TemplateNode} */
      r || Mt ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ce(a)
      ), l = (
        /** @type {TemplateNode} */
        a.lastChild
      );
      ct(f, l);
    } else
      ct(a, a);
    return a;
  };
}
function ue(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function ar(e, t) {
  return ur(e, t);
}
const Ae = /* @__PURE__ */ new Map();
function ur(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  In();
  var l = void 0, u = Gn(() => {
    var o = n ?? t.appendChild(De());
    An(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        _t({});
        var h = (
          /** @type {ComponentContext} */
          R
        );
        s && (h.c = s), i && (r.$$events = i), l = e(_, r) || {}, pt();
      },
      f
    );
    var d = /* @__PURE__ */ new Set(), c = (_) => {
      for (var h = 0; h < _.length; h++) {
        var v = _[h];
        if (!d.has(v)) {
          d.add(v);
          var w = rr(v);
          for (const Ie of [t, document]) {
            var O = Ae.get(Ie);
            O === void 0 && (O = /* @__PURE__ */ new Map(), Ae.set(Ie, O));
            var fe = O.get(v);
            fe === void 0 ? (Ie.addEventListener(v, ot, { passive: w }), O.set(v, 1)) : O.set(v, fe + 1);
          }
        }
      }
    };
    return c(Qt(Kt)), Ge.add(c), () => {
      for (var _ of d)
        for (const w of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Ae.get(w)
          ), v = (
            /** @type {number} */
            h.get(_)
          );
          --v == 0 ? (w.removeEventListener(_, ot), h.delete(_), h.size === 0 && Ae.delete(w)) : h.set(_, v);
        }
      Ge.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return or.set(l, u), l;
}
let or = /* @__PURE__ */ new WeakMap();
class Wt {
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
  #a = /* @__PURE__ */ new Map();
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
      ), r = this.#a.get(n);
      if (r)
        Qn(r), this.#l.delete(n);
      else {
        var i = this.#t.get(n);
        i && (this.#a.set(n, i.effect), this.#t.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, a] of this.#e) {
        if (this.#e.delete(s), s === t)
          break;
        const f = this.#t.get(a);
        f && (A(f.effect), this.#t.delete(a));
      }
      for (const [s, a] of this.#a) {
        if (s === n || this.#l.has(s)) continue;
        const f = () => {
          if (Array.from(this.#e.values()).includes(s)) {
            var u = document.createDocumentFragment();
            qt(a, u), u.append(De()), this.#t.set(s, { effect: a, fragment: u });
          } else
            A(a);
          this.#l.delete(s), this.#a.delete(s);
        };
        this.#r || !r ? (this.#l.add(s), xe(a, f, !1)) : f();
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
      n.includes(r) || (A(i.effect), this.#t.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      m
    ), i = qn();
    if (n && !this.#a.has(t) && !this.#t.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = De();
        s.append(a), this.#t.set(t, {
          effect: G(() => n(a)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          G(() => n(this.anchor))
        );
    if (this.#e.set(r, t), i) {
      for (const [f, l] of this.#a)
        f === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [f, l] of this.#t)
        f === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(this.#n), r.ondiscard(this.#i);
    } else
      this.#n(r);
  }
}
function cr(e, t, n = !1) {
  var r = new Wt(e), i = n ? re : 0;
  function s(a, f) {
    r.ensure(a, f);
  }
  Qe(() => {
    var a = !1;
    t((f, l = 0) => {
      a = !0, s(l, f);
    }), a || s(-1, null);
  }, i);
}
function hr(e, t, ...n) {
  var r = new Wt(e);
  Qe(() => {
    const i = t() ?? null;
    r.ensure(i, i && ((s) => i(s, ...n)));
  }, re);
}
function dr(e) {
  R === null && fn(), Vn(() => {
    const t = zt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
var vr = /* @__PURE__ */ we('<div style="display: flex; flex-direction: column; gap: 8px; padding: 16px;"><div style="display: flex; gap: 8px; padding: 8px; background: #2a2a3a;"><div>App Shell</div> <div>|</div> <div> </div> <div>|</div> <div> </div></div> <div><!></div> <div style="padding: 4px; background: #1a1a2a;">Footer</div></div>');
function _r(e, t) {
  _t(t, !0);
  let n = /* @__PURE__ */ I(!1);
  dr(() => {
    j(n, !0);
  });
  var r = vr(), i = ae(r), s = de(ae(i), 4), a = ae(s), f = de(s, 4), l = ae(f), u = de(i, 2), o = ae(u);
  hr(o, () => t.children), Wn(() => {
    at(a, `Layout: ${M(n) ? "mounted" : "pending"}`), at(l, `Route: ${t.path ?? ""}`);
  }), ue(e, r), pt();
}
var pr = /* @__PURE__ */ we("<div>Welcome to the app!</div>"), gr = /* @__PURE__ */ we("<div>Learn more about us.</div>"), wr = /* @__PURE__ */ we("<div>Get in touch.</div>"), mr = /* @__PURE__ */ we("<div>Page not found.</div>"), br = /* @__PURE__ */ we('<div style="display: flex; gap: 8px; margin-bottom: 8px;"><button>Home</button> <button>About</button> <button>Contact</button></div> <!>', 1);
function yr(e) {
  let t = /* @__PURE__ */ I("/");
  function n(r) {
    history.pushState(null, "", r), j(t, r, !0);
  }
  typeof globalThis.addEventListener == "function" && globalThis.addEventListener("popstate", () => {
    j(t, globalThis.location.pathname, !0);
  }), _r(e, {
    get path() {
      return M(t);
    },
    children: (i) => {
      var s = br(), a = jn(s), f = ae(a), l = de(f, 2), u = de(l, 2), o = de(a, 2);
      {
        var d = (v) => {
          var w = pr();
          ue(v, w);
        }, c = (v) => {
          var w = gr();
          ue(v, w);
        }, _ = (v) => {
          var w = wr();
          ue(v, w);
        }, h = (v) => {
          var w = mr();
          ue(v, w);
        };
        cr(o, (v) => {
          M(t) === "/" ? v(d) : M(t) === "/about" ? v(c, 1) : M(t) === "/contact" ? v(_, 2) : v(h, -1);
        });
      }
      Ye("click", f, () => n("/")), Ye("click", l, () => n("/about")), Ye("click", u, () => n("/contact")), ue(i, s);
    },
    $$slots: { default: !0 }
  });
}
ir(["click"]);
function xr(e) {
  return ar(yr, { target: e });
}
export {
  xr as default,
  xr as rvst_mount
};

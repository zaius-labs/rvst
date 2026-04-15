var Zt = Array.isArray, Jt = Array.prototype.indexOf, ae = Array.prototype.includes, Qt = Array.from, Xt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, en = Object.prototype, tn = Array.prototype, nn = Object.getPrototypeOf, tt = Object.isExtensible;
const rn = () => {
};
function sn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function vt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, ye = 4, De = 8, _t = 1 << 24, Q = 16, W = 32, ie = 64, Be = 128, N = 512, b = 1024, k = 2048, z = 4096, Y = 8192, q = 16384, de = 32768, nt = 1 << 25, ue = 65536, rt = 1 << 17, ln = 1 << 18, ve = 1 << 19, fn = 1 << 20, se = 65536, Ve = 1 << 21, Ke = 1 << 22, $ = 1 << 23, Le = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function an() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function un() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function on() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function cn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function hn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function dn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const vn = 1, _n = 2, E = Symbol(), pn = "http://www.w3.org/1999/xhtml";
function gn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function pt(e) {
  return e === this.v;
}
let j = null;
function oe(e) {
  j = e;
}
function mn(e, t = !1, n) {
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
function wn(e) {
  var t = (
    /** @type {ComponentContext} */
    j
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Hn(r);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function gt() {
  return !0;
}
let ee = [];
function mt() {
  var e = ee;
  ee = [], sn(e);
}
function ne(e) {
  if (ee.length === 0 && !me) {
    var t = ee;
    queueMicrotask(() => {
      t === ee && mt();
    });
  }
  ee.push(e);
}
function bn() {
  for (; ee.length > 0; )
    mt();
}
function wt(e) {
  var t = g;
  if (t === null)
    return _.f |= $, e;
  if ((t.f & de) === 0 && (t.f & ye) === 0)
    throw e;
  K(e, t);
}
function K(e, t) {
  for (; t !== null; ) {
    if ((t.f & Be) !== 0) {
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
const yn = -7169;
function w(e, t) {
  e.f = e.f & yn | t;
}
function $e(e) {
  (e.f & N) !== 0 || e.deps === null ? w(e, b) : w(e, z);
}
function bt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & se) === 0 || (t.f ^= se, bt(
        /** @type {Derived} */
        t.deps
      ));
}
function yt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & z) !== 0 && n.add(e), bt(e.deps), w(e, b);
}
const G = /* @__PURE__ */ new Set();
let p = null, C = null, He = null, me = !1, Ie = !1, fe = null, Se = null;
var it = 0;
let En = 1;
class J {
  id = En++;
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
  #t = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #a = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #r = /* @__PURE__ */ new Map();
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
  #n = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #l = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #f = /* @__PURE__ */ new Map();
  is_fork = !1;
  #c = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#u)
      for (const i of r.#r.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#f.has(n)) {
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
        w(r, k), this.schedule(r);
      for (r of n.m)
        w(r, z), this.schedule(r);
    }
  }
  #d() {
    if (it++ > 1e3 && (G.delete(this), kn()), !this.#h()) {
      for (const f of this.#s)
        this.#l.delete(f), w(f, k), this.schedule(f);
      for (const f of this.#l)
        w(f, z), this.schedule(f);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = fe = [], r = [], i = Se = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (a) {
        throw St(f), a;
      }
    if (p = null, i.length > 0) {
      var s = J.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (fe = null, Se = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, a] of this.#f)
        kt(f, a);
    } else {
      this.#e.size === 0 && G.delete(this), this.#s.clear(), this.#l.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), st(r), st(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      p
    );
    if (this.#n.length > 0) {
      const f = u ??= this;
      f.#n.push(...this.#n.filter((a) => !f.#n.includes(a)));
    }
    u !== null && (G.add(u), u.#d()), G.has(this) || this.#m();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, u = (s & (W | ie)) !== 0, f = u && (s & b) !== 0, a = f || (s & Y) !== 0 || this.#f.has(i);
      if (!a && i.fn !== null) {
        u ? i.f ^= b : (s & ye) !== 0 ? n.push(i) : xe(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
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
      yt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & $) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    p = this;
  }
  deactivate() {
    p = null, C = null;
  }
  flush() {
    try {
      Ie = !0, p = this, this.#d();
    } finally {
      it = 0, He = null, fe = null, Se = null, Ie = !1, p = null, C = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), G.delete(this);
  }
  #m() {
    for (const l of G) {
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
        var s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (var f of n)
          Et(f, i, s, u);
        if (l.#n.length > 0) {
          l.apply();
          for (var a of l.#n)
            l.#o(a, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of G)
      l.#u.has(this) && (l.#u.delete(this), l.#u.size === 0 && !l.#h() && (l.activate(), l.#d()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#e.get(n) ?? 0;
    if (this.#e.set(n, r + 1), t) {
      let i = this.#r.get(n) ?? 0;
      this.#r.set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let i = this.#e.get(n) ?? 0;
    if (i === 1 ? this.#e.delete(n) : this.#e.set(n, i - 1), t) {
      let s = this.#r.get(n) ?? 0;
      s === 1 ? this.#r.delete(n) : this.#r.set(n, s - 1);
    }
    this.#c || r || (this.#c = !0, ne(() => {
      this.#c = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#s.add(r);
    for (const r of n)
      this.#l.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#a.add(t);
  }
  settled() {
    return (this.#i ??= vt()).promise;
  }
  static ensure() {
    if (p === null) {
      const t = p = new J();
      Ie || (G.add(p), me || ne(() => {
        p === t && t.flush();
      }));
    }
    return p;
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
    if (He = t, t.b?.is_pending && (t.f & (ye | De | _t)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (fe !== null && n === g && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (ie | W)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function xn(e) {
  var t = me;
  me = !0;
  try {
    for (var n; ; ) {
      if (bn(), p === null)
        return (
          /** @type {T} */
          n
        );
      p.flush();
    }
  } finally {
    me = t;
  }
}
function kn() {
  try {
    un();
  } catch (e) {
    K(e, He);
  }
}
let V = null;
function st(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (q | Y)) === 0 && xe(r) && (V = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && jt(r), V?.size > 0)) {
        Z.clear();
        for (const i of V) {
          if ((i.f & (q | Y)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            V.has(u) && (V.delete(u), s.push(u)), u = u.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const a = s[f];
            (a.f & (q | Y)) === 0 && he(a);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function Et(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? Et(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ke | Q)) !== 0 && (s & k) === 0 && xt(i, t, r) && (w(i, k), Ze(
        /** @type {Effect} */
        i
      ));
    }
}
function xt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && xt(
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
function Ze(e) {
  p.schedule(e);
}
function kt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & z) !== 0 && t.m.push(e), w(e, b);
    for (var n = e.first; n !== null; )
      kt(n, t), n = n.next;
  }
}
function St(e) {
  w(e, b);
  for (var t = e.first; t !== null; )
    St(t), t = t.next;
}
function Sn(e) {
  let t = 0, n = Fe(0), r;
  return () => {
    Qe() && (I(n), Ct(() => (t === 0 && (r = Kt(() => e(() => we(n)))), t += 1, () => {
      ne(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var Tn = ue | ve;
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
  #t;
  /** @type {TemplateNode | null} */
  #a = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #c = 0;
  #u = 0;
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
  #o = null;
  #_ = Sn(() => (this.#o = Fe(this.#c), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#r = (s) => {
      var u = (
        /** @type {Effect} */
        g
      );
      u.b = this, u.f |= Be, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Lt(() => {
      this.#w();
    }, Tn);
  }
  #m() {
    try {
      this.#n = H(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = H(() => {
      n(
        this.#t,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#s = H(() => t(this.#t)), ne(() => {
      var n = this.#f = document.createDocumentFragment(), r = Me();
      n.append(r), this.#n = this.#g(() => H(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, be(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.#p(
        /** @type {Batch} */
        p
      ));
    }));
  }
  #w() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = H(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        zt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = H(() => n(this.#t));
      } else
        this.#p(
          /** @type {Batch} */
          p
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    yt(t, this.#v, this.#d);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var n = g, r = _, i = j;
    B(this.#i), F(this.#i), oe(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return wt(s), null;
    } finally {
      B(n), F(r), oe(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && be(this.#s, () => {
      this.#s = null;
    }), this.#f && (this.#t.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, ne(() => {
      this.#h = !1, this.#o && Re(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), I(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#e.onerror;
    let r = this.#e.failed;
    if (!n && !r)
      throw t;
    this.#n && (A(this.#n), this.#n = null), this.#s && (A(this.#s), this.#s = null), this.#l && (A(this.#l), this.#l = null);
    var i = !1, s = !1;
    const u = () => {
      if (i) {
        gn();
        return;
      }
      i = !0, s && dn(), this.#l !== null && be(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#w();
      });
    }, f = (a) => {
      try {
        s = !0, n?.(a, u), s = !1;
      } catch (l) {
        K(l, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return H(() => {
            var l = (
              /** @type {Effect} */
              g
            );
            l.b = this, l.f |= Be, r(
              this.#t,
              () => a,
              () => u
            );
          });
        } catch (l) {
          return K(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ne(() => {
      var a;
      try {
        a = this.transform_error(t);
      } catch (l) {
        K(l, this.#i && this.#i.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        f,
        /** @param {unknown} e */
        (l) => K(l, this.#i && this.#i.parent)
      ) : f(a);
    });
  }
}
function Mn(e, t, n, r) {
  const i = Dn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    g
  ), f = Nn(), a = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (u.f & q) === 0 && K(v, u);
    }
    Ae();
  }
  if (n.length === 0) {
    a.then(() => l(t.map(i)));
    return;
  }
  var o = Tt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Fn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => K(c, u)).finally(() => o());
  }
  a ? a.then(() => {
    f(), h(), Ae();
  }) : h();
}
function Nn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = _, n = j, r = (
    /** @type {Batch} */
    p
  );
  return function(s = !0) {
    B(e), F(t), oe(n), s && (e.f & q) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  B(null), F(null), oe(null), e && p?.deactivate();
}
function Tt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    p
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function Dn(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return g !== null && (g.f |= ve), {
    ctx: j,
    deps: null,
    effects: null,
    equals: pt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      E
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Fn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && an();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Fe(
    /** @type {V} */
    E
  ), u = !_, f = /* @__PURE__ */ new Map();
  return Wn(() => {
    var a = (
      /** @type {Effect} */
      g
    ), l = vt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (v) {
      l.reject(v), Ae();
    }
    var o = (
      /** @type {Batch} */
      p
    );
    if (u) {
      if ((a.f & de) !== 0)
        var h = Tt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(U), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(U);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var m = d === U;
        h(m);
      }
      if (!(d === U || (a.f & q) !== 0)) {
        if (o.activate(), d)
          s.f |= $, Re(s, d);
        else {
          (s.f & $) !== 0 && (s.f ^= $), Re(s, v);
          for (const [x, O] of f) {
            if (f.delete(x), x === o) break;
            O.reject(U);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Pt(() => {
    for (const a of f.values())
      a.reject(U);
  }), new Promise((a) => {
    function l(o) {
      function h() {
        o === i ? a(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function On(e) {
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
function Pn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & q) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Je(e) {
  var t, n = g;
  B(Pn(e));
  try {
    e.f &= ~se, On(e), t = Ut(e);
  } finally {
    B(n);
  }
  return t;
}
function At(e) {
  var t = e.v, n = Je(e);
  if (!e.equals(n) && (e.wv = Vt(), (!p?.is_fork || e.deps === null) && (e.v = n, p?.capture(e, t, !0), e.deps === null))) {
    w(e, b);
    return;
  }
  ce || (C !== null ? (Qe() || p?.is_fork) && C.set(e, n) : $e(e));
}
function Cn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = rn, t.ac = null, Ee(t, 0), Xe(t));
}
function Rt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Ue = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let Mt = !1;
function Fe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: pt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Fe(e);
  return Jn(n), n;
}
function M(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (_.f & rt) !== 0) && gt() && (_.f & (y | Q | Ke | rt)) !== 0 && (D === null || !ae.call(D, e)) && hn();
  let r = n ? _e(t) : t;
  return Re(e, r, Se);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Je(s), C === null && $e(s);
    }
    e.wv = Vt(), Nt(e, k, n), g !== null && (g.f & b) !== 0 && (g.f & (W | ie)) === 0 && (R === null ? Qn([e]) : R.push(e)), !i.is_fork && Ue.size > 0 && !Mt && Ln();
  }
  return t;
}
function Ln() {
  Mt = !1;
  for (const e of Ue)
    (e.f & b) !== 0 && w(e, z), xe(e) && he(e);
  Ue.clear();
}
function we(e) {
  M(e, e.v + 1);
}
function Nt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], f = u.f, a = (f & k) === 0;
      if (a && w(u, t), (f & y) !== 0) {
        var l = (
          /** @type {Derived} */
          u
        );
        C?.delete(l), (f & se) === 0 && (f & N && (u.f |= se), Nt(l, z, n));
      } else if (a) {
        var o = (
          /** @type {Effect} */
          u
        );
        (f & Q) !== 0 && V !== null && V.add(o), n !== null ? n.push(o) : Ze(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Le in e)
    return e;
  const t = nn(e);
  if (t !== en && t !== tn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Zt(e), i = /* @__PURE__ */ P(0), s = re, u = (f) => {
    if (re === s)
      return f();
    var a = _, l = re;
    F(null), ot(s);
    var o = f();
    return F(a), ot(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, a, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && on();
        var o = n.get(a);
        return o === void 0 ? u(() => {
          var h = /* @__PURE__ */ P(l.value);
          return n.set(a, h), h;
        }) : M(o, l.value, !0), !0;
      },
      deleteProperty(f, a) {
        var l = n.get(a);
        if (l === void 0) {
          if (a in f) {
            const o = u(() => /* @__PURE__ */ P(E));
            n.set(a, o), we(i);
          }
        } else
          M(l, E), we(i);
        return !0;
      },
      get(f, a, l) {
        if (a === Le)
          return e;
        var o = n.get(a), h = a in f;
        if (o === void 0 && (!h || ge(f, a)?.writable) && (o = u(() => {
          var v = _e(h ? f[a] : E), d = /* @__PURE__ */ P(v);
          return d;
        }), n.set(a, o)), o !== void 0) {
          var c = I(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, a, l);
      },
      getOwnPropertyDescriptor(f, a) {
        var l = Reflect.getOwnPropertyDescriptor(f, a);
        if (l && "value" in l) {
          var o = n.get(a);
          o && (l.value = I(o));
        } else if (l === void 0) {
          var h = n.get(a), c = h?.v;
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
      has(f, a) {
        if (a === Le)
          return !0;
        var l = n.get(a), o = l !== void 0 && l.v !== E || Reflect.has(f, a);
        if (l !== void 0 || g !== null && (!o || ge(f, a)?.writable)) {
          l === void 0 && (l = u(() => {
            var c = o ? _e(f[a]) : E, v = /* @__PURE__ */ P(c);
            return v;
          }), n.set(a, l));
          var h = I(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, a, l, o) {
        var h = n.get(a), c = a in f;
        if (r && a === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? M(d, E) : v in f && (d = u(() => /* @__PURE__ */ P(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(f, a)?.writable) && (h = u(() => /* @__PURE__ */ P(void 0)), M(h, _e(l)), n.set(a, h));
        else {
          c = h.v !== E;
          var m = u(() => _e(l));
          M(h, m);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, a);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof a == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(a);
            Number.isInteger(le) && le >= O.v && M(O, le + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        I(i);
        var a = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && a.push(l);
        return a;
      },
      setPrototypeOf() {
        cn();
      }
    }
  );
}
var lt, Dt, Ft, Ot;
function In() {
  if (lt === void 0) {
    lt = window, Dt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ft = ge(t, "firstChild").get, Ot = ge(t, "nextSibling").get, tt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), tt(n) && (n.__t = void 0);
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Ne(e) {
  return (
    /** @type {TemplateNode | null} */
    Ft.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return (
    /** @type {TemplateNode | null} */
    Ot.call(e)
  );
}
function je(e, t) {
  return /* @__PURE__ */ Ne(e);
}
function ft(e, t = !1) {
  {
    var n = /* @__PURE__ */ Ne(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Oe(n) : n;
  }
}
function jn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(r);
  return r;
}
function Yn() {
  return !1;
}
function qn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(pn, e, void 0)
  );
}
let at = !1;
function zn() {
  at || (at = !0, document.addEventListener(
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
function Pe(e) {
  var t = _, n = g;
  F(null), B(null);
  try {
    return e();
  } finally {
    F(t), B(n);
  }
}
function Bn(e, t, n, r = n) {
  e.addEventListener(t, () => Pe(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), zn();
}
function Vn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = g;
  n !== null && (n.f & Y) !== 0 && (e |= Y);
  var r = {
    ctx: j,
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
    fe !== null ? fe.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (u) {
      throw A(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & ue) !== 0 && i !== null && (i.f |= ue));
  }
  if (i !== null && (i.parent = n, n !== null && Vn(i, n), _ !== null && (_.f & y) !== 0 && (e & ie) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Qe() {
  return _ !== null && !L;
}
function Pt(e) {
  const t = X(De, null);
  return w(t, b), t.teardown = e, t;
}
function Hn(e) {
  return X(ye | fn, e);
}
function Un(e) {
  J.ensure();
  const t = X(ie | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function Wn(e) {
  return X(Ke | ve, e);
}
function Ct(e, t = 0) {
  return X(De | t, e);
}
function Gn(e, t = [], n = [], r = []) {
  Mn(r, t, n, (i) => {
    X(De, () => e(...i.map(I)));
  });
}
function Lt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function H(e) {
  return X(W | ve, e);
}
function It(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    ut(!0), F(null);
    try {
      t.call(null);
    } finally {
      ut(n), F(r);
    }
  }
}
function Xe(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Pe(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & ie) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Kn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & ln) !== 0) && e.nodes !== null && e.nodes.end !== null && ($n(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), w(e, nt), Xe(e, t && !n), Ee(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  It(e), e.f ^= nt, e.f |= q;
  var i = e.parent;
  i !== null && i.first !== null && jt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function $n(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Oe(e);
    e.remove(), e = n;
  }
}
function jt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  Yt(e, r, !0);
  var i = () => {
    n && A(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var f of r)
      f.out(u);
  } else
    i();
}
function Yt(e, t, n) {
  if ((e.f & Y) === 0) {
    e.f ^= Y;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & ue) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Q) !== 0;
      Yt(i, t, u ? n : !1), i = s;
    }
  }
}
function Zn(e) {
  qt(e, !0);
}
function qt(e, t) {
  if ((e.f & Y) !== 0) {
    e.f ^= Y, (e.f & b) === 0 && (w(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ue) !== 0 || (n.f & W) !== 0;
      qt(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function zt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Oe(n);
      t.append(n), n = i;
    }
}
let Te = !1, ce = !1;
function ut(e) {
  ce = e;
}
let _ = null, L = !1;
function F(e) {
  _ = e;
}
let g = null;
function B(e) {
  g = e;
}
let D = null;
function Jn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let S = null, T = 0, R = null;
function Qn(e) {
  R = e;
}
let Bt = 1, te = 0, re = te;
function ot(e) {
  re = e;
}
function Vt() {
  return ++Bt;
}
function xe(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~se), (t & z) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (xe(
        /** @type {Derived} */
        s
      ) && At(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && w(e, b);
  }
  return !1;
}
function Ht(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ae.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Ht(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? w(s, k) : (s.f & b) !== 0 && w(s, z), Ze(
        /** @type {Effect} */
        s
      ));
    }
}
function Ut(e) {
  var t = S, n = T, r = R, i = _, s = D, u = j, f = L, a = re, l = e.f;
  S = /** @type {null | Value[]} */
  null, T = 0, R = null, _ = (l & (W | ie)) === 0 ? e : null, D = null, oe(e.ctx), L = !1, re = ++te, e.ac !== null && (Pe(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Ve;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = p?.is_fork;
    if (S !== null) {
      var d;
      if (v || Ee(e, T), c !== null && T > 0)
        for (c.length = T + S.length, d = 0; d < S.length; d++)
          c[T + d] = S[d];
      else
        e.deps = c = S;
      if (Qe() && (e.f & N) !== 0)
        for (d = T; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && T < c.length && (Ee(e, T), c.length = T);
    if (gt() && R !== null && !L && c !== null && (e.f & (y | z | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        Ht(
          R[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (te++, i.deps !== null)
        for (let m = 0; m < n; m += 1)
          i.deps[m].rv = te;
      if (t !== null)
        for (const m of t)
          m.rv = te;
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & $) !== 0 && (e.f ^= $), h;
  } catch (m) {
    return wt(m);
  } finally {
    e.f ^= Ve, S = t, T = n, R = r, _ = i, D = s, oe(u), L = f, re = a;
  }
}
function Xn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Jt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & y) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !ae.call(S, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~se), $e(s), Cn(s), Ee(s, 0);
  }
}
function Ee(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Xn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & q) === 0) {
    w(e, b);
    var n = g, r = Te;
    g = e, Te = !0;
    try {
      (t & (Q | _t)) !== 0 ? Kn(e) : Xe(e), It(e);
      var i = Ut(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Bt;
      var s;
    } finally {
      Te = r, g = n;
    }
  }
}
async function er() {
  await Promise.resolve(), xn();
}
function I(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !L) {
    var r = g !== null && (g.f & q) !== 0;
    if (!r && (D === null || !ae.call(D, e))) {
      var i = _.deps;
      if ((_.f & Ve) !== 0)
        e.rv < te && (e.rv = te, S === null && i !== null && i[T] === e ? T++ : S === null ? S = [e] : S.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var f = u.v;
      return ((u.f & b) === 0 && u.reactions !== null || Gt(u)) && (f = Je(u)), Z.set(u, f), f;
    }
    var a = (u.f & N) === 0 && !L && _ !== null && (Te || (_.f & N) !== 0), l = (u.f & de) === 0;
    xe(u) && (a && (u.f |= N), At(u)), a && !l && (Rt(u), Wt(u));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & $) !== 0)
    throw e.v;
  return e.v;
}
function Wt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (Rt(
        /** @type {Derived} */
        t
      ), Wt(
        /** @type {Derived} */
        t
      ));
}
function Gt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & y) !== 0 && Gt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Kt(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const ct = globalThis.Deno?.core?.ops ?? null;
function tr(e, ...t) {
  ct?.[e] ? ct[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nr(e, t) {
  tr("op_set_text", e, t);
}
const rr = ["touchstart", "touchmove"];
function ir(e) {
  return rr.includes(e);
}
const pe = Symbol("events"), $t = /* @__PURE__ */ new Set(), We = /* @__PURE__ */ new Set();
function sr(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || Ge.call(t, s), !s.cancelBubble)
      return Pe(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ne(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function lr(e, t, n, r, i) {
  var s = { capture: r, passive: i }, u = sr(e, t, n, s);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Pt(() => {
    t.removeEventListener(e, u, s);
  });
}
function fr(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function ar(e) {
  for (var t = 0; t < e.length; t++)
    $t.add(e[t]);
  for (var n of We)
    n(e);
}
let ht = null;
function Ge(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  ht = e;
  var u = 0, f = ht === e && e[pe];
  if (f) {
    var a = i.indexOf(f);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    a <= l && (u = a);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Xt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = g;
    F(null), B(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var m = s[pe]?.[r];
          m != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && m.call(s, e);
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
      e[pe] = t, delete e.currentTarget, F(o), B(h);
    }
  }
}
const ur = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function or(e) {
  return (
    /** @type {string} */
    ur?.createHTML(e) ?? e
  );
}
function cr(e) {
  var t = qn("template");
  return t.innerHTML = or(e.replaceAll("<!>", "<!---->")), t.content;
}
function dt(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function et(e, t) {
  var n = (t & vn) !== 0, r = (t & _n) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = cr(s ? e : "<!>" + e), n || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ Ne(i)));
    var u = (
      /** @type {TemplateNode} */
      r || Dt ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ne(u)
      ), a = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      dt(f, a);
    } else
      dt(u, u);
    return u;
  };
}
function Ye(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function hr(e, t) {
  return dr(e, t);
}
const ke = /* @__PURE__ */ new Map();
function dr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: f }) {
  In();
  var a = void 0, l = Un(() => {
    var o = n ?? t.appendChild(Me());
    An(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        mn({});
        var d = (
          /** @type {ComponentContext} */
          j
        );
        s && (d.c = s), i && (r.$$events = i), a = e(v, r) || {}, wn();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var m = v[d];
        if (!h.has(m)) {
          h.add(m);
          var x = ir(m);
          for (const Ce of [t, document]) {
            var O = ke.get(Ce);
            O === void 0 && (O = /* @__PURE__ */ new Map(), ke.set(Ce, O));
            var le = O.get(m);
            le === void 0 ? (Ce.addEventListener(m, Ge, { passive: x }), O.set(m, 1)) : O.set(m, le + 1);
          }
        }
      }
    };
    return c(Qt($t)), We.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            ke.get(x)
          ), m = (
            /** @type {number} */
            d.get(v)
          );
          --m == 0 ? (x.removeEventListener(v, Ge), d.delete(v), d.size === 0 && ke.delete(x)) : d.set(v, m);
        }
      We.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return vr.set(a, l), a;
}
let vr = /* @__PURE__ */ new WeakMap();
class _r {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
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
  #e = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #i = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#i = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#a.get(n);
      if (r)
        Zn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const f = this.#e.get(u);
        f && (A(f.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#a) {
        if (s === n || this.#r.has(s)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var l = document.createDocumentFragment();
            zt(u, l), l.append(Me()), this.#e.set(s, { effect: u, fragment: l });
          } else
            A(u);
          this.#r.delete(s), this.#a.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), be(u, f, !1)) : f();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #s = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (A(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      p
    ), i = Yn();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = Me();
        s.append(u), this.#e.set(t, {
          effect: H(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          H(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [f, a] of this.#a)
        f === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [f, a] of this.#e)
        f === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function pr(e, t, n = !1) {
  var r = new _r(e), i = n ? ue : 0;
  function s(u, f) {
    r.ensure(u, f);
  }
  Lt(() => {
    var u = !1;
    t((f, a = 0) => {
      u = !0, s(a, f);
    }), u || s(-1, null);
  }, i);
}
function gr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Bn(e, "input", async (i) => {
    var s = i ? e.defaultValue : e.value;
    if (s = qe(e) ? ze(s) : s, n(s), p !== null && r.add(p), await er(), s !== (s = t())) {
      var u = e.selectionStart, f = e.selectionEnd, a = e.value.length;
      if (e.value = s ?? "", f !== null) {
        var l = e.value.length;
        u === f && f === a && l > a ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = u, e.selectionEnd = Math.min(f, l));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Kt(t) == null && e.value && (n(qe(e) ? ze(e.value) : e.value), p !== null && r.add(p)), Ct(() => {
    var i = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        p
      );
      if (r.has(s))
        return;
    }
    qe(e) && i === ze(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function qe(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function ze(e) {
  return e === "" ? null : +e;
}
var mr = /* @__PURE__ */ et("<div> </div> <button>Reset</button>", 1), wr = /* @__PURE__ */ et('<form><input placeholder="Your name"/> <button type="submit">Submit</button></form> <div>Status: idle</div>', 1), br = /* @__PURE__ */ et("<div><!></div>");
function yr(e) {
  let t = /* @__PURE__ */ P(""), n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P("");
  function i(l) {
    l.preventDefault(), M(r, I(t), !0), M(n, !0);
  }
  var s = br(), u = je(s);
  {
    var f = (l) => {
      var o = mr(), h = ft(o), c = je(h), v = jn(h, 2);
      Gn(() => nr(c, `Submitted: ${I(r) ?? ""}`)), fr("click", v, () => {
        M(n, !1), M(t, "");
      }), Ye(l, o);
    }, a = (l) => {
      var o = wr(), h = ft(o), c = je(h);
      lr("submit", h, i), gr(c, () => I(t), (v) => M(t, v)), Ye(l, o);
    };
    pr(u, (l) => {
      I(n) ? l(f) : l(a, -1);
    });
  }
  Ye(e, s);
}
ar(["click"]);
function xr(e) {
  return hr(yr, { target: e });
}
export {
  xr as default,
  xr as rvst_mount
};

var Zt = Array.isArray, Jt = Array.prototype.indexOf, ce = Array.prototype.includes, Qt = Array.from, Xt = Object.defineProperty, me = Object.getOwnPropertyDescriptor, en = Object.prototype, tn = Array.prototype, nn = Object.getPrototypeOf, Xe = Object.isExtensible;
const rn = () => {
};
function sn(e) {
  return typeof e?.then == "function";
}
function ln(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ht() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const x = 2, Ee = 4, Ce = 8, dt = 1 << 24, Q = 16, V = 32, se = 64, $e = 128, D = 512, y = 1024, k = 2048, $ = 4096, q = 8192, Y = 16384, pe = 32768, et = 1 << 25, xe = 65536, tt = 1 << 17, fn = 1 << 18, ge = 1 << 19, an = 1 << 20, le = 65536, ze = 1 << 21, Ve = 1 << 22, Z = 1 << 23, Ie = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function un() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function on() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function cn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function hn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function dn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function vn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const _n = 2, E = Symbol(), pn = "http://www.w3.org/1999/xhtml";
function gn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function vt(e) {
  return e === this.v;
}
let I = null;
function he(e) {
  I = e;
}
function _t(e, t = !1, n) {
  I = {
    p: I,
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
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Yn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function gt() {
  return !0;
}
let ee = [];
function wt() {
  var e = ee;
  ee = [], ln(e);
}
function ne(e) {
  if (ee.length === 0 && !oe) {
    var t = ee;
    queueMicrotask(() => {
      t === ee && wt();
    });
  }
  ee.push(e);
}
function wn() {
  for (; ee.length > 0; )
    wt();
}
function mt(e) {
  var t = g;
  if (t === null)
    return p.f |= Z, e;
  if ((t.f & pe) === 0 && (t.f & Ee) === 0)
    throw e;
  W(e, t);
}
function W(e, t) {
  for (; t !== null; ) {
    if ((t.f & $e) !== 0) {
      if ((t.f & pe) === 0)
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
const mn = -7169;
function b(e, t) {
  e.f = e.f & mn | t;
}
function Ge(e) {
  (e.f & D) !== 0 || e.deps === null ? b(e, y) : b(e, $);
}
function bt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & x) === 0 || (t.f & le) === 0 || (t.f ^= le, bt(
        /** @type {Derived} */
        t.deps
      ));
}
function yt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), bt(e.deps), b(e, y);
}
const K = /* @__PURE__ */ new Set();
let w = null, O = null, He = null, oe = !1, je = !1, ae = null, De = null;
var nt = 0;
let bn = 1;
class G {
  id = bn++;
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
        b(r, k), this.schedule(r);
      for (r of n.m)
        b(r, $), this.schedule(r);
    }
  }
  #d() {
    if (nt++ > 1e3 && (K.delete(this), En()), !this.#h()) {
      for (const l of this.#s)
        this.#l.delete(l), b(l, k), this.schedule(l);
      for (const l of this.#l)
        b(l, $), this.schedule(l);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ae = [], r = [], i = De = [];
    for (const l of t)
      try {
        this.#o(l, n, r);
      } catch (a) {
        throw Tt(l), a;
      }
    if (w = null, i.length > 0) {
      var s = G.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (ae = null, De = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [l, a] of this.#f)
        kt(l, a);
    } else {
      this.#e.size === 0 && K.delete(this), this.#s.clear(), this.#l.clear();
      for (const l of this.#t) l(this);
      this.#t.clear(), rt(r), rt(n), this.#i?.resolve();
    }
    var u = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const l = u ??= this;
      l.#n.push(...this.#n.filter((a) => !l.#n.includes(a)));
    }
    u !== null && (K.add(u), u.#d()), K.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, u = (s & (V | se)) !== 0, l = u && (s & y) !== 0, a = l || (s & q) !== 0 || this.#f.has(i);
      if (!a && i.fn !== null) {
        u ? i.f ^= y : (s & Ee) !== 0 ? n.push(i) : Se(i) && ((s & Q) !== 0 && this.#l.add(i), _e(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & Z) === 0 && (this.current.set(t, [t.v, r]), O?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, O = null;
  }
  flush() {
    try {
      je = !0, w = this, this.#d();
    } finally {
      nt = 0, He = null, ae = null, De = null, je = !1, w = null, O = null, J.clear();
    }
  }
  discard() {
    for (const t of this.#a) t(this);
    this.#a.clear(), K.delete(this);
  }
  #w() {
    for (const f of K) {
      var t = f.id < this.id, n = [];
      for (const [o, [d, c]] of this.current) {
        if (f.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(o)[0]
          );
          if (t && d !== r)
            f.current.set(o, [d, c]);
          else
            continue;
        }
        n.push(o);
      }
      var i = [...f.current.keys()].filter((o) => !this.current.has(o));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var s = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
        for (var l of n)
          Et(l, i, s, u);
        if (f.#n.length > 0) {
          f.apply();
          for (var a of f.#n)
            f.#o(a, [], []);
          f.#n = [];
        }
        f.deactivate();
      }
    }
    for (const f of K)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#h() && (f.activate(), f.#d()));
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
    return (this.#i ??= ht()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new G();
      je || (K.add(w), oe || ne(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      O = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (He = t, t.b?.is_pending && (t.f & (Ee | Ce | dt)) !== 0 && (t.f & pe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ae !== null && n === g && (p === null || (p.f & x) === 0))
        return;
      if ((r & (se | V)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#n.push(n);
  }
}
function yn(e) {
  var t = oe;
  oe = !0;
  try {
    for (var n; ; ) {
      if (wn(), w === null)
        return (
          /** @type {T} */
          n
        );
      w.flush();
    }
  } finally {
    oe = t;
  }
}
function En() {
  try {
    on();
  } catch (e) {
    W(e, He);
  }
}
let H = null;
function rt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Y | q)) === 0 && Se(r) && (H = /* @__PURE__ */ new Set(), _e(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && qt(r), H?.size > 0)) {
        J.clear();
        for (const i of H) {
          if ((i.f & (Y | q)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            H.has(u) && (H.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const a = s[l];
            (a.f & (Y | q)) === 0 && _e(a);
          }
        }
        H.clear();
      }
    }
    H = null;
  }
}
function Et(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & x) !== 0 ? Et(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ve | Q)) !== 0 && (s & k) === 0 && xt(i, t, r) && (b(i, k), Ke(
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
      if (ce.call(t, i))
        return !0;
      if ((i.f & x) !== 0 && xt(
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
function kt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), b(e, y);
    for (var n = e.first; n !== null; )
      kt(n, t), n = n.next;
  }
}
function Tt(e) {
  b(e, y);
  for (var t = e.first; t !== null; )
    Tt(t), t = t.next;
}
function xn(e) {
  let t = 0, n = de(0), r;
  return () => {
    Je() && (A(n), Hn(() => (t === 0 && (r = Zn(() => e(() => be(n)))), t += 1, () => {
      ne(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, be(n));
      });
    })));
  };
}
var kn = xe | ge;
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
  #_ = xn(() => (this.#o = de(this.#c), () => {
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
      u.b = this, u.f |= $e, r(s);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = jt(() => {
      this.#m();
    }, kn);
  }
  #w() {
    try {
      this.#n = B(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = B(() => {
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
    t && (this.is_pending = !0, this.#s = B(() => t(this.#t)), ne(() => {
      var n = this.#f = document.createDocumentFragment(), r = Me();
      n.append(r), this.#n = this.#g(() => B(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, ye(
        /** @type {Effect} */
        this.#s,
        () => {
          this.#s = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#c = 0, this.#n = B(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        zt(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = B(() => n(this.#t));
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
    var n = g, r = p, i = I;
    z(this.#i), M(this.#i), he(this.#i.ctx);
    try {
      return G.ensure(), t();
    } catch (s) {
      return mt(s), null;
    } finally {
      z(n), M(r), he(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#s && ye(this.#s, () => {
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
      this.#h = !1, this.#o && re(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), A(
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
    this.#n && (R(this.#n), this.#n = null), this.#s && (R(this.#s), this.#s = null), this.#l && (R(this.#l), this.#l = null);
    var i = !1, s = !1;
    const u = () => {
      if (i) {
        gn();
        return;
      }
      i = !0, s && vn(), this.#l !== null && ye(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, l = (a) => {
      try {
        s = !0, n?.(a, u), s = !1;
      } catch (f) {
        W(f, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return B(() => {
            var f = (
              /** @type {Effect} */
              g
            );
            f.b = this, f.f |= $e, r(
              this.#t,
              () => a,
              () => u
            );
          });
        } catch (f) {
          return W(
            f,
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
      } catch (f) {
        W(f, this.#i && this.#i.parent);
        return;
      }
      a !== null && typeof a == "object" && typeof /** @type {any} */
      a.then == "function" ? a.then(
        l,
        /** @param {unknown} e */
        (f) => W(f, this.#i && this.#i.parent)
      ) : l(a);
    });
  }
}
function An(e, t, n, r) {
  const i = Rn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var u = (
    /** @type {Effect} */
    g
  ), l = St(), a = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    l();
    try {
      r(c);
    } catch (v) {
      (u.f & Y) === 0 && W(v, u);
    }
    ke();
  }
  if (n.length === 0) {
    a.then(() => f(t.map(i)));
    return;
  }
  var o = At();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ Nn(c))).then((c) => f([...t.map(i), ...c])).catch((c) => W(c, u)).finally(() => o());
  }
  a ? a.then(() => {
    l(), d(), ke();
  }) : d();
}
function St() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), M(t), he(n), s && (e.f & Y) === 0 && (r?.activate(), r?.apply());
  };
}
function ke(e = !0) {
  z(null), M(null), he(null), e && w?.deactivate();
}
function At() {
  var e = (
    /** @type {Effect} */
    g
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
function Rn(e) {
  var t = x | k, n = p !== null && (p.f & x) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= ge), {
    ctx: I,
    deps: null,
    effects: null,
    equals: vt,
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
function Nn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && un();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = de(
    /** @type {V} */
    E
  ), u = !p, l = /* @__PURE__ */ new Map();
  return zn(() => {
    var a = (
      /** @type {Effect} */
      g
    ), f = ht();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(ke);
    } catch (v) {
      f.reject(v), ke();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (u) {
      if ((a.f & pe) !== 0)
        var d = At();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        l.get(o)?.reject(U), l.delete(o);
      else {
        for (const v of l.values())
          v.reject(U);
        l.clear();
      }
      l.set(o, f);
    }
    const c = (v, h = void 0) => {
      if (d) {
        var _ = h === U;
        d(_);
      }
      if (!(h === U || (a.f & Y) !== 0)) {
        if (o.activate(), h)
          s.f |= Z, re(s, h);
        else {
          (s.f & Z) !== 0 && (s.f ^= Z), re(s, v);
          for (const [m, C] of l) {
            if (l.delete(m), m === o) break;
            C.reject(U);
          }
        }
        o.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), qn(() => {
    for (const a of l.values())
      a.reject(U);
  }), new Promise((a) => {
    function f(o) {
      function d() {
        o === i ? a(s) : f(i);
      }
      o.then(d, d);
    }
    f(i);
  });
}
function Dn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      R(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Fn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & x) === 0)
      return (t.f & Y) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function We(e) {
  var t, n = g;
  z(Fn(e));
  try {
    e.f &= ~le, Dn(e), t = Vt(e);
  } finally {
    z(n);
  }
  return t;
}
function Rt(e) {
  var t = e.v, n = We(e);
  if (!e.equals(n) && (e.wv = Bt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, y);
    return;
  }
  ve || (O !== null ? (Je() || w?.is_fork) && O.set(e, n) : Ge(e));
}
function Mn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = rn, t.ac = null, Te(t, 0), Qe(t));
}
function Nt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && _e(t);
}
let Be = /* @__PURE__ */ new Set();
const J = /* @__PURE__ */ new Map();
let Dt = !1;
function de(e, t) {
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
function j(e, t) {
  const n = de(e);
  return Gn(n), n;
}
function L(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (p.f & tt) !== 0) && gt() && (p.f & (x | Q | Ve | tt)) !== 0 && (F === null || !ce.call(F, e)) && dn();
  let r = n ? ue(t) : t;
  return re(e, r, De);
}
function re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ve ? J.set(e, t) : J.set(e, r), e.v = t;
    var i = G.ensure();
    if (i.capture(e, r), (e.f & x) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && We(s), O === null && Ge(s);
    }
    e.wv = Bt(), Ft(e, k, n), g !== null && (g.f & y) !== 0 && (g.f & (V | se)) === 0 && (N === null ? Kn([e]) : N.push(e)), !i.is_fork && Be.size > 0 && !Dt && Cn();
  }
  return t;
}
function Cn() {
  Dt = !1;
  for (const e of Be)
    (e.f & y) !== 0 && b(e, $), Se(e) && _e(e);
  Be.clear();
}
function On(e, t = 1) {
  var n = A(e), r = t === 1 ? n++ : n--;
  return L(e, n), r;
}
function be(e) {
  L(e, e.v + 1);
}
function Ft(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, a = (l & k) === 0;
      if (a && b(u, t), (l & x) !== 0) {
        var f = (
          /** @type {Derived} */
          u
        );
        O?.delete(f), (l & le) === 0 && (l & D && (u.f |= le), Ft(f, $, n));
      } else if (a) {
        var o = (
          /** @type {Effect} */
          u
        );
        (l & Q) !== 0 && H !== null && H.add(o), n !== null ? n.push(o) : Ke(o);
      }
    }
}
function ue(e) {
  if (typeof e != "object" || e === null || Ie in e)
    return e;
  const t = nn(e);
  if (t !== en && t !== tn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Zt(e), i = /* @__PURE__ */ j(0), s = ie, u = (l) => {
    if (ie === s)
      return l();
    var a = p, f = ie;
    M(null), lt(s);
    var o = l();
    return M(a), lt(f), o;
  };
  return r && n.set("length", /* @__PURE__ */ j(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(l, a, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && cn();
        var o = n.get(a);
        return o === void 0 ? u(() => {
          var d = /* @__PURE__ */ j(f.value);
          return n.set(a, d), d;
        }) : L(o, f.value, !0), !0;
      },
      deleteProperty(l, a) {
        var f = n.get(a);
        if (f === void 0) {
          if (a in l) {
            const o = u(() => /* @__PURE__ */ j(E));
            n.set(a, o), be(i);
          }
        } else
          L(f, E), be(i);
        return !0;
      },
      get(l, a, f) {
        if (a === Ie)
          return e;
        var o = n.get(a), d = a in l;
        if (o === void 0 && (!d || me(l, a)?.writable) && (o = u(() => {
          var v = ue(d ? l[a] : E), h = /* @__PURE__ */ j(v);
          return h;
        }), n.set(a, o)), o !== void 0) {
          var c = A(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(l, a, f);
      },
      getOwnPropertyDescriptor(l, a) {
        var f = Reflect.getOwnPropertyDescriptor(l, a);
        if (f && "value" in f) {
          var o = n.get(a);
          o && (f.value = A(o));
        } else if (f === void 0) {
          var d = n.get(a), c = d?.v;
          if (d !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return f;
      },
      has(l, a) {
        if (a === Ie)
          return !0;
        var f = n.get(a), o = f !== void 0 && f.v !== E || Reflect.has(l, a);
        if (f !== void 0 || g !== null && (!o || me(l, a)?.writable)) {
          f === void 0 && (f = u(() => {
            var c = o ? ue(l[a]) : E, v = /* @__PURE__ */ j(c);
            return v;
          }), n.set(a, f));
          var d = A(f);
          if (d === E)
            return !1;
        }
        return o;
      },
      set(l, a, f, o) {
        var d = n.get(a), c = a in l;
        if (r && a === "length")
          for (var v = f; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? L(h, E) : v in l && (h = u(() => /* @__PURE__ */ j(E)), n.set(v + "", h));
          }
        if (d === void 0)
          (!c || me(l, a)?.writable) && (d = u(() => /* @__PURE__ */ j(void 0)), L(d, ue(f)), n.set(a, d));
        else {
          c = d.v !== E;
          var _ = u(() => ue(f));
          L(d, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(l, a);
        if (m?.set && m.set.call(o, f), !c) {
          if (r && typeof a == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), fe = Number(a);
            Number.isInteger(fe) && fe >= C.v && L(C, fe + 1);
          }
          be(i);
        }
        return !0;
      },
      ownKeys(l) {
        A(i);
        var a = Reflect.ownKeys(l).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== E;
        });
        for (var [f, o] of n)
          o.v !== E && !(f in l) && a.push(f);
        return a;
      },
      setPrototypeOf() {
        hn();
      }
    }
  );
}
var it, Mt, Ct, Ot;
function Pn() {
  if (it === void 0) {
    it = window, Mt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ct = me(t, "firstChild").get, Ot = me(t, "nextSibling").get, Xe(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Xe(n) && (n.__t = void 0);
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Pt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ct.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ze(e) {
  return (
    /** @type {TemplateNode | null} */
    Ot.call(e)
  );
}
function Ae(e, t) {
  return /* @__PURE__ */ Pt(e);
}
function Le(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ze(r);
  return r;
}
function In() {
  return !1;
}
function jn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(pn, e, void 0)
  );
}
function It(e) {
  var t = p, n = g;
  M(null), z(null);
  try {
    return e();
  } finally {
    M(t), z(n);
  }
}
function Ln(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = g;
  n !== null && (n.f & q) !== 0 && (e |= q);
  var r = {
    ctx: I,
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
  if ((e & Ee) !== 0)
    ae !== null ? ae.push(r) : G.ensure().schedule(r);
  else if (t !== null) {
    try {
      _e(r);
    } catch (u) {
      throw R(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ge) === 0 && (i = i.first, (e & Q) !== 0 && (e & xe) !== 0 && i !== null && (i.f |= xe));
  }
  if (i !== null && (i.parent = n, n !== null && Ln(i, n), p !== null && (p.f & x) !== 0 && (e & se) === 0)) {
    var s = (
      /** @type {Derived} */
      p
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Je() {
  return p !== null && !P;
}
function qn(e) {
  const t = X(Ce, null);
  return b(t, y), t.teardown = e, t;
}
function Yn(e) {
  return X(Ee | an, e);
}
function $n(e) {
  G.ensure();
  const t = X(se | ge, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ye(t, () => {
      R(t), r(void 0);
    }) : (R(t), r(void 0));
  });
}
function zn(e) {
  return X(Ve | ge, e);
}
function Hn(e, t = 0) {
  return X(Ce | t, e);
}
function qe(e, t = [], n = [], r = []) {
  An(r, t, n, (i) => {
    X(Ce, () => e(...i.map(A)));
  });
}
function jt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function B(e) {
  return X(V | ge, e);
}
function Lt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ve, r = p;
    st(!0), M(null);
    try {
      t.call(null);
    } finally {
      st(n), M(r);
    }
  }
}
function Qe(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && It(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & se) !== 0 ? n.parent = null : R(n, t), n = r;
  }
}
function Bn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && R(t), t = n;
  }
}
function R(e, t = !0) {
  var n = !1;
  (t || (e.f & fn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Un(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, et), Qe(e, t && !n), Te(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Lt(e), e.f ^= et, e.f |= Y;
  var i = e.parent;
  i !== null && i.first !== null && qt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Un(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ze(e);
    e.remove(), e = n;
  }
}
function qt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ye(e, t, n = !0) {
  var r = [];
  Yt(e, r, !0);
  var i = () => {
    n && R(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var l of r)
      l.out(u);
  } else
    i();
}
function Yt(e, t, n) {
  if ((e.f & q) === 0) {
    e.f ^= q;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next, u = (i.f & xe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & Q) !== 0;
      Yt(i, t, u ? n : !1), i = s;
    }
  }
}
function Vn(e) {
  $t(e, !0);
}
function $t(e, t) {
  if ((e.f & q) !== 0) {
    e.f ^= q, (e.f & y) === 0 && (b(e, k), G.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & xe) !== 0 || (n.f & V) !== 0;
      $t(n, i ? t : !1), n = r;
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
      var i = n === r ? null : /* @__PURE__ */ Ze(n);
      t.append(n), n = i;
    }
}
let Fe = !1, ve = !1;
function st(e) {
  ve = e;
}
let p = null, P = !1;
function M(e) {
  p = e;
}
let g = null;
function z(e) {
  g = e;
}
let F = null;
function Gn(e) {
  p !== null && (F === null ? F = [e] : F.push(e));
}
let T = null, S = 0, N = null;
function Kn(e) {
  N = e;
}
let Ht = 1, te = 0, ie = te;
function lt(e) {
  ie = e;
}
function Bt() {
  return ++Ht;
}
function Se(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & x && (e.f &= ~le), (t & $) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Se(
        /** @type {Derived} */
        s
      ) && Rt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    O === null && b(e, y);
  }
  return !1;
}
function Ut(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(F !== null && ce.call(F, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & x) !== 0 ? Ut(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, k) : (s.f & y) !== 0 && b(s, $), Ke(
        /** @type {Effect} */
        s
      ));
    }
}
function Vt(e) {
  var t = T, n = S, r = N, i = p, s = F, u = I, l = P, a = ie, f = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, N = null, p = (f & (V | se)) === 0 ? e : null, F = null, he(e.ctx), P = !1, ie = ++te, e.ac !== null && (It(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= ze;
    var o = (
      /** @type {Function} */
      e.fn
    ), d = o();
    e.f |= pe;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var h;
      if (v || Te(e, S), c !== null && S > 0)
        for (c.length = S + T.length, h = 0; h < T.length; h++)
          c[S + h] = T[h];
      else
        e.deps = c = T;
      if (Je() && (e.f & D) !== 0)
        for (h = S; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (Te(e, S), c.length = S);
    if (gt() && N !== null && !P && c !== null && (e.f & (x | $ | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      N.length; h++)
        Ut(
          N[h],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (te++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = te;
      if (t !== null)
        for (const _ of t)
          _.rv = te;
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & Z) !== 0 && (e.f ^= Z), d;
  } catch (_) {
    return mt(_);
  } finally {
    e.f ^= ze, T = t, S = n, N = r, p = i, F = s, he(u), P = l, ie = a;
  }
}
function Wn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Jt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & x) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ce.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~le), Ge(s), Mn(s), Te(s, 0);
  }
}
function Te(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Wn(e, n[r]);
}
function _e(e) {
  var t = e.f;
  if ((t & Y) === 0) {
    b(e, y);
    var n = g, r = Fe;
    g = e, Fe = !0;
    try {
      (t & (Q | dt)) !== 0 ? Bn(e) : Qe(e), Lt(e);
      var i = Vt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ht;
      var s;
    } finally {
      Fe = r, g = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & x) !== 0;
  if (p !== null && !P) {
    var r = g !== null && (g.f & Y) !== 0;
    if (!r && (F === null || !ce.call(F, e))) {
      var i = p.deps;
      if ((p.f & ze) !== 0)
        e.rv < te && (e.rv = te, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (p.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [p] : ce.call(s, p) || s.push(p);
      }
    }
  }
  if (ve && J.has(e))
    return J.get(e);
  if (n) {
    var u = (
      /** @type {Derived} */
      e
    );
    if (ve) {
      var l = u.v;
      return ((u.f & y) === 0 && u.reactions !== null || Kt(u)) && (l = We(u)), J.set(u, l), l;
    }
    var a = (u.f & D) === 0 && !P && p !== null && (Fe || (p.f & D) !== 0), f = (u.f & pe) === 0;
    Se(u) && (a && (u.f |= D), Rt(u)), a && !f && (Nt(u), Gt(u));
  }
  if (O?.has(e))
    return O.get(e);
  if ((e.f & Z) !== 0)
    throw e.v;
  return e.v;
}
function Gt(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & x) !== 0 && (t.f & D) === 0 && (Nt(
        /** @type {Derived} */
        t
      ), Gt(
        /** @type {Derived} */
        t
      ));
}
function Kt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (J.has(t) || (t.f & x) !== 0 && Kt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Zn(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const ft = globalThis.Deno?.core?.ops ?? null;
function Jn(e, ...t) {
  ft?.[e] ? ft[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ye(e, t) {
  Jn("op_set_text", e, t);
}
const Qn = ["touchstart", "touchmove"];
function Xn(e) {
  return Qn.includes(e);
}
const we = Symbol("events"), Wt = /* @__PURE__ */ new Set(), Ue = /* @__PURE__ */ new Set();
function at(e, t, n) {
  (t[we] ??= {})[e] = n;
}
function er(e) {
  for (var t = 0; t < e.length; t++)
    Wt.add(e[t]);
  for (var n of Ue)
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
  var u = 0, l = ut === e && e[we];
  if (l) {
    var a = i.indexOf(l);
    if (a !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[we] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    a <= f && (u = a);
  }
  if (s = /** @type {Element} */
  i[u] || e.target, s !== t) {
    Xt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = p, d = g;
    M(null), z(null);
    try {
      for (var c, v = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var _ = s[we]?.[r];
          _ != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && _.call(s, e);
        } catch (m) {
          c ? v.push(m) : c = m;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let m of v)
          queueMicrotask(() => {
            throw m;
          });
        throw c;
      }
    } finally {
      e[we] = t, delete e.currentTarget, M(o), z(d);
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
  var t = jn("template");
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
function Oe(e, t) {
  var n = (t & _n) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = rr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Pt(r));
    var s = (
      /** @type {TemplateNode} */
      n || Mt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return ir(s, s), s;
  };
}
function Re(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function sr(e, t) {
  return lr(e, t);
}
const Ne = /* @__PURE__ */ new Map();
function lr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  Pn();
  var a = void 0, f = $n(() => {
    var o = n ?? t.appendChild(Me());
    Tn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        _t({});
        var h = (
          /** @type {ComponentContext} */
          I
        );
        s && (h.c = s), i && (r.$$events = i), a = e(v, r) || {}, pt();
      },
      l
    );
    var d = /* @__PURE__ */ new Set(), c = (v) => {
      for (var h = 0; h < v.length; h++) {
        var _ = v[h];
        if (!d.has(_)) {
          d.add(_);
          var m = Xn(_);
          for (const Pe of [t, document]) {
            var C = Ne.get(Pe);
            C === void 0 && (C = /* @__PURE__ */ new Map(), Ne.set(Pe, C));
            var fe = C.get(_);
            fe === void 0 ? (Pe.addEventListener(_, ot, { passive: m }), C.set(_, 1)) : C.set(_, fe + 1);
          }
        }
      }
    };
    return c(Qt(Wt)), Ue.add(c), () => {
      for (var v of d)
        for (const m of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Ne.get(m)
          ), _ = (
            /** @type {number} */
            h.get(v)
          );
          --_ == 0 ? (m.removeEventListener(v, ot), h.delete(v), h.size === 0 && Ne.delete(m)) : h.set(v, _);
        }
      Ue.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return fr.set(a, f), a;
}
let fr = /* @__PURE__ */ new WeakMap();
class ar {
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
        Vn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(u);
        l && (R(l.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#a) {
        if (s === n || this.#r.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var f = document.createDocumentFragment();
            zt(u, f), f.append(Me()), this.#e.set(s, { effect: u, fragment: f });
          } else
            R(u);
          this.#r.delete(s), this.#a.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), ye(u, l, !1)) : l();
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
      n.includes(r) || (R(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      w
    ), i = In();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = Me();
        s.append(u), this.#e.set(t, {
          effect: B(() => n(u)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          B(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, a] of this.#a)
        l === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [l, a] of this.#e)
        l === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
const ur = 0, ct = 1, or = 2;
function cr(e, t, n, r, i) {
  var s = (
    /** @type {V} */
    E
  ), u = de(s), l = de(s), a = new ar(e);
  jt(() => {
    var f = (
      /** @type {Batch} */
      w
    );
    f.deactivate();
    var o = t();
    f.activate();
    var d = !1;
    if (sn(o)) {
      var c = St(), v = !1;
      const h = (_) => {
        if (!d) {
          v = !0, c(!1), G.ensure();
          try {
            _();
          } finally {
            ke(!1), oe || yn();
          }
        }
      };
      o.then(
        (_) => {
          h(() => {
            re(u, _), a.ensure(ct, r && ((m) => r(m, u)));
          });
        },
        (_) => {
          h(() => {
            if (re(l, _), a.ensure(or, i && ((m) => i(m, l))), !i)
              throw l.v;
          });
        }
      ), ne(() => {
        v || h(() => {
          a.ensure(ur, n);
        });
      });
    } else
      re(u, o), a.ensure(ct, r && ((h) => r(h, u)));
    return () => {
      d = !0;
    };
  });
}
var hr = /* @__PURE__ */ Oe("<span> </span>"), dr = /* @__PURE__ */ Oe("<span> </span>"), vr = /* @__PURE__ */ Oe("<span>Loading...</span>"), _r = /* @__PURE__ */ Oe("<div><!> <button>Refresh</button> <button>Fail</button> <div> </div></div>");
function pr(e, t) {
  _t(t, !0);
  let n = /* @__PURE__ */ j(ue(Promise.resolve("loaded"))), r = /* @__PURE__ */ j(0);
  function i() {
    On(r), L(n, Promise.resolve(`refresh ${A(r)}`), !0);
  }
  function s() {
    L(n, Promise.reject(new Error("fetch failed")), !0);
  }
  var u = _r(), l = Ae(u);
  cr(
    l,
    () => A(n),
    (c) => {
      var v = vr();
      Re(c, v);
    },
    (c, v) => {
      var h = hr(), _ = Ae(h);
      qe(() => Ye(_, `Result: ${A(v) ?? ""}`)), Re(c, h);
    },
    (c, v) => {
      var h = dr(), _ = Ae(h);
      qe(() => Ye(_, `Error: ${A(v).message ?? ""}`)), Re(c, h);
    }
  );
  var a = Le(l, 2), f = Le(a, 2), o = Le(f, 2), d = Ae(o);
  qe(() => Ye(d, `Refreshes: ${A(r) ?? ""}`)), at("click", a, i), at("click", f, s), Re(e, u), pt();
}
er(["click"]);
function wr(e) {
  return sr(pr, { target: e });
}
export {
  wr as default,
  wr as rvst_mount
};

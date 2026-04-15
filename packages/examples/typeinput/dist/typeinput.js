var Bt = Array.isArray, Ht = Array.prototype.indexOf, ue = Array.prototype.includes, Kt = Array.from, Gt = Object.defineProperty, de = Object.getOwnPropertyDescriptor, Wt = Object.prototype, Zt = Array.prototype, Jt = Object.getPrototypeOf, We = Object.isExtensible;
const Qt = () => {
};
function Xt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ot() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Ne = 8, ct = 1 << 24, Z = 16, W = 32, ne = 64, je = 128, R = 512, m = 1024, S = 2048, L = 4096, H = 8192, I = 16384, he = 32768, Ze = 1 << 25, ke = 65536, Je = 1 << 17, en = 1 << 18, _e = 1 << 19, tn = 1 << 20, re = 65536, Le = 1 << 21, Ye = 1 << 22, K = 1 << 23, Pe = Symbol("$state"), z = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function nn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function rn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ln() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function un() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const an = 2, E = Symbol(), on = "http://www.w3.org/1999/xhtml";
function cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ht(e) {
  return e === this.v;
}
let M = null;
function ae(e) {
  M = e;
}
function hn(e, t = !1, n) {
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
function _n(e) {
  var t = (
    /** @type {ComponentContext} */
    M
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      jn(r);
  }
  return t.i = !0, M = t.p, /** @type {T} */
  {};
}
function _t() {
  return !0;
}
let X = [];
function vt() {
  var e = X;
  X = [], Xt(e);
}
function fe(e) {
  if (X.length === 0 && !pe) {
    var t = X;
    queueMicrotask(() => {
      t === X && vt();
    });
  }
  X.push(e);
}
function vn() {
  for (; X.length > 0; )
    vt();
}
function dt(e) {
  var t = p;
  if (t === null)
    return d.f |= K, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
  for (; t !== null; ) {
    if ((t.f & je) !== 0) {
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
const dn = -7169;
function y(e, t) {
  e.f = e.f & dn | t;
}
function ze(e) {
  (e.f & R) !== 0 || e.deps === null ? y(e, m) : y(e, L);
}
function pt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & re) === 0 || (t.f ^= re, pt(
        /** @type {Derived} */
        t.deps
      ));
}
function gt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), pt(e.deps), y(e, m);
}
const U = /* @__PURE__ */ new Set();
let g = null, P = null, qe = null, pe = !1, Ce = !1, le = null, xe = null;
var Qe = 0;
let pn = 1;
class ie {
  id = pn++;
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
  #_ = /* @__PURE__ */ new Set();
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
  #v() {
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
        y(r, S), this.schedule(r);
      for (r of n.m)
        y(r, L), this.schedule(r);
    }
  }
  #h() {
    if (Qe++ > 1e3 && (U.delete(this), wn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), y(f, S), this.schedule(f);
      for (const f of this.#n)
        y(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw bt(f), u;
      }
    if (g = null, i.length > 0) {
      var s = ie.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, xe = null, this.#c() || this.#v()) {
      this.#d(r), this.#d(n);
      for (const [f, u] of this.#s)
        mt(f, u);
    } else {
      this.#r.size === 0 && U.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Xe(r), Xe(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      g
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    a !== null && (U.add(a), a.#h()), U.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= m;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (W | ne)) !== 0, f = a && (s & m) !== 0, u = f || (s & H) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= m : (s & we) !== 0 ? n.push(i) : me(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
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
  #d(t) {
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), P?.set(t, t.v));
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, P = null;
  }
  flush() {
    try {
      Ce = !0, g = this, this.#h();
    } finally {
      Qe = 0, qe = null, le = null, xe = null, Ce = !1, g = null, P = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), U.delete(this);
  }
  #w() {
    for (const l of U) {
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
        for (var f of n)
          wt(f, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#a(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of U)
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
    this.#o || r || (this.#o = !0, fe(() => {
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
    this.#_.add(t);
  }
  settled() {
    return (this.#i ??= ot()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new ie();
      Ce || (U.add(g), pe || fe(() => {
        g === t && t.flush();
      }));
    }
    return g;
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
    if (qe = t, t.b?.is_pending && (t.f & (we | Ne | ct)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (d === null || (d.f & b) === 0))
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
function gn(e) {
  var t = pe;
  pe = !0;
  try {
    for (var n; ; ) {
      if (vn(), g === null)
        return (
          /** @type {T} */
          n
        );
      g.flush();
    }
  } finally {
    pe = t;
  }
}
function wn() {
  try {
    rn();
  } catch (e) {
    B(e, qe);
  }
}
let Y = null;
function Xe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | H)) === 0 && me(r) && (Y = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), Y?.size > 0)) {
        G.clear();
        for (const i of Y) {
          if ((i.f & (I | H)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Y.has(a) && (Y.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (I | H)) === 0 && ce(u);
          }
        }
        Y.clear();
      }
    }
    Y = null;
  }
}
function wt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? wt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & S) === 0 && yt(i, t, r) && (y(i, S), Ue(
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
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && yt(
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
  g.schedule(e);
}
function mt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & m) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), y(e, m);
    for (var n = e.first; n !== null; )
      mt(n, t), n = n.next;
  }
}
function bt(e) {
  y(e, m);
  for (var t = e.first; t !== null; )
    bt(t), t = t.next;
}
function yn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    Ke() && (F(n), Ct(() => (t === 0 && (r = $t(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var mn = ke | _e;
function bn(e, t, n, r) {
  new En(e, t, n, r);
}
class En {
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
  #_ = null;
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
  #d = yn(() => (this.#a = Oe(this.#o), () => {
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
      a.b = this, a.f |= je, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Yn(() => {
      this.#y();
    }, mn);
  }
  #w() {
    try {
      this.#e = Q(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), fe(() => {
      var n = this.#s = document.createDocumentFragment(), r = Dt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, Te(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        g
      ));
    }));
  }
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        $n(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Q(() => n(this.#l));
      } else
        this.#p(
          /** @type {Batch} */
          g
        );
    } catch (n) {
      this.error(n);
    }
  }
  /**
   * @param {Batch} batch
   */
  #p(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    gt(t, this.#v, this.#h);
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
    var n = p, r = d, i = M;
    q(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (s) {
      return dt(s), null;
    } finally {
      q(n), O(r), ae(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #m(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#m(t, n);
      return;
    }
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && Te(this.#t, () => {
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
    this.#m(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#a && Re(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#d(), F(
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
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        cn();
        return;
      }
      i = !0, s && un(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        B(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= je, r(
              this.#l,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return B(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        B(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => B(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function xn(e, t, n, r) {
  const i = xt;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = Tn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (a.f & I) === 0 && B(v, a);
    }
    Ae();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = Et();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ Sn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Ae();
  }) : h();
}
function Tn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = d, n = M, r = (
    /** @type {Batch} */
    g
  );
  return function(s = !0) {
    q(e), O(t), ae(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  q(null), O(null), ae(null), e && g?.deactivate();
}
function Et() {
  var e = (
    /** @type {Effect} */
    p
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    g
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function xt(e) {
  var t = b | S, n = d !== null && (d.f & b) !== 0 ? (
    /** @type {Derived} */
    d
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: M,
    deps: null,
    effects: null,
    equals: ht,
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
function Sn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && nn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !d, f = /* @__PURE__ */ new Map();
  return qn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ot();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (v) {
      l.reject(v), Ae();
    }
    var o = (
      /** @type {Batch} */
      g
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = Et();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(z), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(z);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, _ = void 0) => {
      if (h) {
        var w = _ === z;
        h(w);
      }
      if (!(_ === z || (u.f & I) !== 0)) {
        if (o.activate(), _)
          s.f |= K, Re(s, _);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Re(s, v);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(z);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), In(() => {
    for (const u of f.values())
      u.reject(z);
  }), new Promise((u) => {
    function l(o) {
      function h() {
        o === i ? u(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
// @__NO_SIDE_EFFECTS__
function kn(e) {
  const t = /* @__PURE__ */ xt(e);
  return jt(t), t;
}
function An(e) {
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
function Rn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function $e(e) {
  var t, n = p;
  q(Rn(e));
  try {
    e.f &= ~re, An(e), t = Yt(e);
  } finally {
    q(n);
  }
  return t;
}
function Tt(e) {
  var t = e.v, n = $e(e);
  if (!e.equals(n) && (e.wv = qt(), (!g?.is_fork || e.deps === null) && (e.v = n, g?.capture(e, t, !0), e.deps === null))) {
    y(e, m);
    return;
  }
  oe || (P !== null ? (Ke() || g?.is_fork) && P.set(e, n) : ze(e));
}
function Nn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(z), t.teardown = Qt, t.ac = null, ye(t, 0), Ge(t));
}
function St(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Ve = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let kt = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ht,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function V(e, t) {
  const n = Oe(e);
  return jt(n), n;
}
function $(e, t, n = !1) {
  d !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (d.f & Je) !== 0) && _t() && (d.f & (b | Z | Ye | Je)) !== 0 && (N === null || !ue.call(N, e)) && fn();
  let r = n ? ve(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && $e(s), P === null && ze(s);
    }
    e.wv = qt(), At(e, S, n), p !== null && (p.f & m) !== 0 && (p.f & (W | ne)) === 0 && (A === null ? Bn([e]) : A.push(e)), !i.is_fork && Ve.size > 0 && !kt && On();
  }
  return t;
}
function On() {
  kt = !1;
  for (const e of Ve)
    (e.f & m) !== 0 && y(e, L), me(e) && ce(e);
  Ve.clear();
}
function ge(e) {
  $(e, e.v + 1);
}
function At(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & S) === 0;
      if (u && y(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        P?.delete(l), (f & re) === 0 && (f & R && (a.f |= re), At(l, L, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && Y !== null && Y.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = Jt(e);
  if (t !== Wt && t !== Zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Bt(e), i = /* @__PURE__ */ V(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var u = d, l = te;
    O(null), it(s);
    var o = f();
    return O(u), it(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ V(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && sn();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ V(l.value);
          return n.set(u, h), h;
        }) : $(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ V(E));
            n.set(u, o), ge(i);
          }
        } else
          $(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Pe)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || de(f, u)?.writable) && (o = a(() => {
          var v = ve(h ? f[u] : E), _ = /* @__PURE__ */ V(v);
          return _;
        }), n.set(u, o)), o !== void 0) {
          var c = F(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = F(o));
        } else if (l === void 0) {
          var h = n.get(u), c = h?.v;
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
      has(f, u) {
        if (u === Pe)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || de(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(f[u]) : E, v = /* @__PURE__ */ V(c);
            return v;
          }), n.set(u, l));
          var h = F(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var _ = n.get(v + "");
            _ !== void 0 ? $(_, E) : v in f && (_ = a(() => /* @__PURE__ */ V(E)), n.set(v + "", _));
          }
        if (h === void 0)
          (!c || de(f, u)?.writable) && (h = a(() => /* @__PURE__ */ V(void 0)), $(h, ve(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var w = a(() => ve(l));
          $(h, w);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), se = Number(u);
            Number.isInteger(se) && se >= D.v && $(D, se + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        F(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        ln();
      }
    }
  );
}
var et, Rt, Nt, Ot;
function Dn() {
  if (et === void 0) {
    et = window, Rt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Nt = de(t, "firstChild").get, Ot = de(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Dt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Pt(e) {
  return (
    /** @type {TemplateNode | null} */
    Nt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    Ot.call(e)
  );
}
function Fe(e, t) {
  return /* @__PURE__ */ Pt(e);
}
function tt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Pn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(on, e, void 0)
  );
}
let nt = !1;
function Cn() {
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
function He(e) {
  var t = d, n = p;
  O(null), q(null);
  try {
    return e();
  } finally {
    O(t), q(n);
  }
}
function Fn(e, t, n, r = n) {
  e.addEventListener(t, () => He(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), Cn();
}
function Mn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & H) !== 0 && (e |= H);
  var r = {
    ctx: M,
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
    le !== null ? le.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Mn(i, n), d !== null && (d.f & b) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      d
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return d !== null && !C;
}
function In(e) {
  const t = J(Ne, null);
  return y(t, m), t.teardown = e, t;
}
function jn(e) {
  return J(we | tn, e);
}
function Ln(e) {
  ie.ensure();
  const t = J(ne | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function qn(e) {
  return J(Ye | _e, e);
}
function Ct(e, t = 0) {
  return J(Ne | t, e);
}
function Vn(e, t = [], n = [], r = []) {
  xn(r, t, n, (i) => {
    J(Ne, () => e(...i.map(F)));
  });
}
function Yn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | _e, e);
}
function Ft(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = d;
    rt(!0), O(null);
    try {
      t.call(null);
    } finally {
      rt(n), O(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && He(() => {
      i.abort(z);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function zn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & en) !== 0) && e.nodes !== null && e.nodes.end !== null && (Un(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Ze), Ge(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ft(e), e.f ^= Ze, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Un(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  It(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function It(e, t, n) {
  if ((e.f & H) === 0) {
    e.f ^= H;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      It(i, t, a ? n : !1), i = s;
    }
  }
}
function $n(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Se = !1, oe = !1;
function rt(e) {
  oe = e;
}
let d = null, C = !1;
function O(e) {
  d = e;
}
let p = null;
function q(e) {
  p = e;
}
let N = null;
function jt(e) {
  d !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, k = 0, A = null;
function Bn(e) {
  A = e;
}
let Lt = 1, ee = 0, te = ee;
function it(e) {
  te = e;
}
function qt() {
  return ++Lt;
}
function me(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~re), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (me(
        /** @type {Derived} */
        s
      ) && Tt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && y(e, m);
  }
  return !1;
}
function Vt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Vt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, S) : (s.f & m) !== 0 && y(s, L), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Yt(e) {
  var t = T, n = k, r = A, i = d, s = N, a = M, f = C, u = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, d = (l & (W | ne)) === 0 ? e : null, N = null, ae(e.ctx), C = !1, te = ++ee, e.ac !== null && (He(() => {
    e.ac.abort(z);
  }), e.ac = null);
  try {
    e.f |= Le;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, v = g?.is_fork;
    if (T !== null) {
      var _;
      if (v || ye(e, k), c !== null && k > 0)
        for (c.length = k + T.length, _ = 0; _ < T.length; _++)
          c[k + _] = T[_];
      else
        e.deps = c = T;
      if (Ke() && (e.f & R) !== 0)
        for (_ = k; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !v && c !== null && k < c.length && (ye(e, k), c.length = k);
    if (_t() && A !== null && !C && c !== null && (e.f & (b | L | S)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      A.length; _++)
        Vt(
          A[_],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (ee++, i.deps !== null)
        for (let w = 0; w < n; w += 1)
          i.deps[w].rv = ee;
      if (t !== null)
        for (const w of t)
          w.rv = ee;
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (w) {
    return dt(w);
  } finally {
    e.f ^= Le, T = t, k = n, A = r, d = i, N = s, ae(a), C = f, te = u;
  }
}
function Hn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ht.call(n, e);
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
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~re), ze(s), Nn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & I) === 0) {
    y(e, m);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Z | ct)) !== 0 ? zn(e) : Ge(e), Ft(e);
      var i = Yt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Lt;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
async function Kn() {
  await Promise.resolve(), gn();
}
function F(e) {
  var t = e.f, n = (t & b) !== 0;
  if (d !== null && !C) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = d.deps;
      if ((d.f & Le) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (d.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [d] : ue.call(s, d) || s.push(d);
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
      return ((a.f & m) === 0 && a.reactions !== null || Ut(a)) && (f = $e(a)), G.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !C && d !== null && (Se || (d.f & R) !== 0), l = (a.f & he) === 0;
    me(a) && (u && (a.f |= R), Tt(a)), u && !l && (St(a), zt(a));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function zt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (St(
        /** @type {Derived} */
        t
      ), zt(
        /** @type {Derived} */
        t
      ));
}
function Ut(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & b) !== 0 && Ut(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function $t(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const st = globalThis.Deno?.core?.ops ?? null;
function Gn(e, ...t) {
  st?.[e] ? st[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function lt(e, t) {
  Gn("op_set_text", e, t);
}
const Wn = ["touchstart", "touchmove"];
function Zn(e) {
  return Wn.includes(e);
}
const be = Symbol("events"), Jn = /* @__PURE__ */ new Set(), ft = /* @__PURE__ */ new Set();
let ut = null;
function at(e) {
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
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[be] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Gt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = d, h = p;
    O(null), q(null);
    try {
      for (var c, v = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var w = s[be]?.[r];
          w != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && w.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        s = _;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[be] = t, delete e.currentTarget, O(o), q(h);
    }
  }
}
const Qn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Xn(e) {
  return (
    /** @type {string} */
    Qn?.createHTML(e) ?? e
  );
}
function er(e) {
  var t = Pn("template");
  return t.innerHTML = Xn(e.replaceAll("<!>", "<!---->")), t.content;
}
function tr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function nr(e, t) {
  var n = (t & an) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = er(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Pt(r));
    var s = (
      /** @type {TemplateNode} */
      n || Rt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return tr(s, s), s;
  };
}
function rr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function ir(e, t) {
  return sr(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function sr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  Dn();
  var u = void 0, l = Ln(() => {
    var o = n ?? t.appendChild(Dt());
    bn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        hn({});
        var _ = (
          /** @type {ComponentContext} */
          M
        );
        s && (_.c = s), i && (r.$$events = i), u = e(v, r) || {}, _n();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var _ = 0; _ < v.length; _++) {
        var w = v[_];
        if (!h.has(w)) {
          h.add(w);
          var x = Zn(w);
          for (const De of [t, document]) {
            var D = Ee.get(De);
            D === void 0 && (D = /* @__PURE__ */ new Map(), Ee.set(De, D));
            var se = D.get(w);
            se === void 0 ? (De.addEventListener(w, at, { passive: x }), D.set(w, 1)) : D.set(w, se + 1);
          }
        }
      }
    };
    return c(Kt(Jn)), ft.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), w = (
            /** @type {number} */
            _.get(v)
          );
          --w == 0 ? (x.removeEventListener(v, at), _.delete(v), _.size === 0 && Ee.delete(x)) : _.set(v, w);
        }
      ft.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return lr.set(u, l), u;
}
let lr = /* @__PURE__ */ new WeakMap();
function fr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Fn(e, "input", async (i) => {
    var s = i ? e.defaultValue : e.value;
    if (s = Me(e) ? Ie(s) : s, n(s), g !== null && r.add(g), await Kn(), s !== (s = t())) {
      var a = e.selectionStart, f = e.selectionEnd, u = e.value.length;
      if (e.value = s ?? "", f !== null) {
        var l = e.value.length;
        a === f && f === u && l > u ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = a, e.selectionEnd = Math.min(f, l));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  $t(t) == null && e.value && (n(Me(e) ? Ie(e.value) : e.value), g !== null && r.add(g)), Ct(() => {
    var i = t();
    if (e === document.activeElement) {
      var s = (
        /** @type {Batch} */
        g
      );
      if (r.has(s))
        return;
    }
    Me(e) && i === Ie(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function Me(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Ie(e) {
  return e === "" ? null : +e;
}
var ur = /* @__PURE__ */ nr('<div><input placeholder="Type here"/> <div> </div> <div> </div></div>');
function ar(e) {
  let t = /* @__PURE__ */ V(""), n = /* @__PURE__ */ kn(() => F(t).length);
  var r = ur(), i = Fe(r), s = tt(i, 2), a = Fe(s), f = tt(s, 2), u = Fe(f);
  Vn(() => {
    lt(a, `Value: ${F(t) ?? ""}`), lt(u, `Chars: ${F(n) ?? ""}`);
  }), fr(i, () => F(t), (l) => $(t, l)), rr(e, r);
}
function cr(e) {
  return ir(ar, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

var Vt = Array.isArray, Bt = Array.prototype.indexOf, ue = Array.prototype.includes, Ht = Array.from, Ut = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Kt = Object.prototype, Gt = Array.prototype, $t = Object.getPrototypeOf, $e = Object.isExtensible;
const Wt = () => {
};
function Zt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, be = 4, Ne = 8, at = 1 << 24, Q = 16, K = 32, ne = 64, Pe = 128, N = 512, b = 1024, k = 2048, Y = 4096, L = 8192, q = 16384, de = 32768, We = 1 << 25, ae = 65536, Ze = 1 << 17, Jt = 1 << 18, _e = 1 << 19, Qt = 1 << 20, re = 65536, Ie = 1 << 21, Ye = 1 << 22, W = 1 << 23, Fe = Symbol("$state"), H = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Xt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function en() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function sn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const ln = 2, E = Symbol(), fn = "http://www.w3.org/1999/xhtml";
function un() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let I = null;
function oe(e) {
  I = e;
}
function an(e, t = !1, n) {
  I = {
    p: I,
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
function on(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Fn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let se = [];
function cn() {
  var e = se;
  se = [], Zt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && cn();
    });
  }
  se.push(e);
}
function ht(e) {
  var t = p;
  if (t === null)
    return v.f |= W, e;
  if ((t.f & de) === 0 && (t.f & be) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
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
const hn = -7169;
function m(e, t) {
  e.f = e.f & hn | t;
}
function ze(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, b) : m(e, Y);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function _t(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), dt(e.deps), m(e, b);
}
const G = /* @__PURE__ */ new Set();
let w = null, O = null, je = null, Oe = !1, le = null, ke = null;
var Je = 0;
let dn = 1;
class J {
  id = dn++;
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
  #u = /* @__PURE__ */ new Set();
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
  #a = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #_() {
    for (const r of this.#a)
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, Y), this.schedule(r);
    }
  }
  #d() {
    if (Je++ > 1e3 && (G.delete(this), _n()), !this.#h()) {
      for (const f of this.#s)
        this.#l.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#l)
        m(f, Y), this.schedule(f);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = ke = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw wt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, ke = null, this.#h() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [f, u] of this.#f)
        gt(f, u);
    } else {
      this.#e.size === 0 && G.delete(this), this.#s.clear(), this.#l.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), Qe(r), Qe(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const f = a ??= this;
      f.#n.push(...this.#n.filter((u) => !f.#n.includes(u)));
    }
    a !== null && (G.add(a), a.#d()), G.has(this) || this.#w();
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
      var s = i.f, a = (s & (K | ne)) !== 0, f = a && (s & b) !== 0, u = f || (s & L) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= b : (s & be) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      _t(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), O?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, O = null;
  }
  flush() {
    try {
      Oe = !0, w = this, this.#d();
    } finally {
      Je = 0, je = null, le = null, ke = null, Oe = !1, w = null, O = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), G.delete(this);
  }
  #w() {
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
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var f of n)
          vt(f, i, s, a);
        if (l.#n.length > 0) {
          l.apply();
          for (var u of l.#n)
            l.#o(u, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of G)
      l.#a.has(this) && (l.#a.delete(this), l.#a.size === 0 && !l.#h() && (l.activate(), l.#d()));
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
    this.#c || r || (this.#c = !0, fe(() => {
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
    this.#u.add(t);
  }
  settled() {
    return (this.#i ??= ut()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Oe || (G.add(w), fe(() => {
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
    if (je = t, t.b?.is_pending && (t.f & (be | Ne | at)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & y) === 0))
        return;
      if ((r & (ne | K)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#n.push(n);
  }
}
function _n() {
  try {
    en();
  } catch (e) {
    $(e, je);
  }
}
let V = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (q | L)) === 0 && Ee(r) && (V = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), V?.size > 0)) {
        Z.clear();
        for (const i of V) {
          if ((i.f & (q | L)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            V.has(a) && (V.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (q | L)) === 0 && he(u);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function vt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? vt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Q)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function pt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && pt(
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
function gt(e, t) {
  if (!((e.f & K) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function vn(e) {
  let t = 0, n = De(0), r;
  return () => {
    Ue() && (P(n), Pn(() => (t === 0 && (r = Bn(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var pn = ae | _e;
function gn(e, t, n, r) {
  new wn(e, t, n, r);
}
class wn {
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
  #u = null;
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
  #a = 0;
  #h = !1;
  /** @type {Set<Effect>} */
  #_ = /* @__PURE__ */ new Set();
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
  #v = vn(() => (this.#o = De(this.#c), () => {
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
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Pe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Nt(() => {
      this.#m();
    }, pn);
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
    t && (this.is_pending = !0, this.#s = B(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Re();
      n.append(r), this.#n = this.#g(() => B(() => this.#r(r))), this.#a === 0 && (this.#t.before(n), this.#f = null, me(
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
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#n = B(() => {
        this.#r(this.#t);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ct(this.#n, t);
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    _t(t, this.#_, this.#d);
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
    var n = p, r = v, i = I;
    z(this.#i), M(this.#i), oe(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      z(n), M(r), oe(i);
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
    this.#a += t, this.#a === 0 && (this.#p(n), this.#s && me(this.#s, () => {
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
    this.#b(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#o && Ae(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#v(), P(
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
    const a = () => {
      if (i) {
        un();
        return;
      }
      i = !0, s && sn(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        $(l, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return B(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Pe, r(
              this.#t,
              () => u,
              () => a
            );
          });
        } catch (l) {
          return $(
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
        $(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => $(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function mn(e, t, n, r) {
  const i = yn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = bn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (_) {
      (a.f & q) === 0 && $(_, a);
    }
    Se();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = mt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => l([...t.map(i), ...c])).catch((c) => $(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Se();
  }) : h();
}
function bn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), M(t), oe(n), s && (e.f & q) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  z(null), M(null), oe(null), e && w?.deactivate();
}
function mt() {
  var e = (
    /** @type {Effect} */
    p
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
function yn(e) {
  var t = y | k, n = v !== null && (v.f & y) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: I,
    deps: null,
    effects: null,
    equals: ot,
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
function En(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Xt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = De(
    /** @type {V} */
    E
  ), a = !v, f = /* @__PURE__ */ new Map();
  return Cn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ut();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (_) {
      l.reject(_), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & de) !== 0)
        var h = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(H), f.delete(o);
      else {
        for (const _ of f.values())
          _.reject(H);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var g = d === H;
        h(g);
      }
      if (!(d === H || (u.f & q) !== 0)) {
        if (o.activate(), d)
          s.f |= W, Ae(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ae(s, _);
          for (const [x, F] of f) {
            if (f.delete(x), x === o) break;
            F.reject(H);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Mn(() => {
    for (const u of f.values())
      u.reject(H);
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
function xn(e) {
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
function kn(e) {
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
function Be(e) {
  var t, n = p;
  z(kn(e));
  try {
    e.f &= ~re, xn(e), t = Lt(e);
  } finally {
    z(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = Be(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (O !== null ? (Ue() || w?.is_fork) && O.set(e, n) : ze(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(H), t.teardown = Wt, t.ac = null, ye(t, 0), Ke(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Le = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let Et = !1;
function De(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ot,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function j(e, t) {
  const n = De(e);
  return Yn(n), n;
}
function U(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (v.f & Ze) !== 0) && ct() && (v.f & (y | Q | Ye | Ze)) !== 0 && (D === null || !ue.call(D, e)) && rn();
  let r = n ? ve(t) : t;
  return Ae(e, r, ke);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Be(s), O === null && ze(s);
    }
    e.wv = It(), xt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (K | ne)) === 0 && (R === null ? zn([e]) : R.push(e)), !i.is_fork && Le.size > 0 && !Et && Sn();
  }
  return t;
}
function Sn() {
  Et = !1;
  for (const e of Le)
    (e.f & b) !== 0 && m(e, Y), Ee(e) && he(e);
  Le.clear();
}
function we(e) {
  U(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        O?.delete(l), (f & re) === 0 && (f & N && (a.f |= re), xt(l, Y, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Q) !== 0 && V !== null && V.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Fe in e)
    return e;
  const t = $t(e);
  if (t !== Kt && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vt(e), i = /* @__PURE__ */ j(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var u = v, l = te;
    M(null), rt(s);
    var o = f();
    return M(u), rt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ j(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && tn();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ j(l.value);
          return n.set(u, h), h;
        }) : U(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ j(E));
            n.set(u, o), we(i);
          }
        } else
          U(l, E), we(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Fe)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || ge(f, u)?.writable) && (o = a(() => {
          var _ = ve(h ? f[u] : E), d = /* @__PURE__ */ j(_);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = P(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = P(o));
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
        if (u === Fe)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || ge(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(f[u]) : E, _ = /* @__PURE__ */ j(c);
            return _;
          }), n.set(u, l));
          var h = P(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, u, l, o) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var d = n.get(_ + "");
            d !== void 0 ? U(d, E) : _ in f && (d = a(() => /* @__PURE__ */ j(E)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || ge(f, u)?.writable) && (h = a(() => /* @__PURE__ */ j(void 0)), U(h, ve(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => ve(l));
          U(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= F.v && U(F, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        P(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        nn();
      }
    }
  );
}
var Xe, kt, Tt, St;
function An() {
  if (Xe === void 0) {
    Xe = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = ge(t, "firstChild").get, St = ge(t, "nextSibling").get, $e(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), $e(n) && (n.__t = void 0);
  }
}
function Re(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function At(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function et(e, t) {
  return /* @__PURE__ */ At(e);
}
function tt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
  return r;
}
function Rn() {
  return !1;
}
function Nn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
function Rt(e) {
  var t = v, n = p;
  M(null), z(null);
  try {
    return e();
  } finally {
    M(t), z(n);
  }
}
function Dn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & L) !== 0 && (e |= L);
  var r = {
    ctx: I,
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
  if ((e & be) !== 0)
    le !== null ? le.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw A(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Q) !== 0 && (e & ae) !== 0 && i !== null && (i.f |= ae));
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
function Ue() {
  return v !== null && !C;
}
function Mn(e) {
  const t = X(Ne, null);
  return m(t, b), t.teardown = e, t;
}
function Fn(e) {
  return X(be | Qt, e);
}
function On(e) {
  J.ensure();
  const t = X(ne | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function Cn(e) {
  return X(Ye | _e, e);
}
function Pn(e, t = 0) {
  return X(Ne | t, e);
}
function In(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    X(Ne, () => e(...i.map(P)));
  });
}
function Nt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function B(e) {
  return X(K | _e, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = v;
    nt(!0), M(null);
    try {
      t.call(null);
    } finally {
      nt(n), M(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(H);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function jn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & K) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & Jt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ln(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, We), Ke(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= We, e.f |= q;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ln(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
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
function Ft(e, t, n) {
  if ((e.f & L) === 0) {
    e.f ^= L;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & K) !== 0 && (e.f & Q) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function qn(e) {
  Ot(e, !0);
}
function Ot(e, t) {
  if ((e.f & L) !== 0) {
    e.f ^= L, (e.f & b) === 0 && (m(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ae) !== 0 || (n.f & K) !== 0;
      Ot(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function Ct(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let Te = !1, ce = !1;
function nt(e) {
  ce = e;
}
let v = null, C = !1;
function M(e) {
  v = e;
}
let p = null;
function z(e) {
  p = e;
}
let D = null;
function Yn(e) {
  v !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, S = 0, R = null;
function zn(e) {
  R = e;
}
let Pt = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function It() {
  return ++Pt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & Y) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && bt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    O === null && m(e, b);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ue.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, Y), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = R, i = v, s = D, a = I, f = C, u = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, v = (l & (K | ne)) === 0 ? e : null, D = null, oe(e.ctx), C = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(H);
  }), e.ac = null);
  try {
    e.f |= Ie;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var d;
      if (_ || ye(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ue() && (e.f & N) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (ye(e, S), c.length = S);
    if (ct() && R !== null && !C && c !== null && (e.f & (y | Y | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        jt(
          R[d],
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
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= Ie, T = t, S = n, R = r, v = i, D = s, oe(a), C = f, te = u;
  }
}
function Vn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bt.call(n, e);
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
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~re), ze(s), Tn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & q) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Q | at)) !== 0 ? jn(e) : Ke(e), Dt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function P(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !C) {
    var r = p !== null && (p.f & q) !== 0;
    if (!r && (D === null || !ue.call(D, e))) {
      var i = v.deps;
      if ((v.f & Ie) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
      }
    }
  }
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var f = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Yt(a)) && (f = Be(a)), Z.set(a, f), f;
    }
    var u = (a.f & N) === 0 && !C && v !== null && (Te || (v.f & N) !== 0), l = (a.f & de) === 0;
    Ee(a) && (u && (a.f |= N), bt(a)), u && !l && (yt(a), qt(a));
  }
  if (O?.has(e))
    return O.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & N) === 0 && (yt(
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
    if (Z.has(t) || (t.f & y) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Bn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Un(e, t) {
  Hn("op_set_text", e, t);
}
const Kn = ["touchstart", "touchmove"];
function Gn(e) {
  return Kn.includes(e);
}
const pe = Symbol("events"), zt = /* @__PURE__ */ new Set(), qe = /* @__PURE__ */ new Set();
function st(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function $n(e) {
  for (var t = 0; t < e.length; t++)
    zt.add(e[t]);
  for (var n of qe)
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
  var a = 0, f = lt === e && e[pe];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Ut(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    M(null), z(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? _.push(x) : c = x;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let x of _)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, M(o), z(h);
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
  var t = Nn("template");
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
function Ge(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Jn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Qn(s, s), s;
  };
}
function Ce(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Xn(e, t) {
  return er(e, t);
}
const xe = /* @__PURE__ */ new Map();
function er(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  An();
  var u = void 0, l = On(() => {
    var o = n ?? t.appendChild(Re());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        an({});
        var d = (
          /** @type {ComponentContext} */
          I
        );
        s && (d.c = s), i && (r.$$events = i), u = e(_, r) || {}, on();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var g = _[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Gn(g);
          for (const Me of [t, document]) {
            var F = xe.get(Me);
            F === void 0 && (F = /* @__PURE__ */ new Map(), xe.set(Me, F));
            var ie = F.get(g);
            ie === void 0 ? (Me.addEventListener(g, ft, { passive: x }), F.set(g, 1)) : F.set(g, ie + 1);
          }
        }
      }
    };
    return c(Ht(zt)), qe.add(c), () => {
      for (var _ of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            d.get(_)
          );
          --g == 0 ? (x.removeEventListener(_, ft), d.delete(_), d.size === 0 && xe.delete(x)) : d.set(_, g);
        }
      qe.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return tr.set(u, l), u;
}
let tr = /* @__PURE__ */ new WeakMap();
class nr {
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
  #u = /* @__PURE__ */ new Map();
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
      ), r = this.#u.get(n);
      if (r)
        qn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, a] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const f = this.#e.get(a);
        f && (A(f.effect), this.#e.delete(a));
      }
      for (const [s, a] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var l = document.createDocumentFragment();
            Ct(a, l), l.append(Re()), this.#e.set(s, { effect: a, fragment: l });
          } else
            A(a);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), me(a, f, !1)) : f();
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
      w
    ), i = Rn();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = Re();
        s.append(a), this.#e.set(t, {
          effect: B(() => n(a)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          B(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [f, u] of this.#u)
        f === t ? r.unskip_effect(u) : r.skip_effect(u);
      for (const [f, u] of this.#e)
        f === t ? r.unskip_effect(u.effect) : r.skip_effect(u.effect);
      r.oncommit(this.#n), r.ondiscard(this.#s);
    } else
      this.#n(r);
  }
}
function rr(e, t, n = !1) {
  var r = new nr(e), i = n ? ae : 0;
  function s(a, f) {
    r.ensure(a, f);
  }
  Nt(() => {
    var a = !1;
    t((f, u = 0) => {
      a = !0, s(u, f);
    }), a || s(-1, null);
  }, i);
}
var ir = /* @__PURE__ */ Ge("<span> </span>"), sr = /* @__PURE__ */ Ge("<span>Hidden</span>"), lr = /* @__PURE__ */ Ge("<div><button>Toggle</button> <button>Inc</button> <!></div>");
function fr(e) {
  let t = /* @__PURE__ */ j(!0), n = /* @__PURE__ */ j(0);
  var r = lr(), i = et(r), s = tt(i, 2), a = tt(s, 2);
  {
    var f = (l) => {
      var o = ir(), h = et(o);
      In(() => Un(h, `Visible: ${P(n) ?? ""}`)), Ce(l, o);
    }, u = (l) => {
      var o = sr();
      Ce(l, o);
    };
    rr(a, (l) => {
      P(t) ? l(f) : l(u, -1);
    });
  }
  st("click", i, () => {
    U(t, !P(t));
  }), st("click", s, () => {
    U(n, P(n) + 1);
  }), Ce(e, r);
}
$n(["click"]);
function ar(e) {
  return Xn(fr, { target: e });
}
export {
  ar as default,
  ar as rvst_mount
};

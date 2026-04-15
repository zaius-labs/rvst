var zt = Array.isArray, Ut = Array.prototype.indexOf, ue = Array.prototype.includes, Vt = Array.from, Ht = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Kt = Object.prototype, Gt = Array.prototype, Wt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, be = 4, Ce = 8, ut = 1 << 24, Q = 16, V = 32, ne = 64, Oe = 128, C = 512, b = 1024, k = 2048, $ = 4096, j = 8192, L = 16384, de = 32768, We = 1 << 25, oe = 65536, Ze = 1 << 17, Qt = 1 << 18, ve = 1 << 19, Xt = 1 << 20, re = 65536, Pe = 1 << 21, $e = 1 << 22, W = 1 << 23, Me = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function en() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function tn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ln() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const fn = 2, E = Symbol(), un = "http://www.w3.org/1999/xhtml";
function on() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let I = null;
function ae(e) {
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
function cn(e) {
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
function at() {
  return !0;
}
let se = [];
function hn() {
  var e = se;
  se = [], Jt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && hn();
    });
  }
  se.push(e);
}
function ct(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & de) === 0 && (t.f & be) === 0)
    throw e;
  G(e, t);
}
function G(e, t) {
  for (; t !== null; ) {
    if ((t.f & Oe) !== 0) {
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
const dn = -7169;
function m(e, t) {
  e.f = e.f & dn | t;
}
function Be(e) {
  (e.f & C) !== 0 || e.deps === null ? m(e, b) : m(e, $);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & re) === 0 || (t.f ^= re, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function dt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & $) !== 0 && n.add(e), ht(e.deps), m(e, b);
}
const H = /* @__PURE__ */ new Set();
let w = null, F = null, Ie = null, Fe = !1, le = null, ke = null;
var Je = 0;
let vn = 1;
class J {
  id = vn++;
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
  #o = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
    for (const r of this.#o)
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
        m(r, $), this.schedule(r);
    }
  }
  #d() {
    if (Je++ > 1e3 && (H.delete(this), _n()), !this.#h()) {
      for (const f of this.#s)
        this.#l.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#l)
        m(f, $), this.schedule(f);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = le = [], r = [], i = ke = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw gt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = J.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, ke = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#f)
        pt(f, u);
    } else {
      this.#e.size === 0 && H.delete(this), this.#s.clear(), this.#l.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), Qe(r), Qe(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#n.length > 0) {
      const f = o ??= this;
      f.#n.push(...this.#n.filter((u) => !f.#n.includes(u)));
    }
    o !== null && (H.add(o), o.#d()), H.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= b;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & (V | ne)) !== 0, f = o && (s & b) !== 0, u = f || (s & j) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= b : (s & be) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#l.add(i), he(i));
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
  #_(t) {
    for (var n = 0; n < t.length; n += 1)
      dt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#d();
    } finally {
      Je = 0, Ie = null, le = null, ke = null, Fe = !1, w = null, F = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), H.delete(this);
  }
  #w() {
    for (const l of H) {
      var t = l.id < this.id, n = [];
      for (const [a, [h, c]] of this.current) {
        if (l.current.has(a)) {
          var r = (
            /** @type {[any, boolean]} */
            l.current.get(a)[0]
          );
          if (t && h !== r)
            l.current.set(a, [h, c]);
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
          vt(f, i, s, o);
        if (l.#n.length > 0) {
          l.apply();
          for (var u of l.#n)
            l.#a(u, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of H)
      l.#o.has(this) && (l.#o.delete(this), l.#o.size === 0 && !l.#h() && (l.activate(), l.#d()));
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
    return (this.#i ??= ft()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new J();
      Fe || (H.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      F = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ie = t, t.b?.is_pending && (t.f & (be | Ce | ut)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & y) === 0))
        return;
      if ((r & (ne | V)) !== 0) {
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
    tn();
  } catch (e) {
    G(e, Ie);
  }
}
let Y = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | j)) === 0 && Ee(r) && (Y = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), Y?.size > 0)) {
        Z.clear();
        for (const i of Y) {
          if ((i.f & (L | j)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            Y.has(o) && (Y.delete(o), s.push(o)), o = o.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (L | j)) === 0 && he(u);
          }
        }
        Y.clear();
      }
    }
    Y = null;
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
      ) : (s & ($e | Q)) !== 0 && (s & k) === 0 && _t(i, t, r) && (m(i, k), qe(
        /** @type {Effect} */
        i
      ));
    }
}
function _t(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & y) !== 0 && _t(
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
function qe(e) {
  w.schedule(e);
}
function pt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & b) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & $) !== 0 && t.m.push(e), m(e, b);
    for (var n = e.first; n !== null; )
      pt(n, t), n = n.next;
  }
}
function gt(e) {
  m(e, b);
  for (var t = e.first; t !== null; )
    gt(t), t = t.next;
}
function pn(e) {
  let t = 0, n = De(0), r;
  return () => {
    Ue() && (P(n), In(() => (t === 0 && (r = zn(() => e(() => we(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var gn = oe | ve;
function wn(e, t, n, r) {
  new mn(e, t, n, r);
}
class mn {
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
  #a = null;
  #_ = pn(() => (this.#a = De(this.#c), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#r = (s) => {
      var o = (
        /** @type {Effect} */
        p
      );
      o.b = this, o.f |= Oe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Ct(() => {
      this.#m();
    }, gn);
  }
  #w() {
    try {
      this.#n = z(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#e.failed;
    n && (this.#l = z(() => {
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
    t && (this.is_pending = !0, this.#s = z(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Re();
      n.append(r), this.#n = this.#g(() => z(() => this.#r(r))), this.#o === 0 && (this.#t.before(n), this.#f = null, me(
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
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#c = 0, this.#n = z(() => {
        this.#r(this.#t);
      }), this.#o > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ot(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = z(() => n(this.#t));
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
    dt(t, this.#v, this.#d);
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
    var n = p, r = _, i = I;
    B(this.#i), N(this.#i), ae(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      B(n), N(r), ae(i);
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
    this.#o += t, this.#o === 0 && (this.#p(n), this.#s && me(this.#s, () => {
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
    this.#b(t, n), this.#c += t, !(!this.#a || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#a && Se(this.#a, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), P(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#e.onerror;
    let r = this.#e.failed;
    if (!n && !r)
      throw t;
    this.#n && (S(this.#n), this.#n = null), this.#s && (S(this.#s), this.#s = null), this.#l && (S(this.#l), this.#l = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        on();
        return;
      }
      i = !0, s && ln(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, o), s = !1;
      } catch (l) {
        G(l, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return z(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Oe, r(
              this.#t,
              () => u,
              () => o
            );
          });
        } catch (l) {
          return G(
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
        G(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => G(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function bn(e, t, n, r) {
  const i = mt;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    p
  ), f = yn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (o.f & L) === 0 && G(v, o);
    }
    Ae();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var a = wt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => l([...t.map(i), ...c])).catch((c) => G(c, o)).finally(() => a());
  }
  u ? u.then(() => {
    f(), h(), Ae();
  }) : h();
}
function yn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    B(e), N(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  B(null), N(null), ae(null), e && w?.deactivate();
}
function wt() {
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
function mt(e) {
  var t = y | k, n = _ !== null && (_.f & y) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
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
  r === null && en();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = De(
    /** @type {V} */
    E
  ), o = !_, f = /* @__PURE__ */ new Map();
  return Pn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ft();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Ae);
    } catch (v) {
      l.reject(v), Ae();
    }
    var a = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((u.f & de) !== 0)
        var h = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(a)?.reject(U), f.delete(a);
      else {
        for (const v of f.values())
          v.reject(U);
        f.clear();
      }
      f.set(a, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === U;
        h(g);
      }
      if (!(d === U || (u.f & L) !== 0)) {
        if (a.activate(), d)
          s.f |= W, Se(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Se(s, v);
          for (const [x, M] of f) {
            if (f.delete(x), x === a) break;
            M.reject(U);
          }
        }
        a.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Mn(() => {
    for (const u of f.values())
      u.reject(U);
  }), new Promise((u) => {
    function l(a) {
      function h() {
        a === i ? u(s) : l(i);
      }
      a.then(h, h);
    }
    l(i);
  });
}
// @__NO_SIDE_EFFECTS__
function xn(e) {
  const t = /* @__PURE__ */ mt(e);
  return Pt(t), t;
}
function kn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      S(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Tn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & y) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ye(e) {
  var t, n = p;
  B(Tn(e));
  try {
    e.f &= ~re, kn(e), t = $t(e);
  } finally {
    B(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = Ye(e);
  if (!e.equals(n) && (e.wv = jt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, b);
    return;
  }
  ce || (F !== null ? (Ue() || w?.is_fork) && F.set(e, n) : Be(e));
}
function An(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Zt, t.ac = null, ye(t, 0), Ve(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let je = /* @__PURE__ */ new Set();
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
function q(e, t) {
  const n = De(e);
  return Pt(n), n;
}
function K(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!O || (_.f & Ze) !== 0) && at() && (_.f & (y | Q | $e | Ze)) !== 0 && (D === null || !ue.call(D, e)) && sn();
  let r = n ? _e(t) : t;
  return Se(e, r, ke);
}
function Se(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ye(s), F === null && Be(s);
    }
    e.wv = jt(), xt(e, k, n), p !== null && (p.f & b) !== 0 && (p.f & (V | ne)) === 0 && (R === null ? qn([e]) : R.push(e)), !i.is_fork && je.size > 0 && !Et && Sn();
  }
  return t;
}
function Sn() {
  Et = !1;
  for (const e of je)
    (e.f & b) !== 0 && m(e, $), Ee(e) && he(e);
  je.clear();
}
function we(e) {
  K(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], f = o.f, u = (f & k) === 0;
      if (u && m(o, t), (f & y) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        F?.delete(l), (f & re) === 0 && (f & C && (o.f |= re), xt(l, $, n));
      } else if (u) {
        var a = (
          /** @type {Effect} */
          o
        );
        (f & Q) !== 0 && Y !== null && Y.add(a), n !== null ? n.push(a) : qe(a);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Me in e)
    return e;
  const t = Wt(e);
  if (t !== Kt && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = zt(e), i = /* @__PURE__ */ q(0), s = te, o = (f) => {
    if (te === s)
      return f();
    var u = _, l = te;
    N(null), rt(s);
    var a = f();
    return N(u), rt(l), a;
  };
  return r && n.set("length", /* @__PURE__ */ q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && nn();
        var a = n.get(u);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ q(l.value);
          return n.set(u, h), h;
        }) : K(a, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const a = o(() => /* @__PURE__ */ q(E));
            n.set(u, a), we(i);
          }
        } else
          K(l, E), we(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Me)
          return e;
        var a = n.get(u), h = u in f;
        if (a === void 0 && (!h || ge(f, u)?.writable) && (a = o(() => {
          var v = _e(h ? f[u] : E), d = /* @__PURE__ */ q(v);
          return d;
        }), n.set(u, a)), a !== void 0) {
          var c = P(a);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var a = n.get(u);
          a && (l.value = P(a));
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
        if (u === Me)
          return !0;
        var l = n.get(u), a = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!a || ge(f, u)?.writable)) {
          l === void 0 && (l = o(() => {
            var c = a ? _e(f[u]) : E, v = /* @__PURE__ */ q(c);
            return v;
          }), n.set(u, l));
          var h = P(l);
          if (h === E)
            return !1;
        }
        return a;
      },
      set(f, u, l, a) {
        var h = n.get(u), c = u in f;
        if (r && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? K(d, E) : v in f && (d = o(() => /* @__PURE__ */ q(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(f, u)?.writable) && (h = o(() => /* @__PURE__ */ q(void 0)), K(h, _e(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = o(() => _e(l));
          K(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(a, l), !c) {
          if (r && typeof u == "string") {
            var M = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= M.v && K(M, ie + 1);
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
        for (var [l, a] of n)
          a.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        rn();
      }
    }
  );
}
var Xe, kt, Tt, At;
function Rn() {
  if (Xe === void 0) {
    Xe = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = ge(t, "firstChild").get, At = ge(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function Re(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function St(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ze(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function et(e, t) {
  return /* @__PURE__ */ St(e);
}
function tt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ze(r);
  return r;
}
function Cn() {
  return !1;
}
function Dn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(un, e, void 0)
  );
}
function Rt(e) {
  var t = _, n = p;
  N(null), B(null);
  try {
    return e();
  } finally {
    N(t), B(n);
  }
}
function Nn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t) {
  var n = p;
  n !== null && (n.f & j) !== 0 && (e |= j);
  var r = {
    ctx: I,
    deps: null,
    nodes: null,
    f: e | k | C,
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
    } catch (o) {
      throw S(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & Q) !== 0 && (e & oe) !== 0 && i !== null && (i.f |= oe));
  }
  if (i !== null && (i.parent = n, n !== null && Nn(i, n), _ !== null && (_.f & y) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ue() {
  return _ !== null && !O;
}
function Mn(e) {
  const t = X(Ce, null);
  return m(t, b), t.teardown = e, t;
}
function Fn(e) {
  return X(be | Xt, e);
}
function On(e) {
  J.ensure();
  const t = X(ne | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      S(t), r(void 0);
    }) : (S(t), r(void 0));
  });
}
function Pn(e) {
  return X($e | ve, e);
}
function In(e, t = 0) {
  return X(Ce | t, e);
}
function jn(e, t = [], n = [], r = []) {
  bn(r, t, n, (i) => {
    X(Ce, () => e(...i.map(P)));
  });
}
function Ct(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function z(e) {
  return X(V | ve, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    nt(!0), N(null);
    try {
      t.call(null);
    } finally {
      nt(n), N(r);
    }
  }
}
function Ve(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : S(n, t), n = r;
  }
}
function Ln(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && S(t), t = n;
  }
}
function S(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && ($n(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, We), Ve(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= We, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function $n(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ ze(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  Mt(e, r, !0);
  var i = () => {
    n && S(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Mt(e, t, n) {
  if ((e.f & j) === 0) {
    e.f ^= j;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & oe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & Q) !== 0;
      Mt(i, t, o ? n : !1), i = s;
    }
  }
}
function Bn(e) {
  Ft(e, !0);
}
function Ft(e, t) {
  if ((e.f & j) !== 0) {
    e.f ^= j, (e.f & b) === 0 && (m(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & oe) !== 0 || (n.f & V) !== 0;
      Ft(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || t) && o.in();
  }
}
function Ot(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ ze(n);
      t.append(n), n = i;
    }
}
let Te = !1, ce = !1;
function nt(e) {
  ce = e;
}
let _ = null, O = !1;
function N(e) {
  _ = e;
}
let p = null;
function B(e) {
  p = e;
}
let D = null;
function Pt(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, A = 0, R = null;
function qn(e) {
  R = e;
}
let It = 1, ee = 0, te = ee;
function rt(e) {
  te = e;
}
function jt() {
  return ++It;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~re), (t & $) !== 0) {
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
    (t & C) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, b);
  }
  return !1;
}
function Lt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ue.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Lt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & b) !== 0 && m(s, $), qe(
        /** @type {Effect} */
        s
      ));
    }
}
function $t(e) {
  var t = T, n = A, r = R, i = _, s = D, o = I, f = O, u = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, _ = (l & (V | ne)) === 0 ? e : null, D = null, ae(e.ctx), O = !1, te = ++ee, e.ac !== null && (Rt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || ye(e, A), c !== null && A > 0)
        for (c.length = A + T.length, d = 0; d < T.length; d++)
          c[A + d] = T[d];
      else
        e.deps = c = T;
      if (Ue() && (e.f & C) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (ye(e, A), c.length = A);
    if (at() && R !== null && !O && c !== null && (e.f & (y | $ | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        Lt(
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
    return ct(g);
  } finally {
    e.f ^= Pe, T = t, A = n, R = r, _ = i, D = s, ae(o), O = f, te = u;
  }
}
function Yn(e, t) {
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
    (s.f & C) !== 0 && (s.f ^= C, s.f &= ~re), Be(s), An(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Yn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, b);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Q | ut)) !== 0 ? Ln(e) : Ve(e), Dt(e);
      var i = $t(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = It;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function P(e) {
  var t = e.f, n = (t & y) !== 0;
  if (_ !== null && !O) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (D === null || !ue.call(D, e))) {
      var i = _.deps;
      if ((_.f & Pe) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && Z.has(e))
    return Z.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var f = o.v;
      return ((o.f & b) === 0 && o.reactions !== null || qt(o)) && (f = Ye(o)), Z.set(o, f), f;
    }
    var u = (o.f & C) === 0 && !O && _ !== null && (Te || (_.f & C) !== 0), l = (o.f & de) === 0;
    Ee(o) && (u && (o.f |= C), bt(o)), u && !l && (yt(o), Bt(o));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function Bt(e) {
  if (e.f |= C, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & C) === 0 && (yt(
        /** @type {Derived} */
        t
      ), Bt(
        /** @type {Derived} */
        t
      ));
}
function qt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & y) !== 0 && qt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function zn(e) {
  var t = O;
  try {
    return O = !0, e();
  } finally {
    O = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Vn(e, t) {
  Un("op_set_text", e, t);
}
const Hn = ["touchstart", "touchmove"];
function Kn(e) {
  return Hn.includes(e);
}
const pe = Symbol("events"), Yt = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Gn(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    Yt.add(e[t]);
  for (var n of Le)
    n(e);
}
let st = null;
function lt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  st = e;
  var o = 0, f = st === e && e[pe];
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
    u <= l && (o = u);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    Ht(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = _, h = p;
    N(null), B(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
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
      e[pe] = t, delete e.currentTarget, N(a), B(h);
    }
  }
}
const Zn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Jn(e) {
  return (
    /** @type {string} */
    Zn?.createHTML(e) ?? e
  );
}
function Qn(e) {
  var t = Dn("template");
  return t.innerHTML = Jn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function He(e, t) {
  var n = (t & fn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ St(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function Ke(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function er(e, t) {
  return tr(e, t);
}
const xe = /* @__PURE__ */ new Map();
function tr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: f }) {
  Rn();
  var u = void 0, l = On(() => {
    var a = n ?? t.appendChild(Re());
    wn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (v) => {
        an({});
        var d = (
          /** @type {ComponentContext} */
          I
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, cn();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Kn(g);
          for (const Ne of [t, document]) {
            var M = xe.get(Ne);
            M === void 0 && (M = /* @__PURE__ */ new Map(), xe.set(Ne, M));
            var ie = M.get(g);
            ie === void 0 ? (Ne.addEventListener(g, lt, { passive: x }), M.set(g, 1)) : M.set(g, ie + 1);
          }
        }
      }
    };
    return c(Vt(Yt)), Le.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, lt), d.delete(v), d.size === 0 && xe.delete(x)) : d.set(v, g);
        }
      Le.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return nr.set(u, l), u;
}
let nr = /* @__PURE__ */ new WeakMap();
class rr {
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
        Bn(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#u.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, o] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const f = this.#e.get(o);
        f && (S(f.effect), this.#e.delete(o));
      }
      for (const [s, o] of this.#u) {
        if (s === n || this.#r.has(s)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var l = document.createDocumentFragment();
            Ot(o, l), l.append(Re()), this.#e.set(s, { effect: o, fragment: l });
          } else
            S(o);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), me(o, f, !1)) : f();
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
      n.includes(r) || (S(i.effect), this.#e.delete(r));
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
    ), i = Cn();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), o = Re();
        s.append(o), this.#e.set(t, {
          effect: z(() => n(o)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          z(() => n(this.anchor))
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
function ir(e, t, n) {
  var r = new rr(e);
  Ct(() => {
    var i = t() ?? null;
    r.ensure(i, i && ((s) => n(s, i)));
  }, oe);
}
var sr = /* @__PURE__ */ He("<div>Component A</div>");
function lr(e, t) {
  var n = sr();
  Ke(e, n);
}
var fr = /* @__PURE__ */ He("<div>Component B</div>");
function ur(e, t) {
  var n = fr();
  Ke(e, n);
}
var or = /* @__PURE__ */ He("<div><!> <button>Switch</button> <div> </div></div>");
function ar(e) {
  let t = /* @__PURE__ */ q("A"), n = /* @__PURE__ */ xn(() => P(t) === "A" ? lr : ur);
  function r() {
    K(t, P(t) === "A" ? "B" : "A", !0);
  }
  var i = or(), s = et(i);
  ir(s, () => P(n), (l, a) => {
    a(l, {});
  });
  var o = tt(s, 2), f = tt(o, 2), u = et(f);
  jn(() => Vn(u, `Active: ${P(t) ?? ""}`)), Gn("click", o, r), Ke(e, i);
}
Wn(["click"]);
function hr(e) {
  return er(ar, { target: e });
}
export {
  hr as default,
  hr as rvst_mount
};

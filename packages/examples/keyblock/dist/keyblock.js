var Kt = Array.isArray, $t = Array.prototype.indexOf, ue = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Ht = Object.prototype, Gt = Array.prototype, Wt = Object.getPrototypeOf, He = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, me = 4, Re = 8, at = 1 << 24, Q = 16, V = 32, ne = 64, Pe = 128, D = 512, y = 1024, k = 2048, B = 4096, L = 8192, q = 16384, he = 32768, Ge = 1 << 25, ye = 65536, We = 1 << 17, Qt = 1 << 18, de = 1 << 19, Xt = 1 << 20, re = 65536, Ie = 1 << 21, Be = 1 << 22, W = 1 << 23, Fe = Symbol("$state"), $ = new class extends Error {
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
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let I = null;
function ae(e) {
  I = e;
}
function on(e, t = !1, n) {
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
      Cn(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function ct() {
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
function ht(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & he) === 0 && (t.f & me) === 0)
    throw e;
  G(e, t);
}
function G(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
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
function m(e, t) {
  e.f = e.f & dn | t;
}
function Ye(e) {
  (e.f & D) !== 0 || e.deps === null ? m(e, y) : m(e, B);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & re) === 0 || (t.f ^= re, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), dt(e.deps), m(e, y);
}
const H = /* @__PURE__ */ new Set();
let w = null, C = null, je = null, Oe = !1, le = null, ke = null;
var Ze = 0;
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
  #a = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #v() {
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
        m(r, B), this.schedule(r);
    }
  }
  #d() {
    if (Ze++ > 1e3 && (H.delete(this), _n()), !this.#h()) {
      for (const f of this.#s)
        this.#l.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#l)
        m(f, B), this.schedule(f);
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
    if (le = null, ke = null, this.#h() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#f)
        gt(f, u);
    } else {
      this.#e.size === 0 && H.delete(this), this.#s.clear(), this.#l.clear();
      for (const f of this.#t) f(this);
      this.#t.clear(), Je(r), Je(n), this.#i?.resolve();
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
    a !== null && (H.add(a), a.#d()), H.has(this) || this.#w();
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
      var s = i.f, a = (s & (V | ne)) !== 0, f = a && (s & y) !== 0, u = f || (s & L) !== 0 || this.#f.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & me) !== 0 ? n.push(i) : Ee(i) && ((s & Q) !== 0 && this.#l.add(i), ce(i));
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
      vt(t[n], this.#s, this.#l);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Oe = !0, w = this, this.#d();
    } finally {
      Ze = 0, je = null, le = null, ke = null, Oe = !1, w = null, C = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#u) t(this);
    this.#u.clear(), H.delete(this);
  }
  #w() {
    for (const l of H) {
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
          _t(f, i, s, a);
        if (l.#n.length > 0) {
          l.apply();
          for (var u of l.#n)
            l.#o(u, [], []);
          l.#n = [];
        }
        l.deactivate();
      }
    }
    for (const l of H)
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
      Oe || (H.add(w), fe(() => {
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
    if (je = t, t.b?.is_pending && (t.f & (me | Re | at)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (ne | V)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#n.push(n);
  }
}
function _n() {
  try {
    tn();
  } catch (e) {
    G(e, je);
  }
}
let z = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (q | L)) === 0 && Ee(r) && (z = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mt(r), z?.size > 0)) {
        Z.clear();
        for (const i of z) {
          if ((i.f & (q | L)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            z.has(a) && (z.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (q | L)) === 0 && ce(u);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function _t(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? _t(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Be | Q)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), ze(
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
      if ((i.f & b) !== 0 && pt(
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
function ze(e) {
  w.schedule(e);
}
function gt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function pn(e) {
  let t = 0, n = De(0), r;
  return () => {
    Ue() && (R(n), jn(() => (t === 0 && (r = $n(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var gn = ye | de;
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
  #a = 0;
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
  #_ = pn(() => (this.#o = De(this.#c), () => {
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Rt(() => {
      this.#m();
    }, gn);
  }
  #w() {
    try {
      this.#n = K(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#e.failed;
    n && (this.#l = K(() => {
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
    t && (this.is_pending = !0, this.#s = K(() => t(this.#t)), fe(() => {
      var n = this.#f = document.createDocumentFragment(), r = Ne();
      n.append(r), this.#n = this.#g(() => K(() => this.#r(r))), this.#a === 0 && (this.#t.before(n), this.#f = null, we(
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
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#c = 0, this.#n = K(() => {
        this.#r(this.#t);
      }), this.#a > 0) {
        var t = this.#f = document.createDocumentFragment();
        Ct(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#s = K(() => n(this.#t));
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
    vt(t, this.#v, this.#d);
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
    Y(this.#i), F(this.#i), ae(this.#i.ctx);
    try {
      return J.ensure(), t();
    } catch (s) {
      return ht(s), null;
    } finally {
      Y(n), F(r), ae(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #y(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, n);
      return;
    }
    this.#a += t, this.#a === 0 && (this.#p(n), this.#s && we(this.#s, () => {
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
    this.#y(t, n), this.#c += t, !(!this.#o || this.#h) && (this.#h = !0, fe(() => {
      this.#h = !1, this.#o && Ae(this.#o, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#_(), R(
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
        an();
        return;
      }
      i = !0, s && ln(), this.#l !== null && we(this.#l, () => {
        this.#l = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        G(l, this.#i && this.#i.parent);
      }
      r && (this.#l = this.#g(() => {
        try {
          return K(() => {
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
function yn(e, t, n, r) {
  const i = En;
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
    } catch (v) {
      (a.f & q) === 0 && G(v, a);
    }
    Se();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = mt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ xn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => G(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Se();
  }) : h();
}
function bn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), F(t), ae(n), s && (e.f & q) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  Y(null), F(null), ae(null), e && w?.deactivate();
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
function En(e) {
  var t = b | k, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= de), {
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
function xn(e, t, n) {
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
  ), a = !_, f = /* @__PURE__ */ new Map();
  return In(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = ut();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (v) {
      l.reject(v), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject($), f.delete(o);
      else {
        for (const v of f.values())
          v.reject($);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === $;
        h(g);
      }
      if (!(d === $ || (u.f & q) !== 0)) {
        if (o.activate(), d)
          s.f |= W, Ae(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ae(s, v);
          for (const [x, O] of f) {
            if (f.delete(x), x === o) break;
            O.reject($);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), On(() => {
    for (const u of f.values())
      u.reject($);
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
function kn(e) {
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
function Tn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & q) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ke(e) {
  var t, n = p;
  Y(Tn(e));
  try {
    e.f &= ~re, kn(e), t = Lt(e);
  } finally {
    Y(n);
  }
  return t;
}
function yt(e) {
  var t = e.v, n = Ke(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (C !== null ? (Ue() || w?.is_fork) && C.set(e, n) : Ye(e));
}
function Sn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Zt, t.ac = null, be(t, 0), Ve(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
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
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (_.f & We) !== 0) && ct() && (_.f & (b | Q | Be | We)) !== 0 && (M === null || !ue.call(M, e)) && sn();
  let r = n ? ve(t) : t;
  return Ae(e, r, ke);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = J.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ke(s), C === null && Ye(s);
    }
    e.wv = It(), xt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (V | ne)) === 0 && (N === null ? zn([e]) : N.push(e)), !i.is_fork && Le.size > 0 && !Et && An();
  }
  return t;
}
function An() {
  Et = !1;
  for (const e of Le)
    (e.f & y) !== 0 && m(e, B), Ee(e) && ce(e);
  Le.clear();
}
function Nn(e, t = 1) {
  var n = R(e), r = t === 1 ? n++ : n--;
  return U(e, n), r;
}
function ge(e) {
  U(e, e.v + 1);
}
function xt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        C?.delete(l), (f & re) === 0 && (f & D && (a.f |= re), xt(l, B, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Q) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : ze(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Fe in e)
    return e;
  const t = Wt(e);
  if (t !== Ht && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Kt(e), i = /* @__PURE__ */ j(0), s = te, a = (f) => {
    if (te === s)
      return f();
    var u = _, l = te;
    F(null), nt(s);
    var o = f();
    return F(u), nt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ j(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && nn();
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
            n.set(u, o), ge(i);
          }
        } else
          U(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Fe)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || pe(f, u)?.writable) && (o = a(() => {
          var v = ve(h ? f[u] : E), d = /* @__PURE__ */ j(v);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = R(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = R(o));
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
        if (l !== void 0 || p !== null && (!o || pe(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? ve(f[u]) : E, v = /* @__PURE__ */ j(c);
            return v;
          }), n.set(u, l));
          var h = R(l);
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
            var d = n.get(v + "");
            d !== void 0 ? U(d, E) : v in f && (d = a(() => /* @__PURE__ */ j(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = a(() => /* @__PURE__ */ j(void 0)), U(h, ve(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => ve(l));
          U(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var O = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= O.v && U(O, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        R(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        rn();
      }
    }
  );
}
var Qe, kt, Tt, St;
function Rn() {
  if (Qe === void 0) {
    Qe = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = pe(t, "firstChild").get, St = pe(t, "nextSibling").get, He(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), He(n) && (n.__t = void 0);
  }
}
function Ne(e = "") {
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
function $e(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ At(e);
}
function Xe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r);
  return r;
}
function Dn() {
  return !1;
}
function Mn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(un, e, void 0)
  );
}
function Nt(e) {
  var t = _, n = p;
  F(null), Y(null);
  try {
    return e();
  } finally {
    F(t), Y(n);
  }
}
function Fn(e, t) {
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
  if ((e & me) !== 0)
    le !== null ? le.push(r) : J.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw A(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Q) !== 0 && (e & ye) !== 0 && i !== null && (i.f |= ye));
  }
  if (i !== null && (i.parent = n, n !== null && Fn(i, n), _ !== null && (_.f & b) !== 0 && (e & ne) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ue() {
  return _ !== null && !P;
}
function On(e) {
  const t = X(Re, null);
  return m(t, y), t.teardown = e, t;
}
function Cn(e) {
  return X(me | Xt, e);
}
function Pn(e) {
  J.ensure();
  const t = X(ne | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      A(t), r(void 0);
    }) : (A(t), r(void 0));
  });
}
function In(e) {
  return X(Be | de, e);
}
function jn(e, t = 0) {
  return X(Re | t, e);
}
function et(e, t = [], n = [], r = []) {
  yn(r, t, n, (i) => {
    X(Re, () => e(...i.map(R)));
  });
}
function Rt(e, t = 0) {
  var n = X(Q | t, e);
  return n;
}
function K(e) {
  return X(V | de, e);
}
function Dt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = _;
    tt(!0), F(null);
    try {
      t.call(null);
    } finally {
      tt(n), F(r);
    }
  }
}
function Ve(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & ne) !== 0 ? n.parent = null : A(n, t), n = r;
  }
}
function Ln(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && A(t), t = n;
  }
}
function A(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && (qn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ge), Ve(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Dt(e), e.f ^= Ge, e.f |= q;
  var i = e.parent;
  i !== null && i.first !== null && Mt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function qn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $e(e);
    e.remove(), e = n;
  }
}
function Mt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
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
      var s = i.next, a = (i.f & ye) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & Q) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function Bn(e) {
  Ot(e, !0);
}
function Ot(e, t) {
  if ((e.f & L) !== 0) {
    e.f ^= L, (e.f & y) === 0 && (m(e, k), J.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ye) !== 0 || (n.f & V) !== 0;
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
      var i = n === r ? null : /* @__PURE__ */ $e(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function tt(e) {
  oe = e;
}
let _ = null, P = !1;
function F(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let M = null;
function Yn(e) {
  _ !== null && (M === null ? M = [e] : M.push(e));
}
let T = null, S = 0, N = null;
function zn(e) {
  N = e;
}
let Pt = 1, ee = 0, te = ee;
function nt(e) {
  te = e;
}
function It() {
  return ++Pt;
}
function Ee(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~re), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ee(
        /** @type {Derived} */
        s
      ) && yt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, y);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && ue.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, B), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = S, r = N, i = _, s = M, a = I, f = P, u = te, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, N = null, _ = (l & (V | ne)) === 0 ? e : null, M = null, ae(e.ctx), P = !1, te = ++ee, e.ac !== null && (Nt(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= Ie;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || be(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ue() && (e.f & D) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (be(e, S), c.length = S);
    if (ct() && N !== null && !P && c !== null && (e.f & (b | B | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      N.length; d++)
        jt(
          N[d],
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
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= Ie, T = t, S = n, N = r, _ = i, M = s, ae(a), P = f, te = u;
  }
}
function Kn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = $t.call(n, e);
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
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~re), Ye(s), Sn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Kn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & q) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Q | at)) !== 0 ? Ln(e) : Ve(e), Dt(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function R(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !P) {
    var r = p !== null && (p.f & q) !== 0;
    if (!r && (M === null || !ue.call(M, e))) {
      var i = _.deps;
      if ((_.f & Ie) !== 0)
        e.rv < ee && (e.rv = ee, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (oe && Z.has(e))
    return Z.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Bt(a)) && (f = Ke(a)), Z.set(a, f), f;
    }
    var u = (a.f & D) === 0 && !P && _ !== null && (Te || (_.f & D) !== 0), l = (a.f & he) === 0;
    Ee(a) && (u && (a.f |= D), yt(a)), u && !l && (bt(a), qt(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & D) === 0 && (bt(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Bt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & b) !== 0 && Bt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function $n(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function it(e, t) {
  Un("op_set_text", e, t);
}
const Vn = ["touchstart", "touchmove"];
function Hn(e) {
  return Vn.includes(e);
}
const _e = Symbol("events"), Yt = /* @__PURE__ */ new Set(), qe = /* @__PURE__ */ new Set();
function Gn(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    Yt.add(e[t]);
  for (var n of qe)
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
  var a = 0, f = st === e && e[_e];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[_e] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    F(null), Y(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[_e]?.[r];
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
      e[_e] = t, delete e.currentTarget, F(o), Y(h);
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
  var t = Mn("template");
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
function zt(e, t) {
  var n = (t & fn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function ft(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function er(e, t) {
  return tr(e, t);
}
const xe = /* @__PURE__ */ new Map();
function tr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  Rn();
  var u = void 0, l = Pn(() => {
    var o = n ?? t.appendChild(Ne());
    wn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        on({});
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
          var x = Hn(g);
          for (const Me of [t, document]) {
            var O = xe.get(Me);
            O === void 0 && (O = /* @__PURE__ */ new Map(), xe.set(Me, O));
            var ie = O.get(g);
            ie === void 0 ? (Me.addEventListener(g, lt, { passive: x }), O.set(g, 1)) : O.set(g, ie + 1);
          }
        }
      }
    };
    return c(Ut(Yt)), qe.add(c), () => {
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
      qe.delete(c), o !== n && o.parentNode?.removeChild(o);
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
            Ct(a, l), l.append(Ne()), this.#e.set(s, { effect: a, fragment: l });
          } else
            A(a);
          this.#r.delete(s), this.#u.delete(s);
        };
        this.#i || !r ? (this.#r.add(s), we(a, f, !1)) : f();
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
    ), i = Dn();
    if (n && !this.#u.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = Ne();
        s.append(a), this.#e.set(t, {
          effect: K(() => n(a)),
          fragment: s
        });
      } else
        this.#u.set(
          t,
          K(() => n(this.anchor))
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
const ir = Symbol("NaN");
function sr(e, t, n) {
  var r = new rr(e);
  Rt(() => {
    var i = t();
    i !== i && (i = /** @type {any} */
    ir), r.ensure(i, n);
  });
}
var lr = /* @__PURE__ */ zt("<div> </div>"), fr = /* @__PURE__ */ zt("<div><!> <button>Cycle</button> <div> </div></div>");
function ur(e) {
  let t = /* @__PURE__ */ j(0), n = /* @__PURE__ */ j("A");
  function r() {
    Nn(t), U(n, R(n) === "A" ? "B" : "A", !0);
  }
  var i = fr(), s = Ce(i);
  sr(s, () => R(t), (l) => {
    var o = lr(), h = Ce(o);
    et(() => it(h, `Key content: ${R(n) ?? ""}`)), ft(l, o);
  });
  var a = Xe(s, 2), f = Xe(a, 2), u = Ce(f);
  et(() => it(u, `Key value: ${R(t) ?? ""}`)), Gn("click", a, r), ft(e, i);
}
Wn(["click"]);
function or(e) {
  return er(ur, { target: e });
}
export {
  or as default,
  or as rvst_mount
};

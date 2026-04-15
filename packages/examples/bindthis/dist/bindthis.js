var Vt = Array.isArray, $t = Array.prototype.indexOf, oe = Array.prototype.includes, Ht = Array.from, Kt = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, Gt = Object.prototype, Wt = Array.prototype, Zt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Jt = () => {
};
function Qt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ft() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const m = 2, ce = 4, Fe = 8, ut = 1 << 24, J = 16, V = 32, te = 64, Pe = 128, O = 512, b = 1024, S = 2048, B = 4096, G = 8192, L = 16384, se = 32768, Ie = 1 << 25, Ae = 65536, We = 1 << 17, Xt = 1 << 18, ve = 1 << 19, en = 1 << 20, ne = 65536, je = 1 << 21, Ye = 1 << 22, W = 1 << 23, xe = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function tn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function nn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function rn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function sn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function ln() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function un() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function an() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function on() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const cn = 2, E = Symbol(), hn = "http://www.w3.org/1999/xhtml";
function dn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function at(e) {
  return e === this.v;
}
let R = null;
function he(e) {
  R = e;
}
function ot(e, t = !1, n) {
  R = {
    p: R,
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
function ct(e) {
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
function ht() {
  return !0;
}
let fe = [];
function vn() {
  var e = fe;
  fe = [], Qt(e);
}
function ae(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && vn();
    });
  }
  fe.push(e);
}
function dt(e) {
  var t = p;
  if (t === null)
    return _.f |= W, e;
  if ((t.f & se) === 0 && (t.f & ce) === 0)
    throw e;
  K(e, t);
}
function K(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
      if ((t.f & se) === 0)
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
const _n = -7169;
function y(e, t) {
  e.f = e.f & _n | t;
}
function ze(e) {
  (e.f & O) !== 0 || e.deps === null ? y(e, b) : y(e, B);
}
function vt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & m) === 0 || (t.f & ne) === 0 || (t.f ^= ne, vt(
        /** @type {Derived} */
        t.deps
      ));
}
function _t(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), vt(e.deps), y(e, b);
}
const H = /* @__PURE__ */ new Set();
let w = null, I = null, Le = null, Me = !1, ue = null, Te = null;
var Ze = 0;
let pn = 1;
class re {
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
  #d = /* @__PURE__ */ new Set();
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
        y(r, B), this.schedule(r);
    }
  }
  #h() {
    if (Ze++ > 1e3 && (H.delete(this), gn()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), y(u, S), this.schedule(u);
      for (const u of this.#n)
        y(u, B), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ue = [], r = [], i = Te = [];
    for (const u of t)
      try {
        this.#a(u, n, r);
      } catch (l) {
        throw yt(u), l;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (ue = null, Te = null, this.#c() || this.#v()) {
      this.#_(r), this.#_(n);
      for (const [u, l] of this.#s)
        wt(u, l);
    } else {
      this.#r.size === 0 && H.delete(this), this.#t.clear(), this.#n.clear();
      for (const u of this.#l) u(this);
      this.#l.clear(), Je(r), Je(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const u = a ??= this;
      u.#e.push(...this.#e.filter((l) => !u.#e.includes(l)));
    }
    a !== null && (H.add(a), a.#h()), H.has(this) || this.#w();
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
      var s = i.f, a = (s & (V | te)) !== 0, u = a && (s & b) !== 0, l = u || (s & G) !== 0 || this.#s.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= b : (s & ce) !== 0 ? n.push(i) : be(i) && ((s & J) !== 0 && this.#n.add(i), de(i));
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
      _t(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & W) === 0 && (this.current.set(t, [t.v, r]), I?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, I = null;
  }
  flush() {
    try {
      Me = !0, w = this, this.#h();
    } finally {
      Ze = 0, Le = null, ue = null, Te = null, Me = !1, w = null, I = null, Z.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), H.delete(this);
  }
  #w() {
    for (const f of H) {
      var t = f.id < this.id, n = [];
      for (const [o, [h, c]] of this.current) {
        if (f.current.has(o)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(o)[0]
          );
          if (t && h !== r)
            f.current.set(o, [h, c]);
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
        var s = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var u of n)
          pt(u, i, s, a);
        if (f.#e.length > 0) {
          f.apply();
          for (var l of f.#e)
            f.#a(l, [], []);
          f.#e = [];
        }
        f.deactivate();
      }
    }
    for (const f of H)
      f.#u.has(this) && (f.#u.delete(this), f.#u.size === 0 && !f.#c() && (f.activate(), f.#h()));
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
    this.#o || r || (this.#o = !0, ae(() => {
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
    this.#d.add(t);
  }
  settled() {
    return (this.#i ??= ft()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Me || (H.add(w), ae(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      I = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Le = t, t.b?.is_pending && (t.f & (ce | Fe | ut)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & m) === 0))
        return;
      if ((r & (te | V)) !== 0) {
        if ((r & b) === 0)
          return;
        n.f ^= b;
      }
    }
    this.#e.push(n);
  }
}
function gn() {
  try {
    ln();
  } catch (e) {
    K(e, Le);
  }
}
let z = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | G)) === 0 && be(r) && (z = /* @__PURE__ */ new Set(), de(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ct(r), z?.size > 0)) {
        Z.clear();
        for (const i of z) {
          if ((i.f & (L | G)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            z.has(a) && (z.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const l = s[u];
            (l.f & (L | G)) === 0 && de(l);
          }
        }
        z.clear();
      }
    }
    z = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & m) !== 0 ? pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | J)) !== 0 && (s & S) === 0 && gt(i, t, r) && (y(i, S), Ue(
        /** @type {Effect} */
        i
      ));
    }
}
function gt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (oe.call(t, i))
        return !0;
      if ((i.f & m) !== 0 && gt(
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
  w.schedule(e);
}
function wt(e, t) {
  if (!((e.f & V) !== 0 && (e.f & b) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), y(e, b);
    for (var n = e.first; n !== null; )
      wt(n, t), n = n.next;
  }
}
function yt(e) {
  y(e, b);
  for (var t = e.first; t !== null; )
    yt(t), t = t.next;
}
function wn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    He() && (k(n), Dt(() => (t === 0 && (r = zt(() => e(() => we(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var yn = Ae | ve;
function bn(e, t, n, r) {
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
  #l;
  /** @type {TemplateNode | null} */
  #d = null;
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
  #_ = wn(() => (this.#a = Oe(this.#o), () => {
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
      a.b = this, a.f |= Pe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Bn(() => {
      this.#y();
    }, yn);
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
  #m(t) {
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), ae(() => {
      var n = this.#s = document.createDocumentFragment(), r = Rt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, ke(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #y() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Un(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Q(() => n(this.#l));
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
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    _t(t, this.#v, this.#h);
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
    var n = p, r = _, i = R;
    Y(this.#i), M(this.#i), he(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return dt(s), null;
    } finally {
      Y(n), M(r), he(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && ke(this.#t, () => {
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ae(() => {
      this.#c = !1, this.#a && Ne(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), k(
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
    this.#e && (q(this.#e), this.#e = null), this.#t && (q(this.#t), this.#t = null), this.#n && (q(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        dn();
        return;
      }
      i = !0, s && on(), this.#n !== null && ke(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#y();
      });
    }, u = (l) => {
      try {
        s = !0, n?.(l, a), s = !1;
      } catch (f) {
        K(f, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var f = (
              /** @type {Effect} */
              p
            );
            f.b = this, f.f |= Pe, r(
              this.#l,
              () => l,
              () => a
            );
          });
        } catch (f) {
          return K(
            f,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ae(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (f) {
        K(f, this.#i && this.#i.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        u,
        /** @param {unknown} e */
        (f) => K(f, this.#i && this.#i.parent)
      ) : u(l);
    });
  }
}
function En(e, t, n, r) {
  const i = Tn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = xn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function f(c) {
    u();
    try {
      r(c);
    } catch (v) {
      (a.f & L) === 0 && K(v, a);
    }
    Re();
  }
  if (n.length === 0) {
    l.then(() => f(t.map(i)));
    return;
  }
  var o = bt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ kn(c))).then((c) => f([...t.map(i), ...c])).catch((c) => K(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    u(), h(), Re();
  }) : h();
}
function xn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = R, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), M(t), he(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  Y(null), M(null), he(null), e && w?.deactivate();
}
function bt() {
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
function Tn(e) {
  var t = m | S, n = _ !== null && (_.f & m) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: R,
    deps: null,
    effects: null,
    equals: at,
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
function kn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && tn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !_, u = /* @__PURE__ */ new Map();
  return Ln(() => {
    var l = (
      /** @type {Effect} */
      p
    ), f = ft();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(Re);
    } catch (v) {
      f.reject(v), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((l.f & se) !== 0)
        var h = bt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(U), u.delete(o);
      else {
        for (const v of u.values())
          v.reject(U);
        u.clear();
      }
      u.set(o, f);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === U;
        h(g);
      }
      if (!(d === U || (l.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= W, Ne(s, d);
        else {
          (s.f & W) !== 0 && (s.f ^= W), Ne(s, v);
          for (const [x, C] of u) {
            if (u.delete(x), x === o) break;
            C.reject(U);
          }
        }
        o.deactivate();
      }
    };
    f.promise.then(c, (v) => c(null, v || "unknown"));
  }), Cn(() => {
    for (const l of u.values())
      l.reject(U);
  }), new Promise((l) => {
    function f(o) {
      function h() {
        o === i ? l(s) : f(i);
      }
      o.then(h, h);
    }
    f(i);
  });
}
function Sn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      q(
        /** @type {Effect} */
        t[n]
      );
  }
}
function An(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & m) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ve(e) {
  var t, n = p;
  Y(An(e));
  try {
    e.f &= ~ne, Sn(e), t = qt(e);
  } finally {
    Y(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = jt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    y(e, b);
    return;
  }
  ie || (I !== null ? (He() || w?.is_fork) && I.set(e, n) : ze(e));
}
function Rn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Jt, t.ac = null, ye(t, 0), Ke(t));
}
function Et(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && de(t);
}
let qe = /* @__PURE__ */ new Set();
const Z = /* @__PURE__ */ new Map();
let xt = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: at,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function F(e, t) {
  const n = Oe(e);
  return Vn(n), n;
}
function P(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!j || (_.f & We) !== 0) && ht() && (_.f & (m | J | Ye | We)) !== 0 && (D === null || !oe.call(D, e)) && an();
  let r = n ? _e(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ie ? Z.set(e, t) : Z.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & m) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Ve(s), I === null && ze(s);
    }
    e.wv = jt(), Tt(e, S, n), p !== null && (p.f & b) !== 0 && (p.f & (V | te)) === 0 && (N === null ? $n([e]) : N.push(e)), !i.is_fork && qe.size > 0 && !xt && Nn();
  }
  return t;
}
function Nn() {
  xt = !1;
  for (const e of qe)
    (e.f & b) !== 0 && y(e, B), be(e) && de(e);
  qe.clear();
}
function we(e) {
  P(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, l = (u & S) === 0;
      if (l && y(a, t), (u & m) !== 0) {
        var f = (
          /** @type {Derived} */
          a
        );
        I?.delete(f), (u & ne) === 0 && (u & O && (a.f |= ne), Tt(f, B, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & J) !== 0 && z !== null && z.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || xe in e)
    return e;
  const t = Zt(e);
  if (t !== Gt && t !== Wt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vt(e), i = /* @__PURE__ */ F(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var l = _, f = ee;
    M(null), et(s);
    var o = u();
    return M(l), et(f), o;
  };
  return r && n.set("length", /* @__PURE__ */ F(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, l, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && fn();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ F(f.value);
          return n.set(l, h), h;
        }) : P(o, f.value, !0), !0;
      },
      deleteProperty(u, l) {
        var f = n.get(l);
        if (f === void 0) {
          if (l in u) {
            const o = a(() => /* @__PURE__ */ F(E));
            n.set(l, o), we(i);
          }
        } else
          P(f, E), we(i);
        return !0;
      },
      get(u, l, f) {
        if (l === xe)
          return e;
        var o = n.get(l), h = l in u;
        if (o === void 0 && (!h || ge(u, l)?.writable) && (o = a(() => {
          var v = _e(h ? u[l] : E), d = /* @__PURE__ */ F(v);
          return d;
        }), n.set(l, o)), o !== void 0) {
          var c = k(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, l, f);
      },
      getOwnPropertyDescriptor(u, l) {
        var f = Reflect.getOwnPropertyDescriptor(u, l);
        if (f && "value" in f) {
          var o = n.get(l);
          o && (f.value = k(o));
        } else if (f === void 0) {
          var h = n.get(l), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return f;
      },
      has(u, l) {
        if (l === xe)
          return !0;
        var f = n.get(l), o = f !== void 0 && f.v !== E || Reflect.has(u, l);
        if (f !== void 0 || p !== null && (!o || ge(u, l)?.writable)) {
          f === void 0 && (f = a(() => {
            var c = o ? _e(u[l]) : E, v = /* @__PURE__ */ F(c);
            return v;
          }), n.set(l, f));
          var h = k(f);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, l, f, o) {
        var h = n.get(l), c = l in u;
        if (r && l === "length")
          for (var v = f; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? P(d, E) : v in u && (d = a(() => /* @__PURE__ */ F(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(u, l)?.writable) && (h = a(() => /* @__PURE__ */ F(void 0)), P(h, _e(f)), n.set(l, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(f));
          P(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, l);
        if (x?.set && x.set.call(o, f), !c) {
          if (r && typeof l == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(l);
            Number.isInteger(le) && le >= C.v && P(C, le + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(u) {
        k(i);
        var l = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [f, o] of n)
          o.v !== E && !(f in u) && l.push(f);
        return l;
      },
      setPrototypeOf() {
        un();
      }
    }
  );
}
var Qe, kt, St, At;
function Fn() {
  if (Qe === void 0) {
    Qe = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    St = ge(t, "firstChild").get, At = ge(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $e(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function me(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r);
  return r;
}
function On(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(hn, e, void 0)
  );
}
function Ft(e) {
  var t = _, n = p;
  M(null), Y(null);
  try {
    return e();
  } finally {
    M(t), Y(n);
  }
}
function Dn(e) {
  p === null && (_ === null && sn(), rn()), ie && nn();
}
function Mn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function $(e, t) {
  var n = p;
  n !== null && (n.f & G) !== 0 && (e |= G);
  var r = {
    ctx: R,
    deps: null,
    nodes: null,
    f: e | S | O,
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
  if ((e & ce) !== 0)
    ue !== null ? ue.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      de(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & J) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && Mn(i, n), _ !== null && (_.f & m) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function He() {
  return _ !== null && !j;
}
function Cn(e) {
  const t = $(Fe, null);
  return y(t, b), t.teardown = e, t;
}
function Pn(e) {
  Dn();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !_ && (t & V) !== 0 && (t & se) === 0;
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
  return $(ce | en, e);
}
function In(e) {
  re.ensure();
  const t = $(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ke(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function jn(e) {
  return $(ce, e);
}
function Ln(e) {
  return $(Ye | ve, e);
}
function Dt(e, t = 0) {
  return $(Fe | t, e);
}
function qn(e, t = [], n = [], r = []) {
  En(r, t, n, (i) => {
    $(Fe, () => e(...i.map(k)));
  });
}
function Bn(e, t = 0) {
  var n = $(J | t, e);
  return n;
}
function Q(e) {
  return $(V | ve, e);
}
function Mt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = _;
    Xe(!0), M(null);
    try {
      t.call(null);
    } finally {
      Xe(n), M(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ft(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function Yn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & V) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Xt) !== 0) && e.nodes !== null && e.nodes.end !== null && (zn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), y(e, Ie), Ke(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Mt(e), e.f ^= Ie, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Ct(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function zn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $e(e);
    e.remove(), e = n;
  }
}
function Ct(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ke(e, t, n = !0) {
  var r = [];
  Pt(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var u of r)
      u.out(a);
  } else
    i();
}
function Pt(e, t, n) {
  if ((e.f & G) === 0) {
    e.f ^= G;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & V) !== 0 && (e.f & J) !== 0;
      Pt(i, t, a ? n : !1), i = s;
    }
  }
}
function Un(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ $e(n);
      t.append(n), n = i;
    }
}
let Se = !1, ie = !1;
function Xe(e) {
  ie = e;
}
let _ = null, j = !1;
function M(e) {
  _ = e;
}
let p = null;
function Y(e) {
  p = e;
}
let D = null;
function Vn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, A = 0, N = null;
function $n(e) {
  N = e;
}
let It = 1, X = 0, ee = X;
function et(e) {
  ee = e;
}
function jt() {
  return ++It;
}
function be(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & m && (e.f &= ~ne), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
        /** @type {Derived} */
        s
      ) && mt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    I === null && y(e, b);
  }
  return !1;
}
function Lt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && oe.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & m) !== 0 ? Lt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? y(s, S) : (s.f & b) !== 0 && y(s, B), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function qt(e) {
  var t = T, n = A, r = N, i = _, s = D, a = R, u = j, l = ee, f = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, N = null, _ = (f & (V | te)) === 0 ? e : null, D = null, he(e.ctx), j = !1, ee = ++X, e.ac !== null && (Ft(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || ye(e, A), c !== null && A > 0)
        for (c.length = A + T.length, d = 0; d < T.length; d++)
          c[A + d] = T[d];
      else
        e.deps = c = T;
      if (He() && (e.f & O) !== 0)
        for (d = A; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (ye(e, A), c.length = A);
    if (ht() && N !== null && !j && c !== null && (e.f & (m | B | S)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      N.length; d++)
        Lt(
          N[d],
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
      N !== null && (r === null ? r = N : r.push(.../** @type {Source[]} */
      N));
    }
    return (e.f & W) !== 0 && (e.f ^= W), h;
  } catch (g) {
    return dt(g);
  } finally {
    e.f ^= je, T = t, A = n, N = r, _ = i, D = s, he(a), j = u, ee = l;
  }
}
function Hn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = $t.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & m) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !oe.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & O) !== 0 && (s.f ^= O, s.f &= ~ne), ze(s), Rn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hn(e, n[r]);
}
function de(e) {
  var t = e.f;
  if ((t & L) === 0) {
    y(e, b);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (J | ut)) !== 0 ? Yn(e) : Ke(e), Mt(e);
      var i = qt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = It;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function k(e) {
  var t = e.f, n = (t & m) !== 0;
  if (_ !== null && !j) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (D === null || !oe.call(D, e))) {
      var i = _.deps;
      if ((_.f & je) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : oe.call(s, _) || s.push(_);
      }
    }
  }
  if (ie && Z.has(e))
    return Z.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var u = a.v;
      return ((a.f & b) === 0 && a.reactions !== null || Yt(a)) && (u = Ve(a)), Z.set(a, u), u;
    }
    var l = (a.f & O) === 0 && !j && _ !== null && (Se || (_.f & O) !== 0), f = (a.f & se) === 0;
    be(a) && (l && (a.f |= O), mt(a)), l && !f && (Et(a), Bt(a));
  }
  if (I?.has(e))
    return I.get(e);
  if ((e.f & W) !== 0)
    throw e.v;
  return e.v;
}
function Bt(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & m) !== 0 && (t.f & O) === 0 && (Et(
        /** @type {Derived} */
        t
      ), Bt(
        /** @type {Derived} */
        t
      ));
}
function Yt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & m) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function zt(e) {
  var t = j;
  try {
    return j = !0, e();
  } finally {
    j = t;
  }
}
const tt = globalThis.Deno?.core?.ops ?? null;
function Kn(e, ...t) {
  tt?.[e] ? tt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nt(e, t) {
  Kn("op_set_text", e, t);
}
const Gn = ["touchstart", "touchmove"];
function Wn(e) {
  return Gn.includes(e);
}
const pe = Symbol("events"), Ut = /* @__PURE__ */ new Set(), Be = /* @__PURE__ */ new Set();
function Zn(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function Jn(e) {
  for (var t = 0; t < e.length; t++)
    Ut.add(e[t]);
  for (var n of Be)
    n(e);
}
let rt = null;
function it(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  rt = e;
  var a = 0, u = rt === e && e[pe];
  if (u) {
    var l = i.indexOf(u);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    l <= f && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Kt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    M(null), Y(null);
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
      e[pe] = t, delete e.currentTarget, M(o), Y(h);
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
  var t = On("template");
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
  var n = (t & cn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = er(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
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
function sr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  Fn();
  var l = void 0, f = In(() => {
    var o = n ?? t.appendChild(Rt());
    bn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        ot({});
        var d = (
          /** @type {ComponentContext} */
          R
        );
        s && (d.c = s), i && (r.$$events = i), l = e(v, r) || {}, ct();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = Wn(g);
          for (const De of [t, document]) {
            var C = Ee.get(De);
            C === void 0 && (C = /* @__PURE__ */ new Map(), Ee.set(De, C));
            var le = C.get(g);
            le === void 0 ? (De.addEventListener(g, it, { passive: x }), C.set(g, 1)) : C.set(g, le + 1);
          }
        }
      }
    };
    return c(Ht(Ut)), Be.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, it), d.delete(v), d.size === 0 && Ee.delete(x)) : d.set(v, g);
        }
      Be.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return lr.set(l, f), l;
}
let lr = /* @__PURE__ */ new WeakMap();
function st(e, t) {
  return e === t || e?.[xe] === t;
}
function lt(e = {}, t, n, r) {
  var i = (
    /** @type {ComponentContext} */
    R.r
  ), s = (
    /** @type {Effect} */
    p
  );
  return jn(() => {
    var a, u;
    return Dt(() => {
      a = u, u = [], zt(() => {
        e !== n(...u) && (t(e, ...u), a && st(n(...a), e) && t(null, ...a));
      });
    }), () => {
      let l = s;
      for (; l !== i && l.parent !== null && l.parent.f & Ie; )
        l = l.parent;
      const f = () => {
        u && st(n(...u), e) && t(null, ...u);
      }, o = l.teardown;
      l.teardown = () => {
        f(), o?.();
      };
    };
  }), e;
}
var fr = /* @__PURE__ */ nr('<div><input placeholder="Bound input"/> <textarea placeholder="Bound textarea"></textarea> <button>Focus Input</button> <div> </div> <div> </div></div>');
function ur(e, t) {
  ot(t, !0);
  let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(!1);
  Pn(() => {
    k(n) !== null && P(s, !0);
  });
  function a() {
    k(n) && (k(n).focus(), P(i, !0));
  }
  var u = fr(), l = Ce(u);
  lt(l, (g) => P(n, g), () => k(n));
  var f = me(l, 2);
  lt(f, (g) => P(r, g), () => k(r));
  var o = me(f, 2), h = me(o, 2), c = Ce(h), v = me(h, 2), d = Ce(v);
  qn(() => {
    nt(c, `Ref assigned: ${k(s) ?? ""}`), nt(d, `Focused: ${k(i) ?? ""}`);
  }), Zn("click", o, a), rr(e, u), ct();
}
Jn(["click"]);
function or(e) {
  return ir(ur, { target: e });
}
export {
  or as default,
  or as rvst_mount
};

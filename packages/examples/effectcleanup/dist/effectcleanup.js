var Lt = Array.isArray, qt = Array.prototype.indexOf, oe = Array.prototype.includes, Yt = Array.from, zt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Ut = Object.prototype, Vt = Array.prototype, Bt = Object.getPrototypeOf, He = Object.isExtensible;
const Ht = () => {
};
function $t(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function rt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Re = 8, it = 1 << 24, Z = 16, B = 32, te = 64, Ce = 128, R = 512, y = 1024, k = 2048, Y = 4096, K = 8192, L = 16384, se = 32768, $e = 1 << 25, ke = 65536, Ke = 1 << 17, Kt = 1 << 18, de = 1 << 19, Gt = 1 << 20, ne = 65536, Me = 1 << 21, Le = 1 << 22, G = 1 << 23, De = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Wt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zt(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Jt() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Qt(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Xt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function en() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function rn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const sn = 2, E = Symbol(), ln = "http://www.w3.org/1999/xhtml";
function fn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function st(e) {
  return e === this.v;
}
let O = null;
function ce(e) {
  O = e;
}
function lt(e, t = !1, n) {
  O = {
    p: O,
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
function ft(e) {
  var t = (
    /** @type {ComponentContext} */
    O
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      At(r);
  }
  return t.i = !0, O = t.p, /** @type {T} */
  {};
}
function ut() {
  return !0;
}
let fe = [];
function un() {
  var e = fe;
  fe = [], $t(e);
}
function ae(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && un();
    });
  }
  fe.push(e);
}
function at(e) {
  var t = p;
  if (t === null)
    return _.f |= G, e;
  if ((t.f & se) === 0 && (t.f & we) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ce) !== 0) {
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
const an = -7169;
function m(e, t) {
  e.f = e.f & an | t;
}
function qe(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, Y);
}
function ot(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ot(
        /** @type {Derived} */
        t.deps
      ));
}
function ct(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), ot(e.deps), m(e, y);
}
const H = /* @__PURE__ */ new Set();
let w = null, C = null, Pe = null, Fe = !1, ue = null, Ee = null;
var Ge = 0;
let on = 1;
class re {
  id = on++;
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
  #_() {
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (Ge++ > 1e3 && (H.delete(this), cn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, Y), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ue = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw vt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (ue = null, Ee = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [f, u] of this.#s)
        _t(f, u);
    } else {
      this.#r.size === 0 && H.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), We(r), We(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
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
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (B | te)) !== 0, f = a && (s & y) !== 0, u = f || (s & K) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), he(i));
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
      ct(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & G) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#h();
    } finally {
      Ge = 0, Pe = null, ue = null, Ee = null, Fe = !1, w = null, C = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), H.delete(this);
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
          ht(f, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#a(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of H)
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
    return (this.#i ??= rt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Fe || (H.add(w), ae(() => {
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
    if (Pe = t, t.b?.is_pending && (t.f & (we | Re | it)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | B)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function cn() {
  try {
    Xt();
  } catch (e) {
    $(e, Pe);
  }
}
let U = null;
function We(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | K)) === 0 && ye(r) && (U = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), U?.size > 0)) {
        W.clear();
        for (const i of U) {
          if ((i.f & (L | K)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            U.has(a) && (U.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (L | K)) === 0 && he(u);
          }
        }
        U.clear();
      }
    }
    U = null;
  }
}
function ht(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? ht(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Le | Z)) !== 0 && (s & k) === 0 && dt(i, t, r) && (m(i, k), Ye(
        /** @type {Effect} */
        i
      ));
    }
}
function dt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (oe.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && dt(
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
function Ye(e) {
  w.schedule(e);
}
function _t(e, t) {
  if (!((e.f & B) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      _t(n, t), n = n.next;
  }
}
function vt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    vt(t), t = t.next;
}
function hn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Ve() && (j(n), Cn(() => (t === 0 && (r = Un(() => e(() => ge(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var dn = ke | de;
function _n(e, t, n, r) {
  new vn(e, t, n, r);
}
class vn {
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
  #_ = /* @__PURE__ */ new Set();
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
  #v = hn(() => (this.#a = Ne(this.#o), () => {
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
      a.b = this, a.f |= Ce, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Pn(() => {
      this.#m();
    }, dn);
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#l)), ae(() => {
      var n = this.#s = document.createDocumentFragment(), r = Tt();
      n.append(r), this.#e = this.#g(() => Q(() => this.#f(r))), this.#u === 0 && (this.#l.before(n), this.#s = null, xe(
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
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Ln(this.#e, t);
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ct(t, this.#_, this.#h);
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
    var n = p, r = _, i = O;
    z(this.#i), D(this.#i), ce(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return at(s), null;
    } finally {
      z(n), D(r), ce(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && xe(this.#t, () => {
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, ae(() => {
      this.#c = !1, this.#a && Ae(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#v(), j(
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
        fn();
        return;
      }
      i = !0, s && rn(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        $(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Ce, r(
              this.#l,
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
    ae(() => {
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
function pn(e, t, n, r) {
  const i = wn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = gn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (a.f & L) === 0 && $(v, a);
    }
    Se();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = pt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ mn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => $(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Se();
  }) : h();
}
function gn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = O, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), D(t), ce(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  z(null), D(null), ce(null), e && w?.deactivate();
}
function pt() {
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
function wn(e) {
  var t = b | k, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: O,
    deps: null,
    effects: null,
    equals: st,
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
function mn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Wt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return Fn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = rt();
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
      if ((u.f & se) !== 0)
        var h = pt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(V), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(V);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === V;
        h(g);
      }
      if (!(d === V || (u.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= G, Ae(s, d);
        else {
          (s.f & G) !== 0 && (s.f ^= G), Ae(s, v);
          for (const [x, F] of f) {
            if (f.delete(x), x === o) break;
            F.reject(V);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Nn(() => {
    for (const u of f.values())
      u.reject(V);
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
function yn(e) {
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
function bn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & L) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function ze(e) {
  var t, n = p;
  z(bn(e));
  try {
    e.f &= ~ne, yn(e), t = Mt(e);
  } finally {
    z(n);
  }
  return t;
}
function gt(e) {
  var t = e.v, n = ze(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  ie || (C !== null ? (Ve() || w?.is_fork) && C.set(e, n) : qe(e));
}
function En(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Ht, t.ac = null, me(t, 0), Be(t));
}
function wt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Ie = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let mt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: st,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Ne(e);
  return qn(n), n;
}
function I(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (_.f & Ke) !== 0) && ut() && (_.f & (b | Z | Le | Ke)) !== 0 && (N === null || !oe.call(N, e)) && nn();
  let r = n ? _e(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ie ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && ze(s), C === null && qe(s);
    }
    e.wv = Ft(), yt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (B | te)) === 0 && (A === null ? Yn([e]) : A.push(e)), !i.is_fork && Ie.size > 0 && !mt && xn();
  }
  return t;
}
function xn() {
  mt = !1;
  for (const e of Ie)
    (e.f & y) !== 0 && m(e, Y), ye(e) && he(e);
  Ie.clear();
}
function ge(e) {
  I(e, e.v + 1);
}
function yt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        C?.delete(l), (f & ne) === 0 && (f & R && (a.f |= ne), yt(l, Y, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && U !== null && U.add(o), n !== null ? n.push(o) : Ye(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Bt(e);
  if (t !== Ut && t !== Vt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Lt(e), i = /* @__PURE__ */ P(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var u = _, l = ee;
    D(null), Xe(s);
    var o = f();
    return D(u), Xe(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && en();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ P(l.value);
          return n.set(u, h), h;
        }) : I(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ P(E));
            n.set(u, o), ge(i);
          }
        } else
          I(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === De)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || pe(f, u)?.writable) && (o = a(() => {
          var v = _e(h ? f[u] : E), d = /* @__PURE__ */ P(v);
          return d;
        }), n.set(u, o)), o !== void 0) {
          var c = j(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var o = n.get(u);
          o && (l.value = j(o));
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
        if (u === De)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || pe(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? _e(f[u]) : E, v = /* @__PURE__ */ P(c);
            return v;
          }), n.set(u, l));
          var h = j(l);
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
            d !== void 0 ? I(d, E) : v in f && (d = a(() => /* @__PURE__ */ P(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = a(() => /* @__PURE__ */ P(void 0)), I(h, _e(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(l));
          I(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(u);
            Number.isInteger(le) && le >= F.v && I(F, le + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        j(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        tn();
      }
    }
  );
}
var Ze, bt, Et, xt;
function Tn() {
  if (Ze === void 0) {
    Ze = window, bt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Et = pe(t, "firstChild").get, xt = pe(t, "nextSibling").get, He(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), He(n) && (n.__t = void 0);
  }
}
function Tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function kt(e) {
  return (
    /** @type {TemplateNode | null} */
    Et.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
function Je(e, t) {
  return /* @__PURE__ */ kt(e);
}
function kn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
  return r;
}
function Sn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(ln, e, void 0)
  );
}
function St(e) {
  var t = _, n = p;
  D(null), z(null);
  try {
    return e();
  } finally {
    D(t), z(n);
  }
}
function An(e) {
  p === null && (_ === null && Qt(), Jt()), ie && Zt();
}
function Rn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & K) !== 0 && (e |= K);
  var r = {
    ctx: O,
    deps: null,
    nodes: null,
    f: e | k | R,
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
    ue !== null ? ue.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Rn(i, n), _ !== null && (_.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Ve() {
  return _ !== null && !M;
}
function Nn(e) {
  const t = J(Re, null);
  return m(t, y), t.teardown = e, t;
}
function On(e) {
  An();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !_ && (t & B) !== 0 && (t & se) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      O
    );
    (r.e ??= []).push(e);
  } else
    return At(e);
}
function At(e) {
  return J(we | Gt, e);
}
function Dn(e) {
  re.ensure();
  const t = J(te | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function Fn(e) {
  return J(Le | de, e);
}
function Cn(e, t = 0) {
  return J(Re | t, e);
}
function Mn(e, t = [], n = [], r = []) {
  pn(r, t, n, (i) => {
    J(Re, () => e(...i.map(j)));
  });
}
function Pn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(B | de, e);
}
function Rt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = _;
    Qe(!0), D(null);
    try {
      t.call(null);
    } finally {
      Qe(n), D(r);
    }
  }
}
function Be(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && St(() => {
      i.abort(V);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function In(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (jn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, $e), Be(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Rt(e), e.f ^= $e, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Ot(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ot(e, t, n) {
  if ((e.f & K) === 0) {
    e.f ^= K;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & Z) !== 0;
      Ot(i, t, a ? n : !1), i = s;
    }
  }
}
function Ln(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let Te = !1, ie = !1;
function Qe(e) {
  ie = e;
}
let _ = null, M = !1;
function D(e) {
  _ = e;
}
let p = null;
function z(e) {
  p = e;
}
let N = null;
function qn(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function Yn(e) {
  A = e;
}
let Dt = 1, X = 0, ee = X;
function Xe(e) {
  ee = e;
}
function Ft() {
  return ++Dt;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & Y) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && gt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, y);
  }
  return !1;
}
function Ct(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && oe.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Ct(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, Y), Ye(
        /** @type {Effect} */
        s
      ));
    }
}
function Mt(e) {
  var t = T, n = S, r = A, i = _, s = N, a = O, f = M, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, _ = (l & (B | te)) === 0 ? e : null, N = null, ce(e.ctx), M = !1, ee = ++X, e.ac !== null && (St(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Me;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || me(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (Ve() && (e.f & R) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && S < c.length && (me(e, S), c.length = S);
    if (ut() && A !== null && !M && c !== null && (e.f & (b | Y | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Ct(
          A[d],
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
      A !== null && (r === null ? r = A : r.push(.../** @type {Source[]} */
      A));
    }
    return (e.f & G) !== 0 && (e.f ^= G), h;
  } catch (g) {
    return at(g);
  } finally {
    e.f ^= Me, T = t, S = n, A = r, _ = i, N = s, ce(a), M = f, ee = u;
  }
}
function zn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = qt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !oe.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), qe(s), En(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      zn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | it)) !== 0 ? In(e) : Be(e), Rt(e);
      var i = Mt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Dt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function j(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !M) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (N === null || !oe.call(N, e))) {
      var i = _.deps;
      if ((_.f & Me) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : oe.call(s, _) || s.push(_);
      }
    }
  }
  if (ie && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || It(a)) && (f = ze(a)), W.set(a, f), f;
    }
    var u = (a.f & R) === 0 && !M && _ !== null && (Te || (_.f & R) !== 0), l = (a.f & se) === 0;
    ye(a) && (u && (a.f |= R), gt(a)), u && !l && (wt(a), Pt(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & G) !== 0)
    throw e.v;
  return e.v;
}
function Pt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (wt(
        /** @type {Derived} */
        t
      ), Pt(
        /** @type {Derived} */
        t
      ));
}
function It(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & b) !== 0 && It(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Un(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const et = globalThis.Deno?.core?.ops ?? null;
function Vn(e, ...t) {
  et?.[e] ? et[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Bn(e, t) {
  Vn("op_set_text", e, t);
}
const Hn = ["touchstart", "touchmove"];
function $n(e) {
  return Hn.includes(e);
}
const ve = Symbol("events"), jt = /* @__PURE__ */ new Set(), je = /* @__PURE__ */ new Set();
function Kn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Gn(e) {
  for (var t = 0; t < e.length; t++)
    jt.add(e[t]);
  for (var n of je)
    n(e);
}
let tt = null;
function nt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  tt = e;
  var a = 0, f = tt === e && e[ve];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (a = u);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    zt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    D(null), z(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
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
      e[ve] = t, delete e.currentTarget, D(o), z(h);
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
  var t = Sn("template");
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
function Xn(e, t) {
  var n = (t & sn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Jn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ kt(r));
    var s = (
      /** @type {TemplateNode} */
      n || bt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Qn(s, s), s;
  };
}
function er(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function tr(e, t) {
  return nr(e, t);
}
const be = /* @__PURE__ */ new Map();
function nr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  Tn();
  var u = void 0, l = Dn(() => {
    var o = n ?? t.appendChild(Tt());
    _n(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        lt({});
        var d = (
          /** @type {ComponentContext} */
          O
        );
        s && (d.c = s), i && (r.$$events = i), u = e(v, r) || {}, ft();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const Oe of [t, document]) {
            var F = be.get(Oe);
            F === void 0 && (F = /* @__PURE__ */ new Map(), be.set(Oe, F));
            var le = F.get(g);
            le === void 0 ? (Oe.addEventListener(g, nt, { passive: x }), F.set(g, 1)) : F.set(g, le + 1);
          }
        }
      }
    };
    return c(Yt(jt)), je.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, nt), d.delete(v), d.size === 0 && be.delete(x)) : d.set(v, g);
        }
      je.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return rr.set(u, l), u;
}
let rr = /* @__PURE__ */ new WeakMap();
var ir = /* @__PURE__ */ Xn("<div><div> </div> <button>Toggle</button></div>");
function sr(e, t) {
  lt(t, !0);
  let n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P("idle");
  On(() => {
    if (j(n))
      return I(r, "started"), () => {
        I(r, "cleaned up");
      };
  });
  var i = ir(), s = Je(i), a = Je(s), f = kn(s, 2);
  Mn(() => Bn(a, `Status: ${j(r) ?? ""}`)), Kn("click", f, () => I(n, !j(n))), er(e, i), ft();
}
Gn(["click"]);
function fr(e) {
  return tr(sr, { target: e });
}
export {
  fr as default,
  fr as rvst_mount
};

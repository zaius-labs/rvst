var jt = Array.isArray, Lt = Array.prototype.indexOf, ue = Array.prototype.includes, qt = Array.from, Yt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, zt = Object.prototype, Ut = Array.prototype, Vt = Object.getPrototypeOf, Ke = Object.isExtensible;
const Bt = () => {
};
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function st() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, we = 4, Re = 8, lt = 1 << 24, Z = 16, W = 32, te = 64, Pe = 128, R = 512, m = 1024, k = 2048, Y = 4096, $ = 8192, L = 16384, he = 32768, Ge = 1 << 25, ke = 65536, We = 1 << 17, $t = 1 << 18, _e = 1 << 19, Kt = 1 << 20, ne = 65536, Ie = 1 << 21, Ye = 1 << 22, K = 1 << 23, De = Symbol("$state"), V = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Gt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Wt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Zt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Jt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Qt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Xt() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const en = 2, E = Symbol(), tn = "http://www.w3.org/1999/xhtml";
function nn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ft(e) {
  return e === this.v;
}
let P = null;
function ae(e) {
  P = e;
}
function rn(e, t = !1, n) {
  P = {
    p: P,
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
function sn(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Sn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function ut() {
  return !0;
}
let se = [];
function ln() {
  var e = se;
  se = [], Ht(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && ln();
    });
  }
  se.push(e);
}
function at(e) {
  var t = p;
  if (t === null)
    return v.f |= K, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
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
const fn = -7169;
function b(e, t) {
  e.f = e.f & fn | t;
}
function ze(e) {
  (e.f & R) !== 0 || e.deps === null ? b(e, m) : b(e, Y);
}
function ot(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ot(
        /** @type {Derived} */
        t.deps
      ));
}
function ct(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), ot(e.deps), b(e, m);
}
const B = /* @__PURE__ */ new Set();
let w = null, M = null, je = null, Fe = !1, le = null, Ee = null;
var Ze = 0;
let un = 1;
class re {
  id = un++;
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
  #d() {
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
        b(r, k), this.schedule(r);
      for (r of n.m)
        b(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (Ze++ > 1e3 && (B.delete(this), an()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), b(u, k), this.schedule(u);
      for (const u of this.#n)
        b(u, Y), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Ee = [];
    for (const u of t)
      try {
        this.#a(u, n, r);
      } catch (f) {
        throw vt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (le = null, Ee = null, this.#c() || this.#d()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        dt(u, f);
    } else {
      this.#r.size === 0 && B.delete(this), this.#t.clear(), this.#n.clear();
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
      u.#e.push(...this.#e.filter((f) => !u.#e.includes(f)));
    }
    a !== null && (B.add(a), a.#h()), B.has(this) || this.#w();
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
      var s = i.f, a = (s & (W | te)) !== 0, u = a && (s & m) !== 0, f = u || (s & $) !== 0 || this.#s.has(i);
      if (!f && i.fn !== null) {
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
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), M?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, M = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#h();
    } finally {
      Ze = 0, je = null, le = null, Ee = null, Fe = !1, w = null, M = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), B.delete(this);
  }
  #w() {
    for (const l of B) {
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
        for (var u of n)
          ht(u, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#a(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of B)
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
    return (this.#i ??= st()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Fe || (B.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      M = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (je = t, t.b?.is_pending && (t.f & (we | Re | lt)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & y) === 0))
        return;
      if ((r & (te | W)) !== 0) {
        if ((r & m) === 0)
          return;
        n.f ^= m;
      }
    }
    this.#e.push(n);
  }
}
function an() {
  try {
    Wt();
  } catch (e) {
    H(e, je);
  }
}
let U = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | $)) === 0 && me(r) && (U = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Rt(r), U?.size > 0)) {
        G.clear();
        for (const i of U) {
          if ((i.f & (L | $)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            U.has(a) && (U.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (L | $)) === 0 && ce(f);
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
      (s & y) !== 0 ? ht(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ye | Z)) !== 0 && (s & k) === 0 && _t(i, t, r) && (b(i, k), Ue(
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
function Ue(e) {
  w.schedule(e);
}
function dt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & m) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), b(e, m);
    for (var n = e.first; n !== null; )
      dt(n, t), n = n.next;
  }
}
function vt(e) {
  b(e, m);
  for (var t = e.first; t !== null; )
    vt(t), t = t.next;
}
function on(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    He() && (j(n), Nn(() => (t === 0 && (r = Ln(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var cn = ke | _e;
function hn(e, t, n, r) {
  new _n(e, t, n, r);
}
class _n {
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
  #d = /* @__PURE__ */ new Set();
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
  #v = on(() => (this.#a = Ne(this.#o), () => {
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Dn(() => {
      this.#b();
    }, cn);
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
  #y(t) {
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
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Cn(this.#e, t);
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
    this.is_pending = !1, t.transfer_effects(this.#d, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ct(t, this.#d, this.#h);
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
    var n = p, r = v, i = P;
    z(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return at(s), null;
    } finally {
      z(n), O(r), ae(i);
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
    this.#m(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
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
        nn();
        return;
      }
      i = !0, s && Xt(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#b();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
      } catch (l) {
        H(l, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Q(() => {
            var l = (
              /** @type {Effect} */
              p
            );
            l.b = this, l.f |= Pe, r(
              this.#l,
              () => f,
              () => a
            );
          });
        } catch (l) {
          return H(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (l) {
        H(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => H(l, this.#i && this.#i.parent)
      ) : u(f);
    });
  }
}
function dn(e, t, n, r) {
  const i = pn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = vn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (d) {
      (a.f & L) === 0 && H(d, a);
    }
    Se();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = pt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ gn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Se();
  }) : h();
}
function vn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), O(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  z(null), O(null), ae(null), e && w?.deactivate();
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
function pn(e) {
  var t = y | k, n = v !== null && (v.f & y) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: P,
    deps: null,
    effects: null,
    equals: ft,
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
function gn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Gt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !v, u = /* @__PURE__ */ new Map();
  return Rn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = st();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Se);
    } catch (d) {
      l.reject(d), Se();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & he) !== 0)
        var h = pt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(V), u.delete(o);
      else {
        for (const d of u.values())
          d.reject(V);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (d, _ = void 0) => {
      if (h) {
        var g = _ === V;
        h(g);
      }
      if (!(_ === V || (f.f & L) !== 0)) {
        if (o.activate(), _)
          s.f |= K, Ae(s, _);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ae(s, d);
          for (const [x, D] of u) {
            if (u.delete(x), x === o) break;
            D.reject(V);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), kn(() => {
    for (const f of u.values())
      f.reject(V);
  }), new Promise((f) => {
    function l(o) {
      function h() {
        o === i ? f(s) : l(i);
      }
      o.then(h, h);
    }
    l(i);
  });
}
function wn(e) {
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
    if ((t.f & y) === 0)
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
  z(bn(e));
  try {
    e.f &= ~ne, wn(e), t = Mt(e);
  } finally {
    z(n);
  }
  return t;
}
function gt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Dt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, m);
    return;
  }
  oe || (M !== null ? (He() || w?.is_fork) && M.set(e, n) : ze(e));
}
function mn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(V), t.teardown = Bt, t.ac = null, be(t, 0), $e(t));
}
function wt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let Le = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let bt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ft,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function I(e, t) {
  const n = Ne(e);
  return Pn(n), n;
}
function F(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (v.f & We) !== 0) && ut() && (v.f & (y | Z | Ye | We)) !== 0 && (N === null || !ue.call(N, e)) && Qt();
  let r = n ? de(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), M === null && ze(s);
    }
    e.wv = Dt(), mt(e, k, n), p !== null && (p.f & m) !== 0 && (p.f & (W | te)) === 0 && (A === null ? In([e]) : A.push(e)), !i.is_fork && Le.size > 0 && !bt && yn();
  }
  return t;
}
function yn() {
  bt = !1;
  for (const e of Le)
    (e.f & m) !== 0 && b(e, Y), me(e) && ce(e);
  Le.clear();
}
function ge(e) {
  F(e, e.v + 1);
}
function mt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && b(a, t), (u & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        M?.delete(l), (u & ne) === 0 && (u & R && (a.f |= ne), mt(l, Y, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Z) !== 0 && U !== null && U.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = Vt(e);
  if (t !== zt && t !== Ut)
    return e;
  var n = /* @__PURE__ */ new Map(), r = jt(e), i = /* @__PURE__ */ I(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var f = v, l = ee;
    O(null), tt(s);
    var o = u();
    return O(f), tt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Zt();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ I(l.value);
          return n.set(f, h), h;
        }) : F(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ I(E));
            n.set(f, o), ge(i);
          }
        } else
          F(l, E), ge(i);
        return !0;
      },
      get(u, f, l) {
        if (f === De)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || pe(u, f)?.writable) && (o = a(() => {
          var d = de(h ? u[f] : E), _ = /* @__PURE__ */ I(d);
          return _;
        }), n.set(f, o)), o !== void 0) {
          var c = j(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = j(o));
        } else if (l === void 0) {
          var h = n.get(f), c = h?.v;
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
      has(u, f) {
        if (f === De)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || pe(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? de(u[f]) : E, d = /* @__PURE__ */ I(c);
            return d;
          }), n.set(f, l));
          var h = j(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, f, l, o) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var d = l; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var _ = n.get(d + "");
            _ !== void 0 ? F(_, E) : d in u && (_ = a(() => /* @__PURE__ */ I(E)), n.set(d + "", _));
          }
        if (h === void 0)
          (!c || pe(u, f)?.writable) && (h = a(() => /* @__PURE__ */ I(void 0)), F(h, de(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => de(l));
          F(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= D.v && F(D, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(u) {
        j(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        Jt();
      }
    }
  );
}
var Qe, yt, Et, xt;
function En() {
  if (Qe === void 0) {
    Qe = window, yt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Et = pe(t, "firstChild").get, xt = pe(t, "nextSibling").get, Ke(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ke(n) && (n.__t = void 0);
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
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
function Xe(e, t) {
  return /* @__PURE__ */ kt(e);
}
function Me(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function xn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(tn, e, void 0)
  );
}
function St(e) {
  var t = v, n = p;
  O(null), z(null);
  try {
    return e();
  } finally {
    O(t), z(n);
  }
}
function Tn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & $) !== 0 && (e |= $);
  var r = {
    ctx: P,
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
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Z) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Tn(i, n), v !== null && (v.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function He() {
  return v !== null && !C;
}
function kn(e) {
  const t = J(Re, null);
  return b(t, m), t.teardown = e, t;
}
function Sn(e) {
  return J(we | Kt, e);
}
function An(e) {
  re.ensure();
  const t = J(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function Rn(e) {
  return J(Ye | _e, e);
}
function Nn(e, t = 0) {
  return J(Re | t, e);
}
function On(e, t = [], n = [], r = []) {
  dn(r, t, n, (i) => {
    J(Re, () => e(...i.map(j)));
  });
}
function Dn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | _e, e);
}
function At(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    et(!0), O(null);
    try {
      t.call(null);
    } finally {
      et(n), O(r);
    }
  }
}
function $e(e, t = !1) {
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
function Fn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & $t) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, Ge), $e(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  At(e), e.f ^= Ge, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Rt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Mn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Rt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Nt(e, r, !0);
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
function Nt(e, t, n) {
  if ((e.f & $) === 0) {
    e.f ^= $;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      Nt(i, t, a ? n : !1), i = s;
    }
  }
}
function Cn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let Te = !1, oe = !1;
function et(e) {
  oe = e;
}
let v = null, C = !1;
function O(e) {
  v = e;
}
let p = null;
function z(e) {
  p = e;
}
let N = null;
function Pn(e) {
  v !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function In(e) {
  A = e;
}
let Ot = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function Dt() {
  return ++Ot;
}
function me(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & y && (e.f &= ~ne), (t & Y) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (me(
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
    M === null && b(e, m);
  }
  return !1;
}
function Ft(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Ft(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? b(s, k) : (s.f & m) !== 0 && b(s, Y), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Mt(e) {
  var t = T, n = S, r = A, i = v, s = N, a = P, u = C, f = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, v = (l & (W | te)) === 0 ? e : null, N = null, ae(e.ctx), C = !1, ee = ++X, e.ac !== null && (St(() => {
    e.ac.abort(V);
  }), e.ac = null);
  try {
    e.f |= Ie;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var _;
      if (d || be(e, S), c !== null && S > 0)
        for (c.length = S + T.length, _ = 0; _ < T.length; _++)
          c[S + _] = T[_];
      else
        e.deps = c = T;
      if (He() && (e.f & R) !== 0)
        for (_ = S; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !d && c !== null && S < c.length && (be(e, S), c.length = S);
    if (ut() && A !== null && !C && c !== null && (e.f & (y | Y | k)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      A.length; _++)
        Ft(
          A[_],
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
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (g) {
    return at(g);
  } finally {
    e.f ^= Ie, T = t, S = n, A = r, v = i, N = s, ae(a), C = u, ee = f;
  }
}
function jn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Lt.call(n, e);
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
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), ze(s), mn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      jn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & L) === 0) {
    b(e, m);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (Z | lt)) !== 0 ? Fn(e) : $e(e), At(e);
      var i = Mt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ot;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function j(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !C) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = v.deps;
      if ((v.f & Ie) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (v.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [v] : ue.call(s, v) || s.push(v);
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
      var u = a.v;
      return ((a.f & m) === 0 && a.reactions !== null || Pt(a)) && (u = Ve(a)), G.set(a, u), u;
    }
    var f = (a.f & R) === 0 && !C && v !== null && (Te || (v.f & R) !== 0), l = (a.f & he) === 0;
    me(a) && (f && (a.f |= R), gt(a)), f && !l && (wt(a), Ct(a));
  }
  if (M?.has(e))
    return M.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Ct(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & R) === 0 && (wt(
        /** @type {Derived} */
        t
      ), Ct(
        /** @type {Derived} */
        t
      ));
}
function Pt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & y) !== 0 && Pt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Ln(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function qn(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Yn(e, t) {
  qn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function Un(e) {
  return zn.includes(e);
}
const ve = Symbol("events"), It = /* @__PURE__ */ new Set(), qe = /* @__PURE__ */ new Set();
function Ce(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Vn(e) {
  for (var t = 0; t < e.length; t++)
    It.add(e[t]);
  for (var n of qe)
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
  var a = 0, u = rt === e && e[ve];
  if (u) {
    var f = i.indexOf(u);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    f <= l && (a = f);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Yt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    O(null), z(null);
    try {
      for (var c, d = []; s !== null; ) {
        var _ = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? d.push(x) : c = x;
        }
        if (e.cancelBubble || _ === t || _ === null)
          break;
        s = _;
      }
      if (c) {
        for (let x of d)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[ve] = t, delete e.currentTarget, O(o), z(h);
    }
  }
}
const Bn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Hn(e) {
  return (
    /** @type {string} */
    Bn?.createHTML(e) ?? e
  );
}
function $n(e) {
  var t = xn("template");
  return t.innerHTML = Hn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Kn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t) {
  var n = (t & en) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = $n(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ kt(r));
    var s = (
      /** @type {TemplateNode} */
      n || yt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Kn(s, s), s;
  };
}
function Wn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Zn(e, t) {
  return Jn(e, t);
}
const ye = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  En();
  var f = void 0, l = An(() => {
    var o = n ?? t.appendChild(Tt());
    hn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        rn({});
        var _ = (
          /** @type {ComponentContext} */
          P
        );
        s && (_.c = s), i && (r.$$events = i), f = e(d, r) || {}, sn();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var g = d[_];
        if (!h.has(g)) {
          h.add(g);
          var x = Un(g);
          for (const Oe of [t, document]) {
            var D = ye.get(Oe);
            D === void 0 && (D = /* @__PURE__ */ new Map(), ye.set(Oe, D));
            var ie = D.get(g);
            ie === void 0 ? (Oe.addEventListener(g, it, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(qt(It)), qe.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            ye.get(x)
          ), g = (
            /** @type {number} */
            _.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, it), _.delete(d), _.size === 0 && ye.delete(x)) : _.set(d, g);
        }
      qe.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(f, l), f;
}
let Qn = /* @__PURE__ */ new WeakMap();
var Xn = /* @__PURE__ */ Gn("<div><div> </div> <button>Start</button> <button>Stop</button> <button>Reset</button></div>");
function er(e) {
  let t = /* @__PURE__ */ I(0), n = /* @__PURE__ */ I(!1), r = null;
  function i() {
    j(n) || (F(n, !0), r = setInterval(
      () => {
        F(t, j(t) + 1);
      },
      1e3
    ));
  }
  function s() {
    F(n, !1), clearInterval(r), r = null;
  }
  function a() {
    s(), F(t, 0);
  }
  var u = Xn(), f = Xe(u), l = Xe(f), o = Me(f, 2), h = Me(o, 2), c = Me(h, 2);
  On(() => Yn(l, `Ticks: ${j(t) ?? ""}`)), Ce("click", o, i), Ce("click", h, s), Ce("click", c, a), Wn(e, u);
}
Vn(["click"]);
function nr(e) {
  return Zn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

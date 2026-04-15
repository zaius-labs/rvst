var Lt = Array.isArray, qt = Array.prototype.indexOf, ue = Array.prototype.includes, Yt = Array.from, zt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, $t = Object.prototype, Ut = Array.prototype, Vt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Bt = () => {
};
function Ht(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const y = 2, we = 4, De = 8, ft = 1 << 24, Z = 16, W = 32, te = 64, Ie = 128, D = 512, m = 1024, k = 2048, Y = 4096, H = 8192, L = 16384, he = 32768, We = 1 << 25, Ae = 65536, Ze = 1 << 17, Kt = 1 << 18, de = 1 << 19, Gt = 1 << 20, ne = 65536, je = 1 << 21, ze = 1 << 22, K = 1 << 23, Pe = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Wt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Zt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Jt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Qt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Xt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function en() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const tn = 2, E = Symbol(), nn = "http://www.w3.org/1999/xhtml";
function rn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let j = null;
function ae(e) {
  j = e;
}
function sn(e, t = !1, n) {
  j = {
    p: j,
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
function ln(e) {
  var t = (
    /** @type {ComponentContext} */
    j
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      An(r);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function at() {
  return !0;
}
let se = [];
function fn() {
  var e = se;
  se = [], Ht(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && fn();
    });
  }
  se.push(e);
}
function ot(e) {
  var t = p;
  if (t === null)
    return v.f |= K, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  B(e, t);
}
function B(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
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
const un = -7169;
function b(e, t) {
  e.f = e.f & un | t;
}
function $e(e) {
  (e.f & D) !== 0 || e.deps === null ? b(e, m) : b(e, Y);
}
function ct(e) {
  if (e !== null)
    for (const t of e)
      (t.f & y) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ct(
        /** @type {Derived} */
        t.deps
      ));
}
function ht(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), ct(e.deps), b(e, m);
}
const V = /* @__PURE__ */ new Set();
let w = null, C = null, Le = null, Me = !1, le = null, Te = null;
var Je = 0;
let an = 1;
class re {
  id = an++;
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
        b(r, k), this.schedule(r);
      for (r of n.m)
        b(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (Je++ > 1e3 && (V.delete(this), on()), !this.#c()) {
      for (const u of this.#t)
        this.#n.delete(u), b(u, k), this.schedule(u);
      for (const u of this.#n)
        b(u, Y), this.schedule(u);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Te = [];
    for (const u of t)
      try {
        this.#a(u, n, r);
      } catch (f) {
        throw pt(u), f;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const u of i)
        s.schedule(u);
    }
    if (le = null, Te = null, this.#c() || this.#_()) {
      this.#v(r), this.#v(n);
      for (const [u, f] of this.#s)
        vt(u, f);
    } else {
      this.#r.size === 0 && V.delete(this), this.#t.clear(), this.#n.clear();
      for (const u of this.#l) u(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
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
    a !== null && (V.add(a), a.#h()), V.has(this) || this.#w();
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
      var s = i.f, a = (s & (W | te)) !== 0, u = a && (s & m) !== 0, f = u || (s & H) !== 0 || this.#s.has(i);
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
      ht(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, [t.v, r]), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Me = !0, w = this, this.#h();
    } finally {
      Je = 0, Le = null, le = null, Te = null, Me = !1, w = null, C = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), V.delete(this);
  }
  #w() {
    for (const l of V) {
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
          dt(u, i, s, a);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#a(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of V)
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
    this.#d.add(t);
  }
  settled() {
    return (this.#i ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Me || (V.add(w), fe(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (we | De | ft)) !== 0 && (t.f & he) === 0) {
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
function on() {
  try {
    Zt();
  } catch (e) {
    B(e, Le);
  }
}
let $ = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | H)) === 0 && me(r) && ($ = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), $?.size > 0)) {
        G.clear();
        for (const i of $) {
          if ((i.f & (L | H)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), s.push(a)), a = a.parent;
          for (let u = s.length - 1; u >= 0; u--) {
            const f = s[u];
            (f.f & (L | H)) === 0 && ce(f);
          }
        }
        $.clear();
      }
    }
    $ = null;
  }
}
function dt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & y) !== 0 ? dt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (ze | Z)) !== 0 && (s & k) === 0 && _t(i, t, r) && (b(i, k), Ue(
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
function vt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & m) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), b(e, m);
    for (var n = e.first; n !== null; )
      vt(n, t), n = n.next;
  }
}
function pt(e) {
  b(e, m);
  for (var t = e.first; t !== null; )
    pt(t), t = t.next;
}
function cn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    He() && (A(n), Dn(() => (t === 0 && (r = qn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var hn = Ae | de;
function dn(e, t, n, r) {
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
  #v = cn(() => (this.#a = Oe(this.#o), () => {
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
      a.b = this, a.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Fn(() => {
      this.#b();
    }, hn);
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
      var n = this.#s = document.createDocumentFragment(), r = kt();
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
    this.is_pending = !1, t.transfer_effects(this.#_, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ht(t, this.#_, this.#h);
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
    var n = p, r = v, i = j;
    z(this.#i), F(this.#i), ae(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ot(s), null;
    } finally {
      z(n), F(r), ae(i);
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
    this.#m(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#a && Ne(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#v(), A(
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
        rn();
        return;
      }
      i = !0, s && en(), this.#n !== null && ke(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#b();
      });
    }, u = (f) => {
      try {
        s = !0, n?.(f, a), s = !1;
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
            l.b = this, l.f |= Ie, r(
              this.#l,
              () => f,
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
      var f;
      try {
        f = this.transform_error(t);
      } catch (l) {
        B(l, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        u,
        /** @param {unknown} e */
        (l) => B(l, this.#i && this.#i.parent)
      ) : u(f);
    });
  }
}
function vn(e, t, n, r) {
  const i = gn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), u = pn(), f = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    u();
    try {
      r(c);
    } catch (_) {
      (a.f & L) === 0 && B(_, a);
    }
    Re();
  }
  if (n.length === 0) {
    f.then(() => l(t.map(i)));
    return;
  }
  var o = gt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ wn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => B(c, a)).finally(() => o());
  }
  f ? f.then(() => {
    u(), h(), Re();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = j, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), F(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  z(null), F(null), ae(null), e && w?.deactivate();
}
function gt() {
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
function gn(e) {
  var t = y | k, n = v !== null && (v.f & y) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: j,
    deps: null,
    effects: null,
    equals: ut,
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
function wn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Wt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !v, u = /* @__PURE__ */ new Map();
  return Nn(() => {
    var f = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Re);
    } catch (_) {
      l.reject(_), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((f.f & he) !== 0)
        var h = gt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        u.get(o)?.reject(U), u.delete(o);
      else {
        for (const _ of u.values())
          _.reject(U);
        u.clear();
      }
      u.set(o, l);
    }
    const c = (_, d = void 0) => {
      if (h) {
        var g = d === U;
        h(g);
      }
      if (!(d === U || (f.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= K, Ne(s, d);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ne(s, _);
          for (const [x, P] of u) {
            if (u.delete(x), x === o) break;
            P.reject(U);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (_) => c(null, _ || "unknown"));
  }), Sn(() => {
    for (const f of u.values())
      f.reject(U);
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
function bn(e) {
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
function mn(e) {
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
  z(mn(e));
  try {
    e.f &= ~ne, bn(e), t = Mt(e);
  } finally {
    z(n);
  }
  return t;
}
function wt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    b(e, m);
    return;
  }
  oe || (C !== null ? (He() || w?.is_fork) && C.set(e, n) : $e(e));
}
function yn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Bt, t.ac = null, be(t, 0), Ke(t));
}
function bt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let qe = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let mt = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ut,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function M(e, t) {
  const n = Oe(e);
  return In(n), n;
}
function N(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!I || (v.f & Ze) !== 0) && at() && (v.f & (y | Z | ze | Ze)) !== 0 && (O === null || !ue.call(O, e)) && Xt();
  let r = n ? _e(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & y) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), C === null && $e(s);
    }
    e.wv = Ft(), yt(e, k, n), p !== null && (p.f & m) !== 0 && (p.f & (W | te)) === 0 && (R === null ? jn([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !mt && En();
  }
  return t;
}
function En() {
  mt = !1;
  for (const e of qe)
    (e.f & m) !== 0 && b(e, Y), me(e) && ce(e);
  qe.clear();
}
function ge(e) {
  N(e, e.v + 1);
}
function yt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], u = a.f, f = (u & k) === 0;
      if (f && b(a, t), (u & y) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        C?.delete(l), (u & ne) === 0 && (u & D && (a.f |= ne), yt(l, Y, n));
      } else if (f) {
        var o = (
          /** @type {Effect} */
          a
        );
        (u & Z) !== 0 && $ !== null && $.add(o), n !== null ? n.push(o) : Ue(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Pe in e)
    return e;
  const t = Vt(e);
  if (t !== $t && t !== Ut)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Lt(e), i = /* @__PURE__ */ M(0), s = ee, a = (u) => {
    if (ee === s)
      return u();
    var f = v, l = ee;
    F(null), tt(s);
    var o = u();
    return F(f), tt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(u, f, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Jt();
        var o = n.get(f);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ M(l.value);
          return n.set(f, h), h;
        }) : N(o, l.value, !0), !0;
      },
      deleteProperty(u, f) {
        var l = n.get(f);
        if (l === void 0) {
          if (f in u) {
            const o = a(() => /* @__PURE__ */ M(E));
            n.set(f, o), ge(i);
          }
        } else
          N(l, E), ge(i);
        return !0;
      },
      get(u, f, l) {
        if (f === Pe)
          return e;
        var o = n.get(f), h = f in u;
        if (o === void 0 && (!h || pe(u, f)?.writable) && (o = a(() => {
          var _ = _e(h ? u[f] : E), d = /* @__PURE__ */ M(_);
          return d;
        }), n.set(f, o)), o !== void 0) {
          var c = A(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(u, f, l);
      },
      getOwnPropertyDescriptor(u, f) {
        var l = Reflect.getOwnPropertyDescriptor(u, f);
        if (l && "value" in l) {
          var o = n.get(f);
          o && (l.value = A(o));
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
        if (f === Pe)
          return !0;
        var l = n.get(f), o = l !== void 0 && l.v !== E || Reflect.has(u, f);
        if (l !== void 0 || p !== null && (!o || pe(u, f)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? _e(u[f]) : E, _ = /* @__PURE__ */ M(c);
            return _;
          }), n.set(f, l));
          var h = A(l);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(u, f, l, o) {
        var h = n.get(f), c = f in u;
        if (r && f === "length")
          for (var _ = l; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var d = n.get(_ + "");
            d !== void 0 ? N(d, E) : _ in u && (d = a(() => /* @__PURE__ */ M(E)), n.set(_ + "", d));
          }
        if (h === void 0)
          (!c || pe(u, f)?.writable) && (h = a(() => /* @__PURE__ */ M(void 0)), N(h, _e(l)), n.set(f, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(l));
          N(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(u, f);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof f == "string") {
            var P = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(f);
            Number.isInteger(ie) && ie >= P.v && N(P, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(u) {
        A(i);
        var f = Reflect.ownKeys(u).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [l, o] of n)
          o.v !== E && !(l in u) && f.push(l);
        return f;
      },
      setPrototypeOf() {
        Qt();
      }
    }
  );
}
var Xe, Et, xt, Tt;
function xn() {
  if (Xe === void 0) {
    Xe = window, Et = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    xt = pe(t, "firstChild").get, Tt = pe(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function kt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function St(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
function ye(e, t) {
  return /* @__PURE__ */ St(e);
}
function Ee(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function Tn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(nn, e, void 0)
  );
}
function At(e) {
  var t = v, n = p;
  F(null), z(null);
  try {
    return e();
  } finally {
    F(t), z(n);
  }
}
function kn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & H) !== 0 && (e |= H);
  var r = {
    ctx: j,
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
  if ((e & we) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & Z) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && kn(i, n), v !== null && (v.f & y) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function He() {
  return v !== null && !I;
}
function Sn(e) {
  const t = J(De, null);
  return b(t, m), t.teardown = e, t;
}
function An(e) {
  return J(we | Gt, e);
}
function Rn(e) {
  re.ensure();
  const t = J(te | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ke(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function Nn(e) {
  return J(ze | de, e);
}
function Dn(e, t = 0) {
  return J(De | t, e);
}
function On(e, t = [], n = [], r = []) {
  vn(r, t, n, (i) => {
    J(De, () => e(...i.map(A)));
  });
}
function Fn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(W | de, e);
}
function Rt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = v;
    et(!0), F(null);
    try {
      t.call(null);
    } finally {
      et(n), F(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && At(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function Pn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), b(e, We), Ke(e, t && !n), be(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Rt(e), e.f ^= We, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Mn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ke(e, t, n = !0) {
  var r = [];
  Dt(e, r, !0);
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
function Dt(e, t, n) {
  if ((e.f & H) === 0) {
    e.f ^= H;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const u of r)
        (u.is_global || n) && t.push(u);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & Z) !== 0;
      Dt(i, t, a ? n : !1), i = s;
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
let Se = !1, oe = !1;
function et(e) {
  oe = e;
}
let v = null, I = !1;
function F(e) {
  v = e;
}
let p = null;
function z(e) {
  p = e;
}
let O = null;
function In(e) {
  v !== null && (O === null ? O = [e] : O.push(e));
}
let T = null, S = 0, R = null;
function jn(e) {
  R = e;
}
let Ot = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function Ft() {
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
      ) && wt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && b(e, m);
  }
  return !1;
}
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(O !== null && ue.call(O, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & y) !== 0 ? Pt(
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
  var t = T, n = S, r = R, i = v, s = O, a = j, u = I, f = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, v = (l & (W | te)) === 0 ? e : null, O = null, ae(e.ctx), I = !1, ee = ++X, e.ac !== null && (At(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, _ = w?.is_fork;
    if (T !== null) {
      var d;
      if (_ || be(e, S), c !== null && S > 0)
        for (c.length = S + T.length, d = 0; d < T.length; d++)
          c[S + d] = T[d];
      else
        e.deps = c = T;
      if (He() && (e.f & D) !== 0)
        for (d = S; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !_ && c !== null && S < c.length && (be(e, S), c.length = S);
    if (at() && R !== null && !I && c !== null && (e.f & (y | Y | k)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      R.length; d++)
        Pt(
          R[d],
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
      R !== null && (r === null ? r = R : r.push(.../** @type {Source[]} */
      R));
    }
    return (e.f & K) !== 0 && (e.f ^= K), h;
  } catch (g) {
    return ot(g);
  } finally {
    e.f ^= je, T = t, S = n, R = r, v = i, O = s, ae(a), I = u, ee = f;
  }
}
function Ln(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = qt.call(n, e);
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
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~ne), $e(s), yn(s), be(s, 0);
  }
}
function be(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ln(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & L) === 0) {
    b(e, m);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Z | ft)) !== 0 ? Pn(e) : Ke(e), Rt(e);
      var i = Mt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ot;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & y) !== 0;
  if (v !== null && !I) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (O === null || !ue.call(O, e))) {
      var i = v.deps;
      if ((v.f & je) !== 0)
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
      return ((a.f & m) === 0 && a.reactions !== null || It(a)) && (u = Ve(a)), G.set(a, u), u;
    }
    var f = (a.f & D) === 0 && !I && v !== null && (Se || (v.f & D) !== 0), l = (a.f & he) === 0;
    me(a) && (f && (a.f |= D), wt(a)), f && !l && (bt(a), Ct(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Ct(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & y) !== 0 && (t.f & D) === 0 && (bt(
        /** @type {Derived} */
        t
      ), Ct(
        /** @type {Derived} */
        t
      ));
}
function It(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & y) !== 0 && It(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qn(e) {
  var t = I;
  try {
    return I = !0, e();
  } finally {
    I = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function Yn(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Ce(e, t) {
  Yn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function $n(e) {
  return zn.includes(e);
}
const ve = Symbol("events"), jt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function rt(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Un(e) {
  for (var t = 0; t < e.length; t++)
    jt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let it = null;
function st(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  it = e;
  var a = 0, u = it === e && e[ve];
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
    zt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = v, h = p;
    F(null), z(null);
    try {
      for (var c, _ = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
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
      e[ve] = t, delete e.currentTarget, F(o), z(h);
    }
  }
}
const Vn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Bn(e) {
  return (
    /** @type {string} */
    Vn?.createHTML(e) ?? e
  );
}
function Hn(e) {
  var t = Tn("template");
  return t.innerHTML = Bn(e.replaceAll("<!>", "<!---->")), t.content;
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
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Hn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ St(r));
    var s = (
      /** @type {TemplateNode} */
      n || Et ? document.importNode(r, !0) : r.cloneNode(!0)
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
const xe = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: u }) {
  xn();
  var f = void 0, l = Rn(() => {
    var o = n ?? t.appendChild(kt());
    dn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (_) => {
        sn({});
        var d = (
          /** @type {ComponentContext} */
          j
        );
        s && (d.c = s), i && (r.$$events = i), f = e(_, r) || {}, ln();
      },
      u
    );
    var h = /* @__PURE__ */ new Set(), c = (_) => {
      for (var d = 0; d < _.length; d++) {
        var g = _[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const Fe of [t, document]) {
            var P = xe.get(Fe);
            P === void 0 && (P = /* @__PURE__ */ new Map(), xe.set(Fe, P));
            var ie = P.get(g);
            ie === void 0 ? (Fe.addEventListener(g, st, { passive: x }), P.set(g, 1)) : P.set(g, ie + 1);
          }
        }
      }
    };
    return c(Yt(jt)), Ye.add(c), () => {
      for (var _ of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            d.get(_)
          );
          --g == 0 ? (x.removeEventListener(_, st), d.delete(_), d.size === 0 && xe.delete(x)) : d.set(_, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(f, l), f;
}
let Qn = /* @__PURE__ */ new WeakMap();
var Xn = /* @__PURE__ */ Gn("<div><button>Ping</button> <button>Reset</button> <div> </div> <div> </div> <div> </div></div>");
function er(e) {
  let t = /* @__PURE__ */ M(0), n = /* @__PURE__ */ M(0), r = /* @__PURE__ */ M("idle");
  function i() {
    N(t, A(t) + 1), N(r, A(t) % 2 === 0 ? "even" : "odd", !0);
  }
  function s() {
    N(n, A(n) + 1), N(t, 0), N(r, "reset");
  }
  var a = Xn(), u = ye(a), f = Ee(u, 2), l = Ee(f, 2), o = ye(l), h = Ee(l, 2), c = ye(h), _ = Ee(h, 2), d = ye(_);
  On(() => {
    Ce(o, `Pings: ${A(t) ?? ""}`), Ce(c, `Resets: ${A(n) ?? ""}`), Ce(d, `Status: ${A(r) ?? ""}`);
  }), rt("click", u, i), rt("click", f, s), Wn(e, a);
}
Un(["click"]);
function nr(e) {
  return Zn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

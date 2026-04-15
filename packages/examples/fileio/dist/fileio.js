var Lt = Array.isArray, qt = Array.prototype.indexOf, ue = Array.prototype.includes, Yt = Array.from, zt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Vt = Object.prototype, $t = Array.prototype, Ht = Object.getPrototypeOf, We = Object.isExtensible;
const Ut = () => {
};
function Bt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Fe = 8, ft = 1 << 24, Z = 16, G = 32, te = 64, Ie = 128, N = 512, y = 1024, k = 2048, Y = 4096, B = 8192, L = 16384, he = 32768, Ge = 1 << 25, Ae = 65536, Ze = 1 << 17, Kt = 1 << 18, _e = 1 << 19, Wt = 1 << 20, ne = 65536, je = 1 << 21, ze = 1 << 22, K = 1 << 23, Ce = Symbol("$state"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Gt() {
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
let I = null;
function ae(e) {
  I = e;
}
function sn(e, t = !1, n) {
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
function ln(e) {
  var t = (
    /** @type {ComponentContext} */
    I
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      An(r);
  }
  return t.i = !0, I = t.p, /** @type {T} */
  {};
}
function at() {
  return !0;
}
let se = [];
function fn() {
  var e = se;
  se = [], Bt(e);
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
  U(e, t);
}
function U(e, t) {
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
function m(e, t) {
  e.f = e.f & un | t;
}
function Ve(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, Y);
}
function ct(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ct(
        /** @type {Derived} */
        t.deps
      ));
}
function ht(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), ct(e.deps), m(e, y);
}
const H = /* @__PURE__ */ new Set();
let w = null, M = null, Le = null, Me = !1, le = null, Te = null;
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, Y), this.schedule(r);
    }
  }
  #h() {
    if (Je++ > 1e3 && (H.delete(this), on()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, Y), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Te = [];
    for (const f of t)
      try {
        this.#a(f, n, r);
      } catch (u) {
        throw pt(f), u;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, Te = null, this.#c() || this.#d()) {
      this.#v(r), this.#v(n);
      for (const [f, u] of this.#s)
        vt(f, u);
    } else {
      this.#r.size === 0 && H.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), Qe(r), Qe(n), this.#i?.resolve();
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
      var s = i.f, a = (s & (G | te)) !== 0, f = a && (s & y) !== 0, u = f || (s & B) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & Z) !== 0 && this.#n.add(i), ce(i));
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
      Me = !0, w = this, this.#h();
    } finally {
      Je = 0, Le = null, le = null, Te = null, Me = !1, w = null, M = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), H.delete(this);
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
    return (this.#i ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Me || (H.add(w), fe(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (we | Fe | ft)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (v === null || (v.f & b) === 0))
        return;
      if ((r & (te | G)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function on() {
  try {
    Zt();
  } catch (e) {
    U(e, Le);
  }
}
let V = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | B)) === 0 && ye(r) && (V = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), V?.size > 0)) {
        W.clear();
        for (const i of V) {
          if ((i.f & (L | B)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            V.has(a) && (V.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (L | B)) === 0 && ce(u);
          }
        }
        V.clear();
      }
    }
    V = null;
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
      ) : (s & (ze | Z)) !== 0 && (s & k) === 0 && dt(i, t, r) && (m(i, k), $e(
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
      if (ue.call(t, i))
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
function $e(e) {
  w.schedule(e);
}
function vt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      vt(n, t), n = n.next;
  }
}
function pt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    pt(t), t = t.next;
}
function cn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    Be() && (j(n), Fn(() => (t === 0 && (r = qn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var hn = Ae | _e;
function _n(e, t, n, r) {
  new dn(e, t, n, r);
}
class dn {
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
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = Dn(() => {
      this.#m();
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
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Q(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        Pn(this.#e, t);
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
    ht(t, this.#d, this.#h);
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
    var n = p, r = v, i = I;
    z(this.#i), O(this.#i), ae(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ot(s), null;
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
  #y(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, n);
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
    this.#y(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#a && Ne(this.#a, this.#o);
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
        rn();
        return;
      }
      i = !0, s && en(), this.#n !== null && ke(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        s = !0, n?.(u, a), s = !1;
      } catch (l) {
        U(l, this.#i && this.#i.parent);
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
              () => u,
              () => a
            );
          });
        } catch (l) {
          return U(
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
        U(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => U(l, this.#i && this.#i.parent)
      ) : f(u);
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
  ), f = pn(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      r(c);
    } catch (d) {
      (a.f & L) === 0 && U(d, a);
    }
    Re();
  }
  if (n.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var o = gt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ wn(c))).then((c) => l([...t.map(i), ...c])).catch((c) => U(c, a)).finally(() => o());
  }
  u ? u.then(() => {
    f(), h(), Re();
  }) : h();
}
function pn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = v, n = I, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    z(e), O(t), ae(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  z(null), O(null), ae(null), e && w?.deactivate();
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
  var t = b | k, n = v !== null && (v.f & b) !== 0 ? (
    /** @type {Derived} */
    v
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: I,
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
  r === null && Gt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !v, f = /* @__PURE__ */ new Map();
  return Nn(() => {
    var u = (
      /** @type {Effect} */
      p
    ), l = lt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(Re);
    } catch (d) {
      l.reject(d), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((u.f & he) !== 0)
        var h = gt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject($), f.delete(o);
      else {
        for (const d of f.values())
          d.reject($);
        f.clear();
      }
      f.set(o, l);
    }
    const c = (d, _ = void 0) => {
      if (h) {
        var g = _ === $;
        h(g);
      }
      if (!(_ === $ || (u.f & L) !== 0)) {
        if (o.activate(), _)
          s.f |= K, Ne(s, _);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ne(s, d);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject($);
          }
        }
        o.deactivate();
      }
    };
    l.promise.then(c, (d) => c(null, d || "unknown"));
  }), Sn(() => {
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
function mn(e) {
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
function yn(e) {
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
function He(e) {
  var t, n = p;
  z(yn(e));
  try {
    e.f &= ~ne, mn(e), t = Mt(e);
  } finally {
    z(n);
  }
  return t;
}
function wt(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = Dt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t, !0), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (M !== null ? (Be() || w?.is_fork) && M.set(e, n) : Ve(e));
}
function bn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Ut, t.ac = null, me(t, 0), Ke(t));
}
function mt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let qe = /* @__PURE__ */ new Set();
const W = /* @__PURE__ */ new Map();
let yt = !1;
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
function C(e, t) {
  const n = Oe(e);
  return In(n), n;
}
function A(e, t, n = !1) {
  v !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (v.f & Ze) !== 0) && at() && (v.f & (b | Z | ze | Ze)) !== 0 && (F === null || !ue.call(F, e)) && Xt();
  let r = n ? de(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? W.set(e, t) : W.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(s), M === null && Ve(s);
    }
    e.wv = Dt(), bt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (G | te)) === 0 && (R === null ? jn([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !yt && En();
  }
  return t;
}
function En() {
  yt = !1;
  for (const e of qe)
    (e.f & y) !== 0 && m(e, Y), ye(e) && ce(e);
  qe.clear();
}
function ge(e) {
  A(e, e.v + 1);
}
function bt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, u = (f & k) === 0;
      if (u && m(a, t), (f & b) !== 0) {
        var l = (
          /** @type {Derived} */
          a
        );
        M?.delete(l), (f & ne) === 0 && (f & N && (a.f |= ne), bt(l, Y, n));
      } else if (u) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & Z) !== 0 && V !== null && V.add(o), n !== null ? n.push(o) : $e(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Ht(e);
  if (t !== Vt && t !== $t)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Lt(e), i = /* @__PURE__ */ C(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var u = v, l = ee;
    O(null), tt(s);
    var o = f();
    return O(u), tt(l), o;
  };
  return r && n.set("length", /* @__PURE__ */ C(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Jt();
        var o = n.get(u);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ C(l.value);
          return n.set(u, h), h;
        }) : A(o, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = n.get(u);
        if (l === void 0) {
          if (u in f) {
            const o = a(() => /* @__PURE__ */ C(E));
            n.set(u, o), ge(i);
          }
        } else
          A(l, E), ge(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Ce)
          return e;
        var o = n.get(u), h = u in f;
        if (o === void 0 && (!h || pe(f, u)?.writable) && (o = a(() => {
          var d = de(h ? f[u] : E), _ = /* @__PURE__ */ C(d);
          return _;
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
        if (u === Ce)
          return !0;
        var l = n.get(u), o = l !== void 0 && l.v !== E || Reflect.has(f, u);
        if (l !== void 0 || p !== null && (!o || pe(f, u)?.writable)) {
          l === void 0 && (l = a(() => {
            var c = o ? de(f[u]) : E, d = /* @__PURE__ */ C(c);
            return d;
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
          for (var d = l; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var _ = n.get(d + "");
            _ !== void 0 ? A(_, E) : d in f && (_ = a(() => /* @__PURE__ */ C(E)), n.set(d + "", _));
          }
        if (h === void 0)
          (!c || pe(f, u)?.writable) && (h = a(() => /* @__PURE__ */ C(void 0)), A(h, de(l)), n.set(u, h));
        else {
          c = h.v !== E;
          var g = a(() => de(l));
          A(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, u);
        if (x?.set && x.set.call(o, l), !c) {
          if (r && typeof u == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(u);
            Number.isInteger(ie) && ie >= D.v && A(D, ie + 1);
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
    xt = pe(t, "firstChild").get, Tt = pe(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
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
function Ue(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
function be(e, t) {
  return /* @__PURE__ */ St(e);
}
function Ee(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ue(r);
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
  O(null), z(null);
  try {
    return e();
  } finally {
    O(t), z(n);
  }
}
function kn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function J(e, t) {
  var n = p;
  n !== null && (n.f & B) !== 0 && (e |= B);
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
  if ((e & we) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw q(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & Z) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && kn(i, n), v !== null && (v.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      v
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Be() {
  return v !== null && !P;
}
function Sn(e) {
  const t = J(Fe, null);
  return m(t, y), t.teardown = e, t;
}
function An(e) {
  return J(we | Wt, e);
}
function Rn(e) {
  re.ensure();
  const t = J(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ke(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function Nn(e) {
  return J(ze | _e, e);
}
function Fn(e, t = 0) {
  return J(Fe | t, e);
}
function On(e, t = [], n = [], r = []) {
  vn(r, t, n, (i) => {
    J(Fe, () => e(...i.map(j)));
  });
}
function Dn(e, t = 0) {
  var n = J(Z | t, e);
  return n;
}
function Q(e) {
  return J(G | _e, e);
}
function Rt(e) {
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
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && At(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function Cn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Kt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ge), Ke(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Rt(e), e.f ^= Ge, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Mn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ue(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ke(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
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
function Ft(e, t, n) {
  if ((e.f & B) === 0) {
    e.f ^= B;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & Z) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function Pn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ue(n);
      t.append(n), n = i;
    }
}
let Se = !1, oe = !1;
function et(e) {
  oe = e;
}
let v = null, P = !1;
function O(e) {
  v = e;
}
let p = null;
function z(e) {
  p = e;
}
let F = null;
function In(e) {
  v !== null && (F === null ? F = [e] : F.push(e));
}
let T = null, S = 0, R = null;
function jn(e) {
  R = e;
}
let Ot = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function Dt() {
  return ++Ot;
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
      ) && wt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    M === null && m(e, y);
  }
  return !1;
}
function Ct(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(F !== null && ue.call(F, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Ct(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, Y), $e(
        /** @type {Effect} */
        s
      ));
    }
}
function Mt(e) {
  var t = T, n = S, r = R, i = v, s = F, a = I, f = P, u = ee, l = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, R = null, v = (l & (G | te)) === 0 ? e : null, F = null, ae(e.ctx), P = !1, ee = ++X, e.ac !== null && (At(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var _;
      if (d || me(e, S), c !== null && S > 0)
        for (c.length = S + T.length, _ = 0; _ < T.length; _++)
          c[S + _] = T[_];
      else
        e.deps = c = T;
      if (Be() && (e.f & N) !== 0)
        for (_ = S; _ < c.length; _++)
          (c[_].reactions ??= []).push(e);
    } else !d && c !== null && S < c.length && (me(e, S), c.length = S);
    if (at() && R !== null && !P && c !== null && (e.f & (b | Y | k)) === 0)
      for (_ = 0; _ < /** @type {Source[]} */
      R.length; _++)
        Ct(
          R[_],
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
    e.f ^= je, T = t, S = n, R = r, v = i, F = s, ae(a), P = f, ee = u;
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
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), Ve(s), bn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ln(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (Z | ft)) !== 0 ? Cn(e) : Ke(e), Rt(e);
      var i = Mt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ot;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function j(e) {
  var t = e.f, n = (t & b) !== 0;
  if (v !== null && !P) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (F === null || !ue.call(F, e))) {
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
  if (oe && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || It(a)) && (f = He(a)), W.set(a, f), f;
    }
    var u = (a.f & N) === 0 && !P && v !== null && (Se || (v.f & N) !== 0), l = (a.f & he) === 0;
    ye(a) && (u && (a.f |= N), wt(a)), u && !l && (mt(a), Pt(a));
  }
  if (M?.has(e))
    return M.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Pt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & N) === 0 && (mt(
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
function qn(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function Yn(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Pe(e, t) {
  Yn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function Vn(e) {
  return zn.includes(e);
}
const ve = Symbol("events"), jt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function rt(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function $n(e) {
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
  var a = 0, f = it === e && e[ve];
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
const Hn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Un(e) {
  return (
    /** @type {string} */
    Hn?.createHTML(e) ?? e
  );
}
function Bn(e) {
  var t = Tn("template");
  return t.innerHTML = Un(e.replaceAll("<!>", "<!---->")), t.content;
}
function Kn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t) {
  var n = (t & tn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Bn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ St(r));
    var s = (
      /** @type {TemplateNode} */
      n || Et ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Kn(s, s), s;
  };
}
function Gn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Zn(e, t) {
  return Jn(e, t);
}
const xe = /* @__PURE__ */ new Map();
function Jn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  xn();
  var u = void 0, l = Rn(() => {
    var o = n ?? t.appendChild(kt());
    _n(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        sn({});
        var _ = (
          /** @type {ComponentContext} */
          I
        );
        s && (_.c = s), i && (r.$$events = i), u = e(d, r) || {}, ln();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var g = d[_];
        if (!h.has(g)) {
          h.add(g);
          var x = Vn(g);
          for (const De of [t, document]) {
            var D = xe.get(De);
            D === void 0 && (D = /* @__PURE__ */ new Map(), xe.set(De, D));
            var ie = D.get(g);
            ie === void 0 ? (De.addEventListener(g, st, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(Yt(jt)), Ye.add(c), () => {
      for (var d of h)
        for (const x of [t, document]) {
          var _ = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            _.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, st), _.delete(d), _.size === 0 && xe.delete(x)) : _.set(d, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Qn.set(u, l), u;
}
let Qn = /* @__PURE__ */ new WeakMap();
var Xn = /* @__PURE__ */ Wn("<div><div> </div> <div> </div> <div> </div> <button>Read</button> <button>Write</button></div>");
function er(e) {
  let t = /* @__PURE__ */ C(""), n = /* @__PURE__ */ C("idle"), r = /* @__PURE__ */ C("");
  async function i() {
    A(n, "reading");
    const g = __rvst.fs.readText("/tmp/rvst_test_read.txt");
    A(t, g || "(empty)", !0), A(n, "read");
  }
  async function s() {
    A(n, "writing");
    const g = __rvst.fs.writeText("/tmp/rvst_test_write.txt", "Hello from RVST");
    A(r, g ? "written" : "failed", !0), A(n, "wrote");
  }
  var a = Xn(), f = be(a), u = be(f), l = Ee(f, 2), o = be(l), h = Ee(l, 2), c = be(h), d = Ee(h, 2), _ = Ee(d, 2);
  On(() => {
    Pe(u, `Status: ${j(n) ?? ""}`), Pe(o, `Content: ${j(t) ?? ""}`), Pe(c, `Write: ${j(r) ?? ""}`);
  }), rt("click", d, i), rt("click", _, s), Gn(e, a);
}
$n(["click"]);
function nr(e) {
  return Zn(er, { target: e });
}
export {
  nr as default,
  nr as rvst_mount
};

var yt = Array.isArray, un = Array.prototype.indexOf, me = Array.prototype.includes, He = Array.from, on = Object.defineProperty, Ne = Object.getOwnPropertyDescriptor, an = Object.prototype, cn = Array.prototype, hn = Object.getPrototypeOf, it = Object.isExtensible;
const vn = () => {
};
function dn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Et() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Me = 4, Ve = 8, xt = 1 << 24, le = 16, U = 32, ce = 64, Ke = 128, F = 512, x = 1024, S = 2048, B = 4096, N = 8192, z = 16384, Te = 32768, lt = 1 << 25, De = 65536, st = 1 << 17, _n = 1 << 18, ke = 1 << 19, pn = 1 << 20, X = 1 << 25, he = 65536, Ge = 1 << 21, Je = 1 << 22, ne = 1 << 23, Ue = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function gn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function wn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function mn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function bn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function yn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function En() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function xn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Tn = 1, kn = 2, Sn = 16, An = 2, k = Symbol(), Rn = "http://www.w3.org/1999/xhtml";
function Nn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Tt(e) {
  return e === this.v;
}
function Cn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function kt(e) {
  return !Cn(e, this.v);
}
let j = null;
function be(e) {
  j = e;
}
function Fn(e, t = !1, n) {
  j = {
    p: j,
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
function Mn(e) {
  var t = (
    /** @type {ComponentContext} */
    j
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      nr(r);
  }
  return t.i = !0, j = t.p, /** @type {T} */
  {};
}
function St() {
  return !0;
}
let de = [];
function Dn() {
  var e = de;
  de = [], dn(e);
}
function ge(e) {
  if (de.length === 0) {
    var t = de;
    queueMicrotask(() => {
      t === de && Dn();
    });
  }
  de.push(e);
}
function At(e) {
  var t = g;
  if (t === null)
    return p.f |= ne, e;
  if ((t.f & Te) === 0 && (t.f & Me) === 0)
    throw e;
  te(e, t);
}
function te(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ke) !== 0) {
      if ((t.f & Te) === 0)
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
const On = -7169;
function E(e, t) {
  e.f = e.f & On | t;
}
function Qe(e) {
  (e.f & F) !== 0 || e.deps === null ? E(e, x) : E(e, B);
}
function Rt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & he) === 0 || (t.f ^= he, Rt(
        /** @type {Derived} */
        t.deps
      ));
}
function Nt(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), Rt(e.deps), E(e, x);
}
const J = /* @__PURE__ */ new Set();
let m = null, P = null, We = null, Be = !1, _e = null, ze = null;
var ft = 0;
let In = 1;
class ie {
  id = In++;
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
  #s = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #v = /* @__PURE__ */ new Set();
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
  #l = /* @__PURE__ */ new Map();
  is_fork = !1;
  #a = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #d() {
    for (const r of this.#u)
      for (const i of r.#f.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#l.has(n)) {
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
    this.#l.has(t) || this.#l.set(t, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(t) {
    var n = this.#l.get(t);
    if (n) {
      this.#l.delete(t);
      for (var r of n.d)
        E(r, S), this.schedule(r);
      for (r of n.m)
        E(r, B), this.schedule(r);
    }
  }
  #h() {
    if (ft++ > 1e3 && (J.delete(this), Pn()), !this.#c()) {
      for (const f of this.#t)
        this.#n.delete(f), E(f, S), this.schedule(f);
      for (const f of this.#n)
        E(f, B), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = _e = [], r = [], i = ze = [];
    for (const f of t)
      try {
        this.#o(f, n, r);
      } catch (u) {
        throw Dt(f), u;
      }
    if (m = null, i.length > 0) {
      var l = ie.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (_e = null, ze = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [f, u] of this.#l)
        Mt(f, u);
    } else {
      this.#r.size === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#s) f(this);
      this.#s.clear(), ut(r), ut(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((u) => !f.#e.includes(u)));
    }
    o !== null && (J.add(o), o.#h()), J.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var l = i.f, o = (l & (U | ce)) !== 0, f = o && (l & x) !== 0, u = f || (l & N) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= x : (l & Me) !== 0 ? n.push(i) : Ie(i) && ((l & le) !== 0 && this.#n.add(i), xe(i));
        var s = i.first;
        if (s !== null) {
          i = s;
          continue;
        }
      }
      for (; i !== null; ) {
        var c = i.next;
        if (c !== null) {
          i = c;
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
      Nt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ne) === 0 && (this.current.set(t, [t.v, r]), P?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, P = null;
  }
  flush() {
    try {
      Be = !0, m = this, this.#h();
    } finally {
      ft = 0, We = null, _e = null, ze = null, Be = !1, m = null, P = null, re.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), J.delete(this);
  }
  #w() {
    for (const s of J) {
      var t = s.id < this.id, n = [];
      for (const [c, [v, h]] of this.current) {
        if (s.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            s.current.get(c)[0]
          );
          if (t && v !== r)
            s.current.set(c, [v, h]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...s.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of n)
          Ct(f, i, l, o);
        if (s.#e.length > 0) {
          s.apply();
          for (var u of s.#e)
            s.#o(u, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
    for (const s of J)
      s.#u.has(this) && (s.#u.delete(this), s.#u.size === 0 && !s.#c() && (s.activate(), s.#h()));
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
      let l = this.#f.get(n) ?? 0;
      l === 1 ? this.#f.delete(n) : this.#f.set(n, l - 1);
    }
    this.#a || r || (this.#a = !0, ge(() => {
      this.#a = !1, this.flush();
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
    this.#s.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= Et()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new ie();
      Be || (J.add(m), ge(() => {
        m === t && t.flush();
      }));
    }
    return m;
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
    if (We = t, t.b?.is_pending && (t.f & (Me | Ve | xt)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ce | U)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function Pn() {
  try {
    mn();
  } catch (e) {
    te(e, We);
  }
}
let G = null;
function ut(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (z | N)) === 0 && Ie(r) && (G = /* @__PURE__ */ new Set(), xe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Kt(r), G?.size > 0)) {
        re.clear();
        for (const i of G) {
          if ((i.f & (z | N)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), l.push(o)), o = o.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const u = l[f];
            (u.f & (z | N)) === 0 && xe(u);
          }
        }
        G.clear();
      }
    }
    G = null;
  }
}
function Ct(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Ct(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Je | le)) !== 0 && (l & S) === 0 && Ft(i, t, r) && (E(i, S), et(
        /** @type {Effect} */
        i
      ));
    }
}
function Ft(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (me.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ft(
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
function et(e) {
  m.schedule(e);
}
function Mt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Mt(n, t), n = n.next;
  }
}
function Dt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Dt(t), t = t.next;
}
function qn(e) {
  let t = 0, n = ve(0), r;
  return () => {
    nt() && (Y(n), lr(() => (t === 0 && (r = cr(() => e(() => Ce(n)))), t += 1, () => {
      ge(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ce(n));
      });
    })));
  };
}
var zn = De | ke;
function Ln(e, t, n, r) {
  new jn(e, t, n, r);
}
class jn {
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
  #s;
  /** @type {TemplateNode | null} */
  #v = null;
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
  #l = null;
  #a = 0;
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
  #o = null;
  #_ = qn(() => (this.#o = ve(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var o = (
        /** @type {Effect} */
        g
      );
      o.b = this, o.f |= Ke, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Bt(() => {
      this.#m();
    }, zn);
  }
  #w() {
    try {
      this.#e = V(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = V(() => {
      n(
        this.#s,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#t = V(() => t(this.#s)), ge(() => {
      var n = this.#l = document.createDocumentFragment(), r = Fe();
      n.append(r), this.#e = this.#g(() => V(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, we(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = V(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Zt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = V(() => n(this.#s));
      } else
        this.#p(
          /** @type {Batch} */
          m
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
    Nt(t, this.#d, this.#h);
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
    var n = g, r = p, i = j;
    $(this.#i), D(this.#i), be(this.#i.ctx);
    try {
      return ie.ensure(), t();
    } catch (l) {
      return At(l), null;
    } finally {
      $(n), D(r), be(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && we(this.#t, () => {
      this.#t = null;
    }), this.#l && (this.#s.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, ge(() => {
      this.#c = !1, this.#o && ye(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), Y(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (!n && !r)
      throw t;
    this.#e && (L(this.#e), this.#e = null), this.#t && (L(this.#t), this.#t = null), this.#n && (L(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        Nn();
        return;
      }
      i = !0, l && xn(), this.#n !== null && we(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, f = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (s) {
        te(s, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return V(() => {
            var s = (
              /** @type {Effect} */
              g
            );
            s.b = this, s.f |= Ke, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (s) {
          return te(
            s,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    ge(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (s) {
        te(s, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (s) => te(s, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function Hn(e, t, n, r) {
  const i = It;
  var l = e.filter((h) => !h.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), f = Vn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((h) => h.promise)) : null;
  function s(h) {
    f();
    try {
      r(h);
    } catch (d) {
      (o.f & z) === 0 && te(d, o);
    }
    je();
  }
  if (n.length === 0) {
    u.then(() => s(t.map(i)));
    return;
  }
  var c = Ot();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Yn(h))).then((h) => s([...t.map(i), ...h])).catch((h) => te(h, o)).finally(() => c());
  }
  u ? u.then(() => {
    f(), v(), je();
  }) : v();
}
function Vn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = j, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    $(e), D(t), be(n), l && (e.f & z) === 0 && (r?.activate(), r?.apply());
  };
}
function je(e = !0) {
  $(null), D(null), be(null), e && m?.deactivate();
}
function Ot() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    m
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function It(e) {
  var t = T | S, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= ke), {
    ctx: j,
    deps: null,
    effects: null,
    equals: Tt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      k
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Yn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && gn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = ve(
    /** @type {V} */
    k
  ), o = !p, f = /* @__PURE__ */ new Map();
  return ir(() => {
    var u = (
      /** @type {Effect} */
      g
    ), s = Et();
    i = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).finally(je);
    } catch (d) {
      s.reject(d), je();
    }
    var c = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((u.f & Te) !== 0)
        var v = Ot();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(c)?.reject(W), f.delete(c);
      else {
        for (const d of f.values())
          d.reject(W);
        f.clear();
      }
      f.set(c, s);
    }
    const h = (d, a = void 0) => {
      if (v) {
        var _ = a === W;
        v(_);
      }
      if (!(a === W || (u.f & z) !== 0)) {
        if (c.activate(), a)
          l.f |= ne, ye(l, a);
        else {
          (l.f & ne) !== 0 && (l.f ^= ne), ye(l, d);
          for (const [y, b] of f) {
            if (f.delete(y), y === c) break;
            b.reject(W);
          }
        }
        c.deactivate();
      }
    };
    s.promise.then(h, (d) => h(null, d || "unknown"));
  }), tr(() => {
    for (const u of f.values())
      u.reject(W);
  }), new Promise((u) => {
    function s(c) {
      function v() {
        c === i ? u(l) : s(i);
      }
      c.then(v, v);
    }
    s(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Un(e) {
  const t = /* @__PURE__ */ It(e);
  return t.equals = kt, t;
}
function Bn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      L(
        /** @type {Effect} */
        t[n]
      );
  }
}
function $n(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & z) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function tt(e) {
  var t, n = g;
  $($n(e));
  try {
    e.f &= ~he, Bn(e), t = tn(e);
  } finally {
    $(n);
  }
  return t;
}
function Pt(e) {
  var t = e.v, n = tt(e);
  if (!e.equals(n) && (e.wv = Qt(), (!m?.is_fork || e.deps === null) && (e.v = n, m?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  Ee || (P !== null ? (nt() || m?.is_fork) && P.set(e, n) : Qe(e));
}
function Kn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = vn, t.ac = null, Oe(t, 0), rt(t));
}
function qt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && xe(t);
}
let Xe = /* @__PURE__ */ new Set();
const re = /* @__PURE__ */ new Map();
let zt = !1;
function ve(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Tt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Q(e, t) {
  const n = ve(e);
  return ur(n), n;
}
// @__NO_SIDE_EFFECTS__
function Gn(e, t = !1, n = !0) {
  const r = ve(e);
  return t || (r.equals = kt), r;
}
function ue(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!q || (p.f & st) !== 0) && St() && (p.f & (T | le | Je | st)) !== 0 && (M === null || !me.call(M, e)) && En();
  let r = n ? pe(t) : t;
  return ye(e, r, ze);
}
function ye(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    Ee ? re.set(e, t) : re.set(e, r), e.v = t;
    var i = ie.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && tt(l), P === null && Qe(l);
    }
    e.wv = Qt(), Lt(e, S, n), g !== null && (g.f & x) !== 0 && (g.f & (U | ce)) === 0 && (C === null ? or([e]) : C.push(e)), !i.is_fork && Xe.size > 0 && !zt && Wn();
  }
  return t;
}
function Wn() {
  zt = !1;
  for (const e of Xe)
    (e.f & x) !== 0 && E(e, B), Ie(e) && xe(e);
  Xe.clear();
}
function Ce(e) {
  ue(e, e.v + 1);
}
function Lt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], f = o.f, u = (f & S) === 0;
      if (u && E(o, t), (f & T) !== 0) {
        var s = (
          /** @type {Derived} */
          o
        );
        P?.delete(s), (f & he) === 0 && (f & F && (o.f |= he), Lt(s, B, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (f & le) !== 0 && G !== null && G.add(c), n !== null ? n.push(c) : et(c);
      }
    }
}
function pe(e) {
  if (typeof e != "object" || e === null || Ue in e)
    return e;
  const t = hn(e);
  if (t !== an && t !== cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = yt(e), i = /* @__PURE__ */ Q(0), l = ae, o = (f) => {
    if (ae === l)
      return f();
    var u = p, s = ae;
    D(null), vt(l);
    var c = f();
    return D(u), vt(s), c;
  };
  return r && n.set("length", /* @__PURE__ */ Q(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, s) {
        (!("value" in s) || s.configurable === !1 || s.enumerable === !1 || s.writable === !1) && bn();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ Q(s.value);
          return n.set(u, v), v;
        }) : ue(c, s.value, !0), !0;
      },
      deleteProperty(f, u) {
        var s = n.get(u);
        if (s === void 0) {
          if (u in f) {
            const c = o(() => /* @__PURE__ */ Q(k));
            n.set(u, c), Ce(i);
          }
        } else
          ue(s, k), Ce(i);
        return !0;
      },
      get(f, u, s) {
        if (u === Ue)
          return e;
        var c = n.get(u), v = u in f;
        if (c === void 0 && (!v || Ne(f, u)?.writable) && (c = o(() => {
          var d = pe(v ? f[u] : k), a = /* @__PURE__ */ Q(d);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var h = Y(c);
          return h === k ? void 0 : h;
        }
        return Reflect.get(f, u, s);
      },
      getOwnPropertyDescriptor(f, u) {
        var s = Reflect.getOwnPropertyDescriptor(f, u);
        if (s && "value" in s) {
          var c = n.get(u);
          c && (s.value = Y(c));
        } else if (s === void 0) {
          var v = n.get(u), h = v?.v;
          if (v !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return s;
      },
      has(f, u) {
        if (u === Ue)
          return !0;
        var s = n.get(u), c = s !== void 0 && s.v !== k || Reflect.has(f, u);
        if (s !== void 0 || g !== null && (!c || Ne(f, u)?.writable)) {
          s === void 0 && (s = o(() => {
            var h = c ? pe(f[u]) : k, d = /* @__PURE__ */ Q(h);
            return d;
          }), n.set(u, s));
          var v = Y(s);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(f, u, s, c) {
        var v = n.get(u), h = u in f;
        if (r && u === "length")
          for (var d = s; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? ue(a, k) : d in f && (a = o(() => /* @__PURE__ */ Q(k)), n.set(d + "", a));
          }
        if (v === void 0)
          (!h || Ne(f, u)?.writable) && (v = o(() => /* @__PURE__ */ Q(void 0)), ue(v, pe(s)), n.set(u, v));
        else {
          h = v.v !== k;
          var _ = o(() => pe(s));
          ue(v, _);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(c, s), !h) {
          if (r && typeof u == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), w = Number(u);
            Number.isInteger(w) && w >= b.v && ue(b, w + 1);
          }
          Ce(i);
        }
        return !0;
      },
      ownKeys(f) {
        Y(i);
        var u = Reflect.ownKeys(f).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [s, c] of n)
          c.v !== k && !(s in f) && u.push(s);
        return u;
      },
      setPrototypeOf() {
        yn();
      }
    }
  );
}
var ot, jt, Ht, Vt;
function Xn() {
  if (ot === void 0) {
    ot = window, jt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Ht = Ne(t, "firstChild").get, Vt = Ne(t, "nextSibling").get, it(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), it(n) && (n.__t = void 0);
  }
}
function Fe(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  return (
    /** @type {TemplateNode | null} */
    Ht.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ye(e) {
  return (
    /** @type {TemplateNode | null} */
    Vt.call(e)
  );
}
function $e(e, t) {
  return /* @__PURE__ */ Yt(e);
}
function at(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ye(r);
  return r;
}
function Zn(e) {
  e.textContent = "";
}
function Jn() {
  return !1;
}
function Qn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Rn, e, void 0)
  );
}
function Ut(e) {
  var t = p, n = g;
  D(null), $(null);
  try {
    return e();
  } finally {
    D(t), $(n);
  }
}
function er(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function se(e, t) {
  var n = g;
  n !== null && (n.f & N) !== 0 && (e |= N);
  var r = {
    ctx: j,
    deps: null,
    nodes: null,
    f: e | S | F,
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
  if ((e & Me) !== 0)
    _e !== null ? _e.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      xe(r);
    } catch (o) {
      throw L(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ke) === 0 && (i = i.first, (e & le) !== 0 && (e & De) !== 0 && i !== null && (i.f |= De));
  }
  if (i !== null && (i.parent = n, n !== null && er(i, n), p !== null && (p.f & T) !== 0 && (e & ce) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function nt() {
  return p !== null && !q;
}
function tr(e) {
  const t = se(Ve, null);
  return E(t, x), t.teardown = e, t;
}
function nr(e) {
  return se(Me | pn, e);
}
function rr(e) {
  ie.ensure();
  const t = se(ce | ke, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function ir(e) {
  return se(Je | ke, e);
}
function lr(e, t = 0) {
  return se(Ve | t, e);
}
function ct(e, t = [], n = [], r = []) {
  Hn(r, t, n, (i) => {
    se(Ve, () => e(...i.map(Y)));
  });
}
function Bt(e, t = 0) {
  var n = se(le | t, e);
  return n;
}
function V(e) {
  return se(U | ke, e);
}
function $t(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Ee, r = p;
    ht(!0), D(null);
    try {
      t.call(null);
    } finally {
      ht(n), D(r);
    }
  }
}
function rt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Ut(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & ce) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function sr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & _n) !== 0) && e.nodes !== null && e.nodes.end !== null && (fr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, lt), rt(e, t && !n), Oe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  $t(e), e.f ^= lt, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Kt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function fr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ye(e);
    e.remove(), e = n;
  }
}
function Kt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
  var r = [];
  Gt(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Gt(e, t, n) {
  if ((e.f & N) === 0) {
    e.f ^= N;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & De) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & le) !== 0;
      Gt(i, t, o ? n : !1), i = l;
    }
  }
}
function Wt(e) {
  Xt(e, !0);
}
function Xt(e, t) {
  if ((e.f & N) !== 0) {
    e.f ^= N, (e.f & x) === 0 && (E(e, S), ie.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & De) !== 0 || (n.f & U) !== 0;
      Xt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Zt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ye(n);
      t.append(n), n = i;
    }
}
let Le = !1, Ee = !1;
function ht(e) {
  Ee = e;
}
let p = null, q = !1;
function D(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let M = null;
function ur(e) {
  p !== null && (M === null ? M = [e] : M.push(e));
}
let A = null, R = 0, C = null;
function or(e) {
  C = e;
}
let Jt = 1, oe = 0, ae = oe;
function vt(e) {
  ae = e;
}
function Qt() {
  return ++Jt;
}
function Ie(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & T && (e.f &= ~he), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Ie(
        /** @type {Derived} */
        l
      ) && Pt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & F) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    P === null && E(e, x);
  }
  return !1;
}
function en(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(M !== null && me.call(M, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? en(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, S) : (l.f & x) !== 0 && E(l, B), et(
        /** @type {Effect} */
        l
      ));
    }
}
function tn(e) {
  var t = A, n = R, r = C, i = p, l = M, o = j, f = q, u = ae, s = e.f;
  A = /** @type {null | Value[]} */
  null, R = 0, C = null, p = (s & (U | ce)) === 0 ? e : null, M = null, be(e.ctx), q = !1, ae = ++oe, e.ac !== null && (Ut(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Ge;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= Te;
    var h = e.deps, d = m?.is_fork;
    if (A !== null) {
      var a;
      if (d || Oe(e, R), h !== null && R > 0)
        for (h.length = R + A.length, a = 0; a < A.length; a++)
          h[R + a] = A[a];
      else
        e.deps = h = A;
      if (nt() && (e.f & F) !== 0)
        for (a = R; a < h.length; a++)
          (h[a].reactions ??= []).push(e);
    } else !d && h !== null && R < h.length && (Oe(e, R), h.length = R);
    if (St() && C !== null && !q && h !== null && (e.f & (T | B | S)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      C.length; a++)
        en(
          C[a],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (oe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = oe;
      if (t !== null)
        for (const _ of t)
          _.rv = oe;
      C !== null && (r === null ? r = C : r.push(.../** @type {Source[]} */
      C));
    }
    return (e.f & ne) !== 0 && (e.f ^= ne), v;
  } catch (_) {
    return At(_);
  } finally {
    e.f ^= Ge, A = t, R = n, C = r, p = i, M = l, be(o), q = f, ae = u;
  }
}
function ar(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = un.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !me.call(A, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & F) !== 0 && (l.f ^= F, l.f &= ~he), Qe(l), Kn(l), Oe(l, 0);
  }
}
function Oe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ar(e, n[r]);
}
function xe(e) {
  var t = e.f;
  if ((t & z) === 0) {
    E(e, x);
    var n = g, r = Le;
    g = e, Le = !0;
    try {
      (t & (le | xt)) !== 0 ? sr(e) : rt(e), $t(e);
      var i = tn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var l;
    } finally {
      Le = r, g = n;
    }
  }
}
function Y(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !q) {
    var r = g !== null && (g.f & z) !== 0;
    if (!r && (M === null || !me.call(M, e))) {
      var i = p.deps;
      if ((p.f & Ge) !== 0)
        e.rv < oe && (e.rv = oe, A === null && i !== null && i[R] === e ? R++ : A === null ? A = [e] : A.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : me.call(l, p) || l.push(p);
      }
    }
  }
  if (Ee && re.has(e))
    return re.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (Ee) {
      var f = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || rn(o)) && (f = tt(o)), re.set(o, f), f;
    }
    var u = (o.f & F) === 0 && !q && p !== null && (Le || (p.f & F) !== 0), s = (o.f & Te) === 0;
    Ie(o) && (u && (o.f |= F), Pt(o)), u && !s && (qt(o), nn(o));
  }
  if (P?.has(e))
    return P.get(e);
  if ((e.f & ne) !== 0)
    throw e.v;
  return e.v;
}
function nn(e) {
  if (e.f |= F, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & F) === 0 && (qt(
        /** @type {Derived} */
        t
      ), nn(
        /** @type {Derived} */
        t
      ));
}
function rn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (re.has(t) || (t.f & T) !== 0 && rn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function cr(e) {
  var t = q;
  try {
    return q = !0, e();
  } finally {
    q = t;
  }
}
const dt = globalThis.Deno?.core?.ops ?? null;
function hr(e, ...t) {
  dt?.[e] ? dt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function _t(e, t) {
  hr("op_set_text", e, t);
}
const vr = ["touchstart", "touchmove"];
function dr(e) {
  return vr.includes(e);
}
const Pe = Symbol("events"), _r = /* @__PURE__ */ new Set(), pt = /* @__PURE__ */ new Set();
let gt = null;
function wt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  gt = e;
  var o = 0, f = gt === e && e[Pe];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Pe] = t;
      return;
    }
    var s = i.indexOf(t);
    if (s === -1)
      return;
    u <= s && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    on(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, v = g;
    D(null), $(null);
    try {
      for (var h, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Pe]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (y) {
          h ? d.push(y) : h = y;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (h) {
        for (let y of d)
          queueMicrotask(() => {
            throw y;
          });
        throw h;
      }
    } finally {
      e[Pe] = t, delete e.currentTarget, D(c), $(v);
    }
  }
}
const pr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function gr(e) {
  return (
    /** @type {string} */
    pr?.createHTML(e) ?? e
  );
}
function wr(e) {
  var t = Qn("template");
  return t.innerHTML = gr(e.replaceAll("<!>", "<!---->")), t.content;
}
function mr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function ln(e, t) {
  var n = (t & An) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = wr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Yt(r));
    var l = (
      /** @type {TemplateNode} */
      n || jt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return mr(l, l), l;
  };
}
function mt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function br(e, t) {
  return yr(e, t);
}
const qe = /* @__PURE__ */ new Map();
function yr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: f }) {
  Xn();
  var u = void 0, s = rr(() => {
    var c = n ?? t.appendChild(Fe());
    Ln(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Fn({});
        var a = (
          /** @type {ComponentContext} */
          j
        );
        l && (a.c = l), i && (r.$$events = i), u = e(d, r) || {}, Mn();
      },
      f
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!v.has(_)) {
          v.add(_);
          var y = dr(_);
          for (const O of [t, document]) {
            var b = qe.get(O);
            b === void 0 && (b = /* @__PURE__ */ new Map(), qe.set(O, b));
            var w = b.get(_);
            w === void 0 ? (O.addEventListener(_, wt, { passive: y }), b.set(_, 1)) : b.set(_, w + 1);
          }
        }
      }
    };
    return h(He(_r)), pt.add(h), () => {
      for (var d of v)
        for (const y of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            qe.get(y)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (y.removeEventListener(d, wt), a.delete(d), a.size === 0 && qe.delete(y)) : a.set(d, _);
        }
      pt.delete(h), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Er.set(u, s), u;
}
let Er = /* @__PURE__ */ new WeakMap();
function xr(e, t) {
  return t;
}
function Tr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, f = 0; f < i; f++) {
    let v = t[f];
    we(
      v,
      () => {
        if (l) {
          if (l.pending.delete(v), l.done.add(v), l.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Ze(e, He(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var u = r.length === 0 && n !== null;
    if (u) {
      var s = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        s.parentNode
      );
      Zn(c), c.append(s), e.items.clear();
    }
    Ze(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Ze(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const f of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= X;
      const o = document.createDocumentFragment();
      Zt(l, o);
    } else
      L(t[i], n);
  }
}
var bt;
function kr(e, t, n, r, i, l = null) {
  var o = e, f = /* @__PURE__ */ new Map();
  {
    var u = (
      /** @type {Element} */
      e
    );
    o = u.appendChild(Fe());
  }
  var s = null, c = /* @__PURE__ */ Un(() => {
    var w = n();
    return yt(w) ? w : w == null ? [] : He(w);
  }), v, h = /* @__PURE__ */ new Map(), d = !0;
  function a(w) {
    (b.effect.f & z) === 0 && (b.pending.delete(w), b.fallback = s, Sr(b, v, o, t, r), s !== null && (v.length === 0 ? (s.f & X) === 0 ? Wt(s) : (s.f ^= X, Re(s, null, o)) : we(s, () => {
      s = null;
    })));
  }
  function _(w) {
    b.pending.delete(w);
  }
  var y = Bt(() => {
    v = /** @type {V[]} */
    Y(c);
    for (var w = v.length, O = /* @__PURE__ */ new Set(), H = (
      /** @type {Batch} */
      m
    ), fe = Jn(), Z = 0; Z < w; Z += 1) {
      var Se = v[Z], I = r(Se, Z), K = d ? null : f.get(I);
      K ? (K.v && ye(K.v, Se), K.i && ye(K.i, Z), fe && H.unskip_effect(K.e)) : (K = Ar(
        f,
        d ? o : bt ??= Fe(),
        Se,
        I,
        Z,
        i,
        t,
        n
      ), d || (K.e.f |= X), f.set(I, K)), O.add(I);
    }
    if (w === 0 && l && !s && (d ? s = V(() => l(o)) : (s = V(() => l(bt ??= Fe())), s.f |= X)), w > O.size && wn(), !d)
      if (h.set(H, O), fe) {
        for (const [sn, fn] of f)
          O.has(sn) || H.skip_effect(fn.e);
        H.oncommit(a), H.ondiscard(_);
      } else
        a(H);
    Y(c);
  }), b = { effect: y, items: f, pending: h, outrogroups: null, fallback: s };
  d = !1;
}
function Ae(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Sr(e, t, n, r, i) {
  var l = t.length, o = e.items, f = Ae(e.effect.first), u, s = null, c = [], v = [], h, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const I of e.outrogroups)
        I.pending.delete(a), I.done.delete(a);
    if ((a.f & N) !== 0 && Wt(a), (a.f & X) !== 0)
      if (a.f ^= X, a === f)
        Re(a, null, n);
      else {
        var y = s ? s.next : f;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), ee(e, s, a), ee(e, a, y), Re(a, y, n), s = a, c = [], v = [], f = Ae(s.next);
        continue;
      }
    if (a !== f) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < v.length) {
          var b = v[0], w;
          s = b.prev;
          var O = c[0], H = c[c.length - 1];
          for (w = 0; w < c.length; w += 1)
            Re(c[w], b, n);
          for (w = 0; w < v.length; w += 1)
            u.delete(v[w]);
          ee(e, O.prev, H.next), ee(e, s, O), ee(e, H, b), f = b, s = H, _ -= 1, c = [], v = [];
        } else
          u.delete(a), Re(a, f, n), ee(e, a.prev, a.next), ee(e, a, s === null ? e.effect.first : s.next), ee(e, s, a), s = a;
        continue;
      }
      for (c = [], v = []; f !== null && f !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(f), v.push(f), f = Ae(f.next);
      if (f === null)
        continue;
    }
    (a.f & X) === 0 && c.push(a), s = a, f = Ae(a.next);
  }
  if (e.outrogroups !== null) {
    for (const I of e.outrogroups)
      I.pending.size === 0 && (Ze(e, He(I.done)), e.outrogroups?.delete(I));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || u !== void 0) {
    var fe = [];
    if (u !== void 0)
      for (a of u)
        (a.f & N) === 0 && fe.push(a);
    for (; f !== null; )
      (f.f & N) === 0 && f !== e.fallback && fe.push(f), f = Ae(f.next);
    var Z = fe.length;
    if (Z > 0) {
      var Se = l === 0 ? n : null;
      Tr(e, fe, Se);
    }
  }
}
function Ar(e, t, n, r, i, l, o, f) {
  var u = (o & Tn) !== 0 ? (o & Sn) === 0 ? /* @__PURE__ */ Gn(n, !1, !1) : ve(n) : null, s = (o & kn) !== 0 ? ve(i) : null;
  return {
    v: u,
    i: s,
    e: V(() => (l(t, u ?? n, s ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Re(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & X) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Ye(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function ee(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Rr = /* @__PURE__ */ ln("<div> </div>"), Nr = /* @__PURE__ */ ln('<div><div>Scroll Demo</div> <div style="height: 200px; overflow: auto;"></div> <div> </div></div>');
function Cr(e) {
  let t = pe(Array.from({ length: 20 }, (o, f) => `Item ${f + 1}`));
  var n = Nr(), r = at($e(n), 2);
  kr(r, 21, () => t, xr, (o, f) => {
    var u = Rr(), s = $e(u);
    ct(() => _t(s, Y(f))), mt(o, u);
  });
  var i = at(r, 2), l = $e(i);
  ct(() => _t(l, `Total: ${t.length ?? ""}`)), mt(e, n);
}
function Mr(e) {
  return br(Cr, { target: e });
}
export {
  Mr as default,
  Mr as rvst_mount
};

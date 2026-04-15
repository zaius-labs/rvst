var mt = Array.isArray, un = Array.prototype.indexOf, ge = Array.prototype.includes, He = Array.from, an = Object.defineProperty, Re = Object.getOwnPropertyDescriptor, on = Object.prototype, cn = Array.prototype, hn = Object.getPrototypeOf, st = Object.isExtensible;
const vn = () => {
};
function dn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function bt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Ne = 4, Ve = 8, yt = 1 << 24, re = 16, U = 32, ue = 64, Be = 128, O = 512, x = 1024, A = 2048, B = 4096, F = 8192, j = 16384, Ee = 32768, ft = 1 << 25, Fe = 65536, ut = 1 << 17, _n = 1 << 18, xe = 1 << 19, pn = 1 << 20, W = 1 << 25, ae = 65536, Ke = 1 << 21, Je = 1 << 22, ee = 1 << 23, Ye = Symbol("$state"), G = new class extends Error {
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
function Cn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Et(e) {
  return e === this.v;
}
function Nn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function xt(e) {
  return !Nn(e, this.v);
}
let V = null;
function we(e) {
  V = e;
}
function Fn(e, t = !1, n) {
  V = {
    p: V,
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
    V
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      lr(r);
  }
  return t.i = !0, V = t.p, /** @type {T} */
  {};
}
function Tt() {
  return !0;
}
let ve = [];
function Dn() {
  var e = ve;
  ve = [], dn(e);
}
function _e(e) {
  if (ve.length === 0) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && Dn();
    });
  }
  ve.push(e);
}
function kt(e) {
  var t = g;
  if (t === null)
    return p.f |= ee, e;
  if ((t.f & Ee) === 0 && (t.f & Ne) === 0)
    throw e;
  Q(e, t);
}
function Q(e, t) {
  for (; t !== null; ) {
    if ((t.f & Be) !== 0) {
      if ((t.f & Ee) === 0)
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
  (e.f & O) !== 0 || e.deps === null ? E(e, x) : E(e, B);
}
function St(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & ae) === 0 || (t.f ^= ae, St(
        /** @type {Derived} */
        t.deps
      ));
}
function At(e, t, n) {
  (e.f & A) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), St(e.deps), E(e, x);
}
const X = /* @__PURE__ */ new Set();
let b = null, z = null, $e = null, Ue = !1, de = null, ze = null;
var at = 0;
let Pn = 1;
class ne {
  id = Pn++;
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
        E(r, A), this.schedule(r);
      for (r of n.m)
        E(r, B), this.schedule(r);
    }
  }
  #h() {
    if (at++ > 1e3 && (X.delete(this), In()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), E(s, A), this.schedule(s);
      for (const s of this.#n)
        E(s, B), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = de = [], r = [], i = ze = [];
    for (const s of t)
      try {
        this.#a(s, n, r);
      } catch (f) {
        throw Ft(s), f;
      }
    if (b = null, i.length > 0) {
      var l = ne.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (de = null, ze = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [s, f] of this.#l)
        Nt(s, f);
    } else {
      this.#r.size === 0 && X.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), ot(r), ot(n), this.#i?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#e.length > 0) {
      const s = a ??= this;
      s.#e.push(...this.#e.filter((f) => !s.#e.includes(f)));
    }
    a !== null && (X.add(a), a.#h()), X.has(this) || this.#w();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #a(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var l = i.f, a = (l & (U | ue)) !== 0, s = a && (l & x) !== 0, f = s || (l & F) !== 0 || this.#l.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= x : (l & Ne) !== 0 ? n.push(i) : Pe(i) && ((l & re) !== 0 && this.#n.add(i), ye(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
      At(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & ee) === 0 && (this.current.set(t, [t.v, r]), z?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, z = null;
  }
  flush() {
    try {
      Ue = !0, b = this, this.#h();
    } finally {
      at = 0, $e = null, de = null, ze = null, Ue = !1, b = null, z = null, te.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), X.delete(this);
  }
  #w() {
    for (const u of X) {
      var t = u.id < this.id, n = [];
      for (const [c, [v, h]] of this.current) {
        if (u.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            u.current.get(c)[0]
          );
          if (t && v !== r)
            u.current.set(c, [v, h]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...u.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && u.discard();
      else if (n.length > 0) {
        u.activate();
        var l = /* @__PURE__ */ new Set(), a = /* @__PURE__ */ new Map();
        for (var s of n)
          Rt(s, i, l, a);
        if (u.#e.length > 0) {
          u.apply();
          for (var f of u.#e)
            u.#a(f, [], []);
          u.#e = [];
        }
        u.deactivate();
      }
    }
    for (const u of X)
      u.#u.has(this) && (u.#u.delete(this), u.#u.size === 0 && !u.#c() && (u.activate(), u.#h()));
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
    this.#o || r || (this.#o = !0, _e(() => {
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
    this.#s.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#v.add(t);
  }
  settled() {
    return (this.#i ??= bt()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new ne();
      Ue || (X.add(b), _e(() => {
        b === t && t.flush();
      }));
    }
    return b;
  }
  apply() {
    {
      z = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if ($e = t, t.b?.is_pending && (t.f & (Ne | Ve | yt)) !== 0 && (t.f & Ee) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (de !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ue | U)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function In() {
  try {
    mn();
  } catch (e) {
    Q(e, $e);
  }
}
let $ = null;
function ot(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | F)) === 0 && Pe(r) && ($ = /* @__PURE__ */ new Set(), ye(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Yt(r), $?.size > 0)) {
        te.clear();
        for (const i of $) {
          if ((i.f & (j | F)) !== 0) continue;
          const l = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), l.push(a)), a = a.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const f = l[s];
            (f.f & (j | F)) === 0 && ye(f);
          }
        }
        $.clear();
      }
    }
    $ = null;
  }
}
function Rt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? Rt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Je | re)) !== 0 && (l & A) === 0 && Ct(i, t, r) && (E(i, A), et(
        /** @type {Effect} */
        i
      ));
    }
}
function Ct(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ge.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Ct(
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
  b.schedule(e);
}
function Nt(e, t) {
  if (!((e.f & U) !== 0 && (e.f & x) !== 0)) {
    (e.f & A) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Nt(n, t), n = n.next;
  }
}
function Ft(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Ft(t), t = t.next;
}
function qn(e) {
  let t = 0, n = oe(0), r;
  return () => {
    it() && (D(n), ur(() => (t === 0 && (r = tn(() => e(() => Ce(n)))), t += 1, () => {
      _e(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ce(n));
      });
    })));
  };
}
var zn = Fe | xe;
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
  #_ = qn(() => (this.#a = oe(this.#o), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#s = t, this.#r = n, this.#f = (l) => {
      var a = (
        /** @type {Effect} */
        g
      );
      a.b = this, a.f |= Be, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Ht(() => {
      this.#m();
    }, zn);
  }
  #w() {
    try {
      this.#e = Y(() => this.#f(this.#s));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(t) {
    const n = this.#r.failed;
    n && (this.#n = Y(() => {
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
    t && (this.is_pending = !0, this.#t = Y(() => t(this.#s)), _e(() => {
      var n = this.#l = document.createDocumentFragment(), r = Me();
      n.append(r), this.#e = this.#g(() => Y(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, pe(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#p(
        /** @type {Batch} */
        b
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#o = 0, this.#e = Y(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        $t(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = Y(() => n(this.#s));
      } else
        this.#p(
          /** @type {Batch} */
          b
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
    At(t, this.#d, this.#h);
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
    var n = g, r = p, i = V;
    K(this.#i), I(this.#i), we(this.#i.ctx);
    try {
      return ne.ensure(), t();
    } catch (l) {
      return kt(l), null;
    } finally {
      K(n), I(r), we(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && pe(this.#t, () => {
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
    this.#b(t, n), this.#o += t, !(!this.#a || this.#c) && (this.#c = !0, _e(() => {
      this.#c = !1, this.#a && me(this.#a, this.#o);
    }));
  }
  get_effect_pending() {
    return this.#_(), D(
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
    this.#e && (H(this.#e), this.#e = null), this.#t && (H(this.#t), this.#t = null), this.#n && (H(this.#n), this.#n = null);
    var i = !1, l = !1;
    const a = () => {
      if (i) {
        Cn();
        return;
      }
      i = !0, l && xn(), this.#n !== null && pe(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, s = (f) => {
      try {
        l = !0, n?.(f, a), l = !1;
      } catch (u) {
        Q(u, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return Y(() => {
            var u = (
              /** @type {Effect} */
              g
            );
            u.b = this, u.f |= Be, r(
              this.#s,
              () => f,
              () => a
            );
          });
        } catch (u) {
          return Q(
            u,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    _e(() => {
      var f;
      try {
        f = this.transform_error(t);
      } catch (u) {
        Q(u, this.#i && this.#i.parent);
        return;
      }
      f !== null && typeof f == "object" && typeof /** @type {any} */
      f.then == "function" ? f.then(
        s,
        /** @param {unknown} e */
        (u) => Q(u, this.#i && this.#i.parent)
      ) : s(f);
    });
  }
}
function Hn(e, t, n, r) {
  const i = tt;
  var l = e.filter((h) => !h.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    g
  ), s = Vn(), f = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((h) => h.promise)) : null;
  function u(h) {
    s();
    try {
      r(h);
    } catch (d) {
      (a.f & j) === 0 && Q(d, a);
    }
    je();
  }
  if (n.length === 0) {
    f.then(() => u(t.map(i)));
    return;
  }
  var c = Mt();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Yn(h))).then((h) => u([...t.map(i), ...h])).catch((h) => Q(h, a)).finally(() => c());
  }
  f ? f.then(() => {
    s(), v(), je();
  }) : v();
}
function Vn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = V, r = (
    /** @type {Batch} */
    b
  );
  return function(l = !0) {
    K(e), I(t), we(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function je(e = !0) {
  K(null), I(null), we(null), e && b?.deactivate();
}
function Mt() {
  var e = (
    /** @type {Effect} */
    g
  ), t = (
    /** @type {Boundary} */
    e.b
  ), n = (
    /** @type {Batch} */
    b
  ), r = t.is_rendered();
  return t.update_pending_count(1, n), n.increment(r, e), (i = !1) => {
    t.update_pending_count(-1, n), n.decrement(r, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function tt(e) {
  var t = T | A, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= xe), {
    ctx: V,
    deps: null,
    effects: null,
    equals: Et,
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
  ), l = oe(
    /** @type {V} */
    k
  ), a = !p, s = /* @__PURE__ */ new Map();
  return fr(() => {
    var f = (
      /** @type {Effect} */
      g
    ), u = bt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(je);
    } catch (d) {
      u.reject(d), je();
    }
    var c = (
      /** @type {Batch} */
      b
    );
    if (a) {
      if ((f.f & Ee) !== 0)
        var v = Mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(c)?.reject(G), s.delete(c);
      else {
        for (const d of s.values())
          d.reject(G);
        s.clear();
      }
      s.set(c, u);
    }
    const h = (d, o = void 0) => {
      if (v) {
        var _ = o === G;
        v(_);
      }
      if (!(o === G || (f.f & j) !== 0)) {
        if (c.activate(), o)
          l.f |= ee, me(l, o);
        else {
          (l.f & ee) !== 0 && (l.f ^= ee), me(l, d);
          for (const [m, w] of s) {
            if (s.delete(m), m === c) break;
            w.reject(G);
          }
        }
        c.deactivate();
      }
    };
    u.promise.then(h, (d) => h(null, d || "unknown"));
  }), ir(() => {
    for (const f of s.values())
      f.reject(G);
  }), new Promise((f) => {
    function u(c) {
      function v() {
        c === i ? f(l) : u(i);
      }
      c.then(v, v);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Un(e) {
  const t = /* @__PURE__ */ tt(e);
  return Gt(t), t;
}
// @__NO_SIDE_EFFECTS__
function Bn(e) {
  const t = /* @__PURE__ */ tt(e);
  return t.equals = xt, t;
}
function Kn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      H(
        /** @type {Effect} */
        t[n]
      );
  }
}
function $n(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & T) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function nt(e) {
  var t, n = g;
  K($n(e));
  try {
    e.f &= ~ae, Kn(e), t = Jt(e);
  } finally {
    K(n);
  }
  return t;
}
function Dt(e) {
  var t = e.v, n = nt(e);
  if (!e.equals(n) && (e.wv = Xt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  be || (z !== null ? (it() || b?.is_fork) && z.set(e, n) : Qe(e));
}
function Gn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(G), t.teardown = vn, t.ac = null, De(t, 0), lt(t));
}
function Ot(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ye(t);
}
let Ge = /* @__PURE__ */ new Set();
const te = /* @__PURE__ */ new Map();
let Pt = !1;
function oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Et,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Z(e, t) {
  const n = oe(e);
  return Gt(n), n;
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t = !1, n = !0) {
  const r = oe(e);
  return t || (r.equals = xt), r;
}
function le(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (p.f & ut) !== 0) && Tt() && (p.f & (T | re | Je | ut)) !== 0 && (P === null || !ge.call(P, e)) && En();
  let r = n ? Se(t) : t;
  return me(e, r, ze);
}
function me(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    be ? te.set(e, t) : te.set(e, r), e.v = t;
    var i = ne.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & A) !== 0 && nt(l), z === null && Qe(l);
    }
    e.wv = Xt(), It(e, A, n), g !== null && (g.f & x) !== 0 && (g.f & (U | ue)) === 0 && (M === null ? hr([e]) : M.push(e)), !i.is_fork && Ge.size > 0 && !Pt && Xn();
  }
  return t;
}
function Xn() {
  Pt = !1;
  for (const e of Ge)
    (e.f & x) !== 0 && E(e, B), Pe(e) && ye(e);
  Ge.clear();
}
function Ce(e) {
  le(e, e.v + 1);
}
function It(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var a = r[l], s = a.f, f = (s & A) === 0;
      if (f && E(a, t), (s & T) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        z?.delete(u), (s & ae) === 0 && (s & O && (a.f |= ae), It(u, B, n));
      } else if (f) {
        var c = (
          /** @type {Effect} */
          a
        );
        (s & re) !== 0 && $ !== null && $.add(c), n !== null ? n.push(c) : et(c);
      }
    }
}
function Se(e) {
  if (typeof e != "object" || e === null || Ye in e)
    return e;
  const t = hn(e);
  if (t !== on && t !== cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = mt(e), i = /* @__PURE__ */ Z(0), l = fe, a = (s) => {
    if (fe === l)
      return s();
    var f = p, u = fe;
    I(null), vt(l);
    var c = s();
    return I(f), vt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ Z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, f, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && bn();
        var c = n.get(f);
        return c === void 0 ? a(() => {
          var v = /* @__PURE__ */ Z(u.value);
          return n.set(f, v), v;
        }) : le(c, u.value, !0), !0;
      },
      deleteProperty(s, f) {
        var u = n.get(f);
        if (u === void 0) {
          if (f in s) {
            const c = a(() => /* @__PURE__ */ Z(k));
            n.set(f, c), Ce(i);
          }
        } else
          le(u, k), Ce(i);
        return !0;
      },
      get(s, f, u) {
        if (f === Ye)
          return e;
        var c = n.get(f), v = f in s;
        if (c === void 0 && (!v || Re(s, f)?.writable) && (c = a(() => {
          var d = Se(v ? s[f] : k), o = /* @__PURE__ */ Z(d);
          return o;
        }), n.set(f, c)), c !== void 0) {
          var h = D(c);
          return h === k ? void 0 : h;
        }
        return Reflect.get(s, f, u);
      },
      getOwnPropertyDescriptor(s, f) {
        var u = Reflect.getOwnPropertyDescriptor(s, f);
        if (u && "value" in u) {
          var c = n.get(f);
          c && (u.value = D(c));
        } else if (u === void 0) {
          var v = n.get(f), h = v?.v;
          if (v !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return u;
      },
      has(s, f) {
        if (f === Ye)
          return !0;
        var u = n.get(f), c = u !== void 0 && u.v !== k || Reflect.has(s, f);
        if (u !== void 0 || g !== null && (!c || Re(s, f)?.writable)) {
          u === void 0 && (u = a(() => {
            var h = c ? Se(s[f]) : k, d = /* @__PURE__ */ Z(h);
            return d;
          }), n.set(f, u));
          var v = D(u);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(s, f, u, c) {
        var v = n.get(f), h = f in s;
        if (r && f === "length")
          for (var d = u; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var o = n.get(d + "");
            o !== void 0 ? le(o, k) : d in s && (o = a(() => /* @__PURE__ */ Z(k)), n.set(d + "", o));
          }
        if (v === void 0)
          (!h || Re(s, f)?.writable) && (v = a(() => /* @__PURE__ */ Z(void 0)), le(v, Se(u)), n.set(f, v));
        else {
          h = v.v !== k;
          var _ = a(() => Se(u));
          le(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(s, f);
        if (m?.set && m.set.call(c, u), !h) {
          if (r && typeof f == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(f);
            Number.isInteger(y) && y >= w.v && le(w, y + 1);
          }
          Ce(i);
        }
        return !0;
      },
      ownKeys(s) {
        D(i);
        var f = Reflect.ownKeys(s).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [u, c] of n)
          c.v !== k && !(u in s) && f.push(u);
        return f;
      },
      setPrototypeOf() {
        yn();
      }
    }
  );
}
var ct, qt, zt, Lt;
function Zn() {
  if (ct === void 0) {
    ct = window, qt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    zt = Re(t, "firstChild").get, Lt = Re(t, "nextSibling").get, st(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), st(n) && (n.__t = void 0);
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function rt(e) {
  return (
    /** @type {TemplateNode | null} */
    zt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Oe(e) {
  return (
    /** @type {TemplateNode | null} */
    Lt.call(e)
  );
}
function We(e, t) {
  return /* @__PURE__ */ rt(e);
}
function Jn(e, t = !1) {
  {
    var n = /* @__PURE__ */ rt(e);
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Oe(n) : n;
  }
}
function Qn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Oe(r);
  return r;
}
function er(e) {
  e.textContent = "";
}
function tr() {
  return !1;
}
function nr(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Rn, e, void 0)
  );
}
function jt(e) {
  var t = p, n = g;
  I(null), K(null);
  try {
    return e();
  } finally {
    I(t), K(n);
  }
}
function rr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = g;
  n !== null && (n.f & F) !== 0 && (e |= F);
  var r = {
    ctx: V,
    deps: null,
    nodes: null,
    f: e | A | O,
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
  if ((e & Ne) !== 0)
    de !== null ? de.push(r) : ne.ensure().schedule(r);
  else if (t !== null) {
    try {
      ye(r);
    } catch (a) {
      throw H(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & xe) === 0 && (i = i.first, (e & re) !== 0 && (e & Fe) !== 0 && i !== null && (i.f |= Fe));
  }
  if (i !== null && (i.parent = n, n !== null && rr(i, n), p !== null && (p.f & T) !== 0 && (e & ue) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function it() {
  return p !== null && !L;
}
function ir(e) {
  const t = ie(Ve, null);
  return E(t, x), t.teardown = e, t;
}
function lr(e) {
  return ie(Ne | pn, e);
}
function sr(e) {
  ne.ensure();
  const t = ie(ue | xe, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? pe(t, () => {
      H(t), r(void 0);
    }) : (H(t), r(void 0));
  });
}
function fr(e) {
  return ie(Je | xe, e);
}
function ur(e, t = 0) {
  return ie(Ve | t, e);
}
function ar(e, t = [], n = [], r = []) {
  Hn(r, t, n, (i) => {
    ie(Ve, () => e(...i.map(D)));
  });
}
function Ht(e, t = 0) {
  var n = ie(re | t, e);
  return n;
}
function Y(e) {
  return ie(U | xe, e);
}
function Vt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = be, r = p;
    ht(!0), I(null);
    try {
      t.call(null);
    } finally {
      ht(n), I(r);
    }
  }
}
function lt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && jt(() => {
      i.abort(G);
    });
    var r = n.next;
    (n.f & ue) !== 0 ? n.parent = null : H(n, t), n = r;
  }
}
function or(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & U) === 0 && H(t), t = n;
  }
}
function H(e, t = !0) {
  var n = !1;
  (t || (e.f & _n) !== 0) && e.nodes !== null && e.nodes.end !== null && (cr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, ft), lt(e, t && !n), De(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Vt(e), e.f ^= ft, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Yt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function cr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Oe(e);
    e.remove(), e = n;
  }
}
function Yt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function pe(e, t, n = !0) {
  var r = [];
  Ut(e, r, !0);
  var i = () => {
    n && H(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var a = () => --l || i();
    for (var s of r)
      s.out(a);
  } else
    i();
}
function Ut(e, t, n) {
  if ((e.f & F) === 0) {
    e.f ^= F;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, a = (i.f & Fe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & U) !== 0 && (e.f & re) !== 0;
      Ut(i, t, a ? n : !1), i = l;
    }
  }
}
function Bt(e) {
  Kt(e, !0);
}
function Kt(e, t) {
  if ((e.f & F) !== 0) {
    e.f ^= F, (e.f & x) === 0 && (E(e, A), ne.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Fe) !== 0 || (n.f & U) !== 0;
      Kt(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const a of l)
        (a.is_global || t) && a.in();
  }
}
function $t(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Oe(n);
      t.append(n), n = i;
    }
}
let Le = !1, be = !1;
function ht(e) {
  be = e;
}
let p = null, L = !1;
function I(e) {
  p = e;
}
let g = null;
function K(e) {
  g = e;
}
let P = null;
function Gt(e) {
  p !== null && (P === null ? P = [e] : P.push(e));
}
let R = null, N = 0, M = null;
function hr(e) {
  M = e;
}
let Wt = 1, se = 0, fe = se;
function vt(e) {
  fe = e;
}
function Xt() {
  return ++Wt;
}
function Pe(e) {
  var t = e.f;
  if ((t & A) !== 0)
    return !0;
  if (t & T && (e.f &= ~ae), (t & B) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Pe(
        /** @type {Derived} */
        l
      ) && Dt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & O) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    z === null && E(e, x);
  }
  return !1;
}
function Zt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(P !== null && ge.call(P, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? Zt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, A) : (l.f & x) !== 0 && E(l, B), et(
        /** @type {Effect} */
        l
      ));
    }
}
function Jt(e) {
  var t = R, n = N, r = M, i = p, l = P, a = V, s = L, f = fe, u = e.f;
  R = /** @type {null | Value[]} */
  null, N = 0, M = null, p = (u & (U | ue)) === 0 ? e : null, P = null, we(e.ctx), L = !1, fe = ++se, e.ac !== null && (jt(() => {
    e.ac.abort(G);
  }), e.ac = null);
  try {
    e.f |= Ke;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= Ee;
    var h = e.deps, d = b?.is_fork;
    if (R !== null) {
      var o;
      if (d || De(e, N), h !== null && N > 0)
        for (h.length = N + R.length, o = 0; o < R.length; o++)
          h[N + o] = R[o];
      else
        e.deps = h = R;
      if (it() && (e.f & O) !== 0)
        for (o = N; o < h.length; o++)
          (h[o].reactions ??= []).push(e);
    } else !d && h !== null && N < h.length && (De(e, N), h.length = N);
    if (Tt() && M !== null && !L && h !== null && (e.f & (T | B | A)) === 0)
      for (o = 0; o < /** @type {Source[]} */
      M.length; o++)
        Zt(
          M[o],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (se++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = se;
      if (t !== null)
        for (const _ of t)
          _.rv = se;
      M !== null && (r === null ? r = M : r.push(.../** @type {Source[]} */
      M));
    }
    return (e.f & ee) !== 0 && (e.f ^= ee), v;
  } catch (_) {
    return kt(_);
  } finally {
    e.f ^= Ke, R = t, N = n, M = r, p = i, P = l, we(a), L = s, fe = f;
  }
}
function vr(e, t) {
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
  (R === null || !ge.call(R, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & O) !== 0 && (l.f ^= O, l.f &= ~ae), Qe(l), Gn(l), De(l, 0);
  }
}
function De(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      vr(e, n[r]);
}
function ye(e) {
  var t = e.f;
  if ((t & j) === 0) {
    E(e, x);
    var n = g, r = Le;
    g = e, Le = !0;
    try {
      (t & (re | yt)) !== 0 ? or(e) : lt(e), Vt(e);
      var i = Jt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Wt;
      var l;
    } finally {
      Le = r, g = n;
    }
  }
}
function D(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !L) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (P === null || !ge.call(P, e))) {
      var i = p.deps;
      if ((p.f & Ke) !== 0)
        e.rv < se && (e.rv = se, R === null && i !== null && i[N] === e ? N++ : R === null ? R = [e] : R.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : ge.call(l, p) || l.push(p);
      }
    }
  }
  if (be && te.has(e))
    return te.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (be) {
      var s = a.v;
      return ((a.f & x) === 0 && a.reactions !== null || en(a)) && (s = nt(a)), te.set(a, s), s;
    }
    var f = (a.f & O) === 0 && !L && p !== null && (Le || (p.f & O) !== 0), u = (a.f & Ee) === 0;
    Pe(a) && (f && (a.f |= O), Dt(a)), f && !u && (Ot(a), Qt(a));
  }
  if (z?.has(e))
    return z.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function Qt(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & O) === 0 && (Ot(
        /** @type {Derived} */
        t
      ), Qt(
        /** @type {Derived} */
        t
      ));
}
function en(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (te.has(t) || (t.f & T) !== 0 && en(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function tn(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const dt = globalThis.Deno?.core?.ops ?? null;
function dr(e, ...t) {
  dt?.[e] ? dt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function _r(e, t) {
  dr("op_set_text", e, t);
}
const pr = ["touchstart", "touchmove"];
function gr(e) {
  return pr.includes(e);
}
const Ie = Symbol("events"), wr = /* @__PURE__ */ new Set(), _t = /* @__PURE__ */ new Set();
let pt = null;
function gt(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  pt = e;
  var a = 0, s = pt === e && e[Ie];
  if (s) {
    var f = i.indexOf(s);
    if (f !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ie] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    f <= u && (a = f);
  }
  if (l = /** @type {Element} */
  i[a] || e.target, l !== t) {
    an(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, v = g;
    I(null), K(null);
    try {
      for (var h, d = []; l !== null; ) {
        var o = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Ie]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (m) {
          h ? d.push(m) : h = m;
        }
        if (e.cancelBubble || o === t || o === null)
          break;
        l = o;
      }
      if (h) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Ie] = t, delete e.currentTarget, I(c), K(v);
    }
  }
}
const mr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function br(e) {
  return (
    /** @type {string} */
    mr?.createHTML(e) ?? e
  );
}
function yr(e) {
  var t = nr("template");
  return t.innerHTML = br(e.replaceAll("<!>", "<!---->")), t.content;
}
function nn(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function rn(e, t) {
  var n = (t & An) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = yr(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ rt(r));
    var l = (
      /** @type {TemplateNode} */
      n || qt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return nn(l, l), l;
  };
}
function Er() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Me();
  return e.append(t, n), nn(t, n), e;
}
function Xe(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function xr(e, t) {
  return Tr(e, t);
}
const qe = /* @__PURE__ */ new Map();
function Tr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: a = !0, transformError: s }) {
  Zn();
  var f = void 0, u = sr(() => {
    var c = n ?? t.appendChild(Me());
    Ln(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Fn({});
        var o = (
          /** @type {ComponentContext} */
          V
        );
        l && (o.c = l), i && (r.$$events = i), f = e(d, r) || {}, Mn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var o = 0; o < d.length; o++) {
        var _ = d[o];
        if (!v.has(_)) {
          v.add(_);
          var m = gr(_);
          for (const C of [t, document]) {
            var w = qe.get(C);
            w === void 0 && (w = /* @__PURE__ */ new Map(), qe.set(C, w));
            var y = w.get(_);
            y === void 0 ? (C.addEventListener(_, gt, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return h(He(wr)), _t.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var o = (
            /** @type {Map<string, number>} */
            qe.get(m)
          ), _ = (
            /** @type {number} */
            o.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, gt), o.delete(d), o.size === 0 && qe.delete(m)) : o.set(d, _);
        }
      _t.delete(h), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return kr.set(f, u), f;
}
let kr = /* @__PURE__ */ new WeakMap();
function Sr(e, t) {
  return t;
}
function Ar(e, t, n) {
  for (var r = [], i = t.length, l, a = t.length, s = 0; s < i; s++) {
    let v = t[s];
    pe(
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
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var f = r.length === 0 && n !== null;
    if (f) {
      var u = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        u.parentNode
      );
      er(c), c.append(u), e.items.clear();
    }
    Ze(e, t, !f);
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
    for (const a of e.pending.values())
      for (const s of a)
        r.add(
          /** @type {EachItem} */
          e.items.get(s).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= W;
      const a = document.createDocumentFragment();
      $t(l, a);
    } else
      H(t[i], n);
  }
}
var wt;
function Rr(e, t, n, r, i, l = null) {
  var a = e, s = /* @__PURE__ */ new Map(), f = null, u = /* @__PURE__ */ Bn(() => {
    var w = n();
    return mt(w) ? w : w == null ? [] : He(w);
  }), c, v = /* @__PURE__ */ new Map(), h = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = f, Cr(m, c, a, t, r), f !== null && (c.length === 0 ? (f.f & W) === 0 ? Bt(f) : (f.f ^= W, Ae(f, null, a)) : pe(f, () => {
      f = null;
    })));
  }
  function o(w) {
    m.pending.delete(w);
  }
  var _ = Ht(() => {
    c = /** @type {V[]} */
    D(u);
    for (var w = c.length, y = /* @__PURE__ */ new Set(), C = (
      /** @type {Batch} */
      b
    ), ce = tr(), q = 0; q < w; q += 1) {
      var Te = c[q], he = r(Te, q), S = h ? null : s.get(he);
      S ? (S.v && me(S.v, Te), S.i && me(S.i, q), ce && C.unskip_effect(S.e)) : (S = Nr(
        s,
        h ? a : wt ??= Me(),
        Te,
        he,
        q,
        i,
        t,
        n
      ), h || (S.e.f |= W), s.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !f && (h ? f = Y(() => l(a)) : (f = Y(() => l(wt ??= Me())), f.f |= W)), w > y.size && wn(), !h)
      if (v.set(C, y), ce) {
        for (const [sn, fn] of s)
          y.has(sn) || C.skip_effect(fn.e);
        C.oncommit(d), C.ondiscard(o);
      } else
        d(C);
    D(u);
  }), m = { effect: _, items: s, pending: v, outrogroups: null, fallback: f };
  h = !1;
}
function ke(e) {
  for (; e !== null && (e.f & U) === 0; )
    e = e.next;
  return e;
}
function Cr(e, t, n, r, i) {
  var l = t.length, a = e.items, s = ke(e.effect.first), f, u = null, c = [], v = [], h, d, o, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), o = /** @type {EachItem} */
    a.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(o), S.done.delete(o);
    if ((o.f & F) !== 0 && Bt(o), (o.f & W) !== 0)
      if (o.f ^= W, o === s)
        Ae(o, null, n);
      else {
        var m = u ? u.next : s;
        o === e.effect.last && (e.effect.last = o.prev), o.prev && (o.prev.next = o.next), o.next && (o.next.prev = o.prev), J(e, u, o), J(e, o, m), Ae(o, m, n), u = o, c = [], v = [], s = ke(u.next);
        continue;
      }
    if (o !== s) {
      if (f !== void 0 && f.has(o)) {
        if (c.length < v.length) {
          var w = v[0], y;
          u = w.prev;
          var C = c[0], ce = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Ae(c[y], w, n);
          for (y = 0; y < v.length; y += 1)
            f.delete(v[y]);
          J(e, C.prev, ce.next), J(e, u, C), J(e, ce, w), s = w, u = ce, _ -= 1, c = [], v = [];
        } else
          f.delete(o), Ae(o, s, n), J(e, o.prev, o.next), J(e, o, u === null ? e.effect.first : u.next), J(e, u, o), u = o;
        continue;
      }
      for (c = [], v = []; s !== null && s !== o; )
        (f ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = ke(s.next);
      if (s === null)
        continue;
    }
    (o.f & W) === 0 && c.push(o), u = o, s = ke(o.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Ze(e, He(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || f !== void 0) {
    var q = [];
    if (f !== void 0)
      for (o of f)
        (o.f & F) === 0 && q.push(o);
    for (; s !== null; )
      (s.f & F) === 0 && s !== e.fallback && q.push(s), s = ke(s.next);
    var Te = q.length;
    if (Te > 0) {
      var he = null;
      Ar(e, q, he);
    }
  }
}
function Nr(e, t, n, r, i, l, a, s) {
  var f = (a & Tn) !== 0 ? (a & Sn) === 0 ? /* @__PURE__ */ Wn(n, !1, !1) : oe(n) : null, u = (a & kn) !== 0 ? oe(i) : null;
  return {
    v: f,
    i: u,
    e: Y(() => (l(t, f ?? n, u ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function Ae(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & W) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Oe(r)
      );
      if (l.before(r), r === i)
        return;
      r = a;
    }
}
function J(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Fr(e, t, n, r) {
  var i = (
    /** @type {V} */
    r
  ), l = !0, a = () => (l && (l = !1, i = tn(
    /** @type {() => V} */
    r
  )), i), s;
  s = /** @type {V} */
  e[t], s === void 0 && r !== void 0 && (s = a());
  var f;
  return f = () => {
    var u = (
      /** @type {V} */
      e[t]
    );
    return u === void 0 ? a() : (l = !0, u);
  }, f;
}
var Mr = /* @__PURE__ */ rn("<div><span> </span> <!></div>");
function ln(e, t) {
  const n = Fr(t, "children", 19, () => []);
  var r = Mr(), i = We(r), l = We(i), a = Qn(i, 2);
  Rr(a, 17, n, Sr, (s, f) => {
    var u = Er(), c = Jn(u);
    {
      let v = /* @__PURE__ */ Un(() => D(f).children ?? []);
      ln(c, {
        get label() {
          return D(f).label;
        },
        get children() {
          return D(v);
        }
      });
    }
    Xe(s, u);
  }), ar(() => _r(l, t.label)), Xe(e, r);
}
var Dr = /* @__PURE__ */ rn("<div><!></div>");
function Or(e) {
  const t = {
    label: "root",
    children: [
      { label: "child-a", children: [{ label: "grandchild-1" }] },
      { label: "child-b", children: [] }
    ]
  };
  var n = Dr(), r = We(n);
  ln(r, {
    get label() {
      return t.label;
    },
    get children() {
      return t.children;
    }
  }), Xe(e, n);
}
function Ir(e) {
  return xr(Or, { target: e });
}
export {
  Ir as default,
  Ir as rvst_mount
};

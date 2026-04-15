var Et = Array.isArray, vr = Array.prototype.indexOf, ve = Array.prototype.includes, _r = Array.from, pr = Object.defineProperty, Ae = Object.getOwnPropertyDescriptor, gr = Object.getOwnPropertyDescriptors, br = Object.prototype, wr = Array.prototype, mt = Object.getPrototypeOf, nt = Object.isExtensible;
const yr = () => {
};
function Er(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Tt() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const k = 2, _e = 4, Ie = 8, Ke = 1 << 24, ie = 16, ne = 32, fe = 64, Ue = 128, D = 512, S = 1024, R = 2048, q = 4096, Q = 8192, B = 16384, we = 32768, it = 1 << 25, xe = 65536, st = 1 << 17, mr = 1 << 18, ye = 1 << 19, Tr = 1 << 20, ue = 65536, $e = 1 << 21, We = 1 << 22, ee = 1 << 23, Se = Symbol("$state"), Ar = Symbol(""), X = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), At = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Sr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function kr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Or() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Nr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Rr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Cr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Mr = 2, A = Symbol(), St = "http://www.w3.org/1999/xhtml", Pr = "@attach";
function xr() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Dr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function kt(e) {
  return e === this.v;
}
let U = null;
function pe(e) {
  U = e;
}
function Lr(e, t = !1, r) {
  U = {
    p: U,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      b
    ),
    l: null
  };
}
function Ir(e) {
  var t = (
    /** @type {ComponentContext} */
    U
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      nn(n);
  }
  return t.i = !0, U = t.p, /** @type {T} */
  {};
}
function Ot() {
  return !0;
}
let ce = [];
function jr() {
  var e = ce;
  ce = [], Er(e);
}
function te(e) {
  if (ce.length === 0) {
    var t = ce;
    queueMicrotask(() => {
      t === ce && jr();
    });
  }
  ce.push(e);
}
function Nt(e) {
  var t = b;
  if (t === null)
    return g.f |= ee, e;
  if ((t.f & we) === 0 && (t.f & _e) === 0)
    throw e;
  J(e, t);
}
function J(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ue) !== 0) {
      if ((t.f & we) === 0)
        throw e;
      try {
        t.b.error(e);
        return;
      } catch (r) {
        e = r;
      }
    }
    t = t.parent;
  }
  throw e;
}
const Fr = -7169;
function T(e, t) {
  e.f = e.f & Fr | t;
}
function Xe(e) {
  (e.f & D) !== 0 || e.deps === null ? T(e, S) : T(e, q);
}
function Rt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & k) === 0 || (t.f & ue) === 0 || (t.f ^= ue, Rt(
        /** @type {Derived} */
        t.deps
      ));
}
function Ct(e, t, r) {
  (e.f & R) !== 0 ? t.add(e) : (e.f & q) !== 0 && r.add(e), Rt(e.deps), T(e, S);
}
const Z = /* @__PURE__ */ new Set();
let m = null, F = null, Be = null, Fe = !1, he = null, Ce = null;
var lt = 0;
let Vr = 1;
class oe {
  id = Vr++;
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
  #n = /* @__PURE__ */ new Map();
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
  #r = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #s = /* @__PURE__ */ new Map();
  is_fork = !1;
  #a = !1;
  /** @type {Set<Batch>} */
  #u = /* @__PURE__ */ new Set();
  #c() {
    return this.is_fork || this.#f.size > 0;
  }
  #v() {
    for (const n of this.#u)
      for (const i of n.#f.keys()) {
        for (var t = !1, r = i; r.parent !== null; ) {
          if (this.#s.has(r)) {
            t = !0;
            break;
          }
          r = r.parent;
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
    var r = this.#s.get(t);
    if (r) {
      this.#s.delete(t);
      for (var n of r.d)
        T(n, R), this.schedule(n);
      for (n of r.m)
        T(n, q), this.schedule(n);
    }
  }
  #h() {
    if (lt++ > 1e3 && (Z.delete(this), Yr()), !this.#c()) {
      for (const f of this.#t)
        this.#r.delete(f), T(f, R), this.schedule(f);
      for (const f of this.#r)
        T(f, q), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var r = he = [], n = [], i = Ce = [];
    for (const f of t)
      try {
        this.#o(f, r, n);
      } catch (u) {
        throw Dt(f), u;
      }
    if (m = null, i.length > 0) {
      var s = oe.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (he = null, Ce = null, this.#c() || this.#v()) {
      this.#_(n), this.#_(r);
      for (const [f, u] of this.#s)
        xt(f, u);
    } else {
      this.#n.size === 0 && Z.delete(this), this.#t.clear(), this.#r.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), ft(n), ft(r), this.#i?.resolve();
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
    o !== null && (Z.add(o), o.#h()), Z.has(this) || this.#b();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #o(t, r, n) {
    t.f ^= S;
    for (var i = t.first; i !== null; ) {
      var s = i.f, o = (s & (ne | fe)) !== 0, f = o && (s & S) !== 0, u = f || (s & Q) !== 0 || this.#s.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= S : (s & _e) !== 0 ? r.push(i) : Ne(i) && ((s & ie) !== 0 && this.#r.add(i), be(i));
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
    for (var r = 0; r < t.length; r += 1)
      Ct(t[r], this.#t, this.#r);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, r, n = !1) {
    r !== A && !this.previous.has(t) && this.previous.set(t, r), (t.f & ee) === 0 && (this.current.set(t, [t.v, n]), F?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, F = null;
  }
  flush() {
    try {
      Fe = !0, m = this, this.#h();
    } finally {
      lt = 0, Be = null, he = null, Ce = null, Fe = !1, m = null, F = null, re.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), Z.delete(this);
  }
  #b() {
    for (const l of Z) {
      var t = l.id < this.id, r = [];
      for (const [a, [h, c]] of this.current) {
        if (l.current.has(a)) {
          var n = (
            /** @type {[any, boolean]} */
            l.current.get(a)[0]
          );
          if (t && h !== n)
            l.current.set(a, [h, c]);
          else
            continue;
        }
        r.push(a);
      }
      var i = [...l.current.keys()].filter((a) => !this.current.has(a));
      if (i.length === 0)
        t && l.discard();
      else if (r.length > 0) {
        l.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var f of r)
          Mt(f, i, s, o);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#o(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of Z)
      l.#u.has(this) && (l.#u.delete(this), l.#u.size === 0 && !l.#c() && (l.activate(), l.#h()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, r) {
    let n = this.#n.get(r) ?? 0;
    if (this.#n.set(r, n + 1), t) {
      let i = this.#f.get(r) ?? 0;
      this.#f.set(r, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, r, n) {
    let i = this.#n.get(r) ?? 0;
    if (i === 1 ? this.#n.delete(r) : this.#n.set(r, i - 1), t) {
      let s = this.#f.get(r) ?? 0;
      s === 1 ? this.#f.delete(r) : this.#f.set(r, s - 1);
    }
    this.#a || n || (this.#a = !0, te(() => {
      this.#a = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, r) {
    for (const n of t)
      this.#t.add(n);
    for (const n of r)
      this.#r.add(n);
    t.clear(), r.clear();
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
    return (this.#i ??= Tt()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new oe();
      Fe || (Z.add(m), te(() => {
        m === t && t.flush();
      }));
    }
    return m;
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
    if (Be = t, t.b?.is_pending && (t.f & (_e | Ie | Ke)) !== 0 && (t.f & we) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var r = t; r.parent !== null; ) {
      r = r.parent;
      var n = r.f;
      if (he !== null && r === b && (g === null || (g.f & k) === 0))
        return;
      if ((n & (fe | ne)) !== 0) {
        if ((n & S) === 0)
          return;
        r.f ^= S;
      }
    }
    this.#e.push(r);
  }
}
function Yr() {
  try {
    kr();
  } catch (e) {
    J(e, Be);
  }
}
let K = null;
function ft(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (B | Q)) === 0 && Ne(n) && (K = /* @__PURE__ */ new Set(), be(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && Xt(n), K?.size > 0)) {
        re.clear();
        for (const i of K) {
          if ((i.f & (B | Q)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            K.has(o) && (K.delete(o), s.push(o)), o = o.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (B | Q)) === 0 && be(u);
          }
        }
        K.clear();
      }
    }
    K = null;
  }
}
function Mt(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & k) !== 0 ? Mt(
        /** @type {Derived} */
        i,
        t,
        r,
        n
      ) : (s & (We | ie)) !== 0 && (s & R) === 0 && Pt(i, t, n) && (T(i, R), Ze(
        /** @type {Effect} */
        i
      ));
    }
}
function Pt(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ve.call(t, i))
        return !0;
      if ((i.f & k) !== 0 && Pt(
        /** @type {Derived} */
        i,
        t,
        r
      ))
        return r.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function Ze(e) {
  m.schedule(e);
}
function xt(e, t) {
  if (!((e.f & ne) !== 0 && (e.f & S) !== 0)) {
    (e.f & R) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), T(e, S);
    for (var r = e.first; r !== null; )
      xt(r, t), r = r.next;
  }
}
function Dt(e) {
  T(e, S);
  for (var t = e.first; t !== null; )
    Dt(t), t = t.next;
}
function Ur(e) {
  let t = 0, r = je(0), n;
  return () => {
    tt() && (Y(r), fn(() => (t === 0 && (n = pn(() => e(() => ke(r)))), t += 1, () => {
      te(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, ke(r));
      });
    })));
  };
}
var $r = xe | ye;
function Br(e, t, r, n) {
  new qr(e, t, r, n);
}
class qr {
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
  #n;
  /** @type {((anchor: Node) => void)} */
  #f;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #t = null;
  /** @type {Effect | null} */
  #r = null;
  /** @type {DocumentFragment | null} */
  #s = null;
  #a = 0;
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
  #o = null;
  #_ = Ur(() => (this.#o = je(this.#a), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, r, n, i) {
    this.#l = t, this.#n = r, this.#f = (s) => {
      var o = (
        /** @type {Effect} */
        b
      );
      o.b = this, o.f |= Ue, n(s);
    }, this.parent = /** @type {Effect} */
    b.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = on(() => {
      this.#w();
    }, $r);
  }
  #b() {
    try {
      this.#e = W(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #E(t) {
    const r = this.#n.failed;
    r && (this.#r = W(() => {
      r(
        this.#l,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #m() {
    const t = this.#n.pending;
    t && (this.is_pending = !0, this.#t = W(() => t(this.#l)), te(() => {
      var r = this.#s = document.createDocumentFragment(), n = qt();
      r.append(n), this.#e = this.#g(() => W(() => this.#f(n))), this.#u === 0 && (this.#l.before(r), this.#s = null, Me(
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
  #w() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = W(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        hn(this.#e, t);
        const r = (
          /** @type {(anchor: Node) => void} */
          this.#n.pending
        );
        this.#t = W(() => r(this.#l));
      } else
        this.#p(
          /** @type {Batch} */
          m
        );
    } catch (r) {
      this.error(r);
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
    Ct(t, this.#v, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #g(t) {
    var r = b, n = g, i = U;
    z(this.#i), I(this.#i), pe(this.#i.ctx);
    try {
      return oe.ensure(), t();
    } catch (s) {
      return Nt(s), null;
    } finally {
      z(r), I(n), pe(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #y(t, r) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t, r);
      return;
    }
    this.#u += t, this.#u === 0 && (this.#p(r), this.#t && Me(this.#t, () => {
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
  update_pending_count(t, r) {
    this.#y(t, r), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, te(() => {
      this.#c = !1, this.#o && Le(this.#o, this.#a);
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
    var r = this.#n.onerror;
    let n = this.#n.failed;
    if (!r && !n)
      throw t;
    this.#e && (P(this.#e), this.#e = null), this.#t && (P(this.#t), this.#t = null), this.#r && (P(this.#r), this.#r = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        Dr();
        return;
      }
      i = !0, s && Cr(), this.#r !== null && Me(this.#r, () => {
        this.#r = null;
      }), this.#g(() => {
        this.#w();
      });
    }, f = (u) => {
      try {
        s = !0, r?.(u, o), s = !1;
      } catch (l) {
        J(l, this.#i && this.#i.parent);
      }
      n && (this.#r = this.#g(() => {
        try {
          return W(() => {
            var l = (
              /** @type {Effect} */
              b
            );
            l.b = this, l.f |= Ue, n(
              this.#l,
              () => u,
              () => o
            );
          });
        } catch (l) {
          return J(
            l,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    te(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (l) {
        J(l, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        f,
        /** @param {unknown} e */
        (l) => J(l, this.#i && this.#i.parent)
      ) : f(u);
    });
  }
}
function Lt(e, t, r, n) {
  const i = Hr;
  var s = e.filter((c) => !c.settled);
  if (r.length === 0 && s.length === 0) {
    n(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    b
  ), f = zr(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      n(c);
    } catch (v) {
      (o.f & B) === 0 && J(v, o);
    }
    De();
  }
  if (r.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var a = It();
  function h() {
    Promise.all(r.map((c) => /* @__PURE__ */ Gr(c))).then((c) => l([...t.map(i), ...c])).catch((c) => J(c, o)).finally(() => a());
  }
  u ? u.then(() => {
    f(), h(), De();
  }) : h();
}
function zr() {
  var e = (
    /** @type {Effect} */
    b
  ), t = g, r = U, n = (
    /** @type {Batch} */
    m
  );
  return function(s = !0) {
    z(e), I(t), pe(r), s && (e.f & B) === 0 && (n?.activate(), n?.apply());
  };
}
function De(e = !0) {
  z(null), I(null), pe(null), e && m?.deactivate();
}
function It() {
  var e = (
    /** @type {Effect} */
    b
  ), t = (
    /** @type {Boundary} */
    e.b
  ), r = (
    /** @type {Batch} */
    m
  ), n = t.is_rendered();
  return t.update_pending_count(1, r), r.increment(n, e), (i = !1) => {
    t.update_pending_count(-1, r), r.decrement(n, e, i);
  };
}
// @__NO_SIDE_EFFECTS__
function Hr(e) {
  var t = k | R, r = g !== null && (g.f & k) !== 0 ? (
    /** @type {Derived} */
    g
  ) : null;
  return b !== null && (b.f |= ye), {
    ctx: U,
    deps: null,
    effects: null,
    equals: kt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      A
    ),
    wv: 0,
    parent: r ?? b,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Gr(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    b
  );
  n === null && Sr();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = je(
    /** @type {V} */
    A
  ), o = !g, f = /* @__PURE__ */ new Map();
  return ln(() => {
    var u = (
      /** @type {Effect} */
      b
    ), l = Tt();
    i = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).finally(De);
    } catch (v) {
      l.reject(v), De();
    }
    var a = (
      /** @type {Batch} */
      m
    );
    if (o) {
      if ((u.f & we) !== 0)
        var h = It();
      if (
        /** @type {Boundary} */
        n.b.is_rendered()
      )
        f.get(a)?.reject(X), f.delete(a);
      else {
        for (const v of f.values())
          v.reject(X);
        f.clear();
      }
      f.set(a, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var p = d === X;
        h(p);
      }
      if (!(d === X || (u.f & B) !== 0)) {
        if (a.activate(), d)
          s.f |= ee, Le(s, d);
        else {
          (s.f & ee) !== 0 && (s.f ^= ee), Le(s, v);
          for (const [y, _] of f) {
            if (f.delete(y), y === a) break;
            _.reject(X);
          }
        }
        a.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), Ht(() => {
    for (const u of f.values())
      u.reject(X);
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
function Kr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      P(
        /** @type {Effect} */
        t[r]
      );
  }
}
function Wr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & k) === 0)
      return (t.f & B) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Je(e) {
  var t, r = b;
  z(Wr(e));
  try {
    e.f &= ~ue, Kr(e), t = tr(e);
  } finally {
    z(r);
  }
  return t;
}
function jt(e) {
  var t = e.v, r = Je(e);
  if (!e.equals(r) && (e.wv = Qt(), (!m?.is_fork || e.deps === null) && (e.v = r, m?.capture(e, t, !0), e.deps === null))) {
    T(e, S);
    return;
  }
  ge || (F !== null ? (tt() || m?.is_fork) && F.set(e, r) : Xe(e));
}
function Xr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(X), t.teardown = yr, t.ac = null, Oe(t, 0), rt(t));
}
function Ft(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && be(t);
}
let qe = /* @__PURE__ */ new Set();
const re = /* @__PURE__ */ new Map();
let Vt = !1;
function je(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: kt,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function $(e, t) {
  const r = je(e);
  return dn(r), r;
}
function j(e, t, r = !1) {
  g !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!V || (g.f & st) !== 0) && Ot() && (g.f & (k | ie | We | st)) !== 0 && (L === null || !ve.call(L, e)) && Rr();
  let n = r ? de(t) : t;
  return Le(e, n, Ce);
}
function Le(e, t, r = null) {
  if (!e.equals(t)) {
    var n = e.v;
    ge ? re.set(e, t) : re.set(e, n), e.v = t;
    var i = oe.ensure();
    if (i.capture(e, n), (e.f & k) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & R) !== 0 && Je(s), F === null && Xe(s);
    }
    e.wv = Qt(), Yt(e, R, r), b !== null && (b.f & S) !== 0 && (b.f & (ne | fe)) === 0 && (x === null ? vn([e]) : x.push(e)), !i.is_fork && qe.size > 0 && !Vt && Zr();
  }
  return t;
}
function Zr() {
  Vt = !1;
  for (const e of qe)
    (e.f & S) !== 0 && T(e, q), Ne(e) && be(e);
  qe.clear();
}
function ke(e) {
  j(e, e.v + 1);
}
function Yt(e, t, r) {
  var n = e.reactions;
  if (n !== null)
    for (var i = n.length, s = 0; s < i; s++) {
      var o = n[s], f = o.f, u = (f & R) === 0;
      if (u && T(o, t), (f & k) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        F?.delete(l), (f & ue) === 0 && (f & D && (o.f |= ue), Yt(l, q, r));
      } else if (u) {
        var a = (
          /** @type {Effect} */
          o
        );
        (f & ie) !== 0 && K !== null && K.add(a), r !== null ? r.push(a) : Ze(a);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || Se in e)
    return e;
  const t = mt(e);
  if (t !== br && t !== wr)
    return e;
  var r = /* @__PURE__ */ new Map(), n = Et(e), i = /* @__PURE__ */ $(0), s = le, o = (f) => {
    if (le === s)
      return f();
    var u = g, l = le;
    I(null), dt(s);
    var a = f();
    return I(u), dt(l), a;
  };
  return n && r.set("length", /* @__PURE__ */ $(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Or();
        var a = r.get(u);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ $(l.value);
          return r.set(u, h), h;
        }) : j(a, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = r.get(u);
        if (l === void 0) {
          if (u in f) {
            const a = o(() => /* @__PURE__ */ $(A));
            r.set(u, a), ke(i);
          }
        } else
          j(l, A), ke(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Se)
          return e;
        var a = r.get(u), h = u in f;
        if (a === void 0 && (!h || Ae(f, u)?.writable) && (a = o(() => {
          var v = de(h ? f[u] : A), d = /* @__PURE__ */ $(v);
          return d;
        }), r.set(u, a)), a !== void 0) {
          var c = Y(a);
          return c === A ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var a = r.get(u);
          a && (l.value = Y(a));
        } else if (l === void 0) {
          var h = r.get(u), c = h?.v;
          if (h !== void 0 && c !== A)
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
        if (u === Se)
          return !0;
        var l = r.get(u), a = l !== void 0 && l.v !== A || Reflect.has(f, u);
        if (l !== void 0 || b !== null && (!a || Ae(f, u)?.writable)) {
          l === void 0 && (l = o(() => {
            var c = a ? de(f[u]) : A, v = /* @__PURE__ */ $(c);
            return v;
          }), r.set(u, l));
          var h = Y(l);
          if (h === A)
            return !1;
        }
        return a;
      },
      set(f, u, l, a) {
        var h = r.get(u), c = u in f;
        if (n && u === "length")
          for (var v = l; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = r.get(v + "");
            d !== void 0 ? j(d, A) : v in f && (d = o(() => /* @__PURE__ */ $(A)), r.set(v + "", d));
          }
        if (h === void 0)
          (!c || Ae(f, u)?.writable) && (h = o(() => /* @__PURE__ */ $(void 0)), j(h, de(l)), r.set(u, h));
        else {
          c = h.v !== A;
          var p = o(() => de(l));
          j(h, p);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(a, l), !c) {
          if (n && typeof u == "string") {
            var _ = (
              /** @type {Source<number>} */
              r.get("length")
            ), G = Number(u);
            Number.isInteger(G) && G >= _.v && j(_, G + 1);
          }
          ke(i);
        }
        return !0;
      },
      ownKeys(f) {
        Y(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = r.get(h);
          return c === void 0 || c.v !== A;
        });
        for (var [l, a] of r)
          a.v !== A && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        Nr();
      }
    }
  );
}
function ut(e) {
  try {
    if (e !== null && typeof e == "object" && Se in e)
      return e[Se];
  } catch {
  }
  return e;
}
function Jr(e, t) {
  return Object.is(ut(e), ut(t));
}
var ot, Ut, $t, Bt;
function Qr() {
  if (ot === void 0) {
    ot = window, Ut = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    $t = Ae(t, "firstChild").get, Bt = Ae(t, "nextSibling").get, nt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), nt(r) && (r.__t = void 0);
  }
}
function qt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
  return (
    /** @type {TemplateNode | null} */
    $t.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Qe(e) {
  return (
    /** @type {TemplateNode | null} */
    Bt.call(e)
  );
}
function at(e, t) {
  return /* @__PURE__ */ zt(e);
}
function ct(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ Qe(n);
  return n;
}
function en(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(St, e, void 0)
  );
}
function tn(e, t) {
  if (t) {
    const r = document.body;
    e.autofocus = !0, te(() => {
      document.activeElement === r && e.focus();
    });
  }
}
function et(e) {
  var t = g, r = b;
  I(null), z(null);
  try {
    return e();
  } finally {
    I(t), z(r);
  }
}
function rn(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function H(e, t) {
  var r = b;
  r !== null && (r.f & Q) !== 0 && (e |= Q);
  var n = {
    ctx: U,
    deps: null,
    nodes: null,
    f: e | R | D,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, i = n;
  if ((e & _e) !== 0)
    he !== null ? he.push(n) : oe.ensure().schedule(n);
  else if (t !== null) {
    try {
      be(n);
    } catch (o) {
      throw P(n), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ye) === 0 && (i = i.first, (e & ie) !== 0 && (e & xe) !== 0 && i !== null && (i.f |= xe));
  }
  if (i !== null && (i.parent = r, r !== null && rn(i, r), g !== null && (g.f & k) !== 0 && (e & fe) === 0)) {
    var s = (
      /** @type {Derived} */
      g
    );
    (s.effects ??= []).push(i);
  }
  return n;
}
function tt() {
  return g !== null && !V;
}
function Ht(e) {
  const t = H(Ie, null);
  return T(t, S), t.teardown = e, t;
}
function nn(e) {
  return H(_e | Tr, e);
}
function sn(e) {
  oe.ensure();
  const t = H(fe | ye, e);
  return (r = {}) => new Promise((n) => {
    r.outro ? Me(t, () => {
      P(t), n(void 0);
    }) : (P(t), n(void 0));
  });
}
function Gt(e) {
  return H(_e, e);
}
function ln(e) {
  return H(We | ye, e);
}
function fn(e, t = 0) {
  return H(Ie | t, e);
}
function un(e, t = [], r = [], n = []) {
  Lt(n, t, r, (i) => {
    H(Ie, () => e(...i.map(Y)));
  });
}
function on(e, t = 0) {
  var r = H(ie | t, e);
  return r;
}
function Kt(e, t = 0) {
  var r = H(Ke | t, e);
  return r;
}
function W(e) {
  return H(ne | ye, e);
}
function Wt(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = ge, n = g;
    ht(!0), I(null);
    try {
      t.call(null);
    } finally {
      ht(r), I(n);
    }
  }
}
function rt(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && et(() => {
      i.abort(X);
    });
    var n = r.next;
    (r.f & fe) !== 0 ? r.parent = null : P(r, t), r = n;
  }
}
function an(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ne) === 0 && P(t), t = r;
  }
}
function P(e, t = !0) {
  var r = !1;
  (t || (e.f & mr) !== 0) && e.nodes !== null && e.nodes.end !== null && (cn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), T(e, it), rt(e, t && !r), Oe(e, 0);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  Wt(e), e.f ^= it, e.f |= B;
  var i = e.parent;
  i !== null && i.first !== null && Xt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function cn(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ Qe(e);
    e.remove(), e = r;
  }
}
function Xt(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Me(e, t, r = !0) {
  var n = [];
  Zt(e, n, !0);
  var i = () => {
    r && P(e), t && t();
  }, s = n.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var f of n)
      f.out(o);
  } else
    i();
}
function Zt(e, t, r) {
  if ((e.f & Q) === 0) {
    e.f ^= Q;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const f of n)
        (f.is_global || r) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & xe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & ne) !== 0 && (e.f & ie) !== 0;
      Zt(i, t, o ? r : !1), i = s;
    }
  }
}
function hn(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var i = r === n ? null : /* @__PURE__ */ Qe(r);
      t.append(r), r = i;
    }
}
let Pe = !1, ge = !1;
function ht(e) {
  ge = e;
}
let g = null, V = !1;
function I(e) {
  g = e;
}
let b = null;
function z(e) {
  b = e;
}
let L = null;
function dn(e) {
  g !== null && (L === null ? L = [e] : L.push(e));
}
let N = null, M = 0, x = null;
function vn(e) {
  x = e;
}
let Jt = 1, se = 0, le = se;
function dt(e) {
  le = e;
}
function Qt() {
  return ++Jt;
}
function Ne(e) {
  var t = e.f;
  if ((t & R) !== 0)
    return !0;
  if (t & k && (e.f &= ~ue), (t & q) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, i = 0; i < n; i++) {
      var s = r[i];
      if (Ne(
        /** @type {Derived} */
        s
      ) && jt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && T(e, S);
  }
  return !1;
}
function er(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(L !== null && ve.call(L, e)))
    for (var i = 0; i < n.length; i++) {
      var s = n[i];
      (s.f & k) !== 0 ? er(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? T(s, R) : (s.f & S) !== 0 && T(s, q), Ze(
        /** @type {Effect} */
        s
      ));
    }
}
function tr(e) {
  var t = N, r = M, n = x, i = g, s = L, o = U, f = V, u = le, l = e.f;
  N = /** @type {null | Value[]} */
  null, M = 0, x = null, g = (l & (ne | fe)) === 0 ? e : null, L = null, pe(e.ctx), V = !1, le = ++se, e.ac !== null && (et(() => {
    e.ac.abort(X);
  }), e.ac = null);
  try {
    e.f |= $e;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= we;
    var c = e.deps, v = m?.is_fork;
    if (N !== null) {
      var d;
      if (v || Oe(e, M), c !== null && M > 0)
        for (c.length = M + N.length, d = 0; d < N.length; d++)
          c[M + d] = N[d];
      else
        e.deps = c = N;
      if (tt() && (e.f & D) !== 0)
        for (d = M; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && M < c.length && (Oe(e, M), c.length = M);
    if (Ot() && x !== null && !V && c !== null && (e.f & (k | q | R)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      x.length; d++)
        er(
          x[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (se++, i.deps !== null)
        for (let p = 0; p < r; p += 1)
          i.deps[p].rv = se;
      if (t !== null)
        for (const p of t)
          p.rv = se;
      x !== null && (n === null ? n = x : n.push(.../** @type {Source[]} */
      x));
    }
    return (e.f & ee) !== 0 && (e.f ^= ee), h;
  } catch (p) {
    return Nt(p);
  } finally {
    e.f ^= $e, N = t, M = r, x = n, g = i, L = s, pe(o), V = f, le = u;
  }
}
function _n(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = vr.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  if (r === null && (t.f & k) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (N === null || !ve.call(N, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~ue), Xe(s), Xr(s), Oe(s, 0);
  }
}
function Oe(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      _n(e, r[n]);
}
function be(e) {
  var t = e.f;
  if ((t & B) === 0) {
    T(e, S);
    var r = b, n = Pe;
    b = e, Pe = !0;
    try {
      (t & (ie | Ke)) !== 0 ? an(e) : rt(e), Wt(e);
      var i = tr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var s;
    } finally {
      Pe = n, b = r;
    }
  }
}
function Y(e) {
  var t = e.f, r = (t & k) !== 0;
  if (g !== null && !V) {
    var n = b !== null && (b.f & B) !== 0;
    if (!n && (L === null || !ve.call(L, e))) {
      var i = g.deps;
      if ((g.f & $e) !== 0)
        e.rv < se && (e.rv = se, N === null && i !== null && i[M] === e ? M++ : N === null ? N = [e] : N.push(e));
      else {
        (g.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [g] : ve.call(s, g) || s.push(g);
      }
    }
  }
  if (ge && re.has(e))
    return re.get(e);
  if (r) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ge) {
      var f = o.v;
      return ((o.f & S) === 0 && o.reactions !== null || nr(o)) && (f = Je(o)), re.set(o, f), f;
    }
    var u = (o.f & D) === 0 && !V && g !== null && (Pe || (g.f & D) !== 0), l = (o.f & we) === 0;
    Ne(o) && (u && (o.f |= D), jt(o)), u && !l && (Ft(o), rr(o));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function rr(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & k) !== 0 && (t.f & D) === 0 && (Ft(
        /** @type {Derived} */
        t
      ), rr(
        /** @type {Derived} */
        t
      ));
}
function nr(e) {
  if (e.v === A) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (re.has(t) || (t.f & k) !== 0 && nr(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function pn(e) {
  var t = V;
  try {
    return V = !0, e();
  } finally {
    V = t;
  }
}
const vt = globalThis.Deno?.core?.ops ?? null;
function gn(e, ...t) {
  vt?.[e] ? vt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function bn(e, t) {
  gn("op_set_text", e, t);
}
function wn(e) {
  return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
const yn = [
  "beforeinput",
  "click",
  "change",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
];
function En(e) {
  return yn.includes(e);
}
const mn = {
  // no `class: 'className'` because we handle that separately
  formnovalidate: "formNoValidate",
  ismap: "isMap",
  nomodule: "noModule",
  playsinline: "playsInline",
  readonly: "readOnly",
  defaultvalue: "defaultValue",
  defaultchecked: "defaultChecked",
  srcobject: "srcObject",
  novalidate: "noValidate",
  allowfullscreen: "allowFullscreen",
  disablepictureinpicture: "disablePictureInPicture",
  disableremoteplayback: "disableRemotePlayback"
};
function Tn(e) {
  return e = e.toLowerCase(), mn[e] ?? e;
}
const An = ["touchstart", "touchmove"];
function Sn(e) {
  return An.includes(e);
}
const Te = Symbol("events"), ir = /* @__PURE__ */ new Set(), ze = /* @__PURE__ */ new Set();
function kn(e, t, r, n = {}) {
  function i(s) {
    if (n.capture || He.call(t, s), !s.cancelBubble)
      return et(() => r?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? te(() => {
    t.addEventListener(e, i, n);
  }) : t.addEventListener(e, i, n), i;
}
function sr(e, t, r) {
  (t[Te] ??= {})[e] = r;
}
function lr(e) {
  for (var t = 0; t < e.length; t++)
    ir.add(e[t]);
  for (var r of ze)
    r(e);
}
let _t = null;
function He(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  _t = e;
  var o = 0, f = _t === e && e[Te];
  if (f) {
    var u = i.indexOf(f);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Te] = t;
      return;
    }
    var l = i.indexOf(t);
    if (l === -1)
      return;
    u <= l && (o = u);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    pr(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var a = g, h = b;
    I(null), z(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var p = s[Te]?.[n];
          p != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && p.call(s, e);
        } catch (y) {
          c ? v.push(y) : c = y;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let y of v)
          queueMicrotask(() => {
            throw y;
          });
        throw c;
      }
    } finally {
      e[Te] = t, delete e.currentTarget, I(a), z(h);
    }
  }
}
const On = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Nn(e) {
  return (
    /** @type {string} */
    On?.createHTML(e) ?? e
  );
}
function Rn(e) {
  var t = en("template");
  return t.innerHTML = Nn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Cn(e, t) {
  var r = (
    /** @type {Effect} */
    b
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Mn(e, t) {
  var r = (t & Mr) !== 0, n, i = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Rn(i ? e : "<!>" + e), n = /** @type {TemplateNode} */
    /* @__PURE__ */ zt(n));
    var s = (
      /** @type {TemplateNode} */
      r || Ut ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    return Cn(s, s), s;
  };
}
function Pn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function xn(e, t) {
  return Dn(e, t);
}
const Re = /* @__PURE__ */ new Map();
function Dn(e, { target: t, anchor: r, props: n = {}, events: i, context: s, intro: o = !0, transformError: f }) {
  Qr();
  var u = void 0, l = sn(() => {
    var a = r ?? t.appendChild(qt());
    Br(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (v) => {
        Lr({});
        var d = (
          /** @type {ComponentContext} */
          U
        );
        s && (d.c = s), i && (n.$$events = i), u = e(v, n) || {}, Ir();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var p = v[d];
        if (!h.has(p)) {
          h.add(p);
          var y = Sn(p);
          for (const w of [t, document]) {
            var _ = Re.get(w);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), Re.set(w, _));
            var G = _.get(p);
            G === void 0 ? (w.addEventListener(p, He, { passive: y }), _.set(p, 1)) : _.set(p, G + 1);
          }
        }
      }
    };
    return c(_r(ir)), ze.add(c), () => {
      for (var v of h)
        for (const y of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Re.get(y)
          ), p = (
            /** @type {number} */
            d.get(v)
          );
          --p == 0 ? (y.removeEventListener(v, He), d.delete(v), d.size === 0 && Re.delete(y)) : d.set(v, p);
        }
      ze.delete(c), a !== r && a.parentNode?.removeChild(a);
    };
  });
  return Ln.set(u, l), u;
}
let Ln = /* @__PURE__ */ new WeakMap();
function In(e, t) {
  var r = void 0, n;
  Kt(() => {
    r !== (r = t()) && (n && (P(n), n = null), r && (n = W(() => {
      Gt(() => (
        /** @type {(node: Element) => void} */
        r(e)
      ));
    })));
  });
}
function fr(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (r = fr(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function jn() {
  for (var e, t, r = 0, n = "", i = arguments.length; r < i; r++) (e = arguments[r]) && (t = fr(e)) && (n && (n += " "), n += t);
  return n;
}
function Fn(e) {
  return typeof e == "object" ? jn(e) : e ?? "";
}
const pt = [...` 	
\r\f \v\uFEFF`];
function Vn(e, t, r) {
  var n = e == null ? "" : "" + e;
  if (r) {
    for (var i of Object.keys(r))
      if (r[i])
        n = n ? n + " " + i : i;
      else if (n.length)
        for (var s = i.length, o = 0; (o = n.indexOf(i, o)) >= 0; ) {
          var f = o + s;
          (o === 0 || pt.includes(n[o - 1])) && (f === n.length || pt.includes(n[f])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(f + 1) : o = f;
        }
  }
  return n === "" ? null : n;
}
function gt(e, t = !1) {
  var r = t ? " !important;" : ";", n = "";
  for (var i of Object.keys(e)) {
    var s = e[i];
    s != null && s !== "" && (n += " " + i + ": " + s + r);
  }
  return n;
}
function Ve(e) {
  return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Yn(e, t) {
  if (t) {
    var r = "", n, i;
    if (Array.isArray(t) ? (n = t[0], i = t[1]) : n = t, e) {
      e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var s = !1, o = 0, f = !1, u = [];
      n && u.push(...Object.keys(n).map(Ve)), i && u.push(...Object.keys(i).map(Ve));
      var l = 0, a = -1;
      const p = e.length;
      for (var h = 0; h < p; h++) {
        var c = e[h];
        if (f ? c === "/" && e[h - 1] === "*" && (f = !1) : s ? s === c && (s = !1) : c === "/" && e[h + 1] === "*" ? f = !0 : c === '"' || c === "'" ? s = c : c === "(" ? o++ : c === ")" && o--, !f && s === !1 && o === 0) {
          if (c === ":" && a === -1)
            a = h;
          else if (c === ";" || h === p - 1) {
            if (a !== -1) {
              var v = Ve(e.substring(l, a).trim());
              if (!u.includes(v)) {
                c !== ";" && h++;
                var d = e.substring(l, h).trim();
                r += " " + d + ";";
              }
            }
            l = h + 1, a = -1;
          }
        }
      }
    }
    return n && (r += gt(n)), i && (r += gt(i, !0)), r = r.trim(), r === "" ? null : r;
  }
  return e == null ? null : String(e);
}
function Un(e, t, r, n, i, s) {
  var o = e.__className;
  if (o !== r || o === void 0) {
    var f = Vn(r, n, s);
    f == null ? e.removeAttribute("class") : t ? e.className = f : e.setAttribute("class", f), e.__className = r;
  } else if (s && i !== s)
    for (var u in s) {
      var l = !!s[u];
      (i == null || l !== !!i[u]) && e.classList.toggle(u, l);
    }
  return s;
}
function Ye(e, t = {}, r, n) {
  for (var i in r) {
    var s = r[i];
    t[i] !== s && (r[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, s, n));
  }
}
function $n(e, t, r, n) {
  var i = e.__style;
  if (i !== t) {
    var s = Yn(t, n);
    s == null ? e.removeAttribute("style") : e.style.cssText = s, e.__style = t;
  } else n && (Array.isArray(n) ? (Ye(e, r?.[0], n[0]), Ye(e, r?.[1], n[1], "important")) : Ye(e, r, n));
  return n;
}
function Ge(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Et(t))
      return xr();
    for (var n of e.options)
      n.selected = t.includes(bt(n));
    return;
  }
  for (n of e.options) {
    var i = bt(n);
    if (Jr(i, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Bn(e) {
  var t = new MutationObserver(() => {
    Ge(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Ht(() => {
    t.disconnect();
  });
}
function bt(e) {
  return "__value" in e ? e.__value : e.value;
}
const Ee = Symbol("class"), me = Symbol("style"), ur = Symbol("is custom element"), or = Symbol("is html"), qn = At ? "option" : "OPTION", zn = At ? "select" : "SELECT";
function Hn(e, t) {
  t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function wt(e, t, r, n) {
  var i = ar(e);
  i[t] !== (i[t] = r) && (t === "loading" && (e[Ar] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && cr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Gn(e, t, r, n, i = !1, s = !1) {
  var o = ar(e), f = o[ur], u = !o[or], l = t || {}, a = e.nodeName === qn;
  for (var h in t)
    h in r || (r[h] = null);
  r.class ? r.class = Fn(r.class) : r[Ee] && (r.class = null), r[me] && (r.style ??= null);
  var c = cr(e);
  for (const w in r) {
    let E = r[w];
    if (a && w === "value" && E == null) {
      e.value = e.__value = "", l[w] = E;
      continue;
    }
    if (w === "class") {
      var v = e.namespaceURI === "http://www.w3.org/1999/xhtml";
      Un(e, v, E, n, t?.[Ee], r[Ee]), l[w] = E, l[Ee] = r[Ee];
      continue;
    }
    if (w === "style") {
      $n(e, E, t?.[me], r[me]), l[w] = E, l[me] = r[me];
      continue;
    }
    var d = l[w];
    if (!(E === d && !(E === void 0 && e.hasAttribute(w)))) {
      l[w] = E;
      var p = w[0] + w[1];
      if (p !== "$$")
        if (p === "on") {
          const C = {}, ae = "$$" + w;
          let O = w.slice(2);
          var y = En(O);
          if (wn(O) && (O = O.slice(0, -7), C.capture = !0), !y && d) {
            if (E != null) continue;
            e.removeEventListener(O, l[ae], C), l[ae] = null;
          }
          if (y)
            sr(O, e, E), lr([O]);
          else if (E != null) {
            let hr = function(dr) {
              l[w].call(this, dr);
            };
            l[ae] = kn(O, e, hr, C);
          }
        } else if (w === "style")
          wt(e, w, E);
        else if (w === "autofocus")
          tn(
            /** @type {HTMLElement} */
            e,
            !!E
          );
        else if (!f && (w === "__value" || w === "value" && E != null))
          e.value = e.__value = E;
        else if (w === "selected" && a)
          Hn(
            /** @type {HTMLOptionElement} */
            e,
            E
          );
        else {
          var _ = w;
          u || (_ = Tn(_));
          var G = _ === "defaultValue" || _ === "defaultChecked";
          if (E == null && !f && !G)
            if (o[w] = null, _ === "value" || _ === "checked") {
              let C = (
                /** @type {HTMLInputElement} */
                e
              );
              const ae = t === void 0;
              if (_ === "value") {
                let O = C.defaultValue;
                C.removeAttribute(_), C.defaultValue = O, C.value = C.__value = ae ? O : null;
              } else {
                let O = C.defaultChecked;
                C.removeAttribute(_), C.defaultChecked = O, C.checked = ae ? O : !1;
              }
            } else
              e.removeAttribute(w);
          else G || c.includes(_) && (f || typeof E != "string") ? (e[_] = E, _ in o && (o[_] = A)) : typeof E != "function" && wt(e, _, E);
        }
    }
  }
  return l;
}
function Kn(e, t, r = [], n = [], i = [], s, o = !1, f = !1) {
  Lt(i, r, n, (u) => {
    var l = void 0, a = {}, h = e.nodeName === zn, c = !1;
    if (Kt(() => {
      var d = t(...u.map(Y)), p = Gn(
        e,
        l,
        d,
        s,
        o,
        f
      );
      c && h && "value" in d && Ge(
        /** @type {HTMLSelectElement} */
        e,
        d.value
      );
      for (let _ of Object.getOwnPropertySymbols(a))
        d[_] || P(a[_]);
      for (let _ of Object.getOwnPropertySymbols(d)) {
        var y = d[_];
        _.description === Pr && (!l || y !== l[_]) && (a[_] && P(a[_]), a[_] = W(() => In(e, () => y))), p[_] = y;
      }
      l = p;
    }), h) {
      var v = (
        /** @type {HTMLSelectElement} */
        e
      );
      Gt(() => {
        Ge(
          v,
          /** @type {Record<string | symbol, any>} */
          l.value,
          !0
        ), Bn(v);
      });
    }
    c = !0;
  });
}
function ar(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [ur]: e.nodeName.includes("-"),
      [or]: e.namespaceURI === St
    }
  );
}
var yt = /* @__PURE__ */ new Map();
function cr(e) {
  var t = e.getAttribute("is") || e.nodeName, r = yt.get(t);
  if (r) return r;
  yt.set(t, r = []);
  for (var n, i = e, s = Element.prototype; s !== i; ) {
    n = gr(i);
    for (var o in n)
      n[o].set && r.push(o);
    i = mt(i);
  }
  return r;
}
var Wn = /* @__PURE__ */ Mn("<div><span>Content</span> <div> </div> <button>Toggle</button></div>");
function Xn(e) {
  let t = /* @__PURE__ */ $("light"), r = /* @__PURE__ */ $(de({ "data-theme": "light", title: "Light mode" }));
  function n() {
    Y(t) === "light" ? (j(t, "dark"), j(r, { "data-theme": "dark", title: "Dark mode" }, !0)) : (j(t, "light"), j(r, { "data-theme": "light", title: "Light mode" }, !0));
  }
  var i = Wn(), s = at(i);
  Kn(s, () => ({ ...Y(r) }));
  var o = ct(s, 2), f = at(o), u = ct(o, 2);
  un(() => bn(f, `Theme: ${Y(t) ?? ""}`)), sr("click", u, n), Pn(e, i);
}
lr(["click"]);
function Jn(e) {
  return xn(Xn, { target: e });
}
export {
  Jn as default,
  Jn as rvst_mount
};

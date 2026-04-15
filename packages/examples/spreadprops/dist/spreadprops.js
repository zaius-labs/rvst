var yt = Array.isArray, _r = Array.prototype.indexOf, de = Array.prototype.includes, pr = Array.from, gr = Object.defineProperty, Ae = Object.getOwnPropertyDescriptor, br = Object.getOwnPropertyDescriptors, wr = Object.prototype, yr = Array.prototype, Et = Object.getPrototypeOf, it = Object.isExtensible;
const Er = () => {
};
function mr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function mt() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
const O = 2, ve = 4, Le = 8, We = 1 << 24, ie = 16, ne = 32, fe = 64, Ye = 128, D = 512, S = 1024, R = 2048, B = 4096, Q = 8192, Y = 16384, be = 32768, st = 1 << 25, Me = 65536, lt = 1 << 17, Tr = 1 << 18, we = 1 << 19, Ar = 1 << 20, ue = 65536, Be = 1 << 21, Xe = 1 << 22, ee = 1 << 23, Se = Symbol("$state"), Sr = Symbol(""), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Tt = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function Or() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function kr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Nr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Rr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Cr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const Pr = 2, A = Symbol(), At = "http://www.w3.org/1999/xhtml", Mr = "@attach";
function Dr() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ir() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function St(e) {
  return e === this.v;
}
let $ = null;
function _e(e) {
  $ = e;
}
function Lr(e, t = !1, r) {
  $ = {
    p: $,
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
function jr(e) {
  var t = (
    /** @type {ComponentContext} */
    $
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      fn(n);
  }
  return t.i = !0, $ = t.p, /** @type {T} */
  {};
}
function Ot() {
  return !0;
}
let ce = [];
function Fr() {
  var e = ce;
  ce = [], mr(e);
}
function te(e) {
  if (ce.length === 0) {
    var t = ce;
    queueMicrotask(() => {
      t === ce && Fr();
    });
  }
  ce.push(e);
}
function kt(e) {
  var t = b;
  if (t === null)
    return g.f |= ee, e;
  if ((t.f & be) === 0 && (t.f & ve) === 0)
    throw e;
  J(e, t);
}
function J(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ye) !== 0) {
      if ((t.f & be) === 0)
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
const $r = -7169;
function T(e, t) {
  e.f = e.f & $r | t;
}
function Ze(e) {
  (e.f & D) !== 0 || e.deps === null ? T(e, S) : T(e, B);
}
function Nt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & O) === 0 || (t.f & ue) === 0 || (t.f ^= ue, Nt(
        /** @type {Derived} */
        t.deps
      ));
}
function Rt(e, t, r) {
  (e.f & R) !== 0 ? t.add(e) : (e.f & B) !== 0 && r.add(e), Nt(e.deps), T(e, S);
}
const X = /* @__PURE__ */ new Set();
let m = null, j = null, Ue = null, Fe = !1, he = null, xe = null;
var ft = 0;
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
        T(n, B), this.schedule(n);
    }
  }
  #h() {
    if (ft++ > 1e3 && (X.delete(this), Yr()), !this.#c()) {
      for (const f of this.#t)
        this.#r.delete(f), T(f, R), this.schedule(f);
      for (const f of this.#r)
        T(f, B), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var r = he = [], n = [], i = xe = [];
    for (const f of t)
      try {
        this.#o(f, r, n);
      } catch (u) {
        throw Mt(f), u;
      }
    if (m = null, i.length > 0) {
      var s = oe.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (he = null, xe = null, this.#c() || this.#v()) {
      this.#_(n), this.#_(r);
      for (const [f, u] of this.#s)
        Pt(f, u);
    } else {
      this.#n.size === 0 && X.delete(this), this.#t.clear(), this.#r.clear();
      for (const f of this.#l) f(this);
      this.#l.clear(), ut(n), ut(r), this.#i?.resolve();
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
    o !== null && (X.add(o), o.#h()), X.has(this) || this.#b();
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
        o ? i.f ^= S : (s & ve) !== 0 ? r.push(i) : Ne(i) && ((s & ie) !== 0 && this.#r.add(i), ge(i));
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
      Rt(t[r], this.#t, this.#r);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, r, n = !1) {
    r !== A && !this.previous.has(t) && this.previous.set(t, r), (t.f & ee) === 0 && (this.current.set(t, [t.v, n]), j?.set(t, t.v));
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, j = null;
  }
  flush() {
    try {
      Fe = !0, m = this, this.#h();
    } finally {
      ft = 0, Ue = null, he = null, xe = null, Fe = !1, m = null, j = null, re.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), X.delete(this);
  }
  #b() {
    for (const l of X) {
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
          xt(f, i, s, o);
        if (l.#e.length > 0) {
          l.apply();
          for (var u of l.#e)
            l.#o(u, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
    for (const l of X)
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
    return (this.#i ??= mt()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new oe();
      Fe || (X.add(m), te(() => {
        m === t && t.flush();
      }));
    }
    return m;
  }
  apply() {
    {
      j = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ue = t, t.b?.is_pending && (t.f & (ve | Le | We)) !== 0 && (t.f & be) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var r = t; r.parent !== null; ) {
      r = r.parent;
      var n = r.f;
      if (he !== null && r === b && (g === null || (g.f & O) === 0))
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
    J(e, Ue);
  }
}
let G = null;
function ut(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (Y | Q)) === 0 && Ne(n) && (G = /* @__PURE__ */ new Set(), ge(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && Xt(n), G?.size > 0)) {
        re.clear();
        for (const i of G) {
          if ((i.f & (Y | Q)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), s.push(o)), o = o.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const u = s[f];
            (u.f & (Y | Q)) === 0 && ge(u);
          }
        }
        G.clear();
      }
    }
    G = null;
  }
}
function xt(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & O) !== 0 ? xt(
        /** @type {Derived} */
        i,
        t,
        r,
        n
      ) : (s & (Xe | ie)) !== 0 && (s & R) === 0 && Ct(i, t, n) && (T(i, R), Je(
        /** @type {Effect} */
        i
      ));
    }
}
function Ct(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (de.call(t, i))
        return !0;
      if ((i.f & O) !== 0 && Ct(
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
function Je(e) {
  m.schedule(e);
}
function Pt(e, t) {
  if (!((e.f & ne) !== 0 && (e.f & S) !== 0)) {
    (e.f & R) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), T(e, S);
    for (var r = e.first; r !== null; )
      Pt(r, t), r = r.next;
  }
}
function Mt(e) {
  T(e, S);
  for (var t = e.first; t !== null; )
    Mt(t), t = t.next;
}
function Br(e) {
  let t = 0, r = je(0), n;
  return () => {
    rt() && (V(r), an(() => (t === 0 && (n = bn(() => e(() => Oe(r)))), t += 1, () => {
      te(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, Oe(r));
      });
    })));
  };
}
var Ur = Me | we;
function qr(e, t, r, n) {
  new zr(e, t, r, n);
}
class zr {
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
  #_ = Br(() => (this.#o = je(this.#a), () => {
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
      o.b = this, o.f |= Ye, n(s);
    }, this.parent = /** @type {Effect} */
    b.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = cn(() => {
      this.#w();
    }, Ur);
  }
  #b() {
    try {
      this.#e = K(() => this.#f(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #E(t) {
    const r = this.#n.failed;
    r && (this.#r = K(() => {
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
    t && (this.is_pending = !0, this.#t = K(() => t(this.#l)), te(() => {
      var r = this.#s = document.createDocumentFragment(), n = Ut();
      r.append(n), this.#e = this.#g(() => K(() => this.#f(n))), this.#u === 0 && (this.#l.before(r), this.#s = null, Ce(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = K(() => {
        this.#f(this.#l);
      }), this.#u > 0) {
        var t = this.#s = document.createDocumentFragment();
        vn(this.#e, t);
        const r = (
          /** @type {(anchor: Node) => void} */
          this.#n.pending
        );
        this.#t = K(() => r(this.#l));
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
    Rt(t, this.#v, this.#h);
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
    var r = b, n = g, i = $;
    U(this.#i), L(this.#i), _e(this.#i.ctx);
    try {
      return oe.ensure(), t();
    } catch (s) {
      return kt(s), null;
    } finally {
      U(r), L(n), _e(i);
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
    this.#u += t, this.#u === 0 && (this.#p(r), this.#t && Ce(this.#t, () => {
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
      this.#c = !1, this.#o && Ie(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), V(
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
        Ir();
        return;
      }
      i = !0, s && Cr(), this.#r !== null && Ce(this.#r, () => {
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
          return K(() => {
            var l = (
              /** @type {Effect} */
              b
            );
            l.b = this, l.f |= Ye, n(
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
function Dt(e, t, r, n) {
  const i = Gr;
  var s = e.filter((c) => !c.settled);
  if (r.length === 0 && s.length === 0) {
    n(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    b
  ), f = Hr(), u = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function l(c) {
    f();
    try {
      n(c);
    } catch (v) {
      (o.f & Y) === 0 && J(v, o);
    }
    De();
  }
  if (r.length === 0) {
    u.then(() => l(t.map(i)));
    return;
  }
  var a = It();
  function h() {
    Promise.all(r.map((c) => /* @__PURE__ */ Kr(c))).then((c) => l([...t.map(i), ...c])).catch((c) => J(c, o)).finally(() => a());
  }
  u ? u.then(() => {
    f(), h(), De();
  }) : h();
}
function Hr() {
  var e = (
    /** @type {Effect} */
    b
  ), t = g, r = $, n = (
    /** @type {Batch} */
    m
  );
  return function(s = !0) {
    U(e), L(t), _e(r), s && (e.f & Y) === 0 && (n?.activate(), n?.apply());
  };
}
function De(e = !0) {
  U(null), L(null), _e(null), e && m?.deactivate();
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
function Gr(e) {
  var t = O | R, r = g !== null && (g.f & O) !== 0 ? (
    /** @type {Derived} */
    g
  ) : null;
  return b !== null && (b.f |= we), {
    ctx: $,
    deps: null,
    effects: null,
    equals: St,
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
function Kr(e, t, r) {
  let n = (
    /** @type {Effect | null} */
    b
  );
  n === null && Or();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = je(
    /** @type {V} */
    A
  ), o = !g, f = /* @__PURE__ */ new Map();
  return on(() => {
    var u = (
      /** @type {Effect} */
      b
    ), l = mt();
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
      if ((u.f & be) !== 0)
        var h = It();
      if (
        /** @type {Boundary} */
        n.b.is_rendered()
      )
        f.get(a)?.reject(W), f.delete(a);
      else {
        for (const v of f.values())
          v.reject(W);
        f.clear();
      }
      f.set(a, l);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var p = d === W;
        h(p);
      }
      if (!(d === W || (u.f & Y) !== 0)) {
        if (a.activate(), d)
          s.f |= ee, Ie(s, d);
        else {
          (s.f & ee) !== 0 && (s.f ^= ee), Ie(s, v);
          for (const [y, _] of f) {
            if (f.delete(y), y === a) break;
            _.reject(W);
          }
        }
        a.deactivate();
      }
    };
    l.promise.then(c, (v) => c(null, v || "unknown"));
  }), zt(() => {
    for (const u of f.values())
      u.reject(W);
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
function Wr(e) {
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
function Xr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & O) === 0)
      return (t.f & Y) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Qe(e) {
  var t, r = b;
  U(Xr(e));
  try {
    e.f &= ~ue, Wr(e), t = tr(e);
  } finally {
    U(r);
  }
  return t;
}
function Lt(e) {
  var t = e.v, r = Qe(e);
  if (!e.equals(r) && (e.wv = Qt(), (!m?.is_fork || e.deps === null) && (e.v = r, m?.capture(e, t, !0), e.deps === null))) {
    T(e, S);
    return;
  }
  pe || (j !== null ? (rt() || m?.is_fork) && j.set(e, r) : Ze(e));
}
function Zr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = Er, t.ac = null, ke(t, 0), nt(t));
}
function jt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ge(t);
}
let qe = /* @__PURE__ */ new Set();
const re = /* @__PURE__ */ new Map();
let Ft = !1;
function je(e, t) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: St,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function H(e, t) {
  const r = je(e);
  return _n(r), r;
}
function Z(e, t, r = !1) {
  g !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!F || (g.f & lt) !== 0) && Ot() && (g.f & (O | ie | Xe | lt)) !== 0 && (I === null || !de.call(I, e)) && xr();
  let n = r ? me(t) : t;
  return Ie(e, n, xe);
}
function Ie(e, t, r = null) {
  if (!e.equals(t)) {
    var n = e.v;
    pe ? re.set(e, t) : re.set(e, n), e.v = t;
    var i = oe.ensure();
    if (i.capture(e, n), (e.f & O) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & R) !== 0 && Qe(s), j === null && Ze(s);
    }
    e.wv = Qt(), $t(e, R, r), b !== null && (b.f & S) !== 0 && (b.f & (ne | fe)) === 0 && (M === null ? pn([e]) : M.push(e)), !i.is_fork && qe.size > 0 && !Ft && Jr();
  }
  return t;
}
function Jr() {
  Ft = !1;
  for (const e of qe)
    (e.f & S) !== 0 && T(e, B), Ne(e) && ge(e);
  qe.clear();
}
function Qr(e, t = 1) {
  var r = V(e), n = t === 1 ? r++ : r--;
  return Z(e, r), n;
}
function Oe(e) {
  Z(e, e.v + 1);
}
function $t(e, t, r) {
  var n = e.reactions;
  if (n !== null)
    for (var i = n.length, s = 0; s < i; s++) {
      var o = n[s], f = o.f, u = (f & R) === 0;
      if (u && T(o, t), (f & O) !== 0) {
        var l = (
          /** @type {Derived} */
          o
        );
        j?.delete(l), (f & ue) === 0 && (f & D && (o.f |= ue), $t(l, B, r));
      } else if (u) {
        var a = (
          /** @type {Effect} */
          o
        );
        (f & ie) !== 0 && G !== null && G.add(a), r !== null ? r.push(a) : Je(a);
      }
    }
}
function me(e) {
  if (typeof e != "object" || e === null || Se in e)
    return e;
  const t = Et(e);
  if (t !== wr && t !== yr)
    return e;
  var r = /* @__PURE__ */ new Map(), n = yt(e), i = /* @__PURE__ */ H(0), s = le, o = (f) => {
    if (le === s)
      return f();
    var u = g, l = le;
    L(null), ht(s);
    var a = f();
    return L(u), ht(l), a;
  };
  return n && r.set("length", /* @__PURE__ */ H(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, u, l) {
        (!("value" in l) || l.configurable === !1 || l.enumerable === !1 || l.writable === !1) && Nr();
        var a = r.get(u);
        return a === void 0 ? o(() => {
          var h = /* @__PURE__ */ H(l.value);
          return r.set(u, h), h;
        }) : Z(a, l.value, !0), !0;
      },
      deleteProperty(f, u) {
        var l = r.get(u);
        if (l === void 0) {
          if (u in f) {
            const a = o(() => /* @__PURE__ */ H(A));
            r.set(u, a), Oe(i);
          }
        } else
          Z(l, A), Oe(i);
        return !0;
      },
      get(f, u, l) {
        if (u === Se)
          return e;
        var a = r.get(u), h = u in f;
        if (a === void 0 && (!h || Ae(f, u)?.writable) && (a = o(() => {
          var v = me(h ? f[u] : A), d = /* @__PURE__ */ H(v);
          return d;
        }), r.set(u, a)), a !== void 0) {
          var c = V(a);
          return c === A ? void 0 : c;
        }
        return Reflect.get(f, u, l);
      },
      getOwnPropertyDescriptor(f, u) {
        var l = Reflect.getOwnPropertyDescriptor(f, u);
        if (l && "value" in l) {
          var a = r.get(u);
          a && (l.value = V(a));
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
            var c = a ? me(f[u]) : A, v = /* @__PURE__ */ H(c);
            return v;
          }), r.set(u, l));
          var h = V(l);
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
            d !== void 0 ? Z(d, A) : v in f && (d = o(() => /* @__PURE__ */ H(A)), r.set(v + "", d));
          }
        if (h === void 0)
          (!c || Ae(f, u)?.writable) && (h = o(() => /* @__PURE__ */ H(void 0)), Z(h, me(l)), r.set(u, h));
        else {
          c = h.v !== A;
          var p = o(() => me(l));
          Z(h, p);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, u);
        if (y?.set && y.set.call(a, l), !c) {
          if (n && typeof u == "string") {
            var _ = (
              /** @type {Source<number>} */
              r.get("length")
            ), z = Number(u);
            Number.isInteger(z) && z >= _.v && Z(_, z + 1);
          }
          Oe(i);
        }
        return !0;
      },
      ownKeys(f) {
        V(i);
        var u = Reflect.ownKeys(f).filter((h) => {
          var c = r.get(h);
          return c === void 0 || c.v !== A;
        });
        for (var [l, a] of r)
          a.v !== A && !(l in f) && u.push(l);
        return u;
      },
      setPrototypeOf() {
        Rr();
      }
    }
  );
}
function ot(e) {
  try {
    if (e !== null && typeof e == "object" && Se in e)
      return e[Se];
  } catch {
  }
  return e;
}
function en(e, t) {
  return Object.is(ot(e), ot(t));
}
var at, Vt, Yt, Bt;
function tn() {
  if (at === void 0) {
    at = window, Vt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Yt = Ae(t, "firstChild").get, Bt = Ae(t, "nextSibling").get, it(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), it(r) && (r.__t = void 0);
  }
}
function Ut(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
  return (
    /** @type {TemplateNode | null} */
    Yt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function et(e) {
  return (
    /** @type {TemplateNode | null} */
    Bt.call(e)
  );
}
function ze(e, t) {
  return /* @__PURE__ */ qt(e);
}
function rn(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ et(n);
  return n;
}
function nn(e, t, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(At, e, void 0)
  );
}
function sn(e, t) {
  if (t) {
    const r = document.body;
    e.autofocus = !0, te(() => {
      document.activeElement === r && e.focus();
    });
  }
}
function tt(e) {
  var t = g, r = b;
  L(null), U(null);
  try {
    return e();
  } finally {
    L(t), U(r);
  }
}
function ln(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function q(e, t) {
  var r = b;
  r !== null && (r.f & Q) !== 0 && (e |= Q);
  var n = {
    ctx: $,
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
  if ((e & ve) !== 0)
    he !== null ? he.push(n) : oe.ensure().schedule(n);
  else if (t !== null) {
    try {
      ge(n);
    } catch (o) {
      throw P(n), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & we) === 0 && (i = i.first, (e & ie) !== 0 && (e & Me) !== 0 && i !== null && (i.f |= Me));
  }
  if (i !== null && (i.parent = r, r !== null && ln(i, r), g !== null && (g.f & O) !== 0 && (e & fe) === 0)) {
    var s = (
      /** @type {Derived} */
      g
    );
    (s.effects ??= []).push(i);
  }
  return n;
}
function rt() {
  return g !== null && !F;
}
function zt(e) {
  const t = q(Le, null);
  return T(t, S), t.teardown = e, t;
}
function fn(e) {
  return q(ve | Ar, e);
}
function un(e) {
  oe.ensure();
  const t = q(fe | we, e);
  return (r = {}) => new Promise((n) => {
    r.outro ? Ce(t, () => {
      P(t), n(void 0);
    }) : (P(t), n(void 0));
  });
}
function Ht(e) {
  return q(ve, e);
}
function on(e) {
  return q(Xe | we, e);
}
function an(e, t = 0) {
  return q(Le | t, e);
}
function Gt(e, t = [], r = [], n = []) {
  Dt(n, t, r, (i) => {
    q(Le, () => e(...i.map(V)));
  });
}
function cn(e, t = 0) {
  var r = q(ie | t, e);
  return r;
}
function Kt(e, t = 0) {
  var r = q(We | t, e);
  return r;
}
function K(e) {
  return q(ne | we, e);
}
function Wt(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = pe, n = g;
    ct(!0), L(null);
    try {
      t.call(null);
    } finally {
      ct(r), L(n);
    }
  }
}
function nt(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && tt(() => {
      i.abort(W);
    });
    var n = r.next;
    (r.f & fe) !== 0 ? r.parent = null : P(r, t), r = n;
  }
}
function hn(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & ne) === 0 && P(t), t = r;
  }
}
function P(e, t = !0) {
  var r = !1;
  (t || (e.f & Tr) !== 0) && e.nodes !== null && e.nodes.end !== null && (dn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), r = !0), T(e, st), nt(e, t && !r), ke(e, 0);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  Wt(e), e.f ^= st, e.f |= Y;
  var i = e.parent;
  i !== null && i.first !== null && Xt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function dn(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null : /* @__PURE__ */ et(e);
    e.remove(), e = r;
  }
}
function Xt(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function Ce(e, t, r = !0) {
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
      var s = i.next, o = (i.f & Me) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & ne) !== 0 && (e.f & ie) !== 0;
      Zt(i, t, o ? r : !1), i = s;
    }
  }
}
function vn(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var i = r === n ? null : /* @__PURE__ */ et(r);
      t.append(r), r = i;
    }
}
let Pe = !1, pe = !1;
function ct(e) {
  pe = e;
}
let g = null, F = !1;
function L(e) {
  g = e;
}
let b = null;
function U(e) {
  b = e;
}
let I = null;
function _n(e) {
  g !== null && (I === null ? I = [e] : I.push(e));
}
let N = null, C = 0, M = null;
function pn(e) {
  M = e;
}
let Jt = 1, se = 0, le = se;
function ht(e) {
  le = e;
}
function Qt() {
  return ++Jt;
}
function Ne(e) {
  var t = e.f;
  if ((t & R) !== 0)
    return !0;
  if (t & O && (e.f &= ~ue), (t & B) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      e.deps
    ), n = r.length, i = 0; i < n; i++) {
      var s = r[i];
      if (Ne(
        /** @type {Derived} */
        s
      ) && Lt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & D) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    j === null && T(e, S);
  }
  return !1;
}
function er(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(I !== null && de.call(I, e)))
    for (var i = 0; i < n.length; i++) {
      var s = n[i];
      (s.f & O) !== 0 ? er(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (r ? T(s, R) : (s.f & S) !== 0 && T(s, B), Je(
        /** @type {Effect} */
        s
      ));
    }
}
function tr(e) {
  var t = N, r = C, n = M, i = g, s = I, o = $, f = F, u = le, l = e.f;
  N = /** @type {null | Value[]} */
  null, C = 0, M = null, g = (l & (ne | fe)) === 0 ? e : null, I = null, _e(e.ctx), F = !1, le = ++se, e.ac !== null && (tt(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= Be;
    var a = (
      /** @type {Function} */
      e.fn
    ), h = a();
    e.f |= be;
    var c = e.deps, v = m?.is_fork;
    if (N !== null) {
      var d;
      if (v || ke(e, C), c !== null && C > 0)
        for (c.length = C + N.length, d = 0; d < N.length; d++)
          c[C + d] = N[d];
      else
        e.deps = c = N;
      if (rt() && (e.f & D) !== 0)
        for (d = C; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && C < c.length && (ke(e, C), c.length = C);
    if (Ot() && M !== null && !F && c !== null && (e.f & (O | B | R)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      M.length; d++)
        er(
          M[d],
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
      M !== null && (n === null ? n = M : n.push(.../** @type {Source[]} */
      M));
    }
    return (e.f & ee) !== 0 && (e.f ^= ee), h;
  } catch (p) {
    return kt(p);
  } finally {
    e.f ^= Be, N = t, C = r, M = n, g = i, I = s, _e(o), F = f, le = u;
  }
}
function gn(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = _r.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  if (r === null && (t.f & O) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (N === null || !de.call(N, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & D) !== 0 && (s.f ^= D, s.f &= ~ue), Ze(s), Zr(s), ke(s, 0);
  }
}
function ke(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      gn(e, r[n]);
}
function ge(e) {
  var t = e.f;
  if ((t & Y) === 0) {
    T(e, S);
    var r = b, n = Pe;
    b = e, Pe = !0;
    try {
      (t & (ie | We)) !== 0 ? hn(e) : nt(e), Wt(e);
      var i = tr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Jt;
      var s;
    } finally {
      Pe = n, b = r;
    }
  }
}
function V(e) {
  var t = e.f, r = (t & O) !== 0;
  if (g !== null && !F) {
    var n = b !== null && (b.f & Y) !== 0;
    if (!n && (I === null || !de.call(I, e))) {
      var i = g.deps;
      if ((g.f & Be) !== 0)
        e.rv < se && (e.rv = se, N === null && i !== null && i[C] === e ? C++ : N === null ? N = [e] : N.push(e));
      else {
        (g.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [g] : de.call(s, g) || s.push(g);
      }
    }
  }
  if (pe && re.has(e))
    return re.get(e);
  if (r) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (pe) {
      var f = o.v;
      return ((o.f & S) === 0 && o.reactions !== null || nr(o)) && (f = Qe(o)), re.set(o, f), f;
    }
    var u = (o.f & D) === 0 && !F && g !== null && (Pe || (g.f & D) !== 0), l = (o.f & be) === 0;
    Ne(o) && (u && (o.f |= D), Lt(o)), u && !l && (jt(o), rr(o));
  }
  if (j?.has(e))
    return j.get(e);
  if ((e.f & ee) !== 0)
    throw e.v;
  return e.v;
}
function rr(e) {
  if (e.f |= D, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & O) !== 0 && (t.f & D) === 0 && (jt(
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
    if (re.has(t) || (t.f & O) !== 0 && nr(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function bn(e) {
  var t = F;
  try {
    return F = !0, e();
  } finally {
    F = t;
  }
}
const dt = globalThis.Deno?.core?.ops ?? null;
function wn(e, ...t) {
  dt?.[e] ? dt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function ir(e, t) {
  wn("op_set_text", e, t);
}
function yn(e) {
  return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
const En = [
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
function mn(e) {
  return En.includes(e);
}
const Tn = {
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
function An(e) {
  return e = e.toLowerCase(), Tn[e] ?? e;
}
const Sn = ["touchstart", "touchmove"];
function On(e) {
  return Sn.includes(e);
}
const Te = Symbol("events"), sr = /* @__PURE__ */ new Set(), He = /* @__PURE__ */ new Set();
function kn(e, t, r, n = {}) {
  function i(s) {
    if (n.capture || Ge.call(t, s), !s.cancelBubble)
      return tt(() => r?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? te(() => {
    t.addEventListener(e, i, n);
  }) : t.addEventListener(e, i, n), i;
}
function Nn(e, t, r) {
  (t[Te] ??= {})[e] = r;
}
function Rn(e) {
  for (var t = 0; t < e.length; t++)
    sr.add(e[t]);
  for (var r of He)
    r(e);
}
let vt = null;
function Ge(e) {
  var t = this, r = (
    /** @type {Node} */
    t.ownerDocument
  ), n = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  vt = e;
  var o = 0, f = vt === e && e[Te];
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
    gr(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var a = g, h = b;
    L(null), U(null);
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
      e[Te] = t, delete e.currentTarget, L(a), U(h);
    }
  }
}
const xn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Cn(e) {
  return (
    /** @type {string} */
    xn?.createHTML(e) ?? e
  );
}
function Pn(e) {
  var t = nn("template");
  return t.innerHTML = Cn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Mn(e, t) {
  var r = (
    /** @type {Effect} */
    b
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function lr(e, t) {
  var r = (t & Pr) !== 0, n, i = !e.startsWith("<!>");
  return () => {
    n === void 0 && (n = Pn(i ? e : "<!>" + e), n = /** @type {TemplateNode} */
    /* @__PURE__ */ qt(n));
    var s = (
      /** @type {TemplateNode} */
      r || Vt ? document.importNode(n, !0) : n.cloneNode(!0)
    );
    return Mn(s, s), s;
  };
}
function fr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Dn(e, t) {
  return In(e, t);
}
const Re = /* @__PURE__ */ new Map();
function In(e, { target: t, anchor: r, props: n = {}, events: i, context: s, intro: o = !0, transformError: f }) {
  tn();
  var u = void 0, l = un(() => {
    var a = r ?? t.appendChild(Ut());
    qr(
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
          $
        );
        s && (d.c = s), i && (n.$$events = i), u = e(v, n) || {}, jr();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var p = v[d];
        if (!h.has(p)) {
          h.add(p);
          var y = On(p);
          for (const w of [t, document]) {
            var _ = Re.get(w);
            _ === void 0 && (_ = /* @__PURE__ */ new Map(), Re.set(w, _));
            var z = _.get(p);
            z === void 0 ? (w.addEventListener(p, Ge, { passive: y }), _.set(p, 1)) : _.set(p, z + 1);
          }
        }
      }
    };
    return c(pr(sr)), He.add(c), () => {
      for (var v of h)
        for (const y of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Re.get(y)
          ), p = (
            /** @type {number} */
            d.get(v)
          );
          --p == 0 ? (y.removeEventListener(v, Ge), d.delete(v), d.size === 0 && Re.delete(y)) : d.set(v, p);
        }
      He.delete(c), a !== r && a.parentNode?.removeChild(a);
    };
  });
  return Ln.set(u, l), u;
}
let Ln = /* @__PURE__ */ new WeakMap();
function jn(e, t) {
  var r = void 0, n;
  Kt(() => {
    r !== (r = t()) && (n && (P(n), n = null), r && (n = K(() => {
      Ht(() => (
        /** @type {(node: Element) => void} */
        r(e)
      ));
    })));
  });
}
function ur(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (r = ur(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function Fn() {
  for (var e, t, r = 0, n = "", i = arguments.length; r < i; r++) (e = arguments[r]) && (t = ur(e)) && (n && (n += " "), n += t);
  return n;
}
function $n(e) {
  return typeof e == "object" ? Fn(e) : e ?? "";
}
const _t = [...` 	
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
          (o === 0 || _t.includes(n[o - 1])) && (f === n.length || _t.includes(n[f])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(f + 1) : o = f;
        }
  }
  return n === "" ? null : n;
}
function pt(e, t = !1) {
  var r = t ? " !important;" : ";", n = "";
  for (var i of Object.keys(e)) {
    var s = e[i];
    s != null && s !== "" && (n += " " + i + ": " + s + r);
  }
  return n;
}
function $e(e) {
  return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Yn(e, t) {
  if (t) {
    var r = "", n, i;
    if (Array.isArray(t) ? (n = t[0], i = t[1]) : n = t, e) {
      e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var s = !1, o = 0, f = !1, u = [];
      n && u.push(...Object.keys(n).map($e)), i && u.push(...Object.keys(i).map($e));
      var l = 0, a = -1;
      const p = e.length;
      for (var h = 0; h < p; h++) {
        var c = e[h];
        if (f ? c === "/" && e[h - 1] === "*" && (f = !1) : s ? s === c && (s = !1) : c === "/" && e[h + 1] === "*" ? f = !0 : c === '"' || c === "'" ? s = c : c === "(" ? o++ : c === ")" && o--, !f && s === !1 && o === 0) {
          if (c === ":" && a === -1)
            a = h;
          else if (c === ";" || h === p - 1) {
            if (a !== -1) {
              var v = $e(e.substring(l, a).trim());
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
    return n && (r += pt(n)), i && (r += pt(i, !0)), r = r.trim(), r === "" ? null : r;
  }
  return e == null ? null : String(e);
}
function Bn(e, t, r, n, i, s) {
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
function Ve(e, t = {}, r, n) {
  for (var i in r) {
    var s = r[i];
    t[i] !== s && (r[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, s, n));
  }
}
function Un(e, t, r, n) {
  var i = e.__style;
  if (i !== t) {
    var s = Yn(t, n);
    s == null ? e.removeAttribute("style") : e.style.cssText = s, e.__style = t;
  } else n && (Array.isArray(n) ? (Ve(e, r?.[0], n[0]), Ve(e, r?.[1], n[1], "important")) : Ve(e, r, n));
  return n;
}
function Ke(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!yt(t))
      return Dr();
    for (var n of e.options)
      n.selected = t.includes(gt(n));
    return;
  }
  for (n of e.options) {
    var i = gt(n);
    if (en(i, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function qn(e) {
  var t = new MutationObserver(() => {
    Ke(e, e.__value);
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
  }), zt(() => {
    t.disconnect();
  });
}
function gt(e) {
  return "__value" in e ? e.__value : e.value;
}
const ye = Symbol("class"), Ee = Symbol("style"), or = Symbol("is custom element"), ar = Symbol("is html"), zn = Tt ? "option" : "OPTION", Hn = Tt ? "select" : "SELECT";
function Gn(e, t) {
  t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function bt(e, t, r, n) {
  var i = cr(e);
  i[t] !== (i[t] = r) && (t === "loading" && (e[Sr] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && hr(e).includes(t) ? e[t] = r : e.setAttribute(t, r));
}
function Kn(e, t, r, n, i = !1, s = !1) {
  var o = cr(e), f = o[or], u = !o[ar], l = t || {}, a = e.nodeName === zn;
  for (var h in t)
    h in r || (r[h] = null);
  r.class ? r.class = $n(r.class) : r[ye] && (r.class = null), r[Ee] && (r.style ??= null);
  var c = hr(e);
  for (const w in r) {
    let E = r[w];
    if (a && w === "value" && E == null) {
      e.value = e.__value = "", l[w] = E;
      continue;
    }
    if (w === "class") {
      var v = e.namespaceURI === "http://www.w3.org/1999/xhtml";
      Bn(e, v, E, n, t?.[ye], r[ye]), l[w] = E, l[ye] = r[ye];
      continue;
    }
    if (w === "style") {
      Un(e, E, t?.[Ee], r[Ee]), l[w] = E, l[Ee] = r[Ee];
      continue;
    }
    var d = l[w];
    if (!(E === d && !(E === void 0 && e.hasAttribute(w)))) {
      l[w] = E;
      var p = w[0] + w[1];
      if (p !== "$$")
        if (p === "on") {
          const x = {}, ae = "$$" + w;
          let k = w.slice(2);
          var y = mn(k);
          if (yn(k) && (k = k.slice(0, -7), x.capture = !0), !y && d) {
            if (E != null) continue;
            e.removeEventListener(k, l[ae], x), l[ae] = null;
          }
          if (y)
            Nn(k, e, E), Rn([k]);
          else if (E != null) {
            let dr = function(vr) {
              l[w].call(this, vr);
            };
            l[ae] = kn(k, e, dr, x);
          }
        } else if (w === "style")
          bt(e, w, E);
        else if (w === "autofocus")
          sn(
            /** @type {HTMLElement} */
            e,
            !!E
          );
        else if (!f && (w === "__value" || w === "value" && E != null))
          e.value = e.__value = E;
        else if (w === "selected" && a)
          Gn(
            /** @type {HTMLOptionElement} */
            e,
            E
          );
        else {
          var _ = w;
          u || (_ = An(_));
          var z = _ === "defaultValue" || _ === "defaultChecked";
          if (E == null && !f && !z)
            if (o[w] = null, _ === "value" || _ === "checked") {
              let x = (
                /** @type {HTMLInputElement} */
                e
              );
              const ae = t === void 0;
              if (_ === "value") {
                let k = x.defaultValue;
                x.removeAttribute(_), x.defaultValue = k, x.value = x.__value = ae ? k : null;
              } else {
                let k = x.defaultChecked;
                x.removeAttribute(_), x.defaultChecked = k, x.checked = ae ? k : !1;
              }
            } else
              e.removeAttribute(w);
          else z || c.includes(_) && (f || typeof E != "string") ? (e[_] = E, _ in o && (o[_] = A)) : typeof E != "function" && bt(e, _, E);
        }
    }
  }
  return l;
}
function Wn(e, t, r = [], n = [], i = [], s, o = !1, f = !1) {
  Dt(i, r, n, (u) => {
    var l = void 0, a = {}, h = e.nodeName === Hn, c = !1;
    if (Kt(() => {
      var d = t(...u.map(V)), p = Kn(
        e,
        l,
        d,
        s,
        o,
        f
      );
      c && h && "value" in d && Ke(
        /** @type {HTMLSelectElement} */
        e,
        d.value
      );
      for (let _ of Object.getOwnPropertySymbols(a))
        d[_] || P(a[_]);
      for (let _ of Object.getOwnPropertySymbols(d)) {
        var y = d[_];
        _.description === Mr && (!l || y !== l[_]) && (a[_] && P(a[_]), a[_] = K(() => jn(e, () => y))), p[_] = y;
      }
      l = p;
    }), h) {
      var v = (
        /** @type {HTMLSelectElement} */
        e
      );
      Ht(() => {
        Ke(
          v,
          /** @type {Record<string | symbol, any>} */
          l.value,
          !0
        ), qn(v);
      });
    }
    c = !0;
  });
}
function cr(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [or]: e.nodeName.includes("-"),
      [ar]: e.namespaceURI === At
    }
  );
}
var wt = /* @__PURE__ */ new Map();
function hr(e) {
  var t = e.getAttribute("is") || e.nodeName, r = wt.get(t);
  if (r) return r;
  wt.set(t, r = []);
  for (var n, i = e, s = Element.prototype; s !== i; ) {
    n = br(i);
    for (var o in n)
      n[o].set && r.push(o);
    i = Et(i);
  }
  return r;
}
const Xn = {
  get(e, t) {
    if (!e.exclude.includes(t))
      return e.props[t];
  },
  set(e, t) {
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    if (!e.exclude.includes(t) && t in e.props)
      return {
        enumerable: !0,
        configurable: !0,
        value: e.props[t]
      };
  },
  has(e, t) {
    return e.exclude.includes(t) ? !1 : t in e.props;
  },
  ownKeys(e) {
    return Reflect.ownKeys(e.props).filter((t) => !e.exclude.includes(t));
  }
};
// @__NO_SIDE_EFFECTS__
function Zn(e, t, r) {
  return new Proxy(
    { props: e, exclude: t },
    Xn
  );
}
var Jn = /* @__PURE__ */ lr("<button> </button>");
function Qn(e, t) {
  let r = /* @__PURE__ */ Zn(t, ["$$slots", "$$events", "$$legacy", "label"]);
  var n = Jn();
  Wn(n, () => ({ ...r }));
  var i = ze(n);
  Gt(() => ir(i, t.label)), fr(e, n);
}
var ei = /* @__PURE__ */ lr("<div><!> <div> </div></div>");
function ti(e) {
  let t = /* @__PURE__ */ H(0);
  var r = ei(), n = ze(r);
  Qn(n, { label: "Click me", onclick: () => Qr(t) });
  var i = rn(n, 2), s = ze(i);
  Gt(() => ir(s, `Count: ${V(t) ?? ""}`)), fr(e, r);
}
function ni(e) {
  return Dn(ti, { target: e });
}
export {
  ni as default,
  ni as rvst_mount
};

var wt = Array.isArray, sn = Array.prototype.indexOf, we = Array.prototype.includes, je = Array.from, fn = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, un = Object.prototype, on = Array.prototype, an = Object.getPrototypeOf, it = Object.isExtensible;
const cn = () => {
};
function hn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function mt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Me = 4, Be = 8, bt = 1 << 24, ie = 16, Y = 32, ue = 64, Ue = 128, O = 512, x = 1024, R = 2048, U = 4096, F = 8192, j = 16384, xe = 32768, lt = 1 << 25, Fe = 65536, st = 1 << 17, vn = 1 << 18, Te = 1 << 19, dn = 1 << 20, X = 1 << 25, oe = 65536, $e = 1 << 21, Ze = 1 << 22, te = 1 << 23, Ve = Symbol("$state"), W = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function _n() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function pn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function gn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function wn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function mn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function bn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function yn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const En = 1, xn = 2, Tn = 16, kn = 2, k = Symbol(), Sn = "http://www.w3.org/1999/xhtml";
function An() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function yt(e) {
  return e === this.v;
}
function Rn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Et(e) {
  return !Rn(e, this.v);
}
let H = null;
function me(e) {
  H = e;
}
function Cn(e, t = !1, n) {
  H = {
    p: H,
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
function Nn(e) {
  var t = (
    /** @type {ComponentContext} */
    H
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      nr(r);
  }
  return t.i = !0, H = t.p, /** @type {T} */
  {};
}
function xt() {
  return !0;
}
let ve = [];
function Mn() {
  var e = ve;
  ve = [], hn(e);
}
function pe(e) {
  if (ve.length === 0) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && Mn();
    });
  }
  ve.push(e);
}
function Tt(e) {
  var t = g;
  if (t === null)
    return p.f |= te, e;
  if ((t.f & xe) === 0 && (t.f & Me) === 0)
    throw e;
  ee(e, t);
}
function ee(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ue) !== 0) {
      if ((t.f & xe) === 0)
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
const Fn = -7169;
function E(e, t) {
  e.f = e.f & Fn | t;
}
function Je(e) {
  (e.f & O) !== 0 || e.deps === null ? E(e, x) : E(e, U);
}
function kt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & oe) === 0 || (t.f ^= oe, kt(
        /** @type {Derived} */
        t.deps
      ));
}
function St(e, t, n) {
  (e.f & R) !== 0 ? t.add(e) : (e.f & U) !== 0 && n.add(e), kt(e.deps), E(e, x);
}
const Z = /* @__PURE__ */ new Set();
let b = null, z = null, Ke = null, Ye = !1, de = null, Ie = null;
var ft = 0;
let Dn = 1;
class re {
  id = Dn++;
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
        E(r, R), this.schedule(r);
      for (r of n.m)
        E(r, U), this.schedule(r);
    }
  }
  #h() {
    if (ft++ > 1e3 && (Z.delete(this), On()), !this.#c()) {
      for (const s of this.#t)
        this.#n.delete(s), E(s, R), this.schedule(s);
      for (const s of this.#n)
        E(s, U), this.schedule(s);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = de = [], r = [], i = Ie = [];
    for (const s of t)
      try {
        this.#o(s, n, r);
      } catch (u) {
        throw Nt(s), u;
      }
    if (b = null, i.length > 0) {
      var l = re.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (de = null, Ie = null, this.#c() || this.#d()) {
      this.#_(r), this.#_(n);
      for (const [s, u] of this.#l)
        Ct(s, u);
    } else {
      this.#r.size === 0 && Z.delete(this), this.#t.clear(), this.#n.clear();
      for (const s of this.#s) s(this);
      this.#s.clear(), ut(r), ut(n), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      b
    );
    if (this.#e.length > 0) {
      const s = o ??= this;
      s.#e.push(...this.#e.filter((u) => !s.#e.includes(u)));
    }
    o !== null && (Z.add(o), o.#h()), Z.has(this) || this.#w();
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
      var l = i.f, o = (l & (Y | ue)) !== 0, s = o && (l & x) !== 0, u = s || (l & F) !== 0 || this.#l.has(i);
      if (!u && i.fn !== null) {
        o ? i.f ^= x : (l & Me) !== 0 ? n.push(i) : Oe(i) && ((l & ie) !== 0 && this.#n.add(i), Ee(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
      St(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    n !== k && !this.previous.has(t) && this.previous.set(t, n), (t.f & te) === 0 && (this.current.set(t, [t.v, r]), z?.set(t, t.v));
  }
  activate() {
    b = this;
  }
  deactivate() {
    b = null, z = null;
  }
  flush() {
    try {
      Ye = !0, b = this, this.#h();
    } finally {
      ft = 0, Ke = null, de = null, Ie = null, Ye = !1, b = null, z = null, ne.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), Z.delete(this);
  }
  #w() {
    for (const f of Z) {
      var t = f.id < this.id, n = [];
      for (const [c, [v, h]] of this.current) {
        if (f.current.has(c)) {
          var r = (
            /** @type {[any, boolean]} */
            f.current.get(c)[0]
          );
          if (t && v !== r)
            f.current.set(c, [v, h]);
          else
            continue;
        }
        n.push(c);
      }
      var i = [...f.current.keys()].filter((c) => !this.current.has(c));
      if (i.length === 0)
        t && f.discard();
      else if (n.length > 0) {
        f.activate();
        var l = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var s of n)
          At(s, i, l, o);
        if (f.#e.length > 0) {
          f.apply();
          for (var u of f.#e)
            f.#o(u, [], []);
          f.#e = [];
        }
        f.deactivate();
      }
    }
    for (const f of Z)
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
      let l = this.#f.get(n) ?? 0;
      l === 1 ? this.#f.delete(n) : this.#f.set(n, l - 1);
    }
    this.#a || r || (this.#a = !0, pe(() => {
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
    return (this.#i ??= mt()).promise;
  }
  static ensure() {
    if (b === null) {
      const t = b = new re();
      Ye || (Z.add(b), pe(() => {
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
    if (Ke = t, t.b?.is_pending && (t.f & (Me | Be | bt)) !== 0 && (t.f & xe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (de !== null && n === g && (p === null || (p.f & T) === 0))
        return;
      if ((r & (ue | Y)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#e.push(n);
  }
}
function On() {
  try {
    gn();
  } catch (e) {
    ee(e, Ke);
  }
}
let G = null;
function ut(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | F)) === 0 && Oe(r) && (G = /* @__PURE__ */ new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Vt(r), G?.size > 0)) {
        ne.clear();
        for (const i of G) {
          if ((i.f & (j | F)) !== 0) continue;
          const l = [i];
          let o = i.parent;
          for (; o !== null; )
            G.has(o) && (G.delete(o), l.push(o)), o = o.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const u = l[s];
            (u.f & (j | F)) === 0 && Ee(u);
          }
        }
        G.clear();
      }
    }
    G = null;
  }
}
function At(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & T) !== 0 ? At(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Ze | ie)) !== 0 && (l & R) === 0 && Rt(i, t, r) && (E(i, R), Qe(
        /** @type {Effect} */
        i
      ));
    }
}
function Rt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (we.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && Rt(
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
function Qe(e) {
  b.schedule(e);
}
function Ct(e, t) {
  if (!((e.f & Y) !== 0 && (e.f & x) !== 0)) {
    (e.f & R) !== 0 ? t.d.push(e) : (e.f & U) !== 0 && t.m.push(e), E(e, x);
    for (var n = e.first; n !== null; )
      Ct(n, t), n = n.next;
  }
}
function Nt(e) {
  E(e, x);
  for (var t = e.first; t !== null; )
    Nt(t), t = t.next;
}
function Pn(e) {
  let t = 0, n = ae(0), r;
  return () => {
    nt() && (A(n), lr(() => (t === 0 && (r = cr(() => e(() => Ne(n)))), t += 1, () => {
      pe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ne(n));
      });
    })));
  };
}
var In = Fe | Te;
function qn(e, t, n, r) {
  new zn(e, t, n, r);
}
class zn {
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
  #_ = Pn(() => (this.#o = ae(this.#a), () => {
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
      o.b = this, o.f |= Ue, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Bt(() => {
      this.#m();
    }, In);
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
    t && (this.is_pending = !0, this.#t = V(() => t(this.#s)), pe(() => {
      var n = this.#l = document.createDocumentFragment(), r = Le();
      n.append(r), this.#e = this.#g(() => V(() => this.#f(r))), this.#u === 0 && (this.#s.before(n), this.#l = null, ge(
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
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#e = V(() => {
        this.#f(this.#s);
      }), this.#u > 0) {
        var t = this.#l = document.createDocumentFragment();
        Kt(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#t = V(() => n(this.#s));
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
    St(t, this.#d, this.#h);
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
    var n = g, r = p, i = H;
    $(this.#i), I(this.#i), me(this.#i.ctx);
    try {
      return re.ensure(), t();
    } catch (l) {
      return Tt(l), null;
    } finally {
      $(n), I(r), me(i);
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
    this.#u += t, this.#u === 0 && (this.#p(n), this.#t && ge(this.#t, () => {
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
    this.#b(t, n), this.#a += t, !(!this.#o || this.#c) && (this.#c = !0, pe(() => {
      this.#c = !1, this.#o && be(this.#o, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), A(
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
    this.#e && (B(this.#e), this.#e = null), this.#t && (B(this.#t), this.#t = null), this.#n && (B(this.#n), this.#n = null);
    var i = !1, l = !1;
    const o = () => {
      if (i) {
        An();
        return;
      }
      i = !0, l && yn(), this.#n !== null && ge(this.#n, () => {
        this.#n = null;
      }), this.#g(() => {
        this.#m();
      });
    }, s = (u) => {
      try {
        l = !0, n?.(u, o), l = !1;
      } catch (f) {
        ee(f, this.#i && this.#i.parent);
      }
      r && (this.#n = this.#g(() => {
        try {
          return V(() => {
            var f = (
              /** @type {Effect} */
              g
            );
            f.b = this, f.f |= Ue, r(
              this.#s,
              () => u,
              () => o
            );
          });
        } catch (f) {
          return ee(
            f,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    pe(() => {
      var u;
      try {
        u = this.transform_error(t);
      } catch (f) {
        ee(f, this.#i && this.#i.parent);
        return;
      }
      u !== null && typeof u == "object" && typeof /** @type {any} */
      u.then == "function" ? u.then(
        s,
        /** @param {unknown} e */
        (f) => ee(f, this.#i && this.#i.parent)
      ) : s(u);
    });
  }
}
function Ln(e, t, n, r) {
  const i = et;
  var l = e.filter((h) => !h.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    g
  ), s = jn(), u = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((h) => h.promise)) : null;
  function f(h) {
    s();
    try {
      r(h);
    } catch (d) {
      (o.f & j) === 0 && ee(d, o);
    }
    ze();
  }
  if (n.length === 0) {
    u.then(() => f(t.map(i)));
    return;
  }
  var c = Mt();
  function v() {
    Promise.all(n.map((h) => /* @__PURE__ */ Bn(h))).then((h) => f([...t.map(i), ...h])).catch((h) => ee(h, o)).finally(() => c());
  }
  u ? u.then(() => {
    s(), v(), ze();
  }) : v();
}
function jn() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = H, r = (
    /** @type {Batch} */
    b
  );
  return function(l = !0) {
    $(e), I(t), me(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function ze(e = !0) {
  $(null), I(null), me(null), e && b?.deactivate();
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
function et(e) {
  var t = T | R, n = p !== null && (p.f & T) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Te), {
    ctx: H,
    deps: null,
    effects: null,
    equals: yt,
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
function Bn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && _n();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = ae(
    /** @type {V} */
    k
  ), o = !p, s = /* @__PURE__ */ new Map();
  return ir(() => {
    var u = (
      /** @type {Effect} */
      g
    ), f = mt();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, f.reject).finally(ze);
    } catch (d) {
      f.reject(d), ze();
    }
    var c = (
      /** @type {Batch} */
      b
    );
    if (o) {
      if ((u.f & xe) !== 0)
        var v = Mt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(c)?.reject(W), s.delete(c);
      else {
        for (const d of s.values())
          d.reject(W);
        s.clear();
      }
      s.set(c, f);
    }
    const h = (d, a = void 0) => {
      if (v) {
        var _ = a === W;
        v(_);
      }
      if (!(a === W || (u.f & j) !== 0)) {
        if (c.activate(), a)
          l.f |= te, be(l, a);
        else {
          (l.f & te) !== 0 && (l.f ^= te), be(l, d);
          for (const [m, w] of s) {
            if (s.delete(m), m === c) break;
            w.reject(W);
          }
        }
        c.deactivate();
      }
    };
    f.promise.then(h, (d) => h(null, d || "unknown"));
  }), tr(() => {
    for (const u of s.values())
      u.reject(W);
  }), new Promise((u) => {
    function f(c) {
      function v() {
        c === i ? u(l) : f(i);
      }
      c.then(v, v);
    }
    f(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Hn(e) {
  const t = /* @__PURE__ */ et(e);
  return Gt(t), t;
}
// @__NO_SIDE_EFFECTS__
function Vn(e) {
  const t = /* @__PURE__ */ et(e);
  return t.equals = Et, t;
}
function Yn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      B(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Un(e) {
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
function tt(e) {
  var t, n = g;
  $(Un(e));
  try {
    e.f &= ~oe, Yn(e), t = Jt(e);
  } finally {
    $(n);
  }
  return t;
}
function Ft(e) {
  var t = e.v, n = tt(e);
  if (!e.equals(n) && (e.wv = Xt(), (!b?.is_fork || e.deps === null) && (e.v = n, b?.capture(e, t, !0), e.deps === null))) {
    E(e, x);
    return;
  }
  ye || (z !== null ? (nt() || b?.is_fork) && z.set(e, n) : Je(e));
}
function $n(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(W), t.teardown = cn, t.ac = null, De(t, 0), rt(t));
}
function Dt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Ee(t);
}
let Ge = /* @__PURE__ */ new Set();
const ne = /* @__PURE__ */ new Map();
let Ot = !1;
function ae(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: yt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function K(e, t) {
  const n = ae(e);
  return Gt(n), n;
}
// @__NO_SIDE_EFFECTS__
function Kn(e, t = !1, n = !0) {
  const r = ae(e);
  return t || (r.equals = Et), r;
}
function Q(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!L || (p.f & st) !== 0) && xt() && (p.f & (T | ie | Ze | st)) !== 0 && (P === null || !we.call(P, e)) && bn();
  let r = n ? _e(t) : t;
  return be(e, r, Ie);
}
function be(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ye ? ne.set(e, t) : ne.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & T) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & R) !== 0 && tt(l), z === null && Je(l);
    }
    e.wv = Xt(), Pt(e, R, n), g !== null && (g.f & x) !== 0 && (g.f & (Y | ue)) === 0 && (D === null ? or([e]) : D.push(e)), !i.is_fork && Ge.size > 0 && !Ot && Gn();
  }
  return t;
}
function Gn() {
  Ot = !1;
  for (const e of Ge)
    (e.f & x) !== 0 && E(e, U), Oe(e) && Ee(e);
  Ge.clear();
}
function Ne(e) {
  Q(e, e.v + 1);
}
function Pt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var o = r[l], s = o.f, u = (s & R) === 0;
      if (u && E(o, t), (s & T) !== 0) {
        var f = (
          /** @type {Derived} */
          o
        );
        z?.delete(f), (s & oe) === 0 && (s & O && (o.f |= oe), Pt(f, U, n));
      } else if (u) {
        var c = (
          /** @type {Effect} */
          o
        );
        (s & ie) !== 0 && G !== null && G.add(c), n !== null ? n.push(c) : Qe(c);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Ve in e)
    return e;
  const t = an(e);
  if (t !== un && t !== on)
    return e;
  var n = /* @__PURE__ */ new Map(), r = wt(e), i = /* @__PURE__ */ K(0), l = fe, o = (s) => {
    if (fe === l)
      return s();
    var u = p, f = fe;
    I(null), ht(l);
    var c = s();
    return I(u), ht(f), c;
  };
  return r && n.set("length", /* @__PURE__ */ K(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, u, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && wn();
        var c = n.get(u);
        return c === void 0 ? o(() => {
          var v = /* @__PURE__ */ K(f.value);
          return n.set(u, v), v;
        }) : Q(c, f.value, !0), !0;
      },
      deleteProperty(s, u) {
        var f = n.get(u);
        if (f === void 0) {
          if (u in s) {
            const c = o(() => /* @__PURE__ */ K(k));
            n.set(u, c), Ne(i);
          }
        } else
          Q(f, k), Ne(i);
        return !0;
      },
      get(s, u, f) {
        if (u === Ve)
          return e;
        var c = n.get(u), v = u in s;
        if (c === void 0 && (!v || Ce(s, u)?.writable) && (c = o(() => {
          var d = _e(v ? s[u] : k), a = /* @__PURE__ */ K(d);
          return a;
        }), n.set(u, c)), c !== void 0) {
          var h = A(c);
          return h === k ? void 0 : h;
        }
        return Reflect.get(s, u, f);
      },
      getOwnPropertyDescriptor(s, u) {
        var f = Reflect.getOwnPropertyDescriptor(s, u);
        if (f && "value" in f) {
          var c = n.get(u);
          c && (f.value = A(c));
        } else if (f === void 0) {
          var v = n.get(u), h = v?.v;
          if (v !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return f;
      },
      has(s, u) {
        if (u === Ve)
          return !0;
        var f = n.get(u), c = f !== void 0 && f.v !== k || Reflect.has(s, u);
        if (f !== void 0 || g !== null && (!c || Ce(s, u)?.writable)) {
          f === void 0 && (f = o(() => {
            var h = c ? _e(s[u]) : k, d = /* @__PURE__ */ K(h);
            return d;
          }), n.set(u, f));
          var v = A(f);
          if (v === k)
            return !1;
        }
        return c;
      },
      set(s, u, f, c) {
        var v = n.get(u), h = u in s;
        if (r && u === "length")
          for (var d = f; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var a = n.get(d + "");
            a !== void 0 ? Q(a, k) : d in s && (a = o(() => /* @__PURE__ */ K(k)), n.set(d + "", a));
          }
        if (v === void 0)
          (!h || Ce(s, u)?.writable) && (v = o(() => /* @__PURE__ */ K(void 0)), Q(v, _e(f)), n.set(u, v));
        else {
          h = v.v !== k;
          var _ = o(() => _e(f));
          Q(v, _);
        }
        var m = Reflect.getOwnPropertyDescriptor(s, u);
        if (m?.set && m.set.call(c, f), !h) {
          if (r && typeof u == "string") {
            var w = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(u);
            Number.isInteger(y) && y >= w.v && Q(w, y + 1);
          }
          Ne(i);
        }
        return !0;
      },
      ownKeys(s) {
        A(i);
        var u = Reflect.ownKeys(s).filter((v) => {
          var h = n.get(v);
          return h === void 0 || h.v !== k;
        });
        for (var [f, c] of n)
          c.v !== k && !(f in s) && u.push(f);
        return u;
      },
      setPrototypeOf() {
        mn();
      }
    }
  );
}
var ot, It, qt, zt;
function Wn() {
  if (ot === void 0) {
    ot = window, It = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    qt = Ce(t, "firstChild").get, zt = Ce(t, "nextSibling").get, it(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), it(n) && (n.__t = void 0);
  }
}
function Le(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
  return (
    /** @type {TemplateNode | null} */
    qt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function He(e) {
  return (
    /** @type {TemplateNode | null} */
    zt.call(e)
  );
}
function at(e, t) {
  return /* @__PURE__ */ Lt(e);
}
function Xn(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ He(r);
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
    document.createElementNS(Sn, e, void 0)
  );
}
function jt(e) {
  var t = p, n = g;
  I(null), $(null);
  try {
    return e();
  } finally {
    I(t), $(n);
  }
}
function er(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function le(e, t) {
  var n = g;
  n !== null && (n.f & F) !== 0 && (e |= F);
  var r = {
    ctx: H,
    deps: null,
    nodes: null,
    f: e | R | O,
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
    de !== null ? de.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (o) {
      throw B(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Te) === 0 && (i = i.first, (e & ie) !== 0 && (e & Fe) !== 0 && i !== null && (i.f |= Fe));
  }
  if (i !== null && (i.parent = n, n !== null && er(i, n), p !== null && (p.f & T) !== 0 && (e & ue) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function nt() {
  return p !== null && !L;
}
function tr(e) {
  const t = le(Be, null);
  return E(t, x), t.teardown = e, t;
}
function nr(e) {
  return le(Me | dn, e);
}
function rr(e) {
  re.ensure();
  const t = le(ue | Te, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ge(t, () => {
      B(t), r(void 0);
    }) : (B(t), r(void 0));
  });
}
function ir(e) {
  return le(Ze | Te, e);
}
function lr(e, t = 0) {
  return le(Be | t, e);
}
function sr(e, t = [], n = [], r = []) {
  Ln(r, t, n, (i) => {
    le(Be, () => e(...i.map(A)));
  });
}
function Bt(e, t = 0) {
  var n = le(ie | t, e);
  return n;
}
function V(e) {
  return le(Y | Te, e);
}
function Ht(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    ct(!0), I(null);
    try {
      t.call(null);
    } finally {
      ct(n), I(r);
    }
  }
}
function rt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && jt(() => {
      i.abort(W);
    });
    var r = n.next;
    (n.f & ue) !== 0 ? n.parent = null : B(n, t), n = r;
  }
}
function fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Y) === 0 && B(t), t = n;
  }
}
function B(e, t = !0) {
  var n = !1;
  (t || (e.f & vn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ur(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), E(e, lt), rt(e, t && !n), De(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Ht(e), e.f ^= lt, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Vt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ He(e);
    e.remove(), e = n;
  }
}
function Vt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ge(e, t, n = !0) {
  var r = [];
  Yt(e, r, !0);
  var i = () => {
    n && B(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var o = () => --l || i();
    for (var s of r)
      s.out(o);
  } else
    i();
}
function Yt(e, t, n) {
  if ((e.f & F) === 0) {
    e.f ^= F;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, o = (i.f & Fe) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Y) !== 0 && (e.f & ie) !== 0;
      Yt(i, t, o ? n : !1), i = l;
    }
  }
}
function Ut(e) {
  $t(e, !0);
}
function $t(e, t) {
  if ((e.f & F) !== 0) {
    e.f ^= F, (e.f & x) === 0 && (E(e, R), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Fe) !== 0 || (n.f & Y) !== 0;
      $t(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const o of l)
        (o.is_global || t) && o.in();
  }
}
function Kt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ He(n);
      t.append(n), n = i;
    }
}
let qe = !1, ye = !1;
function ct(e) {
  ye = e;
}
let p = null, L = !1;
function I(e) {
  p = e;
}
let g = null;
function $(e) {
  g = e;
}
let P = null;
function Gt(e) {
  p !== null && (P === null ? P = [e] : P.push(e));
}
let C = null, M = 0, D = null;
function or(e) {
  D = e;
}
let Wt = 1, se = 0, fe = se;
function ht(e) {
  fe = e;
}
function Xt() {
  return ++Wt;
}
function Oe(e) {
  var t = e.f;
  if ((t & R) !== 0)
    return !0;
  if (t & T && (e.f &= ~oe), (t & U) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Oe(
        /** @type {Derived} */
        l
      ) && Ft(
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
  if (r !== null && !(P !== null && we.call(P, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & T) !== 0 ? Zt(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? E(l, R) : (l.f & x) !== 0 && E(l, U), Qe(
        /** @type {Effect} */
        l
      ));
    }
}
function Jt(e) {
  var t = C, n = M, r = D, i = p, l = P, o = H, s = L, u = fe, f = e.f;
  C = /** @type {null | Value[]} */
  null, M = 0, D = null, p = (f & (Y | ue)) === 0 ? e : null, P = null, me(e.ctx), L = !1, fe = ++se, e.ac !== null && (jt(() => {
    e.ac.abort(W);
  }), e.ac = null);
  try {
    e.f |= $e;
    var c = (
      /** @type {Function} */
      e.fn
    ), v = c();
    e.f |= xe;
    var h = e.deps, d = b?.is_fork;
    if (C !== null) {
      var a;
      if (d || De(e, M), h !== null && M > 0)
        for (h.length = M + C.length, a = 0; a < C.length; a++)
          h[M + a] = C[a];
      else
        e.deps = h = C;
      if (nt() && (e.f & O) !== 0)
        for (a = M; a < h.length; a++)
          (h[a].reactions ??= []).push(e);
    } else !d && h !== null && M < h.length && (De(e, M), h.length = M);
    if (xt() && D !== null && !L && h !== null && (e.f & (T | U | R)) === 0)
      for (a = 0; a < /** @type {Source[]} */
      D.length; a++)
        Zt(
          D[a],
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
      D !== null && (r === null ? r = D : r.push(.../** @type {Source[]} */
      D));
    }
    return (e.f & te) !== 0 && (e.f ^= te), v;
  } catch (_) {
    return Tt(_);
  } finally {
    e.f ^= $e, C = t, M = n, D = r, p = i, P = l, me(o), L = s, fe = u;
  }
}
function ar(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = sn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (C === null || !we.call(C, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & O) !== 0 && (l.f ^= O, l.f &= ~oe), Je(l), $n(l), De(l, 0);
  }
}
function De(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ar(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & j) === 0) {
    E(e, x);
    var n = g, r = qe;
    g = e, qe = !0;
    try {
      (t & (ie | bt)) !== 0 ? fr(e) : rt(e), Ht(e);
      var i = Jt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Wt;
      var l;
    } finally {
      qe = r, g = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & T) !== 0;
  if (p !== null && !L) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (P === null || !we.call(P, e))) {
      var i = p.deps;
      if ((p.f & $e) !== 0)
        e.rv < se && (e.rv = se, C === null && i !== null && i[M] === e ? M++ : C === null ? C = [e] : C.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : we.call(l, p) || l.push(p);
      }
    }
  }
  if (ye && ne.has(e))
    return ne.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ye) {
      var s = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || en(o)) && (s = tt(o)), ne.set(o, s), s;
    }
    var u = (o.f & O) === 0 && !L && p !== null && (qe || (p.f & O) !== 0), f = (o.f & xe) === 0;
    Oe(o) && (u && (o.f |= O), Ft(o)), u && !f && (Dt(o), Qt(o));
  }
  if (z?.has(e))
    return z.get(e);
  if ((e.f & te) !== 0)
    throw e.v;
  return e.v;
}
function Qt(e) {
  if (e.f |= O, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & O) === 0 && (Dt(
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
    if (ne.has(t) || (t.f & T) !== 0 && en(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function cr(e) {
  var t = L;
  try {
    return L = !0, e();
  } finally {
    L = t;
  }
}
const vt = globalThis.Deno?.core?.ops ?? null;
function hr(e, ...t) {
  vt?.[e] ? vt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function vr(e, t) {
  hr("op_set_text", e, t);
}
const dr = ["touchstart", "touchmove"];
function _r(e) {
  return dr.includes(e);
}
const Ae = Symbol("events"), tn = /* @__PURE__ */ new Set(), We = /* @__PURE__ */ new Set();
function pr(e, t, n) {
  (t[Ae] ??= {})[e] = n;
}
function gr(e) {
  for (var t = 0; t < e.length; t++)
    tn.add(e[t]);
  for (var n of We)
    n(e);
}
let dt = null;
function _t(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  dt = e;
  var o = 0, s = dt === e && e[Ae];
  if (s) {
    var u = i.indexOf(s);
    if (u !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Ae] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    u <= f && (o = u);
  }
  if (l = /** @type {Element} */
  i[o] || e.target, l !== t) {
    fn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, v = g;
    I(null), $(null);
    try {
      for (var h, d = []; l !== null; ) {
        var a = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Ae]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (m) {
          h ? d.push(m) : h = m;
        }
        if (e.cancelBubble || a === t || a === null)
          break;
        l = a;
      }
      if (h) {
        for (let m of d)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Ae] = t, delete e.currentTarget, I(c), $(v);
    }
  }
}
const wr = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function mr(e) {
  return (
    /** @type {string} */
    wr?.createHTML(e) ?? e
  );
}
function br(e) {
  var t = Qn("template");
  return t.innerHTML = mr(e.replaceAll("<!>", "<!---->")), t.content;
}
function yr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function nn(e, t) {
  var n = (t & kn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = br(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Lt(r));
    var l = (
      /** @type {TemplateNode} */
      n || It ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return yr(l, l), l;
  };
}
function pt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Er(e, t) {
  return xr(e, t);
}
const Pe = /* @__PURE__ */ new Map();
function xr(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: o = !0, transformError: s }) {
  Wn();
  var u = void 0, f = rr(() => {
    var c = n ?? t.appendChild(Le());
    qn(
      /** @type {TemplateNode} */
      c,
      {
        pending: () => {
        }
      },
      (d) => {
        Cn({});
        var a = (
          /** @type {ComponentContext} */
          H
        );
        l && (a.c = l), i && (r.$$events = i), u = e(d, r) || {}, Nn();
      },
      s
    );
    var v = /* @__PURE__ */ new Set(), h = (d) => {
      for (var a = 0; a < d.length; a++) {
        var _ = d[a];
        if (!v.has(_)) {
          v.add(_);
          var m = _r(_);
          for (const N of [t, document]) {
            var w = Pe.get(N);
            w === void 0 && (w = /* @__PURE__ */ new Map(), Pe.set(N, w));
            var y = w.get(_);
            y === void 0 ? (N.addEventListener(_, _t, { passive: m }), w.set(_, 1)) : w.set(_, y + 1);
          }
        }
      }
    };
    return h(je(tn)), We.add(h), () => {
      for (var d of v)
        for (const m of [t, document]) {
          var a = (
            /** @type {Map<string, number>} */
            Pe.get(m)
          ), _ = (
            /** @type {number} */
            a.get(d)
          );
          --_ == 0 ? (m.removeEventListener(d, _t), a.delete(d), a.size === 0 && Pe.delete(m)) : a.set(d, _);
        }
      We.delete(h), c !== n && c.parentNode?.removeChild(c);
    };
  });
  return Tr.set(u, f), u;
}
let Tr = /* @__PURE__ */ new WeakMap();
function kr(e, t) {
  return t;
}
function Sr(e, t, n) {
  for (var r = [], i = t.length, l, o = t.length, s = 0; s < i; s++) {
    let v = t[s];
    ge(
      v,
      () => {
        if (l) {
          if (l.pending.delete(v), l.done.add(v), l.pending.size === 0) {
            var h = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            Xe(e, je(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
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
      var f = (
        /** @type {Element} */
        n
      ), c = (
        /** @type {Element} */
        f.parentNode
      );
      Zn(c), c.append(f), e.items.clear();
    }
    Xe(e, t, !u);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function Xe(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const o of e.pending.values())
      for (const s of o)
        r.add(
          /** @type {EachItem} */
          e.items.get(s).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= X;
      const o = document.createDocumentFragment();
      Kt(l, o);
    } else
      B(t[i], n);
  }
}
var gt;
function Ar(e, t, n, r, i, l = null) {
  var o = e, s = /* @__PURE__ */ new Map(), u = null, f = /* @__PURE__ */ Vn(() => {
    var w = n();
    return wt(w) ? w : w == null ? [] : je(w);
  }), c, v = /* @__PURE__ */ new Map(), h = !0;
  function d(w) {
    (m.effect.f & j) === 0 && (m.pending.delete(w), m.fallback = u, Rr(m, c, o, t, r), u !== null && (c.length === 0 ? (u.f & X) === 0 ? Ut(u) : (u.f ^= X, Re(u, null, o)) : ge(u, () => {
      u = null;
    })));
  }
  function a(w) {
    m.pending.delete(w);
  }
  var _ = Bt(() => {
    c = /** @type {V[]} */
    A(f);
    for (var w = c.length, y = /* @__PURE__ */ new Set(), N = (
      /** @type {Batch} */
      b
    ), ce = Jn(), q = 0; q < w; q += 1) {
      var ke = c[q], he = r(ke, q), S = h ? null : s.get(he);
      S ? (S.v && be(S.v, ke), S.i && be(S.i, q), ce && N.unskip_effect(S.e)) : (S = Cr(
        s,
        h ? o : gt ??= Le(),
        ke,
        he,
        q,
        i,
        t,
        n
      ), h || (S.e.f |= X), s.set(he, S)), y.add(he);
    }
    if (w === 0 && l && !u && (h ? u = V(() => l(o)) : (u = V(() => l(gt ??= Le())), u.f |= X)), w > y.size && pn(), !h)
      if (v.set(N, y), ce) {
        for (const [rn, ln] of s)
          y.has(rn) || N.skip_effect(ln.e);
        N.oncommit(d), N.ondiscard(a);
      } else
        d(N);
    A(f);
  }), m = { effect: _, items: s, pending: v, outrogroups: null, fallback: u };
  h = !1;
}
function Se(e) {
  for (; e !== null && (e.f & Y) === 0; )
    e = e.next;
  return e;
}
function Rr(e, t, n, r, i) {
  var l = t.length, o = e.items, s = Se(e.effect.first), u, f = null, c = [], v = [], h, d, a, _;
  for (_ = 0; _ < l; _ += 1) {
    if (h = t[_], d = i(h, _), a = /** @type {EachItem} */
    o.get(d).e, e.outrogroups !== null)
      for (const S of e.outrogroups)
        S.pending.delete(a), S.done.delete(a);
    if ((a.f & F) !== 0 && Ut(a), (a.f & X) !== 0)
      if (a.f ^= X, a === s)
        Re(a, null, n);
      else {
        var m = f ? f.next : s;
        a === e.effect.last && (e.effect.last = a.prev), a.prev && (a.prev.next = a.next), a.next && (a.next.prev = a.prev), J(e, f, a), J(e, a, m), Re(a, m, n), f = a, c = [], v = [], s = Se(f.next);
        continue;
      }
    if (a !== s) {
      if (u !== void 0 && u.has(a)) {
        if (c.length < v.length) {
          var w = v[0], y;
          f = w.prev;
          var N = c[0], ce = c[c.length - 1];
          for (y = 0; y < c.length; y += 1)
            Re(c[y], w, n);
          for (y = 0; y < v.length; y += 1)
            u.delete(v[y]);
          J(e, N.prev, ce.next), J(e, f, N), J(e, ce, w), s = w, f = ce, _ -= 1, c = [], v = [];
        } else
          u.delete(a), Re(a, s, n), J(e, a.prev, a.next), J(e, a, f === null ? e.effect.first : f.next), J(e, f, a), f = a;
        continue;
      }
      for (c = [], v = []; s !== null && s !== a; )
        (u ??= /* @__PURE__ */ new Set()).add(s), v.push(s), s = Se(s.next);
      if (s === null)
        continue;
    }
    (a.f & X) === 0 && c.push(a), f = a, s = Se(a.next);
  }
  if (e.outrogroups !== null) {
    for (const S of e.outrogroups)
      S.pending.size === 0 && (Xe(e, je(S.done)), e.outrogroups?.delete(S));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || u !== void 0) {
    var q = [];
    if (u !== void 0)
      for (a of u)
        (a.f & F) === 0 && q.push(a);
    for (; s !== null; )
      (s.f & F) === 0 && s !== e.fallback && q.push(s), s = Se(s.next);
    var ke = q.length;
    if (ke > 0) {
      var he = null;
      Sr(e, q, he);
    }
  }
}
function Cr(e, t, n, r, i, l, o, s) {
  var u = (o & En) !== 0 ? (o & Tn) === 0 ? /* @__PURE__ */ Kn(n, !1, !1) : ae(n) : null, f = (o & xn) !== 0 ? ae(i) : null;
  return {
    v: u,
    i: f,
    e: V(() => (l(t, u ?? n, f ?? i, s), () => {
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
        /* @__PURE__ */ He(r)
      );
      if (l.before(r), r === i)
        return;
      r = o;
    }
}
function J(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
var Nr = /* @__PURE__ */ nn("<div> </div>"), Mr = /* @__PURE__ */ nn("<div><!> <button>Downgrade</button></div>");
function Fr(e) {
  let t = /* @__PURE__ */ K(_e([
    { name: "Alice", score: 85 },
    { name: "Bob", score: 72 },
    { name: "Carol", score: 91 }
  ]));
  function n() {
    Q(t, A(t).map((o) => ({ ...o, score: Math.max(0, o.score - 10) })), !0);
  }
  var r = Mr(), i = at(r);
  Ar(i, 17, () => A(t), kr, (o, s) => {
    const u = /* @__PURE__ */ Hn(() => A(s).score >= 90 ? "A" : A(s).score >= 80 ? "B" : "C");
    var f = Nr(), c = at(f);
    sr(() => vr(c, `${A(s).name ?? ""}: ${A(u) ?? ""}`)), pt(o, f);
  });
  var l = Xn(i, 2);
  pr("click", l, n), pt(e, r);
}
gr(["click"]);
function Or(e) {
  return Er(Fr, { target: e });
}
export {
  Or as default,
  Or as rvst_mount
};

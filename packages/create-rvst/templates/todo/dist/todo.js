var tn = Array.isArray, Zn = Array.prototype.indexOf, Me = Array.prototype.includes, st = Array.from, Kn = Object.defineProperty, Ce = Object.getOwnPropertyDescriptor, nn = Object.getOwnPropertyDescriptors, Wn = Object.prototype, $n = Array.prototype, Ct = Object.getPrototypeOf, Bt = Object.isExtensible;
const Xn = () => {
};
function Jn(e) {
  return e();
}
function _t(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function rn() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const A = 2, Ve = 4, Ze = 8, ln = 1 << 24, $ = 16, Z = 32, be = 64, pt = 128, q = 512, C = 1024, N = 2048, X = 4096, R = 8192, I = 16384, Ee = 32768, qt = 1 << 25, Ne = 65536, gt = 1 << 17, Qn = 1 << 18, Oe = 1 << 19, sn = 1 << 20, re = 1 << 25, ye = 65536, mt = 1 << 21, Ye = 1 << 22, oe = 1 << 23, Se = Symbol("$state"), er = Symbol("legacy props"), tr = Symbol(""), ne = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function nr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function rr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ir(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function lr() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function sr(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function fr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function or() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ar() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function ur() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function cr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const dr = 1, vr = 2, hr = 16, _r = 2, S = Symbol(), fn = "http://www.w3.org/1999/xhtml";
function pr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function on(e) {
  return e === this.v;
}
function gr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function an(e) {
  return !gr(e, this.v);
}
let ft = !1;
function mr() {
  ft = !0;
}
let T = null;
function De(e) {
  T = e;
}
function Fe(e, t = !1, n) {
  T = {
    p: T,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
      /** @type {Effect} */
      g
    ),
    l: ft && !t ? { s: null, u: null, $: [] } : null
  };
}
function Ie(e) {
  var t = (
    /** @type {ComponentContext} */
    T
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mn(r);
  }
  return t.i = !0, T = t.p, /** @type {T} */
  {};
}
function Ke() {
  return !ft || T !== null && T.l === null;
}
let he = [];
function un() {
  var e = he;
  he = [], _t(e);
}
function Te(e) {
  if (he.length === 0 && !ze) {
    var t = he;
    queueMicrotask(() => {
      t === he && un();
    });
  }
  he.push(e);
}
function wr() {
  for (; he.length > 0; )
    un();
}
function cn(e) {
  var t = g;
  if (t === null)
    return p.f |= oe, e;
  if ((t.f & Ee) === 0 && (t.f & Ve) === 0)
    throw e;
  fe(e, t);
}
function fe(e, t) {
  for (; t !== null; ) {
    if ((t.f & pt) !== 0) {
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
const br = -7169;
function k(e, t) {
  e.f = e.f & br | t;
}
function St(e) {
  (e.f & q) !== 0 || e.deps === null ? k(e, C) : k(e, X);
}
function dn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & A) === 0 || (t.f & ye) === 0 || (t.f ^= ye, dn(
        /** @type {Derived} */
        t.deps
      ));
}
function vn(e, t, n) {
  (e.f & N) !== 0 ? t.add(e) : (e.f & X) !== 0 && n.add(e), dn(e.deps), k(e, C);
}
let Je = !1;
function yr(e) {
  var t = Je;
  try {
    return Je = !1, [e(), Je];
  } finally {
    Je = t;
  }
}
const ve = /* @__PURE__ */ new Set();
let m = null, Y = null, wt = null, ze = !1, dt = !1, ke = null, et = null;
var zt = 0;
let xr = 1;
class ue {
  id = xr++;
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
  #t = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #o = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #r = /* @__PURE__ */ new Map();
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
  #n = [];
  /**
   * Effects created while this batch was active.
   * @type {Effect[]}
   */
  #l = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #f = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #a = /* @__PURE__ */ new Map();
  /**
   * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
   * @type {Set<Effect>}
   */
  #u = /* @__PURE__ */ new Set();
  is_fork = !1;
  #d = !1;
  /** @type {Set<Batch>} */
  #v = /* @__PURE__ */ new Set();
  #h() {
    return this.is_fork || this.#r.size > 0;
  }
  #c() {
    for (const r of this.#v)
      for (const i of r.#r.keys()) {
        for (var t = !1, n = i; n.parent !== null; ) {
          if (this.#a.has(n)) {
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
    this.#a.has(t) || this.#a.set(t, { d: [], m: [] }), this.#u.delete(t);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#a.get(t);
    if (r) {
      this.#a.delete(t);
      for (var i of r.d)
        k(i, N), n(i);
      for (i of r.m)
        k(i, X), n(i);
    }
    this.#u.add(t);
  }
  #_() {
    if (zt++ > 1e3 && (ve.delete(this), kr()), !this.#h()) {
      for (const s of this.#s)
        this.#f.delete(s), k(s, N), this.schedule(s);
      for (const s of this.#f)
        k(s, X), this.schedule(s);
    }
    const t = this.#n;
    this.#n = [], this.apply();
    var n = ke = [], r = [], i = et = [];
    for (const s of t)
      try {
        this.#g(s, n, r);
      } catch (o) {
        throw pn(s), o;
      }
    if (m = null, i.length > 0) {
      var l = ue.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (ke = null, et = null, this.#h() || this.#c()) {
      this.#p(r), this.#p(n);
      for (const [s, o] of this.#a)
        _n(s, o);
    } else {
      this.#e.size === 0 && ve.delete(this), this.#s.clear(), this.#f.clear();
      for (const s of this.#t) s(this);
      this.#t.clear(), Ht(r), Ht(n), this.#i?.resolve();
    }
    var f = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      m
    );
    if (this.#n.length > 0) {
      const s = f ??= this;
      s.#n.push(...this.#n.filter((o) => !s.#n.includes(o)));
    }
    f !== null && (ve.add(f), f.#_());
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #g(t, n, r) {
    t.f ^= C;
    for (var i = t.first; i !== null; ) {
      var l = i.f, f = (l & (Z | be)) !== 0, s = f && (l & C) !== 0, o = s || (l & R) !== 0 || this.#a.has(i);
      if (!o && i.fn !== null) {
        f ? i.f ^= C : (l & Ve) !== 0 ? n.push(i) : Xe(i) && ((l & $) !== 0 && this.#f.add(i), Pe(i));
        var a = i.first;
        if (a !== null) {
          i = a;
          continue;
        }
      }
      for (; i !== null; ) {
        var u = i.next;
        if (u !== null) {
          i = u;
          break;
        }
        i = i.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #p(t) {
    for (var n = 0; n < t.length; n += 1)
      vn(t[n], this.#s, this.#f);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(t, n, r = !1) {
    t.v !== S && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & oe) === 0 && (this.current.set(t, [n, r]), Y?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    m = this;
  }
  deactivate() {
    m = null, Y = null;
  }
  flush() {
    try {
      dt = !0, m = this, this.#_();
    } finally {
      zt = 0, wt = null, ke = null, et = null, dt = !1, m = null, Y = null, ge.clear();
    }
  }
  discard() {
    for (const t of this.#o) t(this);
    this.#o.clear(), ve.delete(this);
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(t) {
    this.#l.push(t);
  }
  #x() {
    for (const u of ve) {
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
        if (t)
          for (const c of this.#u)
            u.unskip_effect(c, (v) => {
              (v.f & ($ | Ye)) !== 0 ? u.schedule(v) : u.#p([v]);
            });
        u.activate();
        var l = /* @__PURE__ */ new Set(), f = /* @__PURE__ */ new Map();
        for (var s of n)
          hn(s, i, l, f);
        f = /* @__PURE__ */ new Map();
        var o = [...u.current.keys()].filter(
          (c) => this.current.has(c) ? (
            /** @type {[any, boolean]} */
            this.current.get(c)[0] !== c
          ) : !0
        );
        for (const c of this.#l)
          (c.f & (I | R | gt)) === 0 && Tt(c, o, f) && ((c.f & (Ye | $)) !== 0 ? (k(c, N), u.schedule(c)) : u.#s.add(c));
        if (u.#n.length > 0) {
          u.apply();
          for (var a of u.#n)
            u.#g(a, [], []);
          u.#n = [];
        }
        u.deactivate();
      }
    }
    for (const u of ve)
      u.#v.has(this) && (u.#v.delete(this), u.#v.size === 0 && !u.#h() && (u.activate(), u.#_()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(t, n) {
    let r = this.#e.get(n) ?? 0;
    if (this.#e.set(n, r + 1), t) {
      let i = this.#r.get(n) ?? 0;
      this.#r.set(n, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n, r) {
    let i = this.#e.get(n) ?? 0;
    if (i === 1 ? this.#e.delete(n) : this.#e.set(n, i - 1), t) {
      let l = this.#r.get(n) ?? 0;
      l === 1 ? this.#r.delete(n) : this.#r.set(n, l - 1);
    }
    this.#d || r || (this.#d = !0, Te(() => {
      this.#d = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(t, n) {
    for (const r of t)
      this.#s.add(r);
    for (const r of n)
      this.#f.add(r);
    t.clear(), n.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(t) {
    this.#t.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#o.add(t);
  }
  settled() {
    return (this.#i ??= rn()).promise;
  }
  static ensure() {
    if (m === null) {
      const t = m = new ue();
      dt || (ve.add(m), ze || Te(() => {
        m === t && t.flush();
      }));
    }
    return m;
  }
  apply() {
    {
      Y = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (wt = t, t.b?.is_pending && (t.f & (Ve | Ze | ln)) !== 0 && (t.f & Ee) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ke !== null && n === g && (p === null || (p.f & A) === 0))
        return;
      if ((r & (be | Z)) !== 0) {
        if ((r & C) === 0)
          return;
        n.f ^= C;
      }
    }
    this.#n.push(n);
  }
}
function Er(e) {
  var t = ze;
  ze = !0;
  try {
    for (var n; ; ) {
      if (wr(), m === null)
        return (
          /** @type {T} */
          n
        );
      m.flush();
    }
  } finally {
    ze = t;
  }
}
function kr() {
  try {
    fr();
  } catch (e) {
    fe(e, wt);
  }
}
let te = null;
function Ht(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | R)) === 0 && Xe(r) && (te = /* @__PURE__ */ new Set(), Pe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dn(r), te?.size > 0)) {
        ge.clear();
        for (const i of te) {
          if ((i.f & (I | R)) !== 0) continue;
          const l = [i];
          let f = i.parent;
          for (; f !== null; )
            te.has(f) && (te.delete(f), l.push(f)), f = f.parent;
          for (let s = l.length - 1; s >= 0; s--) {
            const o = l[s];
            (o.f & (I | R)) === 0 && Pe(o);
          }
        }
        te.clear();
      }
    }
    te = null;
  }
}
function hn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & A) !== 0 ? hn(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Ye | $)) !== 0 && (l & N) === 0 && Tt(i, t, r) && (k(i, N), At(
        /** @type {Effect} */
        i
      ));
    }
}
function Tt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Me.call(t, i))
        return !0;
      if ((i.f & A) !== 0 && Tt(
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
function At(e) {
  m.schedule(e);
}
function _n(e, t) {
  if (!((e.f & Z) !== 0 && (e.f & C) !== 0)) {
    (e.f & N) !== 0 ? t.d.push(e) : (e.f & X) !== 0 && t.m.push(e), k(e, C);
    for (var n = e.first; n !== null; )
      _n(n, t), n = n.next;
  }
}
function pn(e) {
  k(e, C);
  for (var t = e.first; t !== null; )
    pn(t), t = t.next;
}
function Cr(e) {
  let t = 0, n = xe(0), r;
  return () => {
    Dt() && (w(n), Rt(() => (t === 0 && (r = at(() => e(() => He(n)))), t += 1, () => {
      Te(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, He(n));
      });
    })));
  };
}
var Sr = Ne | Oe;
function Tr(e, t, n, r) {
  new Ar(e, t, n, r);
}
class Ar {
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
  #t;
  /** @type {TemplateNode | null} */
  #o = null;
  /** @type {BoundaryProps} */
  #e;
  /** @type {((anchor: Node) => void)} */
  #r;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #l = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {DocumentFragment | null} */
  #f = null;
  #a = 0;
  #u = 0;
  #d = !1;
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
  #c = null;
  #_ = Cr(() => (this.#c = xe(this.#a), () => {
    this.#c = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#r = (l) => {
      var f = (
        /** @type {Effect} */
        g
      );
      f.b = this, f.f |= pt, r(l);
    }, this.parent = /** @type {Effect} */
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#i = Pt(() => {
      this.#b();
    }, Sr);
  }
  #g() {
    try {
      this.#n = B(() => this.#r(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #p(t) {
    const n = this.#e.failed;
    n && (this.#s = B(() => {
      n(
        this.#t,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #x() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#l = B(() => t(this.#t)), Te(() => {
      var n = this.#f = document.createDocumentFragment(), r = ae();
      n.append(r), this.#n = this.#w(() => B(() => this.#r(r))), this.#u === 0 && (this.#t.before(n), this.#f = null, me(
        /** @type {Effect} */
        this.#l,
        () => {
          this.#l = null;
        }
      ), this.#m(
        /** @type {Batch} */
        m
      ));
    }));
  }
  #b() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#a = 0, this.#n = B(() => {
        this.#r(this.#t);
      }), this.#u > 0) {
        var t = this.#f = document.createDocumentFragment();
        It(this.#n, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#e.pending
        );
        this.#l = B(() => n(this.#t));
      } else
        this.#m(
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
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vn(t, this.#v, this.#h);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #w(t) {
    var n = g, r = p, i = T;
    Q(this.#i), H(this.#i), De(this.#i.ctx);
    try {
      return ue.ensure(), t();
    } catch (l) {
      return cn(l), null;
    } finally {
      Q(n), H(r), De(i);
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
    this.#u += t, this.#u === 0 && (this.#m(n), this.#l && me(this.#l, () => {
      this.#l = null;
    }), this.#f && (this.#t.before(this.#f), this.#f = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#y(t, n), this.#a += t, !(!this.#c || this.#d) && (this.#d = !0, Te(() => {
      this.#d = !1, this.#c && Re(this.#c, this.#a);
    }));
  }
  get_effect_pending() {
    return this.#_(), w(
      /** @type {Source<number>} */
      this.#c
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#e.onerror;
    let r = this.#e.failed;
    if (!n && !r)
      throw t;
    this.#n && (P(this.#n), this.#n = null), this.#l && (P(this.#l), this.#l = null), this.#s && (P(this.#s), this.#s = null);
    var i = !1, l = !1;
    const f = () => {
      if (i) {
        pr();
        return;
      }
      i = !0, l && cr(), this.#s !== null && me(this.#s, () => {
        this.#s = null;
      }), this.#w(() => {
        this.#b();
      });
    }, s = (o) => {
      try {
        l = !0, n?.(o, f), l = !1;
      } catch (a) {
        fe(a, this.#i && this.#i.parent);
      }
      r && (this.#s = this.#w(() => {
        try {
          return B(() => {
            var a = (
              /** @type {Effect} */
              g
            );
            a.b = this, a.f |= pt, r(
              this.#t,
              () => o,
              () => f
            );
          });
        } catch (a) {
          return fe(
            a,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    Te(() => {
      var o;
      try {
        o = this.transform_error(t);
      } catch (a) {
        fe(a, this.#i && this.#i.parent);
        return;
      }
      o !== null && typeof o == "object" && typeof /** @type {any} */
      o.then == "function" ? o.then(
        s,
        /** @param {unknown} e */
        (a) => fe(a, this.#i && this.#i.parent)
      ) : s(o);
    });
  }
}
function Mr(e, t, n, r) {
  const i = Ke() ? We : mn;
  var l = e.filter((v) => !v.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var f = (
    /** @type {Effect} */
    g
  ), s = Nr(), o = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function a(v) {
    s();
    try {
      r(v);
    } catch (h) {
      (f.f & I) === 0 && fe(h, f);
    }
    rt();
  }
  if (n.length === 0) {
    o.then(() => a(t.map(i)));
    return;
  }
  var u = gn();
  function c() {
    Promise.all(n.map((v) => /* @__PURE__ */ Dr(v))).then((v) => a([...t.map(i), ...v])).catch((v) => fe(v, f)).finally(() => u());
  }
  o ? o.then(() => {
    s(), c(), rt();
  }) : c();
}
function Nr() {
  var e = (
    /** @type {Effect} */
    g
  ), t = p, n = T, r = (
    /** @type {Batch} */
    m
  );
  return function(l = !0) {
    Q(e), H(t), De(n), l && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function rt(e = !0) {
  Q(null), H(null), De(null), e && m?.deactivate();
}
function gn() {
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
function We(e) {
  var t = A | N, n = p !== null && (p.f & A) !== 0 ? (
    /** @type {Derived} */
    p
  ) : null;
  return g !== null && (g.f |= Oe), {
    ctx: T,
    deps: null,
    effects: null,
    equals: on,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      S
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    g
  );
  r === null && nr();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = xe(
    /** @type {V} */
    S
  ), f = !p, s = /* @__PURE__ */ new Map();
  return Yr(() => {
    var o = (
      /** @type {Effect} */
      g
    ), a = rn();
    i = a.promise;
    try {
      Promise.resolve(e()).then(a.resolve, a.reject).finally(rt);
    } catch (h) {
      a.reject(h), rt();
    }
    var u = (
      /** @type {Batch} */
      m
    );
    if (f) {
      if ((o.f & Ee) !== 0)
        var c = gn();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        s.get(u)?.reject(ne), s.delete(u);
      else {
        for (const h of s.values())
          h.reject(ne);
        s.clear();
      }
      s.set(u, a);
    }
    const v = (h, d = void 0) => {
      if (c) {
        var _ = d === ne;
        c(_);
      }
      if (!(d === ne || (o.f & I) !== 0)) {
        if (u.activate(), d)
          l.f |= oe, Re(l, d);
        else {
          (l.f & oe) !== 0 && (l.f ^= oe), Re(l, h);
          for (const [b, x] of s) {
            if (s.delete(b), b === u) break;
            x.reject(ne);
          }
        }
        u.deactivate();
      }
    };
    a.promise.then(v, (h) => v(null, h || "unknown"));
  }), Hr(() => {
    for (const o of s.values())
      o.reject(ne);
  }), new Promise((o) => {
    function a(u) {
      function c() {
        u === i ? o(l) : a(i);
      }
      u.then(c, c);
    }
    a(i);
  });
}
// @__NO_SIDE_EFFECTS__
function bt(e) {
  const t = /* @__PURE__ */ We(e);
  return On(t), t;
}
// @__NO_SIDE_EFFECTS__
function mn(e) {
  const t = /* @__PURE__ */ We(e);
  return t.equals = an, t;
}
function Rr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      P(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Pr(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & A) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Mt(e) {
  var t, n = g;
  Q(Pr(e));
  try {
    e.f &= ~ye, Rr(e), t = jn(e);
  } finally {
    Q(n);
  }
  return t;
}
function wn(e) {
  var t = Mt(e);
  if (!e.equals(t) && (e.wv = In(), (!m?.is_fork || e.deps === null) && (m !== null ? m.capture(e, t, !0) : e.v = t, e.deps === null))) {
    k(e, C);
    return;
  }
  ce || (Y !== null ? (Dt() || m?.is_fork) && Y.set(e, t) : St(e));
}
function Or(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(ne), t.teardown = Xn, t.ac = null, Ge(t, 0), Ot(t));
}
function bn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && Pe(t);
}
let yt = /* @__PURE__ */ new Set();
const ge = /* @__PURE__ */ new Map();
let yn = !1;
function xe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: on,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function W(e, t) {
  const n = xe(e);
  return On(n), n;
}
// @__NO_SIDE_EFFECTS__
function Fr(e, t = !1, n = !0) {
  const r = xe(e);
  return t || (r.equals = an), ft && n && T !== null && T.l !== null && (T.l.s ??= []).push(r), r;
}
function F(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!G || (p.f & gt) !== 0) && Ke() && (p.f & (A | $ | Ye | gt)) !== 0 && (z === null || !Me.call(z, e)) && ur();
  let r = n ? _e(t) : t;
  return Re(e, r, et);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    ge.set(e, ce ? t : e.v);
    var r = ue.ensure();
    if (r.capture(e, t), (e.f & A) !== 0) {
      const i = (
        /** @type {Derived} */
        e
      );
      (e.f & N) !== 0 && Mt(i), Y === null && St(i);
    }
    e.wv = In(), xn(e, N, n), Ke() && g !== null && (g.f & C) !== 0 && (g.f & (Z | be)) === 0 && (j === null ? Kr([e]) : j.push(e)), !r.is_fork && yt.size > 0 && !yn && Ir();
  }
  return t;
}
function Ir() {
  yn = !1;
  for (const e of yt)
    (e.f & C) !== 0 && k(e, X), Xe(e) && Pe(e);
  yt.clear();
}
function He(e) {
  F(e, e.v + 1);
}
function xn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = Ke(), l = r.length, f = 0; f < l; f++) {
      var s = r[f], o = s.f;
      if (!(!i && s === g)) {
        var a = (o & N) === 0;
        if (a && k(s, t), (o & A) !== 0) {
          var u = (
            /** @type {Derived} */
            s
          );
          Y?.delete(u), (o & ye) === 0 && (o & q && (s.f |= ye), xn(u, X, n));
        } else if (a) {
          var c = (
            /** @type {Effect} */
            s
          );
          (o & $) !== 0 && te !== null && te.add(c), n !== null ? n.push(c) : At(c);
        }
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Se in e)
    return e;
  const t = Ct(e);
  if (t !== Wn && t !== $n)
    return e;
  var n = /* @__PURE__ */ new Map(), r = tn(e), i = /* @__PURE__ */ W(0), l = we, f = (s) => {
    if (we === l)
      return s();
    var o = p, a = we;
    H(null), Zt(l);
    var u = s();
    return H(o), Zt(a), u;
  };
  return r && n.set("length", /* @__PURE__ */ W(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(s, o, a) {
        (!("value" in a) || a.configurable === !1 || a.enumerable === !1 || a.writable === !1) && or();
        var u = n.get(o);
        return u === void 0 ? f(() => {
          var c = /* @__PURE__ */ W(a.value);
          return n.set(o, c), c;
        }) : F(u, a.value, !0), !0;
      },
      deleteProperty(s, o) {
        var a = n.get(o);
        if (a === void 0) {
          if (o in s) {
            const u = f(() => /* @__PURE__ */ W(S));
            n.set(o, u), He(i);
          }
        } else
          F(a, S), He(i);
        return !0;
      },
      get(s, o, a) {
        if (o === Se)
          return e;
        var u = n.get(o), c = o in s;
        if (u === void 0 && (!c || Ce(s, o)?.writable) && (u = f(() => {
          var h = _e(c ? s[o] : S), d = /* @__PURE__ */ W(h);
          return d;
        }), n.set(o, u)), u !== void 0) {
          var v = w(u);
          return v === S ? void 0 : v;
        }
        return Reflect.get(s, o, a);
      },
      getOwnPropertyDescriptor(s, o) {
        var a = Reflect.getOwnPropertyDescriptor(s, o);
        if (a && "value" in a) {
          var u = n.get(o);
          u && (a.value = w(u));
        } else if (a === void 0) {
          var c = n.get(o), v = c?.v;
          if (c !== void 0 && v !== S)
            return {
              enumerable: !0,
              configurable: !0,
              value: v,
              writable: !0
            };
        }
        return a;
      },
      has(s, o) {
        if (o === Se)
          return !0;
        var a = n.get(o), u = a !== void 0 && a.v !== S || Reflect.has(s, o);
        if (a !== void 0 || g !== null && (!u || Ce(s, o)?.writable)) {
          a === void 0 && (a = f(() => {
            var v = u ? _e(s[o]) : S, h = /* @__PURE__ */ W(v);
            return h;
          }), n.set(o, a));
          var c = w(a);
          if (c === S)
            return !1;
        }
        return u;
      },
      set(s, o, a, u) {
        var c = n.get(o), v = o in s;
        if (r && o === "length")
          for (var h = a; h < /** @type {Source<number>} */
          c.v; h += 1) {
            var d = n.get(h + "");
            d !== void 0 ? F(d, S) : h in s && (d = f(() => /* @__PURE__ */ W(S)), n.set(h + "", d));
          }
        if (c === void 0)
          (!v || Ce(s, o)?.writable) && (c = f(() => /* @__PURE__ */ W(void 0)), F(c, _e(a)), n.set(o, c));
        else {
          v = c.v !== S;
          var _ = f(() => _e(a));
          F(c, _);
        }
        var b = Reflect.getOwnPropertyDescriptor(s, o);
        if (b?.set && b.set.call(u, a), !v) {
          if (r && typeof o == "string") {
            var x = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= x.v && F(x, y + 1);
          }
          He(i);
        }
        return !0;
      },
      ownKeys(s) {
        w(i);
        var o = Reflect.ownKeys(s).filter((c) => {
          var v = n.get(c);
          return v === void 0 || v.v !== S;
        });
        for (var [a, u] of n)
          u.v !== S && !(a in s) && o.push(a);
        return o;
      },
      setPrototypeOf() {
        ar();
      }
    }
  );
}
var Ut, En, kn, Cn;
function Lr() {
  if (Ut === void 0) {
    Ut = window, En = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kn = Ce(t, "firstChild").get, Cn = Ce(t, "nextSibling").get, Bt(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Bt(n) && (n.__t = void 0);
  }
}
function ae(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function it(e) {
  return (
    /** @type {TemplateNode | null} */
    kn.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ot(e) {
  return (
    /** @type {TemplateNode | null} */
    Cn.call(e)
  );
}
function E(e, t) {
  return /* @__PURE__ */ it(e);
}
function J(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ot(r);
  return r;
}
function jr(e) {
  e.textContent = "";
}
function Sn() {
  return !1;
}
function Br(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
let Vt = !1;
function qr() {
  Vt || (Vt = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        if (!e.defaultPrevented)
          for (
            const t of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            t.__on_r?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function Nt(e) {
  var t = p, n = g;
  H(null), Q(null);
  try {
    return e();
  } finally {
    H(t), Q(n);
  }
}
function Tn(e, t, n, r = n) {
  e.addEventListener(t, () => Nt(n));
  const i = e.__on_r;
  i ? e.__on_r = () => {
    i(), r(!0);
  } : e.__on_r = () => r(!0), qr();
}
function An(e) {
  g === null && (p === null && sr(), lr()), ce && ir();
}
function zr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = g;
  n !== null && (n.f & R) !== 0 && (e |= R);
  var r = {
    ctx: T,
    deps: null,
    nodes: null,
    f: e | N | q,
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
  };
  m?.register_created_effect(r);
  var i = r;
  if ((e & Ve) !== 0)
    ke !== null ? ke.push(r) : ue.ensure().schedule(r);
  else if (t !== null) {
    try {
      Pe(r);
    } catch (f) {
      throw P(r), f;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Oe) === 0 && (i = i.first, (e & $) !== 0 && (e & Ne) !== 0 && i !== null && (i.f |= Ne));
  }
  if (i !== null && (i.parent = n, n !== null && zr(i, n), p !== null && (p.f & A) !== 0 && (e & be) === 0)) {
    var l = (
      /** @type {Derived} */
      p
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function Dt() {
  return p !== null && !G;
}
function Hr(e) {
  const t = ie(Ze, null);
  return k(t, C), t.teardown = e, t;
}
function Yt(e) {
  An();
  var t = (
    /** @type {Effect} */
    g.f
  ), n = !p && (t & Z) !== 0 && (t & Ee) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      T
    );
    (r.e ??= []).push(e);
  } else
    return Mn(e);
}
function Mn(e) {
  return ie(Ve | sn, e);
}
function Ur(e) {
  return An(), ie(Ze | sn, e);
}
function Vr(e) {
  ue.ensure();
  const t = ie(be | Oe, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? me(t, () => {
      P(t), r(void 0);
    }) : (P(t), r(void 0));
  });
}
function Yr(e) {
  return ie(Ye | Oe, e);
}
function Rt(e, t = 0) {
  return ie(Ze | t, e);
}
function $e(e, t = [], n = [], r = []) {
  Mr(r, t, n, (i) => {
    ie(Ze, () => e(...i.map(w)));
  });
}
function Pt(e, t = 0) {
  var n = ie($ | t, e);
  return n;
}
function B(e) {
  return ie(Z | Oe, e);
}
function Nn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = p;
    Gt(!0), H(null);
    try {
      t.call(null);
    } finally {
      Gt(n), H(r);
    }
  }
}
function Ot(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Nt(() => {
      i.abort(ne);
    });
    var r = n.next;
    (n.f & be) !== 0 ? n.parent = null : P(n, t), n = r;
  }
}
function Gr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Z) === 0 && P(t), t = n;
  }
}
function P(e, t = !0) {
  var n = !1;
  (t || (e.f & Qn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Zr(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), k(e, qt), Ot(e, t && !n), Ge(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Nn(e), e.f ^= qt, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Dn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Zr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ ot(e);
    e.remove(), e = n;
  }
}
function Dn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function me(e, t, n = !0) {
  var r = [];
  Rn(e, r, !0);
  var i = () => {
    n && P(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var f = () => --l || i();
    for (var s of r)
      s.out(f);
  } else
    i();
}
function Rn(e, t, n) {
  if ((e.f & R) === 0) {
    e.f ^= R;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const s of r)
        (s.is_global || n) && t.push(s);
    for (var i = e.first; i !== null; ) {
      var l = i.next, f = (i.f & Ne) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & Z) !== 0 && (e.f & $) !== 0;
      Rn(i, t, f ? n : !1), i = l;
    }
  }
}
function Ft(e) {
  Pn(e, !0);
}
function Pn(e, t) {
  if ((e.f & R) !== 0) {
    e.f ^= R, (e.f & C) === 0 && (k(e, N), ue.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Ne) !== 0 || (n.f & Z) !== 0;
      Pn(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const f of l)
        (f.is_global || t) && f.in();
  }
}
function It(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ ot(n);
      t.append(n), n = i;
    }
}
let tt = !1, ce = !1;
function Gt(e) {
  ce = e;
}
let p = null, G = !1;
function H(e) {
  p = e;
}
let g = null;
function Q(e) {
  g = e;
}
let z = null;
function On(e) {
  p !== null && (z === null ? z = [e] : z.push(e));
}
let D = null, O = 0, j = null;
function Kr(e) {
  j = e;
}
let Fn = 1, pe = 0, we = pe;
function Zt(e) {
  we = e;
}
function In() {
  return ++Fn;
}
function Xe(e) {
  var t = e.f;
  if ((t & N) !== 0)
    return !0;
  if (t & A && (e.f &= ~ye), (t & X) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (Xe(
        /** @type {Derived} */
        l
      ) && wn(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & q) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Y === null && k(e, C);
  }
  return !1;
}
function Ln(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(z !== null && Me.call(z, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & A) !== 0 ? Ln(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? k(l, N) : (l.f & C) !== 0 && k(l, X), At(
        /** @type {Effect} */
        l
      ));
    }
}
function jn(e) {
  var t = D, n = O, r = j, i = p, l = z, f = T, s = G, o = we, a = e.f;
  D = /** @type {null | Value[]} */
  null, O = 0, j = null, p = (a & (Z | be)) === 0 ? e : null, z = null, De(e.ctx), G = !1, we = ++pe, e.ac !== null && (Nt(() => {
    e.ac.abort(ne);
  }), e.ac = null);
  try {
    e.f |= mt;
    var u = (
      /** @type {Function} */
      e.fn
    ), c = u();
    e.f |= Ee;
    var v = e.deps, h = m?.is_fork;
    if (D !== null) {
      var d;
      if (h || Ge(e, O), v !== null && O > 0)
        for (v.length = O + D.length, d = 0; d < D.length; d++)
          v[O + d] = D[d];
      else
        e.deps = v = D;
      if (Dt() && (e.f & q) !== 0)
        for (d = O; d < v.length; d++)
          (v[d].reactions ??= []).push(e);
    } else !h && v !== null && O < v.length && (Ge(e, O), v.length = O);
    if (Ke() && j !== null && !G && v !== null && (e.f & (A | X | N)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      j.length; d++)
        Ln(
          j[d],
          /** @type {Effect} */
          e
        );
    if (i !== null && i !== e) {
      if (pe++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = pe;
      if (t !== null)
        for (const _ of t)
          _.rv = pe;
      j !== null && (r === null ? r = j : r.push(.../** @type {Source[]} */
      j));
    }
    return (e.f & oe) !== 0 && (e.f ^= oe), c;
  } catch (_) {
    return cn(_);
  } finally {
    e.f ^= mt, D = t, O = n, j = r, p = i, z = l, De(f), G = s, we = o;
  }
}
function Wr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Zn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & A) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (D === null || !Me.call(D, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & q) !== 0 && (l.f ^= q, l.f &= ~ye), l.v !== S && St(l), Or(l), Ge(l, 0);
  }
}
function Ge(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Wr(e, n[r]);
}
function Pe(e) {
  var t = e.f;
  if ((t & I) === 0) {
    k(e, C);
    var n = g, r = tt;
    g = e, tt = !0;
    try {
      (t & ($ | ln)) !== 0 ? Gr(e) : Ot(e), Nn(e);
      var i = jn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Fn;
      var l;
    } finally {
      tt = r, g = n;
    }
  }
}
async function $r() {
  await Promise.resolve(), Er();
}
function w(e) {
  var t = e.f, n = (t & A) !== 0;
  if (p !== null && !G) {
    var r = g !== null && (g.f & I) !== 0;
    if (!r && (z === null || !Me.call(z, e))) {
      var i = p.deps;
      if ((p.f & mt) !== 0)
        e.rv < pe && (e.rv = pe, D === null && i !== null && i[O] === e ? O++ : D === null ? D = [e] : D.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : Me.call(l, p) || l.push(p);
      }
    }
  }
  if (ce && ge.has(e))
    return ge.get(e);
  if (n) {
    var f = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var s = f.v;
      return ((f.f & C) === 0 && f.reactions !== null || qn(f)) && (s = Mt(f)), ge.set(f, s), s;
    }
    var o = (f.f & q) === 0 && !G && p !== null && (tt || (p.f & q) !== 0), a = (f.f & Ee) === 0;
    Xe(f) && (o && (f.f |= q), wn(f)), o && !a && (bn(f), Bn(f));
  }
  if (Y?.has(e))
    return Y.get(e);
  if ((e.f & oe) !== 0)
    throw e.v;
  return e.v;
}
function Bn(e) {
  if (e.f |= q, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & A) !== 0 && (t.f & q) === 0 && (bn(
        /** @type {Derived} */
        t
      ), Bn(
        /** @type {Derived} */
        t
      ));
}
function qn(e) {
  if (e.v === S) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ge.has(t) || (t.f & A) !== 0 && qn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function at(e) {
  var t = G;
  try {
    return G = !0, e();
  } finally {
    G = t;
  }
}
function Xr(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (Se in e)
      xt(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && Se in n && xt(n);
      }
  }
}
function xt(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        xt(e[r], t);
      } catch {
      }
    const n = Ct(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = nn(n);
      for (let i in r) {
        const l = r[i].get;
        if (l)
          try {
            l.call(e);
          } catch {
          }
      }
    }
  }
}
const Kt = globalThis.__host ?? globalThis.Deno?.core?.ops ?? null;
function Jr(e, ...t) {
  Kt?.[e] ? Kt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function lt(e, t) {
  Jr("op_set_text", e, t);
}
const Qr = ["touchstart", "touchmove"];
function ei(e) {
  return Qr.includes(e);
}
const Be = Symbol("events"), zn = /* @__PURE__ */ new Set(), Et = /* @__PURE__ */ new Set();
function ut(e, t, n) {
  (t[Be] ??= {})[e] = n;
}
function ct(e) {
  for (var t = 0; t < e.length; t++)
    zn.add(e[t]);
  for (var n of Et)
    n(e);
}
let Wt = null;
function $t(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  Wt = e;
  var f = 0, s = Wt === e && e[Be];
  if (s) {
    var o = i.indexOf(s);
    if (o !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[Be] = t;
      return;
    }
    var a = i.indexOf(t);
    if (a === -1)
      return;
    o <= a && (f = o);
  }
  if (l = /** @type {Element} */
  i[f] || e.target, l !== t) {
    Kn(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var u = p, c = g;
    H(null), Q(null);
    try {
      for (var v, h = []; l !== null; ) {
        var d = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l[Be]?.[r];
          _ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && _.call(l, e);
        } catch (b) {
          v ? h.push(b) : v = b;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        l = d;
      }
      if (v) {
        for (let b of h)
          queueMicrotask(() => {
            throw b;
          });
        throw v;
      }
    } finally {
      e[Be] = t, delete e.currentTarget, H(u), Q(c);
    }
  }
}
const ti = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function ni(e) {
  return (
    /** @type {string} */
    ti?.createHTML(e) ?? e
  );
}
function Hn(e) {
  var t = Br("template");
  return t.innerHTML = ni(e.replaceAll("<!>", "<!---->")), t.content;
}
function Lt(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function L(e, t) {
  var n = (t & _r) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Hn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ it(r));
    var l = (
      /** @type {TemplateNode} */
      n || En ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Lt(l, l), l;
  };
}
// @__NO_SIDE_EFFECTS__
function ri(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), i = `<${n}>${r ? e : "<!>" + e}</${n}>`, l;
  return () => {
    if (!l) {
      var f = (
        /** @type {DocumentFragment} */
        Hn(i)
      ), s = (
        /** @type {Element} */
        /* @__PURE__ */ it(f)
      );
      l = /** @type {Element} */
      /* @__PURE__ */ it(s);
    }
    var o = (
      /** @type {TemplateNode} */
      l.cloneNode(!0)
    );
    return Lt(o, o), o;
  };
}
// @__NO_SIDE_EFFECTS__
function jt(e, t) {
  return /* @__PURE__ */ ri(e, t, "svg");
}
function ii(e = "") {
  {
    var t = ae(e + "");
    return Lt(t, t), t;
  }
}
function M(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function li(e, t) {
  return si(e, t);
}
const Qe = /* @__PURE__ */ new Map();
function si(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: f = !0, transformError: s }) {
  Lr();
  var o = void 0, a = Vr(() => {
    var u = n ?? t.appendChild(ae());
    Tr(
      /** @type {TemplateNode} */
      u,
      {
        pending: () => {
        }
      },
      (h) => {
        Fe({});
        var d = (
          /** @type {ComponentContext} */
          T
        );
        l && (d.c = l), i && (r.$$events = i), o = e(h, r) || {}, Ie();
      },
      s
    );
    var c = /* @__PURE__ */ new Set(), v = (h) => {
      for (var d = 0; d < h.length; d++) {
        var _ = h[d];
        if (!c.has(_)) {
          c.add(_);
          var b = ei(_);
          for (const U of [t, document]) {
            var x = Qe.get(U);
            x === void 0 && (x = /* @__PURE__ */ new Map(), Qe.set(U, x));
            var y = x.get(_);
            y === void 0 ? (U.addEventListener(_, $t, { passive: b }), x.set(_, 1)) : x.set(_, y + 1);
          }
        }
      }
    };
    return v(st(zn)), Et.add(v), () => {
      for (var h of c)
        for (const b of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Qe.get(b)
          ), _ = (
            /** @type {number} */
            d.get(h)
          );
          --_ == 0 ? (b.removeEventListener(h, $t), d.delete(h), d.size === 0 && Qe.delete(b)) : d.set(h, _);
        }
      Et.delete(v), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return fi.set(o, a), o;
}
let fi = /* @__PURE__ */ new WeakMap();
class oi {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #t = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #o = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #e = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #i = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#i = n;
  }
  /**
   * @param {Batch} batch
   */
  #n = (t) => {
    if (this.#t.has(t)) {
      var n = (
        /** @type {Key} */
        this.#t.get(t)
      ), r = this.#o.get(n);
      if (r)
        Ft(r), this.#r.delete(n);
      else {
        var i = this.#e.get(n);
        i && (this.#o.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [l, f] of this.#t) {
        if (this.#t.delete(l), l === t)
          break;
        const s = this.#e.get(f);
        s && (P(s.effect), this.#e.delete(f));
      }
      for (const [l, f] of this.#o) {
        if (l === n || this.#r.has(l)) continue;
        const s = () => {
          if (Array.from(this.#t.values()).includes(l)) {
            var a = document.createDocumentFragment();
            It(f, a), a.append(ae()), this.#e.set(l, { effect: f, fragment: a });
          } else
            P(f);
          this.#r.delete(l), this.#o.delete(l);
        };
        this.#i || !r ? (this.#r.add(l), me(f, s, !1)) : s();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #l = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (P(i.effect), this.#e.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      m
    ), i = Sn();
    if (n && !this.#o.has(t) && !this.#e.has(t))
      if (i) {
        var l = document.createDocumentFragment(), f = ae();
        l.append(f), this.#e.set(t, {
          effect: B(() => n(f)),
          fragment: l
        });
      } else
        this.#o.set(
          t,
          B(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [s, o] of this.#o)
        s === t ? r.unskip_effect(o) : r.skip_effect(o);
      for (const [s, o] of this.#e)
        s === t ? r.unskip_effect(o.effect) : r.skip_effect(o.effect);
      r.oncommit(this.#n), r.ondiscard(this.#l);
    } else
      this.#n(r);
  }
}
function ai(e, t) {
  return t;
}
function ui(e, t, n) {
  for (var r = [], i = t.length, l, f = t.length, s = 0; s < i; s++) {
    let c = t[s];
    me(
      c,
      () => {
        if (l) {
          if (l.pending.delete(c), l.done.add(c), l.pending.size === 0) {
            var v = (
              /** @type {Set<EachOutroGroup>} */
              e.outrogroups
            );
            kt(e, st(l.done)), v.delete(l), v.size === 0 && (e.outrogroups = null);
          }
        } else
          f -= 1;
      },
      !1
    );
  }
  if (f === 0) {
    var o = r.length === 0 && n !== null;
    if (o) {
      var a = (
        /** @type {Element} */
        n
      ), u = (
        /** @type {Element} */
        a.parentNode
      );
      jr(u), u.append(a), e.items.clear();
    }
    kt(e, t, !o);
  } else
    l = {
      pending: new Set(t),
      done: /* @__PURE__ */ new Set()
    }, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(l);
}
function kt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = /* @__PURE__ */ new Set();
    for (const f of e.pending.values())
      for (const s of f)
        r.add(
          /** @type {EachItem} */
          e.items.get(s).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= re;
      const f = document.createDocumentFragment();
      It(l, f);
    } else
      P(t[i], n);
  }
}
var Xt;
function ci(e, t, n, r, i, l = null) {
  var f = e, s = /* @__PURE__ */ new Map();
  {
    var o = (
      /** @type {Element} */
      e
    );
    f = o.appendChild(ae());
  }
  var a = null, u = /* @__PURE__ */ mn(() => {
    var y = n();
    return tn(y) ? y : y == null ? [] : st(y);
  }), c, v = /* @__PURE__ */ new Map(), h = !0;
  function d(y) {
    (x.effect.f & I) === 0 && (x.pending.delete(y), x.fallback = a, di(x, c, f, t, r), a !== null && (c.length === 0 ? (a.f & re) === 0 ? Ft(a) : (a.f ^= re, qe(a, null, f)) : me(a, () => {
      a = null;
    })));
  }
  function _(y) {
    x.pending.delete(y);
  }
  var b = Pt(() => {
    c = /** @type {V[]} */
    w(u);
    for (var y = c.length, U = /* @__PURE__ */ new Set(), K = (
      /** @type {Batch} */
      m
    ), de = Sn(), le = 0; le < y; le += 1) {
      var Le = c[le], V = r(Le, le), ee = h ? null : s.get(V);
      ee ? (ee.v && Re(ee.v, Le), ee.i && Re(ee.i, le), de && K.unskip_effect(ee.e)) : (ee = vi(
        s,
        h ? f : Xt ??= ae(),
        Le,
        V,
        le,
        i,
        t,
        n
      ), h || (ee.e.f |= re), s.set(V, ee)), U.add(V);
    }
    if (y === 0 && l && !a && (h ? a = B(() => l(f)) : (a = B(() => l(Xt ??= ae())), a.f |= re)), y > U.size && rr(), !h)
      if (v.set(K, U), de) {
        for (const [Yn, Gn] of s)
          U.has(Yn) || K.skip_effect(Gn.e);
        K.oncommit(d), K.ondiscard(_);
      } else
        d(K);
    w(u);
  }), x = { effect: b, items: s, pending: v, outrogroups: null, fallback: a };
  h = !1;
}
function je(e) {
  for (; e !== null && (e.f & Z) === 0; )
    e = e.next;
  return e;
}
function di(e, t, n, r, i) {
  var l = t.length, f = e.items, s = je(e.effect.first), o, a = null, u = [], c = [], v, h, d, _;
  for (_ = 0; _ < l; _ += 1) {
    if (v = t[_], h = i(v, _), d = /** @type {EachItem} */
    f.get(h).e, e.outrogroups !== null)
      for (const V of e.outrogroups)
        V.pending.delete(d), V.done.delete(d);
    if ((d.f & R) !== 0 && Ft(d), (d.f & re) !== 0)
      if (d.f ^= re, d === s)
        qe(d, null, n);
      else {
        var b = a ? a.next : s;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), se(e, a, d), se(e, d, b), qe(d, b, n), a = d, u = [], c = [], s = je(a.next);
        continue;
      }
    if (d !== s) {
      if (o !== void 0 && o.has(d)) {
        if (u.length < c.length) {
          var x = c[0], y;
          a = x.prev;
          var U = u[0], K = u[u.length - 1];
          for (y = 0; y < u.length; y += 1)
            qe(u[y], x, n);
          for (y = 0; y < c.length; y += 1)
            o.delete(c[y]);
          se(e, U.prev, K.next), se(e, a, U), se(e, K, x), s = x, a = K, _ -= 1, u = [], c = [];
        } else
          o.delete(d), qe(d, s, n), se(e, d.prev, d.next), se(e, d, a === null ? e.effect.first : a.next), se(e, a, d), a = d;
        continue;
      }
      for (u = [], c = []; s !== null && s !== d; )
        (o ??= /* @__PURE__ */ new Set()).add(s), c.push(s), s = je(s.next);
      if (s === null)
        continue;
    }
    (d.f & re) === 0 && u.push(d), a = d, s = je(d.next);
  }
  if (e.outrogroups !== null) {
    for (const V of e.outrogroups)
      V.pending.size === 0 && (kt(e, st(V.done)), e.outrogroups?.delete(V));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (s !== null || o !== void 0) {
    var de = [];
    if (o !== void 0)
      for (d of o)
        (d.f & R) === 0 && de.push(d);
    for (; s !== null; )
      (s.f & R) === 0 && s !== e.fallback && de.push(s), s = je(s.next);
    var le = de.length;
    if (le > 0) {
      var Le = l === 0 ? n : null;
      ui(e, de, Le);
    }
  }
}
function vi(e, t, n, r, i, l, f, s) {
  var o = (f & dr) !== 0 ? (f & hr) === 0 ? /* @__PURE__ */ Fr(n, !1, !1) : xe(n) : null, a = (f & vr) !== 0 ? xe(i) : null;
  return {
    v: o,
    i: a,
    e: B(() => (l(t, o ?? n, a ?? i, s), () => {
      e.delete(r);
    }))
  };
}
function qe(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & re) === 0 ? (
      /** @type {EffectNodes} */
      t.nodes.start
    ) : n; r !== null; ) {
      var f = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ot(r)
      );
      if (l.before(r), r === i)
        return;
      r = f;
    }
}
function se(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Ue(e, t, ...n) {
  var r = new oi(e);
  Pt(() => {
    const i = t() ?? null;
    r.ensure(i, i && ((l) => i(l, ...n)));
  }, Ne);
}
function hi(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r === "" ? null : r;
}
function _i(e, t, n, r, i, l) {
  var f = e.__className;
  if (f !== n || f === void 0) {
    var s = hi(n);
    s == null ? e.removeAttribute("class") : e.className = s, e.__className = n;
  }
  return l;
}
const pi = Symbol("is custom element"), gi = Symbol("is html");
function nt(e, t, n, r) {
  var i = mi(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[tr] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && wi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function mi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [pi]: e.nodeName.includes("-"),
      [gi]: e.namespaceURI === fn
    }
  );
}
var Jt = /* @__PURE__ */ new Map();
function wi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Jt.get(t);
  if (n) return n;
  Jt.set(t, n = []);
  for (var r, i = e, l = Element.prototype; l !== i; ) {
    r = nn(i);
    for (var f in r)
      r[f].set && n.push(f);
    i = Ct(i);
  }
  return n;
}
function bi(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  Tn(e, "input", async (i) => {
    var l = i ? e.defaultValue : e.value;
    if (l = vt(e) ? ht(l) : l, n(l), m !== null && r.add(m), await $r(), l !== (l = t())) {
      var f = e.selectionStart, s = e.selectionEnd, o = e.value.length;
      if (e.value = l ?? "", s !== null) {
        var a = e.value.length;
        f === s && s === o && a > o ? (e.selectionStart = a, e.selectionEnd = a) : (e.selectionStart = f, e.selectionEnd = Math.min(s, a));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  at(t) == null && e.value && (n(vt(e) ? ht(e.value) : e.value), m !== null && r.add(m)), Rt(() => {
    var i = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        m
      );
      if (r.has(l))
        return;
    }
    vt(e) && i === ht(e.value) || e.type === "date" && !i && !e.value || i !== e.value && (e.value = i ?? "");
  });
}
function yi(e, t, n = t) {
  Tn(e, "change", (r) => {
    var i = r ? e.defaultChecked : e.checked;
    n(i);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  at(t) == null && n(e.checked), Rt(() => {
    var r = t();
    e.checked = !!r;
  });
}
function vt(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function ht(e) {
  return e === "" ? null : +e;
}
function Un(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    T
  ), n = t.l.u;
  if (!n) return;
  let r = () => Xr(t.s);
  if (e) {
    let i = 0, l = (
      /** @type {Record<string, any>} */
      {}
    );
    const f = /* @__PURE__ */ We(() => {
      let s = !1;
      const o = t.s;
      for (const a in o)
        o[a] !== l[a] && (l[a] = o[a], s = !0);
      return s && i++, i;
    });
    r = () => w(f);
  }
  n.b.length && Ur(() => {
    Qt(t, r), _t(n.b);
  }), Yt(() => {
    const i = at(() => n.m.map(Jn));
    return () => {
      for (const l of i)
        typeof l == "function" && l();
    };
  }), n.a.length && Yt(() => {
    Qt(t, r), _t(n.a);
  });
}
function Qt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) w(n);
  t();
}
function Vn(e, t, n, r) {
  var i = (
    /** @type {V} */
    r
  ), l = !0, f = () => (l && (l = !1, i = /** @type {V} */
  r), i);
  let s;
  {
    var o = Se in e || er in e;
    s = Ce(e, t)?.set ?? (o && t in e ? (b) => e[t] = b : void 0);
  }
  var a, u = !1;
  [a, u] = yr(() => (
    /** @type {V} */
    e[t]
  ));
  var c;
  if (c = () => {
    var b = (
      /** @type {V} */
      e[t]
    );
    return b === void 0 ? f() : (l = !0, b);
  }, s) {
    var v = e.$$legacy;
    return (
      /** @type {() => V} */
      (function(b, x) {
        return arguments.length > 0 ? ((!x || v || u) && s(x ? c() : b), b) : c();
      })
    );
  }
  var h = !1, d = /* @__PURE__ */ We(() => (h = !1, c()));
  w(d);
  var _ = (
    /** @type {Effect} */
    g
  );
  return (
    /** @type {() => V} */
    (function(b, x) {
      if (arguments.length > 0) {
        const y = x ? w(d) : _e(b);
        return F(d, y), h = !0, i !== void 0 && (i = y), b;
      }
      return ce && h || (_.f & I) !== 0 ? d.v : w(d);
    })
  );
}
mr();
var xi = /* @__PURE__ */ L('<div class="mx-auto h-[80vh] max-h-[700px] w-full max-w-6xl overflow-hidden rounded border border-slate-200 bg-white p-5 shadow-2xl"><div class="flex h-full flex-col items-center justify-center gap-2"><!> <!> <div class="mt-auto flex h-auto w-full flex-col items-end justify-end"><!></div></div></div>');
function Ei(e, t) {
  var n = xi(), r = E(n), i = E(r);
  Ue(i, () => t.head);
  var l = J(i, 2);
  Ue(l, () => t.body);
  var f = J(l, 2), s = E(f);
  Ue(s, () => t.footer), M(e, n);
}
var ki = /* @__PURE__ */ jt('<svg class="w-3 h-3" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z" fill="currentColor"></path></svg>');
function Ci(e) {
  var t = ki();
  M(e, t);
}
var Si = /* @__PURE__ */ L('<button type="button" class="p-5" aria-label="remove item" title="remove item"><!></button>');
function Ti(e, t) {
  var n = Si(), r = E(n);
  Ci(r), ut("click", n, function(...i) {
    t.handler?.apply(this, i);
  }), M(e, n);
}
ct(["click"]);
var Ai = /* @__PURE__ */ L(`<label class="me-1 inline-flex cursor-pointer items-center"><input type="checkbox" class="peer sr-only"/> <div class="peer relative h-5 w-9 rounded-full border-gray-600 bg-slate-600 after:absolute after:start-[2px] after:top-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-green-800"></div></label>`);
function Mi(e, t) {
  Fe(t, !0);
  let n = Vn(t, "value");
  var r = Ai(), i = E(r), l;
  $e(() => {
    nt(i, "aria-label", n() ? "mark as pending" : "mark as done"), l !== (l = n()) && (i.value = (i.__value = n()) ?? "");
  }), ut("change", i, () => t.onChange()), yi(i, n), M(e, r), Ie();
}
ct(["change"]);
const Ni = () => {
  let e = /* @__PURE__ */ W(_e([]));
  const t = (f) => {
    F(e, [...w(e), f], !0);
  }, n = (f) => {
    F(e, w(e).filter((s) => s.id !== f), !0);
  }, r = (f) => {
    F(
      e,
      w(e).map((s) => s.id === f ? { ...s, completed: !s.completed } : s),
      !0
    );
  }, i = /* @__PURE__ */ bt(() => w(e).filter((f) => !f.completed).length), l = /* @__PURE__ */ bt(() => w(e).length - w(i));
  return {
    get todos() {
      return w(e);
    },
    get pending() {
      return w(i);
    },
    get completed() {
      return w(l);
    },
    add: t,
    toggle: r,
    remove: n
  };
}, Ae = Ni();
var Di = /* @__PURE__ */ L('<div class="rounded-md bg-slate-200/90 px-8"><div class="flex items-center justify-between"><span class="truncate pr-3 text-base font-medium text-[#07074D]"> </span> <div class="flex gap-2"><!> <!></div></div></div>'), Ri = /* @__PURE__ */ L('<div class="flex w-full max-h-[80vh] h-full flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2"></div>');
function Pi(e, t) {
  Fe(t, !1);
  const n = (l) => {
    Ae.remove(l);
  }, r = (l) => {
    Ae.toggle(l);
  };
  Un();
  var i = Ri();
  ci(i, 5, () => Ae.todos, ai, (l, f) => {
    var s = Di(), o = E(s), a = E(o), u = E(a), c = J(a, 2), v = E(c);
    Mi(v, {
      get value() {
        return w(f).completed;
      },
      onChange: () => r(w(f).id)
    });
    var h = J(v, 2);
    Ti(h, { handler: () => n(w(f).id) }), $e(() => lt(u, w(f).text)), M(l, s);
  }), M(e, i), Ie();
}
var Oi = /* @__PURE__ */ L('<button aria-label="primary button" type="button"><!></button>');
function Fi(e, t) {
  var n = Oi(), r = E(n);
  Ue(r, () => t.children), $e(() => {
    n.disabled = t.disabled, _i(n, 1, `h-10 w-full transform cursor-pointer rounded px-4 py-2 text-sm font-medium capitalize text-white transition-colors duration-300 focus:outline-none focus:ring sm:mx-2 sm:mt-0 sm:w-1/2 lg:w-full ${t.disabled ? "bg-slate-600 " : "bg-emerald-600 hover:bg-emerald-500"}`);
  }), ut("click", n, function(...i) {
    t.handler?.apply(this, i);
  }), M(e, n);
}
ct(["click"]);
var Ii = /* @__PURE__ */ L('<div class="relative w-full"><input required="" type="text" class="peer h-10 w-full rounded px-4 text-left text-base font-medium leading-6 tracking-tight ring-2 ring-gray-200 focus:outline-none focus:ring-blue-500"/> <label class="absolute left-0 ml-1 -translate-y-2.5 translate-x-2 bg-white px-1 text-xs font-medium duration-100 ease-linear"> </label></div>');
function Li(e, t) {
  Fe(t, !0);
  let n = Vn(t, "value");
  var r = Ii(), i = E(r), l = J(i, 2), f = E(l);
  $e(() => {
    nt(i, "id", t.name), nt(i, "name", t.name), nt(l, "for", t.name), lt(f, t.label);
  }), ut("keyup", i, function(...s) {
    t.onkeyUp?.apply(this, s);
  }), bi(i, n), M(e, r), Ie();
}
ct(["keyup"]);
var ji = /* @__PURE__ */ L('<div class="flex w-full flex-row items-center justify-center gap-2 border-t border-slate-200 pt-5"><div class="lg:w2/3 w-full"><!></div> <div class="w-full lg:w-1/3"><!></div></div>');
function Bi(e, t) {
  Fe(t, !0);
  let n = /* @__PURE__ */ W("");
  const r = () => {
    w(n) && (Ae.add({
      completed: !1,
      created_at: /* @__PURE__ */ new Date(),
      text: w(n),
      id: (/* @__PURE__ */ new Date()).toTimeString(),
      updated_at: /* @__PURE__ */ new Date()
    }), F(n, ""));
  }, i = (c) => {
    c.key === "Enter" && r();
  }, l = /* @__PURE__ */ bt(() => !w(n) || w(n).length < 1);
  var f = ji(), s = E(f), o = E(s);
  Li(o, {
    label: "Todo",
    name: "todoinput",
    onkeyUp: i,
    get value() {
      return w(n);
    },
    set value(c) {
      F(n, c, !0);
    }
  });
  var a = J(s, 2), u = E(a);
  Fi(u, {
    handler: r,
    get disabled() {
      return w(l);
    },
    children: (c, v) => {
      var h = ii("Add");
      M(c, h);
    }
  }), M(e, f), Ie();
}
var qi = /* @__PURE__ */ L('<div draggable="true" role="button" title="Hover chip" aria-disabled="true" class="active:text-primary flex h-8 w-full min-w-40 items-center justify-center rounded-full bg-gray-700 px-3 text-gray-300"><div class="w-1/3"><!></div> <div class="flex w-1/3 items-center justify-center text-sm font-medium pr-5"> </div> <div class="flex w-1/3 items-center justify-center text-sm font-medium rounded-full bg-slate-200 text-slate-900"> </div></div>');
function en(e, t) {
  var n = qi(), r = E(n), i = E(r);
  Ue(i, () => t.children);
  var l = J(r, 2), f = E(l), s = J(l, 2), o = E(s);
  $e(() => {
    lt(f, t.text), lt(o, t.count);
  }), M(e, n);
}
var zi = /* @__PURE__ */ jt('<svg class="h-5 w-5" viewBox="0 -1.5 11 11" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Dribbble-Light-Preview" transform="translate(-304.000000, -366.000000)" fill="currentColor"><g id="icons" transform="translate(56.000000, 160.000000)"><polygon id="done_mini-[#1484]" points="259 207.6 252.2317 214 252.2306 213.999 252.2306 214 248 210 249.6918 208.4 252.2306 210.8 257.3082 206"></polygon></g></g></g></svg>');
function Hi(e) {
  var t = zi();
  M(e, t);
}
var Ui = /* @__PURE__ */ jt('<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.8284 6.75736C12.3807 6.75736 12.8284 7.20507 12.8284 7.75736V12.7245L16.3553 14.0653C16.8716 14.2615 17.131 14.8391 16.9347 15.3553C16.7385 15.8716 16.1609 16.131 15.6447 15.9347L11.4731 14.349C11.085 14.2014 10.8284 13.8294 10.8284 13.4142V7.75736C10.8284 7.20507 11.2761 6.75736 11.8284 6.75736Z" fill="currentColor"></path></svg>');
function Vi(e) {
  var t = Ui();
  M(e, t);
}
var Yi = /* @__PURE__ */ L('<div class="text-red-500"><!></div>'), Gi = /* @__PURE__ */ L('<div class="text-green-500"><!></div>'), Zi = /* @__PURE__ */ L('<div class="mx-3 mb-0 flex w-full justify-between border-b border-slate-200 px-1 pb-2 pt-3"><span class="text-xl font-semibold text-slate-600">Svelte 5 Runes Todo</span> <div class="flex gap-2"><!> <!></div></div>');
function Ki(e, t) {
  Fe(t, !1), Un();
  var n = Zi(), r = J(E(n), 2), i = E(r);
  en(i, {
    text: "Pending",
    get count() {
      return Ae.pending;
    },
    children: (f, s) => {
      var o = Yi(), a = E(o);
      Vi(a), M(f, o);
    }
  });
  var l = J(i, 2);
  en(l, {
    text: "Done",
    get count() {
      return Ae.completed;
    },
    children: (f, s) => {
      var o = Gi(), a = E(o);
      Hi(a), M(f, o);
    }
  }), M(e, n), Ie();
}
var Wi = /* @__PURE__ */ L('<div class="flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-r from-indigo-500 to-cyan-400"><!></div>');
function $i(e) {
  var t = Wi(), n = E(t);
  Ei(n, {
    head: (f) => {
      Ki(f, {});
    },
    body: (f) => {
      Pi(f, {});
    },
    footer: (f) => {
      Bi(f, {});
    }
  }), M(e, t);
}
function Ji(e) {
  li($i, { target: e });
}
export {
  Ji as rvst_mount
};

var Sr = Array.isArray, In = Array.prototype.indexOf, Rt = Array.prototype.includes, Pn = Array.from, Rn = Object.defineProperty, It = Object.getOwnPropertyDescriptor, kn = Object.getOwnPropertyDescriptors, Nn = Object.prototype, Mn = Array.prototype, xr = Object.getPrototypeOf, tr = Object.isExtensible;
const Gt = () => {
};
function Ln(t) {
  for (var e = 0; e < t.length; e++)
    t[e]();
}
function Cr() {
  var t, e, r = new Promise((n, i) => {
    t = n, e = i;
  });
  return { promise: r, resolve: t, reject: e };
}
const k = 2, kt = 4, le = 8, Le = 1 << 24, mt = 16, J = 32, Et = 64, Se = 128, W = 512, O = 1024, z = 2048, Q = 4096, Z = 8192, X = 16384, At = 32768, er = 1 << 25, vt = 65536, rr = 1 << 17, Dn = 1 << 18, Ft = 1 << 19, Or = 1 << 20, Tt = 65536, xe = 1 << 21, De = 1 << 22, ct = 1 << 23, Pt = Symbol("$state"), Fn = Symbol("legacy props"), jn = Symbol(""), it = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Ir = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function zn(t) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function qn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Vn(t) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Bn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Wn(t) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Un() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Gn(t) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Kn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Hn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Yn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Xn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const $n = 1, Zn = 4, Jn = 8, Qn = 16, ti = 1, ei = 2, P = Symbol(), Pr = "http://www.w3.org/1999/xhtml", Rr = "@attach";
function ri() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ni() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function kr(t) {
  return t === this.v;
}
function ii(t, e) {
  return t != t ? e == e : t !== e || t !== null && typeof t == "object" || typeof t == "function";
}
function si(t) {
  return !ii(t, this.v);
}
let j = null;
function Nt(t) {
  j = t;
}
function nr(t) {
  return (
    /** @type {T} */
    Fe().get(t)
  );
}
function oi(t, e) {
  return Fe().set(t, e), e;
}
function ai(t) {
  return Fe().has(t);
}
function Kt(t, e = !1, r) {
  j = {
    p: j,
    i: !1,
    c: null,
    e: null,
    s: t,
    x: null,
    r: (
      /** @type {Effect} */
      T
    ),
    l: null
  };
}
function Ht(t) {
  var e = (
    /** @type {ComponentContext} */
    j
  ), r = e.e;
  if (r !== null) {
    e.e = null;
    for (var n of r)
      tn(n);
  }
  return e.i = !0, j = e.p, /** @type {T} */
  {};
}
function Nr() {
  return !0;
}
function Fe(t) {
  return j === null && zn(), j.c ??= new Map(ui(j) || void 0);
}
function ui(t) {
  let e = t.p;
  for (; e !== null; ) {
    const r = e.c;
    if (r !== null)
      return r;
    e = e.p;
  }
  return null;
}
let Ct = [];
function li() {
  var t = Ct;
  Ct = [], Ln(t);
}
function dt(t) {
  if (Ct.length === 0) {
    var e = Ct;
    queueMicrotask(() => {
      e === Ct && li();
    });
  }
  Ct.push(t);
}
function Mr(t) {
  var e = T;
  if (e === null)
    return w.f |= ct, t;
  if ((e.f & At) === 0 && (e.f & kt) === 0)
    throw t;
  ft(t, e);
}
function ft(t, e) {
  for (; e !== null; ) {
    if ((e.f & Se) !== 0) {
      if ((e.f & At) === 0)
        throw t;
      try {
        e.b.error(t);
        return;
      } catch (r) {
        t = r;
      }
    }
    e = e.parent;
  }
  throw t;
}
const fi = -7169;
function x(t, e) {
  t.f = t.f & fi | e;
}
function je(t) {
  (t.f & W) !== 0 || t.deps === null ? x(t, O) : x(t, Q);
}
function Lr(t) {
  if (t !== null)
    for (const e of t)
      (e.f & k) === 0 || (e.f & Tt) === 0 || (e.f ^= Tt, Lr(
        /** @type {Derived} */
        e.deps
      ));
}
function Dr(t, e, r) {
  (t.f & z) !== 0 ? e.add(t) : (t.f & Q) !== 0 && r.add(t), Lr(t.deps), x(t, O);
}
let Jt = !1;
function ci(t) {
  var e = Jt;
  try {
    return Jt = !1, [t(), Jt];
  } finally {
    Jt = e;
  }
}
const lt = /* @__PURE__ */ new Set();
let A = null, H = null, Ce = null, Ee = !1, Ot = null, re = null;
var ir = 0;
let di = 1;
class pt {
  id = di++;
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
  #e = /* @__PURE__ */ new Set();
  /**
   * Async effects that are currently in flight
   * @type {Map<Effect, number>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * Async effects that are currently in flight, _not_ inside a pending boundary
   * @type {Map<Effect, number>}
   */
  #s = /* @__PURE__ */ new Map();
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
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #o = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #a = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #u = /* @__PURE__ */ new Map();
  is_fork = !1;
  #c = !1;
  /** @type {Set<Batch>} */
  #l = /* @__PURE__ */ new Set();
  #d() {
    return this.is_fork || this.#s.size > 0;
  }
  #v() {
    for (const n of this.#l)
      for (const i of n.#s.keys()) {
        for (var e = !1, r = i; r.parent !== null; ) {
          if (this.#u.has(r)) {
            e = !0;
            break;
          }
          r = r.parent;
        }
        if (!e)
          return !0;
      }
    return !1;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(e) {
    this.#u.has(e) || this.#u.set(e, { d: [], m: [] });
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(e) {
    var r = this.#u.get(e);
    if (r) {
      this.#u.delete(e);
      for (var n of r.d)
        x(n, z), this.schedule(n);
      for (n of r.m)
        x(n, Q), this.schedule(n);
    }
  }
  #h() {
    if (ir++ > 1e3 && (lt.delete(this), hi()), !this.#d()) {
      for (const a of this.#o)
        this.#a.delete(a), x(a, z), this.schedule(a);
      for (const a of this.#a)
        x(a, Q), this.schedule(a);
    }
    const e = this.#n;
    this.#n = [], this.apply();
    var r = Ot = [], n = [], i = re = [];
    for (const a of e)
      try {
        this.#f(a, r, n);
      } catch (l) {
        throw qr(a), l;
      }
    if (A = null, i.length > 0) {
      var s = pt.ensure();
      for (const a of i)
        s.schedule(a);
    }
    if (Ot = null, re = null, this.#d() || this.#v()) {
      this.#p(n), this.#p(r);
      for (const [a, l] of this.#u)
        zr(a, l);
    } else {
      this.#r.size === 0 && lt.delete(this), this.#o.clear(), this.#a.clear();
      for (const a of this.#t) a(this);
      this.#t.clear(), sr(n), sr(r), this.#i?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      A
    );
    if (this.#n.length > 0) {
      const a = o ??= this;
      a.#n.push(...this.#n.filter((l) => !a.#n.includes(l)));
    }
    o !== null && (lt.add(o), o.#h()), lt.has(this) || this.#b();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #f(e, r, n) {
    e.f ^= O;
    for (var i = e.first; i !== null; ) {
      var s = i.f, o = (s & (J | Et)) !== 0, a = o && (s & O) !== 0, l = a || (s & Z) !== 0 || this.#u.has(i);
      if (!l && i.fn !== null) {
        o ? i.f ^= O : (s & kt) !== 0 ? r.push(i) : $t(i) && ((s & mt) !== 0 && this.#a.add(i), Lt(i));
        var u = i.first;
        if (u !== null) {
          i = u;
          continue;
        }
      }
      for (; i !== null; ) {
        var d = i.next;
        if (d !== null) {
          i = d;
          break;
        }
        i = i.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #p(e) {
    for (var r = 0; r < e.length; r += 1)
      Dr(e[r], this.#o, this.#a);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} old_value
   * @param {boolean} [is_derived]
   */
  capture(e, r, n = !1) {
    r !== P && !this.previous.has(e) && this.previous.set(e, r), (e.f & ct) === 0 && (this.current.set(e, [e.v, n]), H?.set(e, e.v));
  }
  activate() {
    A = this;
  }
  deactivate() {
    A = null, H = null;
  }
  flush() {
    try {
      Ee = !0, A = this, this.#h();
    } finally {
      ir = 0, Ce = null, Ot = null, re = null, Ee = !1, A = null, H = null, ht.clear();
    }
  }
  discard() {
    for (const e of this.#e) e(this);
    this.#e.clear(), lt.delete(this);
  }
  #b() {
    for (const u of lt) {
      var e = u.id < this.id, r = [];
      for (const [d, [p, f]] of this.current) {
        if (u.current.has(d)) {
          var n = (
            /** @type {[any, boolean]} */
            u.current.get(d)[0]
          );
          if (e && p !== n)
            u.current.set(d, [p, f]);
          else
            continue;
        }
        r.push(d);
      }
      var i = [...u.current.keys()].filter((d) => !this.current.has(d));
      if (i.length === 0)
        e && u.discard();
      else if (r.length > 0) {
        u.activate();
        var s = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
        for (var a of r)
          Fr(a, i, s, o);
        if (u.#n.length > 0) {
          u.apply();
          for (var l of u.#n)
            u.#f(l, [], []);
          u.#n = [];
        }
        u.deactivate();
      }
    }
    for (const u of lt)
      u.#l.has(this) && (u.#l.delete(this), u.#l.size === 0 && !u.#d() && (u.activate(), u.#h()));
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(e, r) {
    let n = this.#r.get(r) ?? 0;
    if (this.#r.set(r, n + 1), e) {
      let i = this.#s.get(r) ?? 0;
      this.#s.set(r, i + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(e, r, n) {
    let i = this.#r.get(r) ?? 0;
    if (i === 1 ? this.#r.delete(r) : this.#r.set(r, i - 1), e) {
      let s = this.#s.get(r) ?? 0;
      s === 1 ? this.#s.delete(r) : this.#s.set(r, s - 1);
    }
    this.#c || n || (this.#c = !0, dt(() => {
      this.#c = !1, this.flush();
    }));
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(e, r) {
    for (const n of e)
      this.#o.add(n);
    for (const n of r)
      this.#a.add(n);
    e.clear(), r.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(e) {
    this.#t.add(e);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(e) {
    this.#e.add(e);
  }
  settled() {
    return (this.#i ??= Cr()).promise;
  }
  static ensure() {
    if (A === null) {
      const e = A = new pt();
      Ee || (lt.add(A), dt(() => {
        A === e && e.flush();
      }));
    }
    return A;
  }
  apply() {
    {
      H = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(e) {
    if (Ce = e, e.b?.is_pending && (e.f & (kt | le | Le)) !== 0 && (e.f & At) === 0) {
      e.b.defer_effect(e);
      return;
    }
    for (var r = e; r.parent !== null; ) {
      r = r.parent;
      var n = r.f;
      if (Ot !== null && r === T && (w === null || (w.f & k) === 0))
        return;
      if ((n & (Et | J)) !== 0) {
        if ((n & O) === 0)
          return;
        r.f ^= O;
      }
    }
    this.#n.push(r);
  }
}
function hi() {
  try {
    Un();
  } catch (t) {
    ft(t, Ce);
  }
}
let nt = null;
function sr(t) {
  var e = t.length;
  if (e !== 0) {
    for (var r = 0; r < e; ) {
      var n = t[r++];
      if ((n.f & (X | Z)) === 0 && $t(n) && (nt = /* @__PURE__ */ new Set(), Lt(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && nn(n), nt?.size > 0)) {
        ht.clear();
        for (const i of nt) {
          if ((i.f & (X | Z)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            nt.has(o) && (nt.delete(o), s.push(o)), o = o.parent;
          for (let a = s.length - 1; a >= 0; a--) {
            const l = s[a];
            (l.f & (X | Z)) === 0 && Lt(l);
          }
        }
        nt.clear();
      }
    }
    nt = null;
  }
}
function Fr(t, e, r, n) {
  if (!r.has(t) && (r.add(t), t.reactions !== null))
    for (const i of t.reactions) {
      const s = i.f;
      (s & k) !== 0 ? Fr(
        /** @type {Derived} */
        i,
        e,
        r,
        n
      ) : (s & (De | mt)) !== 0 && (s & z) === 0 && jr(i, e, n) && (x(i, z), ze(
        /** @type {Effect} */
        i
      ));
    }
}
function jr(t, e, r) {
  const n = r.get(t);
  if (n !== void 0) return n;
  if (t.deps !== null)
    for (const i of t.deps) {
      if (Rt.call(e, i))
        return !0;
      if ((i.f & k) !== 0 && jr(
        /** @type {Derived} */
        i,
        e,
        r
      ))
        return r.set(
          /** @type {Derived} */
          i,
          !0
        ), !0;
    }
  return r.set(t, !1), !1;
}
function ze(t) {
  A.schedule(t);
}
function zr(t, e) {
  if (!((t.f & J) !== 0 && (t.f & O) !== 0)) {
    (t.f & z) !== 0 ? e.d.push(t) : (t.f & Q) !== 0 && e.m.push(t), x(t, O);
    for (var r = t.first; r !== null; )
      zr(r, e), r = r.next;
  }
}
function qr(t) {
  x(t, O);
  for (var e = t.first; e !== null; )
    qr(e), e = e.next;
}
function Vr(t) {
  let e = 0, r = Yt(0), n;
  return () => {
    Be() && (g(r), Ni(() => (e === 0 && (n = Wt(() => t(() => $(r)))), e += 1, () => {
      dt(() => {
        e -= 1, e === 0 && (n?.(), n = void 0, $(r));
      });
    })));
  };
}
var vi = vt | Ft;
function pi(t, e, r, n) {
  new _i(t, e, r, n);
}
class _i {
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
  #e = null;
  /** @type {BoundaryProps} */
  #r;
  /** @type {((anchor: Node) => void)} */
  #s;
  /** @type {Effect} */
  #i;
  /** @type {Effect | null} */
  #n = null;
  /** @type {Effect | null} */
  #o = null;
  /** @type {Effect | null} */
  #a = null;
  /** @type {DocumentFragment | null} */
  #u = null;
  #c = 0;
  #l = 0;
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
  #f = null;
  #p = Vr(() => (this.#f = Yt(this.#c), () => {
    this.#f = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(e, r, n, i) {
    this.#t = e, this.#r = r, this.#s = (s) => {
      var o = (
        /** @type {Effect} */
        T
      );
      o.b = this, o.f |= Se, n(s);
    }, this.parent = /** @type {Effect} */
    T.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#i = de(() => {
      this.#m();
    }, vi);
  }
  #b() {
    try {
      this.#n = K(() => this.#s(this.#t));
    } catch (e) {
      this.error(e);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #y(e) {
    const r = this.#r.failed;
    r && (this.#a = K(() => {
      r(
        this.#t,
        () => e,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const e = this.#r.pending;
    e && (this.is_pending = !0, this.#o = K(() => e(this.#t)), dt(() => {
      var r = this.#u = document.createDocumentFragment(), n = Mt();
      r.append(n), this.#n = this.#g(() => K(() => this.#s(n))), this.#l === 0 && (this.#t.before(r), this.#u = null, Vt(
        /** @type {Effect} */
        this.#o,
        () => {
          this.#o = null;
        }
      ), this.#_(
        /** @type {Batch} */
        A
      ));
    }));
  }
  #m() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#l = 0, this.#c = 0, this.#n = K(() => {
        this.#s(this.#t);
      }), this.#l > 0) {
        var e = this.#u = document.createDocumentFragment();
        an(this.#n, e);
        const r = (
          /** @type {(anchor: Node) => void} */
          this.#r.pending
        );
        this.#o = K(() => r(this.#t));
      } else
        this.#_(
          /** @type {Batch} */
          A
        );
    } catch (r) {
      this.error(r);
    }
  }
  /**
   * @param {Batch} batch
   */
  #_(e) {
    this.is_pending = !1, e.transfer_effects(this.#v, this.#h);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(e) {
    Dr(e, this.#v, this.#h);
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
  #g(e) {
    var r = T, n = w, i = j;
    et(this.#i), G(this.#i), Nt(this.#i.ctx);
    try {
      return pt.ensure(), e();
    } catch (s) {
      return Mr(s), null;
    } finally {
      et(r), G(n), Nt(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #w(e, r) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#w(e, r);
      return;
    }
    this.#l += e, this.#l === 0 && (this.#_(r), this.#o && Vt(this.#o, () => {
      this.#o = null;
    }), this.#u && (this.#t.before(this.#u), this.#u = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(e, r) {
    this.#w(e, r), this.#c += e, !(!this.#f || this.#d) && (this.#d = !0, dt(() => {
      this.#d = !1, this.#f && oe(this.#f, this.#c);
    }));
  }
  get_effect_pending() {
    return this.#p(), g(
      /** @type {Source<number>} */
      this.#f
    );
  }
  /** @param {unknown} error */
  error(e) {
    var r = this.#r.onerror;
    let n = this.#r.failed;
    if (!r && !n)
      throw e;
    this.#n && (D(this.#n), this.#n = null), this.#o && (D(this.#o), this.#o = null), this.#a && (D(this.#a), this.#a = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        ni();
        return;
      }
      i = !0, s && Xn(), this.#a !== null && Vt(this.#a, () => {
        this.#a = null;
      }), this.#g(() => {
        this.#m();
      });
    }, a = (l) => {
      try {
        s = !0, r?.(l, o), s = !1;
      } catch (u) {
        ft(u, this.#i && this.#i.parent);
      }
      n && (this.#a = this.#g(() => {
        try {
          return K(() => {
            var u = (
              /** @type {Effect} */
              T
            );
            u.b = this, u.f |= Se, n(
              this.#t,
              () => l,
              () => o
            );
          });
        } catch (u) {
          return ft(
            u,
            /** @type {Effect} */
            this.#i.parent
          ), null;
        }
      }));
    };
    dt(() => {
      var l;
      try {
        l = this.transform_error(e);
      } catch (u) {
        ft(u, this.#i && this.#i.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        a,
        /** @param {unknown} e */
        (u) => ft(u, this.#i && this.#i.parent)
      ) : a(l);
    });
  }
}
function gi(t, e, r, n) {
  const i = fe;
  var s = t.filter((f) => !f.settled);
  if (r.length === 0 && s.length === 0) {
    n(e.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    T
  ), a = bi(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((f) => f.promise)) : null;
  function u(f) {
    a();
    try {
      n(f);
    } catch (v) {
      (o.f & X) === 0 && ft(v, o);
    }
    se();
  }
  if (r.length === 0) {
    l.then(() => u(e.map(i)));
    return;
  }
  var d = Br();
  function p() {
    Promise.all(r.map((f) => /* @__PURE__ */ mi(f))).then((f) => u([...e.map(i), ...f])).catch((f) => ft(f, o)).finally(() => d());
  }
  l ? l.then(() => {
    a(), p(), se();
  }) : p();
}
function bi() {
  var t = (
    /** @type {Effect} */
    T
  ), e = w, r = j, n = (
    /** @type {Batch} */
    A
  );
  return function(s = !0) {
    et(t), G(e), Nt(r), s && (t.f & X) === 0 && (n?.activate(), n?.apply());
  };
}
function se(t = !0) {
  et(null), G(null), Nt(null), t && A?.deactivate();
}
function Br() {
  var t = (
    /** @type {Effect} */
    T
  ), e = (
    /** @type {Boundary} */
    t.b
  ), r = (
    /** @type {Batch} */
    A
  ), n = e.is_rendered();
  return e.update_pending_count(1, r), r.increment(n, t), (i = !1) => {
    e.update_pending_count(-1, r), r.decrement(n, t, i);
  };
}
// @__NO_SIDE_EFFECTS__
function fe(t) {
  var e = k | z, r = w !== null && (w.f & k) !== 0 ? (
    /** @type {Derived} */
    w
  ) : null;
  return T !== null && (T.f |= Ft), {
    ctx: j,
    deps: null,
    effects: null,
    equals: kr,
    f: e,
    fn: t,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      P
    ),
    wv: 0,
    parent: r ?? T,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function mi(t, e, r) {
  let n = (
    /** @type {Effect | null} */
    T
  );
  n === null && qn();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Yt(
    /** @type {V} */
    P
  ), o = !w, a = /* @__PURE__ */ new Map();
  return ki(() => {
    var l = (
      /** @type {Effect} */
      T
    ), u = Cr();
    i = u.promise;
    try {
      Promise.resolve(t()).then(u.resolve, u.reject).finally(se);
    } catch (v) {
      u.reject(v), se();
    }
    var d = (
      /** @type {Batch} */
      A
    );
    if (o) {
      if ((l.f & At) !== 0)
        var p = Br();
      if (
        /** @type {Boundary} */
        n.b.is_rendered()
      )
        a.get(d)?.reject(it), a.delete(d);
      else {
        for (const v of a.values())
          v.reject(it);
        a.clear();
      }
      a.set(d, u);
    }
    const f = (v, c = void 0) => {
      if (p) {
        var h = c === it;
        p(h);
      }
      if (!(c === it || (l.f & X) !== 0)) {
        if (d.activate(), c)
          s.f |= ct, oe(s, c);
        else {
          (s.f & ct) !== 0 && (s.f ^= ct), oe(s, v);
          for (const [_, b] of a) {
            if (a.delete(_), _ === d) break;
            b.reject(it);
          }
        }
        d.deactivate();
      }
    };
    u.promise.then(f, (v) => f(null, v || "unknown"));
  }), Jr(() => {
    for (const l of a.values())
      l.reject(it);
  }), new Promise((l) => {
    function u(d) {
      function p() {
        d === i ? l(s) : u(i);
      }
      d.then(p, p);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function F(t) {
  const e = /* @__PURE__ */ fe(t);
  return un(e), e;
}
// @__NO_SIDE_EFFECTS__
function wi(t) {
  const e = /* @__PURE__ */ fe(t);
  return e.equals = si, e;
}
function yi(t) {
  var e = t.effects;
  if (e !== null) {
    t.effects = null;
    for (var r = 0; r < e.length; r += 1)
      D(
        /** @type {Effect} */
        e[r]
      );
  }
}
function Ei(t) {
  for (var e = t.parent; e !== null; ) {
    if ((e.f & k) === 0)
      return (e.f & X) === 0 ? (
        /** @type {Effect} */
        e
      ) : null;
    e = e.parent;
  }
  return null;
}
function qe(t) {
  var e, r = T;
  et(Ei(t));
  try {
    t.f &= ~Tt, yi(t), e = dn(t);
  } finally {
    et(r);
  }
  return e;
}
function Wr(t) {
  var e = t.v, r = qe(t);
  if (!t.equals(r) && (t.wv = fn(), (!A?.is_fork || t.deps === null) && (t.v = r, A?.capture(t, e, !0), t.deps === null))) {
    x(t, O);
    return;
  }
  _t || (H !== null ? (Be() || A?.is_fork) && H.set(t, r) : je(t));
}
function Ti(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      (e.teardown || e.ac) && (e.teardown?.(), e.ac?.abort(it), e.teardown = Gt, e.ac = null, Bt(e, 0), Ue(e));
}
function Ur(t) {
  if (t.effects !== null)
    for (const e of t.effects)
      e.teardown && Lt(e);
}
let Oe = /* @__PURE__ */ new Set();
const ht = /* @__PURE__ */ new Map();
let Gr = !1;
function Yt(t, e) {
  var r = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: t,
    reactions: null,
    equals: kr,
    rv: 0,
    wv: 0
  };
  return r;
}
// @__NO_SIDE_EFFECTS__
function M(t, e) {
  const r = Yt(t);
  return un(r), r;
}
function S(t, e, r = !1) {
  w !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Y || (w.f & rr) !== 0) && Nr() && (w.f & (k | mt | De | rr)) !== 0 && (U === null || !Rt.call(U, t)) && Yn();
  let n = r ? st(e) : e;
  return oe(t, n, re);
}
function oe(t, e, r = null) {
  if (!t.equals(e)) {
    var n = t.v;
    _t ? ht.set(t, e) : ht.set(t, n), t.v = e;
    var i = pt.ensure();
    if (i.capture(t, n), (t.f & k) !== 0) {
      const s = (
        /** @type {Derived} */
        t
      );
      (t.f & z) !== 0 && qe(s), H === null && je(s);
    }
    t.wv = fn(), Kr(t, z, r), T !== null && (T.f & O) !== 0 && (T.f & (J | Et)) === 0 && (B === null ? Fi([t]) : B.push(t)), !i.is_fork && Oe.size > 0 && !Gr && Ai();
  }
  return e;
}
function Ai() {
  Gr = !1;
  for (const t of Oe)
    (t.f & O) !== 0 && x(t, Q), $t(t) && Lt(t);
  Oe.clear();
}
function $(t) {
  S(t, t.v + 1);
}
function Kr(t, e, r) {
  var n = t.reactions;
  if (n !== null)
    for (var i = n.length, s = 0; s < i; s++) {
      var o = n[s], a = o.f, l = (a & z) === 0;
      if (l && x(o, e), (a & k) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        H?.delete(u), (a & Tt) === 0 && (a & W && (o.f |= Tt), Kr(u, Q, r));
      } else if (l) {
        var d = (
          /** @type {Effect} */
          o
        );
        (a & mt) !== 0 && nt !== null && nt.add(d), r !== null ? r.push(d) : ze(d);
      }
    }
}
function st(t) {
  if (typeof t != "object" || t === null || Pt in t)
    return t;
  const e = xr(t);
  if (e !== Nn && e !== Mn)
    return t;
  var r = /* @__PURE__ */ new Map(), n = Sr(t), i = /* @__PURE__ */ M(0), s = ot, o = (a) => {
    if (ot === s)
      return a();
    var l = w, u = ot;
    G(null), lr(s);
    var d = a();
    return G(l), lr(u), d;
  };
  return n && r.set("length", /* @__PURE__ */ M(
    /** @type {any[]} */
    t.length
  )), new Proxy(
    /** @type {any} */
    t,
    {
      defineProperty(a, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Kn();
        var d = r.get(l);
        return d === void 0 ? o(() => {
          var p = /* @__PURE__ */ M(u.value);
          return r.set(l, p), p;
        }) : S(d, u.value, !0), !0;
      },
      deleteProperty(a, l) {
        var u = r.get(l);
        if (u === void 0) {
          if (l in a) {
            const d = o(() => /* @__PURE__ */ M(P));
            r.set(l, d), $(i);
          }
        } else
          S(u, P), $(i);
        return !0;
      },
      get(a, l, u) {
        if (l === Pt)
          return t;
        var d = r.get(l), p = l in a;
        if (d === void 0 && (!p || It(a, l)?.writable) && (d = o(() => {
          var v = st(p ? a[l] : P), c = /* @__PURE__ */ M(v);
          return c;
        }), r.set(l, d)), d !== void 0) {
          var f = g(d);
          return f === P ? void 0 : f;
        }
        return Reflect.get(a, l, u);
      },
      getOwnPropertyDescriptor(a, l) {
        var u = Reflect.getOwnPropertyDescriptor(a, l);
        if (u && "value" in u) {
          var d = r.get(l);
          d && (u.value = g(d));
        } else if (u === void 0) {
          var p = r.get(l), f = p?.v;
          if (p !== void 0 && f !== P)
            return {
              enumerable: !0,
              configurable: !0,
              value: f,
              writable: !0
            };
        }
        return u;
      },
      has(a, l) {
        if (l === Pt)
          return !0;
        var u = r.get(l), d = u !== void 0 && u.v !== P || Reflect.has(a, l);
        if (u !== void 0 || T !== null && (!d || It(a, l)?.writable)) {
          u === void 0 && (u = o(() => {
            var f = d ? st(a[l]) : P, v = /* @__PURE__ */ M(f);
            return v;
          }), r.set(l, u));
          var p = g(u);
          if (p === P)
            return !1;
        }
        return d;
      },
      set(a, l, u, d) {
        var p = r.get(l), f = l in a;
        if (n && l === "length")
          for (var v = u; v < /** @type {Source<number>} */
          p.v; v += 1) {
            var c = r.get(v + "");
            c !== void 0 ? S(c, P) : v in a && (c = o(() => /* @__PURE__ */ M(P)), r.set(v + "", c));
          }
        if (p === void 0)
          (!f || It(a, l)?.writable) && (p = o(() => /* @__PURE__ */ M(void 0)), S(p, st(u)), r.set(l, p));
        else {
          f = p.v !== P;
          var h = o(() => st(u));
          S(p, h);
        }
        var _ = Reflect.getOwnPropertyDescriptor(a, l);
        if (_?.set && _.set.call(d, u), !f) {
          if (n && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              r.get("length")
            ), y = Number(l);
            Number.isInteger(y) && y >= b.v && S(b, y + 1);
          }
          $(i);
        }
        return !0;
      },
      ownKeys(a) {
        g(i);
        var l = Reflect.ownKeys(a).filter((p) => {
          var f = r.get(p);
          return f === void 0 || f.v !== P;
        });
        for (var [u, d] of r)
          d.v !== P && !(u in a) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        Hn();
      }
    }
  );
}
function or(t) {
  try {
    if (t !== null && typeof t == "object" && Pt in t)
      return t[Pt];
  } catch {
  }
  return t;
}
function Si(t, e) {
  return Object.is(or(t), or(e));
}
var ar, Hr, Yr, Xr;
function xi() {
  if (ar === void 0) {
    ar = window, Hr = /Firefox/.test(navigator.userAgent);
    var t = Element.prototype, e = Node.prototype, r = Text.prototype;
    Yr = It(e, "firstChild").get, Xr = It(e, "nextSibling").get, tr(t) && (t.__click = void 0, t.__className = void 0, t.__attributes = null, t.__style = void 0, t.__e = void 0), tr(r) && (r.__t = void 0);
  }
}
function Mt(t = "") {
  return document.createTextNode(t);
}
// @__NO_SIDE_EFFECTS__
function ae(t) {
  return (
    /** @type {TemplateNode | null} */
    Yr.call(t)
  );
}
// @__NO_SIDE_EFFECTS__
function ce(t) {
  return (
    /** @type {TemplateNode | null} */
    Xr.call(t)
  );
}
function Xt(t, e) {
  return /* @__PURE__ */ ae(t);
}
function tt(t, e = !1) {
  {
    var r = /* @__PURE__ */ ae(t);
    return r instanceof Comment && r.data === "" ? /* @__PURE__ */ ce(r) : r;
  }
}
function Qt(t, e = 1, r = !1) {
  let n = t;
  for (; e--; )
    n = /** @type {TemplateNode} */
    /* @__PURE__ */ ce(n);
  return n;
}
function Ci() {
  return !1;
}
function $r(t, e, r) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(Pr, t, void 0)
  );
}
function Oi(t, e) {
  if (e) {
    const r = document.body;
    t.autofocus = !0, dt(() => {
      document.activeElement === r && t.focus();
    });
  }
}
function Ve(t) {
  var e = w, r = T;
  G(null), et(null);
  try {
    return t();
  } finally {
    G(e), et(r);
  }
}
function Zr(t) {
  T === null && (w === null && Wn(), Bn()), _t && Vn();
}
function Ii(t, e) {
  var r = e.last;
  r === null ? e.last = e.first = t : (r.next = t, t.prev = r, e.last = t);
}
function rt(t, e) {
  var r = T;
  r !== null && (r.f & Z) !== 0 && (t |= Z);
  var n = {
    ctx: j,
    deps: null,
    nodes: null,
    f: t | z | W,
    first: null,
    fn: e,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  }, i = n;
  if ((t & kt) !== 0)
    Ot !== null ? Ot.push(n) : pt.ensure().schedule(n);
  else if (e !== null) {
    try {
      Lt(n);
    } catch (o) {
      throw D(n), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & Ft) === 0 && (i = i.first, (t & mt) !== 0 && (t & vt) !== 0 && i !== null && (i.f |= vt));
  }
  if (i !== null && (i.parent = r, r !== null && Ii(i, r), w !== null && (w.f & k) !== 0 && (t & Et) === 0)) {
    var s = (
      /** @type {Derived} */
      w
    );
    (s.effects ??= []).push(i);
  }
  return n;
}
function Be() {
  return w !== null && !Y;
}
function Jr(t) {
  const e = rt(le, null);
  return x(e, O), e.teardown = t, e;
}
function Qr(t) {
  Zr();
  var e = (
    /** @type {Effect} */
    T.f
  ), r = !w && (e & J) !== 0 && (e & At) === 0;
  if (r) {
    var n = (
      /** @type {ComponentContext} */
      j
    );
    (n.e ??= []).push(t);
  } else
    return tn(t);
}
function tn(t) {
  return rt(kt | Or, t);
}
function Pi(t) {
  return Zr(), rt(le | Or, t);
}
function Ri(t) {
  pt.ensure();
  const e = rt(Et | Ft, t);
  return (r = {}) => new Promise((n) => {
    r.outro ? Vt(e, () => {
      D(e), n(void 0);
    }) : (D(e), n(void 0));
  });
}
function We(t) {
  return rt(kt, t);
}
function ki(t) {
  return rt(De | Ft, t);
}
function Ni(t, e = 0) {
  return rt(le | e, t);
}
function de(t, e = 0) {
  var r = rt(mt | e, t);
  return r;
}
function en(t, e = 0) {
  var r = rt(Le | e, t);
  return r;
}
function K(t) {
  return rt(J | Ft, t);
}
function rn(t) {
  var e = t.teardown;
  if (e !== null) {
    const r = _t, n = w;
    ur(!0), G(null);
    try {
      e.call(null);
    } finally {
      ur(r), G(n);
    }
  }
}
function Ue(t, e = !1) {
  var r = t.first;
  for (t.first = t.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && Ve(() => {
      i.abort(it);
    });
    var n = r.next;
    (r.f & Et) !== 0 ? r.parent = null : D(r, e), r = n;
  }
}
function Mi(t) {
  for (var e = t.first; e !== null; ) {
    var r = e.next;
    (e.f & J) === 0 && D(e), e = r;
  }
}
function D(t, e = !0) {
  var r = !1;
  (e || (t.f & Dn) !== 0) && t.nodes !== null && t.nodes.end !== null && (Li(
    t.nodes.start,
    /** @type {TemplateNode} */
    t.nodes.end
  ), r = !0), x(t, er), Ue(t, e && !r), Bt(t, 0);
  var n = t.nodes && t.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  rn(t), t.f ^= er, t.f |= X;
  var i = t.parent;
  i !== null && i.first !== null && nn(t), t.next = t.prev = t.teardown = t.ctx = t.deps = t.fn = t.nodes = t.ac = t.b = null;
}
function Li(t, e) {
  for (; t !== null; ) {
    var r = t === e ? null : /* @__PURE__ */ ce(t);
    t.remove(), t = r;
  }
}
function nn(t) {
  var e = t.parent, r = t.prev, n = t.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), e !== null && (e.first === t && (e.first = n), e.last === t && (e.last = r));
}
function Vt(t, e, r = !0) {
  var n = [];
  sn(t, n, !0);
  var i = () => {
    r && D(t), e && e();
  }, s = n.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var a of n)
      a.out(o);
  } else
    i();
}
function sn(t, e, r) {
  if ((t.f & Z) === 0) {
    t.f ^= Z;
    var n = t.nodes && t.nodes.t;
    if (n !== null)
      for (const a of n)
        (a.is_global || r) && e.push(a);
    for (var i = t.first; i !== null; ) {
      var s = i.next, o = (i.f & vt) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & J) !== 0 && (t.f & mt) !== 0;
      sn(i, e, o ? r : !1), i = s;
    }
  }
}
function Di(t) {
  on(t, !0);
}
function on(t, e) {
  if ((t.f & Z) !== 0) {
    t.f ^= Z, (t.f & O) === 0 && (x(t, z), pt.ensure().schedule(t));
    for (var r = t.first; r !== null; ) {
      var n = r.next, i = (r.f & vt) !== 0 || (r.f & J) !== 0;
      on(r, i ? e : !1), r = n;
    }
    var s = t.nodes && t.nodes.t;
    if (s !== null)
      for (const o of s)
        (o.is_global || e) && o.in();
  }
}
function an(t, e) {
  if (t.nodes)
    for (var r = t.nodes.start, n = t.nodes.end; r !== null; ) {
      var i = r === n ? null : /* @__PURE__ */ ce(r);
      e.append(r), r = i;
    }
}
let ne = !1, _t = !1;
function ur(t) {
  _t = t;
}
let w = null, Y = !1;
function G(t) {
  w = t;
}
let T = null;
function et(t) {
  T = t;
}
let U = null;
function un(t) {
  w !== null && (U === null ? U = [t] : U.push(t));
}
let q = null, V = 0, B = null;
function Fi(t) {
  B = t;
}
let ln = 1, yt = 0, ot = yt;
function lr(t) {
  ot = t;
}
function fn() {
  return ++ln;
}
function $t(t) {
  var e = t.f;
  if ((e & z) !== 0)
    return !0;
  if (e & k && (t.f &= ~Tt), (e & Q) !== 0) {
    for (var r = (
      /** @type {Value[]} */
      t.deps
    ), n = r.length, i = 0; i < n; i++) {
      var s = r[i];
      if ($t(
        /** @type {Derived} */
        s
      ) && Wr(
        /** @type {Derived} */
        s
      ), s.wv > t.wv)
        return !0;
    }
    (e & W) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    H === null && x(t, O);
  }
  return !1;
}
function cn(t, e, r = !0) {
  var n = t.reactions;
  if (n !== null && !(U !== null && Rt.call(U, t)))
    for (var i = 0; i < n.length; i++) {
      var s = n[i];
      (s.f & k) !== 0 ? cn(
        /** @type {Derived} */
        s,
        e,
        !1
      ) : e === s && (r ? x(s, z) : (s.f & O) !== 0 && x(s, Q), ze(
        /** @type {Effect} */
        s
      ));
    }
}
function dn(t) {
  var e = q, r = V, n = B, i = w, s = U, o = j, a = Y, l = ot, u = t.f;
  q = /** @type {null | Value[]} */
  null, V = 0, B = null, w = (u & (J | Et)) === 0 ? t : null, U = null, Nt(t.ctx), Y = !1, ot = ++yt, t.ac !== null && (Ve(() => {
    t.ac.abort(it);
  }), t.ac = null);
  try {
    t.f |= xe;
    var d = (
      /** @type {Function} */
      t.fn
    ), p = d();
    t.f |= At;
    var f = t.deps, v = A?.is_fork;
    if (q !== null) {
      var c;
      if (v || Bt(t, V), f !== null && V > 0)
        for (f.length = V + q.length, c = 0; c < q.length; c++)
          f[V + c] = q[c];
      else
        t.deps = f = q;
      if (Be() && (t.f & W) !== 0)
        for (c = V; c < f.length; c++)
          (f[c].reactions ??= []).push(t);
    } else !v && f !== null && V < f.length && (Bt(t, V), f.length = V);
    if (Nr() && B !== null && !Y && f !== null && (t.f & (k | Q | z)) === 0)
      for (c = 0; c < /** @type {Source[]} */
      B.length; c++)
        cn(
          B[c],
          /** @type {Effect} */
          t
        );
    if (i !== null && i !== t) {
      if (yt++, i.deps !== null)
        for (let h = 0; h < r; h += 1)
          i.deps[h].rv = yt;
      if (e !== null)
        for (const h of e)
          h.rv = yt;
      B !== null && (n === null ? n = B : n.push(.../** @type {Source[]} */
      B));
    }
    return (t.f & ct) !== 0 && (t.f ^= ct), p;
  } catch (h) {
    return Mr(h);
  } finally {
    t.f ^= xe, q = e, V = r, B = n, w = i, U = s, Nt(o), Y = a, ot = l;
  }
}
function ji(t, e) {
  let r = e.reactions;
  if (r !== null) {
    var n = In.call(r, t);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = e.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  if (r === null && (e.f & k) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (q === null || !Rt.call(q, e))) {
    var s = (
      /** @type {Derived} */
      e
    );
    (s.f & W) !== 0 && (s.f ^= W, s.f &= ~Tt), je(s), Ti(s), Bt(s, 0);
  }
}
function Bt(t, e) {
  var r = t.deps;
  if (r !== null)
    for (var n = e; n < r.length; n++)
      ji(t, r[n]);
}
function Lt(t) {
  var e = t.f;
  if ((e & X) === 0) {
    x(t, O);
    var r = T, n = ne;
    T = t, ne = !0;
    try {
      (e & (mt | Le)) !== 0 ? Mi(t) : Ue(t), rn(t);
      var i = dn(t);
      t.teardown = typeof i == "function" ? i : null, t.wv = ln;
      var s;
    } finally {
      ne = n, T = r;
    }
  }
}
function g(t) {
  var e = t.f, r = (e & k) !== 0;
  if (w !== null && !Y) {
    var n = T !== null && (T.f & X) !== 0;
    if (!n && (U === null || !Rt.call(U, t))) {
      var i = w.deps;
      if ((w.f & xe) !== 0)
        t.rv < yt && (t.rv = yt, q === null && i !== null && i[V] === t ? V++ : q === null ? q = [t] : q.push(t));
      else {
        (w.deps ??= []).push(t);
        var s = t.reactions;
        s === null ? t.reactions = [w] : Rt.call(s, w) || s.push(w);
      }
    }
  }
  if (_t && ht.has(t))
    return ht.get(t);
  if (r) {
    var o = (
      /** @type {Derived} */
      t
    );
    if (_t) {
      var a = o.v;
      return ((o.f & O) === 0 && o.reactions !== null || vn(o)) && (a = qe(o)), ht.set(o, a), a;
    }
    var l = (o.f & W) === 0 && !Y && w !== null && (ne || (w.f & W) !== 0), u = (o.f & At) === 0;
    $t(o) && (l && (o.f |= W), Wr(o)), l && !u && (Ur(o), hn(o));
  }
  if (H?.has(t))
    return H.get(t);
  if ((t.f & ct) !== 0)
    throw t.v;
  return t.v;
}
function hn(t) {
  if (t.f |= W, t.deps !== null)
    for (const e of t.deps)
      (e.reactions ??= []).push(t), (e.f & k) !== 0 && (e.f & W) === 0 && (Ur(
        /** @type {Derived} */
        e
      ), hn(
        /** @type {Derived} */
        e
      ));
}
function vn(t) {
  if (t.v === P) return !0;
  if (t.deps === null) return !1;
  for (const e of t.deps)
    if (ht.has(e) || (e.f & k) !== 0 && vn(
      /** @type {Derived} */
      e
    ))
      return !0;
  return !1;
}
function Wt(t) {
  var e = Y;
  try {
    return Y = !0, t();
  } finally {
    Y = e;
  }
}
globalThis.Deno?.core?.ops;
function zi() {
  return Symbol(Rr);
}
function qi(t) {
  return t.endsWith("capture") && t !== "gotpointercapture" && t !== "lostpointercapture";
}
const Vi = [
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
function Bi(t) {
  return Vi.includes(t);
}
const Wi = {
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
function Ui(t) {
  return t = t.toLowerCase(), Wi[t] ?? t;
}
const Gi = ["touchstart", "touchmove"];
function Ki(t) {
  return Gi.includes(t);
}
const qt = Symbol("events"), pn = /* @__PURE__ */ new Set(), Ie = /* @__PURE__ */ new Set();
function _n(t, e, r, n = {}) {
  function i(s) {
    if (n.capture || Pe.call(e, s), !s.cancelBubble)
      return Ve(() => r?.call(this, s));
  }
  return t.startsWith("pointer") || t.startsWith("touch") || t === "wheel" ? dt(() => {
    e.addEventListener(t, i, n);
  }) : e.addEventListener(t, i, n), i;
}
function fr(t, e, r, n = {}) {
  var i = _n(e, t, r, n);
  return () => {
    t.removeEventListener(e, i, n);
  };
}
function Hi(t, e, r) {
  (e[qt] ??= {})[t] = r;
}
function Yi(t) {
  for (var e = 0; e < t.length; e++)
    pn.add(t[e]);
  for (var r of Ie)
    r(t);
}
let cr = null;
function Pe(t) {
  var e = this, r = (
    /** @type {Node} */
    e.ownerDocument
  ), n = t.type, i = t.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || t.target
  );
  cr = t;
  var o = 0, a = cr === t && t[qt];
  if (a) {
    var l = i.indexOf(a);
    if (l !== -1 && (e === document || e === /** @type {any} */
    window)) {
      t[qt] = e;
      return;
    }
    var u = i.indexOf(e);
    if (u === -1)
      return;
    l <= u && (o = l);
  }
  if (s = /** @type {Element} */
  i[o] || t.target, s !== e) {
    Rn(t, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var d = w, p = T;
    G(null), et(null);
    try {
      for (var f, v = []; s !== null; ) {
        var c = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var h = s[qt]?.[n];
          h != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          t.target === s) && h.call(s, t);
        } catch (_) {
          f ? v.push(_) : f = _;
        }
        if (t.cancelBubble || c === e || c === null)
          break;
        s = c;
      }
      if (f) {
        for (let _ of v)
          queueMicrotask(() => {
            throw _;
          });
        throw f;
      }
    } finally {
      t[qt] = e, delete t.currentTarget, G(d), et(p);
    }
  }
}
const Xi = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (t) => t
  })
);
function $i(t) {
  return (
    /** @type {string} */
    Xi?.createHTML(t) ?? t
  );
}
function Zi(t) {
  var e = $r("template");
  return e.innerHTML = $i(t.replaceAll("<!>", "<!---->")), e.content;
}
function ue(t, e) {
  var r = (
    /** @type {Effect} */
    T
  );
  r.nodes === null && (r.nodes = { start: t, end: e, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function at(t, e) {
  var r = (e & ti) !== 0, n = (e & ei) !== 0, i, s = !t.startsWith("<!>");
  return () => {
    i === void 0 && (i = Zi(s ? t : "<!>" + t), r || (i = /** @type {TemplateNode} */
    /* @__PURE__ */ ae(i)));
    var o = (
      /** @type {TemplateNode} */
      n || Hr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ ae(o)
      ), l = (
        /** @type {TemplateNode} */
        o.lastChild
      );
      ue(a, l);
    } else
      ue(o, o);
    return o;
  };
}
function dr(t = "") {
  {
    var e = Mt(t + "");
    return ue(e, e), e;
  }
}
function gt() {
  var t = document.createDocumentFragment(), e = document.createComment(""), r = Mt();
  return t.append(e, r), ue(e, r), t;
}
function C(t, e) {
  t !== null && t.before(
    /** @type {Node} */
    e
  );
}
function he() {
  return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Ji(t, e) {
  return Qi(t, e);
}
const te = /* @__PURE__ */ new Map();
function Qi(t, { target: e, anchor: r, props: n = {}, events: i, context: s, intro: o = !0, transformError: a }) {
  xi();
  var l = void 0, u = Ri(() => {
    var d = r ?? e.appendChild(Mt());
    pi(
      /** @type {TemplateNode} */
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        Kt({});
        var c = (
          /** @type {ComponentContext} */
          j
        );
        s && (c.c = s), i && (n.$$events = i), l = t(v, n) || {}, Ht();
      },
      a
    );
    var p = /* @__PURE__ */ new Set(), f = (v) => {
      for (var c = 0; c < v.length; c++) {
        var h = v[c];
        if (!p.has(h)) {
          p.add(h);
          var _ = Ki(h);
          for (const m of [e, document]) {
            var b = te.get(m);
            b === void 0 && (b = /* @__PURE__ */ new Map(), te.set(m, b));
            var y = b.get(h);
            y === void 0 ? (m.addEventListener(h, Pe, { passive: _ }), b.set(h, 1)) : b.set(h, y + 1);
          }
        }
      }
    };
    return f(Pn(pn)), Ie.add(f), () => {
      for (var v of p)
        for (const _ of [e, document]) {
          var c = (
            /** @type {Map<string, number>} */
            te.get(_)
          ), h = (
            /** @type {number} */
            c.get(v)
          );
          --h == 0 ? (_.removeEventListener(v, Pe), c.delete(v), c.size === 0 && te.delete(_)) : c.set(v, h);
        }
      Ie.delete(f), d !== r && d.parentNode?.removeChild(d);
    };
  });
  return ts.set(l, u), l;
}
let ts = /* @__PURE__ */ new WeakMap();
class Ge {
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
  #e = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #r = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #s = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #i = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(e, r = !0) {
    this.anchor = e, this.#i = r;
  }
  /**
   * @param {Batch} batch
   */
  #n = (e) => {
    if (this.#t.has(e)) {
      var r = (
        /** @type {Key} */
        this.#t.get(e)
      ), n = this.#e.get(r);
      if (n)
        Di(n), this.#s.delete(r);
      else {
        var i = this.#r.get(r);
        i && (this.#e.set(r, i.effect), this.#r.delete(r), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), n = i.effect);
      }
      for (const [s, o] of this.#t) {
        if (this.#t.delete(s), s === e)
          break;
        const a = this.#r.get(o);
        a && (D(a.effect), this.#r.delete(o));
      }
      for (const [s, o] of this.#e) {
        if (s === r || this.#s.has(s)) continue;
        const a = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var u = document.createDocumentFragment();
            an(o, u), u.append(Mt()), this.#r.set(s, { effect: o, fragment: u });
          } else
            D(o);
          this.#s.delete(s), this.#e.delete(s);
        };
        this.#i || !n ? (this.#s.add(s), Vt(o, a, !1)) : a();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #o = (e) => {
    this.#t.delete(e);
    const r = Array.from(this.#t.values());
    for (const [n, i] of this.#r)
      r.includes(n) || (D(i.effect), this.#r.delete(n));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(e, r) {
    var n = (
      /** @type {Batch} */
      A
    ), i = Ci();
    if (r && !this.#e.has(e) && !this.#r.has(e))
      if (i) {
        var s = document.createDocumentFragment(), o = Mt();
        s.append(o), this.#r.set(e, {
          effect: K(() => r(o)),
          fragment: s
        });
      } else
        this.#e.set(
          e,
          K(() => r(this.anchor))
        );
    if (this.#t.set(n, e), i) {
      for (const [a, l] of this.#e)
        a === e ? n.unskip_effect(l) : n.skip_effect(l);
      for (const [a, l] of this.#r)
        a === e ? n.unskip_effect(l.effect) : n.skip_effect(l.effect);
      n.oncommit(this.#n), n.ondiscard(this.#o);
    } else
      this.#n(n);
  }
}
function ve(t, e, r = !1) {
  var n = new Ge(t), i = r ? vt : 0;
  function s(o, a) {
    n.ensure(o, a);
  }
  de(() => {
    var o = !1;
    e((a, l = 0) => {
      o = !0, s(l, a);
    }), o || s(-1, null);
  }, i);
}
function bt(t, e, ...r) {
  var n = new Ge(t);
  de(() => {
    const i = e() ?? null;
    n.ensure(i, i && ((s) => i(s, ...r)));
  }, vt);
}
function xt(t, e, r) {
  var n = new Ge(t);
  de(() => {
    var i = e() ?? null;
    n.ensure(i, i && ((s) => r(s, i)));
  }, vt);
}
function es(t, e) {
  We(() => {
    var r = t.getRootNode(), n = (
      /** @type {ShadowRoot} */
      r.host ? (
        /** @type {ShadowRoot} */
        r
      ) : (
        /** @type {Document} */
        r.head ?? /** @type {Document} */
        r.ownerDocument.head
      )
    );
    if (!n.querySelector("#" + e.hash)) {
      const i = $r("style");
      i.id = e.hash, i.textContent = e.code, n.appendChild(i);
    }
  });
}
function rs(t, e) {
  var r = void 0, n;
  en(() => {
    r !== (r = e()) && (n && (D(n), n = null), r && (n = K(() => {
      We(() => (
        /** @type {(node: Element) => void} */
        r(t)
      ));
    })));
  });
}
function gn(t) {
  var e, r, n = "";
  if (typeof t == "string" || typeof t == "number") n += t;
  else if (typeof t == "object") if (Array.isArray(t)) {
    var i = t.length;
    for (e = 0; e < i; e++) t[e] && (r = gn(t[e])) && (n && (n += " "), n += r);
  } else for (r in t) t[r] && (n && (n += " "), n += r);
  return n;
}
function ie() {
  for (var t, e, r = 0, n = "", i = arguments.length; r < i; r++) (t = arguments[r]) && (e = gn(t)) && (n && (n += " "), n += e);
  return n;
}
function ns(t) {
  return typeof t == "object" ? ie(t) : t ?? "";
}
const hr = [...` 	
\r\f \v\uFEFF`];
function is(t, e, r) {
  var n = t == null ? "" : "" + t;
  if (r) {
    for (var i of Object.keys(r))
      if (r[i])
        n = n ? n + " " + i : i;
      else if (n.length)
        for (var s = i.length, o = 0; (o = n.indexOf(i, o)) >= 0; ) {
          var a = o + s;
          (o === 0 || hr.includes(n[o - 1])) && (a === n.length || hr.includes(n[a])) ? n = (o === 0 ? "" : n.substring(0, o)) + n.substring(a + 1) : o = a;
        }
  }
  return n === "" ? null : n;
}
function vr(t, e = !1) {
  var r = e ? " !important;" : ";", n = "";
  for (var i of Object.keys(t)) {
    var s = t[i];
    s != null && s !== "" && (n += " " + i + ": " + s + r);
  }
  return n;
}
function Te(t) {
  return t[0] !== "-" || t[1] !== "-" ? t.toLowerCase() : t;
}
function ss(t, e) {
  if (e) {
    var r = "", n, i;
    if (Array.isArray(e) ? (n = e[0], i = e[1]) : n = e, t) {
      t = String(t).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var s = !1, o = 0, a = !1, l = [];
      n && l.push(...Object.keys(n).map(Te)), i && l.push(...Object.keys(i).map(Te));
      var u = 0, d = -1;
      const h = t.length;
      for (var p = 0; p < h; p++) {
        var f = t[p];
        if (a ? f === "/" && t[p - 1] === "*" && (a = !1) : s ? s === f && (s = !1) : f === "/" && t[p + 1] === "*" ? a = !0 : f === '"' || f === "'" ? s = f : f === "(" ? o++ : f === ")" && o--, !a && s === !1 && o === 0) {
          if (f === ":" && d === -1)
            d = p;
          else if (f === ";" || p === h - 1) {
            if (d !== -1) {
              var v = Te(t.substring(u, d).trim());
              if (!l.includes(v)) {
                f !== ";" && p++;
                var c = t.substring(u, p).trim();
                r += " " + c + ";";
              }
            }
            u = p + 1, d = -1;
          }
        }
      }
    }
    return n && (r += vr(n)), i && (r += vr(i, !0)), r = r.trim(), r === "" ? null : r;
  }
  return t == null ? null : String(t);
}
function os(t, e, r, n, i, s) {
  var o = t.__className;
  if (o !== r || o === void 0) {
    var a = is(r, n, s);
    a == null ? t.removeAttribute("class") : e ? t.className = a : t.setAttribute("class", a), t.__className = r;
  } else if (s && i !== s)
    for (var l in s) {
      var u = !!s[l];
      (i == null || u !== !!i[l]) && t.classList.toggle(l, u);
    }
  return s;
}
function Ae(t, e = {}, r, n) {
  for (var i in r) {
    var s = r[i];
    e[i] !== s && (r[i] == null ? t.style.removeProperty(i) : t.style.setProperty(i, s, n));
  }
}
function as(t, e, r, n) {
  var i = t.__style;
  if (i !== e) {
    var s = ss(e, n);
    s == null ? t.removeAttribute("style") : t.style.cssText = s, t.__style = e;
  } else n && (Array.isArray(n) ? (Ae(t, r?.[0], n[0]), Ae(t, r?.[1], n[1], "important")) : Ae(t, r, n));
  return n;
}
function Re(t, e, r = !1) {
  if (t.multiple) {
    if (e == null)
      return;
    if (!Sr(e))
      return ri();
    for (var n of t.options)
      n.selected = e.includes(pr(n));
    return;
  }
  for (n of t.options) {
    var i = pr(n);
    if (Si(i, e)) {
      n.selected = !0;
      return;
    }
  }
  (!r || e !== void 0) && (t.selectedIndex = -1);
}
function us(t) {
  var e = new MutationObserver(() => {
    Re(t, t.__value);
  });
  e.observe(t, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Jr(() => {
    e.disconnect();
  });
}
function pr(t) {
  return "__value" in t ? t.__value : t.value;
}
const jt = Symbol("class"), zt = Symbol("style"), bn = Symbol("is custom element"), mn = Symbol("is html"), ls = Ir ? "option" : "OPTION", fs = Ir ? "select" : "SELECT";
function cs(t, e) {
  e ? t.hasAttribute("selected") || t.setAttribute("selected", "") : t.removeAttribute("selected");
}
function _r(t, e, r, n) {
  var i = wn(t);
  i[e] !== (i[e] = r) && (e === "loading" && (t[jn] = r), r == null ? t.removeAttribute(e) : typeof r != "string" && yn(t).includes(e) ? t[e] = r : t.setAttribute(e, r));
}
function ds(t, e, r, n, i = !1, s = !1) {
  var o = wn(t), a = o[bn], l = !o[mn], u = e || {}, d = t.nodeName === ls;
  for (var p in e)
    p in r || (r[p] = null);
  r.class ? r.class = ns(r.class) : r[jt] && (r.class = null), r[zt] && (r.style ??= null);
  var f = yn(t);
  for (const m in r) {
    let E = r[m];
    if (d && m === "value" && E == null) {
      t.value = t.__value = "", u[m] = E;
      continue;
    }
    if (m === "class") {
      var v = t.namespaceURI === "http://www.w3.org/1999/xhtml";
      os(t, v, E, n, e?.[jt], r[jt]), u[m] = E, u[jt] = r[jt];
      continue;
    }
    if (m === "style") {
      as(t, E, e?.[zt], r[zt]), u[m] = E, u[zt] = r[zt];
      continue;
    }
    var c = u[m];
    if (!(E === c && !(E === void 0 && t.hasAttribute(m)))) {
      u[m] = E;
      var h = m[0] + m[1];
      if (h !== "$$")
        if (h === "on") {
          const N = {}, ut = "$$" + m;
          let I = m.slice(2);
          var _ = Bi(I);
          if (qi(I) && (I = I.slice(0, -7), N.capture = !0), !_ && c) {
            if (E != null) continue;
            t.removeEventListener(I, u[ut], N), u[ut] = null;
          }
          if (_)
            Hi(I, t, E), Yi([I]);
          else if (E != null) {
            let Cn = function(On) {
              u[m].call(this, On);
            };
            u[ut] = _n(I, t, Cn, N);
          }
        } else if (m === "style")
          _r(t, m, E);
        else if (m === "autofocus")
          Oi(
            /** @type {HTMLElement} */
            t,
            !!E
          );
        else if (!a && (m === "__value" || m === "value" && E != null))
          t.value = t.__value = E;
        else if (m === "selected" && d)
          cs(
            /** @type {HTMLOptionElement} */
            t,
            E
          );
        else {
          var b = m;
          l || (b = Ui(b));
          var y = b === "defaultValue" || b === "defaultChecked";
          if (E == null && !a && !y)
            if (o[m] = null, b === "value" || b === "checked") {
              let N = (
                /** @type {HTMLInputElement} */
                t
              );
              const ut = e === void 0;
              if (b === "value") {
                let I = N.defaultValue;
                N.removeAttribute(b), N.defaultValue = I, N.value = N.__value = ut ? I : null;
              } else {
                let I = N.defaultChecked;
                N.removeAttribute(b), N.defaultChecked = I, N.checked = ut ? I : !1;
              }
            } else
              t.removeAttribute(m);
          else y || f.includes(b) && (a || typeof E != "string") ? (t[b] = E, b in o && (o[b] = P)) : typeof E != "function" && _r(t, b, E);
        }
    }
  }
  return u;
}
function pe(t, e, r = [], n = [], i = [], s, o = !1, a = !1) {
  gi(i, r, n, (l) => {
    var u = void 0, d = {}, p = t.nodeName === fs, f = !1;
    if (en(() => {
      var c = e(...l.map(g)), h = ds(
        t,
        u,
        c,
        s,
        o,
        a
      );
      f && p && "value" in c && Re(
        /** @type {HTMLSelectElement} */
        t,
        c.value
      );
      for (let b of Object.getOwnPropertySymbols(d))
        c[b] || D(d[b]);
      for (let b of Object.getOwnPropertySymbols(c)) {
        var _ = c[b];
        b.description === Rr && (!u || _ !== u[b]) && (d[b] && D(d[b]), d[b] = K(() => rs(t, () => _))), h[b] = _;
      }
      u = h;
    }), p) {
      var v = (
        /** @type {HTMLSelectElement} */
        t
      );
      We(() => {
        Re(
          v,
          /** @type {Record<string | symbol, any>} */
          u.value,
          !0
        ), us(v);
      });
    }
    f = !0;
  });
}
function wn(t) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    t.__attributes ??= {
      [bn]: t.nodeName.includes("-"),
      [mn]: t.namespaceURI === Pr
    }
  );
}
var gr = /* @__PURE__ */ new Map();
function yn(t) {
  var e = t.getAttribute("is") || t.nodeName, r = gr.get(e);
  if (r) return r;
  gr.set(e, r = []);
  for (var n, i = t, s = Element.prototype; s !== i; ) {
    n = kn(i);
    for (var o in n)
      n[o].set && r.push(o);
    i = xr(i);
  }
  return r;
}
const hs = {
  get(t, e) {
    if (!t.exclude.includes(e))
      return t.props[e];
  },
  set(t, e) {
    return !1;
  },
  getOwnPropertyDescriptor(t, e) {
    if (!t.exclude.includes(e) && e in t.props)
      return {
        enumerable: !0,
        configurable: !0,
        value: t.props[e]
      };
  },
  has(t, e) {
    return t.exclude.includes(e) ? !1 : e in t.props;
  },
  ownKeys(t) {
    return Reflect.ownKeys(t.props).filter((e) => !t.exclude.includes(e));
  }
};
// @__NO_SIDE_EFFECTS__
function _e(t, e, r) {
  return new Proxy(
    { props: t, exclude: e },
    hs
  );
}
function L(t, e, r, n) {
  var i = (r & Jn) !== 0, s = (r & Qn) !== 0, o = (
    /** @type {V} */
    n
  ), a = !0, l = () => (a && (a = !1, o = s ? Wt(
    /** @type {() => V} */
    n
  ) : (
    /** @type {V} */
    n
  )), o);
  let u;
  if (i) {
    var d = Pt in t || Fn in t;
    u = It(t, e)?.set ?? (d && e in t ? (y) => t[e] = y : void 0);
  }
  var p, f = !1;
  i ? [p, f] = ci(() => (
    /** @type {V} */
    t[e]
  )) : p = /** @type {V} */
  t[e], p === void 0 && n !== void 0 && (p = l(), u && (Gn(), u(p)));
  var v;
  if (v = () => {
    var y = (
      /** @type {V} */
      t[e]
    );
    return y === void 0 ? l() : (a = !0, y);
  }, (r & Zn) === 0)
    return v;
  if (u) {
    var c = t.$$legacy;
    return (
      /** @type {() => V} */
      (function(y, m) {
        return arguments.length > 0 ? ((!m || c || f) && u(m ? v() : y), y) : v();
      })
    );
  }
  var h = !1, _ = ((r & $n) !== 0 ? fe : wi)(() => (h = !1, v()));
  i && g(_);
  var b = (
    /** @type {Effect} */
    T
  );
  return (
    /** @type {() => V} */
    (function(y, m) {
      if (arguments.length > 0) {
        const E = m ? g(_) : i ? st(y) : y;
        return S(_, E), h = !0, o !== void 0 && (o = E), y;
      }
      return _t && h || (b.f & X) !== 0 ? _.v : g(_);
    })
  );
}
function vs(t) {
  return typeof t == "function";
}
function ps(t) {
  return t !== null && typeof t == "object";
}
const _s = ["string", "number", "bigint", "boolean"];
function ke(t) {
  return t == null || _s.includes(typeof t) ? !0 : Array.isArray(t) ? t.every((e) => ke(e)) : typeof t == "object" ? Object.getPrototypeOf(t) === Object.prototype : !1;
}
const Dt = Symbol("box"), ge = Symbol("is-writable");
function R(t, e) {
  const r = /* @__PURE__ */ F(t);
  return e ? {
    [Dt]: !0,
    [ge]: !0,
    get current() {
      return g(r);
    },
    set current(n) {
      e(n);
    }
  } : {
    [Dt]: !0,
    get current() {
      return t();
    }
  };
}
function Zt(t) {
  return ps(t) && Dt in t;
}
function Ke(t) {
  return Zt(t) && ge in t;
}
function gs(t) {
  return Zt(t) ? t : vs(t) ? R(t) : ws(t);
}
function bs(t) {
  return Object.entries(t).reduce(
    (e, [r, n]) => Zt(n) ? (Ke(n) ? Object.defineProperty(e, r, {
      get() {
        return n.current;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(i) {
        n.current = i;
      }
    }) : Object.defineProperty(e, r, {
      get() {
        return n.current;
      }
    }), e) : Object.assign(e, { [r]: n }),
    {}
  );
}
function ms(t) {
  return Ke(t) ? {
    [Dt]: !0,
    get current() {
      return t.current;
    }
  } : t;
}
function ws(t) {
  let e = /* @__PURE__ */ M(st(t));
  return {
    [Dt]: !0,
    [ge]: !0,
    get current() {
      return g(e);
    },
    set current(r) {
      S(e, r, !0);
    }
  };
}
function St(t) {
  let e = /* @__PURE__ */ M(st(t));
  return {
    [Dt]: !0,
    [ge]: !0,
    get current() {
      return g(e);
    },
    set current(r) {
      S(e, r, !0);
    }
  };
}
St.from = gs;
St.with = R;
St.flatten = bs;
St.readonly = ms;
St.isBox = Zt;
St.isWritableBox = Ke;
function ys(...t) {
  return function(e) {
    for (const r of t)
      if (r) {
        if (e.defaultPrevented)
          return;
        typeof r == "function" ? r.call(this, e) : r.current?.call(this, e);
      }
  };
}
var br = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, Es = /\n/g, Ts = /^\s*/, As = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, Ss = /^:\s*/, xs = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, Cs = /^[;\s]*/, Os = /^\s+|\s+$/g, Is = `
`, mr = "/", wr = "*", wt = "", Ps = "comment", Rs = "declaration";
function ks(t, e) {
  if (typeof t != "string")
    throw new TypeError("First argument must be a string");
  if (!t) return [];
  e = e || {};
  var r = 1, n = 1;
  function i(c) {
    var h = c.match(Es);
    h && (r += h.length);
    var _ = c.lastIndexOf(Is);
    n = ~_ ? c.length - _ : n + c.length;
  }
  function s() {
    var c = { line: r, column: n };
    return function(h) {
      return h.position = new o(c), u(), h;
    };
  }
  function o(c) {
    this.start = c, this.end = { line: r, column: n }, this.source = e.source;
  }
  o.prototype.content = t;
  function a(c) {
    var h = new Error(
      e.source + ":" + r + ":" + n + ": " + c
    );
    if (h.reason = c, h.filename = e.source, h.line = r, h.column = n, h.source = t, !e.silent) throw h;
  }
  function l(c) {
    var h = c.exec(t);
    if (h) {
      var _ = h[0];
      return i(_), t = t.slice(_.length), h;
    }
  }
  function u() {
    l(Ts);
  }
  function d(c) {
    var h;
    for (c = c || []; h = p(); )
      h !== !1 && c.push(h);
    return c;
  }
  function p() {
    var c = s();
    if (!(mr != t.charAt(0) || wr != t.charAt(1))) {
      for (var h = 2; wt != t.charAt(h) && (wr != t.charAt(h) || mr != t.charAt(h + 1)); )
        ++h;
      if (h += 2, wt === t.charAt(h - 1))
        return a("End of comment missing");
      var _ = t.slice(2, h - 2);
      return n += 2, i(_), t = t.slice(h), n += 2, c({
        type: Ps,
        comment: _
      });
    }
  }
  function f() {
    var c = s(), h = l(As);
    if (h) {
      if (p(), !l(Ss)) return a("property missing ':'");
      var _ = l(xs), b = c({
        type: Rs,
        property: yr(h[0].replace(br, wt)),
        value: _ ? yr(_[0].replace(br, wt)) : wt
      });
      return l(Cs), b;
    }
  }
  function v() {
    var c = [];
    d(c);
    for (var h; h = f(); )
      h !== !1 && (c.push(h), d(c));
    return c;
  }
  return u(), v();
}
function yr(t) {
  return t ? t.replace(Os, wt) : wt;
}
function Ns(t, e) {
  let r = null;
  if (!t || typeof t != "string")
    return r;
  const n = ks(t), i = typeof e == "function";
  return n.forEach((s) => {
    if (s.type !== "declaration")
      return;
    const { property: o, value: a } = s;
    i ? e(o, a, s) : a && (r = r || {}, r[o] = a);
  }), r;
}
const Ms = /\d/, Ls = ["-", "_", "/", "."];
function Ds(t = "") {
  if (!Ms.test(t))
    return t !== t.toLowerCase();
}
function Fs(t) {
  const e = [];
  let r = "", n, i;
  for (const s of t) {
    const o = Ls.includes(s);
    if (o === !0) {
      e.push(r), r = "", n = void 0;
      continue;
    }
    const a = Ds(s);
    if (i === !1) {
      if (n === !1 && a === !0) {
        e.push(r), r = s, n = a;
        continue;
      }
      if (n === !0 && a === !1 && r.length > 1) {
        const l = r.at(-1);
        e.push(r.slice(0, Math.max(0, r.length - 1))), r = l + s, n = a;
        continue;
      }
    }
    r += s, n = a, i = o;
  }
  return e.push(r), e;
}
function En(t) {
  return t ? Fs(t).map((e) => zs(e)).join("") : "";
}
function js(t) {
  return qs(En(t || ""));
}
function zs(t) {
  return t ? t[0].toUpperCase() + t.slice(1) : "";
}
function qs(t) {
  return t ? t[0].toLowerCase() + t.slice(1) : "";
}
function ee(t) {
  if (!t)
    return {};
  const e = {};
  function r(n, i) {
    if (n.startsWith("-moz-") || n.startsWith("-webkit-") || n.startsWith("-ms-") || n.startsWith("-o-")) {
      e[En(n)] = i;
      return;
    }
    if (n.startsWith("--")) {
      e[n] = i;
      return;
    }
    e[js(n)] = i;
  }
  return Ns(t, r), e;
}
function Vs(...t) {
  return (...e) => {
    for (const r of t)
      typeof r == "function" && r(...e);
  };
}
function Bs(t, e) {
  const r = RegExp(t, "g");
  return (n) => {
    if (typeof n != "string")
      throw new TypeError(`expected an argument of type string, but got ${typeof n}`);
    return n.match(r) ? n.replace(r, e) : n;
  };
}
const Ws = Bs(/[A-Z]/, (t) => `-${t.toLowerCase()}`);
function Us(t) {
  if (!t || typeof t != "object" || Array.isArray(t))
    throw new TypeError(`expected an argument of type object, but got ${typeof t}`);
  return Object.keys(t).map((e) => `${Ws(e)}: ${t[e]};`).join(`
`);
}
function Gs(t = {}) {
  return Us(t).replace(`
`, " ");
}
const Ks = [
  "onabort",
  "onanimationcancel",
  "onanimationend",
  "onanimationiteration",
  "onanimationstart",
  "onauxclick",
  "onbeforeinput",
  "onbeforetoggle",
  "onblur",
  "oncancel",
  "oncanplay",
  "oncanplaythrough",
  "onchange",
  "onclick",
  "onclose",
  "oncompositionend",
  "oncompositionstart",
  "oncompositionupdate",
  "oncontextlost",
  "oncontextmenu",
  "oncontextrestored",
  "oncopy",
  "oncuechange",
  "oncut",
  "ondblclick",
  "ondrag",
  "ondragend",
  "ondragenter",
  "ondragleave",
  "ondragover",
  "ondragstart",
  "ondrop",
  "ondurationchange",
  "onemptied",
  "onended",
  "onerror",
  "onfocus",
  "onfocusin",
  "onfocusout",
  "onformdata",
  "ongotpointercapture",
  "oninput",
  "oninvalid",
  "onkeydown",
  "onkeypress",
  "onkeyup",
  "onload",
  "onloadeddata",
  "onloadedmetadata",
  "onloadstart",
  "onlostpointercapture",
  "onmousedown",
  "onmouseenter",
  "onmouseleave",
  "onmousemove",
  "onmouseout",
  "onmouseover",
  "onmouseup",
  "onpaste",
  "onpause",
  "onplay",
  "onplaying",
  "onpointercancel",
  "onpointerdown",
  "onpointerenter",
  "onpointerleave",
  "onpointermove",
  "onpointerout",
  "onpointerover",
  "onpointerup",
  "onprogress",
  "onratechange",
  "onreset",
  "onresize",
  "onscroll",
  "onscrollend",
  "onsecuritypolicyviolation",
  "onseeked",
  "onseeking",
  "onselect",
  "onselectionchange",
  "onselectstart",
  "onslotchange",
  "onstalled",
  "onsubmit",
  "onsuspend",
  "ontimeupdate",
  "ontoggle",
  "ontouchcancel",
  "ontouchend",
  "ontouchmove",
  "ontouchstart",
  "ontransitioncancel",
  "ontransitionend",
  "ontransitionrun",
  "ontransitionstart",
  "onvolumechange",
  "onwaiting",
  "onwebkitanimationend",
  "onwebkitanimationiteration",
  "onwebkitanimationstart",
  "onwebkittransitionend",
  "onwheel"
], Hs = new Set(Ks);
function Ys(t) {
  return Hs.has(t);
}
function be(...t) {
  const e = { ...t[0] };
  for (let r = 1; r < t.length; r++) {
    const n = t[r];
    if (n) {
      for (const i of Object.keys(n)) {
        const s = e[i], o = n[i], a = typeof s == "function", l = typeof o == "function";
        if (a && Ys(i)) {
          const u = s, d = o;
          e[i] = ys(u, d);
        } else if (a && l)
          e[i] = Vs(s, o);
        else if (i === "class") {
          const u = ke(s), d = ke(o);
          u && d ? e[i] = ie(s, o) : u ? e[i] = ie(s) : d && (e[i] = ie(o));
        } else if (i === "style") {
          const u = typeof s == "object", d = typeof o == "object", p = typeof s == "string", f = typeof o == "string";
          if (u && d)
            e[i] = { ...s, ...o };
          else if (u && f) {
            const v = ee(o);
            e[i] = { ...s, ...v };
          } else if (p && d) {
            const v = ee(s);
            e[i] = { ...v, ...o };
          } else if (p && f) {
            const v = ee(s), c = ee(o);
            e[i] = { ...v, ...c };
          } else u ? e[i] = s : d ? e[i] = o : p ? e[i] = s : f && (e[i] = o);
        } else
          e[i] = o !== void 0 ? o : s;
      }
      for (const i of Object.getOwnPropertySymbols(n)) {
        const s = e[i], o = n[i];
        e[i] = o !== void 0 ? o : s;
      }
    }
  }
  return typeof e.style == "object" && (e.style = Gs(e.style).replaceAll(`
`, " ")), e.hidden === !1 && (e.hidden = void 0, delete e.hidden), e.disabled === !1 && (e.disabled = void 0, delete e.disabled), e;
}
const Xs = typeof window < "u" ? window : void 0;
function $s(t) {
  let e = t.activeElement;
  for (; e?.shadowRoot; ) {
    const r = e.shadowRoot.activeElement;
    if (r === e)
      break;
    e = r;
  }
  return e;
}
class Er extends Map {
  /** @type {Map<K, Source<number>>} */
  #t = /* @__PURE__ */ new Map();
  #e = /* @__PURE__ */ M(0);
  #r = /* @__PURE__ */ M(0);
  #s = ot || -1;
  /**
   * @param {Iterable<readonly [K, V]> | null | undefined} [value]
   */
  constructor(e) {
    if (super(), e) {
      for (var [r, n] of e)
        super.set(r, n);
      this.#r.v = super.size;
    }
  }
  /**
   * If the source is being created inside the same reaction as the SvelteMap instance,
   * we use `state` so that it will not be a dependency of the reaction. Otherwise we
   * use `source` so it will be.
   *
   * @template T
   * @param {T} value
   * @returns {Source<T>}
   */
  #i(e) {
    return ot === this.#s ? /* @__PURE__ */ M(e) : Yt(e);
  }
  /** @param {K} key */
  has(e) {
    var r = this.#t, n = r.get(e);
    if (n === void 0)
      if (super.has(e))
        n = this.#i(0), r.set(e, n);
      else
        return g(this.#e), !1;
    return g(n), !0;
  }
  /**
   * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
   * @param {any} [this_arg]
   */
  forEach(e, r) {
    this.#n(), super.forEach(e, r);
  }
  /** @param {K} key */
  get(e) {
    var r = this.#t, n = r.get(e);
    if (n === void 0)
      if (super.has(e))
        n = this.#i(0), r.set(e, n);
      else {
        g(this.#e);
        return;
      }
    return g(n), super.get(e);
  }
  /**
   * @param {K} key
   * @param {V} value
   * */
  set(e, r) {
    var n = this.#t, i = n.get(e), s = super.get(e), o = super.set(e, r), a = this.#e;
    if (i === void 0)
      i = this.#i(0), n.set(e, i), S(this.#r, super.size), $(a);
    else if (s !== r) {
      $(i);
      var l = a.reactions === null ? null : new Set(a.reactions), u = l === null || !i.reactions?.every(
        (d) => (
          /** @type {NonNullable<typeof v_reactions>} */
          l.has(d)
        )
      );
      u && $(a);
    }
    return o;
  }
  /** @param {K} key */
  delete(e) {
    var r = this.#t, n = r.get(e), i = super.delete(e);
    return n !== void 0 && (r.delete(e), S(n, -1)), i && (S(this.#r, super.size), $(this.#e)), i;
  }
  clear() {
    if (super.size !== 0) {
      super.clear();
      var e = this.#t;
      S(this.#r, 0);
      for (var r of e.values())
        S(r, -1);
      $(this.#e), e.clear();
    }
  }
  #n() {
    g(this.#e);
    var e = this.#t;
    if (this.#r.v !== e.size) {
      for (var r of super.keys())
        if (!e.has(r)) {
          var n = this.#i(0);
          e.set(r, n);
        }
    }
    for ([, n] of this.#t)
      g(n);
  }
  keys() {
    return g(this.#e), super.keys();
  }
  values() {
    return this.#n(), super.values();
  }
  entries() {
    return this.#n(), super.entries();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get size() {
    return g(this.#r), super.size;
  }
}
class Zs {
  #t;
  #e;
  constructor(e = {}) {
    const { window: r = Xs, document: n = r?.document } = e;
    r !== void 0 && (this.#t = n, this.#e = Vr((i) => {
      const s = fr(r, "focusin", i), o = fr(r, "focusout", i);
      return () => {
        s(), o();
      };
    }));
  }
  get current() {
    return this.#e?.(), this.#t ? $s(this.#t) : null;
  }
}
new Zs();
class Js {
  #t;
  #e;
  /**
   * @param name The name of the context.
   * This is used for generating the context key and error messages.
   */
  constructor(e) {
    this.#t = e, this.#e = Symbol(e);
  }
  /**
   * The key used to get and set the context.
   *
   * It is not recommended to use this value directly.
   * Instead, use the methods provided by this class.
   */
  get key() {
    return this.#e;
  }
  /**
   * Checks whether this has been set in the context of a parent component.
   *
   * Must be called during component initialisation.
   */
  exists() {
    return ai(this.#e);
  }
  /**
   * Retrieves the context that belongs to the closest parent component.
   *
   * Must be called during component initialisation.
   *
   * @throws An error if the context does not exist.
   */
  get() {
    const e = nr(this.#e);
    if (e === void 0)
      throw new Error(`Context "${this.#t}" not found`);
    return e;
  }
  /**
   * Retrieves the context that belongs to the closest parent component,
   * or the given fallback value if the context does not exist.
   *
   * Must be called during component initialisation.
   */
  getOr(e) {
    const r = nr(this.#e);
    return r === void 0 ? e : r;
  }
  /**
   * Associates the given value with the current component and returns it.
   *
   * Must be called during component initialisation.
   */
  set(e) {
    return oi(this.#e, e);
  }
}
function Qs(t, e) {
  switch (t) {
    case "post":
      Qr(e);
      break;
    case "pre":
      Pi(e);
      break;
  }
}
function Tn(t, e, r, n = {}) {
  const { lazy: i = !1 } = n;
  let s = !i, o = Array.isArray(t) ? [] : void 0;
  Qs(e, () => {
    const a = Array.isArray(t) ? t.map((u) => u()) : t();
    if (!s) {
      s = !0, o = a;
      return;
    }
    const l = Wt(() => r(a, o));
    return o = a, l;
  });
}
function He(t, e, r) {
  Tn(t, "post", e, r);
}
function to(t, e, r) {
  Tn(t, "pre", e, r);
}
He.pre = to;
function me(t, e) {
  return {
    [zi()]: (r) => Zt(t) ? (t.current = r, Wt(() => e?.(r)), () => {
      "isConnected" in r && r.isConnected || (t.current = null);
    }) : (t(r), Wt(() => e?.(r)), () => {
      "isConnected" in r && r.isConnected || t(null);
    })
  };
}
function eo(t) {
  return t ? "true" : "false";
}
function An(t) {
  return t ? "" : void 0;
}
function Sn(t) {
  return t ? !0 : void 0;
}
class ro {
  #t;
  #e;
  attrs;
  constructor(e) {
    this.#t = e.getVariant ? e.getVariant() : null, this.#e = this.#t ? `data-${this.#t}-` : `data-${e.component}-`, this.getAttr = this.getAttr.bind(this), this.selector = this.selector.bind(this), this.attrs = Object.fromEntries(e.parts.map((r) => [r, this.getAttr(r)]));
  }
  getAttr(e, r) {
    return r ? `data-${r}-${e}` : `${this.#e}${e}`;
  }
  selector(e, r) {
    return `[${this.getAttr(e, r)}]`;
  }
}
function no(t) {
  const e = new ro(t);
  return {
    ...e.attrs,
    selector: e.selector,
    getAttr: e.getAttr
  };
}
const Ne = "ArrowDown", Ye = "ArrowLeft", Xe = "ArrowRight", Me = "ArrowUp", io = "End", so = "Enter", oo = "Home", ao = " ";
function uo(t) {
  return window.getComputedStyle(t).getPropertyValue("direction");
}
function lo(t = "ltr", e = "horizontal") {
  return {
    horizontal: t === "rtl" ? Ye : Xe,
    vertical: Ne
  }[e];
}
function fo(t = "ltr", e = "horizontal") {
  return {
    horizontal: t === "rtl" ? Xe : Ye,
    vertical: Me
  }[e];
}
function co(t = "ltr", e = "horizontal") {
  return ["ltr", "rtl"].includes(t) || (t = "ltr"), ["horizontal", "vertical"].includes(e) || (e = "horizontal"), {
    nextKey: lo(t, e),
    prevKey: fo(t, e)
  };
}
function ho(t) {
  return t instanceof HTMLElement;
}
class vo {
  #t;
  #e = St(null);
  constructor(e) {
    this.#t = e;
  }
  getCandidateNodes() {
    return this.#t.rootNode.current ? this.#t.candidateSelector ? Array.from(this.#t.rootNode.current.querySelectorAll(this.#t.candidateSelector)) : this.#t.candidateAttr ? Array.from(this.#t.rootNode.current.querySelectorAll(`[${this.#t.candidateAttr}]:not([data-disabled])`)) : [] : [];
  }
  focusFirstCandidate() {
    const e = this.getCandidateNodes();
    e.length && e[0]?.focus();
  }
  handleKeydown(e, r, n = !1) {
    const i = this.#t.rootNode.current;
    if (!i || !e)
      return;
    const s = this.getCandidateNodes();
    if (!s.length)
      return;
    const o = s.indexOf(e), a = uo(i), { nextKey: l, prevKey: u } = co(a, this.#t.orientation.current), d = this.#t.loop.current, p = {
      [l]: o + 1,
      [u]: o - 1,
      [oo]: 0,
      [io]: s.length - 1
    };
    if (n) {
      const c = l === Ne ? Xe : Ne, h = u === Me ? Ye : Me;
      p[c] = o + 1, p[h] = o - 1;
    }
    let f = p[r.key];
    if (f === void 0)
      return;
    r.preventDefault(), f < 0 && d ? f = s.length - 1 : f === s.length && d && (f = 0);
    const v = s[f];
    if (v)
      return v.focus(), this.#e.current = v.id, this.#t.onCandidateFocus?.(v), v;
  }
  getTabIndex(e) {
    const r = this.getCandidateNodes(), n = this.#e.current !== null;
    return e && !n && r[0] === e ? (this.#e.current = e.id, 0) : e?.id === this.#e.current ? 0 : -1;
  }
  setCurrentTabStopId(e) {
    this.#e.current = e;
  }
  focusCurrentTabStop() {
    const e = this.#e.current;
    if (!e)
      return;
    const r = this.#t.rootNode.current?.querySelector(`#${e}`);
    !r || !ho(r) || r.focus();
  }
}
function po() {
}
function we(t, e) {
  return `bits-${t}`;
}
const Ut = no({
  component: "tabs",
  parts: ["root", "list", "trigger", "content"]
}), ye = new Js("Tabs.Root");
class $e {
  static create(e) {
    return ye.set(new $e(e));
  }
  opts;
  attachment;
  rovingFocusGroup;
  #t = /* @__PURE__ */ M(st([]));
  get triggerIds() {
    return g(this.#t);
  }
  set triggerIds(e) {
    S(this.#t, e, !0);
  }
  valueToTriggerId = new Er();
  valueToContentId = new Er();
  constructor(e) {
    this.opts = e, this.attachment = me(e.ref), this.rovingFocusGroup = new vo({
      candidateAttr: Ut.trigger,
      rootNode: this.opts.ref,
      loop: this.opts.loop,
      orientation: this.opts.orientation
    });
  }
  registerTrigger(e, r) {
    return this.triggerIds.push(e), this.valueToTriggerId.set(r, e), () => {
      this.triggerIds = this.triggerIds.filter((n) => n !== e), this.valueToTriggerId.delete(r);
    };
  }
  registerContent(e, r) {
    return this.valueToContentId.set(r, e), () => {
      this.valueToContentId.delete(r);
    };
  }
  setValue(e) {
    this.opts.value.current = e;
  }
  #e = /* @__PURE__ */ F(() => ({
    id: this.opts.id.current,
    "data-orientation": this.opts.orientation.current,
    [Ut.root]: "",
    ...this.attachment
  }));
  get props() {
    return g(this.#e);
  }
  set props(e) {
    S(this.#e, e);
  }
}
class Ze {
  static create(e) {
    return new Ze(e, ye.get());
  }
  opts;
  root;
  attachment;
  #t = /* @__PURE__ */ F(() => this.root.opts.disabled.current);
  constructor(e, r) {
    this.opts = e, this.root = r, this.attachment = me(e.ref);
  }
  #e = /* @__PURE__ */ F(() => ({
    id: this.opts.id.current,
    role: "tablist",
    "aria-orientation": this.root.opts.orientation.current,
    "data-orientation": this.root.opts.orientation.current,
    [Ut.list]: "",
    "data-disabled": An(g(this.#t)),
    ...this.attachment
  }));
  get props() {
    return g(this.#e);
  }
  set props(e) {
    S(this.#e, e);
  }
}
class Je {
  static create(e) {
    return new Je(e, ye.get());
  }
  opts;
  root;
  attachment;
  #t = /* @__PURE__ */ M(0);
  #e = /* @__PURE__ */ F(() => this.root.opts.value.current === this.opts.value.current);
  #r = /* @__PURE__ */ F(() => this.opts.disabled.current || this.root.opts.disabled.current);
  #s = /* @__PURE__ */ F(() => this.root.valueToContentId.get(this.opts.value.current));
  constructor(e, r) {
    this.opts = e, this.root = r, this.attachment = me(e.ref), He([() => this.opts.id.current, () => this.opts.value.current], ([n, i]) => this.root.registerTrigger(n, i)), Qr(() => {
      this.root.triggerIds.length, g(this.#e) || !this.root.opts.value.current ? S(this.#t, 0) : S(this.#t, -1);
    }), this.onfocus = this.onfocus.bind(this), this.onclick = this.onclick.bind(this), this.onkeydown = this.onkeydown.bind(this);
  }
  #i() {
    this.root.opts.value.current !== this.opts.value.current && this.root.setValue(this.opts.value.current);
  }
  onfocus(e) {
    this.root.opts.activationMode.current !== "automatic" || g(this.#r) || this.#i();
  }
  onclick(e) {
    g(this.#r) || this.#i();
  }
  onkeydown(e) {
    if (!g(this.#r)) {
      if (e.key === ao || e.key === so) {
        e.preventDefault(), this.#i();
        return;
      }
      this.root.rovingFocusGroup.handleKeydown(this.opts.ref.current, e);
    }
  }
  #n = /* @__PURE__ */ F(() => ({
    id: this.opts.id.current,
    role: "tab",
    "data-state": xn(g(this.#e)),
    "data-value": this.opts.value.current,
    "data-orientation": this.root.opts.orientation.current,
    "data-disabled": An(g(this.#r)),
    "aria-selected": eo(g(this.#e)),
    "aria-controls": g(this.#s),
    [Ut.trigger]: "",
    disabled: Sn(g(this.#r)),
    tabindex: g(this.#t),
    //
    onclick: this.onclick,
    onfocus: this.onfocus,
    onkeydown: this.onkeydown,
    ...this.attachment
  }));
  get props() {
    return g(this.#n);
  }
  set props(e) {
    S(this.#n, e);
  }
}
class Qe {
  static create(e) {
    return new Qe(e, ye.get());
  }
  opts;
  root;
  attachment;
  #t = /* @__PURE__ */ F(() => this.root.opts.value.current === this.opts.value.current);
  #e = /* @__PURE__ */ F(() => this.root.valueToTriggerId.get(this.opts.value.current));
  constructor(e, r) {
    this.opts = e, this.root = r, this.attachment = me(e.ref), He([() => this.opts.id.current, () => this.opts.value.current], ([n, i]) => this.root.registerContent(n, i));
  }
  #r = /* @__PURE__ */ F(() => ({
    id: this.opts.id.current,
    role: "tabpanel",
    hidden: Sn(!g(this.#t)),
    tabindex: 0,
    "data-value": this.opts.value.current,
    "data-state": xn(g(this.#t)),
    "aria-labelledby": g(this.#e),
    "data-orientation": this.root.opts.orientation.current,
    [Ut.content]: "",
    ...this.attachment
  }));
  get props() {
    return g(this.#r);
  }
  set props(e) {
    S(this.#r, e);
  }
}
function xn(t) {
  return t ? "active" : "inactive";
}
var _o = /* @__PURE__ */ at("<div><!></div>");
function go(t, e) {
  const r = he();
  Kt(e, !0);
  let n = L(e, "id", 19, () => we(r)), i = L(e, "ref", 15, null), s = L(e, "value", 15, ""), o = L(e, "onValueChange", 3, po), a = L(e, "orientation", 3, "horizontal"), l = L(e, "loop", 3, !0), u = L(e, "activationMode", 3, "automatic"), d = L(e, "disabled", 3, !1), p = /* @__PURE__ */ _e(e, [
    "$$slots",
    "$$events",
    "$$legacy",
    "id",
    "ref",
    "value",
    "onValueChange",
    "orientation",
    "loop",
    "activationMode",
    "disabled",
    "children",
    "child"
  ]);
  const f = $e.create({
    id: R(() => n()),
    value: R(() => s(), (y) => {
      s(y), o()(y);
    }),
    orientation: R(() => a()),
    loop: R(() => l()),
    activationMode: R(() => u()),
    disabled: R(() => d()),
    ref: R(() => i(), (y) => i(y))
  }), v = /* @__PURE__ */ F(() => be(p, f.props));
  var c = gt(), h = tt(c);
  {
    var _ = (y) => {
      var m = gt(), E = tt(m);
      bt(E, () => e.child, () => ({ props: g(v) })), C(y, m);
    }, b = (y) => {
      var m = _o();
      pe(m, () => ({ ...g(v) }));
      var E = Xt(m);
      bt(E, () => e.children ?? Gt), C(y, m);
    };
    ve(h, (y) => {
      e.child ? y(_) : y(b, -1);
    });
  }
  C(t, c), Ht();
}
var bo = /* @__PURE__ */ at("<div><!></div>");
function Tr(t, e) {
  const r = he();
  Kt(e, !0);
  let n = L(e, "id", 19, () => we(r)), i = L(e, "ref", 15, null), s = /* @__PURE__ */ _e(e, [
    "$$slots",
    "$$events",
    "$$legacy",
    "children",
    "child",
    "id",
    "ref",
    "value"
  ]);
  const o = Qe.create({
    value: R(() => e.value),
    id: R(() => n()),
    ref: R(() => i(), (f) => i(f))
  }), a = /* @__PURE__ */ F(() => be(s, o.props));
  var l = gt(), u = tt(l);
  {
    var d = (f) => {
      var v = gt(), c = tt(v);
      bt(c, () => e.child, () => ({ props: g(a) })), C(f, v);
    }, p = (f) => {
      var v = bo();
      pe(v, () => ({ ...g(a) }));
      var c = Xt(v);
      bt(c, () => e.children ?? Gt), C(f, v);
    };
    ve(u, (f) => {
      e.child ? f(d) : f(p, -1);
    });
  }
  C(t, l), Ht();
}
var mo = /* @__PURE__ */ at("<div><!></div>");
function wo(t, e) {
  const r = he();
  Kt(e, !0);
  let n = L(e, "id", 19, () => we(r)), i = L(e, "ref", 15, null), s = /* @__PURE__ */ _e(e, [
    "$$slots",
    "$$events",
    "$$legacy",
    "child",
    "children",
    "id",
    "ref"
  ]);
  const o = Ze.create({
    id: R(() => n()),
    ref: R(() => i(), (f) => i(f))
  }), a = /* @__PURE__ */ F(() => be(s, o.props));
  var l = gt(), u = tt(l);
  {
    var d = (f) => {
      var v = gt(), c = tt(v);
      bt(c, () => e.child, () => ({ props: g(a) })), C(f, v);
    }, p = (f) => {
      var v = mo();
      pe(v, () => ({ ...g(a) }));
      var c = Xt(v);
      bt(c, () => e.children ?? Gt), C(f, v);
    };
    ve(u, (f) => {
      e.child ? f(d) : f(p, -1);
    });
  }
  C(t, l), Ht();
}
var yo = /* @__PURE__ */ at("<button><!></button>");
function Ar(t, e) {
  const r = he();
  Kt(e, !0);
  let n = L(e, "disabled", 3, !1), i = L(e, "id", 19, () => we(r)), s = L(e, "type", 3, "button"), o = L(e, "ref", 15, null), a = /* @__PURE__ */ _e(e, [
    "$$slots",
    "$$events",
    "$$legacy",
    "child",
    "children",
    "disabled",
    "id",
    "type",
    "value",
    "ref"
  ]);
  const l = Je.create({
    id: R(() => i()),
    disabled: R(() => n() ?? !1),
    value: R(() => e.value),
    ref: R(() => o(), (c) => o(c))
  }), u = /* @__PURE__ */ F(() => be(a, l.props, { type: s() }));
  var d = gt(), p = tt(d);
  {
    var f = (c) => {
      var h = gt(), _ = tt(h);
      bt(_, () => e.child, () => ({ props: g(u) })), C(c, h);
    }, v = (c) => {
      var h = yo();
      pe(h, () => ({ ...g(u) }));
      var _ = Xt(h);
      bt(_, () => e.children ?? Gt), C(c, h);
    };
    ve(p, (c) => {
      e.child ? c(f) : c(v, -1);
    });
  }
  C(t, d), Ht();
}
var Eo = /* @__PURE__ */ at("<!> <!>", 1), To = /* @__PURE__ */ at('<div class="content-card svelte-1n46o8q"><h3 class="card-title svelte-1n46o8q">Your Profile</h3> <p class="card-text svelte-1n46o8q">Name: Demo User</p> <p class="card-text svelte-1n46o8q">Email: demo@example.com</p></div>'), Ao = /* @__PURE__ */ at('<div class="content-card svelte-1n46o8q"><h3 class="card-title svelte-1n46o8q">Settings</h3> <p class="card-text svelte-1n46o8q">Theme: Dark</p> <p class="card-text svelte-1n46o8q">Notifications: On</p></div>'), So = /* @__PURE__ */ at("<!> <!> <!>", 1), xo = /* @__PURE__ */ at('<div class="app svelte-1n46o8q"><h2 class="title svelte-1n46o8q">bits-ui Tabs</h2> <!></div>');
const Co = {
  hash: "svelte-1n46o8q",
  code: ".app.svelte-1n46o8q {display:flex;flex-direction:column;padding:24px;gap:16px;font-family:sans-serif;max-width:480px;color:#eee;}.title.svelte-1n46o8q {margin:0;font-size:20px;font-weight:600;}.tabs-root {display:flex;flex-direction:column;gap:0;}.tabs-list {display:flex;gap:2px;padding-bottom:0;border-bottom:2px solid #2a2a3a;}.tab-trigger {padding:10px 18px;font-size:14px;color:#aaa;background:transparent;border-radius:5px 5px 0 0;}.tab-content {padding:20px 0;}.content-card.svelte-1n46o8q {display:flex;flex-direction:column;gap:8px;padding:16px;background:#1e1e2e;border-radius:8px;}.card-title.svelte-1n46o8q {margin:0;font-size:15px;font-weight:600;}.card-text.svelte-1n46o8q {margin:0;font-size:13px;color:#aaa;}"
};
function Oo(t) {
  es(t, Co);
  let e = /* @__PURE__ */ M("profile");
  var r = xo(), n = Qt(Xt(r), 2);
  xt(n, () => go, (i, s) => {
    s(i, {
      class: "tabs-root",
      get value() {
        return g(e);
      },
      set value(o) {
        S(e, o, !0);
      },
      children: (o, a) => {
        var l = So(), u = tt(l);
        xt(u, () => wo, (f, v) => {
          v(f, {
            class: "tabs-list",
            children: (c, h) => {
              var _ = Eo(), b = tt(_);
              xt(b, () => Ar, (m, E) => {
                E(m, {
                  value: "profile",
                  class: "tab-trigger",
                  children: (N, ut) => {
                    var I = dr("Profile");
                    C(N, I);
                  },
                  $$slots: { default: !0 }
                });
              });
              var y = Qt(b, 2);
              xt(y, () => Ar, (m, E) => {
                E(m, {
                  value: "settings",
                  class: "tab-trigger",
                  children: (N, ut) => {
                    var I = dr("Settings");
                    C(N, I);
                  },
                  $$slots: { default: !0 }
                });
              }), C(c, _);
            },
            $$slots: { default: !0 }
          });
        });
        var d = Qt(u, 2);
        xt(d, () => Tr, (f, v) => {
          v(f, {
            value: "profile",
            class: "tab-content",
            children: (c, h) => {
              var _ = To();
              C(c, _);
            },
            $$slots: { default: !0 }
          });
        });
        var p = Qt(d, 2);
        xt(p, () => Tr, (f, v) => {
          v(f, {
            value: "settings",
            class: "tab-content",
            children: (c, h) => {
              var _ = Ao();
              C(c, _);
            },
            $$slots: { default: !0 }
          });
        }), C(o, l);
      },
      $$slots: { default: !0 }
    });
  }), C(t, r);
}
function Po(t) {
  return Ji(Oo, { target: t });
}
export {
  Po as default,
  Po as rvst_mount
};

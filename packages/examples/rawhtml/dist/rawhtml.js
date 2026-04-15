var Vt = Array.isArray, qt = Array.prototype.indexOf, ae = Array.prototype.includes, Yt = Array.from, Ut = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, $t = Object.prototype, Bt = Array.prototype, zt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Gt = () => {
};
function Kt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, me = 4, Ne = 8, ft = 1 << 24, W = 16, K = 32, te = 64, Fe = 128, R = 512, y = 1024, S = 2048, H = 4096, B = 8192, L = 16384, de = 32768, Ke = 1 << 25, ke = 65536, We = 1 << 17, Wt = 1 << 18, ve = 1 << 19, Zt = 1 << 20, ne = 65536, Pe = 1 << 21, Ve = 1 << 22, z = 1 << 23, Oe = Symbol("$state"), Y = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Jt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Qt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Xt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function en() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function nn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const rn = 2, E = Symbol(), sn = "http://www.w3.org/1999/xhtml", ln = "http://www.w3.org/2000/svg", fn = "http://www.w3.org/1998/Math/MathML";
function un() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ut(e) {
  return e === this.v;
}
let P = null;
function oe(e) {
  P = e;
}
function an(e, t = !1, n) {
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
function on(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mn(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function at() {
  return !0;
}
let se = [];
function cn() {
  var e = se;
  se = [], Kt(e);
}
function ue(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && cn();
    });
  }
  se.push(e);
}
function ot(e) {
  var t = p;
  if (t === null)
    return _.f |= z, e;
  if ((t.f & de) === 0 && (t.f & me) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
  for (; t !== null; ) {
    if ((t.f & Fe) !== 0) {
      if ((t.f & de) === 0)
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
const hn = -7169;
function m(e, t) {
  e.f = e.f & hn | t;
}
function qe(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, H);
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
  (e.f & S) !== 0 ? t.add(e) : (e.f & H) !== 0 && n.add(e), ct(e.deps), m(e, y);
}
const J = /* @__PURE__ */ new Set();
let w = null, O = null, Ie = null, De = !1, le = null, xe = null;
var Ze = 0;
let dn = 1;
class re {
  // for debugging. TODO remove once async is stable
  id = dn++;
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<(batch: Batch) => void>}
   */
  #i = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #v = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #l = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #f = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #r = null;
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
  #u = !1;
  #a() {
    return this.is_fork || this.#f > 0;
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
        m(r, S), this.schedule(r);
      for (r of n.m)
        m(r, H), this.schedule(r);
    }
  }
  #c() {
    if (Ze++ > 1e3 && (J.delete(this), vn()), !this.#a()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, S), this.schedule(f);
      for (const f of this.#n)
        m(f, H), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#h(f, n, r);
      } catch (l) {
        throw pt(f), l;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, xe = null, this.#a()) {
      this.#d(r), this.#d(n);
      for (const [f, l] of this.#s)
        _t(f, l);
    } else {
      this.#l === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), Je(r), Je(n), this.#r?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((l) => !f.#e.includes(l)));
    }
    a !== null && (J.add(a), a.#c()), J.has(this) || this.#o();
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #h(t, n, r) {
    t.f ^= y;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (K | te)) !== 0, f = a && (s & y) !== 0, l = f || (s & B) !== 0 || this.#s.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= y : (s & me) !== 0 ? n.push(i) : be(i) && ((s & W) !== 0 && this.#n.add(i), he(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      ht(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & z) === 0 && (this.current.set(t, t.v), O?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, O = null;
  }
  flush() {
    try {
      De = !0, w = this, this.#c();
    } finally {
      Ze = 0, Ie = null, le = null, xe = null, De = !1, w = null, O = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#v) t(this);
    this.#v.clear(), J.delete(this);
  }
  #o() {
    for (const l of J) {
      var t = l.id < this.id, n = [];
      for (const [u, o] of this.current) {
        if (l.current.has(u))
          if (t && o !== l.current.get(u))
            l.current.set(u, o);
          else
            continue;
        n.push(u);
      }
      var r = [...l.current.keys()].filter((u) => !this.current.has(u));
      if (r.length === 0)
        t && l.discard();
      else if (n.length > 0) {
        l.activate();
        var i = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Map();
        for (var a of n)
          dt(a, r, i, s);
        if (l.#e.length > 0) {
          l.apply();
          for (var f of l.#e)
            l.#h(f, [], []);
          l.#e = [];
        }
        l.deactivate();
      }
    }
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#l += 1, t && (this.#f += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#l -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, ue(() => {
      this.#u = !1, this.flush();
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
    this.#i.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#v.add(t);
  }
  settled() {
    return (this.#r ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      De || (J.add(w), ue(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      O = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ie = t, t.b?.is_pending && (t.f & (me | Ne | ft)) !== 0 && (t.f & de) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | K)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function vn() {
  try {
    Qt();
  } catch (e) {
    $(e, Ie);
  }
}
let q = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | B)) === 0 && be(r) && (q = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ct(r), q?.size > 0)) {
        G.clear();
        for (const i of q) {
          if ((i.f & (L | B)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            q.has(a) && (q.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (L | B)) === 0 && he(l);
          }
        }
        q.clear();
      }
    }
    q = null;
  }
}
function dt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? dt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (Ve | W)) !== 0 && (s & S) === 0 && vt(i, t, r) && (m(i, S), Ye(
        /** @type {Effect} */
        i
      ));
    }
}
function vt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && vt(
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
function Ye(e) {
  w.schedule(e);
}
function _t(e, t) {
  if (!((e.f & K) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & H) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      _t(n, t), n = n.next;
  }
}
function pt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    pt(t), t = t.next;
}
function _n(e) {
  let t = 0, n = Me(0), r;
  return () => {
    Be() && (F(n), Dn(() => (t === 0 && (r = Vn(() => e(() => we(n)))), t += 1, () => {
      ue(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, we(n));
      });
    })));
  };
}
var pn = ke | ve;
function gn(e, t, n, r) {
  new wn(e, t, n, r);
}
class wn {
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
  #i;
  /** @type {TemplateNode | null} */
  #v = null;
  /** @type {BoundaryProps} */
  #l;
  /** @type {((anchor: Node) => void)} */
  #f;
  /** @type {Effect} */
  #r;
  /** @type {Effect | null} */
  #e = null;
  /** @type {Effect | null} */
  #t = null;
  /** @type {Effect | null} */
  #n = null;
  /** @type {DocumentFragment | null} */
  #s = null;
  #u = 0;
  #a = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #d = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #m = _n(() => (this.#o = Me(this.#u), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#l = n, this.#f = (s) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Fe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Fn(() => {
      this.#g();
    }, pn);
  }
  #y() {
    try {
      this.#e = Q(() => this.#f(this.#i));
    } catch (t) {
      this.error(t);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #b(t) {
    const n = this.#l.failed;
    n && (this.#n = Q(() => {
      n(
        this.#i,
        () => t,
        () => () => {
        }
      );
    }));
  }
  #E() {
    const t = this.#l.pending;
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#i)), ue(() => {
      var n = this.#s = document.createDocumentFragment(), r = St();
      n.append(r), this.#e = this.#p(() => Q(() => this.#f(r))), this.#a === 0 && (this.#i.before(n), this.#s = null, Te(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#_(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#u = 0, this.#e = Q(() => {
        this.#f(this.#i);
      }), this.#a > 0) {
        var t = this.#s = document.createDocumentFragment();
        In(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#l.pending
        );
        this.#t = Q(() => n(this.#i));
      } else
        this.#_(
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
  #_(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ht(t, this.#h, this.#d);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#l.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var n = p, r = _, i = P;
    V(this.#r), M(this.#r), oe(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ot(s), null;
    } finally {
      V(n), M(r), oe(i);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  #w(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#w(t, n);
      return;
    }
    this.#a += t, this.#a === 0 && (this.#_(n), this.#t && Te(this.#t, () => {
      this.#t = null;
    }), this.#s && (this.#i.before(this.#s), this.#s = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#w(t, n), this.#u += t, !(!this.#o || this.#c) && (this.#c = !0, ue(() => {
      this.#c = !1, this.#o && Re(this.#o, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), F(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#l.onerror;
    let r = this.#l.failed;
    if (!n && !r)
      throw t;
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        un();
        return;
      }
      i = !0, s && nn(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, a), s = !1;
      } catch (u) {
        $(u, this.#r && this.#r.parent);
      }
      r && (this.#n = this.#p(() => {
        try {
          return Q(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= Fe, r(
              this.#i,
              () => l,
              () => a
            );
          });
        } catch (u) {
          return $(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    ue(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (u) {
        $(u, this.#r && this.#r.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        f,
        /** @param {unknown} e */
        (u) => $(u, this.#r && this.#r.parent)
      ) : f(l);
    });
  }
}
function mn(e, t, n, r) {
  const i = bn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = yn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (a.f & L) === 0 && $(v, a);
    }
    Ae();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var o = gt();
  function h() {
    Promise.all(n.map((c) => /* @__PURE__ */ En(c))).then((c) => u([...t.map(i), ...c])).catch((c) => $(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    f(), h(), Ae();
  }) : h();
}
function yn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    V(e), M(t), oe(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  V(null), M(null), oe(null), e && w?.deactivate();
}
function gt() {
  var e = (
    /** @type {Boundary} */
    /** @type {Effect} */
    p.b
  ), t = (
    /** @type {Batch} */
    w
  ), n = e.is_rendered();
  return e.update_pending_count(1, t), t.increment(n), (r = !1) => {
    e.update_pending_count(-1, t), t.decrement(n, r);
  };
}
// @__NO_SIDE_EFFECTS__
function bn(e) {
  var t = b | S, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
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
function En(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Jt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Me(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return On(() => {
    var l = (
      /** @type {Effect} */
      p
    ), u = lt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Ae);
    } catch (v) {
      u.reject(v), Ae();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((l.f & de) !== 0)
        var h = gt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(Y), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(Y);
        f.clear();
      }
      f.set(o, u);
    }
    const c = (v, d = void 0) => {
      if (h) {
        var g = d === Y;
        h(g);
      }
      if (!(d === Y || (l.f & L) !== 0)) {
        if (o.activate(), d)
          s.f |= z, Re(s, d);
        else {
          (s.f & z) !== 0 && (s.f ^= z), Re(s, v);
          for (const [x, C] of f) {
            if (f.delete(x), x === o) break;
            C.reject(Y);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (v) => c(null, v || "unknown"));
  }), Nn(() => {
    for (const l of f.values())
      l.reject(Y);
  }), new Promise((l) => {
    function u(o) {
      function h() {
        o === i ? l(s) : u(i);
      }
      o.then(h, h);
    }
    u(i);
  });
}
function xn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      j(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Tn(e) {
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
function Ue(e) {
  var t, n = p;
  V(Tn(e));
  try {
    e.f &= ~ne, xn(e), t = It(e);
  } finally {
    V(n);
  }
  return t;
}
function wt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    m(e, y);
    return;
  }
  ce || (O !== null ? (Be() || w?.is_fork) && O.set(e, n) : qe(e));
}
function Sn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(Y), t.teardown = Gt, t.ac = null, ye(t, 0), ze(t));
}
function mt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let Le = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let yt = !1;
function Me(e, t) {
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
function I(e, t) {
  const n = Me(e);
  return Ln(n), n;
}
function U(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!D || (_.f & We) !== 0) && at() && (_.f & (b | W | Ve | We)) !== 0 && (N === null || !ae.call(N, e)) && tn();
  let r = n ? _e(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ce ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & S) !== 0 && Ue(s), O === null && qe(s);
    }
    e.wv = Ft(), bt(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (K | te)) === 0 && (A === null ? jn([e]) : A.push(e)), !i.is_fork && Le.size > 0 && !yt && kn();
  }
  return t;
}
function kn() {
  yt = !1;
  for (const e of Le)
    (e.f & y) !== 0 && m(e, H), be(e) && he(e);
  Le.clear();
}
function we(e) {
  U(e, e.v + 1);
}
function bt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & S) === 0;
      if (l && m(a, t), (f & b) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        O?.delete(u), (f & ne) === 0 && (f & R && (a.f |= ne), bt(u, H, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & W) !== 0 && q !== null && q.add(o), n !== null ? n.push(o) : Ye(o);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = zt(e);
  if (t !== $t && t !== Bt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Vt(e), i = /* @__PURE__ */ I(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var l = _, u = ee;
    M(null), nt(s);
    var o = f();
    return M(l), nt(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Xt();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var h = /* @__PURE__ */ I(u.value);
          return n.set(l, h), h;
        }) : U(o, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const o = a(() => /* @__PURE__ */ I(E));
            n.set(l, o), we(i);
          }
        } else
          U(u, E), we(i);
        return !0;
      },
      get(f, l, u) {
        if (l === Oe)
          return e;
        var o = n.get(l), h = l in f;
        if (o === void 0 && (!h || ge(f, l)?.writable) && (o = a(() => {
          var v = _e(h ? f[l] : E), d = /* @__PURE__ */ I(v);
          return d;
        }), n.set(l, o)), o !== void 0) {
          var c = F(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var o = n.get(l);
          o && (u.value = F(o));
        } else if (u === void 0) {
          var h = n.get(l), c = h?.v;
          if (h !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return u;
      },
      has(f, l) {
        if (l === Oe)
          return !0;
        var u = n.get(l), o = u !== void 0 && u.v !== E || Reflect.has(f, l);
        if (u !== void 0 || p !== null && (!o || ge(f, l)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? _e(f[l]) : E, v = /* @__PURE__ */ I(c);
            return v;
          }), n.set(l, u));
          var h = F(u);
          if (h === E)
            return !1;
        }
        return o;
      },
      set(f, l, u, o) {
        var h = n.get(l), c = l in f;
        if (r && l === "length")
          for (var v = u; v < /** @type {Source<number>} */
          h.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? U(d, E) : v in f && (d = a(() => /* @__PURE__ */ I(E)), n.set(v + "", d));
          }
        if (h === void 0)
          (!c || ge(f, l)?.writable) && (h = a(() => /* @__PURE__ */ I(void 0)), U(h, _e(u)), n.set(l, h));
        else {
          c = h.v !== E;
          var g = a(() => _e(u));
          U(h, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, l);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof l == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(l);
            Number.isInteger(ie) && ie >= C.v && U(C, ie + 1);
          }
          we(i);
        }
        return !0;
      },
      ownKeys(f) {
        F(i);
        var l = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        en();
      }
    }
  );
}
var Qe, Et, xt, Tt;
function An() {
  if (Qe === void 0) {
    Qe = window, Et = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    xt = ge(t, "firstChild").get, Tt = ge(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function St(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function fe(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $e(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
function Xe(e, t) {
  return /* @__PURE__ */ fe(e);
}
function et(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r);
  return r;
}
function kt(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(t ?? sn, e, void 0)
  );
}
function At(e) {
  var t = _, n = p;
  M(null), V(null);
  try {
    return e();
  } finally {
    M(t), V(n);
  }
}
function Rn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & B) !== 0 && (e |= B);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | S | R,
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
  if ((e & me) !== 0)
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & W) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Rn(i, n), _ !== null && (_.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Be() {
  return _ !== null && !D;
}
function Nn(e) {
  const t = Z(Ne, null);
  return m(t, y), t.teardown = e, t;
}
function Mn(e) {
  return Z(me | Zt, e);
}
function Cn(e) {
  re.ensure();
  const t = Z(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function On(e) {
  return Z(Ve | ve, e);
}
function Dn(e, t = 0) {
  return Z(Ne | t, e);
}
function Rt(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    Z(Ne, () => e(...i.map(F)));
  });
}
function Fn(e, t = 0) {
  var n = Z(W | t, e);
  return n;
}
function Q(e) {
  return Z(K | ve, e);
}
function Nt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ce, r = _;
    tt(!0), M(null);
    try {
      t.call(null);
    } finally {
      tt(n), M(r);
    }
  }
}
function ze(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && At(() => {
      i.abort(Y);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Pn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & K) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Wt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Mt(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ke), ze(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Nt(e), e.f ^= Ke, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Ct(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Mt(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $e(e);
    e.remove(), e = n;
  }
}
function Ct(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Ot(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ot(e, t, n) {
  if ((e.f & B) === 0) {
    e.f ^= B;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & K) !== 0 && (e.f & W) !== 0;
      Ot(i, t, a ? n : !1), i = s;
    }
  }
}
function In(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ $e(n);
      t.append(n), n = i;
    }
}
let Se = !1, ce = !1;
function tt(e) {
  ce = e;
}
let _ = null, D = !1;
function M(e) {
  _ = e;
}
let p = null;
function V(e) {
  p = e;
}
let N = null;
function Ln(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, k = 0, A = null;
function jn(e) {
  A = e;
}
let Dt = 1, X = 0, ee = X;
function nt(e) {
  ee = e;
}
function Ft() {
  return ++Dt;
}
function be(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & H) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (be(
        /** @type {Derived} */
        s
      ) && wt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    O === null && m(e, y);
  }
  return !1;
}
function Pt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ae.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Pt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, H), Ye(
        /** @type {Effect} */
        s
      ));
    }
}
function It(e) {
  var t = T, n = k, r = A, i = _, s = N, a = P, f = D, l = ee, u = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, _ = (u & (K | te)) === 0 ? e : null, N = null, oe(e.ctx), D = !1, ee = ++X, e.ac !== null && (At(() => {
    e.ac.abort(Y);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var o = (
      /** @type {Function} */
      e.fn
    ), h = o();
    e.f |= de;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var d;
      if (v || ye(e, k), c !== null && k > 0)
        for (c.length = k + T.length, d = 0; d < T.length; d++)
          c[k + d] = T[d];
      else
        e.deps = c = T;
      if (Be() && (e.f & R) !== 0)
        for (d = k; d < c.length; d++)
          (c[d].reactions ??= []).push(e);
    } else !v && c !== null && k < c.length && (ye(e, k), c.length = k);
    if (at() && A !== null && !D && c !== null && (e.f & (b | H | S)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Pt(
          A[d],
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
    return (e.f & z) !== 0 && (e.f ^= z), h;
  } catch (g) {
    return ot(g);
  } finally {
    e.f ^= Pe, T = t, k = n, A = r, _ = i, N = s, oe(a), D = f, ee = l;
  }
}
function Hn(e, t) {
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
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), qe(s), Sn(s), ye(s, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Hn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = p, r = Se;
    p = e, Se = !0;
    try {
      (t & (W | ft)) !== 0 ? Pn(e) : ze(e), Nt(e);
      var i = It(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Dt;
      var s;
    } finally {
      Se = r, p = n;
    }
  }
}
function F(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !D) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (N === null || !ae.call(N, e))) {
      var i = _.deps;
      if ((_.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ce && G.has(e))
    return G.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ce) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || jt(a)) && (f = Ue(a)), G.set(a, f), f;
    }
    var l = (a.f & R) === 0 && !D && _ !== null && (Se || (_.f & R) !== 0), u = (a.f & de) === 0;
    be(a) && (l && (a.f |= R), wt(a)), l && !u && (mt(a), Lt(a));
  }
  if (O?.has(e))
    return O.get(e);
  if ((e.f & z) !== 0)
    throw e.v;
  return e.v;
}
function Lt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (mt(
        /** @type {Derived} */
        t
      ), Lt(
        /** @type {Derived} */
        t
      ));
}
function jt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & b) !== 0 && jt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Vn(e) {
  var t = D;
  try {
    return D = !0, e();
  } finally {
    D = t;
  }
}
const rt = globalThis.Deno?.core?.ops ?? null;
function qn(e, ...t) {
  rt?.[e] ? rt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Yn(e, t) {
  qn("op_set_text", e, t);
}
const Un = ["touchstart", "touchmove"];
function $n(e) {
  return Un.includes(e);
}
const pe = Symbol("events"), Ht = /* @__PURE__ */ new Set(), je = /* @__PURE__ */ new Set();
function Bn(e, t, n) {
  (t[pe] ??= {})[e] = n;
}
function zn(e) {
  for (var t = 0; t < e.length; t++)
    Ht.add(e[t]);
  for (var n of je)
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
  var a = 0, f = it === e && e[pe];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[pe] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Ut(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, h = p;
    M(null), V(null);
    try {
      for (var c, v = []; s !== null; ) {
        var d = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[pe]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || d === t || d === null)
          break;
        s = d;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[pe] = t, delete e.currentTarget, M(o), V(h);
    }
  }
}
const Gn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Kn(e) {
  return (
    /** @type {string} */
    Gn?.createHTML(e) ?? e
  );
}
function Wn(e) {
  var t = kt("template");
  return t.innerHTML = Kn(e.replaceAll("<!>", "<!---->")), t.content;
}
function He(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Zn(e, t) {
  var n = (t & rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Wn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ fe(r));
    var s = (
      /** @type {TemplateNode} */
      n || Et ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return He(s, s), s;
  };
}
function Jn(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Qn(e, t) {
  return Xn(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function Xn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  An();
  var l = void 0, u = Cn(() => {
    var o = n ?? t.appendChild(St());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        an({});
        var d = (
          /** @type {ComponentContext} */
          P
        );
        s && (d.c = s), i && (r.$$events = i), l = e(v, r) || {}, on();
      },
      f
    );
    var h = /* @__PURE__ */ new Set(), c = (v) => {
      for (var d = 0; d < v.length; d++) {
        var g = v[d];
        if (!h.has(g)) {
          h.add(g);
          var x = $n(g);
          for (const Ce of [t, document]) {
            var C = Ee.get(Ce);
            C === void 0 && (C = /* @__PURE__ */ new Map(), Ee.set(Ce, C));
            var ie = C.get(g);
            ie === void 0 ? (Ce.addEventListener(g, st, { passive: x }), C.set(g, 1)) : C.set(g, ie + 1);
          }
        }
      }
    };
    return c(Yt(Ht)), je.add(c), () => {
      for (var v of h)
        for (const x of [t, document]) {
          var d = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            d.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, st), d.delete(v), d.size === 0 && Ee.delete(x)) : d.set(v, g);
        }
      je.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return er.set(l, u), l;
}
let er = /* @__PURE__ */ new WeakMap();
function tr(e, t, n = !1, r = !1, i = !1, s = !1) {
  var a = e, f = "";
  if (n)
    var l = (
      /** @type {Element} */
      e
    );
  Rt(() => {
    var u = (
      /** @type {Effect} */
      p
    );
    if (f !== (f = t() ?? "")) {
      if (n) {
        u.nodes = null, l.innerHTML = /** @type {string} */
        f, f !== "" && He(
          /** @type {TemplateNode} */
          /* @__PURE__ */ fe(l),
          /** @type {TemplateNode} */
          l.lastChild
        );
        return;
      }
      if (u.nodes !== null && (Mt(
        u.nodes.start,
        /** @type {TemplateNode} */
        u.nodes.end
      ), u.nodes = null), f !== "") {
        var o = r ? ln : i ? fn : void 0, h = (
          /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */
          kt(r ? "svg" : i ? "math" : "template", o)
        );
        h.innerHTML = /** @type {any} */
        f;
        var c = r || i ? h : (
          /** @type {HTMLTemplateElement} */
          h.content
        );
        if (He(
          /** @type {TemplateNode} */
          /* @__PURE__ */ fe(c),
          /** @type {TemplateNode} */
          c.lastChild
        ), r || i)
          for (; /* @__PURE__ */ fe(c); )
            a.before(
              /** @type {TemplateNode} */
              /* @__PURE__ */ fe(c)
            );
        else
          a.before(c);
      }
    }
  });
}
var nr = /* @__PURE__ */ Zn('<div><div class="content"></div> <button>Update</button> <div> </div></div>');
function rr(e) {
  let t = /* @__PURE__ */ I("Hello <strong>World</strong>"), n = /* @__PURE__ */ I(1);
  var r = nr(), i = Xe(r);
  tr(i, () => F(t), !0);
  var s = et(i, 2), a = et(s, 2), f = Xe(a);
  Rt(() => Yn(f, `Version: ${F(n) ?? ""}`)), Bn("click", s, () => {
    U(n, F(n) + 1), U(t, `Version: ${F(n)}`);
  }), Jn(e, r);
}
zn(["click"]);
function sr(e) {
  return Qn(rr, { target: e });
}
export {
  sr as default,
  sr as rvst_mount
};

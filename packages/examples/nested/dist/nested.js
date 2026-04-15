var Yt = Array.isArray, Bt = Array.prototype.indexOf, ue = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Ht = Object.prototype, zt = Array.prototype, Kt = Object.getPrototypeOf, We = Object.isExtensible;
const Gt = () => {
};
function Wt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, me = 4, Ne = 8, st = 1 << 24, $ = 16, W = 32, te = 64, Pe = 128, R = 512, y = 1024, k = 2048, L = 4096, z = 8192, I = 16384, he = 32768, $e = 1 << 25, Se = 65536, Ze = 1 << 17, $t = 1 << 18, ve = 1 << 19, Zt = 1 << 20, ne = 65536, Me = 1 << 21, Be = 1 << 22, K = 1 << 23, Fe = Symbol("$state"), U = new class extends Error {
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
const rn = 2, E = Symbol(), ln = "http://www.w3.org/1999/xhtml";
function sn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ft(e) {
  return e === this.v;
}
let P = null;
function ae(e) {
  P = e;
}
function fn(e, t = !1, n) {
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
function un(e) {
  var t = (
    /** @type {ComponentContext} */
    P
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      On(r);
  }
  return t.i = !0, P = t.p, /** @type {T} */
  {};
}
function ut() {
  return !0;
}
let le = [];
function an() {
  var e = le;
  le = [], Wt(e);
}
function fe(e) {
  if (le.length === 0) {
    var t = le;
    queueMicrotask(() => {
      t === le && an();
    });
  }
  le.push(e);
}
function at(e) {
  var t = p;
  if (t === null)
    return _.f |= K, e;
  if ((t.f & he) === 0 && (t.f & me) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
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
const on = -7169;
function m(e, t) {
  e.f = e.f & on | t;
}
function Ue(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, L);
}
function ot(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ot(
        /** @type {Derived} */
        t.deps
      ));
}
function ct(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), ot(e.deps), m(e, y);
}
const J = /* @__PURE__ */ new Set();
let w = null, F = null, Ie = null, Ce = !1, se = null, xe = null;
var Je = 0;
let cn = 1;
class re {
  // for debugging. TODO remove once async is stable
  id = cn++;
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
  #d = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #s = 0;
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
  #l = /* @__PURE__ */ new Map();
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, L), this.schedule(r);
    }
  }
  #c() {
    if (Je++ > 1e3 && (J.delete(this), hn()), !this.#a()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = se = [], r = [], i = xe = [];
    for (const f of t)
      try {
        this.#h(f, n, r);
      } catch (s) {
        throw _t(f), s;
      }
    if (w = null, i.length > 0) {
      var l = re.ensure();
      for (const f of i)
        l.schedule(f);
    }
    if (se = null, xe = null, this.#a()) {
      this.#v(r), this.#v(n);
      for (const [f, s] of this.#l)
        dt(f, s);
    } else {
      this.#s === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), Qe(r), Qe(n), this.#r?.resolve();
    }
    var a = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = a ??= this;
      f.#e.push(...this.#e.filter((s) => !f.#e.includes(s)));
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
      var l = i.f, a = (l & (W | te)) !== 0, f = a && (l & y) !== 0, s = f || (l & z) !== 0 || this.#l.has(i);
      if (!s && i.fn !== null) {
        a ? i.f ^= y : (l & me) !== 0 ? n.push(i) : be(i) && ((l & $) !== 0 && this.#n.add(i), ce(i));
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
  #v(t) {
    for (var n = 0; n < t.length; n += 1)
      ct(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, t.v), F?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, F = null;
  }
  flush() {
    try {
      Ce = !0, w = this, this.#c();
    } finally {
      Je = 0, Ie = null, se = null, xe = null, Ce = !1, w = null, F = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), J.delete(this);
  }
  #o() {
    for (const s of J) {
      var t = s.id < this.id, n = [];
      for (const [u, o] of this.current) {
        if (s.current.has(u))
          if (t && o !== s.current.get(u))
            s.current.set(u, o);
          else
            continue;
        n.push(u);
      }
      var r = [...s.current.keys()].filter((u) => !this.current.has(u));
      if (r.length === 0)
        t && s.discard();
      else if (n.length > 0) {
        s.activate();
        var i = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Map();
        for (var a of n)
          ht(a, r, i, l);
        if (s.#e.length > 0) {
          s.apply();
          for (var f of s.#e)
            s.#h(f, [], []);
          s.#e = [];
        }
        s.deactivate();
      }
    }
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#s += 1, t && (this.#f += 1);
  }
  /**
   * @param {boolean} blocking
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(t, n) {
    this.#s -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, fe(() => {
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
    this.#d.add(t);
  }
  settled() {
    return (this.#r ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Ce || (J.add(w), fe(() => {
        w === t && t.flush();
      }));
    }
    return w;
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
    if (Ie = t, t.b?.is_pending && (t.f & (me | Ne | st)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (se !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | W)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function hn() {
  try {
    Qt();
  } catch (e) {
    H(e, Ie);
  }
}
let B = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | z)) === 0 && be(r) && (B = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nt(r), B?.size > 0)) {
        G.clear();
        for (const i of B) {
          if ((i.f & (I | z)) !== 0) continue;
          const l = [i];
          let a = i.parent;
          for (; a !== null; )
            B.has(a) && (B.delete(a), l.push(a)), a = a.parent;
          for (let f = l.length - 1; f >= 0; f--) {
            const s = l[f];
            (s.f & (I | z)) === 0 && ce(s);
          }
        }
        B.clear();
      }
    }
    B = null;
  }
}
function ht(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & b) !== 0 ? ht(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (l & (Be | $)) !== 0 && (l & k) === 0 && vt(i, t, r) && (m(i, k), Ve(
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
      if (ue.call(t, i))
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
function Ve(e) {
  w.schedule(e);
}
function dt(e, t) {
  if (!((e.f & W) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      dt(n, t), n = n.next;
  }
}
function _t(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    _t(t), t = t.next;
}
function vn(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    Ke() && (M(n), Cn(() => (t === 0 && (r = Bn(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var dn = Se | ve;
function _n(e, t, n, r) {
  new pn(e, t, n, r);
}
class pn {
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
  #d = null;
  /** @type {BoundaryProps} */
  #s;
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
  #l = null;
  #u = 0;
  #a = 0;
  #c = !1;
  /** @type {Set<Effect>} */
  #h = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #v = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #m = vn(() => (this.#o = Oe(this.#u), () => {
    this.#o = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#s = n, this.#f = (l) => {
      var a = (
        /** @type {Effect} */
        p
      );
      a.b = this, a.f |= Pe, r(l);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#r = Pn(() => {
      this.#g();
    }, dn);
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
    const n = this.#s.failed;
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
    const t = this.#s.pending;
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#i)), fe(() => {
      var n = this.#l = document.createDocumentFragment(), r = Tt();
      n.append(r), this.#e = this.#p(() => Q(() => this.#f(r))), this.#a === 0 && (this.#i.before(n), this.#l = null, Te(
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
        var t = this.#l = document.createDocumentFragment();
        jn(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#s.pending
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
    this.is_pending = !1, t.transfer_effects(this.#h, this.#v);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    ct(t, this.#h, this.#v);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#s.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #p(t) {
    var n = p, r = _, i = P;
    q(this.#r), O(this.#r), ae(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (l) {
      return at(l), null;
    } finally {
      q(n), O(r), ae(i);
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
    }), this.#l && (this.#i.before(this.#l), this.#l = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(t, n) {
    this.#w(t, n), this.#u += t, !(!this.#o || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#o && Re(this.#o, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), M(
      /** @type {Source<number>} */
      this.#o
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#s.onerror;
    let r = this.#s.failed;
    if (!n && !r)
      throw t;
    this.#e && (j(this.#e), this.#e = null), this.#t && (j(this.#t), this.#t = null), this.#n && (j(this.#n), this.#n = null);
    var i = !1, l = !1;
    const a = () => {
      if (i) {
        sn();
        return;
      }
      i = !0, l && nn(), this.#n !== null && Te(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (s) => {
      try {
        l = !0, n?.(s, a), l = !1;
      } catch (u) {
        H(u, this.#r && this.#r.parent);
      }
      r && (this.#n = this.#p(() => {
        try {
          return Q(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= Pe, r(
              this.#i,
              () => s,
              () => a
            );
          });
        } catch (u) {
          return H(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var s;
      try {
        s = this.transform_error(t);
      } catch (u) {
        H(u, this.#r && this.#r.parent);
        return;
      }
      s !== null && typeof s == "object" && typeof /** @type {any} */
      s.then == "function" ? s.then(
        f,
        /** @param {unknown} e */
        (u) => H(u, this.#r && this.#r.parent)
      ) : f(s);
    });
  }
}
function gn(e, t, n, r) {
  const i = mn;
  var l = e.filter((c) => !c.settled);
  if (n.length === 0 && l.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = wn(), s = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (d) {
      (a.f & I) === 0 && H(d, a);
    }
    Ae();
  }
  if (n.length === 0) {
    s.then(() => u(t.map(i)));
    return;
  }
  var o = pt();
  function v() {
    Promise.all(n.map((c) => /* @__PURE__ */ yn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  s ? s.then(() => {
    f(), v(), Ae();
  }) : v();
}
function wn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = P, r = (
    /** @type {Batch} */
    w
  );
  return function(l = !0) {
    q(e), O(t), ae(n), l && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Ae(e = !0) {
  q(null), O(null), ae(null), e && w?.deactivate();
}
function pt() {
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
function mn(e) {
  var t = b | k, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= ve), {
    ctx: P,
    deps: null,
    effects: null,
    equals: ft,
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
function yn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Jt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Oe(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return Fn(() => {
    var s = (
      /** @type {Effect} */
      p
    ), u = lt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Ae);
    } catch (d) {
      u.reject(d), Ae();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((s.f & he) !== 0)
        var v = pt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(U), f.delete(o);
      else {
        for (const d of f.values())
          d.reject(U);
        f.clear();
      }
      f.set(o, u);
    }
    const c = (d, h = void 0) => {
      if (v) {
        var g = h === U;
        v(g);
      }
      if (!(h === U || (s.f & I) !== 0)) {
        if (o.activate(), h)
          l.f |= K, Re(l, h);
        else {
          (l.f & K) !== 0 && (l.f ^= K), Re(l, d);
          for (const [x, D] of f) {
            if (f.delete(x), x === o) break;
            D.reject(U);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (d) => c(null, d || "unknown"));
  }), Nn(() => {
    for (const s of f.values())
      s.reject(U);
  }), new Promise((s) => {
    function u(o) {
      function v() {
        o === i ? s(l) : u(i);
      }
      o.then(v, v);
    }
    u(i);
  });
}
function bn(e) {
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
function En(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & I) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function He(e) {
  var t, n = p;
  q(En(e));
  try {
    e.f &= ~ne, bn(e), t = Pt(e);
  } finally {
    q(n);
  }
  return t;
}
function gt(e) {
  var t = e.v, n = He(e);
  if (!e.equals(n) && (e.wv = Ft(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (F !== null ? (Ke() || w?.is_fork) && F.set(e, n) : Ue(e));
}
function xn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Gt, t.ac = null, ye(t, 0), Ge(t));
}
function wt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let je = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let mt = !1;
function Oe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ft,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Y(e, t) {
  const n = Oe(e);
  return Ln(n), n;
}
function V(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!C || (_.f & Ze) !== 0) && ut() && (_.f & (b | $ | Be | Ze)) !== 0 && (N === null || !ue.call(N, e)) && tn();
  let r = n ? de(t) : t;
  return Re(e, r, xe);
}
function Re(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const l = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && He(l), F === null && Ue(l);
    }
    e.wv = Ft(), yt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (W | te)) === 0 && (A === null ? qn([e]) : A.push(e)), !i.is_fork && je.size > 0 && !mt && Tn();
  }
  return t;
}
function Tn() {
  mt = !1;
  for (const e of je)
    (e.f & y) !== 0 && m(e, L), be(e) && ce(e);
  je.clear();
}
function kn(e, t = 1) {
  var n = M(e), r = t === 1 ? n++ : n--;
  return V(e, n), r;
}
function ge(e) {
  V(e, e.v + 1);
}
function yt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var a = r[l], f = a.f, s = (f & k) === 0;
      if (s && m(a, t), (f & b) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        F?.delete(u), (f & ne) === 0 && (f & R && (a.f |= ne), yt(u, L, n));
      } else if (s) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & $) !== 0 && B !== null && B.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || Fe in e)
    return e;
  const t = Kt(e);
  if (t !== Ht && t !== zt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yt(e), i = /* @__PURE__ */ Y(0), l = ee, a = (f) => {
    if (ee === l)
      return f();
    var s = _, u = ee;
    O(null), tt(l);
    var o = f();
    return O(s), tt(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Xt();
        var o = n.get(s);
        return o === void 0 ? a(() => {
          var v = /* @__PURE__ */ Y(u.value);
          return n.set(s, v), v;
        }) : V(o, u.value, !0), !0;
      },
      deleteProperty(f, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in f) {
            const o = a(() => /* @__PURE__ */ Y(E));
            n.set(s, o), ge(i);
          }
        } else
          V(u, E), ge(i);
        return !0;
      },
      get(f, s, u) {
        if (s === Fe)
          return e;
        var o = n.get(s), v = s in f;
        if (o === void 0 && (!v || pe(f, s)?.writable) && (o = a(() => {
          var d = de(v ? f[s] : E), h = /* @__PURE__ */ Y(d);
          return h;
        }), n.set(s, o)), o !== void 0) {
          var c = M(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, s, u);
      },
      getOwnPropertyDescriptor(f, s) {
        var u = Reflect.getOwnPropertyDescriptor(f, s);
        if (u && "value" in u) {
          var o = n.get(s);
          o && (u.value = M(o));
        } else if (u === void 0) {
          var v = n.get(s), c = v?.v;
          if (v !== void 0 && c !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return u;
      },
      has(f, s) {
        if (s === Fe)
          return !0;
        var u = n.get(s), o = u !== void 0 && u.v !== E || Reflect.has(f, s);
        if (u !== void 0 || p !== null && (!o || pe(f, s)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? de(f[s]) : E, d = /* @__PURE__ */ Y(c);
            return d;
          }), n.set(s, u));
          var v = M(u);
          if (v === E)
            return !1;
        }
        return o;
      },
      set(f, s, u, o) {
        var v = n.get(s), c = s in f;
        if (r && s === "length")
          for (var d = u; d < /** @type {Source<number>} */
          v.v; d += 1) {
            var h = n.get(d + "");
            h !== void 0 ? V(h, E) : d in f && (h = a(() => /* @__PURE__ */ Y(E)), n.set(d + "", h));
          }
        if (v === void 0)
          (!c || pe(f, s)?.writable) && (v = a(() => /* @__PURE__ */ Y(void 0)), V(v, de(u)), n.set(s, v));
        else {
          c = v.v !== E;
          var g = a(() => de(u));
          V(v, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, s);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof s == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(s);
            Number.isInteger(ie) && ie >= D.v && V(D, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        M(i);
        var s = Reflect.ownKeys(f).filter((v) => {
          var c = n.get(v);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in f) && s.push(u);
        return s;
      },
      setPrototypeOf() {
        en();
      }
    }
  );
}
var Xe, bt, Et, xt;
function Sn() {
  if (Xe === void 0) {
    Xe = window, bt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Et = pe(t, "firstChild").get, xt = pe(t, "nextSibling").get, We(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), We(n) && (n.__t = void 0);
  }
}
function Tt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function kt(e) {
  return (
    /** @type {TemplateNode | null} */
    Et.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function ze(e) {
  return (
    /** @type {TemplateNode | null} */
    xt.call(e)
  );
}
function we(e, t) {
  return /* @__PURE__ */ kt(e);
}
function Le(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ ze(r);
  return r;
}
function An(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(ln, e, void 0)
  );
}
function St(e) {
  var t = _, n = p;
  O(null), q(null);
  try {
    return e();
  } finally {
    O(t), q(n);
  }
}
function Rn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & z) !== 0 && (e |= z);
  var r = {
    ctx: P,
    deps: null,
    nodes: null,
    f: e | k | R,
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
    se !== null ? se.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & ve) === 0 && (i = i.first, (e & $) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && Rn(i, n), _ !== null && (_.f & b) !== 0 && (e & te) === 0)) {
    var l = (
      /** @type {Derived} */
      _
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function Ke() {
  return _ !== null && !C;
}
function Nn(e) {
  const t = Z(Ne, null);
  return m(t, y), t.teardown = e, t;
}
function On(e) {
  return Z(me | Zt, e);
}
function Dn(e) {
  re.ensure();
  const t = Z(te | ve, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Te(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function Fn(e) {
  return Z(Be | ve, e);
}
function Cn(e, t = 0) {
  return Z(Ne | t, e);
}
function At(e, t = [], n = [], r = []) {
  gn(r, t, n, (i) => {
    Z(Ne, () => e(...i.map(M)));
  });
}
function Pn(e, t = 0) {
  var n = Z($ | t, e);
  return n;
}
function Q(e) {
  return Z(W | ve, e);
}
function Rt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = _;
    et(!0), O(null);
    try {
      t.call(null);
    } finally {
      et(n), O(r);
    }
  }
}
function Ge(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && St(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function Mn(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & $t) !== 0) && e.nodes !== null && e.nodes.end !== null && (In(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, $e), Ge(e, t && !n), ye(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Rt(e), e.f ^= $e, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Nt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function In(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ ze(e);
    e.remove(), e = n;
  }
}
function Nt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Te(e, t, n = !0) {
  var r = [];
  Ot(e, r, !0);
  var i = () => {
    n && j(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var a = () => --l || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ot(e, t, n) {
  if ((e.f & z) === 0) {
    e.f ^= z;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var l = i.next, a = (i.f & Se) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & W) !== 0 && (e.f & $) !== 0;
      Ot(i, t, a ? n : !1), i = l;
    }
  }
}
function jn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ ze(n);
      t.append(n), n = i;
    }
}
let ke = !1, oe = !1;
function et(e) {
  oe = e;
}
let _ = null, C = !1;
function O(e) {
  _ = e;
}
let p = null;
function q(e) {
  p = e;
}
let N = null;
function Ln(e) {
  _ !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, S = 0, A = null;
function qn(e) {
  A = e;
}
let Dt = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function Ft() {
  return ++Dt;
}
function be(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & L) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (be(
        /** @type {Derived} */
        l
      ) && gt(
        /** @type {Derived} */
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    F === null && m(e, y);
  }
  return !1;
}
function Ct(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && ue.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & b) !== 0 ? Ct(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? m(l, k) : (l.f & y) !== 0 && m(l, L), Ve(
        /** @type {Effect} */
        l
      ));
    }
}
function Pt(e) {
  var t = T, n = S, r = A, i = _, l = N, a = P, f = C, s = ee, u = e.f;
  T = /** @type {null | Value[]} */
  null, S = 0, A = null, _ = (u & (W | te)) === 0 ? e : null, N = null, ae(e.ctx), C = !1, ee = ++X, e.ac !== null && (St(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Me;
    var o = (
      /** @type {Function} */
      e.fn
    ), v = o();
    e.f |= he;
    var c = e.deps, d = w?.is_fork;
    if (T !== null) {
      var h;
      if (d || ye(e, S), c !== null && S > 0)
        for (c.length = S + T.length, h = 0; h < T.length; h++)
          c[S + h] = T[h];
      else
        e.deps = c = T;
      if (Ke() && (e.f & R) !== 0)
        for (h = S; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !d && c !== null && S < c.length && (ye(e, S), c.length = S);
    if (ut() && A !== null && !C && c !== null && (e.f & (b | L | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      A.length; h++)
        Ct(
          A[h],
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
    return (e.f & K) !== 0 && (e.f ^= K), v;
  } catch (g) {
    return at(g);
  } finally {
    e.f ^= Me, T = t, S = n, A = r, _ = i, N = l, ae(a), C = f, ee = s;
  }
}
function Yn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var l = (
      /** @type {Derived} */
      t
    );
    (l.f & R) !== 0 && (l.f ^= R, l.f &= ~ne), Ue(l), xn(l), ye(l, 0);
  }
}
function ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Yn(e, n[r]);
}
function ce(e) {
  var t = e.f;
  if ((t & I) === 0) {
    m(e, y);
    var n = p, r = ke;
    p = e, ke = !0;
    try {
      (t & ($ | st)) !== 0 ? Mn(e) : Ge(e), Rt(e);
      var i = Pt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Dt;
      var l;
    } finally {
      ke = r, p = n;
    }
  }
}
function M(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !C) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (N === null || !ue.call(N, e))) {
      var i = _.deps;
      if ((_.f & Me) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[S] === e ? S++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [_] : ue.call(l, _) || l.push(_);
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
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || It(a)) && (f = He(a)), G.set(a, f), f;
    }
    var s = (a.f & R) === 0 && !C && _ !== null && (ke || (_.f & R) !== 0), u = (a.f & he) === 0;
    be(a) && (s && (a.f |= R), gt(a)), s && !u && (wt(a), Mt(a));
  }
  if (F?.has(e))
    return F.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function Mt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (wt(
        /** @type {Derived} */
        t
      ), Mt(
        /** @type {Derived} */
        t
      ));
}
function It(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & b) !== 0 && It(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Bn(e) {
  var t = C;
  try {
    return C = !0, e();
  } finally {
    C = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function qe(e, t) {
  Un("op_set_text", e, t);
}
const Vn = ["touchstart", "touchmove"];
function Hn(e) {
  return Vn.includes(e);
}
const _e = Symbol("events"), jt = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function zn(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function Kn(e) {
  for (var t = 0; t < e.length; t++)
    jt.add(e[t]);
  for (var n of Ye)
    n(e);
}
let rt = null;
function it(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  rt = e;
  var a = 0, f = rt === e && e[_e];
  if (f) {
    var s = i.indexOf(f);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[_e] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    s <= u && (a = s);
  }
  if (l = /** @type {Element} */
  i[a] || e.target, l !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var o = _, v = p;
    O(null), q(null);
    try {
      for (var c, d = []; l !== null; ) {
        var h = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var g = l[_e]?.[r];
          g != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l) && g.call(l, e);
        } catch (x) {
          c ? d.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        l = h;
      }
      if (c) {
        for (let x of d)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[_e] = t, delete e.currentTarget, O(o), q(v);
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
function Wn(e) {
  return (
    /** @type {string} */
    Gn?.createHTML(e) ?? e
  );
}
function $n(e) {
  var t = An("template");
  return t.innerHTML = Wn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Zn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Lt(e, t) {
  var n = (t & rn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = $n(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ kt(r));
    var l = (
      /** @type {TemplateNode} */
      n || bt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Zn(l, l), l;
  };
}
function qt(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Jn(e, t) {
  return Qn(e, t);
}
const Ee = /* @__PURE__ */ new Map();
function Qn(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: a = !0, transformError: f }) {
  Sn();
  var s = void 0, u = Dn(() => {
    var o = n ?? t.appendChild(Tt());
    _n(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (d) => {
        fn({});
        var h = (
          /** @type {ComponentContext} */
          P
        );
        l && (h.c = l), i && (r.$$events = i), s = e(d, r) || {}, un();
      },
      f
    );
    var v = /* @__PURE__ */ new Set(), c = (d) => {
      for (var h = 0; h < d.length; h++) {
        var g = d[h];
        if (!v.has(g)) {
          v.add(g);
          var x = Hn(g);
          for (const De of [t, document]) {
            var D = Ee.get(De);
            D === void 0 && (D = /* @__PURE__ */ new Map(), Ee.set(De, D));
            var ie = D.get(g);
            ie === void 0 ? (De.addEventListener(g, it, { passive: x }), D.set(g, 1)) : D.set(g, ie + 1);
          }
        }
      }
    };
    return c(Ut(jt)), Ye.add(c), () => {
      for (var d of v)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            Ee.get(x)
          ), g = (
            /** @type {number} */
            h.get(d)
          );
          --g == 0 ? (x.removeEventListener(d, it), h.delete(d), h.size === 0 && Ee.delete(x)) : h.set(d, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return Xn.set(s, u), s;
}
let Xn = /* @__PURE__ */ new WeakMap();
var er = /* @__PURE__ */ Lt('<div><span class="label"> </span> <span class="value"> </span> <button>Bump</button></div>');
function tr(e, t) {
  var n = er(), r = we(n), i = we(r), l = Le(r, 2), a = we(l), f = Le(l, 2);
  At(() => {
    qe(i, t.label), qe(a, t.value);
  }), zn("click", f, function(...s) {
    t.onclick?.apply(this, s);
  }), qt(e, n);
}
Kn(["click"]);
var nr = /* @__PURE__ */ Lt("<div><!> <div> </div></div>");
function rr(e) {
  let t = /* @__PURE__ */ Y(0), n = "items";
  var r = nr(), i = we(r);
  tr(i, {
    label: n,
    get value() {
      return M(t);
    },
    onclick: () => kn(t)
  });
  var l = Le(i, 2), a = we(l);
  At(() => qe(a, `Total: ${M(t) ?? ""}`)), qt(e, r);
}
function lr(e) {
  return Jn(rr, { target: e });
}
export {
  lr as default,
  lr as rvst_mount
};

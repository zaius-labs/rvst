var $t = Array.isArray, Bt = Array.prototype.indexOf, ae = Array.prototype.includes, Ht = Array.from, zt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Kt = Object.prototype, Gt = Array.prototype, Wt = Object.getPrototypeOf, Ke = Object.isExtensible;
const Zt = () => {
};
function Jt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function lt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Re = 8, ft = 1 << 24, W = 16, B = 32, te = 64, Me = 128, N = 512, y = 1024, k = 2048, Y = 4096, z = 8192, L = 16384, se = 32768, Ge = 1 << 25, ke = 65536, We = 1 << 17, Qt = 1 << 18, de = 1 << 19, Xt = 1 << 20, ne = 65536, Pe = 1 << 21, qe = 1 << 22, K = 1 << 23, Oe = Symbol("$state"), $ = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function ut(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function en() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function tn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function nn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function rn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function sn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ln() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function fn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function un() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function on() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const an = 2, E = Symbol(), cn = "http://www.w3.org/1999/xhtml";
function hn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let S = null;
function ce(e) {
  S = e;
}
function at(e, t = !1, n) {
  S = {
    p: S,
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
function ct(e) {
  var t = (
    /** @type {ComponentContext} */
    S
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Ot(r);
  }
  return t.i = !0, S = t.p, /** @type {T} */
  {};
}
function ht() {
  return !0;
}
let fe = [];
function dn() {
  var e = fe;
  fe = [], Jt(e);
}
function oe(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && dn();
    });
  }
  fe.push(e);
}
function dt(e) {
  var t = p;
  if (t === null)
    return _.f |= K, e;
  if ((t.f & se) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Me) !== 0) {
      if ((t.f & se) === 0)
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
const _n = -7169;
function m(e, t) {
  e.f = e.f & _n | t;
}
function Ye(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, Y);
}
function _t(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, _t(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), _t(e.deps), m(e, y);
}
const J = /* @__PURE__ */ new Set();
let w = null, C = null, Ie = null, Fe = !1, ue = null, Ee = null;
var Ze = 0;
let vn = 1;
class re {
  // for debugging. TODO remove once async is stable
  id = vn++;
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
  #_ = /* @__PURE__ */ new Set();
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
  #o() {
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, Y), this.schedule(r);
    }
  }
  #c() {
    if (Ze++ > 1e3 && (J.delete(this), pn()), !this.#o()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, Y), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ue = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#h(f, n, r);
      } catch (l) {
        throw mt(f), l;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (ue = null, Ee = null, this.#o()) {
      this.#d(r), this.#d(n);
      for (const [f, l] of this.#s)
        wt(f, l);
    } else {
      this.#l === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), Je(r), Je(n), this.#r?.resolve();
    }
    var o = (
      /** @type {Batch | null} */
      /** @type {unknown} */
      w
    );
    if (this.#e.length > 0) {
      const f = o ??= this;
      f.#e.push(...this.#e.filter((l) => !f.#e.includes(l)));
    }
    o !== null && (J.add(o), o.#c()), J.has(this) || this.#a();
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
      var s = i.f, o = (s & (B | te)) !== 0, f = o && (s & y) !== 0, l = f || (s & z) !== 0 || this.#s.has(i);
      if (!l && i.fn !== null) {
        o ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & W) !== 0 && this.#n.add(i), he(i));
        var u = i.first;
        if (u !== null) {
          i = u;
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
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      vt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & K) === 0 && (this.current.set(t, t.v), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Fe = !0, w = this, this.#c();
    } finally {
      Ze = 0, Ie = null, ue = null, Ee = null, Fe = !1, w = null, C = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#_) t(this);
    this.#_.clear(), J.delete(this);
  }
  #a() {
    for (const l of J) {
      var t = l.id < this.id, n = [];
      for (const [u, a] of this.current) {
        if (l.current.has(u))
          if (t && a !== l.current.get(u))
            l.current.set(u, a);
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
        for (var o of n)
          pt(o, r, i, s);
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
    this.#l -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, oe(() => {
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
    this.#_.add(t);
  }
  settled() {
    return (this.#r ??= lt()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Fe || (J.add(w), oe(() => {
        w === t && t.flush();
      }));
    }
    return w;
  }
  apply() {
    {
      C = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(t) {
    if (Ie = t, t.b?.is_pending && (t.f & (we | Re | ft)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | B)) !== 0) {
        if ((r & y) === 0)
          return;
        n.f ^= y;
      }
    }
    this.#e.push(n);
  }
}
function pn() {
  try {
    sn();
  } catch (e) {
    H(e, Ie);
  }
}
let V = null;
function Je(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | z)) === 0 && ye(r) && (V = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ct(r), V?.size > 0)) {
        G.clear();
        for (const i of V) {
          if ((i.f & (L | z)) !== 0) continue;
          const s = [i];
          let o = i.parent;
          for (; o !== null; )
            V.has(o) && (V.delete(o), s.push(o)), o = o.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (L | z)) === 0 && he(l);
          }
        }
        V.clear();
      }
    }
    V = null;
  }
}
function pt(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? pt(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & (qe | W)) !== 0 && (s & k) === 0 && gt(i, t, r) && (m(i, k), Ue(
        /** @type {Effect} */
        i
      ));
    }
}
function gt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ae.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && gt(
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
function Ue(e) {
  w.schedule(e);
}
function wt(e, t) {
  if (!((e.f & B) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      wt(n, t), n = n.next;
  }
}
function mt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    mt(t), t = t.next;
}
function gn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Be() && (j(n), Ln(() => (t === 0 && (r = ze(() => e(() => ge(n)))), t += 1, () => {
      oe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var wn = ke | de;
function mn(e, t, n, r) {
  new yn(e, t, n, r);
}
class yn {
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
  #_ = null;
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
  #o = 0;
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
  #a = null;
  #m = gn(() => (this.#a = Ne(this.#u), () => {
    this.#a = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(t, n, r, i) {
    this.#i = t, this.#l = n, this.#f = (s) => {
      var o = (
        /** @type {Effect} */
        p
      );
      o.b = this, o.f |= Me, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Yn(() => {
      this.#g();
    }, wn);
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#i)), oe(() => {
      var n = this.#s = document.createDocumentFragment(), r = Rt();
      n.append(r), this.#e = this.#p(() => Q(() => this.#f(r))), this.#o === 0 && (this.#i.before(n), this.#s = null, xe(
        /** @type {Effect} */
        this.#t,
        () => {
          this.#t = null;
        }
      ), this.#v(
        /** @type {Batch} */
        w
      ));
    }));
  }
  #g() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#u = 0, this.#e = Q(() => {
        this.#f(this.#i);
      }), this.#o > 0) {
        var t = this.#s = document.createDocumentFragment();
        $n(this.#e, t);
        const n = (
          /** @type {(anchor: Node) => void} */
          this.#l.pending
        );
        this.#t = Q(() => n(this.#i));
      } else
        this.#v(
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
  #v(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#d);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    vt(t, this.#h, this.#d);
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
    var n = p, r = _, i = S;
    U(this.#r), O(this.#r), ce(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return dt(s), null;
    } finally {
      U(n), O(r), ce(i);
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
    this.#o += t, this.#o === 0 && (this.#v(n), this.#t && xe(this.#t, () => {
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
    this.#w(t, n), this.#u += t, !(!this.#a || this.#c) && (this.#c = !0, oe(() => {
      this.#c = !1, this.#a && Ae(this.#a, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), j(
      /** @type {Source<number>} */
      this.#a
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#l.onerror;
    let r = this.#l.failed;
    if (!n && !r)
      throw t;
    this.#e && (q(this.#e), this.#e = null), this.#t && (q(this.#t), this.#t = null), this.#n && (q(this.#n), this.#n = null);
    var i = !1, s = !1;
    const o = () => {
      if (i) {
        hn();
        return;
      }
      i = !0, s && on(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, o), s = !1;
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
            u.b = this, u.f |= Me, r(
              this.#i,
              () => l,
              () => o
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
    oe(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (u) {
        H(u, this.#r && this.#r.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        f,
        /** @param {unknown} e */
        (u) => H(u, this.#r && this.#r.parent)
      ) : f(l);
    });
  }
}
function bn(e, t, n, r) {
  const i = xn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var o = (
    /** @type {Effect} */
    p
  ), f = En(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (o.f & L) === 0 && H(v, o);
    }
    Se();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var a = yt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ Tn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => H(c, o)).finally(() => a());
  }
  l ? l.then(() => {
    f(), d(), Se();
  }) : d();
}
function En() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = S, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    U(e), O(t), ce(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function Se(e = !0) {
  U(null), O(null), ce(null), e && w?.deactivate();
}
function yt() {
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
function xn(e) {
  var t = b | k, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: S,
    deps: null,
    effects: null,
    equals: ot,
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
function Tn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && en();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), o = !_, f = /* @__PURE__ */ new Map();
  return jn(() => {
    var l = (
      /** @type {Effect} */
      p
    ), u = lt();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Se);
    } catch (v) {
      u.reject(v), Se();
    }
    var a = (
      /** @type {Batch} */
      w
    );
    if (o) {
      if ((l.f & se) !== 0)
        var d = yt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(a)?.reject($), f.delete(a);
      else {
        for (const v of f.values())
          v.reject($);
        f.clear();
      }
      f.set(a, u);
    }
    const c = (v, h = void 0) => {
      if (d) {
        var g = h === $;
        d(g);
      }
      if (!(h === $ || (l.f & L) !== 0)) {
        if (a.activate(), h)
          s.f |= K, Ae(s, h);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ae(s, v);
          for (const [x, F] of f) {
            if (f.delete(x), x === a) break;
            F.reject($);
          }
        }
        a.deactivate();
      }
    };
    u.promise.then(c, (v) => c(null, v || "unknown"));
  }), Mn(() => {
    for (const l of f.values())
      l.reject($);
  }), new Promise((l) => {
    function u(a) {
      function d() {
        a === i ? l(s) : u(i);
      }
      a.then(d, d);
    }
    u(i);
  });
}
function kn(e) {
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
function Sn(e) {
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
function Ve(e) {
  var t, n = p;
  U(Sn(e));
  try {
    e.f &= ~ne, kn(e), t = Lt(e);
  } finally {
    U(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = Ve(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    m(e, y);
    return;
  }
  ie || (C !== null ? (Be() || w?.is_fork) && C.set(e, n) : Ye(e));
}
function An(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort($), t.teardown = Zt, t.ac = null, me(t, 0), He(t));
}
function Et(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let je = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let xt = !1;
function Ne(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: ot,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function P(e, t) {
  const n = Ne(e);
  return Bn(n), n;
}
function I(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!M || (_.f & We) !== 0) && ht() && (_.f & (b | W | qe | We)) !== 0 && (D === null || !ae.call(D, e)) && un();
  let r = n ? _e(t) : t;
  return Ae(e, r, Ee);
}
function Ae(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    ie ? G.set(e, t) : G.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && Ve(s), C === null && Ye(s);
    }
    e.wv = It(), Tt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (B | te)) === 0 && (R === null ? Hn([e]) : R.push(e)), !i.is_fork && je.size > 0 && !xt && Rn();
  }
  return t;
}
function Rn() {
  xt = !1;
  for (const e of je)
    (e.f & y) !== 0 && m(e, Y), ye(e) && he(e);
  je.clear();
}
function Nn(e, t = 1) {
  var n = j(e), r = t === 1 ? n++ : n--;
  return I(e, n), r;
}
function ge(e) {
  I(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var o = r[s], f = o.f, l = (f & k) === 0;
      if (l && m(o, t), (f & b) !== 0) {
        var u = (
          /** @type {Derived} */
          o
        );
        C?.delete(u), (f & ne) === 0 && (f & N && (o.f |= ne), Tt(u, Y, n));
      } else if (l) {
        var a = (
          /** @type {Effect} */
          o
        );
        (f & W) !== 0 && V !== null && V.add(a), n !== null ? n.push(a) : Ue(a);
      }
    }
}
function _e(e) {
  if (typeof e != "object" || e === null || Oe in e)
    return e;
  const t = Wt(e);
  if (t !== Kt && t !== Gt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = $t(e), i = /* @__PURE__ */ P(0), s = ee, o = (f) => {
    if (ee === s)
      return f();
    var l = _, u = ee;
    O(null), tt(s);
    var a = f();
    return O(l), tt(u), a;
  };
  return r && n.set("length", /* @__PURE__ */ P(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && ln();
        var a = n.get(l);
        return a === void 0 ? o(() => {
          var d = /* @__PURE__ */ P(u.value);
          return n.set(l, d), d;
        }) : I(a, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const a = o(() => /* @__PURE__ */ P(E));
            n.set(l, a), ge(i);
          }
        } else
          I(u, E), ge(i);
        return !0;
      },
      get(f, l, u) {
        if (l === Oe)
          return e;
        var a = n.get(l), d = l in f;
        if (a === void 0 && (!d || pe(f, l)?.writable) && (a = o(() => {
          var v = _e(d ? f[l] : E), h = /* @__PURE__ */ P(v);
          return h;
        }), n.set(l, a)), a !== void 0) {
          var c = j(a);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var a = n.get(l);
          a && (u.value = j(a));
        } else if (u === void 0) {
          var d = n.get(l), c = d?.v;
          if (d !== void 0 && c !== E)
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
        var u = n.get(l), a = u !== void 0 && u.v !== E || Reflect.has(f, l);
        if (u !== void 0 || p !== null && (!a || pe(f, l)?.writable)) {
          u === void 0 && (u = o(() => {
            var c = a ? _e(f[l]) : E, v = /* @__PURE__ */ P(c);
            return v;
          }), n.set(l, u));
          var d = j(u);
          if (d === E)
            return !1;
        }
        return a;
      },
      set(f, l, u, a) {
        var d = n.get(l), c = l in f;
        if (r && l === "length")
          for (var v = u; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? I(h, E) : v in f && (h = o(() => /* @__PURE__ */ P(E)), n.set(v + "", h));
          }
        if (d === void 0)
          (!c || pe(f, l)?.writable) && (d = o(() => /* @__PURE__ */ P(void 0)), I(d, _e(u)), n.set(l, d));
        else {
          c = d.v !== E;
          var g = o(() => _e(u));
          I(d, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, l);
        if (x?.set && x.set.call(a, u), !c) {
          if (r && typeof l == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(l);
            Number.isInteger(le) && le >= F.v && I(F, le + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        j(i);
        var l = Reflect.ownKeys(f).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== E;
        });
        for (var [u, a] of n)
          a.v !== E && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        fn();
      }
    }
  );
}
var Qe, kt, St, At;
function Dn() {
  if (Qe === void 0) {
    Qe = window, kt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    St = pe(t, "firstChild").get, At = pe(t, "nextSibling").get, Ke(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ke(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function $e(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function Xe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ $e(r);
  return r;
}
function On(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(cn, e, void 0)
  );
}
function Dt(e) {
  var t = _, n = p;
  O(null), U(null);
  try {
    return e();
  } finally {
    O(t), U(n);
  }
}
function Fn(e) {
  p === null && (_ === null && rn(), nn()), ie && tn();
}
function Cn(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & z) !== 0 && (e |= z);
  var r = {
    ctx: S,
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
    ue !== null ? ue.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (o) {
      throw q(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & W) !== 0 && (e & ke) !== 0 && i !== null && (i.f |= ke));
  }
  if (i !== null && (i.parent = n, n !== null && Cn(i, n), _ !== null && (_.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      _
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Be() {
  return _ !== null && !M;
}
function Mn(e) {
  const t = Z(Re, null);
  return m(t, y), t.teardown = e, t;
}
function Pn(e) {
  Fn();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !_ && (t & B) !== 0 && (t & se) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      S
    );
    (r.e ??= []).push(e);
  } else
    return Ot(e);
}
function Ot(e) {
  return Z(we | Xt, e);
}
function In(e) {
  re.ensure();
  const t = Z(te | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      q(t), r(void 0);
    }) : (q(t), r(void 0));
  });
}
function jn(e) {
  return Z(qe | de, e);
}
function Ln(e, t = 0) {
  return Z(Re | t, e);
}
function qn(e, t = [], n = [], r = []) {
  bn(r, t, n, (i) => {
    Z(Re, () => e(...i.map(j)));
  });
}
function Yn(e, t = 0) {
  var n = Z(W | t, e);
  return n;
}
function Q(e) {
  return Z(B | de, e);
}
function Ft(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = _;
    et(!0), O(null);
    try {
      t.call(null);
    } finally {
      et(n), O(r);
    }
  }
}
function He(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Dt(() => {
      i.abort($);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : q(n, t), n = r;
  }
}
function Un(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && q(t), t = n;
  }
}
function q(e, t = !0) {
  var n = !1;
  (t || (e.f & Qt) !== 0) && e.nodes !== null && e.nodes.end !== null && (Vn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ge), He(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ft(e), e.f ^= Ge, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Ct(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function Vn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ $e(e);
    e.remove(), e = n;
  }
}
function Ct(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Mt(e, r, !0);
  var i = () => {
    n && q(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var o = () => --s || i();
    for (var f of r)
      f.out(o);
  } else
    i();
}
function Mt(e, t, n) {
  if ((e.f & z) === 0) {
    e.f ^= z;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, o = (i.f & ke) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & W) !== 0;
      Mt(i, t, o ? n : !1), i = s;
    }
  }
}
function $n(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ $e(n);
      t.append(n), n = i;
    }
}
let Te = !1, ie = !1;
function et(e) {
  ie = e;
}
let _ = null, M = !1;
function O(e) {
  _ = e;
}
let p = null;
function U(e) {
  p = e;
}
let D = null;
function Bn(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, A = 0, R = null;
function Hn(e) {
  R = e;
}
let Pt = 1, X = 0, ee = X;
function tt(e) {
  ee = e;
}
function It() {
  return ++Pt;
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
      ) && bt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & N) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, y);
  }
  return !1;
}
function jt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(D !== null && ae.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, Y), Ue(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = A, r = R, i = _, s = D, o = S, f = M, l = ee, u = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, _ = (u & (B | te)) === 0 ? e : null, D = null, ce(e.ctx), M = !1, ee = ++X, e.ac !== null && (Dt(() => {
    e.ac.abort($);
  }), e.ac = null);
  try {
    e.f |= Pe;
    var a = (
      /** @type {Function} */
      e.fn
    ), d = a();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var h;
      if (v || me(e, A), c !== null && A > 0)
        for (c.length = A + T.length, h = 0; h < T.length; h++)
          c[A + h] = T[h];
      else
        e.deps = c = T;
      if (Be() && (e.f & N) !== 0)
        for (h = A; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (me(e, A), c.length = A);
    if (ht() && R !== null && !M && c !== null && (e.f & (b | Y | k)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      R.length; h++)
        jt(
          R[h],
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
    return (e.f & K) !== 0 && (e.f ^= K), d;
  } catch (g) {
    return dt(g);
  } finally {
    e.f ^= Pe, T = t, A = n, R = r, _ = i, D = s, ce(o), M = f, ee = l;
  }
}
function zn(e, t) {
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
  (T === null || !ae.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), Ye(s), An(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      zn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & L) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (W | ft)) !== 0 ? Un(e) : He(e), Ft(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Pt;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function j(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !M) {
    var r = p !== null && (p.f & L) !== 0;
    if (!r && (D === null || !ae.call(D, e))) {
      var i = _.deps;
      if ((_.f & Pe) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ae.call(s, _) || s.push(_);
      }
    }
  }
  if (ie && G.has(e))
    return G.get(e);
  if (n) {
    var o = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var f = o.v;
      return ((o.f & y) === 0 && o.reactions !== null || Yt(o)) && (f = Ve(o)), G.set(o, f), f;
    }
    var l = (o.f & N) === 0 && !M && _ !== null && (Te || (_.f & N) !== 0), u = (o.f & se) === 0;
    ye(o) && (l && (o.f |= N), bt(o)), l && !u && (Et(o), qt(o));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function qt(e) {
  if (e.f |= N, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & N) === 0 && (Et(
        /** @type {Derived} */
        t
      ), qt(
        /** @type {Derived} */
        t
      ));
}
function Yt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & b) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function ze(e) {
  var t = M;
  try {
    return M = !0, e();
  } finally {
    M = t;
  }
}
const nt = globalThis.Deno?.core?.ops ?? null;
function Kn(e, ...t) {
  nt?.[e] ? nt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function rt(e, t) {
  Kn("op_set_text", e, t);
}
const Gn = ["touchstart", "touchmove"];
function Wn(e) {
  return Gn.includes(e);
}
const ve = Symbol("events"), Ut = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Zn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Jn(e) {
  for (var t = 0; t < e.length; t++)
    Ut.add(e[t]);
  for (var n of Le)
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
  var o = 0, f = it === e && e[ve];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[ve] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    l <= u && (o = l);
  }
  if (s = /** @type {Element} */
  i[o] || e.target, s !== t) {
    zt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var a = _, d = p;
    O(null), U(null);
    try {
      for (var c, v = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[ve]?.[r];
          g != null && (!/** @type {any} */
          s.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === s) && g.call(s, e);
        } catch (x) {
          c ? v.push(x) : c = x;
        }
        if (e.cancelBubble || h === t || h === null)
          break;
        s = h;
      }
      if (c) {
        for (let x of v)
          queueMicrotask(() => {
            throw x;
          });
        throw c;
      }
    } finally {
      e[ve] = t, delete e.currentTarget, O(a), U(d);
    }
  }
}
const Qn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Xn(e) {
  return (
    /** @type {string} */
    Qn?.createHTML(e) ?? e
  );
}
function er(e) {
  var t = On("template");
  return t.innerHTML = Xn(e.replaceAll("<!>", "<!---->")), t.content;
}
function tr(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function nr(e, t) {
  var n = (t & an) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = er(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || kt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return tr(s, s), s;
  };
}
function rr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function ir(e, t) {
  return sr(e, t);
}
const be = /* @__PURE__ */ new Map();
function sr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: o = !0, transformError: f }) {
  Dn();
  var l = void 0, u = In(() => {
    var a = n ?? t.appendChild(Rt());
    mn(
      /** @type {TemplateNode} */
      a,
      {
        pending: () => {
        }
      },
      (v) => {
        at({});
        var h = (
          /** @type {ComponentContext} */
          S
        );
        s && (h.c = s), i && (r.$$events = i), l = e(v, r) || {}, ct();
      },
      f
    );
    var d = /* @__PURE__ */ new Set(), c = (v) => {
      for (var h = 0; h < v.length; h++) {
        var g = v[h];
        if (!d.has(g)) {
          d.add(g);
          var x = Wn(g);
          for (const De of [t, document]) {
            var F = be.get(De);
            F === void 0 && (F = /* @__PURE__ */ new Map(), be.set(De, F));
            var le = F.get(g);
            le === void 0 ? (De.addEventListener(g, st, { passive: x }), F.set(g, 1)) : F.set(g, le + 1);
          }
        }
      }
    };
    return c(Ht(Ut)), Le.add(c), () => {
      for (var v of d)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            h.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, st), h.delete(v), h.size === 0 && be.delete(x)) : h.set(v, g);
        }
      Le.delete(c), a !== n && a.parentNode?.removeChild(a);
    };
  });
  return lr.set(l, u), l;
}
let lr = /* @__PURE__ */ new WeakMap();
function Vt(e) {
  S === null && ut(), Pn(() => {
    const t = ze(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function fr(e) {
  S === null && ut(), Vt(() => () => ze(e));
}
var ur = /* @__PURE__ */ nr("<div><div> </div> <div> </div> <button>Tick</button></div>");
function or(e, t) {
  at(t, !0);
  let n = /* @__PURE__ */ P("idle"), r = /* @__PURE__ */ P(0);
  Vt(() => {
    I(n, "mounted");
  }), fr(() => {
    I(n, "destroyed");
  });
  var i = ur(), s = Ce(i), o = Ce(s), f = Xe(s, 2), l = Ce(f), u = Xe(f, 2);
  qn(() => {
    rt(o, `Status: ${j(n) ?? ""}`), rt(l, `Ticks: ${j(r) ?? ""}`);
  }), Zn("click", u, () => Nn(r)), rr(e, i), ct();
}
Jn(["click"]);
function cr(e) {
  return ir(or, { target: e });
}
export {
  cr as default,
  cr as rvst_mount
};

var Yt = Array.isArray, $t = Array.prototype.indexOf, oe = Array.prototype.includes, Ut = Array.from, Vt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Bt = Object.prototype, Ht = Array.prototype, zt = Object.getPrototypeOf, ze = Object.isExtensible;
const Kt = () => {
};
function Gt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function st() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, Re = 8, lt = 1 << 24, W = 16, B = 32, te = 64, Pe = 128, R = 512, y = 1024, S = 2048, q = 4096, z = 8192, j = 16384, se = 32768, Ke = 1 << 25, Se = 65536, Ge = 1 << 17, Wt = 1 << 18, _e = 1 << 19, Zt = 1 << 20, ne = 65536, Me = 1 << 21, qe = 1 << 22, K = 1 << 23, De = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Jt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Qt(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Xt() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function en(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function tn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function sn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ln() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const fn = 2, E = Symbol(), un = "http://www.w3.org/1999/xhtml";
function an() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ft(e) {
  return e === this.v;
}
let O = null;
function ce(e) {
  O = e;
}
function ut(e, t = !1, n) {
  O = {
    p: O,
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
function at(e) {
  var t = (
    /** @type {ComponentContext} */
    O
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Nt(r);
  }
  return t.i = !0, O = t.p, /** @type {T} */
  {};
}
function ot() {
  return !0;
}
let fe = [];
function on() {
  var e = fe;
  fe = [], Gt(e);
}
function ae(e) {
  if (fe.length === 0) {
    var t = fe;
    queueMicrotask(() => {
      t === fe && on();
    });
  }
  fe.push(e);
}
function ct(e) {
  var t = p;
  if (t === null)
    return d.f |= K, e;
  if ((t.f & se) === 0 && (t.f & we) === 0)
    throw e;
  H(e, t);
}
function H(e, t) {
  for (; t !== null; ) {
    if ((t.f & Pe) !== 0) {
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
const cn = -7169;
function m(e, t) {
  e.f = e.f & cn | t;
}
function Ye(e) {
  (e.f & R) !== 0 || e.deps === null ? m(e, y) : m(e, q);
}
function ht(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, ht(
        /** @type {Derived} */
        t.deps
      ));
}
function _t(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), ht(e.deps), m(e, y);
}
const J = /* @__PURE__ */ new Set();
let w = null, C = null, Ie = null, Fe = !1, ue = null, Ee = null;
var We = 0;
let hn = 1;
class re {
  // for debugging. TODO remove once async is stable
  id = hn++;
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
        m(r, q), this.schedule(r);
    }
  }
  #c() {
    if (We++ > 1e3 && (J.delete(this), _n()), !this.#a()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, S), this.schedule(f);
      for (const f of this.#n)
        m(f, q), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = ue = [], r = [], i = Ee = [];
    for (const f of t)
      try {
        this.#h(f, n, r);
      } catch (l) {
        throw gt(f), l;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (ue = null, Ee = null, this.#a()) {
      this.#_(r), this.#_(n);
      for (const [f, l] of this.#s)
        pt(f, l);
    } else {
      this.#l === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
      for (const f of this.#i) f(this);
      this.#i.clear(), Ze(r), Ze(n), this.#r?.resolve();
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
      var s = i.f, a = (s & (B | te)) !== 0, f = a && (s & y) !== 0, l = f || (s & z) !== 0 || this.#s.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & W) !== 0 && this.#n.add(i), he(i));
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
  #_(t) {
    for (var n = 0; n < t.length; n += 1)
      _t(t[n], this.#t, this.#n);
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
      We = 0, Ie = null, ue = null, Ee = null, Fe = !1, w = null, C = null, G.clear();
    }
  }
  discard() {
    for (const t of this.#d) t(this);
    this.#d.clear(), J.delete(this);
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
    this.#l -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, ae(() => {
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
    return (this.#r ??= st()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Fe || (J.add(w), ae(() => {
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
    if (Ie = t, t.b?.is_pending && (t.f & (we | Re | lt)) !== 0 && (t.f & se) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ue !== null && n === p && (d === null || (d.f & b) === 0))
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
function _n() {
  try {
    tn();
  } catch (e) {
    H(e, Ie);
  }
}
let $ = null;
function Ze(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | z)) === 0 && ye(r) && ($ = /* @__PURE__ */ new Set(), he(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dt(r), $?.size > 0)) {
        G.clear();
        for (const i of $) {
          if ((i.f & (j | z)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (j | z)) === 0 && he(l);
          }
        }
        $.clear();
      }
    }
    $ = null;
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
      ) : (s & (qe | W)) !== 0 && (s & S) === 0 && vt(i, t, r) && (m(i, S), $e(
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
      if (oe.call(t, i))
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
function $e(e) {
  w.schedule(e);
}
function pt(e, t) {
  if (!((e.f & B) !== 0 && (e.f & y) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      pt(n, t), n = n.next;
  }
}
function gt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    gt(t), t = t.next;
}
function dn(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    Be() && (M(n), Mn(() => (t === 0 && (r = Bn(() => e(() => ge(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var vn = Se | _e;
function pn(e, t, n, r) {
  new gn(e, t, n, r);
}
class gn {
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
  #_ = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #o = null;
  #m = dn(() => (this.#o = Ne(this.#u), () => {
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
      a.b = this, a.f |= Pe, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = jn(() => {
      this.#g();
    }, vn);
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#i)), ae(() => {
      var n = this.#s = document.createDocumentFragment(), r = kt();
      n.append(r), this.#e = this.#p(() => Q(() => this.#f(r))), this.#a === 0 && (this.#i.before(n), this.#s = null, xe(
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
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#u = 0, this.#e = Q(() => {
        this.#f(this.#i);
      }), this.#a > 0) {
        var t = this.#s = document.createDocumentFragment();
        Yn(this.#e, t);
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
    this.is_pending = !1, t.transfer_effects(this.#h, this.#_);
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(t) {
    _t(t, this.#h, this.#_);
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
    var n = p, r = d, i = O;
    Y(this.#r), D(this.#r), ce(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ct(s), null;
    } finally {
      Y(n), D(r), ce(i);
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
    this.#a += t, this.#a === 0 && (this.#v(n), this.#t && xe(this.#t, () => {
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
    this.#w(t, n), this.#u += t, !(!this.#o || this.#c) && (this.#c = !0, ae(() => {
      this.#c = !1, this.#o && Ae(this.#o, this.#u);
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
    var n = this.#l.onerror;
    let r = this.#l.failed;
    if (!n && !r)
      throw t;
    this.#e && (L(this.#e), this.#e = null), this.#t && (L(this.#t), this.#t = null), this.#n && (L(this.#n), this.#n = null);
    var i = !1, s = !1;
    const a = () => {
      if (i) {
        an();
        return;
      }
      i = !0, s && ln(), this.#n !== null && xe(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, a), s = !1;
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
              () => l,
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
    ae(() => {
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
function wn(e, t, n, r) {
  const i = yn;
  var s = e.filter((c) => !c.settled);
  if (n.length === 0 && s.length === 0) {
    r(t.map(i));
    return;
  }
  var a = (
    /** @type {Effect} */
    p
  ), f = mn(), l = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((c) => c.promise)) : null;
  function u(c) {
    f();
    try {
      r(c);
    } catch (v) {
      (a.f & j) === 0 && H(v, a);
    }
    ke();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var o = wt();
  function _() {
    Promise.all(n.map((c) => /* @__PURE__ */ bn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => H(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    f(), _(), ke();
  }) : _();
}
function mn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = d, n = O, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    Y(e), D(t), ce(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function ke(e = !0) {
  Y(null), D(null), ce(null), e && w?.deactivate();
}
function wt() {
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
function yn(e) {
  var t = b | S, n = d !== null && (d.f & b) !== 0 ? (
    /** @type {Derived} */
    d
  ) : null;
  return p !== null && (p.f |= _e), {
    ctx: O,
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
function bn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Jt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Ne(
    /** @type {V} */
    E
  ), a = !d, f = /* @__PURE__ */ new Map();
  return Pn(() => {
    var l = (
      /** @type {Effect} */
      p
    ), u = st();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(ke);
    } catch (v) {
      u.reject(v), ke();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((l.f & se) !== 0)
        var _ = wt();
      if (
        /** @type {Boundary} */
        r.b.is_rendered()
      )
        f.get(o)?.reject(U), f.delete(o);
      else {
        for (const v of f.values())
          v.reject(U);
        f.clear();
      }
      f.set(o, u);
    }
    const c = (v, h = void 0) => {
      if (_) {
        var g = h === U;
        _(g);
      }
      if (!(h === U || (l.f & j) !== 0)) {
        if (o.activate(), h)
          s.f |= K, Ae(s, h);
        else {
          (s.f & K) !== 0 && (s.f ^= K), Ae(s, v);
          for (const [x, F] of f) {
            if (f.delete(x), x === o) break;
            F.reject(U);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (v) => c(null, v || "unknown"));
  }), Dn(() => {
    for (const l of f.values())
      l.reject(U);
  }), new Promise((l) => {
    function u(o) {
      function _() {
        o === i ? l(s) : u(i);
      }
      o.then(_, _);
    }
    u(i);
  });
}
function En(e) {
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
function xn(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & b) === 0)
      return (t.f & j) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ue(e) {
  var t, n = p;
  Y(xn(e));
  try {
    e.f &= ~ne, En(e), t = It(e);
  } finally {
    Y(n);
  }
  return t;
}
function mt(e) {
  var t = e.v, n = Ue(e);
  if (!e.equals(n) && (e.wv = Pt(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    m(e, y);
    return;
  }
  ie || (C !== null ? (Be() || w?.is_fork) && C.set(e, n) : Ye(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Kt, t.ac = null, me(t, 0), He(t));
}
function yt(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && he(t);
}
let je = /* @__PURE__ */ new Set();
const G = /* @__PURE__ */ new Map();
let bt = !1;
function Ne(e, t) {
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
function I(e, t) {
  const n = Ne(e);
  return $n(n), n;
}
function V(e, t, n = !1) {
  d !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (d.f & Ge) !== 0) && ot() && (d.f & (b | W | qe | Ge)) !== 0 && (N === null || !oe.call(N, e)) && sn();
  let r = n ? de(t) : t;
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
      (e.f & S) !== 0 && Ue(s), C === null && Ye(s);
    }
    e.wv = Pt(), Et(e, S, n), p !== null && (p.f & y) !== 0 && (p.f & (B | te)) === 0 && (A === null ? Un([e]) : A.push(e)), !i.is_fork && je.size > 0 && !bt && Sn();
  }
  return t;
}
function Sn() {
  bt = !1;
  for (const e of je)
    (e.f & y) !== 0 && m(e, q), ye(e) && he(e);
  je.clear();
}
function kn(e, t = 1) {
  var n = M(e), r = t === 1 ? n++ : n--;
  return V(e, n), r;
}
function ge(e) {
  V(e, e.v + 1);
}
function Et(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & S) === 0;
      if (l && m(a, t), (f & b) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        C?.delete(u), (f & ne) === 0 && (f & R && (a.f |= ne), Et(u, q, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & W) !== 0 && $ !== null && $.add(o), n !== null ? n.push(o) : $e(o);
      }
    }
}
function de(e) {
  if (typeof e != "object" || e === null || De in e)
    return e;
  const t = zt(e);
  if (t !== Bt && t !== Ht)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Yt(e), i = /* @__PURE__ */ I(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var l = d, u = ee;
    D(null), et(s);
    var o = f();
    return D(l), et(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ I(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && nn();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var _ = /* @__PURE__ */ I(u.value);
          return n.set(l, _), _;
        }) : V(o, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const o = a(() => /* @__PURE__ */ I(E));
            n.set(l, o), ge(i);
          }
        } else
          V(u, E), ge(i);
        return !0;
      },
      get(f, l, u) {
        if (l === De)
          return e;
        var o = n.get(l), _ = l in f;
        if (o === void 0 && (!_ || pe(f, l)?.writable) && (o = a(() => {
          var v = de(_ ? f[l] : E), h = /* @__PURE__ */ I(v);
          return h;
        }), n.set(l, o)), o !== void 0) {
          var c = M(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var o = n.get(l);
          o && (u.value = M(o));
        } else if (u === void 0) {
          var _ = n.get(l), c = _?.v;
          if (_ !== void 0 && c !== E)
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
        if (l === De)
          return !0;
        var u = n.get(l), o = u !== void 0 && u.v !== E || Reflect.has(f, l);
        if (u !== void 0 || p !== null && (!o || pe(f, l)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? de(f[l]) : E, v = /* @__PURE__ */ I(c);
            return v;
          }), n.set(l, u));
          var _ = M(u);
          if (_ === E)
            return !1;
        }
        return o;
      },
      set(f, l, u, o) {
        var _ = n.get(l), c = l in f;
        if (r && l === "length")
          for (var v = u; v < /** @type {Source<number>} */
          _.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? V(h, E) : v in f && (h = a(() => /* @__PURE__ */ I(E)), n.set(v + "", h));
          }
        if (_ === void 0)
          (!c || pe(f, l)?.writable) && (_ = a(() => /* @__PURE__ */ I(void 0)), V(_, de(u)), n.set(l, _));
        else {
          c = _.v !== E;
          var g = a(() => de(u));
          V(_, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, l);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof l == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), le = Number(l);
            Number.isInteger(le) && le >= F.v && V(F, le + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        M(i);
        var l = Reflect.ownKeys(f).filter((_) => {
          var c = n.get(_);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        rn();
      }
    }
  );
}
var Je, xt, Tt, St;
function An() {
  if (Je === void 0) {
    Je = window, xt = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Tt = pe(t, "firstChild").get, St = pe(t, "nextSibling").get, ze(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), ze(n) && (n.__t = void 0);
  }
}
function kt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function At(e) {
  return (
    /** @type {TemplateNode | null} */
    Tt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Ve(e) {
  return (
    /** @type {TemplateNode | null} */
    St.call(e)
  );
}
function Ce(e, t) {
  return /* @__PURE__ */ At(e);
}
function Qe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ve(r);
  return r;
}
function Rn(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(un, e, void 0)
  );
}
function Rt(e) {
  var t = d, n = p;
  D(null), Y(null);
  try {
    return e();
  } finally {
    D(t), Y(n);
  }
}
function Nn(e) {
  p === null && (d === null && en(), Xt()), ie && Qt();
}
function On(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Z(e, t) {
  var n = p;
  n !== null && (n.f & z) !== 0 && (e |= z);
  var r = {
    ctx: O,
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
  if ((e & we) !== 0)
    ue !== null ? ue.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      he(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & _e) === 0 && (i = i.first, (e & W) !== 0 && (e & Se) !== 0 && i !== null && (i.f |= Se));
  }
  if (i !== null && (i.parent = n, n !== null && On(i, n), d !== null && (d.f & b) !== 0 && (e & te) === 0)) {
    var s = (
      /** @type {Derived} */
      d
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Be() {
  return d !== null && !P;
}
function Dn(e) {
  const t = Z(Re, null);
  return m(t, y), t.teardown = e, t;
}
function Fn(e) {
  Nn();
  var t = (
    /** @type {Effect} */
    p.f
  ), n = !d && (t & B) !== 0 && (t & se) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      O
    );
    (r.e ??= []).push(e);
  } else
    return Nt(e);
}
function Nt(e) {
  return Z(we | Zt, e);
}
function Cn(e) {
  re.ensure();
  const t = Z(te | _e, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? xe(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function Pn(e) {
  return Z(qe | _e, e);
}
function Mn(e, t = 0) {
  return Z(Re | t, e);
}
function In(e, t = [], n = [], r = []) {
  wn(r, t, n, (i) => {
    Z(Re, () => e(...i.map(M)));
  });
}
function jn(e, t = 0) {
  var n = Z(W | t, e);
  return n;
}
function Q(e) {
  return Z(B | _e, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ie, r = d;
    Xe(!0), D(null);
    try {
      t.call(null);
    } finally {
      Xe(n), D(r);
    }
  }
}
function He(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Rt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function Ln(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & B) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & Wt) !== 0) && e.nodes !== null && e.nodes.end !== null && (qn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, Ke), He(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ot(e), e.f ^= Ke, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Dt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function qn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Ve(e);
    e.remove(), e = n;
  }
}
function Dt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xe(e, t, n = !0) {
  var r = [];
  Ft(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Ft(e, t, n) {
  if ((e.f & z) === 0) {
    e.f ^= z;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Se) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & B) !== 0 && (e.f & W) !== 0;
      Ft(i, t, a ? n : !1), i = s;
    }
  }
}
function Yn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Ve(n);
      t.append(n), n = i;
    }
}
let Te = !1, ie = !1;
function Xe(e) {
  ie = e;
}
let d = null, P = !1;
function D(e) {
  d = e;
}
let p = null;
function Y(e) {
  p = e;
}
let N = null;
function $n(e) {
  d !== null && (N === null ? N = [e] : N.push(e));
}
let T = null, k = 0, A = null;
function Un(e) {
  A = e;
}
let Ct = 1, X = 0, ee = X;
function et(e) {
  ee = e;
}
function Pt() {
  return ++Ct;
}
function ye(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & q) !== 0) {
    for (var n = (
      /** @type {Value[]} */
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (ye(
        /** @type {Derived} */
        s
      ) && mt(
        /** @type {Derived} */
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & R) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    C === null && m(e, y);
  }
  return !1;
}
function Mt(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(N !== null && oe.call(N, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? Mt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, S) : (s.f & y) !== 0 && m(s, q), $e(
        /** @type {Effect} */
        s
      ));
    }
}
function It(e) {
  var t = T, n = k, r = A, i = d, s = N, a = O, f = P, l = ee, u = e.f;
  T = /** @type {null | Value[]} */
  null, k = 0, A = null, d = (u & (B | te)) === 0 ? e : null, N = null, ce(e.ctx), P = !1, ee = ++X, e.ac !== null && (Rt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= Me;
    var o = (
      /** @type {Function} */
      e.fn
    ), _ = o();
    e.f |= se;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var h;
      if (v || me(e, k), c !== null && k > 0)
        for (c.length = k + T.length, h = 0; h < T.length; h++)
          c[k + h] = T[h];
      else
        e.deps = c = T;
      if (Be() && (e.f & R) !== 0)
        for (h = k; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !v && c !== null && k < c.length && (me(e, k), c.length = k);
    if (ot() && A !== null && !P && c !== null && (e.f & (b | q | S)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      A.length; h++)
        Mt(
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
    return (e.f & K) !== 0 && (e.f ^= K), _;
  } catch (g) {
    return ct(g);
  } finally {
    e.f ^= Me, T = t, k = n, A = r, d = i, N = s, ce(a), P = f, ee = l;
  }
}
function Vn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = $t.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !oe.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & R) !== 0 && (s.f ^= R, s.f &= ~ne), Ye(s), Tn(s), me(s, 0);
  }
}
function me(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vn(e, n[r]);
}
function he(e) {
  var t = e.f;
  if ((t & j) === 0) {
    m(e, y);
    var n = p, r = Te;
    p = e, Te = !0;
    try {
      (t & (W | lt)) !== 0 ? Ln(e) : He(e), Ot(e);
      var i = It(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Ct;
      var s;
    } finally {
      Te = r, p = n;
    }
  }
}
function M(e) {
  var t = e.f, n = (t & b) !== 0;
  if (d !== null && !P) {
    var r = p !== null && (p.f & j) !== 0;
    if (!r && (N === null || !oe.call(N, e))) {
      var i = d.deps;
      if ((d.f & Me) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[k] === e ? k++ : T === null ? T = [e] : T.push(e));
      else {
        (d.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [d] : oe.call(s, d) || s.push(d);
      }
    }
  }
  if (ie && G.has(e))
    return G.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (ie) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Lt(a)) && (f = Ue(a)), G.set(a, f), f;
    }
    var l = (a.f & R) === 0 && !P && d !== null && (Te || (d.f & R) !== 0), u = (a.f & se) === 0;
    ye(a) && (l && (a.f |= R), mt(a)), l && !u && (yt(a), jt(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & K) !== 0)
    throw e.v;
  return e.v;
}
function jt(e) {
  if (e.f |= R, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & b) !== 0 && (t.f & R) === 0 && (yt(
        /** @type {Derived} */
        t
      ), jt(
        /** @type {Derived} */
        t
      ));
}
function Lt(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (G.has(t) || (t.f & b) !== 0 && Lt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Bn(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const tt = globalThis.Deno?.core?.ops ?? null;
function Hn(e, ...t) {
  tt?.[e] ? tt[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function nt(e, t) {
  Hn("op_set_text", e, t);
}
const zn = ["touchstart", "touchmove"];
function Kn(e) {
  return zn.includes(e);
}
const ve = Symbol("events"), qt = /* @__PURE__ */ new Set(), Le = /* @__PURE__ */ new Set();
function Gn(e, t, n) {
  (t[ve] ??= {})[e] = n;
}
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    qt.add(e[t]);
  for (var n of Le)
    n(e);
}
let rt = null;
function it(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  rt = e;
  var a = 0, f = rt === e && e[ve];
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
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = d, _ = p;
    D(null), Y(null);
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
      e[ve] = t, delete e.currentTarget, D(o), Y(_);
    }
  }
}
const Zn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Jn(e) {
  return (
    /** @type {string} */
    Zn?.createHTML(e) ?? e
  );
}
function Qn(e) {
  var t = Rn("template");
  return t.innerHTML = Jn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function er(e, t) {
  var n = (t & fn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Qn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ At(r));
    var s = (
      /** @type {TemplateNode} */
      n || xt ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Xn(s, s), s;
  };
}
function tr(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function nr(e, t) {
  return rr(e, t);
}
const be = /* @__PURE__ */ new Map();
function rr(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  An();
  var l = void 0, u = Cn(() => {
    var o = n ?? t.appendChild(kt());
    pn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        ut({});
        var h = (
          /** @type {ComponentContext} */
          O
        );
        s && (h.c = s), i && (r.$$events = i), l = e(v, r) || {}, at();
      },
      f
    );
    var _ = /* @__PURE__ */ new Set(), c = (v) => {
      for (var h = 0; h < v.length; h++) {
        var g = v[h];
        if (!_.has(g)) {
          _.add(g);
          var x = Kn(g);
          for (const Oe of [t, document]) {
            var F = be.get(Oe);
            F === void 0 && (F = /* @__PURE__ */ new Map(), be.set(Oe, F));
            var le = F.get(g);
            le === void 0 ? (Oe.addEventListener(g, it, { passive: x }), F.set(g, 1)) : F.set(g, le + 1);
          }
        }
      }
    };
    return c(Ut(qt)), Le.add(c), () => {
      for (var v of _)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            be.get(x)
          ), g = (
            /** @type {number} */
            h.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, it), h.delete(v), h.size === 0 && be.delete(x)) : h.set(v, g);
        }
      Le.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return ir.set(l, u), l;
}
let ir = /* @__PURE__ */ new WeakMap();
var sr = /* @__PURE__ */ er("<div><button>Increment</button> <div> </div> <div> </div></div>");
function lr(e, t) {
  ut(t, !0);
  let n = /* @__PURE__ */ I(0), r = /* @__PURE__ */ I("init");
  Fn(() => {
    V(r, `count is ${M(n)}`);
  });
  var i = sr(), s = Ce(i), a = Qe(s, 2), f = Ce(a), l = Qe(a, 2), u = Ce(l);
  In(() => {
    nt(f, `Count: ${M(n) ?? ""}`), nt(u, `Log: ${M(r) ?? ""}`);
  }), Gn("click", s, () => kn(n)), tr(e, i), at();
}
Wn(["click"]);
function ur(e) {
  return nr(lr, { target: e });
}
export {
  ur as default,
  ur as rvst_mount
};

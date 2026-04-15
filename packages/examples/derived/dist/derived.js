var Ut = Array.isArray, Vt = Array.prototype.indexOf, ue = Array.prototype.includes, zt = Array.from, Bt = Object.defineProperty, pe = Object.getOwnPropertyDescriptor, Ht = Object.prototype, Kt = Array.prototype, Gt = Object.getPrototypeOf, Ge = Object.isExtensible;
const Wt = () => {
};
function Zt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function ut() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const b = 2, we = 4, De = 8, at = 1 << 24, W = 16, G = 32, te = 64, Ie = 128, N = 512, y = 1024, k = 2048, L = 4096, B = 8192, I = 16384, he = 32768, We = 1 << 25, Ae = 65536, Ze = 1 << 17, Jt = 1 << 18, de = 1 << 19, Qt = 1 << 20, ne = 65536, je = 1 << 21, $e = 1 << 22, H = 1 << 23, Ce = Symbol("$state"), U = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Xt() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function en() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function tn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function nn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function rn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function sn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
const ln = 2, E = Symbol(), fn = "http://www.w3.org/1999/xhtml";
function un() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ot(e) {
  return e === this.v;
}
let M = null;
function ae(e) {
  M = e;
}
function an(e, t = !1, n) {
  M = {
    p: M,
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
    M
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Dn(r);
  }
  return t.i = !0, M = t.p, /** @type {T} */
  {};
}
function ct() {
  return !0;
}
let se = [];
function cn() {
  var e = se;
  se = [], Zt(e);
}
function fe(e) {
  if (se.length === 0) {
    var t = se;
    queueMicrotask(() => {
      t === se && cn();
    });
  }
  se.push(e);
}
function ht(e) {
  var t = p;
  if (t === null)
    return _.f |= H, e;
  if ((t.f & he) === 0 && (t.f & we) === 0)
    throw e;
  z(e, t);
}
function z(e, t) {
  for (; t !== null; ) {
    if ((t.f & Ie) !== 0) {
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
const hn = -7169;
function m(e, t) {
  e.f = e.f & hn | t;
}
function Ue(e) {
  (e.f & N) !== 0 || e.deps === null ? m(e, y) : m(e, L);
}
function dt(e) {
  if (e !== null)
    for (const t of e)
      (t.f & b) === 0 || (t.f & ne) === 0 || (t.f ^= ne, dt(
        /** @type {Derived} */
        t.deps
      ));
}
function vt(e, t, n) {
  (e.f & k) !== 0 ? t.add(e) : (e.f & L) !== 0 && n.add(e), dt(e.deps), m(e, y);
}
const J = /* @__PURE__ */ new Set();
let w = null, C = null, Le = null, Pe = !1, le = null, Te = null;
var Je = 0;
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
        m(r, k), this.schedule(r);
      for (r of n.m)
        m(r, L), this.schedule(r);
    }
  }
  #c() {
    if (Je++ > 1e3 && (J.delete(this), vn()), !this.#a()) {
      for (const f of this.#t)
        this.#n.delete(f), m(f, k), this.schedule(f);
      for (const f of this.#n)
        m(f, L), this.schedule(f);
    }
    const t = this.#e;
    this.#e = [], this.apply();
    var n = le = [], r = [], i = Te = [];
    for (const f of t)
      try {
        this.#h(f, n, r);
      } catch (l) {
        throw wt(f), l;
      }
    if (w = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (le = null, Te = null, this.#a()) {
      this.#d(r), this.#d(n);
      for (const [f, l] of this.#s)
        gt(f, l);
    } else {
      this.#l === 0 && J.delete(this), this.#t.clear(), this.#n.clear();
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
      var s = i.f, a = (s & (G | te)) !== 0, f = a && (s & y) !== 0, l = f || (s & B) !== 0 || this.#s.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= y : (s & we) !== 0 ? n.push(i) : ye(i) && ((s & W) !== 0 && this.#n.add(i), ce(i));
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
      vt(t[n], this.#t, this.#n);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} old_value
   */
  capture(t, n) {
    n !== E && !this.previous.has(t) && this.previous.set(t, n), (t.f & H) === 0 && (this.current.set(t, t.v), C?.set(t, t.v));
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, C = null;
  }
  flush() {
    try {
      Pe = !0, w = this, this.#c();
    } finally {
      Je = 0, Le = null, le = null, Te = null, Pe = !1, w = null, C = null, K.clear();
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
          _t(a, r, i, s);
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
    this.#l -= 1, t && (this.#f -= 1), !(this.#u || n) && (this.#u = !0, fe(() => {
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
    return (this.#r ??= ut()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new re();
      Pe || (J.add(w), fe(() => {
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
    if (Le = t, t.b?.is_pending && (t.f & (we | De | at)) !== 0 && (t.f & he) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (le !== null && n === p && (_ === null || (_.f & b) === 0))
        return;
      if ((r & (te | G)) !== 0) {
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
    en();
  } catch (e) {
    z(e, Le);
  }
}
let $ = null;
function Qe(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (I | B)) === 0 && ye(r) && ($ = /* @__PURE__ */ new Set(), ce(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Ft(r), $?.size > 0)) {
        K.clear();
        for (const i of $) {
          if ((i.f & (I | B)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            $.has(a) && ($.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (I | B)) === 0 && ce(l);
          }
        }
        $.clear();
      }
    }
    $ = null;
  }
}
function _t(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & b) !== 0 ? _t(
        /** @type {Derived} */
        i,
        t,
        n,
        r
      ) : (s & ($e | W)) !== 0 && (s & k) === 0 && pt(i, t, r) && (m(i, k), Ve(
        /** @type {Effect} */
        i
      ));
    }
}
function pt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ue.call(t, i))
        return !0;
      if ((i.f & b) !== 0 && pt(
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
function gt(e, t) {
  if (!((e.f & G) !== 0 && (e.f & y) !== 0)) {
    (e.f & k) !== 0 ? t.d.push(e) : (e.f & L) !== 0 && t.m.push(e), m(e, y);
    for (var n = e.first; n !== null; )
      gt(n, t), n = n.next;
  }
}
function wt(e) {
  m(e, y);
  for (var t = e.first; t !== null; )
    wt(t), t = t.next;
}
function _n(e) {
  let t = 0, n = Oe(0), r;
  return () => {
    He() && (S(n), Cn(() => (t === 0 && (r = $n(() => e(() => ge(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, ge(n));
      });
    })));
  };
}
var pn = Ae | de;
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
  #m = _n(() => (this.#o = Oe(this.#u), () => {
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
      a.b = this, a.f |= Ie, r(s);
    }, this.parent = /** @type {Effect} */
    p.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Mn(() => {
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
    t && (this.is_pending = !0, this.#t = Q(() => t(this.#i)), fe(() => {
      var n = this.#s = document.createDocumentFragment(), r = Rt();
      n.append(r), this.#e = this.#p(() => Q(() => this.#f(r))), this.#a === 0 && (this.#i.before(n), this.#s = null, Se(
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
        Ln(this.#e, t);
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
    var n = p, r = _, i = M;
    q(this.#r), O(this.#r), ae(this.#r.ctx);
    try {
      return re.ensure(), t();
    } catch (s) {
      return ht(s), null;
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
    this.#a += t, this.#a === 0 && (this.#_(n), this.#t && Se(this.#t, () => {
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
    this.#w(t, n), this.#u += t, !(!this.#o || this.#c) && (this.#c = !0, fe(() => {
      this.#c = !1, this.#o && Ne(this.#o, this.#u);
    }));
  }
  get_effect_pending() {
    return this.#m(), S(
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
      i = !0, s && sn(), this.#n !== null && Se(this.#n, () => {
        this.#n = null;
      }), this.#p(() => {
        this.#g();
      });
    }, f = (l) => {
      try {
        s = !0, n?.(l, a), s = !1;
      } catch (u) {
        z(u, this.#r && this.#r.parent);
      }
      r && (this.#n = this.#p(() => {
        try {
          return Q(() => {
            var u = (
              /** @type {Effect} */
              p
            );
            u.b = this, u.f |= Ie, r(
              this.#i,
              () => l,
              () => a
            );
          });
        } catch (u) {
          return z(
            u,
            /** @type {Effect} */
            this.#r.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var l;
      try {
        l = this.transform_error(t);
      } catch (u) {
        z(u, this.#r && this.#r.parent);
        return;
      }
      l !== null && typeof l == "object" && typeof /** @type {any} */
      l.then == "function" ? l.then(
        f,
        /** @param {unknown} e */
        (u) => z(u, this.#r && this.#r.parent)
      ) : f(l);
    });
  }
}
function mn(e, t, n, r) {
  const i = yt;
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
      (a.f & I) === 0 && z(v, a);
    }
    Re();
  }
  if (n.length === 0) {
    l.then(() => u(t.map(i)));
    return;
  }
  var o = mt();
  function d() {
    Promise.all(n.map((c) => /* @__PURE__ */ bn(c))).then((c) => u([...t.map(i), ...c])).catch((c) => z(c, a)).finally(() => o());
  }
  l ? l.then(() => {
    f(), d(), Re();
  }) : d();
}
function yn() {
  var e = (
    /** @type {Effect} */
    p
  ), t = _, n = M, r = (
    /** @type {Batch} */
    w
  );
  return function(s = !0) {
    q(e), O(t), ae(n), s && (e.f & I) === 0 && (r?.activate(), r?.apply());
  };
}
function Re(e = !0) {
  q(null), O(null), ae(null), e && w?.deactivate();
}
function mt() {
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
function yt(e) {
  var t = b | k, n = _ !== null && (_.f & b) !== 0 ? (
    /** @type {Derived} */
    _
  ) : null;
  return p !== null && (p.f |= de), {
    ctx: M,
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
function bn(e, t, n) {
  let r = (
    /** @type {Effect | null} */
    p
  );
  r === null && Xt();
  var i = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), s = Oe(
    /** @type {V} */
    E
  ), a = !_, f = /* @__PURE__ */ new Map();
  return Fn(() => {
    var l = (
      /** @type {Effect} */
      p
    ), u = ut();
    i = u.promise;
    try {
      Promise.resolve(e()).then(u.resolve, u.reject).finally(Re);
    } catch (v) {
      u.reject(v), Re();
    }
    var o = (
      /** @type {Batch} */
      w
    );
    if (a) {
      if ((l.f & he) !== 0)
        var d = mt();
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
      if (d) {
        var g = h === U;
        d(g);
      }
      if (!(h === U || (l.f & I) !== 0)) {
        if (o.activate(), h)
          s.f |= H, Ne(s, h);
        else {
          (s.f & H) !== 0 && (s.f ^= H), Ne(s, v);
          for (const [x, F] of f) {
            if (f.delete(x), x === o) break;
            F.reject(U);
          }
        }
        o.deactivate();
      }
    };
    u.promise.then(c, (v) => c(null, v || "unknown"));
  }), Nn(() => {
    for (const l of f.values())
      l.reject(U);
  }), new Promise((l) => {
    function u(o) {
      function d() {
        o === i ? l(s) : u(i);
      }
      o.then(d, d);
    }
    u(i);
  });
}
// @__NO_SIDE_EFFECTS__
function Xe(e) {
  const t = /* @__PURE__ */ yt(e);
  return Pt(t), t;
}
function En(e) {
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
function xn(e) {
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
function ze(e) {
  var t, n = p;
  q(xn(e));
  try {
    e.f &= ~ne, En(e), t = Lt(e);
  } finally {
    q(n);
  }
  return t;
}
function bt(e) {
  var t = e.v, n = ze(e);
  if (!e.equals(n) && (e.wv = It(), (!w?.is_fork || e.deps === null) && (e.v = n, w?.capture(e, t), e.deps === null))) {
    m(e, y);
    return;
  }
  oe || (C !== null ? (He() || w?.is_fork) && C.set(e, n) : Ue(e));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac?.abort(U), t.teardown = Wt, t.ac = null, me(t, 0), Ke(t));
}
function Et(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && ce(t);
}
let qe = /* @__PURE__ */ new Set();
const K = /* @__PURE__ */ new Map();
let xt = !1;
function Oe(e, t) {
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
function Y(e, t) {
  const n = Oe(e);
  return Pt(n), n;
}
function V(e, t, n = !1) {
  _ !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!P || (_.f & Ze) !== 0) && ct() && (_.f & (b | W | $e | Ze)) !== 0 && (D === null || !ue.call(D, e)) && rn();
  let r = n ? ve(t) : t;
  return Ne(e, r, Te);
}
function Ne(e, t, n = null) {
  if (!e.equals(t)) {
    var r = e.v;
    oe ? K.set(e, t) : K.set(e, r), e.v = t;
    var i = re.ensure();
    if (i.capture(e, r), (e.f & b) !== 0) {
      const s = (
        /** @type {Derived} */
        e
      );
      (e.f & k) !== 0 && ze(s), C === null && Ue(s);
    }
    e.wv = It(), Tt(e, k, n), p !== null && (p.f & y) !== 0 && (p.f & (G | te)) === 0 && (R === null ? qn([e]) : R.push(e)), !i.is_fork && qe.size > 0 && !xt && Sn();
  }
  return t;
}
function Sn() {
  xt = !1;
  for (const e of qe)
    (e.f & y) !== 0 && m(e, L), ye(e) && ce(e);
  qe.clear();
}
function et(e, t = 1) {
  var n = S(e), r = t === 1 ? n++ : n--;
  return V(e, n), r;
}
function ge(e) {
  V(e, e.v + 1);
}
function Tt(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & k) === 0;
      if (l && m(a, t), (f & b) !== 0) {
        var u = (
          /** @type {Derived} */
          a
        );
        C?.delete(u), (f & ne) === 0 && (f & N && (a.f |= ne), Tt(u, L, n));
      } else if (l) {
        var o = (
          /** @type {Effect} */
          a
        );
        (f & W) !== 0 && $ !== null && $.add(o), n !== null ? n.push(o) : Ve(o);
      }
    }
}
function ve(e) {
  if (typeof e != "object" || e === null || Ce in e)
    return e;
  const t = Gt(e);
  if (t !== Ht && t !== Kt)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ut(e), i = /* @__PURE__ */ Y(0), s = ee, a = (f) => {
    if (ee === s)
      return f();
    var l = _, u = ee;
    O(null), rt(s);
    var o = f();
    return O(l), rt(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ Y(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && tn();
        var o = n.get(l);
        return o === void 0 ? a(() => {
          var d = /* @__PURE__ */ Y(u.value);
          return n.set(l, d), d;
        }) : V(o, u.value, !0), !0;
      },
      deleteProperty(f, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in f) {
            const o = a(() => /* @__PURE__ */ Y(E));
            n.set(l, o), ge(i);
          }
        } else
          V(u, E), ge(i);
        return !0;
      },
      get(f, l, u) {
        if (l === Ce)
          return e;
        var o = n.get(l), d = l in f;
        if (o === void 0 && (!d || pe(f, l)?.writable) && (o = a(() => {
          var v = ve(d ? f[l] : E), h = /* @__PURE__ */ Y(v);
          return h;
        }), n.set(l, o)), o !== void 0) {
          var c = S(o);
          return c === E ? void 0 : c;
        }
        return Reflect.get(f, l, u);
      },
      getOwnPropertyDescriptor(f, l) {
        var u = Reflect.getOwnPropertyDescriptor(f, l);
        if (u && "value" in u) {
          var o = n.get(l);
          o && (u.value = S(o));
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
        if (l === Ce)
          return !0;
        var u = n.get(l), o = u !== void 0 && u.v !== E || Reflect.has(f, l);
        if (u !== void 0 || p !== null && (!o || pe(f, l)?.writable)) {
          u === void 0 && (u = a(() => {
            var c = o ? ve(f[l]) : E, v = /* @__PURE__ */ Y(c);
            return v;
          }), n.set(l, u));
          var d = S(u);
          if (d === E)
            return !1;
        }
        return o;
      },
      set(f, l, u, o) {
        var d = n.get(l), c = l in f;
        if (r && l === "length")
          for (var v = u; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var h = n.get(v + "");
            h !== void 0 ? V(h, E) : v in f && (h = a(() => /* @__PURE__ */ Y(E)), n.set(v + "", h));
          }
        if (d === void 0)
          (!c || pe(f, l)?.writable) && (d = a(() => /* @__PURE__ */ Y(void 0)), V(d, ve(u)), n.set(l, d));
        else {
          c = d.v !== E;
          var g = a(() => ve(u));
          V(d, g);
        }
        var x = Reflect.getOwnPropertyDescriptor(f, l);
        if (x?.set && x.set.call(o, u), !c) {
          if (r && typeof l == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), ie = Number(l);
            Number.isInteger(ie) && ie >= F.v && V(F, ie + 1);
          }
          ge(i);
        }
        return !0;
      },
      ownKeys(f) {
        S(i);
        var l = Reflect.ownKeys(f).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== E;
        });
        for (var [u, o] of n)
          o.v !== E && !(u in f) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        nn();
      }
    }
  );
}
var tt, St, kt, At;
function kn() {
  if (tt === void 0) {
    tt = window, St = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    kt = pe(t, "firstChild").get, At = pe(t, "nextSibling").get, Ge(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), Ge(n) && (n.__t = void 0);
  }
}
function Rt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Nt(e) {
  return (
    /** @type {TemplateNode | null} */
    kt.call(e)
  );
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return (
    /** @type {TemplateNode | null} */
    At.call(e)
  );
}
function be(e, t) {
  return /* @__PURE__ */ Nt(e);
}
function Ee(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function An(e, t, n) {
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(fn, e, void 0)
  );
}
function Dt(e) {
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
  n !== null && (n.f & B) !== 0 && (e |= B);
  var r = {
    ctx: M,
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
    le !== null ? le.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ce(r);
    } catch (a) {
      throw j(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && // either `null`, or a singular child
    (i.f & de) === 0 && (i = i.first, (e & W) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
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
function He() {
  return _ !== null && !P;
}
function Nn(e) {
  const t = Z(De, null);
  return m(t, y), t.teardown = e, t;
}
function Dn(e) {
  return Z(we | Qt, e);
}
function On(e) {
  re.ensure();
  const t = Z(te | de, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Se(t, () => {
      j(t), r(void 0);
    }) : (j(t), r(void 0));
  });
}
function Fn(e) {
  return Z($e | de, e);
}
function Cn(e, t = 0) {
  return Z(De | t, e);
}
function Pn(e, t = [], n = [], r = []) {
  mn(r, t, n, (i) => {
    Z(De, () => e(...i.map(S)));
  });
}
function Mn(e, t = 0) {
  var n = Z(W | t, e);
  return n;
}
function Q(e) {
  return Z(G | de, e);
}
function Ot(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = oe, r = _;
    nt(!0), O(null);
    try {
      t.call(null);
    } finally {
      nt(n), O(r);
    }
  }
}
function Ke(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Dt(() => {
      i.abort(U);
    });
    var r = n.next;
    (n.f & te) !== 0 ? n.parent = null : j(n, t), n = r;
  }
}
function In(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && j(t), t = n;
  }
}
function j(e, t = !0) {
  var n = !1;
  (t || (e.f & Jt) !== 0) && e.nodes !== null && e.nodes.end !== null && (jn(
    e.nodes.start,
    /** @type {TemplateNode} */
    e.nodes.end
  ), n = !0), m(e, We), Ke(e, t && !n), me(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ot(e), e.f ^= We, e.f |= I;
  var i = e.parent;
  i !== null && i.first !== null && Ft(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = null;
}
function jn(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : /* @__PURE__ */ Be(e);
    e.remove(), e = n;
  }
}
function Ft(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Se(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0);
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
function Ct(e, t, n) {
  if ((e.f & B) === 0) {
    e.f ^= B;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next, a = (i.f & Ae) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (i.f & G) !== 0 && (e.f & W) !== 0;
      Ct(i, t, a ? n : !1), i = s;
    }
  }
}
function Ln(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null : /* @__PURE__ */ Be(n);
      t.append(n), n = i;
    }
}
let ke = !1, oe = !1;
function nt(e) {
  oe = e;
}
let _ = null, P = !1;
function O(e) {
  _ = e;
}
let p = null;
function q(e) {
  p = e;
}
let D = null;
function Pt(e) {
  _ !== null && (D === null ? D = [e] : D.push(e));
}
let T = null, A = 0, R = null;
function qn(e) {
  R = e;
}
let Mt = 1, X = 0, ee = X;
function rt(e) {
  ee = e;
}
function It() {
  return ++Mt;
}
function ye(e) {
  var t = e.f;
  if ((t & k) !== 0)
    return !0;
  if (t & b && (e.f &= ~ne), (t & L) !== 0) {
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
  if (r !== null && !(D !== null && ue.call(D, e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & b) !== 0 ? jt(
        /** @type {Derived} */
        s,
        t,
        !1
      ) : t === s && (n ? m(s, k) : (s.f & y) !== 0 && m(s, L), Ve(
        /** @type {Effect} */
        s
      ));
    }
}
function Lt(e) {
  var t = T, n = A, r = R, i = _, s = D, a = M, f = P, l = ee, u = e.f;
  T = /** @type {null | Value[]} */
  null, A = 0, R = null, _ = (u & (G | te)) === 0 ? e : null, D = null, ae(e.ctx), P = !1, ee = ++X, e.ac !== null && (Dt(() => {
    e.ac.abort(U);
  }), e.ac = null);
  try {
    e.f |= je;
    var o = (
      /** @type {Function} */
      e.fn
    ), d = o();
    e.f |= he;
    var c = e.deps, v = w?.is_fork;
    if (T !== null) {
      var h;
      if (v || me(e, A), c !== null && A > 0)
        for (c.length = A + T.length, h = 0; h < T.length; h++)
          c[A + h] = T[h];
      else
        e.deps = c = T;
      if (He() && (e.f & N) !== 0)
        for (h = A; h < c.length; h++)
          (c[h].reactions ??= []).push(e);
    } else !v && c !== null && A < c.length && (me(e, A), c.length = A);
    if (ct() && R !== null && !P && c !== null && (e.f & (b | L | k)) === 0)
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
    return (e.f & H) !== 0 && (e.f ^= H), d;
  } catch (g) {
    return ht(g);
  } finally {
    e.f ^= je, T = t, A = n, R = r, _ = i, D = s, ae(a), P = f, ee = l;
  }
}
function Yn(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vt.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & b) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (T === null || !ue.call(T, t))) {
    var s = (
      /** @type {Derived} */
      t
    );
    (s.f & N) !== 0 && (s.f ^= N, s.f &= ~ne), Ue(s), Tn(s), me(s, 0);
  }
}
function me(e, t) {
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
      (t & (W | at)) !== 0 ? In(e) : Ke(e), Ot(e);
      var i = Lt(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mt;
      var s;
    } finally {
      ke = r, p = n;
    }
  }
}
function S(e) {
  var t = e.f, n = (t & b) !== 0;
  if (_ !== null && !P) {
    var r = p !== null && (p.f & I) !== 0;
    if (!r && (D === null || !ue.call(D, e))) {
      var i = _.deps;
      if ((_.f & je) !== 0)
        e.rv < X && (e.rv = X, T === null && i !== null && i[A] === e ? A++ : T === null ? T = [e] : T.push(e));
      else {
        (_.deps ??= []).push(e);
        var s = e.reactions;
        s === null ? e.reactions = [_] : ue.call(s, _) || s.push(_);
      }
    }
  }
  if (oe && K.has(e))
    return K.get(e);
  if (n) {
    var a = (
      /** @type {Derived} */
      e
    );
    if (oe) {
      var f = a.v;
      return ((a.f & y) === 0 && a.reactions !== null || Yt(a)) && (f = ze(a)), K.set(a, f), f;
    }
    var l = (a.f & N) === 0 && !P && _ !== null && (ke || (_.f & N) !== 0), u = (a.f & he) === 0;
    ye(a) && (l && (a.f |= N), bt(a)), l && !u && (Et(a), qt(a));
  }
  if (C?.has(e))
    return C.get(e);
  if ((e.f & H) !== 0)
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
    if (K.has(t) || (t.f & b) !== 0 && Yt(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function $n(e) {
  var t = P;
  try {
    return P = !0, e();
  } finally {
    P = t;
  }
}
const it = globalThis.Deno?.core?.ops ?? null;
function Un(e, ...t) {
  it?.[e] ? it[e](...t) : console.log(`[bridge] ${e}`, ...t);
}
function Me(e, t) {
  Un("op_set_text", e, t);
}
const Vn = ["touchstart", "touchmove"];
function zn(e) {
  return Vn.includes(e);
}
const _e = Symbol("events"), $t = /* @__PURE__ */ new Set(), Ye = /* @__PURE__ */ new Set();
function st(e, t, n) {
  (t[_e] ??= {})[e] = n;
}
function Bn(e) {
  for (var t = 0; t < e.length; t++)
    $t.add(e[t]);
  for (var n of Ye)
    n(e);
}
let lt = null;
function ft(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
    /** @type {null | Element} */
    i[0] || e.target
  );
  lt = e;
  var a = 0, f = lt === e && e[_e];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e[_e] = t;
      return;
    }
    var u = i.indexOf(t);
    if (u === -1)
      return;
    l <= u && (a = l);
  }
  if (s = /** @type {Element} */
  i[a] || e.target, s !== t) {
    Bt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = _, d = p;
    O(null), q(null);
    try {
      for (var c, v = []; s !== null; ) {
        var h = s.assignedSlot || s.parentNode || /** @type {any} */
        s.host || null;
        try {
          var g = s[_e]?.[r];
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
      e[_e] = t, delete e.currentTarget, O(o), q(d);
    }
  }
}
const Hn = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (e) => e
  })
);
function Kn(e) {
  return (
    /** @type {string} */
    Hn?.createHTML(e) ?? e
  );
}
function Gn(e) {
  var t = An("template");
  return t.innerHTML = Kn(e.replaceAll("<!>", "<!---->")), t.content;
}
function Wn(e, t) {
  var n = (
    /** @type {Effect} */
    p
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
// @__NO_SIDE_EFFECTS__
function Zn(e, t) {
  var n = (t & ln) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Gn(i ? e : "<!>" + e), r = /** @type {TemplateNode} */
    /* @__PURE__ */ Nt(r));
    var s = (
      /** @type {TemplateNode} */
      n || St ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Wn(s, s), s;
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
const xe = /* @__PURE__ */ new Map();
function Xn(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  kn();
  var l = void 0, u = On(() => {
    var o = n ?? t.appendChild(Rt());
    gn(
      /** @type {TemplateNode} */
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        an({});
        var h = (
          /** @type {ComponentContext} */
          M
        );
        s && (h.c = s), i && (r.$$events = i), l = e(v, r) || {}, on();
      },
      f
    );
    var d = /* @__PURE__ */ new Set(), c = (v) => {
      for (var h = 0; h < v.length; h++) {
        var g = v[h];
        if (!d.has(g)) {
          d.add(g);
          var x = zn(g);
          for (const Fe of [t, document]) {
            var F = xe.get(Fe);
            F === void 0 && (F = /* @__PURE__ */ new Map(), xe.set(Fe, F));
            var ie = F.get(g);
            ie === void 0 ? (Fe.addEventListener(g, ft, { passive: x }), F.set(g, 1)) : F.set(g, ie + 1);
          }
        }
      }
    };
    return c(zt($t)), Ye.add(c), () => {
      for (var v of d)
        for (const x of [t, document]) {
          var h = (
            /** @type {Map<string, number>} */
            xe.get(x)
          ), g = (
            /** @type {number} */
            h.get(v)
          );
          --g == 0 ? (x.removeEventListener(v, ft), h.delete(v), h.size === 0 && xe.delete(x)) : h.set(v, g);
        }
      Ye.delete(c), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return er.set(l, u), l;
}
let er = /* @__PURE__ */ new WeakMap();
var tr = /* @__PURE__ */ Zn("<div><button>+</button> <button>-</button> <div> </div> <div> </div> <div> </div></div>");
function nr(e) {
  let t = /* @__PURE__ */ Y(0), n = /* @__PURE__ */ Xe(() => S(t) * 2), r = /* @__PURE__ */ Xe(() => S(t) > 0 ? "positive" : S(t) < 0 ? "negative" : "zero");
  var i = tr(), s = be(i), a = Ee(s, 2), f = Ee(a, 2), l = be(f), u = Ee(f, 2), o = be(u), d = Ee(u, 2), c = be(d);
  Pn(() => {
    Me(l, `Count: ${S(t) ?? ""}`), Me(o, `Doubled: ${S(n) ?? ""}`), Me(c, `Sign: ${S(r) ?? ""}`);
  }), st("click", s, () => et(t)), st("click", a, () => et(t, -1)), Jn(e, i);
}
Bn(["click"]);
function ir(e) {
  return Qn(nr, { target: e });
}
export {
  ir as default,
  ir as rvst_mount
};

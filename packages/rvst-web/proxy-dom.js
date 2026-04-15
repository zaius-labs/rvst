/**
 * proxy-dom.js — Minimal DOM shim that forwards Svelte's DOM calls to RVST WASM engine.
 *
 * Svelte 5 calls standard DOM APIs (createElement, appendChild, etc.).
 * This module creates proxy objects that look enough like DOM elements
 * for Svelte to work, while forwarding mutations to the WASM tree.
 */

export function createProxyDOM(engine) {
  const nodeMap = new Map(); // id -> ProxyNode
  const handlerMap = new Map(); // id -> { event: [fn] }

  // Root node (id=0) — the document body equivalent
  const rootId = engine.root_id();

  class ProxyNode {
    constructor(id, tag) {
      this.id = id;
      this.tagName = (tag || 'div').toUpperCase();
      this.nodeType = tag === '#text' ? 3 : 1;
      this.childNodes = [];
      this.parentNode = null;
      this._textContent = '';
      this._className = '';
      this._attributes = {};
      this._style = new Proxy({}, {
        set: (target, prop, value) => {
          target[prop] = value;
          // Convert camelCase to kebab-case
          const kebab = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          engine.set_style(this.id, kebab, String(value));
          return true;
        },
        get: (target, prop) => {
          return target[prop] || '';
        }
      });
      nodeMap.set(id, this);
    }

    get textContent() {
      return this._textContent;
    }

    set textContent(value) {
      this._textContent = value;
      if (this.nodeType === 3) {
        engine.set_text(this.id, value);
      }
    }

    get className() {
      return this._className;
    }

    set className(value) {
      this._className = value;
      engine.set_attribute(this.id, 'class', value);
    }

    get style() {
      return this._style;
    }

    get firstChild() {
      return this.childNodes[0] || null;
    }

    get nextSibling() {
      if (!this.parentNode) return null;
      const siblings = this.parentNode.childNodes;
      const idx = siblings.indexOf(this);
      return siblings[idx + 1] || null;
    }

    get previousSibling() {
      if (!this.parentNode) return null;
      const siblings = this.parentNode.childNodes;
      const idx = siblings.indexOf(this);
      return idx > 0 ? siblings[idx - 1] : null;
    }

    get ownerDocument() {
      return proxyDocument;
    }

    getAttribute(name) {
      return this._attributes[name] || null;
    }

    setAttribute(name, value) {
      this._attributes[name] = value;
      if (name === 'class') {
        this._className = value;
      }
      engine.set_attribute(this.id, name, String(value));
    }

    removeAttribute(name) {
      delete this._attributes[name];
      engine.set_attribute(this.id, name, '');
    }

    hasAttribute(name) {
      return name in this._attributes;
    }

    appendChild(child) {
      if (child.parentNode) {
        child.parentNode.removeChild(child);
      }
      this.childNodes.push(child);
      child.parentNode = this;
      engine.insert(this.id, child.id, undefined);
      return child;
    }

    insertBefore(child, ref_node) {
      if (child.parentNode) {
        child.parentNode.removeChild(child);
      }
      if (ref_node) {
        const idx = this.childNodes.indexOf(ref_node);
        if (idx >= 0) {
          this.childNodes.splice(idx, 0, child);
        } else {
          this.childNodes.push(child);
        }
        child.parentNode = this;
        engine.insert(this.id, child.id, ref_node.id);
      } else {
        this.appendChild(child);
      }
      return child;
    }

    removeChild(child) {
      const idx = this.childNodes.indexOf(child);
      if (idx >= 0) {
        this.childNodes.splice(idx, 1);
        child.parentNode = null;
        engine.remove(child.id);
      }
      return child;
    }

    replaceChild(newChild, oldChild) {
      this.insertBefore(newChild, oldChild);
      this.removeChild(oldChild);
      return oldChild;
    }

    addEventListener(event, fn) {
      if (!handlerMap.has(this.id)) {
        handlerMap.set(this.id, {});
      }
      const handlers = handlerMap.get(this.id);
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(fn);
    }

    removeEventListener(event, fn) {
      const handlers = handlerMap.get(this.id);
      if (handlers && handlers[event]) {
        handlers[event] = handlers[event].filter(f => f !== fn);
      }
    }

    dispatchEvent(event) {
      const handlers = handlerMap.get(this.id);
      if (handlers && handlers[event.type]) {
        for (const fn of handlers[event.type]) {
          fn(event);
        }
      }
      return true;
    }

    cloneNode(deep) {
      const tag = this.tagName.toLowerCase();
      const clone = proxyDocument.createElement(tag);
      for (const [k, v] of Object.entries(this._attributes)) {
        clone.setAttribute(k, v);
      }
      if (deep) {
        for (const child of this.childNodes) {
          clone.appendChild(child.cloneNode(true));
        }
      }
      return clone;
    }

    // Svelte uses these
    get innerHTML() { return ''; }
    set innerHTML(v) { /* noop for now */ }
    get isConnected() { return this.parentNode !== null; }
    contains(node) {
      if (node === this) return true;
      for (const child of this.childNodes) {
        if (child.contains(node)) return true;
      }
      return false;
    }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    getBoundingClientRect() {
      return { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
    }
    get children() {
      return this.childNodes.filter(n => n.nodeType === 1);
    }
    focus() {}
    blur() {}
  }

  // The root element
  const rootNode = new ProxyNode(rootId, 'div');

  // Proxy document
  const proxyDocument = {
    createElement(tag) {
      const id = engine.create_node(tag);
      return new ProxyNode(id, tag);
    },
    createElementNS(ns, tag) {
      const id = engine.create_node(tag);
      return new ProxyNode(id, tag);
    },
    createTextNode(text) {
      const id = engine.create_text_node(text);
      const node = new ProxyNode(id, '#text');
      node.nodeType = 3;
      node._textContent = text;
      return node;
    },
    createComment(text) {
      // Comments are invisible — create a zero-size node
      const id = engine.create_node('div');
      const node = new ProxyNode(id, '#comment');
      node.nodeType = 8;
      return node;
    },
    createDocumentFragment() {
      // Simple fragment proxy
      return {
        childNodes: [],
        appendChild(child) { this.childNodes.push(child); return child; },
        insertBefore(child, ref_node) {
          if (ref_node) {
            const idx = this.childNodes.indexOf(ref_node);
            this.childNodes.splice(idx, 0, child);
          } else {
            this.childNodes.push(child);
          }
          return child;
        },
        removeChild(child) {
          const idx = this.childNodes.indexOf(child);
          if (idx >= 0) this.childNodes.splice(idx, 1);
          return child;
        },
        get firstChild() { return this.childNodes[0] || null; },
        nodeType: 11,
      };
    },
    body: rootNode,
    documentElement: rootNode,
    head: { appendChild() {} },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createEvent(type) {
      return new Event(type);
    },
  };

  return {
    document: proxyDocument,
    rootNode,
    nodeMap,
    handlerMap,
    // Dispatch a browser event to the proxy tree (for interactive mode)
    dispatchToNode(nodeId, event) {
      const node = nodeMap.get(nodeId);
      if (node) node.dispatchEvent(event);
    },
  };
}

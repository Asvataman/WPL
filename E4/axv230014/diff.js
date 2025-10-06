/**
 * Convert a virtual DOM node (vNode) into a real DOM node.
 *
 * @param {Object|string} vNode - A virtual DOM node. Either:
 *   - string → represents a text node
 *   - object → { type: string, props: Object, children: Array }
 * @returns {Node} A real DOM Node (Element or Text)
 */
function createTree(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  // set attributes
  for (const [key, value] of Object.entries(vnode.props || {})) {
    el.setAttribute(key, value);
  }

  // recursively create children
  (vnode.children || []).forEach(child => {
    el.appendChild(createTree(child));
  });

  return el;
}

/**
 * Diff two virtual DOM nodes and update the real DOM node accordingly.
 * @param {Object|string|null} oldVNode - Previous vDOM node.
 * @param {Object|string|null} newVNode - New vDOM node.
 * @param {Node|null} domNode - Real DOM node corresponding to oldVNode.
 */
function diff(oldVNode, newVNode, domNode) {

  // You may have to use some of these: appendChild(), removeChild(), 
  // replaceChild(), removeAttribute(), getAttribute(), textContent, childNodes[]

  // Case 1: both are text (string), but may be different
  if (typeof oldVNode === "string" && typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      domNode.textContent = newVNode;
      return;
    }
  }
  // getting the parent node will be useful

  // Case 2: oldVnode is nullish -> append new to parent
  else if (oldVNode == null) {
    const newDomNode = createTree(newVNode)
    domNode.appendChild(newDomNode)
    return;
  }


  // Case 3: newVnode is nullish -> remove
  else if (newVNode == null) {
    domNode.parentNode.removeChild(domNode)
    return;
  }


  // Case 4: Node type changed -> replace
  else if (oldVNode.type !== newVNode.type) {
    const newDomNode = createTree(newVNode)
    domNode.parentNode.replaceChild(newDomNode, domNode)
    return;
  }


  // Case 5: Update attributes
  else if (oldVNode.type === newVNode.type) {

    // remove old attributes not in new
    for (const key in oldVNode.props || {}) {
      if (!(key in (newVNode.props || {}))) {
        domNode.removeAttribute(key);
      }
    }
    // add/update new attributes
    for (const key in newVNode.props || {}) {
      if (!(key in (oldVNode.props || {})) || (oldVNode.props || {})[key] !== newVNode.props[key]) {
        domNode.setAttribute(key, newVNode.props[key]);
      }
    }
  }

  // Recursively diff children
  // First: Diff all existing children (1-to-1 mapping)
  const minLength = Math.min(
    (oldVNode.children || []).length,
    (newVNode.children || []).length
  );

  for (let i = 0; i < minLength; i++) {
    diff(oldVNode.children[i], newVNode.children[i], domNode.childNodes[i]);
  }

  // Then: Add any new children (append to current domNode)
  const oldLen = (oldVNode.children || []).length;
  const newLen = (newVNode.children || []).length;

  // Add new children if new array is longer
  if (newLen > oldLen) {
    for (let i = oldLen; i < newLen; i++) {
      const newElement = createTree(newVNode.children[i]);
      domNode.appendChild(newElement);
    }
  }

  // Remove extra children if old array was longer
  if (oldLen > newLen) {
    while (domNode.childNodes.length > newLen) {
      domNode.removeChild(domNode.lastChild);
    }
    
  }


}

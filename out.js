let Promise$1 = class Promise {};
// Values marked with @internal are not part of the public API and may change
// without notice.

class CustomType {
  withFields(fields) {
    let properties = Object.keys(this).map((label) =>
      label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
}

class List {
  static fromArray(array, tail) {
    let t = tail || new Empty();
    for (let i = array.length - 1; i >= 0; --i) {
      t = new NonEmpty(array[i], t);
    }
    return t;
  }

  [Symbol.iterator]() {
    return new ListIterator(this);
  }

  toArray() {
    return [...this];
  }

  // @internal
  atLeastLength(desired) {
    {
      let iter_5 = this[Symbol.iterator]();
      let next_5 = iter_5.next();
      while (!next_5.done) {
        next_5.value;

        if (desired <= 0) return true;
        desired--;
        next_5 = iter_5.next();
      }
    }
    return desired <= 0;
  }

  // @internal
  hasLength(desired) {
    {
      let iter_6 = this[Symbol.iterator]();
      let next_6 = iter_6.next();
      while (!next_6.done) {
        next_6.value;

        if (desired <= 0) return false;
        desired--;
        next_6 = iter_6.next();
      }
    }
    return desired === 0;
  }

  countLength() {
    let length = 0;
    {
      let iter_7 = this[Symbol.iterator]();
      let next_7 = iter_7.next();
      while (!next_7.done) {
        next_7.value;
        ength++;
        next_7 = iter_7.next();
      }
    }
    return length;
  }
}

// @internal
function prepend(element, tail) {
  return new NonEmpty(element, tail);
}

function toList(elements, tail) {
  return List.fromArray(elements, tail);
}

// @internal
class ListIterator {
  #current;

  constructor(current) {
    this.#current = current;
  }

  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
}

class Empty extends List {}

class NonEmpty extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
}

class BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }

  // @internal
  get length() {
    return this.buffer.length;
  }

  // @internal
  byteAt(index) {
    return this.buffer[index];
  }

  // @internal
  floatAt(index) {
    return byteArrayToFloat(this.buffer.slice(index, index + 8));
  }

  // @internal
  intFromSlice(start, end) {
    return byteArrayToInt(this.buffer.slice(start, end));
  }

  // @internal
  binaryFromSlice(start, end) {
    return new BitArray(this.buffer.slice(start, end));
  }

  // @internal
  sliceAfter(index) {
    return new BitArray(this.buffer.slice(index));
  }
}

class UtfCodepoint {
  constructor(value) {
    this.value = value;
  }
}

// @internal
function byteArrayToInt(byteArray) {
  byteArray = byteArray.reverse();
  let value = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i];
  }
  return value;
}

// @internal
function byteArrayToFloat(byteArray) {
  return new Float64Array(byteArray.reverse().buffer)[0];
}

class Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof Result;
  }
}

class Ok extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }

  // @internal
  isOk() {
    return true;
  }
}

class Error extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }

  // @internal
  isOk() {
    return false;
  }
}

function isEqual(x, y) {
  let values = [x, y];

  while (values.length) {
    let a = values.pop();
    let b = values.pop();
    if (a === b) continue;

    if (!isObject(a) || !isObject(b)) return false;
    let unequal =
      !structurallyCompatibleObjects(a, b) ||
      unequalDates(a, b) ||
      unequalBuffers(a, b) ||
      unequalArrays(a, b) ||
      unequalMaps(a, b) ||
      unequalSets(a, b) ||
      unequalRegExps(a, b);
    if (unequal) return false;

    let proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b)) continue;
        else return false;
      } catch (____error____) {}
    }

    let [keys, get] = getters(a);
    {
      let iter_9 = keys(a)[Symbol.iterator]();
      let next_9 = iter_9.next();
      while (!next_9.done) {
        let k = next_9.value;

        values.push(get(a, k), get(b, k));
        next_9 = iter_9.next();
      }
    }
  }

  return true;
}

function getters(object) {
  if (object instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object instanceof Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}

function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}

function unequalBuffers(a, b) {
  return (
    a.buffer instanceof ArrayBuffer &&
    a.BYTES_PER_ELEMENT &&
    !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]))
  );
}

function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}

function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}

function unequalSets(a, b) {
  return (
    a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)))
  );
}

function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}

function isObject(a) {
  return typeof a === "object" && a !== null;
}

function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;

  let nonstructural = [Promise$1, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c)) return false;

  return a.constructor === b.constructor;
}

// @internal
function remainderInt(a, b) {
  {
    return a % b;
  }
}

// @internal
function makeError(variant, module, line, fn, message, extra) {
  return `${variant} in ${module}:${fn}():${line}, '${message}'`;
}

class Lt extends CustomType {}

class Eq extends CustomType {}

class Gt extends CustomType {}

function lazy_guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence();
  } else {
    return alternative();
  }
}

class Some extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
}

class None extends CustomType {}

function to_result(option, e) {
  if (option instanceof Some) {
    let a = option[0];
    return new Ok(a);
  } else {
    return new Error(e);
  }
}

function unwrap$1(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$;
  }
}

function lazy_unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$();
  }
}

function map$2(option, fun) {
  if (option instanceof Some) {
    let x = option[0];
    return new Some(fun(x));
  } else {
    return new None();
  }
}

function flatten(option) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return new None();
  }
}

function then$(option, fun) {
  if (option instanceof Some) {
    let x = option[0];
    return fun(x);
  } else {
    return new None();
  }
}

class FailedToFindJavaType extends CustomType {
  constructor(java_type) {
    super();
    this.java_type = java_type;
  }
}

class FailedToGetMethod extends CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}

class ThrownError extends CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}

class PublicCall extends CustomType {}

class PrivateJavaMethodCall extends CustomType {}

class ScrollUp extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class ScrollDown extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class Tick extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class CustomCommand extends CustomType {
  constructor(custom_command_name, handler) {
    super();
    this.custom_command_name = custom_command_name;
    this.handler = handler;
  }
}

class CustomKeybind extends CustomType {
  constructor(key, description, handler, gui_key_handler) {
    super();
    this.key = key;
    this.description = description;
    this.handler = handler;
    this.gui_key_handler = gui_key_handler;
  }
}

class GuiOpened extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class GuiClosed extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class PostGuiRender extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class HotbarRender extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

function to_string$2(x) {
  return to_string(x);
}

function compare(a, b) {
  {
    {
      return new Lt();
    }
  }
}

function min(a, b) {
  let $ = a < b;
  if ($) {
    return a;
  } else {
    return b;
  }
}

function max(a, b) {
  let $ = a > b;
  if ($) {
    return a;
  } else {
    return b;
  }
}

function from_string(string) {
  return identity(string);
}

function to_string$1(builder) {
  return identity(builder);
}

function split$2(iodata, pattern) {
  return split$1(iodata, pattern);
}

/**
 * This file uses jsdoc to annotate types.
 * These types can be checked using the typescript compiler with "checkjs" option.
 */

let referenceMap = new WeakMap();
let tempDataView = new DataView(new ArrayBuffer(8));
let referenceUID = 0;
/**
 * hash the object by reference using a weak map and incrementing uid
 * @param {any} o
 * @returns {number}
 */
function hashByReference(o) {
  let known = referenceMap.get(o);
  if (known !== undefined) {
    return known;
  }
  let hash = referenceUID++;
  if (referenceUID === 0x7fffffff) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
/**
 * merge two hashes in an order sensitive way
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0;
}
/**
 * standard string hash popularised by java
 * @param {string} s
 * @returns {number}
 */
function hashString(s) {
  let hash = 0;
  let len = s.length;
  for (let i = 0; i < len; i++) {
    hash = (Math.imul(31, hash) + s.charCodeAt(i)) | 0;
  }
  return hash;
}
/**
 * hash a number by converting to two integers and do some jumbling
 * @param {number} n
 * @returns {number}
 */
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  let i = tempDataView.getInt32(0);
  let j = tempDataView.getInt32(4);
  return Math.imul(0x45d9f3b, (i >> 16) ^ i) ^ j;
}
/**
 * hash a BigInt by converting it to a string and hashing that
 * @param {BigInt} n
 * @returns {number}
 */
function hashBigInt(n) {
  return hashString(n.toString());
}
/**
 * hash any js object
 * @param {any} o
 * @returns {number}
 */
function hashObject(o) {
  let proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      let code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch (____error____) {}
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = (Math.imul(31, h) + getHash(o[i])) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = (h + getHash(v)) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = (h + hashMerge(getHash(v), getHash(k))) | 0;
    });
  } else {
    let keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      let v = o[k];
      h = (h + hashMerge(getHash(v), hashString(k))) | 0;
    }
  }
  return h;
}
/**
 * hash any js value
 * @param {any} u
 * @returns {number}
 */
function getHash(u) {
  if (u === null) return 0x42108422;
  if (u === undefined) return 0x42108423;
  if (u === true) return 0x42108421;
  if (u === false) return 0x42108420;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0; // should be unreachable
  }
}
/**
 * @template K,V
 * @typedef {ArrayNode<K,V> | IndexNode<K,V> | CollisionNode<K,V>} Node
 */
/**
 * @template K,V
 * @typedef {{ type: typeof ENTRY, k: K, v: V }} Entry
 */
/**
 * @template K,V
 * @typedef {{ type: typeof ARRAY_NODE, size: number, array: (undefined | Entry<K,V> | Node<K,V>)[] }} ArrayNode
 */
/**
 * @template K,V
 * @typedef {{ type: typeof INDEX_NODE, bitmap: number, array: (Entry<K,V> | Node<K,V>)[] }} IndexNode
 */
/**
 * @template K,V
 * @typedef {{ type: typeof COLLISION_NODE, hash: number, array: Entry<K, V>[] }} CollisionNode
 */
/**
 * @typedef {{ val: boolean }} Flag
 */
let SHIFT = 5; // number of bits you need to shift by to get the next bucket
let BUCKET_SIZE = Math.pow(2, SHIFT);
let MASK = BUCKET_SIZE - 1; // used to zero out all bits not in the bucket
let MAX_INDEX_NODE = BUCKET_SIZE / 2; // when does index node grow into array node
let MIN_ARRAY_NODE = BUCKET_SIZE / 4; // when does array node shrink to index node
let ENTRY = 0;
let ARRAY_NODE = 1;
let INDEX_NODE = 2;
let COLLISION_NODE = 3;
/** @type {IndexNode<any,any>} */
let EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: [],
};
/**
 * Mask the hash to get only the bucket corresponding to shift
 * @param {number} hash
 * @param {number} shift
 * @returns {number}
 */
function mask(hash, shift) {
  return (hash >>> shift) & MASK;
}
/**
 * Set only the Nth bit where N is the masked hash
 * @param {number} hash
 * @param {number} shift
 * @returns {number}
 */
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
/**
 * Count the number of 1 bits in a number
 * @param {number} x
 * @returns {number}
 */
function bitcount(x) {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
}
/**
 * Calculate the array index of an item in a bitmap index node
 * @param {number} bitmap
 * @param {number} bit
 * @returns {number}
 */
function index(bitmap, bit) {
  return bitcount(bitmap & (bit - 1));
}
/**
 * Efficiently copy an array and set one value at an index
 * @template T
 * @param {T[]} arr
 * @param {number} at
 * @param {T} val
 * @returns {T[]}
 */
function cloneAndSet(arr, at, val) {
  let len = arr.length;
  let out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at] = val;
  return out;
}
/**
 * Efficiently copy an array and insert one value at an index
 * @template T
 * @param {T[]} arr
 * @param {number} at
 * @param {T} val
 * @returns {T[]}
 */
function spliceIn(arr, at, val) {
  let len = arr.length;
  let out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
/**
 * Efficiently copy an array and remove one value at an index
 * @template T
 * @param {T[]} arr
 * @param {number} at
 * @returns {T[]}
 */
function spliceOut(arr, at) {
  let len = arr.length;
  let out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
/**
 * Create a new node containing two entries
 * @template K,V
 * @param {number} shift
 * @param {K} key1
 * @param {V} val1
 * @param {number} key2hash
 * @param {K} key2
 * @param {V} val2
 * @returns {Node<K,V>}
 */
function createNode(shift, key1, val1, key2hash, key2, val2) {
  let key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 },
      ],
    };
  }
  let addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
/**
 * @template T,K,V
 * @callback AssocFunction
 * @param {T} root
 * @param {number} shift
 * @param {number} hash
 * @param {K} key
 * @param {V} val
 * @param {Flag} addedLeaf
 * @returns {Node<K,V>}
 */
/**
 * Associate a node with a new entry, creating a new node
 * @template T,K,V
 * @type {AssocFunction<Node<K,V>,K,V>}
 */
function assoc(root, shift, hash, key, val, addedLeaf) {
  switch (root.type) {
    case ARRAY_NODE:
      return assocArray(root, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root, shift, hash, key, val, addedLeaf);
  }
}
/**
 * @template T,K,V
 * @type {AssocFunction<ArrayNode<K,V>,K,V>}
 */
function assocArray(root, shift, hash, key, val, addedLeaf) {
  let idx = mask(hash, shift);
  let node = root.array[idx];
  // if the corresponding index is empty set the index to a newly created node
  if (node === undefined) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size + 1,
      array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val }),
    };
  }
  if (node.type === ENTRY) {
    // if keys are equal replace the entry
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: ARRAY_NODE,
        size: root.size,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val,
        }),
      };
    }
    // otherwise upgrade the entry to a node and insert
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      ),
    };
  }
  // otherwise call assoc on the child node
  let n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  // if the child node hasn't changed just return the old root
  if (n === node) {
    return root;
  }
  // otherwise set the index to the new node
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n),
  };
}
/**
 * @template T,K,V
 * @type {AssocFunction<IndexNode<K,V>,K,V>}
 */
function assocIndex(root, shift, hash, key, val, addedLeaf) {
  let bit = bitpos(hash, shift);
  let idx = index(root.bitmap, bit);
  // if there is already a item at this hash index..
  if ((root.bitmap & bit) !== 0) {
    // if there is a node at the index (not an entry), call assoc on the child node
    let node = root.array[idx];
    if (node.type !== ENTRY) {
      let n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n),
      };
    }
    // otherwise there is an entry at the index
    // if the keys are equal replace the entry with the updated value
    let nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val,
        }),
      };
    }
    // if the keys are not equal, replace the entry with a new child node
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      ),
    };
  } else {
    // else there is currently no item at the hash index
    let n = root.array.length;
    // if the number of nodes is at the maximum, expand this node into an array node
    if (n >= MAX_INDEX_NODE) {
      // create a 32 length array for the new array node (one for each bit in the hash)
      let nodes = new Array(32);
      // create and insert a node for the new entry
      let jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root.bitmap;
      // place each item in the index node into the correct spot in the array node
      // loop through all 32 bits / array positions
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          let node = root.array[j++];
          nodes[i] = node;
        }
        // shift the bitmap to process the next bit
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes,
      };
    } else {
      // else there is still space in this index node
      // simply insert a new entry at the hash index
      let newArray = spliceIn(root.array, idx, {
        type: ENTRY,
        k: key,
        v: val,
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap | bit,
        array: newArray,
      };
    }
  }
}
/**
 * @template T,K,V
 * @type {AssocFunction<CollisionNode<K,V>,K,V>}
 */
function assocCollision(root, shift, hash, key, val, addedLeaf) {
  // if there is a hash collision
  if (hash === root.hash) {
    let idx = collisionIndexOf(root, key);
    // if this key already exists replace the entry with the new value
    if (idx !== -1) {
      let entry = root.array[idx];
      if (entry.v === val) {
        return root;
      }
      return {
        type: COLLISION_NODE,
        hash: hash,
        array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val }),
      };
    }
    // otherwise insert the entry at the end of the array
    let size = root.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash: hash,
      array: cloneAndSet(root.array, size, { type: ENTRY, k: key, v: val }),
    };
  }
  // if there is no hash collision, upgrade to an index node
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root.hash, shift),
      array: [root],
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
/**
 * Find the index of a key in the collision node's array
 * @template K,V
 * @param {CollisionNode<K,V>} root
 * @param {K} key
 * @returns {number}
 */
function collisionIndexOf(root, key) {
  let size = root.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root.array[i].k)) {
      return i;
    }
  }
  return -1;
}
/**
 * @template T,K,V
 * @callback FindFunction
 * @param {T} root
 * @param {number} shift
 * @param {number} hash
 * @param {K} key
 * @returns {undefined | Entry<K,V>}
 */
/**
 * Return the found entry or undefined if not present in the root
 * @template K,V
 * @type {FindFunction<Node<K,V>,K,V>}
 */
function find(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return findArray(root, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root, key);
  }
}
/**
 * @template K,V
 * @type {FindFunction<ArrayNode<K,V>,K,V>}
 */
function findArray(root, shift, hash, key) {
  let idx = mask(hash, shift);
  let node = root.array[idx];
  if (node === undefined) {
    return undefined;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return undefined;
}
/**
 * @template K,V
 * @type {FindFunction<IndexNode<K,V>,K,V>}
 */
function findIndex(root, shift, hash, key) {
  let bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return undefined;
  }
  let idx = index(root.bitmap, bit);
  let node = root.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return undefined;
}
/**
 * @template K,V
 * @param {CollisionNode<K,V>} root
 * @param {K} key
 * @returns {undefined | Entry<K,V>}
 */
function findCollision(root, key) {
  let idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return undefined;
  }
  return root.array[idx];
}
/**
 * @template T,K,V
 * @callback WithoutFunction
 * @param {T} root
 * @param {number} shift
 * @param {number} hash
 * @param {K} key
 * @returns {undefined | Node<K,V>}
 */
/**
 * Remove an entry from the root, returning the updated root.
 * Returns undefined if the node should be removed from the parent.
 * @template K,V
 * @type {WithoutFunction<Node<K,V>,K,V>}
 * */
function without(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return withoutArray(root, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root, key);
  }
}
/**
 * @template K,V
 * @type {WithoutFunction<ArrayNode<K,V>,K,V>}
 */
function withoutArray(root, shift, hash, key) {
  let idx = mask(hash, shift);
  let node = root.array[idx];
  if (node === undefined) {
    return root; // already empty
  }
  let n = undefined;
  // if node is an entry and the keys are not equal there is nothing to remove
  // if node is not an entry do a recursive call
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root; // no changes
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root; // no changes
    }
  }
  // if the recursive call returned undefined the node should be removed
  if (n === undefined) {
    // if the number of child nodes is at the minimum, pack into an index node
    if (root.size <= MIN_ARRAY_NODE) {
      let arr = root.array;
      let out = new Array(root.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        let nv = arr[i];
        if (nv !== undefined) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i; // skip copying the removed node
      while (i < arr.length) {
        let nv = arr[i];
        if (nv !== undefined) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap: bitmap,
        array: out,
      };
    }
    return {
      type: ARRAY_NODE,
      size: root.size - 1,
      array: cloneAndSet(root.array, idx, n),
    };
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n),
  };
}
/**
 * @template K,V
 * @type {WithoutFunction<IndexNode<K,V>,K,V>}
 */
function withoutIndex(root, shift, hash, key) {
  let bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return root; // already empty
  }
  let idx = index(root.bitmap, bit);
  let node = root.array[idx];
  // if the item is not an entry
  if (node.type !== ENTRY) {
    let n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root; // no changes
    }
    // if not undefined, the child node still has items, so update it
    if (n !== undefined) {
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n),
      };
    }
    // otherwise the child node should be removed
    // if it was the only child node, remove this node from the parent
    if (root.bitmap === bit) {
      return undefined;
    }
    // otherwise just remove the child node
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx),
    };
  }
  // otherwise the item is an entry, remove it if the key matches
  if (isEqual(key, node.k)) {
    if (root.bitmap === bit) {
      return undefined;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx),
    };
  }
  return root;
}
/**
 * @template K,V
 * @param {CollisionNode<K,V>} root
 * @param {K} key
 * @returns {undefined | Node<K,V>}
 */
function withoutCollision(root, key) {
  let idx = collisionIndexOf(root, key);
  // if the key not found, no changes
  if (idx < 0) {
    return root;
  }
  // otherwise the entry was found, remove it
  // if it was the only entry in this node, remove the whole node
  if (root.array.length === 1) {
    return undefined;
  }
  // otherwise just remove the entry
  return {
    type: COLLISION_NODE,
    hash: root.hash,
    array: spliceOut(root.array, idx),
  };
}
/**
 * @template K,V
 * @param {undefined | Node<K,V>} root
 * @param {(value:V,key:K)=>void} fn
 * @returns {void}
 */
function forEach(root, fn) {
  if (root === undefined) {
    return;
  }
  let items = root.array;
  let size = items.length;
  for (let i = 0; i < size; i++) {
    let item = items[i];
    if (item === undefined) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
/**
 * Extra wrapper to keep track of Dict size and clean up the API
 * @template K,V
 */
class Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    let keys = Object.keys(o);
    /** @type Dict<string,V> */
    let m = Dict.new();
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    /** @type Dict<K,V> */
    let m = Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new Dict(undefined, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root, size) {
    this.root = root;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === undefined) {
      return notFound;
    }
    let found = find(this.root, 0, getHash(key), key);
    if (found === undefined) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    let addedLeaf = { val: false };
    let root = this.root === undefined ? EMPTY : this.root;
    let newRoot = assoc(root, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === undefined) {
      return this;
    }
    let newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === undefined) {
      return Dict.new();
    }
    return new Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === undefined) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== undefined;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === undefined) {
      return [];
    }
    /** @type [K,V][] */
    let result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = (h + hashMerge(getHash(v), getHash(k))) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof Dict) || this.size !== o.size) {
      return false;
    }
    let equal = true;
    this.forEach((v, k) => {
      equal = equal && isEqual(o.get(k, !v), v);
    });
    return equal;
  }
}

let Nil = undefined;
let NOT_FOUND = {};

function identity(x) {
  return x;
}

function to_string(term) {
  return term.toString();
}

function split$1(xs, pattern) {
  return List.fromArray(xs.split(pattern));
}

function new_map() {
  return Dict.new();
}

function map_size(map) {
  return map.size;
}

function map_get(map, key) {
  let value = map.get(key, NOT_FOUND);
  if (value === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value);
}

function map_insert(key, value, map) {
  return map.set(key, value);
}

function inspect$1(v) {
  let t = typeof v;
  if (v === true) return "True";
  if (v === false) return "False";
  if (v === null) return "//js(null)";
  if (v === undefined) return "Nil";
  if (t === "string") return JSON.stringify(v);
  if (t === "bigint" || t === "number") return v.toString();
  if (Array.isArray(v)) return `#(${v.map(inspect$1).join(", ")})`;
  if (v instanceof List) return inspectList(v);
  if (v instanceof UtfCodepoint) return inspectUtfCodepoint(v);
  if (v instanceof BitArray) return inspectBitArray(v);
  if (v instanceof CustomType) return inspectCustomType(v);
  if (v instanceof Dict) return inspectDict(v);
  if (v instanceof Set) return `//js(Set(${[...v].map(inspect$1).join(", ")}))`;
  if (v instanceof RegExp) return `//js(${v})`;
  if (v instanceof Date) return `//js(Date("${v.toISOString()}"))`;
  if (v instanceof Function) {
    let args = [];
    {
      let iter_13 = Array(v.length).keys()[Symbol.iterator]();
      let next_13 = iter_13.next();
      while (!next_13.done) {
        let i = next_13.value;
        rgs.push(String.fromCharCode(i + 97));
        next_13 = iter_13.next();
      }
    }
    return `//fn(${args.join(", ")}) { ... }`;
  }
  return inspectObject(v);
}

function inspectDict(map) {
  let body = "dict.from_list([";
  let first = true;
  map.forEach((value, key) => {
    if (!first) body = body + ", ";
    body = body + "#(" + inspect$1(key) + ", " + inspect$1(value) + ")";
    first = false;
  });
  return body + "])";
}

function inspectObject(v) {
  let name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
  let props = [];
  {
    let iter_14 = Object.keys(v)[Symbol.iterator]();
    let next_14 = iter_14.next();
    while (!next_14.done) {
      let k = next_14.value;

      props.push(`${inspect$1(k)}: ${inspect$1(v[k])}`);
      next_14 = iter_14.next();
    }
  }
  let body = props.length ? " " + props.join(", ") + " " : "";
  let head = name === "Object" ? "" : name + " ";
  return `//js(${head}{${body}})`;
}

function inspectCustomType(record) {
  let props = Object.keys(record)
    .map((label) => {
      let value = inspect$1(record[label]);
      return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
    })
    .join(", ");
  return props
    ? `${record.constructor.name}(${props})`
    : record.constructor.name;
}

function inspectList(list) {
  return `[${list.toArray().map(inspect$1).join(", ")}]`;
}

function inspectBitArray(bits) {
  return `<<${Array.from(bits.buffer).join(", ")}>>`;
}

function inspectUtfCodepoint(codepoint) {
  return `//utfcodepoint(${String.fromCodePoint(codepoint.value)})`;
}

function new$() {
  return new_map();
}

function get(from, get) {
  return map_get(from, get);
}

function insert(dict, key, value) {
  return map_insert(key, value, dict);
}

function fold_list_of_pair(loop$list, loop$initial) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    if (list.hasLength(0)) {
      return initial;
    } else {
      let x = list.head;
      let rest = list.tail;
      loop$list = rest;
      loop$initial = insert(initial, x[0], x[1]);
    }
  }
}

function from_list(list) {
  return fold_list_of_pair(list, new$());
}

function do_reverse(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}

function reverse(xs) {
  return do_reverse(xs, toList([]));
}

function do_filter_map$1(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      let new_acc = (() => {
        let $ = fun(x);
        if ($.isOk()) {
          let x$1 = $[0];
          return prepend(x$1, acc);
        } else {
          return acc;
        }
      })();
      loop$list = xs;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}

function filter_map$1(list, fun) {
  return do_filter_map$1(list, fun, toList([]));
}

function do_map$1(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      loop$list = xs;
      loop$fun = fun;
      loop$acc = prepend(fun(x), acc);
    }
  }
}

function map$1(list, fun) {
  return do_map$1(list, fun, toList([]));
}

function do_index_map(loop$list, loop$fun, loop$index, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let index = loop$index;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      let acc$1 = prepend(fun(x, index), acc);
      loop$list = xs;
      loop$fun = fun;
      loop$index = index + 1;
      loop$acc = acc$1;
    }
  }
}

function index_map(list, fun) {
  return do_index_map(list, fun, 0, toList([]));
}

function each$1(loop$list, loop$f) {
  while (true) {
    let list = loop$list;
    let f = loop$f;
    if (list.hasLength(0)) {
      return undefined;
    } else {
      let x = list.head;
      let xs = list.tail;
      f(x);
      loop$list = xs;
      loop$f = f;
    }
  }
}

function do_sized_chunk(
  loop$list,
  loop$count,
  loop$left,
  loop$current_chunk,
  loop$acc
) {
  while (true) {
    let list = loop$list;
    let count = loop$count;
    let left = loop$left;
    let current_chunk = loop$current_chunk;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      if (current_chunk.hasLength(0)) {
        return reverse(acc);
      } else {
        let remaining = current_chunk;
        return reverse(prepend(reverse(remaining), acc));
      }
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      let chunk$1 = prepend(first$1, current_chunk);
      let $ = left > 1;
      if (!$) {
        loop$list = rest$1;
        loop$count = count;
        loop$left = count;
        loop$current_chunk = toList([]);
        loop$acc = prepend(reverse(chunk$1), acc);
      } else {
        loop$list = rest$1;
        loop$count = count;
        loop$left = left - 1;
        loop$current_chunk = chunk$1;
        loop$acc = acc;
      }
    }
  }
}

function sized_chunk(list, count) {
  return do_sized_chunk(list, count, count, toList([]), toList([]));
}

class Stop extends CustomType {}

class Continue extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
}

class Iterator extends CustomType {
  constructor(continuation) {
    super();
    this.continuation = continuation;
  }
}

class Next extends CustomType {
  constructor(element, accumulator) {
    super();
    this.element = element;
    this.accumulator = accumulator;
  }
}

class Done extends CustomType {}

function stop() {
  return new Stop();
}

function do_unfold(initial, f) {
  return () => {
    let $ = f(initial);
    if ($ instanceof Next) {
      let x = $.element;
      let acc = $.accumulator;
      return new Continue(x, do_unfold(acc, f));
    } else {
      return new Stop();
    }
  };
}

function unfold(initial, f) {
  let _pipe = initial;
  let _pipe$1 = do_unfold(_pipe, f);
  return new Iterator(_pipe$1);
}

function do_fold(loop$continuation, loop$f, loop$accumulator) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let accumulator = loop$accumulator;
    let $ = continuation();
    if ($ instanceof Continue) {
      let elem = $[0];
      let next = $[1];
      loop$continuation = next;
      loop$f = f;
      loop$accumulator = f(accumulator, elem);
    } else {
      return accumulator;
    }
  }
}

function fold(iterator, initial, f) {
  let _pipe = iterator.continuation;
  return do_fold(_pipe, f, initial);
}

function run(iterator) {
  return fold(iterator, undefined, (_, _1) => {
    return undefined;
  });
}

function do_map(continuation, f) {
  return () => {
    let $ = continuation();
    if ($ instanceof Stop) {
      return new Stop();
    } else {
      let e = $[0];
      let continuation$1 = $[1];
      return new Continue(f(e), do_map(continuation$1, f));
    }
  };
}

function map(iterator, f) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_map(_pipe, f);
  return new Iterator(_pipe$1);
}

function do_filter_map(loop$continuation, loop$f) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let $ = continuation();
    if ($ instanceof Stop) {
      return new Stop();
    } else {
      let e = $[0];
      let next = $[1];
      let $1 = f(e);
      if ($1.isOk()) {
        let e$1 = $1[0];
        return new Continue(e$1, () => {
          return do_filter_map(next, f);
        });
      } else {
        loop$continuation = next;
        loop$f = f;
      }
    }
  }
}

function filter_map(iterator, f) {
  let _pipe = () => {
    return do_filter_map(iterator.continuation, f);
  };
  return new Iterator(_pipe);
}

function once(f) {
  let _pipe = () => {
    return new Continue(f(), stop);
  };
  return new Iterator(_pipe);
}

function range(start, stop) {
  let $ = compare();
  if ($ instanceof Eq) {
    return once(() => {
      return start;
    });
  } else if ($ instanceof Gt) {
    return unfold(start, (current) => {
      let $1 = current < stop;
      if (!$1) {
        return new Next(current, current - 1);
      } else {
        return new Done();
      }
    });
  } else {
    return unfold(start, (current) => {
      let $1 = current > stop;
      if (!$1) {
        return new Next(current, current + 1);
      } else {
        return new Done();
      }
    });
  }
}

function do_length(loop$continuation, loop$length) {
  while (true) {
    let continuation = loop$continuation;
    let length = loop$length;
    let $ = continuation();
    if ($ instanceof Stop) {
      return length;
    } else {
      let next = $[1];
      loop$continuation = next;
      loop$length = length + 1;
    }
  }
}

function length(iterator) {
  let _pipe = iterator.continuation;
  return do_length(_pipe, 0);
}

function each(iterator, f) {
  let _pipe = iterator;
  let _pipe$1 = map(_pipe, f);
  return run(_pipe$1);
}

function split(x, substring) {
  {
    let _pipe = x;
    let _pipe$1 = from_string(_pipe);
    let _pipe$2 = split$2(_pipe$1, substring);
    return map$1(_pipe$2, to_string$1);
  }
}

function inspect(term) {
  let _pipe = inspect$1(term);
  return to_string$1(_pipe);
}

function panic_unwrap_o(x) {
  return lazy_unwrap(x, () => {
    throw makeError(
      "panic",
      "ct/stdext",
      102,
      "",
      "panic expression evaluated"
    );
  });
}

function unwrap(result) {
  if (result.isOk()) {
    let a_value = result[0];
    return a_value;
  } else {
    let err = result[0];
    throw makeError("panic", "ct/stdext", 119, "unwrap", inspect(err));
  }
}

function click(slot, click_type) {
  return std__internal_click(slot, 0, 0);
}

function from_raw_item(raw_item) {
  let _pipe = reflection__new_instance("Item")([raw_item]);
  let _pipe$1 = unwrap(_pipe);
  return panic_unwrap_o(_pipe$1);
}

function to_item_stack(item) {
  return reflection__call_method("getItemStack", new PublicCall())(item, []);
}

function copy_item_stack(raw_item_stack) {
  return reflection__call_method("func_77946_l", new PublicCall())(
    raw_item_stack,
    []
  );
}

function from_raw_item_stack(raw_item_stack) {
  let _pipe = reflection__new_instance("Item")([raw_item_stack]);
  return unwrap(_pipe);
}

function clone_item(item) {
  let _pipe = item;
  let _pipe$1 = to_item_stack(_pipe);
  let _pipe$2 = map$2(_pipe$1, copy_item_stack);
  let _pipe$3 = flatten(_pipe$2);
  let _pipe$4 = map$2(_pipe$3, from_raw_item_stack);
  return flatten(_pipe$4);
}

function with_name(item, new_name) {
  return then$(clone_item(item), (cloned_item) => {
    return then$(
      reflection__call_method("setName", new PublicCall())(cloned_item, [
        new_name,
      ]),
      (_) => {
        return new Some(cloned_item);
      }
    );
  });
}

function with_lore(item, new_lore) {
  return then$(clone_item(item), (cloned_item) => {
    let lore_as_array = std__to_js_array(new_lore);
    return then$(
      reflection__call_method("setLore", new PublicCall())(
        cloned_item,
        lore_as_array
      ),
      (_) => {
        return new Some(cloned_item);
      }
    );
  });
}

class WindowOpen extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

class RenderItemIntoGui extends CustomType {
  constructor(handler) {
    super();
    this.handler = handler;
  }
}

/// <reference types="../vendor/ct" />
function std__log(toLog) {
  return ChatLib.chat(toLog);
}
function std__chat(msg) {
  return ChatLib.say(msg);
}
function reflection__get_static_method(baseClass, methodName) {
  return (args) => {
    try {
      let ty = !baseClass.includes(".")
        ? global[baseClass]
        : Java.type(baseClass);
      if (!ty) {
        return new Error(new FailedToFindJavaType(baseClass));
      }
      let method = ty[methodName];
      if (!method) {
        return new Error(new FailedToGetMethod(methodName));
      }
      let value = ty[methodName](...args);
      if (!value) {
        return new Ok(new None());
      }
      return new Ok(new Some(value));
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}
function reflection__new_instance(className) {
  let ty = !className.includes(".") ? global[className] : Java.type(className);
  if (!ty) {
    return new Error(new FailedToFindJavaType(className));
  }
  return (args) => {
    try {
      let value = new ty(...args);
      if (!value) {
        return new Ok(new None());
      }
      return new Ok(new Some(value));
    } catch (e) {
      return new Error(new ThrownError(e.toString()));
    }
  };
}
function reflection__call_method(methodName, callType) {
  return (baseObject, args) => {
    try {
      let value;
      if (callType instanceof PublicCall) {
        value = baseObject[methodName](...args);
      } else if (callType instanceof PrivateJavaMethodCall) {
        let methodHandle = baseObject.getClass().getDeclaredMethod(methodName);
        methodHandle.setAccessible(true);
        value = methodHandle.invoke(baseObject, ...args);
      } else {
        throw (
          "Unexpected call type which doesn't match expected call types: " +
          callType.toString()
        );
      }
      if (!value) {
        return new None();
      }
      return new Some(value);
    } catch (e) {
      return new None();
    }
  };
}
function reflection__get_field_value(baseClass, methodName) {
  return (onObject) => {
    try {
      let type = Java.type(baseClass);
      if (!type) {
        return new None();
      }
      let field = type.class.getDeclaredField(methodName);
      field.setAccessible(true);
      let fieldValue = field.get(onObject instanceof Some ? onObject[0] : null);
      if (fieldValue) {
        return new Some(fieldValue);
      } else {
        return new None();
      }
    } catch (e) {
      return new None();
    }
  };
}
let C10PacketCreativeInventoryAction = Java.type(
  "net.minecraft.network.play.client.C10PacketCreativeInventoryAction"
);
let loadItemstack = (slot, itemStack) => {
  Client.sendPacket(
    new C10PacketCreativeInventoryAction(
      slot, // slot, 36=hotbar slot 1
      itemStack // item to get as a minecraft item stack object
    )
  );
};
function player__set_hotbar_slot_to_item(itemToSet, hotbarSlotToFill) {
  loadItemstack(36 + hotbarSlotToFill, itemToSet.getItemStack());
}
function player__clear_slot(hotbarSlotToFill) {
  loadItemstack(36 + hotbarSlotToFill, null);
}
function std__read_file(fromPath) {
  return FileLib.read(fromPath);
}
let scrollUp = [];
let scrollDown = [];
let tick = [];
let postGuiRender = [];
let hotbarRender = [];
let guiKey = [];
let guiOpened = [];
let guiClosed = [];
let handleNext = {
  windowOpen: [],
};
let handleUntil = {
  renderItemIntoWindow: new Set(),
};
let thenCall = new Map();
register("scrolled", (x, y, direction) => {
  if (direction === 1) {
    scrollUp.forEach((fn) => fn());
  } else if (direction === -1) {
    scrollDown.forEach((fn) => fn());
  }
});
register("tick", () => {
  tick.forEach((fn) => fn());
});
register("postGuiRender", (x, y, gui) => {
  postGuiRender.forEach((fn) => fn(gui));
});
register("renderHotbar", () => {
  hotbarRender.forEach((fn) => fn());
});
register("guiKey", (char, keycode, gui, event) => {
  guiKey.forEach((fn) => fn(char, keycode, gui, event));
});
register("guiOpened", (e) => {
  guiOpened.forEach((fn) => fn(e.gui));
  {
    let iter_0 = handleNext.windowOpen.splice(0)[Symbol.iterator]();
    let next_0 = iter_0.next();
    while (!next_0.done) {
      let handler = next_0.value;

      console.log("gui called");
      handler(e.gui);
      next_0 = iter_0.next();
    }
  }
});
register("guiClosed", () => {
  guiClosed.forEach((fn) => fn());
});
register("renderItemIntoGui", (item) => {
  let toRemove = [];
  {
    let iter_1 = handleUntil.renderItemIntoWindow[Symbol.iterator]();
    let next_1 = iter_1.next();
    while (!next_1.done) {
      let handler = next_1.value;

      if (handler(item)) {
        toRemove.push(handler);
      }
      next_1 = iter_1.next();
    }
  }
  {
    let iter_2 = toRemove[Symbol.iterator]();
    let next_2 = iter_2.next();
    while (!next_2.done) {
      let el = next_2.value;

      handleUntil.renderItemIntoWindow.delete(el);
      thenCall.get(el)(item);
      thenCall.delete(el);
      next_2 = iter_2.next();
    }
  }
});
function update_loop__make(init, eventHandlers, displayers) {
  let value = init;
  {
    let iter_3 = eventHandlers.toArray()[Symbol.iterator]();
    let next_3 = iter_3.next();
    while (!next_3.done) {
      let eventHandler = next_3.value;

      if (eventHandler instanceof ScrollUp) {
        scrollUp.push(() => {
          value = eventHandler.handler(value);
        });
      } else if (eventHandler instanceof ScrollDown) {
        scrollDown.push(() => {
          value = eventHandler.handler(value);
        });
      } else if (eventHandler instanceof Tick) {
        tick.push(() => {
          value = eventHandler.handler(value);
        });
      } else if (eventHandler instanceof CustomCommand) {
        register("command", (user) => {
          value = eventHandler.handler(value);
        }).setName(eventHandler.custom_command_name);
      } else if (eventHandler instanceof CustomKeybind) {
        let keybind = Client.getKeyBindFromKey(
          Keyboard[eventHandler.key],
          eventHandler.description
        );
        keybind.registerKeyPress(() => {
          value = eventHandler.handler(value);
        });
        guiKey.push((char, keycode, gui, event) => {
          if (keybind.getKeyCode() === keycode) {
            value = eventHandler.gui_key_handler(value, gui);
          }
        });
      } else if (eventHandler instanceof GuiOpened) {
        guiOpened.push((gui) => {
          value = eventHandler.handler(value, gui);
        });
      } else if (eventHandler instanceof GuiClosed) {
        guiClosed.push(() => {
          value = eventHandler.handler(value);
        });
      } else {
        ChatLib.chat("unexpected event handler!!!");
      }
      next_3 = iter_3.next();
    }
  }
  {
    let iter_4 = displayers.toArray()[Symbol.iterator]();
    let next_4 = iter_4.next();
    while (!next_4.done) {
      let displayer = next_4.value;

      if (displayer instanceof PostGuiRender) {
        postGuiRender.push((gui) => {
          displayer.handler(undefined, value, gui);
        });
      } else if (displayer instanceof HotbarRender) {
        hotbarRender.push(() => {
          displayer.handler(undefined, value);
        });
      } else {
        ChatLib.chat("unexpected displayer!!!");
      }
      next_4 = iter_4.next();
    }
  }
  // console.log(
  //   JSON.stringify(
  //     eventHandlers.toArray(),
  //     function functionReplacer(key, value) {
  //       if (typeof value === "function") {
  //         return "function";
  //       }
  //       return value;
  //     }
  //   )
  // );
}
function render__render_string(_, x, y, toWrite) {
  Renderer.drawStringWithShadow(toWrite, x, y);
}
function player__get_item_in_slot(slot) {
  let inventory = Player.getInventory();
  if (inventory) {
    let item = inventory.getStackInSlot(slot);
    if (item) {
      return new Some(item);
    }
  }
  return new None();
}
function gui__is_instance_of(gui, className) {
  return gui.class.getName() === className;
}
function gui__slot_under_mouse(gui) {
  var _a;
  let slot =
    (_a = gui === null || gui === void 0 ? void 0 : gui.getSlotUnderMouse) ===
      null || _a === void 0
      ? void 0
      : _a.call(gui);
  if (slot) {
    return new Some(new Slot(slot));
  }
  return new None();
}
function item__name(item) {
  return item.getName();
}
function item__lore(item) {
  let itemLore = item.getLore().slice(1);
  itemLore.pop();
  return toList(itemLore);
}
function std__to_js_array(arr) {
  return arr.toArray();
}
let C0EPacketClickWindow = Java.type(
  "net.minecraft.network.play.client.C0EPacketClickWindow"
);
function std__internal_click(slotId, mode, button) {
  Client.sendPacket(
    new C0EPacketClickWindow(
      Player.getContainer().getWindowId(),
      slotId,
      button,
      mode,
      null,
      0
    )
  );
}
function events__handle_next(event) {
  if (event instanceof WindowOpen) {
    handleNext.windowOpen.push(event.handler);
  } else {
    throw "Event given to events::handle_next of type that isn't understood";
  }
}
function events__handle_until(eventFilterer, event) {
  if (event instanceof RenderItemIntoGui) {
    if (
      event instanceof RenderItemIntoGui &&
      !(eventFilterer instanceof RenderItemIntoGui)
    )
      throw "Expected event and eventFilterer in events::handle_until to be of the same enumeration type, instead they were different.";
    handleUntil.renderItemIntoWindow.add(eventFilterer.handler);
    thenCall.set(eventFilterer.handler, event.handler);
  } else {
    throw "Event given to events::handle_until of type that isn't understood";
  }
}

function item_in_slot(slot) {
  return reflection__call_method("getItem", new PublicCall())(slot, []);
}

function number_of_slot(slot) {
  return reflection__call_method("getIndex", new PublicCall())(slot, []);
}

class Initial extends CustomType {}

class Copied extends CustomType {
  constructor(name, lore) {
    super();
    this.name = name;
    this.lore = lore;
  }
}

let creative_gui = "net.minecraft.client.gui.inventory.GuiContainerCreative";

let creative_tab_field = "field_147058_w";

let inventory_creative_tab_ix = 11;

function start$2() {
  let creative_tab_field_getter = reflection__get_field_value(
    creative_gui,
    creative_tab_field
  );
  return update_loop__make(
    new Initial(),
    toList([
      new CustomKeybind(
        "KEY_R",
        "Copy Item Name & Lore",
        (state) => {
          return state;
        },
        (state, gui) => {
          let item = (() => {
            let _pipe = gui;
            let _pipe$1 = gui__slot_under_mouse(_pipe);
            return then$(_pipe$1, item_in_slot);
          })();
          if (item instanceof Some) {
            let item$1 = item[0];
            std__log("Copied item hovered.");
            return new Copied(
              (() => {
                let _pipe = item$1;
                return item__name(_pipe);
              })(),
              (() => {
                let _pipe = item$1;
                return item__lore(_pipe);
              })()
            );
          } else {
            return state;
          }
        }
      ),
      new CustomKeybind(
        "KEY_K",
        "Paste Item Name & Lore",
        (state) => {
          return state;
        },
        (state, gui) => {
          if (state instanceof Initial);
          else {
            let name = state.name;
            let lore = state.lore;
            let err = (log) => {
              return () => {
                return std__log(log);
              };
            };
            lazy_guard(
              !gui__is_instance_of(gui, creative_gui),
              err(
                "You must be in the inventory tab of the creative menu to paste."
              ),
              () => {
                let is_on_inventory_tab = (() => {
                  let _pipe = creative_tab_field_getter(new Some(gui));
                  let _pipe$1 = map$2(_pipe, (creative_tab) => {
                    return creative_tab === inventory_creative_tab_ix;
                  });
                  return unwrap$1(_pipe$1, false);
                })();
                return lazy_guard(
                  !is_on_inventory_tab,
                  err(
                    "You must be in the inventory tab of the creative menu to paste."
                  ),
                  () => {
                    let item = (() => {
                      let _pipe = gui;
                      let _pipe$1 = gui__slot_under_mouse(_pipe);
                      let _pipe$2 = then$(_pipe$1, item_in_slot);
                      let _pipe$3 = then$(_pipe$2, (_capture) => {
                        return with_name(_capture, name);
                      });
                      return then$(_pipe$3, (_capture) => {
                        return with_lore(_capture, lore);
                      });
                    })();
                    let slot = (() => {
                      let _pipe = gui;
                      let _pipe$1 = gui__slot_under_mouse(_pipe);
                      return then$(_pipe$1, number_of_slot);
                    })();
                    if (item instanceof Some && slot instanceof Some) {
                      let item$1 = item[0];
                      let slot$1 = slot[0];
                      player__set_hotbar_slot_to_item(item$1, slot$1 - 36);
                      return std__log("Pasted onto hovered item");
                    } else {
                      return std__log("Failed to paste onto hovered item");
                    }
                  }
                );
              }
            );
          }
          return state;
        }
      ),
    ]),
    toList([])
  );
}

function internal_get_from_give_code(input) {
  let _pipe = reflection__get_static_method(
    "fr.atesab.act.utils.ItemUtils",
    "getFromGiveCode"
  )([input]);
  return unwrap(_pipe);
}

function get_item_from_give_code(give_code) {
  let _pipe = internal_get_from_give_code(give_code);
  return map$2(_pipe, from_raw_item);
}

class ShouldUpdate extends CustomType {
  constructor(i) {
    super();
    this.i = i;
  }
}

class IsUpdated extends CustomType {
  constructor(i) {
    super();
    this.i = i;
  }
}

class NotActive extends CustomType {}

function start$1() {
  let file_contents = std__read_file(
    "C:\\Users\\___\\Documents\\code\\4-20-24\\examplemod\\z_pokeindex_output.txt"
  );
  let items = (() => {
    let _pipe = file_contents;
    let _pipe$1 = split(_pipe, "\n");
    let _pipe$2 = map$1(_pipe$1, get_item_from_give_code);
    let _pipe$3 = filter_map$1(_pipe$2, (a) => {
      return to_result(a, undefined);
    });
    let _pipe$4 = sized_chunk(_pipe$3, 8);
    let _pipe$5 = index_map(_pipe$4, (a, i) => {
      return [
        i,
        index_map(a, (b, j) => {
          return [b, j];
        }),
      ];
    });
    return from_list(_pipe$5);
  })();
  return update_loop__make(
    new NotActive(),
    toList([
      new CustomCommand("toggleitemgiver", (state) => {
        let has_items_in_hotbar =
          (() => {
            let _pipe = range(0, 0 + 7);
            let _pipe$1 = map(_pipe, player__get_item_in_slot);
            let _pipe$2 = filter_map(_pipe$1, (a) => {
              return to_result(a, undefined);
            });
            return length(_pipe$2);
          })() > 0;
        if (state instanceof NotActive && !has_items_in_hotbar) {
          std__log("Item giver &anow active&f! Starting at page 1.");
          return new ShouldUpdate(0);
        } else if (state instanceof NotActive && has_items_in_hotbar) {
          std__log("Try again with an &cempty&f hotbar.");
          return new NotActive();
        } else {
          std__log("Item giver &cno longer active&f!");
          let _pipe = range(0, 0 + 7);
          each(_pipe, player__clear_slot);
          return new NotActive();
        }
      }),
      new ScrollUp((state) => {
        if (state instanceof NotActive) {
          return new NotActive();
        } else if (state instanceof IsUpdated) {
          let i = state.i;
          let slot = max(i - 1, 0);
          return new ShouldUpdate(slot);
        } else {
          let i = state.i;
          let slot = max(i - 1, 0);
          return new ShouldUpdate(slot);
        }
      }),
      new ScrollDown((state) => {
        if (state instanceof IsUpdated) {
          let i = state.i;
          let slot = min(i + 1, map_size(items) - 1);
          return new ShouldUpdate(slot);
        } else if (state instanceof ShouldUpdate) {
          let i = state.i;
          let slot = min(i + 1, map_size(items) - 1);
          return new ShouldUpdate(slot);
        } else {
          return new NotActive();
        }
      }),
      new Tick((state) => {
        if (state instanceof IsUpdated) {
          return state;
        } else if (state instanceof NotActive) {
          return state;
        } else {
          let i = state.i;
          let $ = get(items, i);
          if ($.isOk()) {
            let items$1 = $[0];
            each$1(items$1, (item) => {
              return player__set_hotbar_slot_to_item(
                item[0],
                remainderInt(item[1], 8)
              );
            });
            return new IsUpdated(i);
          } else {
            throw makeError(
              "panic",
              "modules/itemgiver",
              91,
              "",
              "panic expression evaluated"
            );
          }
        }
      }),
    ]),
    toList([
      new HotbarRender((key, state) => {
        if (state instanceof NotActive) {
          return undefined;
        } else if (state instanceof ShouldUpdate) {
          let i = state.i;
          let _pipe = key;
          return render__render_string(
            _pipe,
            100,
            100,
            "page: &b" +
              to_string$2(i + 1) +
              " &f/ &c" +
              to_string$2(map_size(items))
          );
        } else {
          let i = state.i;
          let _pipe = key;
          return render__render_string(
            _pipe,
            100,
            100,
            "page: &b" +
              to_string$2(i + 1) +
              " &f/ &c" +
              to_string$2(map_size(items))
          );
        }
      }),
    ])
  );
}

function start() {
  return update_loop__make(
    undefined,
    toList([
      new CustomCommand("ifix", (state) => {
        std__chat("/edit");
        return ((handler) => {
          return events__handle_next(new WindowOpen(handler));
        })((_) => {
          return ((handler) => {
            return events__handle_until(
              new RenderItemIntoGui((item) => {
                let $ = (() => {
                  let _pipe = item;
                  return item__name(_pipe);
                })();
                if ($ === "§aEdit Actions") {
                  return true;
                } else {
                  return false;
                }
              }),
              new RenderItemIntoGui(handler)
            );
          })((_) => {
            click(34);
            std__log("clicked");
            return state;
          });
        });
      }),
    ]),
    toList([])
  );
}

function main() {
  start$2();
  start$1();
  return start();
}

export { main };

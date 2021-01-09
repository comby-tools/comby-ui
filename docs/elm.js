
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _debois$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _debois$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _debois$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _debois$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _debois$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _debois$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _debois$elm_dom$DOM$nextSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'nextSibling', decoder);
};
var _debois$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _debois$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_debois$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_debois$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_debois$elm_dom$DOM$scrollLeft,
				_debois$elm_dom$DOM$scrollTop,
				_debois$elm_dom$DOM$offsetLeft,
				_debois$elm_dom$DOM$offsetTop));
	});
var _debois$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_debois$elm_dom$DOM$position, 0, 0),
	_debois$elm_dom$DOM$offsetWidth,
	_debois$elm_dom$DOM$offsetHeight);
var _debois$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _debois$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$animation_frame$Native_AnimationFrame = function()
{

function create()
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = requestAnimationFrame(function() {
			callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
		});

		return function() {
			cancelAnimationFrame(id);
		};
	});
}

return {
	create: create
};

}();

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$animation_frame$AnimationFrame$rAF = _elm_lang$animation_frame$Native_AnimationFrame.create(
	{ctor: '_Tuple0'});
var _elm_lang$animation_frame$AnimationFrame$subscription = _elm_lang$core$Native_Platform.leaf('AnimationFrame');
var _elm_lang$animation_frame$AnimationFrame$State = F3(
	function (a, b, c) {
		return {subs: a, request: b, oldTime: c};
	});
var _elm_lang$animation_frame$AnimationFrame$init = _elm_lang$core$Task$succeed(
	A3(
		_elm_lang$animation_frame$AnimationFrame$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing,
		0));
var _elm_lang$animation_frame$AnimationFrame$onEffects = F3(
	function (router, subs, _p0) {
		var _p1 = _p0;
		var _p5 = _p1.request;
		var _p4 = _p1.oldTime;
		var _p2 = {ctor: '_Tuple2', _0: _p5, _1: subs};
		if (_p2._0.ctor === 'Nothing') {
			if (_p2._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(
					A3(
						_elm_lang$animation_frame$AnimationFrame$State,
						{ctor: '[]'},
						_elm_lang$core$Maybe$Nothing,
						_p4));
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (time) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$animation_frame$AnimationFrame$State,
										subs,
										_elm_lang$core$Maybe$Just(pid),
										time));
							},
							_elm_lang$core$Time$now);
					},
					_elm_lang$core$Process$spawn(
						A2(
							_elm_lang$core$Task$andThen,
							_elm_lang$core$Platform$sendToSelf(router),
							_elm_lang$animation_frame$AnimationFrame$rAF)));
			}
		} else {
			if (_p2._1.ctor === '[]') {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p3) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								{ctor: '[]'},
								_elm_lang$core$Maybe$Nothing,
								_p4));
					},
					_elm_lang$core$Process$kill(_p2._0._0));
			} else {
				return _elm_lang$core$Task$succeed(
					A3(_elm_lang$animation_frame$AnimationFrame$State, subs, _p5, _p4));
			}
		}
	});
var _elm_lang$animation_frame$AnimationFrame$onSelfMsg = F3(
	function (router, newTime, _p6) {
		var _p7 = _p6;
		var _p10 = _p7.subs;
		var diff = newTime - _p7.oldTime;
		var send = function (sub) {
			var _p8 = sub;
			if (_p8.ctor === 'Time') {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(newTime));
			} else {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p8._0(diff));
			}
		};
		return A2(
			_elm_lang$core$Task$andThen,
			function (pid) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (_p9) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$animation_frame$AnimationFrame$State,
								_p10,
								_elm_lang$core$Maybe$Just(pid),
								newTime));
					},
					_elm_lang$core$Task$sequence(
						A2(_elm_lang$core$List$map, send, _p10)));
			},
			_elm_lang$core$Process$spawn(
				A2(
					_elm_lang$core$Task$andThen,
					_elm_lang$core$Platform$sendToSelf(router),
					_elm_lang$animation_frame$AnimationFrame$rAF)));
	});
var _elm_lang$animation_frame$AnimationFrame$Diff = function (a) {
	return {ctor: 'Diff', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$diffs = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Diff(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$Time = function (a) {
	return {ctor: 'Time', _0: a};
};
var _elm_lang$animation_frame$AnimationFrame$times = function (tagger) {
	return _elm_lang$animation_frame$AnimationFrame$subscription(
		_elm_lang$animation_frame$AnimationFrame$Time(tagger));
};
var _elm_lang$animation_frame$AnimationFrame$subMap = F2(
	function (func, sub) {
		var _p11 = sub;
		if (_p11.ctor === 'Time') {
			return _elm_lang$animation_frame$AnimationFrame$Time(
				function (_p12) {
					return func(
						_p11._0(_p12));
				});
		} else {
			return _elm_lang$animation_frame$AnimationFrame$Diff(
				function (_p13) {
					return func(
						_p11._0(_p13));
				});
		}
	});
_elm_lang$core$Native_Platform.effectManagers['AnimationFrame'] = {pkg: 'elm-lang/animation-frame', init: _elm_lang$animation_frame$AnimationFrame$init, onEffects: _elm_lang$animation_frame$AnimationFrame$onEffects, onSelfMsg: _elm_lang$animation_frame$AnimationFrame$onSelfMsg, tag: 'sub', subMap: _elm_lang$animation_frame$AnimationFrame$subMap};

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _elm_lang$html$Html_Keyed$node = _elm_lang$virtual_dom$VirtualDom$keyedNode;
var _elm_lang$html$Html_Keyed$ol = _elm_lang$html$Html_Keyed$node('ol');
var _elm_lang$html$Html_Keyed$ul = _elm_lang$html$Html_Keyed$node('ul');

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _elm_lang$navigation$Native_Navigation = function() {


// FAKE NAVIGATION

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}


// REAL NAVIGATION

function reloadPage(skipCache)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		document.location.reload(skipCache);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function setLocation(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			document.location.reload(false);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


// GET LOCATION

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


// DETECT IE11 PROBLEMS

function isInternetExplorer11()
{
	return window.navigator.userAgent.indexOf('Trident') !== -1;
}


return {
	go: go,
	setLocation: setLocation,
	reloadPage: reloadPage,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation,
	isInternetExplorer11: isInternetExplorer11
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$reloadPage = _elm_lang$navigation$Native_Navigation.reloadPage;
var _elm_lang$navigation$Navigation$setLocation = _elm_lang$navigation$Native_Navigation.setLocation;
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p1) {
			var _p2 = _p1;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p2._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p3 = cmd;
		switch (_p3.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p3._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p3._0));
			case 'Modify':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p3._0));
			case 'Visit':
				return _elm_lang$navigation$Navigation$setLocation(_p3._0);
			default:
				return _elm_lang$navigation$Navigation$reloadPage(_p3._0);
		}
	});
var _elm_lang$navigation$Navigation$killPopWatcher = function (popWatcher) {
	var _p4 = popWatcher;
	if (_p4.ctor === 'Normal') {
		return _elm_lang$core$Process$kill(_p4._0);
	} else {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Process$kill(_p4._0),
			_elm_lang$core$Process$kill(_p4._1));
	}
};
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, popWatcher: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$Reload = function (a) {
	return {ctor: 'Reload', _0: a};
};
var _elm_lang$navigation$Navigation$reload = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(false));
var _elm_lang$navigation$Navigation$reloadAndSkipCache = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(true));
var _elm_lang$navigation$Navigation$Visit = function (a) {
	return {ctor: 'Visit', _0: a};
};
var _elm_lang$navigation$Navigation$load = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Visit(url));
};
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p5, myCmd) {
		var _p6 = myCmd;
		switch (_p6.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p6._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p6._0);
			case 'Modify':
				return _elm_lang$navigation$Navigation$Modify(_p6._0);
			case 'Visit':
				return _elm_lang$navigation$Navigation$Visit(_p6._0);
			default:
				return _elm_lang$navigation$Navigation$Reload(_p6._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p7) {
		var _p8 = _p7;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p9) {
				return func(
					_p8._0(_p9));
			});
	});
var _elm_lang$navigation$Navigation$InternetExplorer = F2(
	function (a, b) {
		return {ctor: 'InternetExplorer', _0: a, _1: b};
	});
var _elm_lang$navigation$Navigation$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _elm_lang$navigation$Navigation$spawnPopWatcher = function (router) {
	var reportLocation = function (_p10) {
		return A2(
			_elm_lang$core$Platform$sendToSelf,
			router,
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
	};
	return _elm_lang$navigation$Native_Navigation.isInternetExplorer11(
		{ctor: '_Tuple0'}) ? A3(
		_elm_lang$core$Task$map2,
		_elm_lang$navigation$Navigation$InternetExplorer,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)),
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'hashchange', _elm_lang$core$Json_Decode$value, reportLocation))) : A2(
		_elm_lang$core$Task$map,
		_elm_lang$navigation$Navigation$Normal,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)));
};
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p11) {
		var _p12 = _p11;
		var _p15 = _p12.popWatcher;
		var stepState = function () {
			var _p13 = {ctor: '_Tuple2', _0: subs, _1: _p15};
			_v6_2:
			do {
				if (_p13._0.ctor === '[]') {
					if (_p13._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$navigation$Navigation$killPopWatcher(_p13._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v6_2;
					}
				} else {
					if (_p13._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p14) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p14));
							},
							_elm_lang$navigation$Navigation$spawnPopWatcher(router));
					} else {
						break _v6_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p15));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

var _rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption = function (size) {
	var _p0 = size;
	switch (_p0.ctor) {
		case 'XS':
			return _elm_lang$core$Maybe$Nothing;
		case 'SM':
			return _elm_lang$core$Maybe$Just('sm');
		case 'MD':
			return _elm_lang$core$Maybe$Just('md');
		case 'LG':
			return _elm_lang$core$Maybe$Just('lg');
		default:
			return _elm_lang$core$Maybe$Just('xl');
	}
};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$horizontalAlignOption = function (align) {
	var _p1 = align;
	switch (_p1.ctor) {
		case 'Left':
			return 'start';
		case 'Center':
			return 'center';
		case 'Right':
			return 'end';
		case 'Around':
			return 'around';
		default:
			return 'between';
	}
};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$hAlignClass = function (_p2) {
	var _p3 = _p2;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'justify-content-',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], v, '-');
						},
						_rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption(_p3.screenSize))),
				_rundis$elm_bootstrap$Bootstrap_General_Internal$horizontalAlignOption(_p3.align))));
};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$HAlign = F2(
	function (a, b) {
		return {screenSize: a, align: b};
	});
var _rundis$elm_bootstrap$Bootstrap_General_Internal$Between = {ctor: 'Between'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$Around = {ctor: 'Around'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$Right = {ctor: 'Right'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$Center = {ctor: 'Center'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$Left = {ctor: 'Left'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$XL = {ctor: 'XL'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$LG = {ctor: 'LG'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$MD = {ctor: 'MD'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$SM = {ctor: 'SM'};
var _rundis$elm_bootstrap$Bootstrap_General_Internal$XS = {ctor: 'XS'};

var _rundis$elm_bootstrap$Bootstrap_Internal_Role$toClass = F2(
	function (prefix, role) {
		return _elm_lang$html$Html_Attributes$class(
			A2(
				_elm_lang$core$Basics_ops['++'],
				prefix,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'-',
					function () {
						var _p0 = role;
						switch (_p0.ctor) {
							case 'Primary':
								return 'primary';
							case 'Secondary':
								return 'secondary';
							case 'Success':
								return 'success';
							case 'Info':
								return 'info';
							case 'Warning':
								return 'warning';
							case 'Danger':
								return 'danger';
							case 'Light':
								return 'light';
							default:
								return 'dark';
						}
					}())));
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Dark = {ctor: 'Dark'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Light = {ctor: 'Light'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Secondary = {ctor: 'Secondary'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Role$Primary = {ctor: 'Primary'};

var _rundis$elm_bootstrap$Bootstrap_Internal_Text$textColorClass = function (color) {
	var _p0 = color;
	if (_p0.ctor === 'White') {
		return _elm_lang$html$Html_Attributes$class('text-white');
	} else {
		return A2(_rundis$elm_bootstrap$Bootstrap_Internal_Role$toClass, 'text', _p0._0);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignDirOption = function (dir) {
	var _p1 = dir;
	switch (_p1.ctor) {
		case 'Center':
			return 'center';
		case 'Left':
			return 'left';
		default:
			return 'right';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignClass = function (_p2) {
	var _p3 = _p2;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'text',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'-',
					A2(
						_elm_lang$core$Maybe$map,
						function (s) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'-',
								A2(_elm_lang$core$Basics_ops['++'], s, '-'));
						},
						_rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption(_p3.size))),
				_rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignDirOption(_p3.dir))));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$HAlign = F2(
	function (a, b) {
		return {dir: a, size: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Right = {ctor: 'Right'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Center = {ctor: 'Center'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Left = {ctor: 'Left'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$White = {ctor: 'White'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role = function (a) {
	return {ctor: 'Role', _0: a};
};

var _rundis$elm_bootstrap$Bootstrap_Text$dark = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Dark);
var _rundis$elm_bootstrap$Bootstrap_Text$light = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Light);
var _rundis$elm_bootstrap$Bootstrap_Text$danger = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Danger);
var _rundis$elm_bootstrap$Bootstrap_Text$warning = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Warning);
var _rundis$elm_bootstrap$Bootstrap_Text$info = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Info);
var _rundis$elm_bootstrap$Bootstrap_Text$success = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Success);
var _rundis$elm_bootstrap$Bootstrap_Text$secondary = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Secondary);
var _rundis$elm_bootstrap$Bootstrap_Text$primary = _rundis$elm_bootstrap$Bootstrap_Internal_Text$Role(_rundis$elm_bootstrap$Bootstrap_Internal_Role$Primary);
var _rundis$elm_bootstrap$Bootstrap_Text$white = _rundis$elm_bootstrap$Bootstrap_Internal_Text$White;
var _rundis$elm_bootstrap$Bootstrap_Text$alignXl = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_General_Internal$XL};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignXlRight = _rundis$elm_bootstrap$Bootstrap_Text$alignXl(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXlCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignXl(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXlLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignXl(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignLg = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_General_Internal$LG};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignLgRight = _rundis$elm_bootstrap$Bootstrap_Text$alignLg(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignLgCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignLg(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignLgLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignLg(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignMd = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_General_Internal$MD};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignMdRight = _rundis$elm_bootstrap$Bootstrap_Text$alignMd(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignMdCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignMd(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignMdLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignMd(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignSm = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_General_Internal$SM};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignSmRight = _rundis$elm_bootstrap$Bootstrap_Text$alignSm(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignSmCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignSm(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignSmLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignSm(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXs = function (dir) {
	return {dir: dir, size: _rundis$elm_bootstrap$Bootstrap_General_Internal$XS};
};
var _rundis$elm_bootstrap$Bootstrap_Text$alignXsRight = _rundis$elm_bootstrap$Bootstrap_Text$alignXs(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Right);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXsCenter = _rundis$elm_bootstrap$Bootstrap_Text$alignXs(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Center);
var _rundis$elm_bootstrap$Bootstrap_Text$alignXsLeft = _rundis$elm_bootstrap$Bootstrap_Text$alignXs(_rundis$elm_bootstrap$Bootstrap_Internal_Text$Left);

var _rundis$elm_bootstrap$Bootstrap_Badge$roleOption = function (role) {
	var _p0 = role;
	switch (_p0.ctor) {
		case 'Primary':
			return 'badge-primary';
		case 'Secondary':
			return 'badge-secondary';
		case 'Success':
			return 'badge-success';
		case 'Info':
			return 'badge-info';
		case 'Warning':
			return 'badge-warning';
		case 'Danger':
			return 'badge-danger';
		case 'Light':
			return 'badge-light';
		default:
			return 'badge-dark';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeClass = function (option) {
	return _elm_lang$html$Html_Attributes$class(
		function () {
			var _p1 = option;
			if (_p1.ctor === 'Pill') {
				return 'badge-pill';
			} else {
				return _rundis$elm_bootstrap$Bootstrap_Badge$roleOption(_p1._0);
			}
		}());
};
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeAttributes = function (options) {
	return {
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('badge'),
		_1: A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Badge$badgeClass, options)
	};
};
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal = F3(
	function (options, attributes, children) {
		return A2(
			_elm_lang$html$Html$span,
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Badge$badgeAttributes(options),
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$Dark = {ctor: 'Dark'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Light = {ctor: 'Light'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Secondary = {ctor: 'Secondary'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Primary = {ctor: 'Primary'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Pill = {ctor: 'Pill'};
var _rundis$elm_bootstrap$Bootstrap_Badge$Roled = function (a) {
	return {ctor: 'Roled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Badge$badgePrimary = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Primary),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeSecondary = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Secondary),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeSuccess = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Success),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeInfo = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Info),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeWarning = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Warning),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeDanger = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Danger),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeLight = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Light),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$badgeDark = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Dark),
		_1: {ctor: '[]'}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillPrimary = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Primary),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillSecondary = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Secondary),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillSuccess = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Success),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillInfo = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Info),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillWarning = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Warning),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillDanger = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Danger),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillLight = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Light),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Badge$pillDark = _rundis$elm_bootstrap$Bootstrap_Badge$badgeInternal(
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Badge$Roled(_rundis$elm_bootstrap$Bootstrap_Badge$Dark),
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Badge$Pill,
			_1: {ctor: '[]'}
		}
	});

var _rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass = function (role) {
	var _p0 = role;
	switch (_p0.ctor) {
		case 'Primary':
			return 'primary';
		case 'Secondary':
			return 'secondary';
		case 'Success':
			return 'success';
		case 'Info':
			return 'info';
		case 'Warning':
			return 'warning';
		case 'Danger':
			return 'danger';
		case 'Dark':
			return 'dark';
		case 'Light':
			return 'light';
		default:
			return 'link';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$applyModifier = F2(
	function (modifier, options) {
		var _p1 = modifier;
		switch (_p1.ctor) {
			case 'Size':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						size: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Coloring':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						coloring: _elm_lang$core$Maybe$Just(_p1._0)
					});
			case 'Block':
				return _elm_lang$core$Native_Utils.update(
					options,
					{block: true});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: _p1._0});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p1._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$defaultOptions = {
	coloring: _elm_lang$core$Maybe$Nothing,
	block: false,
	disabled: false,
	size: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Internal_Button$applyModifier, _rundis$elm_bootstrap$Bootstrap_Internal_Button$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'btn', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'btn-block', _1: options.block},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'disabled', _1: options.disabled},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			function () {
				var _p2 = A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption, options.size);
				if (_p2.ctor === 'Just') {
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$Basics_ops['++'], 'btn-', _p2._0)),
						_1: {ctor: '[]'}
					};
				} else {
					return {ctor: '[]'};
				}
			}(),
			A2(
				_elm_lang$core$Basics_ops['++'],
				function () {
					var _p3 = options.coloring;
					if (_p3.ctor === 'Just') {
						if (_p3._0.ctor === 'Roled') {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'btn-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						} else {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'btn-outline-',
										_rundis$elm_bootstrap$Bootstrap_Internal_Button$roleClass(_p3._0._0))),
								_1: {ctor: '[]'}
							};
						}
					} else {
						return {ctor: '[]'};
					}
				}(),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Options = F5(
	function (a, b, c, d, e) {
		return {coloring: a, block: b, disabled: c, size: d, attributes: e};
	});
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Disabled = function (a) {
	return {ctor: 'Disabled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Block = {ctor: 'Block'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring = function (a) {
	return {ctor: 'Coloring', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined = function (a) {
	return {ctor: 'Outlined', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled = function (a) {
	return {ctor: 'Roled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Link = {ctor: 'Link'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Light = {ctor: 'Light'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Dark = {ctor: 'Dark'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning = {ctor: 'Warning'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Info = {ctor: 'Info'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Success = {ctor: 'Success'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary = {ctor: 'Secondary'};
var _rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary = {ctor: 'Primary'};

var _rundis$elm_bootstrap$Bootstrap_Button$disabled = function (disabled) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Button$Disabled(disabled);
};
var _rundis$elm_bootstrap$Bootstrap_Button$block = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Block;
var _rundis$elm_bootstrap$Bootstrap_Button$outlineDark = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Dark));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineLight = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Light));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineDanger = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineWarning = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineInfo = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Info));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineSuccess = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Success));
var _rundis$elm_bootstrap$Bootstrap_Button$outlineSecondary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary));
var _rundis$elm_bootstrap$Bootstrap_Button$outlinePrimary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Outlined(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary));
var _rundis$elm_bootstrap$Bootstrap_Button$roleLink = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Link));
var _rundis$elm_bootstrap$Bootstrap_Button$dark = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Dark));
var _rundis$elm_bootstrap$Bootstrap_Button$light = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Light));
var _rundis$elm_bootstrap$Bootstrap_Button$danger = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Danger));
var _rundis$elm_bootstrap$Bootstrap_Button$warning = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Warning));
var _rundis$elm_bootstrap$Bootstrap_Button$info = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Info));
var _rundis$elm_bootstrap$Bootstrap_Button$success = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Success));
var _rundis$elm_bootstrap$Bootstrap_Button$secondary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Secondary));
var _rundis$elm_bootstrap$Bootstrap_Button$primary = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Coloring(
	_rundis$elm_bootstrap$Bootstrap_Internal_Button$Roled(_rundis$elm_bootstrap$Bootstrap_Internal_Button$Primary));
var _rundis$elm_bootstrap$Bootstrap_Button$large = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size(_rundis$elm_bootstrap$Bootstrap_General_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_Button$small = _rundis$elm_bootstrap$Bootstrap_Internal_Button$Size(_rundis$elm_bootstrap$Bootstrap_General_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_Button$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Internal_Button$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Button$onClick = function (message) {
	var defaultOptions = _elm_lang$html$Html_Events$defaultOptions;
	return _rundis$elm_bootstrap$Bootstrap_Button$attrs(
		{
			ctor: '::',
			_0: A3(
				_elm_lang$html$Html_Events$onWithOptions,
				'click',
				_elm_lang$core$Native_Utils.update(
					defaultOptions,
					{preventDefault: true}),
				_elm_lang$core$Json_Decode$succeed(message)),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Button$checkboxButton = F3(
	function (checked, options, children) {
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'active', _1: checked},
						_1: {ctor: '[]'}
					}),
				_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$checked(checked),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$autocomplete(false),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Button$radioButton = F3(
	function (checked, options, children) {
		var hideRadio = A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'button');
		return A2(
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'active', _1: checked},
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: hideRadio,
					_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('radio'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$checked(checked),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$autocomplete(false),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: children
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Button$linkButton = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'button'),
				_1: _rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options)
			},
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Button$button = F2(
	function (options, children) {
		return A2(
			_elm_lang$html$Html$button,
			_rundis$elm_bootstrap$Bootstrap_Internal_Button$buttonAttributes(options),
			children);
	});

var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$defaultOptions = {
	size: _elm_lang$core$Maybe$Nothing,
	vertical: false,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$applyModifier = F2(
	function (modifier, options) {
		var _p0 = modifier;
		switch (_p0.ctor) {
			case 'Size':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						size: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Vertical':
				return _elm_lang$core$Native_Utils.update(
					options,
					{vertical: true});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p0._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes = F2(
	function (toggle, modifiers) {
		var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_ButtonGroup$applyModifier, _rundis$elm_bootstrap$Bootstrap_ButtonGroup$defaultOptions, modifiers);
		return A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'group'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$classList(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'btn-group', _1: true},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'btn-group-toggle', _1: toggle},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'btn-group-vertical', _1: options.vertical},
									_1: {ctor: '[]'}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$html$Html_Attributes$attribute, 'data-toggle', 'buttons'),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				function () {
					var _p1 = A2(_elm_lang$core$Maybe$andThen, _rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption, options.size);
					if (_p1.ctor === 'Just') {
						return {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class(
								A2(_elm_lang$core$Basics_ops['++'], 'btn-group-', _p1._0)),
							_1: {ctor: '[]'}
						};
					} else {
						return {ctor: '[]'};
					}
				}(),
				options.attributes));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup = function (_p2) {
	var _p3 = _p2;
	return _p3._0;
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$toolbar = F2(
	function (attributes, items) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'toolbar'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('btn-toolbar'),
						_1: {ctor: '[]'}
					}
				},
				attributes),
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Options = F3(
	function (a, b, c) {
		return {size: a, vertical: b, attributes: c};
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Vertical = {ctor: 'Vertical'};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$vertical = _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Vertical;
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Size = function (a) {
	return {ctor: 'Size', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small = _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Size(_rundis$elm_bootstrap$Bootstrap_General_Internal$SM);
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$large = _rundis$elm_bootstrap$Bootstrap_ButtonGroup$Size(_rundis$elm_bootstrap$Bootstrap_General_Internal$LG);
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem = function (a) {
	return {ctor: 'GroupItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes, false, options),
				A2(
					_elm_lang$core$List$map,
					function (_p4) {
						var _p5 = _p4;
						return _p5._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButtonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes, false, options),
				A2(
					_elm_lang$core$List$map,
					function (_p6) {
						var _p7 = _p6;
						return _p7._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButtonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButtonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes, true, options),
				A2(
					_elm_lang$core$List$map,
					function (_p8) {
						var _p9 = _p8;
						return _p9._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButtonGroupItem = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$GroupItem(
			A2(
				_elm_lang$html$Html$div,
				A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$groupAttributes, true, options),
				A2(
					_elm_lang$core$List$map,
					function (_p10) {
						var _p11 = _p10;
						return _p11._0;
					},
					items)));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButtonGroup = F2(
	function (options, items) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$renderGroup(
			A2(_rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButtonGroupItem, options, items));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$ButtonItem = function (a) {
	return {ctor: 'ButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$button = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$ButtonItem(
			A2(_rundis$elm_bootstrap$Bootstrap_Button$button, options, children));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$LinkButtonItem = function (a) {
	return {ctor: 'LinkButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$linkButton = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$LinkButtonItem(
			A2(_rundis$elm_bootstrap$Bootstrap_Button$linkButton, options, children));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$RadioButtonItem = function (a) {
	return {ctor: 'RadioButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButton = F3(
	function (checked, options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$RadioButtonItem(
			A3(_rundis$elm_bootstrap$Bootstrap_Button$radioButton, checked, options, children));
	});
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$CheckboxButtonItem = function (a) {
	return {ctor: 'CheckboxButtonItem', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_ButtonGroup$checkboxButton = F3(
	function (checked, options, children) {
		return _rundis$elm_bootstrap$Bootstrap_ButtonGroup$CheckboxButtonItem(
			A3(_rundis$elm_bootstrap$Bootstrap_Button$checkboxButton, checked, options, children));
	});

var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$verticalAlignOption = function (align) {
	var _p0 = align;
	switch (_p0.ctor) {
		case 'Top':
			return 'start';
		case 'Middle':
			return 'center';
		default:
			return 'end';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$orderColOption = function (size) {
	var _p1 = size;
	switch (_p1.ctor) {
		case 'OrderFirst':
			return 'first';
		case 'Order1':
			return '1';
		case 'Order2':
			return '2';
		case 'Order3':
			return '3';
		case 'Order4':
			return '4';
		case 'Order5':
			return '5';
		case 'Order6':
			return '6';
		case 'Order7':
			return '7';
		case 'Order8':
			return '8';
		case 'Order9':
			return '9';
		case 'Order10':
			return '10';
		case 'Order11':
			return '11';
		case 'Order12':
			return '12';
		default:
			return 'last';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption = function (size) {
	var _p2 = size;
	switch (_p2.ctor) {
		case 'Move0':
			return '0';
		case 'Move1':
			return '1';
		case 'Move2':
			return '2';
		case 'Move3':
			return '3';
		case 'Move4':
			return '4';
		case 'Move5':
			return '5';
		case 'Move6':
			return '6';
		case 'Move7':
			return '7';
		case 'Move8':
			return '8';
		case 'Move9':
			return '9';
		case 'Move10':
			return '10';
		case 'Move11':
			return '11';
		default:
			return '12';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetCountOption = function (size) {
	var _p3 = size;
	switch (_p3.ctor) {
		case 'Offset0':
			return '0';
		case 'Offset1':
			return '1';
		case 'Offset2':
			return '2';
		case 'Offset3':
			return '3';
		case 'Offset4':
			return '4';
		case 'Offset5':
			return '5';
		case 'Offset6':
			return '6';
		case 'Offset7':
			return '7';
		case 'Offset8':
			return '8';
		case 'Offset9':
			return '9';
		case 'Offset10':
			return '10';
		default:
			return '11';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$columnCountOption = function (size) {
	var _p4 = size;
	switch (_p4.ctor) {
		case 'Col':
			return _elm_lang$core$Maybe$Nothing;
		case 'Col1':
			return _elm_lang$core$Maybe$Just('1');
		case 'Col2':
			return _elm_lang$core$Maybe$Just('2');
		case 'Col3':
			return _elm_lang$core$Maybe$Just('3');
		case 'Col4':
			return _elm_lang$core$Maybe$Just('4');
		case 'Col5':
			return _elm_lang$core$Maybe$Just('5');
		case 'Col6':
			return _elm_lang$core$Maybe$Just('6');
		case 'Col7':
			return _elm_lang$core$Maybe$Just('7');
		case 'Col8':
			return _elm_lang$core$Maybe$Just('8');
		case 'Col9':
			return _elm_lang$core$Maybe$Just('9');
		case 'Col10':
			return _elm_lang$core$Maybe$Just('10');
		case 'Col11':
			return _elm_lang$core$Maybe$Just('11');
		case 'Col12':
			return _elm_lang$core$Maybe$Just('12');
		default:
			return _elm_lang$core$Maybe$Just('auto');
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString = function (screenSize) {
	var _p5 = _rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption(screenSize);
	if (_p5.ctor === 'Just') {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'-',
			A2(_elm_lang$core$Basics_ops['++'], _p5._0, '-'));
	} else {
		return '-';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignsToAttributes = function (aligns) {
	var align = function (a) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_General_Internal$hAlignClass, a);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, align, aligns));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignClass = F2(
	function (prefix, _p6) {
		var _p7 = _p6;
		return _elm_lang$html$Html_Attributes$class(
			A2(
				_elm_lang$core$Basics_ops['++'],
				prefix,
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$Maybe$withDefault,
						'',
						A2(
							_elm_lang$core$Maybe$map,
							function (v) {
								return A2(_elm_lang$core$Basics_ops['++'], v, '-');
							},
							_rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption(_p7.screenSize))),
					_rundis$elm_bootstrap$Bootstrap_Grid_Internal$verticalAlignOption(_p7.align))));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes = F2(
	function (prefix, aligns) {
		var align = function (a) {
			return A2(
				_elm_lang$core$Maybe$map,
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignClass(prefix),
				a);
		};
		return A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			A2(_elm_lang$core$List$map, align, aligns));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$orderToAttributes = function (orders) {
	var order = function (m) {
		var _p8 = m;
		if (_p8.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'order',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p8._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$orderColOption(_p8._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, order, orders));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pushesToAttributes = function (pushes) {
	var push = function (m) {
		var _p9 = m;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'push',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p9._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption(_p9._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, push, pushes));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pullsToAttributes = function (pulls) {
	var pull = function (m) {
		var _p10 = m;
		if (_p10.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				_elm_lang$html$Html_Attributes$class(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'pull',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p10._0.screenSize),
							_rundis$elm_bootstrap$Bootstrap_Grid_Internal$moveCountOption(_p10._0.moveCount)))));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, pull, pulls));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetClass = function (_p11) {
	var _p12 = _p11;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'offset',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$screenSizeToPartialString(_p12.screenSize),
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetCountOption(_p12.offsetCount))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetsToAttributes = function (offsets) {
	var offset = function (m) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetClass, m);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, offset, offsets));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthClass = function (_p13) {
	var _p14 = _p13;
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'col',
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], '-', v);
						},
						_rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption(_p14.screenSize))),
				A2(
					_elm_lang$core$Maybe$withDefault,
					'',
					A2(
						_elm_lang$core$Maybe$map,
						function (v) {
							return A2(_elm_lang$core$Basics_ops['++'], '-', v);
						},
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$columnCountOption(_p14.columnCount))))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthsToAttributes = function (widths) {
	var width = function (w) {
		return A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthClass, w);
	};
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$core$Basics$identity,
		A2(_elm_lang$core$List$map, width, widths));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultRowOptions = {
	attributes: {ctor: '[]'},
	vAlignXs: _elm_lang$core$Maybe$Nothing,
	vAlignSm: _elm_lang$core$Maybe$Nothing,
	vAlignMd: _elm_lang$core$Maybe$Nothing,
	vAlignLg: _elm_lang$core$Maybe$Nothing,
	vAlignXl: _elm_lang$core$Maybe$Nothing,
	hAlignXs: _elm_lang$core$Maybe$Nothing,
	hAlignSm: _elm_lang$core$Maybe$Nothing,
	hAlignMd: _elm_lang$core$Maybe$Nothing,
	hAlignLg: _elm_lang$core$Maybe$Nothing,
	hAlignXl: _elm_lang$core$Maybe$Nothing
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultColOptions = {
	attributes: {ctor: '[]'},
	textAlign: _elm_lang$core$Maybe$Nothing,
	widthXs: _elm_lang$core$Maybe$Nothing,
	widthSm: _elm_lang$core$Maybe$Nothing,
	widthMd: _elm_lang$core$Maybe$Nothing,
	widthLg: _elm_lang$core$Maybe$Nothing,
	widthXl: _elm_lang$core$Maybe$Nothing,
	offsetXs: _elm_lang$core$Maybe$Nothing,
	offsetSm: _elm_lang$core$Maybe$Nothing,
	offsetMd: _elm_lang$core$Maybe$Nothing,
	offsetLg: _elm_lang$core$Maybe$Nothing,
	offsetXl: _elm_lang$core$Maybe$Nothing,
	pullXs: _elm_lang$core$Maybe$Nothing,
	pullSm: _elm_lang$core$Maybe$Nothing,
	pullMd: _elm_lang$core$Maybe$Nothing,
	pullLg: _elm_lang$core$Maybe$Nothing,
	pullXl: _elm_lang$core$Maybe$Nothing,
	pushXs: _elm_lang$core$Maybe$Nothing,
	pushSm: _elm_lang$core$Maybe$Nothing,
	pushMd: _elm_lang$core$Maybe$Nothing,
	pushLg: _elm_lang$core$Maybe$Nothing,
	pushXl: _elm_lang$core$Maybe$Nothing,
	orderXs: _elm_lang$core$Maybe$Nothing,
	orderSm: _elm_lang$core$Maybe$Nothing,
	orderMd: _elm_lang$core$Maybe$Nothing,
	orderLg: _elm_lang$core$Maybe$Nothing,
	orderXl: _elm_lang$core$Maybe$Nothing,
	alignXs: _elm_lang$core$Maybe$Nothing,
	alignSm: _elm_lang$core$Maybe$Nothing,
	alignMd: _elm_lang$core$Maybe$Nothing,
	alignLg: _elm_lang$core$Maybe$Nothing,
	alignXl: _elm_lang$core$Maybe$Nothing
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowHAlign = F2(
	function (align, options) {
		var _p15 = align.screenSize;
		switch (_p15.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						hAlignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowVAlign = F2(
	function (align, options) {
		var _p16 = align.screenSize;
		switch (_p16.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						vAlignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowOption = F2(
	function (modifier, options) {
		var _p17 = modifier;
		switch (_p17.ctor) {
			case 'RowAttrs':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p17._0)
					});
			case 'RowVAlign':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowVAlign, _p17._0, options);
			default:
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowHAlign, _p17._0, options);
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColAlign = F2(
	function (align, options) {
		var _p18 = align.screenSize;
		switch (_p18.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignXs: _elm_lang$core$Maybe$Just(align)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignSm: _elm_lang$core$Maybe$Just(align)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignMd: _elm_lang$core$Maybe$Just(align)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignLg: _elm_lang$core$Maybe$Just(align)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						alignXl: _elm_lang$core$Maybe$Just(align)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOrder = F2(
	function (order, options) {
		var _p19 = order.screenSize;
		switch (_p19.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						orderXs: _elm_lang$core$Maybe$Just(order)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						orderSm: _elm_lang$core$Maybe$Just(order)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						orderMd: _elm_lang$core$Maybe$Just(order)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						orderLg: _elm_lang$core$Maybe$Just(order)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						orderXl: _elm_lang$core$Maybe$Just(order)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPush = F2(
	function (push, options) {
		var _p20 = push.screenSize;
		switch (_p20.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushXs: _elm_lang$core$Maybe$Just(push)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushSm: _elm_lang$core$Maybe$Just(push)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushMd: _elm_lang$core$Maybe$Just(push)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushLg: _elm_lang$core$Maybe$Just(push)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pushXl: _elm_lang$core$Maybe$Just(push)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPull = F2(
	function (pull, options) {
		var _p21 = pull.screenSize;
		switch (_p21.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullXs: _elm_lang$core$Maybe$Just(pull)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullSm: _elm_lang$core$Maybe$Just(pull)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullMd: _elm_lang$core$Maybe$Just(pull)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullLg: _elm_lang$core$Maybe$Just(pull)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						pullXl: _elm_lang$core$Maybe$Just(pull)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOffset = F2(
	function (offset, options) {
		var _p22 = offset.screenSize;
		switch (_p22.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetXs: _elm_lang$core$Maybe$Just(offset)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetSm: _elm_lang$core$Maybe$Just(offset)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetMd: _elm_lang$core$Maybe$Just(offset)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetLg: _elm_lang$core$Maybe$Just(offset)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						offsetXl: _elm_lang$core$Maybe$Just(offset)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColWidth = F2(
	function (width, options) {
		var _p23 = width.screenSize;
		switch (_p23.ctor) {
			case 'XS':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthXs: _elm_lang$core$Maybe$Just(width)
					});
			case 'SM':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthSm: _elm_lang$core$Maybe$Just(width)
					});
			case 'MD':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthMd: _elm_lang$core$Maybe$Just(width)
					});
			case 'LG':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthLg: _elm_lang$core$Maybe$Just(width)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						widthXl: _elm_lang$core$Maybe$Just(width)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOption = F2(
	function (modifier, options) {
		var _p24 = modifier;
		switch (_p24.ctor) {
			case 'ColAttrs':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p24._0)
					});
			case 'ColWidth':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColWidth, _p24._0, options);
			case 'ColOffset':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOffset, _p24._0, options);
			case 'ColPull':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPull, _p24._0, options);
			case 'ColPush':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColPush, _p24._0, options);
			case 'ColOrder':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOrder, _p24._0, options);
			case 'ColAlign':
				return A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColAlign, _p24._0, options);
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						textAlign: _elm_lang$core$Maybe$Just(_p24._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyRowOption, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultRowOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('row'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes,
				'align-items-',
				{
					ctor: '::',
					_0: options.vAlignXs,
					_1: {
						ctor: '::',
						_0: options.vAlignSm,
						_1: {
							ctor: '::',
							_0: options.vAlignMd,
							_1: {
								ctor: '::',
								_0: options.vAlignLg,
								_1: {
									ctor: '::',
									_0: options.vAlignXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$hAlignsToAttributes(
					{
						ctor: '::',
						_0: options.hAlignXs,
						_1: {
							ctor: '::',
							_0: options.hAlignSm,
							_1: {
								ctor: '::',
								_0: options.hAlignMd,
								_1: {
									ctor: '::',
									_0: options.hAlignLg,
									_1: {
										ctor: '::',
										_0: options.hAlignXl,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				options.attributes)));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width = F2(
	function (a, b) {
		return {screenSize: a, columnCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset = F2(
	function (a, b) {
		return {screenSize: a, offsetCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Pull = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Push = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order = F2(
	function (a, b) {
		return {screenSize: a, moveCount: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign = F2(
	function (a, b) {
		return {screenSize: a, align: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOptions = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return function (w) {
																							return function (x) {
																								return function (y) {
																									return function (z) {
																										return function (_1) {
																											return function (_2) {
																												return function (_3) {
																													return function (_4) {
																														return function (_5) {
																															return function (_6) {
																																return {attributes: a, textAlign: b, widthXs: c, widthSm: d, widthMd: e, widthLg: f, widthXl: g, offsetXs: h, offsetSm: i, offsetMd: j, offsetLg: k, offsetXl: l, pullXs: m, pullSm: n, pullMd: o, pullLg: p, pullXl: q, pushXs: r, pushSm: s, pushMd: t, pushLg: u, pushXl: v, orderXs: w, orderSm: x, orderMd: y, orderLg: z, orderXl: _1, alignXs: _2, alignSm: _3, alignMd: _4, alignLg: _5, alignXl: _6};
																															};
																														};
																													};
																												};
																											};
																										};
																									};
																								};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowOptions = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {attributes: a, vAlignXs: b, vAlignSm: c, vAlignMd: d, vAlignLg: e, vAlignXl: f, hAlignXs: g, hAlignSm: h, hAlignMd: i, hAlignLg: j, hAlignXl: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$TextAlign = function (a) {
	return {ctor: 'TextAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAttrs = function (a) {
	return {ctor: 'ColAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAlign = function (a) {
	return {ctor: 'ColAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOrder = function (a) {
	return {ctor: 'ColOrder', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$order = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOrder(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPush = function (a) {
	return {ctor: 'ColPush', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$push = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPush(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Push, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPull = function (a) {
	return {ctor: 'ColPull', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColPull(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Pull, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOffset = function (a) {
	return {ctor: 'ColOffset', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColOffset(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColWidth = function (a) {
	return {ctor: 'ColWidth', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$width = F2(
	function (size, count) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColWidth(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width, size, count));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowAttrs = function (a) {
	return {ctor: 'RowAttrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowHAlign = function (a) {
	return {ctor: 'RowHAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowHAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_General_Internal$HAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowVAlign = function (a) {
	return {ctor: 'RowVAlign', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign = F2(
	function (size, align) {
		return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowVAlign(
			A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$VAlign, size, align));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto = {ctor: 'ColAuto'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12 = {ctor: 'Col12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11 = {ctor: 'Col11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10 = {ctor: 'Col10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9 = {ctor: 'Col9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8 = {ctor: 'Col8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7 = {ctor: 'Col7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6 = {ctor: 'Col6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5 = {ctor: 'Col5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4 = {ctor: 'Col4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3 = {ctor: 'Col3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2 = {ctor: 'Col2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1 = {ctor: 'Col1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col = {ctor: 'Col'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$applyColOption, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$defaultColOptions, modifiers);
	var shouldAddDefaultXs = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: options.widthXs,
					_1: {
						ctor: '::',
						_0: options.widthSm,
						_1: {
							ctor: '::',
							_0: options.widthMd,
							_1: {
								ctor: '::',
								_0: options.widthLg,
								_1: {
									ctor: '::',
									_0: options.widthXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				})),
		0);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colWidthsToAttributes(
			{
				ctor: '::',
				_0: shouldAddDefaultXs ? _elm_lang$core$Maybe$Just(
					A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$Width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col)) : options.widthXs,
				_1: {
					ctor: '::',
					_0: options.widthSm,
					_1: {
						ctor: '::',
						_0: options.widthMd,
						_1: {
							ctor: '::',
							_0: options.widthLg,
							_1: {
								ctor: '::',
								_0: options.widthXl,
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}),
		A2(
			_elm_lang$core$Basics_ops['++'],
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offsetsToAttributes(
				{
					ctor: '::',
					_0: options.offsetXs,
					_1: {
						ctor: '::',
						_0: options.offsetSm,
						_1: {
							ctor: '::',
							_0: options.offsetMd,
							_1: {
								ctor: '::',
								_0: options.offsetLg,
								_1: {
									ctor: '::',
									_0: options.offsetXl,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			A2(
				_elm_lang$core$Basics_ops['++'],
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pullsToAttributes(
					{
						ctor: '::',
						_0: options.pullXs,
						_1: {
							ctor: '::',
							_0: options.pullSm,
							_1: {
								ctor: '::',
								_0: options.pullMd,
								_1: {
									ctor: '::',
									_0: options.pullLg,
									_1: {
										ctor: '::',
										_0: options.pullXl,
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				A2(
					_elm_lang$core$Basics_ops['++'],
					_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pushesToAttributes(
						{
							ctor: '::',
							_0: options.pushXs,
							_1: {
								ctor: '::',
								_0: options.pushSm,
								_1: {
									ctor: '::',
									_0: options.pushMd,
									_1: {
										ctor: '::',
										_0: options.pushLg,
										_1: {
											ctor: '::',
											_0: options.pushXl,
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					A2(
						_elm_lang$core$Basics_ops['++'],
						_rundis$elm_bootstrap$Bootstrap_Grid_Internal$orderToAttributes(
							{
								ctor: '::',
								_0: options.orderXs,
								_1: {
									ctor: '::',
									_0: options.orderSm,
									_1: {
										ctor: '::',
										_0: options.orderMd,
										_1: {
											ctor: '::',
											_0: options.orderLg,
											_1: {
												ctor: '::',
												_0: options.orderXl,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}),
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(
								_rundis$elm_bootstrap$Bootstrap_Grid_Internal$vAlignsToAttributes,
								'align-self-',
								{
									ctor: '::',
									_0: options.alignXs,
									_1: {
										ctor: '::',
										_0: options.alignSm,
										_1: {
											ctor: '::',
											_0: options.alignMd,
											_1: {
												ctor: '::',
												_0: options.alignLg,
												_1: {
													ctor: '::',
													_0: options.alignXl,
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}),
							function () {
								var _p25 = options.textAlign;
								if (_p25.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Internal_Text$textAlignClass(_p25._0),
										_1: {ctor: '[]'}
									};
								} else {
									return A2(
										_elm_lang$core$Basics_ops['++'],
										{ctor: '[]'},
										options.attributes);
								}
							}()))))));
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11 = {ctor: 'Offset11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10 = {ctor: 'Offset10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9 = {ctor: 'Offset9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8 = {ctor: 'Offset8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7 = {ctor: 'Offset7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6 = {ctor: 'Offset6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5 = {ctor: 'Offset5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4 = {ctor: 'Offset4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3 = {ctor: 'Offset3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2 = {ctor: 'Offset2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1 = {ctor: 'Offset1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0 = {ctor: 'Offset0'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12 = {ctor: 'Move12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11 = {ctor: 'Move11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10 = {ctor: 'Move10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9 = {ctor: 'Move9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8 = {ctor: 'Move8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7 = {ctor: 'Move7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6 = {ctor: 'Move6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5 = {ctor: 'Move5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4 = {ctor: 'Move4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3 = {ctor: 'Move3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2 = {ctor: 'Move2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1 = {ctor: 'Move1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0 = {ctor: 'Move0'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderLast = {ctor: 'OrderLast'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order12 = {ctor: 'Order12'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order11 = {ctor: 'Order11'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order10 = {ctor: 'Order10'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order9 = {ctor: 'Order9'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order8 = {ctor: 'Order8'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order7 = {ctor: 'Order7'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order6 = {ctor: 'Order6'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order5 = {ctor: 'Order5'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order4 = {ctor: 'Order4'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order3 = {ctor: 'Order3'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order2 = {ctor: 'Order2'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order1 = {ctor: 'Order1'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderFirst = {ctor: 'OrderFirst'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom = {ctor: 'Bottom'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle = {ctor: 'Middle'};
var _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top = {ctor: 'Top'};

var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_General_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_General_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_General_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_General_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_General_Internal$Between);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_General_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_General_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_General_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_General_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$aroundXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_General_Internal$Around);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_General_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_General_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_General_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_General_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_General_Internal$Right);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_General_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_General_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_General_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_General_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$centerXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_General_Internal$Center);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_General_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_General_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_General_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_General_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$leftXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowHAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_General_Internal$Left);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$bottomXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$topXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$RowAttrs(attrs);
};

var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXlLast = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderLast);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXlFirst = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderFirst);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLgLast = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderLast);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderLgFirst = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderFirst);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMdLast = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderLast);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderMdFirst = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderFirst);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSmLast = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderLast);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderSmFirst = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderFirst);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXsLast = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderLast);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Order1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$orderXsFirst = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$order, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$OrderFirst);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pushXs0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$push, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$pullXs0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$pull, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Move0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXl0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetLg0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetSm0 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset0);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetXs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$offset, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Offset1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xlAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lgAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$lg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$mdAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$md = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$smAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$sm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xsAuto = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAuto);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs12 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col12);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs11 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col11);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs10 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col10);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs9 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col9);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs8 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col8);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs7 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col7);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs6 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col6);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs5 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col5);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs4 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col4);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs3 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col3);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs2 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col2);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs1 = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col1);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$width, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Col);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$bottomXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Bottom);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$middleXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Middle);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topXl = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XL, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topLg = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$LG, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topMd = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$MD, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topSm = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$SM, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$topXs = A2(_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colVAlign, _rundis$elm_bootstrap$Bootstrap_General_Internal$XS, _rundis$elm_bootstrap$Bootstrap_Grid_Internal$Top);
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$textAlign = function (align) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$TextAlign(align);
};
var _rundis$elm_bootstrap$Bootstrap_Grid_Col$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Grid_Internal$ColAttrs(attrs);
};

var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString = function (validation) {
	var _p0 = validation;
	if (_p0.ctor === 'Success') {
		return 'is-valid';
	} else {
		return 'is-invalid';
	}
};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationWrapperAttribute = function (validation) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'has-',
			_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString(validation)));
};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger = {ctor: 'Danger'};
var _rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success = {ctor: 'Success'};

var _rundis$elm_bootstrap$Bootstrap_Form_Radio$defaultOptions = {
	id: _elm_lang$core$Maybe$Nothing,
	checked: false,
	name: _elm_lang$core$Maybe$Nothing,
	custom: false,
	inline: false,
	disabled: false,
	onClick: _elm_lang$core$Maybe$Nothing,
	validation: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$toAttributes = function (options) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'form-check-input', _1: !options.custom},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'custom-control-input', _1: options.custom},
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$type_('radio'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$checked(options.checked),
						_1: {ctor: '[]'}
					}
				}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Events$onClick, options.onClick),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$name, options.name),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$id, options.id),
							_1: {ctor: '[]'}
						}
					}
				}),
			options.attributes));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$applyModifier = F2(
	function (modifier, options) {
		var _p0 = modifier;
		switch (_p0.ctor) {
			case 'Id':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						id: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Checked':
				return _elm_lang$core$Native_Utils.update(
					options,
					{checked: _p0._0});
			case 'Name':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						name: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Inline':
				return _elm_lang$core$Native_Utils.update(
					options,
					{inline: true});
			case 'OnClick':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						onClick: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Custom':
				return _elm_lang$core$Native_Utils.update(
					options,
					{custom: true});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: _p0._0});
			case 'Validation':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						validation: _elm_lang$core$Maybe$Just(_p0._0)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p0._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$view = function (_p1) {
	var _p2 = _p1;
	var _p4 = _p2._0;
	var opts = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Form_Radio$applyModifier, _rundis$elm_bootstrap$Bootstrap_Form_Radio$defaultOptions, _p4.options);
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'form-check', _1: !opts.custom},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'form-check-inline', _1: (!opts.custom) && opts.inline},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'custom-control', _1: opts.custom},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'custom-radio', _1: opts.custom},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'custom-control-inline', _1: opts.inline && opts.custom},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$input,
				_rundis$elm_bootstrap$Bootstrap_Form_Radio$toAttributes(opts),
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$label,
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$classList(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'form-check-label', _1: !opts.custom},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'custom-control-label', _1: opts.custom},
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						},
						function () {
							var _p3 = opts.id;
							if (_p3.ctor === 'Just') {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$for(_p3._0),
									_1: {ctor: '[]'}
								};
							} else {
								return {ctor: '[]'};
							}
						}()),
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(_p4.label),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Options = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {id: a, checked: b, name: c, custom: d, disabled: e, inline: f, onClick: g, validation: h, attributes: i};
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Radio = function (a) {
	return {ctor: 'Radio', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$create = F2(
	function (options, label) {
		return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Radio(
			{options: options, label: label});
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$radio = F2(
	function (options, label) {
		return _rundis$elm_bootstrap$Bootstrap_Form_Radio$view(
			A2(_rundis$elm_bootstrap$Bootstrap_Form_Radio$create, options, label));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$addOption = F2(
	function (opt, _p5) {
		var _p6 = _p5;
		return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Radio(
			_elm_lang$core$Native_Utils.update(
				_p6._0,
				{
					options: {ctor: '::', _0: opt, _1: _p6._0.options}
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Validation = function (a) {
	return {ctor: 'Validation', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$success = _rundis$elm_bootstrap$Bootstrap_Form_Radio$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$danger = _rundis$elm_bootstrap$Bootstrap_Form_Radio$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Disabled = function (a) {
	return {ctor: 'Disabled', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$disabled = function (disabled) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Disabled(disabled);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Custom = {ctor: 'Custom'};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$createCustom = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$create(
		{ctor: '::', _0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$Custom, _1: options});
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$custom = F2(
	function (options, label) {
		return _rundis$elm_bootstrap$Bootstrap_Form_Radio$view(
			A2(_rundis$elm_bootstrap$Bootstrap_Form_Radio$createCustom, options, label));
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$OnClick = function (a) {
	return {ctor: 'OnClick', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$onClick = function (toMsg) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$OnClick(toMsg);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Name = function (a) {
	return {ctor: 'Name', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$name = function (name) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Name(name);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$radioList = F2(
	function (groupName, radios) {
		return A2(
			_elm_lang$core$List$map,
			function (_p7) {
				return _rundis$elm_bootstrap$Bootstrap_Form_Radio$view(
					_rundis$elm_bootstrap$Bootstrap_Form_Radio$addOption(
						_rundis$elm_bootstrap$Bootstrap_Form_Radio$name(groupName))(_p7));
			},
			radios);
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Inline = {ctor: 'Inline'};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$inline = _rundis$elm_bootstrap$Bootstrap_Form_Radio$Inline;
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Checked = function (a) {
	return {ctor: 'Checked', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked = function (isCheck) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Checked(isCheck);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$Id = function (a) {
	return {ctor: 'Id', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Radio$id = function (theId) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Radio$Id(theId);
};

var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$validationAttribute = function (validation) {
	return _elm_lang$html$Html_Attributes$class(
		_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$validationToString(validation));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$applyModifier = F2(
	function (modifier, options) {
		var _p0 = modifier;
		switch (_p0.ctor) {
			case 'Id':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						id: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Rows':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						rows: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Disabled':
				return _elm_lang$core$Native_Utils.update(
					options,
					{disabled: true});
			case 'Value':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						value: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'DefaultValue':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						defaultValue: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'OnInput':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						onInput: _elm_lang$core$Maybe$Just(_p0._0)
					});
			case 'Validation':
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						validation: _elm_lang$core$Maybe$Just(_p0._0)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					options,
					{
						attributes: A2(_elm_lang$core$Basics_ops['++'], options.attributes, _p0._0)
					});
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultOptions = {
	id: _elm_lang$core$Maybe$Nothing,
	rows: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	value: _elm_lang$core$Maybe$Nothing,
	defaultValue: _elm_lang$core$Maybe$Nothing,
	onInput: _elm_lang$core$Maybe$Nothing,
	validation: _elm_lang$core$Maybe$Nothing,
	attributes: {ctor: '[]'}
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$toAttributes = function (modifiers) {
	var options = A3(_elm_lang$core$List$foldl, _rundis$elm_bootstrap$Bootstrap_Form_Textarea$applyModifier, _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultOptions, modifiers);
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('form-control'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$disabled(options.disabled),
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$id, options.id),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$rows, options.rows),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$value, options.value),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Attributes$defaultValue, options.defaultValue),
								_1: {
									ctor: '::',
									_0: A2(_elm_lang$core$Maybe$map, _elm_lang$html$Html_Events$onInput, options.onInput),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Form_Textarea$validationAttribute, options.validation),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}),
			options.attributes));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$view = function (_p1) {
	var _p2 = _p1;
	return A2(
		_elm_lang$html$Html$textarea,
		_rundis$elm_bootstrap$Bootstrap_Form_Textarea$toAttributes(_p2._0.options),
		{ctor: '[]'});
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Options = F8(
	function (a, b, c, d, e, f, g, h) {
		return {id: a, rows: b, disabled: c, value: d, defaultValue: e, onInput: f, validation: g, attributes: h};
	});
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Textarea = function (a) {
	return {ctor: 'Textarea', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$create = function (options) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Textarea(
		{options: options});
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$textarea = function (_p3) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$view(
		_rundis$elm_bootstrap$Bootstrap_Form_Textarea$create(_p3));
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Attrs = function (a) {
	return {ctor: 'Attrs', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$attrs = function (attrs) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Attrs(attrs);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Validation = function (a) {
	return {ctor: 'Validation', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$success = _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Success);
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$danger = _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Validation(_rundis$elm_bootstrap$Bootstrap_Form_FormInternal$Danger);
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$OnInput = function (a) {
	return {ctor: 'OnInput', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$onInput = function (toMsg) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$OnInput(toMsg);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$DefaultValue = function (a) {
	return {ctor: 'DefaultValue', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultValue = function (value) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$DefaultValue(value);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Value = function (a) {
	return {ctor: 'Value', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$value = function (value) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Value(value);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Disabled = {ctor: 'Disabled'};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$disabled = _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Disabled;
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Rows = function (a) {
	return {ctor: 'Rows', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$rows = function (rows) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Rows(rows);
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Id = function (a) {
	return {ctor: 'Id', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Form_Textarea$id = function (id) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$Id(id);
};

var _rundis$elm_bootstrap$Bootstrap_Grid$renderCol = function (column) {
	var _p0 = column;
	switch (_p0.ctor) {
		case 'Column':
			return A2(
				_elm_lang$html$Html$div,
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p0._0.options),
				_p0._0.children);
		case 'ColBreak':
			return _p0._0;
		default:
			return A3(
				_elm_lang$html$Html_Keyed$node,
				'div',
				_rundis$elm_bootstrap$Bootstrap_Grid_Internal$colAttributes(_p0._0.options),
				_p0._0.children);
	}
};
var _rundis$elm_bootstrap$Bootstrap_Grid$keyedRow = F2(
	function (options, keyedCols) {
		return A3(
			_elm_lang$html$Html_Keyed$node,
			'div',
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options),
			A2(
				_elm_lang$core$List$map,
				function (_p1) {
					var _p2 = _p1;
					return {
						ctor: '_Tuple2',
						_0: _p2._0,
						_1: _rundis$elm_bootstrap$Bootstrap_Grid$renderCol(_p2._1)
					};
				},
				keyedCols));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$row = F2(
	function (options, cols) {
		return A2(
			_elm_lang$html$Html$div,
			_rundis$elm_bootstrap$Bootstrap_Grid_Internal$rowAttributes(options),
			A2(_elm_lang$core$List$map, _rundis$elm_bootstrap$Bootstrap_Grid$renderCol, cols));
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$simpleRow = function (cols) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$row,
		{ctor: '[]'},
		cols);
};
var _rundis$elm_bootstrap$Bootstrap_Grid$containerFluid = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container-fluid'),
					_1: {ctor: '[]'}
				},
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$container = F2(
	function (attributes, children) {
		return A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('container'),
					_1: {ctor: '[]'}
				},
				attributes),
			children);
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$KeyedColumn = function (a) {
	return {ctor: 'KeyedColumn', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$keyedCol = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Grid$KeyedColumn(
			{options: options, children: children});
	});
var _rundis$elm_bootstrap$Bootstrap_Grid$ColBreak = function (a) {
	return {ctor: 'ColBreak', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$colBreak = function (attributes) {
	return _rundis$elm_bootstrap$Bootstrap_Grid$ColBreak(
		A2(
			_elm_lang$html$Html$div,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('w-100'),
					_1: {ctor: '[]'}
				},
				attributes),
			{ctor: '[]'}));
};
var _rundis$elm_bootstrap$Bootstrap_Grid$Column = function (a) {
	return {ctor: 'Column', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Grid$col = F2(
	function (options, children) {
		return _rundis$elm_bootstrap$Bootstrap_Grid$Column(
			{options: options, children: children});
	});

var _rundis$elm_bootstrap$Bootstrap_Modal$closeButton = function (closeMsg) {
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('close'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Events$onClick(closeMsg),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text('×'),
			_1: {ctor: '[]'}
		});
};
var _rundis$elm_bootstrap$Bootstrap_Modal$renderFooter = function (maybeFooter) {
	var _p0 = maybeFooter;
	if (_p0.ctor === 'Just') {
		var _p1 = _p0._0._0;
		return _elm_lang$core$Maybe$Just(
			A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('modal-footer'),
					_1: _p1.attributes
				},
				_p1.children));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Modal$renderBody = function (maybeBody) {
	var _p2 = maybeBody;
	if (_p2.ctor === 'Just') {
		var _p3 = _p2._0._0;
		return _elm_lang$core$Maybe$Just(
			A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('modal-body'),
					_1: _p3.attributes
				},
				_p3.children));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Modal$modalClass = function (size) {
	var _p4 = _rundis$elm_bootstrap$Bootstrap_General_Internal$screenSizeOption(size);
	if (_p4.ctor === 'Just') {
		return {
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class(
				A2(_elm_lang$core$Basics_ops['++'], 'modal-', _p4._0)),
			_1: {ctor: '[]'}
		};
	} else {
		return {ctor: '[]'};
	}
};
var _rundis$elm_bootstrap$Bootstrap_Modal$modalAttributes = function (options) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'modal-dialog', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'modal-dialog-centered', _1: options.centered},
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'auto'},
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		},
		A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '[]'},
			A2(_elm_lang$core$Maybe$map, _rundis$elm_bootstrap$Bootstrap_Modal$modalClass, options.modalSize)));
};
var _rundis$elm_bootstrap$Bootstrap_Modal$isFade = function (config) {
	return A2(
		_elm_lang$core$Maybe$withDefault,
		false,
		A2(
			_elm_lang$core$Maybe$map,
			function (_p5) {
				return true;
			},
			config.withAnimation));
};
var _rundis$elm_bootstrap$Bootstrap_Modal$display = F2(
	function (visibility, config) {
		var _p6 = visibility;
		switch (_p6.ctor) {
			case 'Show':
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal', _1: true},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'fade',
										_1: _rundis$elm_bootstrap$Bootstrap_Modal$isFade(config)
									},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: true},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				};
			case 'StartClose':
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal', _1: true},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'fade', _1: true},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: true},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				};
			case 'FadeClose':
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'pointer-events', _1: 'none'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal', _1: true},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'fade', _1: true},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: false},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html_Events$on,
								'transitionend',
								_elm_lang$core$Json_Decode$succeed(config.closeMsg)),
							_1: {ctor: '[]'}
						}
					}
				};
			default:
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'height', _1: '0px'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'block'},
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal', _1: true},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'fade',
										_1: _rundis$elm_bootstrap$Bootstrap_Modal$isFade(config)
									},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: false},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				};
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$containerClickDecoder = function (closeMsg) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function (c) {
			return A2(_elm_lang$core$String$contains, 'elm-bootstrap-modal', c) ? _elm_lang$core$Json_Decode$succeed(closeMsg) : _elm_lang$core$Json_Decode$fail('ignoring');
		},
		_debois$elm_dom$DOM$target(_debois$elm_dom$DOM$className));
};
var _rundis$elm_bootstrap$Bootstrap_Modal$ConfigRec = F6(
	function (a, b, c, d, e, f) {
		return {closeMsg: a, withAnimation: b, header: c, body: d, footer: e, options: f};
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$Options = F3(
	function (a, b, c) {
		return {modalSize: a, hideOnBackdropClick: b, centered: c};
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$Item = F2(
	function (a, b) {
		return {attributes: a, children: b};
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$Hide = {ctor: 'Hide'};
var _rundis$elm_bootstrap$Bootstrap_Modal$hidden = _rundis$elm_bootstrap$Bootstrap_Modal$Hide;
var _rundis$elm_bootstrap$Bootstrap_Modal$FadeClose = {ctor: 'FadeClose'};
var _rundis$elm_bootstrap$Bootstrap_Modal$subscriptions = F2(
	function (visibility, animateMsg) {
		var _p7 = visibility;
		if (_p7.ctor === 'StartClose') {
			return _elm_lang$animation_frame$AnimationFrame$times(
				function (_p8) {
					return animateMsg(_rundis$elm_bootstrap$Bootstrap_Modal$FadeClose);
				});
		} else {
			return _elm_lang$core$Platform_Sub$none;
		}
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$StartClose = {ctor: 'StartClose'};
var _rundis$elm_bootstrap$Bootstrap_Modal$hiddenAnimated = _rundis$elm_bootstrap$Bootstrap_Modal$StartClose;
var _rundis$elm_bootstrap$Bootstrap_Modal$getCloseMsg = function (config) {
	var _p9 = config.withAnimation;
	if (_p9.ctor === 'Just') {
		return _p9._0(_rundis$elm_bootstrap$Bootstrap_Modal$StartClose);
	} else {
		return config.closeMsg;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Modal$renderHeader = function (_p10) {
	var _p11 = _p10;
	var _p12 = _p11.header;
	if (_p12.ctor === 'Just') {
		var _p13 = _p12._0._0;
		return _elm_lang$core$Maybe$Just(
			A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('modal-header'),
					_1: _p13.attributes
				},
				A2(
					_elm_lang$core$Basics_ops['++'],
					_p13.children,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Modal$closeButton(
							_rundis$elm_bootstrap$Bootstrap_Modal$getCloseMsg(_p11)),
						_1: {ctor: '[]'}
					})));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _rundis$elm_bootstrap$Bootstrap_Modal$backdrop = F2(
	function (visibility, config) {
		var attributes = function () {
			var _p14 = visibility;
			switch (_p14.ctor) {
				case 'Show':
					return A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$classList(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'modal-backdrop', _1: true},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'fade',
											_1: _rundis$elm_bootstrap$Bootstrap_Modal$isFade(config)
										},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'show', _1: true},
											_1: {ctor: '[]'}
										}
									}
								}),
							_1: {ctor: '[]'}
						},
						config.options.hideOnBackdropClick ? {
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onClick(
								_rundis$elm_bootstrap$Bootstrap_Modal$getCloseMsg(config)),
							_1: {ctor: '[]'}
						} : {ctor: '[]'});
				case 'StartClose':
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal-backdrop', _1: true},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'fade', _1: true},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: true},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					};
				case 'FadeClose':
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal-backdrop', _1: true},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'fade', _1: true},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: false},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					};
				default:
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'modal-backdrop', _1: false},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'fade',
										_1: _rundis$elm_bootstrap$Bootstrap_Modal$isFade(config)
									},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'show', _1: false},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {ctor: '[]'}
					};
			}
		}();
		return {
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				attributes,
				{ctor: '[]'}),
			_1: {ctor: '[]'}
		};
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$view = F2(
	function (visibility, _p15) {
		var _p16 = _p15;
		var _p18 = _p16._0.options;
		var _p17 = _p16._0;
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						A2(
							_elm_lang$core$Basics_ops['++'],
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$tabindex(-1),
								_1: {ctor: '[]'}
							},
							A2(_rundis$elm_bootstrap$Bootstrap_Modal$display, visibility, _p17)),
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								A2(
									_elm_lang$core$Basics_ops['++'],
									{
										ctor: '::',
										_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'document'),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('elm-bootstrap-modal'),
											_1: {ctor: '[]'}
										}
									},
									A2(
										_elm_lang$core$Basics_ops['++'],
										_rundis$elm_bootstrap$Bootstrap_Modal$modalAttributes(_p18),
										_p18.hideOnBackdropClick ? {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html_Events$on,
												'click',
												_rundis$elm_bootstrap$Bootstrap_Modal$containerClickDecoder(_p17.closeMsg)),
											_1: {ctor: '[]'}
										} : {ctor: '[]'})),
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$div,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('modal-content'),
											_1: {ctor: '[]'}
										},
										A2(
											_elm_lang$core$List$filterMap,
											_elm_lang$core$Basics$identity,
											{
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_Modal$renderHeader(_p17),
												_1: {
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Modal$renderBody(_p16._0.body),
													_1: {
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Modal$renderFooter(_p16._0.footer),
														_1: {ctor: '[]'}
													}
												}
											})),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				A2(_rundis$elm_bootstrap$Bootstrap_Modal$backdrop, visibility, _p17)));
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$Show = {ctor: 'Show'};
var _rundis$elm_bootstrap$Bootstrap_Modal$shown = _rundis$elm_bootstrap$Bootstrap_Modal$Show;
var _rundis$elm_bootstrap$Bootstrap_Modal$Config = function (a) {
	return {ctor: 'Config', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Modal$small = function (_p19) {
	var _p20 = _p19;
	return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
		_elm_lang$core$Native_Utils.update(
			_p20._0,
			{
				options: _elm_lang$core$Native_Utils.update(
					_p20._0.options,
					{
						modalSize: _elm_lang$core$Maybe$Just(_rundis$elm_bootstrap$Bootstrap_General_Internal$SM)
					})
			}));
};
var _rundis$elm_bootstrap$Bootstrap_Modal$large = function (_p21) {
	var _p22 = _p21;
	return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
		_elm_lang$core$Native_Utils.update(
			_p22._0,
			{
				options: _elm_lang$core$Native_Utils.update(
					_p22._0.options,
					{
						modalSize: _elm_lang$core$Maybe$Just(_rundis$elm_bootstrap$Bootstrap_General_Internal$LG)
					})
			}));
};
var _rundis$elm_bootstrap$Bootstrap_Modal$hideOnBackdropClick = F2(
	function (hide, _p23) {
		var _p24 = _p23;
		return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
			_elm_lang$core$Native_Utils.update(
				_p24._0,
				{
					options: _elm_lang$core$Native_Utils.update(
						_p24._0.options,
						{hideOnBackdropClick: hide})
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$withAnimation = F2(
	function (animateMsg, _p25) {
		var _p26 = _p25;
		return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
			_elm_lang$core$Native_Utils.update(
				_p26._0,
				{
					withAnimation: _elm_lang$core$Maybe$Just(animateMsg)
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$config = function (closeMsg) {
	return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
		{
			closeMsg: closeMsg,
			withAnimation: _elm_lang$core$Maybe$Nothing,
			options: {modalSize: _elm_lang$core$Maybe$Nothing, hideOnBackdropClick: true, centered: true},
			header: _elm_lang$core$Maybe$Nothing,
			body: _elm_lang$core$Maybe$Nothing,
			footer: _elm_lang$core$Maybe$Nothing
		});
};
var _rundis$elm_bootstrap$Bootstrap_Modal$Header = function (a) {
	return {ctor: 'Header', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Modal$header = F3(
	function (attributes, children, _p27) {
		var _p28 = _p27;
		return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
			_elm_lang$core$Native_Utils.update(
				_p28._0,
				{
					header: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Modal$Header(
							{attributes: attributes, children: children}))
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader = F3(
	function (itemFn, attributes, children) {
		return A2(
			_rundis$elm_bootstrap$Bootstrap_Modal$header,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					itemFn,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('modal-title'),
						_1: attributes
					},
					children),
				_1: {ctor: '[]'}
			});
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$h1 = _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader(_elm_lang$html$Html$h1);
var _rundis$elm_bootstrap$Bootstrap_Modal$h2 = _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader(_elm_lang$html$Html$h2);
var _rundis$elm_bootstrap$Bootstrap_Modal$h3 = _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader(_elm_lang$html$Html$h3);
var _rundis$elm_bootstrap$Bootstrap_Modal$h4 = _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader(_elm_lang$html$Html$h4);
var _rundis$elm_bootstrap$Bootstrap_Modal$h5 = _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader(_elm_lang$html$Html$h5);
var _rundis$elm_bootstrap$Bootstrap_Modal$h6 = _rundis$elm_bootstrap$Bootstrap_Modal$titledHeader(_elm_lang$html$Html$h6);
var _rundis$elm_bootstrap$Bootstrap_Modal$Body = function (a) {
	return {ctor: 'Body', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Modal$body = F3(
	function (attributes, children, _p29) {
		var _p30 = _p29;
		return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
			_elm_lang$core$Native_Utils.update(
				_p30._0,
				{
					body: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Modal$Body(
							{attributes: attributes, children: children}))
				}));
	});
var _rundis$elm_bootstrap$Bootstrap_Modal$Footer = function (a) {
	return {ctor: 'Footer', _0: a};
};
var _rundis$elm_bootstrap$Bootstrap_Modal$footer = F3(
	function (attributes, children, _p31) {
		var _p32 = _p31;
		return _rundis$elm_bootstrap$Bootstrap_Modal$Config(
			_elm_lang$core$Native_Utils.update(
				_p32._0,
				{
					footer: _elm_lang$core$Maybe$Just(
						_rundis$elm_bootstrap$Bootstrap_Modal$Footer(
							{attributes: attributes, children: children}))
				}));
	});

var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py5Xl = _elm_lang$html$Html_Attributes$class('py-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py4Xl = _elm_lang$html$Html_Attributes$class('py-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py3Xl = _elm_lang$html$Html_Attributes$class('py-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py2Xl = _elm_lang$html$Html_Attributes$class('py-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py1Xl = _elm_lang$html$Html_Attributes$class('py-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py0Xl = _elm_lang$html$Html_Attributes$class('py-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px5Xl = _elm_lang$html$Html_Attributes$class('px-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px4Xl = _elm_lang$html$Html_Attributes$class('px-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px3Xl = _elm_lang$html$Html_Attributes$class('px-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px2Xl = _elm_lang$html$Html_Attributes$class('px-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px1Xl = _elm_lang$html$Html_Attributes$class('px-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px0Xl = _elm_lang$html$Html_Attributes$class('px-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr5Xl = _elm_lang$html$Html_Attributes$class('pr-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr4Xl = _elm_lang$html$Html_Attributes$class('pr-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr3Xl = _elm_lang$html$Html_Attributes$class('pr-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr2Xl = _elm_lang$html$Html_Attributes$class('pr-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr1Xl = _elm_lang$html$Html_Attributes$class('pr-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr0Xl = _elm_lang$html$Html_Attributes$class('pr-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl5Xl = _elm_lang$html$Html_Attributes$class('pl-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl4Xl = _elm_lang$html$Html_Attributes$class('pl-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl3Xl = _elm_lang$html$Html_Attributes$class('pl-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl2Xl = _elm_lang$html$Html_Attributes$class('pl-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl1Xl = _elm_lang$html$Html_Attributes$class('pl-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl0Xl = _elm_lang$html$Html_Attributes$class('pl-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb5Xl = _elm_lang$html$Html_Attributes$class('pb-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb4Xl = _elm_lang$html$Html_Attributes$class('pb-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb3Xl = _elm_lang$html$Html_Attributes$class('pb-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb2Xl = _elm_lang$html$Html_Attributes$class('pb-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb1Xl = _elm_lang$html$Html_Attributes$class('pb-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb0Xl = _elm_lang$html$Html_Attributes$class('pb-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt5Xl = _elm_lang$html$Html_Attributes$class('pt-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt4Xl = _elm_lang$html$Html_Attributes$class('pt-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt3Xl = _elm_lang$html$Html_Attributes$class('pt-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt2Xl = _elm_lang$html$Html_Attributes$class('pt-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt1Xl = _elm_lang$html$Html_Attributes$class('pt-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt0Xl = _elm_lang$html$Html_Attributes$class('pt-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p5Xl = _elm_lang$html$Html_Attributes$class('p-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p4Xl = _elm_lang$html$Html_Attributes$class('p-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p3Xl = _elm_lang$html$Html_Attributes$class('p-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p2Xl = _elm_lang$html$Html_Attributes$class('p-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p1Xl = _elm_lang$html$Html_Attributes$class('p-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p0Xl = _elm_lang$html$Html_Attributes$class('p-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py5Lg = _elm_lang$html$Html_Attributes$class('py-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py4Lg = _elm_lang$html$Html_Attributes$class('py-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py3Lg = _elm_lang$html$Html_Attributes$class('py-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py2Lg = _elm_lang$html$Html_Attributes$class('py-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py1Lg = _elm_lang$html$Html_Attributes$class('py-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py0Lg = _elm_lang$html$Html_Attributes$class('py-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px5Lg = _elm_lang$html$Html_Attributes$class('px-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px4Lg = _elm_lang$html$Html_Attributes$class('px-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px3Lg = _elm_lang$html$Html_Attributes$class('px-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px2Lg = _elm_lang$html$Html_Attributes$class('px-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px1Lg = _elm_lang$html$Html_Attributes$class('px-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px0Lg = _elm_lang$html$Html_Attributes$class('px-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr5Lg = _elm_lang$html$Html_Attributes$class('pr-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr4Lg = _elm_lang$html$Html_Attributes$class('pr-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr3Lg = _elm_lang$html$Html_Attributes$class('pr-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr2Lg = _elm_lang$html$Html_Attributes$class('pr-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr1Lg = _elm_lang$html$Html_Attributes$class('pr-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr0Lg = _elm_lang$html$Html_Attributes$class('pr-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl5Lg = _elm_lang$html$Html_Attributes$class('pl-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl4Lg = _elm_lang$html$Html_Attributes$class('pl-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl3Lg = _elm_lang$html$Html_Attributes$class('pl-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl2Lg = _elm_lang$html$Html_Attributes$class('pl-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl1Lg = _elm_lang$html$Html_Attributes$class('pl-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl0Lg = _elm_lang$html$Html_Attributes$class('pl-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb5Lg = _elm_lang$html$Html_Attributes$class('pb-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb4Lg = _elm_lang$html$Html_Attributes$class('pb-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb3Lg = _elm_lang$html$Html_Attributes$class('pb-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb2Lg = _elm_lang$html$Html_Attributes$class('pb-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb1Lg = _elm_lang$html$Html_Attributes$class('pb-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb0Lg = _elm_lang$html$Html_Attributes$class('pb-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt5Lg = _elm_lang$html$Html_Attributes$class('pt-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt4Lg = _elm_lang$html$Html_Attributes$class('pt-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt3Lg = _elm_lang$html$Html_Attributes$class('pt-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt2Lg = _elm_lang$html$Html_Attributes$class('pt-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt1Lg = _elm_lang$html$Html_Attributes$class('pt-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt0Lg = _elm_lang$html$Html_Attributes$class('pt-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p5Lg = _elm_lang$html$Html_Attributes$class('p-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p4Lg = _elm_lang$html$Html_Attributes$class('p-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p3Lg = _elm_lang$html$Html_Attributes$class('p-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p2Lg = _elm_lang$html$Html_Attributes$class('p-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p1Lg = _elm_lang$html$Html_Attributes$class('p-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p0Lg = _elm_lang$html$Html_Attributes$class('p-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py5Md = _elm_lang$html$Html_Attributes$class('py-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py4Md = _elm_lang$html$Html_Attributes$class('py-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py3Md = _elm_lang$html$Html_Attributes$class('py-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py2Md = _elm_lang$html$Html_Attributes$class('py-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py1Md = _elm_lang$html$Html_Attributes$class('py-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py0Md = _elm_lang$html$Html_Attributes$class('py-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px5Md = _elm_lang$html$Html_Attributes$class('px-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px4Md = _elm_lang$html$Html_Attributes$class('px-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px3Md = _elm_lang$html$Html_Attributes$class('px-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px2Md = _elm_lang$html$Html_Attributes$class('px-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px1Md = _elm_lang$html$Html_Attributes$class('px-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px0Md = _elm_lang$html$Html_Attributes$class('px-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr5Md = _elm_lang$html$Html_Attributes$class('pr-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr4Md = _elm_lang$html$Html_Attributes$class('pr-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr3Md = _elm_lang$html$Html_Attributes$class('pr-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr2Md = _elm_lang$html$Html_Attributes$class('pr-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr1Md = _elm_lang$html$Html_Attributes$class('pr-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr0Md = _elm_lang$html$Html_Attributes$class('pr-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl5Md = _elm_lang$html$Html_Attributes$class('pl-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl4Md = _elm_lang$html$Html_Attributes$class('pl-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl3Md = _elm_lang$html$Html_Attributes$class('pl-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl2Md = _elm_lang$html$Html_Attributes$class('pl-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl1Md = _elm_lang$html$Html_Attributes$class('pl-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl0Md = _elm_lang$html$Html_Attributes$class('pl-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb5Md = _elm_lang$html$Html_Attributes$class('pb-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb4Md = _elm_lang$html$Html_Attributes$class('pb-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb3Md = _elm_lang$html$Html_Attributes$class('pb-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb2Md = _elm_lang$html$Html_Attributes$class('pb-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb1Md = _elm_lang$html$Html_Attributes$class('pb-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb0Md = _elm_lang$html$Html_Attributes$class('pb-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt5Md = _elm_lang$html$Html_Attributes$class('pt-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt4Md = _elm_lang$html$Html_Attributes$class('pt-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt3Md = _elm_lang$html$Html_Attributes$class('pt-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt2Md = _elm_lang$html$Html_Attributes$class('pt-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt1Md = _elm_lang$html$Html_Attributes$class('pt-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt0Md = _elm_lang$html$Html_Attributes$class('pt-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p5Md = _elm_lang$html$Html_Attributes$class('p-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p4Md = _elm_lang$html$Html_Attributes$class('p-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p3Md = _elm_lang$html$Html_Attributes$class('p-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p2Md = _elm_lang$html$Html_Attributes$class('p-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p1Md = _elm_lang$html$Html_Attributes$class('p-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p0Md = _elm_lang$html$Html_Attributes$class('p-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py5Sm = _elm_lang$html$Html_Attributes$class('py-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py4Sm = _elm_lang$html$Html_Attributes$class('py-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py3Sm = _elm_lang$html$Html_Attributes$class('py-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py2Sm = _elm_lang$html$Html_Attributes$class('py-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py1Sm = _elm_lang$html$Html_Attributes$class('py-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py0Sm = _elm_lang$html$Html_Attributes$class('py-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px5Sm = _elm_lang$html$Html_Attributes$class('px-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px4Sm = _elm_lang$html$Html_Attributes$class('px-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px3Sm = _elm_lang$html$Html_Attributes$class('px-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px2Sm = _elm_lang$html$Html_Attributes$class('px-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px1Sm = _elm_lang$html$Html_Attributes$class('px-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px0Sm = _elm_lang$html$Html_Attributes$class('px-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr5Sm = _elm_lang$html$Html_Attributes$class('pr-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr4Sm = _elm_lang$html$Html_Attributes$class('pr-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr3Sm = _elm_lang$html$Html_Attributes$class('pr-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr2Sm = _elm_lang$html$Html_Attributes$class('pr-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr1Sm = _elm_lang$html$Html_Attributes$class('pr-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr0Sm = _elm_lang$html$Html_Attributes$class('pr-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl5Sm = _elm_lang$html$Html_Attributes$class('pl-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl4Sm = _elm_lang$html$Html_Attributes$class('pl-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl3Sm = _elm_lang$html$Html_Attributes$class('pl-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl2Sm = _elm_lang$html$Html_Attributes$class('pl-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl1Sm = _elm_lang$html$Html_Attributes$class('pl-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl0Sm = _elm_lang$html$Html_Attributes$class('pl-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb5Sm = _elm_lang$html$Html_Attributes$class('pb-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb4Sm = _elm_lang$html$Html_Attributes$class('pb-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb3Sm = _elm_lang$html$Html_Attributes$class('pb-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb2Sm = _elm_lang$html$Html_Attributes$class('pb-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb1Sm = _elm_lang$html$Html_Attributes$class('pb-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb0Sm = _elm_lang$html$Html_Attributes$class('pb-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt5Sm = _elm_lang$html$Html_Attributes$class('pt-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt4Sm = _elm_lang$html$Html_Attributes$class('pt-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt3Sm = _elm_lang$html$Html_Attributes$class('pt-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt2Sm = _elm_lang$html$Html_Attributes$class('pt-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt1Sm = _elm_lang$html$Html_Attributes$class('pt-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt0Sm = _elm_lang$html$Html_Attributes$class('pt-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p5Sm = _elm_lang$html$Html_Attributes$class('p-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p4Sm = _elm_lang$html$Html_Attributes$class('p-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p3Sm = _elm_lang$html$Html_Attributes$class('p-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p2Sm = _elm_lang$html$Html_Attributes$class('p-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p1Sm = _elm_lang$html$Html_Attributes$class('p-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p0Sm = _elm_lang$html$Html_Attributes$class('p-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py5 = _elm_lang$html$Html_Attributes$class('py-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py4 = _elm_lang$html$Html_Attributes$class('py-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py3 = _elm_lang$html$Html_Attributes$class('py-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py2 = _elm_lang$html$Html_Attributes$class('py-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py1 = _elm_lang$html$Html_Attributes$class('py-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$py0 = _elm_lang$html$Html_Attributes$class('py-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px5 = _elm_lang$html$Html_Attributes$class('px-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px4 = _elm_lang$html$Html_Attributes$class('px-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px3 = _elm_lang$html$Html_Attributes$class('px-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px2 = _elm_lang$html$Html_Attributes$class('px-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px1 = _elm_lang$html$Html_Attributes$class('px-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$px0 = _elm_lang$html$Html_Attributes$class('px-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr5 = _elm_lang$html$Html_Attributes$class('pr-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr4 = _elm_lang$html$Html_Attributes$class('pr-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr3 = _elm_lang$html$Html_Attributes$class('pr-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr2 = _elm_lang$html$Html_Attributes$class('pr-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr1 = _elm_lang$html$Html_Attributes$class('pr-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pr0 = _elm_lang$html$Html_Attributes$class('pr-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl5 = _elm_lang$html$Html_Attributes$class('pl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl4 = _elm_lang$html$Html_Attributes$class('pl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl3 = _elm_lang$html$Html_Attributes$class('pl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl2 = _elm_lang$html$Html_Attributes$class('pl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl1 = _elm_lang$html$Html_Attributes$class('pl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pl0 = _elm_lang$html$Html_Attributes$class('pl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb5 = _elm_lang$html$Html_Attributes$class('pb-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb4 = _elm_lang$html$Html_Attributes$class('pb-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb3 = _elm_lang$html$Html_Attributes$class('pb-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb2 = _elm_lang$html$Html_Attributes$class('pb-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb1 = _elm_lang$html$Html_Attributes$class('pb-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pb0 = _elm_lang$html$Html_Attributes$class('pb-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt5 = _elm_lang$html$Html_Attributes$class('pt-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt4 = _elm_lang$html$Html_Attributes$class('pt-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt3 = _elm_lang$html$Html_Attributes$class('pt-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt2 = _elm_lang$html$Html_Attributes$class('pt-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt1 = _elm_lang$html$Html_Attributes$class('pt-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$pt0 = _elm_lang$html$Html_Attributes$class('pt-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p5 = _elm_lang$html$Html_Attributes$class('p-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p4 = _elm_lang$html$Html_Attributes$class('p-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p3 = _elm_lang$html$Html_Attributes$class('p-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p2 = _elm_lang$html$Html_Attributes$class('p-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p1 = _elm_lang$html$Html_Attributes$class('p-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$p0 = _elm_lang$html$Html_Attributes$class('p-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$myAutoXl = _elm_lang$html$Html_Attributes$class('my-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my5Xl = _elm_lang$html$Html_Attributes$class('my-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my4Xl = _elm_lang$html$Html_Attributes$class('my-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my3Xl = _elm_lang$html$Html_Attributes$class('my-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my2Xl = _elm_lang$html$Html_Attributes$class('my-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my1Xl = _elm_lang$html$Html_Attributes$class('my-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my0Xl = _elm_lang$html$Html_Attributes$class('my-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mxAutoXl = _elm_lang$html$Html_Attributes$class('mx-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx5Xl = _elm_lang$html$Html_Attributes$class('mx-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx4Xl = _elm_lang$html$Html_Attributes$class('mx-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx3Xl = _elm_lang$html$Html_Attributes$class('mx-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx2Xl = _elm_lang$html$Html_Attributes$class('mx-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx1Xl = _elm_lang$html$Html_Attributes$class('mx-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx0Xl = _elm_lang$html$Html_Attributes$class('mx-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mrAutoXl = _elm_lang$html$Html_Attributes$class('mr-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr5Xl = _elm_lang$html$Html_Attributes$class('mr-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr4Xl = _elm_lang$html$Html_Attributes$class('mr-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr3Xl = _elm_lang$html$Html_Attributes$class('mr-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr2Xl = _elm_lang$html$Html_Attributes$class('mr-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr1Xl = _elm_lang$html$Html_Attributes$class('mr-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr0Xl = _elm_lang$html$Html_Attributes$class('mr-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mlAutoXl = _elm_lang$html$Html_Attributes$class('ml-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml5Xl = _elm_lang$html$Html_Attributes$class('ml-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml4Xl = _elm_lang$html$Html_Attributes$class('ml-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml3Xl = _elm_lang$html$Html_Attributes$class('ml-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml2Xl = _elm_lang$html$Html_Attributes$class('ml-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml1Xl = _elm_lang$html$Html_Attributes$class('ml-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml0Xl = _elm_lang$html$Html_Attributes$class('ml-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mbAutoXl = _elm_lang$html$Html_Attributes$class('mb-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb5Xl = _elm_lang$html$Html_Attributes$class('mb-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb4Xl = _elm_lang$html$Html_Attributes$class('mb-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb3Xl = _elm_lang$html$Html_Attributes$class('mb-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb2Xl = _elm_lang$html$Html_Attributes$class('mb-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb1Xl = _elm_lang$html$Html_Attributes$class('mb-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb0Xl = _elm_lang$html$Html_Attributes$class('mb-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mtAutoXl = _elm_lang$html$Html_Attributes$class('mt-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt5Xl = _elm_lang$html$Html_Attributes$class('mt-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt4Xl = _elm_lang$html$Html_Attributes$class('mt-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3Xl = _elm_lang$html$Html_Attributes$class('mt-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt2Xl = _elm_lang$html$Html_Attributes$class('mt-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1Xl = _elm_lang$html$Html_Attributes$class('mt-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt0Xl = _elm_lang$html$Html_Attributes$class('mt-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mAutoXl = _elm_lang$html$Html_Attributes$class('m-xl-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m5Xl = _elm_lang$html$Html_Attributes$class('m-xl-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m4Xl = _elm_lang$html$Html_Attributes$class('m-xl-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m3Xl = _elm_lang$html$Html_Attributes$class('m-xl-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m2Xl = _elm_lang$html$Html_Attributes$class('m-xl-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m1Xl = _elm_lang$html$Html_Attributes$class('m-xl-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m0Xl = _elm_lang$html$Html_Attributes$class('m-xl-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$myAutoLg = _elm_lang$html$Html_Attributes$class('my-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my5Lg = _elm_lang$html$Html_Attributes$class('my-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my4Lg = _elm_lang$html$Html_Attributes$class('my-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my3Lg = _elm_lang$html$Html_Attributes$class('my-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my2Lg = _elm_lang$html$Html_Attributes$class('my-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my1Lg = _elm_lang$html$Html_Attributes$class('my-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my0Lg = _elm_lang$html$Html_Attributes$class('my-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mxAutoLg = _elm_lang$html$Html_Attributes$class('mx-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx5Lg = _elm_lang$html$Html_Attributes$class('mx-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx4Lg = _elm_lang$html$Html_Attributes$class('mx-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx3Lg = _elm_lang$html$Html_Attributes$class('mx-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx2Lg = _elm_lang$html$Html_Attributes$class('mx-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx1Lg = _elm_lang$html$Html_Attributes$class('mx-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx0Lg = _elm_lang$html$Html_Attributes$class('mx-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mrAutoLg = _elm_lang$html$Html_Attributes$class('mr-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr5Lg = _elm_lang$html$Html_Attributes$class('mr-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr4Lg = _elm_lang$html$Html_Attributes$class('mr-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr3Lg = _elm_lang$html$Html_Attributes$class('mr-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr2Lg = _elm_lang$html$Html_Attributes$class('mr-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr1Lg = _elm_lang$html$Html_Attributes$class('mr-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr0Lg = _elm_lang$html$Html_Attributes$class('mr-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mlAutoLg = _elm_lang$html$Html_Attributes$class('ml-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml5Lg = _elm_lang$html$Html_Attributes$class('ml-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml4Lg = _elm_lang$html$Html_Attributes$class('ml-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml3Lg = _elm_lang$html$Html_Attributes$class('ml-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml2Lg = _elm_lang$html$Html_Attributes$class('ml-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml1Lg = _elm_lang$html$Html_Attributes$class('ml-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml0Lg = _elm_lang$html$Html_Attributes$class('ml-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mbAutoLg = _elm_lang$html$Html_Attributes$class('mb-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb5Lg = _elm_lang$html$Html_Attributes$class('mb-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb4Lg = _elm_lang$html$Html_Attributes$class('mb-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb3Lg = _elm_lang$html$Html_Attributes$class('mb-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb2Lg = _elm_lang$html$Html_Attributes$class('mb-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb1Lg = _elm_lang$html$Html_Attributes$class('mb-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb0Lg = _elm_lang$html$Html_Attributes$class('mb-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mtAutoLg = _elm_lang$html$Html_Attributes$class('mt-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt5Lg = _elm_lang$html$Html_Attributes$class('mt-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt4Lg = _elm_lang$html$Html_Attributes$class('mt-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3Lg = _elm_lang$html$Html_Attributes$class('mt-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt2Lg = _elm_lang$html$Html_Attributes$class('mt-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1Lg = _elm_lang$html$Html_Attributes$class('mt-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt0Lg = _elm_lang$html$Html_Attributes$class('mt-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mAutoLg = _elm_lang$html$Html_Attributes$class('m-lg-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m5Lg = _elm_lang$html$Html_Attributes$class('m-lg-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m4Lg = _elm_lang$html$Html_Attributes$class('m-lg-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m3Lg = _elm_lang$html$Html_Attributes$class('m-lg-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m2Lg = _elm_lang$html$Html_Attributes$class('m-lg-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m1Lg = _elm_lang$html$Html_Attributes$class('m-lg-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m0Lg = _elm_lang$html$Html_Attributes$class('m-lg-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$myAutoMd = _elm_lang$html$Html_Attributes$class('my-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my5Md = _elm_lang$html$Html_Attributes$class('my-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my4Md = _elm_lang$html$Html_Attributes$class('my-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my3Md = _elm_lang$html$Html_Attributes$class('my-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my2Md = _elm_lang$html$Html_Attributes$class('my-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my1Md = _elm_lang$html$Html_Attributes$class('my-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my0Md = _elm_lang$html$Html_Attributes$class('my-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mxAutoMd = _elm_lang$html$Html_Attributes$class('mx-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx5Md = _elm_lang$html$Html_Attributes$class('mx-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx4Md = _elm_lang$html$Html_Attributes$class('mx-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx3Md = _elm_lang$html$Html_Attributes$class('mx-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx2Md = _elm_lang$html$Html_Attributes$class('mx-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx1Md = _elm_lang$html$Html_Attributes$class('mx-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx0Md = _elm_lang$html$Html_Attributes$class('mx-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mrAutoMd = _elm_lang$html$Html_Attributes$class('mr-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr5Md = _elm_lang$html$Html_Attributes$class('mr-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr4Md = _elm_lang$html$Html_Attributes$class('mr-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr3Md = _elm_lang$html$Html_Attributes$class('mr-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr2Md = _elm_lang$html$Html_Attributes$class('mr-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr1Md = _elm_lang$html$Html_Attributes$class('mr-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr0Md = _elm_lang$html$Html_Attributes$class('mr-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mlAutoMd = _elm_lang$html$Html_Attributes$class('ml-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml5Md = _elm_lang$html$Html_Attributes$class('ml-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml4Md = _elm_lang$html$Html_Attributes$class('ml-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml3Md = _elm_lang$html$Html_Attributes$class('ml-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml2Md = _elm_lang$html$Html_Attributes$class('ml-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml1Md = _elm_lang$html$Html_Attributes$class('ml-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml0Md = _elm_lang$html$Html_Attributes$class('ml-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mbAutoMd = _elm_lang$html$Html_Attributes$class('mb-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb5Md = _elm_lang$html$Html_Attributes$class('mb-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb4Md = _elm_lang$html$Html_Attributes$class('mb-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb3Md = _elm_lang$html$Html_Attributes$class('mb-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb2Md = _elm_lang$html$Html_Attributes$class('mb-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb1Md = _elm_lang$html$Html_Attributes$class('mb-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb0Md = _elm_lang$html$Html_Attributes$class('mb-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mtAutoMd = _elm_lang$html$Html_Attributes$class('mt-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt5Md = _elm_lang$html$Html_Attributes$class('mt-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt4Md = _elm_lang$html$Html_Attributes$class('mt-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3Md = _elm_lang$html$Html_Attributes$class('mt-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt2Md = _elm_lang$html$Html_Attributes$class('mt-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1Md = _elm_lang$html$Html_Attributes$class('mt-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt0Md = _elm_lang$html$Html_Attributes$class('mt-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mAutoMd = _elm_lang$html$Html_Attributes$class('m-md-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m5Md = _elm_lang$html$Html_Attributes$class('m-md-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m4Md = _elm_lang$html$Html_Attributes$class('m-md-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m3Md = _elm_lang$html$Html_Attributes$class('m-md-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m2Md = _elm_lang$html$Html_Attributes$class('m-md-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m1Md = _elm_lang$html$Html_Attributes$class('m-md-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m0Md = _elm_lang$html$Html_Attributes$class('m-md-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$myAutoSm = _elm_lang$html$Html_Attributes$class('my-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my5Sm = _elm_lang$html$Html_Attributes$class('my-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my4Sm = _elm_lang$html$Html_Attributes$class('my-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my3Sm = _elm_lang$html$Html_Attributes$class('my-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my2Sm = _elm_lang$html$Html_Attributes$class('my-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my1Sm = _elm_lang$html$Html_Attributes$class('my-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my0Sm = _elm_lang$html$Html_Attributes$class('my-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mxAutoSm = _elm_lang$html$Html_Attributes$class('mx-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx5Sm = _elm_lang$html$Html_Attributes$class('mx-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx4Sm = _elm_lang$html$Html_Attributes$class('mx-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx3Sm = _elm_lang$html$Html_Attributes$class('mx-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx2Sm = _elm_lang$html$Html_Attributes$class('mx-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx1Sm = _elm_lang$html$Html_Attributes$class('mx-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx0Sm = _elm_lang$html$Html_Attributes$class('mx-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mrAutoSm = _elm_lang$html$Html_Attributes$class('mr-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr5Sm = _elm_lang$html$Html_Attributes$class('mr-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr4Sm = _elm_lang$html$Html_Attributes$class('mr-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr3Sm = _elm_lang$html$Html_Attributes$class('mr-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr2Sm = _elm_lang$html$Html_Attributes$class('mr-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr1Sm = _elm_lang$html$Html_Attributes$class('mr-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr0Sm = _elm_lang$html$Html_Attributes$class('mr-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mlAutoSm = _elm_lang$html$Html_Attributes$class('ml-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml5Sm = _elm_lang$html$Html_Attributes$class('ml-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml4Sm = _elm_lang$html$Html_Attributes$class('ml-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml3Sm = _elm_lang$html$Html_Attributes$class('ml-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml2Sm = _elm_lang$html$Html_Attributes$class('ml-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml1Sm = _elm_lang$html$Html_Attributes$class('ml-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml0Sm = _elm_lang$html$Html_Attributes$class('ml-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mbAutoSm = _elm_lang$html$Html_Attributes$class('mb-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb5Sm = _elm_lang$html$Html_Attributes$class('mb-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb4Sm = _elm_lang$html$Html_Attributes$class('mb-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb3Sm = _elm_lang$html$Html_Attributes$class('mb-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb2Sm = _elm_lang$html$Html_Attributes$class('mb-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb1Sm = _elm_lang$html$Html_Attributes$class('mb-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb0Sm = _elm_lang$html$Html_Attributes$class('mb-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mtAutoSm = _elm_lang$html$Html_Attributes$class('mt-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt5Sm = _elm_lang$html$Html_Attributes$class('mt-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt4Sm = _elm_lang$html$Html_Attributes$class('mt-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3Sm = _elm_lang$html$Html_Attributes$class('mt-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt2Sm = _elm_lang$html$Html_Attributes$class('mt-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1Sm = _elm_lang$html$Html_Attributes$class('mt-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt0Sm = _elm_lang$html$Html_Attributes$class('mt-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mAutoSm = _elm_lang$html$Html_Attributes$class('m-sm-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m5Sm = _elm_lang$html$Html_Attributes$class('m-sm-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m4Sm = _elm_lang$html$Html_Attributes$class('m-sm-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m3Sm = _elm_lang$html$Html_Attributes$class('m-sm-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m2Sm = _elm_lang$html$Html_Attributes$class('m-sm-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m1Sm = _elm_lang$html$Html_Attributes$class('m-sm-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m0Sm = _elm_lang$html$Html_Attributes$class('m-sm-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$myAuto = _elm_lang$html$Html_Attributes$class('my-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my5 = _elm_lang$html$Html_Attributes$class('my-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my4 = _elm_lang$html$Html_Attributes$class('my-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my3 = _elm_lang$html$Html_Attributes$class('my-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my2 = _elm_lang$html$Html_Attributes$class('my-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my1 = _elm_lang$html$Html_Attributes$class('my-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$my0 = _elm_lang$html$Html_Attributes$class('my-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mxAuto = _elm_lang$html$Html_Attributes$class('mx-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx5 = _elm_lang$html$Html_Attributes$class('mx-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx4 = _elm_lang$html$Html_Attributes$class('mx-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx3 = _elm_lang$html$Html_Attributes$class('mx-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx2 = _elm_lang$html$Html_Attributes$class('mx-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx1 = _elm_lang$html$Html_Attributes$class('mx-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mx0 = _elm_lang$html$Html_Attributes$class('mx-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mrAuto = _elm_lang$html$Html_Attributes$class('mr-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr5 = _elm_lang$html$Html_Attributes$class('mr-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr4 = _elm_lang$html$Html_Attributes$class('mr-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr3 = _elm_lang$html$Html_Attributes$class('mr-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr2 = _elm_lang$html$Html_Attributes$class('mr-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr1 = _elm_lang$html$Html_Attributes$class('mr-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mr0 = _elm_lang$html$Html_Attributes$class('mr-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mlAuto = _elm_lang$html$Html_Attributes$class('ml-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml5 = _elm_lang$html$Html_Attributes$class('ml-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml4 = _elm_lang$html$Html_Attributes$class('ml-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml3 = _elm_lang$html$Html_Attributes$class('ml-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml2 = _elm_lang$html$Html_Attributes$class('ml-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml1 = _elm_lang$html$Html_Attributes$class('ml-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml0 = _elm_lang$html$Html_Attributes$class('ml-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mbAuto = _elm_lang$html$Html_Attributes$class('mb-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb5 = _elm_lang$html$Html_Attributes$class('mb-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb4 = _elm_lang$html$Html_Attributes$class('mb-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb3 = _elm_lang$html$Html_Attributes$class('mb-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb2 = _elm_lang$html$Html_Attributes$class('mb-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb1 = _elm_lang$html$Html_Attributes$class('mb-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mb0 = _elm_lang$html$Html_Attributes$class('mb-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mtAuto = _elm_lang$html$Html_Attributes$class('mt-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt5 = _elm_lang$html$Html_Attributes$class('mt-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt4 = _elm_lang$html$Html_Attributes$class('mt-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3 = _elm_lang$html$Html_Attributes$class('mt-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt2 = _elm_lang$html$Html_Attributes$class('mt-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1 = _elm_lang$html$Html_Attributes$class('mt-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt0 = _elm_lang$html$Html_Attributes$class('mt-0');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mAuto = _elm_lang$html$Html_Attributes$class('m-auto');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m5 = _elm_lang$html$Html_Attributes$class('m-5');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m4 = _elm_lang$html$Html_Attributes$class('m-4');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m3 = _elm_lang$html$Html_Attributes$class('m-3');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m2 = _elm_lang$html$Html_Attributes$class('m-2');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m1 = _elm_lang$html$Html_Attributes$class('m-1');
var _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$m0 = _elm_lang$html$Html_Attributes$class('m-0');

var _user$project$Configuration$rewriteServer = 'https://lerewriteserver.xyz:8887';
var _user$project$Configuration$thisDomain = 'https://comby.live';

var _user$project$JsonRequest$jsonRewriteRequest = F7(
	function (source, match, rule, rewrite, language, substitutionKind, id) {
		var value = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'source',
					_1: _elm_lang$core$Json_Encode$string(source)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'match',
						_1: _elm_lang$core$Json_Encode$string(match)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'rule',
							_1: _elm_lang$core$Json_Encode$string(rule)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'rewrite',
								_1: _elm_lang$core$Json_Encode$string(rewrite)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'language',
									_1: _elm_lang$core$Json_Encode$string(language)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'substitution_kind',
										_1: _elm_lang$core$Json_Encode$string(substitutionKind)
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'id',
											_1: _elm_lang$core$Json_Encode$int(id)
										},
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			});
		return A2(_elm_lang$core$Json_Encode$encode, 0, value);
	});
var _user$project$JsonRequest$jsonMatchRequest = F5(
	function (source, match, rule, language, id) {
		var value = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'source',
					_1: _elm_lang$core$Json_Encode$string(source)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'match',
						_1: _elm_lang$core$Json_Encode$string(match)
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'rule',
							_1: _elm_lang$core$Json_Encode$string(rule)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'language',
								_1: _elm_lang$core$Json_Encode$string(language)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'id',
									_1: _elm_lang$core$Json_Encode$int(id)
								},
								_1: {ctor: '[]'}
							}
						}
					}
				}
			});
		return A2(_elm_lang$core$Json_Encode$encode, 0, value);
	});
var _user$project$JsonRequest$defaultRewriteRequest = {source: '', match: '', rule: 'where true', rewrite: '', language: '.generic', substitutionKind: ''};
var _user$project$JsonRequest$JsonRewriteRequest = F6(
	function (a, b, c, d, e, f) {
		return {source: a, match: b, rule: c, rewrite: d, language: e, substitutionKind: f};
	});
var _user$project$JsonRequest$jsonRewriteRequestDecoder = A7(
	_elm_lang$core$Json_Decode$map6,
	_user$project$JsonRequest$JsonRewriteRequest,
	A2(_elm_lang$core$Json_Decode$field, 'source', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'match', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'rule', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'rewrite', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'language', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'substitution_kind', _elm_lang$core$Json_Decode$string));

var _user$project$JsonResult$defaultLocation = {offset: 0, line: 0, column: 0};
var _user$project$JsonResult$Location = F3(
	function (a, b, c) {
		return {offset: a, line: b, column: c};
	});
var _user$project$JsonResult$locationDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_user$project$JsonResult$Location,
	A2(_elm_lang$core$Json_Decode$field, 'offset', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'line', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'column', _elm_lang$core$Json_Decode$int));
var _user$project$JsonResult$Range = F2(
	function (a, b) {
		return {start: a, end: b};
	});
var _user$project$JsonResult$rangeDecoder = A3(
	_elm_lang$core$Json_Decode$map2,
	_user$project$JsonResult$Range,
	A2(_elm_lang$core$Json_Decode$field, 'start', _user$project$JsonResult$locationDecoder),
	A2(_elm_lang$core$Json_Decode$field, 'end', _user$project$JsonResult$locationDecoder));
var _user$project$JsonResult$BindingValue = F3(
	function (a, b, c) {
		return {variable: a, value: b, range: c};
	});
var _user$project$JsonResult$bindingDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_user$project$JsonResult$BindingValue,
	A2(_elm_lang$core$Json_Decode$field, 'variable', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'value', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'range', _user$project$JsonResult$rangeDecoder));
var _user$project$JsonResult$environmentDecoder = _elm_lang$core$Json_Decode$list(_user$project$JsonResult$bindingDecoder);
var _user$project$JsonResult$Match = F3(
	function (a, b, c) {
		return {range: a, environment: b, matched: c};
	});
var _user$project$JsonResult$matchDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_user$project$JsonResult$Match,
	A2(_elm_lang$core$Json_Decode$field, 'range', _user$project$JsonResult$rangeDecoder),
	A2(_elm_lang$core$Json_Decode$field, 'environment', _user$project$JsonResult$environmentDecoder),
	A2(_elm_lang$core$Json_Decode$field, 'matched', _elm_lang$core$Json_Decode$string));
var _user$project$JsonResult$JsonMatchResult = F3(
	function (a, b, c) {
		return {matches: a, source: b, id: c};
	});
var _user$project$JsonResult$matchResultDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_user$project$JsonResult$JsonMatchResult,
	A2(
		_elm_lang$core$Json_Decode$field,
		'matches',
		_elm_lang$core$Json_Decode$list(_user$project$JsonResult$matchDecoder)),
	A2(_elm_lang$core$Json_Decode$field, 'source', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));
var _user$project$JsonResult$InPlaceSubstitution = F3(
	function (a, b, c) {
		return {range: a, environment: b, replacement_content: c};
	});
var _user$project$JsonResult$inPlaceSubstitutionDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_user$project$JsonResult$InPlaceSubstitution,
	A2(_elm_lang$core$Json_Decode$field, 'range', _user$project$JsonResult$rangeDecoder),
	A2(_elm_lang$core$Json_Decode$field, 'environment', _user$project$JsonResult$environmentDecoder),
	A2(_elm_lang$core$Json_Decode$field, 'replacement_content', _elm_lang$core$Json_Decode$string));
var _user$project$JsonResult$JsonRewriteResult = F3(
	function (a, b, c) {
		return {in_place_substitutions: a, rewritten_source: b, id: c};
	});
var _user$project$JsonResult$rewriteResultDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_user$project$JsonResult$JsonRewriteResult,
	A2(
		_elm_lang$core$Json_Decode$field,
		'in_place_substitutions',
		_elm_lang$core$Json_Decode$list(_user$project$JsonResult$inPlaceSubstitutionDecoder)),
	A2(_elm_lang$core$Json_Decode$field, 'rewritten_source', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$int));

var _user$project$Types$Flags = {};
var _user$project$Types$Model = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return function (o) {
															return function (p) {
																return function (q) {
																	return function (r) {
																		return function (s) {
																			return function (t) {
																				return function (u) {
																					return function (v) {
																						return function (w) {
																							return function (x) {
																								return {page: a, matchResult: b, matchTemplateInput: c, ruleInput: d, ruleSyntaxErrors: e, rewriteTemplateInput: f, sourceInput: g, rewriteResult: h, debug: i, url: j, prettyUrl: k, serverConnected: l, language: m, substitutionKind: n, copyButtonLinkText: o, copyButtonTerminalText: p, copyButtonTextInPlace: q, currentRewriteResultId: r, currentMatchResultId: s, modalTerminalVisibility: t, modalText: u, modalAboutVisibility: v, theme: w, rotation: x};
																							};
																						};
																					};
																				};
																			};
																		};
																	};
																};
															};
														};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _user$project$Types$NotFound = {ctor: 'NotFound'};
var _user$project$Types$SourcePage = {ctor: 'SourcePage'};
var _user$project$Types$Light = {ctor: 'Light'};
var _user$project$Types$Dark = {ctor: 'Dark'};
var _user$project$Types$Horizontal = {ctor: 'Horizontal'};
var _user$project$Types$Vertical = {ctor: 'Vertical'};
var _user$project$Types$XML = {ctor: 'XML'};
var _user$project$Types$Text = {ctor: 'Text'};
var _user$project$Types$Swift = {ctor: 'Swift'};
var _user$project$Types$SQL = {ctor: 'SQL'};
var _user$project$Types$Scala = {ctor: 'Scala'};
var _user$project$Types$Rust = {ctor: 'Rust'};
var _user$project$Types$Ruby = {ctor: 'Ruby'};
var _user$project$Types$Python = {ctor: 'Python'};
var _user$project$Types$Php = {ctor: 'Php'};
var _user$project$Types$OCaml = {ctor: 'OCaml'};
var _user$project$Types$Latex = {ctor: 'Latex'};
var _user$project$Types$Json = {ctor: 'Json'};
var _user$project$Types$Javascript = {ctor: 'Javascript'};
var _user$project$Types$Java = {ctor: 'Java'};
var _user$project$Types$Go = {ctor: 'Go'};
var _user$project$Types$Haskell = {ctor: 'Haskell'};
var _user$project$Types$Html = {ctor: 'Html'};
var _user$project$Types$Elixir = {ctor: 'Elixir'};
var _user$project$Types$Erlang = {ctor: 'Erlang'};
var _user$project$Types$Elm = {ctor: 'Elm'};
var _user$project$Types$Dart = {ctor: 'Dart'};
var _user$project$Types$CSS = {ctor: 'CSS'};
var _user$project$Types$Clojure = {ctor: 'Clojure'};
var _user$project$Types$Cpp = {ctor: 'Cpp'};
var _user$project$Types$Bash = {ctor: 'Bash'};
var _user$project$Types$Assembly = {ctor: 'Assembly'};
var _user$project$Types$Generic = {ctor: 'Generic'};
var _user$project$Types$NewlineSeparated = {ctor: 'NewlineSeparated'};
var _user$project$Types$InPlace = {ctor: 'InPlace'};
var _user$project$Types$ChangeRotation = function (a) {
	return {ctor: 'ChangeRotation', _0: a};
};
var _user$project$Types$Theme = function (a) {
	return {ctor: 'Theme', _0: a};
};
var _user$project$Types$CopyTerminalCommandInPlaceClicked = {ctor: 'CopyTerminalCommandInPlaceClicked'};
var _user$project$Types$CopyTerminalCommandClicked = {ctor: 'CopyTerminalCommandClicked'};
var _user$project$Types$ShowAboutModal = {ctor: 'ShowAboutModal'};
var _user$project$Types$CloseAboutModal = {ctor: 'CloseAboutModal'};
var _user$project$Types$ShowTerminalModal = {ctor: 'ShowTerminalModal'};
var _user$project$Types$CloseTerminalModal = {ctor: 'CloseTerminalModal'};
var _user$project$Types$ShortenUrlResult = function (a) {
	return {ctor: 'ShortenUrlResult', _0: a};
};
var _user$project$Types$CopyShareLinkClicked = {ctor: 'CopyShareLinkClicked'};
var _user$project$Types$DocsLinkClicked = {ctor: 'DocsLinkClicked'};
var _user$project$Types$ShareLinkClicked = {ctor: 'ShareLinkClicked'};
var _user$project$Types$MatchesResult = function (a) {
	return {ctor: 'MatchesResult', _0: a};
};
var _user$project$Types$RewriteResult = function (a) {
	return {ctor: 'RewriteResult', _0: a};
};
var _user$project$Types$SubstitutionKindInputUpdated = function (a) {
	return {ctor: 'SubstitutionKindInputUpdated', _0: a};
};
var _user$project$Types$LanguageInputUpdated = function (a) {
	return {ctor: 'LanguageInputUpdated', _0: a};
};
var _user$project$Types$RewriteTemplateInputUpdated = function (a) {
	return {ctor: 'RewriteTemplateInputUpdated', _0: a};
};
var _user$project$Types$RuleInputUpdated = function (a) {
	return {ctor: 'RuleInputUpdated', _0: a};
};
var _user$project$Types$SourceInputUpdated = function (a) {
	return {ctor: 'SourceInputUpdated', _0: a};
};
var _user$project$Types$MatchTemplateInputUpdated = function (a) {
	return {ctor: 'MatchTemplateInputUpdated', _0: a};
};
var _user$project$Types$OnLocationChange = function (a) {
	return {ctor: 'OnLocationChange', _0: a};
};

var _user$project$LanguageExtension$toString = function (s) {
	var _p0 = s;
	switch (_p0.ctor) {
		case 'Generic':
			return '.generic';
		case 'Cpp':
			return '.c';
		case 'Clojure':
			return '.clj';
		case 'CSS':
			return '.css';
		case 'Dart':
			return '.dart';
		case 'Elm':
			return '.elm';
		case 'Erlang':
			return '.erl';
		case 'Elixir':
			return '.ex';
		case 'Html':
			return '.html';
		case 'Haskell':
			return '.hs';
		case 'Go':
			return '.go';
		case 'Java':
			return '.java';
		case 'Javascript':
			return '.js';
		case 'Json':
			return '.json';
		case 'OCaml':
			return '.ml';
		case 'Php':
			return '.php';
		case 'Python':
			return '.py';
		case 'Ruby':
			return '.rb';
		case 'Rust':
			return '.rs';
		case 'Assembly':
			return '.s';
		case 'Scala':
			return '.scala';
		case 'SQL':
			return '.sql';
		case 'Bash':
			return '.sh';
		case 'Swift':
			return '.swift';
		case 'Latex':
			return '.tex';
		case 'Text':
			return '.txt';
		default:
			return '.xml';
	}
};
var _user$project$LanguageExtension$prettyName = function (s) {
	var _p1 = s;
	switch (_p1.ctor) {
		case 'Generic':
			return 'Generic';
		case 'Bash':
			return 'Bash';
		case 'Cpp':
			return 'C/C++';
		case 'Clojure':
			return 'Clojure';
		case 'CSS':
			return 'CSS';
		case 'Dart':
			return 'Dart';
		case 'Elm':
			return 'Elm';
		case 'Erlang':
			return 'Erlang';
		case 'Elixir':
			return 'Elixir';
		case 'Html':
			return 'HTML/XML';
		case 'Haskell':
			return 'Haskell';
		case 'Go':
			return 'Go';
		case 'Java':
			return 'Java';
		case 'Javascript':
			return 'JS/Typescript';
		case 'Json':
			return 'JSON';
		case 'OCaml':
			return 'OCaml';
		case 'Php':
			return 'PHP';
		case 'Python':
			return 'Python';
		case 'Ruby':
			return 'Ruby';
		case 'Rust':
			return 'Rust';
		case 'Assembly':
			return 'Assembly';
		case 'Scala':
			return 'Scala';
		case 'SQL':
			return 'SQL';
		case 'Swift':
			return 'Swift';
		case 'Latex':
			return 'Latex';
		case 'Text':
			return 'Text';
		default:
			return 'XML';
	}
};
var _user$project$LanguageExtension$ofString = function (s) {
	var _p2 = s;
	switch (_p2) {
		case '.c':
			return _user$project$Types$Cpp;
		case '.clj':
			return _user$project$Types$Clojure;
		case '.css':
			return _user$project$Types$CSS;
		case '.dart':
			return _user$project$Types$Dart;
		case '.elm':
			return _user$project$Types$Elm;
		case '.erl':
			return _user$project$Types$Erlang;
		case '.ex':
			return _user$project$Types$Elixir;
		case '.html':
			return _user$project$Types$Html;
		case '.xml':
			return _user$project$Types$Html;
		case '.hs':
			return _user$project$Types$Haskell;
		case '.go':
			return _user$project$Types$Go;
		case '.java':
			return _user$project$Types$Java;
		case '.js':
			return _user$project$Types$Javascript;
		case '.json':
			return _user$project$Types$Json;
		case '.ml':
			return _user$project$Types$OCaml;
		case '.mli':
			return _user$project$Types$OCaml;
		case '.php':
			return _user$project$Types$Php;
		case '.py':
			return _user$project$Types$Python;
		case '.rb':
			return _user$project$Types$Ruby;
		case '.rs':
			return _user$project$Types$Rust;
		case '.s':
			return _user$project$Types$Assembly;
		case '.asm':
			return _user$project$Types$Assembly;
		case '.scala':
			return _user$project$Types$Scala;
		case '.sql':
			return _user$project$Types$SQL;
		case '.sh':
			return _user$project$Types$Bash;
		case '.swift':
			return _user$project$Types$Swift;
		case '.tex':
			return _user$project$Types$Latex;
		case '.txt':
			return _user$project$Types$Text;
		case '.bib':
			return _user$project$Types$Latex;
		default:
			return _user$project$Types$Generic;
	}
};
var _user$project$LanguageExtension$all = {
	ctor: '::',
	_0: _user$project$Types$Generic,
	_1: {
		ctor: '::',
		_0: _user$project$Types$Assembly,
		_1: {
			ctor: '::',
			_0: _user$project$Types$Bash,
			_1: {
				ctor: '::',
				_0: _user$project$Types$Cpp,
				_1: {
					ctor: '::',
					_0: _user$project$Types$Clojure,
					_1: {
						ctor: '::',
						_0: _user$project$Types$CSS,
						_1: {
							ctor: '::',
							_0: _user$project$Types$Dart,
							_1: {
								ctor: '::',
								_0: _user$project$Types$Elm,
								_1: {
									ctor: '::',
									_0: _user$project$Types$Erlang,
									_1: {
										ctor: '::',
										_0: _user$project$Types$Elixir,
										_1: {
											ctor: '::',
											_0: _user$project$Types$Html,
											_1: {
												ctor: '::',
												_0: _user$project$Types$Haskell,
												_1: {
													ctor: '::',
													_0: _user$project$Types$Go,
													_1: {
														ctor: '::',
														_0: _user$project$Types$Java,
														_1: {
															ctor: '::',
															_0: _user$project$Types$Javascript,
															_1: {
																ctor: '::',
																_0: _user$project$Types$Json,
																_1: {
																	ctor: '::',
																	_0: _user$project$Types$Latex,
																	_1: {
																		ctor: '::',
																		_0: _user$project$Types$OCaml,
																		_1: {
																			ctor: '::',
																			_0: _user$project$Types$Php,
																			_1: {
																				ctor: '::',
																				_0: _user$project$Types$Python,
																				_1: {
																					ctor: '::',
																					_0: _user$project$Types$Ruby,
																					_1: {
																						ctor: '::',
																						_0: _user$project$Types$Rust,
																						_1: {
																							ctor: '::',
																							_0: _user$project$Types$Scala,
																							_1: {
																								ctor: '::',
																								_0: _user$project$Types$SQL,
																								_1: {
																									ctor: '::',
																									_0: _user$project$Types$Swift,
																									_1: {
																										ctor: '::',
																										_0: _user$project$Types$XML,
																										_1: {
																											ctor: '::',
																											_0: _user$project$Types$Text,
																											_1: {ctor: '[]'}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};

var _user$project$Mock$empty = function (model) {
	return _elm_lang$core$Native_Utils.update(
		model,
		{
			matchResult: {
				matches: {ctor: '[]'},
				source: '',
				id: 0
			},
			rewriteResult: {
				in_place_substitutions: {ctor: '[]'},
				rewritten_source: '',
				id: 0
			}
		});
};
var _user$project$Mock$rewriteOutput = {
	in_place_substitutions: {ctor: '[]'},
	rewritten_source: '',
	id: 0
};
var _user$project$Mock$rewriteTemplate = 'return (:[1])';
var _user$project$Mock$rewrite = {
	in_place_substitutions: {ctor: '[]'},
	rewritten_source: '',
	id: 0
};
var _user$project$Mock$match = {
	matches: {ctor: '[]'},
	source: '',
	id: 0
};
var _user$project$Mock$matchTemplate = 'if :[1] {\n  return true\n}\nreturn false';
var _user$project$Mock$source = 'this here don\'t match\nif derp == true {\n  return true\n}\nreturn false\n...';
var _user$project$Mock$default = function (model) {
	return _elm_lang$core$Native_Utils.update(
		model,
		{matchResult: _user$project$Mock$match, rewriteResult: _user$project$Mock$rewriteOutput, matchTemplateInput: _user$project$Mock$matchTemplate, rewriteTemplateInput: _user$project$Mock$rewriteTemplate, sourceInput: _user$project$Mock$source});
};

var _user$project$Ports$highlightMatchRanges = _elm_lang$core$Native_Platform.outgoingPort(
	'highlightMatchRanges',
	function (v) {
		return {
			matches: _elm_lang$core$Native_List.toArray(v.matches).map(
				function (v) {
					return {
						range: {
							start: {offset: v.range.start.offset, line: v.range.start.line, column: v.range.start.column},
							end: {offset: v.range.end.offset, line: v.range.end.line, column: v.range.end.column}
						},
						environment: _elm_lang$core$Native_List.toArray(v.environment).map(
							function (v) {
								return {
									variable: v.variable,
									value: v.value,
									range: {
										start: {offset: v.range.start.offset, line: v.range.start.line, column: v.range.start.column},
										end: {offset: v.range.end.offset, line: v.range.end.line, column: v.range.end.column}
									}
								};
							}),
						matched: v.matched
					};
				}),
			source: v.source,
			id: v.id
		};
	});
var _user$project$Ports$highlightRewriteRanges = _elm_lang$core$Native_Platform.outgoingPort(
	'highlightRewriteRanges',
	function (v) {
		return {
			in_place_substitutions: _elm_lang$core$Native_List.toArray(v.in_place_substitutions).map(
				function (v) {
					return {
						range: {
							start: {offset: v.range.start.offset, line: v.range.start.line, column: v.range.start.column},
							end: {offset: v.range.end.offset, line: v.range.end.line, column: v.range.end.column}
						},
						environment: _elm_lang$core$Native_List.toArray(v.environment).map(
							function (v) {
								return {
									variable: v.variable,
									value: v.value,
									range: {
										start: {offset: v.range.start.offset, line: v.range.start.line, column: v.range.start.column},
										end: {offset: v.range.end.offset, line: v.range.end.line, column: v.range.end.column}
									}
								};
							}),
						replacement_content: v.replacement_content
					};
				}),
			rewritten_source: v.rewritten_source,
			id: v.id
		};
	});
var _user$project$Ports$clear = _elm_lang$core$Native_Platform.outgoingPort(
	'clear',
	function (v) {
		return null;
	});
var _user$project$Ports$copyToClipboard = _elm_lang$core$Native_Platform.outgoingPort(
	'copyToClipboard',
	function (v) {
		return v;
	});

var _user$project$SubstitutionKind$toString = function (s) {
	var _p0 = s;
	if (_p0.ctor === 'InPlace') {
		return 'in_place';
	} else {
		return 'newline_separated';
	}
};
var _user$project$SubstitutionKind$ofString = function (s) {
	var _p1 = s;
	switch (_p1) {
		case 'newline_separated':
			return _user$project$Types$NewlineSeparated;
		case 'in_place':
			return _user$project$Types$InPlace;
		default:
			return _user$project$Types$InPlace;
	}
};

var _user$project$Token$t = 'Bearer c5e5814216183a3a53a1ad5bc030c5071b98af07';

var _user$project$Controller$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{ctor: '[]'});
};
var _user$project$Controller$loadInitialStaticState = F2(
	function (flags, location) {
		var result = function () {
			var s = A2(
				_elm_lang$core$Maybe$withDefault,
				'',
				_elm_lang$http$Http$decodeUri(
					A2(_elm_lang$core$String$dropLeft, 1, location.hash)));
			var _p0 = A2(_elm_lang$core$Json_Decode$decodeString, _user$project$JsonRequest$jsonRewriteRequestDecoder, s);
			if (_p0.ctor === 'Ok') {
				return _p0._0;
			} else {
				return _user$project$JsonRequest$defaultRewriteRequest;
			}
		}();
		var language = _user$project$LanguageExtension$ofString(result.language);
		var substitutionKind = _user$project$SubstitutionKind$ofString(result.substitutionKind);
		return {
			page: _user$project$Types$SourcePage,
			matchResult: {
				matches: {ctor: '[]'},
				source: '',
				id: 0
			},
			sourceInput: result.source,
			matchTemplateInput: result.match,
			ruleInput: result.rule,
			ruleSyntaxErrors: '',
			rewriteTemplateInput: result.rewrite,
			rewriteResult: {
				in_place_substitutions: {ctor: '[]'},
				rewritten_source: '',
				id: 0
			},
			debug: false,
			url: '',
			prettyUrl: '',
			serverConnected: false,
			language: language,
			substitutionKind: substitutionKind,
			copyButtonLinkText: 'fa fa-copy',
			copyButtonTerminalText: 'fa fa-copy',
			copyButtonTextInPlace: 'fa fa-copy',
			currentRewriteResultId: 0,
			currentMatchResultId: 0,
			modalTerminalVisibility: _rundis$elm_bootstrap$Bootstrap_Modal$hidden,
			modalText: '',
			modalAboutVisibility: _rundis$elm_bootstrap$Bootstrap_Modal$hidden,
			theme: _user$project$Types$Dark,
			rotation: _user$project$Types$Horizontal
		};
	});
var _user$project$Controller$jsonFromModel = function (model) {
	var substitutionKindInput = _user$project$SubstitutionKind$toString(model.substitutionKind);
	var rule = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$String$length(model.ruleInput),
		0) ? 'where true' : model.ruleInput;
	var languageInput = _user$project$LanguageExtension$toString(model.language);
	return A7(_user$project$JsonRequest$jsonRewriteRequest, model.sourceInput, model.matchTemplateInput, rule, model.rewriteTemplateInput, languageInput, substitutionKindInput, 0);
};
var _user$project$Controller$rewriteEndpoint = A2(_elm_lang$core$Basics_ops['++'], _user$project$Configuration$rewriteServer, '/rewrite');
var _user$project$Controller$matchEndpoint = A2(_elm_lang$core$Basics_ops['++'], _user$project$Configuration$rewriteServer, '/match');
var _user$project$Controller$terminalCommand = F2(
	function (model, extraOption) {
		var zeroInstall = '# Install comby with `bash <(curl -sL get.comby.dev)` or see github.com/comby-tools/comby && \\\n';
		var _p1 = _elm_lang$core$Native_Utils.eq(model.ruleInput, 'where true') ? {ctor: '_Tuple2', _0: '', _1: ''} : {
			ctor: '_Tuple2',
			_0: A2(
				_elm_lang$core$Basics_ops['++'],
				'COMBY_RULE=\"$(cat <<\"RULE\"\n',
				A2(_elm_lang$core$Basics_ops['++'], model.ruleInput, '\nRULE\n)\"\n')),
			_1: ' -rule \"$COMBY_RULE\"'
		};
		var ruleEnv = _p1._0;
		var rule = _p1._1;
		var _p2 = _elm_lang$core$Native_Utils.eq(model.rewriteTemplateInput, '') ? {ctor: '_Tuple2', _0: '', _1: '\'\''} : {
			ctor: '_Tuple2',
			_0: A2(
				_elm_lang$core$Basics_ops['++'],
				'COMBY_R=\"$(cat <<\"REWRITE\"\n',
				A2(_elm_lang$core$Basics_ops['++'], model.rewriteTemplateInput, '\nREWRITE\n)\"\n')),
			_1: '\"$COMBY_R\"'
		};
		var rewriteTemplateEnv = _p2._0;
		var rewriteVar = _p2._1;
		var matchTemplate = A2(
			_elm_lang$core$Basics_ops['++'],
			'COMBY_M=\"$(cat <<\"MATCH\"\n',
			A2(_elm_lang$core$Basics_ops['++'], model.matchTemplateInput, '\nMATCH\n)\"\n'));
		var languageFilter = function () {
			var s = _user$project$LanguageExtension$toString(model.language);
			return _elm_lang$core$Native_Utils.eq(s, '.generic') ? '' : s;
		}();
		var text = _elm_lang$core$Native_Utils.eq(model.matchTemplateInput, '') ? 'First enter a match template :)' : A2(
			_elm_lang$core$Basics_ops['++'],
			matchTemplate,
			A2(
				_elm_lang$core$Basics_ops['++'],
				rewriteTemplateEnv,
				A2(
					_elm_lang$core$Basics_ops['++'],
					ruleEnv,
					A2(
						_elm_lang$core$Basics_ops['++'],
						zeroInstall,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'comby \"$COMBY_M\" ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								rewriteVar,
								A2(
									_elm_lang$core$Basics_ops['++'],
									' ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										rule,
										A2(
											_elm_lang$core$Basics_ops['++'],
											' ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												languageFilter,
												A2(
													_elm_lang$core$Basics_ops['++'],
													' ',
													A2(_elm_lang$core$Basics_ops['++'], '-stats', extraOption))))))))))));
		return text;
	});
var _user$project$Controller$debug = false;
var _user$project$Controller$log = F2(
	function (s, a) {
		if (_user$project$Controller$debug) {
			var _p3 = A2(_elm_lang$core$Debug$log, s, a);
			return {ctor: '_Tuple0'};
		} else {
			return {ctor: '_Tuple0'};
		}
	});
var _user$project$Controller$getShortUrl = function (model) {
	var urlToShorten = A2(
		_elm_lang$core$Basics_ops['++'],
		_user$project$Configuration$thisDomain,
		A2(
			_elm_lang$core$Basics_ops['++'],
			'/index.html#',
			_elm_lang$http$Http$encodeUri(
				_user$project$Controller$jsonFromModel(model))));
	var v = A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_elm_lang$core$Json_Encode$string(urlToShorten));
	var _p4 = A2(_user$project$Controller$log, 'getShortUrl', v);
	var myRequest = _elm_lang$http$Http$request(
		{
			method: 'POST',
			headers: {
				ctor: '::',
				_0: A2(_elm_lang$http$Http$header, 'Authorization', _user$project$Token$t),
				_1: {ctor: '[]'}
			},
			url: 'https://api-ssl.bitly.com/v4/bitlinks',
			body: A2(
				_elm_lang$http$Http$stringBody,
				'application/json',
				A2(
					_elm_lang$core$Basics_ops['++'],
					'{\"long_url\": ',
					A2(_elm_lang$core$Basics_ops['++'], v, '}'))),
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
	return A2(_elm_lang$http$Http$send, _user$project$Types$ShortenUrlResult, myRequest);
};
var _user$project$Controller$getMatches = F5(
	function (sourceInput, matchTemplateInput, ruleInput, languageInput, id) {
		var rule = _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$String$length(ruleInput),
			0) ? 'where true' : ruleInput;
		var language = _user$project$LanguageExtension$toString(languageInput);
		var json = A5(_user$project$JsonRequest$jsonMatchRequest, sourceInput, matchTemplateInput, rule, language, id);
		var _p5 = A2(_user$project$Controller$log, 'getMatches:', json);
		return A2(
			_elm_lang$http$Http$send,
			_user$project$Types$MatchesResult,
			A3(
				_elm_lang$http$Http$post,
				_user$project$Controller$matchEndpoint,
				A2(_elm_lang$http$Http$stringBody, 'text/plain', json),
				_user$project$JsonResult$matchResultDecoder));
	});
var _user$project$Controller$getRewrite = F7(
	function (sourceInput, matchTemplateInput, ruleInput, rewriteTemplateInput, languageInput, substitutionKindInput, id) {
		var substitutionKind = _user$project$SubstitutionKind$toString(substitutionKindInput);
		var rule = _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$String$length(ruleInput),
			0) ? 'where true' : ruleInput;
		var language = _user$project$LanguageExtension$toString(languageInput);
		var json = A7(_user$project$JsonRequest$jsonRewriteRequest, sourceInput, matchTemplateInput, rule, rewriteTemplateInput, language, substitutionKind, id);
		var _p6 = A2(_user$project$Controller$log, 'getRewrite', json);
		return A2(
			_elm_lang$http$Http$send,
			_user$project$Types$RewriteResult,
			A3(
				_elm_lang$http$Http$post,
				_user$project$Controller$rewriteEndpoint,
				A2(_elm_lang$http$Http$stringBody, 'text/plain', json),
				_user$project$JsonResult$rewriteResultDecoder));
	});
var _user$project$Controller$init = F2(
	function (flags, location) {
		var model = A2(_user$project$Controller$loadInitialStaticState, flags, location);
		var _p7 = A2(_user$project$Controller$log, 'Flags', flags);
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: A5(_user$project$Controller$getMatches, model.sourceInput, model.matchTemplateInput, model.ruleInput, model.language, model.currentMatchResultId),
					_1: {
						ctor: '::',
						_0: A7(_user$project$Controller$getRewrite, model.sourceInput, model.matchTemplateInput, model.ruleInput, model.rewriteTemplateInput, model.language, model.substitutionKind, model.currentRewriteResultId),
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Controller$update = F2(
	function (msg, model) {
		var new_model = _elm_lang$core$Native_Utils.update(
			model,
			{copyButtonLinkText: 'fa fa-copy', copyButtonTerminalText: 'fa fa-copy'});
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'OnLocationChange':
				return {ctor: '_Tuple2', _0: new_model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'MatchTemplateInputUpdated':
				var _p10 = _p8._0;
				var currentRewriteResultId = model.currentRewriteResultId + 1;
				var currentMatchResultId = model.currentMatchResultId + 1;
				var new_model = _elm_lang$core$Native_Utils.update(
					model,
					{currentMatchResultId: currentMatchResultId, currentRewriteResultId: currentRewriteResultId, prettyUrl: ''});
				var _p9 = A2(_user$project$Controller$log, 'MatchTemplateUpdated', _p10);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{matchTemplateInput: _p10}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: A5(_user$project$Controller$getMatches, new_model.sourceInput, _p10, new_model.ruleInput, new_model.language, new_model.currentMatchResultId),
							_1: {
								ctor: '::',
								_0: A7(_user$project$Controller$getRewrite, new_model.sourceInput, _p10, new_model.ruleInput, new_model.rewriteTemplateInput, new_model.language, new_model.substitutionKind, new_model.currentRewriteResultId),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'SourceInputUpdated':
				var _p12 = _p8._0;
				var currentRewriteResultId = model.currentRewriteResultId + 1;
				var currentMatchResultId = model.currentMatchResultId + 1;
				var new_model = _elm_lang$core$Native_Utils.update(
					model,
					{currentMatchResultId: currentMatchResultId, currentRewriteResultId: currentRewriteResultId, prettyUrl: ''});
				var _p11 = A2(_user$project$Controller$log, 'SourceInputUpdated', _p12);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{sourceInput: _p12}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: A5(_user$project$Controller$getMatches, _p12, new_model.matchTemplateInput, new_model.ruleInput, new_model.language, new_model.currentMatchResultId),
							_1: {
								ctor: '::',
								_0: A7(_user$project$Controller$getRewrite, _p12, new_model.matchTemplateInput, new_model.ruleInput, new_model.rewriteTemplateInput, new_model.language, new_model.substitutionKind, new_model.currentRewriteResultId),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'RuleInputUpdated':
				var _p13 = _p8._0;
				var currentRewriteResultId = model.currentRewriteResultId + 1;
				var currentMatchResultId = model.currentMatchResultId + 1;
				var new_model = _elm_lang$core$Native_Utils.update(
					model,
					{currentMatchResultId: currentMatchResultId, currentRewriteResultId: currentRewriteResultId, prettyUrl: ''});
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{ruleInput: _p13}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: A5(_user$project$Controller$getMatches, new_model.sourceInput, new_model.matchTemplateInput, _p13, new_model.language, new_model.currentMatchResultId),
							_1: {
								ctor: '::',
								_0: A7(_user$project$Controller$getRewrite, new_model.sourceInput, new_model.matchTemplateInput, _p13, new_model.rewriteTemplateInput, new_model.language, new_model.substitutionKind, new_model.currentRewriteResultId),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'RewriteTemplateInputUpdated':
				var _p14 = _p8._0;
				var currentRewriteResultId = model.currentRewriteResultId + 1;
				var new_model = _elm_lang$core$Native_Utils.update(
					model,
					{currentRewriteResultId: currentRewriteResultId, prettyUrl: ''});
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{rewriteTemplateInput: _p14}),
					_1: A7(_user$project$Controller$getRewrite, new_model.sourceInput, new_model.matchTemplateInput, new_model.ruleInput, _p14, new_model.language, new_model.substitutionKind, new_model.currentRewriteResultId)
				};
			case 'MatchesResult':
				if (_p8._0.ctor === 'Ok') {
					var _p18 = _p8._0._0;
					var _p15 = A2(_user$project$Controller$log, 'current id match is', model.currentMatchResultId);
					var _p16 = A2(_user$project$Controller$log, 'Resp Match id', _p18.id);
					var _p17 = A2(_user$project$Controller$log, 'MatchResult', _p18);
					return (_elm_lang$core$Native_Utils.cmp(_p18.id, model.currentMatchResultId) > -1) ? {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							new_model,
							{matchResult: _p18, serverConnected: true, ruleSyntaxErrors: '', currentMatchResultId: _p18.id}),
						_1: _user$project$Ports$highlightMatchRanges(_p18)
					} : {ctor: '_Tuple2', _0: new_model, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					var _p23 = _p8._0._0;
					var _p19 = A2(_user$project$Controller$log, 'MatchResultError', _p23);
					var _p20 = _p23;
					if (_p20.ctor === 'BadStatus') {
						var _p22 = _p20._0;
						var _p21 = A2(_user$project$Controller$log, 'MatchResultError body', _p22.body);
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								new_model,
								{ruleSyntaxErrors: _p22.body}),
							_1: _user$project$Ports$highlightMatchRanges(_user$project$Mock$match)
						};
					} else {
						return {
							ctor: '_Tuple2',
							_0: new_model,
							_1: _user$project$Ports$highlightMatchRanges(_user$project$Mock$match)
						};
					}
				}
			case 'RewriteResult':
				if (_p8._0.ctor === 'Ok') {
					var _p27 = _p8._0._0;
					var _p24 = A2(_user$project$Controller$log, 'current rewrite id is', model.currentMatchResultId);
					var _p25 = A2(_user$project$Controller$log, 'Resp Rewrite id', _p27.id);
					var _p26 = A2(_user$project$Controller$log, 'RewriteResult', _p27);
					return (_elm_lang$core$Native_Utils.cmp(_p27.id, model.currentRewriteResultId) > -1) ? {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							new_model,
							{rewriteResult: _p27, serverConnected: true, ruleSyntaxErrors: '', currentRewriteResultId: _p27.id}),
						_1: _user$project$Ports$highlightRewriteRanges(_p27)
					} : {ctor: '_Tuple2', _0: new_model, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					var _p32 = _p8._0._0;
					var _p28 = A2(_user$project$Controller$log, 'RewriteResultError', _p32);
					var _p29 = _p32;
					if (_p29.ctor === 'BadStatus') {
						var _p31 = _p29._0;
						var _p30 = A2(_user$project$Controller$log, 'RewriteResultError body', _p31.body);
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								new_model,
								{ruleSyntaxErrors: _p31.body}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						return {ctor: '_Tuple2', _0: new_model, _1: _elm_lang$core$Platform_Cmd$none};
					}
				}
			case 'ShareLinkClicked':
				return {
					ctor: '_Tuple2',
					_0: new_model,
					_1: _user$project$Controller$getShortUrl(new_model)
				};
			case 'CopyShareLinkClicked':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{copyButtonLinkText: 'fa fa-check'}),
					_1: _user$project$Ports$copyToClipboard(model.url)
				};
			case 'DocsLinkClicked':
				return {
					ctor: '_Tuple2',
					_0: new_model,
					_1: _elm_lang$navigation$Navigation$load('https://comby.dev/#basic-usage')
				};
			case 'ShortenUrlResult':
				if (_p8._0.ctor === 'Ok') {
					var _p33 = A2(
						_elm_lang$core$Json_Decode$decodeString,
						A2(_elm_lang$core$Json_Decode$field, 'id', _elm_lang$core$Json_Decode$string),
						_p8._0._0);
					if (_p33.ctor === 'Ok') {
						var _p34 = _p33._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								new_model,
								{url: _p34, prettyUrl: _p34}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					} else {
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								new_model,
								{url: ''}),
							_1: _elm_lang$core$Platform_Cmd$none
						};
					}
				} else {
					var urlPath = A2(
						_elm_lang$core$Basics_ops['++'],
						'index.html#',
						_elm_lang$http$Http$encodeUri(
							_user$project$Controller$jsonFromModel(model)));
					var fullUrl = A2(
						_elm_lang$core$Basics_ops['++'],
						_user$project$Configuration$thisDomain,
						A2(_elm_lang$core$Basics_ops['++'], '/', urlPath));
					var _p35 = A2(_user$project$Controller$log, 'Generate URL Error. Using long URL', _p8._0._0);
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							new_model,
							{url: fullUrl, prettyUrl: 'Too much data for a short link. Copy for a long one :)'}),
						_1: _elm_lang$navigation$Navigation$modifyUrl(urlPath)
					};
				}
			case 'LanguageInputUpdated':
				var _p36 = _p8._0;
				var currentRewriteResultId = model.currentRewriteResultId + 1;
				var currentMatchResultId = model.currentMatchResultId + 1;
				var new_model = _elm_lang$core$Native_Utils.update(
					model,
					{currentMatchResultId: currentMatchResultId, currentRewriteResultId: currentRewriteResultId});
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{language: _p36}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: A5(_user$project$Controller$getMatches, new_model.sourceInput, new_model.matchTemplateInput, new_model.ruleInput, _p36, new_model.currentMatchResultId),
							_1: {
								ctor: '::',
								_0: A7(_user$project$Controller$getRewrite, new_model.sourceInput, new_model.matchTemplateInput, new_model.ruleInput, new_model.rewriteTemplateInput, _p36, new_model.substitutionKind, new_model.currentRewriteResultId),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'SubstitutionKindInputUpdated':
				var _p38 = _p8._0;
				var currentRewriteResultId = model.currentRewriteResultId + 1;
				var currentMatchResultId = model.currentMatchResultId + 1;
				var new_model = _elm_lang$core$Native_Utils.update(
					model,
					{currentMatchResultId: currentMatchResultId, currentRewriteResultId: currentRewriteResultId});
				var _p37 = A2(_user$project$Controller$log, 'SubstitutionKindInputUpdated', _p38);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						new_model,
						{substitutionKind: _p38}),
					_1: _elm_lang$core$Platform_Cmd$batch(
						{
							ctor: '::',
							_0: A5(_user$project$Controller$getMatches, new_model.sourceInput, new_model.matchTemplateInput, new_model.ruleInput, new_model.language, new_model.currentMatchResultId),
							_1: {
								ctor: '::',
								_0: A7(_user$project$Controller$getRewrite, new_model.sourceInput, new_model.matchTemplateInput, new_model.ruleInput, new_model.rewriteTemplateInput, new_model.language, _p38, new_model.currentRewriteResultId),
								_1: {ctor: '[]'}
							}
						})
				};
			case 'CopyTerminalCommandClicked':
				var text = A2(_user$project$Controller$terminalCommand, model, '');
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{copyButtonTextInPlace: 'fa fa-copy', copyButtonTerminalText: 'fa fa-check', copyButtonLinkText: 'fa fa-copy', modalText: text}),
					_1: _user$project$Ports$copyToClipboard(text)
				};
			case 'CopyTerminalCommandInPlaceClicked':
				var text = A2(_user$project$Controller$terminalCommand, model, ' -i');
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{copyButtonTextInPlace: 'fa fa-check', copyButtonTerminalText: 'fa fa-copy', copyButtonLinkText: 'fa fa-copy', modalText: text}),
					_1: _user$project$Ports$copyToClipboard(text)
				};
			case 'ShowTerminalModal':
				var text = A2(_user$project$Controller$terminalCommand, model, '');
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{modalText: text, modalTerminalVisibility: _rundis$elm_bootstrap$Bootstrap_Modal$shown, copyButtonTextInPlace: 'fa fa-copy'}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'CloseTerminalModal':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{modalTerminalVisibility: _rundis$elm_bootstrap$Bootstrap_Modal$hidden}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'ShowAboutModal':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{modalAboutVisibility: _rundis$elm_bootstrap$Bootstrap_Modal$shown}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'CloseAboutModal':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{modalAboutVisibility: _rundis$elm_bootstrap$Bootstrap_Modal$hidden}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Theme':
				var _p39 = _p8._0;
				if (_p39.ctor === 'Dark') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{theme: _user$project$Types$Dark}),
						_1: _elm_lang$navigation$Navigation$load('https://comby.live')
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{theme: _user$project$Types$Light}),
						_1: _elm_lang$navigation$Navigation$load('https://light.comby.live')
					};
				}
			default:
				var _p40 = _p8._0;
				if (_p40.ctor === 'Horizontal') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{rotation: _user$project$Types$Horizontal}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{rotation: _user$project$Types$Vertical}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				}
		}
	});

var _user$project$View$toggleWindowLayout = function (model) {
	var _p0 = _elm_lang$core$Native_Utils.eq(model.rotation, _user$project$Types$Horizontal) ? {ctor: '_Tuple2', _0: 'fas fa-ellipsis-v', _1: _user$project$Types$Vertical} : {ctor: '_Tuple2', _0: 'fas fa-ellipsis-h', _1: _user$project$Types$Horizontal};
	var icon = _p0._0;
	var nextRotation = _p0._1;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Button$button,
				{
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
					_1: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(
								_user$project$Types$ChangeRotation(nextRotation)),
							_1: {ctor: '[]'}
						}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$i,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class(icon),
							_1: {ctor: '[]'}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text(''),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$toggleTheme = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButtonGroup,
				{
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A3(
						_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButton,
						_elm_lang$core$Native_Utils.eq(model.theme, _user$project$Types$Dark),
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
							_1: {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(
									_user$project$Types$Theme(_user$project$Types$Dark)),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$i,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-moon'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text(''),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_rundis$elm_bootstrap$Bootstrap_ButtonGroup$radioButton,
							_elm_lang$core$Native_Utils.eq(model.theme, _user$project$Types$Light),
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(
										_user$project$Types$Theme(_user$project$Types$Light)),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$i,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-sun'),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html$text(''),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$halves = function (l) {
	var n = ((_elm_lang$core$List$length(l) / 2) | 0) + 2;
	var newl = A2(
		_elm_lang$core$List$indexedMap,
		F2(
			function (i, x) {
				return {ctor: '_Tuple2', _0: i, _1: x};
			}),
		l);
	var _p1 = A2(
		_elm_lang$core$List$partition,
		function (_p2) {
			var _p3 = _p2;
			return _elm_lang$core$Native_Utils.cmp(_p3._0, n) < 0;
		},
		newl);
	var left = _p1._0;
	var right = _p1._1;
	return {
		ctor: '_Tuple2',
		_0: A2(
			_elm_lang$core$List$map,
			function (_p4) {
				var _p5 = _p4;
				return _p5._1;
			},
			left),
		_1: A2(
			_elm_lang$core$List$map,
			function (_p6) {
				var _p7 = _p6;
				return _p7._1;
			},
			right)
	};
};
var _user$project$View$terminalButtonGroup = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('text-right'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroup,
				{
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
							_1: {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$ShowTerminalModal),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('terminal-button'),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$i,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-chevron-right'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html$text('Run in Terminal'),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$outlineSecondary,
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('terminal-small-button'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyTerminalCommandClicked),
											_1: {ctor: '[]'}
										}
									}
								}
							},
							{
								ctor: '::',
								_0: A2(
									_elm_lang$html$Html$i,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class(model.copyButtonTerminalText),
										_1: {ctor: '[]'}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$terminalModal = function (model) {
	var language = function () {
		var s = _user$project$LanguageExtension$toString(model.language);
		return _elm_lang$core$Native_Utils.eq(s, '.generic') ? '' : s;
	}();
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Modal$view,
		model.modalTerminalVisibility,
		A3(
			_rundis$elm_bootstrap$Bootstrap_Modal$footer,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$containerFluid,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Grid$row,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(
									_rundis$elm_bootstrap$Bootstrap_Grid$col,
									{
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12,
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroup,
											{
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
												_1: {
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$attrs(
														{
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$class('w-100'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											},
											{
												ctor: '::',
												_0: A2(
													_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
													{
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Button$secondary,
														_1: {
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
																{
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1,
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$class('w-100 terminal-button'),
																		_1: {ctor: '[]'}
																	}
																}),
															_1: {
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyTerminalCommandClicked),
																_1: {ctor: '[]'}
															}
														}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Copy above command. Output will print to terminal.'),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Button$outlineSecondary,
															_1: {
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$class('terminal-small-button'),
																			_1: {ctor: '[]'}
																		}
																	}),
																_1: {
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyTerminalCommandClicked),
																	_1: {ctor: '[]'}
																}
															}
														},
														{
															ctor: '::',
															_0: A2(
																_elm_lang$html$Html$i,
																{
																	ctor: '::',
																	_0: _elm_lang$html$Html_Attributes$class(model.copyButtonTerminalText),
																	_1: {ctor: '[]'}
																},
																{ctor: '[]'}),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Grid$row,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Grid$col,
										{
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md12,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: A2(
												_rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroup,
												{
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
													_1: {
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$attrs(
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$class('w-100'),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Button$danger,
															_1: {
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$class('w-100 terminal-button-add-in-place'),
																			_1: {ctor: '[]'}
																		}
																	}),
																_1: {
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyTerminalCommandInPlaceClicked),
																	_1: {ctor: '[]'}
																}
															}
														},
														{
															ctor: '::',
															_0: _elm_lang$html$Html$text('Add -i option to the command. Files will change in place. Make sure you have a backup or version control.'),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
															{
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Button$outlineDanger,
																_1: {
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
																		{
																			ctor: '::',
																			_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt1,
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$html$Html_Attributes$class('terminal-small-button-add-in-place'),
																				_1: {ctor: '[]'}
																			}
																		}),
																	_1: {
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyTerminalCommandInPlaceClicked),
																		_1: {ctor: '[]'}
																	}
																}
															},
															{
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$i,
																	{
																		ctor: '::',
																		_0: _elm_lang$html$Html_Attributes$class(model.copyButtonTextInPlace),
																		_1: {ctor: '[]'}
																	},
																	{ctor: '[]'}),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_1: {ctor: '[]'}
										}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Modal$body,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$containerFluid,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Grid$row,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Grid$col,
										{
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md2,
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Grid$col,
											{
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md8,
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$pre,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class('modal-pre'),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: A2(
															_elm_lang$html$Html$code,
															{ctor: '[]'},
															{
																ctor: '::',
																_0: _elm_lang$html$Html$text(model.modalText),
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				A3(
					_rundis$elm_bootstrap$Bootstrap_Modal$h5,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'Paste the command in your terminal to run on all ',
								A2(_elm_lang$core$Basics_ops['++'], language, ' files in the current directory'))),
						_1: {ctor: '[]'}
					},
					_rundis$elm_bootstrap$Bootstrap_Modal$large(
						_rundis$elm_bootstrap$Bootstrap_Modal$config(_user$project$Types$CloseTerminalModal))))));
};
var _user$project$View$aboutModal = function (model) {
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Modal$view,
		model.modalAboutVisibility,
		A3(
			_rundis$elm_bootstrap$Bootstrap_Modal$body,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$p,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('This is '),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$href('https://github.com/comby-tools/comby-ui'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('comby-ui'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: _elm_lang$html$Html$text(', a friendly interface for creating code rewrite patterns. The backend is powered by '),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$html$Html$a,
												{
													ctor: '::',
													_0: _elm_lang$html$Html_Attributes$href('https://github.com/comby-tools/comby'),
													_1: {ctor: '[]'}
												},
												{
													ctor: '::',
													_0: _elm_lang$html$Html$text('comby'),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: _elm_lang$html$Html$text('.'),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$p,
								{ctor: '[]'},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('This web app is made possible by '),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$html$Html$a,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$href('https://elm-lang.org/'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text('Elm'),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: _elm_lang$html$Html$text(' and many wonderful libraries. '),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$html$Html$a,
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$href('https://github.com/comby-tools/comby-ui/tree/master/third-party-licenses'),
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: _elm_lang$html$Html$text('Credits.'),
														_1: {ctor: '[]'}
													}),
												_1: {ctor: '[]'}
											}
										}
									}
								}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			A3(
				_rundis$elm_bootstrap$Bootstrap_Modal$h5,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('About'),
					_1: {ctor: '[]'}
				},
				_rundis$elm_bootstrap$Bootstrap_Modal$small(
					_rundis$elm_bootstrap$Bootstrap_Modal$config(_user$project$Types$CloseAboutModal)))));
};
var _user$project$View$footerAbout = A2(
	_rundis$elm_bootstrap$Bootstrap_Button$button,
	{
		ctor: '::',
		_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
		_1: {
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$ShowAboutModal),
			_1: {ctor: '[]'}
		}
	},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$i,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('fa fa-info-circle info-button'),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'}),
		_1: {ctor: '[]'}
	});
var _user$project$View$footerServerConnected = function (model) {
	return model.serverConnected ? A2(
		_rundis$elm_bootstrap$Bootstrap_Badge$pillSuccess,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('green-pill'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('float-right'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$i,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-server'),
					_1: {ctor: '[]'}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html$text('Server Connected'),
				_1: {ctor: '[]'}
			}
		}) : A2(
		_rundis$elm_bootstrap$Bootstrap_Badge$pillDanger,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('red-pill'),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('float-right'),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$i,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-server'),
					_1: {ctor: '[]'}
				},
				{ctor: '[]'}),
			_1: {
				ctor: '::',
				_0: _elm_lang$html$Html$text('No Server Connected'),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$View$docsLink = function (_p8) {
	var _p9 = _p8;
	return A2(
		_elm_lang$html$Html$div,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$a,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$href('https://comby.dev'),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('btn btn-secondary documentation-button'),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$i,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-file-alt'),
							_1: {ctor: '[]'}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html$text('Documentation'),
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$footerShareLink = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('text-left'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Button$button,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Button$warning,
							_1: {
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$ShareLinkClicked),
								_1: {ctor: '[]'}
							}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$i,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('fa-fw fas fa-link'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text('Share Link'),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			_elm_lang$core$Native_Utils.eq(model.prettyUrl, '') ? {ctor: '[]'} : {
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_ButtonGroup$buttonGroup,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$small,
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_ButtonGroup$attrs(
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$ml2,
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Button$warning,
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyShareLinkClicked),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(model.prettyUrl),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_ButtonGroup$button,
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Button$outlineWarning,
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Button$onClick(_user$project$Types$CopyShareLinkClicked),
										_1: {
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Button$small,
											_1: {
												ctor: '::',
												_0: _rundis$elm_bootstrap$Bootstrap_Button$attrs(
													{
														ctor: '::',
														_0: _elm_lang$html$Html_Attributes$class(model.copyButtonLinkText),
														_1: {
															ctor: '::',
															_0: _elm_lang$html$Html_Attributes$id('copyableLink'),
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			}));
};
var _user$project$View$substitutionKindSelection = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('substitution_kind'),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$h6,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text('Substitution'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			A2(
				_rundis$elm_bootstrap$Bootstrap_Form_Radio$radioList,
				'inPlaceMatchingRadios',
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Form_Radio$create,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$id('InPlace'),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Native_Utils.eq(model.substitutionKind, _user$project$Types$InPlace) ? _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked(true) : _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked(false),
								_1: {
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$onClick(
										_user$project$Types$SubstitutionKindInputUpdated(_user$project$Types$InPlace)),
									_1: {ctor: '[]'}
								}
							}
						},
						'In-place'),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Form_Radio$create,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$id('NewlineSeparated'),
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Native_Utils.eq(model.substitutionKind, _user$project$Types$NewlineSeparated) ? _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked(true) : _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked(false),
									_1: {
										ctor: '::',
										_0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$onClick(
											_user$project$Types$SubstitutionKindInputUpdated(_user$project$Types$NewlineSeparated)),
										_1: {ctor: '[]'}
									}
								}
							},
							'Just Matches'),
						_1: {ctor: '[]'}
					}
				})));
};
var _user$project$View$languageSelection = F3(
	function (header_text, model, languages) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('language_selection'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$h6,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(header_text),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				A2(
					_rundis$elm_bootstrap$Bootstrap_Form_Radio$radioList,
					'languageRadios',
					A2(
						_elm_lang$core$List$map,
						function (l) {
							var radioChecked = _elm_lang$core$Native_Utils.eq(model.language, l) ? _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked(true) : _rundis$elm_bootstrap$Bootstrap_Form_Radio$checked(false);
							return A2(
								_rundis$elm_bootstrap$Bootstrap_Form_Radio$create,
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$id(
										_user$project$LanguageExtension$toString(l)),
									_1: {
										ctor: '::',
										_0: radioChecked,
										_1: {
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Form_Radio$onClick(
												_user$project$Types$LanguageInputUpdated(l)),
											_1: {ctor: '[]'}
										}
									}
								},
								_user$project$LanguageExtension$prettyName(l));
						},
						languages))));
	});
var _user$project$View$highlightableRewriteResult = F2(
	function (model, cssHeight) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('context2'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$pre,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(cssHeight),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('rewrite-box'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$code,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$id('listing2'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(''),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$View$highlightableSourceListing = F2(
	function (model, cssHeight) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class('context'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$pre,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(cssHeight),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('source-box'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$code,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$id('listing'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text(''),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _user$project$View$horizontalLayout = function (model) {
	return {
		ctor: '::',
		_0: A2(
			_rundis$elm_bootstrap$Bootstrap_Grid$row,
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$col,
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(_user$project$View$highlightableSourceListing, model, 'height-horizontal'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$col,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(_user$project$View$highlightableRewriteResult, model, 'height-horizontal'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			}),
		_1: {ctor: '[]'}
	};
};
var _user$project$View$verticalLayout = function (model) {
	return {
		ctor: '::',
		_0: A2(
			_rundis$elm_bootstrap$Bootstrap_Grid$row,
			{
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
					{
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_rundis$elm_bootstrap$Bootstrap_Grid$col,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(_user$project$View$highlightableSourceListing, model, 'height-vertical'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}),
		_1: {
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Grid$row,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$col,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: A2(_user$project$View$highlightableRewriteResult, model, 'height-vertical'),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		}
	};
};
var _user$project$View$rewriteTemplateInput = function (model) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$textarea(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$id('rewrite'),
			_1: {
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$rows(3),
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$onInput(_user$project$Types$RewriteTemplateInputUpdated),
					_1: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$placeholder('Rewrite Template'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$spellcheck(false),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultValue(model.rewriteTemplateInput),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$View$ruleDisplaySyntaxErrors = function (model) {
	return A2(
		_elm_lang$html$Html$p,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('rule-syntax-errors'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(model.ruleSyntaxErrors),
			_1: {ctor: '[]'}
		});
};
var _user$project$View$ruleInput = function (model) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$textarea(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$id('rule'),
			_1: {
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$rows(1),
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$onInput(_user$project$Types$RuleInputUpdated),
					_1: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$placeholder('where true'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$spellcheck(false),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultValue(model.ruleInput),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$View$matchTemplateInput = function (model) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$textarea(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$id('match_template'),
			_1: {
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$rows(3),
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$onInput(_user$project$Types$MatchTemplateInputUpdated),
					_1: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$placeholder('Match Template'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$spellcheck(false),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultValue(model.matchTemplateInput),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$View$sourceInput = function (model) {
	return _rundis$elm_bootstrap$Bootstrap_Form_Textarea$textarea(
		{
			ctor: '::',
			_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$id('source'),
			_1: {
				ctor: '::',
				_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$rows(3),
				_1: {
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$onInput(_user$project$Types$SourceInputUpdated),
					_1: {
						ctor: '::',
						_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$attrs(
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$placeholder('Paste your source code here'),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$spellcheck(false),
									_1: {ctor: '[]'}
								}
							}),
						_1: {
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Form_Textarea$defaultValue(model.sourceInput),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		});
};
var _user$project$View$sourcePage = function (model) {
	var _p10 = _user$project$View$halves(_user$project$LanguageExtension$all);
	var left = _p10._0;
	var right = _p10._1;
	return A2(
		_rundis$elm_bootstrap$Bootstrap_Grid$containerFluid,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_rundis$elm_bootstrap$Bootstrap_Grid$row,
				{
					ctor: '::',
					_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_rundis$elm_bootstrap$Bootstrap_Grid$col,
						{
							ctor: '::',
							_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md10,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A2(
								_rundis$elm_bootstrap$Bootstrap_Grid$row,
								{
									ctor: '::',
									_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$rightMd,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_rundis$elm_bootstrap$Bootstrap_Grid$col,
										{
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md11,
											_1: {ctor: '[]'}
										},
										A2(
											_elm_lang$core$Basics_ops['++'],
											{
												ctor: '::',
												_0: A2(
													_rundis$elm_bootstrap$Bootstrap_Grid$row,
													{ctor: '[]'},
													{
														ctor: '::',
														_0: A2(
															_rundis$elm_bootstrap$Bootstrap_Grid$col,
															{
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$xs12,
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: A2(
																	_elm_lang$html$Html$br,
																	{ctor: '[]'},
																	{ctor: '[]'}),
																_1: {
																	ctor: '::',
																	_0: _user$project$View$sourceInput(model),
																	_1: {ctor: '[]'}
																}
															}),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_Grid$row,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
																{
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: A2(
																_rundis$elm_bootstrap$Bootstrap_Grid$col,
																{
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
																	_1: {ctor: '[]'}
																},
																{
																	ctor: '::',
																	_0: _user$project$View$matchTemplateInput(model),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_rundis$elm_bootstrap$Bootstrap_Grid$col,
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
																		_1: {ctor: '[]'}
																	},
																	{
																		ctor: '::',
																		_0: _user$project$View$rewriteTemplateInput(model),
																		_1: {ctor: '[]'}
																	}),
																_1: {ctor: '[]'}
															}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_rundis$elm_bootstrap$Bootstrap_Grid$row,
															{
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
																		_1: {ctor: '[]'}
																	}),
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: A2(
																	_rundis$elm_bootstrap$Bootstrap_Grid$col,
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
																		_1: {ctor: '[]'}
																	},
																	{
																		ctor: '::',
																		_0: _user$project$View$ruleInput(model),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_rundis$elm_bootstrap$Bootstrap_Grid$col,
																		{
																			ctor: '::',
																			_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
																			_1: {ctor: '[]'}
																		},
																		{
																			ctor: '::',
																			_0: _user$project$View$ruleDisplaySyntaxErrors(model),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															}),
														_1: {ctor: '[]'}
													}
												}
											},
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Native_Utils.eq(model.rotation, _user$project$Types$Vertical) ? _user$project$View$verticalLayout(model) : _user$project$View$horizontalLayout(model),
												{
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_Grid$row,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$betweenXs,
															_1: {
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$html$Html_Attributes$class('text-center'),
																			_1: {ctor: '[]'}
																		}
																	}),
																_1: {ctor: '[]'}
															}
														},
														{
															ctor: '::',
															_0: A2(
																_rundis$elm_bootstrap$Bootstrap_Grid$col,
																{ctor: '[]'},
																{
																	ctor: '::',
																	_0: _user$project$View$footerShareLink(model),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: A2(
																	_rundis$elm_bootstrap$Bootstrap_Grid$col,
																	{
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md4,
																		_1: {ctor: '[]'}
																	},
																	{
																		ctor: '::',
																		_0: _user$project$View$docsLink(
																			{ctor: '_Tuple0'}),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_rundis$elm_bootstrap$Bootstrap_Grid$col,
																		{ctor: '[]'},
																		{
																			ctor: '::',
																			_0: _user$project$View$terminalButtonGroup(model),
																			_1: {ctor: '[]'}
																		}),
																	_1: {ctor: '[]'}
																}
															}
														}),
													_1: {ctor: '[]'}
												}))),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_rundis$elm_bootstrap$Bootstrap_Grid$col,
							{
								ctor: '::',
								_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md2,
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _user$project$View$substitutionKindSelection(model),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$h6,
										{
											ctor: '::',
											_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt3,
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text('Language'),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A2(
											_rundis$elm_bootstrap$Bootstrap_Grid$row,
											{ctor: '[]'},
											{
												ctor: '::',
												_0: A2(
													_rundis$elm_bootstrap$Bootstrap_Grid$col,
													{
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
														_1: {ctor: '[]'}
													},
													{
														ctor: '::',
														_0: A3(_user$project$View$languageSelection, '', model, left),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_Grid$col,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md6,
															_1: {ctor: '[]'}
														},
														{
															ctor: '::',
															_0: A3(_user$project$View$languageSelection, '', model, right),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_rundis$elm_bootstrap$Bootstrap_Grid$row,
												{
													ctor: '::',
													_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt5,
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXs,
														_1: {ctor: '[]'}
													}
												},
												{
													ctor: '::',
													_0: A2(
														_rundis$elm_bootstrap$Bootstrap_Grid$col,
														{
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md5,
															_1: {
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd4,
																_1: {ctor: '[]'}
															}
														},
														{
															ctor: '::',
															_0: _user$project$View$footerServerConnected(model),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A2(
															_rundis$elm_bootstrap$Bootstrap_Grid$col,
															{
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md1,
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: _user$project$View$footerAbout,
																_1: {ctor: '[]'}
															}),
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_rundis$elm_bootstrap$Bootstrap_Grid$row,
													{
														ctor: '::',
														_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$attrs(
															{
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Utilities_Spacing$mt4,
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: _rundis$elm_bootstrap$Bootstrap_Grid_Row$middleXs,
															_1: {ctor: '[]'}
														}
													},
													{
														ctor: '::',
														_0: A2(
															_rundis$elm_bootstrap$Bootstrap_Grid$col,
															{
																ctor: '::',
																_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md1,
																_1: {ctor: '[]'}
															},
															{
																ctor: '::',
																_0: _user$project$View$toggleTheme(model),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: A2(
																_rundis$elm_bootstrap$Bootstrap_Grid$col,
																{
																	ctor: '::',
																	_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$md3,
																	_1: {
																		ctor: '::',
																		_0: _rundis$elm_bootstrap$Bootstrap_Grid_Col$offsetMd3,
																		_1: {ctor: '[]'}
																	}
																},
																{
																	ctor: '::',
																	_0: _user$project$View$toggleWindowLayout(model),
																	_1: {ctor: '[]'}
																}),
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: _user$project$View$terminalModal(model),
				_1: {
					ctor: '::',
					_0: _user$project$View$aboutModal(model),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$View$pageNotFound = A2(
	_elm_lang$html$Html$div,
	{ctor: '[]'},
	{
		ctor: '::',
		_0: A2(
			_elm_lang$html$Html$h1,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text('Not found'),
				_1: {ctor: '[]'}
			}),
		_1: {
			ctor: '::',
			_0: _elm_lang$html$Html$text('Sorry couldn\'t find that page'),
			_1: {ctor: '[]'}
		}
	});
var _user$project$View$root = function (model) {
	var _p11 = model.page;
	if (_p11.ctor === 'SourcePage') {
		return _user$project$View$sourcePage(model);
	} else {
		return _user$project$View$pageNotFound;
	}
};

var _user$project$App$main = A2(
	_elm_lang$navigation$Navigation$programWithFlags,
	_user$project$Types$OnLocationChange,
	{view: _user$project$View$root, update: _user$project$Controller$update, subscriptions: _user$project$Controller$subscriptions, init: _user$project$Controller$init})(
	_elm_lang$core$Json_Decode$succeed(
		{}));

var Elm = {};
Elm['App'] = Elm['App'] || {};
if (typeof _user$project$App$main !== 'undefined') {
    _user$project$App$main(Elm['App'], 'App', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);


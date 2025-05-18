/**
 * This is a port of R.splitWhenever from v0.28.0
 *
 * At the moment of writing this comment, we're around two weeks before production deploy
 * and don't want to break things while upgrading Ramda.
 */

const _isPlaceholder = (a) => {
  return a != null &&
         typeof a === 'object' &&
         a['@@functional/placeholder'] === true
}

const _arity = (n, fn) => {
  /* eslint-disable no-unused-vars */
  switch (n) {
    case 0: return function () { return fn.apply(this, arguments) }
    case 1: return function (a0) { return fn.apply(this, arguments) }
    case 2: return function (a0, a1) { return fn.apply(this, arguments) }
    case 3: return function (a0, a1, a2) { return fn.apply(this, arguments) }
    case 4: return function (a0, a1, a2, a3) { return fn.apply(this, arguments) }
    case 5: return function (a0, a1, a2, a3, a4) { return fn.apply(this, arguments) }
    case 6: return function (a0, a1, a2, a3, a4, a5) { return fn.apply(this, arguments) }
    case 7: return function (a0, a1, a2, a3, a4, a5, a6) { return fn.apply(this, arguments) }
    case 8: return function (a0, a1, a2, a3, a4, a5, a6, a7) { return fn.apply(this, arguments) }
    case 9: return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) { return fn.apply(this, arguments) }
    case 10: return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) { return fn.apply(this, arguments) }
    default: throw new Error('First argument to _arity must be a non-negative integer no greater than ten')
  }
}

const _curryN = (length, received, fn) => {
  return function () {
    const combined = []
    let argsIdx = 0
    let left = length
    let combinedIdx = 0
    while (combinedIdx < received.length || argsIdx < arguments.length) {
      var result
      if (combinedIdx < received.length &&
          (!_isPlaceholder(received[combinedIdx]) ||
           argsIdx >= arguments.length)) {
        result = received[combinedIdx]
      } else {
        result = arguments[argsIdx]
        argsIdx += 1
      }
      combined[combinedIdx] = result
      if (!_isPlaceholder(result)) {
        left -= 1
      }
      combinedIdx += 1
    }
    return left <= 0
      ? fn.apply(this, combined)
      : _arity(left, _curryN(length, combined, fn))
  }
}

/**
 * Splits an array into slices on every occurrence of a value.
 *
 * @func
 * @memberOf R
 * @since v0.26.1 // not true
 * @category List
 * @sig (a -> Boolean) -> [a] -> [[a]]
 * @param {Function} pred The predicate that determines where the array is split.
 * @param {Array} list The array to be split.
 * @return {Array}
 * @example
 *
 *      R.splitWhenever(R.equals(2), [1, 2, 3, 2, 4, 5, 2, 6, 7]); //=> [[1], [3], [4, 5], [6, 7]]
 */
export const splitWhenever = _curryN(2, [], function splitWhenever (pred, list) {
  const acc = []
  let curr = []
  for (let i = 0; i < list.length; i = i + 1) {
    if (!pred(list[i])) {
      curr.push(list[i])
    }
    // eslint-disable-next-line no-mixed-operators
    if ((i < list.length - 1 && pred(list[i + 1]) || i === list.length - 1) && curr.length > 0) {
      acc.push(curr)
      curr = []
    }
  }
  return acc
})

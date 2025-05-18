import * as R from 'ramda'

// Apply a given function to each item of the collection. The result will be stored under the given attribute (propName).
// This can be an existing prop or a new one (useful for creating intermediate props, used by other functions)
export const evalCollectionProp = (propName: string, fun: Function) => R.map(
  (obj: any) => R.set(R.lensProp(propName), fun(obj), obj)
)

// Apply a given function to an item. The result will be stored under the given attribute (propName).
export const evalProp = (propName: string, fun: Function) => (obj: any) => R.set(R.lensProp(propName), fun(obj), obj)

// Clean up (set to null) a no longer needed prop
export const flushProp = (propName: string) => evalCollectionProp(propName, R.always(null))

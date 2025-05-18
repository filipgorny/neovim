const forEachP = fn => async list => {
  for (const el of list) {
    await fn(el)
  }
}

export default forEachP

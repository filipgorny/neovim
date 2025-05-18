export class Counter {
  private count: number = 0

  public increment (): void {
    this.count++
  }

  public decrement (): void {
    this.count--
  }

  public getCount (): number {
    return this.count
  }
}

export default Counter

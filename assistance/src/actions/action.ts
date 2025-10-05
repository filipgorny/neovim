export abstract class Action {
  constructor(public readonly name: string, public readonly params: ActionParams) {}
}

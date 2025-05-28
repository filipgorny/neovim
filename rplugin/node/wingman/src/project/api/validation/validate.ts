export class Validation {
  constructor(public constraints: Constraint[]) { }
}

type ConstraintType = "required" | "minLength" | "maxLength" | "pattern" | "custom";
type Constraint = { property: string, type: ConstraintType; value: string | number | RegExp };

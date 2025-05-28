export abstract class ValueType {
	constructor(public name: string) {}
}

export class StringType extends ValueType {
	constructor() {
		super("string");
	}
}

export class NumberType extends ValueType {
	constructor() {
		super("number");
	}
}

export class BooleanType extends ValueType {
	constructor() {
		super("boolean");
	}
}

export class DateType extends ValueType {
	constructor() {
		super("date");
	}
}

export class EnumType extends ValueType {
	constructor(public values: string[]) {
		super("enum");
	}
}

export class UUIDType extends ValueType {
	constructor() {
		super("uuid");
	}
}

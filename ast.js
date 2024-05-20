export class Literal {
	constructor(value) {
		this.value = value;
		this.type = "Literal";
	}
}

export class Array {
	constructor(items) {
		this.value = items;
		this.type = "Array";
	}
}

export class Variable {
	constructor(name, value) {
		this.value = value;
		this.name = name;
		this.type = "Variable";
	}
}

export class BinaryExpression {
    constructor(left, op, right) {
        this.left = left;
        this.operator = op;
        this.right = right;
        this.type = "BinaryExpression";
    }
}

export default {
	Literal,
	Array,
	Variable,
    BinaryExpression
};

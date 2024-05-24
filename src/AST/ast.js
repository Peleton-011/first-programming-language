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

export class Set {
	constructor(name, property, value) {
		this.name = name;
		this.property = property;
		this.value = value;
		this.type = "Set";
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

export class FunctionStatement {
	constructor(name, params, body) {
		this.name = name;
		this.params = params;
		this.body = body;
		this.type = "FunctionStatement";
	}
}

export class ReturnStatement {
	constructor(value) {
		this.value = value;
		this.type = "ReturnStatement";
	}
}

export class ForStatement {
	constructor(name, range, body) {
		this.name = name;
		this.range = range;
		this.body = body;
		this.type = "ForStatement";
	}
}

export class WhileStatement {
	constructor(condition, body) {
		this.condition = condition;
		this.body = body;
		this.type = "WhileStatement";
	}
}

export class ConditionalStatement {
	constructor(condition, body, otherwise) {
		this.condition = condition;
		this.body = body;
		this.otherwise = otherwise;
		this.type = "ConditionalStatement";
	}
}

export class structStatement {
	constructor(name, members) {
		this.name = name;
		this.members = members;
		this.type = "structStatement";
	}
}

export default {
	Literal,
	Array,
	Variable,
	Set,
	BinaryExpression,
	FunctionStatement,
	ReturnStatement,
	ForStatement,
	WhileStatement,
	ConditionalStatement,
	structStatement,
};

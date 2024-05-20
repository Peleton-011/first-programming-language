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

export default {
	Literal,
	Array,
};

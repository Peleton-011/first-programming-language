import { EaselError } from "./stdlib";
import { TOKENS } from "./lexer";

export class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.ast = []; //Abstract syntax tree
		this.current = 0;
	}

	error(token, msg) {
		throw new EaselError(
			`Syntax error on ${token.line}:${token.column}: ${msg}`
		);
	}

	peek() {
		if (this.current >= this.tokens.length) return null;
		return this.tokens[this.current];
	}

	peekType() {
		if (this.current >= this.tokens.length) return null;
		return this.tokens[this.current].type;
	}

	eat(type) {
		if (this.peekType() === type) {
			return this.tokens[this.current++];
		}
		this.error(
			this.peek(),
			`Expected ${type} but got ${this.peekType().toString()}`
		);
	}

	simple() {
		return this.eat(TOKENS.Identifier);
	}

	expression() {
		const left = this.simple();
		return left;
	}

	statement() {
		const next = this.peek();

		switch (next.type) {
			case TOKENS.Identifier:
				return this.expression();

			default:
				return this.expression();
		}
	}

	parse() {
		while (this.peekType() !== "EOF") continue;
		return this.ast;
	}
}

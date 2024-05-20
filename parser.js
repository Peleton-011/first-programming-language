import { EaselError } from "./stdlib";
import { TOKENS } from "./lexer";
import Ast from "./ast";

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
		const token = this.eat(this.peekType());
		switch (token.type) {
			case TOKENS.String:
			case TOKENS.Number:
			case TOKENS.Boolean: {
				return new Ast.Literal(token.content);
			}

			case TOKENS.LeftBracket: {
				let items = [];
				if (this.peekType() !== TOKENS.RightBracket)
					items = this.expressionList();
				this.eat(TOKENS.RightBracket);
				return new Ast.Array(items);
			}

            case TOKENS.Identifier: {
                return new Ast.Variable(token.value);
            }

			default:
				break;
		}

		this.error(token, "Expected expression but got " + token);
	}

	expression() {
		const left = this.simple();
		return left;
	}

	expressionList() {
		let expressions = [];
		expressions.push(this.expression());

		while (this.peekType() === TOKENS.Comma) {
			this.eat(TOKENS.Comma);
			expressions.push(this.expression());
		}

		return expressions;
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

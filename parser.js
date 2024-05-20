import { EaselError } from "./stdlib.js";
import { TOKENS } from "./lexer.js";
import Ast from "./ast.js";

const isOp = (type) => {
	return [
		TOKENS.Plus,
		TOKENS.Minus,
		TOKENS.Asterisk,
		TOKENS.Slash,
		TOKENS.Equiv,
		TOKENS.NotEquiv,
		TOKENS.Lt,
		TOKENS.Lte,
		TOKENS.Gt,
		TOKENS.Gte,
		TOKENS.And,
		TOKENS.Or,
		TOKENS.And,
	].includes(type);
};

const opOrder = {
	"<": 0,
	"<=": 0,
	">": 0,
	">=": 0,
	"==": 0,
	"!=": 0,
	"||": 0,
	"&&": 0,
	"+": 1,
	"-": 1,
	"*": 2,
	"/": 2,
};

export class Parser {
	constructor(tokens) {
		this.tokens = tokens.filter(
			(token) =>
				token.type !== TOKENS.Comment && token.type !== TOKENS.newLine
		);
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

			case TOKENS.LeftParen: {
				const innerExpression = this.expression();
				this.eat(TOKENS.RightParen);
				return innerExpression;
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
		if (isOp(this.peekType())) {
			const op = this.eat(this.peekType()).value;
			const right = this.expression();
			if (
				right instanceof Ast.BinaryExpression &&
				opOrder[op] > opOrder[right.operator]
			) {
				//Reorder if needed
				return new Ast.BinaryExpression(
					new Ast.BinaryExpression(left, op, right.left),
					right.operator,
					right.right
				);
			}
			return new Ast.BinaryExpression(left, op, right);
		}
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
		while (this.peekType() !== "EOF") this.ast.push(this.statement());
		return this.ast;
	}
}

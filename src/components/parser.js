import { EaselError } from "../stdlib.js";
import { TOKENS, OP_LIST, OP_ORDER } from "../../data/data.js";
import Ast from "../AST/ast.js";

const isOp = (type) => {
	return OP_LIST.includes(type);
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

	peekKeyword(keyword) {
		if (
			this.peekType() === TOKENS.Keyword ||
			this.peek().value === keyword
		) {
			return this.peek();
		}
		return null;
	}

	eatKeyword(keyword) {
		if (this.peekType() !== TOKENS.Keyword) {
			this.error(
				this.peek(),
				"Expected keyword but got " + this.peekType()
			);
		} else if (this.peek().value !== keyword) {
			this.error(
				this.peek(),
				"Expected " + keyword + " but got " + this.peek().value
			);
		} else {
			return this.eat(TOKENS.Keyword);
		}
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
				OP_ORDER[op] > OP_ORDER[right.operator]
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
		const functionStatement = () => {
			this.eatKeyword("sketch");
			const name = this.eat(TOKENS.Identifier).value;

			let params = [];

			if (this.peekKeyword("needs")) {
				//Params
				this.eatKeyword("needs");
				this.eat(TOKENS.LeftParen);
				params = this.identifierList();
				this.eat(TOKENS.RightParen);
			}

			this.eat(TOKENS.LeftBrace);
			let body = [];

			while (this.peekType() !== TOKENS.RightBrace) {
				body.push(this.statement());
			}

			this.eat(TOKENS.RightBrace);

			return new Ast.FunctionStatement(name, params, body);
		};

		const next = this.peek();

		switch (next.type) {
			case TOKENS.Keyword: {
				switch (next.value) {
					case "sketch": {
						return functionStatement();
					}
				}
			}

			default: {
				return this.expression();
			}
		}
	}

	parse() {
		while (this.peekType() !== "EOF") this.ast.push(this.statement());
		return this.ast;
	}
}

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

			case TOKENS.Keyword: {
				if (token.value === "prep") {
					//instance is a struct copy
					const id = this.eat(TOKENS.Identifier).value;

					this.eat(TOKENS.LeftParen);
					const members = {};

					while (this.peekType() !== TOKENS.RightParen) {
						const member = this.eat(TOKENS.Identifier).value;
						this.eat(TOKENS.Colon);
						members[member] = this.expression();

						if (this.peekType() === TOKENS.Comma) {
							this.eat(TOKENS.Comma);
						}
					}

					this.eat(TOKENS.RightParen);

					return new Ast.Instance(id, members);
				}
				break;
			}
			default:
				break;
		}

		this.error(token, "Expected expression but got " + token);
	}

	call() {
		let expression = this.simple();
		while (true) {
			if (this.peekType() === TOKENS.LeftParen) {
				//Function call
				this.eat(TOKENS.LeftParen);
				let args = [];
				if (this.peekType() !== TOKENS.RightParen) {
					args = this.expressionList();
				}
				this.eat(TOKENS.RightParen);

				expression = new Ast.Call(expression, args);
			} else if (this.peekType() === TOKENS.LeftBracket) {
				//Struct access
				this.eat(TOKENS.LeftBracket);
				const property = this.expression();
				this.eat(TOKENS.RightBracket);

				expression = new Ast.Get(expression, property, true);
			} else if (this.peekType() === TOKENS.Period) {
				//Property access
				this.eat(TOKENS.Period);
				const property = this.eat(TOKENS.Identifier).value;

				expression = new Ast.Get(expression, property);
			} else {
				break;
			}
		}

		return expression;
	}

	expression() {
		const left = this.call();
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

	identifierList() {
		let identifiers = [];
		identifiers.push(this.eat(TOKENS.Identifier).value);

		while (this.peekType() === TOKENS.Comma) {
			this.eat(TOKENS.Comma);
			identifiers.push(this.eat(TOKENS.Identifier).value);
		}

		return identifiers;
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

		const returnStatement = () => {
			this.eatKeyword("finished");
			const value = this.expression();
			return new Ast.ReturnStatement(value);
		};

		const forStatement = () => {
			this.eatKeyword("loop");
			const name = this.eat(TOKENS.Identifier).value;
			this.eatKeyword("through");

			//Get range
			this.eat(TOKENS.LeftParen);
			const range = this.expressionList();

			if (range.length !== 2) {
				this.error(
					range[0],
					"Expected 2 values in range, (start, end), recieved: " +
						range.join(", ")
				);
			}

			this.eat(TOKENS.RightParen);

			//Get body
			this.eat(TOKENS.LeftBrace);
			const body = [];
			while (this.peekType() !== TOKENS.RightBrace) {
				body.push(this.statement());
			}
			this.eat(TOKENS.RightBrace);

			return new Ast.ForStatement(name, range, body);
		};

		const whileStatement = () => {
			this.eatKeyword("while");

			//Get condition
			this.eat(TOKENS.LeftParen);
			const condition = this.expression();
			this.eat(TOKENS.RightParen);

			//Get body
			this.eat(TOKENS.LeftBrace);
			const body = [];
			while (this.peekType() !== TOKENS.RightBrace) {
				body.push(this.statement());
			}
			this.eat(TOKENS.RightBrace);

			return new Ast.WhileStatement(condition, body);
		};

		const conditionalStatement = (keyword) => {
			this.eatKeyword(keyword);

			//Get condition
			let condition = new Ast.Literal(true);
			if (keyword !== "else") {
				this.eat(TOKENS.LeftParen);
				condition = this.expression();
				this.eat(TOKENS.RightParen);
			}

			//Get body
			this.eat(TOKENS.LeftBrace);
			const body = [];
			while (this.peekType() !== TOKENS.RightBrace) {
				body.push(this.statement());
			}
			this.eat(TOKENS.RightBrace);

			//Get else
			let otherwise = [];
			while (this.peekKeyword("else") || this.peekKeyword("elif")) {
				otherwise.push(this.conditionalStatement(this.peek().value));
			}

			return new Ast.ConditionalStatement(condition, body, otherwise);
		};

		const assignmentStatement = () => {
			this.eatKeyword("prepare");
			const name = this.eat(TOKENS.Identifier).value;

			if (this.peekType() === TOKENS.Period) {
				//Setter
				this.eat(TOKENS.Period);
				const property = this.eat(TOKENS.Identifier).value;
				this.eatKeyword("as");
				const value = this.expression();
				return new Ast.SetStatement(name, property, value);
			}

			this.eatKeyword("as");
			const value = this.expression();
			return new Ast.Variable(name, value);
		};

		const structStatement = () => {
			this.eatKeyword("brush");

			const name = this.eat(TOKENS.Identifier).value;
			this.eatKeyword("has");

			this.eat(TOKENS.LeftBrace);
			const members = this.identifierList();
			this.eat(TOKENS.RightBrace);

			return new Ast.StructStatement(name, members);
		};

		const next = this.peek();

		switch (next.type) {
			case TOKENS.Keyword: {
				switch (next.value) {
					case "sketch": {
						return functionStatement();
					}

					case "finished": {
						return returnStatement();
					}

					case "loop": {
						return forStatement();
					}

					case "while": {
						return whileStatement();
					}

					case "if": {
						return conditionalStatement("if");
					}

					case "prepare": {
						return assignmentStatement();
					}

					case "brush": {
						return structStatement();
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

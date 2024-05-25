import Ast from "../AST/ast";
import { EaselError } from "../stdlib.js";

export default class Interpreter {
	error(msg) {
		throw new EaselError(`Runtime error: ${msg}`);
	}

	run(ast, scope) {}

	inScope(scope, name) {
		return Object.keys(scope).includes(name);
	}

	evaluate(value, scope) {
		switch (value.constructor) {
			case Ast.Variable: {
				if (!this.inScope(scope, value.name)) {
					this.error(`Variable not in scope: ${value.name}`);
				}
				return scope[value.name];
			}
			case Ast.UnaryExpression: {
				const operations = { "!": (apply) => !apply };
				return operations[value.operator](
					this.evaluate(value.apply, scope)
				);
			}
			case Ast.BinaryExpression: {
				const operations = {
					"+": (left, right) => left + right,
					"-": (left, right) => left - right,
					"*": (left, right) => left * right,
					"/": (left, right) => left / right,
					//"%": (left, right) => left % right,
					"==": (left, right) => left == right,
					"!=": (left, right) => left != right,
					">": (left, right) => left > right,
					"<": (left, right) => left < right,
					">=": (left, right) => left >= right,
					"<=": (left, right) => left <= right,
					"&&": (left, right) => left && right,
					"||": (left, right) => left || right,
				};
				return operations[value.operator](
					this.evaluate(value.left, scope),
					this.evaluate(value.right, scope)
				);
			}
			case Ast.Literal: {
				return value.value;
			}
			case Ast.Array: {
				return value.value.map((item) => this.evaluate(item, scope));
			}
			default: {
				this.error(
					"Expected expression but got statement: " +
						value.constructor.name
				);
			}
		}
	}

	execute(node, scope) {
		switch (node.constructor.name) {
			case Ast.Variable:
				scope[node.name] = this.evaluate(node.value, scope);
				return scope;
			case Ast.Set:
			case Ast.StructStatement:
			case Ast.FunctionStatement:
			case Ast.ReturnStatement:
			case Ast.ForStatement:
			case Ast.WhileStatement:
			case Ast.ConditionalStatement:
			default:
				this.evaluate(node, scope);
		}

		return scope;
	}
}

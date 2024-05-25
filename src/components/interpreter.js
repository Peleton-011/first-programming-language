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

	evaluate(value, scope) {}

	execute(node, scope) {
		switch (node.constructor.name) {
			case Ast.Variable:
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

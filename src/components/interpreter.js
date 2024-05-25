import Ast from "../AST/ast";
import { EaselError } from "../stdlib.js";

export class ReturnException extends Error {
	constructor(value) {
		super();
		this.value = value;
	}
}

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
			case Ast.Instance: {
				if (!this.inScope(scope, value.name)) {
					this.error(`Variable not in scope: ${value.name}`);
				}

				const constructor = scope[value.name];
				const members = {};
				for (const [member, memberValue] of Object.entries(
					value.members
				)) {
					members[member] = this.evaluate(memberValue, scope);
				}

				return constructor(members);
			}
			case Ast.Call: {
				const caller = this.evaluate(value.caller, scope);
				if (!caller) {
					this.error(`Function not found: ${value.caller.name}`);
				}

				const args = value.args.map((arg) => this.evaluate(arg, scope));
				return caller(args); //Possibly spread the args here??
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
			case Ast.Set: {
				if (!this.inScope(scope, node.name)) {
					this.error(`Variable not in scope: ${node.name}`);
				}

				scope[node.name][node.property] = this.evaluate(
					node.value,
					scope
				);

				return scope;
			}
			case Ast.StructStatement: {
				scope[node.name] = (members) => {
					//Check for invalid keys
					const instance = {};
					for (const key of Object.keys(members)) {
						if (!node.members.includes(key)) {
							this.error(
								`Invalid key: ${key} found while creating instance of ${node.name}`
							);
						}
						instance[key] = members[key];
					}
					return instance;
				};
				return scope;
			}
			case Ast.FunctionStatement: {
				const func = (args) => {
					const localScope = { ...scope };
					for (const [i, parameter] of node.params.entries()) {
						localScope[parameter] = args[i];
					}

					try {
						this.run(node.body, localScope);
					} catch (error) {
						if (error instanceof ReturnException) {
							return error.value;
						} else {
							throw error;
						}
					}
				};

				scope[node.name] = func;
				return scope;
			}
			case Ast.ReturnStatement:
				throw new ReturnException(this.evaluate(node.value, scope));
			case Ast.ForStatement: {
				const localScope = {
					...scope,
					[node.name]: this.evaluate(node.range[0], scope),
				};
				while (
					localScope[node.name] < this.evaluate(node.range[1], scope)
				) {
					this.run(node.body, localScope);
					localScope[node.name] += 1;
				}
				break;
			}
			case Ast.WhileStatement: {
				while (this.execute(node.condition, scope)) {
					this.run(node.body, scope);
				}
			}
			case Ast.ConditionalStatement: {
				if (this.evaluate(node.condition, scope)) {
					this.run(node.body, scope);
				} else {
					for (const statement of node.otherwise) {
						this.execute(statement, scope);
					}
				}
			}
			default:
				this.evaluate(node, scope);
		}

		return scope;
	}
}

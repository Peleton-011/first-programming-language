import Ast from "../AST/ast";
import { EaselError } from "../stdlib.js";

export default class Interpreter {
	error(msg) {
		throw new EaselError(`Runtime error: ${msg}`);
	}

	run(ast, scope) {}
}

import fs from "fs";
import { Lexer } from "./src/components/lexer.js";
import { Parser } from "./src/components/parser.js";
import { EaselError } from "./src/stdlib.js";

const readFile = (path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) {
				return reject(err);
			} else {
				resolve(data.toString());
			}
		});
	});
};

const writeFile = (path, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, (err) => {
			if (err) {
				return reject(err);
			} else {
				resolve();
			}
		});
	});
};

(async () => {
	let argv = process.argv.slice(2);
	const debug = argv.includes("--debug");
	argv = argv.filter((arg) => arg !== "--debug");

	const path = argv[0];
	if (path) {
		const code = await readFile(path);
		console.log(code);
		const lexer = new Lexer(code);
		try {
			lexer.scanTokens();
		} catch (err) {
			console.error(err);
			process.exit(1);
		} finally {
			if (debug)
				await writeFile(
					"./debug/tokens_output.json",
					JSON.stringify(lexer.tokens, null, 2)
				);
		}

		const parser = new Parser(lexer.tokens);
		try {
			parser.parse();
		} catch (err) {
			console.error(err);
			process.exit(1);
		} finally {
			if (debug)
				await writeFile(
					"./debug/ast_output.json",
					JSON.stringify(parser.ast, null, 2)
				);
		}
	} else {
		console.log("No path provided");
	}
})();

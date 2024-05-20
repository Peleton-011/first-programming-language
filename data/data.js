import fs from "fs";
import path from "path";

//Getting tokens from the JSON file
const pathToTokens = path.resolve(__dirname, "./tokens.json");
const getTokens = () => {
	try {
		// Step 1: Read the JSON file synchronously
		const data = fs.readFileSync(pathToTokens, "utf8");

		// Step 2: Parse the JSON data
		const jsonData = JSON.parse(data);
		console.log("Parsed JSON data:", jsonData);
		return jsonData;
	} catch (err) {
		console.error("Error:", err);
	}
};

export const TOKENS = getTokens();

//Getting keywords from the JSON file
const pathToKeywords = path.resolve(__dirname, "./keywords.json");
const getKeywords = () => {
	try {
		// Step 1: Read the JSON file synchronously
		const data = fs.readFileSync(pathToKeywords, "utf8");

		// Step 2: Parse the JSON data
		const jsonData = JSON.parse(data);
		console.log("Parsed JSON data:", jsonData);
		return jsonData;
	} catch (err) {
		console.error("Error:", err);
	}
};

export const KEYWORDS = getKeywords();

export const OP_LIST = [
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
];

export const OP_ORDER = {
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

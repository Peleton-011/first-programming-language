import fs from "fs";
import { EaselError } from "./stdlib";

//Getting tokens from the JSON file
const pathToTokens = "./tokens.json";
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

//Token class
export class Token {
	constructor(type, value, content, line, column) {
		this.type = type; //Should be a value in TOKENS
		this.value = value;
		this.content = content;
		this.line = line;
		this.column = column;
	}

	toString() {
		return this.value;
	}
}

//Lexer class
export class Lexer {
	constructor(code) {
		this.code = code;
		this.tokens = [];
		this.current = 0;
		this.line = 1;
		this.column = 0;
	}

	error(msg) {
		throw new EaselError(`Error on ${this.line}:${this.column}: ${msg}`);
	}

	//Peek next character in code
	peek() {
		if (this.current >= this.code.length) return "\0";
		return this.code[this.current];
	}

	//Advance to next character
	advance() {
		if (this.current >= this.code.length) return "\0";
		this.current++;
		this.column++;
		return this.code[this.current - 1];
	}

	//Scan through a string of characters
	scanString(char) {
		let string = [];

		while (this.peek() !== char) {
			string.push(this.advance());

			if (this.peek() === "\0") {
				this.error("Unexpected end of file; Unterminated string");
			}
		}
		this.advance();

		return string.join("");
	}

	//Check if character is a digit
	isDigit(char) {
		return char >= "0" && char <= "9";
	}

	//Check if character is a letter
	isLetter(char) {
		return (
			(char.toLowerCase() >= "a" && char.toLowerCase() <= "z") ||
			(char >= "A" && char <= "Z")
		);
	}

    //Scan a number
    scanNumber() {
        let string = [];
        while (this.isDigit(this.peek()) || (this.peek === "." && !string.includes("."))) {
            string.push(this.advance());
        }
        return string.join("");
    }

	//Scan a single token
	scanToken() {
		let char = this.advance();

		switch (char) {
			case "(": {
				return this.tokens.push(
					new Token(
						TOKENS.LeftParen,
						"(",
						"(",
						this.line,
						this.column
					)
				);
			}

			case ")": {
				return this.tokens.push(
					new Token(
						TOKENS.RightParen,
						")",
						")",
						this.line,
						this.column
					)
				);
			}

			case "{": {
				return this.tokens.push(
					new Token(
						TOKENS.LeftBrace,
						"{",
						"{",
						this.line,
						this.column
					)
				);
			}

			case "}": {
				return this.tokens.push(
					new Token(
						TOKENS.RightBrace,
						"}",
						"}",
						this.line,
						this.column
					)
				);
			}

			case "[": {
				return this.tokens.push(
					new Token(
						TOKENS.LeftBracket,
						"[",
						"[",
						this.line,
						this.column
					)
				);
			}

			case "]": {
				return this.tokens.push(
					new Token(
						TOKENS.RightBracket,
						"]",
						"]",
						this.line,
						this.column
					)
				);
			}

			case ",": {
				return this.tokens.push(
					new Token(TOKENS.Comma, ",", ",", this.line, this.column)
				);
			}

			case ":": {
				return this.tokens.push(
					new Token(TOKENS.Colon, ":", ":", this.line, this.column)
				);
			}

			case ".": {
				return this.tokens.push(
					new Token(TOKENS.Period, ".", ".", this.line, this.column)
				);
			}

			case "+": {
				return this.tokens.push(
					new Token(TOKENS.Plus, "+", "+", this.line, this.column)
				);
			}

			case "-": {
				return this.tokens.push(
					new Token(TOKENS.Minus, "-", "-", this.line, this.column)
				);
			}

			case "*": {
				return this.tokens.push(
					new Token(TOKENS.Asterisk, "*", "*", this.line, this.column)
				);
			}

			case "/": {
				return this.tokens.push(
					new Token(TOKENS.Slash, "/", "/", this.line, this.column)
				);
			}

			case "\n": {
				this.line++;
				this.column = 0;
				return this.tokens.push(
					new Token(
						TOKENS.newline,
						"\n",
						"\n",
						this.line,
						this.column
					)
				);
			}

			case "'":
			case `"`: {
				const string = this.scanString(char);
				return this.tokens.push(
					new Token(
						TOKENS.String,
						string,
						string,
						this.line,
						this.column
					)
				);
			}

			case "|": {
				if (this.match("|")) {
					return this.tokens.push(
						new Token(TOKENS.Or, "||", "||", this.line, this.column)
					);
				}
			}

			case ">": {
				if (this.match("=")) {
					return this.tokens.push(
						new Token(
							TOKENS.Gte,
							">=",
							">=",
							this.line,
							this.column
						)
					);
				}

				return this.tokens.push(
					new Token(TOKENS.Gt, ">", ">", this.line, this.column)
				);
			}

			case "<": {
				if (this.match("=")) {
					return this.tokens.push(
						new Token(
							TOKENS.Lte,
							"<=",
							"<=",
							this.line,
							this.column
						)
					);
				}

				return this.tokens.push(
					new Token(TOKENS.Lt, "<", "<", this.line, this.column)
				);
			}

			case "!": {
				if (this.match("=")) {
					return this.tokens.push(
						new Token(
							TOKENS.NotEquiv,
							"!=",
							"!=",
							this.line,
							this.column
						)
					);
				}

				return this.tokens.push(
					new Token(TOKENS.Not, "!", "!", this.line, this.column)
				);
			}

			case "=": {
				if (this.match("=")) {
					return this.tokens.push(
						new Token(
							TOKENS.Equiv,
							"==",
							"==",
							this.line,
							this.column
						)
					);
				}

				//Equals to assign??
			}

			case "&": {
				if (this.match("&")) {
					return this.tokens.push(
						new Token(
							TOKENS.And,
							"&&",
							"&&",
							this.line,
							this.column
						)
					);
				}
			}

			default: {
				//Deal with Numbers, Identifiers and Keywords
				if (this.isDigit(char)) {
					const num = this.scanNumber();
					return this.tokens.push(
						new Token(
							TOKENS.Number,
							num,
							Number(num),
							this.line,
							this.column
						)
					);
				} else if (this.isAlpha(char)) {
					const identifier = this.scanIdentifier();
					return this.tokens.push(
						new Token(
							TOKENS.Identifier,
							identifier,
							identifier,
							this.line,
							this.column
						)
					);
				} else {
					throw new EaselError(
						`Unexpected character ${char} at line ${this.line}:${this.column}`
					);
				}
			}
		}
	}

	//Match multiple tokens
	match(char) {
		if (this.peek() === char) {
			return this.advance();
		}

		return false;
	}

	//Run through all tokens until EOF is found
	scanTokens() {
		while (this.peek() !== "\0") this.scanToken();

		this.tokens.push(new Token("EOF", null, null, this.line, this.column));
		return this.tokens;
	}
}

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

	//Scan a single token
	scanToken() {
		let char = this.advance();

		switch (char) {
			case "(": {
				return this.tokens.push(
					new Token(
						TOKENS.leftParen,
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
                        TOKENS.rightParen,
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
                        TOKENS.leftBrace,
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
                        TOKENS.rightBrace,
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
                        TOKENS.leftBracket,
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
                        TOKENS.rightBracket,
                        "]",
                        "]",
                        this.line,
                        this.column
                    )
                );
            }

            case ",": {
                return this.tokens.push(
                    new Token(
                        TOKENS.comma,
                        ",",
                        ",",
                        this.line,
                        this.column
                    )
                );
            }

            case ":": {
                return this.tokens.push(
                    new Token(
                        TOKENS.colon,
                        ":",
                        ":",
                        this.line,
                        this.column
                    )
                );
            }

            case ".": {
                return this.tokens.push(
                    new Token(
                        TOKENS.period,
                        ".",
                        ".",
                        this.line,
                        this.column
                    )
                );
            }   

            case "+": {
                return this.tokens.push(
                    new Token(
                        TOKENS.plus,
                        "+",
                        "+",
                        this.line,
                        this.column
                    )
                );
            }

            case "-": {
                return this.tokens.push(
                    new Token(
                        TOKENS.minus,
                        "-",
                        "-",
                        this.line,
                        this.column
                    )
                );
            }

            case "*": {
                return this.tokens.push(
                    new Token(
                        TOKENS.asterisk,
                        "*",
                        "*",
                        this.line,
                        this.column
                    )
                );
            }

            case "/": {
                return this.tokens.push(
                    new Token(
                        TOKENS.slash,
                        "/",
                        "/",
                        this.line,
                        this.column
                    )
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
		}
	}

	//Run through all tokens until EOF is found
	scanTokens() {
		while (this.peek() !== "\0") this.scanToken();

		this.tokens.push(new Token("EOF", null, null, this.line, this.column));
		return this.tokens;
	}
}

import fs from "fs";
import { EaselError } from "./stdlib";

//Getting tokens from the JSON file
const pathToTokens = "./tokens.json";
const getTokens = () => {
    try {
        // Step 1: Read the JSON file synchronously
        const data = fs.readFileSync(pathToTokens, 'utf8');
    
        // Step 2: Parse the JSON data
        const jsonData = JSON.parse(data);
        console.log("Parsed JSON data:", jsonData);
        return jsonData;
    } catch (err) {
        console.error("Error:", err);
    }
}

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

    error(msg ) {
        throw new EaselError(`Error on ${this.line}:${this.column}: ${msg}`);
    }

    //Peek next character in code
    peek() {
        if (this.current >= this.code.length) return "\0";
        return this.code[this.current];
    }

    //Run through all tokens until EOF is found
    scanTokens() {
        while(this.peek() !== "\0") this.scanToken();

        this.tokens.push(new Token("EOF", null, null, this.line, this.column));
        return this.tokens;
    }
}
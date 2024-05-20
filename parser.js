import { EaselError } from "./stdlib";
import { TOKENS } from "./lexer";

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.ast = []; //Abstract syntax tree
        this.current = 0;
    }

    error(token, msg) {
        throw new EaselError(`Syntax error on ${token.line}:${token.column}: ${msg}`);
    }

    peek() {
        if(this.current >= this.tokens.length) return null;
        return this.tokens[this.current];
    }

    peekType() {
        if(this.current >= this.tokens.length) return null;
        return this.tokens[this.current].type;
    }

    parse() {
        while(this.peekType() !== "EOF") continue;
        return this.ast;
    }
}
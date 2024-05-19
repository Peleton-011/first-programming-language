import fs from "fs";

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
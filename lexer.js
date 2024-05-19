import fs from "fs";

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

getTokens()
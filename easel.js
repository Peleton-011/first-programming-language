import fs from "fs";

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
    } else {
        console.log("No path provided");
    }
})();

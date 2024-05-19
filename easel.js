import fs from "fs";

const readFile = (path) => {

    return new Promise ((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err)
            } else {
                resolve(data.toString())
            }
        })
    })
}


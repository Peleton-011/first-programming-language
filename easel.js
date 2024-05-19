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

const writeFile = (path, data) => {
    return new Promise ((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                return reject(err)
            } else {
                resolve()
            }
        })
    })
}
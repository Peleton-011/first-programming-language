export class EaselError extends Error {
	constructor(message) {
		super();
		this.message = message;
	}

	toString() {
		return this.message;
	}
}


export class Canvas {
	constructor(rows = 64, columns = 64) {
		this.rows = rows;
		this.columns = columns;
		this.default = { r: 0, g: 0, b: 0 };
		this.grid = [];
		for (let i = 0; i < rows * columns; i++) {
			this.grid.push({ ...this.default });
		}
	}

	get([x, y]) {
		return this.grid[y * this.columns + x];
	}

	fill([x, y, color]) {
		let cell = this.grid[y * this.columns + x];
		if (!cell) {
			throw new Error(`Invalid coordinates: ${x}, ${y}`);
		}
		cell.r = color.r;
		cell.g = color.g;
		cell.b = color.b;
	}

	erase([x, y]) {
		let cell = this.grid[y * this.columns + x];
		if (!cell) {
			throw new Error(`Invalid coordinates: ${x}, ${y}`);
		}
		cell = { ...this.default };
	}
}


export default {
	ink: (args) => console.log(...args),
	random: ([min, max]) => {
		if (min >= 0 && max <= 1) {
			return Math.random();
		}
		return Math.random() * (max - min + 1) + min;
	},
	round: (n) => Math.round(n),

    Canvas: new Canvas(),
    Color: members => {
        const instance = {        }
        for(const key of Object.keys(members)) {
            if(!['r', 'g', 'b'].includes(key)) {
                throw new Error(`Invalid key: ${key} found while creating instance of Color`);
            }
            instance[key] = members[key];
        }
        return instance;
    }

	//TODO: Add more functions
};

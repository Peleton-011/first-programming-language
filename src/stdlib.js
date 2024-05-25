export class EaselError extends Error {
	constructor(message) {
		super();
		this.message = message;
	}

	toString() {
		return this.message;
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

	//TODO: Add more functions
};

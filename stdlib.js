export class EaselError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }

    toString() {
        return this.message;
    }
}
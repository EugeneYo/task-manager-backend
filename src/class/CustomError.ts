class CustomError extends Error {
	public statusCode: number;
	public message: string;
	constructor(statusCode: number, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		const realPrototype = new.target.prototype;

		if (Object.setPrototypeOf) {
			Object.setPrototypeOf(this, realPrototype);
		}
	}
}

export default CustomError;

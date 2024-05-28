export default class UnacceptableError extends Error {
	constructor(msg: string) {
		super(msg)
	}
}
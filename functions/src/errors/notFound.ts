export default class NotFoundError extends Error {
	constructor(msg: string) {
		super(msg)
	}
}
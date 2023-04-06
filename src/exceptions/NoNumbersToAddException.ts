import HttpException from './HttpException';

class NoNumbersToAddException extends HttpException {
	constructor() {
		super(400, `There are no numbers to add in the request`);
	}
}

export default NoNumbersToAddException;

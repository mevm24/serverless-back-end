import HttpException from './HttpException';

class NegativeSquareRootException extends HttpException {
	constructor() {
		super(400, `Square root can't be calculated in negative numbers`);
	}
}

export default NegativeSquareRootException;

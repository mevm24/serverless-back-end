import HttpException from './HttpException';

class DivideByZeroException extends HttpException {
	constructor() {
		super(400, `Divition by zero is not allowed`);
	}
}

export default DivideByZeroException;

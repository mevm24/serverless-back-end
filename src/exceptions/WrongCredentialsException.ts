import HttpException from './HttpException';

class WrongCredentialsException extends HttpException {
	constructor() {
		super(400, `Username and password don't match. Please try again`);
	}
}

export default WrongCredentialsException;

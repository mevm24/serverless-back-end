import HttpException from './HttpException';

class WrongAuthenticationTokenException extends HttpException {
	constructor() {
		super(400, `Token is not valid. Please try again`);
	}
}

export default WrongAuthenticationTokenException;

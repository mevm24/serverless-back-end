import HttpException from './HttpException';

class AuthenticationTokenMissingException extends HttpException {
	constructor() {
		super(400, `Token is not present in the request. Please try again`);
	}
}

export default AuthenticationTokenMissingException;

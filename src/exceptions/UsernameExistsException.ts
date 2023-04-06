import HttpException from './HttpException';

class UsernameExistsException extends HttpException {
	constructor(username: string) {
		super(400, `Username ${username} already exists`);
	}
}

export default UsernameExistsException;

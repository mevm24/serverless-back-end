import HttpException from './HttpException';

class UsernameNotExistException extends HttpException {
	constructor(username: string) {
		super(404, `Username ${username} does not exist`);
	}
}

export default UsernameNotExistException;

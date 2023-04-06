import HttpException from './HttpException';

class UserDoesNotHaveEnoughBalanceException extends HttpException {
	constructor(user_id: string) {
		super(
			400,
			`User ${user_id} does not have enough balance to execute this operation`
		);
	}
}

export default UserDoesNotHaveEnoughBalanceException;

import HttpException from './HttpException';

class UserHasNoRecordsException extends HttpException {
	constructor(user_id: string) {
		super(404, `There are no records for user ${user_id}`);
	}
}

export default UserHasNoRecordsException;

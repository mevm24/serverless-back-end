import HttpException from './HttpException';

class NoOperationFoundException extends HttpException {
	constructor(searchParameter: string, errorMessage: string) {
		super(
			404,
			`No operation found with ${errorMessage} = ${searchParameter}`
		);
	}
}

export default NoOperationFoundException;

import HttpException from './HttpException';

class OperationTypeExistsException extends HttpException {
	constructor(type: string) {
		super(400, `Operation ${type} already exists`);
	}
}

export default OperationTypeExistsException;

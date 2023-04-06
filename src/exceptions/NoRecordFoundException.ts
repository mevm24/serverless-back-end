import HttpException from './HttpException';

class NoRecordFoundException extends HttpException {
	constructor(id: string) {
		super(400, `No record with id: ${id} was found`);
	}
}

export default NoRecordFoundException;

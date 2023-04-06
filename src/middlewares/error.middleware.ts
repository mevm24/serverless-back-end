import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/HttpException';
import { validationResult } from 'express-validator';

const errorMiddleware = (
	error: HttpException,
	request: Request,
	response: Response,
	next: NextFunction
) => {
	const status = error.status || 500;
	const message = error.message || 'Something went wrong';
	response.status(status).send({
		status,
		message,
	});
};

const validateFields = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json(errors);
	}

	next();
};

export { errorMiddleware, validateFields };

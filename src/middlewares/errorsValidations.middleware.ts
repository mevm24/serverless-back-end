import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import * as express from 'express';
import HttpException from '../exceptions/HttpException';

const validationMiddleware = <T>(type: any): express.RequestHandler => {
	return (req, res, next) => {
		validate(plainToInstance(type, req.body)).then(
			(errors: ValidationError[]) => {
				if (errors.length > 0) {
					const message = errors
						.map((error: ValidationError) =>
							Object.values(error.constraints || '')
						)
						.join(', ');
					next(new HttpException(400, message));
				} else {
					next();
				}
			}
		);
	};
};

const validationArrayMiddleware = <T>(type: any): express.RequestHandler => {
	return async (req, res, next) => {
		const operations = req.body;
		const errorsArray = await handleErrors(operations, type);
		if (errorsArray.length > 0) {
			next(new HttpException(500, errorsArray[0].message));
		} else {
			next();
		}
	};
};

const handleErrors = async (operations: any, type: any) => {
	const promises = await operations.map(async (element: any) =>
		validateData(type, element)
	);
	const errorsArray: Error[] = [];
	const resolvedPromises = await Promise.allSettled(promises);
	resolvedPromises.forEach((promiseData: any) => {
		if (promiseData.value) {
			errorsArray.push(new Error(promiseData.value));
		}
	});
	return errorsArray;
};

const validateData = async (type: any, element: any) => {
	return await validate(plainToInstance(type, element)).then(
		(errors: ValidationError[]) => {
			if (errors.length > 0) {
				const message = errors
					.map((error: ValidationError) =>
						Object.values(error.constraints || '')
					)
					.join(', ');
				return message;
			}
			return '';
		}
	);
};

export { validationMiddleware, validationArrayMiddleware };

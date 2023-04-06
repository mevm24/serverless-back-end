import { NextFunction, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import * as jwt from 'jsonwebtoken';
import { DataInToken } from '../entity/token';
import { UserModel } from '../models';
import { RequestWithUser } from '../entity/controllers';
import { WrongAuthenticationTokenException } from '../exceptions';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';

async function authMiddleware(
	request: RequestWithUser,
	response: Response,
	next: NextFunction
) {
	const headers = request.headers;
	if (headers && headers.authorization) {
		const secret = process.env.JWT_SECRET as string;
		try {
			const verificationResponse = jwt.verify(
				headers.authorization.split(' ')[1],
				secret
			) as DataInToken;
			const { id, username } = verificationResponse;
			const user = await new UserModel().getUserById(id, username);
			if (user) {
				request.user = user;
				next();
			} else {
				next(new WrongAuthenticationTokenException());
			}
		} catch (error) {
			next(new WrongAuthenticationTokenException());
		}
	} else {
		next(new AuthenticationTokenMissingException());
	}
}

export default authMiddleware;

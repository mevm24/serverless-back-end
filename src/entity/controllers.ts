import { Request, Router } from 'express';
import { UserDAO } from './dao';

export interface Controllers {
	path: string;
	router: Router;
}

export interface RequestWithUser extends Request {
	user?: UserDAO;
}

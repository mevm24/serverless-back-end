import express, { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { validationMiddleware } from '../middlewares/errorsValidations.middleware';
import { Controllers, RequestWithUser } from '../entity/controllers';
import { CreateUserDTO } from '../entity/dto';
import authMiddleware from '../middlewares/auth.middleware';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import { WrongAuthenticationTokenException } from '../exceptions';

export class UserController implements Controllers {
	public path: string = '/user';
	public router = express.Router();
	private userService: UserService;
	constructor() {
		this.userService = new UserService();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.post(
			`${this.path}/login`,
			validationMiddleware(CreateUserDTO),
			this.login.bind(this)
		);
		this.router.post(
			`${this.path}/create`,
			validationMiddleware(CreateUserDTO),
			this.createUser.bind(this)
		);
		this.router.get(
			`${this.path}/get`,
			authMiddleware,
			this.getUser.bind(this)
		);
	}

	async login(req: Request, res: Response, next: NextFunction): Promise<any> {
		const { username, password } = req.body;

		try {
			const user = await this.userService.login({ username, password });
			if (user) {
				user.password = '';
				const tokenData = this.userService.createToken(user);
				return res.status(200).json({ ...tokenData });
			}
		} catch (err: any) {
			next(err);
		}
	}

	async createUser(req: Request, res: Response, next: NextFunction) {
		const { username, password } = req.body;

		try {
			const user = await this.userService.createUser(username, password);
			if (user) {
				user.password = '';
				const tokenData = this.userService.createToken(user);
				return res.status(200).json({ ...tokenData });
			}
		} catch (err: any) {
			next(err);
		}
	}

	async getUser(req: RequestWithUser, res: Response, next: NextFunction) {
		const { user } = req;
		try {
			if (user) {
				const validatedUser = await this.userService.getUser(
					user.id,
					user.username
				);
				if (validatedUser) {
					validatedUser.password = '';
					return res.status(200).json({ validatedUser });
				}
				next(new WrongAuthenticationTokenException());
			}
			next(new AuthenticationTokenMissingException());
		} catch (err: any) {
			next(err);
		}
	}
}

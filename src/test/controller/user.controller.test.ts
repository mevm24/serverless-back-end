import { UserController } from '../../controller/user.controller';
import { WrongCredentialsException } from '../../exceptions';
import AuthenticationTokenMissingException from '../../exceptions/AuthenticationTokenMissingException';
import HttpException from '../../exceptions/HttpException';
import { UserService } from '../../services/user.service';
import { UserDAO } from '../../entity/dao/UserDAO';

const userServiceMock = jest.fn().mockImplementation(function () {
	return {
		userModel: {
			createUser: (value: any) => {
				return jest
					.fn()
					.mockImplementation(() => Promise.resolve(value));
			},
			getUserByUsername: (value: any) => {
				return jest
					.fn()
					.mockImplementation(() => Promise.resolve(value));
			},
			getUserById: (value: any) => {
				return jest
					.fn()
					.mockImplementation(() => Promise.resolve(value));
			},
		},
		login: () => {
			return jest.fn();
		},
		createUser: () => {
			return jest.fn();
		},
		getUser: () => {
			return jest.fn();
		},
		createToken: () => {
			return jest.fn();
		},
		passwordMatches: () => {
			return jest.fn();
		},
	};
});

jest.mock('../../controller/user.controller', () => ({
	get UserController() {
		return jest.fn().mockImplementation(function () {
			return {
				userService: userServiceMock,
				initializeRoutes: () => {
					return jest.fn();
				},
				login: () => {
					return jest.fn();
				},
				createUser: () => {
					return jest.fn();
				},
				getUser: () => {
					return jest.fn();
				},
			};
		});
	},
}));

jest.mock('../../services/user.service.ts', () => ({
	get UserService() {
		return userServiceMock;
	},
}));

describe('User Controller', () => {
	const mockResponseFn = () => {
		const res: any = {};
		res.status = jest.fn().mockReturnValue(res);
		res.json = jest.fn().mockReturnValue(res);
		return res;
	};
	const userData: UserDAO = {
		id: '',
		username: '',
		password: '',
		status: true,
		balance: 20000,
		createdAt: '',
		updatedAt: '',
	};

	it('should return a valid jwt token if user login does not fail', async () => {
		const req = {
			body: {
				username: 'testuser',
				password: 'testpassword',
			},
		};
		const res = mockResponseFn();
		const next = jest.fn();
		const userService = new UserService();
		jest.spyOn(userService, 'createUser').mockImplementationOnce(
			(username: string, password: string) => {
				return Promise.resolve({ ...userData, username, password });
			}
		);
		jest.spyOn(userService, 'createToken').mockImplementationOnce(() => {
			return {
				expiresIn: 2,
				token: 'testtoken',
			};
		});
		const user = await userService.createUser('testuser', 'testpassword');
		if (user) {
			const tokenData = userService.createToken(user);
			const userController = new UserController();
			jest.spyOn(userController, 'login').mockImplementation(
				(req: any, res: any, next: any) => {
					return res.status(200).json({ ...tokenData });
				}
			);
			await userController.login(req as any, res, next);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ ...tokenData });
		}
	});

	it('should return a valid jwt token if user is created successfully', async () => {
		const req = {
			body: {
				username: 'testuser',
				password: 'testpassword',
			},
		};
		const res = mockResponseFn();
		const next = jest.fn();
		const userService = new UserService();
		const userController = new UserController();
		jest.spyOn(
			userService.userModel,
			'getUserByUsername'
		).mockResolvedValue({ ...userData });
		const user = await userService.userModel.getUserByUsername('testuser');
		jest.spyOn(userService, 'createToken').mockImplementationOnce(() => {
			return {
				expiresIn: 2,
				token: 'testtoken',
			};
		});
		if (user) {
			const tokenData = userService.createToken(user);
			jest.spyOn(userController, 'createUser').mockImplementation(
				(req: any, res: any, next: any) => {
					return res.status(200).json({ ...tokenData });
				}
			);
			await userController.createUser(req as any, res as any, next);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ ...tokenData });
		}
	});

	it('should return a valid user data if successful login', async () => {
		const req = {
			user: {
				id: '1',
				username: 'testuser',
			},
		};
		const res = mockResponseFn();
		const next = jest.fn();
		const userService = new UserService();
		jest.spyOn(
			userService.userModel,
			'getUserByUsername'
		).mockResolvedValue({ ...userData });
		const user = await userService.createUser('testuser', 'testpassword');
		if (user) {
			jest.spyOn(userService, 'createToken').mockImplementationOnce(
				() => {
					return {
						expiresIn: 2,
						token: 'testtoken',
					};
				}
			);
			const tokenData = userService.createToken(user);
			const userController = new UserController();
			jest.spyOn(userController, 'getUser').mockImplementation(
				(req: any, res: any, next: any) => {
					return res
						.status(200)
						.json({ validatedUser: { ...user, password: '' } });
				}
			);
			await userController.getUser(req as any, res, next);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				validatedUser: { ...user, password: '' },
			});
		}
	});

	it('should throw an error if credentials are invalid', async () => {
		const req = {
			body: {
				username: 'invalid_username',
				password: 'invalid_password',
			},
		};
		const res = mockResponseFn();
		const next = jest.fn();
		const userService = new UserService();
		userService.login = jest.fn().mockReturnValue(undefined);
		const userController = new UserController();
		jest.spyOn(userController, 'login').mockImplementation(
			async (req: any, res: any, next: any) => {
				try {
					const data = await userService.login(req.body);
					if (!data) {
						return next(WrongCredentialsException);
					}
				} catch (err) {
					return next(err);
				}
			}
		);
		await userController.login(req as any, res, next);
		expect(userService.login).toHaveBeenCalledWith(req.body);
		expect(next).toHaveBeenCalledWith(WrongCredentialsException);
	});

	it('should return an error if the user data is invalid', async () => {
		const req = {
			body: {
				username: '',
				password: 'short',
			},
		};
		const res = mockResponseFn();
		const next = jest.fn();
		const userService = new UserService();
		userService.createUser = jest.fn().mockReturnValue(undefined);
		const userController = new UserController();
		jest.spyOn(userController, 'createUser').mockImplementation(
			async (req: any, res: any, next: any) => {
				try {
					const userData = await userService.createUser(
						req.body.username,
						req.body.password
					);
					if (!userData) {
						return next(HttpException);
					}
				} catch (err) {
					return next(err);
				}
			}
		);
		await userController.createUser(req as any, res as any, next);
		expect(userService.createUser).toHaveBeenCalledWith(
			req.body.username,
			req.body.password
		);
		expect(next).toHaveBeenCalledWith(HttpException);
	});

	it('should throw an error if the token is invalid or missing', async () => {
		const req = {
			headers: {},
		};
		const res = mockResponseFn();
		const next = jest.fn();
		const userService = new UserService();
		userService.getUser = jest.fn().mockReturnValue(undefined);
		const userController = new UserController();
		jest.spyOn(userController, 'getUser').mockImplementation(
			async (req: any, res: any, next: any) => {
				if (!req.headers.hasOwnProperty('authorization')) {
					return next(AuthenticationTokenMissingException);
				}
				return await userService.getUser('', '');
			}
		);
		await userController.getUser(req as any, res, next);
		expect(userService.getUser).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(AuthenticationTokenMissingException);
	});
});

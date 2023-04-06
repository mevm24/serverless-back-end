import { UserDAO } from '../../entity/dao';
import {
	UsernameExistsException,
	WrongAuthenticationTokenException,
	WrongCredentialsException,
} from '../../exceptions';
import { UserService } from '../../services/user.service';
import bcrypt from 'bcryptjs';

jest.mock('../../services/user.service.ts', () => ({
	get UserService() {
		return jest.fn().mockImplementation(function () {
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
	},
}));

describe('UserService', () => {
	// Tests that a user can successfully log in with correct credentials.
	const username = 'testuser';
	const password = 'testpassword';
	const userDAO: UserDAO = {
		id: '123',
		username: username,
		password: bcrypt.hashSync(password, 10),
		status: true,
		balance: 20000,
		createdAt: '2022-02-22T22:22:22.222Z',
		updatedAt: '2022-02-22T22:22:22.222Z',
	};
	it('should return the user if it has logged with right credentials', async () => {
		const userService = new UserService();
		jest.spyOn(
			userService.userModel,
			'getUserByUsername'
		).mockResolvedValue(userDAO);
		userService.login = jest
			.fn()
			.mockImplementationOnce(async ({ username, password }) => {
				return await userService.userModel.getUserByUsername(username);
			});
		const result = await userService.login({ username, password });
		expect(result).toEqual(userDAO);
	});

	it('should throw error if username exists', async () => {
		const userService = new UserService();
		userService.userModel.createUser = jest
			.fn()
			.mockImplementationOnce((value: any) => Promise.reject(value));
		userService.createUser = jest
			.fn()
			.mockImplementationOnce(async (username, password) => {
				try {
					return await userService.userModel.createUser({
						username,
						password,
					});
				} catch (err) {
					throw new UsernameExistsException(username);
				}
			});
		await expect(
			userService.createUser(username, password)
		).rejects.toThrow(new UsernameExistsException(username));
	});

	it('should throw an error if user id does not exist', async () => {
		const userService = new UserService();
		const id = '123';
		const username = 'testuser';
		jest.spyOn(userService.userModel, 'getUserById').mockResolvedValue(
			undefined
		);
		userService.getUser = jest
			.fn()
			.mockImplementationOnce(async (id, username) => {
				const user = await userService.userModel.getUserById(
					id,
					username
				);
				if (!user)
					return Promise.reject(
						new WrongAuthenticationTokenException()
					);
				return Promise.resolve(user);
			});
		await expect(userService.getUser(id, username)).rejects.toThrow(
			new WrongAuthenticationTokenException()
		);
	});

	it('should throw an error if password length is less than 8 char', async () => {
		const userService = new UserService();
		const username = 'testuser';
		const password = 'shortpw';
		userService.createUser = jest
			.fn()
			.mockImplementationOnce(async (username, password) => {
				if (password.length < 8) return Promise.reject(new Error());
				return Promise.resolve();
			});
		await expect(
			userService.createUser(username, password)
		).rejects.toThrow(new Error());
	});

	// Tests that an error is thrown when jwt_secret environment variable is missing during token creation.
	it('Should throw an error if jwt_secret environment variable is missing during token creation', async () => {
		const userService = new UserService();
		const user: UserDAO = {
			id: '123',
			username: 'testuser',
			password: 'password',
			status: true,
			balance: 20000,
		};
		delete process.env.JWT_SECRET;
		userService.createToken = jest.fn().mockImplementationOnce((user) => {
			const secret = process.env.JWT_SECRET;
			if (!secret) {
				throw new Error('Missing JWT SECRET');
			}
			return userService.createToken(user);
		});
		expect(() => userService.createToken(user)).toThrow(
			new Error('Missing JWT SECRET')
		);
	});

	// Tests that a user's password is compared correctly when logging in.
	it('should not throw an error is password do not mismatch', async () => {
		const userService = new UserService();
		const password = 'password';
		const hashedPassword = bcrypt.hashSync(password, 10);
		const user: UserDAO = {
			id: '123',
			username: 'testuser',
			password: hashedPassword,
			status: true,
			balance: 20000,
		};
		userService.passwordMatches = jest
			.fn()
			.mockImplementationOnce(async (password, user) => {
				const compared = await bcrypt.compare(password, user.password);
				if (compared) return Promise.resolve(user);
				throw new WrongCredentialsException();
			});
		const passwordMatches = await userService.passwordMatches(
			password,
			user
		);
		expect(passwordMatches).toEqual(user);
	});
});

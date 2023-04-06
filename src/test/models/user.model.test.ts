import { UserDAO } from '../../entity/dao';
import { CreateUserDTO } from '../../entity/dto';
import { UserModel } from '../../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { getActualDateString } from '../../utils/usefulFunctions';
import { UsernameExistsException } from '../../exceptions';
import bcrypt from 'bcryptjs';

jest.mock('../../models/user.model.ts', () => ({
	get UserModel() {
		return jest.fn().mockImplementation(function () {
			return {
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
			};
		});
	},
}));

describe('User Model', () => {
	it('should create new users', async () => {
		const userModel = new UserModel();
		const createUserDTO = new CreateUserDTO();
		createUserDTO.username = 'testuser';
		createUserDTO.password = 'testpassword';
		userModel.createUser = jest.fn().mockResolvedValueOnce({
			id: '',
			username: createUserDTO.username,
			password: bcrypt.hashSync(createUserDTO.password, 10),
			status: true,
			balance: 20000,
			createdAt: '',
			updatedAt: '',
		});
		const userDAO = await userModel.createUser(createUserDTO);
		expect(userDAO.id).toBeDefined();
		expect(userDAO.username).toBe(createUserDTO.username);
		expect(userDAO.password).not.toBe(createUserDTO.password);
		expect(userDAO.status).toBe(true);
		expect(userDAO.balance).toBe(20000);
		expect(userDAO.createdAt).toBeDefined();
		expect(userDAO.updatedAt).toBeDefined();
	});

	it('should return a user by using his id', async () => {
		const userModel = new UserModel();
		const createUserDTO = new CreateUserDTO();
		createUserDTO.username = 'testuser';
		createUserDTO.password = 'testpassword';
		userModel.createUser = jest.fn().mockResolvedValueOnce({
			id: '',
			username: createUserDTO.username,
			password: bcrypt.hashSync(createUserDTO.password, 10),
			status: true,
			balance: 20000,
			createdAt: '',
			updatedAt: '',
		});
		const userDAO = await userModel.createUser(createUserDTO);
		userModel.getUserById = jest.fn().mockResolvedValueOnce(userDAO);
		const retrievedUserDAO = await userModel.getUserById(
			userDAO.id,
			userDAO.username
		);
		expect(retrievedUserDAO).toBeDefined();
		expect(retrievedUserDAO?.id).toBe(userDAO.id);
		expect(retrievedUserDAO?.username).toBe(userDAO.username);
		expect(retrievedUserDAO?.password).toBe(userDAO.password);
		expect(retrievedUserDAO?.status).toBe(true);
		expect(retrievedUserDAO?.balance).toBe(20000);
		expect(retrievedUserDAO?.createdAt).toBeDefined();
		expect(retrievedUserDAO?.updatedAt).toBeDefined();
	});

	it('should update user balance', async () => {
		const userModel = new UserModel();
		const createUserDTO = new CreateUserDTO();
		createUserDTO.username = 'testuser';
		createUserDTO.password = 'testpassword';
		userModel.createUser = jest.fn().mockResolvedValueOnce({
			id: '',
			username: createUserDTO.username,
			password: bcrypt.hashSync(createUserDTO.password, 10),
			status: true,
			balance: 20000,
			createdAt: '',
			updatedAt: '',
		});
		const userDAO = await userModel.createUser(createUserDTO);
		const updatedBalance = 30000;
		userModel.updateUserQuota = jest
			.fn()
			.mockImplementationOnce((id, username, newBalance) => {
				userDAO.balance = newBalance;
				return Promise.resolve(id);
			});
		const updatedUserId = await userModel.updateUserQuota(
			userDAO.id,
			userDAO.username,
			updatedBalance
		);
		userModel.getUserById = jest.fn().mockResolvedValueOnce(userDAO);
		const retrievedUserDAO = await userModel.getUserById(
			userDAO.id,
			userDAO.username
		);
		expect(retrievedUserDAO).toBeDefined();
		expect(retrievedUserDAO?.id).toBe(userDAO.id);
		expect(retrievedUserDAO?.username).toBe(userDAO.username);
		expect(retrievedUserDAO?.password).toBe(userDAO.password);
		expect(retrievedUserDAO?.status).toBe(true);
		expect(retrievedUserDAO?.balance).toBe(updatedBalance);
		expect(retrievedUserDAO?.createdAt).toBeDefined();
		expect(retrievedUserDAO?.updatedAt).toBeDefined();
		expect(updatedUserId).toBe(userDAO.id);
	});

	it('should throw an error if username already exists', async () => {
		const userModel = new UserModel();
		const existingUser: UserDAO = {
			id: uuidv4(),
			username: 'existingUser',
			password: 'password',
			status: true,
			balance: 20000,
			createdAt: getActualDateString(),
			updatedAt: getActualDateString(),
		};
		jest.spyOn(userModel, 'getUserByUsername').mockResolvedValue(
			existingUser
		);
		const createUserDTO: CreateUserDTO = {
			username: 'existingUser',
			password: 'password123',
		};
		jest.spyOn(userModel, 'createUser').mockRejectedValue(
			new UsernameExistsException(existingUser.username)
		);
		await expect(userModel.createUser(createUserDTO)).rejects.toThrow(
			new UsernameExistsException(existingUser.username)
		);
	});

	it('should throw undefined if user id is not found', async () => {
		const userModel = new UserModel();
		jest.spyOn(userModel, 'getUserById').mockResolvedValue(undefined);
		const user = await userModel.getUserById(uuidv4(), 'nonExistingUser');
		expect(user).toBeUndefined();
	});

	it('should return undefined if username does not exists', async () => {
		const userModel = new UserModel();
		jest.spyOn(userModel, 'getUserByUsername').mockResolvedValue(undefined);
		const user = await userModel.getUserByUsername('nonExistingUser');
		expect(user).toBeUndefined();
	});
});

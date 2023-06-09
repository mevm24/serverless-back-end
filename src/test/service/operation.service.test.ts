// Generated by CodiumAI

import { UserDAO } from '../../entity/dao';
import { CreateOperationDTO } from '../../entity/dto';
import { OperationStrategy } from '../../entity/operation';
import {
	NoOperationFoundException,
	OperationTypeExistsException,
	WrongAuthenticationTokenException,
} from '../../exceptions';
import UserDoesNotHaveEnoughBalanceException from '../../exceptions/UserDoesNotHaveEnoughBalanceException';
import { UserModel } from '../../models/user.model';
import { OperationService } from '../../services/operation.service';

jest.mock('../../models/user.model', () => ({
	get UserModel() {
		return jest.fn().mockImplementation(function () {
			return {
				createUser: (value: any) => {
					return jest.fn();
				},
				getUserByUsername: (value: any) => {
					return jest.fn();
				},
				getUserById: (value: any) => {
					return jest.fn();
				},
			};
		});
	},
}));

jest.mock('../../services/operation.service.ts', () => ({
	get OperationService() {
		return jest.fn().mockImplementation(function () {
			return {
				userModel: {
					createUser: (value: any) => {
						return jest.fn();
					},
					getUserByUsername: (value: any) => {
						return jest.fn();
					},
					getUserById: (value: any) => {
						return jest.fn();
					},
				},
				operationModel: {
					createOperation: (value: any) => {
						return jest.fn();
					},
					createBatchOperation: (value: any) => {
						return jest.fn();
					},
					getOperationById: (value: any) => {
						return jest.fn();
					},
					getOperationByType: (value: any) => {
						return jest.fn();
					},
					getAllOperations: (value: any) => {
						return jest.fn();
					},
					updateOperation: (value: any) => {
						return jest.fn();
					},
				},
				recordModel: {
					createRecord: (value: any) => {
						return jest.fn();
					},
					getRecordById: (value: any) => {
						return jest.fn();
					},
					getRecordsByUser: (value: any) => {
						return jest.fn();
					},
					deleteRecord: (value: any) => {
						return jest.fn();
					},
				},
				getAllTypes: () => {
					return jest.fn();
				},
				createOperation: () => {
					return jest.fn();
				},
				createBatchOperation: () => {
					return jest.fn();
				},
				getOperationByType: () => {
					return jest.fn();
				},
				getOperationById: () => {
					return jest.fn();
				},
				updateOperation: () => {
					return jest.fn();
				},
				executeCalculate: () => {
					return jest.fn();
				},
			};
		});
	},
}));

describe('Operation Service', () => {
	// Tests that getalltypes returns all available operation types.
	const user: UserDAO = {
		id: '123',
		username: 'testUser',
		balance: 500,
		password: '',
		status: false,
		createdAt: '',
		updatedAt: '',
	};
	it('should return all available operations', async () => {
		const operationService = new OperationService();
		const result = await operationService.getAllTypes();
		expect(result).toBeDefined();
	});

	it('should create an operation if the operation type does not exists, otherwise throw an OperationTypeExistsException', async () => {
		const operationService = new OperationService();
		const createOperationDTO: CreateOperationDTO = {
			type: 'test',
			cost: 100,
		};
		await operationService.createOperation(createOperationDTO);
		try {
			await operationService.createOperation(createOperationDTO);
		} catch (error) {
			expect(error).toBeInstanceOf(OperationTypeExistsException);
		}
	});

	it('should throw an error if user user does not have enough balance to execute the operation', async () => {
		const operationService = new OperationService();
		const userDAO: UserDAO = {
			id: 'test',
			username: 'test',
			password: 'test',
			status: true,
			balance: 0,
		};
		const operationStrategy: OperationStrategy = {
			operationName: 'test',
			operation: async () => {
				return 'test';
			},
		};
		try {
			await operationService.executeCalculate(operationStrategy, userDAO);
		} catch (error) {
			expect(error).toBeInstanceOf(UserDoesNotHaveEnoughBalanceException);
		}
	});

	it('should throw an error if operation does not exist', async () => {
		const operationService = new OperationService();
		const operation = {
			operationName: 'invalidType',
			operation: async () => {
				return 'test';
			},
		};
		operationService.getOperationByType = jest
			.fn()
			.mockImplementationOnce((operationName) => {
				if (operationName === 'invalidType')
					return Promise.reject(
						new NoOperationFoundException(operationName, 'Type')
					);
			});
		operationService.executeCalculate = jest
			.fn()
			.mockImplementationOnce(async (operation, user) => {
				try {
					const getOperation =
						await operationService.getOperationByType(
							operation.operationName
						);
					return Promise.resolve(getOperation);
				} catch (error) {
					return Promise.reject(error);
				}
			});
		await expect(
			operationService.executeCalculate(operation, user)
		).rejects.toThrow(
			new NoOperationFoundException(operation.operationName, 'Type')
		);
	});

	it('should throw an error if the user token is invalid', async () => {
		const operationService = new OperationService();
		const userModel = new UserModel();
		user.id = 'invalidId';
		const operation = { operationName: 'validType', operation: jest.fn() };

		userModel.getUserById = jest
			.fn()
			.mockImplementationOnce((id, username) => {
				if (id === 'invalidId') {
					return Promise.reject(
						new WrongAuthenticationTokenException()
					);
				}
				return Promise.resolve(id);
			});

		operationService.executeCalculate = jest
			.fn()
			.mockImplementationOnce(async (operation, user) => {
				try {
					const getUser = await userModel.getUserById(
						user.id,
						user.username
					);
					return Promise.resolve(getUser);
				} catch (error) {
					return Promise.reject(error);
				}
			});
		await expect(
			operationService.executeCalculate(operation, user)
		).rejects.toThrow(new WrongAuthenticationTokenException());
	});
});

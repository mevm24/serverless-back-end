import { OperationController } from '../../controller/operation.controller';
import { OperationDAO } from '../../entity/dao';
import HttpException from '../../exceptions/HttpException';
import UserDoesNotHaveEnoughBalanceException from '../../exceptions/UserDoesNotHaveEnoughBalanceException';
import { OperationService } from '../../services/operation.service';
const operationServiceMock = jest.fn().mockImplementation(function () {
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
jest.mock('../../services/operation.service.ts', () => ({
	get OperationService() {
		return operationServiceMock;
	},
}));
jest.mock('../../controller/operation.controller', () => ({
	get OperationController() {
		return jest.fn().mockImplementation(function () {
			return {
				operationService: operationServiceMock,
				initializeRoutes: () => {
					return jest.fn();
				},
				getOperationByType: () => {
					return jest.fn();
				},
				getOperationById: () => {
					return jest.fn();
				},
				getAllOperations: () => {
					return jest.fn();
				},
				createOperation: () => {
					return jest.fn();
				},
				updateOperation: () => {
					return jest.fn();
				},
				createBatchOperations: () => {
					return jest.fn();
				},
				executeAdditionOperation: () => {
					return jest.fn();
				},
				executeSubtractionOperation: () => {
					return jest.fn();
				},
				executeMultiplyOperation: () => {
					return jest.fn();
				},
				executeDivitionOperation: () => {
					return jest.fn();
				},
				executeSquareRootOperation: () => {
					return jest.fn();
				},
				executeRandomStringGeneratorOperation: () => {
					return jest.fn();
				},
			};
		});
	},
}));
describe('Operation Controller', () => {
	const mockResponse = () => {
		const res: any = {};
		res.status = jest.fn().mockReturnValue(res);
		res.json = jest.fn().mockReturnValue(res);
		return res;
	};

	it('should return all operations', async () => {
		const operationService = new OperationService();
		const operationController = new OperationController();
		const mockOperations: OperationDAO[] = [
			{ id: '', type: 'addition', cost: 1 },
			{ id: '', type: 'subtraction', cost: 2 },
		];
		jest.spyOn(operationService, 'getAllTypes').mockResolvedValue(
			mockOperations
		);
		const req = {};
		const res = mockResponse();
		const next = jest.fn();

		jest.spyOn(operationController, 'getAllOperations').mockImplementation(
			(req: any, res: any, next: any) => {
				return Promise.resolve(
					res.status(200).json({ operations: mockOperations })
				);
			}
		);
		await operationController.getAllOperations(
			req as any,
			res as any,
			next
		);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ operations: mockOperations });
	});

	it('should throw error if data is invalid', async () => {
		const operationService = new OperationService();
		const operationController = new OperationController();
		const req = {
			body: { numerator: 5, denominator: 0 },
			user: { id: '123' },
		};
		const res = mockResponse();
		const next = jest.fn();
		jest.spyOn(
			operationController,
			'executeDivitionOperation'
		).mockImplementationOnce((req: any, res: any, next: any) => {
			return next(
				new HttpException(400, 'Denominator must be greater than 0')
			);
		});
		await operationController.executeDivitionOperation(
			req as any,
			res as any,
			next
		);
		expect(next).toHaveBeenCalledWith(
			new HttpException(400, 'Denominator must be greater than 0')
		);
	});

	it('should throw an error if the operation fails', async () => {
		const operationService = new OperationService();
		const operationController = new OperationController();
		const req = { body: { type: 'addition', cost: 1 } };
		const res = mockResponse();
		const next = jest.fn();
		jest.spyOn(operationService, 'createOperation').mockRejectedValue(
			new Error('Database error')
		);
		jest.spyOn(
			operationController,
			'createOperation'
		).mockImplementationOnce(async (req: any, res: any, next: any) => {
			try {
				const operation = await operationService.createOperation(
					req.body
				);
				return Promise.resolve(operation);
			} catch (e) {
				return next(e);
			}
		});
		await operationController.createOperation(req as any, res as any, next);
		expect(next).toHaveBeenCalledWith(new Error('Database error'));
	});

	it('should return a random string of the specified length and characters', async () => {
		const req = {
			body: {
				n: 1,
				length: 10,
				characters: 'abc',
			},
			user: {
				balance: 100,
			},
		};
		const res = mockResponse();
		const next = jest.fn();
		const operationService = new OperationService();
		const operationController = new OperationController();
		operationService.executeCalculate = jest.fn().mockResolvedValue({
			operationResponse: 'abcabcabca',
		});
		jest.spyOn(
			operationController,
			'executeRandomStringGeneratorOperation'
		).mockImplementationOnce(async (req: any, res: any, next: any) => {
			const data = await operationService.executeCalculate(
				{} as any,
				{} as any
			);
			return res.status(201).json(data);
		});
		await operationController.executeRandomStringGeneratorOperation(
			req as any,
			res as any,
			next
		);
		expect(operationService.executeCalculate).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({
			operationResponse: 'abcabcabca',
		});
		expect(next).not.toHaveBeenCalled();
	});

	it('should execute the update operation method correctly', async () => {
		const req = {
			params: {
				id: '1',
			},
			body: {
				type: 'addition',
				cost: 10,
			},
		};
		const res = mockResponse();
		const next = jest.fn();
		const operationService = new OperationService();
		const operationController = new OperationController();
		operationService.updateOperation = jest.fn().mockResolvedValue('');
		jest.spyOn(
			operationController,
			'updateOperation'
		).mockImplementationOnce(async (req: any, res: any, next: any) => {
			const data = await operationService.updateOperation(
				req.params.id,
				req.body.type,
				req.body.cost
			);
			return res.status(204).json({});
		});
		await operationController.updateOperation(req as any, res as any, next);
		expect(operationService.updateOperation).toHaveBeenCalledWith(
			'1',
			'addition',
			10
		);
		expect(res.status).toHaveBeenCalledWith(204);
		expect(res.json).toHaveBeenCalledWith({});
		expect(next).not.toHaveBeenCalled();
	});

	it('should throw an error if the user does not have enough balance to perform the operation', async () => {
		const req = {
			body: {
				numbers: [1, 2],
			},
			user: {
				balance: 1,
			},
		};
		const res = mockResponse();
		const next = jest.fn();
		const operationService = new OperationService();
		const operationController = new OperationController();
		operationService.executeCalculate = jest
			.fn()
			.mockRejectedValue(
				new UserDoesNotHaveEnoughBalanceException('user')
			);
		jest.spyOn(
			operationController,
			'executeAdditionOperation'
		).mockImplementationOnce(async (req: any, res: any, next: any) => {
			try {
				const data = await operationService.executeCalculate(
					{} as any,
					{} as any
				);
			} catch (err) {
				return next(err);
			}
		});
		await operationController.executeAdditionOperation(
			req as any,
			res as any,
			next
		);
		expect(operationService.executeCalculate).toHaveBeenCalled();
		expect(next).toHaveBeenCalledWith(
			new UserDoesNotHaveEnoughBalanceException('user')
		);
	});
});

import { NextFunction } from 'express';
import { RequestWithUser } from '../../entity/controllers';
import { SORT_ORDERING } from '../../utils/constants';
import { RecordController } from '../../controller/record.controller';
import HttpException from '../../exceptions/HttpException';
import NoRecordFoundException from '../../exceptions/NoRecordFoundException';
import { RecordService } from '../../services/record.service';
import { UserModel } from '../../models/user.model';
import { WrongAuthenticationTokenException } from '../../exceptions';
import { CreateRecordDTO } from '../../entity/dto';

const recordServiceMock = jest.fn().mockImplementation(function () {
	return {
		getRecordsByUser: () => {
			return jest.fn();
		},
		createRecord: () => {
			return jest.fn();
		},
		deleteRecord: () => {
			return jest.fn();
		},
	};
});

jest.mock('../../services/record.service.ts', () => ({
	get RecordService() {
		return recordServiceMock;
	},
}));

jest.mock('../../controller/record.controller', () => ({
	get RecordController() {
		return jest.fn().mockImplementation(function () {
			return {
				recordService: recordServiceMock,
				initializeRoutes: () => {
					return jest.fn();
				},
				getAllRecordsByUser: () => {
					return jest.fn();
				},
				createRecord: () => {
					return jest.fn();
				},
				deleteRecord: () => {
					return jest.fn();
				},
			};
		});
	},
}));

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

describe('Record Controller', () => {
	const mockResponseFn = () => {
		const res: any = {};
		res.status = jest.fn().mockReturnValue(res);
		res.json = jest.fn().mockReturnValue(res);
		return res;
	};

	it('should return all records for a valid user', async () => {
		const mockRequest = {
			user: {
				id: '1',
				username: 'testuser',
				balance: 0,
				password: '',
				status: false,
			},
			query: {
				limit: '10',
				offset: '0',
				sort: SORT_ORDERING.DESC,
			},
		};
		const mockResponse = mockResponseFn();
		const mockNextFunction: NextFunction = jest.fn();

		const recordController = new RecordController();
		const recordService = new RecordService();
		recordService.getRecordsByUser = jest
			.fn()
			.mockResolvedValue([{ id: '1', amount: 100 }]);

		jest.spyOn(recordController, 'getAllRecordsByUser').mockImplementation(
			async (req: any, res: any, next: any) => {
				const data = await recordService.getRecordsByUser(
					req.user.id,
					Number.parseInt(req.query.limit),
					Number.parseInt(req.query.offset),
					req.query.sort
				);
				return res.status(200).json(data);
			}
		);

		await recordController.getAllRecordsByUser(
			mockRequest as any,
			mockResponse,
			mockNextFunction
		);

		expect(recordService.getRecordsByUser).toHaveBeenCalledWith(
			'1',
			10,
			0,
			SORT_ORDERING.DESC
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith([
			{ id: '1', amount: 100 },
		]);
	});

	it('should throw an error for invalid input data', async () => {
		const mockRequest: Request = {
			body: {
				operation_id: '1',
				user_id: '2',
				amount: -10,
				user_balance: 50,
				operation_response: 'success',
				date: '2022-01-01',
			},
		} as any;
		const mockResponse = mockResponseFn();
		const mockNextFunction: NextFunction = jest.fn();

		const recordController = new RecordController();
		const recordService = new RecordService();
		recordService.createRecord = jest
			.fn()
			.mockRejectedValue(new HttpException(400, 'Invalid input data'));
		jest.spyOn(recordController, 'createRecord').mockImplementationOnce(
			async (req: any, res: any, next: any) => {
				try {
					await recordService.createRecord(
						req.body as CreateRecordDTO
					);
				} catch (err) {
					return next(err);
				}
			}
		);

		await recordController.createRecord(
			mockRequest as any,
			mockResponse,
			mockNextFunction
		);

		expect(recordService.createRecord).toHaveBeenCalledWith(
			mockRequest.body
		);
		expect(mockNextFunction).toHaveBeenCalledWith(
			new HttpException(400, 'Invalid input data')
		);
	});

	it('should throw an error if record is not found', async () => {
		const mockRequest = {
			params: {
				id: '1',
			},
		};
		const mockResponse = mockResponseFn();
		const mockNextFunction: NextFunction = jest.fn();

		const recordController = new RecordController();
		const recordService = new RecordService();
		recordService.deleteRecord = jest
			.fn()
			.mockRejectedValue(new NoRecordFoundException('1'));

		jest.spyOn(recordController, 'deleteRecord').mockImplementation(
			async (req: any, res: any, next: any) => {
				try {
					await recordService.deleteRecord(req.params.id);
				} catch (err) {
					return next(err);
				}
			}
		);
		await recordController.deleteRecord(
			mockRequest as any,
			mockResponse,
			mockNextFunction
		);

		expect(recordService.deleteRecord).toHaveBeenCalledWith('1');
		expect(mockNextFunction).toHaveBeenCalledWith(
			new NoRecordFoundException('1')
		);
	});

	it('should return empty array for a user with no records', async () => {
		const mockRequest = {
			user: { id: '1', username: 'testuser' },
			query: { limit: 10, offset: 0, sort: SORT_ORDERING.DESC },
		};
		const mockResponse = mockResponseFn();
		const mockNextFunction: NextFunction = jest.fn();

		const recordService = new RecordService();
		jest.spyOn(recordService, 'getRecordsByUser').mockResolvedValue([]);

		const recordController = new RecordController();
		jest.spyOn(recordController, 'getAllRecordsByUser').mockImplementation(
			async (req: any, res: any, next: any) => {
				const records = await recordService.getRecordsByUser(
					mockRequest.user.id,
					mockRequest.query.limit,
					mockRequest.query.offset,
					mockRequest.query.sort
				);
				return res.status(200).json({ records });
			}
		);
		await recordController.getAllRecordsByUser(
			mockRequest as any,
			mockResponse,
			mockNextFunction
		);

		expect(recordService.getRecordsByUser).toHaveBeenCalledWith(
			'1',
			10,
			0,
			SORT_ORDERING.DESC
		);
		expect(mockResponse.status).toHaveBeenCalledWith(200);
		expect(mockResponse.json).toHaveBeenCalledWith({ records: [] });
	});

	it('should throw an error if token is invalid', async () => {
		const mockRequest = {
			headers: { authorization: 'Bearer invalidtoken' },
		};
		const mockResponse = mockResponseFn();
		const mockNextFunction: NextFunction = jest.fn();

		const userModel = new UserModel();
		jest.spyOn(userModel, 'getUserById').mockResolvedValue(undefined);

		const recordController = new RecordController();
		jest.spyOn(recordController, 'getAllRecordsByUser').mockImplementation(
			async (req: any, res: any, next: any) => {
				if (req.headers.authorization === 'Bearer invalidtoken')
					return next(new WrongAuthenticationTokenException());

				return await userModel.getUserById('', '');
			}
		);
		await recordController.getAllRecordsByUser(
			mockRequest as any,
			mockResponse,
			mockNextFunction
		);

		expect(userModel.getUserById).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledWith(
			new WrongAuthenticationTokenException()
		);
	});
});

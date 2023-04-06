import NoRecordFoundException from '../../exceptions/NoRecordFoundException';
import UserDoesNotHaveEnoughBalanceException from '../../exceptions/UserDoesNotHaveEnoughBalanceException';
import { RecordModel } from '../../models/record.model';
import { RecordService } from '../../services/record.service';
import { SORT_ORDERING } from '../../utils';

jest.mock('../../models/record.model', () => ({
	get RecordModel() {
		return jest.fn().mockImplementation(function () {
			return {
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
			};
		});
	},
}));

jest.mock('../../services/record.service.ts', () => ({
	get RecordService() {
		return jest.fn().mockImplementation(function () {
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
	},
}));

describe('Record Service', () => {
	let recordModel = new RecordModel();

	it('should get all the records by a defined user', async () => {
		const recordService = new RecordService();
		const records = await recordService.getRecordsByUser(
			'user_id',
			10,
			0,
			SORT_ORDERING.DESC
		);
		expect(records).toBeDefined();
		expect(records?.length).toBeGreaterThanOrEqual(0);
	});

	it('shoud throw an error if user_balance is not enough', async () => {
		const recordService = new RecordService();
		const invalidData = {
			operation_id: 'operation_id',
			user_id: 'user_id',
			amount: 30,
			user_balance: 0,
			operation_response: 'operation_response',
			date: '2022-01-01',
		};
		recordModel.createRecord = jest
			.fn()
			.mockRejectedValue(
				new UserDoesNotHaveEnoughBalanceException(invalidData.user_id)
			);
		recordService.createRecord = jest
			.fn()
			.mockImplementationOnce(async (record) => {
				try {
					const data = await recordModel.createRecord(record);
					console.log(data);
					return Promise.resolve(data);
				} catch (err) {
					return Promise.reject(err);
				}
			});
		const record = recordService.createRecord(invalidData);
		await expect(record).rejects.toThrow();
	});

	it('should throw an error if record does not exists', async () => {
		const recordService = new RecordService();
		const nonexistentId = 'nonexistent_id';
		recordService.deleteRecord = jest
			.fn()
			.mockRejectedValue(new NoRecordFoundException(nonexistentId));
		await expect(
			recordService.deleteRecord(nonexistentId)
		).rejects.toThrow();
	});

	it('should delete a record if it exists', async () => {
		const recordModelMock = {
			getRecordById: jest.fn().mockResolvedValue({
				id: '123',
				createdAt: '2022-01-01',
			}),
			deleteRecord: jest.fn().mockResolvedValue('123'),
		};
		const recordService = new RecordService();
		recordModel.getRecordById = recordModelMock.getRecordById;
		recordModel.deleteRecord = recordModelMock.deleteRecord;
		recordService.deleteRecord = jest
			.fn()
			.mockImplementationOnce(async (id) => {
				const record = await recordModel.getRecordById(id);
				if (record && record.id === '123')
					return await recordModel.deleteRecord(id, record.createdAt);
			});
		const result = await recordService.deleteRecord('123');
		expect(result).toEqual('123');
		expect(recordModelMock.getRecordById).toHaveBeenCalledWith('123');
		expect(recordModelMock.deleteRecord).toHaveBeenCalledWith(
			'123',
			'2022-01-01'
		);
	});

	it('should get the amount of results based on limit and offset', async () => {
		const recordModelMock = {
			getRecordsByUser: jest.fn().mockResolvedValue([
				{ id: '1', createdAt: '2022-01-01' },
				{ id: '2', createdAt: '2022-01-02' },
				{ id: '3', createdAt: '2022-01-03' },
			]),
		};
		recordModel.getRecordsByUser = recordModelMock.getRecordsByUser;
		const recordService = new RecordService();
		recordService.getRecordsByUser = jest
			.fn()
			.mockImplementationOnce(async (user_id, limit, offset, sort) => {
				const data = await recordModel.getRecordsByUser(
					user_id,
					limit,
					offset,
					sort
				);
				if (data) return Promise.resolve([data[offset]]);
			});
		const result = await recordService.getRecordsByUser(
			'user1',
			5,
			2,
			SORT_ORDERING.ASC
		);
		expect(result).toEqual([{ id: '3', createdAt: '2022-01-03' }]);
		expect(recordModelMock.getRecordsByUser).toHaveBeenCalledWith(
			'user1',
			5,
			2,
			SORT_ORDERING.ASC
		);
	});

	it('should return records by user sorted in the specified order', async () => {
		const recordModelMock = {
			getRecordsByUser: jest.fn().mockResolvedValue([
				{ id: '1', createdAt: '2022-01-01' },
				{ id: '2', createdAt: '2022-01-02' },
				{ id: '3', createdAt: '2022-01-03' },
			]),
		};
		recordModel.getRecordsByUser = recordModelMock.getRecordsByUser;
		const recordService = new RecordService();
		recordService.getRecordsByUser = jest
			.fn()
			.mockImplementation(async (user_id, limit, offset, sort) => {
				const data = await recordModel.getRecordsByUser(
					user_id,
					limit,
					offset,
					sort
				);
				if (data) return Promise.resolve(data.reverse());
			});
		const result = await recordService.getRecordsByUser(
			'user1',
			0,
			0,
			SORT_ORDERING.DESC
		);
		expect(result).toEqual([
			{ id: '3', createdAt: '2022-01-03' },
			{ id: '2', createdAt: '2022-01-02' },
			{ id: '1', createdAt: '2022-01-01' },
		]);
		expect(recordModelMock.getRecordsByUser).toHaveBeenCalledWith(
			'user1',
			0,
			0,
			SORT_ORDERING.DESC
		);
	});
});

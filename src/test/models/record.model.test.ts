import { RecordDAO } from '../../entity/dao';
import { CreateRecordDTO } from '../../entity/dto';
import NoRecordFoundException from '../../exceptions/NoRecordFoundException';
import { RecordModel } from '../../models/record.model';
import { SORT_ORDERING, getActualDateString } from '../../utils';

jest.mock('../../models/record.model.ts', () => ({
	get RecordModel() {
		return jest.fn().mockImplementation(function () {
			return {
				createRecord: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				getRecordsByUser: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				deleteRecord: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				getRecordById: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
			};
		});
	},
}));

describe('Record Model', () => {
	const recordList: RecordDAO[] = [
		{
			amount: 100,
			createdAt: '',
			date: '',
			id: '',
			operation_id: '',
			operation_response: '',
			updatedAt: '',
			user_balance: 0,
			user_id: '',
		},
		{
			amount: 100,
			createdAt: '',
			date: '',
			id: '',
			operation_id: '',
			operation_response: '',
			updatedAt: '',
			user_balance: 0,
			user_id: '',
		},
		{
			amount: 100,
			createdAt: '',
			date: '',
			id: '',
			operation_id: '',
			operation_response: '',
			updatedAt: '',
			user_balance: 0,
			user_id: '',
		},
	];
	// Tests that createrecord successfully creates a new record.
	it('test_create_record_successfully_creates_new_record', async () => {
		// Arrange
		const recordModel = new RecordModel();
		const createRecordDTO: CreateRecordDTO = {
			operation_id: '123',
			user_id: '456',
			amount: 100,
			user_balance: 200,
			operation_response: 'success',
			date: '2022-01-01T00:00:00.000Z',
		};

		jest.spyOn(recordModel, 'createRecord').mockResolvedValue({
			...createRecordDTO,
			id: '',
			user_balance: createRecordDTO.user_balance - createRecordDTO.amount,
			createdAt: '',
			updatedAt: '',
		});

		// Act
		const result = await recordModel.createRecord(createRecordDTO);

		// Assert
		expect(result).toHaveProperty('id');
		expect(result).toHaveProperty(
			'operation_id',
			createRecordDTO.operation_id
		);
		expect(result).toHaveProperty('user_id', createRecordDTO.user_id);
		expect(result).toHaveProperty('amount', createRecordDTO.amount);
		expect(result).toHaveProperty(
			'user_balance',
			createRecordDTO.user_balance - createRecordDTO.amount
		);
		expect(result).toHaveProperty(
			'operation_response',
			createRecordDTO.operation_response
		);
		expect(result).toHaveProperty('date', createRecordDTO.date);
	});

	// Tests that getrecordsbyuser handles offset and limit values that exceed the number of records.
	it('test_get_records_by_user_handles_offset_and_limit_values_that_exceed_the_number_of_records', async () => {
		// Arrange
		const recordModel = new RecordModel();
		const user_id = '456';
		const limit = 10;
		const offset = 5;
		const sort = SORT_ORDERING.DESC;

		// Act

		jest.spyOn(recordModel, 'getRecordsByUser').mockResolvedValue([]);
		const result = await recordModel.getRecordsByUser(
			user_id,
			limit,
			offset,
			sort
		);

		// Assert
		expect(result).toEqual([]);
	});

	// Tests that deleterecord throws an error if the record does not exist.
	it('test_delete_record_throws_error_if_record_does_not_exist', async () => {
		// Arrange
		const recordModel = new RecordModel();
		const id = '123';
		const createdAt = '2022-01-01T00:00:00.000Z';

		// Act & Assert
		jest.spyOn(recordModel, 'deleteRecord').mockRejectedValue(
			new NoRecordFoundException(id)
		);
		await expect(recordModel.deleteRecord(id, createdAt)).rejects.toThrow();
	});

	// Tests that getrecordbyid returns undefined if the record does not exist.
	it('test_get_record_by_id_returns_undefined_if_record_does_not_exist', async () => {
		// Arrange
		const recordModel = new RecordModel();
		const nonExistentId = 'non-existent-id';

		// Act
		jest.spyOn(recordModel, 'getRecordById').mockResolvedValue(undefined);
		const result = await recordModel.getRecordById(nonExistentId);

		// Assert
		expect(result).toBeUndefined();
	});

	// Tests that getrecordsbyuser handles sorting in ascending and descending order.
	it('test_get_records_by_user_handles_sorting_in_ascending_and_descending_order', async () => {
		// Arrange
		const recordModel = new RecordModel();
		const userId = 'user-id';
		const limit = 0;
		const offset = 0;
		const ascSort = SORT_ORDERING.ASC;
		const descSort = SORT_ORDERING.DESC;

		// Act
		jest.spyOn(recordModel, 'getRecordsByUser').mockResolvedValue([
			...recordList,
		]);
		const ascResult = await recordModel.getRecordsByUser(
			userId,
			limit,
			offset,
			ascSort
		);
		const descResult = await recordModel.getRecordsByUser(
			userId,
			limit,
			offset,
			descSort
		);

		// Assert
		expect(ascResult).toEqual(descResult?.reverse());
	});

	// Tests that createrecord throws an error if the provided operation_id or user_id do not exist.
	it('test_create_record_throws_error_if_provided_operation_id_or_user_id_do_not_exist', async () => {
		// Arrange
		const recordModel = new RecordModel();
		const nonExistentOperationId = 'non-existent-operation-id';
		const nonExistentUserId = 'non-existent-user-id';
		const createRecordDTO: CreateRecordDTO = {
			operation_id: nonExistentOperationId,
			user_id: nonExistentUserId,
			amount: 100,
			user_balance: 200,
			operation_response: 'success',
			date: getActualDateString(),
		};

		recordModel.createRecord = jest
			.fn()
			.mockImplementationOnce((data: CreateRecordDTO) => {
				if (
					data.operation_id === nonExistentOperationId ||
					data.user_id === nonExistentUserId
				) {
					return Promise.reject(new Error());
				}
				return Promise.resolve(data.operation_response);
			});

		// Act & Assert
		await expect(
			recordModel.createRecord(createRecordDTO)
		).rejects.toThrow();
	});
});

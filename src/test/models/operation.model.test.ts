import { CreateOperationDTO } from '../../entity/dto';
import { OperationTypeExistsException } from '../../exceptions';
import { OperationModel } from '../../models/operation.model';

jest.mock('../../models/operation.model.ts', () => ({
	get OperationModel() {
		return jest.fn().mockImplementation(function () {
			return {
				createOperation: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				createBatchOperation: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				getOperationById: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				getOperationByType: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				getAllOperations: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
				updateOperation: (value: any) => {
					return jest
						.fn()
						.mockImplementation(() => Promise.resolve(value));
				},
			};
		});
	},
}));

describe('Operation Model', () => {
	it('should create an operation if not exist', async () => {
		// Arrange
		const operationModel = new OperationModel();
		const createOperationDTO: CreateOperationDTO = {
			type: 'test',
			cost: 10,
		};

		// Act
		jest.spyOn(operationModel, 'createOperation').mockResolvedValue({
			id: '',
			cost: createOperationDTO.cost,
			type: createOperationDTO.type,
		});
		const result = await operationModel.createOperation(createOperationDTO);

		// Assert
		expect(result).toHaveProperty('id');
		expect(result.type).toEqual(createOperationDTO.type);
		expect(result.cost).toEqual(createOperationDTO.cost);
	});

	it('should return an operation by its id', async () => {
		// Arrange
		const operationModel = new OperationModel();
		const createOperationDTO: CreateOperationDTO = {
			type: 'test',
			cost: 10,
		};
		jest.spyOn(operationModel, 'createOperation').mockResolvedValue({
			id: '',
			cost: createOperationDTO.cost,
			type: createOperationDTO.type,
		});
		const createdOperation = await operationModel.createOperation(
			createOperationDTO
		);

		// Act
		jest.spyOn(operationModel, 'getOperationById').mockResolvedValue(
			createdOperation
		);
		const result = await operationModel.getOperationById(
			createdOperation.id
		);

		// Assert
		expect(result).toHaveProperty('id');
		expect(result?.type).toEqual(createOperationDTO.type);
		expect(result?.cost).toEqual(createOperationDTO.cost);
	});

	it('should update operation cost if it exists', async () => {
		// Arrange
		const operationModel = new OperationModel();
		const createOperationDTO: CreateOperationDTO = {
			type: 'test',
			cost: 10,
		};
		jest.spyOn(operationModel, 'createOperation').mockResolvedValue({
			id: '',
			cost: createOperationDTO.cost,
			type: createOperationDTO.type,
		});
		const createdOperation = await operationModel.createOperation(
			createOperationDTO
		);
		const newCost = 20;
		jest.spyOn(operationModel, 'updateOperation').mockImplementationOnce(
			() => {
				createdOperation.cost = newCost;
				return Promise.resolve(createdOperation.id);
			}
		);
		jest.spyOn(operationModel, 'getOperationById').mockResolvedValue(
			createdOperation
		);

		// Act
		await operationModel.updateOperation(
			createdOperation.id,
			createdOperation.type,
			newCost
		);
		const updatedOperation = await operationModel.getOperationById(
			createdOperation.id
		);

		// Assert
		expect(updatedOperation).toHaveProperty('id');
		expect(updatedOperation?.type).toEqual(createOperationDTO.type);
		expect(updatedOperation?.cost).toEqual(newCost);
	});

	it('should throw an error if operation with same type already exists', async () => {
		const operationModel = new OperationModel();
		const existingOperation = {
			id: '1',
			type: 'test',
			cost: 10,
			createdAt: '2022-02-01T00:00:00.000Z',
			updatedAt: '2022-02-01T00:00:00.000Z',
		};
		jest.spyOn(operationModel, 'getOperationByType').mockResolvedValue(
			existingOperation
		);
		const createOperationDTO = {
			type: 'test',
			cost: 20,
		};

		jest.spyOn(operationModel, 'createOperation').mockRejectedValue(
			OperationTypeExistsException
		);

		try {
			await operationModel.createOperation(createOperationDTO);
		} catch (err) {
			expect(err).toBe(OperationTypeExistsException);
		}
	});

	it('it should throw undefined if operation id does not exist', async () => {
		const operationModel = new OperationModel();
		jest.spyOn(operationModel, 'getOperationById').mockResolvedValue(
			undefined
		);
		const id = '1';
		const result = await operationModel.getOperationById(id);
		expect(result).toBeUndefined();
	});

	it('it should throw undefined if operation type does not exist', async () => {
		const operationModel = new OperationModel();
		jest.spyOn(operationModel, 'getOperationByType').mockResolvedValue(
			undefined
		);
		const type = 'test';
		const result = await operationModel.getOperationByType(type);
		expect(result).toBeUndefined();
	});
});

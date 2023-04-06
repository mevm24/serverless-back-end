import { v4 as uuidv4 } from 'uuid';
import { app } from '../index';
import { getActualDateString, mapValues, OPERATION_TABLE_NAME } from '../utils';
import { CreateOperationDTO } from '../entity/dto/';
import { OperationTypeExistsException } from '../exceptions';
import { OperationDAO } from '../entity/dao';

export class OperationModel {
	async createOperation({
		type,
		cost,
	}: CreateOperationDTO): Promise<OperationDAO> {
		const operationExist = await this.getOperationByType(type);
		if (operationExist) {
			throw new OperationTypeExistsException(type);
		}
		const id = uuidv4();
		const item = {
			id,
			type,
			cost,
			createdAt: getActualDateString(),
			updatedAt: getActualDateString(),
		};
		const params = {
			TableName: OPERATION_TABLE_NAME,
			Item: item,
		};
		await app.getDynamoDB().put(params).promise();
		return item;
	}

	async createBatchOperation(
		operations: CreateOperationDTO[]
	): Promise<[OperationDAO[], any]> {
		const data = operations.map(
			async (operation: CreateOperationDTO) =>
				await this.createOperation(operation)
		);
		return this.handleOperations(data);
	}

	async getOperationById(id: string): Promise<OperationDAO | undefined> {
		const { expression, attributeNames, attributeValues } = mapValues({
			id,
		});
		const params = {
			TableName: OPERATION_TABLE_NAME,
			KeyConditionExpression: expression,
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues,
		};
		try {
			const result = await app.getDynamoDB().query(params).promise();
			return result.Items?.[0] as OperationDAO;
		} catch (error) {
			throw error;
		}
	}

	async getOperationByType(type: string): Promise<OperationDAO | undefined> {
		const { expression, attributeNames, attributeValues } = mapValues({
			type,
		});
		const params = {
			TableName: OPERATION_TABLE_NAME,
			IndexName: 'typeIndex',
			KeyConditionExpression: expression,
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues,
		};

		try {
			const result = await app.getDynamoDB().query(params).promise();
			return result.Items?.[0] as OperationDAO;
		} catch (error) {
			throw error;
		}
	}

	async getAllOperations() {
		const params = {
			TableName: OPERATION_TABLE_NAME,
		};

		try {
			const results = await app.getDynamoDB().scan(params).promise();
			return results.Items as OperationDAO[];
		} catch (error) {
			throw error;
		}
	}

	async updateOperation(id: string, type: string, cost: number) {
		const { expression, attributeNames, attributeValues } = mapValues({
			cost,
		});
		const params = {
			TableName: OPERATION_TABLE_NAME,
			Key: {
				id,
				type,
			},
			UpdateExpression: `Set ${expression}`,
			ConditionExpression: `attribute_exists(id)`,
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues,
		};

		try {
			await app.getDynamoDB().update(params).promise();
			return id;
		} catch (error) {
			throw error;
		}
	}

	private async handleOperations(
		data: Promise<OperationDAO>[]
	): Promise<[OperationDAO[], any]> {
		const createdOperationsArray: OperationDAO[] = [];
		const errorOperationsArray: any = [];
		const promises = await Promise.allSettled(data);
		promises.forEach((data) => {
			if (data.status === 'rejected') {
				errorOperationsArray.push({
					status: data.reason.status,
					message: data.reason.message,
				});
			} else {
				createdOperationsArray.push(data.value);
			}
		});
		return [createdOperationsArray, errorOperationsArray];
	}
}

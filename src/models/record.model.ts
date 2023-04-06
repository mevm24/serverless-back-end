import { v4 as uuidv4 } from 'uuid';
import { app } from '../index';
import {
	RECORD_TABLE_NAME,
	SORT_ORDERING,
	getActualDateString,
	mapValues,
} from '../utils';
import { RecordDAO } from '../entity/dao';
import { CreateRecordDTO } from '../entity/dto/RecordDTO';
import { OperationModel } from '.';
import { RecordOperationDAO } from '../entity/dao/RecordDAO';
import UserDoesNotHaveEnoughBalanceException from '../exceptions/UserDoesNotHaveEnoughBalanceException';

export class RecordModel {
	async createRecord({
		operation_id,
		user_id,
		amount,
		user_balance,
		operation_response,
		date,
	}: CreateRecordDTO): Promise<RecordDAO> {
		const id = uuidv4();
		if (user_balance - amount < 0 || amount < 0 || user_balance < 0) {
			throw new UserDoesNotHaveEnoughBalanceException(user_id);
		}
		const item = {
			id,
			operation_id,
			user_id,
			amount,
			user_balance: user_balance - amount,
			operation_response,
			date,
			createdAt: getActualDateString(),
			updatedAt: getActualDateString(),
		};
		const params = {
			TableName: RECORD_TABLE_NAME,
			Item: item,
		};
		try {
			await app.getDynamoDB().put(params).promise();
		} catch (error) {
			throw error;
		}
		return item;
	}

	async getRecordById(id: string): Promise<RecordDAO | undefined> {
		const { expression, attributeNames, attributeValues } = mapValues({
			id,
		});
		const params = {
			TableName: RECORD_TABLE_NAME,
			KeyConditionExpression: expression,
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues,
		};
		try {
			const result = await app.getDynamoDB().query(params).promise();
			return result.Items?.[0] as RecordDAO;
		} catch (error) {
			throw error;
		}
	}

	async getRecordsByUser(
		user_id: string,
		limit: number,
		offset: number,
		sort: SORT_ORDERING
	): Promise<RecordOperationDAO[] | undefined> {
		const { expression, attributeNames, attributeValues } = mapValues({
			user_id,
			createdAt: getActualDateString(),
		});
		let result: any = [],
			accumulated: any = [],
			lastEvaluatedKey = null,
			params: any;
		do {
			params = {
				IndexName: 'userIndex',
				TableName: RECORD_TABLE_NAME,
				ExclusiveStartKey: lastEvaluatedKey,
				KeyConditionExpression: `#user_id = :user_id AND #createdAt < :createdAt`,
				ExpressionAttributeNames: attributeNames,
				ExpressionAttributeValues: attributeValues,
				FilterExpression: `attribute_not_exists(deletedAt)`,
			};
			if (limit > 0) {
				params = {
					Limit: limit,
					...params,
				};
			}
			result = await app.getDynamoDB().query(params).promise();
			lastEvaluatedKey = result.LastEvaluatedKey;
			accumulated = [...accumulated, ...result.Items];
			[accumulated, lastEvaluatedKey] = this.calculateLimitOffsetSort(
				offset,
				limit,
				sort,
				accumulated,
				lastEvaluatedKey
			);
		} while (result.Items.length && lastEvaluatedKey);

		return this.getOperationNameByRecord(accumulated as RecordDAO[]);
	}

	async deleteRecord(id: string, createdAt: string) {
		const deletedAt = getActualDateString();
		const { expression, attributeNames, attributeValues } = mapValues({
			deletedAt,
		});
		const params = {
			TableName: RECORD_TABLE_NAME,
			Key: {
				id,
				createdAt,
			},
			UpdateExpression: `Set ${expression}`,
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

	private calculateLimitOffsetSort(
		offset: number,
		limit: number,
		sort: SORT_ORDERING,
		accumulated: any,
		lastEvaluatedKey: any
	) {
		if (accumulated.length >= offset + limit || !lastEvaluatedKey) {
			if (lastEvaluatedKey && offset + limit > accumulated.length) {
				accumulated = [];
			} else {
				const offsetLimitArray: any = [];
				if (limit > 0) {
					for (
						let i = offset;
						i < offset + limit && i < accumulated.length;
						i++
					) {
						offsetLimitArray.push(accumulated[i]);
					}
				} else {
					for (let i = offset; i < accumulated.length; i++) {
						offsetLimitArray.push(accumulated[i]);
					}
				}
				accumulated = [...offsetLimitArray];
				lastEvaluatedKey = null;
			}
		}
		if (sort === SORT_ORDERING.ASC) {
			accumulated = accumulated.reverse();
		}
		return [accumulated, lastEvaluatedKey];
	}

	private async getOperationNameByRecord(
		records: RecordDAO[]
	): Promise<RecordOperationDAO[]> {
		const operationModel = new OperationModel();
		const recordsArray: RecordOperationDAO[] = await Promise.all(
			records.map(async (record) => {
				const operation = await operationModel.getOperationById(
					record.operation_id
				);
				if (operation) {
					return { ...record, type: operation.type };
				}
				return { ...record };
			})
		);
		return recordsArray;
	}
}

import { v4 as uuidv4 } from 'uuid';
import { app } from '../index';
import { UserDAO } from '../entity/dao';
import {
	encryptPasswordSync,
	getActualDateString,
	mapValues,
	USER_TABLE_NAME,
} from '../utils';
import { UsernameExistsException } from '../exceptions/';
import { CreateUserDTO } from '../entity/dto';

export class UserModel {
	async createUser({ username, password }: CreateUserDTO): Promise<UserDAO> {
		const userExist = await this.getUserByUsername(username);
		if (userExist) {
			throw new UsernameExistsException(username);
		}
		const id = uuidv4();
		const encryptedPassword = await encryptPasswordSync(password);
		const item = {
			id,
			username,
			password: encryptedPassword,
			status: true,
			balance: 20000,
			createdAt: getActualDateString(),
			updatedAt: getActualDateString(),
		};
		const params = {
			TableName: USER_TABLE_NAME,
			Item: item,
		};
		await app.getDynamoDB().put(params).promise();
		return item;
	}

	async getUserById(
		id: string,
		username: string
	): Promise<UserDAO | undefined> {
		const { expression, attributeNames, attributeValues } = mapValues({
			id,
			status: true,
		});
		const params = {
			TableName: USER_TABLE_NAME,
			KeyConditionExpression: '#id = :id',
			FilterExpression: '#status = :status',
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues,
		};

		const result = await app.getDynamoDB().query(params).promise();
		return result.Items?.[0] as UserDAO;
	}

	async getUserByUsername(username: string): Promise<UserDAO | undefined> {
		const { expression, attributeNames, attributeValues } = mapValues({
			username,
		});
		const params = {
			TableName: USER_TABLE_NAME,
			IndexName: 'usernameIndex',
			KeyConditionExpression: expression,
			ExpressionAttributeNames: attributeNames,
			ExpressionAttributeValues: attributeValues,
		};

		try {
			const result = await app.getDynamoDB().query(params).promise();
			return result.Items?.[0] as UserDAO;
		} catch (error) {
			throw error;
		}
	}

	async updateUserQuota(id: string, username: string, balance: number) {
		const { expression, attributeNames, attributeValues } = mapValues({
			balance,
		});
		const params = {
			TableName: USER_TABLE_NAME,
			Key: {
				id,
				username,
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
}

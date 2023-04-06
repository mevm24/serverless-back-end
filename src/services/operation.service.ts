import { OperationDAO, UserDAO } from '../entity/dao';
import { CreateOperationDTO } from '../entity/dto';
import { OperationModel } from '../models/operation.model';
import { CalculateOperationStrategyService } from './strategy/calculateOperationStrategy.service';
import { OperationStrategy } from '../entity/operation';
import { UserModel } from '../models';
import UserDoesNotHaveEnoughBalanceException from '../exceptions/UserDoesNotHaveEnoughBalanceException';
import { RecordModel } from '../models/record.model';
import { getActualDateString } from '../utils/usefulFunctions';
import {
	NoOperationFoundException,
	WrongAuthenticationTokenException,
} from '../exceptions';

export class OperationService {
	private operationModel: OperationModel;
	private userModel: UserModel;
	private recordModel: RecordModel;
	constructor() {
		this.operationModel = new OperationModel();
		this.userModel = new UserModel();
		this.recordModel = new RecordModel();
	}

	async getAllTypes(): Promise<OperationDAO[] | undefined> {
		return await this.operationModel.getAllOperations();
	}

	async createOperation({
		type,
		cost,
	}: CreateOperationDTO): Promise<OperationDAO | undefined> {
		return await this.operationModel.createOperation({ type, cost });
	}

	async createBatchOperation(
		batchOperations: CreateOperationDTO[]
	): Promise<[OperationDAO[], any]> {
		return await this.operationModel.createBatchOperation(batchOperations);
	}

	async getOperationByType(type: string): Promise<OperationDAO | undefined> {
		return await this.operationModel.getOperationByType(type);
	}

	async getOperationById(id: string): Promise<OperationDAO | undefined> {
		return await this.operationModel.getOperationById(id);
	}

	async updateOperation(
		id: string,
		type: string,
		cost: number
	): Promise<string> {
		return await this.operationModel.updateOperation(id, type, cost);
	}

	async executeCalculate(operation: OperationStrategy, user: UserDAO) {
		const operationData = await this.getOperationByType(
			operation.operationName
		);
		if (operationData) {
			if (user.balance - operationData.cost >= 0) {
				try {
					const operationResponse =
						await new CalculateOperationStrategyService(
							operation
						).calculate();
					return await this.executeAfterCalculateLogic(
						operationData,
						user,
						operationResponse
					);
				} catch (err) {
					throw err;
				}
			}
			throw new UserDoesNotHaveEnoughBalanceException(user.username);
		} else {
			if (!operationData)
				throw new NoOperationFoundException(
					operation.operationName,
					'Type'
				);
		}
	}

	private async executeAfterCalculateLogic(
		operationData: OperationDAO,
		user: UserDAO,
		operationResponse: any
	) {
		try {
			const [recordDAO] = await Promise.all([
				this.recordModel.createRecord({
					operation_id: operationData.id,
					amount: operationData.cost,
					date: getActualDateString(),
					operation_response: operationResponse,
					user_balance: user.balance,
					user_id: user.id,
				}),
				this.userModel.updateUserQuota(
					user.id,
					user.username,
					user.balance - operationData.cost
				),
			]);

			return {
				operationResponse,
				recordDAO,
			};
		} catch (err) {
			throw err;
		}
	}
}

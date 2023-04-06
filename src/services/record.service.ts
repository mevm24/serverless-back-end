import { RecordModel } from '../models';
import { CreateRecordDTO } from '../entity/dto';
import { RecordDAO } from '../entity/dao';
import { SORT_ORDERING } from '../utils/';
import NoRecordFoundException from '../exceptions/NoRecordFoundException';

export class RecordService {
	private recordModel: RecordModel;
	constructor() {
		this.recordModel = new RecordModel();
	}

	async getRecordsByUser(
		user_id: string,
		limit: number,
		offset: number,
		sort: SORT_ORDERING
	): Promise<RecordDAO[] | undefined> {
		return await this.recordModel.getRecordsByUser(
			user_id,
			limit,
			offset,
			sort
		);
	}

	async createRecord({
		operation_id,
		user_id,
		amount,
		user_balance,
		operation_response,
		date,
	}: CreateRecordDTO): Promise<RecordDAO | undefined> {
		return await this.recordModel.createRecord({
			operation_id,
			user_id,
			amount,
			user_balance,
			operation_response,
			date,
		});
	}

	async deleteRecord(id: string): Promise<string> {
		const recordToDelete = await this.recordModel.getRecordById(id);
		if (recordToDelete) {
			return await this.recordModel.deleteRecord(
				id,
				recordToDelete?.createdAt as string
			);
		}
		throw new NoRecordFoundException(id);
	}
}

import { OperationDAO } from '.';

export interface RecordDAO {
	id: string;
	createdAt: string;
	operation_id: string;
	user_id: string;
	amount: number;
	user_balance: number;
	operation_response: string;
	date: string;
	updatedAt: string;
}

export type RecordOperationDAO = RecordDAO & Partial<OperationDAO>;

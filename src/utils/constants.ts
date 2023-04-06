import dotenv from 'dotenv';
dotenv.config();

export const USER_TABLE_NAME: string = process.env.PROJECT_NAME + '-user';

export const OPERATION_TABLE_NAME: string =
	process.env.PROJECT_NAME + '-operation';

export const RECORD_TABLE_NAME: string = process.env.PROJECT_NAME + '-record';

export enum SORT_ORDERING {
	DESC = 'DESC',
	ASC = 'ASC',
}

import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsString,
	Min,
} from 'class-validator';

export class CreateRecordDTO {
	@IsString()
	@IsNotEmpty()
	operation_id: string;

	@IsString()
	@IsNotEmpty()
	user_id: string;

	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	amount: number;

	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	user_balance: number;

	@IsString()
	@IsNotEmpty()
	operation_response: string;

	@IsNotEmpty()
	@IsDateString()
	date: string;
}

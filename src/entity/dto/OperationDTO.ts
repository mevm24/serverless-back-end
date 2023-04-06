import {
	IsAlphanumeric,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from 'class-validator';

export class CreateOperationDTO {
	@IsString()
	@IsNotEmpty()
	public type: string;

	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	public cost: number;
}

export class GetOperationDTO {
	@IsString()
	@IsOptional()
	public id?: string;

	@IsString()
	@IsOptional()
	public type?: string;
}

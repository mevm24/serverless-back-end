import {
	IsAlphanumeric,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Max,
	Min,
} from 'class-validator';

export interface OperationStrategy {
	operationName: string;
	operation: () => Promise<any>;
}

export class DivitionData {
	@IsNumber()
	@IsNotEmpty()
	numerator: number;

	@IsNumber()
	@IsNotEmpty()
	denominator: number;
}

export class StringOperationData {
	@IsNumber()
	@Min(1)
	@Max(100)
	@IsOptional()
	n: number;

	@IsNumber()
	@IsOptional()
	@Min(1)
	@Max(32)
	length: number;

	@IsAlphanumeric()
	@IsOptional()
	characters: string;
}

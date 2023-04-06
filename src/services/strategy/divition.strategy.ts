import { DivitionData, OperationStrategy } from '../../entity/operation';
import DivideByZeroException from '../../exceptions/DivideByZeroException';

export class DivitionStrategy implements OperationStrategy {
	public readonly operationName = 'divition';
	private numerator: number;
	private denominator: number;
	constructor(numbers: DivitionData) {
		const { numerator, denominator }: DivitionData = numbers;
		this.numerator = numerator;
		this.denominator = denominator;
	}

	async operation(): Promise<number> {
		if (this.denominator === 0) {
			throw new DivideByZeroException();
		}
		try {
			if (
				Number.isFinite(this.numerator) &&
				Number.isFinite(this.denominator)
			) {
				return this.numerator / this.denominator;
			}
			throw new Error('Numerator and denominator must be numbers');
		} catch (err) {
			throw err;
		}
	}
}

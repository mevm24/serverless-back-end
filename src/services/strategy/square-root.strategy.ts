import { OperationStrategy } from '../../entity/operation';
import NegativeSquareRootException from '../../exceptions/NegativeSquareRootException';
export class SquareRootStrategy implements OperationStrategy {
	public readonly operationName = 'squareRoot';
	private number: number;
	constructor(number: number) {
		this.number = number;
	}

	async operation(): Promise<number> {
		if (this.number < 0 && Number.isFinite(this.number)) {
			throw new NegativeSquareRootException();
		}
		try {
			return Number(Math.sqrt(this.number).toFixed(3));
		} catch (error) {
			throw error;
		}
	}
}

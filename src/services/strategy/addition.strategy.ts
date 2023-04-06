import { OperationStrategy } from '../../entity/operation';
import NoNumbersToAddException from '../../exceptions/NoNumbersToAddException';

export class AdditionStrategy implements OperationStrategy {
	public readonly operationName = 'addition';
	private params: number[];
	constructor(params: number[]) {
		this.params = [...params] || [];
	}

	async operation(): Promise<number> {
		if (this.params.length > 0) {
			return this.params.reduce((accumulate, actualNumber) => {
				if (Number.isFinite(actualNumber)) {
					accumulate += actualNumber;
				}
				return accumulate;
			}, 0);
		}
		throw new NoNumbersToAddException();
	}
}

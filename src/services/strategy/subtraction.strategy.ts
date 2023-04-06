import { OperationStrategy } from '../../entity/operation';

export class SubtractionStrategy implements OperationStrategy {
	public readonly operationName = 'subtraction';
	private params: number[];
	constructor(params: number[]) {
		this.params = [...params] || [];
	}

	async operation(): Promise<number> {
		return this.params.reduce((accumulate, current, index) => {
			if (Number.isFinite(current)) {
				if (index > 0) {
					accumulate -= current;
				} else {
					accumulate = current;
				}
			}
			return accumulate;
		}, 0);
	}
}

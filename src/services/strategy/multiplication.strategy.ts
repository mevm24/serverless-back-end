import { OperationStrategy } from '../../entity/operation';

export class MultiplicationStrategy implements OperationStrategy {
	public readonly operationName = 'multiplication';
	private params: number[];
	constructor(params: number[]) {
		this.params = [...params] || [];
	}

	async operation(): Promise<number> {
		return this.params.reduce((accumulate, actualNumber) => {
			if (Number.isFinite(actualNumber)) {
				accumulate *= actualNumber;
			}
			return accumulate;
		}, 1);
	}
}

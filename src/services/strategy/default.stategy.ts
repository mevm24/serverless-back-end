import { OperationStrategy } from '../../entity/operation';

export class DefaultStrategy implements OperationStrategy {
	public readonly operationName = 'default';
	constructor() {}

	async operation(): Promise<string> {
		return 'No operation selected';
	}
}

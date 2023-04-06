import { OperationStrategy } from '../../entity/operation';

export class CalculateOperationStrategyService {
	constructor(private strategyOperation: OperationStrategy) {}

	setStrategy(strategyOperation: OperationStrategy) {
		this.strategyOperation = strategyOperation;
	}

	async calculate() {
		try {
			return await this.strategyOperation.operation();
		} catch (error) {
			throw error;
		}
	}
}

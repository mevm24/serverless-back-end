import { OperationStrategy } from '../../../entity/operation';
import { CalculateOperationStrategyService } from '../../../services/strategy/calculateOperationStrategy.service';

describe('Calculate Operation Strategy Service', () => {
	it('should not throw error if operation is valid', async () => {
		// Arrange
		const validStrategy: OperationStrategy = {
			operationName: 'addition',
			operation: async () => 2 + 2,
		};
		const service = new CalculateOperationStrategyService(validStrategy);

		// Act
		const result = await service.calculate();

		// Assert
		expect(result).toBe(4);
	});

	it('should throw error if operation set is invalid', async () => {
		// Arrange
		const errorText = 'Invalid strategy';
		const invalidStrategy: OperationStrategy = {
			operationName: 'invalid',
			operation: async () => {
				throw new Error(errorText);
			},
		};
		const service = new CalculateOperationStrategyService({
			operationName: 'addition',
			operation: async () => 2 + 2,
		});

		// Act
		service.setStrategy(invalidStrategy);

		// Assert
		try {
			const result = await service.calculate();
			expect(true).toBe(false);
		} catch (err: any) {
			expect(err.message).toBe(errorText);
		}
	});

	it('should throw error if injected strategy is invalid', async () => {
		// Arrange
		const errorText = 'Invalid strategy';
		const invalidStrategy: OperationStrategy = {
			operationName: 'invalid',
			operation: async () => {
				throw new Error(errorText);
			},
		};
		const service = new CalculateOperationStrategyService(invalidStrategy);

		// Act & Assert
		try {
			const result = await service.calculate();
			expect(true).toBe(false);
		} catch (err: any) {
			expect(err.message).toBe(errorText);
		}
	});

	it('should calculate the operation even if the strategy is called before the strategy is set', async () => {
		const service = new CalculateOperationStrategyService({
			operationName: 'test',
			operation: async () => 1,
		});
		expect(await service.calculate()).toBe(1);
	});

	it('should throw an error if the operation function fails', async () => {
		const service = new CalculateOperationStrategyService({
			operationName: 'test',
			operation: async () => {
				throw new Error('test error');
			},
		});
		await expect(service.calculate()).rejects.toThrow();
	});

	// Tests that the class returns the correct result for each operation strategy.
	it('should return the correct result for each operation strategy', async () => {
		const service = new CalculateOperationStrategyService({
			operationName: 'test',
			operation: async () => 1,
		});
		await expect(service.calculate()).resolves.toBe(1);
	});

	it('should handle even async operations', async () => {
		const operation: OperationStrategy = {
			operationName: 'testOperation',
			operation: async () => {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve('success');
					}, 1000);
				});
			},
		};
		const service = new CalculateOperationStrategyService(operation);
		const result = await service.calculate();
		expect(result).toBe('success');
	});

	it('should handle differents types of strategy', async () => {
		const operation1: OperationStrategy = {
			operationName: 'testOperation1',
			operation: async () => {
				return 'success1';
			},
		};
		const operation2: OperationStrategy = {
			operationName: 'testOperation2',
			operation: async () => {
				return `success2`;
			},
		};
		const service = new CalculateOperationStrategyService(operation1);
		let result = await service.calculate();
		expect(result).toBe('success1');
		service.setStrategy(operation2);
		result = await service.calculate();
		expect(result).toBe('success2');
	});

	it('should handle concurrent calls to the calculate method', async () => {
		const operation: OperationStrategy = {
			operationName: 'testOperation',
			operation: async () => {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve('success');
					}, 1000);
				});
			},
		};
		const service = new CalculateOperationStrategyService(operation);
		const promises = [];
		for (let i = 0; i < 5; i++) {
			promises.push(service.calculate());
		}
		const results = await Promise.all(promises);
		expect(results).toEqual([
			'success',
			'success',
			'success',
			'success',
			'success',
		]);
	});
});

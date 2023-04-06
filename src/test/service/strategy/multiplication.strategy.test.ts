import { MultiplicationStrategy } from '../../../services/strategy/multiplication.strategy';

describe('MultiplicationStrategy', () => {
	it('should multiply an array of positive numbers', async () => {
		const params = [2, 3, 4];
		const multiplicationStrategy = new MultiplicationStrategy(params);
		const result = await multiplicationStrategy.operation();
		expect(result).toBe(24);
	});

	it('should handle arrays with zeros', async () => {
		const params = [2, 0, 4];
		const multiplicationStrategy = new MultiplicationStrategy(params);
		const result = await multiplicationStrategy.operation();
		expect(result).toBe(0);
	});

	// Tests that the class throws an error when given an array with non-numeric values.
	it('should handle arrays with non-numeric values', async () => {
		const params = [2, 'a', 4];
		const multiplicationStrategy = new MultiplicationStrategy(
			params as any
		);
		expect(await multiplicationStrategy.operation()).toBe(8);
	});

	it('should handle negative numbers', async () => {
		const params = [2, -3, 4];
		const strategy = new MultiplicationStrategy(params);
		const result = await strategy.operation();
		expect(result).toBe(-24);
	});

	it('should handle floating numbers', async () => {
		const params = [2.5, 3.5, 4];
		const strategy = new MultiplicationStrategy(params);
		const result = await strategy.operation();
		expect(result).toBeCloseTo(35);
	});

	it('should handle empty arrays', async () => {
		const params: number[] = [];
		const strategy = new MultiplicationStrategy(params);
		const result = await strategy.operation();
		expect(result).toBe(1);
	});

	it('should handle an array with just 1 number', async () => {
		const params = [5];
		const multiplicationStrategy = new MultiplicationStrategy(params);
		const result = await multiplicationStrategy.operation();
		expect(result).toBe(5);
	});

	it('should handle large numbers without overflowing', async () => {
		const params = [1000000, 1000000];
		const multiplicationStrategy = new MultiplicationStrategy(params);
		const result = await multiplicationStrategy.operation();
		expect(result).toBe(1000000000000);
	});
});

import { SubtractionStrategy } from '../../../services/strategy/subtraction.strategy';

describe('Subtraction Strategy', () => {
	it('should handle subtraction of positive numbers', async () => {
		const params = [5, 3];
		const subtractionStrategy = new SubtractionStrategy(params);
		const result = await subtractionStrategy.operation();
		expect(result).toBe(2);
	});

	it('should handle subtraction of positive and negative numbers', async () => {
		const params = [5, -3];
		const subtractionStrategy = new SubtractionStrategy(params);
		const result = await subtractionStrategy.operation();
		expect(result).toBe(8);
	});

	it('should handle any type of arrays ignoring everything but numbers', async () => {
		const params = [5, 'not a number', 3];
		const subtractionStrategy = new SubtractionStrategy(params as any);
		const result = await subtractionStrategy.operation();
		expect(result).toBe(2);
	});

	it('should handle empty arrays', async () => {
		const subtraction = new SubtractionStrategy([]);
		const result = await subtraction.operation();
		expect(result).toBe(0);
	});

	it('should handle large numbers without overflowing', async () => {
		const params = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
		const subtraction = new SubtractionStrategy(params);
		const result = await subtraction.operation();
		expect(result).toBe(0);
	});

	it('should ignore values that are non-number', async () => {
		const params = [1, 2, 'a', 3, 'b'];
		const subtraction = new SubtractionStrategy(params as any);
		const result = await subtraction.operation();
		expect(result).toBe(-4);
	});
});

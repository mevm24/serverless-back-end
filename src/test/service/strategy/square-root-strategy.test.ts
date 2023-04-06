import NegativeSquareRootException from '../../../exceptions/NegativeSquareRootException';
import { SquareRootStrategy } from '../../../services/strategy/square-root.strategy';

describe('Square Root Strategy', () => {
	it('should handle positive numbers', async () => {
		const number = 9;
		const squareRootStrategy = new SquareRootStrategy(number);
		const result = await squareRootStrategy.operation();
		expect(result).toBe(3);
	});

	it('should handle zero', async () => {
		const number = 0;
		const squareRootStrategy = new SquareRootStrategy(number);
		const result = await squareRootStrategy.operation();
		expect(result).toBe(0);
	});

	it('should throw an exception if trying to calculate square root of negative numbers', async () => {
		const number = -9;
		const squareRootStrategy = new SquareRootStrategy(number);
		await expect(squareRootStrategy.operation()).rejects.toThrow(
			new NegativeSquareRootException()
		);
	});

	it('should handle infinity numbers', async () => {
		const strategy = new SquareRootStrategy(Infinity);
		await expect(strategy.operation()).resolves.toBe(Infinity);
	});

	it('should be able to return fixed numbers when large numbers are sent', async () => {
		const strategy = new SquareRootStrategy(999999999999999);
		await expect(strategy.operation()).resolves.toBeCloseTo(
			31622776.602,
			3
		);
	});
});

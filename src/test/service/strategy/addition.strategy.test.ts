// Generated by CodiumAI

import NoNumbersToAddException from '../../../exceptions/NoNumbersToAddException';
import { AdditionStrategy } from '../../../services/strategy/addition.strategy';

describe('Addition Strategy', () => {
	it('should handle positive numbers', async () => {
		const params = [1, 2, 3];
		const additionStrategy = new AdditionStrategy(params);
		const result = await additionStrategy.operation();
		expect(result).toBe(6);
	});

	it('should handle negative numbers', async () => {
		const params = [-1, -2, -3];
		const additionStrategy = new AdditionStrategy(params);
		const result = await additionStrategy.operation();
		expect(result).toBe(-6);
	});

	it('should handle positive and negative numbers', async () => {
		const params = [-1, -2, -3, 3, 2, 1];
		const additionStrategy = new AdditionStrategy(params);
		const result = await additionStrategy.operation();
		expect(result).toBe(0);
	});

	it('should throw an exception when the array is empty', async () => {
		const params: number[] = [];
		const additionStrategy = new AdditionStrategy(params);
		await expect(additionStrategy.operation()).rejects.toThrow(
			new NoNumbersToAddException()
		);
	});

	it('should handle arrays with not just numbers', async () => {
		const params = [
			-1,
			-2,
			-3,
			'2',
			'3',
			'something',
			false,
			{},
			new Number(23),
			NaN,
		];
		const additionStrategy = new AdditionStrategy(params as any);
		const result = await additionStrategy.operation();
		expect(result).toBe(-6);
	});
});
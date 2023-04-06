import { DivitionData } from '../../../entity/operation';
import DivideByZeroException from '../../../exceptions/DivideByZeroException';
import { DivitionStrategy } from '../../../services/strategy/divition.strategy';

describe('Divition Strategy', () => {
	it('should calculate the divition with non-zero numbers', async () => {
		const divitionData: DivitionData = { numerator: 10, denominator: 2 };
		const divitionStrategy = new DivitionStrategy(divitionData);
		const result = await divitionStrategy.operation();
		expect(result).toBe(5);
	});

	it('should throw an error if the denominator is zero', async () => {
		const divitionData: DivitionData = { numerator: 10, denominator: 0 };
		const divitionStrategy = new DivitionStrategy(divitionData);
		await expect(divitionStrategy.operation()).rejects.toThrow(
			new DivideByZeroException()
		);
	});

	it('should return zero when numerator is zero', async () => {
		const divitionData: DivitionData = { numerator: 0, denominator: 10 };
		const divitionStrategy = new DivitionStrategy(divitionData);
		const result = await divitionStrategy.operation();
		expect(result).toBe(0);
	});

	// Tests that the divition operation handles non-numeric inputs correctly.
	it('test_divition_with_non_numeric_inputs', async () => {
		const divitionData: DivitionData = {
			numerator: 10,
			denominator: 'not a number' as any,
		};
		const divitionStrategy = new DivitionStrategy(divitionData);
		await expect(divitionStrategy.operation()).rejects.toThrow();
	});

	// Tests that the divition operation handles large numbers that may cause overflow correctly.
	it('test_divition_with_large_numbers', async () => {
		const divitionData: DivitionData = {
			numerator: Number.MAX_SAFE_INTEGER,
			denominator: 2,
		};
		const divitionStrategy = new DivitionStrategy(divitionData);
		const result = await divitionStrategy.operation();
		expect(result).toBeGreaterThan(0);
	});

	// Tests that the dividebyzeroexception class is properly mocked and thrown when the denominator is zero.
	it('test_divition_with_mocked_divide_by_zero_exception', async () => {
		const divitionData: DivitionData = { numerator: 10, denominator: 0 };
		const divitionStrategy = new DivitionStrategy(divitionData);
		await expect(divitionStrategy.operation()).rejects.toThrow(
			new DivideByZeroException()
		);
	});

	// Tests that the operationname property of the divitionstrategy class is 'divition'.
	it('test_divition_operation_name', () => {
		const divitionStrategy = new DivitionStrategy({
			numerator: 10,
			denominator: 2,
		});
		expect(divitionStrategy.operationName).toBe('divition');
	});

	// Tests that the operation method of the divitionstrategy class returns a promise.
	it('test_divition_operation_returns_promise', async () => {
		const divitionStrategy = new DivitionStrategy({
			numerator: 10,
			denominator: 2,
		});
		const result = divitionStrategy.operation();
		expect(result).toBeInstanceOf(Promise);
	});
});

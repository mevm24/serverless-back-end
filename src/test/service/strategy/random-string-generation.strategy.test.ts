import axios from 'axios';
import { RandomStringGenerationStrategy } from '../../../services/strategy/random-string-generation.strategy';
import { StringOperationData } from '../../../entity/operation';

describe('Random String Generation Strategy', () => {
	it('should return a random string', async () => {
		// Arrange
		const params: StringOperationData = {
			n: 5,
			length: 10,
			characters: 'abcdefghijklmnopqrstuvwxyz',
		};
		const strategy = new RandomStringGenerationStrategy(params);

		// Mock the axios post method to return a successful response
		jest.spyOn(axios, 'post').mockResolvedValueOnce({
			data: {
				result: ['abcde', 'fghij', 'klmno', 'pqrst', 'uvwxy'],
			},
		});

		// Act
		const result = await strategy.operation();

		// Assert
		expect(result).toEqual({
			result: ['abcde', 'fghij', 'klmno', 'pqrst', 'uvwxy'],
		});
	});

	it('should throw an error if a param is not found', async () => {
		// Arrange
		const params = {
			length: 10,
			characters: 'abcdefghijklmnopqrstuvwxyz',
		};
		const strategy = new RandomStringGenerationStrategy(params as any);

		jest.spyOn(axios, 'post').mockRejectedValue(
			new Error('Invalid params')
		);

		// Act and Assert
		try {
			await strategy.operation();
		} catch (err) {
			expect(err).toEqual(new Error('Invalid params'));
		}
	});

	it('should throw an error if a param is not found', async () => {
		// Arrange
		const params = {
			n: 5,
			characters: 'abcdefghijklmnopqrstuvwxyz',
		};
		const strategy = new RandomStringGenerationStrategy(params as any);
		jest.spyOn(axios, 'post').mockRejectedValue(
			new Error('Invalid params')
		);

		// Act and Assert
		try {
			await strategy.operation();
		} catch (err) {
			expect(err).toEqual(new Error('Invalid params'));
		}
	});

	it('should throw an error if a param is set to undefined', async () => {
		const params = {
			n: 10,
			length: 8,
			characters: undefined,
		};
		const strategy = new RandomStringGenerationStrategy(params as any);
		jest.spyOn(axios, 'post').mockRejectedValue(
			new Error('Invalid params')
		);
		try {
			await strategy.operation();
		} catch (err) {
			expect(err).toEqual(new Error('Invalid params'));
		}
	});

	it('should throw an error if api call fails', async () => {
		const params: StringOperationData = {
			n: 10,
			length: 8,
			characters: 'abcdefghijklmnopqrstuvwxyz',
		};
		const strategy = new RandomStringGenerationStrategy(params);
		jest.spyOn(axios, 'post').mockRejectedValue(
			new Error('API call failed')
		);
		await expect(strategy.operation()).rejects.toThrow();
	});

	it('should not be possible to change the params in the object after the constructor has been called', async () => {
		const params: StringOperationData = {
			n: 10,
			length: 8,
			characters: 'abcdefghijklmnopqrstuvwxyz',
		};
		const strategy = new RandomStringGenerationStrategy(params);
		expect(strategy['params']).toEqual(params);
		params.n = 5;
		expect(strategy['params']).not.toEqual(params);
	});
});

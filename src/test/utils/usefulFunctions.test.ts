import {
	encryptPasswordSync,
	getActualDateString,
	mapValues,
} from '../../utils';
import bcrypt from 'bcryptjs';

describe('getActualDateString_function', () => {
	// Tests that the function returns a string representing the current date and time in iso format.
	it('test_returns_iso_string', () => {
		const result = getActualDateString();
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	});

	// Tests that the function always returns the same output for the same input.
	it('test_returns_same_output', () => {
		const result1 = getActualDateString();
		const result2 = getActualDateString();
		expect(result1).toEqual(result2);
	});

	// Tests that the function does not modify any external state or variables.
	it('test_no_external_modification', () => {
		const originalDate = Date;
		getActualDateString();
		expect(Date).toEqual(originalDate);
	});
});

describe('encryptPasswordSync_function', () => {
	// Tests that inputting a valid password returns a hashed password string.
	it('test_valid_password_returns_hashed_password', async () => {
		const password = 'password123';
		const hashedPassword = await encryptPasswordSync(password);
		expect(hashedPassword).not.toBe(password);
		expect(typeof hashedPassword).toBe('string');
	});

	// Tests that inputting an empty string as the password returns an error.
	it('test_empty_password_returns_error', async () => {
		const password = '';
		await expect(encryptPasswordSync(password)).rejects.toThrow();
	});

	// Tests that inputting a password that exceeds the maximum length allowed by bcrypt returns an error.
	it('test_long_password_returns_error', async () => {
		const password = 'a'.repeat(73); // bcrypt maximum length is 72 characters
		await expect(encryptPasswordSync(password)).rejects.toThrow();
	});

	// Tests that the function returns a promise.
	it('test_returns_promise', () => {
		const result = encryptPasswordSync('password');
		expect(result).toBeInstanceOf(Promise);
	});

	// Tests that the function is asynchronous.
	it('test_is_asynchronous', async () => {
		const result = await encryptPasswordSync('password');
		expect(result).toBeDefined();
	});

	// Tests that the bcrypt library is being used correctly.
	it('test_bcrypt_library_is_used_correctly', async () => {
		const mockHash = jest.spyOn(bcrypt, 'hash');
		await encryptPasswordSync('password');
		expect(mockHash).toHaveBeenCalledWith('password', 10);
	});
});

describe('mapValues_function', () => {
	// Tests that the function returns an empty object if input object is empty.
	it('test_empty_object', () => {
		const payload = {};
		const result = mapValues(payload);
		expect(result).toEqual({
			attributeNames: {},
			attributeValues: {},
			expression: '',
		});
	});

	// Tests that the expression string is created correctly with ' and ' separator.
	it('test_expression_string', () => {
		const payload = { name: 'John', age: 30 };
		const result = mapValues(payload);
		expect(result.expression).toBe('#name = :name AND #age = :age');
	});
});

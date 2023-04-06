import bcrypt from 'bcryptjs';
import { WrongAuthenticationTokenException } from '../exceptions';

export const getActualDateString = () => {
	return new Date().toISOString();
};

export const encryptPasswordSync = async (
	password: string
): Promise<string> => {
	if (!password || password.length > 72) {
		throw new WrongAuthenticationTokenException();
	}
	return await bcrypt.hash(password, 10).then((hashedPassword: string) => {
		return hashedPassword;
	});
};

export const mapValues = (payload: any): any => {
	const attributeNames: any = {};
	const attributeValues: any = {};
	const mappedKeys: any[] = [];

	Object.entries(payload).forEach(([key, value]) => {
		if (value !== undefined) {
			attributeNames[`#${key}`] = key;
			attributeValues[`:${key}`] = processValue(value);
			mappedKeys.push(`#${key} = :${key}`);
		}
	});

	return {
		attributeNames,
		attributeValues,
		expression: mappedKeys.join(' AND '),
	};
};

export const processValue = (value: any): any => {
	if (value instanceof Date) {
		return value.toISOString();
	}

	return value;
};

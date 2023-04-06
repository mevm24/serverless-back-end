import axios from 'axios';
import { OperationStrategy, StringOperationData } from '../../entity/operation';

export class RandomStringGenerationStrategy implements OperationStrategy {
	public readonly operationName = 'randomStringGeneration';
	private params: StringOperationData = {
		characters:
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		length: 32,
		n: 10,
	};
	constructor(params: StringOperationData) {
		this.params = { ...params };
	}

	async operation(): Promise<string> {
		return await this.getRandomString();
	}

	private async getRandomString() {
		try {
			const { data } = await axios.post(
				'https://api.random.org/json-rpc/4/invoke',
				{
					jsonrpc: '2.0',
					method: 'generateStrings',
					params: {
						apiKey: '457312fd-4c44-45d6-8856-18053fad4c0c',
						replacement: true,
						...this.params,
					},
					id: 1,
				}
			);
			return data;
		} catch (error) {
			throw error;
		}
	}
}

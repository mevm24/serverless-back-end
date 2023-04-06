import AWS, { DynamoDB } from 'aws-sdk';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Controllers } from './entity/controllers';
import { errorMiddleware } from './middlewares/error.middleware';

export class Server {
	private dynamoDBClient: DynamoDB.DocumentClient;
	private app: express.Application;
	constructor(
		private readonly controllers: Controllers[],
		private readonly port: string
	) {
		this.app = express();
		this.initConfigs();
		this.initDynamoDB();
		this.initMiddlewares();
		this.initControllers();
		this.initErrorHandler();
	}

	private initConfigs() {
		dotenv.config();
	}

	private initDynamoDB() {
		try {
			if (
				process.env.IS_OFFLINE === 'true' ||
				process.env.ENVIRONMENT === 'local'
			) {
				this.dynamoDBClient = new AWS.DynamoDB.DocumentClient({
					region: process.env.AWS_DEFAULT_REGION,
					endpoint: 'http://localhost:8000',
				});
			} else {
				this.dynamoDBClient = new AWS.DynamoDB.DocumentClient({
					region: process.env.AWS_DEFAULT_REGION,
					sessionToken: process.env.AWS_SESSION_TOKEN,
				});
			}
		} catch (err) {
			throw new Error('Could not connect to the DynamoDB');
		}
	}

	private initMiddlewares() {
		const corsOptions = {
			credentials: true,
		};
		this.app.use(cors(corsOptions));
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(express.json());
	}

	private initControllers() {
		this.controllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});
	}

	private initErrorHandler() {
		this.app.use(errorMiddleware);
	}

	getDynamoDB() {
		return this.dynamoDBClient;
	}

	getApp(): express.Application {
		return this.app;
	}

	initServer() {
		this.app.listen(this.port, () => {
			console.log(`App listening on port ${this.port}`);
		});
	}
}

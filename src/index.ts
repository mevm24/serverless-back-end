import serverless from 'serverless-http';
import dotenv from 'dotenv';
import { Server } from './app';
import {
	OperationController,
	RecordController,
	UserController,
} from './controller';

dotenv.config();
const port = process.env.port || '4000';

export const app = new Server(
	[new UserController(), new OperationController(), new RecordController()],
	port
);
app.initServer();

export const handler = serverless(app.getApp());

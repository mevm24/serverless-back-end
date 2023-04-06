import express, { NextFunction, Request, Response } from 'express';
import { check, oneOf, param } from 'express-validator';
import {
	validationMiddleware,
	validationArrayMiddleware,
} from '../middlewares/errorsValidations.middleware';
import { Controllers, RequestWithUser } from '../entity/controllers';
import { OperationService } from '../services/';
import { CreateOperationDTO } from '../entity/dto';
import { NoOperationFoundException } from '../exceptions/';
import { validateFields } from '../middlewares/error.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { UserDAO } from '../entity/dao';
import { AdditionStrategy } from '../services/strategy/addition.strategy';
import { SubtractionStrategy } from '../services/strategy/subtraction.strategy';
import { MultiplicationStrategy } from '../services/strategy/multiplication.strategy';
import { DivitionStrategy } from '../services/strategy/divition.strategy';
import { SquareRootStrategy } from '../services/strategy/square-root.strategy';
import { RandomStringGenerationStrategy } from '../services/strategy/random-string-generation.strategy';
import { DivitionData, StringOperationData } from '../entity/operation';

export class OperationController implements Controllers {
	public path: string = '/operation';
	public router = express.Router();
	private operationService: OperationService;
	constructor() {
		this.operationService = new OperationService();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router
			.all(`${this.path}/*`, authMiddleware)
			.get(`${this.path}/get`, this.getAllOperations.bind(this))
			.get(
				`${this.path}/get-by-type/:type`,
				this.getOperationByType.bind(this)
			)
			.get(`${this.path}/get-by-id/:id`, this.getOperationById.bind(this))
			.post(
				`${this.path}/calculate/addition`,
				[
					check('numbers')
						.isArray({ min: 2 })
						.withMessage(
							'Numbers array must have at least 2 numbers'
						),
					validateFields,
				],
				this.executeAdditionOperation.bind(this)
			)
			.post(
				`${this.path}/calculate/subtraction`,
				[
					check('numbers')
						.isArray({ min: 2 })
						.withMessage(
							'Numbers array must have at least 2 numbers'
						),
					validateFields,
				],
				this.executeSubtractionOperation.bind(this)
			)
			.post(
				`${this.path}/calculate/multiply`,
				[
					check('numbers')
						.isArray({ min: 2 })
						.withMessage(
							'Numbers array must have at least 2 numbers'
						),
					validateFields,
				],
				this.executeMultiplyOperation.bind(this)
			)
			.post(
				`${this.path}/calculate/divition`,
				validationMiddleware(DivitionData),
				this.executeDivitionOperation.bind(this)
			)
			.post(
				`${this.path}/calculate/square-root`,
				[
					oneOf([
						check('number')
							.isInt({ min: 0 })
							.withMessage(
								'Number must be greater or equal to 0'
							),
						check('number')
							.isFloat({ min: 0.0 })
							.withMessage(
								'Number must be greater or equal to 0'
							),
					]),
					validateFields,
				],
				this.executeSquareRootOperation.bind(this)
			)
			.post(
				`${this.path}/calculate/random-string`,
				validationMiddleware(StringOperationData),
				this.executeRandomStringGeneratorOperation.bind(this)
			)
			.post(
				`${this.path}/create`,
				validationMiddleware(CreateOperationDTO),
				this.createOperation.bind(this)
			)
			.post(
				`${this.path}/create-batch`,
				validationArrayMiddleware(CreateOperationDTO),
				this.createBatchOperations.bind(this)
			)
			.put(
				`${this.path}/:id`,
				[
					param(':id').isEmpty().withMessage('id cannot be empty'),
					validateFields,
					validationMiddleware(CreateOperationDTO),
				],
				this.updateOperation.bind(this)
			);
	}

	async getOperationByType(req: Request, res: Response, next: NextFunction) {
		const { type } = req.params;
		try {
			const operation = await this.operationService.getOperationByType(
				type
			);
			if (operation) {
				return res.status(200).json({
					operation,
				});
			} else {
				next(new NoOperationFoundException(type, 'type'));
			}
		} catch (err: any) {
			next(err);
		}
	}

	async getOperationById(req: Request, res: Response, next: NextFunction) {
		const { id } = req.params;
		try {
			const operation = await this.operationService.getOperationById(id);
			if (operation) {
				return res.status(200).json({
					operation,
				});
			} else {
				next(new NoOperationFoundException(id, 'id'));
			}
		} catch (err: any) {
			next(err);
		}
	}

	async getAllOperations(req: Request, res: Response, next: NextFunction) {
		try {
			const operations = await this.operationService.getAllTypes();
			if (operations) {
				return res.status(200).json({
					operations,
				});
			} else {
				return res.status(404).json({
					message: 'No Operations Found',
				});
			}
		} catch (err: any) {
			next(err);
		}
	}

	async createOperation(req: Request, res: Response, next: NextFunction) {
		const { type, cost } = req.body;

		try {
			const operation = await this.operationService.createOperation({
				type,
				cost,
			});
			return res.status(201).json({
				type,
				operation_id: operation?.id,
			});
		} catch (err: any) {
			next(err);
		}
	}

	async updateOperation(req: Request, res: Response, next: NextFunction) {
		const { id } = req.params;
		const { cost, type } = req.body;

		try {
			await this.operationService.updateOperation(id, type, cost);
			return res.status(204).json({});
		} catch (err: any) {
			next(err);
		}
	}

	async createBatchOperations(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const operations = req.body;

		try {
			const [createdOperations, errorOperations] =
				await this.operationService.createBatchOperation(operations);
			return res.status(201).json({
				createdOperations,
				errorOperations,
			});
		} catch (err: any) {
			next(err);
		}
	}

	async executeAdditionOperation(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { numbers } = req.body;
		const { user } = req;
		const additionOperation = new AdditionStrategy(numbers);
		try {
			const data = await this.operationService.executeCalculate(
				additionOperation,
				user as UserDAO
			);
			if (data)
				return res.status(201).json({
					operationResponse: data.operationResponse,
				});
			next(data);
		} catch (err: any) {
			next(err);
		}
	}

	async executeSubtractionOperation(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { numbers } = req.body;
		const { user } = req;
		const subtractionOperation = new SubtractionStrategy(numbers);
		try {
			const data = await this.operationService.executeCalculate(
				subtractionOperation,
				user as UserDAO
			);
			if (data)
				return res.status(201).json({
					operationResponse: data.operationResponse,
				});
			next(data);
		} catch (err: any) {
			next(err);
		}
	}

	async executeMultiplyOperation(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { numbers } = req.body;
		const { user } = req;
		const multiplyOperation = new MultiplicationStrategy(numbers);
		try {
			const data = await this.operationService.executeCalculate(
				multiplyOperation,
				user as UserDAO
			);
			if (data)
				return res.status(201).json({
					operationResponse: data.operationResponse,
				});
			next(data);
		} catch (err: any) {
			next(err);
		}
	}

	async executeDivitionOperation(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { numerator, denominator } = req.body;
		const { user } = req;
		const divitionOperation = new DivitionStrategy({
			numerator,
			denominator,
		});
		try {
			const data = await this.operationService.executeCalculate(
				divitionOperation,
				user as UserDAO
			);
			if (data)
				return res.status(201).json({
					operationResponse: data.operationResponse,
				});
		} catch (err: any) {
			next(err);
		}
	}

	async executeSquareRootOperation(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { number } = req.body;
		const { user } = req;
		const squareRootOperation = new SquareRootStrategy(number);
		try {
			const data = await this.operationService.executeCalculate(
				squareRootOperation,
				user as UserDAO
			);
			if (data)
				return res.status(201).json({
					operationResponse: data.operationResponse,
				});
			next(data);
		} catch (err: any) {
			next(err);
		}
	}

	async executeRandomStringGeneratorOperation(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	) {
		const { user } = req;
		const {
			n = 10,
			length = 32,
			characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		} = req.body;
		const randomStringOperation = new RandomStringGenerationStrategy({
			n,
			length,
			characters,
		});
		try {
			const data = await this.operationService.executeCalculate(
				randomStringOperation,
				user as UserDAO
			);
			if (data)
				return res.status(201).json({
					operationResponse: data.operationResponse,
				});
			next(data);
		} catch (err: any) {
			next(err);
		}
	}
}

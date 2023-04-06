import express, { NextFunction, Request, Response, query } from 'express';
import { validationMiddleware } from '../middlewares/errorsValidations.middleware';
import { Controllers, RequestWithUser } from '../entity/controllers';
import { RecordService } from '../services/record.service';
import { CreateRecordDTO } from '../entity/dto/RecordDTO';
import { check, param } from 'express-validator';
import { validateFields } from '../middlewares/error.middleware';
import authMiddleware from '../middlewares/auth.middleware';
import { WrongAuthenticationTokenException } from '../exceptions';
import { SORT_ORDERING } from '../utils/constants';

export class RecordController implements Controllers {
	public path: string = '/record';
	public router = express.Router();
	private recordService: RecordService;
	constructor() {
		this.recordService = new RecordService();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router
			.all(`${this.path}/*`, authMiddleware)
			.post(
				`${this.path}/getAll`,
				[
					check('limit')
						.optional()
						.notEmpty()
						.withMessage(`limit can't be empty`),
					check('offset')
						.optional()
						.notEmpty()
						.withMessage(`offset can't be empty`),
					check('sort')
						.optional()
						.notEmpty()
						.withMessage(`offset can't be empty`),
					validateFields,
				],
				this.getAllRecordsByUser.bind(this)
			)
			.post(
				`${this.path}/create`,
				validationMiddleware(CreateRecordDTO),
				this.createRecord.bind(this)
			)
			.delete(
				`${this.path}/delete/:id`,
				[
					param(':id').isEmpty().withMessage('id cannot be empty'),
					validateFields,
				],
				this.deleteRecord.bind(this)
			);
	}

	async getAllRecordsByUser(
		req: RequestWithUser,
		res: Response,
		next: NextFunction
	): Promise<any> {
		const params: Record<string, any> = { ...req.query };
		const { user } = req;

		if (params.limit) {
			params.limit = +params.limit;
		}
		if (params.offset) {
			params.offset = +params.offset;
		}

		const { limit = 0, offset = 0, sort = SORT_ORDERING.DESC } = params;
		try {
			if (user) {
				const records = await this.recordService.getRecordsByUser(
					user.id,
					limit,
					offset,
					sort
				);

				return res.status(200).json({
					records,
				});
			} else {
				throw new WrongAuthenticationTokenException();
			}
		} catch (err: any) {
			next(err);
		}
	}

	async createRecord(req: Request, res: Response, next: NextFunction) {
		const { ...recordData } = req.body;

		try {
			const record = await this.recordService.createRecord(recordData);
			return res.status(201).json({
				record,
			});
		} catch (err: any) {
			next(err);
		}
	}

	async deleteRecord(req: Request, res: Response, next: NextFunction) {
		const { id } = req.params;

		try {
			const record = await this.recordService.deleteRecord(id);
			return res.status(204).send({});
		} catch (err: any) {
			next(err);
		}
	}
}

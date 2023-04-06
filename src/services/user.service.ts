import bcrypt from 'bcryptjs';
import { UserDAO } from '../entity/dao/UserDAO';
import { UserModel } from '../models/user.model';
import { CreateUserDTO } from '../entity/dto/';
import {
	WrongAuthenticationTokenException,
	WrongCredentialsException,
} from '../exceptions/';
import { DataInToken } from '../entity/token';
import * as jwt from 'jsonwebtoken';

export class UserService {
	public userModel: UserModel;
	constructor() {
		this.userModel = new UserModel();
	}

	async login({
		username,
		password,
	}: CreateUserDTO): Promise<UserDAO | undefined> {
		const user = await this.userModel.getUserByUsername(username);
		if (!user) {
			throw new WrongCredentialsException();
		}
		return this.passwordMatches(password, user);
	}

	async createUser(
		username: string,
		password: string
	): Promise<UserDAO | undefined> {
		return await this.userModel.createUser({ username, password });
	}

	async getUser(id: string, username: string): Promise<UserDAO | undefined> {
		const user = await this.userModel.getUserById(id, username);
		if (!user) throw new WrongAuthenticationTokenException();
		return user;
	}

	createToken(user: UserDAO) {
		const expiresIn = 60 * 60 * 24; // a day
		const secret = process.env.JWT_SECRET;
		if (!secret) {
			throw new Error('JWT_SECRET IS NOT DEFINED');
		}
		const dataInToken: DataInToken = {
			id: user.id,
			status: user.status,
			username: user.username,
		};
		return {
			expiresIn,
			token: jwt.sign(dataInToken, secret as string, { expiresIn }),
		};
	}

	passwordMatches(password: string, user: UserDAO): UserDAO | never {
		const passwordMatches = bcrypt.compareSync(password, user.password);
		if (passwordMatches) {
			return user;
		}
		throw new WrongCredentialsException();
	}
}

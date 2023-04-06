export interface DataInToken {
	id: string;
	username: string;
	status: boolean;
}

export interface TokenData {
	token: string;
	expiresIn: number;
}

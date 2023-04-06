export interface UserDAO {
	id: string;
	username: string;
	password: string;
	status: boolean;
	balance: number;
	createdAt?: string;
	updatedAt?: string;
}

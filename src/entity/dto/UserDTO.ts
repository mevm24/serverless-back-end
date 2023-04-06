import {
	IsAlphanumeric,
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class CreateUserDTO {
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	public username: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(30)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'password too weak',
	})
	public password: string;
}

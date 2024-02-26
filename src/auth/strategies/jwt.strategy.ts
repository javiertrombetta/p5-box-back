import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { validationMessages } from '../../common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
		configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					const data = request?.cookies['Authentication'];
					if (!data) {
						return null;
					}
					return data;
				},
			]),
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: JwtPayload): Promise<User> {
		const { id } = payload;
		const user = await this.userModel.findById(id);

		if (!user) {
			throw new UnauthorizedException(validationMessages.auth.token.invalidOrExpired);
		}

		if (user.state === 'inactivo') {
			throw new UnauthorizedException(validationMessages.auth.state.isInactive);
		}

		return user;
	}
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(private configService: ConfigService) {
		super({
			clientID: configService.get<string>('GOOGLE_OAUTH_WEB_CLIENT_ID'),
			clientSecret: configService.get<string>('GOOGLE_OAUTH_WEB_SECRET'),
			callbackURL: configService.get<string>('GOOGLE_OAUTH_WEB_CALLBACK_URL'),
			scope: ['profile', 'email'],
		});
	}

	async validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		const { id, name, emails, photos } = profile;

		const user = {
			provider: 'google',
			providerId: id,
			email: emails[0].value,
			name: name.givenName,
			lastname: name.familyName,
			picture: photos[0].value,
		};

		done(null, user);
	}
}

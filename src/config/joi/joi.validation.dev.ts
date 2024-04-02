import * as Joi from 'joi';

export const JoiValidationDevSchema = Joi.object({
	TZ: Joi.string().required(),
	NODE_ENV: Joi.string().valid('development', 'test').required(),

	CORS_ORIGIN: Joi.string().uri().required(),
	CORS_METHODS: Joi.string()
		.pattern(/^(GET|POST|PUT|DELETE)(,(GET|POST|PUT|DELETE))*$/)
		.required(),

	GLOBAL_PREFIX: Joi.string().required(),
	PORT: Joi.number().default(3000),

	MONGODB_URI: Joi.string().required(),
	MONGO_DB_NAME: Joi.string().required(),
	MONGO_PORT: Joi.number().default(27017),

	JWT_SECRET: Joi.string().min(1).required(),

	SMTP_SERVICES: Joi.string().required(),
	SMTP_HOST: Joi.string().hostname().required(),
	SMTP_PORT: Joi.number().required(),
	SMTP_USER: Joi.string().email().required(),
	SMTP_PASSWORD: Joi.string().min(1).required(),

	GOOGLE_MAPS_API_KEY: Joi.string().min(1).required(),
	GOOGLE_TRAVEL_MODE: Joi.string().valid('DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT', 'TWO_WHEELER').required(),
	GOOGLE_ROUTING_PREFERENCE: Joi.string().valid('TRAFFIC_AWARE', 'TRAFFIC_AWARE_OPTIMAL').required(),
	GOOGLE_RESPONSE_FILEDS: Joi.string().required(),

	GOOGLE_OAUTH_WEB_CLIENT_ID: Joi.string().required(),
	GOOGLE_OAUTH_WEB_SECRET: Joi.string().required(),
	GOOGLE_OAUTH_WEB_CALLBACK_URL: Joi.string().uri().required(),

	AWS_S3_BUCKET_NAME: Joi.string().required(),
	AWS_ACCESS_KEY_ID: Joi.string().required(),
	AWS_SECRET_ACCESS_KEY: Joi.string().required(),
	AWS_REGION: Joi.string().required(),
});

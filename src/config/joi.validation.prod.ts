import * as Joi from 'joi';

export const JoiValidationProdSchema = Joi.object({
	NODE_ENV: Joi.string().valid('production').required(),
	TIME_ZONE: Joi.string(),

	CORS_ORIGIN: Joi.string().uri().required(),
	CORS_METHODS: Joi.string()
		.pattern(/^(GET|POST|PUT|DELETE)(,(GET|POST|PUT|DELETE))*$/)
		.required(),

	GLOBAL_PREFIX: Joi.string().required(),
	PORT: Joi.number().default(3000),

	MONGODB_URI: Joi.string().required(),
	MONGO_USERNAME: Joi.string(),
	MONGO_PASSWORD: Joi.string(),
	MONGO_DB_NAME: Joi.string(),

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
});

import { Injectable } from '@nestjs/common';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { ConfigService } from '@nestjs/config';
import { Request, Response, RequestHandler } from 'express';
import { fileNamer, fileFilter } from './helpers';
import { validationMessages } from '../common/constants';

@Injectable()
export class PhotosService {
	private s3: AWS.S3;
	private upload: RequestHandler;

	constructor(private configService: ConfigService) {
		AWS.config.update({
			accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', 'default-access-key'),
			secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', 'default-secret-key'),
			region: this.configService.get<string>('AWS_REGION', 'us-east-2'),
		});
		this.s3 = new AWS.S3({
			signatureVersion: 'v4',
		});
		this.initializeMulter();
	}

	getS3(): AWS.S3 {
		return this.s3;
	}

	getBucketName(): string {
		return this.configService.get<string>('AWS_S3_BUCKET_NAME', 'default-bucket-name');
	}

	private initializeMulter(): void {
		this.upload = multer({
			storage: multerS3({
				s3: this.getS3(),
				bucket: this.getBucketName(),
				// acl: 'public-read',
				key: fileNamer,
			}),
			fileFilter: fileFilter,
		}).single('photo');
	}

	async fileupload(req: Request, res: Response): Promise<Response> {
		try {
			this.upload(req, res, function (error) {
				if (error) {
					console.log(error);
					const errorMessage = validationMessages.auth.user.photoUrl.uploadFail.replace('{{error}}', error.message);
					return res.status(500).json({ message: errorMessage });
				}
				return res.status(201).json(req.files[0].location);
			});
		} catch (error) {
			console.log(error);
			const errorMessage = validationMessages.auth.user.photoUrl.uploadFail.replace('{{error}}', error.message);
			return res.status(500).json({ message: errorMessage });
		}
	}

	async uploadFileToS3(file: Express.Multer.File): Promise<string> {
		const uploadResult = await this.s3
			.upload({
				Bucket: this.getBucketName(),
				Key: `photos/${file.originalname}`,
				Body: file.buffer,
				// ACL: 'public-read',
			})
			.promise();

		return uploadResult.Location;
	}

	async generatePresignedUrl(key: string): Promise<string> {
		const signedUrlExpireSeconds = 60 * 5;
		let contentType = 'image/jpeg';

		const extension = key.split('.').pop().toLowerCase();
		switch (extension) {
			case 'png':
				contentType = 'image/png';
				break;
			case 'gif':
				contentType = 'image/gif';
				break;
			case 'jpeg':
			case 'jpg':
				contentType = 'image/jpeg';
				break;
			default:
				contentType = 'image/jpeg';
		}

		const url = await this.s3.getSignedUrlPromise('getObject', {
			Bucket: this.getBucketName(),
			Key: key,
			Expires: signedUrlExpireSeconds,
			ResponseContentType: contentType,
		});

		return url;
	}
}

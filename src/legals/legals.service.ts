import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLegalDeclarationDto } from './dto/create-legal-declaration.dto';
import { LegalDeclaration } from './entities/legal-declaration.entity';
import { AuthService } from '../auth/auth.service';
import { RewardsService } from '../rewards/rewards.service';
import { validationMessages } from '../common/constants';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';

@Injectable()
export class LegalDeclarationsService {
	constructor(
		@InjectModel(LegalDeclaration.name) private legalDeclarationModel: Model<LegalDeclaration>,
		private authService: AuthService,
		private rewardsService: RewardsService,
	) {}

	async createDeclaration(userId: string, createLegalDeclarationDto: CreateLegalDeclarationDto): Promise<LegalDeclaration> {
		const declaration = new this.legalDeclarationModel({
			...createLegalDeclarationDto,
			userId,
		});
		await declaration.save();
		return declaration;
	}

	async handleNegativeDeclaration(userId: string, res: Response): Promise<void> {
		try {
			await this.rewardsService.subtractPointsForNegativeDeclaration(userId, res);
			await this.authService.setBlockTimeDuration(userId, validationMessages.legals.timeBlocked, validationMessages.legals.negativeReason);
			await this.authService.logout(res, true);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async handleDeclaration(userId: string, createLegalDeclarationDto: CreateLegalDeclarationDto, res: Response): Promise<any> {
		try {
			const declaration = await this.createDeclaration(userId, createLegalDeclarationDto);

			if (declaration.hasConsumedAlcohol || declaration.isUsingPsychoactiveDrugs || declaration.hasEmotionalDistress) {
				await this.handleNegativeDeclaration(userId, res);
			} else {
				res.status(HttpStatus.OK).json({ message: validationMessages.legals.positiveInfo });
			}
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async findByUserId(userId: string): Promise<LegalDeclaration[]> {
		return await this.legalDeclarationModel.find({ userId }).exec();
	}
}

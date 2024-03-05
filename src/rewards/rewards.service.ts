import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { LogService } from '../log/log.service';
import { ExceptionHandlerService } from '../common/helpers';
import { validationMessages } from '../common/constants';

@Injectable()
export class RewardsService {
	constructor(
		@Inject(forwardRef(() => AuthService)) private authService: AuthService,
		private logService: LogService,
	) {}

	async addPointsForDelivery(userId: string, res: Response): Promise<void> {
		try {
			await this.authService.addPointsForConsecutiveDeliveries(userId, 10);
			await this.logService.create({
				action: validationMessages.log.action.user.points.sumForDelivered,
				entity: validationMessages.log.entity.user,
				entityId: userId,
				changes: { pointsAdded: 10 },
				performedBy: userId,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async subtractPointsForCancellation(userId: string, res: Response): Promise<void> {
		try {
			await this.authService.adjustPoints(userId, -10);
			await this.authService.resetConsecutiveDeliveries(userId);
			await this.logService.create({
				action: validationMessages.log.action.user.points.substractForCancel,
				entity: validationMessages.log.entity.user,
				entityId: userId,
				changes: { pointsSubtracted: 10 },
				performedBy: userId,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async subtractPointsForUndeliveredPackages(userId: string, packagesCount: number): Promise<void> {
		const pointsSubtracted = -20 * packagesCount;
		await this.authService.adjustPoints(userId, pointsSubtracted);
		await this.authService.resetConsecutiveDeliveries(userId);

		await this.logService.create({
			action: validationMessages.log.action.user.points.substractForUndelivered,
			entity: validationMessages.log.entity.user,
			entityId: userId,
			changes: { pointsSubtracted, packagesCount },
			performedBy: userId,
		});
	}

	async subtractPointsForNegativeDeclaration(userId: string, res: Response): Promise<void> {
		try {
			await this.authService.adjustPoints(userId, -100);
			await this.authService.resetConsecutiveDeliveries(userId);
			await this.logService.create({
				action: validationMessages.log.action.user.points.substractForLegalDeclare,
				entity: validationMessages.log.entity.user,
				entityId: userId,
				changes: { pointsSubtracted: 100 },
				performedBy: userId,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async resetConsecutiveDeliveries(userId: string, res: Response): Promise<void> {
		try {
			await this.authService.resetConsecutiveDeliveries(userId);
			await this.logService.create({
				action: validationMessages.log.action.user.points.resetDeliveriesCount,
				entity: validationMessages.log.entity.user,
				entityId: userId,
				changes: { consecutiveDeliveriesReset: true },
				performedBy: userId,
			});
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async setPoints(userId: string, points: number, performerId: string, res: Response): Promise<void> {
		try {
			const user = await this.authService.findById(userId);
			if (!user) {
				throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
			}
			user.points = points;
			await user.save();

			await this.logService.create({
				action: validationMessages.log.action.user.points.setPoints,
				entity: validationMessages.log.entity.user,
				entityId: userId,
				changes: { points },
				performedBy: performerId,
			});

			res.status(HttpStatus.OK).json({ message: validationMessages.auth.user.points.setPoints.replace('${points}', points.toString()).replace('${userId}', userId) });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	async getUserPoints(userId: string): Promise<number> {
		const user = await this.authService.findById(userId);
		if (!user) {
			throw new HttpException(validationMessages.auth.account.error.notFound, HttpStatus.NOT_FOUND);
		}
		return user.points;
	}
}

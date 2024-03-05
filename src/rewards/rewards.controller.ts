/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Post, Param, Body, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { RewardsService } from './rewards.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';
import { ExceptionHandlerService } from '../common/helpers';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
	constructor(private readonly rewardsService: RewardsService) {}

	@Post('/:userId/:points')
	@Auth(ValidRoles.administrador)
	async setPoints(@Param('userId') userId: string, @GetUser('id') performerId: string, @Param('points') points: number, @Res() res: Response) {
		await this.rewardsService.setPoints(userId, points, performerId, res);
	}

	@Get('/:userId')
	@Auth(ValidRoles.administrador)
	async getUserPoints(@Param('userId') userId: string, @Res() res: Response) {
		try {
			const points = await this.rewardsService.getUserPoints(userId);
			res.json({ userId, points });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	// @Post('/delivery/:userId')
	// @Auth(ValidRoles.administrador)
	// async addPointsForDelivery(@Param('userId') userId: string, @Res() res: Response) {
	// 	try {
	// 		await this.rewardsService.addPointsForDelivery(userId, res);
	// 	} catch (error) {
	// 		ExceptionHandlerService.handleException(error, res);
	// 	}
	// }

	// @Post('/cancel/:userId')
	// @Auth(ValidRoles.administrador)
	// async subtractPointsForCancellation(@Param('userId') userId: string, @Res() res: Response) {
	// 	try {
	// 		await this.rewardsService.subtractPointsForCancellation(userId, res);
	// 	} catch (error) {
	// 		ExceptionHandlerService.handleException(error, res);
	// 	}
	// }

	// @Post('/undelivered/:userId')
	// @Auth(ValidRoles.administrador)
	// async subtractPointsForUndelivered(@Param('userId') userId: string, @Body('count') count: number, @Res() res: Response) {
	// 	try {
	// 		await this.rewardsService.subtractPointsForUndeliveredPackages(userId, count);
	// 	} catch (error) {
	// 		ExceptionHandlerService.handleException(error, res);
	// 	}
	// }

	// @Post('/negative-declaration/:userId')
	// @Auth(ValidRoles.administrador)
	// async subtractPointsForNegativeDeclaration(@Param('userId') userId: string, @Res() res: Response) {
	// 	try {
	// 		await this.rewardsService.subtractPointsForNegativeDeclaration(userId, res);
	// 	} catch (error) {
	// 		ExceptionHandlerService.handleException(error, res);
	// 	}
	// }

	// @Get('/reset-deliveries/:userId')
	// @Auth(ValidRoles.administrador)
	// async resetConsecutiveDeliveries(@Param('userId') userId: string, @Res() res: Response) {
	// 	try {
	// 		await this.rewardsService.resetConsecutiveDeliveries(userId, res);
	// 	} catch (error) {
	// 		ExceptionHandlerService.handleException(error, res);
	// 	}
	// }
}

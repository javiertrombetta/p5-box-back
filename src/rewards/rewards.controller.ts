/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Post, Param, Body, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { RewardsService } from './rewards.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces';
import { ExceptionHandlerService } from '../common/helpers';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
	constructor(private readonly rewardsService: RewardsService) {}

	@Post('/:userId/:points')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Asignar puntos', description: 'Este endpoint requiere autenticación y rol de administrador.' })
	@ApiParam({ name: 'userId', type: 'string', required: true, description: 'UUID del usuario a asignar puntos', example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiParam({ name: 'points', type: 'number', required: true, description: 'Cantidad de puntos a asignar', example: 100 })
	@ApiResponse({ status: 200, description: 'Puntos asignados correctamente.' })
	@ApiResponse({ status: 400, description: 'Solicitud incorrecta. Parámetros no válidos.' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
	@ApiResponse({ status: 500, description: 'Error del servidor.' })
	@Auth(ValidRoles.administrador)
	async setPoints(@Param('userId') userId: string, @GetUser('id') performerId: string, @Param('points') points: number, @Res() res: Response) {
		await this.rewardsService.setPoints(userId, points, performerId, res);
	}

	@Get('/:userId')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener puntos de usuario', description: 'Este endpoint requiere autenticación y rol de administrador.' })
	@ApiParam({ name: 'userId', type: 'string', required: true, description: 'UUID del usuario a asignar puntos', example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiResponse({ status: 200, description: 'Puntos del usuario obtenidos correctamente.' })
	@ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
	@ApiResponse({ status: 500, description: 'Error del servidor.' })
	@Auth(ValidRoles.administrador)
	async getUserPoints(@Param('userId') userId: string, @Res() res: Response) {
		try {
			const points = await this.rewardsService.getUserPoints(userId);
			res.json({ userId, points });
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}

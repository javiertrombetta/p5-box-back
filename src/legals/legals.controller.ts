import { Controller, Post, Body, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LegalDeclarationsService } from './legals.service';
import { CreateLegalDeclarationDto } from './dto/create-legal-declaration.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';
import { validationMessages } from '../common/constants';

@ApiTags('Legals')
@Controller('legals')
export class LegalDeclarationsController {
	constructor(private readonly legalDeclarationsService: LegalDeclarationsService) {}

	@Post('/declaration')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crear una declaración legal', description: 'Este endpoint requiere autenticación y tener rol repartidor.' })
	@ApiBody({ type: CreateLegalDeclarationDto })
	@ApiResponse({ status: HttpStatus.OK, description: 'Declaración legal creada exitosamente.' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos no válidos para la declaración legal.' })
	@Auth(ValidRoles.repartidor)
	async createDeclaration(@Body() createLegalDeclarationDto: CreateLegalDeclarationDto, @GetUser() user: User, @Res() res: Response) {
		try {
			const result = await this.legalDeclarationsService.handleDeclaration(user.id.toString(), createLegalDeclarationDto, res);
			res.status(HttpStatus.OK).json(result);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}

	@Get('/user/:userId')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener declaraciones por usuario', description: 'Este endpoint requiere autenticación y tener rol administrador.' })
	@ApiParam({ name: 'userId', type: 'string', required: true, description: 'Identificador único del usuario', example: '550e8400-e29b-41d4-a716-446655440000' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Declaraciones legales del usuario obtenidas correctamente.' })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No se encontraron declaraciones legales para el usuario especificado.' })
	@Auth(ValidRoles.administrador)
	async getDeclarationsByUser(@Param('userId') userId: string, @Res() res: Response) {
		try {
			const declarations = await this.legalDeclarationsService.findByUserId(userId);
			if (!declarations || declarations.length === 0) {
				return res.status(HttpStatus.NOT_FOUND).json({ message: validationMessages.legals.notFound });
			}
			res.status(HttpStatus.OK).json(declarations);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}

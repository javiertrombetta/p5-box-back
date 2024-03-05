import { Controller, Post, Body, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LegalDeclarationsService } from './legals.service';
import { CreateLegalDeclarationDto } from './dto/create-legal-declaration.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';
import { ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from '../common/helpers/exception-handler.service';
import { validationMessages } from '../common/constants';

@ApiTags('Legals')
@Controller('legals')
export class LegalDeclarationsController {
	constructor(private readonly legalDeclarationsService: LegalDeclarationsService) {}

	@Post('/declaration')
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

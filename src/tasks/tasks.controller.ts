import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { TasksService } from './tasks.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExceptionHandlerService } from 'src/common/helpers';
@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
	constructor(private tasksService: TasksService) {}

	@Get()
	@ApiOperation({
		summary: 'Ejecutar tareas de CRON',
		description:
			'Este endpoint se utiliza para ejecutar manualmente las tareas de CRON para propósitos de desarrollo o pruebas. Debe usarse con precaución en entornos de producción.',
	})
	async runCronManually(@Res() res: Response) {
		try {
			const result = await this.tasksService.handleCron();
			res.json(result);
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}

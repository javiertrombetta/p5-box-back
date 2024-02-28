import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class StartDayDto {
	@Prop({ type: [{ type: String, ref: 'Package' }] })
	@ApiProperty()
	packages: string[];
}

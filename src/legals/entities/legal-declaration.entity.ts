import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { validationMessages } from '../../common/constants';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class LegalDeclaration extends mongoose.Document {
	@Prop({ type: String, default: () => uuidv4() })
	_id: string;

	@Prop({ type: String, ref: validationMessages.mongoose.users })
	userId: string;

	@Prop({ required: true })
	hasConsumedAlcohol: boolean;

	@Prop({ required: true })
	isUsingPsychoactiveDrugs: boolean;

	@Prop({ required: true })
	hasEmotionalDistress: boolean;

	@Prop({ default: Date.now })
	createdAt: Date;
}

export const LegalDeclarationSchema = SchemaFactory.createForClass(LegalDeclaration);

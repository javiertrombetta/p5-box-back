import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';


export class CreatePackageDto {

   @IsOptional()
   @IsNotEmpty()
   @IsString()
   deliveryFullname: string;

   @IsOptional()
   @IsNotEmpty()
   @IsString()
   deliveryAddress: string;

   @IsOptional()
   @IsNotEmpty()
   @IsNumber()
   deliveryWeight: number;

   @IsOptional()
   @IsNotEmpty()
   @IsDate()
   daliveryDate: Date;

   @IsOptional()
   @IsNotEmpty()
   @IsString()
   @IsUUID()
   deliveryMan?: string;

   @IsOptional()
   @IsNotEmpty()
   @IsString()
   @IsEnum({ disponible:"disponible",pendiente: 'pendiente', en_curso: 'en curso', entregado: 'entregado' })
   state?: string;

}

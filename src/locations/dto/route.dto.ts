import { ApiProperty } from '@nestjs/swagger';

export class RouteDto {
	@ApiProperty({ example: '12345', description: 'Identificador único del paquete.' })
	packageId: string;

	@ApiProperty({ example: 40.714, description: 'Latitud del destino.' })
	destinationLatitude: number;

	@ApiProperty({ example: -74.006, description: 'Longitud del destino.' })
	destinationLongitude: number;

	@ApiProperty({ example: 'Calle Principal 123, Ciudad, País', description: 'Dirección de destino.' })
	destinationAddress: string;

	@ApiProperty({ example: 5, description: 'Estimación de la distancia en kilómetros.' })
	distanceInKm: number;

	@ApiProperty({ example: 10, description: 'Estimación del tiempo de llegada en minutos.' })
	etaInMinutes: number;
}

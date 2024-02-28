import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Response } from 'express';
import { PackagesService } from '../packages/packages.service';
import axios from 'axios';
import { ExceptionHandlerService } from '../common/helpers';
import { validationMessages } from '../common/constants';

@Injectable()
export class LocationsService {
	constructor(private packagesService: PackagesService) {}

	async getPackageLocation(packageId: string, res: Response): Promise<any> {
		const pkg = await this.packagesService.findById(packageId);

		if (!pkg) throw new NotAcceptableException(validationMessages.packages.error.packageNotFound);

		const address = pkg.deliveryAddress;
		const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

		try {
			const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`);
			if (response.data.status === validationMessages.maps.success.statusOk && response.data.results[0]) {
				const location = response.data.results[0].geometry.location;
				return location;
			} else {
				throw new Error(validationMessages.maps.error.statusError + response.data.status);
			}
		} catch (error) {
			ExceptionHandlerService.handleException(error, res);
		}
	}
}

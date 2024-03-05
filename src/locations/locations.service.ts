import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Location } from './entities';
import { PackagesService } from '../packages/packages.service';
import { LocationDto } from './dto/locations.dto';
import { validationMessages } from '../common/constants';

@Injectable()
export class LocationsService {
	constructor(
		private packagesService: PackagesService,
		@InjectModel(Location.name) private locationModel: mongoose.Model<Location>,
	) {}

	async getRoute(originLatitude: number, originLongitude: number, packageId: string): Promise<any> {
		const pkg = await this.packagesService.findById(packageId);

		if (!pkg) throw new NotFoundException(validationMessages.packages.error.packageNotFound);

		const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
		const destinationAddress = pkg.deliveryAddress;

		try {
			const response = await axios.post(
				`https://routes.googleapis.com/directions/v2:computeRoutes`,
				{
					origin: {
						location: {
							latLng: {
								latitude: originLatitude,
								longitude: originLongitude,
							},
						},
					},
					destination: {
						address: destinationAddress,
					},
					travelMode: process.env.GOOGLE_TRAVEL_MODE,
					routingPreference: process.env.GOOGLE_ROUTING_PREFERENCE,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'X-Goog-Api-Key': googleMapsApiKey,
						'X-Goog-FieldMask': process.env.GOOGLE_RESPONSE_FILEDS,
					},
				},
			);

			if (response.data.routes && response.data.routes.length > 0) {
				return response.data.routes[0];
			} else {
				throw new HttpException(validationMessages.maps.route.notFound, HttpStatus.BAD_REQUEST);
			}
		} catch (error) {
			if (error.response.data === undefined) {
				throw new HttpException(validationMessages.maps.route.notFound, HttpStatus.BAD_REQUEST);
			} else {
				console.error(error.response.data);
				throw new HttpException(validationMessages.maps.route.apiError, HttpStatus.SERVICE_UNAVAILABLE);
			}
		}
	}

	async updateUserLocation(userId: string, locationDto: LocationDto): Promise<Location> {
		const { latitude, longitude } = locationDto;
		const updatedLocation = await this.locationModel.findOneAndUpdate({ userId }, { $set: { latitude, longitude } }, { new: true, upsert: true });
		return updatedLocation;
	}

	async getLastUserLocation(userId: string): Promise<Location | null> {
		return await this.locationModel.findOne({ userId }).sort({ createdAt: -1 }).exec();
	}
}

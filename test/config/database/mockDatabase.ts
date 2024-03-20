// import { MongoMemoryServer } from 'mongodb-memory-server';
// import mongoose from 'mongoose';

// export class MockDatabase {
// 	private static mongoServer: MongoMemoryServer;

// 	public static async start(): Promise<void> {
// 		if (!this.mongoServer) {
// 			this.mongoServer = await MongoMemoryServer.create();
// 		}
// 		const mongoUri = this.mongoServer.getUri();
// 		process.env.MONGODB_URI = mongoUri;
// 		await mongoose.connect(mongoUri);
// 	}

// 	public static async cleanDatabase(): Promise<void> {
// 		const collections = await mongoose.connection.db.collections();

// 		for (const collection of collections) {
// 			await collection.deleteMany({});
// 		}
// 	}

// 	public static async stop(): Promise<void> {
// 		await mongoose.connection.dropDatabase();
// 		await mongoose.connection.close();
// 		await this.mongoServer.stop();
// 	}
// }

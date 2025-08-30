import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): Omit<MongooseModuleOptions, 'uri'> => {
  const dbName = process.env.MONGODB_DATABASE || 'cmgem';

  return {
    dbName: dbName,
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20'), // Increased from 10
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5'),  // Increased from 1
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '3000'), // Reduced from 5000
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '30000'), // Reduced from 45000
    connectTimeoutMS: 10000, // Add connection timeout
    maxIdleTimeMS: 30000,    // Add max idle time
    retryWrites: false,
    retryReads: true,
    readPreference: 'secondaryPreferred', // Add read preference for better performance
    bufferCommands: false, // Disable mongoose buffering
  };
};

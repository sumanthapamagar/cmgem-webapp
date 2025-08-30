import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getDatabaseConfig = (): Omit<MongooseModuleOptions, 'uri'> => {
  const dbName = process.env.MONGODB_DATABASE || 'cmgem';

  return {
    dbName: dbName,
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '1'),
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
    retryWrites: false,
    retryReads: true,
  };
};

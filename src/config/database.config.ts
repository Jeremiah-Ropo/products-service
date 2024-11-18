import { ConfigService } from "@nestjs/config";
import { MongooseModuleFactoryOptions } from "@nestjs/mongoose";

export const databaseConfig = async (
  configService: ConfigService
): Promise<MongooseModuleFactoryOptions> => {
  return {
    uri: configService.get<string>("DATABASE_URL") || ''
  };
};

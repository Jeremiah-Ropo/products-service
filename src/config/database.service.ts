import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  onModuleInit() {
    mongoose.connection.on('connected', () => {
      this.logger.log('Successfully connected to the database');
    });

    mongoose.connection.on('error', (err) => {
      this.logger.error(`Database connection error: ${err}`);
    });
  }
}

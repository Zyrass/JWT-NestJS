import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        auth: {
          username: configService.get('MONGODB_USERNAME'),
          password: configService.get('MONGODB_PASSWORD'),
        },
        uri: `mongodb+srv://${configService.get(
          'MONGODB_CLUSTER_NAME',
        )}.xdeetkl.mongodb.net/${configService.get('MONGODB_DATABASE_NAME')}`,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

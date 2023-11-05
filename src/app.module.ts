import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllowCrossDomainMiddlaware } from './middlewares/allow-cross-domain.middleware';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        auth: {
          username: configService.get('MONGODB_USERNAME'),
          password: configService.get('MONGODB_PASSWORD'),
        },
        uri: `mongodb+srv://${configService.get(
          'MONGODB_CLUSTER_NAME',
        )}.xdeetkl.mongodb.net/${configService.get('MONGODB_DATABASE_NAME')}`,
      }),
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AllowCrossDomainMiddlaware).forRoutes('*');
  }
}

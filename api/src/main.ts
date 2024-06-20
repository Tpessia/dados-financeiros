import { globalMemoizeConfig } from '@/@utils';
import ErrorFilter from '@/core/middlewares/ErrorFilter';
import { FileLogger } from '@/core/middlewares/FileLogger';
import { AppService } from '@/core/services/app.service';
import { BadRequestException, LogLevel, VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Bootstrap

  AppService.init();

  globalMemoizeConfig.cacheDir = AppService.appCacheDir;

  const logLevels: LogLevel[] = process.env.NODE_ENV === 'prod'
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'verbose', 'debug'];

  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(logLevels),
  });

  app.enableCors();

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  app.useGlobalFilters(new ErrorFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true, // instead of stripping non-whitelisted properties validator will throw an exception
      whitelist: true, // validator will strip validated (returned) object of any properties that do not use any validation decorators
      transform: true, // the validator will automatically transform (cast) the incoming data to the expected data types based on validation decorators
      exceptionFactory: (errors) => {
        const result = errors.flatMap(err => Object.values(err.constraints)).join(', ');
        return new BadRequestException(result);
      },
    }),
  );

  await AppService.register(app);

  // Global Swagger

  const swaggerOpts = new DocumentBuilder()
    .setTitle('Dados Financeiros API')
    .setDescription('Dados Financeiros API')
    .setVersion('1.0')
    // .addServer('/')
    // .addApiKey({
    //   type: 'apiKey',
    //   name: 'Authorization',
    //   in: 'header',
    // }, 'apiKey')
    .build();

  const swaggerExpressOpts: SwaggerCustomOptions = {
    customCss: 'https://raw.githubusercontent.com/Amoenus/SwaggerDark/master/SwaggerDark.css',
    swaggerOptions: { // https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
      displayRequestDuration: true,
    }
  };

  const document = SwaggerModule.createDocument(app, swaggerOpts);
  SwaggerModule.setup('/api', app, document, swaggerExpressOpts);

  // Listen

  await app.listen(process.env.PORT, 'localhost', () => {
    const address = app.getHttpServer().address();
    const hostname = address.family === 'IPv6' ? `[${address.address}]` : address.address;
    AppService.addInfo(`Listening on http://${hostname}:${address.port}/api/`);
    AppService.logInfo();
  });
}

bootstrap();

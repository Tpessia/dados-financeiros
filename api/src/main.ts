import { globalMemoizeConfig } from '@/@utils';
import ErrorFilter from '@/core/middlewares/ErrorFilter';
import { FileLogger } from '@/core/middlewares/FileLogger';
import { ConfigService } from '@/core/services/config.service';
import { BadRequestException, LogLevel, VERSION_NEUTRAL, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Bootstrap

  ConfigService.init();

  globalMemoizeConfig.cacheConfig.cacheDir = ConfigService.appDataDir;

  const logLevels: LogLevel[] = process.env.NODE_ENV === 'prod'
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'verbose', 'debug'];

  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(logLevels),
    // cors: true,
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

  await ConfigService.register(app);

  // Global Swagger

  const swaggerOpts = new DocumentBuilder()
    .setTitle('Dados Financeiros')
    .setDescription('GitHub: <a href="https://github.com/Tpessia/dados-financeiros" target="_blank">https://github.com/Tpessia/dados-financeiros</a>\n\nPlatform: <a href="https://InvestTester.com" target="_blank">https://InvestTester.com</a>')
    .setVersion('1.0')
    // .addServer('/')
    // .addApiKey({
    //   type: 'apiKey',
    //   name: 'Authorization',
    //   in: 'header',
    // }, 'apiKey')
    .build();

  const swaggerExpressOpts: SwaggerCustomOptions = {
    customSiteTitle: 'Dados Financeiros',
    // customSwaggerUiPath: '/api/', // TODO: custom html
    customCssUrl: '/api/assets/SwaggerDark.css',
    customfavIcon: '/api/assets/favicon.ico',
    customJsStr: `console.log(123)`,
    swaggerOptions: { // https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
      displayRequestDuration: true,
    },
  };

  if (process.env.NODE_ENV === 'prod')
    swaggerExpressOpts.customfavIcon = '/assets/logo/logo.svg';

  const document = SwaggerModule.createDocument(app, swaggerOpts);
  SwaggerModule.setup('/api', app, document, swaggerExpressOpts);

  // Listen

  await app.listen(process.env.PORT, '0.0.0.0', () => {
    const address = app.getHttpServer().address();
    const hostname = address.family === 'IPv6' ? `[${address.address}]` : address.address;
    ConfigService.addInfo(`Listening on http://${hostname}:${address.port}/api/`);
    ConfigService.logInfo();
  });
}

bootstrap();

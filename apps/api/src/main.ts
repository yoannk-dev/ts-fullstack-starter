import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ts-fullstack-starter — API")
    .setDescription("REST + tRPC API for the ts-fullstack-starter monorepo")
    .setVersion("0.0.1")
    .addApiKey({ type: "apiKey", name: "x-api-key", in: "header" }, "x-api-key")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  app.enableShutdownHooks();

  const port = process.env.PORT ?? "3001";
  await app.listen(port);

  console.log(`API running on http://localhost:${port}`);
  console.log(`Swagger docs on http://localhost:${port}/api/docs`);
  console.log(`tRPC endpoint on http://localhost:${port}/trpc`);
}

void bootstrap();

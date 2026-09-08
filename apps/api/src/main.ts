import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor.js";
import type { Env } from "./env.validation.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Env, true>);

  app.use(helmet());
  app.enableCors({ origin: configService.get("WEB_ORIGIN", { infer: true }) });
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

  const port = configService.get("PORT", { infer: true });
  await app.listen(port);

  console.log(`API running on http://localhost:${String(port)}`);
  console.log(`Swagger docs on http://localhost:${String(port)}/api/docs`);
  console.log(`tRPC endpoint on http://localhost:${String(port)}/trpc`);
}

void bootstrap();

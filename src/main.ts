import './env-loader'; // Load environment variables first
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for GraphQL playground
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📊 GraphQL Playground: http://localhost:${process.env.PORT ?? 3000}/graphql`);
}
bootstrap().catch(console.error);

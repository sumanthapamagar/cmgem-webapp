import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare const module: any

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true })
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true
        })
    )
    const configService = app.get(ConfigService)
    const port = process.env.PORT || configService.get<number>("APP_PORT") || 7080
    await app.listen(port, '0.0.0.0')
    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}
bootstrap()

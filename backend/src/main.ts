import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';

import * as bodyParser from 'body-parser';

declare const module: any

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true })

    // Add compression middleware
    app.use(compression());

    // Add response caching headers
    app.use((req, res, next) => {
        if (req.path.includes('/projects') && req.method === 'GET') {
            res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
        }
        next();
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true
        })
    )

    const configService = app.get(ConfigService)
    const port = process.env.PORT || configService.get<number>("APP_PORT") || 7080

    app.use(bodyParser.json({ limit: '8mb' }));  // increase limit
    app.use(bodyParser.urlencoded({ limit: '8mb', extended: true }));
    

    await app.listen(port, '0.0.0.0')

    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}

bootstrap().catch((error) => {
    console.error('Failed to start application:', error)
    process.exit(1)
})

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

declare const module: any

async function bootstrap() {
    console.log('Starting NestJS application...')
    
    const app = await NestFactory.create(AppModule, { cors: true })
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true
        })
    )
    
    const configService = app.get(ConfigService)
    const port = process.env.PORT || configService.get<number>("APP_PORT") || 7080
    
    console.log(`Environment PORT: ${process.env.PORT}`)
    console.log(`Config APP_PORT: ${configService.get<number>("APP_PORT")}`)
    console.log(`Final port: ${port}`)
    
    await app.listen(port, '0.0.0.0')
    console.log(`Application is running on: http://0.0.0.0:${port}`)
    
    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}

bootstrap().catch((error) => {
    console.error('Failed to start application:', error)
    process.exit(1)
})

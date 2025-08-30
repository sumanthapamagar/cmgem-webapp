import { Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { APP_GUARD } from "@nestjs/core"
import { MicrosoftGraphAuthGuard } from "src/guard"
import { MicrosoftGraphStrategy } from "src/strategy"

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "microsoft-graph-id-token" })
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: MicrosoftGraphAuthGuard
        },
        MicrosoftGraphStrategy
    ]
})
export class AuthModule {}

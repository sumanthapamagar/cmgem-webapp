import { IdTokenClaims } from "@azure/msal-node"
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { BearerStrategy } from "passport-azure-ad"

@Injectable()
export class MicrosoftGraphStrategy extends PassportStrategy(
    BearerStrategy,
    "microsoft-graph"
) {
    constructor(private configService: ConfigService) {
        super({
            identityMetadata: `https://login.microsoftonline.com/${configService.get<string>("MICROSOFT_GRAPH_TENANT_ID")}/v2.0/.well-known/openid-configuration`,
            clientID: configService.get<string>("MICROSOFT_GRAPH_CLIENT_ID"),
            validateIssuer: true,
            issuer: `https://login.microsoftonline.com/${configService.get<string>("MICROSOFT_GRAPH_TENANT_ID")}/v2.0`,
            passReqToCallback: false,
            loggingLevel: "info",
            audience: configService.get<string>("MICROSOFT_GRAPH_CLIENT_ID"), // Ensure the audience matches your client ID
            clockSkew: 300
        })
    }

    async validate(token: IdTokenClaims) {
        if (!token) {
            throw new UnauthorizedException()
        }

        const { aud, iss } = token

        const expectedAud = this.configService.get<string>(
            "MICROSOFT_GRAPH_CLIENT_ID"
        )
        const expectedIss = `https://login.microsoftonline.com/${this.configService.get<string>("MICROSOFT_GRAPH_TENANT_ID")}/v2.0`

        if (aud !== expectedAud) {
            console.error(
                `Invalid audience: expected ${expectedAud}, got ${aud}`
            )
            throw new UnauthorizedException("Invalid audience")
        }

        if (iss !== expectedIss) {
            console.error(`Invalid issuer: expected ${expectedIss}, got ${iss}`)
            throw new UnauthorizedException("Invalid issuer")
        }

        return token
    }
}

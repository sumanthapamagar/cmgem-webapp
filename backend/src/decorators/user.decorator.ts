import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * @User decorator that extracts the ID token from the authorization header
 * Use this in combination with the UserInterceptor for automatic user resolution
 */
export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const authHeader = request.headers.authorization || '';
        
        if (!authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid authorization header format');
        }
        
        const idToken = authHeader.replace('Bearer ', '');
        
        if (!idToken) {
            throw new UnauthorizedException('ID token is required');
        }

        return idToken;
    }
);

/**
 * @UserInfo decorator that extracts the resolved user object from the request
 * This should be used after the UserInterceptor has processed the request
 */
export const GetUserInfo = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;
        
        if (!user) {
            throw new UnauthorizedException('User information not available. Ensure UserInterceptor is applied.');
        }
        
        return {
            name: user.name,
            email: user.email,
            id: user.id,
        };
    }
);

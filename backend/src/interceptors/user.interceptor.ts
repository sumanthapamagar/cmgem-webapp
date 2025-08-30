import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MsGraphService } from '../common/msgraph.service';
import { CurrentUser } from '../types/user.types';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly msGraphService: MsGraphService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization || '';

    // Skip if no authorization header
    if (!authHeader.startsWith('Bearer ')) {
      return next.handle();
    }

    try {
      const idToken = authHeader.replace('Bearer ', '');
      
      if (idToken) {
        // Extract user information from ID token (JWT)
        const user: CurrentUser = await this.msGraphService.getUserFromIdToken(idToken);
        
        // Attach user information to the request object
        request.user = user;
        
        // Also attach the ID token for backward compatibility
        request.idToken = idToken;
      }
    } catch (error) {
      // Log the error but don't fail the request
      // The controller can handle missing user information as needed
      console.warn('Failed to extract user information from ID token:', error.message);
      
      // Optionally, you can throw an UnauthorizedException here if you want
      // to require valid user information for all requests
      // throw new UnauthorizedException('Failed to extract user information from ID token');
    }

    return next.handle();
  }
}

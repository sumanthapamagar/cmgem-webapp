import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { MSGraphUser, CurrentUser } from '../types/user.types';

@Injectable()
export class MsGraphService {
  private readonly logger = new Logger(MsGraphService.name);
  private graphClient: Client;

  constructor(private configService: ConfigService) {
    this.initializeGraphClient();
  }

  private initializeGraphClient() {
    try {
      const tenantId = this.configService.get<string>('MICROSOFT_GRAPH_TENANT_ID');
      const clientId = this.configService.get<string>('MICROSOFT_GRAPH_CLIENT_ID');
      const clientSecret = this.configService.get<string>('MICROSOFT_GRAPH_CLIENT_SECRET');

      if (!tenantId || !clientId || !clientSecret) {
        this.logger.warn('MS Graph configuration incomplete, service will be limited');
        return;
      }

      const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default']
      });

      this.graphClient = Client.initWithMiddleware({
        authProvider: authProvider
      });

      this.logger.log('MS Graph client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize MS Graph client', error);
    }
  }

  /**
   * Extract user information from an ID token (JWT)
   * @param idToken - The ID token from the request header
   * @returns CurrentUser - The current user information
   */
  async getUserFromIdToken(idToken: string): Promise<CurrentUser> {
    try {
      if (!idToken) {
        throw new UnauthorizedException('ID token is required');
      }

      // Decode the JWT token (ID token contains user information)
      const userInfo = this.decodeJwtToken(idToken);
      
      if (!userInfo) {
        throw new UnauthorizedException('Invalid ID token format');
      }

      // Map the ID token claims to our CurrentUser interface
      return this.mapIdTokenToCurrentUser(userInfo);
    } catch (error) {
      this.logger.error('Failed to extract user from ID token', error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Failed to extract user information from ID token');
    }
  }

  /**
   * Fetch user information from MS Graph using an access token
   * @param accessToken - The access token from the request header
   * @returns Promise<CurrentUser> - The current user information
   */
  async getUserFromAccessToken(accessToken: string): Promise<CurrentUser> {
    try {
      if (!accessToken) {
        throw new UnauthorizedException('Access token is required');
      }

      // Create a temporary client with the user's access token
      const userGraphClient = Client.init({
        authProvider: (done) => {
          done(null, accessToken);
        }
      });

      // Fetch the current user's profile
      const user: MSGraphUser = await userGraphClient
        .api('/me')
        .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,companyName,officeLocation,mobilePhone,businessPhones,preferredLanguage,country,state,city,streetAddress,postalCode')
        .get();

      return this.mapMSGraphUserToCurrentUser(user);
    } catch (error) {
      this.logger.error('Failed to fetch user from MS Graph', error);
      
      if (error.status === 401) {
        throw new UnauthorizedException('Invalid or expired access token');
      }
      
      throw new UnauthorizedException('Failed to fetch user information');
    }
  }

  /**
   * Fetch user information by user ID (requires app permissions)
   * @param userId - The user ID to fetch
   * @returns Promise<MSGraphUser> - The user information
   */
  async getUserById(userId: string): Promise<MSGraphUser> {
    try {
      if (!this.graphClient) {
        throw new Error('MS Graph client not initialized');
      }

      const user = await this.graphClient
        .api(`/users/${userId}`)
        .select('id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,companyName,officeLocation,mobilePhone,businessPhones,preferredLanguage,country,state,city,streetAddress,postalCode')
        .get();

      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user by ID: ${userId}`, error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  /**
   * Decode a JWT token and extract the payload
   * @param token - The JWT token to decode
   * @returns any - The decoded token payload
   */
  private decodeJwtToken(token: string): any {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
      
      return JSON.parse(decodedPayload);
    } catch (error) {
      this.logger.error('Failed to decode JWT token', error);
      return null;
    }
  }

  /**
   * Map ID token claims to our CurrentUser interface
   * @param idTokenClaims - The claims from the ID token
   * @returns CurrentUser - The mapped user object
   */
  private mapIdTokenToCurrentUser(idTokenClaims: any): CurrentUser {
    return {
      id: idTokenClaims.sub || idTokenClaims.oid || '',
      name: idTokenClaims.name || idTokenClaims.preferred_username || 'Unknown User',
      email: idTokenClaims.email || idTokenClaims.preferred_username || '',
      upn: idTokenClaims.preferred_username || idTokenClaims.upn || '',
      jobTitle: idTokenClaims.job_title || idTokenClaims.title || '',
      department: idTokenClaims.department || '',
      company: idTokenClaims.company_name || idTokenClaims.organization || '',
      location: idTokenClaims.office_location || '',
      phone: idTokenClaims.phone_number || '',
      language: idTokenClaims.locale || '',
      address: {
        country: idTokenClaims.country || '',
        state: idTokenClaims.state || '',
        city: idTokenClaims.city || '',
        street: idTokenClaims.street_address || '',
        postalCode: idTokenClaims.postal_code || ''
      }
    };
  }

  /**
   * Map MS Graph user to our CurrentUser interface
   * @param msGraphUser - The user object from MS Graph
   * @returns CurrentUser - The mapped user object
   */
  private mapMSGraphUserToCurrentUser(msGraphUser: MSGraphUser): CurrentUser {
    return {
      id: msGraphUser.id,
      name: msGraphUser.displayName,
      email: msGraphUser.mail,
      upn: msGraphUser.userPrincipalName,
      jobTitle: msGraphUser.jobTitle,
      department: msGraphUser.department,
      company: msGraphUser.companyName,
      location: msGraphUser.officeLocation,
      phone: msGraphUser.mobilePhone || (msGraphUser.businessPhones && msGraphUser.businessPhones[0]),
      language: msGraphUser.preferredLanguage,
      address: {
        country: msGraphUser.country,
        state: msGraphUser.state,
        city: msGraphUser.city,
        street: msGraphUser.streetAddress,
        postalCode: msGraphUser.postalCode
      }
    };
  }

  /**
   * Validate if an ID token is valid by attempting to decode it
   * @param idToken - The ID token to validate
   * @returns Promise<boolean> - True if token is valid
   */
  async validateIdToken(idToken: string): Promise<boolean> {
    try {
      const decoded = this.decodeJwtToken(idToken);
      return !!decoded;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate if an access token is valid by attempting to fetch user info
   * @param accessToken - The access token to validate
   * @returns Promise<boolean> - True if token is valid
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserFromAccessToken(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}

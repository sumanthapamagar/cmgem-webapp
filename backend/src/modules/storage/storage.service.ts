import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';

export interface FileUploadResult {
  success: boolean;
  blob_name: string;
  container_name: string;
  url: string;
  size: number;
  content_type: string;
  created_at: Date;
}

@Injectable()
export class StorageService {
  private blobServiceClient: BlobServiceClient;
  private accountName: string;
  private accountKey: string;

  constructor(
    private configService: ConfigService,
  ) {
    const accountName = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_NAME');
    const accountKey = this.configService.get<string>('AZURE_STORAGE_ACCOUNT_KEY');

    if (!accountName || !accountKey) {
      throw new Error('Azure Storage credentials not configured');
    }

    this.accountName = accountName;
    this.accountKey = accountKey;

    const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      credential
    );
  }

  async getFile(containerName: string, blobName: string): Promise<Buffer> {
    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    return await blobClient.downloadToBuffer();
  }

  async generateContainerSASToken(
    containerName: string,
    expiryHours: number = 24
  ): Promise<string> {
    try {
      // Generate read-only SAS token for the entire container
      const sasToken = await this.generateReadOnlyContainerSasToken(
        containerName,
        expiryHours
      );

      return sasToken;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to generate container SAS token: ${error.message}`);
    }
  }

  async uploadFile(
    containerName: string,
    blobName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<FileUploadResult> {
    try {
      if (!blobName || !fileBuffer) {
        throw new BadRequestException('Blob name and file buffer are required');
      }

      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(containerName);

      // Get blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload the file
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      // Build the URL
      const url = `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobName}`;
      console.log(url);
      return {
        success: true,
        blob_name: blobName,
        container_name: containerName,
        url: url,
        size: fileBuffer.length,
        content_type: contentType,
        created_at: new Date()
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to upload file to storage: ${error.message}`);
    }
  }


  private async generateReadOnlyContainerSasToken(
    containerName: string,
    expiryHours: number = 24
  ): Promise<string> {
    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setHours(expiresOn.getHours() + expiryHours);

    // Only read permissions for read-only access

    const sasOptions = {
      containerName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn,
      expiresOn,
      version: '2024-11-04',
      cacheControl: 'no-cache',
    };

    return generateBlobSASQueryParameters(
      sasOptions,
      this.blobServiceClient.credential as StorageSharedKeyCredential
    ).toString();
  }
}



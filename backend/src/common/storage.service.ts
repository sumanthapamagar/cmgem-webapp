import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    BlobSASPermissions,
    SASProtocol,
    generateBlobSASQueryParameters
} from "@azure/storage-blob";

export class StorageService {
    private sharedKeyCredential: StorageSharedKeyCredential;
    private client: BlobServiceClient;

    constructor() {
        const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        const key = process.env.AZURE_STORAGE_ACCOUNT_KEY;
        
        if (!account || !key) {
            throw new Error('Azure Storage credentials not configured');
        }
        
        this.sharedKeyCredential = new StorageSharedKeyCredential(account, key);
        this.client = new BlobServiceClient(
            `https://${account}.blob.core.windows.net`,
            this.sharedKeyCredential
        );
    }

    async getSASToken(containerName: string) {
        const { blobName, blobClient, expiryDate, permissions } =
            this.createBlobClient(containerName);
        const blobUrl = await blobClient.generateSasUrl({
            permissions,
            expiresOn: expiryDate
        });
        const sasToken = this.generateSasToken(
            containerName,
            blobName,
            permissions,
            expiryDate
        );
        return { blobName, blobUrl, sasToken: sasToken.toString() };
    }

    async getFileContents(container: string, name: string) {
        const containerClient = this.client.getContainerClient(container);
        const blobClient = containerClient.getBlobClient(name);
        const contents = await blobClient.downloadToBuffer();
        return Buffer.from(contents).toString("base64");
    }

    async createFile(
        container: string,
        name: string,
        contents: Buffer,
        generateSasUrl = true
    ) {
        const containerClient = this.client.getContainerClient(container);
        const blockBlobClient = containerClient.getBlockBlobClient(name);
        const res = await blockBlobClient.uploadData(contents);
        if (generateSasUrl) {
            const blobClient = containerClient.getBlobClient(name);
            return await blobClient.generateSasUrl({
                permissions: BlobSASPermissions.parse("r"),
                expiresOn: new Date(Date.now() + 1000 * 60 * 60 * 24)
            });
        }
        return res;
    }

    private createBlobClient(containerName: string) {
        const containerClient = this.client.getContainerClient(containerName);
        const blobName = new Date().toISOString();
        const blobClient = containerClient.getBlobClient(blobName);
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 60);
        const permissions = BlobSASPermissions.parse("racwd");
        return { blobName, blobClient, expiryDate, permissions };
    }

    private generateSasToken(
        containerName: string,
        blobName: string,
        permissions: BlobSASPermissions,
        expiryDate: Date
    ) {
        return generateBlobSASQueryParameters(
            {
                containerName,
                blobName,
                permissions,
                startsOn: new Date(),
                expiresOn: expiryDate,
                protocol: SASProtocol.HttpsAndHttp
            },
            this.sharedKeyCredential
        );
    }
}

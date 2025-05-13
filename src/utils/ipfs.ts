import { ThirdwebStorage } from "@thirdweb-dev/storage";

const storage = new ThirdwebStorage({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  secretKey: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY // Only use in server-side code
});

export async function uploadToIPFS(file: File): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
      throw new Error("Thirdweb client ID not configured");
    }

    console.log("Uploading file to IPFS...");
    const uri = await storage.upload(file, {
      uploadWithGatewayUrl: true,
      uploadWithoutDirectory: true
    });
    
    console.log("File uploaded successfully:", uri);
    return uri;
  } catch (error) {
    console.error("Detailed upload error:", error);
    if (error instanceof Error) {
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
    throw new Error("Failed to upload file to IPFS");
  }
}

export async function uploadMetadataToIPFS(metadata: {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}): Promise<string> {
  try {
    const uri = await storage.upload(metadata);
    const url = storage.resolveScheme(uri);
    return url;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}
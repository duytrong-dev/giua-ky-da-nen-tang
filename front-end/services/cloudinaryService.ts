import { API_ENDPOINTS } from "@/constants/api";
import { apiService } from "./apiService";

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  try {
    const response = await apiService.uploadFile(API_ENDPOINTS.CLOUDINARY.UPLOAD, {
      uri: localUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    console.log(response.url);
    return response.url;
  } catch (error) {
    // Fallback to direct Cloudinary upload if backend fails
    const CLOUD_NAME = "dxppwztkj";
    const UPLOAD_PRESET = "upload_preset";
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const fileTypeMatch = /\.(\w+)$/.exec(localUri);
    const ext = fileTypeMatch ? fileTypeMatch[1] : "jpg";
    const type = `image/${ext}`;

    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      type: type,
      name: `upload.${ext}`,
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload to Cloudinary failed");
    }

    return data.secure_url;
  }
}

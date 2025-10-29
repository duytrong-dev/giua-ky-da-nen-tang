
const CLOUD_NAME = "dxppwztkj";
const UPLOAD_PRESET = "upload_preset";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
 
  // 2. Chuẩn bị file để upload
  // Có 2 cách: gửi URI file hoặc base64
  // Đây dùng FormData với URI (tốt hơn nếu hỗ trợ)
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

  // 3. Gửi request tới Cloudinary
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

  // 4. Trả về URL ảnh đã upload
  return data.secure_url;
}

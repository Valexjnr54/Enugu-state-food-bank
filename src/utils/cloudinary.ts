import cloudinary from "../config/cloudinaryConfig";

export async function uploadImage(imagePath: any, folderPath: any) {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: folderPath,
        });

        const imageURL = result.secure_url;

        return imageURL;
    } catch (error) {
        console.error("Error uploading image:", error);
    }
}

export async function uploadVideo(videoPath: any, folderPath: any) {
    try {
        const result = await cloudinary.uploader.upload(videoPath, {
            resource_type: 'video',
            folder: folderPath
        });

        const videoURL = result.secure_url;
        return videoURL;
    } catch (error) {
        console.error("Error uploading video:", error)
    }
}

export async function uploadFile(filePath: any, folderPath: any) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'raw',
            folder: folderPath
        });

        const fileURL = result.secure_url;
        return fileURL;
    } catch (error) {
        console.error("Error uploading File:", error)
    }
}

export async function deleteImageFromCloudinary(url: string) {
  try {
    const publicId = getCloudinaryPublicId(url); // You must extract the ID
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
  }
}

function getCloudinaryPublicId(url: string): string {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  return `products/${fileName.split(".")[0]}`; // Assumes 'products' folder
}
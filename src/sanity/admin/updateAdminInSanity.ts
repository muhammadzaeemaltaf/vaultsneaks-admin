import { Buffer } from "buffer"; // Polyfill Buffer for client-side usage
import axios from "axios";
import { client } from "../lib/client";

export async function uploadImageToSanity(imageUrl: string) {
  try {
    console.log(`Uploading image: ${imageUrl}`);
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const asset = await client.assets.upload("image", buffer, {
      filename: imageUrl.split("/").pop(),
    });

    console.log(`Image uploaded successfully: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error("Failed to upload image:", imageUrl, error);
    return null;
  }
}

export async function uploadFileToSanity(file: File) {
  try {
    console.log(`Uploading file: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const asset = await client.assets.upload("image", buffer, {
      filename: file.name,
    });
    console.log(`File uploaded successfully: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error("Failed to upload file:", file.name, error);
    return null;
  }
}

export async function updateAdminInSanity(admin: any, file?: File) {
  try {
    let uploadedImageId = typeof admin.profileImage !== "string" ? null : admin.profileImage;
    
    if (file) {
      uploadedImageId = await uploadFileToSanity(file);
    } else if (typeof admin.profileImage === "string" && admin.profileImage.startsWith("image-")) {
      // already an uploaded image
    } else if (typeof admin.profileImage === "string" && admin.profileImage.startsWith("blob:")) {
      console.error("Profile image is a blob URL. Please reselect the image file to upload.")
      uploadedImageId = null;
    } else if (typeof admin.profileImage === "string" && admin.profileImage) {
      uploadedImageId = await uploadImageToSanity(admin.profileImage);
    }
    
    const updatedAdmin = await client
      .patch(admin._id)
      .set({
        username: admin.username,
        email: admin.email,
        password: admin.password,
        // update profileImage field using asset reference if an image was uploaded
        profileImage: uploadedImageId
          ? { _type: "image", asset: { _ref: uploadedImageId } }
          : admin.profileImage,
        // role and createdAt remain unchanged
      })
      .commit();
    
    console.log("Admin updated successfully:", updatedAdmin);
    
    return updatedAdmin;
  } catch (error) {
    console.error("Error updating admin in Sanity:", error);
    return null;
  }
}

export const getUserFromSanity = async (userId: string) => {
    const query = `*[_type == "user" && _id == $userId][0]`;
    const params = { userId };
    const user = await client.fetch(query, params);
    return user || [];
};
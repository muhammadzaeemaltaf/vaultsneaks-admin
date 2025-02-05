import axios from "axios";
import { client } from "../lib/client";
import { ProductFormData } from "@/app/(admin)/products/add/page";
import { getProductByName } from "./getProductByName";

async function uploadImageToSanity(imageUrl: string) {
  try {
    console.log(`Uploading image: ${imageUrl}`);
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const asset = await client.assets.upload('image', buffer, {
      filename: imageUrl.split('/').pop()
    });
    console.log(`Image uploaded successfully: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error('Failed to upload image:', imageUrl, error);
    return null;
  }
}

export const addProduct = async (productData: ProductFormData) => {
  try {
    // Check if a product with the same name already exists
    const existingProducts = await getProductByName(productData.productName);
    if (existingProducts.length > 0) {
      throw new Error("Product with this name already exists.");
    }

    let imageRef = null;
    if (productData.image) {
      imageRef = await uploadImageToSanity(productData.image);
    }

    // Create the product document with the image URL
    const result = await client.create({
      _type: "product",
      ...productData,
      image: imageRef ? {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageRef,
        },
      } : undefined
    });

    return result;
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error;
  }
};

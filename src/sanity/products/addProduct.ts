import axios from "axios";
import { client } from "../lib/client";
import { ProductFormData } from "@/app/(admin)/products/add/page";

export const addProduct = async (productData: ProductFormData) => {
  try {
    let imageUrl = null;

    // If there is an image, upload it first
    if (productData.image) {
      const response = await axios.get(productData.image, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const imageAsset = await client.assets.upload("image", buffer, {
        filename: `${productData.productName}-image`,
      });
      imageUrl = imageAsset.url;
    }

    // Create the product document with the image URL
    const result = await client.create({
      _type: "product",
      ...productData,
      image: imageUrl,
    });

    return result;
  } catch (error) {
    console.error("Failed to add product:", error);
    throw error;
  }
};

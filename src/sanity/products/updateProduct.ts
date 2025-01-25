import axios from "axios";
import { client } from "@/sanity/lib/client";
import { ProductFormData } from "@/app/(admin)/products/edit/page";

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

export const updateProduct = async (productData: ProductFormData, id: string) => {
  if (!productData || !productData.productName) {
    throw new Error("Invalid product data");
  }

  let imageId = productData.image;
  if (productData.image && productData.image.startsWith('data:')) {
    const uploadedImageId = await uploadImageToSanity(productData.image);
    if (uploadedImageId) {
      imageId = uploadedImageId;
    }
  }

  const updatedProduct = {
    _type: "product",
    productName: productData.productName,
    category: productData.category,
    price: productData.price,
    inventory: productData.inventory,
    colors: productData.colors,
    status: productData.status,
    image: imageId,
    description: productData.description,
  };

  try {
    await client
      .patch(id) 
      .set(updatedProduct)
      .commit();
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
};

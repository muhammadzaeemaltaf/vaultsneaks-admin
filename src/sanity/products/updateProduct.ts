import axios from "axios";
import { client } from "@/sanity/lib/client";
import { ProductFormData } from "@/components/EditProduct";

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

async function uploadBase64ImageToSanity(base64Image: string) {
  try {
    const base64Response = await fetch(base64Image);
    const blob = await base64Response.blob();
    const asset = await client.assets.upload('image', blob, {
      filename: 'uploaded_image'
    });
    console.log(`Image uploaded successfully: ${asset._id}`);
    return asset._id;
  } catch (error) {
    console.error('Failed to upload base64 image:', error);
    return null;
  }
}

export const updateProduct = async (productData: ProductFormData, id: string) => {
  if (!productData || !productData.productName) {
    throw new Error("Invalid product data");
  }

  let imageId = productData.image;
  if (typeof productData.image === 'string' && productData.image.startsWith('data:')) {
    const uploadedImageId = await uploadBase64ImageToSanity(productData.image);
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
    image: typeof imageId === 'string' && imageId.startsWith('image-') ? {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageId,
      },
    } : imageId,
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

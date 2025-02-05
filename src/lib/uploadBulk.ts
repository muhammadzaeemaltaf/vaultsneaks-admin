import axios from 'axios';
import { fileURLToPath } from 'url';
import path from 'path';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { client } from '@/sanity/lib/client';

// Load environment variables from .env.local
const __filename = import.meta.url;
const __dirname = path.dirname(new URL(__filename).pathname);

async function uploadImageToSanity(imageUrl: any) {
  try {
    const proxyUrl = `/api/fetchImage?url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(proxyUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const asset = await client.assets.upload('image', buffer, {
      filename: imageUrl.split('/').pop()
    });
    console.log(`Image uploaded successfully: ${asset._id}`);
    return { assetId: asset._id, usedPlaceholder: false };
  } catch (error) {
    console.error('Failed to upload image:', imageUrl, error);
    // Use placeholder image
    const placeholderUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkCQcSxlFCe0NU3wobe98LtfWnaEI-x3UKqQ&s";
    try {
      const proxyUrl = `/api/fetchImage?url=${encodeURIComponent(placeholderUrl)}`;
      const response = await axios.get(proxyUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const asset = await client.assets.upload('image', buffer, {
        filename: placeholderUrl.split('/').pop()
      });
      console.log(`Placeholder image uploaded successfully: ${asset._id}`);
      return { assetId: asset._id, usedPlaceholder: true };
    } catch (placeholderError) {
      console.error('Failed to upload placeholder image:', placeholderUrl, placeholderError);
      return { assetId: null, usedPlaceholder: true };
    }
  }
}

export async function importData(fileBuffer: Buffer, fileType: string, updateLogs: (log: any) => void) {
  try {
    let products: any[] = [];

    if (fileType === 'json') {
      const fileContent = fileBuffer.toString();
      products = JSON.parse(fileContent);
    } else if (fileType === 'csv') {
      const csvContent = fileBuffer.toString();
      const parsed = Papa.parse(csvContent, { header: true });
      products = parsed.data.filter((product: any) => Object.values(product).some(value => value));
    } else if (fileType === 'xlsx') {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      products = XLSX.utils.sheet_to_json(sheet);
    }

    console.log('Migrating data, please wait...');
    console.log('Products:', products);

    const uploadResults: { productName: string; success: boolean; message: string }[] = [];
    const categoryCache: { [key: string]: string } = {}; // Cache to store category references

    for (const product of products) {
      try {
        let imageRef: any = null;
        if (product.image) {
          const { assetId, usedPlaceholder } = await uploadImageToSanity(product.image);
          if (usedPlaceholder) {
            updateLogs({
              product,
              success: false,
              message: `Error uploading Image: Placeholder image used for ${product.productName || 'Product'}`,
            });
          }
          if (assetId) {
            imageRef = assetId;
          }
        }

        if (typeof product.colors === 'string') {
          product.colors = product.colors.split(',').map((c: string) => c.trim());
        }

        if (typeof product.price === 'string') {
          product.price = parseFloat(product.price);
        }
        if (typeof product.inventory === 'string') {
          product.inventory = parseInt(product.inventory, 10);
        }

        let categoryRef = null;
        if (product.category && typeof product.category === 'string') {
          const categoryTitle = product.category.trim();

          if (categoryCache[categoryTitle]) {
            categoryRef = categoryCache[categoryTitle];
          } else {
            const existingCategory = await client.fetch(
              `*[_type=="category" && categoryName == $categoryName][0]`,
              { categoryName: categoryTitle }
            );

            if (existingCategory) {
              categoryRef = existingCategory._id;
              categoryCache[categoryTitle] = existingCategory._id;
            } else {
              const newCategory = await client.create({
                _type: 'category',
                categoryName: categoryTitle,
              });
              categoryRef = newCategory._id;
              categoryCache[categoryTitle] = newCategory._id;
            }
          }
        }

        if (!categoryRef) {
          throw new Error(`Category "${product.category}" could not be created or fetched.`);
        }

        const existingProduct = await client.fetch(
          `*[_type=="product" && productName == $productName][0]`,
          { productName: product.productName }
        );
        if (existingProduct) {
          updateLogs({
            product,
            success: false,
            message: `Product ${product.productName || 'N/A'} already exists`,
          });
          continue;
        }

        const sanityProduct = {
          _type: 'product',
          productName: product.productName,
          category: { _type: 'reference', _ref: categoryRef },
          price: product.price,
          inventory: product.inventory,
          colors: product.colors || [],
          status: product.status,
          description: product.description,
          image: imageRef
            ? { _type: 'image', asset: { _type: 'reference', _ref: imageRef } }
            : undefined,
        };

        await client.create(sanityProduct);
        const log = {
          product,
          success: true,
          message: `Uploaded ${product.productName || 'Product'} successfully`,
        };

        updateLogs(log); // Update logs immediately

      } catch (error) {
        console.error(`Error uploading product: ${product.productName || 'N/A'}`, error);
        const log = {
          product,
          success: false,
          message: `Error uploading ${product.productName || 'Product'}`,
        };

        updateLogs(log); // Update logs immediately
      }
    }
  } catch (error) {
    console.error('Error in migrating data:', error);
  }
}

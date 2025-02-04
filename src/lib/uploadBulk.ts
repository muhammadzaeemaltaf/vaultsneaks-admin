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
    return asset._id;
  } catch (error) {
    console.error('Failed to upload image:', imageUrl, error);
    return null;
  }
}

export async function importData(fileBuffer: Buffer, fileType: string) {
  try {
    let products: any[] = [];

    if (fileType === 'json') {
      const fileContent = fileBuffer.toString();
      products = JSON.parse(fileContent);
    } else if (fileType === 'csv') {
      const csvContent = fileBuffer.toString();
      const parsed = Papa.parse(csvContent, { header: true });
      products = parsed.data;
    } else if (fileType === 'xlsx') {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      products = XLSX.utils.sheet_to_json(sheet);
    }

    console.log('Migrating data, please wait...');
    console.log('Products:', products);

    const uploadResults: { productName: string; success: boolean; message: string }[] = [];

    for (const product of products) {
      try {
        let imageRef = null;
        if (product.image) {
          imageRef = await uploadImageToSanity(product.image);
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

          // Query for existing category
          const existingCategory = await client.fetch(
            `*[_type=="category" && categoryName == $categoryName][0]`,
            { categoryName: categoryTitle }
          );

          if (existingCategory) {
            console.log(`Category "${categoryTitle}" exists with _id: ${existingCategory._id}`);
            categoryRef = existingCategory._id;
          } else {
            console.log(`Category "${categoryTitle}" does not exist. Creating new category...`);
            const newCategory = await client.create({
              _type: 'category',
              categoryName: categoryTitle,
            });
            categoryRef = newCategory._id;
          }
        }

        const sanityProduct = {
          _type: 'product',
          productName: product.productName,
          category: categoryRef
            ? {
                _type: 'reference',
                _ref: categoryRef,
              }
            : undefined,
          price: product.price,
          inventory: product.inventory,
          colors: product.colors || [],
          status: product.status,
          description: product.description,
          image: imageRef
            ? {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: imageRef,
                },
              }
            : undefined,
        };

        await client.create(sanityProduct);
        uploadResults.push({
          productName: product.productName || 'N/A',
          success: true,
          message: `Uploaded ${product.productName || 'Product'} successfully`,
        });
      } catch (error) {
        console.error(`Error uploading product: ${product.productName || 'N/A'}`, error);
        uploadResults.push({
          productName: product.productName || 'N/A',
          success: false,
          message: `Error uploading ${product.productName || 'Product'}`,
        });
      }
    }

    return uploadResults;
  } catch (error) {
    console.error('Error in migrating data:', error);
  }
}

"use server"

import { read, utils } from "xlsx"
import { Product } from "../sanity.types";



export async function uploadProducts(
  formData: FormData,
): Promise<{ success: boolean; message: string; products?: Product[] }> {
  const file = formData.get("file") as File
  if (!file) {
    return { success: false, message: "No file uploaded" }
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase()
  const buffer = await file.arrayBuffer()

  let products: Product[] = []

  try {
    switch (fileExtension) {
      case "json":
        const jsonText = new TextDecoder().decode(buffer)
        products = JSON.parse(jsonText)
        break
      case "csv":
      case "xlsx":
        const workbook = read(buffer, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        products = utils.sheet_to_json(worksheet)
        break
      default:
        return { success: false, message: "Unsupported file format" }
    }

    // Here you would typically save the products to your database
    // For this example, we'll just return the parsed products
    console.log("Parsed products:", products)

    return {
      success: true,
      message: `Successfully uploaded ${products.length} products`,
      products,
    }
  } catch (error) {
    console.error("Error processing file:", error)
    return { success: false, message: "Error processing file" }
  }
}


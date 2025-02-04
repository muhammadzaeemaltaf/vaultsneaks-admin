import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getAllProducts } from "@/sanity/products/getAllProducts";
import { Product } from "../../sanity.types";
import { urlFor } from "@/sanity/lib/image";

// Fetch products from Sanity
async function fetchProducts() {
   return await getAllProducts();
}

// Helper to load an image as base64
async function loadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Function to download in different formats
export async function downloadProducts(format: "json" | "csv" | "xlsx" | "pdf") {
  const products = await fetchProducts();

  if (format === "json") {
    // JSON Export
    const jsonData = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    saveAs(blob, "products.json");
  } else if (format === "csv") {
    // CSV Export
    const csvHeaders = "Product Name,Category,Price,Inventory,Colors,Status,Image,Description,Reviews\n";
    const csvRows = products.map((product: Product) => {
      return `"${product.productName}","${product.category}","${product.price}","${product.inventory}","${product.colors?.join(", ")}","${product.status}","${product.image?.asset?._ref}","${product.description}","${product.reviews?.length || 0} Reviews"`;
    });

    const csvData = csvHeaders + csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    saveAs(blob, "products.csv");
  } else if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map((product: Product) => ({
        ...product,
        colors: product.colors?.join(", "),
        image: product.image?.asset?._ref || "N/A",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "products.xlsx");
  } else if (format === "pdf") {
    // Preload images for products
    const productsWithImages = await Promise.all(
      products.map(async (product:Product) => {
        if (product.image?.asset?._ref) {
          const imageUrl = urlFor(product.image).url();
          try {
            const base64 = await loadImageAsBase64(imageUrl);
            return { ...product, imageData: base64 };
          } catch {
            return { ...product, imageData: null };
          }
        }
        return { ...product, imageData: null };
      })
    );

    // PDF Export formatted for A4 landscape pages
    const doc = new jsPDF("l", "mm", "a4"); // changed orientation to landscape
    doc.setFontSize(14);
    doc.text("Product List", 14, 15);

    // Build table data without reviews column and with blank Colors cell for custom drawing
    const tableData = productsWithImages.map((product) => [
      product.productName,
      product.category,
      product.price,
      product.inventory,
      "",       // leave Colors cell empty for custom dots
      product.status,
      "",       // image column left blank for custom drawing
      product.description,
    ]);

    (doc as any).autoTable({
      head: [[
        "Product Name", "Category", "Price", "Inventory",
        "Colors", "Status", "Image", "Description"
      ]],
      body: tableData,
      startY: 25,
      margin: { left: 4, right: 4 },
      styles: { fontSize: 8, cellWidth: "wrap", overflow: "linebreak", minCellHeight: 14 },
      columnStyles: { 6: { cellWidth: 24 }, 7: { cellWidth: 60 } },
      theme: "grid",
      headStyles: { 
        fillColor: [211, 211, 211], // light gray background
        textColor: [0, 0, 0],       // black text
        fontStyle: "bold",         // increased weight
        fontSize: 10               // increased text size
      },
      didParseCell: function (data: any) {
        if (data.cell.section === "body") {
          // For Product Name (index 0) and Category (index 1) columns - break after 3 words
          if (data.column.index === 0 || data.column.index === 1) {
            const text = data.cell.text[0] || "";
            const words = text.split(" ");
            let newText = "";
            for (let i = 0; i < words.length; i++) {
              newText += words[i] + " ";
              if ((i + 1) % 3 === 0 && i !== words.length - 1) {
                newText += "\n";
              }
            }
            data.cell.text = [newText.trim()];
          }
          // Existing logic for Description column (index 7)
          else if (data.column.index === 7) {
            const text = data.cell.text[0] || "";
            const words = text.split(" ");
            let newText = "";
            for (let i = 0; i < words.length; i++) {
              newText += words[i] + " ";
              if ((i + 1) % 2 === 0 && i !== words.length - 1) {
                newText += "\n";
              }
            }
            data.cell.text = [newText.trim()];
          }
          // For Colors column (index 4), clear default text
          else if (data.column.index === 4) {
            data.cell.text = [""];
          }
        }
      },
      didDrawCell: function (data: any) {
        // Updated logic to draw color dots with a new line after 2 dots
        if (data.column.index === 4 && data.cell.section === "body") {
          const prod = productsWithImages[data.row.index];
          if (prod && prod.colors?.length) {
            // Helper to parse color string to RGB
            const parseColor = (color: string): [number, number, number] => {
              if (color.startsWith("#") && color.length === 7) {
                const r = parseInt(color.substr(1, 2), 16);
                const g = parseInt(color.substr(3, 2), 16);
                const b = parseInt(color.substr(5, 2), 16);
                return [r, g, b];
              } else {
                const colorsMap: { [key: string]: [number, number, number] } = {
                  black: [0, 0, 0],
                  white: [255, 255, 255],
                  red: [255, 0, 0],
                  green: [0, 128, 0],
                  blue: [0, 0, 255],
                  gray: [128, 128, 128],
                  grey: [128, 128, 128],
                  yellow: [255, 255, 0],
                  orange: [255, 165, 0],
                  purple: [128, 0, 128],
                };
                return colorsMap[color.toLowerCase()] || [0, 0, 0];
              }
            };

            prod.colors.forEach((color: string, index: number) => {
              // Compute row and column position: 2 dots per row
              const rowIndex = Math.floor(index / 2);
              const colIndex = index % 2;
              const dotX = data.cell.x + 2 + colIndex * 6;
              const dotY = data.cell.y + 2 + rowIndex * 6;
              const [r, g, b] = parseColor(color);
              doc.setFillColor(r, g, b);
              doc.setDrawColor(0, 0, 0);   // black border
              doc.setLineWidth(0.3);
              // Draw a dot with reduced radius 1.5
              doc.circle(dotX + 2, dotY, 1.5, 'FD');
            });
          }
        }
        // Existing logic for drawing images in column 6
        if (data.column.index === 6 && data.cell.section === "body") {
          const prod = productsWithImages[data.row.index];
          if (prod && prod.imageData) {
            doc.addImage(prod.imageData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 10, 10);
          }
        }
      },
    });
    doc.save("products.pdf");
  }
}

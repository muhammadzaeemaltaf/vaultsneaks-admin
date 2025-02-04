import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getAllCategories } from "@/sanity/category/getAllCategories";

// Function to download categories in different formats
export async function downloadCategories(
  format: "json" | "csv" | "xlsx" | "pdf"
) {
  const categories = await getAllCategories();

  if (format === "json") {
    const jsonData = JSON.stringify(categories, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    saveAs(blob, "categories.json");
  } else if (format === "csv") {
    const csvHeaders = "Category Name,OtherFields\n"; // adjust headers accordingly
    const csvRows = categories.map(
      (cat: any) => `"${cat.categoryName || ""}","${cat.otherField || ""}"`
    );
    const csvData = csvHeaders + csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    saveAs(blob, "categories.csv");
  } else if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(categories);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "categories.xlsx");
  } else if (format === "pdf") {
    // New pdf export using jsPDF and autoTable
    const doc = new jsPDF();
    doc.text("Categories", 14, 15);
    const rows = categories.map((cat: any, index: number) => [
      index + 1,
      cat.categoryName || "",
    ]);
    (doc as any).autoTable({
      head: [["Index", "Category Name"]],
      body: rows,
      startY: 20,
      headStyles: {
        fillColor: [211, 211, 211], // light gray background
        textColor: [0, 0, 0],       // black text
        fontStyle: "bold",         // increased weight
        fontSize: 10               // increased text size
      }
    });
    doc.save("categories.pdf");
  }
}

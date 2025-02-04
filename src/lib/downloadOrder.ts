import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getAllOrders } from "@/sanity/orders/getAllOrders";

export async function downloadOrders(format: "json" | "csv" | "xlsx" | "pdf") {
  const orders = await getAllOrders();

  if (format === "json") {
    const jsonData = JSON.stringify(orders, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    saveAs(blob, "orders.json");
  } else if (format === "csv") {
    // CSV Export updated for order id, total, order date, and estimated delivery date
    const csvHeaders =
      "Order ID,Customer Name,Status,Total,Order Date,Estimated Delivery Date\n";
    const csvRows = orders.map(
      (order: any) =>
        `"${order.orderNumber || ""}","${order.customerName || ""}","${order.status || ""}","${order.totalPrice || ""}","${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ""}","${order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : ""}"`
    );
    const csvData = csvHeaders + csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    saveAs(blob, "orders.csv");
  } else if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "orders.xlsx");
  } else if (format === "pdf") {
    const doc = new jsPDF();
    doc.text("Orders", 14, 15);
    // PDF rows updated to include only order id, total, order date and estimated delivery date.
    const rows = orders.map((order: any, index: number) => [
      index + 1,
      order.orderNumber || "",
      order.customerName || "",
      order.totalPrice || "",
      order.status || "",
      order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "",
      order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toLocaleDateString()
        : "",
    ]);
    (doc as any).autoTable({
      head: [
        [
          "#",
          "Order ID",
          "Customer Name",
          "Total",
          "Status",
          "Order Date",
          "Estimated Delivery Date",
        ],
      ],
      body: rows,
      startY: 20,
      headStyles: {
        fillColor: [211, 211, 211], // light gray background
        textColor: [0, 0, 0], // black text
        fontStyle: "bold", // increased weight
        fontSize: 10, // increased text size
      },
    });
    doc.save("orders.pdf");
  }
}

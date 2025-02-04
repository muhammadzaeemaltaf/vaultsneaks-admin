import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getAllUsers } from "@/sanity/user/getAllUsers"; // assume this exists
import { urlFor } from "@/sanity/lib/image"; // new import

// Add helper function to load image as base64
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

export async function downloadUsers(
  format: "json" | "csv" | "xlsx" | "pdf"
) {
  const users = await getAllUsers();

  if (format === "json") {
    const jsonData = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    saveAs(blob, "users.json");
  } else if (format === "csv") {
    const csvHeaders = "User ID,Name,Email,Gender,Country,Registered Date,Status\n";
    const csvRows = users.map((user: any) =>
      `"${user._id || ""}","${user.firstName || ""} ${user.lastName || ""}","${user.email || ""}","${user.gender || ""}","${user.country || ""}","${user._createdAt ? new Date(user._createdAt).toLocaleDateString() : ""}","${user.isActive ? "Active" : "Inactive"}"`
    );
    const csvData = csvHeaders + csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    saveAs(blob, "users.csv");
  } else if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(
      users.map((user: any) => ({
        "User ID": user._id || "",
        "Name": `${user.firstName || ""} ${user.lastName || ""}`,
        "Email": user.email || "",
        "Gender": user.gender || "",
        "Country": user.country || "",
        "Registered Date": user._createdAt ? new Date(user._createdAt).toLocaleDateString() : "",
        "Status": user.isActive ? "Active" : "Inactive"
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob(
      [excelBuffer],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );
    saveAs(blob, "users.xlsx");
  } else if (format === "pdf") {
    const doc = new jsPDF();
    doc.text("Users", 14, 15);
    // Load images for each user
    const usersWithImages = await Promise.all(
      users.map(async (user: any) => {
        if (user.profilePicture) {
          const imageUrl = urlFor(user.profilePicture).url();
          try {
            const base64 = await loadImageAsBase64(imageUrl);
            return { ...user, imageData: base64 };
          } catch {
            return { ...user, imageData: null };
          }
        }
        return { ...user, imageData: null };
      })
    );

    // Prepare rows: Remove User ID column; use column index 1 for Image placeholder.
    const rows = usersWithImages.map((user: any, index: number) => [
      index + 1,
      "", // placeholder for image (replaces User ID)
      `${user.firstName || ""} ${user.lastName || ""}`,
      user.email || "",
      user.gender || "",
      user.country || "",
      user._createdAt ? new Date(user._createdAt).toLocaleDateString() : "",
      user.isActive ? "Active" : "Inactive"
    ]);

    (doc as any).autoTable({
      head: [[
        "#",
        "Image",
        "Name",
        "Email",
        "Gender",
        "Country",
        "Registered Date",
        "Status"
      ]],
      body: rows,
      startY: 20,
      margin: { left: 4, right: 4 },
      styles: { minCellHeight: 15 }, // increased row height
      headStyles: {
        fillColor: [211, 211, 211],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 10
      },
      didDrawCell: function (data: any) {
        // When drawing the Image column (now index 1), add the loaded image if available
        if (data.column.index === 1 && data.cell.section === "body") {
          const user = usersWithImages[data.row.index];
          if (user?.imageData) {
            doc.addImage(user.imageData, 'JPEG', data.cell.x + 2, data.cell.y + 2, 10, 10);
          }
        }
      }
    });
    doc.save("users.pdf");
  }
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadProducts } from "../../actions/uploadProducts"
import { Product } from "../../sanity.types"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { importData } from "@/lib/uploadBulk"

export default function BulkProductUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; products?: Product[] } | null>(null)
  const [productLogs, setProductLogs] = useState<any[]>([]);
  const [fileKey, setFileKey] = useState(0);
  const router = useRouter()

  const requiredFields = ["productName", "category", "price", "inventory", "status", "description"];

  const validateProduct = (product: any) => {
    for (const field of requiredFields) {
      if (!product[field]) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProductLogs([]); // Clear previous logs
    const formData = new FormData();
    formData.append("file", file);

    const arrayBuffer = await file.arrayBuffer();
    const extension = file.name.split('.').pop()?.toLowerCase();
    const fileType = extension === 'csv' ? 'csv' : extension === 'xlsx' ? 'xlsx' : 'json';

    try {
      // Callback function to update logs as products are processed
      const updateLogs = (log: any) => {
        // Trigger UI alert if placeholder was used
        if (log.message.includes("Placeholder image used")) {
          setProductLogs(prev => [
            ...prev,
            {
              productName: log.product.productName || 'N/A',
              success: false,
              message: log.message,
            },
          ]);
        } else {
          setProductLogs(prevLogs => [...prevLogs, log]);
        }
      };

      const results = await importData(Buffer.from(arrayBuffer), fileType, (log: any) => {
        if (validateProduct(log.product)) {
          updateLogs(log);
        } else {
          updateLogs({
            productName: log.product.productName || 'N/A',
            success: false,
            message: `Product ${log.product.productName || 'N/A'} is missing required fields`,
          });
        }
      });

      const result = await uploadProducts(formData);
      if (productLogs.some(log => !log.success)) {
        setResult({ success: false, message: "Some products failed to upload" });
      } else {
        setResult(result);
      }
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error uploading products:", error);
      setResult({ success: false, message: "Error uploading products" });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setUploading(false);
    setProductLogs([]);
    setFileKey(prev => prev + 1);
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Bulk Product Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-red-500">Data must and only contain the following fields: productName, category, price, inventory, image(url), colors, status, description</p>
        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          <Input
            key={fileKey}
            type="file"
            accept=".json,.csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
         <div className="w-full flex justify-center space-x-4">
           <Button type="submit" disabled={!file || uploading} className="w-fit">
              {uploading ? "Uploading..." : "Upload Products"}
           </Button>
           <Button type="button" onClick={handleClear} className="w-fit">
              Clear
           </Button>
         </div>
        </form>
        {productLogs.map((log, index) => (
          <Alert key={index} className={`mb-4 ${log.success ? "bg-green-100" : "bg-red-100"}`}>
            <AlertTitle>{log.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{log.message}</AlertDescription>
          </Alert>
        ))}
        {result && (
          <Alert className={result.success ? "bg-green-100" : "bg-red-100"}>
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}


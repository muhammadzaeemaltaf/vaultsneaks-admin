"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadProducts } from "../../actions/uploadProducts"
import { Product } from "../../sanity.types"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export default function BulkProductUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; products?: Product[] } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const result = await uploadProducts(formData)
      setResult(result)
      if (result.success) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error uploading products:", error)
      setResult({ success: false, message: "Error uploading products" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Bulk Product Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            accept=".json,.csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
         <div className="w-full flex justify-center">
         <Button type="submit" disabled={!file || uploading} className="w-fit">
            {uploading ? "Uploading..." : "Upload Products"}
          </Button>
         </div>
        </form>
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


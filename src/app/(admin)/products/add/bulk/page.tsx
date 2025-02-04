import BulkProductUpload from "@/components/BulkProduct";


export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-8">Upload JSON, Excel or CSV file only.</h1>
      <BulkProductUpload />
    </main>
  )
}


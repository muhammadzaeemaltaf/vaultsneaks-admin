"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus } from "lucide-react"
import { getAllCategories } from "@/sanity/category/getAllCategories"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter, useSearchParams } from "next/navigation"
import { toast, ToastContainer } from "react-toastify";
import { getProductByName } from "@/sanity/products/getProductByName"
import { updateProduct } from "@/sanity/products/updateProduct"; // Import updateProduct function
import { urlFor } from "@/sanity/lib/image"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Category, Product } from "../../sanity.types"
  
export interface ProductFormData {
  productName: string
  category: string
  price: number
  inventory: number
  colors: string[]
  status: string
  image: string
  description: string
}

const PRESET_COLORS = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#FFC0CB",
  ]

export default function Edit() {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: "",
    price: 0,
    inventory: 0,
    colors: [],
    status: "Just In",
    image: "",
    description: "",
  })

  const [customColor, setCustomColor] = useState("#000000")
  const [formWidth, setFormWidth] = useState(30) // Initial width percentage
  const [isDragging, setIsDragging] = useState(false)
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();
  const [initialData, setInitialData] = useState<Product | null>(null);
  const searchParams = useSearchParams();
  const name = searchParams.get('name'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    if (name) {
      const fetchProduct = async () => {
        const fetchedProduct = await getProductByName(name);
        if (Array.isArray(fetchedProduct) && fetchedProduct.length > 0) {
          setInitialData(fetchedProduct[0]);
          setFormData({
            productName: fetchedProduct[0].productName || "",
            category: typeof fetchedProduct[0].category === 'string' ? fetchedProduct[0].category : '',
            price: fetchedProduct[0].price || 0,
            inventory: fetchedProduct[0].inventory || 0,
            colors: fetchedProduct[0].colors || [],
            status: fetchedProduct[0].status || "",
            image: typeof fetchedProduct[0].image === 'string' ? fetchedProduct[0].image : fetchedProduct[0].image?.asset?._ref || "",
            description: fetchedProduct[0].description || "",
          });
        } else {
          setInitialData(null);
        }
        setLoadingProduct(false);
      };
      fetchProduct();
    } else {
      setLoadingProduct(false);
    }
  }, [name]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getAllCategories()
      setCategories(categories); 
      setLoadingCategories(false);
    }
    fetchCategories();
  }, [])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newWidth = (e.clientX / window.innerWidth) * 100
      setFormWidth(Math.min(Math.max(newWidth, 10), 90))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleAddColor = (color: string) => {
    if (!formData.colors.includes(color)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, color],
      })
    }
  }

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((color) => color !== colorToRemove),
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target?.result as string })
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updateProduct(formData, initialData._id);
        toast.success("Product updated successfully!");
      } else {
        toast.error("Failed to update product.");
      }
      router.push("/products");
    } catch (error) {
      toast.error("Failed to update product.");
      console.error("Failed to update product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="container mx-auto px-6">
        <div className={`grid grid-cols-[30%_auto] gap-8`}>
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6 py-6">
            <div className="space-y-4">
              {loadingProduct ? (
                <>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    {loadingCategories ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category.categoryName || ''}>
                              {category.categoryName || 'Unknown Category'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="inventory">Inventory</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={formData.inventory}
                        onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Colors</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.colors.map((color, index) => (
                        <div key={index} className="relative group" onClick={() => handleRemoveColor(color)}>
                          <div
                            className="w-8 h-8 rounded-full cursor-pointer border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                          <div className="absolute inset-0 rounded-full bg-black/50 text-white hidden group-hover:flex items-center justify-center cursor-pointer">
                            ×
                          </div>
                        </div>
                      ))}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-8 h-8 rounded-full p-0" type="button">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Add Color</h4>
                              <div className="                              flex flex-wrap gap-2">
                                {PRESET_COLORS.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-8 h-8 rounded-full cursor-pointer border border-gray-200"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleAddColor(color)}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  value={customColor}
                                  onChange={(e) => setCustomColor(e.target.value)}
                                  className="w-16 h-8 p-0 border border-gray-200 rounded"
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => handleAddColor(customColor)}
                                >
                                  Add Custom
                                </Button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">Product Image</Label>
                    <Input id="image" type="file" onChange={handleImageChange} />
                    {formData.image && (
                      <Image
                        src={formData.image}
                        alt="Selected Product Image"
                        width={100}
                        height={100}
                        className="mt-2 rounded border"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner /> : "Update Product"}
            </Button>
          </form>

          {/* Preview Section */}
          <div
            style={{ width: `${formWidth}%` }}
            className="bg-gray-100 p-4 rounded border transition-all"
          >
            <h2 className="text-lg font-bold mb-4">Preview</h2>
            <div className="space-y-4">
              {formData.image && (
                <Image
                  src={formData.image}
                  alt={formData.productName}
                  width={200}
                  height={200}
                  className="rounded border"
                />
              )}
              <h3 className="text-xl font-semibold">{formData.productName}</h3>
              <p className="text-gray-500">{formData.description}</p>
              <div className="text-sm text-gray-700">Category: {formData.category}</div>
              <div className="text-sm text-gray-700">Price: ${formData.price}</div>
              <div className="text-sm text-gray-700">Inventory: {formData.inventory}</div>
              <div className="flex items-center gap-2">
                {formData.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </Suspense>
  )
}



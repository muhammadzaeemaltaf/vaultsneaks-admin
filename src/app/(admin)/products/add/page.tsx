"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus } from "lucide-react"
import { getAllCategories } from "@/sanity/category/getAllCategories"
import { Category } from "../../../../../sanity.types"
import { Skeleton } from "@/components/ui/skeleton"
import { addProduct } from "@/sanity/products/addProduct";
import { useRouter } from "next/navigation"
import { toast, ToastContainer } from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner"

export interface ProductFormData {
  productName: string
  category: { _type: 'reference', _ref: string }
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

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    category: { _type: 'reference', _ref: "" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
      const result = await addProduct(formData);
      toast.success("Product added successfully!");
      router.push("/products");
    } catch (error) {
      toast.error("Failed to add product.");
      console.error("Failed to add product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-6">
      <div className={`grid grid-cols-[30%_auto] gap-8`}>
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            {loadingCategories ? (
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
                      value={formData.category._ref}
                      onValueChange={(value) => setFormData({ ...formData, category: { _type: 'reference', _ref: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
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
                            <div className="flex flex-wrap gap-2">
                              {PRESET_COLORS.map((color) => (
                                <div
                                  key={color}
                                  className="w-6 h-6 rounded-full cursor-pointer border border-gray-200"
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleAddColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-color">Custom Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="custom-color"
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-16 p-1 h-8"
                              />
                              <Button type="button" onClick={() => handleAddColor(customColor)}>
                                Add Custom Color
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="image">Upload Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner /> : "Save Product"}
          </Button>
        </form>

        {/* Preview Section */}
        <div className="border-l p-6 space-y-6 flex items-start flex-col lg:flex-row gap-10">
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden w-72">
            {formData.image ? (
              <Image
                src={formData.image}
                alt={formData.productName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image uploaded</div>
            )}
          </div>

          <div className="space-y-4 overflow-hidden w-full lg:w-1/2 ">
            <h1 className="text-3xl font-bold whitespace-pre-wrap w-1/2 overflow-hidden">{formData.productName || "Product Name"}</h1>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Category:</span>
              <span className="text-sm font-medium">{categories.find(cat => cat._id === formData.category._ref)?.categoryName || "Not set"}</span>
            </div>

            {formData.colors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Available Colors:</span>
                <div className="flex gap-1">
                  {formData.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">Rs: {formData.price.toLocaleString()}</div>
            </div>

            <p className="text-gray-600">{formData.description || "No description available"}</p>

            <div className="flex gap-4">
              <Button className="">Add To Cart</Button>
              <Button variant="outline">Compare</Button>
            </div>
          </div>    
        </div>
      </div>
      <div
        className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize"
        onMouseDown={handleMouseDown}
      />

      <ToastContainer />
    </div>
  )
}


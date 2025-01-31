"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { getAllCategories } from "@/sanity/category/getAllCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { getProductByName } from "@/sanity/products/getProductByName";
import { updateProduct } from "@/sanity/products/updateProduct"; // Import updateProduct function
import { urlFor } from "@/sanity/lib/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Category, Product } from "../../sanity.types";

export interface ProductFormData {
  productName: string;
  category: string | { _type: "reference"; _ref: string };
  price: number;
  inventory: number;
  colors: string[];
  status: string;
  image: string | { _type: "image"; asset: { _type: "reference"; _ref: string } };
  description: string;
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
];

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
  });

  const [customColor, setCustomColor] = useState("#000000");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();
  const [initialData, setInitialData] = useState<Product | null>(null);
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Helper function for image rendering
  const renderImage = () => {
    if (typeof formData.image === "string" && formData.image) {
      return (
        <Image
          src={
            formData.image.startsWith("data:")
              ? formData.image
              : urlFor(formData.image).url()
          }
          alt="Selected Product Image"
          width={100}
          height={100}
          className="mt-2 rounded border"
        />
      );
    } else if (typeof formData.image === "object" && formData.image) {
      return (
        <Image
          src={urlFor(formData.image).url()}
          alt="Selected Product Image"
          width={100}
          height={100}
          className="mt-2 rounded border"
        />
      );
    } else {
      return <div className="text-gray-500">No image uploaded</div>;
    }
  };

  useEffect(() => {
    if (name) {
      const fetchProduct = async () => {
        const fetchedProduct = await getProductByName(decodeURIComponent(name));
        if (Array.isArray(fetchedProduct) && fetchedProduct.length > 0) {
          setInitialData({
            ...fetchedProduct[0],
            category: fetchedProduct[0].category ? { _ref: fetchedProduct[0].category, _type: "reference" } : undefined,
          });
          setFormData({
            productName: fetchedProduct[0].productName || "",
            category: fetchedProduct[0].category || "",
            price: fetchedProduct[0].price || 0,
            inventory: fetchedProduct[0].inventory || 0,
            colors: fetchedProduct[0].colors || [],
            status: fetchedProduct[0].status || "",
            image: fetchedProduct[0].image && fetchedProduct[0].image.asset ? { _type: "image", asset: { _type: "reference", _ref: fetchedProduct[0].image.asset._ref } } : "",
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
      const categories = await getAllCategories();
      setCategories(categories);
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const handleAddColor = (color: string) => {
    if (!formData.colors.includes(color)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, color],
      }));
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color !== colorToRemove),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload an image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Ensure category is formatted correctly
      const category =
        typeof formData.category === "string"
          ? { _type: "reference", _ref: formData.category } as const // Use 'as const' to ensure `_type` is literal
          : formData.category;
  
      // Ensure image is handled properly
      const image =
        typeof formData.image === "string" && formData.image.startsWith("data:")
          ? formData.image // Base64 image for upload
          : formData.image;
  
      if (!category || !image) {
        toast.error("Category or image is missing or invalid.");
        setIsSubmitting(false);
        return;
      }
  
      if (initialData) {
        // Update the product
        await updateProduct(
          {
            ...formData,
            category, // Properly typed category reference
            image: typeof image === "string" ? image : { _type: "image", asset: { _type: "reference", _ref: image.asset._ref } },
          },
          initialData._id
        );
  
        toast.success("Product updated successfully!");
        setTimeout(() => {
          router.push("/products");
        }, 3000);
      } else {
        toast.error("Failed to update product.");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to update product:", error);
      toast.error("An error occurred while updating the product.");
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          productName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    {loadingCategories ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={typeof formData.category === 'string' ? formData.category : formData.category._ref}
                        onValueChange={(value) => setFormData({ ...formData, category: { _type: "reference", _ref: value } })}
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="inventory">Inventory</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={formData.inventory}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inventory: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Colors</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.colors.map((color, index) => (
                        <div
                          key={index}
                          className="relative group"
                          onClick={() => handleRemoveColor(color)}
                        >
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
                          <Button
                            variant="outline"
                            className="w-8 h-8 rounded-full p-0"
                            type="button"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Add Color
                              </h4>
                              <div className="flex flex-wrap gap-2">
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
                                  onChange={(e) =>
                                    setCustomColor(e.target.value)
                                  }
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
                    <Input
                      id="image"
                      type="file"
                      onChange={handleImageChange}
                    />
                    {typeof formData.image === "string" && formData.image && (
                      <Image
                        src={
                          formData.image.startsWith("data:")
                            ? formData.image
                            : urlFor(formData.image).url()
                        }
                        alt="Selected Product Image"
                        width={100}
                        height={100}
                        className="mt-2 rounded border"
                      />
                    )}
                    {typeof formData.image === "object" && formData.image && (
                      <Image
                        src={urlFor(formData.image).url()}
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
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
          <div className="border-l p-6 space-y-6 flex items-start flex-col lg:flex-row gap-10">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden w-72">
              {typeof formData.image === "string" && formData.image ? (
                <Image
                  src={
                    formData.image.startsWith("data:")
                      ? formData.image
                      : urlFor(formData.image).url()
                  }
                  alt={formData.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image uploaded
                </div>
              )}
              {typeof formData.image === "object" && formData.image && (
                <Image
                  src={urlFor(formData.image).url()}
                  alt={formData.productName}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="space-y-4 overflow-hidden w-full lg:w-1/2 ">
              <h1 className="text-3xl font-bold whitespace-pre-wrap overflow-hidden">
                {formData.productName || "Product Name"}
              </h1>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium">
                  {categories.find((cat) => 
                    typeof formData.category === 'object' && cat._id === formData.category._ref
                  )?.categoryName || "Not set"}
                </span>
              </div>

              {formData.colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Available Colors:
                  </span>
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
                <div className="text-2xl font-bold">
                  Rs: {formData.price.toLocaleString()}
                </div>
              </div>

              <p className="text-gray-600">
                {formData.description || "No description available"}
              </p>

              <div className="flex gap-4">
                <Button className="">Add To Cart</Button>
                <Button variant="outline">Compare</Button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize"
        />

        <ToastContainer />
      </div>
    </Suspense>
  );
}

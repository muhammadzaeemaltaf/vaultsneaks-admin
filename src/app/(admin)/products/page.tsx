"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Package,
  Download,
} from "lucide-react";
import { CiBoxes } from "react-icons/ci";
import { RiFileExcel2Line } from "react-icons/ri";
import { BsFiletypeCsv, BsFiletypePdf } from "react-icons/bs";
import { LuFileJson2 } from "react-icons/lu";
import { getAllProducts } from "@/sanity/products/getAllProducts";
import { Product } from "../../../../sanity.types";
import { Skeleton } from "@/components/ui/skeleton";
import SingleProduct from "@/components/SingleProduct";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { toast, ToastContainer } from "react-toastify";
import { updateProduct } from "@/sanity/products/updateProduct";
import { set } from "sanity";
import { downloadProducts } from "@/lib/downloadProducts";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox"; 
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [deleting, setDeleting] = useState(true); // Add loading state
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null); // Add state for selected product
  const [updating, setUpdating] = useState(false); // Add updating state
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  ); // Add state for deleting product ID
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false); // Add bulk deleting state

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setTimeout(async () => {
        const products = await getAllProducts();
        setProducts(products);
        // Remove auto-check of all checkboxes; start with none checked
        setSelectedProductIds([]);
        setLoading(false);
      }, 3000);
    };
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    const products = await getAllProducts();
    setProducts(products);
    // Ensure new products are not auto-selected
    setSelectedProductIds([]);
    setLoading(false);
  };

  const filteredProducts = products.filter((product) =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      if (key in a && key in b) {
        if ((a[key as keyof Product] ?? "") < (b[key as keyof Product] ?? "")) {
          return direction === "ascending" ? -1 : 1;
        }
        if ((a[key as keyof Product] ?? "") > (b[key as keyof Product] ?? "")) {
          return direction === "ascending" ? 1 : -1;
        }
      }
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    return text
      .split(regex)
      .map((part, index) =>
        regex.test(part) ? <mark key={index}>{part}</mark> : part
      );
  };

  const handleRowClick = (event: React.MouseEvent, productId: string) => {
    const targetElement = event.target as HTMLElement;
  
    // Prevent row selection when clicking on checkboxes
    if (targetElement.closest("input[type='checkbox']")) return;
  
    if (targetElement.closest("button") || targetElement.closest(".dropdown-menu"))
      return;
  
    setSelectedProduct(productId);
  };

  const handleDeleteConfirm = async (productId: string) => {
    if (!productId) return;
    setDeletingProductId(productId); // Set deleting product ID
    setDeleting(true);
    try {
      await client.delete(productId);
      const updatedProducts = products.filter(
        (product) => product._id !== productId
      );
      setProducts(updatedProducts);
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product.");
    } finally {
      setDeleting(false);
      setDeletingProductId(null); // Reset deleting product ID
    }
  };

  // const handleUpdateProduct = async (productId: string, updatedData: Product) => {
  //   setUpdating(true);
  //   try {
  //     await updateProduct(updatedData, productId);
  //     const updatedProducts = products.map((product) =>
  //       product._id === productId ? { ...product, ...updatedData } : product
  //     );
  //     setProducts(updatedProducts);
  //     toast.success("Product updated successfully!");
  //   } catch (error) {
  //     console.error("Error updating product:", error);
  //     toast.error("Failed to update product.");
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  const handleCloseSidebar = () => {
    setSelectedProduct(null);
  };

  // Toggle single product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Toggle select all
  const toggleSelectAll = (e:any) => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p._id));
    }
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (!selectedProductIds.length) return;
    setBulkDeleting(true); // Set bulk deleting to true
    try {
      await Promise.all(selectedProductIds.map((id) => client.delete(id)));
      const updatedProducts = products.filter(
        (product) => !selectedProductIds.includes(product._id)
      );
      setProducts(updatedProducts);
      setSelectedProductIds([]);
      toast.success("Selected products deleted successfully!");
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete selected products.");
    } finally {
      setBulkDeleting(false); // Set bulk deleting to false
    }
  };

  return (
    <div className="container mx-auto py-10 px-2 lg:px-4 w-full">
      <div className="flex justify-between flex-col md:flex-row md:flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center justify-start gap-4 w-full md:w-auto">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          <Button variant="outline" size="icon" onClick={refreshProducts}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
          {/* Bulk Delete Button */}
          {selectedProductIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleting} // Disable button when bulk deleting
            >
              {bulkDeleting ? (
                <span className="flex items-center gap-3">
                  <LoadingSpinner /> <span>Deleting...</span>
                </span>
              ) : (
                "Delete Selected"
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center justify-end gap-4 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => requestSort("productName")}>
                Name{" "}
                {sortConfig?.key === "productName" &&
                  (sortConfig.direction === "ascending" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  ))}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort("category")}>
                Category{" "}
                {sortConfig?.key === "category" &&
                  (sortConfig.direction === "ascending" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  ))}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort("price")}>
                Price{" "}
                {sortConfig?.key === "price" &&
                  (sortConfig.direction === "ascending" ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  ))}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Product dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:block">Add Product</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link className="flex items-center gap-3" href="/products/add">
                  <Package className="h-4 w-4" /> Add Single Product
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  className="flex items-center gap-3"
                  href="/products/add/bulk"
                >
                  <CiBoxes className="h-5 w-5" />
                  Add in Bulk
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <Download />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => downloadProducts("json")}>
                <LuFileJson2 /> JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadProducts("xlsx")}>
                <RiFileExcel2Line /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadProducts("csv")}>
                <BsFiletypeCsv /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadProducts("pdf")}>
                <BsFiletypePdf /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="bg-white overflow-auto w-[95vw] md:w-auto"> {/* Changed w-100 to w-full */}
        {loading ? (
          <Table> {/* Added min-w-full */}
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-6 w-4 lg:w-24" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-6 w-full" /> 
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" /> 
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table> {/* Added min-w-full */}
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    // Toggle all selection
                    checked={selectedProductIds.length === products.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Index</TableHead> 
                <TableHead>Image</TableHead>
                <TableHead onClick={() => requestSort("productName")}>
                  <span className="flex items-center gap-3">
                    Name{" "}
                    {sortConfig?.key === "productName" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      ))}
                  </span>
                </TableHead>
                <TableHead onClick={() => requestSort("category")}>
                  <span className="flex items-center gap-3">
                    Category{" "}
                    {sortConfig?.key === "category" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      ))}
                  </span>
                </TableHead>
                <TableHead>Colors</TableHead>
                <TableHead onClick={() => requestSort("price")}>
                  <span className="flex items-center gap-3">
                    Price{" "}
                    {sortConfig?.key === "price" &&
                      (sortConfig.direction === "ascending" ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      ))}
                  </span>
                </TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product, index) => (
                <TableRow
                  key={product._id}
                  onClick={(e) => handleRowClick(e, product.productName ?? "")}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProductIds.includes(product._id)}
                      onCheckedChange={(e) => {
                        toggleProductSelection(product._id);
                      }}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  {deletingProductId === product._id ? (
                    <>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <Image
                          src={urlFor(product.image ?? "").url()}
                          alt={product.productName ?? ""}
                          className="h-12 w-12 object-cover rounded"
                          height={100}
                          width={100}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {highlightText(product.productName ?? "", searchTerm)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {highlightText(
                          typeof product.category === "string"
                            ? product.category
                            : "",
                          searchTerm
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.colors?.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">Rs {product.price}</TableCell>
                      <TableCell className="text-xs">{product.inventory}</TableCell>
                      <TableCell>
                        <Badge
                        className="whitespace-nowrap text-xs"
                          variant={
                            product.status === "In Stock"
                              ? "default"
                              : product.status === "Low Stock"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="dropdown-menu"
                          >
                            <DropdownMenuItem className="relative">
                              <Link
                                href={`/products/edit?name=${product.productName}`}
                                className="absolute inset-0"
                              />
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteConfirm(product._id)}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {selectedProduct && (
        <SingleProduct
          productName={selectedProduct}
          onClose={handleCloseSidebar}
        />
      )}
      <ToastContainer />
    </div>
  );
}

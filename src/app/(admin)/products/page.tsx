"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { getAllProducts } from "@/sanity/products/getAllProducts";
import { Product } from "../../../../sanity.types";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import SingleProduct from "@/components/SingleProduct"; // Import SingleProduct component

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null); // Add state for selected product

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getAllProducts();
      setProducts(products);
      setLoading(false); // Set loading to false after products are fetched
    };
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    const products = await getAllProducts();
    setProducts(products);
    setLoading(false);
  };

  const filteredProducts = products.filter((product) =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      if (key in a && key in b) {
        if ((a[key as keyof Product] ?? '') < (b[key as keyof Product] ?? '')) {
          return direction === "ascending" ? -1 : 1;
        }
        if ((a[key as keyof Product] ?? '') > (b[key as keyof Product] ?? '')) {
          return direction === "ascending" ? 1 : -1;
        }
      }
    }
    return 0;
  });

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  const handleRowClick = (productName: string) => {
    setSelectedProduct(productName);
  };

  const handleCloseSidebar = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={refreshProducts}>
          <RefreshCw className={loading ? "animate-spin" : ""}/>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Sort By
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => requestSort("productName")}>
                Name {sortConfig?.key === "productName" && (sortConfig.direction === "ascending" ? <ChevronUp /> : <ChevronDown />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort("category")}>
                Category {sortConfig?.key === "category" && (sortConfig.direction === "ascending" ? <ChevronUp /> : <ChevronDown />)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort("price")}>
                Price {sortConfig?.key === "price" && (sortConfig.direction === "ascending" ? <ChevronUp /> : <ChevronDown />)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>
      <div className="bg-white overflow-hidden">
        {loading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-6 w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-6 w-24" />
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
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort("productName")}>
                  <span className="flex items-center gap-3">Name {sortConfig?.key === "productName" && (sortConfig.direction === "ascending" ? <ChevronUp /> : <ChevronDown />)}</span>
                </TableHead>
                <TableHead onClick={() => requestSort("category")}>
                  <span className="flex items-center gap-3">Category {sortConfig?.key === "category" && (sortConfig.direction === "ascending" ? <ChevronUp /> : <ChevronDown />)}</span>
                </TableHead>
                <TableHead onClick={() => requestSort("price")}>
                  <span className="flex items-center gap-3">Price {sortConfig?.key === "price" && (sortConfig.direction === "ascending" ? <ChevronUp /> : <ChevronDown />)}</span>
                </TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product._id} onClick={() => handleRowClick(product.productName ?? "")} className="cursor-pointer">
                  <TableCell className="font-medium">{highlightText(product.productName ?? "", searchTerm)}</TableCell>
                  <TableCell>{highlightText(product.category ?? "", searchTerm)}</TableCell>
                  <TableCell>Rs {product.price}</TableCell>
                  <TableCell>{product.inventory}</TableCell>
                  <TableCell>
                    <Badge
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {selectedProduct && <SingleProduct productName={selectedProduct} onClose={handleCloseSidebar} />}
    </div>
  );
}


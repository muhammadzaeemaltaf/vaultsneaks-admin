"use client";

import { useEffect, useState } from "react";
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
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";
import { getAllCategories } from "@/sanity/category/getAllCategories";
import { Category } from "../../../../sanity.types";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/sanity/lib/client";
import { toast, ToastContainer } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { downloadCategories } from "@/lib/downloadCategories";
import { LuFileJson2 } from "react-icons/lu";
import { RiFileExcel2Line } from "react-icons/ri";
import { BsFiletypeCsv, BsFiletypePdf } from "react-icons/bs";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchCategories = async () => {
      const categories = await getAllCategories();
      setCategories(categories);
      setLoading(false);
    };
    const timer = setTimeout(fetchCategories, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshClick = async () => {
    setLoading(true);
    const categories = await getAllCategories();
    setCategories(categories);
    setLoading(false);
  };

  const filteredCategories = categories.filter((category) =>
    category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (category: Category) => {
    setEditingCategoryId(category._id);
    setEditedCategoryName(category.categoryName || "");
  };

  const handleDeleteClick = async (categoryId: string) => {
    if (!categoryId) return;
    try {
      await client.delete(categoryId);
      const updatedCategories = categories.filter(
        (category) => category._id !== categoryId
      );
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCategoryId) return;
    setDeleting(true);
    try {
      await client.delete(deleteCategoryId);
      const updatedCategories = categories.filter(
        (category) => category._id !== deleteCategoryId
      );
      setCategories(updatedCategories);
      setDeleteCategoryId(null);
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitClick = async () => {
    if (editingCategoryId) {
      setUpdating(true);
      try {
        await client
          .patch(editingCategoryId)
          .set({ categoryName: editedCategoryName })
          .commit();
        const updatedCategories = categories.map((category) =>
          category._id === editingCategoryId
            ? { ...category, categoryName: editedCategoryName }
            : category
        );
        setCategories(updatedCategories);
        setEditingCategoryId(null);
        setEditedCategoryName("");
        toast.success("Category updated successfully!");
      } catch (error) {
        console.error("Error updating category:", error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleCancelClick = () => {
    setEditingCategoryId(null);
    setEditedCategoryName("");
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

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon" onClick={handleRefreshClick}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
        <div className="flex gap-4">
          <Button className="relative">
            <Link href="categories/add" className="absolute inset-0" />
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => downloadCategories("json")}>
               <LuFileJson2 /> JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadCategories("xlsx")}>
               <RiFileExcel2Line /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadCategories("csv")}>
               <BsFiletypeCsv /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadCategories("pdf")}>
               <BsFiletypePdf /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden">
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 py-2">
                <Skeleton className="w-10 h-6" />
                <Skeleton className="flex-1 h-6" />
                <Skeleton className="w-20 h-6" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Index</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category, index) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {editingCategoryId === category._id ? (
                      updating ? (
                        <Skeleton className="w-full h-6" />
                      ) : (
                        <Input
                          value={editedCategoryName}
                          onChange={(e) =>
                            setEditedCategoryName(e.target.value)
                          }
                          className="editing-input"
                        />
                      )
                    ) : (
                      highlightText(category.categoryName ?? "", searchTerm)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingCategoryId === category._id ? (
                      updating ? (
                        <Skeleton className="w-20 h-6" />
                      ) : (
                        <>
                          <Button onClick={handleSubmitClick}>Submit</Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelClick}
                            className="ml-2"
                          >
                            Cancel
                          </Button>
                        </>
                      )
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(category)}
                          >
                            <Edit className="mr-2 h-4 w-4 cursor-pointer" />{" "}
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteCategoryId(category._id)}
                          >
                            <Trash className="mr-2 h-4 w-4 cursor-pointer" />{" "}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <Dialog
        open={deleteCategoryId !== null}
        onOpenChange={() => setDeleteCategoryId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? <LoadingSpinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
}

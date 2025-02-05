"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import React, { useState } from "react";
import { client } from "@/sanity/lib/client";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast, ToastContainer } from "react-toastify";

const AddCategories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await client.create({
        _type: "category",
        categoryName,
      });
      toast.success("Category added successfully!");
      setTimeout(() => {
        router.push("/categories");
      }, 3000);
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
  };

  return (
    <div className="px-3">
      <Card className="max-w-md mx-auto mt-10 shadow-md">
        <CardHeader>
          <CardTitle>New Category</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category Name
              </label>
              <Input
                id="categoryName"
                type="text"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <ToastContainer />
    </div>
  );
};

export default AddCategories;

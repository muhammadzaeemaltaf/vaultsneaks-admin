"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/overview";
import {
  BoxesIcon,
  ShoppingBasketIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import { getAllProducts } from "@/sanity/products/getAllProducts";
import { getAllCategories } from "@/sanity/category/getAllCategories";
import { getAllOrders } from "@/sanity/orders/getAllOrders";
import { getAllUsers } from "@/sanity/user/getAllUsers";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [orders, setOrders] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [productsData, categoriesData, ordersData, userData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllOrders(),
        getAllUsers(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setUsers(userData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-col md:flex w-full">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div className="grid">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col md:flex w-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between w-full">
                Total Products
                <ShoppingCartIcon className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between w-full">
                Total Categories
                <BoxesIcon className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between w-full">
                Total Orders
                <ShoppingBasketIcon className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between w-full">
                Total Users
                <UsersIcon className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid">
          <Card>
            <CardHeader className="!px-2 md:px-6">
              <CardTitle>Orders</CardTitle>
              <CardContent className="!px-2 md:px-6">
                <Overview />
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

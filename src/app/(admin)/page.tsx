"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/overview";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any>([]);
  const [brands, setBrands] = useState<any>([]);
  const [ads, setAds] = useState<any>([]);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setUsers([{ id: 1 }, { id: 2 }, { id: 3 }]);
      setBrands([{ id: 1, deals: [1, 2] }, { id: 2, deals: [3] }]);
      setAds([{ id: 1 }, { id: 2 }]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex-col md:flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="col-span-3 animate-pulse">
              <div className="h-72 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="col-span-3 animate-pulse">
              <div className="h-72 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col md:flex w-full">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                All Brands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brands.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brands.reduce((acc:any, brand:any) => acc + (brand.deals?.length || 0), 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                All Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ads.length}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid">
          <Card>
            <CardHeader className="!px-2 md:px-6">
              <CardTitle>Code </CardTitle>
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
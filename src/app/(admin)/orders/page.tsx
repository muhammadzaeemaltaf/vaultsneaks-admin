"use client";

import { Search, MoreHorizontal, Edit, Trash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import { getAllOrders } from "@/sanity/orders/getAllOrders";
import { ORDER_QUERYResult } from "../../../../sanity.types";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import SingleOrder from "@/components/SingleOrder"; // Import SingleOrder component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import { client } from "@/sanity/lib/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import ShadCN Select components
import { toast, ToastContainer } from "react-toastify"; // Import toast

const statusColors = {
    pending: "!bg-yellow-100 text-yellow-800",
    paid: "!bg-green-100 text-green-800",
    shipped: "!bg-blue-100 text-blue-800",
    delivered: "!bg-purple-100 text-purple-800",
    cancelled: "!bg-red-100 text-red-800",
  }

const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"]; // Add status options

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return text;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  return text.split(regex).map((part, index) =>
    regex.test(part) ? <span key={index} className="bg-yellow-200">{part}</span> : part
  );
};

export default function OrderPage() {
  const [orders, setOrders] = useState<ORDER_QUERYResult>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null); // Add state for selected order
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null); // Add state for updating status
  const sidebarRef = useRef<HTMLDivElement>(null); // Add ref for sidebar

  useEffect(() => {
    async function fetchOrders() {
      try {
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSelectedOrder(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  const refreshOrders = async () => {
    setLoading(true);
    const fetchedOrders = await getAllOrders();
    setOrders(fetchedOrders);
    setLoading(false);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRowClick = (event: React.MouseEvent, orderNumber: string) => {
    // Prevent row click if the event target is a button or inside a button
    if ((event.target as HTMLElement).closest("button") || (event.target as HTMLElement).closest(".dropdown-menu")) return;
    setSelectedOrder(orderNumber);
  };

  const handleCloseSidebar = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus as "pending" | "paid" | "shipped" | "delivered" | "cancelled" } : order
        )
      );
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={refreshOrders}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>
      <div className="bg-white overflow-hidden">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Estimated Delievery Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id} onClick={(e) => handleRowClick(e, order.orderNumber ?? "")} className="cursor-pointer">
                  <TableCell className="font-medium">{highlightText(order.orderNumber ?? "", searchTerm)}</TableCell>
                  <TableCell>
                    <div>{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </TableCell>
                  <TableCell>{order.orderDate ? new Date(order.orderDate).toDateString() : "N/A"}</TableCell>
                  <TableCell>{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toDateString() : "N/A"}</TableCell>
                  <TableCell>{`${order.currency} ${order.totalPrice ?? 0}`}</TableCell>
                  <TableCell>
                    {updatingStatus === order._id ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order._id, value)}
                      >
                        <SelectTrigger className={`form-select ${statusColors[order.status as keyof typeof statusColors]}`}>
                          <SelectValue placeholder={order.status} />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell className="text-center">
                    <Trash className="mr-2 h-4 w-4 hover:text-red-600 cursor-pointer" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {selectedOrder && (
        <div ref={sidebarRef}>
          <SingleOrder orderNumber={selectedOrder} onClose={handleCloseSidebar} />
        </div>
      )}

      <ToastContainer />
    </div>
  )
}


"use client";

import { Search, MoreHorizontal, Edit, Trash, RefreshCw, Download, ChevronUp, ChevronDown } from "lucide-react";
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
import { downloadOrders } from "@/lib/downloadOrder"; // Import downloadOrders
import { LuFileJson2 } from "react-icons/lu";
import { RiFileExcel2Line } from "react-icons/ri";
import { BsFiletypeCsv, BsFiletypePdf } from "react-icons/bs";

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
  const [sortField, setSortField] = useState<"customerName" | "orderDate" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null); // Add state for selected order
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null); // Add state for updating status
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null); // Add state for deleting order
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

  const handleSort = (field: "customerName" | "orderDate") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  let sortedOrders = [...filteredOrders];
  if (sortField === "customerName") {
    sortedOrders.sort((a, b) => {
      const aVal = a.customerName ? a.customerName.toLowerCase() : "";
      const bVal = b.customerName ? b.customerName.toLowerCase() : "";
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  } else if (sortField === "orderDate") {
    sortedOrders.sort((a, b) => {
      const aVal = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const bVal = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
  }

  const handleRowClick = (event: React.MouseEvent, orderNumber: string) => {
    // Prevent row click if the event target is a button or inside a button
    if ((event.target as HTMLElement).closest("button") || (event.target as HTMLElement).closest(".dropdown-menu") || (event.target as HTMLElement).closest(".delete-button")) return;
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

      // Find the updated order to send email
      const currentOrder = orders.find((order) => order._id === orderId);
      if (currentOrder) {
          // Generate products details HTML with product image
          const productsDetails = currentOrder.products?.length
            ? currentOrder.products.map((product: any) => `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span>${product.product.productName} x ${product.quantity}</span>
                </div>
              `).join("")
            : "<p>No products details available.</p>";
          await fetch('/api/send-email', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: currentOrder.email,
                subject: "Your Order Status Has Been Updated",
                orderStatus: newStatus,
                orderNumber: currentOrder.orderNumber,
                productsDetails
              })
          });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrder(orderId);
    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setDeletingOrder(null);
    }
  };

  return (
    <div className="container mx-auto py-10 px-2 md:px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center justify-between w-full space-x-2">
          <div className="flex items-center gap-4">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
          <Button variant="outline" size="icon" onClick={refreshOrders}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
          </Button>
          </div>
            {/* New Download Dropdown for orders */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => downloadOrders("json")}>
               <LuFileJson2 /> JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadOrders("xlsx")}>
               <RiFileExcel2Line /> Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadOrders("csv")}>
               <BsFiletypeCsv /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadOrders("pdf")}>
               <BsFiletypePdf /> PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="bg-white overflow-auto w-[95vw] md:w-auto text-xs"> 
        {loading ? (
          <Table className="text-theme">
            <TableHeader>
              <TableRow>
                <TableHead>Index</TableHead> {/* New index header */}
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Estimated Delivery Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-12" /> {/* New index cell */}</TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Index</TableHead> {/* New index header */}
                <TableHead>Order Number</TableHead>
                <TableHead onClick={() => handleSort("customerName")} className="cursor-pointer">
                  Customer {sortField === "customerName" && (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead onClick={() => handleSort("orderDate")} className="cursor-pointer whitespace-nowrap">
                  Order Date {sortField === "orderDate" && (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead>Estimated Delievery Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.map((order, index) => (
                <TableRow key={order._id} onClick={(e) => handleRowClick(e, order.orderNumber ?? "")} className="cursor-pointer">
                  {deletingOrder === order._id ? (
                    <>
                      <TableCell><Skeleton className="h-6 w-12" /> {/* New index cell */}</TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{index + 1}</TableCell> {/* New index cell */}
                      <TableCell className="font-medium">{highlightText(order.orderNumber ?? "", searchTerm)}</TableCell>
                      <TableCell>
                        <div>{highlightText(order.customerName ?? "", searchTerm)}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </TableCell>
                      <TableCell>{order.orderDate ? new Date(order.orderDate).toDateString() : "N/A"}</TableCell>
                      <TableCell>{order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toDateString() : "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">{`${order.currency} ${(order.totalPrice)?.toFixed(2) ?? 0}`}</TableCell>
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
                        <Trash
                          className="mr-2 h-4 w-4 hover:text-red-600 cursor-pointer delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order._id);
                          }}
                        />
                      </TableCell>
                    </>
                  )}
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


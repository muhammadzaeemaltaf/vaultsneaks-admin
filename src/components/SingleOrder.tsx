"use client";

import { useEffect, useState, useRef } from "react";
import { getSingleOrders } from "@/sanity/orders/getSingleOrder";
import type { Order } from "../../sanity.types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface SingleOrderProps {
  orderNumber: string;
  onClose: () => void;
}

const SkeletonLoader: React.FC = () => (
  <div className="space-y-6 flex-grow pb-8">
    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
    <div className="flex items-center space-x-4">
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
    <div className="grid gap-4">
      <div className="flex gap-4 items-center">
        <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mt-2"></div>
        </div>
      </div>
      {/* Repeat the above block for more products */}
    </div>
    <div className="grid gap-4">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
    </div>
  </div>
);

const SingleOrder: React.FC<SingleOrderProps> = ({ orderNumber, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setMenuOpen(true);
    }, 100);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const fetchedOrder = await getSingleOrders(orderNumber);
      if (Array.isArray(fetchedOrder) && fetchedOrder.length > 0) {
        setOrder(fetchedOrder[0] as any);
      } else {
        setOrder(null);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderNumber]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  const handleClose = () => {
    setMenuOpen(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-end z-50">
          <div
            ref={sidebarRef}
            className="bg-white dark:bg-gray-800 w-full sm:w-[80%] md:w-[70%] lg:w-1/2 h-full overflow-y-auto shadow-xl"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Order Details
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {loading ? (
                <SkeletonLoader />
              ) : order ? (
                <div className="space-y-6 flex-grow pb-8">
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {order.customerName}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {order.orderDetails}
                  </p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <span className="text-2xl font-bold">
                        {order.currency} {order.totalPrice}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {order?.products?.map((product: any) => (
                      <div
                        key={product._key}
                        className="flex gap-4 items-center"
                      >
                        {product.product?.image && (
                          <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={urlFor(product.product.image).url() || ""}
                              alt={product.product.productName ?? ""}
                              layout="fill"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {product.product?.productName || "Unknown Product"}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            Quantity: {product.quantity || 0}
                          </p>
                          {product.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Color:</span>
                              <div
                                className="w-6 h-6 rounded-full border border-gray-200"
                                style={{ backgroundColor: product.color }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <strong>Order Number:</strong> {order.orderNumber}
                    </div>
                    <div>
                      <strong>Order Date:</strong>{" "}
                      {order.orderDate
                        ? new Date(order.orderDate).toDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Estimated Delivery Date:</strong>{" "}
                      {order.estimatedDeliveryDate
                        ? new Date(order.estimatedDeliveryDate).toDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <strong>Status:</strong> {order.status}
                    </div>
                    <div>
                      <strong>Payment Method:</strong> {order.paymentMethod}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Order not found
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SingleOrder;

"use client"

import { useEffect, useState, useRef } from "react"
import { getProductByName } from "@/sanity/products/getProductByName"
import type { Product } from "../../sanity.types"
import Image from "next/image"
import { urlFor } from "@/sanity/lib/image"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Package, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SingleProductProps {
  productName: string
  onClose: () => void
}

const SingleProduct: React.FC<SingleProductProps> = ({ productName, onClose }) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTimeout(() => {
      setMenuOpen(true)
    }, 100)
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      const fetchedProduct = await getProductByName(productName)
      if (Array.isArray(fetchedProduct) && fetchedProduct.length > 0) {
        setProduct(fetchedProduct[0])
      } else {
        setProduct(null)
      }
      setLoading(false)
    }
    fetchProduct()
  }, [productName])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarRef])

  const handleClose = () => {
    setMenuOpen(false)
    setTimeout(onClose, 300)
  }

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-end z-50"
        >
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white dark:bg-gray-800 w-full sm:w-[80%] md:w-[70%] lg:w-1/2 h-full overflow-y-auto shadow-xl"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Product Details</h2>
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
                <div className="space-y-4 flex-grow">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex space-x-4 mt-6">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-10 w-1/2" />
                  </div>
                </div>
              ) : product ? (
                <div className="space-y-6 flex-grow pb-8">
                  <div className="relative w-80 mx-auto aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={urlFor(product.image ?? "").url()}
                      alt={product.productName ?? "Product Image"}
                      layout="fill"
                      objectFit="cover"
                      className="transition-all duration-300 hover:scale-105"
                    />
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{product.productName}</h1>
                  <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <span className="text-2xl font-bold">Rs {product.price}</span>
                    </div>
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                      <Package className="h-5 w-5 mr-1" />
                      <span>{product.inventory} in stock</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Category:</span>{" "}
                    <span className="text-sm text-gray-800 dark:text-white">{product.category && typeof product.category === 'object' && 'name' in product.category ? (product.category as { name: string }).name : 'Unknown Category'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center">
                  <p className="text-xl text-gray-600 dark:text-gray-400">Product not found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SingleProduct


import { useEffect, useState, useRef } from "react";
import { getProductByName } from "@/sanity/products/getProductByName";
import { Product } from "../../sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

interface SingleProductProps {
  productName: string;
  onClose: () => void;
}

const SingleProduct: React.FC<SingleProductProps> = ({
  productName,
  onClose,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true); 
  const [menuOpen, setMenuOpen] = useState(false); 
  const sidebarRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  setTimeout(() => {
    setMenuOpen(true);
  },100);
}, [menuOpen]);

  useEffect(() => {
    const fetchProduct = async () => {
      console.log(productName);
      setLoading(true); // Set loading to true when fetching starts
      const fetchedProduct = await getProductByName(productName);
      if (Array.isArray(fetchedProduct) && fetchedProduct.length > 0) {
        setProduct(fetchedProduct[0]);
      } else {
        setProduct(null);
      }
      setLoading(false); // Set loading to false after fetching
    };
    fetchProduct();
  }, [productName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-end transition-opacity duration-300">
      <div
        ref={sidebarRef}
        className={`bg-white w-[80%] md:w-[70%] lg:w-1/2 h-full py-4 px-10 overflow-y-auto transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={onClose} className="text-right">
          Close
        </button>
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : product ? (
          <div className="flex flex-col gap-3">
            <div className="w-80 mx-auto rounded-md overflow-hidden">
              <Image
                src={urlFor(product.image ?? "").url()}
                alt={product.productName ?? "Product Image"}
                height={1000}
                width={1000}
              />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="font-extrabold text-2xl">{product.productName}</h1>
              <p>{product.description}</p>
              <p className="text-lg">
                <span className="font-bold">Price: Rs </span>
                {product.price}
              </p>
              <p className="text-lg">
                <span className="font-bold">Category: </span>
                {product.category}
              </p>
              <p className="text-lg"> {product.inventory} items in stock</p>
            </div>
          </div>
        ) : (
          <div>Product not found</div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;

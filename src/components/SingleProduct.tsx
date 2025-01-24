import { useEffect, useState, useRef } from "react";
import { getProductByName } from "@/sanity/products/getProductByName";
import { Product } from "../../sanity.types";

interface SingleProductProps {
  productName: string;
  onClose: () => void;
}

const SingleProduct: React.FC<SingleProductProps> = ({ productName, onClose }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const fetchedProduct = await getProductByName(productName);
      if (Array.isArray(fetchedProduct) && fetchedProduct.length > 0) {
        setProduct(fetchedProduct[0]);
      } else {
        setProduct(null);
      }
    };
    fetchProduct();
  }, [productName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-end transition-opacity duration-300">
      <div ref={sidebarRef} className="bg-white w-1/2 h-full p-4 overflow-y-auto transform transition-transform duration-300 translate-x-0">
        <button onClick={onClose} className="text-right">Close</button>
        {product ? (
          <>
            <h2 className="text-2xl font-bold mb-4">{product.productName}</h2>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> Rs {product.price}</p>
            <p><strong>Inventory:</strong> {product.inventory}</p>
            <p><strong>Status:</strong> {product.status}</p>
            <p><strong>Description:</strong> {product.description}</p>
            {/* Add more product details as needed */}
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default SingleProduct;

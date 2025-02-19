import { defineQuery } from "next-sanity";
import { client } from "../lib/client";

export const getAllOrders = async () => {
  const ORDER_QUERY = defineQuery(
    `*[_type == "order" ] {
     ...,
                products[] {
                    ...,
                    product->
                }}`
  );
  try {
    const orders = await client.fetch(ORDER_QUERY);
    return orders || [];
  } catch (error) {
    console.error("Error fetching orders", error);
    return [];
  }
};

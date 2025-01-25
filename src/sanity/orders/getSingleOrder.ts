import { defineQuery } from "next-sanity";
import { client } from "../lib/client";

export const getSingleOrders = async (id: string) => {
  const ORDER_BY_ID_QUERY = defineQuery(
    `*[_type == "order" && orderNumber == $id] {
     ...,
                products[] {
                    ...,
                    product->
                },
    }`
  );
  try {
    const orders = await client.fetch(ORDER_BY_ID_QUERY, { id });
    return orders || [];
  } catch (error) {
    console.error("Error fetching orders", error);
    return [];
  }
};

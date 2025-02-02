import { defineQuery } from "next-sanity";
import { Review } from "../../../sanity.types";
import { client } from "../lib/client";


export const getProductReviews = async (productId: string): Promise<Review[]> => {
  try {
    const PRODUCT_REVIEW_BY_ID = defineQuery(`
      *[_type == "review" && references(^._id) && references(^._id)] `);
    const params = { productId };
    const reviews = await client.fetch(PRODUCT_REVIEW_BY_ID, params);
    return reviews || [];
  } catch (error) {
    console.error("Error fetching product reviews", error);
    return [];
  }
};

export const getAllReviews = async () => {
  try {
    const ALL_REVIEWS_QUERY = defineQuery(
      `
      *[_type == "review"]{
        ...,
        product->{
          ...
        }
      }
      `
    );
    const reviews = await client.fetch(ALL_REVIEWS_QUERY);
    return reviews || [];
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};
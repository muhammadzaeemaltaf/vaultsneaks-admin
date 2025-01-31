import { defineQuery } from "next-sanity";
import { client } from "../lib/client";

export const getAllUsers = async () => {
  const ALL_USERS_QUERY = defineQuery(`
    *[_type == "user"]
  `);

  try {
    const users = await client.fetch(ALL_USERS_QUERY);
    return users || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
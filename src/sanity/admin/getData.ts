import { client } from "../lib/client";

export const getData = async (email: string) => {
  try {
    const query = `*[_type == "admin" && email == $email]`;
    const admin = await client.fetch(query, { email });
    return admin || [];
  } catch (error: any) {
    console.error("Error fetching admin details:", error);
    return [];
  }
}
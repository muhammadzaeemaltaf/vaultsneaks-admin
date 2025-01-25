import Edit from "@/components/EditProduct";
import { Suspense } from "react";

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Edit />
    </Suspense>
  );
}

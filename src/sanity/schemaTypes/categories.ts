
import { BoxesIcon } from "lucide-react";
import { defineField } from "sanity";

export default {
    name: 'category',
    title: 'Category',
    type: 'document',
    icon: BoxesIcon,
    fields: [
      defineField({
        name: 'categoryName',
        title: 'Category Name',
        type: 'string',
        description: 'The name of the category',
      })
    ],
  };
  
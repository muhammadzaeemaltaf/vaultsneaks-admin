import { UserCheck } from "lucide-react";
import { defineField, defineType } from "sanity";

export const adminSchema = defineType({
    name: 'admin',
    title: 'Admin',
    type: 'document',
    icon: UserCheck,
    fields: [
       defineField({
        name: 'username',
        title: 'Username',
        type: 'string',
        description: 'Unique username for the admin',
      }),
       defineField({
        name: 'email',
        title: 'Email',
        type: 'string',
        description: 'Email address of the admin',
      }),
       defineField({
        name: 'password',
        title: 'Password',
        type: 'string',
        description: 'Secure password for the admin',
      }),
       defineField({
        name: 'role',
        title: 'Role',
        type: 'string',
        description: 'The role for this user is predefined as Admin',
        initialValue: 'Admin',
        readOnly: true, // Prevents users from changing the role
      }),
       defineField({
        name: 'profileImage',
        title: 'Profile Image',
        type: 'image',
        description: 'Optional profile image for the admin',
        options: {
          hotspot: true,
        }
        }),
       defineField({
        name: 'createdAt',
        title: 'Created At',
        type: 'datetime',
        description: 'Date and time the admin was created',
        initialValue: () => new Date().toISOString(),
        readOnly: true,
      }),
    ],
  });
  
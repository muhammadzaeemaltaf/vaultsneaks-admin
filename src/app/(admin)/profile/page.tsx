"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, Pencil, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAdminStore } from "@/stores/userStore";
import { urlFor } from "@/sanity/lib/image";
import { updateAdminInSanity } from "@/sanity/admin/updateAdminInSanity";
import { getData } from "@/sanity/admin/getData";

export default function AdminProfile() {
  const { users, setUsers } = useAdminStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state to hold form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // New loading & updating states
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (users && users.username) {
      setLoading(false);
    }
  }, [users]);

  // Function to re-fetch user details after update
  const fetchUserData = async (email: string) => {
    try {
      const data = await getData(email);
      if (data && data.length > 0) {
        setUsers(data[0]);
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
    }
  };

  const handleEdit = () => {
    setFormData({
      username: users.username,
      email: users.email,
      password: users.password,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const updatedAdmin = await updateAdminInSanity(
        { ...users, ...formData },
        selectedFile
      );
      if (updatedAdmin) {
        // Use formData.email for fetching details in case updatedAdmin doesn't include email
        await fetchUserData(formData.email);
      }
      setIsEditing(false);
      setUpdating(false);
    } catch (error) {
      console.error("Error updating admin data:", error);
      setUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePencilClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-4 border rounded animate-pulse">
        {/* Skeleton for header */}
        <div className="h-6 bg-gray-300 mb-4 w-1/3"></div>
        {/* Skeleton for avatar */}
        <div className="h-24 w-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
        {/* Skeleton for inputs */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Card className="w-full max-w-2xl mx-auto mt-8 ">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Admin Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative flex justify-center mx-auto w-fit">
              <Avatar className="h-24 w-24 border">
                <AvatarImage
                  src={
                    selectedImage
                      ? selectedImage
                      : users.profileImage
                        ? urlFor(users.profileImage).url()
                        : ""
                  }
                  alt={users.username}
                />
                <AvatarFallback>
                  {users.username
                    ? users.username.charAt(0).toUpperCase()
                    : "AD"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePencilClick}
                  className="absolute bottom-1 right-1 bg-white border overflow-hidden rounded-full"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={isEditing ? formData.username : users.username}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={isEditing ? formData.email : users.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={isEditing ? formData.password : users.password}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  value={users?.role}
                  disabled={true}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="createdAt">Created At</Label>
                <Input
                  id="createdAt"
                  name="createdAt"
                  value={new Date(users?.createdAt || "").toLocaleString()}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {!isEditing ? (
            <Button onClick={handleEdit} disabled={updating}>
              {updating ? <Loader2 className="animate-spin h-4 w-4" /> : "Edit"}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updating}>
                {updating ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Save"
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

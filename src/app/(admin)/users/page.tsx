"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw } from "lucide-react";
import { getAllUsers } from "@/sanity/user/getAllUsers";
import { client } from "@/sanity/lib/client";
import { toast, ToastContainer } from "react-toastify";
import { User } from "../../../../sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return text;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  return text.split(regex).map((part, index) =>
    regex.test(part) ? <span key={index} className="bg-yellow-200">{part}</span> : part
  );
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    setUpdatingStatus(userId);
    try {
      await client.patch(userId).set({ isActive: newStatus }).commit();
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isActive: newStatus } : user
        )
      );
      toast.success("User status updated successfully");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId],
    }));
  };

  const refreshUsers = async () => {
    setLoading(true);
    const fetchedUsers = await getAllUsers();
    setUsers(fetchedUsers);
    setLoading(false);
  };

  const locations = Array.from(new Set(users.map((user) => user.country).filter((country): country is string => country !== undefined)));
  const genders = Array.from(new Set(users.map((user) => user.gender).filter((gender): gender is "Male" | "Female" => gender !== undefined)));

  const filteredAndSortedUsers = useMemo(() => {
    let filteredUsers = users;

    if (locationFilter && locationFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.country === locationFilter
      );
    }

    if (genderFilter && genderFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.gender === genderFilter
      );
    }

    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        (user.firstName + " " + user.lastName).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredUsers.sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName);
      } else {
        return (b.firstName + " " + b.lastName).localeCompare(a.firstName + " " + a.lastName);
      }
    });
  }, [locationFilter, genderFilter, sortOrder, searchTerm, users]);

  return (
    <div className="space-y-4 px-2 pt-4">
      {loading ? (
        <Table className="text-theme">
          <TableHeader>
            <TableRow>
              <TableHead>Profile Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Register At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <>
          <div className="flex gap-4 flex-wrap">
            <Input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[180px] px-2 py-1 border rounded-md dark:bg-zinc-700 dark:text-white"
            />
            <div className="flex gap-4">
              <Select onValueChange={(value) => setLocationFilter(value || null)}>
                <SelectTrigger className="w-1/2 sm:w-[180px] dark:bg-zinc-700 dark:text-white">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All countries</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setGenderFilter(value || null)}>
                <SelectTrigger className="w-1/2 sm:w-[180px] dark:bg-zinc-700 dark:text-white">
                  <SelectValue placeholder="Filter by gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  {genders.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={refreshUsers}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
          <Table className="text-theme">
            <TableHeader>
              <TableRow>
                <TableHead>Profile Image</TableHead>
                <TableHead
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  Name{" "}
                  {sortOrder === "asc" ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  )}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Register At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {!user.profilePicture ? (
                        <Avatar>
                          <AvatarFallback>
                            {[user.firstName, user.lastName]
                              .map((n) => (n ? n[0] : ""))
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar>
                          <AvatarImage
                            src={urlFor(user.profilePicture).url() || ""}
                            alt={user.firstName + " " + user.lastName}
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.alt = "Fallback";
                            }}
                          />
                          <AvatarFallback>
                            {[user.firstName, user.lastName]
                              .map((n) => (n ? n[0] : ""))
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {highlightText(user.firstName + " " + user.lastName, searchTerm)}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {showPassword[user._id] ? user.password : "••••••••"}
                        <button
                          onClick={() => togglePasswordVisibility(user._id)}
                          className="ml-2"
                        >
                          {showPassword[user._id] ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>{user.dateOfBirth}</TableCell>
                    <TableCell>{user.gender}</TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell>
                      {updatingStatus === user._id ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <Select
                          value={user.isActive ? "active" : "inactive"}
                          onValueChange={(value) => handleStatusChange(user._id, value === "active")}
                        >
                          <SelectTrigger className={`form-select ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            <SelectValue placeholder={user.isActive ? "Active" : "Inactive"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user._createdAt).toDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      )}
      <ToastContainer />
    </div>
  );
}

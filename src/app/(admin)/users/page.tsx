"use client";

import { useState, useMemo } from "react";
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
import { ChevronDown, ChevronUp } from "lucide-react";

const users = [
  {
    id: 1,
    fullname: "John Doe",
    whatsappno: "1234567890",
    dateofbirth: "1990-01-01",
    location: "New York",
    gender: "Male",
    createdat: "2022-01-01T00:00:00Z",
    lastlogin: "2022-01-10T00:00:00Z",
    profileImage: "",
  },
  {
    id: 2,
    fullname: "Jane Smith",
    whatsappno: "9876543210",
    dateofbirth: "1992-02-14",
    location: "Los Angeles",
    gender: "Female",
    createdat: "2023-02-01T00:00:00Z",
    lastlogin: "2023-02-20T00:00:00Z",
    profileImage: "",
  },
  {
    id: 3,
    fullname: "Alice Johnson",
    whatsappno: "5432167890",
    dateofbirth: "1985-05-20",
    location: "Chicago",
    gender: "Female",
    createdat: "2021-05-15T00:00:00Z",
    lastlogin: "2021-06-10T00:00:00Z",
    profileImage: "",
  },
  {
    id: 4,
    fullname: "Robert Brown",
    whatsappno: "6789012345",
    dateofbirth: "1988-11-12",
    location: "Houston",
    gender: "Male",
    createdat: "2020-11-12T00:00:00Z",
    lastlogin: "2021-11-12T00:00:00Z",
    profileImage: "",
  },
  {
    id: 5,
    fullname: "Emily Davis",
    whatsappno: "1122334455",
    dateofbirth: "1995-09-08",
    location: "Phoenix",
    gender: "Female",
    createdat: "2022-08-15T00:00:00Z",
    lastlogin: "2023-01-01T00:00:00Z",
    profileImage: "",
  },
  {
    id: 6,
    fullname: "Michael Wilson",
    whatsappno: "9988776655",
    dateofbirth: "1991-03-15",
    location: "Philadelphia",
    gender: "Male",
    createdat: "2021-12-25T00:00:00Z",
    lastlogin: "2022-12-25T00:00:00Z",
    profileImage: "",
  },
  {
    id: 7,
    fullname: "Sophia Martinez",
    whatsappno: "2233445566",
    dateofbirth: "1993-07-22",
    location: "San Antonio",
    gender: "Female",
    createdat: "2023-07-01T00:00:00Z",
    lastlogin: "2023-08-01T00:00:00Z",
    profileImage: "",
  },
  {
    id: 8,
    fullname: "David Garcia",
    whatsappno: "4455667788",
    dateofbirth: "1987-12-04",
    location: "San Diego",
    gender: "Male",
    createdat: "2020-01-01T00:00:00Z",
    lastlogin: "2020-12-31T00:00:00Z",
    profileImage: "",
  },
  {
    id: 9,
    fullname: "Isabella Miller",
    whatsappno: "6677889900",
    dateofbirth: "1998-06-18",
    location: "Dallas",
    gender: "Female",
    createdat: "2024-01-10T00:00:00Z",
    lastlogin: "2024-01-24T00:00:00Z",
    profileImage: "",
  },
  {
    id: 10,
    fullname: "James Rodriguez",
    whatsappno: "5566778899",
    dateofbirth: "1990-10-10",
    location: "San Jose",
    gender: "Male",
    createdat: "2019-10-10T00:00:00Z",
    lastlogin: "2020-10-10T00:00:00Z",
    profileImage: "",
  },
];
;

export default function UserTable() {
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const locations = Array.from(new Set(users.map((user) => user.location)));
  const genders = Array.from(new Set(users.map((user) => user.gender)));

  const filteredAndSortedUsers = useMemo(() => {
    let filteredUsers = users;

    if (locationFilter && locationFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.location === locationFilter
      );
    }

    if (genderFilter && genderFilter !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.gender === genderFilter
      );
    }

    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredUsers.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.fullname.localeCompare(b.fullname);
      } else {
        return b.fullname.localeCompare(a.fullname);
      }
    });
  }, [locationFilter, genderFilter, sortOrder, searchTerm]);

  return (
    <div className="space-y-4 px-2 pt-4">
      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[180px] px-2 py-1 border rounded-md dark:bg-zinc-700 dark:text-white"
        />
        <div className="flex gap-4">
          <Select onValueChange={(value) => setLocationFilter(value || null)}>
            <SelectTrigger className="w-1/2 sm:w-[180px] dark:bg-zinc-700 dark:text-white">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem
                  key={location}
                  value={location}
                >
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
                <SelectItem
                  key={gender}
                  value={gender}
                >
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            <TableHead>WhatsApp No</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Register At</TableHead>
            <TableHead>Last Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.profileImage === "" ? (
                    <Avatar>
                      <AvatarFallback>
                        {user.fullname
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarImage
                        src={user.profileImage}
                        alt={user.fullname}
                        onError={(e) => {
                          e.currentTarget.src = "";
                          e.currentTarget.alt = "Fallback";
                        }}
                      />
                      <AvatarFallback>
                        {user.fullname
                          .split(" ")
                          .map((n:string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </TableCell>
                <TableCell className="font-medium">{user.fullname}</TableCell>
                <TableCell>{user.whatsappno}</TableCell>
                <TableCell>{user.dateofbirth}</TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{new Date(user.createdat).toDateString()}</TableCell>
                <TableCell>{new Date(user.lastlogin).toDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

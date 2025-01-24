"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { urlFor } from "@/sanity/lib/image";
import { useAdminStore } from "@/stores/userStore";
import Link from "next/link";
import { useState } from "react";

export function UserNav() {
  const {users} = useAdminStore()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full border-2">
          <Avatar className="h-7 w-7 border-zinc-700">
            {
              users.profileImage && (
                <AvatarImage src={urlFor(users.profileImage).url()} alt={users.username} />
              )
            }
            <AvatarFallback className="text-theme">
              {users.username && users.username
                .split(" ")
                .slice(0, 2)
                .map((word: string) => word[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{users.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {users.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={"/profile"}>Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={"/logout"}>Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

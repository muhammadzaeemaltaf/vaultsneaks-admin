import {
  BellRing,
  BetweenHorizontalStart,
  Boxes,
  CalendarDays,
  ChevronDown,
  Handshake,
  Home,
  LayoutDashboardIcon,
  Settings,
  ShoppingBasket,
  ShoppingCart,
  SquareChartGantt,
  Tags,
  UserRoundCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboardIcon,
    dropdown: false,
  },
  {
    title: "Products",
    url: "/products",
    icon: ShoppingCart,
    dropdown: true,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Boxes,
    dropdown: true,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingBasket,
    dropdown: false,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    dropdown: false,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: Tags,
    dropdown: false,
  },
  {
    title: "Admin Profile",
    url: "/profile",
    icon: UserRoundCheck,
    dropdown: false,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg">
            Vault-Sneaks Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="py-10">
                  <div className="w-full flex flex-col items-center">
                    <Image
                      src={"/logo.png"}
                      alt="Logo"
                      height={1000}
                      width={1000}
                      className="w-32 object-cover"
                    />
                    <h1 className="whitespace-nowrap font-extrabold">Vault Sneaks Admin</h1>
                  </div>
                </div>
              </SidebarMenuItem>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div>
                      <item.icon />
                      <div className="flex items-center w-full">
                        <Link href={item.url} className="flex-1">
                          {item.title}
                        </Link>
                        {item.dropdown && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <ChevronDown className="h-4 w-4 cursor-pointer" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-56"
                              align="end"
                              forceMount
                            >
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <Link className="flex-1" href={item.url}>All {item.title}</Link>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <Link className="flex-1" href={`${item.url}/add`}>Add {item.title}</Link>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

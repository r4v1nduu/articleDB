"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/24/outline";
import { useSession, signIn, signOut } from "next-auth/react";
import { Role } from "@/types/user";

interface NavbarProps {
  currentPage?: "home" | "manage";
}

const navigation = [
  {
    name: "Admin Dashboard",
    href: "/manage",
    current: false,
    page: "manage",
    icon: CogIcon,
    adminOnly: true,
  },
];

export default function Navbar({ currentPage = "home" }: NavbarProps) {
  const { data: session } = useSession();

  // Update navigation to mark current page
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: item.page === currentPage,
  }));

  return (
    <nav className="bg-background border-b border-border">
      <div className="mx-auto max-w-4xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-foreground">
                Art!cleDB
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block lg:px-6">
              <div className="flex space-x-4">
                {session &&
                  updatedNavigation.map(
                    (item) =>
                      (!item.adminOnly ||
                        (item.adminOnly && session.user?.role === Role.ADMIN)) && (
                        <Link key={item.name} href={item.href}>
                          <Button variant="outline" size="sm">
                            <div className="flex items-center space-x-2">
                              <item.icon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                              <span>{item.name}</span>
                            </div>
                          </Button>
                        </Link>
                      )
                  )}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-sm font-medium">
                    {session.user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => signIn()}>
                  Login
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

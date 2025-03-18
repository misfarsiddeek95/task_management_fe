import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { User } from "@heroui/user";
import { ReactNode } from "react";
import { useAuth } from "../utility/AuthContext";

interface LayoutProps {
  username: string;
  children: ReactNode;
}

export function Layout({ username, children }: LayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isBordered>
        <NavbarBrand>
          <p className="font-bold text-inherit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
              />
            </svg>
            Task Management System
          </p>
        </NavbarBrand>

        <NavbarContent justify="end">
          <NavbarItem>
            <User name={username} />
          </NavbarItem>
          <NavbarItem>
            <Button color="danger" variant="light" onPress={logout}>
              Logout
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="flex-grow p-4">{children}</main>

      <footer className="p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Task Management System
      </footer>
    </div>
  );
}

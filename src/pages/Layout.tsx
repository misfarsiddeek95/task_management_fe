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
          <p className="font-bold text-inherit">Task Management System</p>
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

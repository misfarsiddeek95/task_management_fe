import React, { useEffect, useState } from "react";
import {
  NavbarItem,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import axios from "axios";

export const BellIcon = () => {
  return (
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
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
      />
    </svg>
  );
};

interface NotificationList {
  id: number;
  userId: number;
  taskId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationNavItem = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const [notifications, setNotifications] = useState<NotificationList[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}task/get-notifications`,
          {
            headers: {
              Authorization: `Bearer ${loggedInUser?.token}`, // Use Bearer token for authorization
            },
          }
        );
        console.log("response", response);
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchTasks();
  }, [loggedInUser?.token]);

  const markRead = async ({ id }: { id: number }) => {
    try {
      const data = { notificationId: id };

      await axios.patch(
        `${import.meta.env.VITE_API_URL}task/mark-read-notification`,
        data,
        {
          headers: {
            Authorization: `Bearer ${loggedInUser?.token}`,
          },
        }
      );

      setNotifications((pre) => pre.filter((not) => not.id !== id));
    } catch (error) {
      console.error("Error update task:", error);
    }
  };

  return (
    <NavbarItem>
      <Dropdown>
        <DropdownTrigger>
          <div>
            <Badge
              content={notifications.length}
              color="danger"
              shape="circle"
              size="sm"
              placement="top-right"
            >
              <Button
                isIconOnly
                variant="light"
                onPressStart={(e) => e.continuePropagation()}
              >
                <BellIcon />
              </Button>
            </Badge>
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label="Notifications">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownItem
                key={notification.id}
                description={notification.message.split(":")[1]}
                onPress={() => markRead({ id: notification.id })}
              >
                {notification.message.split(":")[0]}
              </DropdownItem>
            ))
          ) : (
            <DropdownItem key="no">No notifications</DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </NavbarItem>
  );
};

export default NotificationNavItem;

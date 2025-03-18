import React, { SVGProps, useEffect, useState } from "react";
import { Layout } from "./Layout";
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Select,
  SelectItem,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import axios from "axios";
import { formatDate } from "../utility/utility";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export const ChevronDownIcon = ({
  strokeWidth = 1.5,
  ...otherProps
}: IconSvgProps) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...otherProps}
    >
      <path
        d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export const SortArrow = ({
  isDesc,
  colorClass = "text-current",
}: {
  isDesc: boolean;
  colorClass?: string;
}) => {
  // down arrow
  if (isDesc) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`size-6 ${colorClass}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
        />
      </svg>
    );
  }

  // up arrow
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`size-6 ${colorClass}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
      />
    </svg>
  );
};

interface TaskTypes {
  id: number;
  userId: number;
  taskName: string;
  taskDescription: string;
  taskPriority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  isCompleted: boolean;
  priority_color: "danger" | "warning" | "primary";
}

const EmployeeDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [sortBtnType, setSortBtnType] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskTypes[]>([]);
  const [sortBy, setSortBy] = useState<"due_date" | "priority">("due_date");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}task/load-tasks`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`, // Use Bearer token for authorization
            },
          }
        );
        console.log("response", response);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchTasks();
  }, [user?.token]);

  const markCompleted = async ({
    taskId,
    isCompleted,
  }: {
    taskId: number;
    isCompleted: boolean;
  }) => {
    try {
      const data = { id: taskId, isCompleted };

      await axios.patch(
        `${import.meta.env.VITE_API_URL}task/complete-task`,
        data,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, isCompleted } : task
        )
      );
    } catch (error) {
      console.error("Error update task:", error);
    }
  };

  // Sort tasks based on selected criteria
  const sortedTasks = [...tasks]
    .sort((a, b) => {
      if (sortBy === "due_date") {
        return sortBtnType
          ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
          : new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "priority") {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return sortBtnType
          ? priorityOrder[b.taskPriority] - priorityOrder[a.taskPriority]
          : priorityOrder[a.taskPriority] - priorityOrder[b.taskPriority];
      }
      return 0;
    })
    .sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)); // Keep uncompleted tasks first

  return (
    <Layout username={user?.name}>
      <div className="p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <p>Manage and track your assigned tasks</p>
        <Spacer y={4} />
        <div className="flex items-center justify-center w-full ">
          <Alert
            description={
              "You can sort your tasks by due date or priority. Mark tasks as completed when you finish them."
            }
            color="primary"
          />
        </div>
        <Spacer y={4} />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-3 items-end">
            <h2>
              {tasks.filter((task) => !task.isCompleted).length} active tasks,{" "}
              {tasks.filter((task) => task.isCompleted).length} completed
            </h2>
            <div className="flex items-center gap-2">
              <Select
                label="Sort by"
                labelPlacement="outside-left"
                placeholder="Select option"
                className="min-w-[200px]"
                size="sm"
                selectedKeys={[sortBy]}
                onSelectionChange={(selected) =>
                  setSortBy(selected.values().next().value)
                }
              >
                <SelectItem key="due_date">Due Date</SelectItem>
                <SelectItem key="priority">Priority</SelectItem>
              </Select>

              <Button
                isIconOnly
                variant="light"
                color="primary"
                size="sm"
                onPress={() => setSortBtnType((prev) => !prev)}
              >
                <SortArrow isDesc={sortBtnType} colorClass="text-default" />
              </Button>
            </div>
          </div>
        </div>
        <Spacer y={4} />
        <Table aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>TASK</TableColumn>
            <TableColumn>PRIORITY NAME</TableColumn>
            <TableColumn>DUE DATE</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <p
                      className={`text-bold text-sm capitalize ${
                        task.isCompleted ? "line-through" : ""
                      }`}
                    >
                      {task.taskName}
                    </p>
                    <p className="text-bold text-sm capitalize text-default-400">
                      {task.taskDescription}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    className="capitalize"
                    color={task.priority_color}
                    size="sm"
                    variant="flat"
                  >
                    {task.taskPriority}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {!task.isCompleted && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                    )}
                    <p
                      className={`text-bold text-sm capitalize text-default-400 ${
                        !task.isCompleted ? "text-red-500" : ""
                      }`}
                    >
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Checkbox
                    color="success"
                    isSelected={task.isCompleted}
                    onValueChange={() =>
                      markCompleted({
                        taskId: task.id,
                        isCompleted: !task.isCompleted,
                      })
                    }
                  >
                    Mark as completed
                  </Checkbox>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;

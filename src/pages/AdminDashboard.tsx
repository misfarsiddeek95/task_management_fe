import React, { SVGProps, useEffect, useState } from "react";
import { Layout } from "./Layout";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Select,
  SelectItem,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import axios from "axios";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  department: string;
  // Add any other fields your form has
}

interface UserDataTypes {
  id: number;
  empId: string;
  firstName: string;
  lastName: string;
  userName: string;
  department: string;
  role: string;
  completedTasks?: number;
  notCompletedTasks?: number;
  completedPercentage?: number;
  totalTasks?: number;
}

interface TaskFormData {
  taskName: string;
  taskDesc: string;
  priority: string;
  dueDate: string;
}

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null"); // logged in detail
  const [selected, setSelected] = React.useState<string>("analytics");
  const [taskUserId, setTaskUserId] = useState<number | null>(null);

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure(); // for user modal
  const {
    isOpen: isOpenTask,
    onOpen: onOpenTask,
    onOpenChange: onOpenChangeTask,
    onClose: onCloseTask,
  } = useDisclosure(); // for task modal

  const [submitted, setSubmitted] = React.useState<EmployeeFormData | null>(
    null
  );

  const [taskSubmitted, setTaskSubmitted] = React.useState<TaskFormData | null>(
    null
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [users, setUsers] = useState<UserDataTypes[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDataTypes | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const handleSelectionChange = (key: string | number) => {
    setSelected(String(key)); // Convert to string to match state type
  };

  type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
  };

  const VerticalDotsIcon = ({
    size = 24,
    width,
    height,
    ...props
  }: IconSvgProps) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height={size || height}
        role="presentation"
        viewBox="0 0 24 24"
        width={size || width}
        {...props}
      >
        <path
          d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
          fill="currentColor"
        />
      </svg>
    );
  };

  // load all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}user`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`, // Use Bearer token for authorization
            },
          }
        );
        console.log("response", response);
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [user?.token]);

  useEffect(() => {
    if (!isEdit) {
      setSelectedUser(null);
    }
  }, [isOpen, isEdit]);

  // user add / update
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    // Validation
    const newErrors: Record<string, string> = {};

    if (!data.firstName || (data.firstName as string).length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!data.lastName || (data.lastName as string).length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!data.username || (data.username as string).length < 4) {
      newErrors.username = "Username must be at least 4 characters";
    }

    if (!isEdit && (!data.password || (data.password as string).length < 8)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!data.department) {
      newErrors.department = "Please select a department";
    }

    if (!data.role || (data.role as string).length < 4) {
      newErrors.role = "Role must be at least 4 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataWithRole = { ...data, id: selectedUser?.id }; // for update

    try {
      if (!isEdit) {
        // if the form is for create
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}user/register`,
          data,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        // set newly added data
        setUsers((prevUsers) => [
          ...prevUsers,
          {
            id: response.data.id,
            empId: response.data.empId,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            userName: response.data.userName,
            department: response.data.department,
            role: response.data.role,
            completedTasks: response.data.completedTasks,
            notCompletedTasks: response.data.notCompletedTasks,
            completedPercentage: response.data.completedPercentage,
            totalTasks: response.data.totalTasks,
          },
        ]);
      } else {
        // if the form is for edit
        const response = await axios.patch(
          `${import.meta.env.VITE_API_URL}user/update-user`,
          dataWithRole,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser?.id ? { ...user, ...response.data } : user
          )
        );
      }

      setSubmitted(data as unknown as EmployeeFormData);

      onClose(); // Close the modal after successful registration
      setIsEdit(false);
    } catch (error) {
      console.error("Error registering user:", error);
      setErrors({ general: "Failed to register user. Please try again." });
    }
  };

  const departments = [
    {
      value: "HR",
      name: "HR",
    },
    {
      value: "QA",
      name: "QA",
    },
    {
      value: "MGT",
      name: "Management",
    },
    {
      value: "DEV",
      name: "Dev",
    },
  ];

  const employType = ["ADMIN", "EMPLOYEE"];

  const handleEdit = (user: UserDataTypes) => {
    setSelectedUser(user);
    onOpen(); // Open the modal
  };

  const handleDelete = async ({ userId }: { userId: number }) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}user/delete-user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );

    setUsers((prevUsers) =>
      prevUsers.filter((user) => user.id !== response?.data?.id)
    );
  };
  // ------------------------ ^^^^^ USER RELATED ^^^^^ -------------

  // ––––––––––––––––––––––– TASK RELATED ––––––––––––––––––––––––––

  const assignTaskOpen = ({ userId }: { userId: number }) => {
    onOpenTask();
    setTaskUserId(userId);
  };

  const priority = ["HIGH", "MEDIUM", "LOW"];

  // create user wise tasks
  const onSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    // Validation
    const newErrors: Record<string, string> = {};

    if (!data.taskName || (data.taskName as string).length < 2) {
      newErrors.taskName = "Task name must be at least 2 characters";
    }

    if (!data.taskDesc || (data.taskDesc as string).length < 2) {
      newErrors.taskDesc = "Task description must be at least 2 characters";
    }

    if (!data.priority) {
      newErrors.priority = "Please select a priority";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataWithRole = { ...data, userId: taskUserId }; // for update

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}task/create-task`,
        dataWithRole,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      console.log("response", response.data);

      setTaskSubmitted(data as unknown as TaskFormData);

      onCloseTask();
      setTaskUserId(null);
    } catch (error) {
      console.error("Error registering user:", error);
      setErrors({ general: "Failed to register user. Please try again." });
    }
  };
  // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  return (
    <Layout username={user?.name}>
      <div className="flex w-full flex-col">
        <Tabs
          aria-label="Options"
          selectedKey={selected}
          onSelectionChange={handleSelectionChange}
        >
          <Tab key="analytics" title="Analytics">
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mt-4">
                  Task Completion Analytics
                </h1>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {users.map((us, index) => (
                    <Card
                      key={index}
                      className="max-w-[400px] p-4 bg-content1 rounded-md"
                    >
                      <CardHeader className="flex gap-3">
                        <div className="flex gap-5">
                          <Avatar
                            isBordered
                            radius="full"
                            size="md"
                            src="https://heroui.com/avatars/avatar-1.png"
                          />
                          <div className="flex flex-col gap-1 items-start justify-center">
                            <h4 className="text-small font-semibold leading-none text-default-600">
                              {us.firstName} {us.lastName}
                            </h4>
                            <h5 className="text-small tracking-tight text-default-400">
                              {
                                departments.find(
                                  (dept) => dept.value === us.department
                                )?.name
                              }
                            </h5>
                          </div>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardBody>
                        <Progress
                          classNames={{
                            base: "max-w-md",
                            track: "drop-shadow-md border border-default",
                            indicator:
                              "bg-gradient-to-r from-pink-500 to-yellow-500",
                            label:
                              "tracking-wider font-medium text-default-600",
                            value: "text-foreground/60",
                          }}
                          label="Total Completed Task"
                          radius="sm"
                          showValueLabel={true}
                          size="sm"
                          value={us.completedPercentage}
                        />
                      </CardBody>
                      <Divider />
                      <CardFooter>
                        <h1>
                          {us.completedTasks} of {us.totalTasks} tasks completed
                        </h1>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="employees" title="Employees">
            <Card>
              <CardBody>
                <div className="flex gap-4 items-center justify-end mb-4">
                  <Button
                    color="primary"
                    startContent={
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4V20M4 12H20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    onPress={onOpen}
                  >
                    Add Employee
                  </Button>
                </div>
                <Table aria-label="Example static collection table">
                  <TableHeader>
                    <TableColumn>EMPLOYEE ID</TableColumn>
                    <TableColumn>FIRST NAME</TableColumn>
                    <TableColumn>LAST NAME</TableColumn>
                    <TableColumn>USERNAME</TableColumn>
                    <TableColumn>DEPARTMENT</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {users.map((us, index) => (
                      <TableRow key={index}>
                        <TableCell>{us.empId}</TableCell>
                        <TableCell>{us.firstName}</TableCell>
                        <TableCell>{us.lastName}</TableCell>
                        <TableCell>{us.userName}</TableCell>
                        <TableCell>{us.department}</TableCell>
                        <TableCell>
                          <div className="relative flex tems-center gap-2">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <VerticalDotsIcon className="text-default-300" />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu
                                disabledKeys={
                                  us.id === user?.user_id ? ["delete"] : []
                                }
                              >
                                <DropdownItem
                                  key="edit"
                                  onPress={() => {
                                    handleEdit(us);
                                    setIsEdit(true);
                                  }}
                                >
                                  Edit
                                </DropdownItem>
                                <DropdownItem
                                  key="assign_task"
                                  onPress={() =>
                                    assignTaskOpen({ userId: us.id })
                                  }
                                >
                                  Assign Task
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  onPress={() =>
                                    handleDelete({ userId: us.id })
                                  }
                                  className="text-danger"
                                  color="danger"
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      {/* Employee Modal */}
      <Modal
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <Form
                className="w-full justify-center items-center"
                validationErrors={errors}
                onReset={() => setSubmitted(null)}
                onSubmit={onSubmit}
              >
                <ModalHeader className="flex flex-col gap-1">
                  Add New Employee
                </ModalHeader>
                <ModalBody className="gap-6 px-8">
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    type="text"
                    name="firstName"
                    size="lg"
                    fullWidth
                    className="w-full lg:w-96"
                    isRequired
                    labelPlacement="outside"
                    minLength={2}
                    errorMessage={errors?.firstName}
                    value={selectedUser?.firstName || ""}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({
                        ...prev!,
                        firstName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    type="text"
                    name="lastName"
                    size="lg"
                    fullWidth
                    isRequired
                    labelPlacement="outside"
                    minLength={2}
                    errorMessage={errors?.lastName}
                    value={selectedUser?.lastName || ""}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({
                        ...prev!,
                        lastName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Username"
                    placeholder="Enter username"
                    type="text"
                    name="username"
                    size="lg"
                    fullWidth
                    isRequired
                    labelPlacement="outside"
                    minLength={4}
                    errorMessage={errors?.username}
                    value={selectedUser?.userName || ""}
                    onChange={(e) =>
                      setSelectedUser((prev) => ({
                        ...prev!,
                        userName: e.target.value,
                      }))
                    }
                  />
                  {!isEdit && (
                    <Input
                      label="Password"
                      placeholder="Enter password"
                      type="password"
                      name="password"
                      size="lg"
                      fullWidth
                      isRequired
                      labelPlacement="outside"
                      minLength={8}
                      errorMessage={errors?.password}
                    />
                  )}
                  <Select
                    label="Department"
                    placeholder="Select a department"
                    name="department"
                    size="lg"
                    fullWidth
                    isRequired
                    labelPlacement="outside"
                    errorMessage={errors?.department}
                    defaultSelectedKeys={
                      selectedUser?.department ? [selectedUser.department] : []
                    }
                    onSelectionChange={(keys) => {
                      // Handle both Set and single key cases
                      const selectedKey =
                        keys instanceof Set ? Array.from(keys)[0] : keys;

                      setSelectedUser((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          department: selectedKey?.toString() || "",
                        };
                      });
                    }}
                  >
                    {departments.map((dep) => (
                      <SelectItem key={dep.value}>{dep.name}</SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Staff Role"
                    placeholder="Select a staff role"
                    name="role"
                    size="lg"
                    fullWidth
                    isRequired
                    labelPlacement="outside"
                    errorMessage={errors?.role}
                    defaultSelectedKeys={
                      selectedUser?.role ? [selectedUser.role] : []
                    }
                    onSelectionChange={(keys) => {
                      // Handle both Set and single key cases
                      const selectedKey =
                        keys instanceof Set ? Array.from(keys)[0] : keys;

                      setSelectedUser((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          role: selectedKey?.toString() || "",
                        };
                      });
                    }}
                  >
                    {employType.map((type) => (
                      <SelectItem key={type}>{type}</SelectItem>
                    ))}
                  </Select>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      onClose();
                      setIsEdit(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit">
                    Add Employee
                  </Button>
                </ModalFooter>
              </Form>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* -------------- */}

      {/* Task Modal */}
      <Modal
        isOpen={isOpenTask}
        placement="top-center"
        onOpenChange={onOpenChangeTask}
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        hideCloseButton
      >
        <ModalContent>
          {(onCloseTask) => (
            <>
              <Form
                className="w-full justify-center items-center"
                validationErrors={errors}
                onReset={() => setTaskSubmitted(null)}
                onSubmit={onSubmitTask}
              >
                <ModalHeader className="flex flex-col gap-1">
                  Add Task
                </ModalHeader>
                <ModalBody className="gap-6 px-8">
                  {/* Task Name Input */}
                  <Input
                    label="Task Name"
                    name="taskName"
                    placeholder="Enter task name"
                    isRequired
                    variant="bordered"
                    fullWidth
                    className="w-full lg:w-96"
                  />

                  {/* Task Description Textarea */}
                  <Textarea
                    label="Task Description"
                    name="taskDesc"
                    placeholder="Enter task description"
                    minRows={3}
                    variant="bordered"
                    isRequired
                  />

                  {/* Priority Select */}
                  <Select
                    label="Priority"
                    name="priority"
                    placeholder="Select priority"
                    isRequired
                    variant="bordered"
                  >
                    {priority.map((val) => (
                      <SelectItem key={val}>{val}</SelectItem>
                    ))}
                  </Select>

                  {/* Date Input */}
                  <Input
                    label="Due Date"
                    name="dueDate"
                    type="date"
                    isRequired
                    variant="bordered"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      onCloseTask();
                      setTaskUserId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit">
                    Add Task
                  </Button>
                </ModalFooter>
              </Form>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* ---------- */}
    </Layout>
  );
};

export default AdminDashboard;

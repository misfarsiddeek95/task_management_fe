import React, { SVGProps, useEffect, useState } from "react";
import { Layout } from "./Layout";
import {
  Button,
  Card,
  CardBody,
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
}

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null"); // logged in detail
  const [selected, setSelected] = React.useState<string>("analytics");

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [empSubmitted, setEmpSubmitted] =
    React.useState<EmployeeFormData | null>(null);

  const [empErrors, setEmpErrors] = React.useState<Record<string, string>>({});

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

    if (Object.keys(newErrors).length > 0) {
      setEmpErrors(newErrors);
      return;
    }

    if (!data.role || (data.role as string).length < 4) {
      newErrors.role = "Role must be at least 4 characters";
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

      setEmpSubmitted(data as unknown as EmployeeFormData);

      onClose(); // Close the modal after successful registration
      setIsEdit(false);
    } catch (error) {
      console.error("Error registering user:", error);
      setEmpErrors({ general: "Failed to register user. Please try again." });
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
              <CardBody>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
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
                                <DropdownItem key="assign_task">
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
                validationErrors={empErrors}
                onReset={() => setEmpSubmitted(null)}
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
                    errorMessage={empErrors?.firstName}
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
                    errorMessage={empErrors?.lastName}
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
                    errorMessage={empErrors?.username}
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
                      errorMessage={empErrors?.password}
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
                    errorMessage={empErrors?.department}
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
                      <SelectItem key={dep.value} value={dep.value}>
                        {dep.name}
                      </SelectItem>
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
                    errorMessage={empErrors?.role}
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
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
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
    </Layout>
  );
};

export default AdminDashboard;

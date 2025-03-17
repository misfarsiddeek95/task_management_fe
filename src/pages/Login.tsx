import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}auth/login`,
        {
          username,
          password,
        },
        { withCredentials: true }
      );

      // Extract data from the response
      const { access_token, role, name } = response.data;

      // Create a user object
      const user = {
        token: access_token, // Store the JWT token
        role, // Store the user's role
        name: name, // Store the user's name
      };

      // Save the user object in localStorage as a JSON string
      localStorage.setItem("user", JSON.stringify(user));

      if (role === "ADMIN") {
        navigate("/admin/dashboard"); // Redirect to admin dashboard
      } else if (role === "EMPLOYEE") {
        navigate("/employee/dashboard"); // Redirect to employee dashboard
      }
    } catch (err) {
      const error = err as AxiosError; // Explicitly cast to AxiosError
      console.log(error);

      if (error.response) {
        const errorMessage = (error.response.data as { message?: string })
          .message;

        setError(errorMessage || "An error occurred");
      } else if (error.request) {
        setError("No response from server");
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Form
          className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md"
          onSubmit={handleLogin}
        >
          <h2 className="text-2xl font-bold text-center">Sign In</h2>

          <Input
            label="Username"
            name="username"
            placeholder="Enter your username"
            variant="bordered"
            labelPlacement="outside"
            isRequired
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            variant="bordered"
            labelPlacement="outside"
            isRequired
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <Button type="submit" color="primary" fullWidth>
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
}

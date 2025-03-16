import React from "react";
import { Layout } from "./Layout";

const EmployeeDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return (
    <Layout username={user?.name}>
      <div className="p-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
        <p>Your content goes here...</p>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;

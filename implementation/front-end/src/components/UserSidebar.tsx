import React, { useState, useEffect } from "react";
import { Drawer, Button, message } from "antd";
import { apiGet, apiPost } from "../request";
import { UserOutlined } from "@ant-design/icons";
import "./UserSidebar.css";

const UserSidebar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null); // Removed password for security
  const [error, setError] = useState<string>("");

  const fetchUserData = async () => {
    try {
      const result = await apiGet("/users/info");
      if (result.code === 0) {
        setUser(result.data);
      } else {
        setError(result.msg || "Failed to fetch user info.");
      }
    } catch (err) {
      const typedError = err as Error;
      setError(typedError.message || "An unexpected error occurred.");
    }
  };

  const showDrawer = () => {
    setVisible(true);
    fetchUserData();
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleLogout = async () => {
    try {
      const result = await apiPost("/users/logout", {});
      if (result.code === 0) {
        message.success("Logout successful");
        localStorage.removeItem("token");
        window.location.href = "/";
      } else {
        message.error(result.msg || "Failed to log out.");
      }
    } catch (err) {
      const typedError = err as Error;
      message.error(
        typedError.message || "An error occurred while logging out."
      );
    }
  };

  return (
    <>
      <Button
        icon={<UserOutlined />}
        onClick={showDrawer}
        style={{ border: "none", background: "none" }}
      ></Button>

      <Drawer
        title="User Info"
        placement="right"
        onClose={onClose}
        open={visible}
        width={320}
      >
        {error && <p className="error-message">{error}</p>}
        {user ? (
          <div>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <Button type="primary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : (
          !error && <p>Loading...</p>
        )}
      </Drawer>
    </>
  );
};

export default UserSidebar;

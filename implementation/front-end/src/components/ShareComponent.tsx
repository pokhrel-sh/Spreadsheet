import React, { useState, useContext, createContext } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Checkbox,
  Radio,
  Space,
  Table,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { SpreadsheetContext } from "./SpreadsheetContext";

// Create a new context for storing permissions data
// PermissionsContext will be used to pass permissions
const PermissionsContext = createContext<{
  [userId: string]: { name: string; permission: string };
}>({});

const ShareComponent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState<
    "share" | "template" | "permissions"
  >("share");

  // Get the permission
  const { permissions } = useContext(SpreadsheetContext);

  // Convert permissions object to an array of objects
  const permissionData = Object.keys(permissions).map((userId) => ({
    key: userId,
    ...permissions[userId],
  }));
  const handleFinish = (values: any) => {
    console.log("Submitted Data:", values);
    setVisible(false);
  };

  const renderContent = () => {
    if (currentTab === "permissions") {
      return (
        <>
          <h3>Permission Management</h3>
          <Table
            dataSource={permissionData}
            pagination={false}
            columns={[
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Permission",
                key: "permission",
                render: (_, record) => (
                  <Radio.Group defaultValue={record.permission}>
                    <Radio value="Owner">Owner</Radio>
                    <Radio value="Editor">Editor</Radio>
                    <Radio value="Reviewer">Reviewer</Radio>
                    <Radio value="Viewer">Viewer</Radio>
                  </Radio.Group>
                ),
              },
            ]}
          />
          <div style={{ marginTop: 20 }}>
            <Button type="primary">Save Changes</Button>
          </div>
        </>
      );
    }

    if (currentTab === "template") {
      return (
        <div>
          <h3>Share as a Template</h3>
          <p>This feature is under development.</p>
        </div>
      );
    }
    return (
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item label="Permissions">
          <Checkbox.Group>
            <Checkbox value="edit">Edit</Checkbox>
            <Checkbox value="review">Review</Checkbox>
            <Checkbox value="view">View</Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<UploadOutlined />} htmlType="submit">
            Share
          </Button>
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        Share
      </Button>
      <Modal
        title="Sharing Options"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Space style={{ marginBottom: 20 }}>
          <Button
            type={currentTab === "share" ? "primary" : "default"}
            onClick={() => setCurrentTab("share")}
          >
            Share
          </Button>
          <Button
            type={currentTab === "template" ? "primary" : "default"}
            onClick={() => setCurrentTab("template")}
          >
            Share as a Template
          </Button>
          <Button
            type={currentTab === "permissions" ? "primary" : "default"}
            onClick={() => setCurrentTab("permissions")}
          >
            Permission Management
          </Button>
        </Space>
        {renderContent()}
      </Modal>
    </>
  );
};

// Mock permissions data
export const App: React.FC = () => {
  const mockPermissions = {
    user_1: { name: "Shishir", permission: "Owner" },
    user_2: { name: "Ganesh", permission: "Editor" },
    user_3: { name: "Aofei", permission: "Reviewer" },
    user_4: { name: "Frank", permission: "Viewer" },
    user_5: { name: "Teacher", permission: "Editor" },
  };

  return (
    <PermissionsContext.Provider value={mockPermissions}>
      <ShareComponent />
    </PermissionsContext.Provider>
  );
};

export default ShareComponent;

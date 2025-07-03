import React, { useContext, useState } from "react";
import { Space, Button, Typography, Drawer } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import UserSidebar from "./UserSidebar";
import { HistorySidebar } from "./HistorySidebar";
import ShareComponent from "./ShareComponent";
import ApiSidebar from "./ApiSidebar";
import "./Toolbar.css";
import { SpreadsheetContext } from "./SpreadsheetContext";
import SidebarWithApiInput from "./SidebarWithApiInput";
import ManageSidebar from "./ManageSidebar";
const { Text } = Typography;

const Toolbar = () => {
  const [isApiSidebarVisible, setApiSidebarVisible] = useState(false);
  const { setLastUpdated, lastUpdated } = useContext(SpreadsheetContext);
  const [isManageSidebarVisible, setManageSidebarVisible] = useState(false);

  return (
    <div className="toolbar">
      {/* Left side tool icons */}
      <Space size="middle">
        <UserSidebar />

        <div className="divider" />

        {/* Replace Bold, Italic, etc. buttons with ApiSidebar trigger */}
        <SidebarWithApiInput />

        <div className="divider" />
        <ManageSidebar />
        <HistorySidebar />
      </Space>

      {/* Right side toolbar items */}
      <div className="right-section">
        <Space>
          <Text type="secondary">Last updated: {lastUpdated || "Never"}</Text>

          <div className="divider" />

          {/* Group online members */}
          <UserOutlined style={{ color: "#ff4500" }} />
          <UserOutlined style={{ color: "#3cb371" }} />
          <UserOutlined style={{ color: "#4682b4" }} />
          <UserOutlined style={{ color: "#888888" }} />

          {/* ShareComponent */}
          <ShareComponent />
        </Space>
      </div>

      {/* ApiSidebar Drawer */}
      <Drawer
        title="API Sidebar"
        placement="right"
        onClose={() => setApiSidebarVisible(false)} // 关闭 ApiSidebar
        visible={isApiSidebarVisible}
        width={400} // 设置宽度
      >
        <ApiSidebar /> {/* 渲染 ApiSidebar */}
      </Drawer>
    </div>
  );
};

export default Toolbar;

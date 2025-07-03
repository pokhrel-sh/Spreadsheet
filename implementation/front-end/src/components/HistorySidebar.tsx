import React, { useState, useEffect, useContext, useCallback } from "react";
import { Drawer, List, Button, message, Input } from "antd";
import {
  ClockCircleOutlined,
  EyeOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { apiGet, apiPost } from "../request";
import { HistoryEntry, SpreadsheetContext } from "./SpreadsheetContext";
import "./HistorySidebar.css";

export const HistorySidebar = () => {
  const { docId, history, saveVersion, getHistoryVersions, rollbackVersion } =
    useContext(SpreadsheetContext);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const showDrawer = async () => {
    setVisible(true);
    try {
      setLoading(true);
      await getHistoryVersions();
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setVisible(false);
  };

  const saveCurrentVersion = async () => {
    if (!description) {
      message.warning("Please provide a description");
      return;
    }
    try {
      await saveVersion(description);
      message.success("Version saved successfully");
      setDescription("");
    } catch (err) {
      message.error(err.message || "Failed to save version");
    }
  };

  return (
    <>
      <Button icon={<ClockCircleOutlined />} onClick={showDrawer} />

      <Drawer
        title="History"
        placement="right"
        onClose={onClose}
        visible={visible}
        width={400}
      >
        <Input
          placeholder="Description for the new version"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={saveCurrentVersion}
        >
          Save Version
        </Button>

        <List
          loading={loading}
          dataSource={history}
          renderItem={(item: HistoryEntry) => (
            <List.Item
              actions={[
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => message.info(`Description: ${item.descript}`)}
                />,
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => rollbackVersion(item._id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={`${item.name}`}
                description={`Created by ${item.user} on ${item.datetime}`}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { SpreadsheetModel } from "../basic-implementation/SpreadsheetModel";
import { ICell } from "../basic-implementation/ICell";
import { VersionHistory } from "../basic-implementation/VersionHistory";
import { apiGet, apiPost } from "../request";
import { connectSocket } from "utils/socket";

interface Permission {
  name: string;
  permission: string;
}

export interface HistoryEntry {
  descript: string;
  _id: string;
  name: string;
  user: string;
  datetime: string;
}

interface SpreadsheetContextType {
  docId: string;
  permissions: { [userId: string]: Permission };
  history: HistoryEntry[];
  getCell: (row: number, col: number) => any;
  clearAllCells: () => void;
  updateCell: (row: number, col: number, value: string) => boolean;
  saveVersion: (description: string) => Promise<void>;
  getHistoryVersions: (limit?: number, offsetID?: string) => Promise<void>;
  addPermission: (userId: string, permission: Permission) => void;
  rollbackVersion: (id: string) => Promise<void>;
  lastUpdated: string | null;
  setLastUpdated: (time: string) => void;
  setModelVersion: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  error: string | null;
  model: SpreadsheetModel;
  rowCount: number;
  colCount: number;
  setColCount: React.Dispatch<React.SetStateAction<number>>;
  setRowCount: React.Dispatch<React.SetStateAction<number>>;
  addRow: (index: number, direction: "above" | "below") => void;
  addColumn: (index: number, direction: "left" | "right") => void;
  removeRow: (index: number) => void;
  removeColumn: (index: number) => void;
}

export const SpreadsheetContext = createContext<SpreadsheetContextType>({
  docId: "",
  permissions: {},
  history: [],
  getCell: () => null,
  clearAllCells: () => {},
  updateCell: () => false,
  setModelVersion: () => {},
  addRow: () => {},
  addColumn: () => {},
  removeRow: () => {},
  removeColumn: () => {},
  saveVersion: async () => {},
  getHistoryVersions: async () => {},
  rollbackVersion: async () => {},
  addPermission: () => {},
  lastUpdated: null,
  setLastUpdated: () => {},
  loading: true,
  error: null,
  model: SpreadsheetModel.getInstance(),
  rowCount: 10,
  colCount: 20,
  setColCount: () => {},
  setRowCount: () => {},
});

export const SpreadsheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [docId, setDocId] = useState<string>("");
  const [permissions, setPermissions] = useState<{
    [userId: string]: Permission;
  }>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modelVersion, setModelVersion] = useState<number>(0);

  const [rowCount, setRowCount] = useState(10);
  const [colCount, setColCount] = useState(20);

  const model = SpreadsheetModel.getInstance();
  const versionHistory = new VersionHistory();

  const getDoc = async (docId: string) => {
    try {
      const response = await apiGet(`/docs/${docId}`);
      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to fetch document");
      }
      return response.data;
    } catch (err: any) {
      console.error("Error fetching document data:", err.message || err);
      setError("Failed to fetch document data");
      throw err;
    }
  };

  const createNewDoc = async (name: string) => {
    try {
      const response = await apiPost(`/docs`, { name });
      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to create new document");
      }
      console.log("Correctly created new doc");
      console.log(response.data._id);
      setDocId(response.data._id);
      return response;
    } catch (err: any) {
      console.error("Error creating new document:", err.message || err);
      setError("Failed to create new document");
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // check if login
        const userInfo = await apiGet(`/users/info`);

        if (userInfo.code !== 0) {
          return;
        }

        const routerDocId = window.location.pathname.split("/")[2];
        if (routerDocId) {
          setDocId(routerDocId);
          loadDoc(routerDocId).then(() => initSocket(routerDocId));
        } else {
          const initialnName = "Basic Spreadsheet";
          const response = await createNewDoc(initialnName);
          const newDocId = response.data._id;

          // jump to the new doc and paas the new doc id in router params
          location.href = `/spreadsheet/${newDocId}`;
        }
      } catch (err: any) {
        console.log(error);
        console.error("Error fetching spreadsheet data:", err.message || err);
        setError(err.message || "Failed to load spreadsheet data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [model]);

  const loadDoc = async (docId: string) => {
    const response = await getDoc(docId);

    if (response) {
      console.log(response);
      const cells = response.doc.cells;

      model.clearAllCells();

      for (let i = 0; i < cells.length; i++) {
        for (let j = 0; j < cells[i].length; j++) {
          model.updateCell(j, i, cells[i][j].value);
        }
      }

      setModelVersion((prev) => prev + 1);
    } else {
      throw new Error("Failed to load document");
    }
  };

  const initSocket = async (docId: string) => {
    const userInfo = await apiGet(`/users/info`);

    if (userInfo.code !== 0) {
      throw new Error("Failed to fetch user info");
    }

    // Init socket connection
    connectSocket(userInfo.data._id, (update) => {
      console.log("Received update:", update);
      const cells = update.cells;
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        model.updateCell(cell.position[1], cell.position[0], cell.value);
      }
      setModelVersion((prev) => prev + 1);
    }).then((socket) => {
      console.log("Socket connected");
      socket.emit("message", {
        type: "JOIN",
        data: {
          docID: docId,
        },
      });
    });
  };

  const addPermission = (userId: string, permission: Permission) => {
    setPermissions((prev) => ({ ...prev, [userId]: permission }));
  };

  const saveVersion = async (description: string) => {
    try {
      // 提交到后端保存新版本
      const response = await apiPost(`/docs/${docId}/history`, { description });
      console.log(response);

      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to save version");
      }

      // Mock loading before refresh
      const savedVersion: HistoryEntry = {
        _id: "loading",
        name: `Version lading`,
        descript: "loading",
        user: "loading",
        datetime: "loading",
      };

      // 更新 history 状态，将新版本插入到本地历史记录
      setHistory((prev) => [...prev, savedVersion]);

      console.log("Version saved successfully:", savedVersion);

      // 可选：重新获取完整历史记录列表（确保一致性）
      const updatedResponse = await apiGet(`/docs/${docId}/history/list`, {
        limit: 10,
      });
      console.log("Updated history list:", updatedResponse);

      // 更新完整的历史记录状态
      const updatedHistory = (updatedResponse.data || []).map(
        (version: any) => ({
          _id: version._id,
          name: `Version ${version.versionNumber}`,
          descript: version.description || "No description",
          user: version.createdUser?.username || "Unknown User",
          datetime: new Date(version.createdTime * 1000).toISOString(),
        })
      );
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || "Failed to save version");
      console.error("Error saving version:", err);
      throw err;
    }
  };

  const getHistoryVersions = async (limit = 10) => {
    try {
      console.log(docId);
      const response = await apiGet(`/docs/${docId}/history/list`, { limit });
      console.log(response);

      if (response.code !== 0) {
        console.log(error);
        throw new Error(response.msg || "Failed to fetch history versions");
      }

      const versions = response.data || [];
      // 映射后端字段到前端 HistoryEntry 接口
      const mappedHistory = versions.map((version: any) => ({
        _id: version._id, // 历史版本的唯一标识
        name: `Version ${version.versionNumber}`, // 使用版本号生成名称
        descript: version.description || "No description", // 默认值处理
        user: version.createdUser?.username || "Unknown User", // 创建者用户名
        datetime: new Date(version.createdTime * 1000).toISOString(), // 转换 Unix 时间戳为 ISO 字符串
        grid: [], // 后端未返回 `grid`，可以设置为空数组或根据需求加载
      }));

      setHistory(mappedHistory); // 更新状态
    } catch (err: any) {
      setError(err.message || "Failed to fetch or initialize history versions");
      throw err;
    }
  };

  const ensureHistoryVersions = async () => {
    try {
      await getHistoryVersions();
      if (history.length === 0) {
        await saveVersion("Initial version");
        await getHistoryVersions();
      }
    } catch (err: any) {
      setError(err.message || "Failed to ensure history versions");
      throw err;
    }
  };

  const rollbackVersion = async (id: string) => {
    try {
      // 向后端发送回滚请求
      const response = await apiPost(`/docs/history/${id}/rollback`, {});
      console.log("rollbackData");
      console.log(response);

      if (response.code !== 0) {
        throw new Error(response.msg || "Failed to rollback version");
      }

      loadDoc(docId);

      // // 获取回滚后的版本信息
      // const rolledBackVersion = response.data;

      // if (!rolledBackVersion || !rolledBackVersion.cells) {
      //   throw new Error("Invalid rollback data from server");
      // }

      // // 获取 SpreadsheetModel 实例
      // const newGrid = rolledBackVersion.cells; // 后端返回的 cells 数据

      // // 遍历新网格数据，并映射到前端的 grid
      // newGrid.forEach(
      //   (
      //     row: Array<{ formula?: string; value?: string | number }>,
      //     rowIndex: number
      //   ) => {
      //     row.forEach((cellData, colIndex: number) => {
      //       if (!cellData) {
      //         model.updateCell(rowIndex, colIndex, null); // 清空单元格
      //       } else if (cellData.formula) {
      //         model.updateCell(rowIndex, colIndex, cellData.formula); // 使用公式更新
      //       } else if (
      //         typeof cellData.value === "number" ||
      //         typeof cellData.value === "string"
      //       ) {
      //         model.updateCell(rowIndex, colIndex, cellData.value.toString()); // 使用值更新
      //       } else {
      //         model.updateCell(rowIndex, colIndex, null); // 保持为空
      //       }
      //     });
      //   }
      // );

      // 更新历史记录
      await getHistoryVersions(); // 获取最新的历史记录

      // 更新最近更新时间
      const currentTime = new Date().toISOString();
      setLastUpdated(currentTime);

      console.log("Rollback successful to version ID:", id);
    } catch (err: any) {
      setError(err.message || "Failed to rollback version");
      console.error("Error during rollback:", err);
      throw err;
    }
  };

  // Add and remove row and column functions
  const handleAddRow = (index: number, direction: "above" | "below") => {
    const position = direction === "above" ? index : index + 1;
    model.addRow(position);
    setRowCount((prevCount) => prevCount + 1);
  };

  // Remove row function
  const handleRemoveRow = (index: number) => {
    model.removeRow(index);
    setRowCount((prevCount) => prevCount - 1);
  };

  // Add and remove column functions
  const handleAddColumn = (index: number, direction: "left" | "right") => {
    const position = direction === "left" ? index : index + 1;
    model.addColumn(position);
    setColCount((prevCount) => prevCount + 1);
  };

  // Remove column function
  const handleRemoveColumn = (index: number) => {
    model.removeColumn(index);
    setColCount((prevCount) => prevCount - 1);
  };

  return (
    <SpreadsheetContext.Provider
      value={{
        docId,
        permissions,
        history,
        getCell: (row: number, col: number) => model.getCell(row, col),
        clearAllCells: model.clearAllCells.bind(model),
        updateCell: model.updateCell.bind(model),
        setModelVersion,
        saveVersion,
        getHistoryVersions,
        addPermission,
        lastUpdated,
        setLastUpdated,
        loading,
        error,
        rollbackVersion,
        model,
        rowCount,
        colCount,
        setRowCount,
        setColCount,
        addRow: handleAddRow,
        addColumn: handleAddColumn,
        removeRow: handleRemoveRow,
        removeColumn: handleRemoveColumn,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
};

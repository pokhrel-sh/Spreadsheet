import { CellType } from "../models/docs";

export enum MessageType {
  // Server side
  JOINED = "JOINED",
  EXITED = "EXITED",
  FOCUSED = "FOCUSED",
  UPDATED = "UPDATED",
  ERROR = "ERROR",
  // Client side
  JOIN = "JOIN",
  EXIT = "EXIT",
  FOCUS = "FOCUS",
  UPDATE = "UPDATE",
}

export interface UserInfo {
  id: string;
  name: string;
}

export type Position = [number, number];

export interface Cell {
  position: Position;
  type: CellType;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
}

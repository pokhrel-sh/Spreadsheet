import mongoose from "mongoose";

export enum CellType {
  FORMULA = "FORMULA",
  RANGE = "RANGE",
  REF = "REF",
  STRING = "STRING",
  NUMBER = "NUMBER",
}

export enum Role {
  EDITOR = "EDITOR",
  VIEWER = "VIEWER",
}

export interface ICell {
  type: CellType;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: any;
}

export interface IDoc extends mongoose.Document {
  name: string;
  cells: ICell[][];
  users: Record<string, Role>;
  onlineUsers: Record<string, { focus: [string, number]; socketID: string }>;
  versionCount: number;
  createdTime: number;
  updatedTime: number;
}

const docSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cells: { type: Array, required: true },
  users: { type: Object, required: true },
  onlineUsers: { type: Object, required: true },
  versionCount: { type: Number, required: true },
  createdTime: { type: Number, required: true },
  updatedTime: { type: Number, required: true },
});

docSchema.pre("save", function (next) {
  this.updatedTime = Math.floor(Date.now() / 1000);
  next();
});

docSchema.pre("updateOne", function (next) {
  this.set({ updatedTime: Math.floor(Date.now() / 1000) });
  next();
});

docSchema.pre("updateMany", function (next) {
  this.set({ updatedTime: Math.floor(Date.now() / 1000) });
  next();
});

export const Doc = mongoose.model<IDoc>("Doc", docSchema);

export interface IDocHistoryVersion extends mongoose.Document {
  docID: string;
  versionNumber: number;
  description: string;
  cells: ICell[][];
  createdUser: string;
  createdTime: number;
}

const docHistoryVersionSchema = new mongoose.Schema({
  docID: { type: String, required: true },
  versionNumber: { type: Number, required: true },
  description: { type: String, required: true },
  cells: { type: Array, required: true },
  createdUser: { type: String, required: true },
  createdTime: { type: Number, required: true },
});

export const DocHistoryVersion = mongoose.model<IDocHistoryVersion>(
  "DocHistoryVersion",
  docHistoryVersionSchema
);

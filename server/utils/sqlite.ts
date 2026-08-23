import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync("data.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS places(
    id TEXT PRIMARY KEY,
    longitude REAL,
    latitude REAL,
    name TEXT,
    pos INTEGER
    )
    `);

export interface placeData {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  pos: number;
}

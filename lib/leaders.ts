import fs from "fs";
import path from "path";
import { Leader } from "@/models/leader";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "leaders.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
}

function readStorage(): Leader[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw) as Leader[];
  } catch (err) {
    return [];
  }
}

function writeStorage(leaders: Leader[]) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(leaders, null, 2));
}

export function getLeaders(): Leader[] {
  return readStorage();
}

export function getLeaderById(id: string): Leader | undefined {
  return readStorage().find((l) => l.id === id);
}

export function createLeader(
  name: string,
  colors: string[],
  imageUrl: string,
  altImageUrl?: string,
): Leader {
  const storage = readStorage();
  const leader: Leader = {
    id: Date.now().toString(),
    name,
    colors,
    imageUrl,
    altImageUrl,
    createdAt: new Date().toISOString(),
  };
  storage.push(leader);
  writeStorage(storage);
  return leader;
}

export function updateLeader(
  id: string,
  name: string,
  colors: string[],
  imageUrl: string,
  altImageUrl?: string,
): Leader | undefined {
  const storage = readStorage();
  const idx = storage.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;
  const leader = storage[idx];
  leader.name = name;
  leader.colors = colors;
  leader.imageUrl = imageUrl;
  leader.altImageUrl = altImageUrl;
  storage[idx] = leader;
  writeStorage(storage);
  return leader;
}

export function deleteLeader(id: string): boolean {
  const storage = readStorage();
  const filtered = storage.filter((l) => l.id !== id);
  if (filtered.length === storage.length) return false;
  writeStorage(filtered);
  return true;
}

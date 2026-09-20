import { readFileSync } from "node:fs";
import path from "node:path";

export type AlphabetEntry = {
  id: string;
  character: string;
  category: string;
  letterName: string;
  letterNamePronunciation: string;
  pronunciation: string;
  example: string;
  exampleMeaning: string;
  notes: string;
};

type AlphabetSourceEntry = {
  ID: string;
  "Chữ cái": string;
  "Loại": string;
  "Tên chữ": string;
  "Phiên âm tên chữ": string;
  "Phiên âm": string;
  "Ví dụ": string;
  "Nghĩa ví dụ": string;
  "Ghi chú": string;
};

const alphabetSource = JSON.parse(
  readFileSync(path.join(process.cwd(), "..", "data", "korean", "alphabet.json"), "utf8"),
) as AlphabetSourceEntry[];

export const alphabetEntries: AlphabetEntry[] = alphabetSource.map((entry) => ({
  id: entry.ID,
  character: entry["Chữ cái"],
  category: entry["Loại"],
  letterName: entry["Tên chữ"],
  letterNamePronunciation: entry["Phiên âm tên chữ"],
  pronunciation: entry["Phiên âm"],
  example: entry["Ví dụ"],
  exampleMeaning: entry["Nghĩa ví dụ"],
  notes: entry["Ghi chú"],
}));

export const alphabetCategories = [
  "Tất cả",
  ...Array.from(new Set(alphabetEntries.map((entry) => entry.category))),
];
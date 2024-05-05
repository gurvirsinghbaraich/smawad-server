import path from "path";

export function getBaseDirectoryPath(): string {
  return path.basename(path.basename(__dirname));
}

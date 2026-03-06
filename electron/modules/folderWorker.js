// modules/folderWorker.js
import { parentPort, workerData } from "worker_threads";
import fs from "fs";
import path from "path";

function collectFiles(paths) {
  const files = [];

  function scan(dir) {
    let items;
    try {
      items = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        scan(fullPath);
      } else {
        try {
          const size = fs.statSync(fullPath).size;
          files.push({ fullPath, size });
        } catch {}
      }
    }
  }

  for (const folder of paths) {
    scan(folder);
  }

  return files;
}

const result = collectFiles(workerData);
parentPort.postMessage(result);

import { once } from "node:events";
import { appendFile, mkdir, open, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../data");
await mkdir(dataDir, { recursive: true });

// Creating a file name of current date
const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, "0");
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = currentDate.getFullYear();
const fileName = `${day}-${month}-${year}.txt`;
const filePath = path.join(dataDir, fileName);
await appendFile(filePath, "");

// temporary data store
export let data = [];

export const saveActivitiesToDataFile = async () => {
  const fd = await open(filePath, "a");
  try {
    const stream = await fd.createWriteStream({ autoClose: true });
    const finished = once(stream, "finish");
    for (const obj of data) {
      const chunk = `${JSON.stringify(obj)}\n`;

      if (!stream.write(chunk)) {
        await once(stream, "drain");
      }
    }
    stream.end();
    await finished;
  } catch (err) {
    console.error("there was an error", err);
  } finally {
    await fd.close();
    data.length = 0;
  }
};

export const getDataFileNames = async () => {
  try {
    const files = await readdir(dataDir);
    return files;
  } catch (err) {
    console.error("there was an error ", err);
    return [];
  }
};

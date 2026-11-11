import { appendFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
);
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

let pendingSave = Promise.resolve();

export const saveActivitiesToDataFile = async () => {
  const save = pendingSave.then(async () => {
    const activities = data.slice();
    if (activities.length === 0) return;

    await appendFile(
      filePath,
      activities.map((activity) => `${JSON.stringify(activity)}\n`).join(""),
    );

    const savedActivities = new Set(activities);
    for (let index = data.length - 1; index >= 0; index -= 1) {
      if (savedActivities.has(data[index])) {
        data.splice(index, 1);
      }
    }
  });

  pendingSave = save.catch(() => {});
  return save;
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

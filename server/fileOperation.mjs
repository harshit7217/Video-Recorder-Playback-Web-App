import { once } from "node:events";
import { appendFile, open, readdir, readFile } from "node:fs/promises";

// Creating a file name of current date
const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, "0");
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = currentDate.getFullYear();
const fileName = day + "-" + month + "-" + year + ".txt";
await appendFile(`data/${fileName}`, "");

// temporary data store
export let data = [];
export let fileEntries = [];

export const saveActivitiesToDataFile = async () => {
  const fd = await open(`data/${fileName}`, "a");
  try {
    const stream = await fd.createWriteStream({ autoClose: true });
    const finished = once(stream, "finish");
    for (const obj of data) {
      const chunk = JSON.stringify(obj) + "\n";

      if (!stream.write(chunk)) {
        await stream.write(chunk);
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
  const dataDirectory = "./data";
  try {
    const files = await readdir(dataDirectory);
    return files;
  } catch (err) {
    console.error("there was an error ", err);
  }
};

export const readDataFile = async (filename) => {
  try {
    const fd = await readFile(`./data/${filename}`, "utf8");
    fileEntries = fd
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "")
      .map((line) => JSON.parse(line));
  } catch (err) {
    console.log(err);
  }
};

export const getUniqueKeysFromFile = () => {
  const uniqueKeys = [];
  for (const entry of fileEntries) {
    if (!uniqueKeys.includes(entry.key) && entry.key !== undefined) {
      uniqueKeys.push(entry.key);
    }
  }
  return uniqueKeys;
};

export const getEntriesByKey = (key) => {
  const matchedEntries = [];
  for (const entry of fileEntries) {
    if (entry.key === key) {
      matchedEntries.push(entry);
    }
  }
  return matchedEntries;
};

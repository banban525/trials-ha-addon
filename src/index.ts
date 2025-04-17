import express from "express";
import fs from "fs";

interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: string;
}


function getFiles(path:string):FileInfo[]
{
  if(fs.existsSync(path) === false) {
    return [];
  }
  const fileNames = fs.readdirSync(path);
  const files:FileInfo[] = [];
  for(const fileName of fileNames) {
    const filePath = `${path}/${fileName}`;
    if(fs.statSync(filePath).isDirectory()) {
      files.push(...getFiles(filePath));
    } else {
      const stat = fs.statSync(filePath);

      files.push({
        name: fileName,
        path: filePath,
        size: stat.size,
        lastModified: stat.mtime.toISOString()
      });
    }
  }
  return files;
}


async function main():Promise<void>
{
  // 環境変数をconsoleに出す
  const MQTT_BROKER = process.env.MQTT_BROKER ??"";
  const ECHONET_TARGET_NETWORK = process.env.ECHONET_TARGET_NETWORK ?? "";

  console.log("MQTT_BROKER:", MQTT_BROKER);
  console.log("ECHONET_TARGET_NETWORK:", ECHONET_TARGET_NETWORK);



  const app = express();

  app.use(express.static("public"));
  app.get("/", (req, res) => {

    res.send("hello");
  });

  app.get("/files", (req, res) => {

    const fileInfos:{
      data:FileInfo[],
      ssl:FileInfo[],
      addonConfig:FileInfo[],
    } = {
      data: [],
      ssl: [],
      addonConfig: []
    };

    fileInfos.data = getFiles("/data");
    fileInfos.ssl = getFiles("/ssl");
    fileInfos.addonConfig = getFiles("/addon_config");

    res.json(fileInfos);

  });

  const server = app.listen(8098, ():void => {
    console.log("Server is running on http://localhost:8099");
  });
}

main();

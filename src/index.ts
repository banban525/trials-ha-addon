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
  let testMode = 'C:\\work\\trials-ha-addon\\storage'
  testMode = '';

  // 環境変数をconsoleに出す
  const MQTT_BROKER = process.env.MQTT_BROKER ??"";
  const ECHONET_TARGET_NETWORK = process.env.ECHONET_TARGET_NETWORK ?? "";

  console.log("MQTT_BROKER:", MQTT_BROKER);
  console.log("ECHONET_TARGET_NETWORK:", ECHONET_TARGET_NETWORK);



  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ejs
  app.set("view engine", "ejs");
  app.set("views", "views");


  app.use(express.static("public"));
  app.get("/", (req, res) => {

    res.render("home/index",{});
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



    fileInfos.data = getFiles(`${testMode}/data`);
    fileInfos.ssl = getFiles(`${testMode}/ssl`);
    fileInfos.addonConfig = getFiles(`${testMode}/addon_config`);

    res.render("files/index", {fileInfos});

  });

  app.get("/rawfile", (req, res) => {

    const path = req.query.path?.toString() ?? "";
    if(fs.existsSync(path) === false)
    {
      res.status(404).send("File not found");
      return;
    }

    const content = fs.readFileSync(path, {encoding: "utf-8"});

    res.render("rawfile/index", {path,content});

  });



  const server = app.listen(8098, ():void => {
    console.log("Server is running on http://localhost:8098");
  });
}

main();

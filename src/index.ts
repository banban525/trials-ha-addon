import express from "express";


async function main():Promise<void>
{
  const app = express();

  app.use(express.static("public"));
  app.get("/", (req, res) => {
    res.send("hello");
  });

  const server = app.listen(8099, ():void => {
    console.log("Server is running on http://localhost:8099");
  });
}

main();

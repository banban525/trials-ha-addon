import express from "express";


async function main():Promise<void>
{
  const app = express();

  app.use(express.static("public"));
  app.get("/", (req, res) => {
    res.send("hello");
  });

  const server = app.listen(3000, ():void => {
    console.log("Server is running on http://localhost:3000");
  });
}

main();

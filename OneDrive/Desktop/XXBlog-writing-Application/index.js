require('dotenv').config({path : "\XXBlog-writing-Application\\.env"})
const express = require("express");
const mongoose = require("mongoose");
const {userRouter} = require("./routes/user.js");
const {blogRouter} = require("./routes/blogs.js");

const app = express();

const port = 3000;

app.use(express.json());
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);



async function main(){
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () =>{
    console.log(`Listening on port ${port}`);
  });
}



main();
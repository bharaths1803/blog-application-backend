const {Router} = require("express");
const blogRouter = Router();
const {userMiddleware} = require("../middleware/user.js");
const { userModel, blogModel} = require("../db.js");

blogRouter.post("/write", userMiddleware, async function(req, res){
  const userId = req.userId;
  const {title, description, authors} = req.body;
  const blog = await blogModel.create({
    title : title,
    description : description,
    authors : authors,
    writerId : userId
  });

  console.log(blog._id);

  await userModel.updateOne({
    _id : userId
  },
  {
    $push : {blogs : blog._id}
  }
  );

  res.json({
    message : "Blog has been created",
    blogId : blog._id
  });

});

blogRouter.get("/view/all", userMiddleware, async function(req, res){
  const blogs =  await blogModel.find({});
  if(blogs.length > 0){
    res.json({
      message : "Here's a view of the blogs",
      blogs
    });
  }
  else{ 
    res.json({
      message : "Blogs not found"
    })
  }
});

module.exports = {
  blogRouter
}
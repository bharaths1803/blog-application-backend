const {Router, response} = require("express");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {userModel, blogModel} = require("../db.js");
const { JWT_USER_PASSWORD } = require("../config.js");
const { userMiddleware } = require("../middleware/user.js");

const userRouter = Router();

userRouter.post("/signup", async function(req, res){
  const requiredBody = z.object({
    email : z.string().email().min(3).max(100),
    password : z.string().min(3).max(25),
    firstName : z.string().min(3).max(100),
    lastName : z.string().min(3).max(100)
  });

  const parsedDataWithSuccess = requiredBody.safeParse(req.body);
  if(!parsedDataWithSuccess.success){
    res.json({
      error : parsedDataWithSuccess.error,
      message : "Incorrect format"
    });
  }

  const {email, password, firstName, lastName} = req.body;

  let errorThrown = false;
  try{
    const hashedPassword = await bcrypt.hash(password, 5);

    await userModel.create({
      email : email,
      password : hashedPassword,
      firstName : firstName,
      lastName : lastName
    });
  }catch(e){
    errorThrown = true;
    res.json({
      message : "User already exists"
    })
  }

  if(!errorThrown){
    res.json({
      message : "You have signedup"
    });
  }

});

userRouter.post("/signin", async function(req, res){
  const {email, password} = req.body;
  const user = await userModel.findOne({
    email : email
  });
  if(!user){
    res.json({
      message : "User does not exist"
    })
  }

  const passwordMatch = bcrypt.compare(password, user.password);

  if(passwordMatch){
    const token = jwt.sign({
      id : user._id
    }, JWT_USER_PASSWORD);
    res.json({
      token : token
    });
  }
  else{
    res.json({
      message : "Invalid credentials"
    })
  }
});

userRouter.get("/view/userblogs", userMiddleware, async function(req, res){
  const writerId = req.body.writerId;
  const blogs = await blogModel.find({
    writerId : writerId
  });
  if(blogs.length > 0){
    res.json({
      message : "User with given user Id has the following blogs",
      blogs 
    });
  }
  else{
    res.json({
      message : "User not found or has not written any blogs"
    });
  }
});

userRouter.put("/edit", userMiddleware, async function(req, res){
  const requestorId = req.userId;
  const {blogId, title, description, authors} = req.body;
  const blog = await blogModel.findOne({
    _id : blogId
  });
  if(blog){
    const writerId  = blog.writerId;

    if(writerId == requestorId){
      await blogModel.updateOne({
        _id : blogId
      },
      {
        title : title,
        description : description,
        authors : authors
      });
      res.json({
        message : "Blog update",
        blog
      })
    }

    else{
      res.json({
        message : "You can not edit another user's blog"
      })
    }

  }

  else{
    res.json({
      message : "Blog does not exist"
    });
  }

});

userRouter.delete("/delete", userMiddleware, async function(req, res){
  const requestorId = req.userId;
  const { blogId } = req.body;

  const blog = await blogModel.findOne({
    _id : blogId
  });

  if(blog){
    const writerId = blog.writerId;
    if(writerId == requestorId){
      await blogModel.deleteOne({
        _id : blogId
      });
      await userModel.updateMany({
        _id : writerId
      },
      {
        $pull : {blogs : blogId}
      });
      res.json({
        message : "Blog deleted"
      });
    }
    else{
      res.json({
        message : "You are not allowed to delete another user's blog"
      });
    }
  }
  else{
    res.json({
      message : "Blog does not exist"
    })
  }
});

module.exports = {
  userRouter
};
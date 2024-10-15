const {Schema, SchemaType, default:mongoose} = require("mongoose");
const ObjectId = mongoose.ObjectId;

const userSchema = new Schema({
  email : {type : String, unique: true},
  password : String,
  firstName : String,
  lastName : String,
  blogs : [{
    type : ObjectId,
    ref : 'blogs'
  }]
});

const blogSchema = new Schema({
  title : String,
  description : String,
  authors : String,
  writerId : ObjectId,
});


const userModel = mongoose.model("user", userSchema);
const blogModel = mongoose.model("blog", blogSchema);

module.exports = {
  userModel,
  blogModel
};

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin_vaibhav:Niranjan@9850@cluster0-3k1on.mongodb.net/todolistDB",{useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });


const itemSchema = new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome to todolist."
});

const item2 = new Item({
  name:"Hit the + button to add new item."
});

const item3 = new Item({
  name:"--Hit this to delete an item--."
});

const defaultItems = [item1,item2,item3];


const  listSchema = {
   name:String,
   items:[itemSchema]
};

const List = mongoose.model("List",listSchema);

// Item.insertMany(defaultItems,function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else
//   {
//     console.log("Successfully added");
//   }
// });


app.get("/", function(req, res) {
  Item.find(function(err,items){
    if(items.length==0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Successfully added");
        }
      });
    }

    res.render("list", {listTitle: "Today", newListItems: items});

  });


});

app.post("/", function(req, res){

  const name = req.body.newItem;
  const listName = req.body.list;

   const item = new Item({
     name: name
   });
   if(listName=="Today")
   {
     item.save();
     res.redirect("/");
   }
   else{
  List.findOne({name:listName},function(err,result){

    result.items.push(item);
    result.save();
    res.redirect("/"+ listName);
  });

   }


});

app.post("/submit",function(req,res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName=="Today")
  {
    Item.findByIdAndRemove(checkedId,function(err){

      if(err)
      {
        console.log(err);

      }
      else
       {
        console.log("Checked Item removed Successfully");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,result){

    if(!err)
    {
      res.redirect("/" + listName);
    }

    });
  }

});

app.get("/:key",function(req,res){
  const customListName = _.capitalize(req.params.key);
 List.findOne({name:customListName},function(err,result){

  if(!err){
    if(!result)
    {
      const list = new List({
        name:customListName,
        items:defaultItems
      });
        list.save();
     res.redirect("/"+customListName);
    }
    else{
      res.render("list",{listTitle:result.name,newListItems:result.items});
    }
  }
});


});

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

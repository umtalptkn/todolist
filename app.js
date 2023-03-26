//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));




// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
// }
mongoose.connect("mongodb+srv://admin-umut:Test123@cluster0.1ptsxby.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({name:"wake up"});
const item2 = new Item({name:"wash your hand"});
const item3 = new Item({name:"peel acnelyse"});
const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List = mongoose.model("List", listSchema);



// FIND METHOD 1 ********************
// Item.find({}).then(function(a){
//   console.log(a);
// }).catch(function(err){
//   console.log(err);
// });
/////////////FIND METHOD 2*********************
const findItems = async function(){
  try {
    const items = await Item.find({});
    return items;
  } catch(err){
    console.log(err)
  } 
}




app.get("/",  async function(req, res) {

  
  const returneditems = await findItems();
  if (returneditems.length ===0){
    Item.insertMany(defaultItems).then(function(){
      console.log("inserted")
    }).catch(function(err){
      console.log(err)
    });
    res.redirect("/");


  } else {
    res.render("list", {listTitle: "today", newListItems: returneditems});
  }
  
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList){
    if (!foundList){
      // create a new list
      const list = new List({
        name:customListName,
        items: defaultItems
    
      });
      list.save();
      res.redirect("/"+customListName);

    } else {
      // show an existing list
      res.render("list",{listTitle:foundList.name, newListItems:foundList.items} );
    }
  })

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const additem = new Item({
    name:itemName});
  
    if (listName==="today"){
      additem.save();
      res.redirect("/");
    }else{
      List.findOne({name:listName}).then(function(foundList){
        foundList.items.push(additem);
        foundList.save();
        res.redirect("/"+listName);

      }).catch(function(err){
        console.log(err);
      });
    }
  
  });

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;

  if (listName==="today"){
    Item.findByIdAndRemove(checkedItemId).then(function(a){
      console.log("succesfully deleted from database.");
    }).catch(function(err){
      console.log(err);
    });
    res.redirect("/");

  }else {
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}}).then(function(a){
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });
  }

  
});



app.get("/about", function(req, res){
  res.render("about");
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});

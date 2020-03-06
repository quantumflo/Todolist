//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true, useUnifiedTopology:true});

const itemSchema= {
name: String
}

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name: "Predator"
})
const item2=new Item({
  name:"Diary"
})

const item3= new Item({
  name:"JBL"
})
const itemarr=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,item){
    if(item.length === 0){
      Item.insertMany(itemarr,function(err,item){
        if(!err){
          console.log("Added items successfully to DB")
        }else{
          console.log("Not added")
        }
      })
      res.redirect("/")
    }else{
  res.render("list", {listTitle: "Today", newListItems: item});
    }
  })


  app.get("/:custom", function(req,res){
    const n=req.params.custom;

    List.findOne({name:n},function(err,foundlist){
      if(!err){
        if(!foundlist){
          const list=new List({
            name:n,
            items:itemarr
          })
          list.save();
          res.redirect("/" + n);
        }
      else{
        res.render("list",{listTitle:foundlist.name, newListItems:foundlist.items})
      }}
    })


  console.log(req.params.custom)
    // res.render("list", {listTitle: "Work List", newListItems: workItems});
  });




});

app.post("/", function(req, res){
  const itemval = req.body.newItem;
  const listname=req.body.list;
  const item=new Item({
    name: itemval
  })
  if(listname==="Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+ listname)
    });
  }
});



app.post("/delete", function(req,res){
  const id=req.body.check;
  const listname=req.body.listname;
  if(listname==="Today"){
    Item.findByIdAndRemove(req.body.check,function(err){
      if(!err){
        console.log("deleted successfully")
      }
      res.redirect("/")
    })
  }
    else{
      List.findOneAndUpdate({name:listname},{$pull:{items:{_id:id}}},function(err,foundlist){
        if(!err){
          res.redirect("/"+listname)
        }
      })
    }


})









app.listen(3000, function() {
  console.log("Server started on port 3000");
});

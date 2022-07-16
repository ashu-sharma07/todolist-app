const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect ot mongoDB DataBase
const password = "a1s2h3u4";
mongoose.connect(
  `mongodb+srv://ashusharma07:${password}@cluster0.j5rug.mongodb.net/todolistDB`
);

// Schema for db documents
const itemSchema = {
  name: String,
};

// Building new mongoose model based on this schema collection
const Item = mongoose.model("Item", itemSchema);

// Creating new mongoose Document

const item1 = new Item({
  name: "Welcome to Your ToDo List",
});

const item2 = new Item({
  name: "Click '+' to add a new task.",
});

const item3 = new Item({
  name: "Click the checkbox to delete a task",
});

var defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res, next) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      // Adding items to the model
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          // console.log(err);
        } else {
          //   console.log("Sucessfully added Default items to the DB");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

// Handle custom urls get request

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

// Add new task to the list

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();
  const newItem = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundlist) => {
      if (!err) {
        foundlist.items.push(newItem);
        foundlist.save();
        res.redirect("/" + listName);
      }
    });
  }
});

// Delete task from the list

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName.trim();

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundlist) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

const domain = "localhost"
const port = 3001;
app.listen(port,domain,()=>{
    console.log(`Application running on ${domain}:${port}`)
});
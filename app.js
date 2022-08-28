const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
const date = require(__dirname + "/date.js")
var favicon = require("serve-favicon");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static("public"));
app.use(favicon(__dirname + '/public/logo/favicon.ico'));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

mongoose.connect("", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Welcome to the todo list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete the item"
});

defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {

    Item.find(function (err, result) {
        if (result.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully inserted");
                }
            });
            res.redirect("/");
        } else {
            const day = date.getDate();
            res.render('index', {
                // topic: day,
                topic: day,
                newItem: result
            })
        }
    })
});

app.post("/", function (req, res) {

    const itemName = req.body.data;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    const day = date.getDate();
    if (listName === day) {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({
            name: listName
        }, function (err, result) {
            result.items.push(item);
            result.save();
            res.redirect("/" + listName)
        })
    }

});

app.post("/delete", function (req, res) {
    const checkedItem = req.body.checkbox;
    const listName = req.body.listName;
    const day = date.getDate();
    if (listName === day) {
        Item.findByIdAndDelete(checkedItem, function (err) {
            if (!err) {
                console.log("Succesfully deleted the selected item");
            } else {
                console.log(err);
            }
        })
        res.redirect("/")
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItem
                }
            }
        }, function (err, result) {
            if (!err) {
                res.redirect("/" + listName)
            }
        })
    }


})

app.get("/:pramName", function (req, res) {
    const requestName = _.capitalize(req.params.pramName);

    List.findOne({
        name: requestName
    }, function (err, result) {
        if (!err) {
            if (!result) {
                const list = new List({
                    name: requestName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + requestName)
            } else {
                res.render("index", {
                    topic: result.name,
                    newItem: result.items
                })
            }
        }
    })
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function (req, res) {
    console.log("server has started successfully!");
});
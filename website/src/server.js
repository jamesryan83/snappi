
var express = require("express");
var bodyParser = require("body-parser");
var database = require("./private/database");

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(bodyParser.json({ limit: "5mb" }));


// Get items
app.get("/items", function (req, res) {
    var page = 1;
    if (req.query.page) {
        page = req.query.page;
    }

    // TODO : remove deleteOldItems and replace with automated sql script
    database.deleteOldItems(function (err) {
        database.getItems(page, function (err, result) {
            if (err) {
                res.send({ err: err });

            } else {
                if (result) result = result.recordset;
                res.send({ err: err, data: result });
            }
        });
    });
});


// Add a new item
app.post("/item", function (req, res) {
    database.deleteOldItems(function (err) {
        database.addItem(req.body, function (err, result) {
            if (err) {
                res.send({ err: err });

            } else {
                var insertedItemId = -1;
                if (result && result.recordset) {
                    insertedItemId = result.recordset[0].item_id;
                }

                res.send({ err: err, data: insertedItemId });
            }
        });
    });
});


// Start Server
var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log("listening on port : " + port);
});

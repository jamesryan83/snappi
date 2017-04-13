"use strict";

var sql = require("mssql")
var config = require("config");

var itemsPerPage = 10;


// Setup SQL connection
var config = {
    user: config.get("username"),
    password: config.get("password"),
    server: config.get("server"),
    database: config.get("database"),
    options: {
        encrypt: true
    }
}

sql.connect(config, function (err) {
    if (err) {
        console.log(err);
    }
});

sql.on("error", function (err) {
    console.log(err);
});



// Add an item to database
function addItem (item, callback) {

    var dateToDelete = new Date();

    switch (item.ttl) {
        case "5 Minutes": dateToDelete.setMinutes(dateToDelete.getMinutes() + 5); break;
        case "30 Minutes": dateToDelete.setMinutes(dateToDelete.getMinutes() + 30); break;
        case "1 Hour": dateToDelete.setHours(dateToDelete.getHours() + 1); break;
        case "6 Hours": dateToDelete.setHours(dateToDelete.getHours() + 6); break;
        case "1 Day": dateToDelete.setHours(dateToDelete.getHours() + 24); break;
        case "7 Days": dateToDelete.setHours(dateToDelete.getHours() + 168); break;
        case "30 Days": dateToDelete.setHours(dateToDelete.getHours() + 720); break;
        case "Future": dateToDelete.setHours(dateToDelete.getHours() + 1000000); break;
        default:
            // Default is delete item after 1 minute
            dateToDelete.setMinutes(dateToDelete.getMinutes() + 1);
            break;
    }

    var parameters = [
        { param: "text", type: sql.VarChar(255), value: item.text },
        { param: "image", type: sql.VarChar(sql.MAX), value: item.image },
        { param: "date_to_delete", type: sql.DateTime2, value: dateToDelete }
    ];

    var query = "INSERT INTO items (text, image, date_to_delete) OUTPUT INSERTED.item_id VALUES (@text, @image, @date_to_delete);";

    deleteOldItems();
    executeQuery(query, parameters, callback);
}



// Get items from database
function getItems (page, callback) {
    var query = "SELECT item_id, text, image, created_at, date_to_delete FROM items ORDER BY created_at DESC" +
        " OFFSET " + (itemsPerPage * (page - 1)) +
        " ROWS FETCH NEXT " + itemsPerPage + " ROWS ONLY;";

    deleteOldItems();
    executeQuery(query, null, callback);
}



// Delete items from database pending deletion
function deleteOldItems (callback) {
    executeQuery("DELETE FROM items WHERE date_to_delete < GETUTCDATE()", null, callback);
}



// Execute an SQL query
function executeQuery (query, params, callback) {
    var request = new sql.Request();

    if (params) {
        for (var i = 0; i < params.length; i++) {
            request.input(params[i].param, params[i].type, params[i].value);
        }
    }

    request.query(query, function (err, recordset) {
        if (err) {
            console.log(err);

            if (callback) {
                return callback(err);
            }
        }

        if (callback) {
            return callback(null, recordset);
        }
    });
}


exports = module.exports = {
    addItem: addItem,
    getItems: getItems,
    deleteOldItems: deleteOldItems
}

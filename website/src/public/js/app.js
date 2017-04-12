"use strict";

var app = app || {};


$(document).ready(function () {
    app.index.init();
});




// Index
app.index = {

    init: function () {
        var self = this;

        this.nextPage = 1;
        this.lastScrollPos = 0;

        app.dialogs.init();

        
        // load first page
        this.getItemsFromServer(function () {
            window.scrollTo(0, self.lastScrollPos);
        });


        // Load more button
        $("#load-more-button").on("click", function () {
            self.getItemsFromServer(function () {
                window.scrollTo(0, self.lastScrollPos);
            });
        });


        // Create item button
        $("#create-button").on("click", function () {
            app.dialogs.createItemDialog.show(function (success, result) {
                if (success) {

                    self.ajaxRequest("POST", "/item", result, "Error posting item", function (err, id) {
                        if (err) {
                            alert(err);
                        } else {
                            location.reload();
                        }
                    });
                }
            });
        });
    },


    // Get items from server
    getItemsFromServer: function (callback) {
        var self = this;

        $("#load-more-button").hide();

        this.ajaxRequest("GET", "/items?page=" + this.nextPage, null,
                         "Error getting latests items", function (err, items) {
            if (!err) {
                self.lastScrollPos = self.nextPage === 1 ? 0 : window.scrollY;

                if (items.length > 0) {
                    self.nextPage++;

                    // Add items to item list
                    var item;
                    var frag = document.createDocumentFragment();
                    for (var i = 0; i < items.length; i++) {

                        var itemtext = "";
                        if (items[i].text) {
                            itemtext = items[i].text;
                        }

                        // added and deleting dates
                        var added = moment(items[i].created_at).format("MMMM Do YYYY, h:mm:ss a");
                        var deleting = moment(items[i].date_to_delete).fromNow();

                        // create html item
                        item =
                            "<div class='list-item' data-id='" + items[i].item_id + "'>" +
                                "<div>" +
                                    "<img src='data:image/png;base64," + items[i].image + "'/>" +
                                    "<p>" + itemtext + "</p>" +
                                    "<p>Added: " + added + "</p>" +
                                    "<p>Deleting: " + deleting + "</p>" +
                                "</div>" +
                            "</div>";

                        frag.appendChild($(item)[0]);
                    }

                    $("#items-list").append(frag);

                } else {

                    // No more items message
                    $("#no-more-items").show();
                    setTimeout(function () {
                        $("#no-more-items").hide();
                    }, 2000);
                }

                $("#load-more-button").show();

                if (callback) callback();
            }
        });

    },



    // Generic ajax request - returns (err, data)
    ajaxRequest: function (type, url, data, errorMessage, callback) {

        $.ajax({
            type: type,
            url: url,
            data: data,
            success: function (result) {
                if (result.err) {
                    app.util.showToast("Error", errorMessage || result.err);
                    return callback(result);
                }

                return callback(null, result.data);
            },
            error: function (err) {
                console.log(err);
                app.util.showToast("Error", errorMessage);
                return callback(err);
            }
        });
    },

}



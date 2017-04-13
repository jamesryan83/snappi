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

                    self.showToastMessage("Creating Item, Please Wait");

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
        $("#loading-label").show();

        this.ajaxRequest("GET", "/items?page=" + this.nextPage, null,
                         "Error getting latest items", function (err, items) {

            $("#loading-label").hide();

            if (!err) {
                self.lastScrollPos = self.nextPage === 1 ? 0 : window.scrollY;

                if (items && items.length > 0) {
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

                        // Hide deleting date if over 1 month
                        var diffDays = moment(items[i].date_to_delete).diff(moment(Date.now()), "days");
                        if (diffDays > 31) {
                            deleting = "";
                        } else {
                            deleting = "Deleting: " + deleting;
                        }

                        // create item
                        item =
                            "<div class='list-item' data-id='" + items[i].item_id + "'>" +
                                "<div>" +
                                    "<img src='data:image/png;base64," + items[i].image + "'/>" +
                                    "<p>" + itemtext + "</p>" +
                                    "<p>Added: " + added + "</p>" +
                                    "<p>" + deleting + "</p>" +
                                "</div>" +
                            "</div>";

                        frag.appendChild($(item)[0]);
                    }

                    $("#items-list").append(frag);

                } else {
                    self.showToastMessage("No more items");
                }

                $("#load-more-button").show();

                if (callback) callback();
            }
        });

    },



    // Toast message label
    showToastMessage: function (text) {
        $("#message-label").text(text);
        $("#message-label").show();
        setTimeout(function () {
            $("#message-label").hide();
        }, 3000);
    },



    // Generic ajax request
    ajaxRequest: function (type, url, data, errorMessage, callback) {
        var self = this;

        $.ajax({
            type: type,
            url: url,
            data: data,
            success: function (result) {
                if (result.err) {
                    console.log(result.err)
                    self.showToastMessage(errorMessage);
                    return callback(result);
                }

                return callback(null, result.data);
            },
            error: function (err) {
                console.log(err);
                self.showToastMessage(errorMessage);
                return callback(err);
            }
        });
    },

}



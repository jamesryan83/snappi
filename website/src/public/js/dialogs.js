"use strict";

var app = app || {};

app.dialogs = {

    init: function () {
        this.createItemDialog.init();
    },


    // Create item Dialog
    createItemDialog: {

        init: function () {
            var self = this;
            this.selectedFile = null;


            // Browse button
            $("#dialog-create-item-button-browse").on("click", function () {
                $("#dialog-create-item-button-file").click();
            });


            // Selected file changed
            $("#dialog-create-item-button-file").on("change", function () {
                if (this.files.length <= 0) {
                    self.selectedFile = null;
                    $("#dialog-create-item-path").text("");
                    return;
                }

                // check size
                if (this.files[0].size > 500000) {
                    self.selectedFile = null;
                    $("#dialog-create-item-path").text("");
                    alert("File is too big to upload.  Choose a smaller file under 500kB");
                    return;
                }

                // check file extension
                var pathParts = this.files[0].name.split(".");
                var extension = pathParts[pathParts.length - 1];
                if (["png", "jpg", "jpeg", "bmp"].indexOf(extension) === -1) {
                    alert("Only png, jpg, jpeg or bmp image files allowed");
                    return;
                }

                // set selected file
                self.selectedFile = this.files[0];
                $("#dialog-create-item-path").text("Image: " + self.selectedFile.name);
            });


            // Ok button
            $("#dialog-create-item-button-ok").on("click", function () {
                if (!self.selectedFile) {
                    alert("You need to select a file first");
                    return;
                }

                // read file into base64 string
                var reader = new FileReader();
                reader.addEventListener("load", function () {

                    // return result
                    self.callback(true, {
                        text: $("#dialog-create-item-textarea").val(),
                        ttl: $("#dialog-create-item-select option:selected").text(),
                        image: reader.result.split("base64,")[1]
                    });

                    self.hide();
                }, false);

                reader.readAsDataURL(self.selectedFile);
            });


            // Cancel button
            $("#dialog-create-item-button-cancel").on("click", function () {
                self.callback(false);

                self.hide();
            });
        },


        // Show dialog
        show: function (callback) {
            this.callback = callback;
            $("#dialog-container").show();
            $("#dialog-create-item").show();
        },


        // Hide dialog
        hide: function () {
            this.selectedFile = null;
            $("#dialog-create-item-textarea").text("");
            $("#dialog-create-item-path").text("");
            $("#dialog-container > div").hide();
            $("#dialog-container").hide();
        }
    }

}

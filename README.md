Wanted to call this Snappy but that was taken, so Snappi it is !

Small Xamarin App and a Website/Server

Create images on the app and see them on the website and vice versa

Everything created is publicly visible, everyone sees the same list of images

Posted images can be deleted after a set time if you want

Made with Xamarin.Forms, Node.js/Express, jQuery hosted on Azure with an MSSQL server

There's one tiny SQL table...

```
CREATE TABLE items
(
	item_id int PRIMARY KEY IDENTITY(1,1) NOT NULL,	
	text NVARCHAR(255),	
	image NVARCHAR(MAX),
	date_to_delete DATETIME2 NOT NULL,
	created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
)
```

Tested on a Samsung Galaxy S5 and Chrome 57 Browser.  The iOS app is untested

There's a signed apk in the root folder of the repository if you want to try it out on your phone

[Website is here](http://snappi.azurewebsites.net/)

Some screenshots of the app...

![snappyui](/snappi-ui.png?raw=true)



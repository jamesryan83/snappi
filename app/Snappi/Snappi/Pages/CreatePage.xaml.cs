using Plugin.Media;
using Plugin.Media.Abstractions;
using System;
using System.IO;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Snappi
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class CreatePage : ContentPage
	{
		public CreatePage ()
		{
			InitializeComponent ();


			// From Gallery button
			ButtonGallery.Clicked += async (sender, args) =>
			{
				if (!CrossMedia.Current.IsPickPhotoSupported)
				{
					await DisplayAlert("Gallery Supported", "Permission not granted to use the Gallery", "OK");
					return;
				}
				
				// Load image
				MediaFile file = await CrossMedia.Current.PickPhotoAsync(new PickMediaOptions { PhotoSize = PhotoSize.Small, CompressionQuality = 100 });
				
				if (file == null)
					return;

				// Reload image at lower quality if over certain filesize
				// TODO : need better way to do this
				FileInfo info = new FileInfo(file.Path);
				if (info.Length > 500000)
				{				
					file = await CrossMedia.Current.PickPhotoAsync(new PickMediaOptions { PhotoSize = PhotoSize.Small, CompressionQuality = 70 });
				}
				
				await Navigation.PushAsync(new EditorPage(file));
			};



			// Use Camera button
			ButtonCamera.Clicked += async (sender, args) =>
			{
				if (!CrossMedia.Current.IsCameraAvailable || !CrossMedia.Current.IsTakePhotoSupported)
				{
					await DisplayAlert("No Camera", "No camera avaialble", "OK");
					return;
				}

				var file = await CrossMedia.Current.TakePhotoAsync(new StoreCameraMediaOptions
				{
					PhotoSize = PhotoSize.Small,
					CompressionQuality = 70,
					AllowCropping = true,					
					Directory = "Snappi",
					Name = Guid.NewGuid() + ".jpg"
				});

				if (file == null)
					return;

				await Navigation.PushAsync(new EditorPage(file));
			};
		}




	}
}

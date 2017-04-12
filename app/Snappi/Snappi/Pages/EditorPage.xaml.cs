using Newtonsoft.Json;
using Plugin.Media.Abstractions;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace Snappi
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class EditorPage : ContentPage
	{
		public EditorPage (MediaFile file)
		{
			InitializeComponent ();

			string base64Image = "";

			try
			{
				// Set background image
				ImageSource img = ImageSource.FromStream(() =>
				{
					var stream = file.GetStream();
					file.Dispose();
					return stream;
				});

				EditorImage.Source = img;

				
				// Convert image to base64 for http
				base64Image = Convert.ToBase64String(File.ReadAllBytes(file.Path.ToString()));

			} catch (Exception ex)
			{
				DisplayAlert("Error", ex.Message, "OK");
			}

			

			// Time to live combobox change event
			PickerTimeToLive.SelectedIndexChanged += (sender, e) =>
			{
				string ttl = PickerTimeToLive.SelectedItem.ToString();
			};



			// Editor text changed event
			EditorText.TextChanged += (sender, e) =>
			{				
				EditorPlaceholder.IsVisible = e.NewTextValue.Length <= 0;
			};



			// Publish button
			buttonPublish.Clicked += async (sender, e) =>
			{
				LoadingScreen.IsVisible = true;

				try
				{					
					// Put data into a DataItem
					DataItem dataItem = new DataItem { text = EditorText.Text, image = base64Image, ttl = PickerTimeToLive.SelectedItem.ToString() };
					string dataItemJson = JsonConvert.SerializeObject(dataItem);

					// Send data to server
					var client = new HttpClient();
					var content = new StringContent(dataItemJson, Encoding.UTF8, "application/json");
					HttpResponseMessage response = await client.PostAsync(Common.serverUrl + @"/item", content);

					var result = await response.Content.ReadAsStringAsync();

					// TODO : result has an databse item ID, store id on phone with photo and text

					LoadingScreen.IsVisible = false;


					// Return to home screen
					await Navigation.PopToRootAsync();
				}				
				catch (Exception ex)
				{
					await DisplayAlert("Alert", ex.Message, "OK");					
					LoadingScreen.IsVisible = false;
				}				
				
			};



			// Cancel button
			buttonCancel.Clicked += async (sender, e) =>
			{
				await Navigation.PopAsync();
			};
		}

				

		// A single data item - gets sent to server
		class DataItem
		{
			public string text { get; set; }
			public string image { get; set; }
			public string ttl { get; set; }
		}
		
	}
}

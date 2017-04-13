using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Net.Http;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;


namespace Snappi
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class MainPage : ContentPage
    {

		public ObservableCollection<ListItem> listItems { get; set; }

		private int nextPage = 1;
		private bool isLoading = false;


		public MainPage ()
        {
			InitializeComponent();


			// Load more button
			ButtonLoadMore.Clicked += (sender, e) =>
			{
				LoadItemsFromServer();
			};


			// Reload items button
			ButtonReload.Clicked += (sender, e) =>
			{
				loadFirstPage();
			};


			// Create item button
			ButtonCreate.Clicked += async (sender, e) =>
			{
				await Navigation.PushAsync(new CreatePage());
			};


			// Listview items appearing
			ListViewItems.ItemAppearing += (sender, e) =>
			{
				if (isLoading)
				{
					return;
				}

				var item = (ListItem)e.Item;

				// If last item in the list was just loaded
				if (item.item_id == listItems[listItems.Count - 1].item_id)
				{
					setLoadingButton("show");
				}
			};


			// On load
			Appearing += (sender, e) =>
			{
				loadFirstPage();
			};			

		}

		
		
		// Load the first page
		public void loadFirstPage()
		{
			nextPage = 1;
			listItems = new ObservableCollection<ListItem>();
			ListViewItems.ItemsSource = listItems;
			LoadItemsFromServer();
		}



		// Load list items from server
		public async void LoadItemsFromServer()
		{
			if (isLoading)
			{
				return;
			}

			var client = new HttpClient();
			isLoading = true;
			setLoadingButton("loading");

			try
			{				
				HttpResponseMessage response = await client.GetAsync(Common.serverUrl + @"/items?page=" + nextPage);
				var result = await response.Content.ReadAsStringAsync();

				ServerResult resultData = null;
				resultData = JsonConvert.DeserializeObject<ServerResult>(result);								

				// No items in response
				if (resultData.data.Count == 0)
				{
					await DisplayAlert("Alert", "No More Items", "OK");
					setLoadingButton("hide");
					isLoading = false;
					return;
				}

				// Increment page for next request
				nextPage++;

				// Add new items to listview
				for (int i = 0; i < resultData.data.Count; i++)
				{
					listItems.Add(resultData.data[i]);
				}

				setLoadingButton("hide");
				isLoading = false;

				Console.WriteLine("Items: " + listItems.Count);

			} catch (HttpRequestException webex)
			{				
				await DisplayAlert("Error", "Please try reloading", "OK");
				Console.WriteLine(webex.InnerException.Message);
				setLoadingButton("hide");
				isLoading = false;

			} catch (Exception ex)
			{				
				await DisplayAlert("Error", ex.Message, "OK");
				Console.WriteLine(ex.Message);
				setLoadingButton("hide");
				isLoading = false;
			}
		}


		// Set the state of the load more button
		public void setLoadingButton(string state)
		{
			Console.WriteLine("showing: " + state);

			if (state == "show")
			{
				ButtonLoadMore.Text = "Load More";
				ButtonLoadMore.IsEnabled = true;
				ButtonLoadMore.IsVisible = true;
			} else if (state == "loading")
			{
				ButtonLoadMore.Text = "Loading...";
				ButtonLoadMore.IsEnabled = false;
				ButtonLoadMore.IsVisible = true;
			} else if (state == "hide")
			{
				ButtonLoadMore.IsVisible = false;
			}
		}



		// Result from server
		public class ServerResult
		{
			public string err { get; set; }
			public List<ListItem> data { get; set; }

			public ServerResult(string err, List<ListItem> data)
			{
				this.err = err;
				this.data = data;
			}
		}


		// A single list item
		public class ListItem
		{			
			public string created_at { get; set; }
			public string date_to_delete { get; set; }
			public string image { get; set; }
			public int item_id { get; set; }			
			public string text { get; set; }

			//[JsonIgnore]
			public string expires { get; set; }

			//[JsonIgnore]
			public ImageSource imageSource { get; set; }

			//[JsonIgnore]
			public bool textVisible { get; set; }


			public ListItem(string created_at, string date_to_delete, string image, int item_id, string text)
			{
				// Make deleted date
				string dt = "";
				TimeSpan span = (DateTime.Parse(date_to_delete) - DateTime.Now);				
				if (span.Days > 0) dt += span.Days + " Days ";
				if (span.Hours > 0) dt += span.Hours + " Hours ";
				if (span.Minutes > 0) dt += span.Minutes + " Minutes ";
				if (span.Seconds > 0) dt += span.Seconds + " Seconds";


				// set properties
				this.created_at = "Added: " + DateTime.Parse(created_at).ToString("MM/dd/yy HH:mm:ss");
				this.date_to_delete = "Deleting in: " + dt;				
				this.item_id = item_id;
				this.text = (text != null && text.Length == 0) ? null : text;
				//this.image = image; // dont need reference to image string


				// hide label if text is empty
				textVisible = this.text != null;


				// Convert base64 string to imagesource
				if (image.Length > 0)
				{
					try
					{
						byte[] byteArray = Convert.FromBase64String(image);
						imageSource = ImageSource.FromStream(() => new MemoryStream(byteArray));
					}
					catch (Exception ex)
					{
						Console.WriteLine(ex.Message);
						Console.WriteLine(ex.StackTrace);
					}
				}				
			}
		}
	}
}

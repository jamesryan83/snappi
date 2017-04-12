using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace Snappi
{
	public partial class App : Application
	{
		public App ()
		{
			InitializeComponent();

			AppDomain.CurrentDomain.UnhandledException += (sender, e) => {
				Exception ex = e.ExceptionObject as Exception;
				Console.WriteLine(ex.Message);
				Console.WriteLine(ex.StackTrace);
			};

			TaskScheduler.UnobservedTaskException += (sender, e) => {
				Exception ex = e.Exception;
				Console.WriteLine(ex.Message);
				Console.WriteLine(ex.StackTrace);
			};

			MainPage = new NavigationPage(new MainPage());
		}

		protected override void OnStart ()
		{
			// Handle when your app starts
		}

		protected override void OnSleep ()
		{
			// Handle when your app sleeps
		}

		protected override void OnResume ()
		{
			// Handle when your app resumes
		}
	}
}

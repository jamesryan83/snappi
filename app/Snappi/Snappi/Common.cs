using System;
using System.Collections.Generic;
using System.Text;

namespace Snappi
{
    class Common
    {
		public static readonly bool debug = false;

		public static string serverUrl {
			get { return debug == true ? @"http://192.168.1.2:1337" : @"http://snappi.azurewebsites.net"; }
			set { serverUrl = value; }
		}
    }
}

	
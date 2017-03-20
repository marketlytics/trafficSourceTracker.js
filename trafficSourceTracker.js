/*
# Traffic Source Tracker - Google Analytics Last Non Direct Click Model
# Copyright (c) 2015, MarketLytics
# 
# This project is free software, distributed under the MIT license. 
# MarketLytics offers digital analytics consulting and integration services.
*/
(function (window, document)
{
	window.dataLayer=window.dataLayer||[];
	
	//including javascript in web page when JSON is undifined(first time), creating json source attribute, appending in head tag.
	if(typeof JSON === 'undefined') {
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'text/javascript');
		fileref.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js');
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}

	//cookieStrKey is used to set cookie name.
	var cookieStrKey = 'traffic_src';
	
	//inject global function for cookie retrieval.
	var getTrafficSrcCookie = function()
	{
		var cookies = document.cookie.split(';');
		var cookieObj;
		for(var i = 0; i < cookies.length; i++) {
			if(cookies[i].indexOf(cookieStrKey) >= 0) {
				cookieObj = cookies[i];
				break;
			}
		}
		//cookie values are copied into cookieObj and return in JSON format.
		if(cookieObj)
		{
			cookieObj = cookieObj.substring(cookieObj.indexOf('=') + 1, cookieObj.length);
			return JSON.parse(cookieObj);
		}
		return null;
	};

	var utils = {
		/*function is use to compare two parameters and return value if valid,
		 *it looks for name(any variable) in url and returns its docoded value if found in url.
		 */
		getParameterByName: function(url, name)
		{
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
			var results = regex.exec(url);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		getKeywords: function(url)
		{	//return empty sting if url is empty or direct, which indicate no keywords used.
			if(url === '' || url === '(direct)') return '';
			
			//we compare pre-define searchEngines object to find relavent keywords in url.
			var searchEngines = 'daum:q eniro:search_word naver:query pchome:q images.google:q google:q yahoo:p yahoo:q msn:q bing:q aol:query aol:q lycos:q lycos:query ask:q cnn:query virgilio:qs baidu:wd baidu:word alice:qs yandex:text najdi:q seznam:q rakuten:qt biglobe:q goo.ne:MT search.smt.docomo:MT onet:qt onet:q kvasir:q terra:query rambler:query conduit:q babylon:q search-results:q avg:q comcast:q incredimail:q startsiden:q go.mail.ru:q centrum.cz:q 360.cn:q sogou:query tut.by:query globo:q ukr:q so.com:q haosou.com:q auone:q'.split(' ');
			for(var i = 0; i < searchEngines.length; i++)
			{//set source of traffic to search engine
				var val = searchEngines[i].split(':');
				var name = val[0];
				var queryParam = val[1];
				if(url.indexOf(name) >= 0) {
					cookieObj.ga_source = name; // set source to searchEngine name.
					if(this.getParameterByName(url, queryParam) !== ''){
						//return value of queryParamter, extracted keyowrd.
						return this.getParameterByName(url, queryParam);
					}
				}
			}
		
		//if url matches exact case of below regix we return not provided, which means campaign data is not present.
			var google = new RegExp('^https?:\/\/(www\.)?google(\.com?)?(\.[a-z]{2}t?)?\/?$', 'i');
			var yahoo = new RegExp('^https?:\/\/(r\.)?search\.yahoo\.com\/?[^?]*$', 'i');
			var bing = new RegExp('^https?:\/\/(www\.)?bing\.com\/?$', 'i');
			if(google.test(url) || yahoo.test(url) || bing.test(url)) {
				return '(not provided)';
			}
			
			return '';
		},

		//function to set medium based on different params.
		getMedium: function(ccokieObj)
		{
			if(cookieObj.ga_medium !== '') return cookieObj.ga_medium;

			if(cookieObj.ga_gclid !== '') return 'cpc';

			if(cookieObj.ga_source === '') return '';

			if(cookieObj.ga_source === '(direct)') return '(none)';

			if(cookieObj.ga_keyword !== '') return 'organic';

			return 'referral';
		},

		//getting date and time for define number of years from today.
		getDateAfterYears: function(years)
		{
			return new Date(new Date().getTime() + (years * 365 * 24 * 60 * 60 * 1000));
		},

		//checking url to return approprate hostname.
		getHostname: function(url)
		{
			var re = new RegExp('^(https:\/\/|http:\/\/)?([^\/?:#]+)');
			var match = re.exec(url)[2];
			if(match !== null) {
				return match;
			}
			return '';
		},

		/*function that waits for the givent condition to be true,
		 * Checks the condition every 100 milisecond till timeout variable is wqual to 0
		*/
		waitLoad: function(condition, callback) {
			var timeout = 100;
			var poll = function() {
				setTimeout(function() {
					timeout--;
					if(condition()) {
						callback();
					} else if (timeout > 0) {
						poll();
					} else {
						console.error('timed-out!!');
					}
				}, 100);
			};
			poll();
		}
	};

	// query params keys to look for to get utm data.
	var parameters = [{
		key: 'utm_source',
		label: 'ga_source',
		required:  true
	}, {
		key: 'utm_medium',
		label: 'ga_medium',
		required: false
	}, {
		key: 'utm_campaign',
		label: 'ga_campaign',
		required: false
	}, {
		key: 'utm_content',
		label: 'ga_content',
		required: false
	}, {
		key: 'utm_term',
		label: 'ga_keyword',
		required: false
	}];

	//code starts from here, above declare functions are used here.
	var cookieObj = {};

	/* gclid = checks for presensce of adword.
	 * function below sets all the required values (traffic detials) in an object name 'cookiObj',
	 * which is later converted to JSON and saved as cookie,
	 * function is used to save values in cookie defined above.
	 */
	
	var setCookie = function(getGaClient)
	{	
		cookieObj.ga_gclid = utils.getParameterByName(document.location.href, 'gclid');

		var ignoreUtmParameters = false;
		for(var i = 0; i < parameters.length; i++) {
			var value = utils.getParameterByName(document.location.href, parameters[i].key);
			if(parameters[i].required && value === '') {
				ignoreUtmParameters = true;
				for(var j = 0; j < parameters.length; j++) {
					cookieObj[parameters[j]['label']] = '';
				}
				break;
			}
			cookieObj[parameters[i]['label']] = value;
		}

		//source is assumed to be google when gclid is present and source is NULL
		if (cookieObj.ga_gclid !== '' && cookieObj.ga_source === '')
		{
			cookieObj.ga_source = 'google';
		} 
		//Checks if ignoreUtmParameters is true.
		else if(ignoreUtmParameters)
		{	
			//Checks is referrer exists.
			if(document.referrer.indexOf(document.location.host) >= 0) return;
			
			//Checks is Cookie already exists and also checks if referrer exists.
			if(getTrafficSrcCookie() !== null && document.referrer === '') return;
			//Set the default source value '(direct)'.
			cookieObj.ga_source = document.referrer !== '' ? document.referrer : '(direct)';
		}
		
		//Saves values in cookie object i.e 'cookieObj'.
		cookieObj.ga_keyword = cookieObj.ga_keyword === '' ? utils.getKeywords(cookieObj.ga_source) : cookieObj.ga_keyword;
		cookieObj.ga_medium = utils.getMedium(cookieObj);
		//landing page is set to current page url.
		cookieObj.ga_landing_page = document.location.href;
		cookieObj.ga_source = utils.getHostname(cookieObj.ga_source);

		if (getGaClient) {
			cookieObj.ga_client_id = ga.getAll()[0].get('clientId');
		}

		if(cookieObj.ga_source !== '') {
			//coverting Javascript value under cookieObj to JSON String, cookieStr varaible is used to save data in cookie.
			var cookieStr = JSON.stringify(cookieObj);
			//Creating cookie with expiry set for one year, can be accessed by function getTrafficSrcCookie().
			document.cookie = cookieStrKey + '=; expires=' + new Date(-1);
			document.cookie = cookieStrKey + '=' + cookieStr + '; expires=' + utils.getDateAfterYears(1)+'; path=/';
		}
		//Pushes event to dataLayer to prompt that cookies have been saved successfully.
		dataLayer.push({'event':'trafficSrcCookieSet'})

		// Creates an event in jQuery on script ready. if you want to use jQuery remove comments from code below.
		/* jQuery.event.trigger({
			type: "Traffic_Source_Ready",
			message: "Traffic Source Ready",
			cookieData:getTrafficSrcCookie(),
			time: new Date()
		});*/ // if you uncomment above code you have to comment out below javascript code till document.dispatchEvent()

		// creates events in JavaScript.
		document.addEventListener("name-of-event", function(e){
	console.log(e.type);
});
// Create the event
var event = new CustomEvent("name-of-event", {
 "type": "Traffic_Source_Ready",
	"message": "Traffic Source Ready",
	"cookieData":getTrafficSrcCookie(),
	"time": new Date()
});
// Dispatch/Trigger/Fire the event
document.dispatchEvent(event);
		

		cookieObj = {};
	};

	var setTrafficSrcCookie = function(options) {
		if (!options) {
			options = {};
		}

		utils.waitLoad(function() {
			//Checks if JSON Lib is included.
			return typeof JSON !== 'undefined';
		}, function() {
			if (options.getGaClient) {
				//works when Analytics tracker(ga) exists on site, wait for some type before returing ga values and calling function setcookie.
				utils.waitLoad(function() {
					return typeof ga.getAll !== 'undefined';
				}, function() {
					setCookie(true);
				});
				return;
			}
			setCookie(false);

		});
	}
	//Set the cookie by default can be overridden using setTrafficSrcCookie global function
	// setTrafficSrcCookie(cookieObj)
	
	window.trafficSrcCookie = {
		setCookie: setTrafficSrcCookie,
		getCookie: getTrafficSrcCookie
	};
})(window, document);

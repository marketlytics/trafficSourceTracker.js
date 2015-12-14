/*
# Traffic Source Tracker - Google Analytics Last Non Direct Click Model
# Copyright (c) 2015, MarketLytics
# 
# This project is free software, distributed under the MIT license. 
# MarketLytics offers digital analytics consulting and integration services.
*/
(function (window, document)
{
	//including javascript in web page when JSON is undifined(first time), creating json source attribute, appending in head tag
	if(typeof JSON === 'undefined') { 
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'text/javascript');
		fileref.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js');
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}

	// since we need to find traffic source value from cookie, we search for it, and get its value if >=0
	var cookieStrKey = 'traffic_src';
	
	//inject global function for cookie retrieval
	window.getTrafficSrcCookie = function()
	{	//split cookie into string array
		var cookies = document.cookie.split(';');
		var cookieObj;
		for(var i = 0; i < cookies.length; i++) {
			//indexOf gets starting index of traffic_src
			if(cookies[i].indexOf(cookieStrKey) >= 0) { 
				//storing cookie value in cookieObj if traffic source is >=0 
				cookieObj = cookies[i];
				break;
			}
		}
		//removing '=' from cookieObj and parsing value to JSON when its value exist
		if(cookieObj)
		{
			cookieObj = cookieObj.substring(cookieObj.indexOf('=') + 1, cookieObj.length);
			return JSON.parse(cookieObj);
		}
		//return null if no value was found in cookieObj
		return null;
	};
	
	var utils = {
		//function compares url value from modified name value
		getParameterByName: function(url, name)
		{
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
			//exec function takes modified(using replace and RegExp) name value and search it in url
			var results = regex.exec(url);
			//if null return empty string, or else return decoded value of name along with value replacement
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		getKeywords: function(url)
		{	//return empty sting if url is empty or direct
			if(url === '' || url === '(direct)') return '';
			// getting deafual searchEngines values, split on space to check each value seprately
			var searchEngines = 'daum:q eniro:search_word naver:query pchome:q images.google:q google:q yahoo:p yahoo:q msn:q bing:q aol:query aol:q lycos:q lycos:query ask:q cnn:query virgilio:qs baidu:wd baidu:word alice:qs yandex:text najdi:q seznam:q rakuten:qt biglobe:q goo.ne:MT search.smt.docomo:MT onet:qt onet:q kvasir:q terra:query rambler:query conduit:q babylon:q search-results:q avg:q comcast:q incredimail:q startsiden:q go.mail.ru:q centrum.cz:q 360.cn:q sogou:query tut.by:query globo:q ukr:q so.com:q haosou.com:q auone:q'.split(' ');
			for(var i = 0; i < searchEngines.length; i++)
			{//split on :(colon), and store in two variables name and queryParam
				var val = searchEngines[i].split(':');
				var name = val[0];
				var queryParam = val[1];
				if(url.indexOf(name) >= 0){
					// set source of traffic to search engine
					cookieObj.ga_source = name;				
					if(this.getParameterByName(url, queryParam) !== '') {
						//return value of queryParamter, extracted keyowrd
						return this.getParameterByName(url, queryParam);
					}
				}
			}
		//if url belongs to google, bing or yahoo return not provided
			var google = new RegExp('^https?:\/\/(www\.)?google(\.com?)?(\.[a-z]{2}t?)?\/?$', 'i');
			var yahoo = new RegExp('^https?:\/\/(r\.)?search\.yahoo\.com\/?[^?]*$', 'i');
			var bing = new RegExp('^https?:\/\/(www\.)?bing\.com\/?$', 'i');
			if(google.test(url) || yahoo.test(url) || bing.test(url)) {
				return '(not provided)';
			}
			
			return '';
		},
	//getting source medium, return anyone of the following cookieObj.ga_medium, 'cpc','',(none),'organic','referral' 
		getMedium: function(ccokieObj)
		{
			if(cookieObj.ga_medium !== '') return cookieObj.ga_medium;

			if(cookieObj.ga_gclid !== '') return 'cpc';

			if(cookieObj.ga_source === '') return '';

			if(cookieObj.ga_source === '(direct)') return '(none)';

			if(cookieObj.ga_keyword !== '') return 'organic';

			return 'referral';
		},
	
		getDateAfterYears: function(years)
		{
			return new Date(new Date().getTime() + (years * 365 * 24 * 60 * 60 * 1000));
		},
	//getting hostname
		getHostname: function(url)
		{
			var re = new RegExp('^(https:\/\/|http:\/\/)?([^\/?:#]+)');
			var match = re.exec(url)[2];
			if(match !== null) {
				return match;
			}
			return '';
		},
	//setting 100millisecond wait, set wait between condtion and callback function
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

    // query params keys to look for to get utm data
	var parameters = [{
		key: 'utm_source',
		label: 'ga_source',
		required:  true
	}, {
		key: 'utm_medium',
		label: 'ga_medium',
		required: true
	}, {
		key: 'utm_campaign',
		label: 'ga_campaign',
		required: true
	}, {
		key: 'utm_content',
		label: 'ga_content',
		required: false
	}, {
		key: 'utm_term',
		label: 'ga_keyword',
		required: false
	}];
	// cookie Object created to store all values
	var cookieObj = {};
	 //gclid = checks for value passed between google and adwords
	var setCookie = function()
	{//search for gclid in entire url
		cookieObj.ga_gclid = utils.getParameterByName(document.location.href, 'gclid');

		var ignoreUtmParameters = false;
		for(var i = 0; i < parameters.length; i++) {
			//check value in href and parameter key
			var value = utils.getParameterByName(document.location.href, parameters[i].key);
			//if paramter is required and value is null then set bool variable to true(to be used later) and set all label to null
			if(parameters[i].required && value === '') {
				ignoreUtmParameters = true;
				for(var j = 0; j < parameters.length; j++) {
					cookieObj[parameters[j]['label']] = '';
				}
				break;
			}
			//setting label with variable value
			cookieObj[parameters[i]['label']] = value;
		}
		// if gclid is not empty and soruce is empty set source to google 
		if (cookieObj.ga_gclid !== '' && cookieObj.ga_source === '')
		{
			cookieObj.ga_source = 'google';
		} 
		else if(ignoreUtmParameters)
		{ //check for refferrer url of host to be >=0
			if(document.referrer.indexOf(document.location.host) >= 0) return;
			if(window.getTrafficSrcCookie() !== null && document.referrer === '') return;
			cookieObj.ga_source = document.referrer !== '' ? document.referrer : '(direct)';
		}
		//if there is no keyword value reutrn source, else return keyword value
		cookieObj.ga_keyword = cookieObj.ga_keyword === '' ? utils.getKeywords(cookieObj.ga_source) : cookieObj.ga_keyword;
		cookieObj.ga_medium = utils.getMedium(cookieObj);
		//get landing page as href value of given document
		cookieObj.ga_landing_page = document.location.href;
		cookieObj.ga_source = utils.getHostname(cookieObj.ga_source);
		cookieObj.ga_client_id = ga.getAll()[0].get('clientId');

		//coverting cookieObj o JSON String
		if(cookieObj.ga_source !== '') {
			//coverting Javascript value under cookieObj to JSON String
			var cookieStr = JSON.stringify(cookieObj);
			document.cookie = cookieStrKey + '=; expires=' + new Date(-1);
			document.cookie = cookieStrKey + '=' + cookieStr + '; expires=' + utils.getDateAfterYears(1) + '; path=/';
		}
		
	};

	utils.waitLoad(function() {
		//works if JSON is not undedfined, return JSON values
		return typeof JSON !== 'undefined';
	}, function() {
		//works when Analytics tracker(ga) exists on site
		utils.waitLoad(function() {
			return typeof ga.getAll !== 'undefined';
		}, setCookie);
	});
	
})(window, document)

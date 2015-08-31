(function (window, document)
{
	
	var cookieStrKey = 'traffic_src';
	
	//inject global function for cookie retrieval
	window.getTrafficSrcCookie = function()
	{
		var cookies = document.cookie.split(';');
		var cookieObj = cookies.filter(function(cookie) {
			return cookie.indexOf(cookieStrKey) >= 0;
		})[0];
		if(cookieObj)
		{
			cookieObj = cookieObj.substring(cookieObj.indexOf('=') + 1, cookieObj.length);
			return JSON.parse(cookieObj);
		}
		return null;
	};

	var utils = {
		getParameterByName: function(url, name)
		{
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
			var results = regex.exec(url);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		getKeywords: function(url)
		{	
			if(url === '' || url === 'direct') return '';
			
			var searchEngines = 'daum:q eniro:search_word naver:query pchome:q images.google:q google:q yahoo:p yahoo:q msn:q bing:q aol:query aol:q lycos:q lycos:query ask:q cnn:query virgilio:qs baidu:wd baidu:word alice:qs yandex:text najdi:q seznam:q rakuten:qt biglobe:q goo.ne:MT search.smt.docomo:MT onet:qt onet:q kvasir:q terra:query rambler:query conduit:q babylon:q search-results:q avg:q comcast:q incredimail:q startsiden:q go.mail.ru:q centrum.cz:q 360.cn:q sogou:query tut.by:query globo:q ukr:q so.com:q haosou.com:q auone:q'.split(' ');
			for(var i = 0; i < searchEngines.length; i++)
			{
				var val = searchEngines[i].split(':');
				var name = val[0];
				var queryParam = val[1];
				if(url.indexOf(name) >= 0 && this.getParameterByName(url, queryParam) !== '') {
					return this.getParameterByName(url, queryParam);
				}
			}
			
			var google = new RegExp('^https?:\/\/(www\.)?google(\.com?)?(\.[a-z]{2}t?)?\/?$', 'i');
			var yahoo = new RegExp('^https?:\/\/(r\.)?search\.yahoo\.com\/?[^?]*$', 'i');
			var bing = new RegExp('^https?:\/\/(www\.)?bing\.com\/?$', 'i');
			if(google.test(url) || yahoo.test(url) || bing.test(url)) {
				return '(not provided)';
			}
			
			return '';
		},

		getMedium: function(ccokieObj)
		{
			if(cookieObj.utm_medium !== '') return cookieObj.utm_medium;

			if(cookieObj.gclid !== '') return 'cpc';

			if(cookieObj.utm_source === '') return '';

			if(cookieObj.utm_source === 'direct') return '(none)';

			if(cookieObj.utm_term !== '') return 'organic';

			return 'referral';
		},

		getDateAfterYears: function(years)
		{
			return new Date(new Date().getTime() + (years * 365 * 24 * 60 * 60 * 1000));
		}
	};

	var parameters = [{
		key: 'utm_source',
		required:  true
	}, {
		key: 'utm_medium',
		required: true
	}, {
		key: 'utm_campaign',
		required: true
	}, {
		key: 'utm_content',
		required: false
	}, {
		key: 'utm_term',
		required: false
	}];

	var cookieObj = {};

	var setCookie = function()
	{
		cookieObj.gclid = utils.getParameterByName(document.location.href, 'gclid');

		var ignoreUtmParameters = false;
		for(var i = 0; i < parameters.length; i++) {
			var value = utils.getParameterByName(document.location.href, parameters[i].key);
			if(parameters[i].required && value === '') {
				ignoreUtmParameters = true;
				for(var j = 0; j < parameters.length; j++) {
					cookieObj[parameters[j]['key']] = '';
				}
				break;
			}
			cookieObj[parameters[i]['key']] = value;
		}

		if (cookieObj.gclid !== '' && cookieObj.utm_source === '')
		{
			cookieObj.utm_source = 'google';
		} 
		else if(ignoreUtmParameters)
		{
			if(document.referrer.indexOf(document.location.host) >= 0) return;
			if(window.getTrafficSrcCookie() !== null && document.referrer === '') return;
			cookieObj.utm_source = document.referrer !== '' ? document.referrer : 'direct';
		}
		
		cookieObj.utm_term = cookieObj.utm_term === '' ? utils.getKeywords(cookieObj.utm_source) : cookieObj.utm_term;
		cookieObj.utm_medium = utils.getMedium(cookieObj);
		cookieObj.landing_page = document.location.href;

		if(cookieObj.utm_source !== '')
		{
			var cookieStr = JSON.stringify(cookieObj);
			document.cookie = cookieStrKey + '=; expires=' + new Date(-1);
			document.cookie = cookieStrKey + '=' + cookieStr + '; expires=' + utils.getDateAfterYears(1);
		}
	};

	setCookie();
})(window, document);
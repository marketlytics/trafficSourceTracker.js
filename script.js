//TODO: get keyword from document.referrer
//TODO: skip direct if cookie is present
//TODO: mendatory utm parameters source, medium and campaign (goto )
//TODO: add landing page
//TODO: improve logic for detecting whether the source is organic or not .... for e.g check for 'q' param with google.com to ensure that the user came from google's search engine and not from the google forums

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

(function (window, document)
{

	var utils = {
		getParameterByName: function(url, name)
		{
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
			var results = regex.exec(url);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		isOrganic: function(url)
		{
			return url.indexOf('bing.com') >= 0 || url.indexOf('yahoo.com') >= 0 || url.indexOf('google.com') >= 0;
		},

		getMedium: function(ccokieObj)
		{
			if(cookieObj.utm_medium !== '') return cookieObj.utm_medium;

			if(cookieObj.gclid !== '') return 'cpc';

			if(cookieObj.utm_source === '') return '';

			if(cookieObj.utm_source === 'direct') return '(none)';

			if(this.isOrganic(cookieObj.utm_source)) return 'organic';

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

	var cookieStrKey = 'traffic_src';

	var setCookie = function()
	{
		cookieObj.gclid = utils.getParameterByName(document.location.href, 'gclid');

		var ignoreUtmParameters = false;
		for(var i = 0; i < parameters.length; i++) {
			var value = utils.getParameterByName(document.location.href, parameters[i].key);
			if(parameters[i].required && value === '') {
				ignoreUtmParameters = true;
				for(var j = 0; j < parameters.length; j++) {
					cookieObj[parameters[j][key]] = '';
				}
				break;
			}
			cookieObj[parameters[i]] = value;
		}

		if (cookieObj.gclid !== '' && cookieObj.utm_source === '')
		{
			cookieObj.utm_source = 'google';
			
		} 
		else if(ignoreUtmParameters && getTrafficSrcCookie() === null)
		{
			if(document.referrer.indexOf(document.location.host) >= 0) {
				return;
			}

			if(document.referrer !== '') {
				//parse
			} else {
				//utm_source = direct
			}

		}

		cookieObj.utm_medium = utils.getMedium(cookieObj);

		//save cookie here
		if(cookieObj.utm_source !== '') {
			var cookieStr = JSON.stringify(cookieObj);
			document.cookie = cookieStrKey + '=; expires=' + new Date(-1);
			document.cookie = cookieStrKey + '=' + cookieStr + '; expires=' + utils.getDateAfterYears(1);
		}
	};

	setCookie();
})(window, document);
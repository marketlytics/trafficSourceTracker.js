(function (window, document) {
	var utils = {
		getParameterByName: function(url, name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
			var results = regex.exec(url);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		isOrganic: function(url) {
			return url.indexOf('bing.com') >= 0 || url.indexOf('yahoo.com') >= 0 || url.indexOf('google.com') >= 0;
		},

		getMedium: function(ccokieObj) {
			if(cookieObj.gclid !== '') {
				return 'cpc';
			}

			if(cookieObj.utm_source === '') {
				return '';
			}

			if(cookieObj.utm_source === 'direct') {
				return '(none)';
			}

			if(this.isOrganic(cookieObj.utm_source)) {
				return 'organic';
			}

			return 'referral';
		},

		getDateAfterYears: function(years) {
			return new Date(new Date().getTime() + (years * 365 * 24 * 60 * 60 * 1000));
		}
	};

	var parameters = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'];

	var cookieObj = {};

	var cookieStrKey = 'traffic_src';

	var setCookie = function() {
		for(var i = 0; i < parameters.length; i++) {
			var value = utils.getParameterByName(document.location.href, parameters[i]);
			cookieObj[parameters[i]] = value;
		}

		cookieObj.utm_source = cookieObj.utm_source === '' ? (document.referrer.indexOf(document.location.host) >= 0 ? '' : (document.referrer !== '' ? document.referrer : 'direct')) : cookieObj.utm_source;
		cookieObj.utm_medium = cookieObj.utm_medium === '' ? utils.getMedium(cookieObj) : cookieObj.utm_medium;
		
		if(cookieObj.utm_source !== '') {
			var cookieStr = JSON.stringify(cookieObj);
			document.cookie = cookieStrKey + '=; expires=' + new Date(-1);
			document.cookie = cookieStrKey + '=' + cookieStr + '; expires=' + utils.getDateAfterYears(1);
		}
	};

	window.getTrafficSrcCookie = function() {
		var cookies = document.cookie.split(';');
		var cookieObj = cookies.filter(function(cookie) {
			return cookie.indexOf(cookieStrKey) >= 0;
		})[0];
		if(cookieObj) {
			cookieObj = cookieObj.substring(cookieObj.indexOf('=') + 1, cookieObj.length);
			return JSON.parse(cookieObj);
		}
		return null;
	};

	setCookie();
})(window, document);
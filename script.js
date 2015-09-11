<script>
(function (window, document)
{

	if(typeof JSON === 'undefined') {
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'text/javascript');
		fileref.setAttribute('src', '//cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js');
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}

	var cookieStrKey = 'traffic_src';
	
	//inject global function for cookie retrieval
	window.getTrafficSrcCookie = function()
	{
		var cookies = document.cookie.split(';');
		var cookieObj;
		for(var i = 0; i < cookies.length; i++) {
			if(cookies[i].indexOf(cookieStrKey) >= 0) {
				cookieObj = cookies[i];
				break;
			}
		}
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
			if(cookieObj.ga_medium !== '') return cookieObj.ga_medium;

			if(cookieObj.gclid !== '') return 'cpc';

			if(cookieObj.ga_source === '') return '';

			if(cookieObj.ga_source === 'direct') return '(none)';

			if(cookieObj.ga_keyword !== '') return 'organic';

			return 'referral';
		},

		getDateAfterYears: function(years)
		{
			return new Date(new Date().getTime() + (years * 365 * 24 * 60 * 60 * 1000));
		},

		getHostname: function(url)
		{
			var re = new RegExp('^(https:\/\/|http:\/\/)?([^\/?:#]+)');
			var match = re.exec(url)[2];
			if(match !== null) {
				return match;
			}
			return '';
		},

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

	var cookieObj = {};

	var setCookie = function()
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

		if (cookieObj.ga_gclid !== '' && cookieObj.ga_source === '')
		{
			cookieObj.ga_source = 'google';
		} 
		else if(ignoreUtmParameters)
		{
			if(document.referrer.indexOf(document.location.host) >= 0) return;
			if(window.getTrafficSrcCookie() !== null && document.referrer === '') return;
			cookieObj.ga_source = document.referrer !== '' ? document.referrer : 'direct';
		}
		
		cookieObj.ga_keyword = cookieObj.ga_keyword === '' ? utils.getKeywords(cookieObj.ga_source) : cookieObj.ga_keyword;
		cookieObj.ga_medium = utils.getMedium(cookieObj);
		cookieObj.ga_landin_page = document.location.href;
		cookieObj.ga_source = utils.getHostname(cookieObj.ga_source);
		cookieObj.ga_client_id = ga.getAll()[0].get('clientId');


		if(cookieObj.ga_source !== '') {
			var cookieStr = JSON.stringify(cookieObj);
			document.cookie = cookieStrKey + '=; expires=' + new Date(-1);
			document.cookie = cookieStrKey + '=' + cookieStr + '; expires=' + utils.getDateAfterYears(1);
		}
		
	};

	utils.waitLoad(function() {
		return typeof JSON !== 'undefined';
	}, function() {
		utils.waitLoad(function() {
			return typeof ga.getAll !== 'undefined';
		}, setCookie);
	});
	
})(window, document)
</script>
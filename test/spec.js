var expect = require('chai').expect

function requireUncached(module){
    delete require.cache[require.resolve(module)]
    return require(module)
}

var cookie = '';
global.document = {
	location: {
		href: '',
		host: ''
	},
	referrer: '',
	get cookie() {
		return cookie;
	},
	set cookie(value) {
		if(value.indexOf('1970') >= 0) {
			return cookie = '';
		}
		if(value.indexOf(' expires') >= 0) {
			value = value.substring(0, value.indexOf(' expires'));
		}
		cookie = value;
	}
};
global.document.cookie = '';
global.window = {};

describe("Metricon Script", function() {

	it('test 1', function() {
		document.location = {
			href: 'http://www.marketlytics.com/',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.google.com.pk/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.utm_source).to.equal('http://www.google.com.pk/');
		expect(cookieObj.utm_medium).to.equal('organic');
	});

	it('test 2', function() {
		document.location = {
			href: 'http://www.marketlytics.com/?utm_source=facebook.com',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.google.com.pk/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.utm_source).to.equal('facebook.com');
		expect(cookieObj.utm_medium).to.equal('referral');
	});

	it('test 3', function() {
		document.location = {
			href: 'http://www.marketlytics.com/?utm_source=facebook.com&utm_medium=cpc',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.google.com.pk/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.utm_source).to.equal('facebook.com');
		expect(cookieObj.utm_medium).to.equal('cpc');
	});

	it('test 4', function() {
		document.location = {
			href: 'http://www.marketlytics.com/?gclid=123213',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.bing.com/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.utm_source).to.equal('http://www.bing.com/');
		expect(cookieObj.utm_medium).to.equal('cpc');
	});

	it('test 5 - should not overwrite cookie if referrer is from the same domain', function() {
		document.location = {
			href: 'http://www.marketlytics.com/',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.marketlytics.com/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.utm_source).to.equal('http://www.bing.com/');
		expect(cookieObj.utm_medium).to.equal('cpc');
	});

	it('test 6', function() {
		document.location = {
			href: 'http://www.marketlytics.com/',
			host: 'marketlytics.com'
		};
		document.referrer = '';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.utm_source).to.equal('direct');
		expect(cookieObj.utm_medium).to.equal('(none)');
	});
});
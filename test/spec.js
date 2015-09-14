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
			cookie = '';
			return;
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
		expect(cookieObj.ga_source).to.equal('www.google.com.pk');
		expect(cookieObj.ga_medium).to.equal('organic');
		expect(cookieObj.ga_keyword).to.equal('(not provided)');
	});

	it('test 2', function() {
		document.location = {
			href: 'http://www.marketlytics.com/?utm_source=facebook.com',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.google.com.pk/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.ga_source).to.equal('www.google.com.pk');
		expect(cookieObj.ga_medium).to.equal('organic');
		expect(cookieObj.ga_keyword).to.equal('(not provided)');
	});

	it('test 3', function() {
		document.location = {
			href: 'http://www.marketlytics.com/?utm_source=facebook.com&utm_medium=cpc',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.google.com.pk/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.ga_source).to.equal('www.google.com.pk');
		expect(cookieObj.ga_medium).to.equal('organic');
		expect(cookieObj.ga_keyword).to.equal('(not provided)');
	});
	
	it('test 4', function() {
		document.location = {
			href: 'http://www.marketlytics.com/?utm_source=facebook.com&utm_medium=cpc&utm_campaign=fbads',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.google.com.pk/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.ga_source).to.equal('facebook.com');
		expect(cookieObj.ga_medium).to.equal('cpc');
		expect(cookieObj.ga_keyword).to.equal('');
	});

	it('test 5', function() {
		document.location = {
			href: 'http://www.walmart.ca/search/canadian%20spa%20company?gclid=CLGDyL2t1ccCFQVuGwodWuUHtw',
			host: 'www.walmart.ca'
		};
		document.referrer = 'http://www.bing.com/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.ga_source).to.equal('google');
		expect(cookieObj.ga_medium).to.equal('cpc');
		expect(cookieObj.ga_gclid).to.equal('CLGDyL2t1ccCFQVuGwodWuUHtw');
	});

	it('test 6 - should not overwrite cookie if referrer is from the same domain', function() {
		document.location = {
			href: 'http://www.marketlytics.com/',
			host: 'marketlytics.com'
		};
		document.referrer = 'http://www.marketlytics.com/';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.ga_source).to.equal('google');
		expect(cookieObj.ga_medium).to.equal('cpc');
	});

	it('test 7', function() {
		document.location = {
			href: 'http://www.marketlytics.com/',
			host: 'marketlytics.com'
		};
		document.referrer = '';
		var script = requireUncached('../script');
		var cookieObj = window.getTrafficSrcCookie();
		expect(cookieObj.ga_source).to.equal('google');
		expect(cookieObj.ga_medium).to.equal('cpc');
	});
});
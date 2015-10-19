# trafficSource-tracker
A replacement for Google Analytics last non direct click tracking utmz cookie. This can be used to collect data about source of traffic for integration with crm

Google Analytics classic used to provide a handy cookie which contained the traffic source information for the user visiting the site. The data stored in the cookie followed google analytics last non direct click model for traffic attribution and stored the source in a handy format. This was a boon for any marketers looking to integrate traffic source data into 3rd party tools like CRM and other databases.

With the move to universal analytics this source tracking was moved serverside leaving all the existing integrations in a lurch. Google Analytics will eventually discontinue classic analytics. This presented a need for replacement script that followed the default attribution model favored by google analytics. 

## Installation
Include the script.js file on all pages before `</body>` recommended minify it before use.

Or even better deploy it via Google Tag Manager.
  - Setup a custom html tag
  - Add script.js code to the tag.
  - Trigger `All Pages` 
  

## Usage
As a result on each the following function is available 
`getTrafficSrcCookie()`
  A global function injected by the script to retrieve the traffic source a/c to the last non-direct click attribution model.

Arguments: 
none

Return:
Returns a javascript object if the cookie is saved. Returns null otherwise. The object returned by this function has following properties:

| Key             | Type   | Value                                                                                               |
|-----------------|--------|-----------------------------------------------------------------------------------------------------|
| ga_source       | string | ‘direct’, ‘google’ or the source fetched from either the utm_source parameter or `document.referrer` |
| ga_medium       | string | ‘(none)’, ‘cpc’, ‘organic’, ‘referral’ or the value fetched from the utm_medium parameter.          |
| ga_campaign     | string | ‘(not provided)’ or the utm_term parameter fetched from the parameter or document.referrer.         |
| ga_content      | string | ‘’ or fetched from utm_content parameter.                                                           |
| ga_term      | string | keyword data for organic search or fetched from utm_term parameter.                                     |
| ga_gclid      | string | google adwords click id parameter                                                           |
| ga_landing_page | string | ‘’ or fetched from document.location.href.                                                          |
| ga_client_id    | string | fetched from google universal analytics global object.                      

Where empty string represents absence of a field.

## todo
Cross domain tracking: currently a new traffic source is registered when hostname changes for feature parity with google analytics classic cross domain tracking should be added to pass source data between domains.

## License
This is licensed under the [MIT License](https://github.com/marketlytics/trafficSource-tracker/blob/master/LICENSE). 

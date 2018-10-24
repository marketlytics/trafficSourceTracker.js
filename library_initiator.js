<script>
//Code to Save data in cookie using the library with Google Analytics Client ID
trafficSrcCookie.setCookie({getGaClient: true});

//Code to Save data in cookie using the library without Google Analytics Client ID
trafficSrcCookie.setCookie();

//Document Listener for the event set by the Traffic Source Tracker Library
document.addEventListener("Traffic_Source_Ready_Dom", function(e){
	console.log("This is a test");
});

//jQuery Listener for the event set by the Traffic Source Tracker Library
jQuery(document).on("Traffic_Source_Ready_jQuery",function(){
	console.log("This is a test");
});

//$ Listener for the event set by the Traffic Source Tracker Library
$(document).on("Traffic_Source_Ready_$",function(){
	console.log("This is a test");
});
</script>

<script>
$(document).ready(function(){
	$(document).on('Traffic_Source_Ready',function(){
		console.log("This Script is ready")
	});

	$(document).on('Traffic_Source_Cookie_Set',function(){
		console.log("This Cookie is Set")
	});

	$(document).on('Traffic_Source_Cookie_Get',function(){
		console.log("This Cookie is retrieved")
	});
});
</script>

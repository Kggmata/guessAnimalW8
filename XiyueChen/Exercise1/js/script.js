function getYear(year) {
	if(year) {
		return year.match(/[\d]{4}/); // This is regex (https://en.wikipedia.org/wiki/Regular_expression)
	}
}

function iterateRecords(data) {

	console.log(data);

	$.each(data.result.records, function(recordKey, recordValue) {

		var recordTitle = recordValue["dc:title"];
		var recordYear = getYear(recordValue["dcterms:temporal"]);
		var recordImage = recordValue["150_pixel_jpg"];
		var recordImageLarge = recordValue["1000_pixel_jpg"];
		var recordDescription = recordValue["dc:description"];

		if(recordTitle && recordYear && recordImage && recordDescription) {

			if(recordYear < 1900) { // Only get records from the 19th century

				$("#records").append(
					$('<article class="record">').append(
						$('<h2>').text(recordTitle),
						$('<h3>').text(recordYear),

						$('<a>').attr("href", recordImageLarge).addClass("chocolat-image").attr("title", recordTitle).append(
							$('<img>').attr("src", recordImage)
						),
						
						$('<p>').text(recordDescription)
					)
				);

			}

		}

	});

	var chocapi = Chocolat(document.querySelectorAll('.chocolat-image')).api; // Initialize the chocolat plugin

	setTimeout(function() {
		$("body").addClass("loaded");
	}, 2000); // 2 second delay

	$("#filter-count strong").text($(".record:visible").length);

	$("#filter-text").keyup(function() {
		var searchTerm = $(this).val();
		console.log(searchTerm);
		$(".record").hide();
		$(".record a").removeClass("chocolat-image"); // Remove the chocolat class from the images so they don't open in the lightbox
		$(".record:contains('" + searchTerm + "')").show();
		$(".record:contains('" + searchTerm + "') a").addClass("chocolat-image"); // Add the chocolat class to the images that match the search term i.e. visible records
		$("#filter-count strong").text($(".record:visible").length);

		chocapi.destroy(); // Destroy the lightbox
		chocapi = Chocolat(document.querySelectorAll('.chocolat-image')).api; // Re-initialise the lightbox
	});

}

$(document).ready(function() {

	var slqData = JSON.parse(localStorage.getItem("slqData"));
	//var slqData = JSON.parse(sessionStorage.getItem("slqData"));

	if (slqData) {
		console.log("Source: localStorage");
		iterateRecords(slqData);
	} else {

		var data = {
			resource_id: "9eaeeceb-e8e3-49a1-928a-4df76b059c2d",
			limit: 100
		}
	
		$.ajax({
			url: "https://data.qld.gov.au/api/3/action/datastore_search",
			data: data,
			dataType: "jsonp", // We use "jsonp" to ensure AJAX works correctly locally (otherwise XSS).
			cache: true,
			success: function(data) {
				console.log("Source: API");
				localStorage.setItem("slqData", JSON.stringify(data));
				//sessionStorage.setItem("slqData", JSON.stringify(data));
				iterateRecords(data);
			}
		});

	}

});
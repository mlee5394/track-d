'use strict';


function initMap() {
	var map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 47.653662, lng: -122.304220},
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	
	var geocoder = new google.maps.Geocoder();
	var markers = new Array();
	var infowindow;
	$.get('/api/v1/eventslist').then(function(events) {
		
		// Clears map initially of markers
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
		
		// Loops through event data to plot onto Map
		events.forEach(function(events) {
			console.log(events.loc);
			
			// Turns address into LatLng Coordinates
			geocoder.geocode({'address': events.loc}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					
					map.setCenter(results[0].geometry.location);
					infowindow = new google.maps.InfoWindow({
						content: events.loc
					});
					
					// Sets the marker from given location
					var marker = new google.maps.Marker({
						map: map,
						position: results[0].geometry.location
					});
					
					marker.addListener('click', function() {
						infowindow.open(map, marker);
					})
					// console.log(markers)
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});
		});
	});
	

}
'use strict';

var infowindow;

function initMap() {
	var map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 47.653662, lng: -122.304220},
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	
	var geocoder = new google.maps.Geocoder();
	// var markers = new Array();
	infowindow = new google.maps.InfoWindow();
	$.get('/api/v1/events31').then(function(events) {
		
		// // Clears map initially of markers
		// markers.forEach(function(marker) {
		// 	marker.setMap(null);
		// });
		// markers = [];
		
		// Loops through event data to plot onto Map
		events.forEach(function(events) {
			console.log(events.loc);
			
			// Turns address into LatLng Coordinates
			geocoder.geocode({'address': events.loc}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					var lat = results[0].geometry.location.lat();
					var lng = results[0].geometry.location.lng();
					// createMarker(events, lat, lng);
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(lat, lng),
						map: map
					});
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		});
	});
}

function createMarker(events, lat, lng) {
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat, lng),
		map: map
	});
	
	google.maps.event.addListener(marker, 'click', function() {
		console.log("Hello");
		// infowindow.setContent(events.loc);
		// infowindow.open(map, marker);
	});
}
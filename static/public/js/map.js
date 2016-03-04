'use strict';

function initialize() {
	navigator.geolocation.getCurrentPosition(function(position) {
		var latlng = new google.maps.LatLng(position.coords.latitutde, position.coords.longitude);
		var mapOptions = {
			zoom: 15,
			center: latlng
		};
		var map = new google.maps.Map(document.getElementById("map"), mapOptions);
	})
}
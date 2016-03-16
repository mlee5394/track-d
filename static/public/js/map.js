'use strict';

var markers = [];
// var infowindow;

function initMap() {
	var map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 47.653662, lng: -122.304220},
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});
	
	var infowindow = new google.maps.InfoWindow();
	
	$.get('/api/v1/events/map31').then(function(events) {
		
		// Loops through event data to plot onto Map
		events.forEach(function(events) {
			
			var startTime = new Date(events.start);
			var endTime = new Date(events.end);
			var options = { 
				weekday: 'long', 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric', 
				hour: 'numeric', 
				minute: 'numeric', 
				hour12: true
			};
			
			var url = JSON.stringify(events);
			url = encodeURIComponent(url);			
			
			var eventInfo = "<div class=\"info\">" +
				"<a href=\"eventInfo.html?json=" + url + "\"><h2>" + events.eventname + "</h2></a>" + 
				"<p>Starts: " + startTime.toLocaleDateString('en-US', options) + "<br />" +
				"Ends: " + endTime.toLocaleDateString('en-US', options) + "<br />" +
				events.loc + "<br />" +
				"Hosted By: " + events.orgname +
				"</p>" + "</div>";
			
			var marker = (new google.maps.Marker({
				position: events.latlng,
				map: map,
				animation: google.maps.Animation.DROP
			}));
			
			infowindow = new google.maps.InfoWindow({ 
				content: eventInfo,
				maxWidth: 320
			});
			
			if (locExists(marker, eventInfo)) {				
				for (var i = 0; i < markers.length; i++) {
					if (markers[i].marker.position.lat() == marker.position.lat() && markers[i].marker.position.lng() == marker.position.lng()) {
						markers[i].infowindow.content += eventInfo;
						eventInfo = markers[i].infowindow.content;
					}
				}
			} else {
				markers.push({ marker: marker, infowindow: infowindow });
			}
			
			marker.addListener('click', function() {
				infowindow.close();
				infowindow.setContent(eventInfo);
				infowindow.open(map, marker);
			});
		});
	});
}

function locExists(event, eventInfo) {
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].marker.position.lat() == event.position.lat() && markers[i].marker.position.lng() == event.position.lng()) {
			return true;
		}
	}
	return false;
}
function showNoEvent() {
	$('.noevents').css('display', 'block');
	$('.table').css('display', 'none');
}

function exists() {
	$('.exists').css('display', 'block');
}

function success() {
	$('.alert-success').css('display', 'block');
}

function startMatch() {
	$('.wrongstart').css('display', 'block');
}

function endMatch() {
	$('.wrongend').css('display', 'block');
}

var placeName = "";

function initAutocomplete() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 47.653662, lng: -122.304220},
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('loc');
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    placeName = places;
    console.log(placeName)
    
    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

angular.module('Events', [])
    .controller("SignInController", function($scope, $http) {
        'use strict';
        
        $scope.signin = function() {
            var adminInfo = {
                username: $scope.username,
                password: $scope.password
            };
            
            $http.post('/secure/signin', adminInfo)
            .then(function(response) {
				if (response.status == 200) {
					window.location.href = '/dashboard.html'
				}
            })
			.catch(function(err) {
				$scope.user = true;
			});
        }
    })
	.controller('EventsController', function($scope, $http) {
		'use strict';
        
		$scope.save = function() {
            // console.log(placeName);
            
			var event = {
				eventname: $scope.eventname,
				fblink: $scope.link,
				orgname: $scope.orgname,
				start: $scope.start,
				end: $scope.end,
				loc: $scope.loc,
				room: $scope.room,
				description: $scope.description
			}
			var today = new Date();
			if (Date.parse(today) > Date.parse(event.start)) {
				console.log("Start date cannot happen before today's date");
				startMatch();
			} else if (Date.parse(event.start) > Date.parse(event.end)) {
				console.log("You can't end an event before you start it!");
				endMatch();
			} else {
				$http.post('/newevent', event).then(function(data) {
					$scope.events = data.data;
					success();
				}).catch(function(reason) {
					if (reason.status == '400') {
						exists();
					}
				})
			}

		}
	})
	.controller('ViewController', function($scope, $http) {
		'use strict';
		
		$http.get('/api/v1/eventslist').then(function(data) {
			$scope.events = data.data;
		}).catch(function(reason) {
			if (reason.status == '400') {
				showNoEvent();
			}
		});
	}).controller("MapController", function($scope, $http) {
		
	});
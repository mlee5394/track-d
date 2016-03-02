function showNoEvent() {
	$('.noevents').css('visibility', 'visible');
	$('.table').css('visibility', 'hidden');
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
                console.log(response);
                console.log("worked?");
            });
        }
    })
	.controller('EventsController', function($scope, $http) {
		'use strict';
		
		$scope.save = function() {
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
			console.log(today);
			console.log(event.start);
			console.log(event.end);
			if (Date.parse(today) > Date.parse(event.start)) {
				console.log("Start date cannot happen before today's date");
				alert("You made a mistake! You can't have an event that works in the past.");
			} else if (Date.parse(event.start) > Date.parse(event.end)) {
				console.log("You can't end an event before you start it!");
				alert("You can't end an event before it starts!");
			} else {
				console.log(event);
				$http.post('/newevent', event);
				alert("Event posted!");
			}

		}
	})
	.controller('ViewController', function($scope, $http) {
		'use strict';
		
		$http.get('/api/v1/eventslist').then(function(data) {
			$scope.events = data.data;
			// console.log($scope.events[0].start);
			// var newstart = $scope.events[0].start;
			
		}).catch(function(reason) {
			if (reason.status == '400') {
				showNoEvent();
			}
		});
	});
	
	// person who is logged in is admin,
	// allowed to 
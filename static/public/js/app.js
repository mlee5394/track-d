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
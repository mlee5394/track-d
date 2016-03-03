function noEvents() {
	$('.noevents').css('display', 'block');
	$('.table').css('display', 'none');
}

angular.module('Dashboard', [])
	.controller("EventApprovalController", function($scope, $http) {
		'use strict';
		
		// Signs out the Admin for this session
		$scope.signout = function() {
			$http.get('/signout')
			.then(function(response) {
				if (response.status == 200) {
					window.location.href = '/index.html'
				}
			});
		};
		
		// Grabs all events to display for the admin to approve
		$http.get('/api/v1/admin/approve/wait')
		.then(function(data) {
			$scope.events = data.data;
		}).catch(function(err) {
			if (err.status == 400 || err.status == 401) {
				noEvents();
			}
		});
		
		// This removes an event.
		$scope.removeEvent = function(event) {
			console.log("Deleting event");
			$http.delete('/api/v1/admin/decline/' + event._id).then(function(response) {
				
				$http.get('/api/v1/admin/approve/wait')
				.then(function(data) {
					$scope.events = data.data;
				}).catch(function(err) {
					if (err.status == 400 || err.status == 401) {
						noEvents();
					}
				});
				
			}).catch(function(err) {
				if (err.status == 400 || err.status == 401) {
					noEvents();
				}
			});
		};
		
		// This approves an event.
		$scope.approveEvent = function(event) {
			console.log("Approving event");
			$http.post('/api/v1/admin/approve/' + event._id).then(function(response) {
				
				$http.get('/api/v1/admin/approve/wait')
				.then(function(data) {
					$scope.events = data.data;
				}).catch(function(err) {
					if (err.status == 400 || err.status == 401) {
						noEvents();
					}
				});
				
			});
		}
		
		
	}).controller("ApprovalController", function($scope, $http) {
		'use strict';
		
		// Signs out the Admin for this session
		$scope.signout = function() {
			$http.get('/signout')
			.then(function(response) {
				if (response.status == 200) {
					window.location.href = '/index.html'
				}
			});
		};
		
		// Grabs all events to display for approved events
		$http.get('/api/v1/admin/approve/approved')
		.then(function(data) {
			$scope.events = data.data;
		}).catch(function(err) {
			if (err.status == 400 || err.status == 401) {
				noEvents();
			}
		});
	})
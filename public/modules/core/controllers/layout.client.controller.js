'use strict';

angular.module('core').controller('LayoutController', ['$scope', '$location',
		function($scope, $location) {

			$scope.showHeader = function() {
				var header_pages = ['/playlists'];
				if (header_pages.indexOf($location.path()) >= 0) {
					return true;
				} else {
					return false;
				}
			};
		}
]);

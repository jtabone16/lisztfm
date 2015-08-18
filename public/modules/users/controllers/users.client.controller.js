'use strict';

angular.module('users').controller('UsersController', ['$state', '$scope', '$http', '$window', '$location', 'Authentication',
  function($state, $scope, $http, $window, $location, Authentication) {
    if($window.user === '') {
        $location.path('/signin');
    }

    $scope.user = $window.user;
    $scope.avatar = $scope.user.providerData.images[0].url;



  }
]);

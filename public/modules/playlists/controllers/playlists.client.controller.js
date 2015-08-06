'use strict';

angular.module('playlists').controller('PlaylistsController', ['$scope', '$http', '$state', '$window', '$location', 'Spotify',
	function($scope, $http, $state, $window, $location, Spotify) {

		$scope.playlists = [];
		$scope.playlistsReady = false;
		$scope.currentPlaylist = '';
		$scope.tracks = [];
		$scope.tracksToDelete = [];
		$scope.deleteTracks = 0;
		$scope.currentUser = $window.user.username;

		// $scope.remaining_playlists = 0;  TODO: get playlists if user has more than 50


		//TODO: if token expires, use refresh token?


		//Get playlists for current user from DB first, the if needed, make a request from Spotify
		// $http.get('/user/check')
		// 	.success(function(response) {
		// 		if (response.length === 0){
		// 			$scope.getPlaylists();
		// 		}
		// 		else{
		// 			$scope.playlists = response;
		// 			$scope.playlistsReady = true;
		// 		}
		// 	}).error(function (err){
		// 		console.log('User cannot be found. Try logging in.');
		// 	});

		$scope.getPlaylists = function(){
			var req = {
				 method: 'GET' ,
				 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists' + '?limit=50',
				 headers: {
					 'Authorization': 'Bearer ' + $window.user.providerData.token
				 },
			};

			//Get current user's spotify playlists
			$http(req).
				success(function(res){
					$http.post('/user/playlists/add', res.items).
						success(function(response){
							$scope.playlists = response;
							$scope.playlistsReady = true;
					});
				});
		};

		$scope.getPlaylists();


		$scope.getCurrentPlaylist = function(plist){


			$http.post('/user/playlists/selected', plist).
				success(function(res){
					$scope.currentPlaylist = res.playlist;
					$scope.tracks = res.tracks;
				});
		};


		$scope.trackSelected = function(track){
			console.log(track);
		};

		$scope.changeRating = function(track) {
			if (track.rating === 2) {
				track.rating = 0;
			}
			else{
				track.rating++;
			}
		};

		$scope.removeTrack = function(track){
			var track_uri = 'spotify:track:' + track.id;
			var found = false;

			for (var i = 0; i < $scope.tracksToDelete.length; i++){
				if ($scope.tracksToDelete[i].uri === track_uri){
					found = true;
					$scope.tracksToDelete.splice(i, 1);
					track.edited = false;
					break;
				}
			}

			if (found === false){
				var trak = {
					'uri': track_uri,
					'artist': track.artist,
					'title': track.title,
				};
				$scope.tracksToDelete.push(trak);
				track.edited = true;
			}
		};

		$scope.deleteTracksNow = function(){
			var req = {
				 method: 'DELETE',
				 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' + $scope.tracks[0].playlist_id + '/tracks',
				 headers: {
					 'Authorization': 'Bearer ' + $window.user.providerData.token,
					 'Content-Type': 'application/json'
				 },
				 data: {
					 'tracks' : $scope.tracksToDelete
				 }
			};

			console.log(req);

			$http(req).
				success(function (res){
					$state.reload(); //TODO: create method to delete tracks from playlist rather than adding tracks from playlist again
					// $scope.getTracks($scope.currentPlaylist);
					var snap = {
						'id': res.snapshot_id,
						'date': new Date(),
					};
					$scope.currentPlaylist.snapshot_id.push(snap); //TODO: save snapshot for playlist in DB
					console.log($scope.currentPlaylist);
				}).
				error(function (res){
					console.log(res);
				});

		};



	}
]);

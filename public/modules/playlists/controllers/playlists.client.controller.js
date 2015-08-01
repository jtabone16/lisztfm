'use strict';

angular.module('playlists').controller('PlaylistsController', ['$scope', '$http', '$state', '$window', '$location', 'Spotify',
	function($scope, $http, $state, $window, $location, Spotify) {

		$scope.playlists = [];
		$scope.playlistsReady = false;


		// $scope.remaining_playlists = 0;  TODO: get playlists if user has more than 50


		//TODO: if token expires, use refresh token?

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
					$scope.playlists = res.items;
					$http.post('/playlist/add', $scope.playlists);
					$scope.playlistsReady = true;



				});

		};

		$scope.getTracks = function(){

			//NOTE: USED TO TEST IF TRACKS ARE BEING ADDED FOR FIRST playlist
			// $scope.postTracks($scope.playlists[0].tracks.href);

			for (var p in $scope.playlists){
				var tracks_link = $scope.playlists[p].tracks.href;
				var tracks_total = $scope.playlists[p].tracks.total;
				var numRequests = 1;

				if (tracks_total > 100){
					numRequests = Math.ceil(tracks_total/100);
				}


				if (numRequests === 1){ //100 tracks or less
					$scope.postTracks(tracks_link);
				}

				else{
					$scope.getMoreTracks(tracks_link, numRequests);
				}
			}

		};

		$scope.postTracks = function(tracks_link) {
			var req = {
				 method: 'GET',
				 url: tracks_link,
				 headers: {
					 'Authorization': 'Bearer ' + $window.user.providerData.token
				 },
			};

			$http(req).
				success(function(res){
					console.log(res);
					var tracks = res.items;
					var formattedTracks = [];
					for (var i in tracks){
						var artists = [];
						var added_by = '';
						for (var x in tracks[i].track.artists){
					      artists.push(tracks[i].track.artists[x].name);
					    }

						if (tracks[i].added_by !== null){
							added_by = tracks[i].added_by.id;
						}

						var track = {
							'added': tracks[i].added_at,
							'added_by': added_by,
							'name': tracks[i].track.name,
							'popularity': tracks[i].track.popularity,
							'preview': tracks[i].track.preview_url,
							'id': tracks[i].track.id,
							'explicit': tracks[i].track.explicit,
							'duration': tracks[i].track.duration_ms,
							'album': tracks[i].track.album.name,
							'artists': artists,
						};

						formattedTracks.push(track);
					}
					$http.post('/playlist/add/tracks', formattedTracks);

				});

		};

		$scope.getMoreTracks = function(tracks_link, numRequests){
			var offset = 0;

			for (var i = 0; i < numRequests; i++){
				if (i > 0){
					offset = offset + 100;
				}
				var offsetString = offset.toString();

				var req = {
					 method: 'GET',
					 url: tracks_link + '?offset=' + offsetString,
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.token
					 },
				};
				$scope.postMoreTracks(req);
			}



		};

		$scope.postMoreTracks = function(req) {
			$http(req).
				success(function(res){
					console.log(res);
					var tracks = res.items;
					var formattedTracks = [];
					for (var i in tracks){
						var artists = [];
						var added_by = '';
						for (var x in tracks[i].track.artists){
								artists.push(tracks[i].track.artists[x].name);
							}
						if (tracks[i].added_by !== null){
							added_by = tracks[i].added_by.id;
						}
						var track = {
							'added': tracks[i].added_at,
							'added_by': added_by,
							'name': tracks[i].track.name,
							'popularity': tracks[i].track.popularity,
							'preview': tracks[i].track.preview_url,
							'id': tracks[i].track.id,
							'explicit': tracks[i].track.explicit,
							'duration': tracks[i].track.duration_ms,
							'album': tracks[i].track.album.name,
							'artists': artists
						};

						formattedTracks.push(track);
					}
					$http.post('/playlist/add/tracks', formattedTracks);

				});

		};






	}
]);

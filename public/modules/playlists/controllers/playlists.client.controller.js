'use strict';

angular.module('playlists').controller('PlaylistsController', ['$scope', '$http', '$state', '$window', '$location', 'Spotify',
	function($scope, $http, $state, $window, $location, Spotify) {

		$scope.playlists = [];
		$scope.playlistsReady = false;
		$scope.currentPlaylist = '';
		$scope.formattedTracks = [];

		// $scope.remaining_playlists = 0;  TODO: get playlists if user has more than 50


		//TODO: if token expires, use refresh token?


		//Get playlists for current user from DB first, the if needed, make a request from Spotify
		$http.get('/user/check')
			.success(function(response) {
				if (response.length === 0){
					$scope.getPlaylists();
				}
				else{
					$scope.playlists = response;
					$scope.playlistsReady = true;
				}
			}).error(function (err){
				console.log('User cannot be found. Try logging in.');
			});

		$scope.trackSelected = function(track){
			console.log(track);
		};

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
					$http.post('/user/playlists/add', res.items)
					.success(function(response){
						$scope.playlists = response;
						console.log('poop');
						$scope.playlistsReady = true;
					});
				});

		};

		$scope.getTracks = function(plist){

				var tracks_link = plist.tracks_link;
				var tracks_total = plist.track_total;
				var numRequests = 1;
				$scope.currentPlaylist = plist.name;
				$scope.formattedTracks = [];


				if (tracks_total > 100){
					numRequests = Math.ceil(tracks_total/100);
				}

				if (numRequests === 1){ //100 tracks or less
					var req = {
						 method: 'GET',
						 url: tracks_link,
						 headers: {
							 'Authorization': 'Bearer ' + $window.user.providerData.token
						 },
					};
					$scope.postTracks(plist.id, req);
				}
				else{
					var offset = 0;

					for (var i = 0; i < numRequests; i++){
						if (i > 0){
							offset = offset + 100;
						}
						var offsetString = offset.toString();
						var request = {
							 method: 'GET',
							 url: tracks_link + '?offset=' + offsetString,
							 headers: {
								 'Authorization': 'Bearer ' + $window.user.providerData.token
							 },
						};
						$scope.postTracks(plist.id, request);
					}
				}
		};

		$scope.postTracks = function(playlist_id, req) {

			$http(req).
				success(function(res){
					var tracks = res.items;
					var el_tracks = [];
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
							'playlist_id': playlist_id,
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

						el_tracks.push(track);
						$scope.formattedTracks.push(track);
					}

					$scope.displayedTracks = [].concat($scope.formattedTracks);

					$http.post('/user/playlist/tracks/add', el_tracks).
					success(function(response){
						// TODO: used to get tracks after being saved...now populating table upon getting track data from spotify
					});

				});

		};

	}
]);

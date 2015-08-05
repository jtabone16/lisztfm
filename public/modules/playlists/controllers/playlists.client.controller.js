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
					$http.post('/user/playlists/add', res.items)
					.success(function(response){
						$scope.playlists = response;
						console.log(response);
						$scope.playlistsReady = true;
					});
				});

		};

		$scope.getPlaylists();


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

		$scope.getTracks = function(plist){

				var tracks_link = plist.tracks_link;
				var tracks_total = plist.track_total;
				var numRequests = 1;
				$scope.currentPlaylist = plist;
				$scope.tracks = [];
				$scope.tracksToDelete = [];


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
					var tracksResponse = res.items;
					var el_tracks = [];
					for (var i in tracksResponse){
						var artist = [];
						var added_by = '';
						for (var x in tracksResponse[i].track.artists){
					      artist.push(tracksResponse[i].track.artists[x].name);
					    }

						if (tracksResponse[i].added_by !== null){
							added_by = tracksResponse[i].added_by.id;
						}

						var track = {
							'playlist_id': playlist_id,
							'added': tracksResponse[i].added_at,
							'added_by': added_by,
							'title': tracksResponse[i].track.name,
							'popularity': tracksResponse[i].track.popularity,
							'url': tracksResponse[i].track.preview_url,
							'id': tracksResponse[i].track.id,
							'explicit': tracksResponse[i].track.explicit,
							'duration': tracksResponse[i].track.duration_ms,
							'album': tracksResponse[i].track.album.name,
							'artist': artist.join(),
							'rating': 1
						};

						el_tracks.push(track);
						$scope.tracks.push(track);
					}

					$scope.displayedTracks = [].concat($scope.tracks);

					$http.post('/user/playlist/tracks/add', el_tracks).
					success(function(response){
						// TODO: used to get tracks after being saved...now populating table upon getting track data from spotify
					});

				});

		};

	}
]);

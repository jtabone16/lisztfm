'use strict';

angular.module('playlists').controller('PlaylistsController', ['$scope', '$http', '$state', '$window', '$location', 'Spotify',
	function($scope, $http, $state, $window, $location, Spotify) {


		$scope.playlists = [];
		$scope.playlistsReady = false;
		$scope.tracksReady = false;
		$scope.currentPlaylist = '';
		$scope.tracks = [];
		$scope.displayedTracks = [];
		$scope.tracksToDelete = [];
		$scope.deleteTracks = 0;
		$scope.currentUser = $window.user;


		$scope.playlist_req = {
			 method: 'GET' ,
			 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists',
			 headers: {
				 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
			 },
		};

		$scope.track_req = {
			 method: 'GET' ,
			 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' +  $scope.currentPlaylist.id + '/tracks',
			 headers: {
				 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
			 },
		};


		$scope.getPlaylists = function(){
			//Get current user's spotify playlists

			$http($scope.playlist_req).
				success(function(res){
					$scope.playlists.push.apply($scope.playlists, res.items);

					if (res.next !== null){
						$scope.playlist_req.url = res.next;
						$scope.getPlaylists();
					}
					else{
						$scope.playlistsReady = true;
					}
				}).
				error(function(err){
					//TODO: more efficient refreshing
				});
		};

		$http.get('/auth/refresh').
			success(function(resp){
				$window.user.providerData.accessToken = resp.token;
				$scope.playlist_req = {
					 method: 'GET' ,
					 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists',
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
					 },
				};

				$scope.track_req = {
					 method: 'GET' ,
					 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' +  $scope.currentPlaylist.id + '/tracks',
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
					 },
				};

				$scope.getPlaylists();
			});


		$scope.getTracks = function(req){
			//Get current user's spotify playlists
			$http(req).
				success(function(res){
					var trax = res.items;
					for (var i in trax){
						var artist = [];
						var added_by = '';
						for (var x in trax[i].track.artists){
								artist.push(trax[i].track.artists[x].name);
							}
						if (trax[i].added_by !== null){
							added_by = trax[i].added_by.id;
						}

						var track = {
							'playlist_id': $scope.currentPlaylist.id,
							'added': trax[i].added_at,
							'added_by': added_by,
							'title': trax[i].track.name,
							'popularity': trax[i].track.popularity,
							'external_url': trax[i].track.external_urls.spotify,
							'api_url': trax[i].track.href,
							'url': trax[i].track.preview_url,
							'id': trax[i].track.id,
							'explicit': trax[i].track.explicit,
							'duration': trax[i].track.duration_ms,
							'album': trax[i].track.album.name,
							'artist': artist.join(),
							'rating': 1
						};
						$scope.tracks.push(track);
					}

					if (res.next !== null){
						req.url = res.next;
						$scope.getTracks(req);
					}
					else{
						$scope.tracksReady = true;
					}
				}).
				error(function(err){

				});
		};



		$scope.getCurrentPlaylist = function(plist){
			if ($scope.currentPlaylist.name !== plist.name){
				$scope.tracks = [];
				$scope.tracksToDelete = [];
				$scope.track_req.url = 'https://api.spotify.com/v1/users/' + plist.owner.id + '/playlists/' +  plist.id + '/tracks';
				$scope.getTracks($scope.track_req);

				$scope.currentPlaylist = {
					'id': plist.id,
					'name': plist.name,
					'collaborative': plist.collaborative,
					'track_total': plist.tracks.total,
					'images': plist.images,
					'external_url': plist.external_urls.spotify,
					'owner': plist.owner.id,
					'snapshots': [],
				};

				$http.post('/user/playlist/get', $scope.currentPlaylist).
					success(function(resp){
						$scope.currentPlaylist.snapshots = resp.snapshots;
					}).
					error(function(resp){
						var snap = {
							'id': plist.snapshot_id,
							'created': new Date(),
							'note': 'Imported playlist to liszt.fm',
						};

						$scope.currentPlaylist.snapshots.push(snap);
					});

			}
		};


		$scope.trackSelected = function(track){
			console.log(track);
		};

		// $scope.changeRating = function(track) {
		// 	if (track.rating === 2) {
		// 		track.rating = 0;
		// 	}
		// 	else{
		// 		track.rating++;
		// 	}
		// };




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
					 'Authorization': 'Bearer ' + $window.user.providerData.accessToken,
					 'Content-Type': 'application/json'
				 },
				 data: {
					 'tracks' : $scope.tracksToDelete
				 }
			};

			$http(req).
				success(function (res){
					var deletedTracks = [];
					for (var k in $scope.tracksToDelete){
						var str = $scope.tracksToDelete[k].title + ' by ' + $scope.tracksToDelete[k].artist;
						deletedTracks.push(str);
					}
					var snap = {
						'id': res.snapshot_id,
						'created': new Date(),
						'note': 'Deleted ' + $scope.tracksToDelete.length + ' tracks (' + deletedTracks.join() + ') from ' + $scope.currentPlaylist.name
					};
					$scope.tracksToDelete = [];
					$scope.currentPlaylist.snapshots.push(snap);

					$http.post('/user/playlist/add', $scope.currentPlaylist).
						success(function(res){
							$state.reload();
						}).
						error(function(res){
							console.log('Error updating playlist in database');
						});
				}).
				error(function (res){

				});

		};

	}
]);

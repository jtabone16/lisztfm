'use strict';

angular.module('playlists').controller('PlaylistsController', ['$scope', '$http', '$state', '$window', '$location', 'Spotify',
	function($scope, $http, $state, $window, $location, Spotify) {


		$scope.playlists = [];
		$scope.playlistsReady = false;
		$scope.tracksReady = false;
		$scope.currentPlaylist = '';
		$scope.raw_playlist = '';
		$scope.tracks = [];
		$scope.displayedTracks = [];
		$scope.displayedPlaylists = [];
		$scope.tracksToDelete = [];
		$scope.currentUser = $window.user;
		$scope.currentTrack = '';
		$scope.search_subject =
		$scope.search_type = 'track';
		$scope.selected_playlist = undefined;
		$scope.track_to_add = undefined;
		$scope.search_results = [];
		$scope.tracksToAdd = [];
		$scope.deleteTracks = 0;
		$scope.addTracks = 0;
		$scope.showCreateField = false;
		$scope.newPlaylistName = '';
		$scope.queueSelected = undefined;
		$scope.total_track_length = 0;
		$scope.currentArtists = [];


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

		$scope.search_req = {
			 method: 'GET' ,
			 url: 'https://api.spotify.com/v1/search?q=',
			 headers: {
				 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
			 },
		};


		$scope.topArtist = function (currentArtists) {
			var max = 0;
			var artist = '';
			for(var k in currentArtists){
				if(currentArtists[k] > max) {
					max = currentArtists[k];
					artist = k;
				}
			}
			return artist;
		}

		$scope.millisToMinutesAndSeconds = function (millis) {
  		var minutes = Math.floor(millis / 60000);
  		var seconds = ((millis % 60000) / 1000).toFixed(0);
  		return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
		};

		$scope.createPlaylist = function (keyEvent, name) {
			if (keyEvent.which === 13){
				var req = {
					 method: 'POST',
					 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists',
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken,
						 'Content-Type': 'application/json'
					 },
					 data: {
						 'name' : name
					 }
				};

				$http(req).
					then (function (res){
						console.log(res);
						$scope.playlists.unshift(res.data);
						$scope.getCurrentPlaylist(res.data);
						$scope.showCreateField = false;
						$scope.newPlaylistName = '';
					});
			}
		};


		$scope.getSearchResults = function ($viewValue){
				$scope.search_req = {
					 method: 'GET' ,
					 url: 'https://api.spotify.com/v1/search?q=' + $viewValue.split('%20') + '&type=' + $scope.search_type,
					 headers: {
						 'Authorization': 'Bearer ' + $window.user.providerData.accessToken
					 },
				};


				return $http($scope.search_req).
					then(function (res){
						$scope.search_results = res.data.tracks.items;
						console.log(res);
						return $scope.search_results;
					});

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
								$scope.currentArtists[trax[i].track.artists[x].name] = (isNaN($scope.currentArtists[trax[i].track.artists[x].name]) ? 1 : $scope.currentArtists[trax[i].track.artists[x].name] + 1);
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
							'uri': trax[i].track.uri,
							'id': trax[i].track.id,
							'explicit': trax[i].track.explicit,
							'duration': trax[i].track.duration_ms,
							'album': trax[i].track.album.name,
							'artist': artist.join(),
							'rating': 1
						};
						$scope.total_track_length += track.duration;
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
				$scope.tracksToAdd = [];
				$scope.track_req.url = 'https://api.spotify.com/v1/users/' + plist.owner.id + '/playlists/' +  plist.id + '/tracks';
				$scope.getTracks($scope.track_req);
				$scope.raw_playlist = plist;

				$scope.total_track_length = 0;
				$scope.currentArtists = [];

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
			$scope.currentTrack = 'https://embed.spotify.com/?uri=spotify:track:' + track.id;
		};

		// $scope.changeRating = function(track) {
		// 	if (track.rating === 2) {
		// 		track.rating = 0;
		// 	}
		// 	else{
		// 		track.rating++;
		// 	}
		// };

		$scope.dequeue = function (track, action) {

			if (action === 'add'){
				for(var i in $scope.tracksToAdd){
					if (track.uri === $scope.tracksToAdd[i].uri){
						$scope.tracksToAdd.splice(i, 1);
						break;
					}
				}
			}
			else if (action === 'remove'){
				for(var j in $scope.tracksToDelete){
					if (track.uri === $scope.tracksToDelete[j].uri){
						$scope.tracksToDelete.splice(j, 1);
						break;
					}
				}
			}
		};

		$scope.addTrack = function ($item, $model, $label) {
			 var track_uri = $item.uri;
			 $scope.currentTrack = 'https://embed.spotify.com/?uri=' + track_uri;
			 var found = false;
			 var artist = [];
			 for (var x in $item.artists){
					 artist.push($item.artists[x].name);
				 }

			 for (var i = 0; i < $scope.tracksToAdd.length; i++){
				 if ($scope.tracksToAdd[i].uri === track_uri){
					 found = true;
					 $scope.tracksToAdd.splice(i, 1);
					 break;
				 }
			 }

			 if (found === false){
				 var trak = {
					 'uri': track_uri,
					 'artist': artist.join(),
					 'title': $item.name,
					 'added': new Date(),
					 'added_by': $scope.currentUser.username,
				 };
				 $scope.tracksToAdd.push(trak);
				 $scope.queueSelected = 'adding';
			 }

		};

		$scope.addTracksNow = function(){
			var uris = [];
			for (var i in $scope.tracksToAdd){
				uris.push($scope.tracksToAdd[i].uri);
			}

			var req = {
				 method: 'POST',
				 url: 'https://api.spotify.com/v1/users/' + $window.user.username + '/playlists/' + $scope.currentPlaylist.id + '/tracks',
				 headers: {
					 'Authorization': 'Bearer ' + $window.user.providerData.accessToken,
					 'Content-Type': 'application/json'
				 },
				 data: {
					 'uris' : uris
				 }
			};

			$http(req).
				success(function (res){
					var addedTracks = [];
					for (var k in $scope.tracksToAdd){
						var str = $scope.tracksToAdd[k].title + ' by ' + $scope.tracksToAdd[k].artist;
						addedTracks.push(str);
					}
					var snap = {
						'id': res.snapshot_id,
						'created': new Date(),
						'note': 'Added ' + $scope.tracksToAdd.length + ' track(s) (' + addedTracks.join() + ') to ' + $scope.currentPlaylist.name
					};
					$scope.currentPlaylist.snapshots.push(snap);

					$http.post('/user/playlist/add', $scope.currentPlaylist).
						success(function(res){
							for (var x in $scope.tracksToAdd){
								$scope.tracks.push($scope.tracksToAdd[x]);
							}
							$scope.tracksToAdd = [];
						}).
						error(function(res){
							console.log('Error updating playlist in database');
						});
				}).
				error(function (res){
					console.log(res);
				});

		};


		$scope.removeTrack = function(track){
			var found = false;

			for (var i = 0; i < $scope.tracksToDelete.length; i++){
				if ($scope.tracksToDelete[i].uri === track.uri){
					found = true;
					$scope.tracksToDelete.splice(i, 1);
					break;
				}
			}

			if (found === false){
				var trak = {
					'uri': track.uri,
					'artist': track.artist,
					'title': track.title,
				};
				$scope.tracksToDelete.push(trak);
				$scope.queueSelected = 'removing';
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
						'note': 'Deleted ' + $scope.tracksToDelete.length + ' track(s) (' + deletedTracks.join() + ') from ' + $scope.currentPlaylist.name
					};
					$scope.currentPlaylist.snapshots.push(snap);

					$http.post('/user/playlist/add', $scope.currentPlaylist).
						success(function(res){

							for (var y in $scope.tracksToDelete){
								for (var x in $scope.tracks){
									if($scope.tracks[x].uri === $scope.tracksToDelete[y].uri){
										$scope.tracks.splice(x, 1);
										break;
									}
								}
							}
							$scope.tracksToDelete = [];
						}).
						error(function(res){
							console.log('Error updating playlist in database');
						});
				}).
				error(function (res){

				});

		};

		$scope.onSelect = function ($item, $model, $label) {
			 $scope.getCurrentPlaylist($item);
		};


		//Custom filters
		$scope.isOwned = function (plist){
			return plist.owner.id === $scope.currentUser.username;
		};

		$scope.follows = function (plist){
			return plist.owner.id !== $scope.currentUser.username;
		};

	}
]);

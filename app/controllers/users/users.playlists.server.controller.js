'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	async = require('async'),
	request = require('request'),
	User = mongoose.model('User'),
  Playlist = mongoose.model('Playlist'),
	Track = mongoose.model('Track');


var checkPlaylist  = function(playlist, user){
	Playlist.findOne({'id': playlist.id},
		function(err, plist){
			if(err){
				console.log('Error making DB query to find playlist ' + playlist.name);
			}
			else{
				if (plist === null){
					var p = new Playlist();
					p.users.push(user);
					p.id = playlist.id;
					p.name = playlist.name;
					var snap = {
						'id': playlist.snapshot_id,
						'created': new Date(),
						'note': 'Imported playlist to liszt.fm',
					};
					p.snapshot_id.push(snap);
					p.owner = playlist.owner.id;
					p.tracks_link = playlist.tracks.href;
					p.track_total = playlist.tracks.total;
					p.collaborative = playlist.collaborative;

					p.save(function(err) {
						if (err) {
							console.log('DB: error adding playlist');
						} else {
							console.log('DB: success adding playlist for user. Now adding tracks..');
						}
					});
				}
				else{
					console.log('Playlist already exists for user in database');
				}

			}

		});

};


var checkTrack  = function(track){
	Track.findOne({'playlist_id': track.playlist_id, 'id' :track.id},
		function(err, t){
			if(err){
				console.log('Error making DB query to find track ' + track.title + ' by' + track.artist);
			}
			else{
				if (t === null){
					var k = new Track(track);

					k.save(function(err) {
						if (err) {
							console.log('DB: error adding track');
						} else {
							console.log('DB: success adding track');
						}
					});

					Playlist.findOne({'id': k.playlist_id},
						function(err, p){
							if(err){
								console.log('DB query error: Unable to find playlist to save track to');
							}
							else{
								p.tracks.push(k);
								p.save(function(err){
									if (err){
										console.log('Error adding ' + k.title + ' by ' + k.artist + ' to ' + p.name);
									}
									else{
										console.log('Success adding ' + k.title + ' by ' + k.artist + ' to ' + p.name);
									}
								});
							}
						});
				}
				else{
					console.log(':D - SUCCESS - Track for specified playlist exists in DB!');
				}
			}
		});
};

var addTracks = function(tracks) {

  for (var x in tracks) {
		checkTrack(tracks[x]);
  }


};

var getTracks = function(playlist_id, options) {
	request(options,
		function(err, res, body){
			if (err) console.log('Error making tracks request from Spotify');
			var tracksResponse = body.items;
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
			}
			addTracks(el_tracks);
		});
};


exports.addPlaylists = function (req, res){

  var playlists = req.body;

  for (var i in playlists){
		checkPlaylist(playlists[i], req.user);
  }

	User.findById(req.user, function(err, found_user){
		if (err){
			console.log('Cannot find user. Creating user and adding playlists for user.');
		}
		else{
			Playlist.find({'users': found_user},
				function(err, plists){
						if (err){
							console.log('DB error running query to find playlists for user');
						}
						else{
							for (var y in plists) {
								var tracks_link = plists[y].tracks_link;
								var tracks_total = plists[y].track_total;
								var numRequests = 1;

								if (tracks_total > 100){
									numRequests = Math.ceil(tracks_total/100);
								}

								if (numRequests === 1){ //100 tracks or less
									var options = {
										 url: tracks_link,
										 headers: {
											 'Authorization': 'Bearer ' + found_user.providerData.token
										 },
										 json: true
									};

									getTracks(plists[y].id, options);
								}
								else{
									var offset = 0;

									for (var j = 0; j < numRequests; j++){
										if (j > 0){
											offset = offset + 100;
										}
										var offsetString = offset.toString();
										var optionz = {
											 url: tracks_link + '?offset=' + offsetString,
											 headers: {
												 'Authorization': 'Bearer ' + found_user.providerData.token
											 },
											 json: true
										};
										getTracks(plists[y].id, optionz);
									}//for
								}//else
							}//for each of the found user's playlists
						}
						res.jsonp(plists);
				});
		}
	});
};

exports.getSelectedPlaylist = function(req, res) {
	var plist = req.body;
	console.log('yes?:');
	console.log(req.body);
	Playlist.findOne({'id': plist.id},
		function(err, selected){
				if(err) console.log('DB Error: Running query to find playlist selected by the user');

				if (selected === null) {
					console.log('Playlist cannot be found for user...um...that should NOT happen');
				}
				else{
					Track.find({'playlist_id': selected.id},
						function(err, tracks){
							if (err) console.log('DB Error: Running query to find tracks for playlist selected by the user');

							var muzik = {
								'playlist': selected,
								'tracks': tracks,
							};

							res.jsonp(muzik);
						});
				}
		});
};

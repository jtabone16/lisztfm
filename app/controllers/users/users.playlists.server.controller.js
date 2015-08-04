'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	async = require('async'),
	User = mongoose.model('User'),
  Playlist = mongoose.model('Playlist'),
	Track = mongoose.model('Track');



var savePlaylist = function(user, plist) {
  plist.save(function(err) {
    if (err) {
      //TODO: Add proper error/success handling messages
      console.log('Error adding playlist');
    } else {
      console.log('Success adding playlist');
    }
  });
};

exports.checkUser = function(req, res){
	var user = req.user;

	User.findById(user, function(err, found_user){
		if (err){
			console.log('Cannot find user. Creating user and adding playlists for user.');
		}
		else{
			Playlist.find({'users': found_user},
				function(err, plists){
						if (err){
							console.log('Cannot find playlists for user');
						}
						else{
							res.jsonp(plists);
						}

				});
		}
	});
};

//TODO: check if playlists and tracks are in DB already.


exports.addPlaylists = function (req, res){

  var playlists = req.body;
	var savedPlaylists = [];

  for (var i in playlists){

    var playlist = new Playlist();
    var tracks = [];
    var users = [];
		var snapshots = [];
    users.push(req.user);
    playlist.users = users;
    playlist.id = playlists[i].id;
    playlist.name = playlists[i].name;
    snapshots.push(playlists[i].snapshot_id);
		playlist.snapshot_id = snapshots;
    playlist.owner = playlists[i].owner.id;
    playlist.tracks_link = playlists[i].tracks.href;
    playlist.track_total = playlists[i].tracks.total;
    playlist.collaborative = playlists[i].collaborative;
    playlist.tracks = tracks;

		savedPlaylists.push(playlist);
    savePlaylist(req.user, playlist, res);
  }

	res.jsonp(savedPlaylists);


};


var saveTrack = function(track) {

  track.save(function(err) {
    if (err) {
      //TODO: Add proper error/success handling messages
      console.log('Error adding track');
    }
		else {
      console.log('Success adding track: ' + track.title + ' by ' + track.artist);
    }
  });

	Playlist.findOne({'id': track.playlist_id},
		function(err, playlist){
			if(err){
				console.log('Unable to find playlist to save track to');
			}
			else{
				playlist.tracks.push(track);
				playlist.save(function(err){
					if (err){
						console.log('Error adding ' + track.title + ' by ' + track.artist + ' to ' + playlist.name);
					}
					else{
						console.log('Success adding ' + track.title + ' by ' + track.artist + ' to ' + playlist.name);
					}
				});
			}
		});
};


exports.addTracks = function(req, res) {
  var tracks = req.body;
	var savedTracks = [];

  for (var x in tracks) {
    var track = new Track(tracks[x]);
		savedTracks.push(track);
    saveTrack(track);
  }

	res.jsonp(savedTracks);

};

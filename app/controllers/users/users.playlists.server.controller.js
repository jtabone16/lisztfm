'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
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

  user.playlists.push(plist);

  user.save(function(err) {
    if (err) {
      //TODO: Add proper error/success handling messages
      console.log('Error adding playlist to user');
    } else {
      console.log('Success adding playlist to user');
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
			res.jsonp(found_user.playlists);
		}
	});
};

//TODO: check if playlists and tracks are in DB already...

exports.addPlaylists = function (req, res){

  var playlists = req.body;

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
    playlist.collab = playlists[i].collaborative;
    playlist.tracks = tracks;

    savePlaylist(req.user, playlist, res);
  }
};


var saveTrack = function(track) {

  track.save(function(err) {
    if (err) {
      //TODO: Add proper error/success handling messages
      console.log('Error adding track');
    }
		else {
      console.log('Success adding track: ' + track.name + ' by ' + track.artists.join());
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
						console.log('Error adding ' + track.name + ' by ' + track.artists.join()+ ' to ' + playlist.name);
					}
					else{
						console.log('Success adding ' + track.name + ' by ' + track.artists.join()+ ' to ' + playlist.name);
					}
				});
			}
		});
};


exports.addTracks = function(req, res) {
  var tracks = req.body;

  for (var x in tracks) {
    var track = new Track(tracks[x]);
    saveTrack(track);
  }

};

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Playlist = mongoose.model('Playlist'),
    Track = mongoose.model('Track'),
    _ = require('lodash'),
    http = require('http'),
    https = require('https');


var saveTrack = function(track) {
  track.save(function(err) {
    if (err) {
      //TODO: Add proper error/success handling messages
      console.log('Error adding track');
    } else {
      console.log('Success adding track: ' + track.name + ' by ' + track.artists.join());
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

var savePlaylist = function(plist) {
  plist.save(function(err) {
    if (err) {
      //TODO: Add proper error/success handling messages
      console.log('Error adding playlist');
    } else {
      console.log('Success adding playlist');
    }
  });

};

/**
 * Create a Playlist
 */
exports.create = function(req, res) {
  var playlists = req.body;

  for (var i in playlists){
    var playlist = new Playlist();
    playlist.user = req.user;
    playlist.id = playlists[i].id;
    playlist.name = playlists[i].name;
    playlist.snapshot_id = playlists[i].snapshot_id;
    playlist.owner = playlists[i].owner.id;
    playlist.tracks = playlists[i].tracks.href;
    playlist.track_total = playlists[i].tracks.total;
    playlist.collab = playlists[i].collaborative;

    savePlaylist(playlist);
  }


};



/**
 * Show the current Playlist
 */
exports.read = function(req, res) {

};

/**
 * Update a Playlist
 */
exports.update = function(req, res) {

};

/**
 * Delete an Playlist
 */
exports.delete = function(req, res) {

};

/**
 * List of Playlists
 */
exports.list = function(req, res) {

};

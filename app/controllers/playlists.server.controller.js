//NOTE: NO LONGER USING PLAYLIST MODEL, USE TRACK MODEL? TRACK METHODS ARE HERE vvvvvv

// 'use strict';
//
// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//     Playlist = mongoose.model('Playlist'),
//     Track = mongoose.model('Track'),
//     _ = require('lodash'),
//     http = require('http'),
//     https = require('https');
//
//
// var saveTrack = function(track) {
//   track.save(function(err) {
//     if (err) {
//       //TODO: Add proper error/success handling messages
//       console.log('Error adding track');
//     } else {
//       console.log('Success adding track: ' + track.name + ' by ' + track.artists.join());
//     }
//   });
// };
//
//
// exports.addTracks = function(req, res) {
//   var tracks = req.body;
//
//   for (var x in tracks) {
//     var track = new Track(tracks[x]);
//     saveTrack(track);
//   }
//
// };
//
//
// /**
//  * Show the current Playlist
//  */
// exports.read = function(req, res) {
//
// };
//
// /**
//  * Update a Playlist
//  */
// exports.update = function(req, res) {
//
// };
//
// /**
//  * Delete an Playlist
//  */
// exports.delete = function(req, res) {
//
// };
//
// /**
//  * List of Playlists
//  */
// exports.list = function(req, res) {
//
// };

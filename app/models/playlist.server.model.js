'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Playlist Schema
 */
var PlaylistSchema = new Schema({
	// Playlist model fields   
	// ...
});

mongoose.model('Playlist', PlaylistSchema);
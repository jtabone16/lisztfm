'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Track Schema
 */
var TrackSchema = new Schema({
	playlist_id: String, 
	added: Date,
	added_by: String,
	name: String,
	popularity: Number,
	preview: String,
	id: String,
	explicit: Boolean,
	duration: Number,
	artists: [{
		type: String
	}],
	album: String
});

mongoose.model('Track', TrackSchema);

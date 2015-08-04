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
	title: String,
	popularity: Number,
	url: String,
	id: String,
	explicit: Boolean,
	duration: Number,
	artist:String,
	album: String
});

mongoose.model('Track', TrackSchema);

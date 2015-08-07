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
	playlist_id: {
		type: String,
		ref: 'Playlist'
	},
	added: Date,
	added_by: String,
	title: String,
	popularity: Number,
	external_url: String,
	api_url: String, 
	url: String,
	id: String,
	explicit: Boolean,
	duration: Number,
	artist:String,
	album: String,
	rating: Number,
	edited: {
		type:Boolean,
		default: false
	}
});

mongoose.model('Track', TrackSchema);

//HOW IT WORKS
// User types in these commands and gets responses
// 1. `my-tweets`
// 	returns last 20 tweets from twitter account API
// 2.`spotify-this-song` '<the song name here>'
// 	returns info from spotify API
// 		1. Artist(s)
// 		2. The song's name
// 		3. A preview link of the song from Spotify
// 		4. The album that the song is from
// 	if it finds nothing then it returns
// 		1. Artist: Ace of Base
// 		2. Song: The Sign
// 		3. Preview: 
// 		4. Album:
// 3.`movie-this` '<the movie name here>'
// 	returns info from OMDB API
// 		1. Title of the movie.
// 		2. Year the movie came out.
// 		3. IMDB Rating of the movie.
// 		4. Rotten Tomatoes Rating of the movie.
// 		5. Country where the movie was produced.
// 		6. Language of the movie.
// 		7. Plot of the movie.
// 		8. Actors in the movie.
//     if it finds nothing then it returns
//     	1. Title: Mr Nobody
//     	2. Year:
//     	3. IMDB Rating:
//     	4. Rotten Tomatoes Rating:
//     	5. Country:
//     	6. Language:
//     	7. Plot:
//     	8. Actors:
// 4.`do-what-it-says` '<text string in file>'
// 	* Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
// 	* It should run `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`


/////////////////// load dependencies /////////////////// 
var request = require('request'); // packages
var twitter = require('twitter'); // packages
var spotify = require('node-spotify-api'); // packages
var fs = require('fs'); // packages
var credentials = require("./keys.js"); // files

/////////////////// create access objects /////////////////// 
var twitterClient = new twitter({
  consumer_key: credentials.twitterKeys.consumer_key,
  consumer_secret: credentials.twitterKeys.consumer_secret,
  access_token_key: credentials.twitterKeys.access_token_key,
  access_token_secret: credentials.twitterKeys.access_token_secret
});

var spotifyClient = new spotify({
  id: credentials.spotifyKeys.client_ID,
  secret: credentials.spotifyKeys.client_secret
});

/////////////////// get data entry /////////////////// 
// user command
var userRequest = process.argv[2];
// get user values past command, if entered, and convert to string
let userData = process.argv;
userData.splice(0, 3);
userData = userData.join(" ");


/////////////////// app obj /////////////////// 
var app = {
	badCommmand: function() { console.log("\nYou must use one of these commands:\nmy-tweets\nspotify-this-song\nmovie-this\ndo-it-this-way\n") },
	
	determineUserRequest: function() {
		if (userRequest==="my-tweets" || userRequest==="spotify-this-song" || userRequest==="movie-this" ) { this.handleUserRequest(); }
		else if (userRequest==="do-it-this-way"){ this.handleUserRequestCustom(); }
		else {this.badCommmand();}
	},
	
	handleUserRequestCustom: function() {
		fs.readFile("random.txt", "utf8", function (err, data) {
			if (!err) {
				// overwrite global variables - do not need to pass arguments around
				userRequestuserData = data.split(",");
				userRequest = userRequestuserData[0];
				userData = userRequestuserData[1].replace(/["']/g, "");
				// run handler
				app.handleUserRequest();
			}
		});
	},
	
	handleUserRequest: function() {
		// TWITTER
		if (userRequest==="my-tweets") { app.runTwitter(); }
		// SPOTIFY
		else if (userRequest==="spotify-this-song") {
			if (userData) { app.runSpotify(userData); } else { console.log("\nYou need to enter a song\n"); }
		}
		// OMDB 
		else if (userRequest==="movie-this") {
			if (userData) { app.runMovie.runMovieAction(userData);} else { console.log("\nYou need to enter a movie\n"); }
		}
	},
	
	runTwitter: function() {
		params = {screen_name:'WerkplaceV2',count:20};
		twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
			if (!error) {
			    //ea6
			    for (const tweet of tweets.reverse()) {
					const { text, created_at } = tweet
					const date = tweet.created_at
					console.log(`\n${text}\nOn - ${date}\n`)
				}
			}
			else {console.log(error);}
		});
	},
	
	runSpotify: function() {
		spotifyClient.search({ type: 'track', query: userData, limit:1 })
		.then(function(response) { app.printSpotify(response);} )
		.catch(function(error, response) {
		// print the Ace of Base info if nothing is found
			if (response===undefined) {
				spotifyClient.search({ type: 'track', query: 'The Sign (US Album) [Remastered]', limit:1 })
				.then(function(response) { app.printSpotify(response);} )
			}
			else {console.log(error);}
	  	});
	},

	runMovie: {
		url: "http://www.omdbapi.com/?t=" + userData + "&y=&plot=short&apikey=trilogy",
		urlnoResults: "http://www.omdbapi.com/?t=" + "Mr. Nobody" + "&y=&plot=short&apikey=trilogy",
		noResults: "{\"Response\":\"False\",\"Error\":\"Movie not found!\"}",
		runMovieAction: function() {
			request(this.url, function(error, response, body) {
		  		// If the request is successful
		  		if (!error && response.statusCode===200 && response.body!==app.runMovie.noResults) {
		  			movieInfo = JSON.parse(body);
		  			app.printMovie(movieInfo);
		  		}
		  		// If nothing is found then populate with Mr. Nobody
		  		else if (response.body===app.runMovie.noResults) {
		  			app.runMovie.runMovieAgain();
		  		}
		  		else {console.log(error);}
		  	});
		},
		runMovieAgain: function() { 
			request(this.urlnoResults, function(error, response, body) {
				if (!error && response.statusCode===200) {
			  			movieInfo = JSON.parse(body);
			  			app.printMovie(movieInfo);
			  	}
			  	else {console.log(error);}
			});
		}
	},

	
	printSpotify: function(songInfo) { console.log("\nArtist: " + songInfo.tracks.items[0].artists[0].name + "\nSong: " + songInfo.tracks.items[0].name + "\nPreview: " + songInfo.tracks.items[0].preview_url + "\nAlbum: " + songInfo.tracks.items[0].album.name +"\n");},
	
	printMovie: function(movieInfo) { console.log("\nTitle: " + movieInfo.Title + "\nRelease Year: " + movieInfo.Year + "\nIMDB Rating: " + movieInfo.imdbRating + "\nRotten Tomatoes Rating: " + movieInfo.Ratings[1].Value + "\nCountry: " + movieInfo.Country + "\nLanguage: " + movieInfo.Language + "\nPlot: " + movieInfo.Plot + "\nActors: " + movieInfo.Actors + "\n");},
	
	writeToFile: function() {}
}
/////////////////// END app obj /////////////////// 


/////////////////// RUN APP /////////////////// 
app.determineUserRequest();







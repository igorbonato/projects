document.addEventListener("DOMContentLoaded", function () {
	setDefaultUsername();
});

function setDefaultUsername() {
	const usernameInput = document.getElementById("lastfm-username");
	usernameInput.value = "igorbonato";
}

document
	.getElementById("username-form")
	.addEventListener("submit", function (event) {
		event.preventDefault();
		const lastfmUsername = document.getElementById("lastfm-username").value;

		sessionStorage.setItem("lastfmUsername", lastfmUsername);

		fetchCurrentSong(lastfmUsername);
	});

async function fetchCurrentSong(username) {
	try {
		const lastfmApiKey = "4599629be9c1be5c6a21fe58938a281f";
		const response = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${lastfmApiKey}&format=json`
		);
		const data = await response.json();

		if (
			data.recenttracks &&
			data.recenttracks.track &&
			data.recenttracks.track.length > 0
		) {
			const currentSong = data.recenttracks.track[0];
			const artist = currentSong.artist["#text"];
			const trackName = currentSong.name;

			window.location.href = `lyrics.html?artist=${encodeURIComponent(
				artist
			)}&track=${encodeURIComponent(trackName)}`;
		} else {
			alert("No recent tracks found for the given username.");
		}
	} catch (error) {
		alert("Error fetching data from LastFM API.");
	}
}

const tweetsButton = document.getElementById("btn-tweets");

tweetsButton.addEventListener("click", function () {
	window.location.href = "tweets.html";
});

document.addEventListener("DOMContentLoaded", function () {
	const urlParams = new URLSearchParams(window.location.search);
	const artist = urlParams.get("artist");
	const track = urlParams.get("track").split("-")[0];
	fetchLyricsAndTranslation(artist, track);
});

const vagalumeApiKey = "b82288040d96b0a3a4e546bb12bab7ae";

async function fetchLyricsAndTranslation(artist, track) {
	try {
		const response = await fetch(
			`https://api.vagalume.com.br/search.php?art=${encodeURIComponent(
				artist
			)}&mus=${encodeURIComponent(track)}&apikey=${vagalumeApiKey}`
		);
		const data = await response.json();

		if (data.type === "exact" && data.mus.length > 0) {
			const lyrics = data.mus[0].text;
			const translation =
				data.mus[0].translate?.[0]?.text || "Translation not available.";

			// Split the lyrics and translation into lines based on breaklines
			const lyricsLines = lyrics
				.split("\n")
				.filter((line) => line.trim() !== "");
			const translationLines = translation
				.split("\n")
				.filter((line) => line.trim() !== "");

			// Remove the first item from the translationLines
			if (translationLines.length > 0) {
				translationLines.shift();
			}

			// Display one line from each list alternately
			const translationContainer = document.getElementById("lyrics-container");
			const originalLyricsContainer =
				document.getElementById("original-lyrics");
			let alternatingLyrics = "";
			const maxLength = Math.min(lyricsLines.length, translationLines.length);
			for (let i = 0; i < maxLength; i++) {
				alternatingLyrics += `<p class="origin-lyric">${lyricsLines[i]}</p>`;
				alternatingLyrics += `<p class="pt-lyric">${translationLines[i]}</p>`;
			}
			translationContainer.innerHTML = alternatingLyrics;

			// Populate the original lyrics container with just the original lyrics
			const originalLyrics = lyricsLines.join("<br>");
			originalLyricsContainer.innerHTML = `<p>${originalLyrics}</p>`;

			// Hide the translation container by default
			translationContainer.style.display = "none";
		} else {
			alert(
				"Lyrics and translation not found for the current song " +
					artist +
					" " +
					track
			);
		}
	} catch (error) {
		alert("Error fetching data from Vagalume API.");
	}
}

document
	.getElementById("toggle-translation-btn")
	.addEventListener("click", function () {
		const originalLyricsContainer = document.getElementById("original-lyrics");
		const translationContainer = document.getElementById("lyrics-container");

		if (translationContainer.style.display === "none") {
			translationContainer.style.display = "grid";
			translationContainer.style.justifyContent = "center";
			originalLyricsContainer.style.display = "none";
		} else {
			translationContainer.style.display = "none";
			originalLyricsContainer.style.display = "flex";
			originalLyricsContainer.style.justifyContent = "center";
		}
	});

document.getElementById("loggout-btn").addEventListener("click", function () {
	window.location.href = "index.html";
});

document
	.getElementById("update-song-btn")
	.addEventListener("click", function () {
		const lastfmUsername = sessionStorage.getItem("lastfmUsername");

		if (lastfmUsername) {
			fetchCurrentSong(lastfmUsername);
		} else {
			alert("LastFM username not found in the session.");
		}
	});

document.addEventListener("DOMContentLoaded", function () {
	const urlParams = new URLSearchParams(window.location.search);
	const artist = urlParams.get("artist");
	const track = urlParams.get("track").split("-")[0];
	fetchLyricsAndTranslation(artist, track);
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
			const trackName = currentSong.name.split("-")[0];

			// Redirect to the next page with the artist and track name as URL parameters
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

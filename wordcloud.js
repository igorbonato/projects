function getSelectedPeriod() {
	const selectElement = document.getElementById("periodSelect");
	const selectedOption = selectElement.options[selectElement.selectedIndex];

	if (selectedOption) {
		return selectedOption.value;
	} else {
		alert("Please select a time period.");
	}
}

document
	.getElementById("usernameForm")
	.addEventListener("submit", function (event) {
		event.preventDefault();

		const usernameInput = document.getElementById("lastfmUsername");
		const lastfmUsername = usernameInput.value.trim();

		if (lastfmUsername !== "") {
			const user = lastfmUsername;

			generateWordCloud(user);
		} else {
			alert("Please enter a Last.fm username.");
		}
	});

function generateWordCloud(user) {
	const containerElement = document.getElementById("container");
	containerElement.innerHTML =
		'<i class="fas fa-spinner fa-spin fa-8x" style="margin-top: 40px"></i>';

	const containerElement2 = document.getElementById("container-dois");
	containerElement2.innerHTML = "";

	const lastfmApiKey = "053a4bf8483b5e38b86fb6b8b2a62d57";
	const vagalumeApiKey = "b82288040d96b0a3a4e546bb12bab7ae";

	const period = getSelectedPeriod();

	async function getLyrics(song) {
		const response = await fetch(
			`https://api.vagalume.com.br/search.php?apikey=${vagalumeApiKey}&art=${encodeURIComponent(
				song.artist.name
			)}&mus=${encodeURIComponent(song.name)}`
		);

		const data = await response.json();

		if (
			data.type === "song_notfound" ||
			!data.mus ||
			!data.mus[0] ||
			!data.mus[0].text
		) {
			return null;
		}

		return data.mus[0].text;
	}

	// function to get user information from Last.fm
	async function getUserInfo(user) {
		const response = await fetch(
			`https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${user}&api_key=${lastfmApiKey}&format=json`
		);

		const userData = await response.json();

		if (!userData.user) {
			throw new Error("Invalid response from Last.fm API");
		}

		const userImage = userData.user.image[2]["#text"];

		return {
			username: userData.user.name,
			image: userImage,
		};
	}

	// make an API request to get user's top tracks
	fetch(
		`https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${user}&period=${period}&api_key=${lastfmApiKey}&format=json`
	)
		.then((response) => response.json())
		.then(async (data) => {
			if (!data.toptracks || !data.toptracks.track) {
				throw new Error("Invalid response from Last.fm API");
			}

			const tracks = data.toptracks.track;

			const wordCounts = {};

			for (const track of tracks) {
				const lyrics = await getLyrics(track);
				if (lyrics) {
					const words = lyrics.split(/\s+/);

					words.forEach((word) => {
						const lowercaseWord = word.toLowerCase();
						wordCounts[lowercaseWord] = (wordCounts[lowercaseWord] || 0) + 1;
					});
				}
			}

			function loadJSON() {
				var xobj = new XMLHttpRequest();
				xobj.overrideMimeType("application/json");
				xobj.open("GET", "stopwords.json", false);
				xobj.send(null);

				if (xobj.readyState == 4 && xobj.status == 200) {
					return JSON.parse(xobj.responseText);
				} else {
					console.error("Failed to load JSON file");
					return null;
				}
			}

			const stopwords = loadJSON();

			const filteredWordCounts = {};
			Object.keys(wordCounts).forEach((word) => {
				const sanitizedWord = word
					.replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿ]/g, "")
					.toLowerCase();

				if (!stopwords.includes(sanitizedWord)) {
					filteredWordCounts[sanitizedWord] =
						(filteredWordCounts[sanitizedWord] || 0) + wordCounts[word];
				}
			});

			const sortedFilteredWords = Object.keys(filteredWordCounts).sort(
				(a, b) => filteredWordCounts[b] - filteredWordCounts[a]
			);

			const top100FilteredWords = sortedFilteredWords.slice(0, 50);

			const wordCloudData = top100FilteredWords.map((word) => ({
				x: word,
				value: filteredWordCounts[word],
			}));

			const chart = anychart.tagCloud(wordCloudData);

			chart.palette(anychart.palettes.provence);

			const userInfo = await getUserInfo(user);

			const titleElement = document.getElementById("title");
			titleElement.innerHTML = `<img class="img-user" src="${userInfo.image}" alt="User Image" /> wordcloud for top tracks of ${user}`;

			chart.angles([0]);

			chart.colorRange(false);

			const containerElement = document.getElementById("container");
			containerElement.innerHTML = "";

			chart.container(containerElement);
			chart.draw();

			const columnChart = anychart.column(wordCloudData);

			columnChart.container(containerElement2);

			columnChart.title("Word Frequency");

			columnChart.data(wordCloudData);

			columnChart.palette([
				"#ff6666",
				"#ff4d4d",
				"#ff3333",
				"#ff1a1a",
				"#e60000",
			]);

			columnChart.column().width("30%");

			columnChart.xAxis().labels().rotation(45);

			columnChart.draw();
		})
		.catch((error) =>
			console.error("Error fetching data from Last.fm:", error)
		);
}

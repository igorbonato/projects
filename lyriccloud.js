const axios = require("axios");
const btoa = require("btoa");

const clientId = "3bf41e1187474d98b9abe546ea75136b";
const clientSecret = "e945bf1fc50946079c1a3ea1b3fe0b27";

async function getToken() {
	const authString = `${clientId}:${clientSecret}`;
	const authBase64 = btoa(authString);

	const url = "https://accounts.spotify.com/api/token";
	const headers = {
		Authorization: `Basic ${authBase64}`,
		"Content-Type": "application/x-www-form-urlencoded",
	};

	const data = new URLSearchParams();
	data.append("grant_type", "client_credentials");

	try {
		const response = await axios.post(url, data, { headers });
		const token = response.data.access_token;
		return token;
	} catch (error) {
		console.error("Error obtaining access token:", error);
		return null;
	}
}

getToken()
	.then((token) => {
		if (token) {
			console.log(token);
		} else {
			console.log("Failed to obtain access token.");
		}
	})
	.catch((error) => {
		console.error("Error:", error);
	});

const endpointUrl = "https://api.spotify.com/v1/me/top/tracks";

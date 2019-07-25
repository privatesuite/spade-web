let proxy = "";

const spade = {
	
	setProxy (_proxy) {

		proxy = _proxy;

	},

	async getLocations (location) {

		return (await axios.post(proxy + "https://bandcamp.com/api/location/1/geoname_search", {
		
			q: location,
			
			n: 5,
			geocoder_fallback: true
	
		})).data.results;

	},

	async getRecentAlbums (albums, location) {

		var _ = [];
		var page = 1;

		async function getPage (page) {

			return (await axios.post(proxy + "https://bandcamp.com/api/hub/2/dig_deeper", {
		
				filters: {
					
					format: "all",
					location: parseInt(location || "0"),
					sort: "date",
					tags: ["vaporwave"]
				
				},
				
				page
		
			})).data;

		}

		while (_.length < albums) {

			_.push(...(await getPage(page++)).items);

		}

		_ = _.slice(0, albums);

		return _;
		
	}

}

/**
 * `$`
 * 
 * @param {string} query The CSS selector
 * 
 * @returns {Element}
 */
function $ (query) {

	return document.querySelector(query);

}

/**
 * `$$`
 * 
 * @param {string} query The CSS selector
 * 
 * @returns {Element[]}
 */
function $$ (query) {

	return [...document.querySelectorAll(query)];

}

function capitalizeFirstLetter (string) {

	return string.charAt(0).toUpperCase() + string.slice(1);

}

async function main () {

	spade.setProxy("https://cors-anywhere.herokuapp.com/");

	$("#search").addEventListener("click", async () => {

		const amount = parseInt($("#amount").value);
		const location = $("#location").value || "";

		if (amount < 1) return;

		let loc = 0;
		if (location) {

			loc = await spade.getLocations(location);

		}

		const recent = await spade.getRecentAlbums(amount, loc ? loc[0].id : 0);

		$(".result_text").innerHTML = `Results for <strong>${amount}</strong> albums${location ? ` from <strong>${loc[0].fullname}</strong>` : ""}`;
		$$(".album").map(_ => _.remove());

		for (const album of recent) {

			// log(`${chalk.bold(album.title)} by ${album.band_name}`);
			// log(`\n`);

			// log(`${chalk.bold.cyan("URL")} ${album.tralbum_url}`);
			// log(`${chalk.bold.cyan("Genre")} ${album.genre}`);
			// if (args.location) log(`${chalk.bold.cyan("Location")} ${loc[0].fullname}`);
			// log(`${chalk.bold.cyan("Featured Track")} ${album.featured_track_title}`);

			let div = document.createElement("div");

			div.classList.add("album");

			div.innerHTML = `
			<div>

				<h3><a href="${album.tralbum_url}">${album.title}</a></h3>
				<span>${album.band_name}</span>
		
			</div>
			
			<div>
			
				<span>${capitalizeFirstLetter(album.genre)} <strong>Genre</strong></span><br>
				${loc ? `<span>${loc[0].fullname} <strong>Location</strong></span><br>` : ""}
				<span>${album.featured_track_title} <strong>Featured Track</strong></span>

			</div>
			`;

			$(".results>.body").appendChild(div);

		}
		
	});

}

main();

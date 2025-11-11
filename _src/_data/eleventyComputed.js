export default {
	// Provide a structure by year to match expected output logic.
	editions: function(data) {
		const participants = data.participants;
		const editions = [];
		const yearMin = 2006; // The first CSS Naked Day.

		let yearMax = yearMin;

		for (const participant in participants) {
			// Basic structure: year > participant > websites.
			participants[participant].websites.forEach(website => {
				website.years.forEach(year => {
					let currentEdition = editions.find(edition => edition.year === year);

					yearMax = Math.max(yearMin, year);

					// Initialise year if it does not exist.
					if (!currentEdition) {
						editions.push({
							year: Number(year),
							'participants': {},
						});

						currentEdition = editions.find(edition => edition.year === year);
					}

					// Populate participants for this year.
					if (!currentEdition['participants'][participant]) {
						currentEdition['participants'][participant] = [];
					}

					// Populate participant with its websites for this year.
					currentEdition['participants'][participant].push(website.url);
				});
			});
		};

		// Add missing editions with no participant.
		for (let year = yearMin; year < yearMax; year++) {
			if (!editions.some((edition) => edition.year === year)) {
				editions.push({ year });
			}
		}

		editions.sort((a, b) => a.year > b.year ? 1 : -1);

		return editions;
	}
}

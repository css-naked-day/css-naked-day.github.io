export default {
	// participations: { year, participant }[]
	participations: function(data) {
		const participants = data.participants;
		const participations = [];

		for (const participant in participants) {
			participants[participant].websites.forEach(website => {
				website.years.forEach(year => {
					participations.push({year, participant});
				});
			});
		};

		participations.sort((a, b) => a.year > b.year ? 1 : -1);

		return participations;
	},

	// participationsCount: { YEAR: COUNT, … }
	participationsCount: function(data) {
		const participationsCount = {};

		for(const participation of data.participations) {
			const yearCount = participationsCount[participation.year];

			participationsCount[participation.year] = yearCount > 0
				? participationsCount[participation.year] + 1
				: 1;
		};

		return participationsCount;
	},
}

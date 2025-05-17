export default {
  // Provide a structure by year to match expected output logic.
  years: function(data) {
    const participants = data.participants;
    const years = {};
    const yearMin = 2006; // The first CSS Naked Day.

    let yearMax = yearMin;

    for (const participant in participants) {
      // Basic structure: year > participant > websites.
      participants[participant].websites.forEach(website => {
        website.years.forEach(year => {
          yearMax = Math.max(yearMin, year);

          if (!years[year]) {
            years[year] = {
              'participants': {},
            };
          }

          if (!years[year]['participants'][participant]) {
            years[year]['participants'][participant] = [];
          }

          years[year]['participants'][participant].push(website.url);
        });
      });
    };

    // Add missing years with no participant.
    for (let year = yearMin; year < yearMax; year++) {
      if (!years[year]) {
        years[year] = {};
      }
    }

    return years;
  }
}
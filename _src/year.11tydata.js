export default {
  pagination: {
    // `before` is necessary because computedData happens after pagination.
    // SEE https://www.11ty.dev/docs/data-computed/
    before: function(paginationData, fullData) {
      const years = [];

      paginationData.forEach(participant => {
        fullData.participants[participant].websites.forEach(website => {
          website.years.forEach(year => {
            if (!years.includes(year)) {
              years.push(year);
            }
          });
        });
      });

      return years.sort();
    },
  },
}
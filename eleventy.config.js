import toml from '@iarna/toml';

function getWebsiteDomain(url) {
	return url.replace(
		/^https?:\/\/(www\.)?([^/]+)\/?.*/,
		(string, www, domain) => domain
	);
}

// TODO: Add a tool to target duplicated domains.
// TODO: Add finer sorting.

export default function (eleventyConfig) {
	eleventyConfig.setQuietMode(true);

	eleventyConfig.setInputDirectory('_src');

	// Host static assets. Anything from `./public/` goes to site’s root `/`.
	eleventyConfig.addPassthroughCopy({ '_assets/public': '/' });

	// Allow to parse Toml files for Global data.
	eleventyConfig.addDataExtension('toml', (contents) => toml.parse(contents));

	// Filters
	// ===============================================================================================

	// Global data filters.
	// ---------------------------------------------------------------------------

	eleventyConfig.addFilter('getParticipantDisplayName', (participant) => {
		// TODO: Either get current year’s website, or use the filename.
		const websiteURL = participant.websites[0].url;

		return participant.display ?? participant.username ?? getWebsiteDomain(websiteURL);
	});

	eleventyConfig.addFilter('getSiteTitle', (url, participant) => {
		const website = participant.websites.find(website => website.url === url);

		return website.title ?? getWebsiteDomain(website.url);
	});

	// Return website matching url and year.
	// This allows to have different configurations for different years.
	// This is uSeful for prefix and suffix which might need different values depending on the year.
	eleventyConfig.addFilter('getSiteData', (url, participant) => {
		return participant.websites.find(website => website.url === url);
	});

	eleventyConfig.addFilter('getWebsitesForYear', (websites, year) => {
		return websites.filter(website => website.years.includes(year));
	});

	// eleventyComputed data filters.
	// ---------------------------------------------------------------------------

	eleventyConfig.addFilter('getParticipantsForYear', (participations, year) => {
		return participations
			.filter(participation => participation.year === year)
			.sort((a, b) => a.participant > b.participant ? 1 : -1);
	});

	// Shortcodes
	// ===============================================================================================

	eleventyConfig.addShortcode('linkNoSpam', function(callback, url, participant, year, loopIndex0) {
		const website = eleventyConfig.getFilter('getSiteData')(url, participant, year);

		if(!website) {
			return;
		};

		let title, prefix, suffix, separator;

		if (callback === 'getSiteTitle') {
			title  = eleventyConfig.getFilter('getSiteTitle')(url, participant);
			prefix = website.prefix;
			suffix = website.suffix;
		} else {
			title = eleventyConfig.getFilter('getParticipantDisplayName')(participant);
		}

		if (website.separator === undefined && loopIndex0) {
			separator = loopIndex0 > 1 ? ' & ' : ', ';
		}

		if (!website.url) {
			return title;
		}

		if (website.spam) {
			return website.url;
		}

		return `${separator ?? ''}${prefix ?? ''}<a href="${website.url}">${title}</a>${suffix ?? ''}`
	});

	return {
		htmlTemplateEngine: 'njk',
	};
};

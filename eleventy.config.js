import toml from '@iarna/toml';
import { minify, getPreset } from 'html-minifier-next';

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

	eleventyConfig.addFilter('getSiteTitle', function(website) {
		return website.title ?? getWebsiteDomain(website.url);
	});

	// Global data filters.
	// ---------------------------------------------------------------------------

	eleventyConfig.addFilter('getParticipantDisplayName', function(filename) {
		const participant = this.ctx.participants[filename];

		return participant.display ?? participant.username ?? filename;
	});

	eleventyConfig.addFilter('getParticipantWebsitesForYear', function(participant, year) {
		return participant.websites.filter(website => website.years.includes(year));
	});

	eleventyConfig.addFilter('mergeNameWithURL', function(participant, websitesForYear) {
		// Is there only one website for the current year?
		if (websitesForYear.length > 1) {
			return false;
		}

		// Is there at least one `homeURL` in the user file.
		const hasHomeURL = participant.websites.some(website => website.homeURL !== undefined);

		if (!hasHomeURL) {
			return true;
		}

		return websitesForYear[0].homeURL;
	});

	// eleventyComputed data filters.
	// ---------------------------------------------------------------------------

	/**
	 * Get all participants from the eleventyComputed data.
	 * See {@link https://www.11ty.dev/docs/data-computed/|eleventyComputed}.
	 *
	 * @param  {array}  participations - {year, filename}[]
	 * @param  {number} year           - target year
	 * @return {array}  year’s participations - {year, filename}[]
	 */
	eleventyConfig.addFilter('getParticipantsForYear', function(participations, year) {
		return participations
			.filter(participation => participation.year === year)
			.sort((a, b) => a.participant > b.participant ? 1 : -1);
	});

	// Shortcodes
	// ===============================================================================================

	/**
	 * Display the URL of the website without a link if it is marked as spam.
	 *
	 * @param  {string} title   - Anchor of the link
	 * @param  {Object} website - {url, [spam]}
	 * @return {string}         - Formatted link or URL as string
	 */
	eleventyConfig.addShortcode('linkNoSpam', function(title, website) {
		return website.spam ? website.url : `<a href="${website.url}">${title}</a>`;
	});

	/**
	 * Format websites as _website 1, website 2 & website 3_ by default.
	 * Use separator, prefix or suffix properties otherwise.
	 *
	 * @param  {array} websites - {url, [title], [prefix], [suffix], [separator], years[]}[]
	 * @return {string}         - Formatted string of links
	 */
	eleventyConfig.addShortcode('formatWebsitesForYear', function(websites) {
		let output = '';

		for(const website of websites) {
			const title  = eleventyConfig.getFilter('getSiteTitle')(website);
			const link   = eleventyConfig.getShortcode('linkNoSpam')(title, website);;
			const prefix = website.prefix ?? '';
			const suffix = website.suffix ?? '';

			let loopIndex = websites.indexOf(website);
			let separator = '';

			if (loopIndex > 0 && website.separator === undefined) {
				separator = loopIndex > 1 ? ' & ' : ', ';
			}

			output += `${separator}${prefix}${link}${suffix}`;
		}

		return output;
	});

	// HTML minification
	// ===============================================================================================

	eleventyConfig.addTransform('htmlmin', function(content) {
		if (this.page.outputPath && this.page.outputPath.endsWith('.html')) {
			let minified = minify(content, {
				...getPreset('comprehensive'),
				collapseInlineTagWhitespace: false // TODO: Remove with HTML Minifier Next 5.x.x
			});
			return minified;
		}
		return content;
	});

	// ===============================================================================================

	return {
		htmlTemplateEngine: 'njk',
	};
};

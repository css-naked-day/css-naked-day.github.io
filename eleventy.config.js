import Nunjucks from "nunjucks";
import toml from "@iarna/toml";
import fs from "fs";
import { default as RegEscape } from "regexp.escape";

function getWebsiteDomain(url) {
  return url.replace(
    /^https?:\/\/(www\.)?([^/]+)\/?.*/,
    (string, www, domain) => domain
  );
}

export default function (eleventyConfig) {
  eleventyConfig.setQuietMode(true);

  eleventyConfig.setInputDirectory('_src');

  // Host static assets. Anything from `./public/` goes to site’s root `/`.
  eleventyConfig.addPassthroughCopy({ "_assets/public": "/" });

  // Allow to parse Toml files for Global data.
  eleventyConfig.addDataExtension("toml", (contents) => toml.parse(contents));

  eleventyConfig.addFilter("getParticipantDisplayName", (participant) => {
    const websiteURL = participant.websites[0].url;

    return participant.display || participant.username || getWebsiteDomain(websiteURL);
  });

  eleventyConfig.addFilter("getSiteTitle", (url, participant) => {
    const website = participant.websites.find(website => website.url === url);

    return website.title || getWebsiteDomain(website.url);
  });

  // Return website matching url and year.
  // This allows to have different configurations for different years.
  // This is uSeful for prefix and suffix which might need different values depending on the year.
  eleventyConfig.addFilter("getSiteData", (url, participant, year) => {
    return participant.websites.find(website => {
      return website.url === url && website.years.includes(year);
    });
  });

  eleventyConfig.addShortcode("linkNoSpam", function(callback, url, participant, year, loopRevIndex0) {
    const website = eleventyConfig.getFilter("getSiteData")(url, participant, year);

    if(!website) {
      return;
    };

    let title;
    let prefix = website.prefix;
    let suffix = website.suffix;

    switch (callback) {
      case 'getSiteTitle':
        title = eleventyConfig.getFilter('getSiteTitle')(url, participant);
        break;
      case 'getParticipantDisplayName':
        title = eleventyConfig.getFilter('getParticipantDisplayName')(participant);
        break;
    }

    if (suffix === undefined && loopRevIndex0) {
      suffix = loopRevIndex0 > 1 ? ', ' : ' & ';
    }

    if (!website?.url) {
      return title;
    }

    if (website.spam) {
      return website.url;
    }

    return `${prefix || ''}<a href="${website.url}">${title}</a>${suffix || ''}`
  });

  // TODO: Add a tool to target duplicated domains.

  // Create Toml files based on legacy HTML files.
  // TODO: Tweaked files to restore mistakes.
  eleventyConfig.addGlobalData("tomlFromLegacyHTML", () => {
    // Comment next line to create toml files based on existing HTML files.
    // Files can be found in _site/exports/participants/.
    return {};

    const files = fs.readdirSync(`./_assets/legacy-html-files/`);
    const participants = {};
    const findWebsite = (websites, url) => websites.find(website => website.url === url);

    for (const file of files) {
      const content = fs.readFileSync(
        `./_assets/legacy-html-files/${file}`, 'utf8'
      );

      const listContent = /            <li>(?<inner>.*)<\/li>/g;
      const listItems = [...content.matchAll(listContent)];

      listItems.forEach((item, index) => {
        // SEE https://regex101.com/r/g4rGk7
        // TODO Improve grouping?
        const groups = [...item.groups.inner.matchAll(/(?<prefix>.*?)[\W+]*((<a.+?href="(?<url>[^"]+)">(?<title>.+?)<\/a>)[\W+]*?)/g)];

        // Set default values for slug.
        let participantID = groups[0]?.groups?.prefix?.trim();
        let title = groups[0]?.groups?.title?.trim();

        groups.forEach(group => {
          const url = group.groups.url;
          const currentYear = file.replace('.html', '');

          // Slugify potential id, with fallback in case of non-latin characters.
          const slug =
            `${eleventyConfig.getFilter("slugify")(participantID || title)}`
            || `${title}-${index}`;

          title = group.groups.title;

          // Create entry if not already present.
          if (!participants[slug]) {
            participants[slug] = {
              display: participantID || title,
              websites: [],
            };
          }

          // Add website to existing entries.
          if (!findWebsite(participants[slug].websites, url)) {
            participants[slug].websites.push({
              url: url,
              title: title || participantID,
              years: [currentYear],
            });
          } else {
            if (!findWebsite(participants[slug].websites, url).years.find(year => year === currentYear)) {
              findWebsite(participants[slug].websites, url).years.push(
                currentYear
              );
            }
          }
        });
      });
    }

    return participants;
  });

  return {
    htmlTemplateEngine: "njk",
  };
};

import Nunjucks from "nunjucks";
import toml from "@iarna/toml";
import fs from "fs";
import { default as RegEscape } from "regexp.escape";

function getWebsiteDomain(url) {
  return url.replace(
    /^https?:\/\/([^/]+)\/?.*/,
    (string, domain) => domain
  );
}

export default function (eleventyConfig) {
  eleventyConfig.setQuietMode(true);

  // Host static assets. Anything from `./public/` goes to site’s root `/`.
  eleventyConfig.addPassthroughCopy({ public: "/" });

  // Ignore files in folders. Only transform top level html files.
  eleventyConfig.ignores.add("*/**");
  eleventyConfig.ignores.add("README.md");

  // Allow to parse Toml files for data.
  eleventyConfig.addDataExtension("toml", (contents) => toml.parse(contents));

  eleventyConfig.addFilter("getParticipantDisplayName", (participant) => {
    const websiteURL = participant.websites[0].url;

    return participant.display || participant.username || getWebsiteDomain(websiteURL);
  });

  eleventyConfig.addFilter("getSiteTitle", (url, participant) => {
    const website = participant.websites.find(website => website.url === url);

    return website.title || getWebsiteDomain(website.url);
  });

  // Create Toml files based on legacy HTML files.
  // TODO: Tweaked files to restore mistakes.
  eleventyConfig.addGlobalData("legacy", () => {
    // Comment next line to create toml files based on existing HTML files.
    // Copy created files to /_data/participants/.
    return {};

    const files = fs.readdirSync(`./legacy-html-files/`);
    const participants = {};
    const findWebsite = (websites, url) => websites.find(website => website.url === url);

    for (const file of files) {
      const content = fs.readFileSync(
        `./legacy-html-files/${file}`, 'utf8'
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

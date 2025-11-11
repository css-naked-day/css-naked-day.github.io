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
    let separator = website.separator;
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

    if (separator === undefined && loopRevIndex0) {
      separator = loopRevIndex0 > 1 ? ' & ' : ', ';
    }

    if (!website.url) {
      return title;
    }

    if (website.spam) {
      return website.url;
    }

    return `${separator ?? ''}${prefix ?? ''}<a href="${website.url}">${title}</a>${suffix ?? ''}`
  });

  // TODO: Add a tool to target duplicated domains.

  return {
    htmlTemplateEngine: "njk",
  };
};

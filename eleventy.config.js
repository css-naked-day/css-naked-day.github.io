import Nunjucks from "nunjucks";
import toml from "@iarna/toml";

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

  return {
    htmlTemplateEngine: "njk",
  };
};

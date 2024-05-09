const fs = require("fs");

module.exports = function (eleventyConfig) {
  // host static assets (anything in `./public/` on site root `/`)
  eleventyConfig.addPassthroughCopy({ public: "/" });
  // ignore files in folders (only transform top level html files)
  eleventyConfig.ignores.add("*/**");

  eleventyConfig.addGlobalData("myStatic", () => {
    return "this is data";
  });

  eleventyConfig.addGlobalData("years", () => {
    all_fnames = fs
      .readdirSync(".")
      .filter((fname) => /^[0-9]{4}$/.test(fname));
    years = {};
    for (fname of all_fnames) {
      files = fs.readdirSync(fname);
      content = files.map((f) => fs.readFileSync(`${fname}/${f}`));
      years[fname] = content;
    }
    return years;
  });

  // json stringify input, e.g., {{json some_data}}
  eleventyConfig.addHandlebarsHelper("json", (data) => JSON.stringify(data));
  // turn object keys into list, e.g., {{keys some_object_data}}
  eleventyConfig.addHandlebarsHelper("keys", (obj) => Object.keys(obj));
  // get max/min value from a list, e.g., {{min some_list}}
  eleventyConfig.addHandlebarsHelper("min", (list) => Math.min(...list));
  eleventyConfig.addHandlebarsHelper("max", (list) => Math.max(...list));
  // generate integer sequence from low to high, e.g., {{seq 2006 2024}}
  eleventyConfig.addHandlebarsHelper("seq", (low, high) =>
    [...Array(high + 1 - low).keys()].map((i) => i + low)
  );
  // reverse list order
  eleventyConfig.addHandlebarsHelper("rev", (arr) => arr.reverse());
  // access key in object
  eleventyConfig.addHandlebarsHelper("get", (obj, key) => obj[key]);

  return {
    // use handlebars for HTML
    htmlTemplateEngine: "hbs",
  };
};

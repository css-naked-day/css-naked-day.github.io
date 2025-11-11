# CSS Naked Day

“Show off your semantic `<body>`”: [_April 9 is CSS Naked Day!_](https://css-naked-day.org/)

If you’re participating, add or update a [file in participants](https://github.com/css-naked-day/css-naked-day.github.io/tree/issues/160-refactor-eleventy/_src/_data/participants)!

If you have been participating and are not listed, feel free to make a Pull Request and give us reasonable clues. A link to the [Web archive](https://web.archive.org/web/https://css-naked-day.org/) is always welcome, but you might also point to articles or online mentions of your participation.

Welcome to CSS Naked Day!

## Data structure

We are using **one file per website owner**, with your websites and participating years in the same file! Simply add years or websites as they come.

We are using [Toml configuration files](https://toml.io/) to structure data. Here are examples of configurations:

### Bare minimum

The following will show as “_[css-naked-day.org]_”:

```toml
[[websites]]
url   = "https://css-naked-day.org/"
years = [2006, 2010]
```

### With a display name

The following will show as “_[Naked Days Corp]_”:

```toml
display = "Naked Days Corp"

[[websites]]
url   = "https://css-naked-day.org/"
years = [2006, 2010]
```

### With multiple websites

The following will show as “_[Naked Days Corp]_” in 2006 and “_Naked Days Corp: [CSS Naked Day] & [JS Naked Day]_” in 2010:

```toml
display = "Naked Days Corp"

[[websites]]
url   = "https://css-naked-day.org/"
title = "CSS Naked Day"
years = [2006, 2010]

[[websites]]
url   = "https://js-naked-day.org/"
title = "JS Naked Day"
years = [2010]
```

### Advanced formatting

By default, more than one entry will be listed as “_`display`: [website1](), [website2]() & [website3]()_”. [Tom Hazeldine’s config file](https://github.com/css-naked-day/css-naked-day.github.io/blob/430c7d632bddd5d4fb1a17799ac5fc45cee49fab/_src/_data/participants/tom-hazledine.toml#L14-L16) is a good example of a more free-flow writing of entries.

His websites will appear as “_Tom Hazledine: [tomhazledine.com](https://tomhazledine.com/) (some of which is [always naked](https://tomhazledine.com/css-naked-day/))_”

### More than complete

We are not using all data yet, but feel free to add them, as we might improve the website with it!

External accounts can also be a good way to join you.

```toml
display   = "Joan Elisabeth Lowther Murray" # [optional]
firstname = "Joan Elisabeth"                # [optional]
surname   = "Lowther Murray"                # [optional]
email     = "joan@example.com"              # [optional]
username  = "jelm"                          # [optional]

# Websites
# ------------------------------------------------------------------------------

[[websites]]
url   = "https://css-naked-day.org/"
title = "CSS Naked Day"
years = [2006, 2010]

[[websites]]
url   = "https://js-naked-day.org/"
title = "JS Naked Day"
years = [2010]

# Accounts [optional]
# ------------------------------------------------------------------------------

[[accounts]]
type = "Mastodon"
url  = "https://mas.to.don/@jelm"

[[accounts]]
type     = "Github"
url      = "https://github.com/jelm.github"
username = "jelm.github"                    # [optional] The main one is used by default
```

## Development

The site is built using [Eleventy](https://www.11ty.dev/) and [npm](https://www.npmjs.com/).

### Build website

```bash
npm run build
```

### Host a local web-server and watch files (development mode)

```bash
npm run dev
```


[css-naked-day.org]: https://css-naked-day.org/
[Naked Days Corp]: https://css-naked-day.org/
[CSS Naked Day]: https://css-naked-day.org/
[Naked]: https://css-naked-day.org/
[JS Naked Day]: https://js-naked-day.org/
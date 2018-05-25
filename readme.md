# Responsive Fountain Screenplay with Dialog Analyses

This webapp aims to provide advanced statistics for your Screenplay written in fountain syntax.

# Links

- [Online WebApp](https://x-raym.github.io/Fountain.js/), for testing the app online.
- [Zip Download](https://github.com/X-Raym/Fountain.js/archive/master.zip), for local usage with all the fancy features.
- [GitHub Repo](https://github.com/X-Raym/Fountain.js), for contributing.
- [Demos](https://x-raym.github.io/Fountain.js/samples/), for displaying some already prepared screenplays directly.
- Presentation on the article [ExtremRaym / Screenwritng in Fountain Format: Interoperability, Render and Analysis](https://www.extremraym.com/en/fountain-screenwriting-render-and-analysis/)

# Introduction

This project started as a fork of the **sbddesign**'s [Fountain.js mod](https://github.com/sbddesign/Fountain.js) who added location reports and make few code fixes. He based his work on the original **mattdaly**'s [Fountain.js](https://github.com/mattdaly/Fountain.js) parser.  In the end, I removed location reports for now and some files, to make it answers my own personal needs.

The result is an intensive mod of the [Fountain.js](http://mattdaly.github.io/Fountain.js/) app demo, with tons of new features.

## Features

### Navigation

- Table of Contents Page with smooth scrolling links
- Automatic sequences numbering
- Support anchor in URL

### Initialization

- Drag and drop file input can be automatically bypassed (see Usage)
- Drag and drop box as fallback (see Usage)
- Automatically refresh the page (allow to work on side application and have real-time render and stats display)
- Save various user variables as cookies (theme, stats settings etc...)
- Custom characters metadata can be added in a `json/characters.json` file, relative to your .html file. The characters.json file is divided in two main categories: Charaters and Categories. See the `characters.json` file in this repo for detailed usage.

### Stats and Charts

- Multi unit dialog analyses (word, characters, time evaluation)
- Customizable characters per minutes fields for time evaluation
- Dialog Bar Charts per characters
- Dialog Bar Charts per characters categories
- Dialog X-Range chart, with duration evaluation, timecode and line for each dialog

### Style

- Light theme
- Dark-Blue theme
- Full width display (optional)
- Mobile-friendly responsive design
- Characters color
- French non-breaking spaces before strong punctuations
- No favicon
- Colored italic text background
- SVG icons for toolbar, directly emebed as HTML from JavaScript (less server request, more customization possible)

### Fixes

- Allow all UTF-8 characters in character names (from [Derenix](https://github.com/derenix/Fountain.js/commit/4fc8f3f35c959f25a3e0c184d11a5a0c5b23037b)).

## Usage

### Moding

This project is an experiment. If you plan to use it, I advice you to make a copy/fork, and work on your own version. I may not guarantee backward compatibility, steady updates etc. I design it to answer my own custom need, and decided to share it so it can be useful to others, but I don't plan to make custom support on it. But of course, if you have some proposition to make, feel free to ask / create pull requests!

You can either use the built-in `index.html` file in the `app` subfolder which have a drag and drop box letting you put any `.fountain` file in it, or duplicate + rename the `index.html` and put it anywhere next to a similarly named `.fountain` file. In this case, be sure to update the scripts and stylesheets paths in the html if needed, so that it points to this `fountain.js` folder. This method of initialization allows to have real time update of the graph, and one dedicate HTML page for each of your fountain file. All data on the page (page title, screenplay text, charts, etc....) are updated based on the fountain file. You don't add to change anything but script and sheets paths (and only if they are broken).

### Local Usage

The auto-load feature based on `.html` file name only works in [FireFox](https://www.mozilla.org/fr/firefox/new/), which supports the Fetch API for local files. It will not work in browsers which don't support this feature.

### Online Usage

You can access this associated online page [GitHub Page](https://x-raym.github.io/Fountain.js/app/) to access the drag and drop file version of this app.

Or Simply upload to the unzipped repo archive in your server.

### Local Files

Using the drag and drop feature to parse local .fountain file doesn't allow to load your custom metadata from a `characters.json`.

### Samples

The repo have a set of screenplays ready for testing. Just open the dedicated .html pages in your browser.

Samples included:

- Brick & Steel
- Big Fish

## Todos

- Add Input from URL to prevent local files usage limitation for assets loading
- Add descriptions in the X-Range graph.
- Add tooltip for the toolbar

## Dependencies

- [jquery](https://code.jquery.com/)
- [smoothscroll.js](http://mths.be/smoothscroll)
- [normalize.css](https://necolas.github.io/normalize.css/)
- [fountain.js](https://github.com/mattdaly/Fountain.js)
- fountain.js [style.css](https://github.com/mattdaly/Fountain.js)
- [highcharts.js](https://www.highcharts.com/)
- highcharts [xrange.js](http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/x-range/)

## External Resources

Icons have been downloaded from [https://fontawesome.com/](https://fontawesome.com/).

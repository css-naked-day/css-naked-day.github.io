/*! CSS Naked Day script v2.0 | The MIT License (MIT) Copyright (c) 2015 Ben Buchanan http://opensource.org/licenses/MIT */
/*
Removes all linked, alternate, embedded and inline styles on April 9th (unless set to ignored). Works in IE11 and evergreen browsers.
Changes: 2020.08.23 v2.0 - Updated to catch alternate stylesheets & added ignore feature.
*/
(function(){

	var today = new Date(),
			month = today.getMonth(),
			day = today.getDate(),
			elements,
			attrs;

	// For testing:
	// month = 3; day = 9;

	if (document.querySelectorAll && month === 3 && day === 9) {

		// Add data-cssnakedday="ignore" to any element you want this script to ignore/not remove.
		// Useful if you have CSS supporting functionality that should still work during naked day.
		function notIgnored (el) {
			return (el.getAttribute('data-cssnakedday') != "ignore")
		}

		// Remove all linked stylesheets and style blocks
		elements = document.querySelectorAll('link[rel~="stylesheet"], style');
		for (var i = 0; i < elements.length; i++) {
			if(notIgnored(elements[i])) {
				elements[i].parentNode.removeChild(elements[i]);
			}
		}

		// Remove all inline styles
		attrs = document.querySelectorAll('[style]');
		for (var ii = 0; ii < attrs.length; ii++) {
			if(notIgnored(attrs[ii])) {
				attrs[ii].removeAttribute('style');
			}
		}

		// Inject a message at the top of the document. Optional - just remove this section if you don't want it.
		var message = document.createElement('div');
		var body = document.getElementsByTagName('body')[0];
		message.innerHTML = '<p>Why is this page looking so simple? It’s <a href="https://css-naked-day.org/">CSS Naked Day</a>!</p><hr>';
		body.insertBefore(message, body.firstChild);

	}
})();

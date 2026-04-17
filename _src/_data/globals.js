const now = new Date();
const yearCurrent = now.getUTCFullYear();
const cssndStart = new Date(Date.UTC(yearCurrent, 3, 8, 10, 0, 0));
const cssndEnd = new Date(Date.UTC(yearCurrent, 3, 10, 12, 0, 0));

export default {
	websiteName: 'CSS Naked Day',
	yearStart: 2006,
	yearCurrent,
	isNakedDay: now >= cssndStart && now < cssndEnd,
}

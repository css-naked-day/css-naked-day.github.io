const now = new Date();
const year = now.getUTCFullYear();

export default {
	yearStart: 2006,
	yearCurrent: year,
	// “true” while April 9 is occurring anywhere on Earth (UTC+14 to UTC−12: April 8 10:00 UTC–April 10 12:00 UTC)
	isNakedDay: now >= new Date(Date.UTC(year, 3, 8, 10, 0, 0)) && now < new Date(Date.UTC(year, 3, 10, 12, 0, 0)),
}

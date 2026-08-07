export function twoDigits(num) {
    return ("" + num).padStart(2, '0');
}

export function withQuarters(num) {
    if( num < 0.2 ) return "0";

    let intpart = Math.floor(num);
    if( intpart < 1 ) intpart = "";
    let decpart = num - intpart;
    let decpart_str = "";
    if( decpart > 0.2 ) decpart_str = "¼";
    if( decpart > 0.4 ) decpart_str = "½";
    if( decpart > 0.7 ) decpart_str = "¾";
    return "" + intpart + decpart_str;
}

export function withQuartersGT0(numOrStr) {
    if( isNaN(numOrStr-0) ) return numOrStr;
    if( numOrStr < 0.2 ) return "";
    return withQuarters(numOrStr);
}

export function withQuartersAndHours(num) {
    let unit = num < 2 ? "ora" : "ore";
    return withQuarters(num) + " " + unit;
}

export function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

export function totalCount(d) {
    if (d == undefined) return '';
    let workCount = 0;

    for (let i = 0; i < d.length; i++) {
        if (d[i].type.tag == 'work')
            workCount += d[i].hours;
        else return d[i].type.acronym;
    }

    return workCount;
}

export function hhmm( t ) {
    return new Date(t).toLocaleTimeString('it-IT', { 'hour': '2-digit', 'minute': '2-digit' });
}
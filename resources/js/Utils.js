import { contrastColor } from "contrast-color";


export function romanize (num) {
    if (isNaN(num))
        return NaN;
    if( num == 0 )
        return "ON"
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}

export class AlumnusStatus {
    static HasRight = 0;
    static HasntRight = 1;
    static Candidate = 2;
    static Member = 3;
    static Dead = 4;
    static Disallow = 5;
    static StudentNotMember = 6;
    static StudentMember = 7;
    static names = [ 'Avente diritto', 'Non avente diritto', 'Da ratificare', 'Socio', 'Deceduto', 'Rifiuta', 'Studente socio', 'Studente non socio' ]
    static acronym = [ 'AD', 'NAD', 'DR', 'S', 'D', 'R', 'SS', 'SNS' ]
    static colors = [ '#FFFF00', '#FF00FF', '#0000FF', '#00CC00', '#003300', '#FF0000', '#00FF99', '#FF9900']
}

export class Roles {
    static names = {
        'secretariat': 'Segreteria',
        'webmaster': 'WebMaster'
    }
}

export function bgAndContrast( bgColor ) {
    return {
        backgroundColor: bgColor,
        color: contrastColor({ bgColor: bgColor })
    }
}

export function disappearing( visible ) {
    return {
        height: visible ? 'auto' : 0,
        overflow: visible ? 'visible' : 'hidden'
    }
}
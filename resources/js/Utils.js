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
    static status = {
        member: { label: 'Socio', acronym: 'S', color: '#00CC00' },
        student_member: { label: 'Socio studente', acronym: 'SS', color: '#00FF99' },
        not_reached: { label: 'Non raggiunto', acronym: '?', color: '#FFFF00' },
        student_not_reached: { label: 'Studente non raggiunto', acronym: 'S?', color: '#FF9900' },
        student_not_agreed: { label: 'Studente rifiutante', acronym: 'SR', color: '#FF0000' },
        hasnt_right: { label: 'Non avente diritto', acronym: 'NAD', color: '#FF00FF' },
        dead: { label: 'Deceduto', acronym: 'D', color: '#003300' },
        not_agreed: { label: 'Rifiutante', acronym: 'R', color: '#FF0000' },
    };
}

export class Roles {
    static names = {
        'secretariat': 'Segreteria',
        'webmaster': 'WebMaster',
        'member': 'Socio',
        'student_member': 'Socio studente'
    }
}

export class Documents {
    static names = {
        'everyone': 'Tutti',
        'members': 'Soci',
        'cda': 'CdA',
        'secretariat': 'Segreteria'
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
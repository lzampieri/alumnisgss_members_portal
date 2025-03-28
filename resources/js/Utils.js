import { router } from "@inertiajs/react";
import { contrastColor } from "contrast-color";
import { enqueueSnackbar } from "notistack";


export function romanize(num) {
    if (isNaN(num))
        return NaN;
    if (num == 0)
        return "ON"
    var digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
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
        pre_enrolled: { label: 'Preiscritto', acronym: 'PI', color: '#00FFFF'},
        not_reached: { label: 'Non raggiunto', acronym: '?', color: '#FFFF00' },
        student_not_reached: { label: 'Studente non raggiunto', acronym: 'S?', color: '#FF9900' },
        student_not_agreed: { label: 'Studente rifiutante', acronym: 'SR', color: '#FF0000' },
        hasnt_right: { label: 'Non avente diritto', acronym: 'NAD', color: '#FF00FF' },
        dead: { label: 'Deceduto', acronym: 'D', color: '#003300' },
        not_agreed: { label: 'Rifiutante', acronym: 'R', color: '#FF0000' },
    };
}

export class Documents {
    static names = {
        'everyone': 'Tutti',
        'members': 'Soci',
        'cda': 'CdA',
        'secretariat': 'Segreteria'
    }
}

export function bgAndContrast(bgColor) {
    return {
        backgroundColor: bgColor,
        color: contrastColor({ bgColor: bgColor })
    }
}

export const pastelCorors = [
    '#b6e3e7',
    '#f9df9f',
    '#fab394',
    '#e4c2f5',
    '#abd68f',
    '#feaeca',
    '#d8e59a',
    '#aae8bd',
    '#d2c1f1',
    '#d1d1d1'
]

export function bgAndContrastPastel(count) {
    while( count < 0 ) count += pastelCorors.length
    return bgAndContrast(pastelCorors[count % pastelCorors.length])
}
export function disappearing(visible) {
    return {
        height: visible ? 'auto' : 0,
        overflow: visible ? 'visible' : 'hidden'
    }
}

export function postRequest(route_name, data, setProcessing, routeParams = {}, preserveState = true, preserveScroll = true) {
    setProcessing(true);
    router.post(
        route(route_name, routeParams),
        data,
        { onFinish: () => { preserveState && setProcessing(false) }, onError: (e) => { enqueueSnackbar('Errore generico!', { variant: 'error' }), console.log(e) }, preserveState: preserveState, preserveScroll: preserveScroll }
    )
}

export function randomHex(length) {
    let output = ""
    const chars = "0123456789ABCDEF"
    while (length > 0) {
        output += chars[Math.floor(Math.random() * 16)]
        length--;
    }
    return output
}

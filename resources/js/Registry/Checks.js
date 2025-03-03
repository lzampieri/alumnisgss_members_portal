import { usePage } from "@inertiajs/react";
import ADetailsType from "../Network/ADetailsType";
import { useMemo } from "react";

function textExpVal(code,val) {
    const singleVal = code.match(/^(\d+)$/);
    if( singleVal ) {
        return val == parseInt(singleVal);
    }
    const between = code.match(/^(\d+):(\d+)$/);
    if( between ) {
        return ( val >= parseInt(between[1]) ) && ( val <= parseInt(between[2]) );
    }
    const morethan = code.match(/^(\d+):$/);
    if( morethan ) {
        return ( val >= parseInt(morethan[1]) );
    }
    const lessthan = code.match(/^:(\d+)$/);
    if( lessthan ) {
        return ( val <= parseInt(lessthan[1]) );
    }
    return true;
}

function verifyCounts() {
    const adtprelist = usePage().props.adtlist;
    const adtlist = useMemo(() => {
        Object.keys(adtprelist).forEach(k => {
            adtprelist[k]['expval'] = (
                adtprelist[k]['type'] in ADetailsType.values ? ADetailsType.values[adtprelist[k]['type']]['expval'] : 0);
        });
        return adtprelist;
    }, [adtprelist]);

    const alumnusData = usePage().props.alumnusData;
    const errorsInAlumnusData = useMemo(() => {
        const list = [];
        alumnusData.forEach(alumnus => {
            Object.keys(adtlist).forEach(k => {
                if( !textExpVal(adtlist[k]['expval'],k in alumnus['a_details_keyd'] ? alumnus['a_details_keyd'][k]:0) ) {
                    list.push({
                        ...alumnus,
                        'det_id': k,
                        'val': k in alumnus['a_details_keyd'] ? alumnus['a_details_keyd'][k] : 0
                    })
                }
            });
        })
        return list;
    }, [adtlist, alumnusData])

    return <>
        <h4>Verifica dettagli</h4>
        <h5>Valori attesi:</h5>
        <ul className="list-disc list-inside">
            {Object.values(adtlist).map(adt => <li key={adt.id}>{adt.name}: {adt.expval}</li>)}
        </ul>
        <h5>Valori errati:</h5>
        <ul className="list-disc list-inside">
            {errorsInAlumnusData.map((err, i) =>
                <li key={i}><a href={route('registry.edit', {id: err.id})}>{err.name} {err.surname}</a> - {adtlist[err.det_id].name}: {err.val} instead of {adtlist[err.det_id].expval}</li>)}
            {errorsInAlumnusData.length == 0 && <>Nessun valore errato rilevato! Evviva!</>}
        </ul>
    </>
}



export default function Checks() {

    return <>
        <h3>Controlli integrità anagrafica</h3>
        <div className="w-full flex-col">
            {/* {verifyCounts()} */}
        </div>
    </>
}
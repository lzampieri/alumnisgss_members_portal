

import { useEffect, useState } from "react";
import SlowerDown from "./SlowerDown";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const STEP = {
    ERROR: 500,
    NONE: -1,
    COMBDONE: 2,
    REMOVING: 3,
    ADDING: 4,
    SAVED: 5
}

function parseName(name) {
    return name.split(" ").sort().join("").replace(/\([^\)]+\)/g, '').replace(/^[a-zA-Z0-9]/g, '');
}

async function autocombine(localData, googleData, setStatus, setPrevComb, setAutoComb, setLocalUnpaired) {

    let prevCombinedDict = Object.fromEntries(googleData.map(ctc => ['member_id' in ctc ? ctc['member_id'] : parseName(ctc['name']), ctc]))

    let prevCombs = [];
    let autoCombs = [];
    let unpaired = [];

    localData.forEach((localEntry) => {

        // Already associated
        if (localEntry.id in prevCombinedDict) {
            prevCombs.push({
                'local': localEntry,
                'google': prevCombinedDict[localEntry.id]
            });
            return;
        }

        // Automatically associated
        let namekey = parseName(localEntry['name'] + " " + localEntry['surname']);
        if (namekey in prevCombinedDict) {
            autoCombs.push({
                'local': localEntry,
                'google': prevCombinedDict[namekey]
            });
            return;
        }

        // Not associated
        unpaired.push(localEntry);
    })

    setPrevComb(prevCombs);
    setAutoComb(autoCombs);
    setLocalUnpaired(unpaired);

    setStatus(STEP.COMBDONE);
}

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

// This guy is inside Main.js
export default function AutoCombiner({ localData, googleData, setPairs, setLocalOrphans, next }) {
    const [status, setStatus] = useState(STEP.NONE);

    const [prevComb, setPrevComb] = useState({});
    const [autoComb, setAutoComb] = useState({});
    const [localUnpaired, setLocalUnpaired] = useState({});

    const [prevToRemove, setPrevToRemove] = useState([]);

    useEffect(() => {
        autocombine(localData, googleData, setStatus, setPrevComb, setAutoComb, setLocalUnpaired);
    }, []);

    useEffect(() => {
        if (status == STEP.SAVED) {
            setPairs([...prevComb, ...autoComb]);
            setLocalOrphans(localUnpaired);
            next();
        }
    }, [status]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {status < STEP.COMBDONE ? "Sto analizzando " : "Ho analizzato "} {localData.length} soci dal portale e {googleData.length} contatti da Gmail. <br />
                {status < STEP.COMBDONE && <>È in corso l'abbinamento automatico... <br /></>}
                {status >= STEP.COMBDONE && "Sono stati riabbinati " + prevComb.length + " contatti già abbinati in precedenza."}  <br />
                {status >= STEP.COMBDONE && "Sono stati automaticamente abbinati " + autoComb.length + " contatti."}  <br />
                {status < STEP.COMBDONE &&
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                }
            </div>
            {status == STEP.COMBDONE && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                <b>Contatti automaticamente abbinati da verificare</b>
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome sul portale</th>
                        <th className="px-2">Nome su Gmail</th>
                    </tr>
                    {autoComb.map(({ local, google }, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td className="px-2">{google['name']}</td>
                                <td><FontAwesomeIcon icon={faTrash} className="icon-button" onClick={() => {
                                    let autocombnew = autoComb.toSpliced();
                                    let toAdd = autoCombNew.splice(index, 1);
                                    setAutoComb(autoCombNew);
                                    setLocalUnpaired([...localUnpaired, ...toAdd]);
                                }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {status == STEP.COMBDONE && <div className="button" onClick={() => setStatus(STEP.REMOVING)}>
                {autoComb.length + prevToRemove.length > 0 ? "Salva e continua" : "Continua"}
            </div>}

            {status == STEP.COMBDONE && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                <b>Contatti già abbinati in precedenza</b>
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome sul portale</th>
                        <th className="px-2">Nome su Gmail</th>
                    </tr>
                    {prevComb.map(({ local, google }, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td className="px-2">{google['name']}</td>
                                <td><FontAwesomeIcon icon={faTrash} className="icon-button" onClick={() => {
                                    setPrevToRemove([...prevToRemove, google['id']]);
                                    setPrevComb(delFromArray(prevComb, index));
                                }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {status == STEP.COMBDONE && <div className="button" onClick={() => setStatus(STEP.REMOVING)}>
                {autoComb.length + prevToRemove.length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {(status == STEP.REMOVING || status == STEP.ADDING) && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                {status == STEP.REMOVING && <SlowerDown route={'contacts.deassociate'} list={prevToRemove} setFinish={() => setStatus(STEP.ADDING)} />}
                {status == STEP.ADDING && <SlowerDown route={'contacts.associate'} list={autoComb.map(({ local, google }) => { return { 'local_id': local['id'], 'google_id': google['id'] } })} setFinish={() => setStatus(STEP.SAVED)} />}
            </div>}

            {status == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
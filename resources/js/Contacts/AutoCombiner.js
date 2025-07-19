import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { asyncPostWithResult } from "../Utils";

const STEP = {
    ERROR: 500,
    NONE: -1,
    PREVCOMB: 0,
    AUTOCOMB: 1,
    COMBDONE: 2,
    SAVING: 3,
    SAVED: 4
}

function parseName(name) {
    return name.split(" ").sort().join("").replace(/\([^\)]+\)/g, '').replace(/^[a-zA-Z0-9]/g, '');
}

async function autocombine(members, contacts, setStatus, setPrevComb, setAutoComb) {
    setStatus(STEP.PREVCOMB);

    let prevComb = {};
    let contacts_dict = {};
    contacts.forEach((contact) => {
        if (contact['member_id'] && contact['member_id'] in members) {
            prevComb[contact['member_id']] = contact;
            // console.log("Associated ", contact['name'], " with ", members[contact['member_id']]['name']);
        } else {
            contacts_dict[parseName(contact['name'])] = contact;
            // console.log("Keyd ", contact['name'], ' as ', parseName(contact['name']));
        }
    })

    setPrevComb(prevComb);
    setStatus(STEP.AUTOCOMB);

    let autoComb = {};
    Object.keys(members).forEach((member_id) => {
        if (members[member_id]['contact']) return;

        let key = parseName(members[member_id]['name'] + " " + members[member_id]['surname']);
        if (key in contacts_dict) {
            autoComb[member_id] = contacts_dict[key];
        }
    })

    setAutoComb(autoComb);
    setStatus(STEP.COMBDONE);
}

async function saveData(setStatus, prevToRemove, autoComb) {
    setStatus(STEP.SAVING);

    try {

        if (prevToRemove.length > 0) {
            const count = await asyncPostWithResult('contacts.deassociate', { list: prevToRemove });
            console.log(count + " contatti disassociati");
        }

        if (Object.keys(autoComb).length > 0) {
            let list = [];
            Object.keys(autoComb).forEach((member_id) => {
                list.push({ 'res_id': autoComb[member_id]['id'], 'member_id': member_id });
            })

            // Does 10 items per time
            for (let i = 0; i < list.length; i += 10) {
                const count = await asyncPostWithResult('contacts.associate', { list: list.slice(i, i + 10) });
                console.log(count + " contatti associati");
            }
        }

        setStatus(STEP.SAVED);

    } catch (e) {
        console.log("Errore!");
        console.log(e);
        setStatus(STEP.ERROR);
    }

}

function delFromObject(obj, key) {
    const newobj = { ...obj };
    delete newobj[key];
    return newobj;
}

// This guy is inside Main.js
export default function AutoCombiner({ members, contacts, setCombs, next }) {
    const [status, setStatus] = useState(STEP.NONE);
    const [prevComb, setPrevComb] = useState({});
    const [autoComb, setAutoComb] = useState({});

    const [prevToRemove, setPrevToRemove] = useState([]);

    useEffect(() => {
        autocombine(members, contacts, setStatus, setPrevComb, setAutoComb);
    }, []);

    const proceed = () => {
        setCombs( { ...prevComb, ...autoComb } );
        next();
    }

    useEffect(() => {
        if( status == STEP.SAVED ) {
            proceed();
        }
    }, [status]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto analizzando {Object.keys(members).length} soci e {contacts.length} contatti. <br />
                È in corso l'abbinamento automatico... <br />
                {status == STEP.PREVCOMB && "Sto verificando i contatti già abbinati in precedenza..."}
                {status > STEP.PREVCOMB && "Sono stati riabbinati " + Object.keys(prevComb).length + " contatti già abbinati in precedenza."}  <br />
                {status == STEP.PREVCOMB && "Sto abbinando automaticamente i contatti simili..."}
                {status > STEP.AUTOCOMB && "Sono stati automaticamente abbinati " + Object.keys(autoComb).length + " contatti."}  <br />
                {status < STEP.COMBDONE &&
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                }
            </div>
            {status == STEP.COMBDONE && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                <b>Contatti già abbinati in precedenza</b>
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome sul portale</th>
                        <th className="px-2">Nome nella rubrica</th>
                    </tr>
                    {Object.keys(prevComb).map((member_id, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={member_id}>
                                <td className="px-2">{members[member_id]['name']} {members[member_id]['surname']}</td>
                                <td className="px-2">{prevComb[member_id]['name']}</td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => { setPrevToRemove([...prevToRemove, prevComb[member_id]['id']]); setPrevComb(delFromObject(prevComb, member_id)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}
            {status == STEP.COMBDONE && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                <b>Contatti automaticamente abbinati da verificare</b>
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome sul portale</th>
                        <th className="px-2">Nome nella rubrica</th>
                    </tr>
                    {Object.keys(autoComb).map((member_id, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={member_id}>
                                <td className="px-2">{members[member_id]['name']} {members[member_id]['surname']}</td>
                                <td className="px-2">{autoComb[member_id]['name']}</td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => setAutoComb(delFromObject(autoComb, member_id))} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {status == STEP.COMBDONE && <div className="button" onClick={() => saveData(setStatus, prevToRemove, autoComb)}>
                {Object.keys(autoComb).length + prevToRemove.length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {status == STEP.SAVING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}

            {status == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { asyncPostWithResult } from "../Utils";

const STEP = {
    ERROR: 500,
    COMPARING: 0,
    LIST: 1,
    SAVING: 2,
    SAVED: 3
}

async function saveData(toAdd, toRemove, groups, setStep) {
    setStep(STEP.SAVING);

    try {

        Object.keys(groups).forEach( async key => {
            if (toAdd[key].length + toRemove[key].length == 0) return 0;

            await asyncPostWithResult('contacts.modifyGroup', {
                groupId: groups[key]['id'],
                toAdd: toAdd[key].map(({ contact }) => contact['id']),
                toRemove: toRemove[key].map(({ contact }) => contact['id'])
            });
        })

        setStep(STEP.SAVED);

    } catch (e) {
        console.log("Errore!");
        console.log(e);
        setStep(STEP.ERROR);
    }

}

function elabContacts(members, combs, contacts, groups, setUnpairedMembers, setExtraContacts, setStep) {
    const unpairedMembers = [];
    const extraContacts = [];
    const resIdList = [];

    Object.values(members).forEach(member => {

        if (!(combs[member['id']]))
            unpairedMembers.push(member);
        else
            resIdList.push(combs[member['id']]['id']);

    });

    Object.values(groups).forEach(group => {

        group['members'].forEach(resid => {
            if( !resIdList.some( id => id == resid ) ) {
                let contact = contacts.find( c => c['id'] == resid );
                extraContacts.push({group: group, contact: contact});
            }
        });

    });

    setUnpairedMembers(unpairedMembers);
    setExtraContacts(extraContacts);

    setStep(STEP.LIST);
}

// This guy is inside Main.js
export default function Final({ members, combs, contacts, groups }) {
    const [step, setStep] = useState(STEP.COMPARING);
    const [unpairedMembers, setUnpairedMembers] = useState({});
    const [extraContacts, setExtraContacts] = useState({});

    useEffect(() => elabContacts(members, combs, contacts, groups, setUnpairedMembers, setExtraContacts, setStep), []);

    return (
        <div className="flex flex-col items-center">
            {step == STEP.COMPARING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto verificando gli ultimi dettagli...<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}
            
            {step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Procedura completata! Puoi chiudere questa finestra.<br />
            </div>}


            {step == STEP.LIST && unpairedMembers.length > 0 && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Attenzione: sono stati trovati {unpairedMembers.length} soci a cui non è assegnato un contatto.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                    </tr>
                    {unpairedMembers.map(( member , index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{member['name']} {member['surname']}</td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {step == STEP.LIST && extraContacts.length > 0 && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Attenzione: sono stati trovati {extraContacts.length} contatti nei gruppi che non risultano associati a nessun socio.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Gruppo</th>
                    </tr>
                    {extraContacts.map(({group, contact}, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{group['name']}</td>
                                <td className="px-2">{contact['name']}</td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

        </div>
    );
}


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

        Object.keys(groups).forEach(async key => {
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

function elabContacts(members, combs, groups, setToAdd, setToRemove, setStep) {
    const toAdd = Object.fromEntries(Object.keys(groups).map(key => [key, []]));
    const toRemove = Object.fromEntries(Object.keys(groups).map(key => [key, []]));

    // console.log( groups );

    Object.values(members).forEach(member => {

        if (!(combs[member['id']])) return;
        if (!(groups[member['status']])) return; // Should never happen, but who knows...

        // console.log(member);

        if (!(groups[member['status']]['members'].some(s => s == combs[member['id']]['id']))) {
            toAdd[member['status']].push({
                member: member,
                contact: combs[member['id']]
            })
        }

        Object.keys(groups).forEach(group => {
            if (group == member['status']) return;
            if (groups[group]['members'].some(s => s == combs[member['id']]['id'])) {
                toRemove[group].push({
                    member: member,
                    contact: combs[member['id']]
                })
            }
        })
    });

    setToAdd(toAdd);
    setToRemove(toRemove);

    setStep(STEP.LIST);
}

// This guy is inside Main.js
export default function GroupsUpdater({ members, combs, groups, next }) {
    const [step, setStep] = useState(STEP.COMPARING);
    const [toRemove, setToRemove] = useState({});
    const [toAdd, setToAdd] = useState({});

    useEffect(() => elabContacts(members, combs, groups, setToAdd, setToRemove, setStep), []);

    useEffect(() => {
        if (step == STEP.SAVED) {
            next();
        }
    }, [step]);

    return (
        <div className="flex flex-col items-center">
            {step == STEP.COMPARING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto verificando gli abbinamenti coi gruppi...<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}

            {step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                I seguenti contatti verranno aggiunti ad un gruppo.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Gruppo da aggiungere</th>
                    </tr>
                    {Object.keys(toAdd).map(group => toAdd[group].map(({ member }, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={group + index}>
                                <td className="px-2">{member['name']} {member['surname']}</td>
                                <td className="px-2">{groups[group]['name']}</td>
                            </tr>
                        )
                    }))}
                </tbody></table>
            </div>}

            {step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                I seguenti contatti verranno rimossi da un gruppo.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Gruppo da rimuovere</th>
                    </tr>
                    {Object.keys(toRemove).map(group => toRemove[group].map(({ member }, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={group + index}>
                                <td className="px-2">{member['name']} {member['surname']}</td>
                                <td className="px-2">{groups[group]['name']}</td>
                            </tr>
                        )
                    }))}
                </tbody></table>
            </div>}

            {step == STEP.LIST && <div className="button" onClick={() => saveData(toAdd, toRemove, groups, setStep)}>
                {toAdd.length + toRemove.length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {step == STEP.SAVING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}

            {step == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
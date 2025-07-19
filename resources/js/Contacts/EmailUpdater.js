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

// function parseName(name) {
//     return name.split(" ").sort().join("").replace(/\([^\)]+\)/g, '').replace(/^[a-zA-Z0-9]/g, '');
// }

// async function autocombine(members, contacts, setStatus, setPrevComb, setAutoComb) {
//     setStatus(STEP.PREVCOMB);

//     let prevComb = {};
//     let contacts_dict = {};
//     contacts.forEach((contact) => {
//         if (contact['member_id'] && contact['member_id'] in members) {
//             prevComb[contact['member_id']] = contact;
//             // console.log("Associated ", contact['name'], " with ", members[contact['member_id']]['name']);
//         } else {
//             contacts_dict[parseName(contact['name'])] = contact;
//             // console.log("Keyd ", contact['name'], ' as ', parseName(contact['name']));
//         }
//     })

//     setPrevComb(prevComb);
//     setStatus(STEP.AUTOCOMB);

//     let autoComb = {};
//     Object.keys(members).forEach((member_id) => {
//         if (members[member_id]['contact']) return;

//         let key = parseName(members[member_id]['name'] + " " + members[member_id]['surname']);
//         if (key in contacts_dict) {
//             autoComb[member_id] = contacts_dict[key];
//         }
//     })

//     setAutoComb(autoComb);
//     setStatus(STEP.COMBDONE);
// }

async function saveData(toAddOnPortal, toAddOnGoogle, setStep) {
    setStep(STEP.SAVING);
    
    try {

        // Adding on portal
        const toAddOnPortal_data = toAddOnPortal.map(({ member, contact, address }) => {
            return {
                'member_id': member['id'],
                'address': address
            }
        });

        await asyncPostWithResult('contacts.addOnPortal', { list: toAddOnPortal_data });
        
        toAddOnGoogle.forEach( async ({ member, contact, address }) => {
            await asyncPostWithResult('contacts.addOnGoogle', { contact: contact['id'], address: address });
        })

        setStep(STEP.SAVED);

    } catch (e) {
        console.log("Errore!");
        console.log(e);
        setStep(STEP.ERROR);
    }

}

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

function compareContacts(members, combs, setToAddOnPortal, setToAddOnGoogle, setStep) {
    const toAddOnPortal = []
    const toAddOnGoogle = []

    // console.log( members )
    // console.log( combs )

    Object.entries(combs).forEach(([member_id, contact]) => {
        const member = members[member_id];
        const emails_onportal = member.emails.map(email => email.address);
        const emails_ongoogle = contact.emails;

        // console.log(emails_onportal);
        // console.log(emails_ongoogle);

        emails_onportal.forEach(email_onportal => {
            if( !   emails_ongoogle.some( s => s == email_onportal ) ) {
                toAddOnGoogle.push({
                    member: member,
                    contact: contact,
                    address: email_onportal
                })
            }
        })

        emails_ongoogle.forEach(email_ongoogle => {
            if( !emails_onportal.some( s => s == email_ongoogle ) ) {
                toAddOnPortal.push({
                    member: member,
                    contact: contact,
                    address: email_ongoogle
                })
            }
        })
    })

    setToAddOnPortal(toAddOnPortal);
    setToAddOnGoogle(toAddOnGoogle);
    setStep(STEP.LIST);
}

// This guy is inside Main.js
export default function EmailUpdater({ members, combs, next }) {
    const [step, setStep] = useState(STEP.COMPARING);
    const [toAddOnPortal, setToAddOnPortal] = useState([]);
    const [toAddOnGoogle, setToAddOnGoogle] = useState([]);

    useEffect(() => compareContacts(members, combs, setToAddOnPortal, setToAddOnGoogle, setStep), []);

    useEffect(() => {
        if( step == STEP.SAVED ) {
            next();
        }
    }, [step]);

    return (
        <div className="flex flex-col items-center">
            {step == STEP.COMPARING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto verificando gli indirizzi mail<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}

            { step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {toAddOnGoogle.length} indirizzi email verranno importati dal portale a Google.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Indirizzi sul portale</th>
                        <th className="px-2">Indirizzi su google</th>
                    </tr>
                    {toAddOnGoogle.map(({member, contact, address}, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{member['name']} {member['surname']}</td>
                                <td className="px-2">
                                    { member.emails.map( ( email ) => <p className={email.address == address ? "font-bold" : ""} key={email.address}>{email.address}</p> ) }
                                </td>
                                <td className="px-2">
                                    { contact.emails.map( ( email ) => <p key={email}>{email}</p> ) }
                                </td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => { setToAddOnGoogle(delFromArray(toAddOnGoogle, index)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div> }

            { step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {toAddOnPortal.length} indirizzi email verranno importati da Google al portale.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Indirizzi sul portale</th>
                        <th className="px-2">Indirizzi su google</th>
                    </tr>
                    {toAddOnPortal.map(({member, contact, address}, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{member['name']} {member['surname']}</td>
                                <td className="px-2">
                                    { member.emails.map( ( email ) => <p key={email.address}>{email.address}</p> ) }
                                </td>
                                <td className="px-2">
                                    { contact.emails.map( ( email ) => <p className={email == address ? "font-bold" : ""} key={email}>{email}</p> ) }
                                </td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => { setToAddOnPortal(delFromArray(toAddOnPortal, index)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div> }

            {step == STEP.LIST && <div className="button" onClick={() => saveData(toAddOnPortal, toAddOnGoogle, setStep)}>
                {toAddOnGoogle.length + toAddOnPortal.length > 0 ? "Salva e continua" : "Continua"}
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
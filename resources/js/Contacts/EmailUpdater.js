import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import SlowerDown from "./SlowerDown";

const STEP = {
    ERROR: 500,
    COMPARING: 0,
    LIST: 1,
    ADDING_PORTAL: 2,
    ADDING_GOOGLE: 3,
    UPDATING: 4,
    SAVED: 5
}

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

function compareContacts(members, combs, setToAddOnPortal, setToAddOnGoogle, setStep) {
    const toAddOnPortal = []
    const toAddOnGoogle = []

    Object.entries(combs).forEach(([member_id, contact]) => {
        const member = members[member_id];
        const emails_onportal = member.emails.map(email => email.address);
        const emails_ongoogle = contact.emails;


        emails_onportal.forEach(email_onportal => {
            if( !emails_ongoogle.some( s => s.toLowerCase().trim() == email_onportal.toLowerCase().trim() ) ) {
                toAddOnGoogle.push({
                    member: member,
                    contact: contact,
                    address: email_onportal
                })
            }
        })

        emails_ongoogle.forEach(email_ongoogle => {
            if( !emails_onportal.some( s => s.toLowerCase().trim() == email_ongoogle.toLowerCase().trim() ) ) {
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

function updateCombs(toAddOnPortal, toAddOnGoogle, members, combs, setMembers, setCombs, setStep) {
    toAddOnPortal.forEach(({member, contact, address})=> {
        members[member.id].emails.push({address: address, primary: 0});

    })
    toAddOnGoogle.forEach(({member, contact, address})=> {
        combs[member.id].emails.push(address);
    })
    setMembers( { ...members } )
    setCombs( { ...combs } )
    setStep( STEP.SAVED );
}

// This guy is inside Main.js
export default function EmailUpdater({ members, combs, setMembers, setCombs, next }) {
    const [step, setStep] = useState(STEP.COMPARING);
    const [toAddOnPortal, setToAddOnPortal] = useState([]);
    const [toAddOnGoogle, setToAddOnGoogle] = useState([]);

    useEffect(() => compareContacts(members, combs, setToAddOnPortal, setToAddOnGoogle, setStep), []);

    useEffect(() => {
        if( step == STEP.UPDATING ) {
            updateCombs(toAddOnPortal, toAddOnGoogle, members, combs, setMembers, setCombs, setStep);
        }
        if( step == STEP.SAVED ) {
            next();
        }
    }, [step]);

    
    const toAddOnPortal_data = () => toAddOnPortal.map(({ member, address }) => {
        return {
            member_id: member['id'],
            address: address
        }
    });
    const toAddOnGoogle_data = () => toAddOnGoogle.map(({ contact, address }) => {
        return {
            contact: contact['id'],
            address: address
        }
    });

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

            {step == STEP.LIST && <div className="button" onClick={() => setStep(STEP.ADDING_PORTAL)}>
                {toAddOnGoogle.length + toAddOnPortal.length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {(step == STEP.ADDING_PORTAL || step == STEP.ADDING_GOOGLE) && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                { step == STEP.ADDING_PORTAL && <SlowerDown route={'contacts.addOnPortal'} list={toAddOnPortal_data()} setFinish={() => setStep(STEP.ADDING_GOOGLE)} /> }
                { step == STEP.ADDING_GOOGLE && <SlowerDown route={'contacts.addOnGoogle'} list={toAddOnGoogle_data()} setFinish={() => setStep(STEP.UPDATING)} /> }
            </div>}

            {step == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
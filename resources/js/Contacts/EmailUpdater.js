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
    SAVED: 5
}

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

function compareContacts(pairs, setToAddOnPortal, setToAddOnGoogle, setStep) {
    const toAddOnPortal = []
    const toAddOnGoogle = []

    pairs.forEach(({ local, google }, index) => {
        const emails_onportal = local.emails.map(email => email.address);
        const emails_ongoogle = google.emails;

        emails_onportal.forEach(email_onportal => {
            if (!emails_ongoogle.some(s => s.toLowerCase().trim() == email_onportal.toLowerCase().trim())) {
                toAddOnGoogle.push({
                    pair_id: index,
                    address: email_onportal
                })
            }
        })

        emails_ongoogle.forEach(email_ongoogle => {
            if (!emails_onportal.some(s => s.toLowerCase().trim() == email_ongoogle.toLowerCase().trim())) {
                toAddOnPortal.push({
                    pair_id: index,
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
export default function EmailUpdater({ pairs, setPairs, next }) {
    const [step, setStep] = useState(STEP.COMPARING);
    const [toAddOnPortal, setToAddOnPortal] = useState([]);
    const [toAddOnGoogle, setToAddOnGoogle] = useState([]);

    useEffect(() => compareContacts(pairs, setToAddOnPortal, setToAddOnGoogle, setStep), []);


    useEffect(() => {
        if (step == STEP.SAVED) {
            next();
        }
    }, [step]);


    const toAddOnPortal_data = () => toAddOnPortal.map(({ pair_id, address }) => {
        return {
            pair_id: pair_id,
            local_id: pairs[pair_id].local['id'],
            address: address
        }
    });
    const toAddOnPortal_response = (output) => {
        let newPairs = pairs.slice();
        output.forEach(({pair_id,local}) => newPairs[pair_id].local = local );
        setPairs(newPairs);
        setStep(STEP.ADDING_GOOGLE);
    }
    const toAddOnGoogle_data = () => toAddOnGoogle.map(({ pair_id, address }) => {
        return {
            pair_id: pair_id,
            google_id: pairs[pair_id].google['id'],
            address: address
        }
    });
    const toAddOnGoogle_response = (output) => {
        let newPairs = pairs.slice();
        output.forEach(({pair_id,google}) => newPairs[pair_id].google = google );
        setPairs(newPairs);
        setStep(STEP.SAVED);
    }

    return (
        <div className="flex flex-col items-center">

            {step == STEP.LIST && <div className="button" onClick={() => setStep(STEP.SAVED)}>
                {toAddOnGoogle.length + toAddOnPortal.length > 0 ? "Ignora" : "Continua"}
            </div>}

            {/* {step == STEP.LIST && <div className="button" onClick={() => { setToAddOnGoogle([toAddOnGoogle[0]]); setToAddOnPortal([toAddOnPortal[0]])}}>
                {"Test"}
            </div>} */}
        
            {step == STEP.COMPARING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto verificando gli indirizzi mail<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}

            {step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {toAddOnGoogle.length} indirizzi email verranno importati dal portale a Google.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Indirizzi sul portale</th>
                        <th className="px-2">Indirizzi su google</th>
                    </tr>
                    {toAddOnGoogle.map(({ pair_id, address }, index) => {
                        let { local, google } = pairs[pair_id];
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td className="px-2">
                                    {local.emails.map((email,idx) => <p className={email.address == address ? "font-bold" : ""} key={idx}>{email.address}</p>)}
                                </td>
                                <td className="px-2">
                                    {google.emails.map((email,idx) => <p key={idx}>{email}</p>)}
                                </td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => { setToAddOnGoogle(delFromArray(toAddOnGoogle, index)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {toAddOnPortal.length} indirizzi email verranno importati da Google al portale.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Indirizzi sul portale</th>
                        <th className="px-2">Indirizzi su google</th>
                    </tr>
                    {toAddOnPortal.map(({ pair_id, address }, index) => {
                        let { local, google } = pairs[pair_id];
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td className="px-2">
                                    {local.emails.map((email,idx) => <p key={idx}>{email.address}</p>)}
                                </td>
                                <td className="px-2">
                                    {google.emails.map((email,idx) => <p className={email == address ? "font-bold" : ""} key={idx}>{email}</p>)}
                                </td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => { setToAddOnPortal(delFromArray(toAddOnPortal, index)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {step == STEP.LIST && <div className="button" onClick={() => setStep(STEP.ADDING_PORTAL)}>
                {toAddOnGoogle.length + toAddOnPortal.length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {(step == STEP.ADDING_PORTAL || step == STEP.ADDING_GOOGLE) && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                {step == STEP.ADDING_PORTAL && <SlowerDown route={'contacts.addOnPortal'} list={toAddOnPortal_data()} setFinish={toAddOnPortal_response} />}
                {step == STEP.ADDING_GOOGLE && <SlowerDown route={'contacts.addOnGoogle'} list={toAddOnGoogle_data()} setFinish={toAddOnGoogle_response} />}
            </div>}

            {step == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
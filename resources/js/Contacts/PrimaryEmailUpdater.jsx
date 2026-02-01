import { useEffect, useMemo, useState } from "react";
import Backdrop from "../Layout/Backdrop";
import { noninertiaPostRequest, postRequest } from "../Utils";
import { faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const STEP = {
    ERROR: 500,
    COMPARING: 0,
    LIST: 1,
    SAVED: 4
}

function compareContacts(pairs, setDifferences, setStep) {
    const differences = []

    pairs.forEach(({ local, google }) => {
        const emails_onportal = local.emails.map(email => email.address);
        const emails_ongoogle = google.emails;

        if (emails_onportal.length * emails_ongoogle.length == 0) return;
        if (emails_ongoogle[0] == emails_onportal[0]) return;

        // First email is different! Should change
        difference = { local: local, google: google };

        difference.first_onportal_is_ongoogle = emails_ongoogle.findIndex(s => s == emails_onportal[0]);

        difference.first_ongoogle_is_onportal = emails_onportal.findIndex(s => s == emails_ongoogle[0]);

        if (difference.first_onportal_is_ongoogle + difference.first_ongoogle_is_onportal > -2)
            differences.push(difference);
    })

    setDifferences(differences);
    setStep(STEP.LIST);
}

function priorOnPortal(email, setProcessing, onSuccess) {
    noninertiaPostRequest(
        'contacts.priorOnPortal',
        { email: email },
        setProcessing,
        {},
        onSuccess
    )
}

function priorOnGoogle(email, resId, setProcessing, onSuccess) {
    noninertiaPostRequest(
        'contacts.priorOnGoogle',
        { email: email, resId: resId },
        setProcessing,
        {},
        onSuccess
    )
}

// This guy is inside Main.js
export default function PrimaryEmailUpdater({ pairs, next }) {
    const [step, setStep] = useState(STEP.COMPARING);
    const [differences, setDifferences] = useState([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => compareContacts(pairs, setDifferences, setStep), []);

    useEffect(() => {
        if (step == STEP.SAVED) {
            next();
        }
    }, [step]);

    return (
        <div className="flex flex-col items-center">
            {step == STEP.COMPARING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto verificando l'ordine degli indirizzi mail<br />
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>}

            {step == STEP.LIST && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {differences.length} contatti hanno l'indirizzo prioritario diverso tra portale e google.<br />
                <table><tbody>
                    <tr>
                        <th className="px-2">Nome</th>
                        <th className="px-2">Indirizzi sul portale</th>
                        <th className="px-2">Indirizzi su google</th>
                    </tr>
                    {differences.map(({ local, google, first_onportal_is_ongoogle, first_ongoogle_is_onportal }, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td className="px-2">
                                    {local.emails.map((email, idx) => <p className={idx == 0 ? "font-bold" : ""} key={idx}>{email.address}</p>)}
                                    {first_onportal_is_ongoogle > -1 && <div className="button justify-self-center" onClick={() => priorOnGoogle(local.emails[0].address, google['id'], setProcessing, () => setDifferences(differences.toSpliced(index, 1)))} ><FontAwesomeIcon icon={faAnglesRight} /></div>}
                                </td>
                                <td className="px-2">
                                    {google.emails.map((email, idx) => <p className={idx == 0 ? "font-bold" : ""} key={email}>{email}</p>)}
                                    {first_ongoogle_is_onportal > -1 && <div className="button justify-self-center" onClick={() => priorOnPortal(google.emails[0], setProcessing, () => setDifferences(differences.toSpliced(index, 1)))} ><FontAwesomeIcon icon={faAnglesLeft} /></div>}
                                </td>
                            </tr>
                        )
                    })}
                </tbody></table>
            </div>}

            {step == STEP.LIST && <div className="button" onClick={() => setStep(STEP.SAVED)}>
                {differences.length > 0 ? "Ignora e continua" : "Continua"}
            </div>}

            {step == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}

            <Backdrop open={processing} />
        </div>
    );
}
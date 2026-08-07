

import { useEffect, useMemo, useState } from "react";
import SlowerDown from "./SlowerDown";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const STEP = {
    ERROR: 500,
    LIST: 0,
    SAVING: 1,
    SAVED: 2
}

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

// This guy is inside Main.js
export default function ContactsCreator({ localOrphans, appendToPairs, next }) {
    const [step, setStep] = useState(STEP.LIST);

    const [toCreate, setToCreate] = useState(localOrphans);

    useEffect(() => {
        if (localOrphans.length == 0) setStep(STEP.SAVED); // If nothing to create, the step is skipped
    }, []) // List of members to create is initialized at the beginning

    useEffect(() => {
        if (step == STEP.SAVED) {
            next();
        }
    }, [step]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Verranno creati <b>{localOrphans.length}</b> nuovi contatti.<br />
                {step == STEP.LIST && <div className="button" onClick={() => next()}>
                    Non creare nulla di nuovo
                </div>}
                {step == STEP.LIST && <table><tbody>
                    <tr>
                        <th className="px-2">Nome sul portale</th>
                        <th className="px-2">Nome su Gmail</th>
                    </tr>
                    {toCreate.map((local, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={index}>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td className="px-2">{local['name']} {local['surname']}</td>
                                <td><FontAwesomeIcon icon={faTrash} className="icon-button" onClick={() => { setToCreate(delFromArray(toCreate, index)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table>}
            </div>

            {step == STEP.LIST && <div className="button" onClick={() => setStep(STEP.SAVING)}>
                {toCreate.length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {step == STEP.SAVING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                <SlowerDown route={'contacts.create'} list={toCreate.map(l => l['id'])} setFinish={(output) => {
                    appendToPairs(output.map(out => [
                        toCreate.find((ctc) => ctc['id'] == out['member_id']),
                        out
                    ]));
                    setStep(STEP.SAVED);
                }} />
            </div>}

            {step == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
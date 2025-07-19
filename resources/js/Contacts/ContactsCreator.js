import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import SlowerDown from "./SlowerDown";

const STEP = {
    ERROR: 500,
    LIST: 0,
    SAVING: 1,
    SAVED: 2
}

function delFromObject(obj, key) {
    const newobj = { ...obj };
    delete newobj[key];
    return newobj;
}

// This guy is inside Main.js
export default function ContactsCreator({ members, combs, setCombs, next }) {
    const [step, setStep] = useState(STEP.LIST);

    const [membersToCreate, setMembersToCreate] = useState([]);

    useEffect(() => {
        let mtc = Object.fromEntries(Object.values(members).filter(member => !(member['id'] in combs)).map(member => [member['id'], member]));
        setMembersToCreate( mtc );
        if( Object.keys(mtc).length == 0 ) next(); // If nothing to create, the step is skipped
    }, []) // List of members to create is initialized at the beginning

    useEffect(() => {
        if( step == STEP.SAVED ) {
            next();
        }
    }, [step]);

    const parseResult = (output) => {
        setCombs( { ...combs, ...Object.fromEntries( output.map( o => [ o['member_id'], o ] ) ) } );
        console.log( { ...combs, ...Object.fromEntries( output.map( o => [ o['member_id'], o ] ) ) } )
        setStep(STEP.SAVED);
    }

    return (
        <div className="flex flex-col items-center">
            <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Verranno creati <b>{Object.keys(membersToCreate).length}</b> nuovi contatti.<br />
                {step == STEP.LIST && <div className="button" onClick={() => setMembersToCreate({})}>
                    Non creare nulla di nuovo
                </div> }
                {step == STEP.LIST && <table><tbody>
                    <tr>
                        <th className="px-2">Nome sul portale</th>
                        <th className="px-2">Nome nella rubrica</th>
                    </tr>
                    {Object.keys(membersToCreate).map((member_id, index) => {
                        return (
                            <tr className={index % 2 == 0 ? "bg-gray-100" : ""} key={member_id}>
                                <td className="px-2">{membersToCreate[member_id]['name']} {membersToCreate[member_id]['surname']}</td>
                                <td className="px-2">{membersToCreate[member_id]['name']} {membersToCreate[member_id]['surname']}</td>
                                <td><FontAwesomeIcon icon={solid('trash')} className="icon-button" onClick={() => { setMembersToCreate(delFromObject(membersToCreate, member_id)); }} /></td>
                            </tr>
                        )
                    })}
                </tbody></table> }
            </div>

            {step == STEP.LIST && <div className="button" onClick={() => setStep(STEP.SAVING)}>
                {Object.keys(membersToCreate).length > 0 ? "Salva e continua" : "Continua"}
            </div>}


            {step == STEP.SAVING && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                Sto salvando...<br />
                <SlowerDown route={'contacts.create'} list={Object.keys(membersToCreate)} setFinish={parseResult} />
            </div>}

            {step == STEP.ERROR && <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                C'è stato un errore, ricarica la pagina per favore.
            </div>}
        </div>
    );
}
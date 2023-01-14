import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/inertia-react";
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import { AlumnusStatus, postRequest, romanize } from "../Utils";
import Dialog from "../Layout/Dialog";

function ratDelete(rat, setProcessing) {
    postRequest(
        'ratifications.delete',
        {},
        setProcessing,
        { rat: rat.id },
        false, false
    );
}

export default function List() {
    const rats = usePage().props.rats
    const [toDelete, setToDelete] = useState(null);
    const [processing, setProcessing] = useState(false);

    return (
        <div className="main-container">
            <div className="w-full flex flex-row justify-end gap-2">
                { usePage().props.canAdd && <Link className="button" href={route('ratifications.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link> }
                <a className="button" href={route('ratifications.export')}>
                    <FontAwesomeIcon icon={solid('download')} />
                    Esporta
                </a>
            </div>
            <div className="w-full flex flex-col justify-start">
                <h3>Ratifiche presenti</h3>
                {Object.keys(rats).map(r =>
                    <div className="mt-4">
                        <span>Per il passaggio a <b>{AlumnusStatus.status[r].label}</b></span>
                        <ul className="list-disc list-inside">
                            {console.log(Object.values(rats[r]))}
                            {Object.values(rats[r]).map(a =>
                                <li>
                                    {a.alumnus.surname} {a.alumnus.name} <span className="text-gray-400">{romanize(a.alumnus.coorte)}{a.alumnus.coorte != 0 && " coorte"}</span>
                                    <span className="icon-button-gray mx-2" onClick={() => setToDelete(a)}>
                                        <FontAwesomeIcon icon={solid('trash')} />
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
            <Dialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={() => { setToDelete(null); ratDelete(toDelete, setProcessing) }}>
                Sei sicuro di voler eliminare la richiesta di ratifica di {toDelete && toDelete.alumnus.surname + " " + toDelete.alumnus.name} al ruolo di {toDelete && AlumnusStatus.status[toDelete.required_state].label}?
            </Dialog>
            <Backdrop open={processing} />
        </div>
    );
}
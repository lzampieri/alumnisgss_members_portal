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
    const open_rats = usePage().props.open_rats
    const closed_rats = usePage().props.closed_rats
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
                <h3>Ratifiche in attesa</h3>
                {Object.keys(open_rats).map(r =>
                    <div className="mt-4" key={r}>
                        <span>Per il passaggio a <b>{AlumnusStatus.status[r].label}</b></span>
                        <ul className="list-disc list-inside">
                            {Object.values(open_rats[r]).map(a =>
                                <li key={a.id}>
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
            <div className="w-full flex flex-col justify-start mt-8">
                <h3>Ratifiche già approvate</h3>
                {Object.keys(closed_rats).map(r =>
                    <div className="mt-4" key={r}>
                        <span>Per il passaggio a <b>{AlumnusStatus.status[r].label}</b></span>
                        <ul className="list-disc list-inside">
                            {Object.values(closed_rats[r]).map(a =>
                                <li key={a.id}>
                                    {a.alumnus.surname} {a.alumnus.name} <span className="text-gray-400">{romanize(a.alumnus.coorte)}{a.alumnus.coorte != 0 && " coorte"}</span> Approvata in data {new Date(a.document.date).toLocaleDateString('it-IT', { 'dateStyle': 'long' })} - <a href={route('board.view', { document: a.document.id })}>{ a.document.identifier }</a>
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
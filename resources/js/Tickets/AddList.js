

import { faCircleLeft, faRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Head, Link, usePage } from "@inertiajs/react";


export default function AddList() {
    const availableTypes = usePage().props.availableTypes;

    return <div className="main-container">
        <Head title="Nuovo ticket" />
        <Link className="button self-start" href={route('helpdesk')}>
            <FontAwesomeIcon icon={faCircleLeft} className="pr-2" />
            Indietro
        </Link>
        <h3 className="my-3">Aggiungi richiesta</h3>
        {availableTypes.map((type) =>
            <Link key={type.key} className="w-full flex flex-row-reverse items-center bg-gray-50 border-gray-400 border py-2 px-4 rounded-first-last group no-underline" href={route('ticket.add', { type: type.key })}>
                <FontAwesomeIcon icon={faRightLong} className="text-4xl !p-4 icon-button" />
                <span className="grow">{type.name}</span>
            </Link>
        )}
    </div>
}
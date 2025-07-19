import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";


export default function AddList() {
    const availableTypes = usePage().props.availableTypes;
    // console.log( availableTypes );

    return <div className="main-container">
        <Link className="button self-start" href={route('helpdesk')}>
            <FontAwesomeIcon icon={solid('circle-left')} className="pr-2" />
            Indietro
        </Link>
        <h3 className="my-3">Aggiungi richiesta</h3>
        {availableTypes.map((type) =>
            <Link key={type.key} className="w-full flex flex-row-reverse items-center bg-gray-50 border-gray-400 border py-2 px-4 rounded-first-last group no-underline" href={route('ticket.add', { type: type.key })}>
                <FontAwesomeIcon icon={solid('right-long')} className="text-4xl !p-4 icon-button" />
                <span className="grow">{type.name}</span>
            </Link>
        )}
    </div>
}
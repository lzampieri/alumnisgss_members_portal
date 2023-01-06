import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/inertia-react";
import { Documents } from "../Utils";

function DocumentItem(document) {

    return (
        <div key={document.id} className="mylist-item flex flex-row p-2 items-center gap-2">
            <div className="grow flex flex-col">
                <span className="text-gray-500 text-sm">{new Date(document.date).toLocaleDateString('it-IT',{'dateStyle':'long'})} - Protocollo web {document.handle}</span>
                <span className="text-xl font-bold">{document.identifier}</span>
                <span className="text-sm">Visibilità: { Documents.names[document.privacy] || document.privacy } {document.note && " - Nota: " + document.note }</span>
                <span className="text-gray-500 text-sm">Caricato il {new Date(document.created_at).toLocaleDateString('it-IT',{'dateStyle':'long'})} da {document.author.email}</span>
            </div>
            <a href={ route('board.view',{document: document.id} ) } className="">
                <FontAwesomeIcon icon={solid('file-pdf')} className="text-4xl !p-4 icon-button" />
            </a>
        </div>
    )
}

export default function List() {
    const documents = usePage().props.documents
    const total = usePage().props.total

    return (
        <div className="main-container">
            { usePage().props.canUpload && <div className="w-full flex flex-row justify-end">
                <Link className="button" href={route('board.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
            </div> }
            <span className="text-sm">{ documents.length } documenti visualizzati su { total } totali.</span>
            <div className="w-full flex flex-col items-stretch mt-4">
                {documents.map(document => DocumentItem(document))}
            </div>
        </div>
    );
}
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/react";
import { Documents } from "../Utils";

function DocumentItem(document, canEdit, isAttachment = false) {
    let date = new Date(document.date);

    return (
        <div key={document.id}
            className={isAttachment ? "mylist-subitem" : "mylist-item"}
        >
            <div className="flex flex-col md:flex-row items-center gap-2">
                {!isAttachment &&
                    <div className="flex flex-col items-center mr-4">
                        <span className="text-3xl font-bold">
                            {date.toLocaleDateString('it-IT', { 'day': '2-digit' })}.
                            {date.toLocaleDateString('it-IT', { 'month': '2-digit' })}
                        </span>
                        <span className="font-bold">
                            {date.toLocaleDateString('it-IT', { 'year': 'numeric' })}
                        </span>
                    </div>
                }
                <div className="grow flex flex-col">
                    <span className="text-gray-500 text-sm">Protocollo web {document.protocol}</span>
                    <span className="text-xl font-bold">{document.identifier}</span>
                    <span className="text-sm">Visibilità:
                        {" " + document.dynamic_permissions.map(dp => dp.role.common_name).join(", ")}
                        {document.note && " - Nota: " + document.note}
                    </span>
                    <span className="text-gray-500 text-sm">Caricato il {new Date(document.created_at).toLocaleDateString('it-IT', { 'dateStyle': 'long' })} da {document.author.name} {document.author.surname}</span>
                </div>
                {document.canView && canEdit && <Link href={route('board.edit', { document: document.id })} className="">
                    <FontAwesomeIcon icon={solid('pen')} className="text-4xl !p-4 icon-button" />
                </Link>}
                {document.canView && <a href={route('board.view_document', { protocol: document.protocol })} className="">
                    <FontAwesomeIcon icon={solid('file-pdf')} className="text-4xl !p-4 icon-button" />
                </a>}
            </div>
            {document.attachments && document.attachments.map(document => DocumentItem(document, canEdit, true))}
        </div>
    )
}

export default function List() {
    const documents = usePage().props.documents
    const canEdit = usePage().props.canEdit

    return (
        <div className="main-container">
            {usePage().props.canUpload && <div className="w-full flex flex-row justify-end">
                <Link className="button" href={route('board.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
            </div>}
            <span className="text-sm">{documents.length} document{documents.length == 1 ? 'o' : 'i'} visualizzabili coi correnti permessi.</span>
            <div className="w-full flex flex-col items-stretch mt-4">
                {documents.map(document => DocumentItem(document, canEdit))}
            </div>
        </div>
    );
}
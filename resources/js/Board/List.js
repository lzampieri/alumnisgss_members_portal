import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/inertia-react";

function DocumentItem(document) {

    return (
        <div key={document.id} className="mylist-item flex flex-row p-2 items-center gap-2">
            Contenuto...
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
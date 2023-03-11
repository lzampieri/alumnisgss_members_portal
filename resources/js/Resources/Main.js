import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Link, usePage } from "@inertiajs/inertia-react";
import { Documents } from "../Utils";
import ResponsiveDrawer from "../Layout/ResponsiveDrawer";

// function DocumentItem(document, canEdit) {
//     let date = new Date(document.date);

//     return (
//         <div key={document.id} className="mylist-item flex flex-col md:flex-row p-2 items-center gap-2">
//             <div className="flex flex-col items-center mr-4">
//                 <span className="text-3xl font-bold">
//                     {date.toLocaleDateString('it-IT', {'day': '2-digit'})}.
//                     {date.toLocaleDateString('it-IT', {'month': '2-digit'})}
//                 </span>
//                 <span className="font-bold">
//                     {date.toLocaleDateString('it-IT', { 'year': 'numeric' })}
//                 </span>
//             </div>
//             <div className="grow flex flex-col">
//                 <span className="text-gray-500 text-sm">Protocollo web {document.handle}</span>
//                 <span className="text-xl font-bold">{document.identifier}</span>
//                 <span className="text-sm">Visibilità: {Documents.names[document.privacy] || document.privacy} {document.note && " - Nota: " + document.note}</span>
//                 <span className="text-gray-500 text-sm">Caricato il {new Date(document.created_at).toLocaleDateString('it-IT', { 'dateStyle': 'long' })} da {document.author.name} {document.author.surname}</span>
//             </div>
//             {canEdit && <Link href={route('board.edit', { document: document.id })} className="">
//                 <FontAwesomeIcon icon={solid('pen')} className="text-4xl !p-4 icon-button" />
//             </Link>}
//             <a href={route('board.view_document', { protocol: document.protocol })} className="">
//                 <FontAwesomeIcon icon={solid('file-pdf')} className="text-4xl !p-4 icon-button" />
//             </a>
//         </div>
//     )
// }

export default function Main() {
    const sections = usePage().props.sections
    const section = usePage().props.section

    return (
        <div className="flex flex-row w-full md:w-4/5">
            <ResponsiveDrawer buttonTitle={ section ? section.title : "Sezioni" } initialState={ !section }>
                <ResponsiveDrawer.Drawer>
                    { sections.map( sec =>
                        <Link
                            className={ 
                                "border border-black rounded-first-last p-2 cursor-pointer " +
                                (
                                    section?.name == sec.name  
                                    ? "bg-primary-main text-primary-contrast"
                                    : "bg-white text-black hover:text-primary-contrast hover:bg-primary-main"
                                ) } 
                            href={ route('resources',{ 'section': sec.name } ) }
                            as="div"
                            >
                            { sec.title }
                        </Link>
                    )}
                </ResponsiveDrawer.Drawer>
                <div>
                    { section ? section.title : "contenutissimo 1" }
                </div>
                <div>
                    contenutissimo 3
                </div>
            </ResponsiveDrawer>
        </div>
    );
}
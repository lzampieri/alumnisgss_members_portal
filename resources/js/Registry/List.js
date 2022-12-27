import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/inertia-react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import ListTemplate from "./ListTemplate";

function AlumnusLink(alumnus) {
    return (
        <div className="mylist-item flex flex-row p-2">
            <span style={{ color: AlumnusStatus.colors[alumnus.status] }} className="pr-2 group relative z-auto">
                <div className="chip" style={ bgAndContrast( AlumnusStatus.colors[ alumnus.status ] ) }>
                    { AlumnusStatus.acronym[ alumnus.status ]}
                </div>
                <span className="tooltip-right">
                    {AlumnusStatus.names[alumnus.status]}
                </span>
            </span>
            {alumnus.surname} {alumnus.name}
            <div className="chip">{romanize(alumnus.coorte)}</div>
            <div className="grow"></div>
            <Link className="icon-button" href={route('registry.edit', { alumnus: alumnus.id })}><FontAwesomeIcon icon={solid('pen')} /></Link>
        </div>
    )
}

export default function List() {
    const alumni = usePage().props.alumni

    return (
        <div className="main-container">
            <div className="w-full flex flex-row justify-end">
                <Link className="button" href={route('registry.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
                {usePage().props.canImport &&
                    <Link className="button" href={route('registry.bulk')}>
                        <FontAwesomeIcon icon={solid('folder-plus')} />
                        Importa
                    </Link>
                }
            </div>
            <ListTemplate
                data={ alumni }
                itemFunction={ AlumnusLink } />
        </div>
    );
}
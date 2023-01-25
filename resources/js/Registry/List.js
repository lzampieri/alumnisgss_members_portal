import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/inertia-react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import ListTemplate from "./ListTemplate";

function AlumnusLink(alumnus) {
    return (
        <div className="mylist-item flex flex-row p-2">
            <span style={{ color: AlumnusStatus.status[alumnus.status].color }} className="pr-2 group relative z-auto">
                <div className="chip" style={bgAndContrast(AlumnusStatus.status[alumnus.status].color)}>
                    {AlumnusStatus.status[alumnus.status].acronym}
                </div>
                <span className="tooltip-right">
                    {AlumnusStatus.status[alumnus.status].label}
                </span>
            </span>
            {!!alumnus.ratifications_count && <span className="pr-2 group relative z-auto">
                <FontAwesomeIcon icon={solid('hourglass-half')} />
                <span className="tooltip-right">
                    In attesa di ratifica
                </span>
            </span>}
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
            <div className="w-full flex flex-row justify-end gap-2">
                <Link className="button" href={route('registry.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
                {usePage().props.canEditBulk &&
                    <Link className="button" href={route('registry.bulk.import')}>
                        <FontAwesomeIcon icon={solid('folder-plus')} />
                        Importa
                    </Link>
                }
                <div className="dropdown-parent group" >
                    <div className="button">
                        <FontAwesomeIcon icon={solid('download')} />
                        Esporta
                    </div>
                    <div className="dropdown-content-flex flex-col gap-2">
                        <a className="button" href={route('registry.bulk.export.csv')}>
                            CSV
                        </a>
                        <a className="button" href={route('registry.bulk.export.xls')}>
                            Excel
                        </a>
                    </div>
                </div >
                {usePage().props.canEditBulk &&
                    <a className="button" href={route('registry.bulk.edit')}>
                        <FontAwesomeIcon icon={solid('file-pen')} />
                        Modifica
                    </a>
                }
            </div>
            <ListTemplate
                data={alumni}
                itemFunction={AlumnusLink} />
        </div>
    );
}
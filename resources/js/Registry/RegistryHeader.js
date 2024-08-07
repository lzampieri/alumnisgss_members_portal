import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";


export default function RegistryHeader({ where, quickFilter, setQuickFilter }) {
    return <div className="w-full flex flex-col justify-stretch md:flex-row md:justify-end gap-2">
        <div className="flex flex-row content-stretch gap-2">
            <Link
                className={"button grow text-center" + (where == 'schema' ? " button-active" : "")}
                href={route('registry.schema')}
            >Schema</Link>
            <Link
                className={"button grow text-center" + (where == 'table' ? " button-active" : "")}
                href={route('registry.table')}
            >Tabella</Link>
        </div>
        <div className='grow'>
            <input type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' className='w-full' />
        </div>
        <div className="flex flex-row content-stretch gap-2">
            <Link className="button grow" href={route('registry.add')}>
                <FontAwesomeIcon icon={solid('circle-plus')} />
                Aggiungi
            </Link>
            <div className="dropdown-parent group grow" >
                <div className="button">
                    <FontAwesomeIcon icon={solid('download')} />
                    Esporta
                </div>
                <div className="dropdown-content-flex flex-col gap-2">
                    <a className="button" href={route('registry.impexp.export.xls_schema')}>
                        Excel - schema
                    </a>
                    <a className="button" href={route('registry.impexp.export.xls_details')}>
                        Excel - dettagli
                    </a>
                </div>
            </div >
            {usePage().props.canImport &&
                <Link className="button grow" href={route('registry.impexp.import.xls_details')}>
                    <FontAwesomeIcon icon={solid('folder-plus')} />
                    Importa
                </Link>
            }
        </div>
    </div>
}
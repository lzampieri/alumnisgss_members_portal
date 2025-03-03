import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
import { SideDrawerLeft } from "../Layout/SideDrawer";
import { useState } from "react";


export default function RegistryHeader({ where, quickFilter, setQuickFilter }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

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
        <div className="button" onClick={() => setDrawerOpen(!drawerOpen)}>
            <FontAwesomeIcon icon={solid('bars')} />
            Azioni
        </div>
        <SideDrawerLeft isOpen={drawerOpen} setIsOpen={setDrawerOpen}>
            <div className="flex flex-col content-stretch gap-2">
                <div className="button grow">
                    <FontAwesomeIcon icon={solid('folder-tree')} />
                    Aggiungi
                </div>
                <Link className="button ml-9" href={route('registry.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Uno
                </Link>
                <Link className="button ml-9" href={route('registry.addBulk')}>
                    <FontAwesomeIcon icon={solid('folder-plus')} />
                    Tanti
                </Link>
                <Link className="button grow" href={route('ratifications.add')}>
                    <FontAwesomeIcon icon={solid('right-left')} />
                    Cambia stati
                </Link>
                <Link className="button grow" href={route('registry.checks')}>
                    <FontAwesomeIcon icon={solid('list-check')} />
                    Verifica integrità
                </Link>
                <div className="button">
                    <FontAwesomeIcon icon={solid('folder-tree')} />
                    Esporta
                </div>
                <a className="button ml-9" href={route('registry.impexp.export.xls_schema')}>
                    <FontAwesomeIcon icon={solid('download')} />
                    Excel - schema
                </a>
                <a className="button ml-9" href={route('registry.impexp.export.xls_details')}>
                    <FontAwesomeIcon icon={solid('download')} />
                    Excel - dettagli
                </a>
                {usePage().props.canImport &&
                    <Link className="button grow" href={route('registry.impexp.import.xls_details')}>
                        <FontAwesomeIcon icon={solid('folder-plus')} />
                        Importa
                    </Link>
                }
            </div>
        </SideDrawerLeft>
    </div >
}
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@inertiajs/inertia-react";


export default function List() {
    // const alumni = usePage().props.alumni

    return (
        <div className="main-container">
            <div className="w-full flex flex-row justify-end">
                <Link className="button" href={route('ratifications.add')}>
                    <FontAwesomeIcon icon={solid('circle-plus')} />
                    Aggiungi
                </Link>
                {/* {usePage().props.canImport &&
                    <Link className="button" href={route('registry.bulk.import')}>
                        <FontAwesomeIcon icon={solid('folder-plus')} />
                        Importa
                    </Link>
                } */}
                {/* {usePage().props.canImport &&
                    <a className="button" href={route('registry.bulk.export')}>
                        <FontAwesomeIcon icon={solid('download')} />
                        Esporta
                    </a>
                } */}
            </div>
            {/* <ListTemplate
                data={alumni}
                itemFunction={AlumnusLink} /> */}
        </div>
    );
}
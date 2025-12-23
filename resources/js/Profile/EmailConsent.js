import { Head, Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, postRequest, romanize } from "../Utils";


import { Fragment, useState } from "react";
import ADetailsType from "../Network/ADetailsType";
import SmartChip from "../Network/SmartChip";
import Backdrop from "../Layout/Backdrop";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function EmailConsent() {
    const alumnus = usePage().props.alumnus;

    const [processing, setProcessing] = useState(false);

    return (
        <div className="flex flex-col w-full md:w-3/5 items-start gap-2">
            <Head title="Il mio profilo" />

            <h3>{alumnus.name} {alumnus.surname}</h3>
            <div className="font-bold text-primary-main mt-4">Consenso alla diffusione degli indirizzi mail</div>
            <div className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={faCircleInfo} className="ml-2 mr-1" />
                Se accetti che i tuoi indirizzi mail vengano condivisi con tutti i soci, saranno disponibili su questo stesso portale per soci e soci studenti, alla <Link href={route('network')}>pagina dedicata</Link>.
            </div>
            <div className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={faCircleInfo} className="ml-2 mr-1" />
                Altrimenti, gli indirizzi rimarranno a sola consultazione dello staff di segreteria e di chi si occupa del networking associativo.
            </div>

            <label>Consenso alla condivisione degli indirizzi mail</label>
            {alumnus.consent_to_email_share ?
                <SmartChip content="Visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                <SmartChip content="Visibili solo allo staff" style={bgAndContrastPastel(2)} />
            }

            <div className="button" onClick={() => postRequest('profile.email_consent', {}, setProcessing)}>
                Cambia in {!alumnus.consent_to_email_share ?
                    <SmartChip content="Visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                    <SmartChip content="Visibili solo allo staff" style={bgAndContrastPastel(2)} />
                }
            </div>

            <Backdrop open={processing} />
        </div>

    );
}
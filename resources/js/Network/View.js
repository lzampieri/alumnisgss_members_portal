import { Head, Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, postRequest, romanize } from "../Utils";


import { Fragment, useState } from "react";
import ADetailsType from "./ADetailsType";
import SmartChip from "./SmartChip";
import Backdrop from "../Layout/Backdrop";
import { Collapse } from "react-collapse";
import { faAt, faChevronLeft, faCircleInfo, faCircleQuestion, faPenToSquare, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function adtRenderer(ad, adt, i) {

    if (!ad || ad.value.length == 0)
        return
    if (adt && adt.type in ADetailsType.values)
        return ADetailsType.values[adt.type].chip(ad, adt, i)
    else
        return ad.value.map((entry, j) => <SmartChip
            content={entry}
            key={ad.id + "|" + j}
            style={bgAndContrastPastel(adt.id)} />
        )
}

function EmailDiv({ e, isFirst }) {
    return <div>
        <FontAwesomeIcon icon={faAt} className="mr-2" />
        {isFirst && <FontAwesomeIcon icon={faStar} className="mr-2 text-[#f5b700]" /> }
        {e.address}
    </div>
}

function InfoBtn({ children }) {
    const [open, setOpen] = useState(false);
    return <>
        <button className={(open ? "text-gray-800" : "text-gray-400") + " hover:text-primary-main"} onClick={() => setOpen(!open)}>
            <FontAwesomeIcon icon={faCircleQuestion} className="ml-2" />
        </button>
        <Collapse theme={{ collapse: "w-full cpm font-light text-gray-400 text-sm text-justify" }} isOpened={open}>
            <FontAwesomeIcon icon={faCircleInfo} className="ml-2 mr-1" />
            {children}
        </Collapse>
    </>
}

export default function View() {
    const alumnus = usePage().props.alumnus;
    const itsme = usePage().props.itsme;

    return (
        <div className="flex flex-col w-full md:w-3/5 items-start gap-2">
            <Head title={alumnus.name + " " + alumnus.surname} />
            <div className="flex flex-row justify-start w-full">
                <div className="button flex flex-row items-center self-start mb-4" onClick={() => window.history.back()} >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Indietro
                </div>
            </div>
            <h3>{alumnus.name} {alumnus.surname}</h3>
            <div className="flex flex-row w-full flex-wrap">
                <div className="chip group relative z-auto" style={bgAndContrast('6b7280')} key='coorte'>
                    {romanize(alumnus.coorte)} coorte
                </div>

                <div className="chip group relative z-auto" style={bgAndContrast(AlumnusStatus.status[alumnus.status].color)}>
                    {AlumnusStatus.status[alumnus.status].label}
                </div>

                { itsme && <div className="w-full flex flex-row mt-2">
                    <Link className="chip-button" href={route('profile')}>
                        Modifica il tuo profilo
                        <FontAwesomeIcon icon={faPenToSquare} className="ml-2" />
                    </Link>
                </div> }
            </div>

            <div className="font-bold text-primary-main mt-4">Contatti</div>
            {alumnus.visible_emails.map((e, i) => <EmailDiv
                key={e.id} isFirst={i == 0} e={e}
            />)}
            { !alumnus.consent_to_email_share && <label className="error">Questo socio ha disabilitato la condivisione diretta degli indirizzi email. Contattaci per avere i suoi contatti!</label>}



            <div className="font-bold text-primary-main mt-4">Dettagli</div>
            { !alumnus.consent_to_network_share && <label className="error">Questo socio ha disabilitato la condivisione diretta degli indirizzi email. Contattaci per avere i suoi contatti!</label>}

            {
                alumnus.filtered_details.map((adt, i) => adt.value.length > 0 && <Fragment key={adt.id}>
                    <label key={"label_" + adt.id}>{adt.a_details_type.name}</label>
                    {adtRenderer(adt, adt.a_details_type, i)}
                </Fragment>)
            }

        </div>

    );
}
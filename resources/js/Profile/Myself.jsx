import { Head, Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, postRequest, romanize } from "../Utils";


import { Fragment, useState } from "react";
import ADetailsType from "../Network/ADetailsType";
import SmartChip from "../Network/SmartChip";
import EmptyDialog from "../Layout/EmptyDialog";
import ManuallyAddEmail from "./ManuallyAddEmail";
import Backdrop from "../Layout/Backdrop";
import { Collapse } from "react-collapse";
import { faAt, faCircleInfo, faCircleQuestion, faPenToSquare, faStar } from "@fortawesome/free-solid-svg-icons";
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

function EmailDiv({ e, isFirst, setPrimary, deleteAddress }) {
    return <div>
        <FontAwesomeIcon icon={faAt} className="mr-2" />
        {isFirst ? <FontAwesomeIcon icon={faStar} className="mr-2 text-[#f5b700]" />
            : <FontAwesomeIcon icon={faStar} className="mr-2 text-gray-200 hover:text-[#f5b700] cursor-pointer" onClick={() => setPrimary(e.id)} />}
        {e.address}
        {e.last_login && <span className="text-gray-400 ml-2">Ultimo accesso {new Date(e.last_login).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>}
    </div>
}

function emailPrimary(emailId, setProcessing) {
    postRequest(
        'profile.set_primary',
        { id: emailId },
        setProcessing,
        {},
        false, false
    );
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

export default function Myself() {
    const alumnus = usePage().props.alumnus;
    const adts = usePage().props.adts;

    const [processing, setProcessing] = useState(false);

    let roles = alumnus.roles.filter((e, i, self) => i === self.findIndex((ee) => ee.id === e.id));

    return (
        <div className="flex flex-col w-full md:w-3/5 items-start gap-2">
            <Head title="Il mio profilo" />
            <h3>{alumnus.name} {alumnus.surname}</h3>
            <div className="flex flex-row w-full flex-wrap">
                <div className="chip group relative z-auto" style={bgAndContrast('6b7280')} key='coorte'>
                    {romanize(alumnus.coorte)} coorte
                </div>

                <div className="chip group relative z-auto" style={bgAndContrast(AlumnusStatus.status[alumnus.status].color)}>
                    {AlumnusStatus.status[alumnus.status].label}
                </div>

                {alumnus.tags?.map(i =>
                    <div className="chip group relative z-auto" style={bgAndContrast('#1f77b4')} key={i}>
                        {i}
                    </div>)}

                <div className="w-full flex flex-row mt-2">
                    <Link className="chip-button" href={route('ticket.add', { type: 'ProfileEdit' })}>
                        Segnala errore
                        <FontAwesomeIcon icon={faPenToSquare} className="ml-2" />
                    </Link>
                </div>
            </div>

            <div className="font-bold text-primary-main mt-4">Indirizzi mail
                <InfoBtn>
                    Utilizza la stellina per definire l'indirizzo di preferenza, al quale verrai contattato dall'associazione. Utilizza il "+" per aggiungere un nuovo indirizzo email. Non è possibile cancellare un indirizzo da questa pagina; se vi sono indirizzi errati da cancellare, <Link href={route('ticket.add', { type: 'ProfileEdit' })}> segnalacelo!</Link>
                </InfoBtn>
            </div>
            {alumnus.visible_emails.map((e, i) => <EmailDiv
                key={e.id} isFirst={i == 0} e={e}
                setPrimary={(id) => emailPrimary(id, setProcessing)}
                deleteAddress={(id) => emailDelete(id, setProcessing)}
            />)}
            <ManuallyAddEmail />


            {adts.length > 0 && <>
                {/* Email address consensus is meaningful only if the guy have networking powers, and therefore only if adts are there */}
                <label>Consenso alla condivisione degli indirizzi email <InfoBtn>
                    <b>Chi vede questi indirizzi email? </b>Lo scegli tu! Se accetti che i tuoi indirizzi email vengano condivisi con tutti i soci, saranno disponibili su questo stesso portale per soci e soci studenti, nella sezione dedicata al networking; altrimenti, rimarranno a sola consultazione dello staff di segreteria e di chi si occupa del networking associativo.
                </InfoBtn></label>
                <div className="flex flex-row">
                    {alumnus.consent_to_email_share ?
                        <SmartChip content="Visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                        <SmartChip content="Visibili solo allo staff" style={bgAndContrastPastel(2)} />
                    }
                    <Link className="chip-button" href={route('profile.email_consent')}>
                        Cambia
                        <FontAwesomeIcon icon={faPenToSquare} className="ml-2" />
                    </Link>
                </div>
            </>}

            <div className="font-bold text-primary-main mt-4">Gruppi</div>
            <div className="w-full flex flex-row flex-wrap gap-y-2">
                {roles.map(role =>
                    <div className="chip-v2" key={role.name}>
                        <span className="px-2">{role.common_name}</span>
                    </div>
                )}
            </div>

            {adts.length > 0 && <>
                <div className="font-bold text-primary-main mt-4">Altri dettagli<InfoBtn>
                    <b>Perchè questi dati? </b>Conserviamo questi dati per favorire il networking associativo. Grazie a queste informazioni, possiamo mettere in contatto giovani galileiani con vecchi soci che siano disponibili per idee, suggerimenti e consigli
                </InfoBtn></div>
                <Link className="chip-button" href={route('profile.edit')}>
                    Aggiorna dati
                    <FontAwesomeIcon icon={faPenToSquare} className="ml-2" />
                </Link>


                {
                    adts.map((adt, i) => <Fragment key={adt.id}>
                        <label key={"label_" + adt.id}>{adt.name} {!adt.visible && <i> - Campo nascosto, usato solo a fini statistici</i>}</label>
                        {adt.a_details.map((ad, j) => adtRenderer(ad, adt, j))}
                    </Fragment>)
                }
                <div className="text-gray-400 text-sm mt-4">
                    <FontAwesomeIcon icon={faCircleInfo} className="ml-2 mr-1" />
                    <b>Perché aggiornare i dati? </b>La più grande ricchezza della nostra associazione è la possibilità di rimanere in contatto, di fare networking, orientamento verso i più giovani e chiedere consigli ai più esperti. Tenere questi dati aggiornati è fondamentale per una associazione efficace ed efficiente!
                </div>
                <Link className="chip-button" href={route('profile.edit')}>
                    Aggiorna dati
                    <FontAwesomeIcon icon={faPenToSquare} className="ml-2" />
                </Link>

                <label>Consenso alla condivisione dei dati<InfoBtn>
                    <b>Chi vede questi dati? </b>Lo scegli tu! Se accetti che i tuoi dati vengano condivisi con tutti i soci, saranno disponibili su questo stesso portale per soci e soci studenti, nella sezione dedicata al networking; altrimenti, rimarranno a sola consultazione dello staff di segreteria e di chi si occupa del networking associativo. I dati segnati come <i>campo nascosto</i> rimangono nascosti a prescindere, e sono utilizzati per soli fini statistici.
                </InfoBtn></label>
                <div className="flex flex-row">
                    {alumnus.consent_to_network_share ?
                        <SmartChip content="Visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                        <SmartChip content="Visibili solo allo staff" style={bgAndContrastPastel(2)} />
                    }
                    <Link className="chip-button" href={route('profile.data_consent')}>
                        Cambia
                        <FontAwesomeIcon icon={faPenToSquare} className="ml-2" />
                    </Link>
                </div>
            </>}

            <Backdrop open={processing} />

        </div>

    );
}
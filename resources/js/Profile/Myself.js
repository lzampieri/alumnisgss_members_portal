import { Head, Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Fragment } from "react";
import ADetailsType from "../Network/ADetailsType";
import SmartChip from "../Network/SmartChip";

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

export default function Myself() {
    const alumnus = usePage().props.alumnus;
    const adts = usePage().props.adts;

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
                        <FontAwesomeIcon icon={solid('pen-to-square')} className="ml-2" />
                    </Link>
                </div>
            </div>

            <div className="font-bold text-primary-main mt-4">Metodi di accesso</div>
            <ul className="list-disc list-inside">
                {
                    alumnus.login_methods.map(lmth => <li key={lmth.id}>
                        {lmth.credential} ({lmth.driver}) - dal {new Date(lmth.created_at).toLocaleDateString("it-IT")}
                    </li>
                    )
                }
            </ul>


            <div className="font-bold text-primary-main mt-4">Storico</div>
            <ul className="list-disc list-inside">
                <li>Creazione profilo: {new Date(alumnus.created_at).toLocaleDateString("it-IT")}</li>
                <li>Ultima modifica: {new Date(alumnus.updated_at).toLocaleDateString("it-IT")}</li>
                {alumnus.ratifications.map(r =>
                    <li key={r.id}>Passaggio allo stato di {AlumnusStatus.status[r.required_state].label}: {
                        r.document_id == null ? <span className="italic">richiesta in attesa</span> : <span>
                            {new Date(r.document.date).toLocaleDateString("it-IT")} (<a href={route('board.view_document', { protocol: r.document.protocol })}>{r.document.identifier}</a>)
                        </span>
                    }</li>
                )}
            </ul>

            <div className="font-bold text-primary-main mt-4">Gruppi</div>
            <div className="w-full flex flex-row flex-wrap gap-y-2">
                {roles.map(role =>
                    <div className="chip-v2" key={role.name}>
                        <span className="px-2">{role.common_name}</span>
                    </div>
                )}
            </div>

            <div className="font-bold text-primary-main mt-4">Altri dettagli</div>
            <Link className="chip-button" href={route('profile.edit')}>
                Aggiorna dati
                <FontAwesomeIcon icon={solid('pen-to-square')} className="ml-2" />
            </Link>
            <div className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={solid('circle-info')} className="ml-2 mr-1" />
                <b>Perchè questi dati? </b>Conserviamo questi dati per favorire il networking associativo. Grazie a queste informazioni, possiamo mettere in contatto giovani galileiani con vecchi soci che siano disponibili per idee, suggerimenti e consigli
            </div>
            <div className="text-gray-400 text-sm">
                <FontAwesomeIcon icon={solid('circle-info')} className="ml-2 mr-1" />
                <b>Chi vede questi dati? </b>Lo scegli tu! Se accetti che i tuoi dati vengano condivisi con tutti i soci, saranno disponibili su questo stesso portale per soci e soci studenti, alla <Link href={route('network')}>pagina dedicata</Link>; altrimenti, rimarranno a sola consultazione dello staff di segreteria e di chi si occupa del networking associativo. I dati segnati come <i>campo nascosto</i> rimangono nascosti a prescindere, e sono utilizzati per soli fini statistici.
            </div>

            <label>Consenso alla condivisione dei dati</label>
            <div className="flex flex-row">
                {alumnus.consent_to_network_share ?
                    <SmartChip content="Visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                    <SmartChip content="Visibili solo allo staff" style={bgAndContrastPastel(2)} />
                }
                <Link className="chip-button" href={route('profile.data_consent')}>
                    Cambia
                    <FontAwesomeIcon icon={solid('pen-to-square')} className="ml-2" />
                </Link>
            </div>

            {
                adts.map((adt, i) => <Fragment key={adt.id}>
                    <label key={"label_" + adt.id}>{adt.name} {!adt.visible && <i> - Campo nascosto, usato solo a fini statistici</i>}</label>
                    {adt.a_details.map((ad, j) => adtRenderer(ad, adt, j))}
                </Fragment>)
            }
            <div className="text-gray-400 text-sm mt-4">
                <FontAwesomeIcon icon={solid('circle-info')} className="ml-2 mr-1" />
                <b>Perché aggiornare i dati? </b>La più grande ricchezza della nostra associazione è la possibilità di rimanere in contatto, di fare networking, orientamento verso i più giovani e chiedere consigli ai più esperti. Tenere questi dati aggiornati è fondamentale per una associazione efficace ed efficiente!
            </div>
            <Link className="chip-button" href={route('profile.edit')}>
                Aggiorna dati
                <FontAwesomeIcon icon={solid('pen-to-square')} className="ml-2" />
            </Link>

        </div>

    );
}
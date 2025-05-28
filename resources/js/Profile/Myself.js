import { Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";


export default function Myself() {
    const alumnus = usePage().props.alumnus;

    let roles = alumnus.roles.filter((e, i, self) => i === self.findIndex((ee) => ee.id === e.id));

    return (
        <div className="flex flex-col w-full md:w-3/5 items-start gap-2">
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


            <div className="font-bold text-primary-main mt-">Storico</div>
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

            <div className="font-bold text-primary-main mt-">Gruppi</div>
            <div className="w-full flex flex-row flex-wrap gap-y-2">
                {roles.map(role =>
                    <div className="chip-v2" key={role.name}>
                        <span className="px-2">{role.common_name}</span>
                    </div>
                )}
            </div>

        </div>
        // <form className="flex flex-col w-full md:w-3/5 items-start gap-2" onSubmit={submit}>
        //     <div className="flex flex-row justify-between w-full">
        //         <Link className="button flex flex-row items-center self-start mb-4" href={route('network')}>
        //             <FontAwesomeIcon icon={solid('chevron-left')} />
        //             Indietro
        //         </Link>
        //         <div className="button flex flex-row items-center self-start mb-4" onClick={submit}>
        //             <FontAwesomeIcon icon={solid('save')} />
        //             Salva
        //         </div>
        //     </div>
        //     <h3>{alumnus.name} {alumnus.surname}</h3>
        //     <div className="flex flex-row w-full flex-wrap">
        //         <div className="chip group relative z-auto" style={bgAndContrast('6b7280')} key='coorte'>
        //             {romanize(alumnus.coorte)} coorte
        //         </div>

        //         <div className="chip group relative z-auto" style={bgAndContrast(AlumnusStatus.status[alumnus.status].color)}>
        //             {AlumnusStatus.status[alumnus.status].label}
        //         </div>

        //         {alumnus.tags?.map(i =>
        //             <div className="chip group relative z-auto" style={bgAndContrast('#1f77b4')} key={i}>
        //                 {i}
        //             </div>)}

        //     </div>

        //     {
        //         adts.map((adt, i) => <Fragment key={adt.id}>
        //             <label key={"label_" + adt.id}>{adt.name} {!adt.visible && <i> - Campo nascosto</i>}</label>
        //             {adt.type in ADetailsType.values &&
        //                 ADetailsType.values[adt.type].editor(
        //                     adt,
        //                     data.adts[i].value,
        //                     (newValue) => {
        //                         let newAdts = data.adts.slice();
        //                         newAdts[i].value = newValue;
        //                         setData('adts', newAdts);
        //                     }
        //                 )
        //             }
        //             {(("adts." + i + ".value" in errors) || ("adts." + i + ".id" in errors)) &&
        //                 <label className="error">C'è un problema con questo dato</label>}
        //         </Fragment>)
        //     }

        //     <div className="flex flex-row w-full justify-end">
        //         <div className="button flex flex-row items-center self-start mb-4" onClick={submit}>
        //             <FontAwesomeIcon icon={solid('save')} />
        //             Salva
        //         </div>
        //     </div>

        //     <Backdrop open={processing} />

        // </form>
    );
}
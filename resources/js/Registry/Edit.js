import { useForm, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AlumnusStatus } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { enqueueSnackbar } from "notistack";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import ADetailsType from "../Network/ADetailsType";

export default function Edit() {
    const prev = usePage().props.alumnus;
    const adts = usePage().props.adts;

    const [dirtyDialog, setDirtyDialog] = useState(false);

    const { data, setData, post, processing, errors, isDirty } = useForm({
        surname: prev?.surname || '',
        name: prev?.name || '',
        coorte: prev?.coorte || 1,
        status: prev?.status || 'not_reached',
        tags: prev?.tags || [],
        adts: adts.map((adt) => {
            return {
                id: adt.id,
                value: (adt.a_details && (adt.a_details.length == 1)) ? adt.a_details[0].value : []
            }
        })
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('registry.edit', { alumnus: prev?.id }), { preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }) });
    }

    const checkIfDirty = (e) => {
        e.preventDefault();
        if (isDirty) setDirtyDialog(true);
        else goToRatification();
    }

    const opt_arrs = (tags) => tags.map(i => { return { value: i, label: i } })

    // Stato
    const status_notRat = usePage().props.noRatStatus;
    const status_options = usePage().props.allStatus.map(i => {
        return {
            value: i,
            label: AlumnusStatus.status[i].label,
            noRat: status_notRat.includes(i)
        }
    }).sort((a, b) => ((a.noRat ? 'A' : 'B') + a.label).localeCompare((b.noRat ? 'A' : 'B') + b.label))
    const formatOptionLabel = (data) => (
        <div className="flex flex-row items-center gap-2">
            {!data.noRat && <FontAwesomeIcon icon={solid('lock')} />}
            <div>{data.label}</div>
        </div>
    );

    // Pending rats
    const pending_rats = usePage().props.pendingRats;

    // Tags
    const tags_options = opt_arrs(Object.values(usePage().props.allTags) || [])

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <div className="w-full justify-between flex flex-row">
                <h3>{prev ? "Aggiorna" : "Crea nuovo"} alumno</h3>
                <div className="button flex flex-row items-center" onClick={submit}>
                    <FontAwesomeIcon icon={solid('save')} />
                    Salva
                </div>
            </div>

            {prev &&
                <div className="flex flex-col my-4 border-l-4 pl-2 border-l-primary-main">
                    <div className="font-bold text-primary-main">Storico</div>
                    <ul className="list-disc list-inside">
                        <li>Creazione: {new Date(prev.created_at).toLocaleDateString("it-IT")}</li>
                        <li>Ultima modifica: {new Date(prev.updated_at).toLocaleDateString("it-IT")}</li>
                        {prev.ratifications.map(r =>
                            <li key={r.id}>Passaggio allo stato di {AlumnusStatus.status[r.required_state].label}: {
                                r.document_id == null ? <span className="italic">in attesa</span> : <span>
                                    {new Date(r.document.date).toLocaleDateString("it-IT")} (<a href={route('board.view_document', { protocol: r.document.protocol })}>{r.document.identifier}</a>)
                                </span>
                            }</li>
                        )}
                    </ul>
                </div>}

            <label>Cognome</label>
            <input type="text" value={data.surname} onChange={(e) => setData('surname', e.target.value)} />
            <label className="error">{errors.surname}</label>

            <label>Nome</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <label className="error">{errors.name}</label>

            <label>Coorte</label>
            <input type="number" value={data.coorte} onChange={(e) => setData('coorte', e.target.value)} />
            <label className="error">{errors.coorte}</label>

            <label>Stato</label>
            {pending_rats.map(pr => <div className="w-full info" key={pr.id}>
                <FontAwesomeIcon icon={solid('hourglass-half')} className="mr-2" />
                È presente una richiesta in attesa di ratifica per il passaggio allo stato di {AlumnusStatus.status[pr.required_state].label}
            </div>)}
            <Select
                classNames={{ control: () => 'selectDropdown' }}
                value={status_options.find(i => i.value == data.status)}
                onChange={(sel) => setData('status', sel.value)}
                options={status_options}
                formatOptionLabel={formatOptionLabel} />
            {
                !status_options.find(i => i.value == data.status)?.noRat && <div className="w-full alert">
                    <FontAwesomeIcon icon={solid('lock')} className="mr-2" />
                    Per il passaggio allo stato di {AlumnusStatus.status[data.status].label} è richiesta la ratifica al consiglio di amministrazione. Il passaggio non sarà immediato, ma al salvataggio verrà creata una richiesta di ratifica.
                </div>
            }
            <label className="error">{errors.status}</label>


            <label>Tags</label>
            <CreatableSelect isMulti value={opt_arrs(data.tags)} onChange={(newValue) => setData('tags', newValue.map(i => i.value))} options={tags_options} />
            <label className="error">{errors.tags}</label>

            <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                <FontAwesomeIcon icon={solid('save')} />
                Salva
            </div>

            {
                adts.map((adt, i) => <Fragment key={adt.id}>
                    <label key={"label_" + adt.id}>{adt.name} {!adt.visible && <i> - Campo nascosto</i>}</label>
                    {adt.type in ADetailsType.values &&
                        ADetailsType.values[adt.type].editor(
                            adt,
                            data.adts[i].value,
                            (newValue) => {
                                let newAdts = data.adts.slice();
                                newAdts[i].value = newValue;
                                setData('adts', newAdts);
                            }
                        )
                    }
                    {(("adts." + i + ".value" in errors) || ("adts." + i + ".id" in errors)) &&
                        <label className="error">C'è un problema con questo dato</label>}
                </Fragment>)
            }

            {data.details?.length > 0 && <>
                <label>Altri dettagli dal vecchio sistema (obsoleto)</label>
                {data.details.map((det, idx) =>
                    <span key={idx}>{det.key}: {det.value}</span>
                )}
            </>
            }

            <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                <FontAwesomeIcon icon={solid('save')} />
                Salva
            </div>

            {/* Questo è obsoleto, la ratifica ora è inserita in automatico cambiando lo stato */}
            {/* <div className="flex flex-row-reverse my-4">
                <button className="button" onClick={checkIfDirty}>Richiedi ratifica</button>
                <label className="grow">Ricorda che alcuni stati non possono essere assegnati direttamente, ma è necessario richiedere una ratifica al consiglio di amministrazione.</label>
                <Dialog open={dirtyDialog}
                    undoLabel="Torna alle modifiche"
                    onClose={() => setDirtyDialog(false)}
                    confirmLabel="Abbandona le modifiche"
                    onConfirm={goToRatification}
                >
                    Ci sono alcune modifiche all'alumno che non hai salvato. Vuoi abbandonarle?
                </Dialog>
            </div> */}

        </form>
    );
}
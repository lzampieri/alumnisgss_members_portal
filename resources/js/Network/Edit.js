import { Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { enqueueSnackbar } from "notistack";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";

function DetailRow({ data, setData, options, val_options, errors, errors_prename }) {
    return <><div className={"w-full flex flex-row my-1 gap-1 items-center " + (data.delete ? "text-error line-through	" : "")}>
        <CreatableSelect
            className="basis-0 grow"
            value={{ value: data.key, label: data.key }}
            onChange={(e) => setData('key', e.value)}
            options={options} />
        :
        <CreatableSelect
            className="basis-0 grow"
            value={{ value: data.value, label: data.value }}
            onChange={(e) => setData('value', e.value)}
            options={val_options} />
        <button className={"icon-button h-8 w-8 grow-0 " + (data.delete ? "button-active" : "")} onClick={(e) => { e.preventDefault(); setData('delete', !data.delete) }}>
            <FontAwesomeIcon icon={solid('trash')} />
        </button>
    </div>
        <label className="error">{errors[errors_prename + "key"]}</label>
        <label className="error">{errors[errors_prename + "value"]}</label>
        <label className="error">{errors[errors_prename + "delete"]}</label>
    </>
}

export default function Edit() {
    const alumnus = usePage().props.alumnus;

    const adts = usePage().props.adts;

    // const [dirtyDialog, setDirtyDialog] = useState(false);

    // const { data, setData, post, processing, errors, isDirty } = useForm({
    //     surname: prev?.surname || '',
    //     name: prev?.name || '',
    //     coorte: prev?.coorte || 1,
    //     status: prev?.status || 'not_reached',
    //     tags: prev?.tags || [],
    //     academic: prev?.academic || [],
    //     realjobs: prev?.realjobs || [],
    //     details: prev?.details || []
    // })

    const submit = (e) => {
        e.preventDefault();
        // post(route('registry.edit', { alumnus: prev?.id }), { preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }) });
    }

    // const checkIfDirty = (e) => {
    //     e.preventDefault();
    //     if (isDirty) setDirtyDialog(true);
    //     else goToRatification();
    // }

    // const goToRatification = () => {
    //     router.visit(route('ratifications.add', { alumnus: prev.id }));
    // }

    // const opt_arrs = (tags) => tags.map(i => { return { value: i, label: i } })

    // // Stato
    // const status_notRat = usePage().props.noRatStatus;
    // // console.log( status_notRat )
    // const status_options = usePage().props.allStatus.map(i => {
    //     return {
    //         value: i,
    //         label: AlumnusStatus.status[i].label,
    //         noRat: status_notRat.includes(i)
    //     }
    // }).sort((a, b) => ((a.noRat ? 'A' : 'B') + a.label).localeCompare((b.noRat ? 'A' : 'B') + b.label))
    // const formatOptionLabel = (data) => (
    //     <div className="flex flex-row items-center gap-2">
    //         {!data.noRat && <FontAwesomeIcon icon={solid('lock')} />}
    //         <div>{data.label}</div>
    //     </div>
    // );

    // // Pending rats
    // const pending_rats = usePage().props.pendingRats;

    // // Tags
    // const tags_options = opt_arrs(Object.values(usePage().props.allTags) || [])

    // // Details: keys
    // const details_keys_options = opt_arrs(Object.keys(usePage().props.allDetails || {}))
    // const details_values_options_list = Object.values(usePage().props.allDetails || {}).map(i => opt_arrs(i))
    // const details_values_options = {}
    // details_keys_options.forEach((k, i) => details_values_options[k.value] = details_values_options_list[i])

    // const updateDetails = (idx, key, value) => {
    //     let newDetails = data.details.slice();
    //     newDetails[idx][key] = value;
    //     setData('details', newDetails);
    // }
    // const addDetails = () => {
    //     let newDetails = data.details.slice();
    //     newDetails.push({ key: '', value: '' });
    //     setData('details', newDetails);
    // }

    return (
        <form className="flex flex-col w-full md:w-3/5 items-start gap-2" onSubmit={submit}>
            <Link className="button flex flex-row items-baseline self-start mb-4" href={route('network')}>
                <FontAwesomeIcon icon={solid('chevron-left')} />
                Indietro
            </Link>
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

            </div>

            {
                adts.map((adt) => <>
                    <label>{adt.name}</label>
                    <TokenizableInput
                        separatingCharacters={ adt.separatingCharacters }
                        tokensList={[]} updateTokensList={(newValue) => { }} />
                    {/* <label className="error">{errors.academic}</label> */}
                </>)
            }

            {/* {prev &&
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

            <label>Post lauream: in accademia</label>
            <TokenizableInput tokensList={data.academic} updateTokensList={(newValue) => setData('academic', newValue)} />
            <label className="error">{errors.academic}</label>

            <label>Post lauream: nel mondo del lavoro</label>
            <TokenizableInput tokensList={data.realjobs} updateTokensList={(newValue) => setData('realjobs', newValue)} />
            <label className="error">{errors.realjobs}</label>

            <label>Altri dettagli</label>
            <label className="error">{errors.details}</label>
            {data.details.map((det, idx) =>
                <DetailRow
                    key={idx}
                    data={det}
                    setData={(k, v) => updateDetails(idx, k, v)}
                    options={details_keys_options}
                    val_options={details_values_options[det.key]}
                    errors={errors}
                    errors_prename={"details." + idx + "."}
                />
            )}
            <button className="icon-button h-8 w-8 grow-0" onClick={(e) => { e.preventDefault(); addDetails() }}>
                <FontAwesomeIcon icon={solid('circle-plus')} />
            </button>

            <input type="button" className="button mt-4" onClick={submit} value="Aggiorna" />

            <div className="flex flex-row-reverse my-4">
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
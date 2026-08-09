import { Head, useForm, usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AlumnusStatus, bgAndContrastPastel, romanize } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";


import { enqueueSnackbar } from "notistack";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import ADetailsType from "../Network/ADetailsType";
import ReactSwitch from "react-switch";
import { faChevronUp, faHourglass, faHourglassHalf, faLock, faSave, faStar, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Status({ canEdit, status, setStatus, errors }) {
    // Pending rats
    const pending_rats = usePage().props.pendingRats;

    // Stato
    const status_notRat = canEdit ? usePage().props.noRatStatus : [];
    const status_options = canEdit ? usePage().props.allStatus.map(i => {
        return {
            value: i,
            label: AlumnusStatus.status[i].label,
            noRat: status_notRat.includes(i)
        }
    }).sort((a, b) => ((a.noRat ? 'A' : 'B') + a.label).localeCompare((b.noRat ? 'A' : 'B') + b.label)) : [];

    const formatOptionLabel = (data) => (
        <div className="flex flex-row items-center gap-2">
            {!data.noRat && <FontAwesomeIcon icon={faLock} />}
            <div>{data.label}</div>
        </div>
    );

    return <>
        <label>Stato</label>
        {
            pending_rats && pending_rats?.map(pr => <div className="w-full info" key={pr.id}>
                <FontAwesomeIcon icon={faHourglassHalf} className="mr-2" />
                È presente una richiesta in attesa di ratifica per il passaggio allo stato di {AlumnusStatus.status[pr.required_state].label}
            </div>)
        }
        {canEdit ? <Select
            classNames={{ control: () => 'selectDropdown' }}
            value={status_options.find(i => i.value == status)}
            onChange={(sel) => setStatus(sel.value)}
            options={status_options}
            formatOptionLabel={formatOptionLabel} /> :
            <input type="text" value={AlumnusStatus.status[status].label} readOnly={true} />}
        {
            canEdit && !status_options.find(i => i.value == status)?.noRat && <div className="w-full alert">
                <FontAwesomeIcon icon={faLock} className="mr-2" />
                Per il passaggio allo stato di {AlumnusStatus.status[status].label} è richiesta la ratifica al consiglio di amministrazione. Il passaggio non sarà immediato, ma al salvataggio verrà creata una richiesta di ratifica.
            </div>
        }
        <label className="error">{errors}</label>
    </>
}


function Tags({ canEdit, tags, setTags, errors }) {
    // Tags
    const opt_arrs = (tags) => tags.map(i => { return { value: i, label: i } })
    const tags_options = canEdit ? opt_arrs(Object.values(usePage().props.allTags) || []) : []
    return <>
        <label>Tags</label>
        {canEdit ? <CreatableSelect
            isMulti value={opt_arrs(tags)}
            onChange={(newValue) => setTags(newValue.map(i => i.value))}
            options={tags_options} /> :
            <input type="text" value={tags.join(", ")} readOnly={true} />}
        <label className="error">{errors}</label>
    </>
}

function ReadOnlySwitch({ canEdit, checked, onChange }) {
    return canEdit ?
        <ReactSwitch checked={checked} onChange={onChange} /> :
        (checked ?
            <div className="px-2 py-1 rounded self-start" style={bgAndContrastPastel(4)}>Sì</div> :
            <div className="px-2 py-1 rounded self-start" style={bgAndContrastPastel(2)}>No</div>
        )
}


export default function Edit() {
    const prev = usePage().props.person;

    const edit_general = usePage().props.edit_general;
    const edit_consent = usePage().props.edit_consent;
    const edit_login = usePage().props.edit_login;
    const edit_details = usePage().props.edit_details;

    const adts = usePage().props.adts;

    const associate_to = usePage().props.associate_to;

    const [dirtyDialog, setDirtyDialog] = useState(false);

    const { data, setData, post, processing, errors, isDirty } = useForm({
        surname: prev?.surname || '',
        name: prev?.name || '',
        notes: prev?.notes || '',
        coorte: prev ? prev.coorte : 1,
        status: prev?.status || 'not_reached',
        tags: prev?.tags || [],
        emails: prev?.emails?.map((e) => e.address) || [],
        consent_to_email_share: Boolean(prev?.consent_to_email_share),
        consent_to_network_share: Boolean(prev?.consent_to_network_share),
        enabled: prev ? Boolean(prev?.enabled) : true,
        adts: adts ? adts.map((adt) => {
            return {
                id: adt.id,
                value: (adt.a_details && (adt.a_details.length == 1)) ? adt.a_details[0].value : []
            }
        }) : [],
        associate_to: associate_to?.id
    })

    const submit = (e) => {
        e.preventDefault();
        post(
            route('person.edit', { person: prev?.id }), {
            preserveState: "errors",
            onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }),
        });
    }

    const checkIfDirty = (e) => {
        e.preventDefault();
        if (isDirty) setDirtyDialog(true);
        else goToRatification();
    }


    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <Head title={prev ? prev.name + " " + prev.surname : "Nuovo profilo"} />
            <div className="w-full justify-between flex flex-row">
                <h3>{prev ? "Aggiorna" : "Crea nuovo"} profilo</h3>
                <div className="button flex flex-row items-center" onClick={submit}>
                    <FontAwesomeIcon icon={faSave} />
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
            <input type="text" value={data.surname} onChange={(e) => setData('surname', e.target.value)} readOnly={!edit_general} />
            <label className="error">{errors.surname}</label>

            <label>Nome</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} readOnly={!edit_general} />
            <label className="error">{errors.name}</label>

            {edit_general ?
                <>
                    <div className="flex flex-row w-full items-stretch pt-4">
                        <div className={"button grow basis-0 text-center " + (data.coorte > 0 ? "button-active" : "")} onClick={() => setData('coorte', 1)}>Alumno</div>
                        <div className={"button grow basis-0 text-center " + (data.coorte == 0 ? "button-active" : "")} onClick={() => setData('coorte', 0)}>S. onorario</div>
                        <div className={"button grow basis-0 text-center " + (data.coorte < 0 ? "button-active" : "")} onClick={() => setData('coorte', -1)}>Esterno</div>
                    </div>
                    {data.coorte > 0 && <>
                        <label>Coorte</label>
                        <input type="number" value={data.coorte} onChange={(e) => setData('coorte', e.target.value)} /></>}
                </> : <>
                    <label>Coorte</label>
                    <input type="text" value={romanize(data.coorte)} readOnly={true} /></>}
            <label className="error">{errors.coorte}</label>

            {data.coorte > 0 && <Status canEdit={edit_general} status={data.status} setStatus={(v) => setData('status', v)} errors={errors.status} />}

            {data.coorte > 0 && <Tags canEdit={edit_general} tags={data.tags} setTags={(v) => setData('tags', v)} errors={errors.tags} />}

            {data.coorte <= 0 && <>
                <label>Note</label>
                <input type="text" value={data.notes} onChange={(e) => setData('notes', e.target.value)} readOnly={!edit_general} />
                <label className="error">{errors.notes}</label>
            </>
            }

            <label>Indirizzi email</label>
            {
                associate_to && <>
                    Associato automaticamente alla richiesta con indirizzo mail {associate_to.address}
                </>
            }
            <div className="flex flex-col items-start">
                {edit_general && data.emails.map((addr, idx) =>
                    <div className="flex flex-row rounded bg-gray-200 self-start" style={{ overflowWrap: "anywhere" }}>
                        <div role="button" className={"flex flex-row items-center px-2 " + (idx > 0 ? "hover:bg-[#FFBDAD] hover:text-[#DE350B]" : "")}
                            onClick={() => {
                                setData('emails', [
                                    data.emails[idx],
                                    ...data.emails.toSpliced(idx, 1)
                                ]);
                            }}>
                            <FontAwesomeIcon icon={idx == 0 ? faStar : faChevronUp} className="text-[0.5rem]" />
                        </div>
                        <div className="p-1 pl-2">
                            {addr}
                        </div>
                        <div role="button" className="flex flex-row items-center hover:bg-[#FFBDAD] hover:text-[#DE350B] px-2"
                            onClick={() => setData('emails', data.emails.toSpliced(idx, 1))}>
                            <FontAwesomeIcon icon={faX} className="text-[0.5rem]" />
                        </div>
                    </div>

                )}
            </div>
            {edit_general &&
                <TokenizableInput
                    separatingCharacters={",; "}
                    tokensList={[]}
                    updateTokensList={(newList) => setData('emails', [...data.emails, ...newList])} />}
            {!edit_general && data.emails.map((e, idx) =>
                <span className={idx == 0 ? "font-bold" : ""}>{e}</span>
            )}
            <label className="error">{errors.emails}</label>

            <label>Consenso alla condivisione degli indirizzi mail</label>
            <ReadOnlySwitch canEdit={edit_consent} checked={data.consent_to_email_share} onChange={(newValue) => setData('consent_to_email_share', newValue)} />

            <label>Consenso alla condivisione dei dati</label>
            <ReadOnlySwitch canEdit={edit_consent} checked={data.consent_to_network_share} onChange={(newValue) => setData('consent_to_network_share', newValue)} />

            <label>Autorizzato all'accesso al sito</label>
            <ReadOnlySwitch canEdit={edit_login} checked={data.enabled} onChange={(newValue) => setData('enabled', newValue)} />


            <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                <FontAwesomeIcon icon={faSave} />
                Salva
            </div>

            {edit_details && data.coorte > 0 && <>
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

                <div className="button flex flex-row items-center self-end my-4" onClick={submit}>
                    <FontAwesomeIcon icon={faSave} />
                    Salva
                </div>
            </>}

        </form>
    );
}
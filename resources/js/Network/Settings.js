import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, postRequest, romanize } from "../Utils";
import { useMemo, useState } from "react";
import Dialog from "../Layout/Dialog";
import Backdrop from "../Layout/Backdrop";
import ReactSwitch from "react-switch";
import { enqueueSnackbar } from "notistack";
import ADetailsType from "./ADetailsType";
import Select from 'react-select';

function ADlist() {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        id: -1,
        name: '',
        type: '',
        param: '',
        order: 0,
        visible: true
    })

    const [open, setOpen] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [delProcessing, setDelProcessing] = useState(false);

    
    const openForm = (prev) => {
        setOpen(true);
        setData({
            id: prev?.id || -1,
            name: prev?.name || '',
            type: prev?.type || '',
            param: prev?.param || '',
            order: prev?.order || 0,
            visible: Boolean( prev ? prev.visible : true ),
        })
    }

    const openDeleteForm = (item) => {
        setToDelete(item);
        setDeleteDialog(true);
    }

    const submit = (e) => {
        e?.preventDefault();
        post(route('network.settings.adtedit'), { preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }) });
    }

    const deletePost = (e) => {
        e?.preventDefault();
        postRequest(
            'network.settings.adtdelete',
            { id: toDelete?.id },
            setDelProcessing,
            {},
            false, false
        );
    }

    const adtypes = usePage().props.aDetailsTypes;

    const updateType = (sel) => {
        if (sel != data.type) {
            setData({
                ...data,
                type: sel,
                param: ADetailsType.values[sel]?.paramDefault
            });
        }
    }

    const typesOptions = Object.keys(ADetailsType.values).map((val) => { return { value: val, label: ADetailsType.values[val].label } });

    return <>
        {adtypes.map((adtype) =>
            <div key={adtype.id} className="w-full flex flex-row gap-2 my-1">
                <div className="button" onClick={() => openForm(adtype)} >
                    <FontAwesomeIcon icon={solid('pen')} className="!p-0" />
                </div>
                <div className="button" onClick={() => openDeleteForm(adtype)} >
                    <FontAwesomeIcon icon={solid('trash')} className="!p-0" />
                </div>
                <div className="grow flex flex-col">
                    {adtype.name} <br />
                    <span className="text-gray-500">
                        {adtype.type in ADetailsType.values ? (
                            ADetailsType.values[adtype.type].paramName ?
                                ADetailsType.values[adtype.type].paramName + ": " + adtype.param + " - " : "")
                            : "Tipo sconosciuto - "}
                        Ordine: {adtype.order} - Visibile: {adtype.visible ? 'Si' : 'No'}
                    </span>
                </div>
            </div>
        )}
        <div className="button flex flex-row items-baseline self-end" onClick={() => openForm(null)} >
            <FontAwesomeIcon icon={solid('plus')} />
            Aggiungi
        </div>
        <Dialog
            open={open}
            undoLabel="Annulla"
            confirmLabel="Salva"
            onClose={() => setOpen(false)}
            onConfirm={submit}
        >
            <form className="flex flex-col" onSubmit={submit}>
                <label>Nome</label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                <label className="error">{errors.name}</label>

                <label>Tipo</label>
                <Select
                    classNames={{ control: () => 'selectDropdown' }}
                    value={typesOptions.find(i => i.value == data.type)}
                    onChange={(sel) => updateType(sel.value)}
                    options={typesOptions} />
                <label className="error">{errors.type}</label>

                {
                    data.type && (data.type in ADetailsType.values) && ('paramName' in ADetailsType.values[data.type]) && <>
                        <label>{ADetailsType.values[data.type].paramName}</label>
                        <input type="text" value={data.param} onChange={(e) => setData('param', e.target.value)} />
                        <label className="error">{errors.param}</label>
                    </>
                }

                <label>Ordine</label>
                <input type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} />
                <label className="error">{errors.order}</label>

                <label>Visibile</label>
                <ReactSwitch checked={data.visible} onChange={(checked) => setData('visible', checked)} className="self-center" />
                <label className="error">{errors.visible}</label>
            </form>
        </Dialog>
        <Dialog
            open={deleteDialog}
            undoLabel="Annulla"
            confirmLabel="Cancella"
            onClose={() => setDeleteDialog(false)}
            onConfirm={deletePost}
        >
            Sei sicuro di voler cancellare "{toDelete?.name}"?
        </Dialog>
        <Backdrop open={processing || delProcessing} />
    </>
}

export default function Settings() {
    return <div className="main-container gap-1">
        <Link className="button flex flex-row items-baseline self-start" href={route('network')}>
            <FontAwesomeIcon icon={solid('chevron-left')} />
            Indietro
        </Link>
        <h3>Campi in forma di lista</h3>
        <ADlist />
    </div>
}

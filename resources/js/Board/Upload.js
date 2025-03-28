import { useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus, Documents, romanize } from "../Utils";
import IdSelector from "./IdSelector";
import IdSelector_Attachment from "./IdSelector_Attachment";
import Datepicker from "tailwind-datepicker-react"
import { useState } from "react";
import Backdrop from "../Layout/Backdrop";
import ReactSwitch from "react-switch";
import Select from 'react-select';

export default function Upload() {
    const roles = usePage().props.roles;
    const rats = usePage().props.open_rats;
    const parentable = usePage().props.parentable.map(p => ({ value: p.id, label: p.identifier }));

    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const { data, setData, post, processing, errors, progress, transform } = useForm({
        roles: [],
        identifier: '',
        date: new Date(),
        prehandle: '',
        note: '',
        ratifications: [],
        file: '',
        isAttachment: false,
        attachedTo: null
    })


    const changeRole = (id) => {
        if (data.roles.includes(id)) {
            data.roles.splice(data.roles.indexOf(id), 1)
            setData('roles', data.roles.slice())
        } else
            setData('roles', data.roles.concat([id]))
    }

    const changeRatification = (id) => {
        if (data.ratifications.includes(id)) {
            data.ratifications.splice(data.ratifications.indexOf(id), 1)
            setData('ratifications', data.ratifications.slice())
        } else
            setData('ratifications', data.ratifications.concat([id]))
    }

    const all = (e) => {
        e.preventDefault();
        setData('ratifications', Object.values(rats).map(a => a.map(r => r.id)).flat())
    }

    const nothing = (e) => {
        e.preventDefault();
        setData('ratifications', [])
    }

    const submit = (e) => {
        e.preventDefault();

        data.prehandle = data.date.toLocaleDateString('it-IT', { 'year': 'numeric' });
        let months = ['A', 'B', 'C', 'D', 'E', 'H', 'L', 'M', 'P', 'R', 'S', 'T'];
        data.prehandle = data.prehandle + months[data.date.toLocaleDateString('it-IT', { 'month': 'numeric' }) - 1];

        post(route('board.add'));
    }

    transform((data) => ({
        ...data,
        attached_to_id: data.isAttachment ? data.attachedTo.value : null
    }))

    return (
        <form className="flex flex-col w-full md:w-3/5" onSubmit={submit}>
            <h3>Carica documento</h3>
            {!usePage().props.canEdit && <label className="error">Attenzione: possiedi i permessi di caricare documenti, ma non di modificare documenti già caricati. Rivedi con attenzione tutti i campi prima di salvare.</label>}
            <label>È un allegato</label>
            <ReactSwitch height={21} width={42} checked={data.isAttachment} onChange={(newState) => setData('isAttachment', newState)} />
            {data.isAttachment &&
                <div className="w-full flex flex-row flex-wrap gap-2 items-center">
                    <label>Allegato a:</label>
                    <Select className="grow" classNames={{ control: () => 'selectDropdown' }} value={data.attachedTo} options={parentable} onChange={(newDocument) => setData('attachedTo', newDocument)} />
                </div>
            }

            <label>Identificativo</label>
            {!data.isAttachment && <>
                <IdSelector onChange={(idf) => setData('identifier', idf)} />
            </>}
            {data.isAttachment && <>
                <IdSelector_Attachment onChange={(idf) => setData('identifier', idf)} />
            </>}
            <label className="error">{errors.identifier}</label>

            <label>Visibilità</label>
            <div className="w-full flex flex-row flex-wrap justify-start gap-y-2">
                {roles.map(r =>
                    <div key={r.id} className="chip px-4 py-2 cursor-pointer aria-disabled:disabled" aria-disabled={!data.roles.includes(r.id)} onClick={() => changeRole(r.id)}>
                        {r.common_name}
                    </div>)}
            </div>
            <label className="error">{errors.roles}</label>
            <label>Data di redazione</label>
            <Datepicker classNames='w-full' options={{ maxDate: new Date(), language: 'it', theme: { input: '!text-black' } }} onChange={(date) => setData('date', date)} show={datePickerOpen} setShow={setDatePickerOpen} />
            <label className="error">{errors.date}</label>
            <label>Note</label>
            <input type="text" value={data.note} onChange={(e) => setData('note', e.target.value)} />
            <label className="error">{errors.note}</label>
            <label>File</label>
            <input type="file" onChange={e => setData('file', e.target.files[0])} accept=".pdf" />
            <label className="error">{errors.file}</label>
            {rats.constructor == Object ?
                <label>Ratifiche approvate <a href="#" onClick={all}>Tutte</a> <a href="#" onClick={nothing}>Nessuna</a></label>
                : <label>Nessuna ratifica da approvare</label>}
            {rats.constructor == Object && <>
                {Object.keys(rats).map(k => <div className="grid grid-cols-3" key={k}>
                    <label className="col-span-3"><i>Per il passaggio allo stato di <b>{AlumnusStatus.status[k].label}</b></i></label>
                    {rats[k].map(r =>
                        <span key={r.id}>
                            <input type="checkbox" checked={data.ratifications.includes(r.id)} onChange={() => changeRatification(r.id)} />
                            {r.alumnus.surname} {r.alumnus.name} <span className="text-gray-400"> {romanize(r.alumnus.coorte)}{r.alumnus.coorte != 0 && " coorte"}</span>
                        </span>
                    )}
                </div>)}
            </>}
            <label className="error">{errors.ratifications}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Aggiungi" />
            <Backdrop open={processing} />
        </form>
    );
}
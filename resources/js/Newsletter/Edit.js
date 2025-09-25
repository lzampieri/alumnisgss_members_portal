import { Head, useForm, usePage } from "@inertiajs/react";
import Backdrop from "../Layout/Backdrop";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import { enqueueSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useMemo, useState } from "react";
import EmptyDialog from "../Layout/EmptyDialog";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { AlumnusStatus, bgAndContrast } from "../Utils";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);

function StatusTooltip({ status }) {
    if (AlumnusStatus.status[status])
        return <div className="chip mx-1 group relative z-auto my-auto" style={bgAndContrast(AlumnusStatus.status[status].color)}>
            {AlumnusStatus.status[status].acronym}
            <span className="tooltip-right" style={bgAndContrast(AlumnusStatus.status[status].color)}>
                {AlumnusStatus.status[status].label}
            </span>
        </div>
    return "";
}

function AddButton({ address, to, setTo }) {
    if (to.includes(address)) return <FontAwesomeIcon icon={solid('check')} className="text-[#00CC00]" />;
    return <FontAwesomeIcon icon={solid('plus')} className="icon-button" onClick={() => setTo([...to, address])} />
}

function Rubrica({ to, setTo }) {
    const [open, setOpen] = useState(false);
    const rubrica = usePage().props.rubrica || [];
    const [quickFilter, setQuickFilter] = useState('');

    const columns = [
        {
            field: 'identity', headerName: 'identity',
            valueGetter: ({ data }) => data?.identity?.name + " " + data?.identity?.surname, filter: 'agTextColumnFilter',
            cellRenderer: ({ value, data }) => <div className="flex flex-row items-center">{value} <StatusTooltip status={data.identity.status} /></div>
        },
        {
            field: 'address', headerName: 'address', valueGetter: ({ data }) => data?.address, filter: 'agTextColumnFilter',
            cellRenderer: ({ value, data }) => <span>{data.isPrimary && <FontAwesomeIcon icon={solid('star')} className="mr-2 text-[#f5b700]" />}{value}</span>
        },
        {
            field: 'add', headerName: 'add', valueGetter: ({ data }) => data.isPrimary, filter: 'agTextColumnFilter',
            cellRenderer: ({ value, data }) => <AddButton address={data.address} to={to} setTo={setTo} />
        },
    ]

    const theme = themeQuartz.withParams({
        headerHeight: 0,
        rowBorder: false,
        rowHoverColor: "#00000000",
        borderColor: "#00000000",
    })

    return <>
        <div className="button" onClick={() => setOpen(true)}><FontAwesomeIcon icon={solid('address-book')} className="mr-2" />Aggiungi da rubrica</div>
        <EmptyDialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <input type="text" className="grow" value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder="Cerca..." />
            <div className='w-full h-[50vh]'>
                <AgGridReact
                    columnDefs={columns}
                    quickFilterText={quickFilter}
                    theme={theme}
                    suppressCellFocus={true}
                    rowData={rubrica}
                />
            </div>
        </EmptyDialog>
    </>
}

function Groups({ to, setTo, setNotFound }) {
    const [open, setOpen] = useState(false);
    const groups = usePage().props.groups || [];

    const addGroup = (group) => {
        const newto = to.slice();
        const notfound = [];

        group.identities.forEach((identity) => {
            if( identity.emails.length > 0 ) {
                if( !newto.includes(identity.emails[0].address) ) newto.push(identity.emails[0].address);
            }
            else notfound.push(identity.name + " " + identity.surname);
        });

        setTo(newto);
        setNotFound(notfound);
        setOpen(false);
    }

    return <>
        <div className="button" onClick={() => setOpen(true)}><FontAwesomeIcon icon={solid('address-book')} className="mr-2" />Aggiungi da gruppo</div>
        <EmptyDialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <div className="w-full flex flex-row flex-wrap gap-4 gap-y-4 items-center justify-center">
                {groups.map((g) => <div className="button" key={g.id} onClick={() => addGroup(g)}>
                    <FontAwesomeIcon icon={solid('circle-plus')} className="mr-2" />
                    {g.common_name}
                </div>)}
            </div>
        </EmptyDialog>
    </>
}

export default function Edit() {
    const prevDraft = usePage().props.newsletter;

    const { data, setData, post, processing, errors, isDirty } = useForm({
        subject: prevDraft.subject || "",
        body: prevDraft.body || "",
        to: prevDraft.to || [],
    })

    const [notFound, setNotFound] = useState([]);

    const submit = (e) => {
        e.preventDefault();
        post(
            route('newsletter.edit', { newsletter: prevDraft.id }),
            { preserveScroll: true, preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi. Bozza NON salvata.', { variant: 'error' }) },
        )
    }

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title={data.subject + " | Bozza"} />
            <h3>Preparazione newsletter</h3>
            <form className="flex flex-col w-full" onSubmit={submit}>
                <button className="button self-end">Salva bozza</button>
                <label>Oggetto</label>
                <input type="text" className="w-full" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                <label className="error">{errors.subject}</label>

                <label>Contenuto</label>
                <input type="text" className="w-full" value={data.body} onChange={(e) => setData('body', e.target.value)} />
                <label className="error">{errors.body}</label>

                <label>Destinatari</label>
                <TokenizableInput
                    separatingCharacters=" ,;:"
                    tokensList={data.to}
                    updateTokensList={(newVal) => setData('to', newVal)} />
                <label className="error">{errors.to}</label>
                {Object.keys(errors).map((key) => key.startsWith("to.") && <label className="error">{errors[key]}</label>)}
                <div className="flex flex-row w-full gap-2 justify-center mb-4">
                    <Rubrica to={data.to} setTo={(newVal) => setData('to', newVal)} />
                    <Groups to={data.to} setTo={(newVal) => setData('to', newVal)} setNotFound={setNotFound} />
                </div>
                {notFound.length > 0 && <label className="error">Non sono stati trovati indirizzi email per: {notFound.join(", ")}</label>}
                <button className="button self-end">Salva bozza</button>
                <button className="button self-end">Anteprima e invio</button>
            </form>
            <Backdrop open={processing} />
        </div>
    );
}
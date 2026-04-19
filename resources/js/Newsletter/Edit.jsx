import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Backdrop from "../Layout/Backdrop";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import { enqueueSnackbar } from "notistack";


import { useCallback, useMemo, useState } from "react";
import EmptyDialog from "../Layout/EmptyDialog";
import sanitizeHtml from "sanitize-html";
import { useDropzone } from "react-dropzone";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule } from 'ag-grid-community';
import { AlumnusStatus, asyncPostWithResult, bgAndContrast, noninertiaPostRequest, postRequest } from "../Utils";
// import DefaultEditor, { BtnBold, BtnBulletList, BtnItalic, BtnLink, BtnNumberedList, BtnRedo, BtnStrikeThrough, BtnUnderline, BtnUndo, Editor, EditorProvider, Separator, Toolbar } from "react-simple-wysiwyg";
import { to } from "@react-spring/web";
import { faAddressBook, faCheck, faCirclePlus, faFileArrowUp, faPlus, faStar, faTrashCan, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NewsletterEditor from "./Editor";
ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnAutoSizeModule, QuickFilterModule]);

function delFromArray(arr, idx) {
    const newarr = arr.toSpliced(idx, 1)
    return newarr;
}

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
    if (to.includes(address)) return <FontAwesomeIcon icon={faCheck} className="text-[#00CC00]" />;
    return <FontAwesomeIcon icon={faPlus} className="icon-button" onClick={() => setTo([...to, address])} />
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
            cellRenderer: ({ value, data }) => <span>{data.isPrimary && <FontAwesomeIcon icon={faStar} className="mr-2 text-[#f5b700]" />}{value}</span>
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
        <div className="button" onClick={() => setOpen(true)}><FontAwesomeIcon icon={faAddressBook} className="mr-2" />Aggiungi da rubrica</div>
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
            if (identity.emails.length > 0) {
                if (!newto.includes(identity.emails[0].address)) newto.push(identity.emails[0].address);
            }
            else notfound.push(identity.name + " " + identity.surname);
        });

        setTo(newto);
        setNotFound(notfound);
        setOpen(false);
    }

    return <>
        <div className="button" onClick={() => setOpen(true)}><FontAwesomeIcon icon={faAddressBook} className="mr-2" />Aggiungi da gruppo</div>
        <EmptyDialog
            open={open}
            onClose={() => setOpen(false)}
        >
            <div className="w-full flex flex-row flex-wrap gap-4 gap-y-4 items-center justify-center">
                {groups.map((g) => <div className="button" key={g.id} onClick={() => addGroup(g)}>
                    <FontAwesomeIcon icon={faCirclePlus} className="mr-2" />
                    {g.common_name}
                </div>)}
                {groups.length == 0 && "Nessun gruppo disponibile"}
            </div>
        </EmptyDialog>
    </>
}

function AttachmentSelector({ attachments, setAttachments, newsletterId }) {
    const [loading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState("");

    const onDrop = acceptedAttachments => {
        if (acceptedAttachments.length == 0) return;

        noninertiaPostRequest(
            'newsletter.uploadAttachments',
            { attachments: acceptedAttachments },
            setIsLoading,
            { newsletter: newsletterId },
            (data) => {
                setAttachments([...attachments, ...data]);
            },
            true,
            (data) => {
                if (data?.errors) {
                    setErrors(Object.values(data?.errors).flat().join("\n"));
                }
            }
        )
    }

    const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: true })

    return <>
        <div {...getRootProps()} className="border-2 border-dashed rounded-md my-4 flex flex-col items-center p-4">
            <input {...getInputProps()} />
            <FontAwesomeIcon icon={faFileArrowUp} className="text-4xl" />
            <div className="text-center">Trascina qui il file da caricare, o clicca per selezionarlo dal pc.</div>
            <small>Formati accettati: {usePage().props.allowedFormats.join(", ")}</small>
            <label className="error whitespace-pre-wrap">{errors}</label>
        </div>
        {attachments?.length > 0 && <label>Attualmente caricati:</label>}
        {
            attachments?.map((f, idx) =>
                <div className="w-full flex flex-row items-center" key={f.id}>
                    <div className="button mr-2" onClick={() => setAttachments(delFromArray(attachments, idx))}><FontAwesomeIcon icon={faTrashCan} /></div>
                    <a target="_blank" href={route('newsletter.attachment', { id: f.id })}>{f.handle}</a>
                </div>
            )
        }
        <Backdrop open={loading} />
    </>
}

export default function Edit() {
    const prevDraft = usePage().props.newsletter;

    const mailingLists = usePage().props.mailingLists;

    const { data, setData, post, processing, errors, isDirty, transform } = useForm({
        subject: prevDraft.subject || "",
        body: prevDraft.body || "",
        to: prevDraft.to || [],
        mailingLists: prevDraft.mailing_lists || [],
        attachments: prevDraft.attachments || []
    })

    const [notFound, setNotFound] = useState([]);

    const submit = (e) => {
        e.preventDefault();
        post(
            route('newsletter.edit', { newsletter: prevDraft.id }),
            { preserveScroll: true, preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi. Bozza NON salvata.', { variant: 'error' }) },
        )
    }

    transform((data) => ({
        ...data,
        body: sanitizeHtml(data.body, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'span', 'a']),
            allowedAttributes: { 'img': ['src', 'width', 'height'], 'span': ['style'], 'a': ['target', 'rel', 'href'] },
            allowedSchemes: ['http', 'https']
        }),
        attachments: data.attachments.map((a) => a.id),
        mailingLists: data.mailingLists.map((ml) => ml.id)
    }));

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title={data.subject + " | Bozza"} />
            <h3>Preparazione newsletter</h3>
            <form className="flex flex-col w-full" onSubmit={submit}>
                <div className="flex flex-row self-end gap-2">
                    <button className="button self-end">Salva bozza</button>
                    {!processing && !isDirty && <Link className="button self-end" href={route('newsletter.preview', { newsletter: prevDraft.id })}>Anteprima</Link>}
                </div>
                <label>Oggetto</label>
                <input type="text" className="w-full" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                <label className="error">{errors.subject}</label>

                <label>Contenuto</label>
                {/* <EditorProvider>
                    <Editor value={data.body} onChange={(e) => setData('body', e.target.value)} className="pretendToBeInput">
                        <Toolbar>
                            <BtnUndo />
                            <BtnRedo />
                            <Separator />
                            <BtnBold />
                            <BtnItalic />
                            <BtnUnderline />
                            <BtnStrikeThrough />
                            <Separator />
                            <BtnNumberedList />
                            <BtnBulletList />
                            <Separator />
                            <BtnLink />
                        </Toolbar>
                    </Editor>
                </EditorProvider> */}
                <NewsletterEditor value={data.body} setValue={(v) => setData('body', v)} newsletter_id={prevDraft.id} />
                <label className="error">{errors.body}</label>

                <label>Allegati</label>
                <label className="error">{errors.attachments}</label>
                {prevDraft.parent_id ? <span>Questa bozza è copiata da un'altra bozza, da cui eredita gli allegati. Non è possibile modificare gli allegati specifici, prego modificare la bozza originale <Link href={route('newsletter.edit', { newsletter: prevDraft.parent_id })}>qui</Link>.</span> : <AttachmentSelector attachments={data.attachments} setAttachments={(newVal) => setData('attachments', newVal)} newsletterId={prevDraft.id} />}

                <label>Destinatari</label>
                {notFound.length > 0 && <label className="error">Non sono stati trovati indirizzi email per: {notFound.join(", ")}</label>}
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


                <label>Mailing list</label>
                <div
                    className="rounded-md bg-gray-100 border-transparent flex flex-row flex-wrap w-full items-start gap-1 p-2">
                    {data.mailingLists.map((ml,i) =>
                        <div className="flex flex-row rounded bg-gray-200 max-w-full" style={{ overflowWrap: "anywhere" }} key={i}>
                            <div className="p-1 pl-2">
                                {ml.name}
                            </div>
                            <div role="button" className="flex flex-row items-center hover:bg-[#FFBDAD] hover:text-[#DE350B] px-2"
                                onClick={() => setData('mailingLists', data.mailingLists.toSpliced(i,1))}>
                                <FontAwesomeIcon icon={faX} className="text-[0.5rem]" />
                            </div>
                        </div>)}
                    {data.mailingLists.length == 0 && <span className="text-gray-600 select-none">Nessuna selezionata</span>}
                </div>
                <label className="error">{errors.mailingLists}</label>
                <div className="flex flex-row w-full gap-2 justify-start mb-4 my-2">
                    {mailingLists.map(ml => <div className="flex flex-row rounded bg-gray-200 max-w-full px-2 py-1 cursor-pointer" onClick={() => setData('mailingLists', [...data.mailingLists, ml])} key={ml.id}>
                        {ml.name} ({ml.list.length})
                    </div>)}
                </div>
                
                {prevDraft?.childrens?.length > 0 && <label>
                    Questa newsletter è stata spezzata per l'invio e ha originato le newsletter
                    {prevDraft.childrens.map(ch => <Link href={route('newsletter.edit', { id: ch.id })} className="ml-2" id={ch.id}>#{ch.id}</Link>)}
                </label>}
                {prevDraft?.parent && <label>
                    Questa newsletter proviene, essento stata spezzata per l'invio, dalla newsletter originale
                    <Link href={route('newsletter.edit', { id: prevDraft.parent.id })} className="ml-2">#{prevDraft.parent.id}</Link>
                </label>}

                <div className="flex flex-row self-end gap-2">
                    <button className="button self-end">Salva bozza</button>
                    {!processing && !isDirty && <Link className="button self-end" href={route('newsletter.preview', { newsletter: prevDraft.id })}>Anteprima</Link>}
                </div>
            </form>
            <Backdrop open={processing} />
        </div>
    );
}
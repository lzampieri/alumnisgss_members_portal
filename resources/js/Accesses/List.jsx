import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import { themeQuartz } from "ag-grid-community";
import { ModuleRegistry, ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule } from 'ag-grid-community';
import { bgAndContrastPastel, pastelColors, postRequest, romanize } from "../Utils";
import Backdrop from "../Layout/Backdrop";
import Dialog from "../Layout/Dialog";
import EmptyDialog from "../Layout/EmptyDialog";
import ReactSwitch from "react-switch";
import { faAnglesRight, faAt, faCirclePlus, faPerson, faPersonCircleQuestion, faPersonDigging, faPlus, faStar, faTrash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { enqueueSnackbar } from "notistack";
ModuleRegistry.registerModules([ClientSideRowModelModule, RowAutoHeightModule, QuickFilterModule]);

const TYPE_PERSON = 0;
const TYPE_REQUEST = 2;

function whichType(item) {
    if (item.address) return TYPE_REQUEST;
    return TYPE_PERSON;
}

function EmailDiv({ e, isFirst, setPrimary, deleteAddress }) {
    return <div>
        <FontAwesomeIcon icon={faAt} className="mr-2" />
        {isFirst ? <FontAwesomeIcon icon={faStar} className="mr-2 text-[#f5b700]" />
            : <FontAwesomeIcon icon={faStar} className="mr-2 text-gray-200 hover:text-[#f5b700] cursor-pointer" onClick={() => setPrimary(e.id)} />}
        {e.address}
        {e.last_login && <span className="text-gray-400 ml-2">Last seen {new Date(e.last_login).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>}
        {e.can_delete && <FontAwesomeIcon icon={faTrash} className="icon-button ml-2" onClick={() => deleteAddress(e)} />}
    </div>
}

function IdentityRoles({ identity, removeRole, addRole }) {
    const editableRoles = usePage().props.editableRoles
    const editableRolesNames = editableRoles.map(role => role.name)
    const identityRolesNames = identity.roles.map(role => role.name)

    const [addDrawer, setAddDrawer] = useState(false);

    return <div className="flex flex-row w-full items-start mt-2 flex-wrap gap-2">
        {
            identity.roles.map(role =>
                <div className="rounded flex flex-row !no-underline items-center" style={bgAndContrastPastel(9)} key={role.name}>
                    <span className="px-2">{role.common_name}</span>
                    {editableRolesNames.indexOf(role.name) > -1 ?
                        <FontAwesomeIcon icon={faXmark} className="hover:bg-gray-100 hover:text-black cursor-pointer p-1 aspect-square rounded" onClick={() => removeRole(identity, role)} />
                        : ""}
                </div>
            )
        }
        <div className="icon-button" onClick={() => setAddDrawer(!addDrawer)}>
            <FontAwesomeIcon icon={addDrawer ? faXmark : faPlus} />
        </div>
        {addDrawer &&
            <div className="flex flex-row w-full items-start mt-2 flex-wrap gap-2">
                {editableRoles.map(role => (
                    identityRolesNames.indexOf(role.name) > -1 ? "" :
                        <div
                            className="rounded flex flex-row !no-underline items-center cursor-pointer"
                            style={bgAndContrastPastel(6)}
                            key={role.name}
                            onClick={() => addRole(identity, role)} >
                            <FontAwesomeIcon icon={faPlus} className="p-1 aspect-square rounded" />
                            <span className="px-2">{role.common_name}</span>
                        </div>
                ))}
            </div>
        }
    </div>
}

function IdentityContent({ data, setPrimary, deleteAddress, removeRole, addRole, setEnabled, setAddingEmail }) {
    const canAddEmail = usePage().props.canAddEmails;

    if (whichType(data) == TYPE_REQUEST) {
        return <div className="w-full border-2 border-black rounded border-dashed flex flex-row p-2 min-h-[3rem] justify-center gap-2 leading-normal	">
            <FontAwesomeIcon icon={faPersonCircleQuestion} className="text-4xl" />
            <div className="grow flex flex-col items-start">
                <div>
                    <FontAwesomeIcon icon={faAt} className="mr-2" />
                    {data.address}
                </div>
                <span className='whitespace-pre-line'>{data.comment}</span>
                {!usePage().props.canAssociate &&
                    <span className="text-gray-400">Non hai il permesso per accettare questa richiesta</span>
                }
            </div>
            {usePage().props.canAssociate &&
                <Link className="text-4xl button icon-button" href={route('emails.associate', { id: data.id })}>
                    <FontAwesomeIcon icon={faAnglesRight} />
                </Link>

            }
        </div>

    }

    // TYPE_PERSON
    return <div className={
        "w-full border-2 rounded  flex flex-row p-2 min-h-12 justify-center gap-2 leading-normal	" +
        (data.coorte > 0 ? ' border-primary-main' : ' border-[#00FF00]')}  >
        <div className="flex flex-col">
            <FontAwesomeIcon icon={faPerson} className="text-4xl" style={{ color: pastelColors[data.enabled ? 4 : 2] }} />
            <ReactSwitch
                height={14} width={28} className="m-2"
                checked={data.enabled} onChange={(newState) => setEnabled(data, newState)}
            />
        </div>
        <div className="grow flex flex-col">
            <b>{data.name} {data.surname}</b>
            {romanize(data.coorte)}
            {data.notes}
            {data.emails.map((e, i) => <EmailDiv key={e.id} isFirst={i == 0} e={e} setPrimary={setPrimary} deleteAddress={deleteAddress} />)}
            {canAddEmail &&
                <div className="cursor-pointer hover:text-primary-main text-sm" onClick={() => setAddingEmail(data)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Aggiungi indirizzo mail.
                </div>}
            <IdentityRoles identity={data} removeRole={removeRole} addRole={addRole} />
        </div>
    </div>
}

function stringifyData({ data }) {
    if (whichType(data) == TYPE_REQUEST)
        return data.address + " " + data.comment
    return data.name + " " + data.surname + " " + romanize(data.coorte) +
        " " + data.emails.map((e) => e.address).join(" ") +
        " " + data.roles.map((r) => r.name + " " + r.common_name).join(" ")
}

function ListAsATable({ identities, quickFilter, setPrimary, deleteAddress, removeRole, addRole, setEnabled, setAddingEmail }) {

    const theme = themeQuartz.withParams({
        headerHeight: 0,
        rowBorder: false,
        rowHoverColor: "#00000000",
        borderColor: "#00000000",
    })

    const columns = useMemo(() => [
        {
            field: 'main',
            cellRenderer: ({ value }) =>
                <IdentityContent data={value} setPrimary={setPrimary} deleteAddress={deleteAddress} removeRole={removeRole} addRole={addRole} setEnabled={setEnabled} setAddingEmail={setAddingEmail} />,
            filter: 'agTextColumnFilter',
            filterValueGetter: stringifyData,
            valueGetter: ({ data }) => data,
            autoHeight: true,
            flex: 1
        },
    ], [])

    return <div className='ag-theme-quartz w-full md:w-3/5 grow'>
        <AgGridReact
            rowData={identities}
            columnDefs={columns}
            quickFilterText={quickFilter}
            theme={theme}
            suppressCellFocus={true}
        />
    </div>
}

function emailDelete(e, setProcessing, setToDelete) {
    postRequest(
        'emails.delete',
        { id: e.id },
        setProcessing,
        {},
        false, false,
        () => setToDelete(null)
    );
}

function setPrimary(emailId, setProcessing) {
    postRequest(
        'emails.setPrimary',
        { id: emailId },
        setProcessing,
        {},
        false, false
    );
}

function removeRole(identity, role, setProcessing) {
    postRequest(
        'roles.remove',
        { identity: identity.id, role: role.id },
        setProcessing,
        {},
        false, false
    );
}

function addRole(identity, role, setProcessing) {
    postRequest(
        'roles.add',
        { identity: identity.id, role: role.id },
        setProcessing,
        {},
        false, false
    );
}

function setEnabled(identity, enabled, setProcessing) {
    postRequest(
        'identity.enabled',
        { identity: identity.id, enabled: enabled },
        setProcessing,
        {},
        false, false
    );
}


function ManuallyAddEmail({ open, setClosed, setProcessing }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        address: ''
    })

    transform((data) => ({
        ...data,
        identity: open?.id
    }))

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true)
        post(
            route('emails.manually_add'), {
                onSuccess: () => { setClosed(); setProcessing(false); },
                onError: () => { enqueueSnackbar('Errore, riprova!'); setProcessing(false); }
            });
    }

    return <EmptyDialog open={!!open} onClose={setClosed}>
        <form className="flex flex-col w-full" onSubmit={submit}>
            <h3>Inserisci nuovo indirizzo mail</h3>
            <b>{open?.name} {open?.surname}</b>
            {romanize(open?.coorte)}
            <label>Indirizzo</label>
            <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)} />
            <label className="error">{errors.address}</label>
            <input type="button" className="button mt-4" onClick={submit} value="Aggiungi" />
        </form>
    </EmptyDialog>
}

export default function List() {
    const data = usePage().props.list;
    const list = useMemo(() => data['requests'].concat(data['people']), [data]);
    const [quickFilter, setQuickFilter] = useState('')
    const [processing, setProcessing] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [addingEmail, setAddingEmail] = useState(null);

    return <div className="main-container-large h-[80vh] gap-1">
        <Head title="Metodi di accesso" />
        <div className="w-full flex flex-row justify-center gap-2">
            <input className="w-full md:w-1/2" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
            {usePage().props.canAddPeople &&
                <Link className="button flex flex-row items-baseline" href={route('person.add')}>
                    <FontAwesomeIcon icon={faCirclePlus} className="pr-1" />
                    Aggiungi persona
                </Link>
            }
        </div>
        <ManuallyAddEmail open={addingEmail} setClosed={() => setAddingEmail(null)} setProcessing={setProcessing} />
        <ListAsATable
            identities={list} quickFilter={quickFilter}
            setPrimary={(emailId) => setPrimary(emailId, setProcessing)}
            deleteAddress={(e) => setToDelete(e)}
            removeRole={(identity, role) => removeRole(identity, role, setProcessing)}
            addRole={(identity, role) => addRole(identity, role, setProcessing)}
            setEnabled={(identity, enabled) => setEnabled(identity, enabled, setProcessing)}
            setAddingEmail={(data) => setAddingEmail(data)}
        />
        <Backdrop open={processing} />
        <Dialog open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => emailDelete(toDelete, setProcessing, setToDelete)}>
            Sei sicuro di voler eliminare l'indirizzo mail {toDelete?.address}?
        </Dialog>
    </div>
}

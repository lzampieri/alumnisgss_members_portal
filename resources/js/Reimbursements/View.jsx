import { Head, Link, usePage } from "@inertiajs/react";
import { faCheckDouble, faFloppyDisk, faHandHoldingDollar, faPaperPlane, faPencil, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StateChip from "./StateChip";
import { NurDate } from "../Libs/DateEditor";
import TextareaAutosize from 'react-textarea-autosize';
import EmptyDialog from "../Layout/EmptyDialog";
import { faFirstdraft } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import { useDebouncedCallback } from 'use-debounce';
import { noninertiaPostRequest } from "../Utils";

function InternalNotes({reimbursement}) {
    const [notes, setNotes] = useState(reimbursement?.internal_notes || '');
    const [saving, setSaving] = useState(false);

    const sentToServer = useDebouncedCallback(
        // function
        (value) => {
            noninertiaPostRequest(
                'reimbursements.save_internal',
                { internal_notes: value },
                setSaving,
                { id: reimbursement.id }
            )
        },
        // delay in ms
        3000
    );


    const set = (newVal) => {
        setNotes(newVal);
        setSaving(true);
        sentToServer(newVal);
    }

    return <>
        <label>Note interne (non visibili al richiedente)</label>
        <TextareaAutosize
            className="w-full pretendToBeInput"
            minRows={3}
            value={notes}
            onChange={(e) => set(e.target.value)} />
        <div className="w-full flex flex-row justify-end">
            { saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faFloppyDisk} /> }
        </div>
    </>
}

function BackToDraft({ reimbursement }) {
    const [open, setOpen] = useState(false);

    return <>
        <div className="button" onClick={() => setOpen(true)}>
            <FontAwesomeIcon icon={faPencil} className="mr-2" />
            Rigetta richiesta
        </div>
        <EmptyDialog
            open={open}
            onClose={() => setOpen(false)}>
            <div>
            Stai per ripristinare la richiesta allo stato di <i>bozza</i>. Da lì, sono l'autore potrà modificarla.<br/>
            Attenzione: nessuna email di notifica sarà spedita. Rimane tuo compito avvisare il richiedente di modificare e reinviare la richiesta.
            </div>
            <div className="flex flex-row justify-center mt-4 gap-4">
                <div className="button" onClick={() => setOpen(false)}>
                    <FontAwesomeIcon icon={faXmark} className="mr-2" />
                    Annulla modifica
                </div>
                <Link className="button" href={route('reimbursements.backToDraft', { reimbursement: reimbursement.id })}>
                    <FontAwesomeIcon icon={faFirstdraft} className="mr-2" />
                    Ripristina come bozza
                </Link>
            </div>
        </EmptyDialog>
    </>
}

export default function View() {
    const reimbursement = usePage().props.reimbursement;
    console.log(reimbursement);

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title="Richiesta di rimborso" />
            <h3>Richiesta di rimborso</h3>
            <label className="unspaced">Identificativo: {reimbursement.iden}</label>

            { usePage().props.flash?.justSent &&
                <div className="info">
                    La richiesta di rimborso è stata inviata, riceverai a breve una mail di conferma. Se non ricevi la mail - nemmeno nello spam - contattaci: questa funzionalità è ancora in fase di sviluppo e può presentare qualche problema tecnico.
                </div>
            }
            { usePage().props.flash?.justApproved &&
                <div className="info">
                    La richiesta di rimborso è stata approvata, riceverai a breve una mail di conferma. Se non ricevi la mail - nemmeno nello spam - contattaci: questa funzionalità è ancora in fase di sviluppo e può presentare qualche problema tecnico.
                </div>
            }

            <div className="flex flex-col my-4 border-l-4 pl-2 border-l-primary-main">
                <ul>
                    <li><StateChip value={reimbursement.state} /></li>
                    {
                        reimbursement.sent &&
                        <li><FontAwesomeIcon icon={faPaperPlane} className="mr-2" />Inviata {new NurDate(reimbursement.sent).toLiteral()} da {reimbursement.author.name} {reimbursement.author.surname}</li>
                    }
                    {
                        reimbursement.approved &&
                        <li><FontAwesomeIcon icon={faCheckDouble} className="mr-2" />Approvata {new NurDate(reimbursement.approved).toLiteral()} da {reimbursement.approver.name} {reimbursement.approver.surname}</li>
                    }
                    {
                        reimbursement.paid &&
                        <li><FontAwesomeIcon icon={faHandHoldingDollar} className="mr-2" />Pagata {new NurDate(reimbursement.paid).toLiteral()} da {reimbursement.payer.name} {reimbursement.payer.surname}</li>
                    }
                </ul>
            </div>

            <object data={route('reimbursements.receipt',{ reimbursement: reimbursement.id  })} type="application/pdf" className="w-full h-[80vh]">
                <p>Caricamento in corso...</p>
            </object>

            { reimbursement?.can_internal && <InternalNotes reimbursement={reimbursement} /> }

            { reimbursement?.can_approve && <div className="flex flex-row justify-center mt-4 gap-4">
                    <BackToDraft reimbursement={reimbursement} />
                    <Link className="button" href={route('reimbursements.approve', { reimbursement: reimbursement.id })}>
                        <FontAwesomeIcon icon={faCheckDouble} className="mr-2" />
                        Approva richiesta
                    </Link>
                </div>
            }
            
            { reimbursement?.can_pay && <div className="flex flex-row justify-center mt-4 gap-4">
                    <BackToDraft reimbursement={reimbursement} />
                    <Link className="button" href={route('reimbursements.pay', { reimbursement: reimbursement.id })}>
                        <FontAwesomeIcon icon={faHandHoldingDollar} className="mr-2" />
                        Segna come pagata
                    </Link>
                </div>
            }
        </div>
    )
}

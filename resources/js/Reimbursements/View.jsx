import { Head, Link, usePage } from "@inertiajs/react";
import { faPaperPlane, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StateChip from "./StateChip";
import { NurDate } from "../Libs/DateEditor";

export default function View() {
    const reimbursement = usePage().props.reimbursement;
    const justSent = usePage().props.flash?.justSent;

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title="Richiesta di rimborso" />
            <h3>Richiesta di rimborso</h3>
            <label className="unspaced">Identificativo: {reimbursement.iden}</label>

            { justSent &&
                <div className="info">
                    La richiesta di rimborso è stata inviata, riceverai a breve una mail di conferma. Se non ricevi la mail - nemmeno nello spam - contattaci: questa funzionalità è ancora in fase di sviluppo e può presentare qualche problema tecnico.
                </div>
            }

            <div className="flex flex-col my-4 border-l-4 pl-2 border-l-primary-main">
                <ul>
                    <li><StateChip value={reimbursement.state} /></li>
                    {
                        reimbursement.sent &&
                        <li>Inviata {new NurDate(reimbursement.sent).toLiteral()} da {reimbursement.author.name} {reimbursement.author.surname}</li>
                    }
                    {
                        reimbursement.approved &&
                        <li>Approvata {new NurDate(reimbursement.approved).toLiteral()} da {reimbursement.approver.name} {reimbursement.approver.surname}</li>
                    }
                    {
                        reimbursement.paid &&
                        <li>Pagata {new NurDate(reimbursement.paid).toLiteral()} da {reimbursement.payer.name} {reimbursement.payer.surname}</li>
                    }
                </ul>
            </div>

            <object data={route('reimbursements.receipt',{ reimbursement: reimbursement.id  })} type="application/pdf" className="w-full h-[80vh]">
                <p>Caricamento in corso...</p>
            </object>
        </div>
    )
}

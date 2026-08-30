import { Head, Link, usePage } from "@inertiajs/react";
import { faPaperPlane, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Review() {
    const reimbursement = usePage().props.reimbursement;

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title="Anteprima richiesta di rimborso" />
            <h3>Anteprima richiesta di rimborso</h3>
            <label className="unspaced">Identificativo: {reimbursement.iden}</label>

            <div className="alert">
                Attenzione! La richiesta di rimborso non è ancora stata inviata!<br/>
                Verifica l'anteprima qui sotto e invia la richiesta in fondo alla pagina.
            </div>

            <object data={route('reimbursements.receipt',{ reimbursement: reimbursement.id  })} type="application/pdf" className="w-full h-[80vh]">
                <p>Caricamento in corso...</p>
            </object>

            <div className="flex flex-row justify-center mt-4 gap-4">
                <Link className="button" href={route('reimbursements.edit', { id: reimbursement.id })}>
                    <FontAwesomeIcon icon={faPencil} className="mr-2" />
                    Modifica bozza
                </Link>
                <Link className="button" href={route('reimbursements.send', { id: reimbursement.id })}>
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                    Conferma richiesta
                </Link>
            </div>
        </div>
    )
}

import { Head, useForm, usePage } from "@inertiajs/react";
import Backdrop from "../Layout/Backdrop";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import { enqueueSnackbar } from "notistack";

export default function Edit() {
    const prevDraft = usePage().props.newsletter;

    const { data, setData, post, processing, errors, isDirty } = useForm({
        subject: prevDraft.subject || "",
        body: prevDraft.body || "",
        to: prevDraft.to || [],
    })

    // const saveDraft = (e) => {
    //     e.preventDefault();
    //     post(route('board.edit', { document: prevDoc.id }));
    // }

    // const submitDelete = () => {
    //     router.post(route('board.delete', { document: prevDoc.id }));
    // }

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
                <button className="button self-end">Salva bozza</button>
                <button className="button self-end">Anteprima e invio</button>
            </form>
            <Backdrop open={processing} />
        </div>
    );
}
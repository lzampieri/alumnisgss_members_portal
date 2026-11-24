import { useEffect, useMemo, useState } from "react";
import BlocksViewer from "../../Blocks/BlocksViewer";
import BlockParser from "../../Blocks/BlockParser";
import { Link, useForm } from "@inertiajs/react";
import Backdrop from "../../Layout/Backdrop";
import EmptyDialog from "../../Layout/EmptyDialog";
import { faHeartCrack, faLock, faSmile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactSwitch from "react-switch";
import { Collapse } from "react-collapse";


export default function FormWrapper({ content, resource }) {
    const isForm = useMemo(() =>
        content?.map(block => BlockParser.isForm(block)).reduce((pVal, cVal) => pVal || cVal, false), [content])

    const [sendCopy, setSendCopy] = useState(false)
    const [emailCopy, setEmailCopy] = useState("")
    const [errorDialog, setErrorDialog] = useState(false)
    const [successDialog, setSuccessDialog] = useState(false)

    useEffect(() => setEmailCopy(""), [sendCopy]);

    if (!isForm)
        return <BlocksViewer content={content} />

    const { data, setData, processing, post, transform, reset } = useForm(
        content?.reduce((dd, block) => {
            if (BlockParser.isForm(block))
                dd[block.id] = '';
            return dd;
        }, {}),
    )

    transform((data) => { return { 'data': JSON.stringify(data), "form_email_to": emailCopy } })

    const save = () => {
        post(route('resources.saveForm', { resource: resource.id }), {
            onError: () => setErrorDialog(true),
            onSuccess: () => { setSuccessDialog(true); reset(); setSendCopy(false) }
        })
    }

    return <>
        {resource.canEdit && <div className="bg-indigo-200 p-2 rounded-xl w-full flex flex-col">
            <div>Questa risorsa è un modulo compilabile. Al momento risultano <b>{resource.responses_count || 0}</b> risposte.</div>
            <Link className="button self-end" href={route('resources.responses', { resource: resource.id })}>Vedi le risposte</Link>
        </div>}
        {!resource.form_open && <div className="bg-red-300 p-2 rounded-xl w-full">
            Questo modulo al momento non accetta risposte.
        </div>}
        <BlocksViewer content={content} data={data} setData={setData} />
        <div className="flex flex-row items-center mt-8">
            <ReactSwitch
                height={14} width={28} className="m-2"
                checked={sendCopy} onChange={setSendCopy}
            />
            <p>Inviami una copia delle mie risposte</p>
        </div>
        <Collapse theme={{ collapse: "w-full cpm" }} isOpened={sendCopy}>
            <label>a questo indirizzo mail:</label>
            <input type="email" className="w-full" value={emailCopy} onChange={(e) => setEmailCopy(e.target.value)} />
        </Collapse>
        {!!resource.form_open && <div className="self-end button mt-2" onClick={save}>
            Invia
        </div>}
        <Backdrop open={processing} />
        <EmptyDialog open={errorDialog} onClose={() => setErrorDialog(false)}>
            <span className="w-full text-center">
                <FontAwesomeIcon icon={faLock} className="text-4xl text-white bg-primary-main rounded-2xl p-8 " />
            </span>
            <div className="w-full text-center py-8">
                <b>C'è stato un errore, riprova ad inviare</b>
            </div>
            <div className="self-center button" onClick={() => setErrorDialog(false)}>
                Ok
                <FontAwesomeIcon icon={faHeartCrack} className="pl-2" />
            </div>
        </EmptyDialog>
        <EmptyDialog open={successDialog} onClose={() => setSuccessDialog(false)}>
            <div className="w-full text-center py-8">
                <b>Form inviato con successo!</b>
            </div>
            <div className="self-center button" onClick={() => setSuccessDialog(false)}>
                <FontAwesomeIcon icon={faSmile} className="pl-2" />
            </div>
        </EmptyDialog>
    </>
}
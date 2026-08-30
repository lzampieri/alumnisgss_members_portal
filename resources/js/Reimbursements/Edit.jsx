import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Material, materialProps, Travel, travelProps } from "./Edit_Expense";
import { faPaperPlane, faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EditFirstPart } from "./Edit_FirstPart";
import TextareaAutosize from 'react-textarea-autosize';
import { autosave } from "./Edit_Backend";
import Backdrop from "../Layout/Backdrop";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Driving, drivingProps } from "./Edit_Driving";
import { enqueueSnackbar } from "notistack";
import { NurDate } from "../Libs/DateEditor";
import axios from "axios";

function getId(arr) {
    let next = 0;
    arr.forEach(element => {
        if (element.id > next) {
            next = parseInt(element.id);
        }
    })
    return next + 1;
}

function parseContent(content) {
    let parsed = [];
    content.forEach(element => {
        if (element.type == "material") {
            parsed.push(materialProps(element.id, element));
        } else if (element.type == "travel") {
            parsed.push(travelProps(element.id, element));
        } else if (element.type == "driving") {
            parsed.push(drivingProps(element.id, element));
        }
    });
    return parsed;
}

function getKeyText( key, value ) {
    let value_t = Array.isArray(value) ? value.join(", ") : value;
    if( key == "project_id" ) return "Progetto: " + value_t;
    if( key == "motivation" ) return "Incarico: " + value_t;
    if( key == "IBAN" ) return "IBAN: " + value_t;
    if( key == "holder" ) return "Titolare del conto: " + value_t;
    if( key == "bank" ) return "Banca: " + value_t;
    if( key == "content" ) return "Voci di spesa: " + value_t;
    if( key == "content_errors" ) return "Vi sono degli errori nelle spese inserite";
}

export default function Edit() {
    const reimbursement = usePage().props.reimbursement;
    const refToData = useRef(null);
    const refToLastSavedData = useRef("");

    const remove = useCallback((id) => {
        if (refToData.current) {
            setData('content', [...refToData.current.content.filter((e) => e.id != id)]);
        }
    }, [refToData]);

    const [carsList,setCarsList] = useState([]);
    useEffect(() => {
        async function loadCars() {
            const res = await axios.get(route('reimbursements.aciTable'));
            setCarsList(res.data);
        }
        loadCars();
    }, []);

    const setDataAtId = useCallback((newprops) => {
        if (refToData.current) {
            const newData = structuredClone(refToData.current.content);
            newData.forEach((e) => {
                if (e.date) { // Avoid issues with structuredClone serializing NurDate
                    e.date = new NurDate(e.date.date);
                }
                if (e.id == newprops.id) {
                    Object.assign(e, newprops);
                }
            })
            setData('content', newData);
        }
    }, [refToData]);

    const { data, setData, processing, errors, post } = useForm({
        project_id: reimbursement.project_id,
        motivation: reimbursement.motivation || "",
        IBAN: reimbursement.author.collaborator.IBAN || "",
        holder: reimbursement.author.collaborator.holder || "",
        bank: reimbursement.author.collaborator.bank || "",
        notes: reimbursement.notes || "",
        content: parseContent(reimbursement.content || [])
    })

    useEffect(() => {
        refToData.current = data;
    }, [data]);

    // Autosaver!
    useEffect(() => {
        const interval = setInterval(() => {
            autosave(refToData, refToLastSavedData, reimbursement.id);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const saveDraft = (e) => {
        e.preventDefault();
        post(route('reimbursements.save_draft', reimbursement.id));
    }

    const send = (e) => {
        e.preventDefault();
        post(route('reimbursements.save_final', reimbursement.id), {
            onError: () => {
                enqueueSnackbar('Ci sono degli errori, verifica tutti i campi', { variant: 'error' })
            },
        });
    }

    let content_errors = {};
    if( errors.content_errors )
        content_errors = JSON.parse(errors.content_errors);

    return (
        <div className="flex flex-col w-full md:w-3/5">
            <Head title="Richiesta di rimborso" />
            <h3>Richiesta di rimborso</h3>
            <label className="unspaced">Identificativo: {reimbursement.iden}</label>

            { Object.keys(errors).length > 0 && <div className="alert">
                { Object.keys(errors).map(k =>
                    <p key={k}>{getKeyText(k,errors[k])}</p>
                ) }
            </div> }

            <EditFirstPart
                data={{
                    project_id: data.project_id,
                    motivation: data.motivation,
                    IBAN: data.IBAN,
                    holder: data.holder,
                    bank: data.bank
                }}
                setData={setData}
                errors={errors}
            />

            <div className="w-full rounded bg-blue-100 mt-4 p-2">
                <h4>Materiali didattici</h4>
                {data.content.map((e) => e.type == "material" && <Material key={e.id} data={e} setData={setDataAtId} remove={remove} errors={content_errors[e.id]} />)}
                <div className="flex flex-row justify-end">
                    <div className="chip-button" onClick={() => setData('content', [...data.content, materialProps(getId(data.content))])}>
                        Aggiungi
                        <FontAwesomeIcon icon={faPlus} className="ml-2" />
                    </div>
                </div>
            </div>

            <div className="w-full rounded bg-red-100 mt-4 p-2">
                <h4>Mezzi di transporto pubblici e pedaggi</h4>
                {data.content.map((e) => e.type == "travel" && <Travel key={e.id} data={e} setData={setDataAtId} remove={remove} errors={content_errors[e.id]} />)}
                <div className="flex flex-row justify-end">
                    <div className="chip-button" onClick={() => setData('content', [...data.content, travelProps(getId(data.content))])}>
                        Aggiungi
                        <FontAwesomeIcon icon={faPlus} className="ml-2" />
                    </div>
                </div>
            </div>

            <div className="w-full rounded bg-green-100 mt-4 p-2">
                <h4>Viaggi in auto privata</h4>
                <APIProvider apiKey={import.meta.env.VITE_PUBLIC_MAPS_API_KEY}
                    version={'beta'}>
                    {data.content.map((e) => e.type == "driving" && <Driving key={e.id} data={e} setData={setDataAtId} remove={remove} errors={content_errors[e.id]} carsList={carsList} />)}
                </APIProvider>
                <div className="flex flex-row justify-end">
                    <div className="chip-button" onClick={() => setData('content', [...data.content, drivingProps(getId(data.content))])}>
                        Aggiungi
                        <FontAwesomeIcon icon={faPlus} className="ml-2" />
                    </div>
                </div>
            </div>

            <label>Totali</label>
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="w-1/2">Totale materiali didattici</td>
                        <td className="w-1/2 text-right">€ {data.content.filter((e) => e.type == "material").reduce((a, b) => a + b.price, 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="w-1/2">Totale mezzi di transporto</td>
                        <td className="w-1/2 text-right">€ {data.content.filter((e) => e.type == "travel").reduce((a, b) => a + b.price, 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="w-1/2">Totale auto privata (stimato)</td>
                        <td className="w-1/2 text-right">€ {data.content.filter((e) => e.type == "driving").reduce((a, b) => a + b.price, 0).toFixed(2)}</td>
                    </tr>
                    <tr className="font-bold">
                        <td className="w-1/2">Totale</td>
                        <td className="w-1/2 text-right">€ {data.content.reduce((a, b) => a + b.price, 0).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <label>Annotazioni e richieste</label>
            <TextareaAutosize
                className="w-full pretendToBeInput"
                minRows={3}
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)} />
            <label className="error">{errors.notes}</label>

            <div className="flex flex-row justify-center mt-4 gap-4">
                <div className="button" onClick={saveDraft}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Salva bozza
                </div>
                <div className="button" onClick={send}>
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                    Invia richiesta
                </div>
            </div>

            <Backdrop open={processing} />
        </div>
    )
}

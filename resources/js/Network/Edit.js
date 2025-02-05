import { Link, useForm, usePage } from "@inertiajs/react";
import React, { Fragment, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { enqueueSnackbar } from "notistack";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import Backdrop from "../Layout/Backdrop";
import ADetailsType from "./ADetailsType";

function DetailRow({ data, setData, options, val_options, errors, errors_prename }) {
    return <><div className={"w-full flex flex-row my-1 gap-1 items-center " + (data.delete ? "text-error line-through	" : "")}>
        <CreatableSelect
            className="basis-0 grow"
            value={{ value: data.key, label: data.key }}
            onChange={(e) => setData('key', e.value)}
            options={options} />
        :
        <CreatableSelect
            className="basis-0 grow"
            value={{ value: data.value, label: data.value }}
            onChange={(e) => setData('value', e.value)}
            options={val_options} />
        <button className={"icon-button h-8 w-8 grow-0 " + (data.delete ? "button-active" : "")} onClick={(e) => { e.preventDefault(); setData('delete', !data.delete) }}>
            <FontAwesomeIcon icon={solid('trash')} />
        </button>
    </div>
        <label className="error">{errors[errors_prename + "key"]}</label>
        <label className="error">{errors[errors_prename + "value"]}</label>
        <label className="error">{errors[errors_prename + "delete"]}</label>
    </>
}

export default function Edit() {
    const alumnus = usePage().props.alumnus;

    const adts = usePage().props.adts;

    const { data, setData, post, processing, errors } = useForm({
        adts: adts.map((adt) => {
            return {
                id: adt.id,
                value: (adt.a_details && (adt.a_details.length == 1)) ? adt.a_details[0].value : []
            }
        })
    })

    const submit = (e) => {
        e.preventDefault();
        post(route('network.edit', { alumnus: alumnus.id }),
            { preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }) }
        );
    }

    return (
        <form className="flex flex-col w-full md:w-3/5 items-start gap-2" onSubmit={submit}>
            <div className="flex flex-row justify-between w-full">
                <Link className="button flex flex-row items-center self-start mb-4" href={route('network')}>
                    <FontAwesomeIcon icon={solid('chevron-left')} />
                    Indietro
                </Link>
                <div className="button flex flex-row items-center self-start mb-4" onClick={submit}>
                    <FontAwesomeIcon icon={solid('save')} />
                    Salva
                </div>
            </div>
            <h3>{alumnus.name} {alumnus.surname}</h3>
            <div className="flex flex-row w-full flex-wrap">
                <div className="chip group relative z-auto" style={bgAndContrast('6b7280')} key='coorte'>
                    {romanize(alumnus.coorte)} coorte
                </div>

                <div className="chip group relative z-auto" style={bgAndContrast(AlumnusStatus.status[alumnus.status].color)}>
                    {AlumnusStatus.status[alumnus.status].label}
                </div>

                {alumnus.tags?.map(i =>
                    <div className="chip group relative z-auto" style={bgAndContrast('#1f77b4')} key={i}>
                        {i}
                    </div>)}

            </div>

            {
                adts.map((adt, i) => <Fragment key={adt.id}>
                    <label key={"label_" + adt.id}>{adt.name}</label>
                    {adt.type in ADetailsType.values &&
                        ADetailsType.values[adt.type].editor(
                            adt,
                            data.adts[i].value,
                            (newValue) => {
                                let newAdts = data.adts.slice();
                                newAdts[i].value = newValue;
                                setData('adts', newAdts);
                            }
                        )
                    }
                    {(("adts." + i + ".value" in errors) || ("adts." + i + ".id" in errors)) &&
                        <label className="error">C'è un problema con questo dato</label>}
                </Fragment>)
            }

            {/*
            <label>Altri dettagli</label>
            <label className="error">{errors.details}</label>
            {data.details.map((det, idx) =>
                <DetailRow
                    key={idx}
                    data={det}
                    setData={(k, v) => updateDetails(idx, k, v)}
                    options={details_keys_options}
                    val_options={details_values_options[det.key]}
                    errors={errors}
                    errors_prename={"details." + idx + "."}
                />
            )}
            <button className="icon-button h-8 w-8 grow-0" onClick={(e) => { e.preventDefault(); addDetails() }}>
                <FontAwesomeIcon icon={solid('circle-plus')} />
            </button>
            */}

            <div className="flex flex-row justify-between w-full">
                <div className="button flex flex-row items-center self-start mb-4" onClick={submit}>
                    <FontAwesomeIcon icon={solid('save')} />
                    Salva
                </div>
            </div>

            <Backdrop open={processing} />

        </form>
    );
}
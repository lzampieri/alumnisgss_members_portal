import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { Fragment, useState } from "react";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import Dialog from '../Layout/Dialog';
import { router } from "@inertiajs/react";


import { enqueueSnackbar } from "notistack";
import TokenizableInput from "../Libs/react-tokenizable-inputs/TokenizableInput";
import Backdrop from "../Layout/Backdrop";
import ADetailsType from "./ADetailsType";
import SmartChip from "./SmartChip";
import { faChevronLeft, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
            {
                preserveState: "errors",
                onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }),
                onSuccess: () => window.history.back()
            }
        );
    }

    return (
        <form className="flex flex-col w-full md:w-3/5 items-start gap-2" onSubmit={submit}>
            <Head title={alumnus.name + " " + alumnus.surname} />
            <div className="flex flex-row justify-between w-full">
                <div className="button flex flex-row items-center self-start mb-4" onClick={() => window.history.back()} >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Indietro
                </div>
                <div className="button flex flex-row items-center self-start mb-4" onClick={submit}>
                    <FontAwesomeIcon icon={faSave} />
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

            {alumnus.consent_to_network_share ?
                <SmartChip content="Dettagli visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                <SmartChip content="Dettagli visibili solo allo staff" style={bgAndContrastPastel(2)} />
            }

            <div className="flex flex-row w-full flex-wrap">
                {alumnus.visible_emails?.map((email) => <SmartChip style={bgAndContrastPastel(1)} content={email.address} key={email.id} />)}
            </div>

            {alumnus.consent_to_email_share ?
                <SmartChip content="Indirizzi mail visibili a tutti i soci registrati" style={bgAndContrastPastel(4)} /> :
                <SmartChip content="Indirizzi mail visibili solo allo staff" style={bgAndContrastPastel(2)} />
            }

            {
                adts.map((adt, i) => <Fragment key={adt.id}>
                    <label key={"label_" + adt.id}>{adt.name} {!adt.visible && <i> - Campo nascosto</i>}</label>
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

            <div className="flex flex-row w-full justify-end">
                <div className="button flex flex-row items-center self-start mb-4" onClick={submit}>
                    <FontAwesomeIcon icon={faSave} />
                    Salva
                </div>
            </div>

            <Backdrop open={processing} />

        </form>
    );
}
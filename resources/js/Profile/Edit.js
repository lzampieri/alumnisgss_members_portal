import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Fragment } from "react";
import ADetailsType from "../Network/ADetailsType";
import SmartChip from "../Network/SmartChip";
import Backdrop from "../Layout/Backdrop";

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
        post(route('profile.edit', { alumnus: alumnus.id }),
            { preserveState: "errors", onError: () => enqueueSnackbar('C\'è stato un errore, verifica tutti i campi', { variant: 'error' }) }
        );
    }

    return (
        <form className="flex flex-col w-full md:w-3/5 items-start gap-2" onSubmit={submit}>
            <Head title="Modifica profilo" />
            <div className="flex flex-row justify-between w-full">
                <Link className="button flex flex-row items-center self-start mb-4" href={route('profile')}>
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
                    <FontAwesomeIcon icon={solid('save')} />
                    Salva
                </div>
            </div>

            <Backdrop open={processing} />

        </form>
    );
}
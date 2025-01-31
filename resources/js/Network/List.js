import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, bgAndContrastPastel, romanize } from "../Utils";
import { useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import SmartChip from "./SmartChip";

function AlumnusContent({ data }) { // TODO Reimplementare
    return <div className="w-full border border-primary-main flex flex-col p-2 min-h-[3rem] justify-center gap-2">
        <div className="w-full flex flex-row items-center">
            <div className="ml-2 font-bold">
                {data.name} {data.surname}
            </div>
            <div className="grow text-end mx-1">
                <Link className="icon-button" href={route('network.edit', { alumnus: data.id })}><FontAwesomeIcon icon={solid('pen')} /></Link>
            </div>
        </div>
        <div className="w-full flex flex-row justify-start flex-wrap">
            <SmartChip style={bgAndContrast(AlumnusStatus.status[data.status].color)} key='status' content={AlumnusStatus.status[data.status].label} />
            <SmartChip style={bgAndContrastPastel(-1)} key='coorte' content={romanize(data.coorte) + " coorte"} />
            {/* TODO implementare "Onorari */}
        </div>
        <div className="w-full flex flex-row justify-start flex-wrap gap-y-2">
            {data.arrayable_details?.map((adts, i) =>
                adts?.value?.map((adt,j) =>
                    <SmartChip content={adt} key={adts.id + "|" + j} style={bgAndContrastPastel(i)} />
                )
            )}
        </div>
    </div>
}

function Alumnus({ data, quickFilter }) {
    const visible = filterable(data).toLowerCase().includes(quickFilter.toLowerCase())
    const spring = useSpring({ height: visible ? "3rem" : "0rem" })

    return (
        <animated.div className="w-full grow-0 shrink-0 truncate"
        // style={spring} // TODO reintroduce spring
        >
            {useMemo(() => <AlumnusContent data={data} />, [data])}
        </animated.div>
    )
}

function filterable(alumnus) {
    // TODO implement better
    return (alumnus.name + " " + alumnus.surname + " " + alumnus.name + (alumnus.tags || []).join() + alumnus.status + AlumnusStatus.status[alumnus.status].label).toLowerCase()
}

export default function List() {
    const alumni = usePage().props.alumni;
    const [quickFilter, setQuickFilter] = useState('')

    return <div className="main-container-large md:h-[80vh] gap-1">
        <div className="w-full flex flex-row justify-center gap-2">
            <input className="w-full md:w-1/2" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
            {usePage().props.canEditView &&
                <Link className="button flex flex-row items-baseline" href={route('network.settings')}>
                    <FontAwesomeIcon icon={solid('gear')} />
                    Impostazioni
                </Link>
            }
        </div>
        <div className="w-full md:w-3/5 grow flex flex-col overflow-y-scroll">
            {alumni.map((alumnus, i) => <Alumnus key={i} data={alumnus} quickFilter={quickFilter} />)}
        </div>
    </div>
}

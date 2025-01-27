import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import { useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

function AlumnusContent({ data }) { // TODO Reimplementare
    return <div className="w-full h-full border border-primary-main flex flex-row items-center">
        <div className="chip mx-1 group relative z-auto" style={bgAndContrast(AlumnusStatus.status[data.status].color)}>
            {AlumnusStatus.status[data.status].acronym}
            {data.pending_ratifications > 0 && <FontAwesomeIcon icon={solid('hourglass-half')} />}
            <span className="tooltip-right" style={bgAndContrast(AlumnusStatus.status[data.status].color)}>
                {AlumnusStatus.status[data.status].label}
                {data.pending_ratifications > 0 && " - in attesa di ratifica"}
            </span>
        </div>
        <div className="shrink truncate">
            {data.name} {data.surname}
        </div>
        <div className="grow text-end mx-1">
            <Link className="icon-button" href={route('registry.edit', { alumnus: data.id })}><FontAwesomeIcon icon={solid('pen')} /></Link>
        </div>
    </div>
}

function Alumnus({ data, quickFilter }) {
    const visible = filterable(data).toLowerCase().includes(quickFilter.toLowerCase())
    const spring = useSpring({ height: visible ? "3rem" : "0rem" })

    return (
        <animated.div className="w-full grow-0 shrink-0 truncate" style={spring} >
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
        <div className="w-full flex flex-row justify-center">
            <input className="w-full md:w-1/2" type='text' value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} placeholder='Cerca...' />
        </div>
        <div className="w-full grow flex flex-col overflow-y-scroll">
            {alumni.map((alumnus, i) => <Alumnus key={i} data={alumnus} quickFilter={quickFilter} />)}
        </div>
    </div>
}

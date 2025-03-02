import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import { useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
// import RegistryHeader from "./RegistryHeader";

function AlumnusContent({ data }) {
    return <div className="w-full h-full border border-primary-main flex flex-row items-center">
        <div className="chip mx-1 group relative z-auto" style={bgAndContrast(AlumnusStatus.status[data.status].color)}>
            {AlumnusStatus.status[data.status].acronym}
            <span className="tooltip-right" style={bgAndContrast(AlumnusStatus.status[data.status].color)}>
                {AlumnusStatus.status[data.status].label}
            </span>
        </div>
        <div className="shrink truncate">
            {data.name} {data.surname}
        </div>
    </div>
}

function AlumnusItem({ data, visible }) {
    const spring = useSpring({ height: visible ? "3rem" : "0rem" })

    return (
        <animated.div className="w-full grow-0 shrink-0 truncate" style={spring} >
            {useMemo(() => <AlumnusContent data={data} />, [data])}
        </animated.div>
    )
}

function CoorteItem({ coorte, data, visibles }) {
    const spring = useSpring({ width: visibles.some((a) => a) ? "300px" : "0px" })

    return <animated.div className="grow-0 shrink-0 flex flex-col" style={spring}>
        <div className="w-full px-1">
            <div className="bg-primary-main text-primary-contrast font-bold text-center rounded-t-md h-[2rem] flex flex-col justify-center">
                <span>{coorte > 0 ? romanize(coorte) + " coorte" : "Onorari"}</span>
            </div>
            {data.map((alumnus, i) => useMemo(() => <AlumnusItem key={i} data={alumnus} visible={visibles[i]} />, [alumnus, visibles[i]]))}
        </div>
    </animated.div>

}

function filterable(alumnus) {
    return (alumnus.name + " " + alumnus.surname + " " + alumnus.name + alumnus.status + AlumnusStatus.status[alumnus.status].label).toLowerCase()
}

function CoorteColumns({ coorte, data, quickFilter }) {
    const visibles = data.map(alumnus => filterable(alumnus).toLowerCase().includes(quickFilter.toLowerCase()))

    return useMemo(() => <CoorteItem coorte={coorte} data={data} visibles={visibles} />, [JSON.stringify(visibles)])
}

function Counters({ member, student_member }) {
    return <div className="w-full flex flex-row justify-center mb-8">
        <div className="flex flex-col justify-right text-right basis-0 grow">
            <div className="text-6xl">{member}</div>
            <div className="text-xl italic">Soci</div>
        </div>
        <div className="separator"></div>
        <div className="flex flex-col justify-left text-left basis-0 grow">
            <div className="text-6xl">{student_member}</div>
            <div className="text-xl italic">Soci studenti</div>
        </div>
    </div>
}

export default function List() {
    const data = usePage().props.data;
    const [quickFilter, setQuickFilter] = useState('')
    const counts = usePage().props.counts;

    return (
        <div className="main-container-large gap-1">
            <Counters {...counts} />
            <div className="w-full md:w-3/5 relative mb-4">
                <input type="text" className="w-full text-center" placeholder="Cerca..." value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)} />
                <FontAwesomeIcon icon={solid('magnifying-glass')} className="input-icon" />
            </div>
            <div className="w-full grow overflow-x-scroll flex flex-row">
                {Object.keys(data).map( coorte => <CoorteColumns key={coorte} coorte={coorte} data={data[coorte]} quickFilter={quickFilter} />)}
            </div>
        </div>
    );
}
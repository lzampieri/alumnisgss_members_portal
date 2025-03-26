import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import { useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import RegistryHeader from "./RegistryHeader";

function AlumnusContent({ data, tagsDict }) {
    return <div className="w-full h-full border border-primary-main flex flex-row items-center">
        <div className="chip mx-1 group relative z-auto" style={bgAndContrast(AlumnusStatus.status[data.status].color)}>
            {AlumnusStatus.status[data.status].acronym}
            {data.pending_ratifications_count > 0 && <FontAwesomeIcon icon={solid('hourglass-half')} />}
            <span className="tooltip-right" style={bgAndContrast(AlumnusStatus.status[data.status].color)}>
                {AlumnusStatus.status[data.status].label}
                {data.pending_ratifications_count > 0 && " - in attesa di ratifica"}
            </span>
        </div>
        <div className="shrink truncate">
            {data.name} {data.surname}
        </div>
        {data.tags?.map(i =>
            <div className="chip mx-1 group relative z-auto" style={bgAndContrast('#1f77b4')} key={i}>
                {tagsDict[i]}
                <span className="tooltip-right" style={bgAndContrast('#1f77b4')}>
                    {i}
                </span>
            </div>)}
        <div className="grow text-end mx-1">
            <Link className="icon-button" href={route('registry.edit', { alumnus: data.id })}><FontAwesomeIcon icon={solid('pen')} /></Link>
        </div>
    </div>
}

function AlumnusItem({ data, tagsDict, visible }) {
    const spring = useSpring({ height: visible ? "3rem" : "0rem" })

    return (
        <animated.div className="w-full grow-0 shrink-0 truncate" style={spring} >
            {useMemo(() => <AlumnusContent data={data} tagsDict={tagsDict} />, [data])}
        </animated.div>
    )
}

function CoorteItem({ coorte, data, tagsDict, visibles }) {
    const spring = useSpring({ width: visibles.some((a) => a) ? "300px" : "0px" })

    return <animated.div className="grow-0 shrink-0 flex flex-col" style={spring}>
        <div className="w-full px-1">
            <div className="bg-primary-main text-primary-contrast font-bold text-center rounded-t-md h-[2rem] flex flex-col justify-center">
                <span>{coorte > 0 ? romanize(coorte) + " coorte" : "Onorari"}</span>
            </div>
            {data.map((alumnus, i) => useMemo(() => <AlumnusItem key={i} data={alumnus} tagsDict={tagsDict} visible={visibles[i]} />, [alumnus, visibles[i]]))}
        </div>
    </animated.div>

}

function filterable(alumnus) {
    return (alumnus.name + " " + alumnus.surname + " " + alumnus.name + (alumnus.tags || []).join() + alumnus.status + AlumnusStatus.status[alumnus.status].label).toLowerCase()
}

function CoorteColumns({ coorte, data, tagsDict, quickFilter }) {
    const visibles = data.map(alumnus => filterable(alumnus).toLowerCase().includes(quickFilter.toLowerCase()))

    return useMemo(() => <CoorteItem coorte={coorte} data={data} tagsDict={tagsDict} visibles={visibles} />, [JSON.stringify(visibles)])
}

function flatten(array, extractFn) {
    return array.map(i => extractFn(i) || []).flat()
}

export default function Schema() {
    const data = usePage().props.data;

    const tagsDict = useMemo(() => {
        const tagsList = [...new Set(flatten( Object.entries(data), ([_, cl]) => flatten(cl, (al) => al.tags)))];
        const tagsDict = {}
        tagsList.forEach(i => {
            let letters = 1;
            while (Object.values(tagsDict).includes(i.substring(0, letters).toUpperCase())) letters += 1;
            tagsDict[i] = i.substring(0, letters).toUpperCase();
        });
        return tagsDict
    }, [data])

    const [quickFilter, setQuickFilter] = useState('')

    return (
        <div className="main-container-large h-[80vh] gap-1">
            <RegistryHeader where='schema' quickFilter={quickFilter} setQuickFilter={setQuickFilter} />
            <div className="w-full grow overflow-scroll flex flex-row">
                {Object.entries(data).map(([coorte,content]) => <CoorteColumns key={coorte} coorte={coorte} data={content} tagsDict={tagsDict} quickFilter={quickFilter} />)}
            </div>
        </div>
    );
}
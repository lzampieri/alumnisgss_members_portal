import { usePage } from '@inertiajs/react';
import ListTemplate from "../Registry/ListTemplate";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";

function AlumnusItem(alumnus) {
    return (
        <div className="mylist-item flex flex-row p-2">
            {alumnus.surname} {alumnus.name}
            <div className="chip">{romanize(alumnus.coorte)}</div>
            <div className="chip" style={bgAndContrast(AlumnusStatus.status[alumnus.status].color)}>
                {AlumnusStatus.status[alumnus.status].acronym}
            </div>
        </div>
    )
}

function Counters({members, students}) {
    return <div className="w-full flex flex-row justify-center mb-8">
        <div className="flex flex-col justify-right text-right basis-0 grow">
            <div className="text-6xl">{members}</div>
            <div className="text-xl italic">Soci</div>
        </div>
        <div className="separator"></div>
        <div className="flex flex-col justify-left text-left basis-0 grow">
            <div className="text-6xl">{students}</div>
            <div className="text-xl italic">Soci studenti</div>
        </div>
    </div>
}

export default function List() {
    const members = usePage().props.members

    const members_count = members.map(alumnus => alumnus.status).filter((v) => v === 'member').length;
    const students_count = members.map(alumnus => alumnus.status).filter((v) => v === 'student_member').length;


    return (
        <div className="main-container">
            <Counters members={members_count} students={students_count} />
            <ListTemplate
                data={members} itemFunction={AlumnusItem} />
        </div>
    );
}
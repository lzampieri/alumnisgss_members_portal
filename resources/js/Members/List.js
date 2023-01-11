import { usePage } from "@inertiajs/inertia-react";
import ListTemplate from "../Registry/ListTemplate";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";

function AlumnusItem(alumnus) {
    return (
        <div className="mylist-item flex flex-row p-2">
            {alumnus.surname} {alumnus.name}
            <div className="chip">{romanize(alumnus.coorte)}</div>
            <div className="chip" style={ bgAndContrast( AlumnusStatus[ alumnus.status ].color ) }>
                { AlumnusStatus[ alumnus.status ].acronym }
            </div>
        </div>
    )
}

export default function List() {
    const members = usePage().props.members
    
    return (
        <div className="main-container">
            <ListTemplate
                data={ members } itemFunction={ AlumnusItem } />
        </div>
    );
}
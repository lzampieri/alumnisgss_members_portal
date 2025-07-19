import { useEffect, useState } from "react";
import { asyncPostWithResult, postRequest } from "../Utils";

async function downloadMembers( setStatus, setMembers ) {
    setStatus(true);
    const data = await asyncPostWithResult( 'contacts.get_members' );
    const data_dict = {};
    data.forEach( ( item ) => data_dict[item.id] = item );
    setMembers( data_dict );
    setStatus(false);
}

async function downloadContacts( setStatus, setGroups, setContacts ) {
    setStatus(true);
    const data = await asyncPostWithResult( 'contacts.get_contacts' );
    setGroups( data['groups'] );
    setContacts( data['contacts'] );
    setStatus(false);
}

// This guy is inside Main.js
export default function DataDownloader({ setMembers, setGroups, setContacts, next }) {
    const [downMembers, setDownMembers] = useState(true);
    const [downContacts, setDownContacts] = useState(true);

    useEffect(() => {
        downloadMembers( setDownMembers, setMembers );
        downloadContacts( setDownContacts, setGroups, setContacts );
    }, []);

    useEffect(() => {
        if( !downMembers && !downContacts ) {
            next();
        }
    }, [downMembers, downContacts]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {downMembers ? "Scaricamento lista dei soci in corso..." : "Scaricamento lista soci completato!"}
                {downMembers &&
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>}
            </div>
            <div className="w-full border flex flex-col items-center gap-2 m-2 p-2">
                {downContacts ? "Scaricamento contatti in corso..." : "Scaricamento contatti completato!"}
                {downContacts &&
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>}
            </div>
        </div>
    );
}
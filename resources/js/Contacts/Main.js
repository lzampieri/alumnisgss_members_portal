import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Head, Link, usePage } from "@inertiajs/react";
import { AlumnusStatus, bgAndContrast, romanize } from "../Utils";
import { useEffect, useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import DataDownloader from "./DataDownloader";
import AutoCombiner from "./AutoCombiner";
import ContactsCreator from "./ContactsCreator";
import EmailUpdater from "./EmailUpdater";
import PrimaryEmailUpdater from "./PrimaryEmailUpdater";
import GroupsUpdater from "./GroupsUpdater";
import Final from "./Final";
// import RegistryHeader from "./RegistryHeader";

const STEP = {
    NONE: -1,
    DOWNLOAD: 0,
    AUTOCOMBINE: 1,
    NEWCONTACTS: 2,
    EMAILUPDATE: 3,
    PRIMARYEMAILUPDATE: 4,
    GROUPSUPDATE: 5,
    FINAL: 6
}

export default function Main() {
    const [step,setStep] = useState(STEP.NONE);
    const [googleData,setGoogleData] = useState([]);
    const [localData,setLocalData] = useState([]);
    const [pairs,setPairs] = useState([]);
    const [localOrphans,setLocalOrphans] = useState([]);
    // const [members,setMembers] = useState([]);
    // const [groups,setGroups] = useState([]);
    // const [combs, setCombs] = useState({});
    // const [contacts,setContacts] = useState([]);

    useEffect(() => step == STEP.NONE && setStep(STEP.DOWNLOAD), []);

    return (
        <div className="main-container-large gap-1">
            <Head title="Sincronizzazione rubrica" />
            { step == STEP.DOWNLOAD && <DataDownloader setGoogleData={setGoogleData} setLocalData={setLocalData} next={() => setStep(STEP.AUTOCOMBINE)} /> }
            { step == STEP.AUTOCOMBINE && <AutoCombiner localData={localData} googleData={googleData} setPairs={setPairs} setLocalOrphans={setLocalOrphans} next={() => setStep(STEP.NEWCONTACTS)} /> }
            { step == STEP.NEWCONTACTS && <ContactsCreator localOrphans={localOrphans} appendToPairs={(newP) => setPairs([...pairs,...newP])} next={() => setStep(STEP.EMAILUPDATE)} /> }
            { step == STEP.EMAILUPDATE && <EmailUpdater pairs={pairs} setPairs={setPairs} next={() => setStep(STEP.PRIMARYEMAILUPDATE)} /> }
            { step == STEP.PRIMARYEMAILUPDATE && <PrimaryEmailUpdater pairs={pairs} next={() => setStep(STEP.FINAL)} /> }
            {/* { step == STEP.GROUPSUPDATE && <GroupsUpdater members={members} combs={combs} groups={groups} next={() => setStep(STEP.FINAL)} /> } */}
            { step == STEP.FINAL && <Final members={members} combs={combs} contacts={contacts} groups={groups} /> }
        </div>
    );
}
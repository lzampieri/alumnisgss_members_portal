import { faAddressBook, faBookOpen, faBoxArchive, faBug, faBusinessTime, faCircleNodes, faEnvelopeOpenText, faFilePen, faIdBadge, faIdCard, faLandmark, faMap, faPeopleRoof, faSignature, faStapler, faTruckMedical, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";

export default [
    { id: 'profile', name: 'Profilo', url: route('profile'), icon: faUser },
    { id: 'members', name: 'Soci', url: route('members'), icon: faUsers },
    { id: 'network', name: 'Rete', url: route('network'), icon: faCircleNodes },
    { id: 'map', name: 'Mappa', url: route('network.map'), icon: faMap },
    { id: 'registry', name: 'Anagrafe', url: route('registry'), icon: faStapler },
    { id: 'ratifications', name: 'Ratifiche', url: route('ratifications'), icon: faSignature },
    { id: 'board', name: 'Albo', url: route('board'), icon: faBookOpen },
    { id: 'positions', name: 'Incarichi', url: route('positions'), icon: faLandmark },
    { id: 'reports', name: 'Report', url: route('reports'), icon: faFilePen },
    { id: 'resources', name: 'Risorse', url: route('resources'), icon: faBoxArchive },
    { id: 'clockings', name: 'Timbrature', url: route('clockings'), icon: faBusinessTime },
    { id: 'newsletters', name: 'Newsletters', url: route('newsletters'), icon: faEnvelopeOpenText },
    { id: 'accesses', name: 'Accessi', url: route('accesses'), icon: faIdBadge },
    { id: 'accesses', name: 'Gruppi', url: route('roles.list'), icon: faPeopleRoof },
    { id: 'permissions', name: 'Ruoli e permessi', url: route('permissions'), icon: faIdCard },
    { id: 'contacts', name: 'Sincronizza rubrica', url: route('contacts'), icon: faAddressBook },
    { id: 'helpdesk', name: 'Helpdesk', url: route('helpdesk'), icon: faTruckMedical },
    { id: 'webmaster', name: 'Webmaster', url: route('webmaster'), icon: faBug },
]
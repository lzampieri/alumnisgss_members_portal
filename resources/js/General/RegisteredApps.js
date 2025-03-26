import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

export default [
    { id: 'members', name: 'Soci', url: route('members'), icon: solid('users') },
    { id: 'network', name: 'Rete', url: route('network'), icon: solid('circle-nodes') },
    { id: 'registry', name: 'Anagrafe', url: route('registry'), icon: solid('stapler') },
    { id: 'ratifications', name: 'Ratifiche', url: route('ratifications'), icon: solid('signature') },
    { id: 'board', name: 'Albo', url: route('board'), icon: solid('book-open') },
    { id: 'reports', name: 'Report', url: route('reports'), icon: solid('file-pen') },
    { id: 'resources', name: 'Risorse', url: route('resources'), icon: solid('box-archive') },
    { id: 'clockings', name: 'Timbrature', url: route('clockings'), icon: solid('business-time') },
    { id: 'accesses', name: 'Accessi', url: route('accesses'), icon: solid('id-badge') },
    { id: 'permissions', name: 'Ruoli e permessi', url: route('permissions'), icon: solid('id-card') },
    { id: 'webmaster', name: 'Webmaster', url: route('webmaster'), icon: solid('bug') },
]
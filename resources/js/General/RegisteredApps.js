import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'

export default [
    { id: 'members', name: 'Soci', url: route('members'), icon: solid('users') },
    { id: 'registry', name: 'Anagrafe', url: route('registry'), icon: solid('stapler') },
    { id: 'ratifications', name: 'Ratifiche', url: route('ratifications'), icon: solid('signature') },
    { id: 'board', name: 'Albo', url: route('board'), icon: solid('book-open') },
    { id: 'webmaster', name: 'Webmaster', url: route('webmaster'), icon: solid('bug'), href: true },
    { id: 'accesses', name: 'Accessi', url: route('accesses'), icon: solid('id-badge') },
    { id: 'permissions', name: 'Ruoli e permessi', url: route('permissions'), icon: solid('id-card') },
]
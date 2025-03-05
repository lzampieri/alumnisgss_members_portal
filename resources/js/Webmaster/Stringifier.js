import { romanize } from "../Utils"


function Stringifier( item_type, item ) {
    if( item_type == 'App\\Models\\Alumnus' ) return `${item.surname} ${item.name} (${romanize(item.coorte)}) [${item.status}]`
    if( item_type == 'App\\Models\\External' ) return `${item.surname} ${item.name} (${item.notes})`
    if( item_type == 'App\\Models\\LoginMethod' ) return `LoginMethod ${item.credential}`
    if( item_type == 'App\\Models\\Ratification' ) return `Ratification for alumnus ${item.alumnus_id}`
    if( item_type == 'App\\Models\\Role' ) return `Role ${item.name}`
    if( item_type == 'App\\Models\\Permission' ) return `Permission ${item.name}`
    return item_type
}

function Tooltipier( item_type, item ) {
    if( item_type == 'App\\Models\\Alumnus' ) return `Alumnus #${item.id}`
    if( item_type == 'App\\Models\\External' ) return `External #${item.id}`
    if( item_type == 'App\\Models\\LoginMethod' ) return `LoginMethod #${item.id} (${item.credential})`
    if( item_type == 'App\\Models\\Ratification' ) return `Ratification #${item.id} for alumnus ${item.alumnus_id} to state ${item.required_state}`
    if( item_type == 'App\\Models\\Role' ) return `Role #${item.id} (${item.name})`
    if( item_type == 'App\\Models\\Permission' ) return `Permission #${item.id} (${item.name})`
    return item_type
}

export { Stringifier, Tooltipier }
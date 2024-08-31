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


// if (is_array($object)) {
//     $output = "[ ";
//     foreach ($object as $key => $value) {
//         if (is_numeric($key))
//             $output .= Log::stringify($value) . " | ";
//         else
//             $output .= $key . " => " . Log::stringify($value) . " | ";
//     }
//     return rtrim(rtrim($output, " "), "|") . "]";
// }
// if ($object instanceof Alumnus)
//     return "(" . $object->id . ") " . $object->surname . " "  . $object->name . " (" . $object->coorte . ") [" . $object->status . "]";
// if ($object instanceof External)
//     return "(" . $object->id . ") " . $object->surname . " "  . $object->name . " [" . $object->note . "]";
// if ($object instanceof LoginMethod)
//     return $object->credential . " (" . $object->driver . ")";
// if ($object instanceof Permission)
//     return $object->name;
// if ($object instanceof Ratification)
//     return "Ratification of " . $object->alumnus->surnameAndName() . " to " . $object->required_state;
// if ($object instanceof Document)
//     return $object->identifier . " (" . $object->protocol . ", " . $object->date . ")";
// if ($object instanceof DynamicPermission)
//     return $object->type . " of " . $object->role->name . " for " . Log::stringify($object->permissable);
// if ($object instanceof Resource)
//     return "Resource " . $object->title . ": " . json_encode($object->content);
// if ($object instanceof Permalink)
//     return "Permalink " . $object->id . " to " . $object->linkable_type . " #" . $object->linkable_id;
// if ($object instanceof AwsSession) {
//     if ($object->endtime)
//         return "Session of machine " . $object->aws_id . " from " . $object->ip . " (duration " . $object->duration . " min)";
//     else
//         return "Session of machine " . $object->aws_id . " from " . $object->ip . " (started " . $object->starttime . " min)";
// }
// return $object;
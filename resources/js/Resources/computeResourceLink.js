

export default function computeResourceLink( resource ) {
    if( resource.permalinks?.length ) {
        return route( 'permalink', { 'permalink': resource.permalinks.slice( -1 )[0].id } )
    }
    return route('resources', { 'resource': resource.id })
}
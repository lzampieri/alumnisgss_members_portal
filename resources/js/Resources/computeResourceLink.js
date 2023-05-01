

export default function computeResourceLink( resource ) {
    if( resource.permalinks?.length ) {
        console.log( resource.permalinks.slice( -1 ) )
        return route( 'permalink', { 'permalink': resource.permalinks.slice( -1 )[0].id } )
    }
    return route('resources', { 'resource': resource.id })
}
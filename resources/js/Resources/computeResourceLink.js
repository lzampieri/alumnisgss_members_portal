
export default function computeResourceLink( resource ) {
    if( resource.permalinks?.length ) {
        return route( 'permalink', { 'permalink': resource.permalinks.slice( -1 )[0].id } ) + window.location.search
    }
    return route('resources', { 'resource': resource.id }) + window.location.search
}
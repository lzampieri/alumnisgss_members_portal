
export default function computeResourceLink( resource, token = null ) {
    let suffix = window.location.search
    if( token )
        suffix = `?tk=${token}`
    if( resource.permalinks?.length ) {
        return route( 'permalink', { 'permalink': resource.permalinks.slice( -1 )[0].id } ) + suffix
    }
    return route('resources', { 'resource': resource.id }) + suffix
}
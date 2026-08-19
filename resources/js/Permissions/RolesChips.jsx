export default function RolesChips({ roles, list, updateList, small }) {    
    const changeRole = (id) => {
        if (list.includes(id)) {
            list.splice(list.indexOf(id), 1)
            updateList(list.slice())
        } else
            updateList(list.concat([id]))
    }

    return <div className={"w-full flex flex-row flex-wrap justify-start " + (small ? "gap-y-px" : "gap-1")}>
        {roles.map(r =>
            <div key={r.id} className={"chip cursor-pointer aria-disabled:opacity-40 "+ (small ? "" : "px-4 py-2")} aria-disabled={!list.includes(r.id)} onClick={() => changeRole(r.id)}>
                {r.common_name}
            </div>)}
    </div>
}
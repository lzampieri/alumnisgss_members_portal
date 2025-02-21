// TODO questi sono inguardabili, da sistemare

export default function RolesChips({ roles, list, updateList }) {    
    const changeRole = (id) => {
        if (list.includes(id)) {
            list.splice(list.indexOf(id), 1)
            updateList(list.slice())
        } else
            updateList(list.concat([id]))
    }

    return <div className="w-full flex flex-row flex-wrap justify-start gap-1">
        {roles.map(r =>
            <div key={r.id} className="chip px-4 py-2 cursor-pointer aria-disabled:disabled" aria-disabled={!list.includes(r.id)} onClick={() => changeRole(r.id)}>
                {r.common_name}
            </div>)}
    </div>
}
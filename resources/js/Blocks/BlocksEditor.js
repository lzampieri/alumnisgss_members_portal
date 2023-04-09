import { useState } from 'react';
import DraggingManagement from './DraggingManagement';
import BlockParser from './BlockParser';
import BlockEnvironment from './BlockEnvironment';
import AddBlock from './AddBlock';
import { randomHex } from '../Utils';

export default function BlocksEditor({ initialContent, saveCallback }) {

    const [list, setList] = useState(initialContent)

    const save = () => {
        saveCallback(list)
    }

    const addBlockAt = (props, pos) => {
        let id = randomHex(6);
        while( list.map( item => item.id ).includes( id ) ) {
            console.log("Regenerating...");
            id = randomHex(6);
        }
        props['id'] = id;

        if( pos < 0 ) pos = 0
        if( pos > list.length ) pos = list.length
        list.splice(pos, 0, props)
        setList(list.slice())
    }

    const updateOrder = (from, to) => {
        if (from < 0 || to < 0) return
        if (from >= list.length || to >= list.length) return
        const [moved_item] = list.splice(from, 1)
        list.splice(to, 0, moved_item)
        setList(list.slice())
    }

    const deleteItem = (from) => {
        if (from < 0) return
        if (from >= list.length) return
        list.splice(from, 1)
        setList(list.slice())
    }

    const setData = (index,key,value) => {
        const oldData = list.slice()
        console.log( oldData )
        oldData[index][key] = value
        console.log( oldData )
        setList(oldData)
    }

    return <>
        <div className='button items-end self-end' onClick={save}>Salva</div>
        <div className="w-full border rounded m-2 p-2">
            <DraggingManagement list={list} updateOrder={updateOrder} renderItem={(item, index) =>
                <BlockEnvironment index={index} addBlockAt={addBlockAt} updateOrder={updateOrder} deleteItem={deleteItem}>
                    {BlockParser(item, (key,value)=>setData(index,key,value), true)}
                </BlockEnvironment>
            } />
            <div className="w-full flex flex-col items-end mt-2">
                <div className="self-end w-6">
                    <AddBlock alwaysVisible={true} addBlock={(props) => addBlockAt(props,list.length)} />
                </div>
            </div>
        </div>
        <div className='button items-end self-end' onClick={save}>Salva</div>
    </>
}
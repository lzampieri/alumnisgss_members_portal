import { useState } from 'react';
import { createReactEditorJS } from 'react-editor-js'
import RegisteredTools from './RegisteredTools';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import DraggingManagement from './DraggingManagement';
import BlockParser from './BlockParser';
import BlockEnvironment from './BlockEnvironment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

export default function BlocksEditor({ initialContent, saveCallback }) {

    const [list, setList] = useState([ // todo set initialContent
        { id: 1, type: 'title', content: 'primo' },
        { id: 2, type: 'title', content: 'secondo' },
        { id: 3, type: 'title', content: 'terzo' },
        { id: 4, type: 'title', content: 'quarto' },
        { id: 5, type: 'title', content: 'quinto' },
    ])

    const save = () => {
        saveCallback(list)
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

    return <>
        <div className='button items-end self-end' onClick={save}>Salva</div>
        <div className="w-full border rounded m-2 p-2">
            <DraggingManagement list={list} updateOrder={updateOrder} renderItem={(item, index) =>
                <BlockEnvironment index={index} updateOrder={updateOrder} deleteItem={deleteItem}>
                    {BlockParser(item, true)}
                </BlockEnvironment>
            } />
            <div className="w-full flex flex-col items-end mt-2">
                <div className="button !p-0 w-6 aspect-square flex justify-center items-center">
                    <FontAwesomeIcon icon={solid('add')} className="!pr-0" />
                </div>
            </div>
        </div>
        <div className='button items-end self-end' onClick={save}>Salva</div>
    </>
}
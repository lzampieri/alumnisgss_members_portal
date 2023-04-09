import { useState } from 'react';
import { createReactEditorJS } from 'react-editor-js'
import RegisteredTools from './RegisteredTools';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import DraggingManagement from './DraggingManagement';
import BlockParser from './BlockParser';
import BlockEnvironment from './BlockEnvironment';

export default function BlocksViewer({ content }) {

    return <>
        { content?.map( item =>
        <div key={item.id} className="w-full">
             {BlockParser(item, false)}
        </div>
        ) }
    </>
}
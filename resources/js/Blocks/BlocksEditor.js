import { useState } from 'react';
import { createReactEditorJS } from 'react-editor-js'
import RegisteredTools from './RegisteredTools';

export default function BlocksEditor() {
    const ReactEditorJS = createReactEditorJS()
    const [editorInstance,setEditorInstance] = useState( null )

    const save = () => {
        editorInstance.save().then((outputData) => {
            console.log('Article data: ', outputData)
        }).catch((error) => {
            console.log('Saving failed: ', error)
        });
    }

    return <div className='main-container'>
        <div className='button items-end self-end' onClick={save}>Salva</div>
        <ReactEditorJS
            holder="editorjs_container"
            tools={ RegisteredTools }
            onInitialize={ (instance) => setEditorInstance( instance ) } >
            <div className='w-full border' id="editorjs_container" />
        </ReactEditorJS>
        <div className='button items-end self-end' onClick={save}>Salva</div>
    </div>
}
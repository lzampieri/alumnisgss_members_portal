import { createReactEditorJS } from 'react-editor-js'
import RegisteredTools from './RegisteredTools';
import { useEffect } from 'react';
import { useState } from 'react';

export default function BlocksViewer({ content }) {
    const ReactEditorJS = createReactEditorJS()
    const [editorInstance, setEditorInstance] = useState(null)

    const update = async () => {
        if (editorInstance) {
            await editorInstance.dangerouslyLowLevelInstance?.isReady
            editorInstance.clear()
            editorInstance.render( content )
        }
    }

    useEffect( update, [ content.time ] )

    return <>
        <ReactEditorJS
            holder="editorjs_container"
            tools={RegisteredTools}
            defaultValue={content}
            onInitialize={(instance) => setEditorInstance(instance)}
            readOnly={true}
        >
            <div className='w-full border' id="editorjs_container" />
        </ReactEditorJS>
    </>
}
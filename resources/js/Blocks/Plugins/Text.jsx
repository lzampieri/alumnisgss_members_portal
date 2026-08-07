
import { faFont } from "@fortawesome/free-solid-svg-icons";
import TextareaAutosize from 'react-textarea-autosize';
import Editor from "../../Libs/Editor";
import { usePage } from "@inertiajs/react";

export default class Text {
    static title = "Testo"
    static icon = faFont

    static getDefaultData() {
        return {
            content: ''
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {


        return <div
            className="w-full"
            onPointerDown={(e) => e.stopPropagation()}>
            <Editor
            value={item.content}
            setValue={(v) => setItemValue('content', v)}
            url_for_uploading={route('resources.upload_img_editor', { resource: usePage().props.resource?.id })}
            route_for_retriving={'resources.retrive_img_editor'} />
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <div
            className="w-full whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: item.content }} />
    }
}
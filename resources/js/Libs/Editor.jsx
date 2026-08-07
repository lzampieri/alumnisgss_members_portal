import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TableKit } from '@tiptap/extension-table'
import { Image } from '@tiptap/extension-image'
import FileHandler from "@tiptap/extension-file-handler"
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { useCallback, useState } from "react"
import axios from "axios"
import { enqueueSnackbar } from "notistack"
import Backdrop from "../Layout/Backdrop"
import { MenuBar } from "../Libs/MenuBar"


export default function Editor({ value, setValue, url_for_uploading, route_for_retriving }) {
    const [isLoading, setIsLoading] = useState(false);

    const uploadFile = useCallback(async (currentEditor, files, pos) => {
        setIsLoading(true);
        for (const file of files) {
            const res = await axios.post(
                url_for_uploading,
                { image: file },
                { headers: { 'Content-Type': 'multipart/form-data' } })
                .catch(e => { enqueueSnackbar('Impossibile caricare una o più immagini', { variant: 'error' }); });
            currentEditor
                .chain()
                .insertContentAt(pos, {
                    type: 'image',
                    attrs: {
                        src: route(route_for_retriving, { handle: res.data.handle }),
                    },
                })
                .focus()
                .run()
        }
        setIsLoading(false);
    })

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: {
                    autolink: true,
                    openOnClick: true,
                    linkOnPaste: true,
                    defaultProtocol: 'https',

                }
            }), TextStyle, Color, TableKit,
            Image.configure({
                inline: true,
                resize: {
                    enabled: true,
                    directions: ['top', 'bottom', 'left', 'right'], // can be any direction or diagonal combination
                    alwaysPreserveAspectRatio: true,
                },
                allowBase64: false,
            }),
            FileHandler.configure({
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg'],
                onDrop: async (currentEditor, files, pos) => uploadFile(currentEditor, files, pos),
                onPaste: async (currentEditor, files, htmlContent) => uploadFile(currentEditor, files, currentEditor.state.selection.anchor),
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => setValue(editor.getHTML()),
        editorProps: {
            transformPastedHTML: (html, view) => {
                const data_regex = new RegExp('data:image/([a-zA-Z]+);base64,[^"]+', 'g');
                // If there is a single data url
                if (html.match(data_regex)) {
                    (async () => {
                        setIsLoading(true);
                        const replacements = await Promise.all(
                            Array.from(html.matchAll(data_regex), async (groups) => {
                                const image = await fetch(groups[0]);
                                const blob = await image.blob();
                                const file = new File([blob], 'image.' + groups[1], { type: groups[1] });
                                const res = await axios.post(
                                    url_for_uploading,
                                    { image: file },
                                    { headers: { 'Content-Type': 'multipart/form-data' } })
                                    .catch(e => { enqueueSnackbar('Impossibile caricare una o più immagini', { variant: 'error' }); });
                                return route(route_for_retriving, { handle: res.data.handle });
                            }));
                        let i = 0;
                        const new_html = html.replace(data_regex, () => replacements[i++]);
                        setIsLoading(false);
                        view.pasteHTML(new_html);
                    })()

                    return ""; // Will be repasted after the parsing
                }
                return html;
            }
        }
    })

    return (
        <>
            <MenuBar editor={editor} imgCallback={uploadFile} />
            <EditorContent editor={editor} />
            <Backdrop open={isLoading} />
        </>
    )
}
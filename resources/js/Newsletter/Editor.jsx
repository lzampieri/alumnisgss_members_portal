import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TableKit } from '@tiptap/extension-table'
import { Image } from '@tiptap/extension-image'
import FileHandler from "@tiptap/extension-file-handler"
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { useState } from "react"
import axios from "axios"
import { enqueueSnackbar } from "notistack"
import Backdrop from "../Layout/Backdrop"


export default function NewsletterEditor({ value, setValue, newsletter_id }) {
    const [isLoading, setIsLoading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit, TextStyle, Color, TableKit,
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
                onDrop: async (currentEditor, files, pos) => {
                    setIsLoading(true);
                    for (const file of files) {
                        const res = await axios.post(
                            route('newsletter.upload_img', { newsletter: newsletter_id }),
                            { image: file },
                            { headers: { 'Content-Type': 'multipart/form-data' } })
                            .catch(e => { enqueueSnackbar('Impossibile caricare una o più immagini', { variant: 'error' }); });
                        currentEditor
                            .chain()
                            .insertContentAt(pos, {
                                type: 'image',
                                attrs: {
                                    src: route('newsletter.media', { handle: res.data.handle }),
                                },
                            })
                            .focus()
                            .run()
                    }
                    setIsLoading(false);
                },
                onPaste: async (currentEditor, files, htmlContent) => {
                    setIsLoading(true);
                    for (const file of files) {
                        const res = await axios.post(
                            route('newsletter.upload_img', { newsletter: newsletter_id }),
                            { image: file },
                            { headers: { 'Content-Type': 'multipart/form-data' } })
                            .catch(e => { enqueueSnackbar('Impossibile caricare una o più immagini', { variant: 'error' }); });
                        currentEditor
                            .chain()
                            .insertContentAt(currentEditor.state.selection.anchor, {
                                type: 'image',
                                attrs: {
                                    src: route('newsletter.media', { handle: res.data.handle }),
                                },
                            })
                            .focus()
                            .run()
                    }
                    setIsLoading(false);
                },
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
                                    route('newsletter.upload_img', { newsletter: newsletter_id }),
                                    { image: file },
                                    { headers: { 'Content-Type': 'multipart/form-data' } })
                                    .catch(e => { enqueueSnackbar('Impossibile caricare una o più immagini', { variant: 'error' }); });
                                return route('newsletter.media', { handle: res.data.handle });
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
            <EditorContent editor={editor} />
            <Backdrop open={isLoading} />
        </>
    )
}
import { useEditorState } from '@tiptap/react'

import { menuBarStateSelector } from './menuBarState.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBold, faCode, faGripLines, faImage, faItalic, faLink, faLinkSlash, faListOl, faListUl, faParagraph, faQuoteLeft, faRotateLeft, faRotateRight, faStrikethrough, faTerminal } from '@fortawesome/free-solid-svg-icons'
import { useCallback } from 'react'

export const MenuBar = ({ editor, imgCallback }) => {
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  })

  if (!editor) {
    return null
  }


  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    // update link
    try {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } catch (e) {
      alert(e.message)
    }
  }, [editor])

  return (
    <>
      <div className="tiptap-menu">
        <div
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={editorState.isBold ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faBold} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faItalic} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={editorState.isStrike ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={editorState.isCode ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faCode} />
        </div>
        <div
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editorState.isParagraph ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faParagraph} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.isHeading1 ? 'is-active' : ''}
        >
          H1
        </div>
        <div
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isHeading2 ? 'is-active' : ''}
        >
          H2
        </div>
        <div
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isHeading3 ? 'is-active' : ''}
        >
          H3
        </div>
        <div
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editorState.isHeading4 ? 'is-active' : ''}
        >
          H4
        </div>
        <div
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editorState.isHeading5 ? 'is-active' : ''}
        >
          H5
        </div>
        <div
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editorState.isHeading6 ? 'is-active' : ''}
        >
          H6
        </div>
      </div>
      <div className="tiptap-menu">
        <div
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faListUl} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faListOl} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editorState.isCodeBlock ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faTerminal} />
        </div>
        <div
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.isBlockquote ? 'is-active' : ''}
        >
          <FontAwesomeIcon icon={faQuoteLeft} />
        </div>
        <div onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <FontAwesomeIcon icon={faGripLines} />
        </div>
        <div onClick={setLink} className={editorState.isLink ? 'is-active' : ''}>
          <FontAwesomeIcon icon={faLink} />
        </div>
        <div onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editorState.isLink}>
          <FontAwesomeIcon icon={faLinkSlash} />
        </div>
        <div onClick={() => window.showOpenFilePicker({
          types: [
            {
              description: "Images",
              accept: {
                "image/*": [".png", ".gif", ".jpeg", ".jpg", ".webp", ".svg"],
              },
            },
          ],
        }).then((value) => value[0].getFile().then((f) => imgCallback(editor,[f],editor.state.selection.anchor)))}>
          <FontAwesomeIcon icon={faImage} />
        </div>
      </div>
      <div className="tiptap-menu">
        <div onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</div>
        <div onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</div>
        <div onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}>
          <FontAwesomeIcon icon={faRotateLeft} />
        </div>
        <div onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}>
          <FontAwesomeIcon icon={faRotateRight} />
        </div>
      </div>
    </>
  )
}

import Paragraph from '@editorjs/paragraph'
import Image from "./Image";
import Title from './Title';
import Separator from './Separator';
import File from './File';

export default {
    paragraph: { class: Paragraph, inlineToolbar: true },  
    title: Title,  
    image: Image,
    file: File,
    separator: Separator
}
import PlainText from "./PlainText";


export default function BlockParser( block ) {
    switch ( block.type ) {
        default:
            return PlainText( block );
    }
}
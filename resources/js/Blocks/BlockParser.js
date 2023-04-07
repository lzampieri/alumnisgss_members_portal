import PlainText from "./PlainText";


export default function BlockParser(block) {
    // TODO remove
    switch (block.type) {
        default:
            return PlainText(block);
    }
}
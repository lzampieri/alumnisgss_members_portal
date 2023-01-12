

export default function PlainText( block ) {
    return <div className="whitespace-pre" key={block.id}>{ block.content }</div>;
}
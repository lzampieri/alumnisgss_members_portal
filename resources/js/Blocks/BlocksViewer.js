import BlockParser from './BlockParser';

export default function BlocksViewer({ content }) {
    return <>
        { content?.map(
            block => BlockParser.preProcess( block )
        )?.map( item =>
        <div key={item.id} className="w-full">
            { BlockParser.render(item, false)}
        </div>
        ) }
    </>
}
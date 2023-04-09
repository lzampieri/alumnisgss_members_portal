import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BlockParser from "../BlockParser";

export default function BlocksList({ blocks, canEdit = false }) {
    // TODO remove
    return <div className="flex flex-col w-full items-start">
        {canEdit && <div className="button my-2"><FontAwesomeIcon icon={solid('pen')} /> Modifica</div>}
        {blocks.map(block => BlockParser(block))}
    </div>
}
import { solid, brands } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bgAndContrast } from "../Utils";

function isUrl(val) {
    if (typeof val === 'string' || val instanceof String)
        return val.match(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g);
    return false
}

function getIcon(val) {
    if (val.includes("linkedin.com"))
        return <FontAwesomeIcon icon={brands('linkedin')} /> //<FontAwesomeIcon icon={brands('linkedin')} />
    return <FontAwesomeIcon icon={solid('link')} />
}

export default function SmartChip({ content, style }) {
    if (isUrl(content)) {
        return <a className="smart-chip" style={style} href={content}>
            <div className="rounded-lg px-1 border" style={
                (('backgroundColor' in style) && ('color' in style)) ?
                    { backgroundColor: style.color, color: style.backgroundColor } :
                    bgAndContrastPastel(-1)
            }>
                {getIcon(content)}
            </div>
            <div className="rounded-lg px-2">
                {content}
            </div>
        </a>
    }

    return <div className="smart-chip px-2" style={style}>
        {content}
    </div>

}

export function SmartChipWithTitle({ content, title, style }) {
    if (isUrl(content)) {
        return <a className="smart-chip" style={style} href={content}>
            <div className="rounded-lg px-1 border" style={
                (('backgroundColor' in style) && ('color' in style)) ?
                    { backgroundColor: style.color, color: style.backgroundColor } :
                    bgAndContrastPastel(-1)
            }>
                {getIcon(content)}
            </div>
            <span className="pl-2 pr-2">{title}:</span>
            <div className="rounded-lg px-2 outline outline-white outline-1">
                {content}
            </div>
        </a>
    }

    return <div className="smart-chip" style={style}>
        <span className="pl-2 pr-2">{title}:</span>
        <div className="rounded-lg px-2 outline outline-white outline-1">
            {content}
        </div>
    </div>
}
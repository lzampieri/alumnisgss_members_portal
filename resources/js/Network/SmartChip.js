import { solid, brands } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bgAndContrast } from "../Utils";

function isUrl(val) {
    if (typeof val === 'string' || val instanceof String)
        return val.match(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g);
    return false
}

function getIcon(val) {
    if( val.includes("linkedin.com") )
        return <FontAwesomeIcon icon={brands('linkedin')} /> //<FontAwesomeIcon icon={brands('linkedin')} />
    return <FontAwesomeIcon icon={solid('link')} />
}

export default function SmartChip({ content, style }) {
    if (isUrl(content)) {
        return <a className="rounded-3xl flex flex-row !no-underline ml-2" style={style} href={content}>
            <div className="rounded-3xl px-1 border" style={
                (( 'backgroundColor' in style) && ( 'color' in style )) ? 
                { backgroundColor: style.color, color: style.backgroundColor } :
                bgAndContrastPastel(-1)
                }>
                {getIcon(content)}
            </div>
            <span className="px-2">
                {content}
            </span>
        </a>
    }

    return <div className="chip group relative z-auto" style={style}>
        {isUrl(content) && "URL:"} {content}
    </div>

}
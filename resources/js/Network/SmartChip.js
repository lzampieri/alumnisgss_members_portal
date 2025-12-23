import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { bgAndContrast } from "../Utils";
import { faEnvelope, faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function isEmail(val) {
    if (typeof val === 'string' || val instanceof String)
        return val.match(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g);
    return false
}

function isUrl(val) {
    if (typeof val === 'string' || val instanceof String)
        return val.match(/^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g);
    return false
}

function getIcon(val) {
    if (val.includes("linkedin.com"))
        return <FontAwesomeIcon icon={faLinkedin} /> //<FontAwesomeIcon icon={brands('linkedin')} />
    return <FontAwesomeIcon icon={faLink} />
}

export default function SmartChip({ content, style }) {
    if (isEmail(content)) {
        return <a className="smart-chip" style={style} href={"mailto:" + content}>
            <div className="rounded-lg px-1 border" style={
                (('backgroundColor' in style) && ('color' in style)) ?
                    { backgroundColor: style.color, color: style.backgroundColor } :
                    bgAndContrastPastel(-1)
            }>
                <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div className="rounded-lg px-2">
                {content}
            </div>
        </a>
    }

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
    if (isEmail(content)) {
        return <a className="smart-chip" style={style} href={"mailto:" + content}>
            <div className="rounded-lg px-1 border" style={
                (('backgroundColor' in style) && ('color' in style)) ?
                    { backgroundColor: style.color, color: style.backgroundColor } :
                    bgAndContrastPastel(-1)
            }>
                <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <span className="pl-2 pr-2">{title}:</span>
            <div className="rounded-lg px-2 outline outline-white outline-1">
                {content}
            </div>
        </a>
    }

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
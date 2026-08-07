

export default function InlinePie({ primary, secondary, total }) {
    const ratio1 = primary / total;
    const ratio2 = (primary + secondary) / total;
    if (isNaN(ratio1))
        return "";
    const rad = 14;
    const pad = 1;

    return <svg width={rad * 2 + pad * 2} height={rad * 2 + pad * 2}>
        <circle cx={rad + pad} cy={rad + pad} r={rad} />
        {ratio2 && !isNaN(ratio2) &&
            <path d={`M${rad + pad} ${rad + pad} v -${rad} A ${rad} ${rad} 0 ${ratio2 > 0.5 ? 1 : 0} 1 ${rad + pad + rad * Math.sin(ratio2 * 6.28)} ${rad + pad - rad * Math.cos(ratio2 * 6.28)} Z`} fill="#1f77b4" />}
        <path d={`M${rad + pad} ${rad + pad} v -${rad} A ${rad} ${rad} 0 ${ratio1 > 0.5 ? 1 : 0} 1 ${rad + pad + rad * Math.sin(ratio1 * 6.28)} ${rad + pad - rad * Math.cos(ratio1 * 6.28)} Z`} fill="#cb0014" />
    </svg>
}
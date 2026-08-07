import { Head, Link, usePage, useRemember } from "@inertiajs/react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

import { Icon, PinCircle } from "leaflet-extra-markers";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLong, faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { romanize } from "../Utils";


export default function Map() {
    const cities = usePage().props.cities
    const [city, setCity] = useRemember()

    let hidden = city ? city['alumni'].filter( a => a.id < 0 ).length : 0

    return <div className="w-full h-[80vh] flex flex-row">
        <Head title="AluMappa" />
        <MapContainer center={[45, -11]} zoom={3} className='w-full md:w-3/4 h-full z-0'>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.values(cities).map(c =>
                <Marker
                    position={[c[0].lat, c[0].lng]}
                    key={c[0].id}
                    icon={new Icon({ svg: PinCircle, content: c['alumni'].length, color: '#cb0014' })}
                    eventHandlers={{ click: () => setCity(c) }} />
            )}
        </MapContainer>
        <div
            className={
                "fixed overflow-hidden z-10 bg-halfblack inset-0 transform ease-in-out " +
                (city
                    ? " transition-opacity opacity-100 duration-500 translate-y-0"
                    : " transition-all duration-500 opacity-0 translate-y-full") +
                " md:relative md:inset-auto md:transform-none md:translate-none md:opacity-100 md:w-1/4 md:h-full"
            }
            onClick={() => setCity()}
        >
            <div className={
                "w-full h-3/5 absolute bottom-0 duration-500 ease-in-out transition-all transform " +
                (city ? " translate-y-0 " : " translate-y-full ") +
                " md:h-full md:sticky md:transform-none md:translate-none " +
                " bg-white p-4 overflow-auto"
            } onClick={(e) => { e.stopPropagation() }}>
                <h3 className="pb-4">{city ? city[0].display_name : ""}</h3>
                { city && city['alumni'].map( a => a.id < 0 ? "" : 
                    <div className="w-full" key={a.id}>
                        <FontAwesomeIcon icon={faUser} className="pr-2"/>{a.name} {a.surname} <span className="text-gray-400">{romanize(a.coorte)}</span>
                        <Link className="ml-2 icon-button" href={route('network.view', { alumnus: a.id })}><FontAwesomeIcon icon={faRightLong} /></Link>
                    </div>
                )}
                {
                    hidden > 0 && hidden < city['alumni'].length && <div className="w-full text-gray-400">
                        <FontAwesomeIcon icon={faUsers} className="pr-2"/>{ hidden > 1 ? <>altri {hidden} soci</> : <>un altro socio</>}
                    </div>
                }
                {
                    hidden > 0 && hidden == city['alumni'].length && <div className="w-full text-gray-400">
                        <FontAwesomeIcon icon={faUsers} className="pr-2"/>{ hidden > 1 ? <>{hidden} soci</> : <>1 socio</>}
                    </div>
                }
            </div>
        </div>
    </div>
}
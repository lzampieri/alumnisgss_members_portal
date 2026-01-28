import ImageUploadModal from "./ImageUploadModal";
import { faImage } from "@fortawesome/free-solid-svg-icons";


export default class Image {
    static title = "Immagine"
    static icon = faImage
    static sizes = [
        { value: 'small', label: 'Piccola', class: 'w-[30%]' },
        { value: 'medium', label: 'Media', class: 'w-[50%]' },
        { value: 'large', label: 'Grande', class: 'w-full' }
    ]

    static getDefaultData() {
        return {
            'imageHandle': null,
            'imageSize': 'small' // small-medium-large
        }
    }

    static mainElementEditable = ({ item, setItemValue }) => {
        return <div
            className="w-full div-highlighted flex flex-col items-center justify-center gap-4 my-2 p-4">
            <ImageUploadModal
                imageHandle={item.imageHandle}
                imageSizeClass={this.sizes.find(s => s.value == item.imageSize)?.class || "w-[50%]"}
                setImageHandle={(newHandle) => setItemValue('imageHandle', newHandle)}
            />
            <div className="flex flex-row gap-2">
                {this.sizes.map((s) => <div
                    key={s.value}
                    className={"button " + (item.imageSize == s.value ? "button-active" : "")}
                    onClick={() => setItemValue('imageSize', s.value)}
                >{s.label}</div>)}
            </div>
        </div>
    }

    static mainElementReadOnly = ({ item }) => {
        return <div className="w-full flex flex-row justify-center p-4">
            <img src={route('resources.image', { 'handle': item.imageHandle }) + window.location.search} loading="lazy"
                className={this.sizes.find(s => s.value == item.imageSize)?.class || "w-[50%]"}
            />
        </div>
    }
}
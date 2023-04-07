import { render } from "react-dom";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { Fragment } from "react";

export default class AbstrackBlock {

    static title = 'Error'
    static icon = solid( 'triangle-exclamation' )

    static get toolbox() {
        return {
            icon: icon( this.icon ).html[0],
            title: this.title,
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.readOnly = readOnly;
        this.data = { ...this.getDefaultData(), ...data };
    }

    updateData( newData ) {
        this.data = { ...this.data, ...newData }
    }

    render() {
        this.rootNode = document.createElement('div');

        render(
            this.readOnly ? <this.mainElementReadOnly /> : <this.mainElementEditable />,
            this.rootNode
        )

        return this.rootNode;
    }

    save() {
        return this.data;
    }
}
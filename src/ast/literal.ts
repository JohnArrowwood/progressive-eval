import { AST } from '..';

export class Literal {
    public type: "Literal";
    public value: string | number | boolean;
    public raw: string;

    constructor (
        value: any = undefined
    ) {
        this.type = "Literal";
        if ( value ) {
            this.value = value;
            this.raw = JSON.stringify( value );
        } else {
            this.value = "";
            this.raw = "''"
        }
    }
}

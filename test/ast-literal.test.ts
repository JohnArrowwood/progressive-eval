import { expect } from 'chai';
import 'mocha';

import { Literal } from '../src/index';

describe( "AST/Literal.constructor", function() {

    it( 'should initialize with the value provided', function() {
        let value: any           = { foo: 'bar' };
        let string_value: string = JSON.stringify( value );
        let ast: Literal         = new Literal(value);
        expect( ast.type ).to.equal( 'Literal' );
        expect( ast.raw ).to.equal( string_value );
        expect( ast.value ).to.equal( value );
    });

    it( 'should be an empty string if no value provided', function() {
        let ast = new Literal();
        expect( ast.type ).to.equal( 'Literal' );
        expect( ast.raw ).to.equal( "''" );
        expect( ast.value ).to.equal( '' );
    });

});
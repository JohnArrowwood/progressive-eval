import { expect } from 'chai';
import 'mocha';
import { parse } from '../../src';
import { BinaryExpression } from '../../src';
import { Literal } from '../../src/ast/literal';

describe("jsep parser", () => {

    it( 'should successfully parse a valid expression', function() {
        let ast = parse( '1+2' );
        expect( ast.type ).to.equal('BinaryExpression');
        let cast = ast as BinaryExpression;
        expect( cast.left.type ).to.equal('Literal');
        expect( (cast.left as Literal).value ).to.equal(1);
        expect( cast.right.type ).to.equal('Literal');
        expect( (cast.right as Literal).value ).to.equal(2);
    });

    it( 'should throw an error when there is a problem parsing', function() {
        expect( function() { parse( '( this +' ) } ).to.throw();
    });

});
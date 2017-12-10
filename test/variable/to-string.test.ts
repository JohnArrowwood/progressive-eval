import { expect } from 'chai';
import 'mocha';
import { Variable } from '../../src/index';

describe( "Variable.toString()", function() {

    it( 'should output the name and the expression', function() {
        let v = new Variable( 'foo', 'bar' );
        let s = v.toString();
        expect( s ).to.equal( '{"foo":"bar"}' );
    });

    it( 'should escape quotes in the expression', function() {
        let v = new Variable( 'foo', 'bar"none' );
        let s = v.toString();
        expect( s ).to.equal( '{"foo":"bar\\\"none"}' );
    });

});
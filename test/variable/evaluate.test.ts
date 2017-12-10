import { expect } from 'chai';
import 'mocha';

import { 
    Variable 
} from '../../src/index';

describe( 'evaluate', function() {

    it( 'should evaluate a stand-alone expression', function() {
        let v = Variable.create( 'name', '1+2' );
        expect( v.evaluate( {} ) ).to.equal( 3 );
    });

    it( 'should return null if variable is in error', function() {
        let v = Variable.create( 'name', '(1+' );
        expect( v.evaluate( {} ) ).to.be.null;
    });

    it( 'should pull values out of the context', function() {
        let v = Variable.create( 'name', 'one+two' );
        expect( v.evaluate( { one: 1, two: 2 } ) ).to.equal( 3 );
    });

    it( 'should be undefined if it depends on an undefined value', function() {
        let v = Variable.create( 'name', 'UNDEF' );
        expect( v.evaluate( {} ) ).to.be.undefined;
    });

    it( 'should return NaN if operating on all undefined variables', function() {
        let v = Variable.create( 'name', 'one+two' );
        expect( v.evaluate( {} ) ).to.be.NaN;
    });

    it( 'may convert undefined to string if combining with a string', function() {
        let v = Variable.create( 'name', 'one+two' );
        expect( v.evaluate( { two: "2" } ) ).to.equal( 'undefined2' );
    });

});
import { expect } from 'chai';
import 'mocha';

import { Variable } from '../../src/index';

function verify( name: string, ok: boolean ) {
    let v = new Variable();
    v.name = name;
    expect( v.name ).to.equal( name );
    if ( ok !== null ) {
        expect( v.nameOK ).to.equal( ok );
    }
}

describe( 'Variable.name and Variable.nameOK', function() {

    it( 'should allow a name consisting of only letters', function() {
        verify( 'abc', true );
    });

    it( 'should allow a name with mixed-case', function() {
        verify( 'fooBar', true );
    });

    it( 'should allow letters and numbers', function() {
        verify( 'abc123', true );
    });

    it( 'should reject if name starts with a digit', function() {
        verify( '123abc', false );
    });

    it( 'should allow a name that starts with an underscore', function() {
        verify( '_abc', true );
    });

    it( 'should allow a name that contains an underscore', function() {
        verify( 'abc_123', true );
    });

    it( 'should allow a single-letter name', function() {
        verify( 'i', true );
    });

    it( 'should reject a name with invalid characters', function() {
        verify( 'foo.bar', false );
    });

});
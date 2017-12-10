import { expect } from 'chai';
import 'mocha';

import { 
    Variable 
} from '../../src/index';

describe( 'Variable.deserialize', function() {

    it( 'should convert a JSON.parse() into a real Variable', function() {
        let v = Variable.create('name','1+2');
        let json = JSON.stringify( v, null, 2 );
        let obj = JSON.parse( json );
        let result = Variable.deserialize( obj );
        expect( result.evaluate({}) ).to.equal( 3 );
    });

});
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
 
    // transition support - from old data to new data
    it( 'should convert a fake one into a real one', function() {
        let result = Variable.deserialize({
            name: 'foo', 
            expr: '"bar"'
        });
        expect( result.evaluate({}) ).to.equal( 'bar' );
    });

    it( 'should throw an error if the object does not specify a name', function() {
        expect(
            () => {
                Variable.deserialize({ expr: '1+2' });
            }
        ).to.throw();
    });

    it( 'should throw an error if the object does not specify an expression', function() {
        expect(
            () => {
                Variable.deserialize({ name: 'abc' });
            }
        ).to.throw();
    });

});
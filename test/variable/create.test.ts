import { expect } from 'chai';
import 'mocha';

import { 
    Variable 
} from '../../src/index';

describe( 'Variable.create( name, expr )', function() {

    it( 'should create a valid variable if given valid input', function() {
        let v = Variable.create( 'foo', 'one + two == three' );
        expect( v.name ).to.equal( 'foo' );
        expect( v.nameOK ).to.be.true;
        expect( v.expr ).to.equal( 'one + two == three' );
        expect( v.ast.type ).to.equal( 'BinaryExpression' );
        expect( Object.keys( v.dep ) ).to.have.same.members( ['one','two','three'] );
    });

    it( 'should flag a bad variable name automatically', function() {
        let v = Variable.create( '8ball', '1+1' );
        expect( v.name ).to.equal( '8ball' );
        expect( v.nameOK ).to.be.false;
    });

    it( 'should flag a bad expression automatically', function() {
        let v = Variable.create( 'valid', '(one+two' );
        expect( v.name ).to.equal( 'valid' );
        expect( v.nameOK ).to.be.true;
        expect( v.error ).to.be.true;
        expect( v.message ).to.equal( 'Unclosed ( at character 8' );
    });

});
import { expect } from 'chai';
import 'mocha';

import { 
    Variable, 
    evaluate 
} from '../../src/index';
import { Literal } from '../../src/ast/literal';

function verify( name: string, expr: string, error: boolean, message: string ) {
    let v = new Variable();
    v.name = name;
    v.expr = expr;
    expect( v.error ).to.equal( error );
    expect( v.message ).to.equal( message );
}

describe( 'Variable.expr and related fields (.error, .message, .dep)', function() {

    it( 'should default to empty string literal if expression is null', function() {
        let v = Variable.create( 'name', null );
        expect( v.ast.type ).to.equal( "Literal" );
        expect( (v.ast as Literal).value ).to.equal( "" );
    });

    it( 'should default to empty string literal if expression is undefined', function() {
        let v = Variable.create( 'name', undefined );
        expect( v.ast.type ).to.equal( "Literal" );
        expect( (v.ast as Literal).value ).to.equal( "" );
    });

    it( 'should default to empty string literal if expression is an empty string', function() {
        let v = Variable.create( 'name', '' );
        expect( v.ast.type ).to.equal( "Literal" );
        expect( (v.ast as Literal).value ).to.equal( "" );
    });

    it( 'should default to empty string literal if expression is an effectively empty string', function() {
        let v = Variable.create( 'name', ' ' );
        expect( v.ast.type ).to.equal( "Literal" );
        expect( (v.ast as Literal).value ).to.equal( "" );
    });

    it( 'should parse the expression', function() {
        let v = new Variable();
        v.name = "foo";
        v.expr = "1+2";
        expect( evaluate( v.ast, {} ) ).to.equal( 3 );
    });

    it( 'should not set the error when it is a valid expression', function() {
        verify( 'foo','1+2',false,"" );
    });

    it( 'should set an error on an invalid expression', function() {
        verify( 'foo','(one+two',true,"Unclosed ( at character 8" );
    });

    it( 'should automatically calculate the dependencies', function() {
        let v = new Variable();
        v.name = 'foo';
        v.expr = "( one + two ) - ( three + four )";
        expect( Object.keys( v.dep ) ).to.have.same.members( ['one','two','three','four'] );
    });

});
import * as expr from 'expression-eval';
import { expect } from 'chai';
import 'mocha';

import { 
    parse,
    evaluate,
    BinaryExpression,
    Literal,
    ParseError,
    canEvaluate,
} from '../src/index';

function verify( expr, context, can, result = null ) {
    it( `should ${can ? 'be able' : 'not be able' } to evaluate '${expr}'`, function() {
        let ast = parse( expr );
        let yes = canEvaluate( ast, context );
        expect( yes ).to.equal( can );
        if ( can && yes && result ) {
            expect( evaluate( ast, context ) ).to.deep.equal( result );
        }
    });
}

describe("canEvaluate()", () => {

    context( 'stand-alone expressions', function() {

        // literal
        verify( 'true',                     {}, true, true );  // boolean
        verify( '1',                        {}, true, 1 );     // numeric
        verify( '"foo"',                    {}, true, 'foo' ); // string

        // identifier - skip - inherently not standalone

        // binary expression
        verify( '1+2',                      {}, true, 3 );        // arithmetic
        verify( '"foo"+"bar"',              {}, true, 'foobar' ); // string

        // logical expression
        verify( 'true && false',            {}, true, false );

        // unary expression
        verify( '! false',                  {}, true, true );
        verify( '+1',                       {}, true, 1 );

        // array expression
        verify( '[true,false,true]',        {}, true, [true,false,true] );
        verify( '[1,2,3]',                  {}, true, [1,2,3] );
        verify( '["A","B","C"]',            {}, true, ['A','B','C'] );

        // member expression - skip - can't be done standalone

        // this expression
        verify( 'this',                     {}, true );

        // call expression - skip - can't be done standalone

        // conditional expression
        verify( '( true ? "foo" : "bar" )', {}, true, 'foo' );

    });

    context( 'expression with dependencies', function() {

        context( 'all provided', function() {

            // literal - skip - does not have dependencies

            // identifier
            verify( 'foo',             {foo:'bar'},           true, 'bar' );

            // binary expression
            verify( 'foo+bar',         {foo:'foo',bar:'bar'}, true, 'foobar' );

            // logical expression
            verify( 'foo && bar',      {foo:true, bar:false}, true, false );

            // unary expression
            verify( '! bogus',         {bogus:false},         true, true );
            verify( '+one',            {one:1},               true, 1 );

            // array expression
            verify( '[one,two,three]', {one:1,two:2,three:3}, true, [1,2,3] );

            // member expression
            verify( 'foo.bar',         {foo:{bar:'spaz'}},    true, 'spaz' );

            // this expression
            it.skip( `should be able to evaluate 'this.thing'`, function() {
                let ast = parse( 'this.thing' );
                let localThis = { thing: 'cool' };
                let yes = canEvaluate.apply( localThis, [ ast, context ] );
                expect( yes ).to.equal( true );
            });
        
            // verify.apply({thing:'cool'}, [ 'this.thing', {}, true, 'cool' ] );

            // call expression
            verify( 'foo()',           {foo:()=>'bar'},       true, 'bar' );
            verify( 'foo(1,2,3)',      {foo:(a,b,c)=>'bar'},  true, 'bar' );
            
            // conditional expression
            verify( '( one+two==three ? yes : no )', {
                one: 1, two: 2, three: 3, yes: 'yes', no: 'no'
            }, true, 'yes' );;

        });

        context( 'some provided, some missing', function() {
            
            verify('foo+bar',{foo:'foo'},false);
            verify('[a,b,c]', {a:'A',b:'B'}, false);
            verify('foo.bar', {}, false );
            verify('foo["bar"]', {foo:{bar:'baz'}}, true );
            verify('foo[missing]', {foo:{bar:'baz'}}, false );
            verify('foo["baz"]', {foo:{bar:'baz'}}, false );
            
        });

        context( 'none provided', function() {

            verify('foo+bar',{},false);
        
        });

        context( 'ParseError', function() {

            it( 'should return false', function() {
                let ast = new ParseError();
                expect( canEvaluate( ast ) ).to.be.false;
            });

        });

    });

});
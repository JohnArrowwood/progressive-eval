import { expect } from 'chai';
import 'mocha';

import { 
    parse,
    evaluate,
    BinaryExpression,
    Literal,
    ParseError,
    dependencies
} from '../src';

function given( expr ) {
    var result = dependencies( parse( expr ) );
    if ( result ) return Object.keys( dependencies( parse( expr ) ) );
    else          return [];
}
describe("dependencies", () => {

    context( 'Literal', function() {

        it( 'should have no dependencies', function() {
            expect( given('true') ).to.be.empty;
        });
    
    });

    context( 'Identifier', function() {

        it( 'should include only the identifier', function() {
            expect( given('foo') ).to.have.same.members( ['foo'] );
        });

    });

    context( 'BinaryExpression', function() {

        it( 'should include the left side', function() {
            expect( given('left+right') ).to.contain( 'left' );
        });

        it( 'should include the right side', function() {
            expect( given('left+right') ).to.contain( 'right' );
        });

        it( 'should recurse', function() {
            expect( given('(one+two)-(three+four)') ).to.have.same.members( ['one','two','three','four'] );
        });

    });

    context( 'LogicalExpression', function() {

        it( 'should include the left side', function() {
            expect( given('left && right') ).to.contain( 'left' );
        });

        it( 'should include the right side', function() {
            expect( given('left && right') ).to.contain( 'right' );
        });

        it( 'should recurse', function() {
            expect( given('(one && two) || (three && four)') ).to.have.same.members( ['one','two','three','four'] );
        });

    });

    context( 'UnaryExpression', function() {
        
        it( 'should include the argument', function() {
            expect( given('+one') ).to.have.same.members( ['one'] );
        });

        it( 'should recurse', function() {
            expect( given('-(one + two)') ).to.have.same.members( ['one','two'] );
        });

    });

    context( 'ArrayExpression', function() {
        
        it( 'should include all elements', function() {
            expect( given('[a,b,c]') ).to.have.same.members( ['a','b','c'] );
        });

        it( 'should recurse', function() {
            expect( given('[ one + two, three && four ]') ).to.have.same.members( ['one','two', 'three', 'four'] );
        });

    });

    context( 'MemberExpression', function() {

        it( 'should return the object and not the member', function() {
            let result = given('foo.bar');
            expect( result ).to.contain( 'foo' );
            expect( result ).to.not.contain( 'bar' );
        });

        it( 'should recurse', function() {
            expect( given('(foo+bar).baz') ).to.have.same.members( ['foo','bar'] );
        });

    });

    context( 'ThisExpression', function() {

        it( 'should return no dependencies', function() {
            expect( given('this') ).to.be.empty;
        });

    });

    context( 'CallExpression', function() {

        it( 'should include the function name', function() {
            expect( given('foo()') ).to.contain( 'foo' );
        });

        it( 'should recurse over the function name', function() {
            expect( given( '(test ? foo : bar )(param)') ).to.have.same.members( ['test','foo','bar','param'] );
        });

        it( 'should recurse over the parameters', function() {
            expect( given( 'func( one+two, three+four )' ) ).to.have.same.members( ['func','one','two','three','four'] );
        });

    });

    context( "ConditionalExpression", function() {

        it( 'should include the test portion', function() {
            expect( given( 'a || b ? "true" : "false"' ) ).to.have.same.members( ['a','b'] ); 
        });

        it( 'should include the IF TRUE portion', function() {
            expect( given( 'true ? whenTrue : false' ) ).to.have.same.members( ['whenTrue'] ); 
        });

        it( 'should include the ELSE / IF FALSE portion', function() {
            expect( given( 'false ? true : whenFalse' ) ).to.have.same.members( ['whenFalse'] ); 
        });

        it( 'should recurse into each', function() {
            expect( given( 'one || two ? three + four : five / six' ) ).to.have.same.members( [ 'one','two','three','four','five','six' ] );
        });

    });

    context( "ParseError", function() {
        it( 'should return none', function() {
            let ast = new ParseError();
            expect( dependencies( ast ) ).to.be.empty;
        })
    })

});
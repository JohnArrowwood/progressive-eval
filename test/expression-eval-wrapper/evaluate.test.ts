import { expect } from 'chai';
import 'mocha';
import { 
    parse,
    evaluate,
    BinaryExpression,
    Literal,
    ParseError
} from '../../src';

describe("expression-eval wrapper: evaluate", () => {

    context( 'string parameter', function() {

        it( 'should successfully parse and evaluate in one step', function() {
            let result = evaluate( 'one + two', { one: 1, two: 2 } );
            expect( result ).to.equal( 3 );
        });

        it( 'should throw an error on an invalid expression', function() {
            expect( function() { evaluate( '( this +', {} ) } ).to.throw();
        });

    });
    
    context( 'AST parameter', function() {
        
        it( 'should successfully work on a pre-parsed expression AST', function() {
            let ast = parse( 'one + two' );
            let result = evaluate( ast, { one: 1, two: 2 } );
            expect( result ).to.equal( 3 );
        });

        it( 'should return undefined when the AST is a Parse Error (e.g. unrecognized type', function() {
            let ast = new ParseError();
            let result = evaluate( ast, {} );
            expect( result ).to.be.undefined;
        });
    
    });

    context( 'context parameter is optional', function() {

        it( 'should assume an empty context', function() {
            let ast = parse( 'one + two' );
            let result = evaluate( ast );
            expect( result ).to.be.NaN;
        });

    });

});
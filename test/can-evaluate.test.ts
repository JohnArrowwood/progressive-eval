import { expect } from 'chai';
import 'mocha';

import { 
    parse,
    evaluate,
    BinaryExpression,
    Literal,
    ParseError,
    canEvaluate
} from '../src';

function verify( expr, context, expected ) {
    it( `should return ${expected}`, function() {
        var result = canEvaluate( parse( expr ), context );
        expect( result ).to.equal( expected );
    });
}

describe("canEvaluate", () => {

    context( 'stand-alone expression', function() {

        verify('1+2',{},true);
    
    });

    context( 'expression with dependencies', function() {

        context( 'all provided', function() {

            verify('foo+bar',{foo:'foo',bar:'bar'},true);

        });

        context( 'some provided, some missing', function() {
            
            verify('foo+bar',{foo:'foo'},false);

        });

        context( 'none provided', function() {

            verify('foo+bar',{},false);
        
        });

    });

});
import { expect } from 'chai';
import 'mocha';

import { 
    evaluateVariables 
} from '../src/index';

import { buildSet } from './build-set';

describe( 'evaluateVariables( vars, context )', function() {

    context( 'no dependencies', function() {

        it( 'should evaluate everything', function() {
            let vars = buildSet({
                n: '1',
                s: '"string"',
                b: 'true',
                expr: '1+1'
            });
            let vals = evaluateVariables( vars, {} );
            expect( vals.n ).to.equal( 1 );
            expect( vals.s ).to.equal( "string" );
            expect( vals.b ).to.be.true;
            expect( vals.expr ).to.equal( 2 );
        });

    });

    context( 'with dependencies', function() {

        it( 'should evaluate in the correct order to handle dependencies', function() {
            let vars = buildSet({
                A: 'B+C',
                B: 'C+1',
                C: '1'
            });
            let vals = evaluateVariables( vars, {} );
            expect( vals.A ).to.equal( 3 );
            expect( vals.B ).to.equal( 2 );
            expect( vals.C ).to.equal( 1 );
        });

        it( 'should pull undefined identifiers from the context object', function() {
            let vars = buildSet({
                A: 'B+C',
                B: 'C+1',
                C: 'D'
            });
            let vals = evaluateVariables( vars, {D:1} );
            expect( vals.A ).to.equal( 3 );
            expect( vals.B ).to.equal( 2 );
            expect( vals.C ).to.equal( 1 );
        });

    });

    context( 'with cyclic dependencies', function() {

        it( 'should not return the variables involved in the cycle', function() {
            let vars = buildSet({
                A: 'B+1',
                B: 'C+1',
                C: 'A+1',
                D: '23'
            })
            let vals = evaluateVariables( vars, {} );
            expect( Object.keys( vals ) ).to.have.same.members( ['D'] );
        });

    });

    context( 'input context', function() {

        it( 'should not pass through the context into the output', function() {
            let vars = buildSet({
                A: 'B'
            });
            let vals = evaluateVariables( vars, {B:'foo',C:'bar'} );
            expect( Object.keys( vals ) ).to.have.same.members( ['A'] );
        })

    });

});
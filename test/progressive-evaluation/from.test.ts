import { expect } from 'chai';
import 'mocha';

import { 
    ProgressiveEvaluation,
    SetOfVariables,
    VariableValues
} from '../../src/index';

import { buildSet } from '../build-set';


describe( "ProgressiveEvaluation.from( vars, context )", function() {
    
    context( 'no dependencies', function() {
        
        let vars: SetOfVariables,
            eval_context: VariableValues,
            result: ProgressiveEvaluation;
        
        before(function() {
            vars = buildSet({
                n: '1',
                s: '"string"',
                b: 'true',
                expr: '1+1'
            });
            eval_context = { foo: 'bar', blip: 'baz' };
            result = ProgressiveEvaluation.from( vars, eval_context );
        });
        
        it( 'should have no previous evaluation from which it is based', function() {

            expect( result.previous ).to.be.null;
        
        });
        
        it( 'should have embedded within it a copy of the input context', function() {
            expect( result.context ).to.not.equal( eval_context );
            expect( Object.keys( result.context ) ).to.have.same.members( Object.keys( eval_context ) );
            expect( Object.keys( result.context ).map( (name) => result.context[name]) )
                .to.have.same.members( Object.keys( eval_context ).map( (name) => eval_context[name]) );
        });

        it( 'should include the original variable definitions', function() {
            expect( result.definitions ).to.deep.equal( vars );
        });

        it( 'should include the order in which the variables were evaluated', function() {
            expect( result.evalOrder.map( v => v.name ) ).to.have.same.members( ['n','s','b','expr'] );
        });

        it( 'should evaluate everything', function() {
            expect( result.values.n ).to.equal( 1 );
            expect( result.values.s ).to.equal( "string" );
            expect( result.values.b ).to.be.true;
            expect( result.values.expr ).to.equal( 2 );
        });

        it( 'should list all the variables originally provided', function() {
            expect( result.provided ).to.deep.equal( vars );
        });

        it( 'should not have injected anything', function() {
            expect( result.injected ).to.be.empty;
        });

        it( 'should not have skipped anything', function() {
            expect( result.notEvaluated ).to.be.empty;
        });

    });

    context( 'with dependencies', function() {

        it( 'should evaluate in the correct order to handle dependencies', function() {
            let vars = buildSet({
                A: 'B+C',
                B: 'C+1',
                C: '1',
                D: 'A+B'
            });
            let result = ProgressiveEvaluation.from( vars, {} );
            expect( result.values.A ).to.equal( 3 );
            expect( result.values.B ).to.equal( 2 );
            expect( result.values.C ).to.equal( 1 );
            expect( result.values.D ).to.equal( 5 );
        });

        it( 'should pull undefined identifiers from the context object', function() {
            let vars = buildSet({
                A: 'B+C',
                B: 'C+1',
                C: 'D'
            });
            let result = ProgressiveEvaluation.from( vars, {D:1} );
            expect( result.values.A ).to.equal( 3 );
            expect( result.values.B ).to.equal( 2 );
            expect( result.values.C ).to.equal( 1 );
        });

        it( 'should skip variables whose values are not knowable', function() {
            let vars = buildSet({
                A: "'abc123'",
                B: "unknown"
            });
            let context = { known: 'foo' };
            let result = ProgressiveEvaluation.from( vars, context );
            expect( result.values ).to.include.keys('A');
            expect( result.values ).to.not.include.keys('B');
            expect( result.notEvaluated ).to.include.keys('B');
        });

    });

    context( 'with cyclic dependencies', function() {

        it( 'should omit the cyclic definitions', function() {
            let vars = buildSet({
                A: 'B+1',
                B: 'C+1',
                C: 'A+1'
            });
            let result = ProgressiveEvaluation.from( vars, {} );
            expect( result.values ).to.not.include.keys('A','B','C');
            expect( result.notEvaluated ).to.include.keys('A','B','C');
        });

        it( 'should calculate if the context breaks the cycle', function() {
            let vars = buildSet({
                A: 'B+1',
                B: 'C+1',
                C: 'A+1'
            });
            let result = ProgressiveEvaluation.from( vars, {C:1} );
            expect( result.values.A ).to.equal( 3 );
            expect( result.values.B ).to.equal( 2 );
            expect( result.values.C ).to.equal( 4 );
        });

    });

    context( 'input context', function() {

        it( 'should not pass through the context into the output', function() {
            let vars = buildSet({
                A: 'B'
            });
            let result = ProgressiveEvaluation.from( vars, {B:'foo',C:'bar'} );
            expect( Object.keys( result.values ) ).to.have.same.members( ['A'] );
        })

    });
});
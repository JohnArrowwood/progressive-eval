import { expect } from 'chai';
import 'mocha';

import { ProgressiveEvaluation } from '../../src/index';
import { buildSet } from '../build-set';

describe( 'ProgressiveEvaluation.extend( vars )', function() {

    let base: ProgressiveEvaluation,
        next: ProgressiveEvaluation;

    context( 'no variables provided', function() {
        
        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "'a'"
            }), {} );
        });

        it( 'should handle an empty set', function() {
            next = base.extend({});
            expect( Object.keys( next.definitions ) ).to.have.same.members( ['A'] );
        });

        it( 'should handle null', function() {
            next = base.extend(null);
            expect( Object.keys( next.definitions ) ).to.have.same.members( ['A'] );
        });

    });

    context( 'adds the newly defined variables to the existing set', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "'a'"
            }), {} );
            next = base.extend( buildSet({
                B: "'b'"
            }));
        });

        it( 'should refer back to the old set via .previous', function() {
            expect( next.previous ).to.equal( base );
        });

        it( 'should share the same .context with the previous', function() {
            expect( next.context ).to.equal( base.context );
        });

        it( 'should list all variables in .definitions', function() {
            expect( Object.keys( next.definitions ) ).to.have.same.members( ['A','B'] );
        });

        it( 'should not have modified the .definitions of the previous set', function() {
            expect( Object.keys( base.definitions ) ).to.have.same.members( ['A'] );            
        });

        it( 'should preserve the evaluation order in .evalOrder', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['B'] );
        });

        it( 'should include the values from both sets in .values', function() {
            expect( Object.keys( next.values ) ).to.have.same.members( ['A','B'] );
            expect( next.values.A ).to.equal( 'a' );
            expect( next.values.B ).to.equal( 'b' );
        });

        it( 'should not have modified the values from the previous set', function() {
            expect( Object.keys( base.values ) ).to.have.same.members( ['A'] );
            expect( base.values.A ).to.equal( 'a' );
        });

        it( 'should list only the variables asked for in .provided', function() {
            expect( Object.keys( next.provided ) ).to.have.same.members( ['B'] );
        });

        it( 'should not have injected anything', function() {
            expect( next.injected ).to.be.empty;
        });

        it( 'should have evaluated everything, no exceptions', function() {
            expect( next.notEvaluated ).to.be.empty;
        });

    });

    context( 'references variables from the previous set', function() {
        
        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: '1'
            }), {} );
            next = base.extend( buildSet({
                B: 'A+1'
            }));
        });

        it( 'should include both in the .definitions', function() {
            expect( Object.keys( next.definitions ) ).to.have.same.members( ['A','B'] );
        });

        it( 'should not have modified the .definitions of the previous set', function() {
            expect( Object.keys( base.definitions ) ).to.have.same.members( ['A'] );            
        });

        it( 'should not have re-evaluated the variables from the previous set', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['B'] );
            expect( next.injected ).to.be.empty;
            expect( next.notEvaluated ).to.be.empty;
        });

        it( 'should have calculated the variables correctly', function() {
            expect( next.values.A ).to.equal( 1 );
            expect( next.values.B ).to.equal( 2 );
        });

    });

    context( 'references variables from the context', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
            }), { A: 1 } );
            next = base.extend( buildSet({
                B: "A+1"
            }));
        });

        it( 'should not inject the context value into the value set', function() {
            expect( base.values ).to.not.include.keys( 'A' );
            expect( next.values ).to.not.include.keys( 'A' );
        })
        
        it( 'should resolve the value from the context', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['B'] );
            expect( next.values.B ).to.equal( 2 );
        });

    });
        
    context( 'redefines an existing variable', function() {


        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "'a'"
            }), {} );
            next = base.extend( buildSet({
                A: "'b'"
            }));
        });

        it( 'should not have modified the values from the previous set', function() {
            expect( base.values.A ).to.equal( 'a' );
            expect( next.values.A ).to.equal( 'b' );
        });

    });

    context( 'defines a cyclic dependency', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "B+1"
            }), {} );
            next = base.extend( buildSet({
                B: "A+1",
                C: "1+2"
            }));
        });

        it( 'should include all variables in .definitions', function() {
            expect( Object.keys( next.definitions ) ).to.have.same.members( ['A','B','C'] );
        });

        it( 'should skip the variables defined but not evaluatable', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['C'] );
            expect( Object.keys( next.values ) ).to.have.same.members( ['C'] );
            expect( Object.keys( next.provided ) ).to.have.same.members( ['B','C'] );
            expect( Object.keys( next.notEvaluated ) ).to.have.same.members( ['B'] );
        });

        it( 'should not have injected anything', function() {
            expect( next.injected ).to.be.empty;
        });

    });

    context( 'defines a cyclic dependency which is resolved by the context', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "B+1",
                B: "C+1",
            }), { D: 1 } );
            next = base.extend( buildSet({
                C: "D+1",
                D: "A+1"
            }));
        });

        it( 'should inject the context value into the evaluation order', function() {
            let sequence = next.evalOrder.map( v => v.name );
            expect( sequence.indexOf( 'D' ) ).to.equal( 0 );
            expect( sequence.indexOf( 'D', 1 ) ).to.be.greaterThan( 0 );
        });

        it( 'should inject the missing variable(s) into the current evaulation context', function() {
            expect( Object.keys( next.injected ) ).to.have.same.members( ['A','B'] );
        });

        it( 'should calculate everything correctly', function() {
            expect( next.values.C ).to.equal( 2 );
            expect( next.values.B ).to.equal( 3 );
            expect( next.values.A ).to.equal( 4 );
            expect( next.values.D ).to.equal( 5 );
        });

    });

    context( 'resolves a cyclic dependency', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "B+1",
                B: "C+1",
                C: "A+1"
            }), {} );
            next = base.extend( buildSet({
                A: "1"
            }));
        });

        it( 'should replace the variable in .definitions', function() {
            expect( base.definitions.A.expr ).to.equal( 'B+1' );
            expect( next.definitions.A.expr ).to.equal( '1' );
        });

        it( 'should inject the necessary variables into the current evaluation context', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['A','B','C'] );
            expect( Object.keys( next.injected ) ).to.have.same.members( ['B','C'] );
        });

        it( 'should calculate everything correctly', function() {
            expect( next.values.A ).to.equal( 1 );
            expect( next.values.B ).to.equal( 3 );
            expect( next.values.C ).to.equal( 2 );
        });

    });

    context( 'incremental reassignment', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "1"
            }), {} );
            next = base.extend( buildSet({
                A: "A+1"
            }));
        });

        it( 'should redefine the variable only in the new set', function() {
            expect( base.definitions.A.expr ).to.equal( '1' );
            expect( next.definitions.A.expr ).to.equal( 'A+1' );
        });

        it( 'should set the new value without modifying the old value', function() {
            expect( base.values.A ).to.equal( 1 );
            expect( next.values.A ).to.equal( 2 );
        });

    });

    context( 'with forward references', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "1"
            }), {} );
            next = base.extend( buildSet({
                B: "C+D",
                C: "A+1"
            }));
        });

        it( 'should ignore variables that can not yet be calculated', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['C'] );
            expect( Object.keys( next.values ) ).to.have.same.members( ['A','C'] );
            expect( Object.keys( next.provided ) ).to.have.same.members( ['B','C'] );
            expect( Object.keys( next.injected ) ).to.be.empty;
            expect( Object.keys( next.notEvaluated ) ).to.have.same.members( ['B'] );
        });

        it( 'should calculate values that it can', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['C'] );
            expect( Object.keys( next.values ) ).to.have.same.members( ['A','C'] );
            expect( next.values.A ).to.equal( 1 );
            expect( next.values.C ).to.equal( 2 );
        });

    });

    context( 'resolve existing forward references', function() {

        before( function() {
            base = ProgressiveEvaluation.from( buildSet({
                A: "B+C"
            }), {} );
            next = base.extend( buildSet({
                B: "1",
                C: "B+1"
            }));
        });

        it( 'should inject the value of the previous variable for evaluation', function() {
            expect( next.evalOrder.map( v => v.name ) ).to.have.same.members( ['A','B','C'] );
            expect( Object.keys( next.injected ) ).to.have.same.members( ['A'] );
            expect( next.values.A ).to.equal( 3 );
            expect( next.values.B ).to.equal( 1 );
            expect( next.values.C ).to.equal( 2 );
        });

    });

    context( 'only recalculate values when needed', function() {

        context( 'football vs. foodfight', function() {

            let A, B, C;

            before(function() {
                A = ProgressiveEvaluation.from( buildSet({
                    A: "B+C"
                }), {} );
                B = A.extend( buildSet({
                    B: "'foo'",
                    C: "'t'",
                    D: "A+'ball'"
                }));
                C = B.extend( buildSet({
                    C: "'d'",
                    E: "A+'fight'"
                }));
            });

            it( 'should not have calculated A in the first step', function() {
                expect( Object.keys( A.notEvaluated ) ).to.have.same.members( ['A'] );
            });

            it( 'should have injected A into the second step, to enable calculating D', function() {
                expect( Object.keys( B.injected ) ).to.have.same.members( ['A'] );
                expect( B.values.D ).to.equal( 'football' );
            });

            it( 'should re-inject A and B into the third step to calculate E', function() {
                expect( Object.keys( C.injected ) ).to.have.same.members( ['A','B'] );
                expect( C.values.E ).to.equal( 'foodfight' );
            });

            it( 'should NOT have re-calculated the value of D', function() {
                expect( C.values.D ).to.equal( 'football' );
            });

        });

    });

});

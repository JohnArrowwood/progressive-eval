import { expect } from 'chai';
import 'mocha';

import { 
    evaluationOrder, Variable, VariableName
} from '../src/index';

import { buildSet } from './build-set';

function names( list: Array<Variable> ) : Array<VariableName> {
    return list.map( v => v.name );
}
describe("evaluationOrder", () => {

    context( "all independent expressions", function() {

        it( 'should return all dependencies, in no particular order', function() {
            var result = evaluationOrder( buildSet({ one: 1, two: 2, three: 3 }), {} );
            expect( names(result) ).to.have.same.members( ['one','two','three'] );
        });
    });

    context( "one or more variables in an error state", function() {

        it( 'should skip the error variables', function() {
            var result = evaluationOrder( buildSet({
                A: '1',
                B: '2',
                C: '"broken',
                D: '1+',
                E: '5'
            }),{});
            expect( names( result) ).to.have.same.members( ['A','B','E'] ); 
        });
    });

    context( "one or more depend on something that is not defined", function() {

        it( 'should skip the variable', function() {
            var result = evaluationOrder( buildSet({
                A: '1',
                B: 'missing',
            }),{});            
            expect( names( result) ).to.have.same.members( ['A'] ); 
        });
    });

    context( "one depends on another", function() {

        it( 'should put the other one first', function() {
            let vars = buildSet({
                four: 'two+two',
                two: '2'
            });
            let result = evaluationOrder( vars, {} );
            let order = names(result);
            expect( order.indexOf('two') ).to.be.lessThan( order.indexOf('four') );
        });

    });

    context( "one depends on two others", function() {

        it( 'should put the two others first', function() {
            let vars = buildSet({
                A: 'B+C',
                B: '1',
                C: '2'
            });
            let result = evaluationOrder( vars, {} );
            let order = names(result);
            expect( order.indexOf('B') ).to.be.lessThan( order.indexOf('A') );
            expect( order.indexOf('C') ).to.be.lessThan( order.indexOf('A') );
        });

    });

    context( "simple dependency tree", function() {

        it( 'should put the items in the correct order', function() {
            var result = evaluationOrder( buildSet( { A:'B+C', B:'C+1', C:'1' }), {} );
            var order = names(result);
            let A = order.indexOf('A');
            let B = order.indexOf('B');
            let C = order.indexOf('C');
            expect( C ).to.be.lessThan( B );
            expect( B ).to.be.lessThan( A );
            expect( C ).to.be.lessThan( A );
        });

    });

    context( "dependency loop", function() {

        let vars = buildSet({
            A:'B+1',
            B:'C+1',
            C:'D+1',
            D:'A+1'
        });
    
        it( 'should be an undefined/incorrect order', function() {
            // this test borders on pointless, but it documents the way things work
            let sorted = evaluationOrder( vars, {} );
            let order = names(sorted);
            let A = order.indexOf('A');
            let B = order.indexOf('B');
            let C = order.indexOf('C');
            let D = order.indexOf('D');
            expect( A > B && B > C && C > D && D > A ).to.be.false;
        });

        it( 'should inject value from context to (hopefully) break the cycle', function() {
            let sorted = evaluationOrder( vars, { A: 1 } );
            let order = names(sorted);
            expect( order.indexOf('A') ).to.equal( 0 );
            expect( order.indexOf('A',1) ).to.be.greaterThan( 0 );
        });
    });

    context( "double-dependency loop", function() {

        it( 'should not inject the context variable more than once', function() {
            let vars = buildSet({
                A:'B+1',
                B:'C+E+1',
                C:'D+1',
                D:'A+1',
                E:'F+1',
                F:'A+1'
            });
            let sorted = evaluationOrder( vars, { A: 1 } );
            let order = names( sorted );
            let count = 0;
            order.forEach( n => { if ( n === 'A' ) count++; } );
            expect( count ).to.equal( 2 );
        });

    });

});
import { expect } from 'chai';
import 'mocha';

import { 
    ProgressiveEvaluation,
    SetOfVariables,
    VariableValues
} from '../../src/index';

import { buildSet } from '../build-set';

describe( 'ProgressiveEvaluation.of( list-of-vars, context )', function() {

    it( 'should handle null', function() {
        let list = ProgressiveEvaluation.of( null, null );
        expect( list.length ).to.equal( 1 );
    });

    it( 'should handle undefined', function() {
        let list = ProgressiveEvaluation.of( undefined, undefined );
        expect( list.length ).to.equal( 1 );
    });

    it( 'should handle an empty array', function() {
        let list = ProgressiveEvaluation.of( [], {} );
        expect( list.length ).to.equal( 1 );
    });

    it( 'should handle one element', function() {
        let list = ProgressiveEvaluation.of( [
            buildSet({ A:'1' })
        ], {} );
        expect( list.length ).to.equal( 1 );
        expect( Object.keys( list[0].definitions ) ).to.have.same.members( ['A'] );
    });

    it( 'should handle two elements', function() {
        let list = ProgressiveEvaluation.of( [
            buildSet({ A:'1' }),
            buildSet({ B:'2' })
        ], {} );
        expect( list.length ).to.equal( 2 );
        expect( Object.keys( list[0].definitions ) ).to.have.same.members( ['A'] );
        expect( Object.keys( list[1].definitions ) ).to.have.same.members( ['A','B'] );
    });

    it( 'should handle three elements', function() {
        let list = ProgressiveEvaluation.of( [
            buildSet({ A:'1' }),
            buildSet({ B:'2' }),
            buildSet({ C:'3' })
        ], {} );
        expect( list.length ).to.equal( 3 );
        expect( Object.keys( list[0].definitions ) ).to.have.same.members( ['A'] );
        expect( Object.keys( list[1].definitions ) ).to.have.same.members( ['A','B'] );
        expect( Object.keys( list[2].definitions ) ).to.have.same.members( ['A','B','C'] );
    });

});
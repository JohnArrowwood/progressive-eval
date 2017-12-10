import { expect } from 'chai';
import 'mocha';

import { Variable } from '../../src/index';
import { buildSet } from '../build-set';

describe( "Variable.canEvaluate", function() {

    it( 'should return true if variable has no dependencies', function() {
        let vars = buildSet({
            A: '1+2'
        });
        expect( vars.A.canEvaluate(vars,{}) ).to.be.true;
    });

    it( 'should return true if variable dependencies are met in definitions', function() {
        let vars = buildSet({
            A: 'B+1',
            B: '1'
        });
        expect( vars.A.canEvaluate( vars, {} ) ).to.be.true;
    });

    it( 'should return true if variable dependencies are met in context', function() {
        let vars = buildSet({
            A: 'B+1'
        });
        expect( vars.A.canEvaluate( vars, {B:1} ) ).to.be.true;
    });

    it( 'should return false if dependencies are not met', function() {
        let vars = buildSet({
            A: 'B+1'
        });
        expect( vars.A.canEvaluate( vars, {C:1} ) ).to.be.false;        
    });

    it( 'should return false if there is a cycle in the dependencies', function() {
        let vars = buildSet({
            A: 'B+1',
            B: 'C+1',
            C: 'A+1'
        });
        expect( vars.A.canEvaluate( vars, {} ) ).to.be.false;        
    });

    it( 'should return true if the cycle is broken by the context', function() {
        let vars = buildSet({
            A: 'B+1',
            B: 'C+1',
            C: 'A+1'
        });
        expect( vars.A.canEvaluate( vars, {C:1} ) ).to.be.true;        
    });

    it( 'should return false if the variable is in error', function() {
        let vars = buildSet({
            A:'('
        });
        expect( vars.A.canEvaluate( vars, {} ) ).to.be.false;
    });

    it( 'should return false if a dependency is in error', function() {
        let vars = buildSet({
            A:'B+1',
            B:'('
        });
        expect( vars.A.canEvaluate( vars, {} ) ).to.be.false;
    });

});
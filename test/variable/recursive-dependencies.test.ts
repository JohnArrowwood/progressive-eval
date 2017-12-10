import { expect } from 'chai';
import 'mocha';

import { 
    Variable, 
} from '../../src/index';

import { buildSet } from '../build-set';

describe( "Variable.recursiveDependencies", function() {

    it( 'should return both direct and indirect dependencies', function() {
        let vars = buildSet({
            A:'B+1',
            B:'C+1',
            C:'1'
        });
        expect( Object.keys( vars.A.recursiveDependencies( vars ) ) ).to.have.same.members( ['B','C'] );
    });

    it( 'should list each dependency only once', function() {
        let vars = buildSet({ 
            A:'B+C',
            B:'C+D',
            C:'D+E+F'
        });
        let results = Object.keys( vars.A.recursiveDependencies( vars ) );
        expect( results ).to.have.same.members( ['B','C','D','E','F'] );
        expect( results.length ).to.equal( 5 );
    });

    it( 'can handle cyclic dependencies', function() {
        let vars = buildSet({
            A:'B+1',
            B:'C+1',
            C:'A+1'
        });
        let results = Object.keys( vars.A.recursiveDependencies( vars ) );
        expect( results ).to.have.same.members( ['A','B','C'] );
    });

    it( 'can handle a standalone expression', function() {
        let vars = buildSet({
            A:'1+2'
        });
        let results = Object.keys( vars.A.recursiveDependencies( vars ) );
        expect( results.length ).to.equal( 0 );
    });

    it( 'can handle an erroneous/unparseable expression', function() {
        let vars = buildSet({
            A: '(one+two'
        });
        let results = Object.keys( vars.A.recursiveDependencies( vars ) );
        expect( results.length ).to.equal( 0 );
    });

});
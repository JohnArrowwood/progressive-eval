# progressive-eval
Extends expression-eval to include evaluating sets of variables, and 
progressively evaluating a list of variable sets.

This module is the result of a very specific need:

Imagine you have variables / parameters defined in hierarchical sets.  Variables 
defined lower in the hierarchy override variables of the same name higher up in 
the hierarchy, but only from the perspective of that node and it's children.  
At each point in the hierarchy, the variables are evaluated, and then the 
results fed into the next level down.  The end result is a set of variables and 
their values.  For example:

    TOP-LEVEL
    * A = B + C  // note that B and C are not defined
    
    SECOND-LEVEL
    * B = 'foo'
    * C = 't'
    * D = A + 'ball'  // obviously, should have the value 'football'

    THIRD-LEVEL
    * C = 'd'
    * E = A + 'fight' // Because C was changed, A takes on a new value, thus E = 'foodfight'

If done correctly, the full set of variables should be:

    * A = 'food'
    * B = 'foo'
    * C = 'd'
    * D = 'football'
    * E = 'foodfight'

Notice that because `D` was calculated in the second level and not referenced in
the third level, it's value remains fixed, even though the value of A was
changed when the value of `C` was changed.  If you were to just merge all of the 
definitions from each level, with no intermediate calculations, then the final 
value of `D` would have been `'foodball'`, which is obviously counter-intuitive.

This module implements the logic necessary to get this concept of variable
inheritance/overriding to produce the expected result.

## Key Features

### Expressions

Each variable is defined as a string expression.  In addition to various
mathematical and string operators, the expression can also include references 
to other variables.  

### Dependency Checking

Variables are evaluated as a set.  The set is processed in dependency order
so that if variable `A` depends on `B`, and `B` depends on `C`, then `C` will 
be evaluated first, then `B`, and finally `A`.

### Forward References

As illustrated in the example, a variable can be defined at one level of the
hierarchy that depends on variables not defined until lower in the hierarchy.  
Until the dependencies are defined, the variable is not evaluated. Once those
dependencies are defined, then the variable gets a value.

### Cyclic Dependencies

If a variable depends on another variable, that directly or indirectly depends
on this variable, then the variable can not be evaluated.

The exception is where the dependency had a concrete value earlier in the
dependency tree.  For example:

    LEVEL 1
    * A = 1

    LEVEL 2
    * A = A + 1

In this case, the value of `A` can be evaluated, and should have the value `2`.

However, full on dependency loops can only be broken by breaking the chain.
For example:

    LEVEL 1
    * A = B + 1
    * B = C + 1
    * C = A + 1

    LEVEL 2
    * A = 1;

At `LEVEL 1` none of the variables will be able to be calculated.  At level 2, 
the dependency loop is broken, and so the variables all get assigned:

    * A = 1
    * B = 3
    * C = 2

## Installing

    npm install --save progressive-evaluate

## Usage

Create a variable:

    let v = new Variable( 'three', '1+2' );

Evaluating a variable in a particular context:

    let _x = new Variable( 'x', 'y+1' );
    let x = _x.evaluate( { y:5 } );  // 6

Supporting functions in expressions:

    let context = {
        bar: 3,
        random: Math.random,
    };
    let foo = new Variable( 'foo', 'bar + random() * 5' );

Building/evaluating sets of variables

    let collection = {};
    let context = { D: 1 };
    collection.A = new Variable( 'A', 'B+1' );
    collection.B = new Variable( 'B', 'C+1' );
    collection.C = new Variable( 'C', 'D+1' );
    let values = evaluateVariables( collection, context );
    // A: 4
    // B: 3
    // C: 2
    // NOTICE: D is not injected into the output, it is only in the context
    
Getting the order in which the variables will be evaluated

    let order = evaluationOrder( collection, context );
    // [ 'C', 'B', 'A' ]

Progressively evaluating sets of variables

    let context = { foo: 5 };
    let level1 = ProgressiveEvaluation.from({ 
        A: new Variable( 'A', '1+2' ),
        B: new Variable( 'B', 'A+foo' )
    }, context );
    let level2 = level1.extend({
        A: new Variable( 'A', '10' )
    });
    console.log( level1.values.A ); // 3
    console.log( level2.values.A ); // 10
    console.log( Object.keys( level2.values ) ); // ['A','B']

Evaluating all of the levels at once:

    let set1 = { ... };
    let set2 = { ... };
    let set3 = { ... };
    let everything = ProgressiveEvaluation.of( [ set1, set2, set3 ] );

See the test cases for other examples of how to use the library.

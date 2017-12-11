import {
    Variable,
    VariableName,
    SetOfVariables,
    VariableValues,
    evaluationOrder,
    evaluateVariables,
} from '.';

export class ProgressiveEvaluation {
    // private property storage
    private _previous:     ProgressiveEvaluation; // link to previous evaluation on which this one is based
    private _context:      VariableValues;        // context in which variables were evaluated
    private _definitions:  SetOfVariables;        // accumulated variable definitions
    private _eval_order:   Array<Variable>;       // save the order in which the variables were evaluated
    private _values:       VariableValues;        // accumulated calculated values 
    private _provided:     SetOfVariables;        // which variables were provided for this evaluation
    private _injected:     SetOfVariables;        // which were injected into the calculation from previous calculations
    private _notEvaluated: SetOfVariables;        // which were skipped due to dependency issues

    // public property accessor methods - this is meant to be an immutable object!
    public get previous():     ProgressiveEvaluation { return this._previous;     }
    public get context():      VariableValues        { return this._context;      }
    public get definitions():  SetOfVariables        { return this._definitions;  }
    public get evalOrder():    Array<Variable>       { return this._eval_order;   }
    public get values():       VariableValues        { return this._values;       }
    public get provided():     SetOfVariables        { return this._provided;     }
    public get injected():     SetOfVariables        { return this._injected;     }
    public get notEvaluated(): SetOfVariables        { return this._notEvaluated; }

    /**
     * factory method: ProgressiveEvaluation.from( vars, context );
     * @param vars - the set of variables to evaluate
     * @param context - the context in which to evaluate them
     */
    static from( vars: SetOfVariables, context?: VariableValues ): ProgressiveEvaluation {
        let pe = new ProgressiveEvaluation();
        if ( context === null || context === undefined ) context = {};
        pe._previous = null;
        pe._context = Object.assign({},context);
        pe._definitions = Object.assign({},vars);
        pe._values = {};
        pe._provided = Object.assign({},vars);
        pe._injected = {};
        pe._notEvaluated = {};

        if ( vars ) {

            let order = Object.keys( vars );
            for ( let name of order ) {
                if ( ! vars[name].canEvaluate( vars, context ) ) {
                    pe._notEvaluated[name] = vars[name];
                    delete vars[name];
                }
            }
    
            pe._eval_order = evaluationOrder( vars, context );
            for ( let v of pe._eval_order ) {
                let currentContext = Object.assign( {}, context, pe._values );
                pe._values[v.name] = v.evaluate( currentContext );
            }

        }

        return pe;
    }

    /**
     * factory method: ProgressiveEvaluation.of( list_of_var_sets, context ) 
     * @param list - the list of variable sets to be evaluated, in order 
     * @param context - the initial context in which to evaluate them
     */
    static of( list: Array<SetOfVariables>, context: VariableValues ): Array<ProgressiveEvaluation> {
        if ( (!list) || list === undefined ) return [ ProgressiveEvaluation.from( null, context ) ]; 
        if ( list && list.length < 1 ) return [ ProgressiveEvaluation.from( null, context ) ];

        let results: Array<ProgressiveEvaluation> = [];

        // set up the first item
        let pe = ProgressiveEvaluation.from( list[0], context );
        results.push( pe );
        for ( let i = 1 ; i < list.length ; i++ ) {
            pe = pe.extend( list[i] );
            results.push( pe );
        }
        return results;
    }

    /**
     * Evaluate a new set of variables in the context of this evaluation
     * @param vars 
     */
    extend( vars: SetOfVariables ) : ProgressiveEvaluation {
        let name:        VariableName;
        let definitions: SetOfVariables = Object.assign( {}, this._definitions, vars );
        let values:      VariableValues = Object.assign( {}, this._values );
        
        let next = new ProgressiveEvaluation();
        next._previous     = this;
        next._context      = this._context;
        next._definitions  = definitions;
        next._values       = values;
        next._provided     = Object.assign( {}, vars );
        next._injected     = {};
        next._notEvaluated = {};

        // combine the context with the current values of all variables
        let currentContext = Object.assign( {}, next._context, values );
                
        function inject( name: VariableName ) {
            // ASSUMPTIONS: (for speed - avoid redundant checks)
            // * name has all its dependencies met in definitions
            // * name is NOT defined in vars 
            if ( ! vars.hasOwnProperty( name ) && definitions.hasOwnProperty( name ) ) {
                vars[name] = definitions[name];
                next._injected[name] = definitions[name]; 
                addDependenciesIfNeeded( name );
            }
        }

        function addDependenciesIfNeeded( name: VariableName ) {
            // ASSUMPTIONS: (for speed)
            // * name has all its dependencies met in definitions
            // * name is defined in vars 
            var needed = false;  // flag to indicate if dependency should be injected
            for ( let dep in vars[name].dep ) {
                if ( ! vars.hasOwnProperty( dep ) ) {  
                    // assumes all dependencies are met in definitions, to avoid unnecessary work
                    needed = ! values.hasOwnProperty( dep );
                    if ( ! needed ) {
                        // if ANYTHING this dependency depends on is being changed 
                        // then it is necessary to re-calculate this dependency anyway
                        for ( let other in vars[name].recursiveDependencies( definitions ) ) {
                            if ( vars.hasOwnProperty( other ) ) {
                                needed = true;
                                break; // short-circuit - no need to test the other dependencies
                            }
                        }
                    }
                    if ( needed ) inject( dep );
                }
            }
        }

        // if there are no variables, we are done
        if ( ! vars ) return next;
        

        // bring in anything needed for what we are calculating
        // and ignore anything that can't be evaluated yet
        for ( name in vars ) {
            if ( vars[name].canEvaluate( definitions, currentContext ) ) {
                addDependenciesIfNeeded( name );
            } else {
                next._notEvaluated[name] = vars[name];
                delete vars[name];
            }
        }

        // inject anything that is ready to be calculated and hasn't been
        for ( name in definitions ) {
            if ( ! vars.hasOwnProperty( name ) &&
                 ! values.hasOwnProperty( name ) &&
                 definitions[name].canEvaluate( definitions, currentContext ) 
            ) {
                inject( name );
            }
        }

        // evaluate the variables
        next._eval_order = evaluationOrder( vars, currentContext );
        for ( let v of next._eval_order ) {
            currentContext = Object.assign( {}, next._context, values );
            values[v.name] = v.evaluate( currentContext );
        }
                
        return next;
    }

}

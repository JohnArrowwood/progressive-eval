import { Variable, SetOfVariables, VariableValues, VariableName, ObjectAsSet } from './index';
import { Literal } from './ast/literal';

/**
 * Calculate the evalutation order for a set of variables
 * @param vars - the variables to be evaluated
 */

/**
 * NOTE: cyclic dependencies are not explicitly supported because there is 
 * no way to resolve them without resorting to iterative evaluation, which 
 * we are not doing.  However, if we can BREAK the cycle by injecting the 
 * value from the context, we will do that.  Otherwise, if you have a 
 * cyclic dependency, you get what you get
 */

export function evaluationOrder( vars: SetOfVariables, context: VariableValues, ignoreSelfRef: boolean = false, preSort: Function = null ): Array<Variable> {

    let order: Array<Variable> = [];
    let added_vars: Set<VariableName> = new Set<VariableName>();     
    let added_context: Set<VariableName> = new Set<VariableName>();;
    let numAdded = 0;
    
    function addIfReady( v: Variable, seq: Set<VariableName> ): boolean {
        
        // skip if it has already been added
        if ( added_vars.has( v.name ) ) return true;
        
        // reject if it is in an error state
        if ( v.error ) return false;
        
        let next = new Set<VariableName>(seq).add(v.name);
        for ( let dep in v.dep ) {
            if ( ignoreSelfRef && dep === v.name ) continue;
            if ( seq.has(dep) ) { // cycle detected
                if ( context.hasOwnProperty( dep ) ) {
                    if ( ! added_context.has( dep ) ) { 
                        order.push( new Variable(dep).value(context[dep]) );
                        added_context.add(dep);
                        numAdded++;
                    }
                    continue;
                }
                // if we got here, this dependency can't be evaluated
                // so neither can this variable
                return false;
            } else {
                if ( vars.hasOwnProperty(dep) ) {
                    if ( ! addIfReady( vars[dep], next ) ) return false; 
                } else {
                    if ( ! context.hasOwnProperty(dep) ) return false;
                }
            }
        }
        // if we got here, all of the dependencies have already been added
        // so we MAY be able to add this variable
        order.push( v );
        added_vars.add( v.name );
        numAdded++;
    }

    let names: Array<VariableName> = Object.keys(vars);
    if ( preSort ) {
        let preOrder = [];
        for ( let name of names ) {
            preOrder.push( vars[name] );
        }
        preSort( preOrder );
        names = preOrder.map( v => v.name );
    }
    do {
      numAdded = 0;
      for ( let name of names ) {
        addIfReady( vars[name], new Set<VariableName>() )
      }
      names = Object.keys( vars ).filter( (n) => ! added_vars.has( n ) );
    } while ( numAdded > 0 && names.length > 0 );

    // anything not in order is not calculable
    return order;

}
        

  
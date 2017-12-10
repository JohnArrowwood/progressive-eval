import { Variable, SetOfVariables, VariableValues, VariableName, ObjectAsSet } from './index';
import { Literal } from './ast/literal';

/**
 * Calculate the evalutation order for a set of variables
 * @param vars - the variables to be evaluated
 */

/**
 * NOTE: cyclic dependencies are not explicitly supported because there is no 
 * way to resolve them without resorting to iterative evaluation, which we are
 * not doing.  However, if we can BREAK the cycle by injecting the value from
 * the context, we will do that.  Otherwise, if you have a cyclic dependency,
 * you get what you get
 */
export function evaluationOrder( vars: SetOfVariables, context: VariableValues ): Array<Variable> {

    let order: Array<Variable> = [];
    let added_vars: Set<VariableName> = new Set<VariableName>();     
    let added_context: Set<VariableName> = new Set<VariableName>();;
    let numAdded = 0;
    
    let requires = {};
    for ( var name in vars ) {
      for ( var dep in vars[name].dep ) {
        if ( ! requires.hasOwnProperty(dep) ) requires[dep] = {};
        requires[dep][name] = undefined;
      }
    }

    function addIfReady( v: Variable, seq: Set<VariableName> ): boolean {
        
        // skip if it has already been added
        if ( added_vars.has( v.name ) ) return true;
        
        // reject if it is in an error state
        if ( v.error ) return false;
        
        let next = new Set<VariableName>(seq).add(v.name);
        for ( let dep in v.dep ) {
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
    do {
      numAdded = 0;
      for ( let name of names ) {
        addIfReady( vars[name], new Set<VariableName>() )
      }
      names = Object.keys( vars ).filter( (n) => ! added_vars.has( n ) );
    } while ( numAdded > 0 && names.length > 0 );

    // anything not in order is not calculable
    return order;

    /*
    let name: VariableName;
    let v: Variable;
    let list = [];
    let prefix = [];
    for ( name in vars ) {
      list.push( vars[name] );      
      if ( vars[name].recursiveDependencies(vars).hasOwnProperty(name) ) {
        if ( context.hasOwnProperty( name ) ) {
          prefix.push( new Variable( name ).value( context[name] ) );
        }
      }
    }
    list.sort( (a,b) => {
      var a_requires_b = a.dep.hasOwnProperty(b.name);
      var b_requires_a = b.dep.hasOwnProperty(a.name);
      return ( a_requires_b === b_requires_a ? 0 : a_requires_b ? 1 : -1 ); 
    });
    return prefix.concat(list);
    */
}
  
  
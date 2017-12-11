import * as expr from 'expression-eval';

import {
    VariableName,
    Expression,
    AST,
    ParseError,
    Dependencies,
    parse,
    dependencies,
    SetOfVariables,
    VariableValues,
    ObjectAsSet
} from '.';
import { Literal } from './ast/literal';
import { Z_DEFAULT_STRATEGY } from 'zlib';

const IDENTIFIER = /^[_a-zA-Z][_a-zA-Z0-9]*$/;

export class Variable {
    private _name:    VariableName = '';
    private _name_ok: boolean      = false;
    private _expr:    Expression   = '';
    private _ast:     AST          = new Literal('');
    private _dep:     Dependencies = {};
    private _error:   boolean      = false;
    private _message: string       = '';

    constructor(
        name: VariableName = '',
        expr: Expression = ''
    ) {
        if ( name !== '' ) this.name = name;
        if ( expr !== '' ) this.expr = expr;
    }

    static create( name: VariableName, expr: Expression ) {
        return new Variable(name,expr);
    }

    // the name of the variable
    get name() { return this._name }
    set name( name: VariableName ) {
        this._name = name;
        this._name_ok = IDENTIFIER.test( name );
    }

    // whether or not the name is a valid identifier
    get nameOK(): boolean { return this._name_ok; }

    // the expression that defines its value
    get expr() { return this._expr }
    set expr( expr: Expression ) {
        this._expr = expr;
        if ( ! expr ) expr = "''";
        try {
            this._ast     = parse(expr);
            this._dep     = dependencies( this.ast );
            this._error   = false;
            this._message = '';
        }
        catch (e) {
            this._ast     = new ParseError();
            this._dep     = {};
            this._error   = true;
            this._message = e.message;
        }        
    }

    // the parsed expression Abstract Syntax Tree - read-only
    get ast() { return this._ast }

    // the set of identifiers that this expression depends on
    get dep() { return this._dep }
    
    // flag indicating if there is a problem with this variable
    // used in place of throwing errors so the data structure can be used interactively
    get error()   { return this._error  }
    get message() { return this._message }

    // the set of all dependencies, above and beyond those listed in `.dep`
    recursiveDependencies( given: SetOfVariables ): Dependencies {
        let all: Dependencies = {};
        function get( name: string ): void {
            if ( given.hasOwnProperty( name ) ) {
                for ( var dep in given[name].dep ) {
                    if ( ! all.hasOwnProperty(dep) ) {
                        all[dep] = undefined;
                        get( dep );
                    }
                }
            }
        }
        get( this.name );
        return all;
    }

    // returns true if everything needed to calculate this variable exists
    canEvaluate( definitions: SetOfVariables, values: VariableValues ) {

        function check( name: VariableName, seen: Set<VariableName> ) {
            if ( values.hasOwnProperty(name) ) return true;
            if ( ! definitions.hasOwnProperty(name) ) return false;
            if ( definitions[name].error ) return false;
            let next = new Set<VariableName>(seen).add(name);
            for ( var dep in definitions[name].dep ) {
                if ( seen.has(dep) ) return false;
                if ( ! check( dep, next ) ) return false;
            }
            return true;
        }
        return check( this.name, new Set<VariableName>() );
    }

    /**
     * Evaluates the expression associated with this variable, in the provided context
     * 
     * @param {VariableValues} context 
     * @returns {*} 
     * @memberof Variable
     */
    evaluate( context: VariableValues ): any {
        if ( this.error ) return null;
        return expr.eval( this.ast, context );
    }

    /**
     * Give this variable a special definition that lets it hold anything 
     * 
     * @param {*} value 
     * @memberof Variable
     */
    value( value: any ): Variable {
        this._expr = JSON.stringify( value );
        this._ast = new Literal( value );
        this._dep = {};
        this._error = false;
        this._message = "";
        return this;
    }

    toString() {
        return JSON.stringify( { [this.name]: this.expr } );
    }

    /**
     * Convert a plain object with the necessary fields into a real `Variable`
     * 
     * @param serialized - object with fields but no methods
     */
    static deserialize( serialized: Variable ): Variable {
        return Object.assign( new Variable(), serialized );
    }


}

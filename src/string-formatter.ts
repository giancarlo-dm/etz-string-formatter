import { StringFormatterOptions } from "./string-formatter-options.type";
import { Token } from "./token.type";

/**
 * Mask based string formatter and validator.
 *
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 16/08/2017
 */
export class StringFormatter {

    //#region Private Attributes
    /**
     * Map with formatting tokens.
     */
    private readonly tokens: { [prop: string]: Token } = {
        "0": {pattern: /\d/, defaultValue: "0"},
        "9": {pattern: /\d/, optional: true},
        "#": {pattern: /\d/, optional: true, recursive: true},
        "A": {pattern: /[a-zA-Z0-9]/},
        "S": {pattern: /[a-zA-Z]/},
        "U": {pattern: /[a-zA-Z]/, transform: (char: string) => char.toLocaleUpperCase()},
        "L": {pattern: /[a-zA-Z]/, transform: (char: string) => char.toLocaleLowerCase()},
        "$": {escape: true}
    };
    /**
     * The pattern this formatter formats.
     */
    private readonly pattern: string;
    /**
     * Configuration of this formatter.
     */
    private readonly options: StringFormatterOptions;
    //#endregion

    //#region Constructor
    constructor(pattern: string, options?: StringFormatterOptions) {

        this.options = options || {};
        this.options = {
            reverse: this.options.reverse || false,
            useDefaults: this.options.useDefaults || this.options.reverse
        };

        this.pattern = pattern;
    }
    //#endregion

    //#region Public Methods
    /**
     * Returns an object {result: string, valid: boolean}.
     * @param value
     */
    public process(value: string): { result: string, valid: boolean } {

        if (!Boolean(value)) {
            return {result: "", valid: false};
        }

        const recursive: any[] = [];
        let pattern2: string = this.pattern;
        let valid: boolean = true;
        let formatted: string = "";
        let valuePos: number = this.options.reverse ? value.length - 1 : 0;
        let patternPos: number = 0;
        let optionalNumbersToUse: number = this.calcOptionalNumbersToUse(pattern2, value);
        let escapeNext: boolean = false;
        let inRecursiveMode: boolean = false;

        const steps = {
            start: this.options.reverse ? pattern2.length - 1 : 0,
            end: this.options.reverse ? -1 : pattern2.length,
            inc: this.options.reverse ? -1 : 1
        };

        const continueCondition = (options: StringFormatterOptions) => {

            if (!inRecursiveMode && !recursive.length && this.hasMoreTokens(pattern2, patternPos, steps.inc)) {
                // continue in the normal iteration
                return true;
            }
            else if (!inRecursiveMode && recursive.length &&
                this.hasMoreRecursiveTokens(pattern2, patternPos, steps.inc)) {
                // continue looking for the recursive tokens
                // Note: all chars in the patterns after the recursive portion will be handled as static string
                return true;
            }
            else if (!inRecursiveMode) {
                // start to handle the recursive portion of the pattern
                inRecursiveMode = recursive.length > 0;
            }

            if (inRecursiveMode) {
                const pc = recursive.shift();
                recursive.push(pc);
                if (options.reverse && valuePos >= 0) {
                    patternPos++;
                    pattern2 = this.insertChar(pattern2, pc, patternPos);
                    return true;
                }
                else if (!options.reverse && valuePos < value.length) {
                    pattern2 = this.insertChar(pattern2, pc, patternPos);
                    return true;
                }
            }
            return patternPos < pattern2.length && patternPos >= 0;
        };

        /**
         * Iterate over the pattern's chars parsing/matching the input value chars
         * until the end of the pattern. If the pattern ends with recursive chars
         * the iteration will continue until the end of the input value.
         *
         * Note: The iteration must stop if an invalid char is found.
         */
        for (patternPos = steps.start; continueCondition(this.options); patternPos = patternPos + steps.inc) {
            // Value char
            const vc = value.charAt(valuePos);
            // Pattern char to match with the value char
            const pc = pattern2.charAt(patternPos);

            let token = this.tokens[pc];
            if (recursive.length && token && !token.recursive) {
                // In the recursive portion of the pattern: tokens not recursive must be seen as static chars
                token = null;
            }

            // 1. Handle escape tokens in pattern
            // go to next iteration: if the pattern char is a escape char or was escaped
            if (!inRecursiveMode || vc) {
                if (this.options.reverse && this.isEscaped(pattern2, patternPos)) {
                    // pattern char is escaped, just add it and move on
                    formatted = this.concatChar(formatted, pc, this.options, token);
                    // skip escape token
                    patternPos = patternPos + steps.inc;
                    continue;
                }
                else if (!this.options.reverse && escapeNext) {
                    // pattern char is escaped, just add it and move on
                    formatted = this.concatChar(formatted, pc, this.options, token);
                    escapeNext = false;
                    continue;
                }
                else if (!this.options.reverse && token && token.escape) {
                    // mark to escape the next pattern char
                    escapeNext = true;
                    continue;
                }
            }

            // 2. Handle recursive tokens in pattern
            // go to next iteration: if the value str is finished or
            //                       if there is a normal token in the recursive portion of the pattern
            if (!inRecursiveMode && token && token.recursive) {
                // save it to repeat in the end of the pattern and handle the value char now
                recursive.push(pc);
            }
            else if (inRecursiveMode && !vc) {
                // in recursive mode but value is finished. Add the pattern char if it is not a recursive token
                formatted = this.concatChar(formatted, pc, this.options, token);
                continue;
            }
            else if (!inRecursiveMode && recursive.length > 0 && !vc) {
                // recursiveMode not started but already in the recursive portion of the pattern
                continue;
            }

            // 3. Handle the value
            // break iterations: if value is invalid for the given pattern
            if (!token) {
                // add char of the pattern
                formatted = this.concatChar(formatted, pc, this.options, token);
                if (!inRecursiveMode && recursive.length) {
                    // save it to repeat in the end of the pattern
                    recursive.push(pc);
                }
            }
            else if (token.optional) {
                // if token is optional, only add the value char if it matchs the token pattern
                //                       if not, move on to the next pattern char
                if (token.pattern.test(vc) && optionalNumbersToUse) {
                    formatted = this.concatChar(formatted, vc, this.options, token);
                    valuePos = valuePos + steps.inc;
                    optionalNumbersToUse--;
                }
                else if (recursive.length > 0 && vc) {
                    valid = false;
                    break;
                }
            }
            else if (token.pattern.test(vc)) {
                // if token isn't optional the value char must match the token pattern
                formatted = this.concatChar(formatted, vc, this.options, token);
                valuePos = valuePos + steps.inc;
            }
            else if (!vc && token.defaultValue && this.options.useDefaults) {
                // if the token isn't optional and has a default value, use it if the value is finished
                formatted = this.concatChar(formatted, token.defaultValue, this.options, token);
            }
            else {
                // the string value don't match the given pattern
                valid = false;
                break;
            }
        }

        return {result: formatted, valid: valid};
    }

    /**
     * Will return the a masked string value.
     * @param value
     */
    public apply(value: string): string {
        return this.process(value).result;
    }

    /**
     * Will return ``true`` if the string matches the mask.
     * @param value
     */
    public validate(value: any): boolean {
        return this.process(value).valid;
    }
    //#endregion

    //#region Private Methods
    /**
     *
     * @param pattern
     * @param pos
     */
    private isEscaped(pattern: string, pos: number): boolean {

        let count: number = 0;
        let i: number = pos - 1;
        let token: Token = {escape: true};

        while (i >= 0 && token && token.escape) {
            token = this.tokens[pattern.charAt(i)];
            count += token && token.escape ? 1 : 0;
            i--;
        }

        return count > 0 && count % 2 === 1;
    }

    /**
     *
     * @param pattern
     * @param value
     */
    private calcOptionalNumbersToUse(pattern: string, value: string): number {

        const numbersInP: number = pattern.replace(/[^0]/g, "").length;
        const numbersInV: number = value.replace(/[^\d]/g, "").length;

        return numbersInV - numbersInP;
    }

    /**
     *
     * @param text
     * @param character
     * @param options
     * @param token
     */
    private concatChar(text: string, character: string, options?: any, token?: Token): string {

        if (token != null && token.transform != null) {
            character = token.transform(character);
        }

        if (options != null && options.reverse) {
            return character + text;
        }

        return text + character;
    }

    /**
     *
     * @param pattern
     * @param pos
     * @param inc
     */
    private hasMoreTokens(pattern: string, pos: number, inc: number): boolean {

        const pc: string = pattern.charAt(pos);
        if (pc === "") {
            return false;
        }

        const token: Token = this.tokens[pc];
        return token && !token.escape ? true : this.hasMoreTokens(pattern, pos + inc, inc);
    }

    /**
     *
     * @param pattern
     * @param pos
     * @param inc
     */
    private hasMoreRecursiveTokens(pattern: string, pos: number, inc: number): boolean {

        const pc: string = pattern.charAt(pos);
        if (pc === "") {
            return false;
        }

        const token: Token = this.tokens[pc];
        return token && token.recursive ? true : this.hasMoreRecursiveTokens(pattern, pos + inc, inc);
    }

    /**
     *
     * @param text
     * @param char
     * @param position
     */
    private insertChar(text: string, char: string, position: number) {

        const t: string[] = text.split("");
        t.splice(position, 0, char);
        return t.join("");
    }
    //#endregion
}

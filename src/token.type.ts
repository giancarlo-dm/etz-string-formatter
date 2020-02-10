/**
 * @version 1.0.0
 * @author Giancarlo Dalle Mole
 * @since 10/02/2020
 */
export type Token = {

    pattern?: RegExp;
    defaultValue?: string;
    optional?: boolean;
    recursive?: boolean;
    transform?: (char: string) => string;
    escape?: boolean;
}

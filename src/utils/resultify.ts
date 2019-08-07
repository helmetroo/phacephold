import { html, css, CSSResult, TemplateResult } from 'lit-element';

type TemplateArgs<T> = {
    [key: string]: T
};

type ArrayType<T> = T extends (infer U)[] ? U : never;
type ArgsTypes<F extends Function> =
    F extends (arr: TemplateStringsArray, ...args: infer A) => any ? ArrayType<A> : never;

type HTMLResultFunc = typeof html;
type CSSResultFunc = typeof css;
type ResultFunc = HTMLResultFunc | CSSResultFunc;

type HTMLArgs = ArgsTypes<HTMLResultFunc>;
type CSSArgs = ArgsTypes<CSSResultFunc>;
type AnyArgs = HTMLArgs | CSSArgs;

type HTMLTemplateArgs = TemplateArgs<HTMLArgs>;
type CSSTemplateArgs = TemplateArgs<CSSArgs>;

type TemplateStringsAndArgs<T> = {
    strings: TemplateStringsArray,
    evaluatedArgs: T[]
};

const arrayifyStringsAndArgs =
    <T>(template: string, templateArgs?: TemplateArgs<T>) => {
        const strings: string[] = [];
        const evaluatedArgs: T[] = [];
        const TEMPLATE_REGEX = /\${(.*?)}/g;

        let start = 0;
        let end = 0;
        let match: RegExpExecArray | null;

        while(match = TEMPLATE_REGEX.exec(template)) {
            const [
                wrappedVarName,
                varName
            ] = match;

            end = match.index;
            const str = template.substring(start, end);
            start = match.index + wrappedVarName.length;

            strings.push(str);

            if(templateArgs) {
                const result = templateArgs[varName];
                evaluatedArgs.push(result);
            }
        }

        const lastStr = template.substring(start, template.length);
        strings.push(lastStr);

        const stringsAsTSA: TemplateStringsArray =
            Object.assign(strings, {
                raw: strings
            });

        const results: TemplateStringsAndArgs<T> = {
            strings: stringsAsTSA,
            evaluatedArgs
        };

        return results;
    };

export const htmlify =
    (template: string, templateArgs?: HTMLTemplateArgs) => {
        const stringsAndArgs =
            arrayifyStringsAndArgs<HTMLArgs>(template, templateArgs);

        return html(stringsAndArgs.strings, ...stringsAndArgs.evaluatedArgs);
    }

export const cssify =
    (template: string, templateArgs?: CSSTemplateArgs) => {
        const stringsAndArgs =
            arrayifyStringsAndArgs<CSSArgs>(template, templateArgs);

        return css(stringsAndArgs.strings, ...stringsAndArgs.evaluatedArgs);
    }

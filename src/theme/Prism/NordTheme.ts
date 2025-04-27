import { PrismTheme } from 'prism-react-renderer';

export const nordTheme: PrismTheme = {
    plain: {
        backgroundColor: '#2E3440', // Nord polar night (darkest)
        color: '#D8DEE9', // Nord snow storm (light text)
    },
    styles: [
        {
            types: ['comment', 'prolog', 'doctype', 'cdata'],
            style: {
                color: '#4C566A', // Nord subtle gray for comments
                fontStyle: 'italic',
            },
        },
        {
            types: ['namespace'],
            style: {
                opacity: 0.7,
            },
        },
        {
            types: ['tag', 'operator', 'number'],
            style: {
                color: '#81A1C1', // Nord frost blue
            },
        },
        {
            types: ['function'],
            style: {
                color: '#88C0D0', // Nord frost lighter blue - function name
            },
        },
        {
            types: ['class-name', 'maybe-class-name', 'builtin'],
            style: {
                color: '#8FBCBB', // Nord frost teal - classname and type annotations
            },
        },
        {
            types: ['attr-name'],
            style: {
                color: '#5E81AC', // Nord frost darker blue
            },
        },
        {
            types: ['keyword', 'class', 'def', 'boolean'],
            style: {
                color: '#81A1C1', // Nord frost blue - class, def keywords
            },
        },

        {
            types: ['entity', 'url', 'statement', 'regex', 'at-rule', 'control', 'directive', 'unit'],
            style: {
                color: '#B48EAD', // Nord aurora purple
            },
        },
        {
            types: ['punctuation'],
            style: {
                color: '#8FBCBB', // Nord frost teal for brackets and parentheses
            },
        },

        {
            types: ['delimiter'],
            style: {
                color: '#88C0D0', // Nord frost teal for brackets and parentheses
            },
        },
        {
            types: ['placeholder', 'constant'],
            style: {
                color: '#D08770', // Nord aurora orange
            },
        },
        {
            types: ['imports'],
            style: {
                color: '#8FBCBB', // Nord frost teal - pascal case imports
            },
        },
        {
            types: ['string', 'char', 'attr-value', 'inserted'],
            style: {
                color: '#A3BE8C', // Nord aurora green
            },
        },
        {
            types: ['deleted', 'symbol'],
            style: {
                color: '#BF616A', // Nord aurora red
            },
        },
        {
            types: ['exports'],
            style: {
                color: '#EBCB8B', // Nord aurora yellow
            },
        },
        {
            types: ['variable', 'parameter'],
            style: {
                color: '#D8DEE9', // Nord snow storm (light) - variable names
            },
        },
        {
            // Give important code elements a subtle highlight effect
            types: ['important', 'bold'],
            style: {
                fontWeight: 'bold',
            },
        },
        {
            types: ['italic'],
            style: {
                fontStyle: 'italic',
            },
        },
    ],
};
/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('tailwindcss/colors');

// Color generation tool: https://tailwind.simeongriggs.dev/

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    'src/**/*.{js,ts,jsx,tsx}',
    'modules/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '576px',
      'md': '960px',
      'lg': '1280px'
    },
    zIndex: {
      'modal': 50,
      'overlay': 40,
      'sidebar': 30,
      'toolbar': 20,
      '10': 10
    },
    colors: {
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      yellow: colors.yellow,
      orange: colors.orange,
      red: colors.red,
      blue: {
        '50': '#F1F4FE',
        '100': '#E3E9FC',
        '200': '#C8D2F9',
        '300': '#A3B5F5',
        '400': '#7590F0',
        '500': '#2953E8',
        '600': '#1945E6',
        '700': '#153AC1',
        '800': '#1232A6',
        '900': '#0B1E65'
      },
      'light-blue': {
        '50': '#FAFBFF',
        '100': '#FAFBFF',
        '200': '#FAFBFF',
        '300': '#F5F7FF',
        '400': '#F0F3FF',
        '500': '#EEF2FF',
        '600': '#D1DCFF',
        '700': '#ADC0FF',
        '800': '#809DFF',
        '900': '#3867FF'
      },
      gray: {
        '50': '#F7F7F7',
        '98': '#FAFAFA',
        '100': '#EDEDED',
        '200': '#D9D9D9',
        '300': '#C4C4C4',
        '400': '#ABABAB',
        '500': '#8A8A8A',
        '600': '#787878',
        '700': '#666666',
        '800': '#4A4A4A',
        '900': '#1A1A1A'
      },
      green: {
        '50': '#EFFBEF',
        '100': '#E3F7E3',
        '200': '#C7F0C7',
        '300': '#A4E6A3',
        '400': '#74D973',
        '500': '#42CB3F',
        '600': '#34B932',
        '700': '#2FA52D',
        '800': '#278825',
        '900': '#1B601A'
      },
      'dark-green': {
        '50': '#EDF8F6',
        '100': '#DBF0EE',
        '200': '#ACDDD7',
        '300': '#7CCAC1',
        '400': '#45AA9F',
        '500': '#327B73',
        '600': '#2E7069',
        '700': '#28625B',
        '800': '#1F4C47',
        '900': '#163633'
      }
    },
    extend: {
      minWidth: theme => ({
        ...theme('spacing')
      }),
      maxWidth: theme => ({
        ...theme('spacing')
      }),
      minHeight: theme => ({
        ...theme('spacing')
      }),
      maxHeight: theme => ({
        ...theme('spacing')
      })
    }
  },
  plugins: []
};
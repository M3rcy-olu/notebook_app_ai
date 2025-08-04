/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary color palette
        // (#F5F5F5, F2EAD3, DFD7BF, 3F2305 )
        //Pale White
        primary_pale: {
          50: "rgb(245, 245, 245)",
          100:"rgb(223, 218, 218)",
          200:"rgb(197, 192, 192)",
          300:"rgb(171, 166, 166)",
          400:"rgb(145, 140, 140)",
          500:"rgb(119, 114, 114)",
          600:"rgb(93, 88, 88)",
          700:"rgb(72, 71, 71)",
          800:"rgb(51, 46, 46)",
          900:"rgb(25, 20, 20)",
          950:"rgb(8, 6, 6)",
        },
        // Secondary color palette
        //Secondary Milk Color
        secondary_milk: {
          50: "rgb(242, 234, 211)",
          100: "rgb(208, 203, 189)",
          200: "rgb(184, 179, 167)",
          300: "rgb(160, 155, 143)",
          400: "rgb(136, 131, 119)",
          500: "rgb(112, 107, 95)",
          600: "rgb(88, 83, 71)",
          700: "rgb(64, 59, 47)",
          800: "rgb(40, 35, 23)",
          900: "rgb(16, 11, 0)",
          950: "rgb(8, 6, 6)",
        },
        // Accent color
        //tan
        tertiary_tan: {
          50: "rgb(223, 218, 218)",
          100: "rgb(208, 203, 189)",
          200: "rgb(184, 179, 167)",
          300: "rgb(160, 155, 143)",
          400: "rgb(136, 131, 119)",
          500: "rgb(112, 107, 95)",
          600: "rgb(93, 88, 88)",
          700: "rgb(72, 71, 71)",
          800: "rgb(51, 46, 46)",
          900: "rgb(25, 20, 20)",
          950: "rgb(8, 6, 6)",
        },
        //quaternary
        quaternary_brown: {
          50: "rgb(223, 218, 218)",
          100: "rgb(218, 203, 189)",
          200: "rgb(210, 187, 164)",
          300: "rgb(201, 166, 130)",
          400: "rgb(179, 142, 102)",
          500: "rgb(180, 130, 78)",
          600: "rgb(160, 108, 52)",
          700: "rgb(126, 80, 32)",
          800: "rgb(113, 68, 19)",
          900: "rgb(84, 47, 7)",
          950: "rgb(63, 35, 5)",
        },
        // Success, Warning, Error colors
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        // Custom color for the button component
        button: {
          primary: "rgb(245, 245, 245)",
          'primary-hover': "rgb(145, 140, 140)",
          secondary: "rgb(63, 35, 5)",
          'secondary-hover': "rgb(51, 46, 46)",
        },
      },
    },
  },
  plugins: [],
};

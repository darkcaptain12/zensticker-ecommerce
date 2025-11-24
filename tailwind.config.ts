import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#00e0ff",
          light: "#00b3cc",
          dark: "#008fb8",
          foreground: "#050810",
        },
        accent: {
          DEFAULT: "#ff007a",
          light: "#a020f0",
          dark: "#8b00cc",
          foreground: "#ffffff",
        },
        dark: {
          DEFAULT: "#050810",
          soft: "#0b1020",
          card: "#0f172a",
          border: "#1e293b",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 224, 255, 0.5), 0 0 40px rgba(0, 224, 255, 0.3)",
        "neon-sm": "0 0 10px rgba(0, 224, 255, 0.4)",
        "neon-lg": "0 0 30px rgba(0, 224, 255, 0.6), 0 0 60px rgba(0, 224, 255, 0.4)",
        "neon-pink": "0 0 20px rgba(255, 0, 122, 0.5), 0 0 40px rgba(255, 0, 122, 0.3)",
        "neon-purple": "0 0 20px rgba(160, 32, 240, 0.5), 0 0 40px rgba(160, 32, 240, 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "neon-pulse": {
          "0%, 100%": { 
            opacity: "1",
            boxShadow: "0 0 20px rgba(0, 224, 255, 0.5), 0 0 40px rgba(0, 224, 255, 0.3)",
          },
          "50%": { 
            opacity: "0.8",
            boxShadow: "0 0 30px rgba(0, 224, 255, 0.7), 0 0 60px rgba(0, 224, 255, 0.5)",
          },
        },
        "neon-glow": {
          "0%, 100%": { 
            textShadow: "0 0 10px rgba(0, 224, 255, 0.8), 0 0 20px rgba(0, 224, 255, 0.6), 0 0 30px rgba(0, 224, 255, 0.4)",
          },
          "50%": { 
            textShadow: "0 0 20px rgba(0, 224, 255, 1), 0 0 30px rgba(0, 224, 255, 0.8), 0 0 40px rgba(0, 224, 255, 0.6), 0 0 50px rgba(0, 224, 255, 0.4)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "neon-glow": "neon-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
} satisfies Config

export default config


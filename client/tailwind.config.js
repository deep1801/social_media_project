/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ⭐ IMPORTANT

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // 🔵 MAIN COLOR
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },

        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",

          // 🌙 DARK MODE SURFACES
          dark: "#0f172a", // bg
          darkSecondary: "#1e293b",
          darkCard: "#1f2937",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-hover":
          "0 6px 18px 0 rgb(0 0 0 / 0.12), 0 3px 6px -2px rgb(0 0 0 / 0.08)",
        nav: "0 1px 0 0 rgb(0 0 0 / 0.06)",
        dropdown: "0 8px 30px rgb(0 0 0 / 0.15)",
      },

      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },

      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-dot": "pulseDot 2s infinite",

        // 🔥 NEW (social feel)
        "like-pop": "likePop 0.3s ease",
        "scale-in": "scaleIn 0.2s ease-out",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },

        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },

        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },

        // ❤️ LIKE ANIMATION
        likePop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },

        // 🔥 smooth entry
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },

  plugins: [],
};

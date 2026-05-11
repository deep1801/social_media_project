/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

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
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },

        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
          dark: "#0f172a",
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
          "0 8px 24px 0 rgb(0 0 0 / 0.1), 0 3px 8px -2px rgb(0 0 0 / 0.08)",
        nav: "0 1px 0 0 rgb(0 0 0 / 0.06)",
        dropdown: "0 8px 30px rgb(0 0 0 / 0.15)",
        glow: "0 0 20px rgb(59 130 246 / 0.3)",
        "glow-violet": "0 0 20px rgb(139 92 246 / 0.3)",
        "glow-lg": "0 0 40px rgb(59 130 246 / 0.2)",
      },

      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },

      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        "slide-up": "slideUp 0.3s ease-out both",
        "slide-in-right": "slideInRight 0.35s ease-out both",
        "pulse-dot": "pulseDot 2s infinite",
        "like-pop": "likePop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 1.8s infinite linear",
        "bounce-in": "bounceIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "bell-ring": "bellRing 0.6s ease",
        float: "float 3s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },

        slideUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },

        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },

        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },

        likePop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.45)" },
          "70%": { transform: "scale(0.88)" },
          "100%": { transform: "scale(1)" },
        },

        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },

        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },

        bounceIn: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "80%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },

        bellRing: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "20%": { transform: "rotate(-14deg)" },
          "40%": { transform: "rotate(14deg)" },
          "60%": { transform: "rotate(-8deg)" },
          "80%": { transform: "rotate(8deg)" },
        },

        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },

  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10151A",
        pearl: "#F6F1EA",
        accent: "#2AAE8E",
        ember: "#E86A33",
        // Extended status colors for modern SaaS styling
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "system-ui", "sans-serif"],
        body: ["\"Inter\"", "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

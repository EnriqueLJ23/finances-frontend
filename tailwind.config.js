// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Angular paths
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1", // Indigo 500
          dark: "#4F46E5",    // Indigo 600
          light: "#A5B4FC",   // Indigo 300
        },
        secondary: {
          DEFAULT: "#F472B6", // Pink 400
          dark: "#EC4899",    // Pink 500
          light: "#FBCFE8",   // Pink 200
        },
        accent: {
          DEFAULT: "#10B981", // Emerald 500
          dark: "#059669",
          light: "#6EE7B7",
        },
        neutral: {
          light: "#F3F4F6",   // Gray 100
          DEFAULT: "#9CA3AF", // Gray 400
          dark: "#111827",    // Gray 900
        },
        background: {
          light: "#FFFFFF",
          dark: "#1F2937", // Gray 800
        },
      },
    },
  },
  plugins: [],
}

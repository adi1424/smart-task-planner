module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          500: "#3b82f6",
          400: "#60a5fa"
        },
        panel: "rgba(255,255,255,0.04)"
      },
      boxShadow: {
        'neon-lg': '0 8px 30px rgba(59,130,246,0.14)'
      },
    },
  },
  plugins: [],
}

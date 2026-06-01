/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:     "#070705",
        primary50:   "#7E7E7D",
        primary10:   "#DDDDDD",
        background:  "#FFFFFF",
        secondary:   "#7D695D",
        secondary50: "#BBAFA8",
      },
      fontSize: {
        "heading-lg": ["20px", { lineHeight: "28px", fontWeight: "700" }],
        "heading-md": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "body-md":    ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "body-sm":    ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "caption":    ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      fontFamily: {
        pretendard: ["Pretendard"],
      },
      borderRadius: {
        "chip": "16px",
      },
      height: {
        "chip": "32px",
      },
      gap: {
        "chip": "4px",
      },
    },
    
  },
  plugins: [],
};

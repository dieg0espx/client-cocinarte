import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
		fontFamily: {
			'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
			'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif'],
			'serif': ['var(--font-playfair)', 'Georgia', 'serif'],
			'lora': ['var(--font-lora)', 'Georgia', 'serif'],
			'cormorant': ['var(--font-cormorant)', 'Georgia', 'serif'],
			'libre-baskerville': ['var(--font-libre-baskerville)', 'Georgia', 'serif'],
			'poppins': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
			'questa': ['var(--font-playfair)', 'Georgia', 'serif'],
			'ivry': ['IvryOra Display', 'serif'],
			'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
			'coming-soon': ['Coming Soon']
		},
		colors: {
			// Custom color palette
			golden: {
				DEFAULT: '#FFD700', // Golden yellow - C: 0%, M: 26%, Y: 89%, K: 0%
				light: '#FFE44D',
				dark: '#FFB300'
			},
			amber: {
				DEFAULT: '#FF8C00', // Deep orange - C: 0%, M: 45%, Y: 100%, K: 0%
				light: '#FFA726',
				dark: '#E65100'
			},
			slate: {
				DEFAULT: '#000638', // Dark slate blue - C: 100%, M: 32%, Y: 20%, K: 58%
				medium: '#1a1f5c', // Medium slate blue - C: 100%, M: 32%, Y: 20%, K: 47%
				light: '#2a2f6c', // Light slate blue - C: 100%, M: 32%, Y: 20%, K: 37%
				lighter: '#3a3f7c', // Lighter slate blue
				lightest: '#4a4f8c' // Lightest slate blue
			},
			// Cocinarte Color Palette
			cocinarte: {
				orange: '#F48E77', // Light orange
				red: '#F0614F', // Red
				white: '#FEFEFE', // Pure white
				blue: '#CDECF9', // Light blue
				yellow: '#FCB414', // Yellow
				navy: '#00ADEE', // Navy blue
				black: '#000000' // Black
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in-up': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-down': {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
  			'slide-down': 'slide-down 0.3s ease-out forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

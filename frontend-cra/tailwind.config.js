/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                display: ['Fredoka', 'Nunito', 'sans-serif'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'var(--radius-lg)',
                '2xl': 'var(--radius-xl)',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                    elevated: 'hsl(var(--card-elevated))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    glow: 'hsl(var(--primary-glow))',
                    muted: 'hsl(var(--primary-muted))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                    muted: 'hsl(var(--secondary-muted))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                    muted: 'hsl(var(--accent-muted))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                // Subject colors
                science: 'hsl(var(--science))',
                history: 'hsl(var(--history))',
                math: 'hsl(var(--math))',
                // Hotspot
                hotspot: {
                    DEFAULT: 'hsl(var(--hotspot))',
                    glow: 'hsl(var(--hotspot-glow))',
                    pulse: 'hsl(var(--hotspot-pulse))',
                },
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
            },
            boxShadow: {
                'soft': 'var(--shadow-soft)',
                'medium': 'var(--shadow-medium)',
                'elevated': 'var(--shadow-elevated)',
                'glow': 'var(--shadow-glow)',
                'hotspot': 'var(--shadow-hotspot)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'slide-in-right': {
                    from: { transform: 'translateX(100%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-in-left': {
                    from: { transform: 'translateX(-100%)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-up': {
                    from: { transform: 'translateY(100%)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.4)' },
                    '50%': { boxShadow: '0 0 35px hsl(var(--primary) / 0.6)' },
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'slide-in-right': 'slide-in-right 0.4s ease-out',
                'slide-in-left': 'slide-in-left 0.4s ease-out',
                'slide-up': 'slide-up 0.4s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
            },
            spacing: {
                'safe-bottom': 'env(safe-area-inset-bottom, 20px)',
                'safe-top': 'env(safe-area-inset-top, 20px)',
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

import "./globals.css";

export const metadata = {
  title: "Interactive Ebook Studio",
  description: "Create illustrated interactive learning chapters",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

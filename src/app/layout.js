import "bootstrap/dist/css/bootstrap.min.css"; // Importing global Bootstrap styles

export default function Layout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}

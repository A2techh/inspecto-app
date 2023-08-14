from http.server import SimpleHTTPRequestHandler

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.endswith(".wasm"):
            self.send_header("Content-Type", "text/plain")
        else:
            super().end_headers()

if __name__ == "__main__":
    from http.server import HTTPServer
    server = HTTPServer(("192.168.88.78", 80), MyHTTPRequestHandler)
    server.serve_forever()


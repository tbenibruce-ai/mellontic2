                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "TRANSACTION_NOT_FOUND_OR_FORBIDDEN"}).encode())
                return
            self._set_headers(200)
            self.wfile.write(json.dumps({"message": "ENTRY_PURGED"}).encode())
            return
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "ENDPOINT_NOT_FOUND"}).encode())
# ==============================================================================
# ENTRYPOINT
# ==============================================================================
def run_server():
    init_db()
    server_address = (HOST, PORT)
    httpd = ThreadingHTTPServer(server_address, MellonticRequestHandler)
    print(f"===========================================================")
    print(f"  MELLONTIC_BUDGET // SECURE_LEDGER SERVER ONLINE")
    print(f"  Listening on: http://127.0.0.1:{PORT}")
    print(f"  Multi-Document Formats: Check, Credit Note, Debit Note,")
    print(f"                          Invoice, Receipt, Voucher, Wire")
    print(f"  Database Engine: SQLite (mellontic_ledger.db)")
    print(f"===========================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down Mellontic core server.")
        httpd.server_close()
        sys.exit(0)
if __name__ == "__main__":
    run_server()

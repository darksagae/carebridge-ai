from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json,os
from gateway import generate,GatewayError
ROOT=Path(__file__).resolve().parent
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def reply(self,status,data):
        self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(json.dumps(data).encode())
    def do_GET(self):
        if self.path=='/health':return self.reply(200,{'status':'ok'})
        if self.path not in ['/','/app.js','/styles.css']:return self.reply(404,{'error':'Not found'})
        name={'/':'index.html','/app.js':'app.js','/styles.css':'styles.css'}[self.path]
        self.send_response(200);self.send_header('Content-Type',{'/':'text/html','/app.js':'text/javascript','/styles.css':'text/css'}[self.path]);self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write((ROOT/name).read_bytes())
    def do_POST(self):
        if self.path!='/api/ai':return self.reply(404,{'error':'Not found'})
        origin=self.headers.get('Origin')
        if origin and urlparse(origin).netloc!=self.headers.get('Host'):return self.reply(403,{'error':'Cross-origin request rejected'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=12000:raise ValueError('Request too large or empty')
            body=json.loads(self.rfile.read(length))
            if not isinstance(body,dict) or body.get('ai_consent') is not True:raise ValueError('Consent to send this example to AI Gateway is required')
            return self.reply(200,generate('carebridge',body.get('text')))
        except GatewayError as error:return self.reply(error.status,{'error':str(error)})
        except (ValueError,TypeError) as error:return self.reply(400,{'error':str(error)})
if __name__=='__main__':ThreadingHTTPServer(('127.0.0.1',int(os.getenv('PORT','8000'))),Handler).serve_forever()

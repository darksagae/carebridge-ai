import io,json,os,unittest
from unittest.mock import patch
from gateway import generate,GatewayError
class GatewayTest(unittest.TestCase):
    def test_missing_configuration(self):
        with patch.dict(os.environ,{},clear=True):
            with self.assertRaises(GatewayError):generate('carebridge','Fictional appointment notes')
    def test_validated_output(self):
        draft={'summary':'Fictional follow-up visit','questions':['What should I ask at follow-up?'],'steps':['Write down your questions.']}
        response=io.BytesIO(json.dumps({'choices':[{'message':{'content':json.dumps(draft)}}],'model':'google/gemini-2.5-flash-lite'}).encode())
        with patch.dict(os.environ,{'AI_GATEWAY_API_KEY':'test-only','AI_GATEWAY_MODEL':'google/gemini-2.5-flash-lite'}),patch('urllib.request.urlopen',return_value=response) as call:
            out=generate('carebridge','Fictional appointment notes');self.assertEqual(out['summary'],draft['summary']);self.assertEqual(out['source'],'Vercel AI Gateway')
            self.assertEqual(call.call_args.args[0].full_url,'https://ai-gateway.vercel.sh/v1/chat/completions')
    def test_malformed_response(self):
        response=io.BytesIO(b'{"choices":[]}')
        with patch.dict(os.environ,{'AI_GATEWAY_API_KEY':'test-only','AI_GATEWAY_MODEL':'google/gemini-2.5-flash-lite'}),patch('urllib.request.urlopen',return_value=response):
            with self.assertRaises(GatewayError):generate('linda','Fictional safety concern')
if __name__=='__main__':unittest.main()

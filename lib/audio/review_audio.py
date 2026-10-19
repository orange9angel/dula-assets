"""Audio-only model observation. Adapted from the existing laundry review route.
This is supplementary evidence, never precise timing or audience approval.
"""
from pathlib import Path
import argparse,base64,json,os,urllib.request

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--audio',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--env-dir',type=Path,required=True)
    a=p.parse_args()
    for file in a.env_dir.glob('.env*'):
        if not file.is_file():continue
        for line in file.read_text(encoding='utf-8-sig',errors='ignore').splitlines():
            line=line.strip().removeprefix('export ')
            if not line or line.startswith('#') or '=' not in line:continue
            k,v=line.split('=',1)
            if k.strip()=='DASHSCOPE_API_KEY':os.environ.setdefault(k.strip(),v.strip().strip('\"\''))
    key=os.environ.get('DASHSCOPE_API_KEY')
    if not key:raise SystemExit('Audio reviewer credential unavailable')
    prompt='只根据实际音频评估这段中文动画：列出听清的台词；描述人声、环境、音乐和冲击音的相对听感；是否有人声被遮盖、明显断裂、异常杂音或重复爆点？不要按文件名猜测，不要给出精确时间，不要评分。无法确认的内容写无法确认。'
    payload={'model':'qwen3-omni-flash','modalities':['text'],'stream':True,'messages':[{'role':'user','content':[{'type':'input_audio','input_audio':{'data':'data:audio/mp3;base64,'+base64.b64encode(a.audio.read_bytes()).decode(),'format':'mp3'}},{'type':'text','text':prompt}]}]}
    req=urllib.request.Request('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',data=json.dumps(payload).encode(),headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'})
    answer=''
    with urllib.request.urlopen(req,timeout=160) as response:
        for line in response:
            if not line.startswith(b'data:'):continue
            data=line[5:].strip()
            if data==b'[DONE]':break
            for c in json.loads(data).get('choices',[]):answer+=c.get('delta',{}).get('content') or ''
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(answer,encoding='utf-8')
    print(answer)
if __name__=='__main__':main()
